const { 
  Position, 
  PositionValueCriteria, 
  PositionValueAssessment,
  PositionMarketData,
  BusinessLine,
  Employee,
} = require('../models')
const logger = require('../utils/logger')
const { databaseManager } = require('../config/database')
class PositionValueService {
  /**
   * 计算岗位价值评估
   * @param {number} positionId 岗位ID
   * @param {string} assessmentPeriod 评估期间
   * @param {number} criteriaId 评估标准ID (可选)
   * @returns {object} 评估结果
   */
  async calculatePositionValue(positionId, assessmentPeriod, criteriaId = null) {
    try {
      
      // 1. 获取岗位信息（使用直接 SQL 查询）
      const positionResult = await databaseManager.query(`
        SELECT p.*, bl.id as business_line_id, bl.name as business_line_name
        FROM positions p
        LEFT JOIN business_lines bl ON p.line_id = bl.id
        WHERE p.id = ?
      `, [positionId])
      
      if (positionResult.length === 0) {
        throw new Error(`Position ${positionId} not found`)
      }
      
      const positionData = positionResult[0]
      const position = {
        id: positionData.id,
        name: positionData.name,
        level: positionData.level,
        lineId: positionData.line_id,
        benchmarkValue: parseFloat(positionData.benchmark_value || 0),
        requirements: this.safeJsonParse(positionData.requirements),
        responsibilities: this.safeJsonParse(positionData.responsibilities),
        BusinessLine: positionData.business_line_id ? {
          id: positionData.business_line_id,
          name: positionData.business_line_name
        } : null
      }
      
      // 2. 获取或选择评估标准
      const criteria = await this.getApplicableCriteria(position, criteriaId)
      
      // 3. 获取市场对标数据
      const marketData = await this.getMarketBenchmarkData(position)
      
      // 4. 计算各维度得分
      const dimensionScores = await this.calculateDimensionScores(position, criteria, marketData)
      
      // 5. 计算综合得分和等级
      const assessment = await this.calculateFinalAssessment(
        positionId, 
        criteria.id, 
        assessmentPeriod, 
        dimensionScores, 
        marketData
      )
      
      // 6. 保存评估结果
      const savedAssessment = await this.saveAssessmentResult(assessment)
      
      return {
        positionId,
        assessmentPeriod,
        position: {
          name: position.name,
          level: position.level,
          benchmarkValue: position.benchmarkValue
        },
        criteria: {
          id: criteria.id,
          name: criteria.name,
          category: criteria.category
        },
        dimensionScores,
        finalAssessment: savedAssessment,
        marketComparison: await this.generateMarketComparison(position, marketData),
        recommendations: await this.generateRecommendations(savedAssessment, marketData)
      }
    } catch (error) {
      logger.error('Calculate position value error:', error)
      throw error
    }
  }
  
  /**
   * 获取适用的评估标准
   */
  async getApplicableCriteria(position, criteriaId = null) {
    const { databaseManager } = require('../config/database')
    
    if (criteriaId) {
      const criteriaResult = await databaseManager.query(
        'SELECT * FROM position_value_criterias WHERE id = ? AND is_active = ?',
        [criteriaId, 1]
      )
      if (criteriaResult.length > 0) {
        return this._convertCriteriaFromDb(criteriaResult[0])
      }
    }
    
    // 查找适用的标准（使用直接 SQL 查询）
    // 注意：position_value_criterias 表的字段与预期不同，这里返回默认值
    // 实际表结构：business_line_id, position_level, responsibility_weight等
    const criteriaResult = await databaseManager.query(`
      SELECT * FROM position_value_criterias
      WHERE is_active = 1
        AND (business_line_id IS NULL OR business_line_id = ?)
      ORDER BY 
        CASE WHEN business_line_id IS NOT NULL THEN 1 ELSE 2 END ASC
      LIMIT 1
    `, [position.lineId || position.line_id])
    
    if (criteriaResult.length === 0) {
      // 使用默认标准
      return this.getDefaultCriteria()
    }
    
    return this._convertCriteriaFromDb(criteriaResult[0])
  }
  
  /**
   * 将数据库记录转换为 criteria 对象
   */
  _convertCriteriaFromDb(row) {
    // 根据实际的 position_value_criterias 表结构转换
    return {
      id: row.id,
      name: '岗位价值评估标准',
      category: 'general',
      skillComplexityWeight: parseFloat(row.skill_weight || 0.25),
      responsibilityWeight: parseFloat(row.responsibility_weight || 0.3),
      decisionImpactWeight: parseFloat(row.impact_weight || 0.2),
      experienceRequiredWeight: parseFloat(row.experience_weight || 0.15),
      marketValueWeight: 0.1,
      maxScore: 100,
      minScore: 0,
      isActive: row.is_active,
      businessLineId: row.business_line_id,
      positionLevel: row.position_level,
      marketBenchmark: parseFloat(row.market_benchmark || 0)
    }
  }
  
  /**
   * 获取默认评估标准
   */
  getDefaultCriteria() {
    return {
      id: null,
      name: '默认评估标准',
      category: 'general',
      skillComplexityWeight: 0.25,
      responsibilityWeight: 0.3,
      decisionImpactWeight: 0.2,
      experienceRequiredWeight: 0.15,
      marketValueWeight: 0.1,
      maxScore: 100,
      minScore: 0
    }
  }
  
  /**
   * 获取市场对标数据
   */
  async getMarketBenchmarkData(position) {
    try {
      
      // 使用直接 SQL 查询
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      
      const marketData = await databaseManager.query(`
        SELECT * FROM position_market_data
        WHERE status = 'active'
          AND level = ?
          AND (
            position_title LIKE ?
            OR position_category = ?
          )
          AND data_collection_date >= ?
        ORDER BY data_collection_date DESC
        LIMIT 10
      `, [position.level, `%${position.name}%`, position.name, oneYearAgo])
      
      // 转换字段名为 camelCase
      return marketData.map(data => ({
        id: data.id,
        positionTitle: data.position_title,
        positionCategory: data.position_category,
        level: data.level,
        baseSalaryMedian: parseFloat(data.base_salary_median || 0),
        totalCompensationMedian: parseFloat(data.total_compensation_median || 0),
        demandIndex: parseFloat(data.demand_index || 5),
        supplyIndex: parseFloat(data.supply_index || 5),
        experienceYearsMin: data.experience_years_min || 0,
        experienceYearsMax: data.experience_years_max || 0,
        dataSource: data.data_source,
        dataCollectionDate: data.data_collection_date,
        status: data.status
      }))
    } catch (error) {
      console.warn('获取市场对标数据失败:', error.message)
      return [] // 返回空数组而不是抛出错误
    }
  }
  
  /**
   * 计算各维度得分
   */
  async calculateDimensionScores(position, criteria, marketData) {
    return {
      skillComplexity: await this.calculateSkillComplexityScore(position, marketData),
      responsibility: await this.calculateResponsibilityScore(position),
      decisionImpact: await this.calculateDecisionImpactScore(position),
      experienceRequired: await this.calculateExperienceRequiredScore(position, marketData),
      marketValue: await this.calculateMarketValueScore(position, marketData)
    }
  }
  
  /**
   * 计算技能复杂度得分
   */
  async calculateSkillComplexityScore(position, marketData) {
    // 基于岗位等级的基础得分
    const levelScores = {
      'P1': 60, 'P2': 65, 'P3': 70, 'P4': 75, 'P5': 80, 'P6': 85, 'P7': 90,
      'M1': 75, 'M2': 80, 'M3': 85, 'M4': 90,
      'S1': 70, 'S2': 75, 'S3': 80, 'S4': 85
    }
    
    let baseScore = levelScores[position.level] || 70
    
    // 技能要求复杂度调整
    if (position.requirements && position.requirements.length > 0) {
      const skillComplexity = this.analyzeSkillComplexity(position.requirements)
      baseScore += skillComplexity * 5 // 最多调整25分
    }
    
    // 市场稀缺性调整
    if (marketData.length > 0) {
      const avgDemand = marketData.reduce((sum, data) => sum + (data.demandIndex || 5), 0) / marketData.length
      const avgSupply = marketData.reduce((sum, data) => sum + (data.supplyIndex || 5), 0) / marketData.length
      const scarcityBonus = Math.max(0, (avgDemand - avgSupply)) * 2
      baseScore += scarcityBonus
    }
    
    return Math.min(Math.max(baseScore, 0), 100)
  }
  
  /**
   * 分析技能复杂度
   */
  analyzeSkillComplexity(requirements) {
    const complexityKeywords = [
      '架构', '设计', '算法', '优化', '性能', '安全', '分布式', '微服务',
      '机器学习', '人工智能', '大数据', '云计算', '区块链', '高并发'
    ]
    
    let complexity = 0
    requirements.forEach(req => {
      if (typeof req === 'string') {
        complexityKeywords.forEach(keyword => {
          if (req.includes(keyword)) complexity++
        })
      }
    })
    
    return Math.min(complexity, 5) // 最多5分复杂度
  }
  
  /**
   * 计算责任范围得分
   */
  async calculateResponsibilityScore(position) {
    let score = 70 // 基础分
    
    // 基于岗位等级
    const levelMultipliers = {
      'P1': 0.8, 'P2': 0.9, 'P3': 1.0, 'P4': 1.1, 'P5': 1.2, 'P6': 1.3, 'P7': 1.4,
      'M1': 1.3, 'M2': 1.5, 'M3': 1.7, 'M4': 1.9,
      'S1': 1.1, 'S2': 1.2, 'S3': 1.3, 'S4': 1.4
    }
    
    score *= (levelMultipliers[position.level] || 1.0)
    
    // 管理职责调整
    if (position.level && position.level.startsWith('M')) {
      try {
        // 查看管理的员工数量
        const countResult = await databaseManager.query(
          'SELECT COUNT(*) as count FROM employees WHERE position_id = ?',
          [position.id]
        )
        const managedEmployees = countResult[0]?.count || 0
        score += Math.min(managedEmployees * 2, 20) // 每管理1人+2分，最多20分
      } catch (error) {
        console.warn('获取管理员工数量失败:', error.message)
      }
    }
    
    return Math.min(Math.max(score, 0), 100)
  }
  
  /**
   * 计算决策影响得分
   */
  async calculateDecisionImpactScore(position) {
    const impactScores = {
      'P1': 50, 'P2': 55, 'P3': 60, 'P4': 65, 'P5': 70, 'P6': 75, 'P7': 80,
      'M1': 75, 'M2': 80, 'M3': 85, 'M4': 90,
      'S1': 70, 'S2': 75, 'S3': 80, 'S4': 85
    }
    
    let score = impactScores[position.level] || 60
    
    // 基于职责范围的影响力调整
    if (position.responsibilities && position.responsibilities.length > 0) {
      const impactKeywords = [
        '决策', '规划', '战略', '方向', '架构', '标准', '流程', '制度'
      ]
      
      let impactCount = 0
      position.responsibilities.forEach(resp => {
        if (typeof resp === 'string') {
          impactKeywords.forEach(keyword => {
            if (resp.includes(keyword)) impactCount++
          })
        }
      })
      
      score += Math.min(impactCount * 3, 15)
    }
    
    return Math.min(Math.max(score, 0), 100)
  }
  
  /**
   * 计算经验要求得分
   */
  async calculateExperienceRequiredScore(position, marketData) {
    let score = 60 // 基础分
    
    // 基于等级的经验要求
    const experienceMap = {
      'P1': 1, 'P2': 2, 'P3': 3, 'P4': 5, 'P5': 7, 'P6': 9, 'P7': 12,
      'M1': 5, 'M2': 8, 'M3': 12, 'M4': 15,
      'S1': 3, 'S2': 5, 'S3': 8, 'S4': 12
    }
    
    const requiredYears = experienceMap[position.level] || 3
    score += requiredYears * 3 // 每年经验+3分
    
    // 市场经验要求对标
    if (marketData.length > 0) {
      const avgMarketExp = marketData.reduce((sum, data) => {
        return sum + ((data.experienceYearsMin + data.experienceYearsMax) / 2 || 3)
      }, 0) / marketData.length
      
      if (requiredYears > avgMarketExp) {
        score += (requiredYears - avgMarketExp) * 2 // 高于市场平均的额外加分
      }
    }
    
    return Math.min(Math.max(score, 0), 100)
  }
  
  /**
   * 计算市场价值得分
   */
  async calculateMarketValueScore(position, marketData) {
    let score = 70 // 基础分
    
    if (marketData.length === 0) {
      return score
    }
    
    // 薪酬水平分析
    const avgCompensation = marketData.reduce((sum, data) => {
      return sum + (data.totalCompensationMedian || data.baseSalaryMedian || 0)
    }, 0) / marketData.length
    
    // 基于薪酬水平调整得分（相对于基准）
    const compensationScore = Math.min((avgCompensation / 200000) * 50, 30) // 20万为基准，最多30分
    score += compensationScore
    
    // 需求供给比分析
    const avgDemandSupplyRatio = marketData.reduce((sum, data) => {
      const demand = data.demandIndex || 5
      const supply = data.supplyIndex || 5
      return sum + (demand / supply)
    }, 0) / marketData.length
    
    if (avgDemandSupplyRatio > 1.2) {
      score += Math.min((avgDemandSupplyRatio - 1) * 10, 15) // 供不应求时加分
    }
    
    return Math.min(Math.max(score, 0), 100)
  }
  
  /**
   * 计算最终评估结果
   */
  async calculateFinalAssessment(positionId, criteriaId, assessmentPeriod, dimensionScores, marketData) {
    // 如果有 criteriaId，使用它；否则使用默认标准
    let criteria
    if (criteriaId) {
     
      const criteriaResult = await databaseManager.query(
        'SELECT * FROM position_value_criterias WHERE id = ? AND is_active = 1',
        [criteriaId]
      )
      criteria = criteriaResult.length > 0 ? this._convertCriteriaFromDb(criteriaResult[0]) : this.getDefaultCriteria()
    } else {
      criteria = this.getDefaultCriteria()
    }
    
    // 计算加权得分
    const weightedScore = 
      dimensionScores.skillComplexity * criteria.skillComplexityWeight +
      dimensionScores.responsibility * criteria.responsibilityWeight +
      dimensionScores.decisionImpact * criteria.decisionImpactWeight +
      dimensionScores.experienceRequired * criteria.experienceRequiredWeight +
      dimensionScores.marketValue * criteria.marketValueWeight
    
    // 计算总分
    const totalScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0)
    
    // 标准化价值
    const normalizedValue = (weightedScore / criteria.maxScore) * 10
    
    // 计算等级
    const valueGrade = this.calculateGrade(normalizedValue)
    
    return {
      positionId,
      criteriaId,
      assessmentPeriod,
      skillComplexityScore: dimensionScores.skillComplexity,
      responsibilityScore: dimensionScores.responsibility,
      decisionImpactScore: dimensionScores.decisionImpact,
      experienceRequiredScore: dimensionScores.experienceRequired,
      marketValueScore: dimensionScores.marketValue,
      totalScore,
      weightedScore,
      normalizedValue,
      valueGrade,
      assessmentMethod: 'algorithm',
      calculationParams: {
        criteria: criteria,
        marketDataCount: marketData.length,
        calculationDate: new Date()
      },
      marketBenchmarkData: this.summarizeMarketData(marketData),
      reviewStatus: 'pending'
    }
  }
  
  /**
   * 计算价值等级
   */
  calculateGrade(normalizedValue) {
    if (normalizedValue >= 9.5) return 'S'
    if (normalizedValue >= 9.0) return 'A+'
    if (normalizedValue >= 8.0) return 'A'
    if (normalizedValue >= 7.5) return 'B+'
    if (normalizedValue >= 7.0) return 'B'
    if (normalizedValue >= 6.5) return 'C+'
    if (normalizedValue >= 6.0) return 'C'
    return 'D'
  }
  
  /**
   * 汇总市场数据
   */
  summarizeMarketData(marketData) {
    if (marketData.length === 0) return null
    
    const avgCompensation = marketData.reduce((sum, data) => 
      sum + (data.totalCompensationMedian || 0), 0) / marketData.length
    
    const avgDemand = marketData.reduce((sum, data) => 
      sum + (data.demandIndex || 5), 0) / marketData.length
    
    const avgSupply = marketData.reduce((sum, data) => 
      sum + (data.supplyIndex || 5), 0) / marketData.length
    
    return {
      sampleSize: marketData.length,
      avgCompensation,
      avgDemandIndex: avgDemand,
      avgSupplyIndex: avgSupply,
      competitionLevel: avgDemand > avgSupply ? 'high' : 'medium'
    }
  }
  
  /**
   * 保存评估结果
   */
  async saveAssessmentResult(assessmentData) {
    // 由于数据库中可能没有 position_value_assessments 表，暂时返回评估数据
    // 如果需要持久化，需要先创建表
    return {
      ...assessmentData,
      id: `assessment_${Date.now()}`,
      version: 1,
      status: 1,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  /**
   * 生成市场对比分析
   */
  async generateMarketComparison(position, marketData) {
    if (marketData.length === 0) {
      return {
        comparison: 'insufficient_data',
        message: '市场数据不足，无法进行对比分析'
      }
    }
    
    const summary = this.summarizeMarketData(marketData)
    
    return {
      marketPosition: summary.avgDemandIndex > 7 ? 'high_demand' : 'normal_demand',
      competitiveness: summary.avgSupplyIndex < 5 ? 'scarce' : 'competitive',
      salaryLevel: summary.avgCompensation > 300000 ? 'high' : 
                   summary.avgCompensation > 150000 ? 'medium' : 'standard',
      recommendations: this.generateMarketRecommendations(summary)
    }
  }
  
  /**
   * 生成改进建议
   */
  async generateRecommendations(assessment, marketData) {
    const recommendations = []
    
    // 基于得分给出建议
    if (assessment.skillComplexityScore < 70) {
      recommendations.push({
        category: 'skill_development',
        priority: 'high',
        suggestion: '建议增加技能复杂度要求，提升岗位技术含量'
      })
    }
    
    if (assessment.responsibilityScore < 65) {
      recommendations.push({
        category: 'responsibility_expansion',
        priority: 'medium',
        suggestion: '可考虑扩大岗位责任范围，增加管理或协调职能'
      })
    }
    
    if (assessment.normalizedValue < 6.0) {
      recommendations.push({
        category: 'overall_improvement',
        priority: 'high',
        suggestion: '岗位整体价值偏低，建议全面审视岗位定位和要求'
      })
    }
    
    return recommendations
  }
  
  /**
   * 生成市场建议
   */
  generateMarketRecommendations(marketSummary) {
    const recommendations = []
    
    if (marketSummary.avgDemandIndex > marketSummary.avgSupplyIndex + 2) {
      recommendations.push('市场需求旺盛，可适当提升岗位要求和薪酬标准')
    }
    
    if (marketSummary.avgCompensation > 250000) {
      recommendations.push('该岗位市场薪酬水平较高，具有较强竞争力')
    }
    
    return recommendations
  }
  
  /**
   * 批量计算岗位价值
   */
  async batchCalculatePositionValues(positionIds, assessmentPeriod, criteriaId = null) {
    const results = []
    const errors = []
    
    for (const positionId of positionIds) {
      try {
        const result = await this.calculatePositionValue(positionId, assessmentPeriod, criteriaId)
        results.push(result)
      } catch (error) {
        errors.push({ positionId, error: error.message })
      }
    }
    
    return { results, errors }
  }
  
  /**
   * 安全解析JSON，处理可能的解析错误
   * @param {string|undefined|null} jsonString - JSON字符串
   * @returns {any} 解析后的对象或默认空数组/对象
   */
  safeJsonParse(jsonString) {
    if (!jsonString) {
      return [];
    }
    
    try {
      // 如果已经是对象，则直接返回
      if (typeof jsonString === 'object') {
        return jsonString;
      }
      
      // 尝试解析JSON字符串
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      console.warn('JSON解析失败，返回默认值:', error.message, '原始值:', jsonString);
      // 如果解析失败，尝试合理的默认值
      // 如果看起来像数组，返回空数组；如果是对象，返回空对象
      if (typeof jsonString === 'string') {
        if (jsonString.trim().startsWith('[')) {
          return [];
        } else if (jsonString.trim().startsWith('{')) {
          return {};
        }
      }
      // 默认返回空数组
      return [];
    }
  }
  
}

module.exports = new PositionValueService()