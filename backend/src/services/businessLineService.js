const databaseService = require('./databaseService')

/**
 * 业务线服务
 * 处理业务线相关的业务逻辑
 */
class BusinessLineService {
  /**
   * 获取所有业务线
   */
  async getBusinessLines() {
    const { fieldNameMap } = databaseService._mapTableAndFields('businessLines', {})
    const result = await databaseService.manager.findAll('business_lines', {
      order: [['name', 'ASC']]
    })
    const rows = result.rows || result
    return rows.map(row => databaseService._addNedbId(databaseService._convertFieldsToNedb(row, fieldNameMap)))
  }

  /**
   * 根据ID查找业务线
   */
  async getBusinessLineById(id) {
    const { fieldNameMap } = databaseService._mapTableAndFields('businessLines', {})
    const result = await databaseService.manager.findByPk('business_lines', id)
    if (!result) return null
    return databaseService._addNedbId(databaseService._convertFieldsToNedb(result, fieldNameMap))
  }

  /**
   * 创建业务线
   */
  async createBusinessLine(data) {
    const businessLineData = {
      ...data,
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await databaseService.manager.create('business_lines', businessLineData)
  }

  /**
   * 更新业务线
   */
  async updateBusinessLine(id, data) {
    return await databaseService.manager.update('business_lines', id, data)
  }

  /**
   * 删除业务线
   */
  async deleteBusinessLine(id) {
    return await databaseService.manager.destroy('business_lines', id)
  }

  /**
   * 获取业务线关联的部门数量
   */
  async getDepartmentCount(businessLineId) {
    const result = await databaseService.query(`
      SELECT COUNT(*) as total FROM departments WHERE line_id = ? AND status = 1
    `, [businessLineId])
    return result[0]?.total || 0
  }

  /**
   * 获取业务线关联的员工数量
   */
  async getEmployeeCount(businessLineId) {
    const result = await databaseService.query(`
      SELECT COUNT(DISTINCT e.id) as total
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 1
      AND (
        d.line_id = ? 
        OR 
        e.business_line_id = ?
      )
    `, [businessLineId, businessLineId])
    return result[0]?.total || 0
  }

  /**
   * 检查业务线下是否有关联的部门
   */
  async hasDepartments(businessLineId) {
    const count = await this.getDepartmentCount(businessLineId)
    return count > 0
  }

  /**
   * 检查业务线下是否有关联的员工
   */
  async hasEmployees(businessLineId) {
    const count = await this.getEmployeeCount(businessLineId)
    return count > 0
  }

  /**
   * 获取业务线统计信息
   */
  async getBusinessLineStats(businessLineId) {
    const departmentCount = await this.getDepartmentCount(businessLineId)
    const employeeCount = await this.getEmployeeCount(businessLineId)
    return { departmentCount, employeeCount }
  }

  /**
   * 获取所有业务线及其统计信息
   */
  async getBusinessLinesWithStats() {
    const businessLines = await this.getBusinessLines()
    const businessLinesWithStats = await Promise.all(
      businessLines.map(async (businessLine) => {
        const { departmentCount, employeeCount } = await this.getBusinessLineStats(businessLine.id || businessLine._id)
        return {
          ...businessLine,
          departmentCount,
          employeeCount
        }
      })
    )
    return businessLinesWithStats
  }

  /**
   * 获取员工信息
   */
  async getEmployeeById(employeeId) {
    return await databaseService.getEmployeeById(employeeId)
  }
}

module.exports = new BusinessLineService()
