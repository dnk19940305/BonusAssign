const { databaseManager } = require('../config/database')
const logger = require('../utils/logger')
const BaseDatabaseAdapter = require('../adapters/BaseDatabaseAdapter')

/**
 * 数据库服务适配器 - 优化版本
 * 提供统一的数据库操作接口（仅MySQL）
 */
class DatabaseService extends BaseDatabaseAdapter {
  constructor() {
    super(databaseManager)
  }

  /**
   * 初始化数据库服务 (MySQL)
   */
  async initialize() {
    try {
      console.log(`🔧 初始化MySQL数据库服务...`)
      this.manager = databaseManager

      if (typeof this.manager.initialize === 'function') {
        await this.manager.initialize()
      }

      this.isInitialized = true
    } catch (error) {
      logger.error(`❌ MySQL数据库服务初始化失败:`, error)
      throw error
    }
  }

  /**
   * 获取数据库类型
   */
  getDbType() {
    return 'mysql'
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    if (this.manager && typeof this.manager.close === 'function') {
      await this.manager.close()
    }
    this.isInitialized = false
    logger.info(`MySQL数据库服务已关闭`)
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      this.checkInitialized()

      if (typeof this.manager.testConnection === 'function') {
        await this.manager.testConnection()
      } else {
        await this.manager.findAll('users', { limit: 1 })
      }

      return {
        status: 'healthy',
        type: 'mysql',
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        status: 'unhealthy',
        type: 'mysql',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats() {
    this.checkInitialized()

    if (typeof this.manager.getDatabaseStats === 'function') {
      return await this.manager.getDatabaseStats()
    } else {
      const tables = ['users', 'roles', 'departments', 'positions', 'employees', 'businessLines', 'projects']
      const stats = {}

      for (const table of tables) {
        try {
          const result = await this.manager.findAll(table)
          stats[table] = result.count || result.rows?.length || 0
        } catch (error) {
          stats[table] = 0
        }
      }

      return stats
    }
  }

  /**
   * 批量操作方法
   */
  async deleteMany(collection, query) {
    return await this.remove(collection, query, { multi: true })
  }

  async createMany(table, dataArray) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields(table, {})

    if (!Array.isArray(dataArray)) {
      dataArray = [dataArray]
    }

    const mysqlData = dataArray.map(item => this._convertToMysqlFields(item, fieldNameMap))
    return await this.manager.bulkCreate(mysqlTable, mysqlData)
  }

  async updateMany(table, query, data) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields(table, {})
    const mysqlQuery = this._convertToMysqlFields(query, fieldNameMap)
    const mysqlData = this._convertToMysqlFields(data, fieldNameMap)

    // 使用MySQL管理器的updateMany方法进行批量更新
    const result = await this.manager.updateMany(mysqlTable, { where: mysqlQuery }, mysqlData)
    
    // 返回受影响的记录数量
    return Array.isArray(result) ? result[0] : result
  }

  async bulkCreate(table, dataArray) {
    this.checkInitialized()
    return await this.manager.bulkCreate(table, dataArray)
  }

  async findByPk(table, id, options = {}) {
    this.checkInitialized()
    return await this.manager.findByPk(table, id, options)
  }

  async destroy(table, id) {
    this.checkInitialized()
    return await this.manager.destroy(table, id)
  }

  // ===================
  // 用户相关方法
  // ===================

  async getUserByUsername(username) {
    this.checkInitialized()
    if (typeof this.manager.getUserByUsername === 'function') {
      return await this.manager.getUserByUsername(username)
    } else {
      return await this.manager.findOne('users', { where: { username } })
    }
  }

  async getUserById(id) {
    this.checkInitialized()
    if (typeof this.manager.getUserById === 'function') {
      return await this.manager.getUserById(id)
    } else {
      return await this.manager.findByPk('users', id)
    }
  }

  async findUserById(id) {
    return await this.getUserById(id)
  }

  async findUserByUsernameOrEmail(username, email) {
    this.checkInitialized()
    if (typeof this.manager.findUserByUsernameOrEmail === 'function') {
      return await this.manager.findUserByUsernameOrEmail(username, email)
    } else {
      const conditions = [{ username }]
      if (email) conditions.push({ email })
      return await this.find('users', { $or: conditions })
    }
  }

  async createUser(userData) {
    this.checkInitialized()
    const data = {
      ...userData,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    if (typeof this.manager.createUser === 'function') {
      return await this.manager.createUser(data)
    } else {
      return await this.manager.create('users', data)
    }
  }

  async updateUser(id, data) {
    this.checkInitialized()
    return await this.manager.update('users', id, data)
  }

  async updateLastLogin(userId) {
    this.checkInitialized()
    if (typeof this.manager.updateLastLogin === 'function') {
      return await this.manager.updateLastLogin(userId)
    } else {
      return await this.manager.update('users', userId, { lastLogin: new Date() })
    }
  }

  async updatePassword(userId, hashedPassword) {
    this.checkInitialized()
    if (typeof this.manager.updatePassword === 'function') {
      return await this.manager.updatePassword(userId, hashedPassword)
    } else {
      return await this.manager.update('users', userId, { password: hashedPassword })
    }
  }

  // ===================
  // 角色相关方法
  // ===================

  async getRoleById(id) {
    this.checkInitialized()
    if (typeof this.manager.getRoleById === 'function') {
      return await this.manager.getRoleById(id)
    } else {
      return await this.manager.findByPk('roles', id)
    }
  }

  async getRoleByName(name) {
    this.checkInitialized()
    return await this.manager.findOne('roles', { where: { name } })
  }

  // ===================
  // 项目相关方法
  // ===================

  async getProjects() {
    this.checkInitialized()
    const result = await this.manager.findAll('projects', {
      where: { status: { $ne: 'deleted' } },
      order: [['created_at', 'DESC']]
    })
    return this._addNedbId(result.rows || result)
  }

  async getProjectById(id) {
    this.checkInitialized()
    const result = await this.manager.findByPk('projects', id)
    return this._addNedbId(result)
  }

  async createProject(data) {
    this.checkInitialized()
    const projectData = {
      ...data,
      status: data.status || 'planning',
      created_at: new Date(),
      updated_at: new Date()
    }

    const project = await this.manager.create('projects', projectData)

    // 自动添加项目经理为项目成员
    const actualManagerId = data.managerId || data.manager_id
    if (actualManagerId) {
      try {
        const managerRole = await this.getProjectRoleByName('项目经理')
        const managerRoleId = managerRole?.id || null

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
        console.error('❌ 添加项目经理为项目成员失败:', error.message)
      }
    }

    return project
  }

  async updateProject(id, data) {
    this.checkInitialized()
    const currentProject = await this.getProjectById(id)
    const result = await this.manager.update('projects', id, data)

    // 处理项目经理变更
    const newManagerId = data.managerId || data.manager_id
    const currentManagerId = currentProject.managerId || currentProject.manager_id

    if (newManagerId && currentProject && newManagerId !== currentManagerId) {
      this._handleManagerChange(id, currentManagerId, newManagerId)
    }

    return result
  }

  async _handleManagerChange(projectId, oldManagerId, newManagerId) {
    try {
      const managerRole = await this.getProjectRoleByName('项目经理')
      const managerRoleId = managerRole?.id || null

      // 删除旧项目经理成员记录
      if (oldManagerId) {
        const existingMembers = await this.find('projectMembers', {
          projectId,
          employeeId: oldManagerId
        })
        for (const member of existingMembers) {
          await this.deleteProjectMember(member._id)
        }
      }

      // 添加新项目经理
      const newManagerInMembers = await this.findOne('projectMembers', {
        projectId,
        employeeId: newManagerId,
        status: 'active'
      })

      if (!newManagerInMembers) {
        const memberData = {
          projectId,
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
      }
    } catch (error) {
      console.error('❌ 更新项目经理成员记录失败:', error.message)
    }
  }

  async deleteProject(id) {
    this.checkInitialized()
    return await this.manager.destroy('projects', id)
  }

  // ===================
  // 业务线相关方法
  // ===================

  async getBusinessLines(query = {}) {
    return this._getEntityList('businessLines', [['name', 'ASC']], query)
  }

  async getBusinessLineById(id) {
    return this._getEntityById('businessLines', id)
  }

  async createBusinessLine(data) {
    return this._createEntity('businessLines', data)
  }

  async updateBusinessLine(id, data) {
    this.checkInitialized()
    return await this.manager.update('business_lines', id, data)
  }

  async deleteBusinessLine(id) {
    this.checkInitialized()
    return await this.manager.destroy('business_lines', id)
  }

  // ===================
  // 部门相关方法
  // ===================

  async getDepartments() {
    return this._getEntityList('departments', [['sort', 'ASC'], ['name', 'ASC']], { status: 1 })
  }

  async getDepartmentById(id) {
    return this._getEntityById('departments', id)
  }

  async getDepartmentsByBusinessLine(businessLineId) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields('departments', {})
    const result = await this.manager.findAll('departments', {
      where: { line_id: businessLineId, status: 1 },
      order: [['sort', 'ASC'], ['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => this._addNedbId(this._convertFieldsToNedb(row, fieldNameMap)))
  }

  async createDepartment(data) {
    return this._createEntity('departments', data)
  }

  async updateDepartment(id, data) {
    this.checkInitialized()
    return await this.manager.update('departments', id, data)
  }

  async deleteDepartment(id) {
    this.checkInitialized()
    return await this.manager.update('departments', id, { status: 0 })
  }

  // ===================
  // 岗位相关方法
  // ===================

  async getPositions() {
    return this._getEntityList('positions', [['name', 'ASC']])
  }

  async getPositionById(id) {
    return this._getEntityById('positions', id)
  }

  async getPositionsByBusinessLine(businessLineId) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields('positions', {})
    const result = await this.manager.findAll('positions', {
      where: { line_id: businessLineId, status: 1 },
      order: [['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => this._addNedbId(this._convertFieldsToNedb(row, fieldNameMap)))
  }

  async createPosition(data) {
    return this._createEntity('positions', data)
  }

  async updatePosition(id, data) {
    this.checkInitialized()
    return await this.manager.update('positions', id, data)
  }

  async deletePosition(id) {
    this.checkInitialized()
    return await this.manager.update('positions', id, { status: 0 })
  }

  // ===================
  // 员工相关方法
  // ===================

  async getEmployees() {
    return this._getEntityList('employees', [['name', 'ASC']], {})
  }

  async getEmployeeById(id) {
    return this._getEntityById('employees', id)
  }

  async getEmployeeByUserId(userId) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields('employees', {})
    const result = await this.manager.findOne('employees', {
      where: { user_id: userId }
    })
    return result ? this._addNedbId(this._convertFieldsToNedb(result, fieldNameMap)) : null
  }

  async createEmployee(data) {
    return this._createEntity('employees', data)
  }

  async updateEmployee(id, data) {
    this.checkInitialized()
    return await this.manager.update('employees', id, data)
  }

  async deleteEmployee(id) {
    this.checkInitialized()
    return await this.manager.destroy('employees', id)
  }

  // ===================
  // 通用辅助方法
  // ===================

  async _getEntityList(entityType, order, whereCondition = {}) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields(entityType, {})
    const result = await this.manager.findAll(fieldNameMap[entityType] || entityType, {
      where: whereCondition,
      order
    })
    const rows = result.rows || result
    return rows.map(row => this._addNedbId(this._convertFieldsToNedb(row, fieldNameMap)))
  }

  async _getEntityById(entityType, id) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields(entityType, {})
    const result = await this.manager.findByPk(fieldNameMap[entityType] || entityType, id)
    return result ? this._addNedbId(this._convertFieldsToNedb(result, fieldNameMap)) : null
  }

  async _createEntity(entityType, data) {
    this.checkInitialized()
    const { fieldNameMap } = this._mapTableAndFields(entityType, {})
    const entityData = {
      ...data,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await this.manager.create(fieldNameMap[entityType] || entityType, entityData)
  }

  // ===================
  // 项目角色相关方法
  // ===================

  async getProjectRoleById(id) {
    this.checkInitialized()
    if (!id) return null
    // 支持数字和字符串类型的 ID
    return await this.manager.findByPk('project_roles', id)
  }

  async getProjectRoleByCode(code) {
    this.checkInitialized()
    if (!code) return null
    return await this.manager.findOne('project_roles', { where: { code } })
  }

  async getProjectRoleByName(name) {
    this.checkInitialized()
    if (!name) return null
    return await this.manager.findOne('project_roles', { where: { name } })
  }

  // ===================
  // 项目成员相关方法
  // ===================

  async getProjectMembers(projectId) {
    this.checkInitialized()
    return await this.find('projectMembers', { projectId })
  }

  async getProjectMemberById(id) {
    this.checkInitialized()
    return await this.findOne('projectMembers', { _id: id })
  }

  async getEmployeeProjectMembers(employeeId) {
    this.checkInitialized()
    return await this.find('projectMembers', { employeeId })
  }

  async getProjectsByManager(managerId) {
    this.checkInitialized()
    return await this.find('projects', { managerId })
  }

  async createProjectMember(data) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields('projectMembers', {})
    const memberData = this._convertToMysqlFields(data, fieldNameMap)
    memberData.created_at = new Date()
    memberData.updated_at = new Date()

    const result = await this.manager.create(mysqlTable, memberData)
    return this._convertFieldsToNedb(result, fieldNameMap)
  }

  async updateProjectMember(id, data) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields('projectMembers', {})
    const updateData = this._convertToMysqlFields(data, fieldNameMap)

    // 字段白名单
    const allowedKeys = new Set([
      'id', 'project_id', 'employee_id', 'role', 'role_id', 'status',
      'join_date', 'leave_date', 'created_at', 'updated_at',
      'apply_reason', 'applied_at', 'approved_at', 'rejected_at',
      'remark', 'participation_ratio', 'contribution_weight',
      'approved_by', 'approval_comments', 'estimated_workload'
    ])

    const filteredUpdateData = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedKeys.has(key)) {
        filteredUpdateData[key] = value
      }
    }

    const result = await this.manager.update(mysqlTable, id, filteredUpdateData)
    return this._convertFieldsToNedb(result, fieldNameMap)
  }

  async deleteProjectMember(id) {
    this.checkInitialized()
    return await this.manager.destroy('project_members', id)
  }

  // ===================
  // 项目成本相关方法
  // ===================

  async createProjectCost(costData) {
    this.checkInitialized()
    const data = {
      ...costData,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await this.insert('projectCosts', data)
  }

  async getProjectCosts(query = {}) {
    this.checkInitialized()
    return await this.find('projectCosts', query)
  }

  async updateProjectCost(costId, updateData) {
    this.checkInitialized()
    const data = {
      ...updateData,
      updated_at: new Date()
    }
    return await this.manager.update('project_costs', costId, data)
  }

  async deleteProjectCost(costId) {
    this.checkInitialized()
    return await this.manager.destroy('project_costs', costId)
  }

  async getProjectCostSummary(projectId) {
    this.checkInitialized()
    const project = await this.findOne('projects', { _id: projectId })
    if (!project) {
      return this._getEmptyCostSummary(projectId)
    }

    const costs = await this.find('projectCosts', { projectId })
    const totalCost = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    const costByType = this._calculateCostByType(costs)
    const totalBudget = parseFloat(project.budget) || 0
    const expectedProfit = totalBudget - totalCost
    const allocatedProjectBonus = await this._getAllocatedProjectBonus(projectId)
    const availableProfit = expectedProfit - allocatedProjectBonus
    const profitTarget = parseFloat(project.profitTarget || project.profit_target) || 0
    const estimatedBonus = profitTarget > 0 ? profitTarget * 0.1 : 0

    return {
      projectId,
      totalBudget,
      totalCost,
      expectedProfit,
      allocatedProjectBonus,
      availableProfit,
      estimatedBonus,
      costByType,
      recordCount: costs.length,
      lastUpdated: new Date()
    }
  }

  async getAllProjectCostSummaries() {
    this.checkInitialized()
    const projects = await this.find('projects', {})
    return await Promise.all(
      projects.map(project => this.getProjectCostSummary(project._id || project.id))
    )
  }

  _getEmptyCostSummary(projectId) {
    return {
      projectId,
      totalBudget: 0,
      totalCost: 0,
      expectedProfit: 0,
      estimatedBonus: 0,
      allocatedProjectBonus: 0,
      availableProfit: 0,
      costByType: {},
      recordCount: 0,
      lastUpdated: new Date()
    }
  }

  _calculateCostByType(costs) {
    const costByType = {}
    costs.forEach(cost => {
      const type = cost.costType || 'other'
      costByType[type] = (costByType[type] || 0) + (cost.amount || 0)
    })
    return costByType
  }

  async _getAllocatedProjectBonus(projectId) {
    try {
      const bonusPools = await this.find('projectBonusPools', { projectId })
      return bonusPools.reduce((sum, pool) => {
        return sum + (parseFloat(pool.totalAmount || pool.total_amount) || 0)
      }, 0)
    } catch (error) {
      logger.warn(`获取项目 ${projectId} 奖金池失败:`, error.message)
      return 0
    }
  }

  // ===================
  // 项目奖金相关方法
  // ===================

  async getProjectBonusPool(projectId, period) {
    this.checkInitialized()
    return await this.findOne('projectBonusPools', { projectId, period })
  }

  async createProjectBonusPool(data) {
    this.checkInitialized()
    const poolData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await this.insert('projectBonusPools', poolData)
  }

  async getProjectBonusAllocations(poolId) {
    this.checkInitialized()
    return await this.find('projectBonusAllocations', { poolId })
  }

  async createProjectBonusAllocation(data) {
    this.checkInitialized()
    const allocationData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await this.insert('projectBonusAllocations', allocationData)
  }

  // ===================
  // 团队申请相关方法
  // ===================

  async createTeamApplication(applicationData) {
    this.checkInitialized()
    const data = {
      ...applicationData,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await this.insert('teamApplications', data)
  }

  async getTeamApplications(query = {}) {
    this.checkInitialized()
    try {
      const applications = await this.find('teamApplications', query)
      return await Promise.all(
        applications.map(app => this._enrichTeamApplication(app))
      )
    } catch (error) {
      logger.error('Get team applications error:', error)
      throw error
    }
  }

  async _enrichTeamApplication(app) {
    try {
      const project = await this.findOne('projects', { _id: app.projectId })
      const applicant = await this.findOne('users', { _id: app.applicantId })
      let reviewedBy = null

      if (app.approvedBy) {
        const reviewer = await this.findOne('users', { _id: app.approvedBy })
        reviewedBy = reviewer ? reviewer.realName || reviewer.username : null
      }

      let members = []
      if (app._id) {
        const projectMembers = await this.find('projectMembers', {
          applicationId: app._id
        })
        members = await Promise.all(
          projectMembers.map(async (member) => {
            const employee = await this.findOne('employees', { _id: member.employeeId })
            return {
              employeeId: member.employeeId,
              employeeName: employee ? employee.name : '未知',
              roleName: member.roleName || member.role || '成员',
              contributionWeight: member.contributionWeight,
              estimatedWorkload: member.estimatedWorkload,
              allocationPercentage: member.allocationPercentage,
              reason: member.reason || ''
            }
          })
        )
      }

      return {
        ...app,
        id: app._id,
        projectName: project ? project.name : '未知项目',
        projectCode: project ? project.code : 'N/A',
        applicantName: applicant ? (applicant.realName || applicant.username) : '未知',
        reviewedBy,
        reviewedAt: app.approvedAt,
        reviewComments: app.approvalComments,
        members
      }
    } catch (error) {
      logger.error(`处理申请记录 ${app._id} 时出错:`, error)
      return {
        ...app,
        id: app._id,
        projectName: '未知项目',
        projectCode: 'N/A',
        applicantName: '未知',
        members: []
      }
    }
  }

  async getTeamApplicationById(applicationId) {
    this.checkInitialized()
    return await this.findOne('teamApplications', { _id: applicationId })
  }

  async updateTeamApplication(applicationId, updateData) {
    this.checkInitialized()
    const data = {
      ...updateData,
      updated_at: new Date()
    }
    await this.update('teamApplications', { _id: applicationId }, data)
    return await this.getTeamApplicationById(applicationId)
  }

  async deleteTeamApplication(applicationId) {
    this.checkInitialized()
    const result = await this.delete('teamApplications', { _id: applicationId })
    return result > 0
  }

  // ===================
  // 项目权重相关方法
  // ===================

  async getProjectWeights(projectId) {
    this.checkInitialized()
    const result = await this.manager.findAll('project_line_weights', {
      where: { project_id: projectId }
    })
    return result.rows || result
  }

  async updateProjectWeights(projectId, weights) {
    this.checkInitialized()
    const connection = await this.manager.beginTransaction()

    try {
      await this.manager.query(
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
        await this.manager.create('project_line_weights', weightData)
      }

      await this.manager.commitTransaction(connection)
      return weights
    } catch (error) {
      await this.manager.rollbackTransaction(connection)
      throw error
    }
  }

  // ===================
  // 聚合查询
  // ===================

  async aggregate(collection, pipeline) {
    this.checkInitialized()
    const { mysqlTable } = this._mapTableAndFields(collection, {})
    try {
      return await this.manager.aggregate(mysqlTable, pipeline)
    } catch (error) {
      console.error('❌ aggregate操作失败:', error.message)
      throw error
    }
  }
}

// 创建单例实例
const databaseService = new DatabaseService()

module.exports = databaseService