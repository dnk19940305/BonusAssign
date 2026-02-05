﻿const projectMemberService = require('../services/projectMemberService')
const { PermissionValidator } = require('../config/permissions')
const auditService = require('../services/auditService')
const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')


class ProjectMemberController {
  /**
   * 直接添加项目成员（项目经理）
   * body: { projectId, members: [{ employeeId, roleId, participationRatio }] }
   */
  async addProjectMembers(req, res, next) {
    try {
      const { projectId, members } = req.body
      const user = req.user

      if (!projectId || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '缺少项目ID或成员列表',
          data: null
        })
      }

      // 检查项目
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 权限：必须有项目管理权限
      if (!PermissionValidator.checkProjectPermission(user, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限为该项目添加成员',
          data: null
        })
      }

      const results = { success: 0, skipped: 0, failed: 0, details: [] }

      for (const m of members) {
        try {
          const employeeId = m.employeeId
          if (!employeeId) {
            results.failed++
            results.details.push({ employeeId, status: 'failed', reason: '缺少员工ID' })
            continue
          }

          // 检查员工存在
          const employee = await databaseService.getEmployeeById(employeeId)
          if (!employee) {
            results.failed++
            results.details.push({ employeeId, status: 'failed', reason: '员工不存在' })
            continue
          }

          // 已存在成员则跳过
          const existing = await databaseService.find('projectMembers', { projectId, employeeId })
          if (Array.isArray(existing) && existing.length > 0) {
            results.skipped++
            results.details.push({ employeeId, status: 'skipped', reason: '已是项目成员或有记录' })
            continue
          }

          // 解析角色：将roleId存储到role_id字段（INT类型）
          // 根据规范：前端传入roleId（数字ID），后端存储至project_members表的role_id字段
          const memberData = {
            projectId,
            employeeId,
            status: 'active',
            participationRatio: m.participationRatio ?? 100, // 参与度（百分比，默认100%）
            contributionWeight: 1.0,
            approvedBy: user.id,
            approvedAt: new Date(),
            joinDate: new Date(),
            applyReason: 'manager_added'
          }

          // 设置角色ID：优先使用roleId，存储到role_id字段
          if (m.roleId) {
            memberData.roleId = m.roleId
          } else if (m.role) {
            // 兼容传入role名称的情况，尝试解析为roleId
            try {
              const roleRecord = await databaseService.getProjectRoleByName(m.role)
              if (roleRecord) {
                memberData.roleId = roleRecord.id || roleRecord._id
              }
            } catch (roleErr) {
              logger.warn('通过角色名称解析roleId失败:', roleErr?.message)
            }
          }

          const created = await databaseService.createProjectMember(memberData)
          results.success++
          results.details.push({ employeeId, status: 'success', memberId: created._id || created.id })

          // 审计日志
          await auditService.logPermissionAction(
            user,
            'member:add',
            'project',
            projectId,
            { action: 'add_project_member', employeeId, roleId: m.roleId, participationRatio: m.participationRatio },
            { ipAddress: req.ip, userAgent: req.get('User-Agent'), requestId: req.id }
          )
        } catch (err) {
          logger.error('Add member failed:', err)
          results.failed++
          results.details.push({ employeeId: m.employeeId, status: 'failed', reason: err.message || '未知错误' })
        }
      }

      return res.json({ code: 200, message: '成员添加处理完成', data: results })
    } catch (error) {
      logger.error('Add project members error:', error)
      next(error)
    }
  }
  /**
   * 员工申请加入项目
   */
  async applyToJoinProject(req, res, next) {
    try {
      const { projectId, applyReason, expectedRole, participationRatio } = req.body
      const employeeId = req.user.employeeId // 从登录用户获取员工ID

      if (!employeeId) {
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }

      const member = await projectMemberService.applyToJoinProject(
        employeeId,
        projectId,
        applyReason,
        expectedRole,
        participationRatio
      )

      res.json({
        code: 200,
        message: '申请提交成功，请等待项目经理审批',
        data: member
      })
    } catch (error) {
      logger.error('Apply to join project error:', error)
      next(error)
    }
  }

  /**
   * 获取项目角色列表
   */
  async getProjectRoles(req, res, next) {
    try {
      // 从pproject_roles 表获取项目角色
      const projectRoles = await databaseService.findAll('project_roles', {
        where: { status: 1 }
      })

      const roles = projectRoles.rows || projectRoles || []

      logger.info('获取项目角色列表', { count: roles.length })

      res.json({
        code: 200,
        message: '获取成功',
        data: roles
      })
    } catch (error) {
      logger.error('Get project roles error:', error)
      next(error)
    }
  }

  /**
   * 获取所有项目角色（包括禁用的）
   */
  async getAllProjectRoles(req, res, next) {
    try {
      const { page = 1, pageSize = 20, status } = req.query

      let where = {}
      if (status !== undefined) {
        where.status = parseInt(status)
      }

      const offset = (parseInt(page) - 1) * parseInt(pageSize)
      const projectRoles = await databaseService.findAll('project_roles', {
        where,
        offset,
        limit: parseInt(pageSize)
      })

      const allRoles = projectRoles.rows || projectRoles || []
      const totalCount = allRoles.length > 0 && allRoles[0].count !== undefined ? allRoles[0].count : allRoles.length

      res.json({
        code: 200,
        message: '获取成功',
        data: {
          roles: allRoles,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: totalCount,
            totalPages: Math.ceil(totalCount / parseInt(pageSize))
          }
        }
      })
    } catch (error) {
      logger.error('Get all project roles error:', error)
      next(error)
    }
  }

  /**
   * 创建项目角色
   */
  async createProjectRole(req, res, next) {
    try {
      const { name, code, description, defaultWeight = 1.0, responsibilities, requiredSkills } = req.body
      const createdBy = req.user?.id || 1

      // 验证必填字段
      if (!name || !code) {
        return res.status(400).json({
          code: 400,
          message: '角色名称和代码不能为空',
          data: null
        })
      }

      // 检查角色代码是否已存在
      const existingRole = await databaseService.getProjectRoleByCode(code)
      if (existingRole) {
        return res.status(400).json({
          code: 400,
          message: '角色代码已存在',
          data: null
        })
      }

      const roleData = {
        name,
        code,
        description: description || '',
        defaultWeight: parseFloat(defaultWeight) || 1.0,
        responsibilities: responsibilities || [],
        requiredSkills: requiredSkills || [],
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const newRole = await databaseService.insert('project_roles', roleData)

      logger.info(`项目角色创建成功: ${name} (ID: ${newRole._id || newRole.id})`)

      res.json({
        code: 200,
        message: '项目角色创建成功',
        data: newRole
      })
    } catch (error) {
      logger.error('Create project role error:', error)
      next(error)
    }
  }

  /**
   * 更新项目角色
   */
  async updateProjectRole(req, res, next) {
    try {
      const { id } = req.params
      const { name, code, description, defaultWeight, responsibilities, requiredSkills, status } = req.body

      const role = await databaseService.getProjectRoleById(id)
      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '项目角色不存在',
          data: null
        })
      }

      // 检查角色代码是否与其他角色冲突
      if (code && code !== role.code) {
        const existingRole = await databaseService.getProjectRoleByCode(code)
        if (existingRole && existingRole._id !== id && existingRole.id !== id) {
          return res.status(400).json({
            code: 400,
            message: '角色代码已存在',
            data: null
          })
        }
      }

      const updateData = {
        updatedAt: new Date()
      }

      if (name) updateData.name = name
      if (code) updateData.code = code
      if (description !== undefined) updateData.description = description
      if (defaultWeight !== undefined) updateData.defaultWeight = parseFloat(defaultWeight)
      if (responsibilities !== undefined) updateData.responsibilities = responsibilities
      if (requiredSkills !== undefined) updateData.requiredSkills = requiredSkills
      if (status !== undefined) updateData.status = parseInt(status)

      await databaseService.update('project_roles', { _id: id }, updateData)
      const updatedRole = await databaseService.getProjectRoleById(id)

      logger.info(`项目角色更新成功: ${updatedRole.name} (ID: ${id})`)

      res.json({
        code: 200,
        message: '项目角色更新成功',
        data: updatedRole
      })
    } catch (error) {
      logger.error('Update project role error:', error)
      next(error)
    }
  }

  /**
   * 删除项目角色
   */
  async deleteProjectRole(req, res, next) {
    try {
      const { id } = req.params

      const role = await databaseService.getProjectRoleById(id)
      if (!role) {
        return res.status(404).json({
          code: 404,
          message: '项目角色不存在',
          data: null
        })
      }

      // 检查是否有项目成员正在使用此角色
      const membersUsingRole = await databaseService.find('projectMembers', { roleId: id })
      if (membersUsingRole && membersUsingRole.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该角色已被项目成员使用，无法删除',
          data: null
        })
      }

      await databaseService.remove('project_roles', { _id: id })

      logger.info(`项目角色删除成功: ${role.name} (ID: ${id})`)

      res.json({
        code: 200,
        message: '项目角色删除成功',
        data: null
      })
    } catch (error) {
      logger.error('Delete project role error:', error)
      next(error)
    }
  }

  /**
   * 获取项目成员申请列表（项目经理用）
   */
  async getPendingApplications(req, res, next) {
    try {
      const managerId = req.user.employeeId
      const userPermissions = req.user.Role?.permissions || req.user.permissions || []
      const isAdmin = userPermissions.includes('*') || userPermissions.includes('admin')

      // 如果是管理员，可以获取所有待审批的申请
      if (isAdmin) {
        console.log('🔐 管理员用户，获取所有待审批的申请')
        const allApplications = await projectMemberService.getAllPendingApplications()
        return res.json({
          code: 200,
          message: '获取成功',
          data: allApplications
        })
      }

      // 普通用户必须有员工ID
      if (!managerId) {
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }

      // 获取用户管理的项目
      const managedProjects = await databaseService.getProjects({ managerId })
      if (managedProjects.length === 0) {
        return res.json({
          code: 200,
          message: '获取成功',
          data: []
        })
      }

      // 获取这些项目的待审批申请
      const projectIds = managedProjects.map(p => p._id || p.id)
      const pendingApplications = await projectMemberService.getPendingApplicationsByProjects(projectIds)

      // 增强过滤逻辑：项目经理不应该审批自己提交的申请（包括自己加入项目和自己组建的团队）
      const filteredApplications = []
      for (const app of pendingApplications) {
        // 1. 过滤掉申请人是自己的个人申请
        if (app.employeeId && managerId && app.employeeId.toString() === managerId.toString()) {
          continue
        }

        // 2. 如果是团队申请的一部分，过滤掉申请人是自己的团队申请
        if (app.applicationId) {
          try {
            const teamApp = await databaseService.findOne('project_team_applications', { id: app.applicationId })
            if (teamApp && (teamApp.applicantId || teamApp.applicant_id)) {
              const applicantId = teamApp.applicantId || teamApp.applicant_id
              if (applicantId.toString() === managerId.toString()) {
                continue
              }
            }
          } catch (err) {
            logger.warn(`检查团队申请失败: applicationId=${app.applicationId}`, err.message)
          }
        }

        filteredApplications.push(app)
      }

      res.json({
        code: 200,
        message: '获取成功',
        data: filteredApplications
      })
    } catch (error) {
      logger.error('Get pending applications error:', error)
      next(error)
    }
  }

  /**
   * 审批成员申请
   */
  async approveMemberApplication(req, res, next) {
    try {
      const { memberId } = req.params
      const { approved, comments, role, roleId, startDate, participationRatio, remark } = req.body
      const approver = req.user

      // 根据路由路径判断是批准还是拒绝（兼容前端两种调用方式）
      const isApprove = req.path.endsWith('/approve')
      const isReject = req.path.endsWith('/reject')

      // 确定审批结果：优先使用 approved 参数，否则根据路由判断
      let finalApproved = approved
      if (typeof approved !== 'boolean') {
        if (isApprove) {
          finalApproved = true
        } else if (isReject) {
          finalApproved = false
        } else {
          return res.status(400).json({
            code: 400,
            message: '缺少审批结果',
            data: null
          })
        }
      }

      // 获取成员申请信息
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        return res.status(404).json({
          code: 404,
          message: '成员申请不存在',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(member.projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查审批人权限
      if (!PermissionValidator.checkProjectPermission(approver, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限审批此申请',
          data: null
        })
      }

      // 审批申请（兼容前端传参：comments/remark, role/roleId）
      const result = await projectMemberService.approveMemberApplication(
        memberId,
        approver.id,
        finalApproved,
        comments || remark,
        role || roleId,
        startDate,
        participationRatio
      )

      // 记录审计日志
      await auditService.logPermissionAction(
        approver,
        'member:approve',
        'project',
        member.projectId,
        {
          action: 'approve_member_application',
          memberId,
          approved: finalApproved,
          employeeId: member.employeeId,
          role: role || roleId || 'member'
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      res.json({
        code: 200,
        message: finalApproved ? '申请已批准' : '申请已拒绝',
        data: result
      })

    } catch (error) {
      logger.error('Approve member application error:', error)
      next(error)
    }
  }

  /**
   * 批量审批申请
   */
  async batchApproveApplications(req, res, next) {
    try {
      const { memberApprovals, memberIds, approved, comments, role, roleId, defaultRoleId, startDate, participationRatio } = req.body
      const approver = req.user

      // 确定审批结果：优先使用 approved 参数，否则根据路由判断
      const path = req.path.toLowerCase()
      const isApprove = path.endsWith('/approve') || path.includes('batch-approve')
      let finalApproved = approved
      if (typeof approved !== 'boolean') {
        if (isApprove) {
          finalApproved = true
        } else if (path.endsWith('/reject')) {
          finalApproved = false
        } else {
          return res.status(400).json({
            code: 400,
            message: '缺少审批结果',
            data: null
          })
        }
      }

      // 兼容多种角色参数命名
      let finalRole = role || roleId || defaultRoleId
      
      // 如果传入的是 defaultRoleId，需要验证其有效性
      if (defaultRoleId) {
        try {
          const roleRecord = await databaseService.getProjectRoleById(defaultRoleId)
          if (!roleRecord) {
            // 如果角色不存在，则不设置角色ID
            finalRole = null
            console.log(`⚠️ 批量审批：提供的角色ID ${defaultRoleId} 不存在，将不分配角色`)
          }
        } catch (error) {
          logger.warn(`验证角色ID失败: ${defaultRoleId}`, error.message)
          finalRole = null
        }
      }

      // 验证必要字段
      if ((!Array.isArray(memberIds) || memberIds.length === 0) && 
          (!Array.isArray(memberApprovals) || memberApprovals.length === 0)) {
        return res.status(400).json({
          code: 400,
          message: '缺少成员ID列表或成员审批信息列表',
          data: null
        })
      }

      if (typeof finalApproved !== 'boolean') {
        return res.status(400).json({
          code: 400,
          message: '缺少审批结果',
          data: null
        })
      }

      // 决定使用哪种方式处理批量审批
      let results;
      if (Array.isArray(memberApprovals) && memberApprovals.length > 0) {
        // 新的批量审批方式：为每个成员分配不同的角色和参与度
        results = await projectMemberService.batchApproveApplications(
          memberApprovals,
          approver.id,
          finalApproved,
          comments,
          startDate
        )
      } else {
        // 兼容旧的批量审批方式：为所有成员分配相同的角色和参与度
        // 如果提供了 memberIds 数组，构造适当的参数
        const approvals = memberIds.map(memberId => ({
          memberId,
          roleId: finalRole, // 使用统一的角色ID
          participationRatio: participationRatio || 100 // 使用统一的参与度
        }));
        
        results = await projectMemberService.batchApproveApplications(
          approvals,
          approver.id,
          finalApproved,
          comments,
          startDate
        )
      }

      // 记录审计日志
      const allMemberIds = Array.isArray(memberApprovals) 
        ? memberApprovals.map(item => item.memberId)
        : memberIds;
        
      for (const memberId of allMemberIds) {
        try {
          const member = await databaseService.getProjectMemberById(memberId)
          if (member) {
            await auditService.logPermissionAction(
              approver,
              'member:approve',
              'project',
              member.projectId,
              {
                action: 'batch_approve_member_applications',
                memberId,
                approved: finalApproved,
                role: finalRole || 'member',
                participationRatio
              },
              {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.id
              }
            )
          }
        } catch (error) {
          logger.error('记录批量审批审计日志失败:', error)
        }
      }

      res.json({
        code: 200,
        message: `批量审批完成，成功: ${results.success}，失败: ${results.failed}`,
        data: results
      })

    } catch (error) {
      logger.error('Batch approve applications error:', error)
      next(error)
    }
  }

  /**
   * 获取项目成员列表
   */
  async getProjectMembers(req, res, next) {
    try {
      const { projectId } = req.params
      const { status } = req.query

      const members = await projectMemberService.getProjectMembers(projectId, status)

      // 直接返回数组，与项目其他API保持一致
      res.json({
        code: 200,
        message: '获取成功',
        data: members
      })
    } catch (error) {
      logger.error('Get project members error:', error)
      next(error)
    }
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(req, res, next) {
    try {
      const { memberId } = req.params
      const body = req.body
      const { role, roleId, reason } = body
      // 兼容两种命名的参与度参数
      const participationRatio = body.participationRatio !== undefined ? body.participationRatio : body.participation_ratio
      // 兼容两种命名的贡献权重参数
      const contributionWeight = body.contributionWeight !== undefined ? body.contributionWeight : body.contribution_weight

      const updater = req.user

      // 获取成员信息
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        return res.status(404).json({
          code: 404,
          message: '成员不存在',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(member.projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 兼容前端两种参数命名：role 或 roleId，如果都没传则尝试从数据库记录获取
      let finalRole = roleId || role || member.roleId || member.role

      // 逻辑增强：如果是项目经理且缺少角色信息，尝试自动补全为“项目经理”角色
      if (!finalRole && (project.managerId === member.employeeId || project.manager_id === member.employeeId)) {
        try {
          const pmRole = await databaseService.getProjectRoleByName('项目经理')
          if (pmRole) {
            finalRole = pmRole.id || pmRole._id
          }
        } catch (roleErr) {
          logger.warn('尝试纠正项目经理角色失败:', roleErr.message)
        }
      }

      // 验证必要字段：只有当参与度也没传时，才报错缺少角色
      if (!finalRole && participationRatio === undefined) {
        return res.status(400).json({
          code: 400,
          message: '缺少角色信息',
          data: null
        })
      }

      // 检查更新人权限
      // 检查是否为项目经理
      const isProjectManager = project.managerId === updater.employeeId || project.manager_id === updater.employeeId;
      
      if (!isProjectManager && !PermissionValidator.checkProjectPermission(updater, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限更新此成员角色',
          data: null
        })
      }

      // 准备更新数据
      const updateData = {
        updatedAt: new Date()
      }

      // 解析角色：基于前面确定的 finalRole 进行最终 ID 解析
      let resolvedRoleId = null
      if (finalRole) {
        // 先尝试直接按 ID 查找（支持字母数字 ID）
        try {
          const roleById = await databaseService.getProjectRoleById(finalRole)
          if (roleById) {
            resolvedRoleId = roleById.id || roleById._id
          }
        } catch (e) {
          // 继续尝试按名称查找
        }

        if (!resolvedRoleId) {
          // 尝试按名称解析
          try {
            const roleEntity = await databaseService.getProjectRoleByName(finalRole)
            if (roleEntity) {
              resolvedRoleId = roleEntity.id || roleEntity._id
            }
          } catch (e) {
            logger.warn(`解析角色失败: ${finalRole}`)
          }
        }
      }

      // 如果最终还是没找到角色 ID，且也没有传参与度，则报错
      if (!resolvedRoleId && participationRatio === undefined) {
        return res.status(400).json({
          code: 400,
          message: '角色不存在或无法解析',
          data: null
        })
      }

      if (resolvedRoleId) {
        updateData.roleId = resolvedRoleId
      }

      // 如果提供了参与度，也一并更新
      if (participationRatio !== undefined && participationRatio !== null) {
        updateData.participationRatio = participationRatio
      }

      // 如果提供了贡献权重，也一并更新
      if (contributionWeight !== undefined && contributionWeight !== null) {
        updateData.contributionWeight = contributionWeight
      }

      // 更新角色
      const updatedMember = await databaseService.updateProjectMember(memberId, updateData)

      // 记录审计日志
      await auditService.logPermissionAction(
        updater,
        'role:update',
        'project',
        member.projectId,
        {
          action: 'update_member_role',
          memberId,
          oldRole: member.roleId || member.role,
          newRole: resolvedRoleId,
          participationRatio: participationRatio,
          contributionWeight: contributionWeight,
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
        message: '成员角色更新成功',
        data: updatedMember
      })

    } catch (error) {
      logger.error('Update member role error:', error)
      next(error)
    }
  }

  /**
   * 更新成员工作量占比
   */
  async updateMemberWorkload(req, res, next) {
    try {
      const { memberId } = req.params
      const { estimatedWorkload } = req.body
      const updater = req.user

      // 验证必要字段
      if (estimatedWorkload === undefined || estimatedWorkload === null) {
        return res.status(400).json({
          code: 400,
          message: '缺少工作量占比参数',
          data: null
        })
      }

      // 验证范围：1-100
      if (estimatedWorkload < 1 || estimatedWorkload > 100) {
        return res.status(400).json({
          code: 400,
          message: '工作量占比应在 1% - 100% 之间',
          data: null
        })
      }

      // 获取成员信息
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        return res.status(404).json({
          code: 404,
          message: '成员不存在',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(member.projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查更新人权限：必须是项目经理或有项目管理权限
      const isProjectManager = project.managerId === updater.employeeId || project.manager_id === updater.employeeId
      
      if (!isProjectManager && !PermissionValidator.checkProjectPermission(updater, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限更新此成员的工作量占比',
          data: null
        })
      }

      // 更新工作量占比
      const updateData = {
        estimatedWorkload: estimatedWorkload,
        updatedAt: new Date()
      }

      logger.info(`开始更新成员工作量占比: memberId=${memberId}, estimatedWorkload=${estimatedWorkload}, updateData=`, updateData)

      const updatedMember = await databaseService.updateProjectMember(memberId, updateData)

      logger.info(`成员工作量占比更新结果:`, updatedMember)

      // 记录审计日志
      await auditService.logPermissionAction(
        updater,
        'workload:update',
        'project',
        member.projectId,
        {
          action: 'update_member_workload',
          memberId,
          oldWorkload: member.estimatedWorkload || member.estimated_workload,
          newWorkload: estimatedWorkload
        },
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.id
        }
      )

      res.json({
        code: 200,
        message: '成员工作量占比更新成功',
        data: updatedMember
      })

    } catch (error) {
      logger.error('Update member workload error:', error)
      next(error)
    }
  }

  /**
   * 移除项目成员
   */
  async removeProjectMember(req, res, next) {
    try {
      const { memberId } = req.params
      const { reason } = req.body
      const remover = req.user

      // 获取成员信息
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        return res.status(404).json({
          code: 404,
          message: '成员不存在',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(member.projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查移除人权限
      if (!PermissionValidator.checkProjectPermission(remover, 'manage', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限移除此成员',
          data: null
        })
      }

      // 移除成员
      await databaseService.removeProjectMember(memberId)

      // 记录审计日志
      await auditService.logPermissionAction(
        remover,
        'member:remove',
        'project',
        member.projectId,
        {
          action: 'remove_project_member',
          memberId,
          employeeId: member.employeeId,
          role: member.role,
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
        message: '成员已移除',
        data: null
      })

    } catch (error) {
      logger.error('Remove project member error:', error)
      next(error)
    }
  }

  /**
   * 取消项目申请
   */
  async cancelApplication(req, res, next) {
    try {
      const { memberId } = req.params
      const userId = req.user.id
      
      // 验证参数
      if (!memberId) {
        return res.status(400).json({
          code: 400,
          message: '缺少成员ID',
          data: null
        })
      }
      
      // 获取申请记录
      const application = await databaseService.findOne('projectMembers', { _id: memberId })
      if (!application) {
        return res.status(404).json({
          code: 404,
          message: '申请记录不存在',
          data: null
        })
      }
      
      // 获取对应的员工信息，检查权限：只有申请者本人可以取消自己的申请
      const employee = await databaseService.getEmployeeByUserId(userId)
      if (!employee) {
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }
      
      // 检查是否为申请者本人（比较employeeId）
      if (application.employeeId !== employee._id) {
        // 如果不是申请者本人，检查是否有管理权限
        const user = req.user
        const project = await databaseService.getProjectById(application.projectId)
        if (!PermissionValidator.checkProjectPermission(user, 'manage', project)) {
          return res.status(403).json({
            code: 403,
            message: '您没有权限取消此申请',
            data: null
          })
        }
      }
      
      // 检查申请状态：只能取消待审批状态的申请
      if (application.status !== 'pending') {
        return res.status(400).json({
          code: 400,
          message: '只能取消待审批状态的申请',
          data: null
        })
      }
      
      // 更新申请记录状态为已拒绝（而不是删除）
      const result = await databaseService.update('projectMembers', { _id: memberId }, { status: 'rejected', rejected_at: new Date(), approval_comments: '申请被取消', updated_at: new Date() })
      
      if (result > 0) {
        // 检查是否还有其他成员属于同一个申请
        if (application.applicationId) {
          const remainingMembers = await databaseService.find('projectMembers', {
            applicationId: application.applicationId,
            status: 'pending'  // 只查询待审批的成员
          })
                        
          // 如果没有其他成员了，则更新整个团队申请记录的状态为已拒绝
          if (remainingMembers.length === 0) {
            await databaseService.update('project_team_applications', { _id: application.applicationId }, { status: 'rejected', updated_at: new Date() })

            // 同时更新项目状态回published状态（使用下划线命名以匹配数据库字段）
            await databaseService.update('projects', { _id: application.projectId }, { cooperation_status: 'published', updated_at: new Date() })

            logger.info(`✅ 团队申请全部取消，项目状态已恢复为published: projectId=${application.projectId}`)
          }
        }
        
        // 记录审计日志
        await auditService.logPermissionAction(
          req.user,
          'application:cancel',
          'project',
          application.projectId,
          { action: 'cancel_application', memberId, application },
          { ipAddress: req.ip, userAgent: req.get('User-Agent'), requestId: req.id }
        )
        
        res.json({
          code: 200,
          message: '申请已取消',
          data: { memberId }
        })
      } else {
        res.status(500).json({
          code: 500,
          message: '取消申请失败',
          data: null
        })
      }
    } catch (error) {
      logger.error('Cancel application error:', error)
      next(error)
    }
  }

  /**
   * 获取员工参与的项目列表
   */
  async getEmployeeProjects(req, res, next) {
    try {
      const employeeId = req.user.employeeId || req.query.employeeId
      const { status } = req.query

      // 检查用户权限
      const userPermissions = req.user.Role?.permissions || req.user.permissions || []
      const isAdmin = userPermissions.includes('*') || userPermissions.includes('admin')

      // 如果是管理员且没有员工ID，返回所有项目
      if (isAdmin && !employeeId) {
        console.log('🔐 管理员用户，返回所有项目')
        const allProjects = await projectMemberService.getAllProjects(status)
        return res.json({
          code: 200,
          message: '获取成功',
          data: allProjects
        })
      }

      // 普通用户必须有员工ID
      if (!employeeId) {
        return res.status(400).json({
          code: 400,
          message: '缺少员工ID',
          data: null
        })
      }

      const projects = await projectMemberService.getEmployeeProjects(employeeId, status)

      res.json({
        code: 200,
        message: '获取成功',
        data: projects
      })
    } catch (error) {
      logger.error('Get employee projects error:', error)
      next(error)
    }
  }
}

module.exports = new ProjectMemberController()
