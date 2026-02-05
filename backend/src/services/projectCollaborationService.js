﻿/**
 * 项目协作服务
 * 提供项目协作相关的业务逻辑
 * 使用 MySQL 数据库和事务保障
 */

const databaseService = require('./databaseService')
const { PermissionValidator } = require('../config/permissions')
const auditService = require('../services/auditService')
const { ProjectStateFlowService } = require('./projectStateFlowService')
const logger = require('../utils/logger')
const { APPLICATION_STATUS } = require('../constants/applicationStatus')


class ProjectCollaborationService {
  /**
   * 发布项目（将已存在的项目发布为协作项目）
   * @param {string} projectId - 项目ID
   * @param {Object} updateData - 要更新的数据
   * @returns {Object} 更新后的项目记录
   */
  async publishProject(projectId, updateData) {
    try {
      // 使用 databaseService 更新项目
      const result = await databaseService.update('projects', projectId, updateData)

      // 如果有状态流服务，确保协作状态为 published
      if (ProjectStateFlowService && updateData.cooperation_status === 'published') {
        try {
          const currentStatus = await ProjectStateFlowService.getProjectStatus(projectId)
          // 如果状态不是 published，则更新
          if (currentStatus && currentStatus !== 'published') {
            await ProjectStateFlowService.updateProjectStatus(
              projectId,
              'published',
              '项目发布',
              { publishedBy: updateData.published_by }
            )
          }
        } catch (stateError) {
          logger.warn('更新项目协作状态失败:', stateError)
        }
      }

      logger.info('项目发布成功', {
        projectId: projectId
      })

      // 返回更新后的项目
      return await databaseService.findOne('projects', { id: projectId })
    } catch (error) {
      logger.error('发布项目失败:', error)
      throw error
    }
  }

  /**
   * 创建项目需求记录
   * @param {string} projectId - 项目ID
   * @param {Array} requirements - 需求列表
   * @returns {Array} 创建的需求记录
   */
  async createProjectRequirements(projectId, requirements) {
    try {
      const results = []
      for (const req of requirements) {
        const requirement = {
          project_id: projectId,
          requirement_type: req.type || 'technical',
          title: req.title,
          description: req.description,
          priority: req.priority || 'medium',
          is_mandatory: req.isMandatory !== false,
          acceptance_criteria: req.acceptanceCriteria ? JSON.stringify(req.acceptanceCriteria) : null
        }
        const result = await databaseService.create('project_requirements', requirement)
        results.push(result)
      }

      logger.info(`创建${results.length}条项目需求`, { projectId })
      return results
    } catch (error) {
      logger.error('创建项目需求失败:', error)
      throw error
    }
  }

  /**
   * 创建项目协作
   * @param {Object} collaborationData - 协作数据
   * @returns {Object} 创建的协作记录
   */
  async createCollaboration(collaborationData) {
    try {
      // 移除时间戳，让数据库自动处理
      const collaboration = { ...collaborationData }
      delete collaboration.createdAt
      delete collaboration.updatedAt

      const result = await databaseService.create('project_collaborations', collaboration)

      logger.info('项目协作创建成功', {
        collaborationId: result.id,
        projectId: collaborationData.projectId,
        title: collaborationData.title
      })

      return result
    } catch (error) {
      logger.error('创建项目协作失败:', error)
      throw error
    }
  }

  /**
   * 创建团队申请
   * @param {Object} applicationData - 申请数据
   * @returns {Object} 创建的申请记录
   */
  async createTeamApplication(applicationData) {
    try {
      // 移除时间戳，让数据库自动处理
      const application = { ...applicationData }
      delete application.createdAt
      delete application.updatedAt

      const result = await databaseService.create('project_team_applications', application)

      logger.info('团队申请创建成功', {
        applicationId: result.id,
        projectId: applicationData.projectId,
        applicantId: applicationData.applicantId
      })

      return result
    } catch (error) {
      logger.error('创建团队申请失败:', error)
      throw error
    }
  }

  /**
   * 提交团队申请 - 带事务保障
   * @param {Object} applicationData - 申请基本数据
   * @param {Array} members - 团队成员列表
   * @returns {Object} 提交结果
   */
  async submitTeamApplication(applicationData, members) {
    const connection = await databaseService.manager.pool.getConnection()
    await connection.beginTransaction()

    try {
      // 1. 验证项目状态
      const [projects] = await connection.execute(
        'SELECT id, code, cooperation_status, manager_id FROM projects WHERE id = ?',
        [applicationData.projectId]
      )

      if (!projects || projects.length === 0) {
        throw new Error('项目不存在')
      }

      const project = projects[0]

      // 检查项目是否可申请
      // 只有 published 状态的项目才可以申请
      if (project.cooperation_status !== 'published') {
        throw new Error('项目当前不接受申请，请等待项目发布')
      }

      // 2. 检查重复申请
      const [existingApps] = await connection.execute(
        `SELECT id FROM project_team_applications
           WHERE project_id = ? AND applicant_id = ? AND status_code = ?`,
        [applicationData.projectId, applicationData.applicantId, APPLICATION_STATUS.PENDING]
      )

      if (existingApps && existingApps.length > 0) {
        throw new Error('您已有待审批的申请,请等待审批完成')
      }

      // 3. 创建申请记录
      const [appResult] = await connection.execute(
        `INSERT INTO project_team_applications
           (project_id, applicant_id, team_name, team_description,
            total_members, estimated_cost, application_reason, status_code,
            submitted_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [
          applicationData.projectId,
          applicationData.applicantId,
          applicationData.teamName,
          applicationData.teamDescription,
          members.length,
          applicationData.estimatedCost,
          applicationData.applicationReason,
          APPLICATION_STATUS.PENDING
        ]
      )

      // 获取插入的申请ID（使用insertId）
      const applicationId = appResult.insertId

      // 3.5 自动将申请人加入成员列表（作为项目经理角色）
      const applicantAlreadyInList = members.some(m => m.employeeId === applicationData.applicantId)

      if (!applicantAlreadyInList) {
        // 查找项目经理角色
        const [pmRoles] = await connection.execute(
          'SELECT id, name FROM project_roles WHERE name LIKE "%项目经理%" OR name LIKE "%Project Manager%" LIMIT 1'
        )

        const pmRole = pmRoles && pmRoles.length > 0 ? pmRoles[0] : null

        // 将申请人添加到成员列表
        members.push({
          employeeId: applicationData.applicantId,
          roleId: pmRole?.id || null,
          roleName: pmRole?.name || '项目经理',
          contributionWeight: 100,  // 默认100%
          estimatedWorkload: 100,   // 默认100%
          participationRatio: 100,  // 默认100%
          reason: '申请人（项目经理）'
        })

        logger.info('✅ 已自动将申请人加入团队成员', {
          applicantId: applicationData.applicantId,
          role: pmRole?.name || '项目经理'
        })

        // 更新申请记录的成员总数
        await connection.execute(
          'UPDATE project_team_applications SET total_members = ? WHERE id = ?',
          [members.length, applicationId]
        )
      }

      // 4. 批量创建成员记录(status='pending')
      for (const member of members) {
        // 获取角色名称
        let roleName = member.roleName
        if (!roleName && member.roleId) {
          const [roles] = await connection.execute(
            'SELECT name FROM project_roles WHERE id = ? LIMIT 1',
            [member.roleId]
          )
          if (roles && roles.length > 0) {
            roleName = roles[0].name
          }
        }

        // 生成成员ID
        const memberId = require('crypto').randomBytes(8).toString('hex')

        await connection.execute(
          `INSERT INTO project_members
             (id, project_id, employee_id, application_id, role_id, role_name,
              participation_ratio, contribution_weight, estimated_workload,
              apply_reason, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
          [
            memberId,
            applicationData.projectId,
            member.employeeId,
            applicationId,
            member.roleId,
            roleName || null,
            member.participationRatio || member.estimatedWorkload || 100,
            member.contributionWeight || member.participationRatio || member.estimatedWorkload || 100,
            member.estimatedWorkload || 100,
            member.reason || ''
          ]
        )
      }

      // 5. 自动状态流转: published → team_building
      await ProjectStateFlowService.handleApplicationSubmitted(
        applicationData.projectId,
        applicationId,
        applicationData.applicantId
      )

      await connection.commit()
      logger.info('✅ 团队申请提交成功(事务+状态流转)', { applicationId })

      return {
        success: true,
        applicationId,
        message: '团队申请提交成功'
      }

    } catch (error) {
      await connection.rollback()
      logger.error('❌ 团队申请提交失败(回滚)', error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * 审批团队申请 - 带事务保障
   * @param {string} applicationId - 申请ID
   * @param {string} approverId - 审批人ID
   * @param {boolean} approved - 是否批准
   * @param {string} comments - 审批意见
   * @param {string} action - 审批动作: approve/reject/modify
   * @returns {Object} 审批结果
   */
  async approveTeamApplication(applicationId, approverId, approved, comments, action = 'approve') {
    const connection = await databaseService.manager.pool.getConnection()
    await connection.beginTransaction()

    try {
      // 1. 获取申请信息
      const [applications] = await connection.execute(
        'SELECT * FROM project_team_applications WHERE id = ?',
        [applicationId]
      )

      if (!applications || applications.length === 0) {
        throw new Error('申请不存在')
      }

      const application = applications[0]

      if (application.status_code !== APPLICATION_STATUS.PENDING && application.status_code !== APPLICATION_STATUS.NEEDS_MODIFICATION) {
        throw new Error('该申请已处理,无法重复审批')
      }

      if (action === 'modify') {
        // === 需修改流程 ===
        await connection.execute(
          `UPDATE project_team_applications
             SET status_code = ?, approved_by = ?, approved_at = NOW(),
                 approval_comments = ?, updated_at = NOW()
             WHERE id = ?`,
          [APPLICATION_STATUS.NEEDS_MODIFICATION, approverId, comments, applicationId]
        )

        logger.info('✅ 申请需修改', { applicationId })

        await connection.commit()
        return {
          success: true,
          action: 'needs_modification',
          applicationId,
          message: '已要求修改申请'
        }
      }

      if (approved) {
        // === 批准流程 ===
        // 2a. 更新申请状态为approved
        await connection.execute(
          `UPDATE project_team_applications
             SET status_code = ?, approved_by = ?, approved_at = NOW(),
                 approval_comments = ?, updated_at = NOW()
             WHERE id = ?`,
          [APPLICATION_STATUS.APPROVED, approverId, comments, applicationId]
        )

        // 2a-1. 设置项目经理为申请人（团队申请批准后,申请人成为项目经理）
        const [projects] = await connection.execute(
          'SELECT manager_id FROM projects WHERE id = ?',
          [application.project_id]
        )

        if (projects && projects.length > 0) {
          const currentManagerId = projects[0].manager_id

          // 如果项目没有经理,或者经理与申请人不同,则更新为申请人
          if (!currentManagerId || currentManagerId !== application.applicant_id) {
            await connection.execute(
              'UPDATE projects SET manager_id = ?, updated_at = NOW() WHERE id = ?',
              [application.applicant_id, application.project_id]
            )
            logger.info('✅ 已将申请人设置为项目经理', {
              projectId: application.project_id,
              previousManagerId: currentManagerId || 'null',
              newManagerId: application.applicant_id
            })
          } else {
            logger.info('ℹ️ 申请人已是项目经理,无需更新', {
              projectId: application.project_id,
              managerId: application.applicant_id
            })
          }
        }

        // 2b. 获取成员信息并更新role_id
        const [pendingMembers] = await connection.execute(
          'SELECT * FROM project_members WHERE application_id = ? AND status = "pending"',
          [applicationId]
        )

        // 2c. 激活所有pending成员，并设置role_id
        for (const member of pendingMembers) {
          // 尝试通过role_id或role_name获取角色ID
          let roleId = member.role_id

          // 如果role_id为空，尝试通过role_name查找
          if (!roleId && member.role_name) {
            const [roles] = await connection.execute(
              'SELECT id FROM project_roles WHERE name = ? OR code = ? LIMIT 1',
              [member.role_name, member.role_name]
            )
            if (roles && roles.length > 0) {
              roleId = roles[0].id
            }
          }

          // 更新成员状态，同时设置role和role_id
          await connection.execute(
            `UPDATE project_members
               SET status = 'active', approved_by = ?, approved_at = NOW(),
                   join_date = NOW(), updated_at = NOW(),
                   role = COALESCE(?, role),
                   role_id = ?
               WHERE id = ?`,
            [approverId, member.role_name, roleId, member.id]
          )
        }

        // 2d. 自动状态流转: team_building → approved
        await ProjectStateFlowService.handleApplicationApproved(
          application.project_id,
          applicationId,
          approverId,
          connection
        )

        logger.info('✅ 申请已批准(事务+状态流转)', { applicationId, membersUpdated: pendingMembers.length })

      } else {
        // === 拒绝流程 ===
        // 3a. 更新申请状态为rejected
        await connection.execute(
          `UPDATE project_team_applications
             SET status_code = ?, approved_by = ?, approved_at = NOW(),
                 rejection_reason = ?, updated_at = NOW()
             WHERE id = ?`,
          [APPLICATION_STATUS.REJECTED, approverId, comments, applicationId]
        )

        // 3b. 删除pending成员记录
        await connection.execute(
          `DELETE FROM project_members
             WHERE application_id = ? AND status = 'pending'`,
          [applicationId]
        )

        // 3c. 自动状态流转: team_building → published (重新开放)
        await ProjectStateFlowService.handleApplicationRejected(
          application.project_id,
          applicationId,
          approverId,
          comments,
          connection
        )

        logger.info('✅ 申请已拒绝(事务+状态流转)', { applicationId })
      }

      await connection.commit()

      return {
        success: true,
        action: approved ? 'approved' : 'rejected',
        applicationId,
        message: approved ? '申请已批准' : '申请已拒绝'
      }

    } catch (error) {
      await connection.rollback()
      logger.error('❌ 审批操作失败(回滚)', error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * 重新提交申请（修改后）
   * @param {string} applicationId - 申请ID
   * @param {Object} updateData - 更新数据
   * @param {Array} members - 更新后的成员列表
   * @returns {Object} 重提结果
   */
  async resubmitApplication(applicationId, updateData, members) {
    const connection = await databaseService.manager.pool.getConnection()
    await connection.beginTransaction()

    try {
      // 1. 检查申请状态
      const [applications] = await connection.execute(
        'SELECT * FROM project_team_applications WHERE id = ?',
        [applicationId]
      )

      if (!applications || applications.length === 0) {
        throw new Error('申请不存在')
      }

      const application = applications[0]
      if (application.status_code !== APPLICATION_STATUS.NEEDS_MODIFICATION && application.status_code !== APPLICATION_STATUS.REJECTED) {
        throw new Error('只有被拒绝或需修改的申请才能重新提交')
      }

      // 2. 更新申请信息
      const updateFields = []
      const updateValues = []

      if (updateData.teamName) {
        updateFields.push('team_name = ?')
        updateValues.push(updateData.teamName)
      }
      if (updateData.teamDescription) {
        updateFields.push('team_description = ?')
        updateValues.push(updateData.teamDescription)
      }
      if (updateData.applicationReason) {
        updateFields.push('application_reason = ?')
        updateValues.push(updateData.applicationReason)
      }
      if (updateData.estimatedCost !== undefined) {
        updateFields.push('estimated_cost = ?')
        updateValues.push(updateData.estimatedCost)
      }
      if (members) {
        updateFields.push('total_members = ?')
        updateValues.push(members.length)
      }

      // 更新状态为pending，清除审批信息
      updateFields.push('status_code = ?', 'submitted_at = NOW()', 'updated_at = NOW()')
      updateFields.push('approved_by = NULL', 'approved_at = NULL', 'approval_comments = NULL', 'rejection_reason = NULL')
      updateValues.push(APPLICATION_STATUS.PENDING)

      await connection.execute(
        `UPDATE project_team_applications SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, applicationId]
      )

      // 3. 如果提供了成员列表，更新成员
      if (members && members.length > 0) {
        // 删除旧成员
        await connection.execute(
          'DELETE FROM project_members WHERE application_id = ?',
          [applicationId]
        )

        // 添加新成员
        for (const member of members) {
          await connection.execute(
            `INSERT INTO project_members
             (id, project_id, employee_id, application_id, role_id,
              contribution_weight, estimated_workload,
              apply_reason, status, created_at, updated_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
            [
              application.project_id,
              member.employeeId,
              applicationId,
              member.roleId,
              member.contributionWeight || 1.0,
              member.estimatedWorkload || 1.0,
              member.reason || ''
            ]
          )
        }
      }

      await connection.commit()

      logger.info('✅ 申请重新提交成功', { applicationId })

      return {
        success: true,
        applicationId,
        message: '申请已重新提交，等待审批'
      }

    } catch (error) {
      await connection.rollback()
      logger.error('❌ 重新提交申请失败', error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * 获取协作统计信息
   * @param {string} projectId - 项目ID（可选）
   * @returns {Object} 统计信息
   */
  async getCollaborationStats(projectId = null) {
    try {
      // 获取协作统计
      const collaborationsQuery = projectId
        ? { project_id: projectId }
        : {}
      const collaborations = await databaseService.find('project_collaborations', collaborationsQuery)
      const totalCollaborations = collaborations.length
      const activeCollaborations = collaborations.filter(c => c.status === 'active').length
      const pausedCollaborations = collaborations.filter(c => c.status === 'paused').length
      const closedCollaborations = collaborations.filter(c => c.status === 'closed').length

      // 获取申请统计
      const applicationsQuery = projectId
        ? { project_id: projectId }
        : {}
      const applications = await databaseService.find('project_team_applications', applicationsQuery)
      const totalApplications = applications.length
      const pendingApplications = applications.filter(a => a.status_code === APPLICATION_STATUS.PENDING).length
      const approvedApplications = applications.filter(a => a.status_code === APPLICATION_STATUS.APPROVED).length
      const rejectedApplications = applications.filter(a => a.status_code === APPLICATION_STATUS.REJECTED).length

      // 获取成员统计
      const membersQuery = projectId
        ? { project_id: projectId }
        : {}
      const members = await databaseService.find('project_members', membersQuery)
      const totalMembers = members.length
      const activeMembers = members.filter(m => m.status === 'active').length

      return {
        collaborations: {
          total: totalCollaborations,
          active: activeCollaborations,
          paused: pausedCollaborations,
          closed: closedCollaborations
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications
        },
        members: {
          total: totalMembers,
          active: activeMembers
        }
      }
    } catch (error) {
      logger.error('获取协作统计信息失败:', error)
      return {}
    }
  }

  /**
   * 检查用户协作权限
   * @param {Object} user - 用户对象
   * @param {string} projectId - 项目ID
   * @param {string} action - 操作类型
   * @returns {boolean} 是否有权限
   */
  async checkUserCollaborationPermission(user, projectId, action) {
    try {
      // 检查基础权限
      if (!PermissionValidator.canAccessResource(user, 'collaboration', action)) {
        return false
      }

      // 如果有项目ID，检查项目级权限
      if (projectId) {
        const project = await databaseService.findOne('projects', { id: projectId })
        if (!project) {
          return false
        }

        return PermissionValidator.checkProjectPermission(user, action, project)
      }

      return true
    } catch (error) {
      logger.error('检查用户协作权限失败:', error)
      return false
    }
  }

  /**
   * 获取用户可访问的协作项目
   * @param {Object} user - 用户对象
   * @returns {Array} 可访问的项目列表
   */
  async getUserAccessibleProjects(user) {
    try {
      const result = await databaseService.findAll('projects')
      const projects = result.rows || result

      // 过滤用户可访问的项目
      return PermissionValidator.filterAccessibleResources(user, 'project', projects)
    } catch (error) {
      logger.error('获取用户可访问项目失败:', error)
      return []
    }
  }

  /**
   * 获取项目的申请列表
   * @param {string} projectId - 项目ID
   * @param {Object} query - 查询条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 申请列表和分页信息
   */
  async getProjectApplications(projectId, query, pagination) {
    try {
      const { status } = query
      const { page = 1, pageSize = 10 } = pagination

      // 构建查询条件
      let whereClause = 'pta.project_id = ?'
      const params = [projectId]

      if (status) {
        whereClause += ' AND pta.status = ?'
        params.push(status)
      }

      // 查询申请列表
      const [applications] = await databaseService.manager.pool.execute(
        `SELECT 
           pta.*,
           p.id as project_id,
           p.name as project_name,
           p.code as project_code
         FROM project_team_applications pta
         LEFT JOIN projects p ON pta.project_id = p.id
         WHERE ${whereClause}
         ORDER BY pta.submitted_at DESC`,
        params
      )

      // 丰富申请数据
      const enrichedApplications = await this._enrichApplications(applications)

      const total = enrichedApplications.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedApplications = enrichedApplications.slice(startIndex, endIndex)

      return {
        list: paginatedApplications,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    } catch (error) {
      logger.error('获取项目申请列表失败:', error)
      throw error
    }
  }

  /**
   * 批量处理团队申请
   * @param {Array} applicationIds - 申请ID列表
   * @param {string} approverId - 审批人ID
   * @param {boolean} approved - 是否批准
   * @param {string} comments - 审批意见
   * @returns {Object} 处理结果
   */
  async batchProcessTeamApplications(applicationIds, approverId, approved, comments) {
    try {
      const results = []
      const errors = []

      for (const applicationId of applicationIds) {
        try {
          const result = await this.approveTeamApplication(
            applicationId,
            approverId,
            approved,
            comments
          )
          results.push(result)
        } catch (error) {
          errors.push({
            applicationId,
            error: error.message
          })
        }
      }

      return {
        success: results.length,
        failed: errors.length,
        results,
        errors
      }
    } catch (error) {
      logger.error('批量处理团队申请失败:', error)
      throw error
    }
  }

  /**
   * 获取团队申请列表（带权限过滤）
   * @param {Object} user - 当前用户
   * @param {Object} query - 查询条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 申请列表和分页信息
   */
  async getTeamApplications(user, query, pagination) {
    try {
      const { projectId, status = APPLICATION_STATUS.PENDING } = query
      const { page = 1, limit = 10 } = pagination

      const userPermissions = user.Role?.permissions || user.permissions || []
      const isSuperAdmin = userPermissions.includes('*') || 
                           userPermissions.includes('project:approve') ||
                           userPermissions.includes('project:*')

      let applications = []

      if (projectId) {
        // 查询特定项目的申请
        const [rows] = await databaseService.manager.pool.execute(
          `SELECT * FROM project_team_applications WHERE project_id = ? AND status_code = ? AND applicant_id != ? ORDER BY submitted_at DESC`,
          [projectId, status, user.employeeId]
        )
        applications = rows
      } else if (isSuperAdmin) {
        // 超级管理员查询所有申请（排除自己的）
        const [rows] = await databaseService.manager.pool.execute(
          `SELECT * FROM project_team_applications WHERE status_code = ? AND applicant_id != ? ORDER BY submitted_at DESC`,
          [status, user.employeeId]
        )
        applications = rows
      } else {
        // 普通用户查询自己管理的项目的申请
        const managedProjects = await databaseService.getProjects({
          managerId: user.employeeId
        })

        if (managedProjects.length > 0) {
          const projectIds = managedProjects.map(p => p.id || p._id)
          const placeholders = projectIds.map(() => '?').join(',')
          const [rows] = await databaseService.manager.pool.execute(
            `SELECT * FROM project_team_applications WHERE project_id IN (${placeholders}) AND status_code = ? AND applicant_id != ? ORDER BY submitted_at DESC`,
            [...projectIds, status, user.employeeId]
          )
          applications = rows
        }
      }

      // 丰富申请数据
      const enrichedApplications = await this._enrichApplications(applications)

      const total = enrichedApplications.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + parseInt(limit)
      const paginatedApplications = enrichedApplications.slice(startIndex, endIndex)

      return {
        list: paginatedApplications,
        page: parseInt(page),
        pageSize: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      logger.error('获取团队申请列表失败:', error)
      throw error
    }
  }

  /**
   * 获取我的申请列表
   * @param {Object} user - 当前用户
   * @param {Object} query - 查询条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 申请列表和分页信息
   */
  async getMyApplications(user, query, pagination) {
    try {
      const { projectName, status } = query
      const { page = 1, pageSize = 10 } = pagination

      let whereClause = 'pta.applicant_id = ?'
      const params = [user.employeeId || user.id]

      if (status) {
        whereClause += ' AND pta.status_code = ?'
        params.push(status)
      }

      if (projectName) {
        whereClause += ' AND p.name LIKE ?'
        params.push(`%${projectName}%`)
      }

      const [applications] = await databaseService.manager.pool.execute(
        `SELECT 
           pta.*,
           p.id as project_id,
           p.name as project_name,
           p.code as project_code
         FROM project_team_applications pta
         LEFT JOIN projects p ON pta.project_id = p.id
         WHERE ${whereClause}
         ORDER BY pta.submitted_at DESC`,
        params
      )

      // 丰富申请数据
      const enrichedApplications = await this._enrichApplications(applications)

      const total = enrichedApplications.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedApplications = enrichedApplications.slice(startIndex, endIndex)

      return {
        list: paginatedApplications,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    } catch (error) {
      logger.error('获取我的申请列表失败:', error)
      throw error
    }
  }

  /**
   * 获取可申请项目列表
   * @param {Object} user - 当前用户
   * @param {Object} query - 查询条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 项目列表和分页信息
   */
  async getAvailableProjects(user, query, pagination) {
    try {
      const { search } = query
      const { page = 1, pageSize = 6 } = pagination

      logger.info(`[Available Projects Service] userId: ${user.id}, employeeId: ${user.employeeId}`)

      // 获取员工信息
      const employee = await databaseService.getEmployeeByUserId(user.id)
      if (!employee) {
        throw new Error('当前用户未关联员工信息')
      }

      // 检查用户权限
      const userPermissions = user.Role?.permissions || user.permissions || []
      const isSuperAdmin = userPermissions.includes('*') || userPermissions.includes('admin')
      const hasProjectManagerPermission = userPermissions.includes('project:create') || 
                                          userPermissions.includes('team:build')

      logger.info(`[Available Projects Service] 权限判断: isSuperAdmin=${isSuperAdmin}, hasProjectManagerPermission=${hasProjectManagerPermission}`)

      // 获取所有已发布的项目
      const allProjects = await databaseService.getProjects()
      logger.info(`[Available Projects Service] 数据库中总项目数: ${allProjects.length}`)

      // 筛选可申请的项目
      let availableProjects = allProjects.filter(project => {
        const status = project.cooperation_status
        // 已发布或已批准的项目都可以申请
        const isAvailable = status === 'published' || status === 'approved'
        const hasManager = project.managerId || project.manager_id
        const managerId = project.managerId || project.manager_id
        
        // 排除用户自己是项目经理的项目
        if (managerId === employee._id) {
          logger.info(`[Filter] ❌ 项目 ${project.name} 过滤：用户是项目经理`)
          return false
        }
        
        logger.info(`[Filter] 项目: ${project.name}, status: ${status}, isAvailable: ${isAvailable}, hasManager: ${hasManager}, managerId: ${project.managerId}, manager_id: ${project.manager_id}`)
        
        // 可申请状态 + 已指定项目经理：所有用户可见（普通员工可申请加入）
        if (isAvailable && hasManager) {
          logger.info(`[Filter] ✅ 项目 ${project.name} 通过筛选：可申请+有经理`)
          return true
        }
        
        // 已发布 + 未指定项目经理：只有项目经理可见（抢单模式）
        if (status === 'published' && !hasManager) {
          const canView = isSuperAdmin || hasProjectManagerPermission
          logger.info(`[Filter] 项目 ${project.name} 抢单模式，用户可见: ${canView} (isSuperAdmin=${isSuperAdmin}, hasProjectManagerPermission=${hasProjectManagerPermission})`)
          return canView
        }
        
        logger.info(`[Filter] ❌ 项目 ${project.name} 未通过筛选`)
        return false
      })
      logger.info(`[Available Projects Service] 筛选后可用项目数: ${availableProjects.length}, 项目列表: ${availableProjects.map(p => p.name).join(', ')}`)

      // 获取用户已申请/已加入的项目ID列表
      const userProjectMembers = await databaseService.getEmployeeProjectMembers(employee._id)
      const memberProjectIds = userProjectMembers
        .filter(member => ['pending', 'active', 'approved'].includes(member.status))
        .map(member => member.projectId)
      logger.info(`[Available Projects Service] 用户已加入项目数: ${memberProjectIds.length}`)

      // 获取用户待审批的团队申请
      const [pendingApplications] = await databaseService.manager.pool.execute(
        'SELECT project_id FROM project_team_applications WHERE applicant_id = ? AND status_code = ?',
        [employee._id, APPLICATION_STATUS.PENDING]
      )
      const pendingApplicationProjectIds = pendingApplications.map(app => app.project_id)
      logger.info(`[Available Projects Service] 用户待审批申请项目数: ${pendingApplicationProjectIds.length}`)

      // 合并已加入和申请中的项目ID
      const appliedProjectIds = [...new Set([...memberProjectIds, ...pendingApplicationProjectIds])]
      logger.info(`[Available Projects Service] 用户已申请/已加入项目总数: ${appliedProjectIds.length}`)

      // 过滤掉已申请的项目
      availableProjects = availableProjects.filter(project => 
        !appliedProjectIds.includes(project._id)
      )
      logger.info(`[Available Projects Service] 过滤已申请后项目数: ${availableProjects.length}`)

      // 搜索过滤
      if (search) {
        availableProjects = availableProjects.filter(project =>
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.code.toLowerCase().includes(search.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // 分页处理
      const total = availableProjects.length
      const offset = (page - 1) * pageSize
      const paginatedProjects = availableProjects.slice(offset, offset + parseInt(pageSize))

      // 获取项目详细信息
      const projectsWithDetails = await this._enrichProjects(paginatedProjects)

      return {
        list: projectsWithDetails,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    } catch (error) {
      logger.error('获取可申请项目列表失败:', error)
      throw error
    }
  }

  /**
   * 获取协作列表
   * @param {Object} user - 当前用户
   * @param {Object} query - 查询条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 协作列表和分页信息
   */
  async getCollaborations(user, query, pagination) {
    try {
      const { projectId, status } = query
      const { page = 1, limit = 10 } = pagination

      const userPermissions = user.Role?.permissions || user.permissions || []
      const isSuperAdmin = userPermissions.includes('*') || 
                           userPermissions.includes('project:view_all') ||
                           userPermissions.includes('project:*')

      // 获取用户可访问的项目ID列表
      let accessibleProjectIds = []

      if (isSuperAdmin) {
        const [allProjects] = await databaseService.manager.pool.execute(
          'SELECT id FROM projects'
        )
        accessibleProjectIds = allProjects.map(p => p.id)
      } else {
        const [managedProjects] = await databaseService.manager.pool.execute(
          'SELECT id FROM projects WHERE manager_id = ?',
          [user.employeeId]
        )
        
        const [memberProjects] = await databaseService.manager.pool.execute(
          'SELECT DISTINCT project_id FROM project_members WHERE employee_id = ?',
          [user.employeeId]
        )
        
        const managedIds = managedProjects.map(p => p.id)
        const memberIds = memberProjects.map(p => p.project_id)
        accessibleProjectIds = [...new Set([...managedIds, ...memberIds])]
      }

      if (accessibleProjectIds.length === 0) {
        return {
          list: [],
          page: parseInt(page),
          pageSize: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      }

      // 构建查询条件
      let whereClause = `p.id IN (${accessibleProjectIds.map(() => '?').join(',')})`
      const params = [...accessibleProjectIds]

      if (projectId) {
        whereClause += ' AND p.id = ?'
        params.push(projectId)
      }

      if (status) {
        whereClause += ' AND p.cooperation_status = ?'
        params.push(status)
      }

      // 查询项目协作信息
      const [collaborations] = await databaseService.manager.pool.execute(
        `SELECT 
           p.id,
           p.name,
           p.code,
           p.cooperation_status,
           p.manager_id,
           p.created_at,
           p.updated_at,
           u.username as manager_name,
           u.real_name as manager_real_name
         FROM projects p
         LEFT JOIN users u ON p.manager_id = u.id
         WHERE ${whereClause}
         ORDER BY p.created_at DESC`,
        params
      )

      const total = collaborations.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + parseInt(limit)
      const paginatedCollaborations = collaborations.slice(startIndex, endIndex)

      return {
        list: paginatedCollaborations,
        page: parseInt(page),
        pageSize: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      logger.error('获取协作列表失败:', error)
      throw error
    }
  }

  /**
   * 丰富申请数据（添加项目、申请人、成员信息）
   * @private
   */
  async _enrichApplications(applications) {
    return await Promise.all(
      applications.map(async (app) => {
        // 获取项目信息
        let project = null
        if (app.project_id) {
          const [projects] = await databaseService.manager.pool.execute(
            'SELECT id, name, code FROM projects WHERE id = ?',
            [app.project_id]
          )
          if (projects && projects.length > 0) {
            project = {
              id: projects[0].id,
              name: projects[0].name,
              code: projects[0].code
            }
          }
        }

        // 获取申请人信息
        let applicant = null
        if (app.applicant_id) {
          const [employees] = await databaseService.manager.pool.execute(
            'SELECT e.id, e.name, e.employee_no, u.username FROM employees e LEFT JOIN users u ON e.id = u.id WHERE e.id = ?',
            [app.applicant_id]
          )
          if (employees && employees.length > 0) {
            applicant = {
              id: employees[0].id,
              name: employees[0].name,
              realName: employees[0].name,
              employeeNo: employees[0].employee_no,
              username: employees[0].username
            }
          }
        }

        // 获取成员信息
        const [members] = await databaseService.manager.pool.execute(
          `SELECT pm.*, e.name as employee_name, e.employee_no, e.department_id, e.position_id,
                  d.name as department_name, p.name as position_name, pr.name as role_name
           FROM project_members pm
           LEFT JOIN employees e ON pm.employee_id = e.id
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN positions p ON e.position_id = p.id
           LEFT JOIN project_roles pr ON pm.role_id = pr.id
           WHERE pm.application_id = ?`,
          [app.id]
        )

        const formattedMembers = (members || []).map(member => ({
          id: member.id,
          employeeId: member.employee_id,
          roleId: member.role_id,
          roleName: member.role_name,
          contributionWeight: member.contribution_weight,
          estimatedWorkload: member.estimated_workload,
          allocationPercentage: member.allocation_percentage,
          applyReason: member.apply_reason,
          status: member.status,
          Employee: {
            id: member.employee_id,
            name: member.employee_name,
            employeeNo: member.employee_no,
            department: member.department_name,
            position: member.position_name
          }
        }))

        return {
          id: app.id,
          projectId: app.project_id,
          applicantId: app.applicant_id,
          teamName: app.team_name,
          teamDescription: app.team_description,
          totalMembers: app.total_members,
          estimatedCost: app.estimated_cost,
          applicationReason: app.application_reason,
          status: app.status_code, // 使用整数状态码
          submittedAt: app.submitted_at,
          approvedBy: app.approved_by,
          approvedAt: app.approved_at,
          approvalComments: app.approval_comments,
          rejectionReason: app.rejection_reason,
          createdAt: app.created_at,
          updatedAt: app.updated_at,
          Project: project,
          Applicant: applicant,
          Members: formattedMembers
        }
      })
    )
  }

  /**
   * 丰富项目数据（添加经理、成本、奖金等信息）
   * @private
   */
  async _enrichProjects(projects) {
    return await Promise.all(
      projects.map(async (project) => {
        let manager = null
        if (project.managerId) {
          manager = await databaseService.getEmployeeById(project.managerId)
        }

        // 计算项目成本
        let totalCost = 0
        try {
          const costs = await databaseService.getProjectCosts({ projectId: project._id })
          totalCost = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
        } catch (err) {
          logger.warn(`获取项目成本失败: projectId=${project._id}`, err.message)
        }

        const budget = project.budget || 0
        const expectedProfit = budget - totalCost
        const profitTarget = project.profitTarget || 0
        const estimatedBonus = profitTarget > 0 ? profitTarget * 0.1 : 0

        // 获取实际奖金
        let calculatedBonus = 0
        try {
          const bonusPoolsResult = await databaseService.findAll('projectBonusPools', {
            where: { projectId: project._id }
          })
          const bonusPools = bonusPoolsResult.rows || bonusPoolsResult || []
          
          if (bonusPools.length > 0) {
            const poolIds = bonusPools.map(pool => pool._id || pool.id)
            
            for (const poolId of poolIds) {
              const allocationsResult = await databaseService.findAll('projectBonusAllocations', {
                where: { poolId: poolId }
              })
              const allocations = allocationsResult.rows || allocationsResult || []
              
              allocations.forEach(allocation => {
                const amount = parseFloat(allocation.bonusAmount) || parseFloat(allocation.bonus_amount) || 0
                calculatedBonus += amount
              })
            }
          }
        } catch (err) {
          logger.warn(`获取项目实际奖金失败: projectId=${project._id}`, err.message)
        }

        const { _id, ...projectData } = project
        
        return {
          ...projectData,
          id: _id,
          cooperationStatus: project.cooperation_status || 'draft',
          Manager: manager ? {
            id: manager._id,
            name: manager.name,
            employeeNo: manager.employeeNo
          } : null,
          cost: totalCost,
          expectedProfit,
          estimatedBonus,
          calculatedBonus,
          bonusStatus: project.bonusStatus || project.bonus_status || 'pending'
        }
      })
    )
  }
}

module.exports = new ProjectCollaborationService()
