const databaseService = require('./databaseService')
const logger = require('../utils/logger')

/**
 * 员工服务
 * 处理员工、部门、岗位相关的业务逻辑
 */
class EmployeeService {
  /**
   * 获取所有员工
   */
  async getEmployees() {
    const { fieldNameMap } = databaseService._mapTableAndFields('employees', {})
    const result = await databaseService.manager.findAll('employees', {
      order: [['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 根据ID查找员工
   */
  async getEmployeeById(id) {
    const { fieldNameMap } = databaseService._mapTableAndFields('employees', {})
    const result = await databaseService.manager.findByPk('employees', id)
    if (!result) return null
    return databaseService._addNedbId(databaseService._convertFieldsToNedb(result, fieldNameMap))
  }

  /**
   * 根据用户ID查找员工
   */
  async getEmployeeByUserId(userId) {
    const { fieldNameMap } = databaseService._mapTableAndFields('employees', {})
    const result = await databaseService.manager.findOne('employees', {
      where: { user_id: userId }
    })
    if (!result) return null
    return databaseService._addNedbId(databaseService._convertFieldsToNedb(result, fieldNameMap))
  }

  /**
   * 创建员工
   */
  async createEmployee(data) {
    const employeeData = {
      ...data,
      id_card: data.idCard ? String(data.idCard) : (data.id_card ? String(data.id_card) : null),
      emergency_contact: data.emergencyContact ? String(data.emergencyContact) : (data.emergency_contact ? String(data.emergency_contact) : null),
      emergency_phone: data.emergencyPhone ? String(data.emergencyPhone) : (data.emergency_phone ? String(data.emergency_phone) : null),
      phone: data.phone ? String(data.phone) : null,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await databaseService.manager.create('employees', employeeData)
  }

  /**
   * 更新员工
   */
  async updateEmployee(id, data) {
    const updateData = { ...data }

    if (data.idCard !== undefined) {
      updateData.id_card = data.idCard ? String(data.idCard) : null
    }
    if (data.id_card !== undefined) {
      updateData.id_card = data.id_card ? String(data.id_card) : null
    }
    if (data.emergencyContact !== undefined) {
      updateData.emergency_contact = data.emergencyContact ? String(data.emergencyContact) : null
    }
    if (data.emergency_contact !== undefined) {
      updateData.emergency_contact = data.emergency_contact ? String(data.emergency_contact) : null
    }
    if (data.emergencyPhone !== undefined) {
      updateData.emergency_phone = data.emergencyPhone ? String(data.emergencyPhone) : null
    }
    if (data.emergency_phone !== undefined) {
      updateData.emergency_phone = data.emergency_phone ? String(data.emergency_phone) : null
    }
    if (data.phone !== undefined) {
      updateData.phone = String(data.phone)
    }

    return await databaseService.manager.update('employees', id, updateData)
  }

  /**
   * 删除员工（真删除）
   * 直接从数据库中删除记录
   */
  async deleteEmployee(id) {
    logger.info(`真删除员工: ${id}`)
    return await databaseService.manager.destroy('employees', id)
  }

  /**
   * 获取所有部门
   */
  async getDepartments() {
    const { fieldNameMap } = databaseService._mapTableAndFields('departments', {})
    const result = await databaseService.manager.findAll('departments', {
      where: { status: 1 },
      order: [['sort', 'ASC'], ['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 根据ID查找部门
   */
  async getDepartmentById(id) {
    const { fieldNameMap } = databaseService._mapTableAndFields('departments', {})
    const result = await databaseService.manager.findByPk('departments', id)
    if (!result) return null
    return databaseService._addNedbId(databaseService._convertFieldsToNedb(result, fieldNameMap))
  }

  /**
   * 根据业务线查找部门
   */
  async getDepartmentsByBusinessLine(businessLineId) {
    const { fieldNameMap } = databaseService._mapTableAndFields('departments', {})
    const result = await databaseService.manager.findAll('departments', {
      where: { line_id: businessLineId, status: 1 },
      order: [['sort', 'ASC'], ['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 创建部门
   */
  async createDepartment(data) {
    const departmentData = {
      ...data,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await databaseService.manager.create('departments', departmentData)
  }

  /**
   * 更新部门
   */
  async updateDepartment(id, data) {
    return await databaseService.manager.update('departments', id, data)
  }

  /**
   * 删除部门（软删除）
   */
  async deleteDepartment(id) {
    return await databaseService.manager.update('departments', id, { status: 0 })
  }

  /**
   * 获取所有岗位
   */
  async getPositions() {
    const { fieldNameMap } = databaseService._mapTableAndFields('positions', {})
    const result = await databaseService.manager.findAll('positions', {
      where: { status: 1 },
      order: [['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 根据ID查找岗位
   */
  async getPositionById(id) {
    const { fieldNameMap } = databaseService._mapTableAndFields('positions', {})
    const result = await databaseService.manager.findByPk('positions', id)
    if (!result) return null
    return databaseService._addNedbId(databaseService._convertFieldsToNedb(result, fieldNameMap))
  }

  /**
   * 根据业务线查找岗位
   */
  async getPositionsByBusinessLine(businessLineId) {
    const { fieldNameMap } = databaseService._mapTableAndFields('positions', {})
    const result = await databaseService.manager.findAll('positions', {
      where: { line_id: businessLineId, status: 1 },
      order: [['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 创建岗位
   */
  async createPosition(data) {
    const positionData = {
      ...data,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await databaseService.manager.create('positions', positionData)
  }

  /**
   * 更新岗位
   */
  async updatePosition(id, data) {
    return await databaseService.manager.update('positions', id, data)
  }

  /**
   * 删除岗位（软删除）
   */
  async deletePosition(id) {
    return await databaseService.manager.update('positions', id, { status: 0 })
  }
}

module.exports = new EmployeeService()
