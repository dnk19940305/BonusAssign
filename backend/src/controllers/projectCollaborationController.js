﻿/**
 * 项目协作控制器
 * 提供项目协作相关的业务逻辑
 */

const projectCollaborationService = require('../services/projectCollaborationService')
const { PermissionValidator } = require('../config/permissions')
const auditService = require('../services/auditService')
const notificationService = require('../services/notificationService')
const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')


class ProjectCollaborationController {
  /**
   * 发布项目协作（将已存在的项目发布为协作项目）
   */
  async publishCollaboration(req, res, next) {
    try {
      const user = req.user
      const { projectId } = req.params
      const publishData = req.body

      // 1. 检查项目是否存在
      const project = await databaseService.findOne('projects', { id: projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 2. 检查项目是否已经发布
      if (project.cooperation_status && project.cooperation_status !== 'draft') {
        return res.status(400).json({
          code: 400,
          message: `项目已经处于${project.cooperation_status}状态，无法重复发布`,
          data: null
        })
      }

      // 2.5. 验证项目必填字段（发布前检查）
      const missingFields = []
      
      // 注意：manager_id 可以为空（支持抢单模式）
      
      // 检查项目中的必填字段，如果没有则检查publishData中是否提供
      const startDate = project.start_date || publishData.startDate
      const endDate = project.end_date || publishData.endDate
      const budget = project.budget || publishData.budget
      
      if (!startDate) {
        missingFields.push('开始日期')
      }
      
      if (!endDate) {
        missingFields.push('结束日期')
      }
      
      if (!budget || budget <= 0) {
        missingFields.push('项目预算')
      }
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `项目缺少必要信息，无法发布：${missingFields.join('、')}`,
          data: {
            missingFields,
            hint: '请先在项目编辑页面完善这些信息后再发布，或在发布请求中提供这些字段'
          }
        })
      }

      // 3. 检查用户权限
      const userPermissions = user.Role?.permissions || user.permissions || []
      if (!PermissionValidator.hasPermission(userPermissions, 'project:publish')) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限发布项目',
          data: null
        })
      }

      // 4. 更新项目协作相关字段
      const updateData = {
        cooperation_status: 'published',
        published_by: user.id,
        published_at: new Date()
      }

      // 如果项目缺少必填字段，但publishData中提供了，则更新这些字段
      if (!project.start_date && publishData.startDate) {
        updateData.start_date = publishData.startDate
      }
      if (!project.end_date && publishData.endDate) {
        updateData.end_date = publishData.endDate
      }
      if ((!project.budget || project.budget <= 0) && publishData.budget) {
        updateData.budget = publishData.budget
      }
      if (publishData.profitTarget !== undefined) {
        updateData.profit_target = publishData.profitTarget
      }

      // 添加可选字段
      if (publishData.workContent) {
        updateData.work_content = publishData.workContent
      }
      if (publishData.bonusScale) {

      }
      if (publishData.skillRequirements && publishData.skillRequirements.length > 0) {
        updateData.skill_requirements = JSON.stringify(publishData.skillRequirements)
      }

      // 使用服务更新项目
      const updatedProject = await projectCollaborationService.publishProject(projectId, updateData)

      // 4.5. 如果项目有项目经理，自动将其添加为项目成员
      if (project.manager_id) {
        try {
          // 检查项目经理是否已经是项目成员
          const existingMember = await databaseService.findOne('projectMembers', {
            projectId: projectId,
            employeeId: project.manager_id
          })

          if (!existingMember) {
            // 获取项目经理角色ID
            let managerRoleId = null
            try {
              const managerRole = await databaseService.getProjectRoleByName('项目经理')
              managerRoleId = managerRole?.id || managerRole?._id || null
            } catch (e) {
              logger.warn('获取项目经理角色失败:', e.message)
            }

            // 生成唯一ID（使用crypto生成）
            const crypto = require('crypto')
            const memberId = crypto.randomBytes(8).toString('hex')

            // 添加项目经理为项目成员
            const memberData = {
              id: memberId,
              projectId: projectId,
              employeeId: project.manager_id,
              roleId: managerRoleId,
              status: 'active',
              joinDate: new Date(),
              contributionWeight: 1.0,
              participationRatio: 100, // 默认100%参与度
              applyReason: '项目经理自动加入（项目发布时）',
              approvedBy: user.id,
              approvedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }

            await databaseService.createProjectMember(memberData)
            logger.info(`✅ 项目经理已自动加入项目成员: projectId=${projectId}, managerId=${project.manager_id}`)
          } else {
            logger.info(`项目经理已存在于项目成员中: projectId=${projectId}, managerId=${project.manager_id}`)
          }
        } catch (memberError) {
          logger.error('添加项目经理为项目成员失败:', memberError)
          // 不中断发布流程，仅记录错误
        }
      }

      // 5. 创建项目需求记录
      if (publishData.requirements && publishData.requirements.length > 0) {
        await projectCollaborationService.createProjectRequirements(
          projectId,
          publishData.requirements
        )
      }

      // 6. 记录审计日志
      await auditService.logPermissionAction(
        user,
        'project:publish',
        'project',
        projectId,
        {
          action: 'publish_project',
          projectId: projectId,
          projectName: project.name,
          projectCode: project.code
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      // 7. 发送项目发布通知
      try {
        const notifyUserIds = []

        // 通知所有具有项目审批权限的管理层用户
        const usersResult = await databaseService.findAll('users')
        const users = Array.isArray(usersResult) ? usersResult : (usersResult.rows || [])
        const adminUsers = users.filter(u => {
          const permissions = u.permissions || []
          return permissions.includes('project:approve') ||
                 permissions.includes('project:*') ||
                 permissions.includes('*')
        })

        if (adminUsers && adminUsers.length > 0) {
          notifyUserIds.push(...adminUsers.map(u => u.id || u._id))
        }

        // 去重
        const uniqueUserIds = [...new Set(notifyUserIds)]

        if (uniqueUserIds.length > 0) {
          await notificationService.sendProjectNotification(
            projectId,
            'project_published',
            '项目发布通知',
            `项目"${project.name}"已发布，等待团队组建`,
            uniqueUserIds,
            {
              projectName: project.name,
              projectCode: project.code,
              workContent: publishData.workContent
            }
          )
        }
      } catch (notificationError) {
        logger.warn('发送项目发布通知失败:', notificationError)
        // 通知失败不影响项目发布流程
      }

      res.status(200).json({
        code: 200,
        message: '项目发布成功',
        data: updatedProject
      })

    } catch (error) {
      logger.error('Publish collaboration error:', error)
      next(error)
    }
  }

  /**
   * 创建并发布项目（一次性完成项目创建和发布）
   */
  async createAndPublishProject(req, res, next) {
    try {
      const user = req.user
      const {
        // 项目基本信息
        name,
        code,
        description,
        managerId,
        startDate,
        endDate,
        budget,
        profitTarget,
        priority,
        // 协作发布信息
        workContent,
        bonusScale,
        skillRequirements,
        requirements
      } = req.body

      // 1. 验证用户权限
      const userPermissions = user.Role?.permissions || user.permissions || []
      if (!PermissionValidator.hasPermission(userPermissions, 'project:publish')) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限发布项目',
          data: null
        })
      }

      // 2. 验证项目基本信息必填字段
      const missingFields = []
      
      if (!name || name.trim().length < 2) {
        missingFields.push('项目名称')
      }
      if (!code || code.trim().length < 2) {
        missingFields.push('项目代码')
      }
      if (!startDate) {
        missingFields.push('开始日期')
      }
      if (!endDate) {
        missingFields.push('结束日期')
      }
      if (!budget || budget <= 0) {
        missingFields.push('项目预算')
      }
      if (!workContent || workContent.trim().length < 10) {
        missingFields.push('工作内容（至少10个字符）')
      }
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `缺少必要信息：${missingFields.join('、')}`,
          data: {
            missingFields
          }
        })
      }

      // 3. 检查项目代码是否已存在
      const existingCode = await databaseService.findOne('projects', { code })
      if (existingCode) {
        return res.status(400).json({
          code: 400,
          message: '项目代码已存在',
          data: null
        })
      }

      // 4. 检查项目名称是否已存在
      const existingName = await databaseService.findOne('projects', { name })
      if (existingName) {
        return res.status(400).json({
          code: 400,
          message: '项目名称已存在',
          data: null
        })
      }

      // 5. 验证项目经理是否存在（如果指定了）
      if (managerId) {
        logger.info(`正在验证项目经理ID: ${managerId}`)
        let manager = await databaseService.getEmployeeById(managerId)

        if (!manager) {
          const allEmployees = await databaseService.getEmployees()
          manager = allEmployees.find(emp => emp._id === managerId)
        }

        if (!manager) {
          return res.status(400).json({
            code: 400,
            message: '指定项目经理不存在',
            data: null
          })
        }
      }

      // 6. 创建项目（带协作发布信息）
      const projectData = {
        name,
        code,
        description,
        manager_id: managerId,
        start_date: startDate,
        end_date: endDate,
        budget: budget || 0,
        profit_target: profitTarget || 0,
        priority: priority || 'medium',
        // 协作发布字段
        cooperation_status: 'published',
        published_by: user.id,
        published_at: new Date(),
        work_content: workContent,

        skill_requirements: skillRequirements && skillRequirements.length > 0 
          ? JSON.stringify(skillRequirements) 
          : null
      }

      const project = await databaseService.createProject(projectData)
      const projectId = project.id || project._id

      logger.info(`用户${user.username}创建并发布项目: ${name} (${code}), ID: ${projectId}`)

      // 6.5. 如果项目有项目经理，自动将其添加为项目成员
      if (managerId) {
        try {
          // 检查项目经理是否已经是项目成员
          const existingMember = await databaseService.findOne('projectMembers', {
            project_id: projectId,
            employee_id: managerId
          })

          if (!existingMember) {
            // 获取项目经理角色ID
            let managerRoleId = null
            try {
              const managerRole = await databaseService.getProjectRoleByName('项目经理')
              managerRoleId = managerRole?.id || managerRole?._id || null
            } catch (e) {
              logger.warn('获取项目经理角色失败:', e.message)
            }

            // 生成唯一ID（使用crypto生成）
            const crypto = require('crypto')
            const memberId = crypto.randomBytes(8).toString('hex')

            // 添加项目经理为项目成员
            const memberData = {
              id: memberId,
              project_id: projectId,
              employee_id: managerId,
              role_id: managerRoleId,
              status: 'active',
              join_date: new Date(),
              contribution_weight: 100,
              participation_ratio: 100, // 默认100%参与度（修改为百分比）
              apply_reason: '项目经理自动加入（项目创建并发布时）',
              approved_by: user.id,
              approved_at: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }

            await databaseService.createProjectMember(memberData)
            logger.info(`✅ 项目经理已自动加入项目成员: projectId=${projectId}, managerId=${managerId}`)
          } else {
            logger.info(`项目经理已存在于项目成员中: projectId=${projectId}, managerId=${managerId}`)
          }
        } catch (memberError) {
          logger.error('添加项目经理为项目成员失败:', memberError)
          // 不中断发布流程，仅记录错误
        }
      }

      // 7. 创建项目需求记录
      if (requirements && requirements.length > 0) {
        await projectCollaborationService.createProjectRequirements(
          projectId,
          requirements
        )
      }

      // 8. 记录审计日志
      await auditService.logPermissionAction(
        user,
        'project:publish',
        'project',
        projectId,
        {
          action: 'create_and_publish_project',
          projectId: projectId,
          projectName: name,
          projectCode: code
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      // 9. 发送项目发布通知
      try {
        const notifyUserIds = []

        const usersResult = await databaseService.findAll('users')
        const users = Array.isArray(usersResult) ? usersResult : (usersResult.rows || [])
        const adminUsers = users.filter(u => {
          const permissions = u.permissions || []
          return permissions.includes('project:approve') ||
                 permissions.includes('project:*') ||
                 permissions.includes('*')
        })

        if (adminUsers && adminUsers.length > 0) {
          notifyUserIds.push(...adminUsers.map(u => u.id || u._id))
        }

        const uniqueUserIds = [...new Set(notifyUserIds)]

        if (uniqueUserIds.length > 0) {
          await notificationService.sendProjectNotification(
            projectId,
            'project_published',
            '项目发布通知',
            `项目"${name}"已发布，等待团队组建`,
            uniqueUserIds,
            {
              projectName: name,
              projectCode: code,
              workContent: workContent
            }
          )
        }
      } catch (notificationError) {
        logger.warn('发送项目发布通知失败:', notificationError)
      }

      res.status(201).json({
        code: 201,
        message: '项目创建并发布成功',
        data: {
          ...project,
          id: projectId
        }
      })

    } catch (error) {
      logger.error('Create and publish project error:', error)
      next(error)
    }
  }

  /**
   * 申请加入项目团队（提交团队组建申请）
   */
  async applyForTeam(req, res, next) {
    try {
      const user = req.user
      const { projectId } = req.params
      const { teamName, teamDescription, applicationReason, estimatedCost, members } = req.body

      // 验证必要字段
      if (!teamName || !teamDescription || !applicationReason || !members || members.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要字段（teamName, teamDescription, applicationReason, members）',
          data: null
        })
      }

      // 验证成员数量
      if (members.length < 2) {
        return res.status(400).json({
          code: 400,
          message: '团队至少需要2名成员',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 权限验证：检查用户是否有权申请
      const userPermissions = user.Role?.permissions || user.permissions || []
      const isSuperAdmin = userPermissions.includes('*') || userPermissions.includes('admin')
      // 项目经理权限：检查实际存在的权限
      const hasProjectManagerPermission = userPermissions.includes('project:create') || 
                                          userPermissions.includes('collaboration:apply') ||
                                          userPermissions.includes('team:build')
      
      if (!isSuperAdmin && !hasProjectManagerPermission) {
        return res.status(403).json({
          code: 403,
          message: '您没有项目经理权限，无法申请组建团队',
          data: null
        })
      }

      // 如果项目已指定经理，只有该经理才能申请
      if (project.manager_id || project.managerId) {
        const managerId = project.manager_id || project.managerId
        const userEmployeeId = user.employeeId || user.id
        
        if (!isSuperAdmin && managerId !== userEmployeeId) {
          return res.status(403).json({
            code: 403,
            message: '该项目已指定经理，只有项目经理才能申请组建团队',
            data: null
          })
        }
      }
      // 否则：项目未指定经理，任何有 project_manager 权限的人都可申请（抢单模式）

      // 准备申请数据
      const applicationData = {
        projectId,
        applicantId: user.employeeId || user.id,
        teamName,
        teamDescription,
        applicationReason,
        estimatedCost: estimatedCost || 0
      }

      // 调用事务服务提交申请
      const result = await projectCollaborationService.submitTeamApplication(
        applicationData,
        members
      )

      // 获取刚创建的申请（用于返回和通知）
      const application = await databaseService.findOne('project_team_applications', {
        project_id: projectId,
        applicant_id: applicationData.applicantId
      })

      // 记录审计日志
      await auditService.logPermissionAction(
        user,
        'collaboration:apply',
        'project',
        projectId,
        {
          action: 'team_apply',
          applicationId: result.applicationId
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      // 发送团队申请通知
      try {
        const notifyUserIds = []

        // 通知项目负责人
        if (project.managerId) {
          notifyUserIds.push(project.managerId)
        }

        // 通知业务线负责人
        if (project.businessLineId) {
          const businessLine = await databaseService.findOne('businessLines', { _id: project.businessLineId })
          if (businessLine && businessLine.managerId) {
            notifyUserIds.push(businessLine.managerId)
          }
        }

        // 通知部门经理
        if (project.departmentId) {
          const department = await databaseService.findOne('departments', { _id: project.departmentId })
          if (department && department.managerId) {
            notifyUserIds.push(department.managerId)
          }
        }

        // 去重
        const uniqueUserIds = [...new Set(notifyUserIds)]

        if (uniqueUserIds.length > 0) {
          await notificationService.sendTeamApplicationNotification(
            result.applicationId,
            projectId,
            user.employeeId,
            'applied',
            uniqueUserIds
          )
        }
      } catch (notificationError) {
        logger.warn('发送团队申请通知失败:', notificationError)
        // 通知失败不影响申请流程
      }

      res.status(200).json({
        code: 200,
        message: '团队申请提交成功',
        data: {
          application: {
            id: result.applicationId,
            status: 'pending',
            ...application
          }
        }
      })

    } catch (error) {
      logger.error('Apply for team error:', error)
      next(error)
    }
  }

  /**
   * 审批团队申请
   */
  async approveTeamApplication(req, res, next) {
    try {
      const user = req.user
      const { applicationId } = req.params
      const { action, comments } = req.body  // action: 'approve', 'reject', 'modify'

      // 验证必要字段
      if (!action || !['approve', 'reject', 'modify'].includes(action)) {
        return res.status(400).json({
          code: 400,
          message: '缺少有效的审批动作（approve/reject/modify）',
          data: null
        })
      }

      // 获取申请信息（使用MySQL查询）
      const [applications] = await databaseService.manager.pool.execute(
        'SELECT * FROM project_team_applications WHERE id = ?',
        [applicationId]
      )
      
      if (!applications || applications.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '申请不存在',
          data: null
        })
      }
      
      const application = applications[0]

      // 检查项目是否存在（使用MySQL查询）
      const [projects] = await databaseService.manager.pool.execute(
        'SELECT * FROM projects WHERE id = ?',
        [application.project_id]
      )
      
      if (!projects || projects.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }
      
      const project = projects[0]

      // 检查用户是否有权限审批此申请
      const userPermissions = user.Role?.permissions || user.permissions || []
      if (!PermissionValidator.hasPermission(userPermissions, 'project:approve')) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限审批此申请',
          data: null
        })
      }

      // 审批申请
      const approved = action === 'approve'
      const result = await projectCollaborationService.approveTeamApplication(
        applicationId,
        user.id,
        approved,
        comments,
        action
      )

      // 记录审计日志
      await auditService.logPermissionAction(
        user,
        'project:approve',
        'project',
        application.project_id,
        {
          action: 'approve_team_application',
          applicationId,
          approvalAction: action,
          applicantId: application.applicant_id
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      // 发送审批结果通知
      try {
        let notificationType
        if (action === 'approve') notificationType = 'team_approved'
        else if (action === 'reject') notificationType = 'team_rejected'
        else notificationType = 'team_needs_modification'

        await notificationService.sendProjectNotification(
          application.project_id,
          notificationType,
          `团队申请${result.message}`,
          comments || `您的团队申请已${result.message}`,
          [application.applicant_id],
          { applicationId, action }
        )
      } catch (notificationError) {
        logger.warn('发送审批结果通知失败:', notificationError)
      }

      res.json({
        code: 200,
        message: result.message,
        data: result
      })

    } catch (error) {
      logger.error('Approve team application error:', error)
      next(error)
    }
  }

  /**
   * 重新提交申请
   */
  async resubmitApplication(req, res, next) {
    try {
      const user = req.user
      const { applicationId } = req.params
      const { teamName, teamDescription, applicationReason, estimatedCost, members } = req.body

      // 获取申请信息（使用MySQL查询）
      const [applications] = await databaseService.manager.pool.execute(
        'SELECT * FROM project_team_applications WHERE id = ?',
        [applicationId]
      )
      
      if (!applications || applications.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '申请不存在',
          data: null
        })
      }
      
      const application = applications[0]

      // 检查是否是申请人
      if (application.applicant_id !== user.id && application.applicant_id !== user.employeeId) {
        return res.status(403).json({
          code: 403,
          message: '只有申请人才能重新提交',
          data: null
        })
      }

      // 重新提交
      const updateData = {
        teamName,
        teamDescription,
        applicationReason,
        estimatedCost
      }

      const result = await projectCollaborationService.resubmitApplication(
        applicationId,
        updateData,
        members
      )

      // 记录审计日志
      await auditService.logPermissionAction(
        user,
        'project:apply',
        'project',
        application.project_id,
        {
          action: 'resubmit_team_application',
          applicationId,
          projectId: application.project_id
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      res.json({
        code: 200,
        message: result.message,
        data: result
      })

    } catch (error) {
      logger.error('Resubmit application error:', error)
      next(error)
    }
  }

  /**
   * 获取项目协作列表
   */
  async getCollaborations(req, res, next) {
    try {
      const user = req.user
      const { projectId, status, page = 1, limit = 10 } = req.query

      // 调用Service层获取协作列表
      const result = await projectCollaborationService.getCollaborations(
        user,
        { projectId, status },
        { page, limit }
      )

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })

    } catch (error) {
      logger.error('Get collaborations error:', error)
      next(error)
    }
  }

  /**
   * 获取我的申请列表
   */
  async getMyApplications(req, res, next) {
    try {
      const user = req.user
      const { page = 1, pageSize = 10, projectName, status } = req.query

      // 调用Service层获取申请列表
      const result = await projectCollaborationService.getMyApplications(
        user,
        { projectName, status },
        { page, pageSize }
      )

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })

    } catch (error) {
      logger.error('Get my applications error:', error)
      next(error)
    }
  }

  /**
   * 获取项目的申请列表
   */
  async getProjectApplications(req, res, next) {
    try {
      const { projectId } = req.params
      const { page = 1, pageSize = 10, status } = req.query

      // 检查项目是否存在
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 调用Service层获取申请列表
      const result = await projectCollaborationService.getProjectApplications(
        projectId,
        { status },
        { page, pageSize }
      )

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })

    } catch (error) {
      logger.error('Get project applications error:', error)
      next(error)
    }
  }

  /**
   * 获取团队申请列表
   */
  async getTeamApplications(req, res, next) {
    try {
      const user = req.user
      const { projectId, status, page = 1, limit = 10 } = req.query

      // 如果指定了项目ID，检查用户是否有权限查看
      if (projectId) {
        const project = await databaseService.getProjectById(projectId)
        if (!project) {
          return res.status(404).json({
            code: 404,
            message: '项目不存在',
            data: null
          })
        }

        const userPermissions = user.Role?.permissions || user.permissions || []
        const isSuperAdmin = userPermissions.includes('*') || 
                             userPermissions.includes('project:approve') ||
                             userPermissions.includes('project:*')

        if (!isSuperAdmin && !PermissionValidator.checkProjectPermission(user, 'manage', project)) {
          return res.status(403).json({
            code: 403,
            message: '您没有权限查看此项目的申请',
            data: null
          })
        }
      }

      // 调用Service层获取申请列表
      const result = await projectCollaborationService.getTeamApplications(
        user,
        { projectId, status },
        { page, limit }
      )

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })

    } catch (error) {
      logger.error('Get team applications error:', error)
      next(error)
    }
  }

  /**
   * 更新项目协作状态
   */
  async updateCollaborationStatus(req, res, next) {
    try {
      const user = req.user
      const { collaborationId } = req.params
      const { status, reason } = req.body

      // 验证必要字段
      if (!status || !['active', 'paused', 'closed'].includes(status)) {
        return res.status(400).json({
          code: 400,
          message: '无效的状态值',
          data: null
        })
      }

      // 获取协作信息
      const collaboration = await databaseService.getCollaborationById(collaborationId)
      if (!collaboration) {
        return res.status(404).json({
          code: 404,
          message: '协作不存在',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(collaboration.projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查用户是否有权限管理此协作
      if (!PermissionValidator.checkProjectPermission(user, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限管理此协作',
          data: null
        })
      }

      // 更新状态
      const updatedCollaboration = await databaseService.updateCollaboration(collaborationId, {
        status,
        reason,
        updatedBy: user.id,
        updatedAt: new Date()
      })

      // 记录审计日志
      await auditService.logPermissionAction(
        user,
        'collaboration:update',
        'project',
        collaboration.projectId,
        {
          action: 'update_collaboration_status',
          collaborationId,
          oldStatus: collaboration.status,
          newStatus: status,
          reason
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      res.json({
        code: 200,
        message: '协作状态更新成功',
        data: updatedCollaboration
      })

    } catch (error) {
      logger.error('Update collaboration status error:', error)
      next(error)
    }
  }

  /**
   * 获取协作统计信息
   */
  async getCollaborationStats(req, res, next) {
    try {
      const user = req.user
      const { projectId } = req.query

      // 检查用户权限
      if (projectId) {
        const project = await databaseService.getProjectById(projectId)
        if (!project || !PermissionValidator.checkProjectPermission(user, 'view', project)) {
          return res.status(403).json({
            code: 403,
            message: '您没有权限查看此项目的统计信息',
            data: null
          })
        }
      }

      // 获取统计信息
      const stats = await projectCollaborationService.getCollaborationStats(projectId)

      res.json({
        code: 200,
        message: '获取成功',
        data: stats
      })

    } catch (error) {
      logger.error('Get collaboration stats error:', error)
      next(error)
    }
  }

  /**
   * 获取我的通知
   */
  async getMyNotifications(req, res, next) {
    try {
      const user = req.user
      const { page = 1, pageSize = 20, unreadOnly = false, notificationType, startDate, endDate } = req.query

      // 使用通知服务获取用户通知
      const result = await notificationService.getUserNotifications(user.id, {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        unreadOnly: unreadOnly === 'true',
        notificationType,
        startDate,
        endDate
      })

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })

    } catch (error) {
      logger.error('Get my notifications error:', error)
      next(error)
    }
  }

  /**
   * 标记通知为已读
   */
  async markNotificationRead(req, res, next) {
    try {
      const user = req.user
      const { notificationId } = req.params

      // 使用通知服务标记通知为已读
      const updatedNotification = await notificationService.markNotificationRead(notificationId, user.id)

      res.json({
        code: 200,
        message: '标记成功',
        data: updatedNotification
      })

    } catch (error) {
      logger.error('Mark notification read error:', error)
      next(error)
    }
  }

  /**
   * 批量标记通知为已读
   */
  async markAllNotificationsRead(req, res, next) {
    try {
      const user = req.user

      // 使用通知服务批量标记通知为已读
      const result = await notificationService.markAllNotificationsRead(user.id)

      res.json({
        code: 200,
        message: '批量标记成功',
        data: { updatedCount: result }
      })

    } catch (error) {
      logger.error('Mark all notifications read error:', error)
      next(error)
    }
  }

  /**
   * 获取协作中心可申请项目列表（专用接口，过滤已申请项目）
   */
  async getAvailableProjects(req, res, next) {
    try {
      const { page = 1, pageSize = 6, search } = req.query

      logger.info(`[Available Projects Controller] userId: ${req.user.id}, page: ${page}, pageSize: ${pageSize}, search: ${search || ''}`)

      // 调用Service层获取可申请项目列表
      const result = await projectCollaborationService.getAvailableProjects(
        req.user,
        { search },
        { page, pageSize }
      )

      res.json({
        code: 200,
        data: result,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get available projects for collaboration error:', error)
      
      // 处理特定错误
      if (error.message === '当前用户未关联员工信息') {
        return res.status(400).json({
          code: 400,
          message: error.message,
          data: null
        })
      }
      
      next(error)
    }
  }
}

module.exports = new ProjectCollaborationController()
