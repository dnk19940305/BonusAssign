﻿const { PermissionValidator } = require('../config/permissions')
const logger = require('../utils/logger')
const databaseService = require('./databaseService')


class ProjectMemberService {
  /**
   * 员工申请加入项目
   */
  async applyToJoinProject(employeeId, projectId, applyReason, expectedRole, participationRatio) {
    try {
      // 检查员工是否存在
      const employee = await databaseService.getEmployeeById(employeeId)
      if (!employee) {
        throw new Error('员工不存在')
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        throw new Error('项目不存在')
      }

      // 检查项目是否可申请（published 或 approved 状态）
      const cooperationStatus = project.cooperationStatus || project.cooperation_status
      if (cooperationStatus !== 'published' && cooperationStatus !== 'approved') {
        throw new Error('该项目当前不接受成员申请，只有已发布或已批准的项目才可申请加入')
      }

      // 检查是否已经申请或已是成员
      const existingMember = await this.getProjectMember(projectId, employeeId)
      if (existingMember) {
        if (existingMember.status === 'pending') {
          throw new Error('您已经申请加入该项目，请等待审批')
        }
        if (['active', 'approved', 'confirmed'].includes(existingMember.status)) {
          throw new Error('您已经是该项目的成员')
        }
      }

      // 创建申请记录
      const memberData = {
        projectId,
        employeeId,
        status: 'pending',
        applyReason,
        contributionWeight: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 添加期望角色和参与比例（如果提供）
      if (expectedRole) {
        // 尝试解析角色：可能是角色ID或角色编码
        try {
          const roleRecord = await databaseService.getProjectRoleById(expectedRole) ||
            await databaseService.getProjectRoleByCode(expectedRole);
          if (roleRecord) {
            memberData.roleId = roleRecord.id || roleRecord._id;
          }
        } catch (roleError) {
          // 如果解析失败，尝试直接存储角色编码
          memberData.role = expectedRole;
        }
      }

      if (participationRatio !== undefined && participationRatio !== null) {
        memberData.participationRatio = participationRatio;
      }

      const member = await databaseService.createProjectMember(memberData)

      // TODO: 发送通知给项目经理

      return member
    } catch (error) {
      logger.error('Apply to join project error:', error)
      throw error
    }
  }

  /**
   * 获取项目成员列表
   */
  async getProjectMembers(projectId, status = null) {
    try {
      // 获取项目信息
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        throw new Error('项目不存在')
      }

      let members = await databaseService.getProjectMembers(projectId)

      if (status) {
        members = members.filter(m => m.status === (status === 'approved' ? 'active' : status))
      }

      // 注：项目经理现在在项目发布时已自动添加到 project_members 表中
      // 不再需要创建虚拟成员记录

      // 获取员工详细信息，包括部门和岗位
      const membersWithDetails = await Promise.all(
        members.map(async (member) => {
          try {
            const employee = await databaseService.getEmployeeById(member.employeeId)

            if (!employee) {
              console.warn(`⚠️ 未找到员工信息: employeeId=${member.employeeId}`)
              return {
                ...member,
                employeeName: '未知员工',
                employeeCode: 'N/A',
                departmentName: '未知部门',
                positionName: '未知岗位',
                expectedRoleName: null,
                employee: null
              }
            }

            // 获取部门信息
            let departmentName = '未知部门'
            if (employee.departmentId) {
              try {
                const department = await databaseService.getDepartmentById(employee.departmentId)
                departmentName = department?.name || department?.departmentName || '未知部门'
              } catch (err) {
                console.warn(`⚠️ 获取部门信息失败: departmentId=${employee.departmentId}`, err.message)
              }
            }

            // 获取岗位信息
            let positionName = '未知岗位'
            let positionLevel = null
            if (employee.positionId) {
              try {
                const position = await databaseService.getPositionById(employee.positionId)
                positionName = position?.name || position?.positionName || '未知岗位'
                // 兼容不同字段命名，优先使用 level
                positionLevel = position?.level || position?.positionLevel || position?.grade || null
              } catch (err) {
                console.warn(`⚠️ 获取岗位信息失败: positionId=${employee.positionId}`, err.message)
              }
            }

            // 获取角色信息：优先通过 roleId/expectedRoleId；无则回退至记录中的 role 名称
            let expectedRoleName = null
            let roleName = null

            // project_members 表中 role 字段可能存储：
            // 1. 角色名称字符串（如 "开发工程师"）
            // 2. 角色ID字符串（如 "4"）
            // 需要智能判断并处理

            let roleResolved = false

            // 优先尝试 roleId 或 expectedRoleId
            if (member.roleId || member.expectedRoleId) {
              try {
                const projectRoleId = member.roleId || member.expectedRoleId
                const projectRole = await databaseService.getProjectRoleById(projectRoleId)
                if (projectRole) {
                  expectedRoleName = projectRole.name || projectRole.roleName || null
                  roleName = projectRole.name || projectRole.roleName || null
                  roleResolved = true
                }
              } catch (err) {
                console.warn(`⚠️ 获取项目角色信息失败: roleId=${member.roleId || member.expectedRoleId}`, err.message)
              }
            }

            // 如果未解析成功，尝试处理 role 字段
            if (!roleResolved && member.role) {
              // 检查 role 是否为纯数字字符串（角色ID）
              const roleStr = String(member.role).trim()
              const isNumericId = /^\d+$/.test(roleStr)

              if (isNumericId) {
                // 是数字ID，查询 project_roles 表
                try {
                  const projectRole = await databaseService.getProjectRoleById(parseInt(roleStr, 10))
                  if (projectRole) {
                    expectedRoleName = projectRole.name || projectRole.roleName || null
                    roleName = projectRole.name || projectRole.roleName || null
                    roleResolved = true
                  }
                } catch (err) {
                  console.warn(`⚠️ 通过角色ID获取角色名称失败: role=${roleStr}`, err.message)
                }
              }

              // 如果不是数字ID或查询失败，直接使用字符串值
              if (!roleResolved) {
                expectedRoleName = member.role
                roleName = member.role
              }
            }

            return {
              ...member,
              employeeName: employee.name || employee.employeeName || '未知员工',
              employeeCode: employee.employeeNo || employee.code || employee.employeeCode || 'N/A',
              departmentName,
              positionName,
              positionLevel,
              expectedRoleName,
              roleName,
              employee: {
                id: employee._id || employee.id,
                name: employee.name || employee.employeeName,
                employeeNo: employee.employeeNo || employee.code,
                departmentId: employee.departmentId,
                positionId: employee.positionId
              }
            }
          } catch (error) {
            console.error(`❌ 处理成员数据失败: memberId=${member._id || member.id}`, error)
            return {
              ...member,
              employeeName: '未知员工',
              employeeCode: 'N/A',
              departmentName: '未知部门',
              positionName: '未知岗位',
              expectedRoleName: null,
              employee: null
            }
          }
        })
      )

      return membersWithDetails
    } catch (error) {
      logger.error('Get project members error:', error)
      throw error
    }
  }

  /**
   * 更新成员角色和权重
   */
  async updateMemberRole(memberId, roleId, contributionWeight, managerId) {
    try {
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        throw new Error('成员不存在')
      }

      // 验证是否是项目经理
      const project = await databaseService.getProjectById(member.projectId)
      if (project.managerId !== managerId) {
        throw new Error('只有项目经理才能更新成员角色')
      }

      const updateData = {
        roleId,
        contributionWeight,
        updatedAt: new Date()
      }

      return await databaseService.updateProjectMember(memberId, updateData)
    } catch (error) {
      logger.error('Update member role error:', error)
      throw error
    }
  }

  /**
   * 移除项目成员
   */
  async removeProjectMember(memberId, managerId, reason) {
    try {
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        throw new Error('成员不存在')
      }

      // 验证是否是项目经理
      const project = await databaseService.getProjectById(member.projectId)
      if (project.managerId !== managerId) {
        throw new Error('只有项目经理才能移除成员')
      }

      const updateData = {
        status: 'removed',
        leaveDate: new Date(),
        rejectReason: reason,
        updatedAt: new Date()
      }

      return await databaseService.updateProjectMember(memberId, updateData)
    } catch (error) {
      logger.error('Remove project member error:', error)
      throw error
    }
  }

  /**
   * 审批申请（简化版本，用于测试）
   */
  async approveApplication(memberId, roleId, participationRatio = 100, remark = '') {
    try {
      const updateData = {
        status: 'active',
        roleId: roleId,
        participationRatio: participationRatio,
        approvedAt: new Date(),
        remark: remark,
        updatedAt: new Date()
      }

      return await databaseService.updateProjectMember(memberId, updateData)
    } catch (error) {
      logger.error('Approve application error:', error)
      throw error
    }
  }

  /**
   * 获取员工参与的项目列表
   */
  async getEmployeeProjects(employeeId, status = null) {
    try {
      // 1. 获取作为成员参与的项目
      let members = await databaseService.getEmployeeProjectMembers(employeeId)

      if (status) {
        const normalized = status === 'approved' ? 'active' : status
        members = members.filter(m => m.status === normalized)
      } else {
        // 默认过滤掉已拒绝/已取消的申请，只显示有效的申请和成员记录
        members = members.filter(m => m.status !== 'rejected')
      }

      // 获取项目详细信息
      const projectsWithDetails = await Promise.all(
        members.map(async (member) => {
          const project = await databaseService.getProjectById(member.projectId)

          // 过滤已删除的项目
          if (!project) {
            return null
          }

          // 解析角色名称：优先通过roleId查询；兼容role字段（可能是角色名称或角色ID）
          let resolvedRoleName = '成员'
          let roleResolved = false

          try {
            // 优先尝试 roleId 或 expectedRoleId
            if (member.roleId || member.expectedRoleId) {
              const projectRoleId = member.roleId || member.expectedRoleId
              const projectRole = await databaseService.getProjectRoleById(projectRoleId)
              if (projectRole) {
                resolvedRoleName = projectRole.name || projectRole.roleName || resolvedRoleName
                roleResolved = true
              }
            }

            // 如果未解析成功，尝试处理 role 字段
            if (!roleResolved && member.role) {
              // 检查 role 是否为纯数字字符串（角色ID）
              const roleStr = String(member.role).trim()
              const isNumericId = /^\d+$/.test(roleStr)

              if (isNumericId) {
                // 是数字ID，查询 project_roles 表
                const projectRole = await databaseService.getProjectRoleById(parseInt(roleStr, 10))
                if (projectRole) {
                  resolvedRoleName = projectRole.name || projectRole.roleName || resolvedRoleName
                  roleResolved = true
                }
              }

              // 如果不是数字ID或查询失败，直接使用字符串值
              if (!roleResolved) {
                resolvedRoleName = member.role
              }
            }
          } catch (e) {
            // 忽略角色解析错误，保持默认或使用 role 字段的值
            if (!roleResolved && member.role && !/^\d+$/.test(String(member.role).trim())) {
              resolvedRoleName = member.role
            }
          }

          return {
            ...member,
            id: member._id || member.id,
            projectId: member.projectId,
            projectName: project.name,
            projectCode: project.code,
            projectStatus: project.status,
            roleName: resolvedRoleName,
            joinDate: member.joinDate || member.createdAt,
            status: member.status || 'active',
            participationRatio: member.participationRatio || member.participation_ratio || 0,
            contributionWeight: member.contributionWeight || member.contribution_weight || 0,
            projectBonus: member.projectBonus || 0,
            project: {
              id: project._id || project.id,
              name: project.name,
              code: project.code,
              status: project.status,
              startDate: project.startDate,
              endDate: project.endDate,
              managerId: project.managerId,
              budget: project.budget || 0,
              profitTarget: project.profitTarget || project.profit_target || 0
            }
          }
        })
      )

      // 过滤掉null值（已删除的项目）
      const validProjects = projectsWithDetails.filter(p => p !== null)

      // 2. 获取作为项目经理管理的项目
      let managedProjects = await databaseService.getProjectsByManager(employeeId)

      // 如果指定了状态过滤，也要过滤管理的项目
      if (status && managedProjects.length > 0) {
        managedProjects = managedProjects.filter(p => p.status === status)
      }

      // 将管理的项目转换为相同格式
      const managedProjectsDetails = managedProjects.map(project => ({
        id: `managed_${project._id || project.id}`, // 使用特殊前缀避免与成员记录ID冲突
        projectId: project._id || project.id,
        projectName: project.name,
        projectCode: project.code,
        projectStatus: project.status || 'unknown',
        roleName: '项目经理',
        joinDate: project.startDate || project.createdAt,
        status: 'active',
        participationRatio: 100, // 项目经理默认参与度100%
        projectBonus: 0,
        project: {
          id: project._id || project.id,
          name: project.name,
          code: project.code,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          managerId: project.managerId
        }
      }))

      // 3. 合并两个列表，去重（如果员工既是成员又是经理，优先显示成员记录）
      const allProjects = [...validProjects]
      const existingProjectIds = new Set(validProjects.map(p => p.projectId))

      managedProjectsDetails.forEach(managedProject => {
        if (!existingProjectIds.has(managedProject.projectId)) {
          allProjects.push(managedProject)
        }
      })

      return allProjects
    } catch (error) {
      logger.error('Get employee projects error:', error)
      throw error
    }
  }

  /**
   * 获取所有项目（管理员用）
   */
  async getAllProjects(status = null) {
    try {
      // 获取所有项目
      const projects = await databaseService.getProjects()

      // 如果指定了状态，过滤项目
      let filteredProjects = projects
      if (status) {
        filteredProjects = projects.filter(p => p.status === status)
      }

      // 为每个项目获取成员信息
      const projectsWithMembers = await Promise.all(
        filteredProjects.map(async (project) => {
          const members = await databaseService.getProjectMembers(project._id)

          return {
            id: project._id,
            projectName: project.name,
            projectCode: project.code,
            projectStatus: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            managerId: project.managerId,
            memberCount: members.length,
            status: 'active', // 管理员查看时默认为参与中状态（兼容approved别名）
            roleName: '管理员',
            participationRatio: 100, // 默认100%参与度
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
          }
        })
      )

      return projectsWithMembers
    } catch (error) {
      logger.error('Get all projects error:', error)
      throw error
    }
  }

  /**
   * 获取待审批的申请列表（项目经理用）
   */
  async getPendingApplications(managerId) {
    try {
      // 获取项目经理管理的所有项目
      const projects = await databaseService.getProjectsByManager(managerId)
      const projectIds = projects.map(p => p._id)

      // 获取这些项目的待审批申请
      let pendingMembers = []
      for (const projectId of projectIds) {
        const members = await this.getProjectMembers(projectId, 'pending')
        pendingMembers = pendingMembers.concat(members.map(m => ({
          ...m,
          projectName: projects.find(p => p._id === projectId)?.name
        })))
      }

      return pendingMembers
    } catch (error) {
      logger.error('Get pending applications error:', error)
      throw error
    }
  }

  /**
   * 获取所有待审批的申请列表（管理员用）
   */
  async getAllPendingApplications() {
    try {
      // 获取所有项目的待审批申请 - 使用正确的方法名
      const allProjects = await databaseService.getProjects()
      let allPendingMembers = []

      for (const project of allProjects) {
        const members = await this.getProjectMembers(project._id, 'pending')
        allPendingMembers = allPendingMembers.concat(members.map(m => ({
          ...m,
          projectName: project.name,
          projectCode: project.code
        })))
      }

      return allPendingMembers
    } catch (error) {
      logger.error('Get all pending applications error:', error)
      throw error
    }
  }

  /**
   * 根据项目ID列表获取待审批申请
   * @param {Array} projectIds - 项目ID列表
   * @returns {Array} 待审批申请列表
   */
  async getPendingApplicationsByProjects(projectIds) {
    try {
      let allPendingMembers = []

      for (const projectId of projectIds) {
        const members = await this.getProjectMembers(projectId, 'pending')
        const project = await databaseService.getProjectById(projectId)

        allPendingMembers = allPendingMembers.concat(members.map(m => ({
          ...m,
          projectName: project?.name || '未知项目',
          projectCode: project?.code || 'N/A'
        })))
      }

      return allPendingMembers
    } catch (error) {
      logger.error('Get pending applications by projects error:', error)
      throw error
    }
  }

  /**
   * 审批成员申请
   * @param {string} memberId - 成员ID
   * @param {string} approverId - 审批人ID
   * @param {boolean} approved - 是否批准
   * @param {string} comments - 审批意见
   * @param {string} role - 分配的角色
   * @param {Date} startDate - 开始日期
   * @param {number} participationRatio - 参与度（百分比，0-100）
   * @returns {Object} 审批结果
   */
  async approveMemberApplication(memberId, approverId, approved, comments, role, startDate, participationRatio) {
    try {
      // 获取成员申请信息
      const member = await databaseService.getProjectMemberById(memberId)
      if (!member) {
        throw new Error('成员申请不存在')
      }

      // 准备更新数据
      const updateData = {
        status: approved ? 'active' : 'rejected',
        approvedBy: approverId,
        approvedAt: new Date(),
        approvalComments: comments,
        updatedAt: new Date()
      }

      // 定义 assignedRoleId 变量，避免作用域问题
      let assignedRoleId = null

      // 如果批准，设置角色ID、加入日期和参与度
      if (approved) {
        try {
          if (role) {
            // role 可能是：项目角色ID（数字或字符串）或角色名称字符串
            const roleStr = String(role).trim()
            const isNumericId = /^\d+$/.test(roleStr)

            if (isNumericId) {
              // 是数字ID，先验证该角色ID是否真实存在
              const roleRecord = await databaseService.getProjectRoleById(parseInt(roleStr, 10))
              if (roleRecord) {
                // 角色存在，使用该ID
                assignedRoleId = parseInt(roleStr, 10)
              } else {
                logger.warn(`角色ID不存在: ${parseInt(roleStr, 10)}，将使用默认角色`)
                // 如果角色不存在，则不设置角色ID，后续会使用默认角色
              }
            } else {
              // 不是数字，尝试作为角色名称查询 project_roles 表
              // 由于databaseService不直接支持复杂的OR查询，我们分别查询再合并结果
              const rolesByName = await databaseService.find('project_roles', { name: roleStr })
              const rolesByCode = await databaseService.find('project_roles', { code: roleStr })

              // 合并结果并去重
              const allRoles = [...rolesByName, ...rolesByCode]
              const uniqueRolesMap = new Map()
              allRoles.forEach(role => {
                if (!uniqueRolesMap.has(role.id || role._id)) {
                  uniqueRolesMap.set(role.id || role._id, role)
                }
              })
              const projectRoles = Array.from(uniqueRolesMap.values())

              if (projectRoles && projectRoles.length > 0) {
                const projectRole = projectRoles[0]
                assignedRoleId = projectRole.id || projectRole._id
              }
            }
          }
        } catch (e) {
          logger.warn(`解析角色失败: ${role}`, e.message)
        }

        // 设置 role_id 字段（存储项目角色ID）
        if (assignedRoleId) {
          updateData.roleId = assignedRoleId
        }

        updateData.joinDate = startDate || new Date()

        // 设置参与度（如果提供，否则默认为100%）
        const finalRatio = (participationRatio !== undefined && participationRatio !== null) ? participationRatio : 100
        updateData.participationRatio = finalRatio

        // 确保 contributionWeight 字段也被设置，以保持数据一致性
        updateData.contributionWeight = finalRatio
      }

      // 更新申请状态
      const updatedMember = await databaseService.updateProjectMember(memberId, updateData)

      // 检查项目是否需要设置经理
      try {
        const project = await databaseService.getProjectById(member.projectId)

        // 检查是否是项目经理角色
        let isProjectManagerRole = false
        let roleRecord = null

        // 直接使用传入的role参数查询角色信息
        const roleStr = String(role).trim()
        const isNumericId = /^\d+$/.test(roleStr)

        if (isNumericId) {
          // 如果是数字ID,直接查询
          roleRecord = await databaseService.findOne('project_roles', { id: parseInt(roleStr, 10) })
        } else {
          // 如果是角色名称或代码,查询
          const rolesByName = await databaseService.find('project_roles', { name: roleStr })
          const rolesByCode = await databaseService.find('project_roles', { code: roleStr })
          roleRecord = rolesByName[0] || rolesByCode[0]
        }

        // 检查是否是项目经理角色
        if (roleRecord && (
          roleRecord.name === '项目经理' ||
          roleRecord.code === 'PM' ||
          roleRecord.code === 'project_manager'
        )) {
          isProjectManagerRole = true
        }

        // 如果是项目经理角色,设置为项目的manager_id（不管之前是否有经理）
        if (isProjectManagerRole) {
          await databaseService.updateProject(member.projectId, {
            manager_id: member.employeeId,
            updated_at: new Date()
          })
          logger.info('✅ 已将批准的项目经理成员设置为项目经理', {
            projectId: member.projectId,
            employeeId: member.employeeId,
            memberId,
            roleName: roleRecord.name
          })
        }
      } catch (err) {
        logger.warn('检查/设置项目经理失败,但成员审批已完成:', err.message)
      }

      // 检查是否需要更新团队申请状态
      try {
        if (member.applicationId || member.application_id) {
          const applicationId = member.applicationId || member.application_id

          // 获取该团队申请的所有成员
          const allMembers = await databaseService.find('project_members', {
            application_id: applicationId
          })

          // 检查是否所有成员都已批准
          const allApproved = allMembers.every(m => m.status === 'active')

          if (allApproved && allMembers.length > 0) {
            // 更新团队申请状态为 approved
            await databaseService.update('project_team_applications', applicationId, {
              status: 'approved',
              approved_by: approverId,
              approved_at: new Date(),
              approval_comments: '所有成员已通过批量审批',
              updated_at: new Date()
            })

            // 更新项目协作状态为 approved
            await databaseService.updateProject(member.projectId, {
              cooperation_status: 'approved',
              updated_at: new Date()
            })

            logger.info('✅ 团队申请所有成员已批准,已更新申请和项目状态', {
              applicationId,
              projectId: member.projectId,
              totalMembers: allMembers.length
            })
          }
        }
      } catch (err) {
        logger.warn('检查/更新团队申请状态失败,但成员审批已完成:', err.message)
      }

      if (approved) {
        logger.info('成员申请已批准', {
          memberId,
          projectId: member.projectId,
          employeeId: member.employeeId,
          roleId: assignedRoleId || member.roleId || null,
          participationRatio: participationRatio || 100 // 默认100%参与度
        })
      } else {
        logger.info('成员申请已拒绝', {
          memberId,
          projectId: member.projectId,
          employeeId: member.employeeId,
          comments
        })
      }

      return updatedMember
    } catch (error) {
      logger.error('审批成员申请失败:', error)
      throw error
    }
  }

  /**
   * 批量审批申请
   * @param {Array} memberApprovals - 成员审批信息列表，每个元素包含 {memberId, roleId, participationRatio}
   * @param {string} approverId - 审批人ID
   * @param {boolean} approved - 是否批准
   * @param {string} comments - 审批意见
   * @param {Date} startDate - 开始日期
   * @returns {Object} 处理结果
   */
  async batchApproveApplications(memberApprovals, approverId, approved, comments, startDate) {
    try {
      const results = []
      const errors = []

      for (const item of memberApprovals) {
        try {
          const { memberId, roleId, participationRatio } = item;
          const result = await this.approveMemberApplication(
            memberId,
            approverId,
            approved,
            comments,
            roleId, // 使用每个成员特定的角色ID
            startDate,
            participationRatio // 使用每个成员特定的参与度
          )
          results.push(result)
        } catch (error) {
          errors.push({
            memberId: item.memberId,
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
      logger.error('批量审批申请失败:', error)
      throw error
    }
  }

  /**
   * 检查用户项目权限
   * @param {Object} user - 用户对象
   * @param {string} projectId - 项目ID
   * @param {string} action - 操作类型
   * @returns {boolean} 是否有权限
   */
  async checkUserProjectPermission(user, projectId, action) {
    try {
      // 检查基础权限
      if (!PermissionValidator.canAccessResource(user, 'project', action)) {
        return false
      }

      // 如果有项目ID，检查项目级权限
      if (projectId) {
        const project = await databaseService.getProjectById(projectId)
        if (!project) {
          return false
        }

        return PermissionValidator.checkProjectPermission(user, action, project)
      }

      return true
    } catch (error) {
      logger.error('检查用户项目权限失败:', error)
      return false
    }
  }

  /**
   * 获取用户可管理的项目
   * @param {Object} user - 用户对象
   * @returns {Array} 可管理的项目列表
   */
  async getUserManagedProjects(user) {
    try {
      const projects = await databaseService.getProjects()

      // 过滤用户可管理的项目
      return projects.filter(project =>
        PermissionValidator.checkProjectPermission(user, 'manage', project)
      )
    } catch (error) {
      logger.error('获取用户可管理项目失败:', error)
      return []
    }
  }

  /**
   * 获取项目成员（内部方法）
   */
  async getProjectMember(projectId, employeeId) {
    try {
      const members = await databaseService.getProjectMembers(projectId)
      return members.find(m => m.employeeId === employeeId)
    } catch (error) {
      logger.error('Get project member error:', error)
      throw error
    }
  }
}

module.exports = new ProjectMemberService()
