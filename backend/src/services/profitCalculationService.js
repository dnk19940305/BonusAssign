const {
  ProfitData,
  EmployeeProfitContribution,
  ProfitAllocationRule,
  BusinessLine,
  Project,
  Employee,
  Position,
  Department,
  ProjectLineWeight,
  PerformanceRecord
} = require('../models')
const { Op } = require('sequelize')
const logger = require('../utils/logger')

class ProfitCalculationService {
  /**
   * 计算业务线利润贡献度
   * @param {number} businessLineId 业务线ID
   * @param {string} period 期间
   * @param {number} projectId 项目ID (可选)
   * @returns {object} 贡献度计算结果
   */
  async calculateBusinessLineProfitContribution(businessLineId, period, projectId = null) {
    try {
      // 1. 获取业务线基础权重
      const baseWeight = await this.getBusinessLineWeight(businessLineId, projectId)

      // 2. 获取业务线实际利润数据
      const profitData = await this.getProfitData(businessLineId, period, projectId)

      // 3. 计算权重调整系数
      const adjustmentFactor = await this.calculateWeightAdjustment(businessLineId, period)

      // 4. 计算最终贡献度
      const contributionAmount = profitData.profit * baseWeight * adjustmentFactor

      return {
        businessLineId,
        period,
        projectId,
        baseProfit: profitData.profit,
        baseWeight,
        adjustmentFactor,
        effectiveWeight: baseWeight * adjustmentFactor,
        contributionAmount,
        profitMargin: profitData.profitMargin,
        revenue: profitData.revenue,
        cost: profitData.cost
      }
    } catch (error) {
      logger.error('Calculate business line profit contribution error:', error)
      throw error
    }
  }

  /**
   * 计算项目利润贡献度
   * @param {number} projectId 项目ID
   * @param {string} period 期间
   * @returns {object} 项目贡献度计算结果
   */
  async calculateProjectProfitContribution(projectId, period) {
    try {
      // 1. 获取项目利润数据
      const projectProfit = await this.getProjectProfitData(projectId, period)

      // 2. 获取项目业务线权重配置
      const projectWeights = await this.getProjectLineWeights(projectId)

      // 3. 按业务线分配项目利润
      const lineAllocations = projectWeights.map(weight => ({
        businessLineId: weight.businessLineId,
        businessLineName: weight.BusinessLine?.name,
        allocatedProfit: projectProfit.profit * weight.weight,
        weight: weight.weight
      }))

      return {
        projectId,
        period,
        totalProfit: projectProfit.profit,
        totalRevenue: projectProfit.revenue,
        totalCost: projectProfit.cost,
        profitMargin: projectProfit.profitMargin,
        lineAllocations
      }
    } catch (error) {
      logger.error('Calculate project profit contribution error:', error)
      throw error
    }
  }

  /**
   * 计算员工利润贡献度 (核心算法)
   * @param {number} employeeId 员工ID
   * @param {string} period 期间
   * @param {number} projectId 项目ID (可选)
   * @returns {object} 员工贡献度计算结果
   */
  async calculateEmployeeProfitContribution(employeeId, period, projectId = null) {
    try {
      // 1. 获取员工基础信息
      const employee = await this.getEmployeeInfo(employeeId)
      const position = await this.getPositionInfo(employee.positionId)

      // 2. 获取分配规则
      const allocationRule = await this.getAllocationRule(employee.departmentId)

      // 3. 获取可分配利润池
      const availableProfit = await this.getAvailableProfitForAllocation(
        employee.businessLineId,
        period,
        projectId
      )

      // 4. 计算多维度贡献度
      const dimensions = {
        // 直接贡献 (项目收入、销售额等)
        directContribution: await this.calculateDirectContribution(employeeId, period, projectId),

        // 工作量贡献 (工时占比)
        workloadContribution: await this.calculateWorkloadContribution(employeeId, period, projectId),

        // 质量贡献 (质量评分、客户满意度)
        qualityContribution: await this.calculateQualityContribution(employeeId, period, projectId),

        // 岗位价值贡献 (基于岗位基准值)
        positionValueContribution: await this.calculatePositionValueContribution(employee, position),

        // 绩效调整
        performanceAdjustment: await this.calculatePerformanceAdjustment(employeeId, period)
      }

      // 5. 综合计算贡献度
      const totalContribution = this.calculateWeightedContribution(dimensions, allocationRule)

      // 6. 计算分配金额
      const allocationAmount = availableProfit * totalContribution.normalizedRatio

      // 7. 保存计算结果
      await this.saveContributionResult(employeeId, period, projectId, {
        dimensions,
        totalContribution,
        allocationAmount,
        calculationParams: { allocationRule, availableProfit }
      })

      return {
        employeeId,
        period,
        projectId,
        employee: {
          name: employee.name,
          employeeNo: employee.employeeNo,
          position: position.name,
          level: position.level
        },
        dimensions,
        totalContributionScore: totalContribution.score,
        normalizedRatio: totalContribution.normalizedRatio,
        allocationAmount,
        availableProfit,
        profitContributionDetails: {
          baseContribution: totalContribution.baseAmount,
          performanceBonus: totalContribution.performanceBonus,
          qualityBonus: totalContribution.qualityBonus
        }
      }
    } catch (error) {
      logger.error('Calculate employee profit contribution error:', error)
      throw error
    }
  }

  /**
   * 计算直接贡献
   */
  async calculateDirectContribution(employeeId, period, projectId) {
    try {
      // 获取员工信息（包含岗位信息）
      const employee = await this.getEmployeeInfo(employeeId)

      // 检查员工是否有岗位信息
      if (!employee.Position) {
        console.warn(`员工 ${employeeId} 没有岗位信息，使用通用计算`)
        return await this.calculateGeneralContribution(employeeId, period, projectId)
      }

      const roleType = this.determineRoleType(employee.Position)

      switch (roleType) {
        case 'sales':
          return await this.calculateSalesContribution(employeeId, period)
        case 'project_manager':
          return await this.calculatePMContribution(employeeId, period, projectId)
        case 'technical':
          return await this.calculateTechnicalContribution(employeeId, period, projectId)
        default:
          return await this.calculateGeneralContribution(employeeId, period, projectId)
      }
    } catch (error) {
      console.error(`计算直接贡献失败 (employeeId=${employeeId}):`, error)
      // 返回默认值而不是抛出错误
      return { score: 0, type: 'general', metrics: {} }
    }
  }

  /**
   * 计算工作量贡献
   */
  async calculateWorkloadContribution(employeeId, period, projectId) {
    // 模拟工时数据 - 实际应从工时系统获取
    const workHours = await this.getEmployeeWorkHours(employeeId, period, projectId)
    const totalTeamHours = await this.getTotalTeamWorkHours(period, projectId)

    // 计算工时占比
    const workHoursRatio = totalTeamHours > 0 ? workHours / totalTeamHours : 0

    // 考虑工作效率调整
    const efficiencyScore = await this.getEmployeeEfficiencyScore(employeeId, period)

    return {
      baseWorkloadRatio: workHoursRatio,
      efficiencyAdjustedRatio: workHoursRatio * efficiencyScore,
      workHours,
      totalTeamHours,
      efficiencyScore
    }
  }

  /**
   * 计算质量贡献
   */
  async calculateQualityContribution(employeeId, period, projectId) {
    // 获取质量相关指标
    const qualityMetrics = await this.getQualityMetrics(employeeId, period, projectId)

    // 质量评分权重配置
    const weights = {
      codeQuality: 0.3,
      deliveryOnTime: 0.25,
      clientSatisfaction: 0.25,
      defectRate: 0.2
    }

    const qualityScore =
      qualityMetrics.codeQuality * weights.codeQuality +
      qualityMetrics.deliveryOnTime * weights.deliveryOnTime +
      qualityMetrics.clientSatisfaction * weights.clientSatisfaction +
      (1 - qualityMetrics.defectRate) * weights.defectRate

    return {
      compositeQualityScore: qualityScore,
      qualityBonus: this.calculateQualityBonus(qualityScore),
      metrics: qualityMetrics
    }
  }

  /**
   * 计算岗位价值贡献
   */
  async calculatePositionValueContribution(employee, position) {
    // 基于岗位基准值计算
    const benchmarkValue = position.benchmarkValue || 1.0
    const levelMultiplier = this.getLevelMultiplier(position.level)

    return {
      benchmarkValue,
      levelMultiplier,
      positionValueScore: benchmarkValue * levelMultiplier
    }
  }

  /**
   * 计算绩效调整
   */
  async calculatePerformanceAdjustment(employeeId, period) {
    const performanceRecord = await PerformanceRecord.findOne({
      where: {
        employeeId,
        period
      }
    })

    if (!performanceRecord) {
      return {
        performanceCoefficient: 1.0,
        excellenceCoefficient: 0,
        adjustedScore: 1.0
      }
    }

    return {
      performanceCoefficient: performanceRecord.coefficient,
      excellenceCoefficient: performanceRecord.excellenceCoefficient || 0,
      adjustedScore: performanceRecord.coefficient * (1 + (performanceRecord.excellenceCoefficient || 0))
    }
  }

  /**
   * 综合计算加权贡献度
   */
  calculateWeightedContribution(dimensions, allocationRule) {
    const weights = {
      directContribution: allocationRule.directContributionWeight,
      workload: allocationRule.workloadWeight,
      quality: allocationRule.qualityWeight,
      positionValue: allocationRule.positionValueWeight
    }

    // 计算基础得分
    const baseScore =
      (dimensions.directContribution.score || 0) * weights.directContribution +
      (dimensions.workloadContribution.efficiencyAdjustedRatio || 0) * weights.workload +
      (dimensions.qualityContribution.compositeQualityScore || 0) * weights.quality +
      (dimensions.positionValueContribution.positionValueScore || 0) * weights.positionValue

    // 应用绩效调整
    const performanceAdjusted = baseScore * dimensions.performanceAdjustment.adjustedScore

    // 计算奖励
    const qualityBonus = dimensions.qualityContribution.qualityBonus || 0
    const performanceBonus = dimensions.performanceAdjustment.excellenceCoefficient * allocationRule.excellenceBonus || 0

    const finalScore = performanceAdjusted + qualityBonus + performanceBonus

    return {
      baseScore,
      performanceAdjusted,
      finalScore,
      qualityBonus,
      performanceBonus,
      normalizedRatio: Math.min(Math.max(finalScore, 0), allocationRule.maxContributionCap || 2.0)
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 获取业务线权重
   */
  async getBusinessLineWeight(businessLineId, projectId = null) {
    if (projectId) {
      const projectWeight = await ProjectLineWeight.findOne({
        where: { projectId, businessLineId },
        include: [{ model: BusinessLine, attributes: ['status'] }]
      })
      if (projectWeight && projectWeight.BusinessLine?.status === 1) {
        return projectWeight.weight
      } else if (projectWeight) {
        // If line is disabled, return 0
        return 0
      }
    }

    const businessLine = await BusinessLine.findByPk(businessLineId)
    return (businessLine && businessLine.status === 1) ? businessLine.weight : 0
  }

  /**
   * 获取利润数据
   */
  async getProfitData(businessLineId, period, projectId = null) {
    const profitData = await ProfitData.findOne({
      where: {
        businessLineId,
        period,
        ...(projectId && { projectId })
      },
      include: [{
        model: BusinessLine,
        where: { status: 1 },
        required: true
      }]
    })

    // 如果找不到利润数据，返回 null 而不是抛出错误
    if (!profitData) {
      console.warn(`❗ 未找到利润数据: businessLineId=${businessLineId}, period=${period}`)
      return null
    }

    return profitData
  }

  /**
   * 获取项目利润数据
   */
  async getProjectProfitData(projectId, period) {
    const profitData = await ProfitData.findOne({
      where: { projectId, period }
    })

    if (!profitData) {
      throw new Error(`No profit data found for project ${projectId} in period ${period}`)
    }

    return profitData
  }

  /**
   * 获取项目业务线权重
   */
  async getProjectLineWeights(projectId) {
    const weights = await ProjectLineWeight.findAll({
      where: { projectId },
      include: [{ model: BusinessLine, attributes: ['name', 'code', 'status'] }]
    })

    // 过滤掉已禁用的业务线 (status: 0)
    const activeWeights = weights.filter(w => w.BusinessLine?.status === 1)

    if (activeWeights.length === 0) {
      return []
    }

    // 如果总权重不为 1 (例如因为禁用了部分业务线)，则重新归一化
    const totalWeight = activeWeights.reduce((sum, w) => sum + parseFloat(w.weight || 0), 0)
    if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.0001) {
      logger.info(`项目 ${projectId} 的业务线权重不为 1 (${totalWeight})，执行归一化处理`)
      return activeWeights.map(w => {
        // 使用 toJSON() 获取纯对象，避免修改 Sequelize 实例
        const plainWeight = w.toJSON()
        plainWeight.weight = parseFloat(w.weight) / totalWeight
        return plainWeight
      })
    }

    return activeWeights
  }

  /**
   * 获取员工信息
   */
  async getEmployeeInfo(employeeId) {
    try {
      // 使用数据库管理器直接查询员工及关联信息
      const { databaseManager } = require('../config/database')

      const employeeResult = await databaseManager.query(`
        SELECT 
          e.*,
          p.id as position_id,
          p.name as position_name,
          p.level as position_level,
          p.line_id as position_line_id,
          d.id as department_id,
          d.name as department_name,
          d.line_id as department_line_id
        FROM employees e
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?
      `, [employeeId])

      if (employeeResult.length === 0) {
        throw new Error(`Employee ${employeeId} not found`)
      }

      const employee = employeeResult[0]

      // 构建符合原有结构的员工对象
      return {
        id: employee.id,
        name: employee.name,
        employeeNo: employee.employee_no,
        positionId: employee.position_id,
        departmentId: employee.department_id,
        annualSalary: employee.annual_salary,
        entryDate: employee.entry_date,
        status: employee.status,
        businessLineId: employee.department_line_id || null,  // 从 Department.lineId 获取
        Position: employee.position_id ? {
          id: employee.position_id,
          name: employee.position_name,
          level: employee.position_level,
          lineId: employee.position_line_id
        } : null,
        Department: employee.department_id ? {
          id: employee.department_id,
          name: employee.department_name,
          lineId: employee.department_line_id
        } : null,
        toJSON() {
          return this
        }
      }
    } catch (error) {
      console.error('获取员工信息失败:', error)
      throw error
    }
  }

  /**
   * 获取岗位信息
   */
  async getPositionInfo(positionId) {
    const position = await Position.findByPk(positionId)
    if (!position) {
      throw new Error(`Position ${positionId} not found`)
    }
    return position
  }

  /**
   * 获取分配规则
   */
  async getAllocationRule(departmentId) {
    try {
      // 首先尝试获取部门所属业务线的特定规则
      const department = await Department.findByPk(departmentId)

      let rule = await ProfitAllocationRule.findOne({
        where: {
          businessLineId: department.lineId,  // 使用 lineId 而不是 businessLineId
          status: 'active',
          effectiveDate: { [Op.lte]: new Date() },
          [Op.or]: [
            { expiryDate: null },
            { expiryDate: { [Op.gte]: new Date() } }
          ]
        },
        order: [['effectiveDate', 'DESC']]
      })

      // 如果没有特定规则，使用全局默认规则
      if (!rule) {
        rule = await ProfitAllocationRule.findOne({
          where: {
            businessLineId: null,
            status: 'active',
            effectiveDate: { [Op.lte]: new Date() },
            [Op.or]: [
              { expiryDate: null },
              { expiryDate: { [Op.gte]: new Date() } }
            ]
          },
          order: [['effectiveDate', 'DESC']]
        })
      }

      // 如果还是没有，使用默认配置
      if (!rule) {
        return this.getDefaultAllocationRule()
      }

      return rule
    } catch (error) {
      console.warn('获取利润分配规则失败，使用默认规则:', error.message)
      // 如果查询失败，返回默认规则
      return this.getDefaultAllocationRule()
    }
  }

  /**
   * 获取默认分配规则
   */
  getDefaultAllocationRule() {
    return {
      directContributionWeight: 0.4,
      workloadWeight: 0.3,
      qualityWeight: 0.2,
      positionValueWeight: 0.1,
      performanceWeight: 0.2,
      excellenceBonus: 0.2,
      qualityBonus: 0.15,
      maxContributionCap: 2.0
    }
  }

  // ========== 模拟数据方法 (实际应用中应从相应系统获取) ==========

  async calculateWeightAdjustment(businessLineId, period) {
    // 模拟权重调整系数计算
    return 1.0
  }

  async getAvailableProfitForAllocation(businessLineId, period, projectId) {
    // 获取利润数据
    const profitData = await this.getProfitData(businessLineId, period, projectId)

    // 如果没有利润数据，返回 0
    if (!profitData) {
      console.warn(`❗ 业务线 ${businessLineId} 在 ${period} 期间没有利润数据，返回 0`)
      return 0
    }

    return profitData.profit * 0.8 // 假设80%用于分配
  }

  async calculateSalesContribution(employeeId, period) {
    // 模拟销售贡献计算
    return { score: 0.8, type: 'sales', metrics: {} }
  }

  async calculatePMContribution(employeeId, period, projectId) {
    // 模拟项目经理贡献计算
    return { score: 0.7, type: 'project_manager', metrics: {} }
  }

  async calculateTechnicalContribution(employeeId, period, projectId) {
    // 模拟技术人员贡献计算
    return { score: 0.6, type: 'technical', metrics: {} }
  }

  async calculateGeneralContribution(employeeId, period, projectId) {
    // 模拟一般员工贡献计算
    return { score: 0.5, type: 'general', metrics: {} }
  }

  async getEmployeeWorkHours(employeeId, period, projectId) {
    // 模拟工时数据
    return 160 // 假设月工时
  }

  async getTotalTeamWorkHours(period, projectId) {
    // 模拟团队总工时
    return 1600 // 假设10人团队月工时
  }

  async getEmployeeEfficiencyScore(employeeId, period) {
    // 模拟效率评分
    return 1.2
  }

  async getQualityMetrics(employeeId, period, projectId) {
    // 模拟质量指标
    return {
      codeQuality: 0.85,
      deliveryOnTime: 0.9,
      clientSatisfaction: 0.8,
      defectRate: 0.1
    }
  }

  calculateQualityBonus(qualityScore) {
    // 质量奖励计算
    if (qualityScore >= 0.9) return 0.2
    if (qualityScore >= 0.8) return 0.1
    return 0
  }

  getLevelMultiplier(level) {
    // 岗位等级系数
    const multipliers = {
      'P1': 0.8, 'P2': 0.9, 'P3': 1.0, 'P4': 1.1, 'P5': 1.2, 'P6': 1.3, 'P7': 1.4,
      'M1': 1.2, 'M2': 1.4, 'M3': 1.6, 'M4': 1.8
    }
    return multipliers[level] || 1.0
  }

  determineRoleType(position) {
    // 如果 position 为 null 或 undefined，返回 'general'
    if (!position || !position.name) {
      return 'general'
    }

    const roleMappings = {
      'sales': ['销售', '商务', '客户'],
      'project_manager': ['项目经理', 'PM', '项目管理'],
      'technical': ['开发', '技术', '工程师', '架构师']
    }

    for (const [type, keywords] of Object.entries(roleMappings)) {
      if (keywords.some(keyword => position.name.includes(keyword))) {
        return type
      }
    }

    return 'general'
  }

  /**
   * 保存贡献度计算结果
   */
  async saveContributionResult(employeeId, period, projectId, result) {
    const existingRecord = await EmployeeProfitContribution.findOne({
      where: {
        employeeId,
        period,
        projectId: projectId || null,
        contributionType: 'direct'
      }
    })

    const contributionData = {
      employeeId,
      period,
      projectId,
      contributionType: 'direct',
      contributionAmount: result.allocationAmount,
      contributionRatio: result.totalContribution.normalizedRatio,
      workHours: result.dimensions.workloadContribution.workHours,
      workHoursRatio: result.dimensions.workloadContribution.baseWorkloadRatio,
      qualityScore: result.dimensions.qualityContribution.compositeQualityScore,
      efficiencyScore: result.dimensions.workloadContribution.efficiencyScore,
      directContributionScore: result.dimensions.directContribution.score,
      workloadContributionScore: result.dimensions.workloadContribution.efficiencyAdjustedRatio,
      qualityContributionScore: result.dimensions.qualityContribution.compositeQualityScore,
      totalContributionScore: result.totalContribution.finalScore,
      calculatedBy: 'auto_formula',
      calculationParams: result.calculationParams,
      reviewStatus: 'pending',
      status: 1,
      createdBy: 1, // 系统用户
      updatedBy: 1
    }

    if (existingRecord) {
      await existingRecord.update(contributionData)
      return existingRecord
    } else {
      return await EmployeeProfitContribution.create(contributionData)
    }
  }
}

module.exports = new ProfitCalculationService()