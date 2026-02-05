const databaseService = require('./databaseService')
const logger = require('../utils/logger')

/**
 * 项目服务
 * 处理项目、项目成员、项目权重相关的业务逻辑
 */
class ProjectService {
  /**
   * 获取所有项目
   */
  async getProjects(query = {}) {
    return await databaseService.find('projects', query)
  }

  /**
   * 根据ID查找项目
   */
  async getProjectById(id) {
    const result = await databaseService.manager.findByPk('projects', id)
    return databaseService._addNedbId(result)
  }

  /**
   * 创建项目
   */
  async createProject(data) {
    const projectData = {
      ...data,
      status: data.status || 'planning',
      created_at: new Date(),
      updated_at: new Date()
    }

    const project = await databaseService.manager.create('projects', projectData)

    const actualManagerId = data.managerId || data.manager_id
    if (actualManagerId) {
      try {
        let managerRoleId = null
        try {
          const userService = require('./userService')
          const managerRole = await userService.getProjectRoleByName('项目经理')
          managerRoleId = managerRole?.id || managerRole?._id || null
        } catch (e) {
          console.warn('⚠️  获取项目经理角色失败:', e.message)
        }

        const memberData = {
          projectId: project.id,
          employeeId: actualManagerId,
          roleId: managerRoleId,
          contributionWeight: 100,
          participationRatio: 100,
          status: 'active',
          joinDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await this.createProjectMember(memberData)
        console.log(`✅ 项目经理已自动加入项目成员: projectId=${project.id}, managerId=${actualManagerId}`)
      } catch (error) {
        console.error('❌ 添加项目经理为项目成员失败:', error)
      }
    }

    return project
  }

  /**
   * 更新项目
   */
  async updateProject(id, data) {
    const currentProject = await this.getProjectById(id)
    const result = await databaseService.manager.update('projects', id, data)

    const newManagerId = data.managerId || data.manager_id
    const currentManagerId = currentProject.managerId || currentProject.manager_id

    if (newManagerId && currentProject) {
      try {
        let managerRoleId = null
        try {
          const userService = require('./userService')
          const managerRole = await userService.getProjectRoleByName('项目经理')
          managerRoleId = managerRole?.id || managerRole?._id || null
        } catch (e) {
          console.warn('⚠️  获取项目经理角色失败:', e.message)
        }

        if (currentManagerId && currentManagerId !== newManagerId) {
          console.log(`📝 项目经理发生变化: ${currentManagerId} -> ${newManagerId}`)

          const existingMembers = await databaseService.find('projectMembers', {
            projectId: id,
            employeeId: currentManagerId
          })

          for (const member of existingMembers) {
            await this.deleteProjectMember(member._id)
            console.log(`✅ 已删除旧项目经理成员记录: employeeId=${currentManagerId}, recordId=${member._id}`)
          }
        }

        const newManagerInMembers = await databaseService.findOne('projectMembers', {
          projectId: id,
          employeeId: newManagerId,
          status: 'active'
        })

        if (!newManagerInMembers) {
          const memberData = {
            projectId: id,
            employeeId: newManagerId,
            roleId: managerRoleId,
            contributionWeight: 1.0,
            participationRatio: 100,
            status: 'active',
            joinDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }

          await this.createProjectMember(memberData)
          console.log(`✅ 项目经理已添加到成员列表: projectId=${id}, managerId=${newManagerId}`)
        } else {
          console.log(`ℹ️  项目经理已在成员列表中: projectId=${id}, managerId=${newManagerId}`)
        }
      } catch (error) {
        console.error('❌ 更新项目经理成员记录失败:', error)
      }
    }

    return result
  }

  /**
   * 删除项目（硬删除）
   */
  async deleteProject(id) {
    return await databaseService.manager.destroy('projects', id)
  }

  /**
   * 获取项目经理管理的项目列表
   */
  async getProjectsByManager(managerId) {
    return await databaseService.find('projects', { managerId })
  }

  /**
   * 获取项目权重配置
   */
  async getProjectWeights(projectId) {
    const result = await databaseService.manager.findAll('project_line_weights', {
      where: { project_id: projectId }
    })
    return result.rows || result
  }

  /**
   * 更新项目权重配置
   */
  async updateProjectWeights(projectId, weights) {
    const connection = await databaseService.manager.beginTransaction()

    try {
      await databaseService.manager.query(
        'DELETE FROM project_line_weights WHERE project_id = ?',
        [projectId]
      )

      for (const weight of weights) {
        const weightData = {
          project_id: projectId,
          business_line_id: weight.businessLineId || weight.business_line_id,
          weight: weight.weight,
          reason: weight.reason,
          created_at: new Date(),
          updated_at: new Date()
        }
        await databaseService.manager.create('project_line_weights', weightData)
      }

      await databaseService.manager.commitTransaction(connection)
      return weights

    } catch (error) {
      await databaseService.manager.rollbackTransaction(connection)
      throw error
    }
  }

  /**
   * 获取项目成员
   */
  async getProjectMembers(projectId) {
    return await databaseService.find('projectMembers', { projectId })
  }

  /**
   * 根据ID获取项目成员
   */
  async getProjectMemberById(id) {
    return await databaseService.findOne('projectMembers', { _id: id })
  }

  /**
   * 获取员工参与的项目成员记录
   */
  async getEmployeeProjectMembers(employeeId) {
    return await databaseService.find('projectMembers', { employeeId })
  }

  /**
   * 创建项目成员
   */
  async createProjectMember(data) {
    const { mysqlTable, fieldNameMap } = databaseService._mapTableAndFields('projectMembers', {})

    const memberData = {}
    for (const [key, value] of Object.entries(data)) {
      const mysqlKey = fieldNameMap[key] || key
      memberData[mysqlKey] = value
    }

    memberData.created_at = new Date()
    memberData.updated_at = new Date()

    const result = await databaseService.manager.create(mysqlTable, memberData)
    return databaseService._convertFieldsToNedb(result, fieldNameMap)
  }

  /**
   * 更新项目成员
   */
  async updateProjectMember(id, data) {
    const { mysqlTable, fieldNameMap } = databaseService._mapTableAndFields('projectMembers', {})

    const updateData = {}
    for (const [key, value] of Object.entries(data)) {
      const mysqlKey = fieldNameMap[key] || key
      updateData[mysqlKey] = value
    }

    const allowedKeys = new Set([
      'id', 'project_id', 'employee_id', 'role', 'role_id', 'status',
      'join_date', 'leave_date', 'created_at', 'updated_at',
      'apply_reason', 'applied_at', 'approved_at', 'rejected_at',
      'remark', 'participation_ratio', 'contribution_weight',
      'approved_by', 'approval_comments'
    ])

    const originalKeys = Object.keys(updateData)
    const filteredUpdateData = {}
    for (const k of originalKeys) {
      if (allowedKeys.has(k)) {
        filteredUpdateData[k] = updateData[k]
      }
    }

    try {
      const dropped = originalKeys.filter(k => !allowedKeys.has(k))
      if (dropped.length > 0) {
        logger.warn(`过滤未知字段以避免SQL错误: ${dropped.join(', ')}`)
      }
    } catch (e) {
      // 忽略日志错误
    }

    const result = await databaseService.manager.update(mysqlTable, id, filteredUpdateData)
    return databaseService._convertFieldsToNedb(result, fieldNameMap)
  }

  /**
   * 删除项目成员
   */
  async deleteProjectMember(id) {
    return await databaseService.manager.destroy('project_members', id)
  }
}

module.exports = new ProjectService()
