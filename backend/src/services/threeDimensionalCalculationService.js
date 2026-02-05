﻿const { Op, literal, fn, col } = require('sequelize')
const { Department,Position,sequelize, Employee, ThreeDimensionalWeightConfig, ThreeDimensionalCalculationResult, BonusPool } = require('../models')
const profitCalculationService = require('./profitCalculationService')
const positionValueService = require('./positionValueService')
const performanceCalculationService = require('./performanceCalculationService')
const databaseService = require('./databaseService')
const { databaseManager } = require('../config/database')

class ThreeDimensionalCalculationService {

  /**
   * 计算员工三维模型得分
   * @param {number} employeeId - 员工ID
   * @param {string} period - 计算期间
   * @param {number} weightConfigId - 权重配置ID
   * @param {Object} options - 计算选项
   * @returns {Object} 计算结果
   */
  async calculateEmployeeScore(employeeId, period, weightConfigId, options = {}) {
    try {
      // 获取权重配置
      const weightConfig = await databaseService.findOne('threeDimensionalWeightConfigs', { _id: weightConfigId })
      if (!weightConfig) {
        throw new Error('权重配置不存在')
      }

      // 获取员工信息
      const employee = await Employee.findByPk(employeeId, {
        include: ['Department', 'Position']
      })
      if (!employee) {
        throw new Error('员工不存在')
      }

      // 获取三个维度的原始得分
      const profitScore = await this.getProfitContributionScore(employeeId, period, options)
      const positionScore = await this.getPositionValueScore(employeeId, period, options)
      const performanceScore = await this.getPerformanceScore(employeeId, period, options)

      // 标准化得分
      const normalizedScores = await this.normalizeScores({
        profitScore,
        positionScore,
        performanceScore
      }, period, options)

      // 计算加权得分
      const weightedScores = this.calculateWeightedScores(normalizedScores, weightConfig)

      // 计算综合得分
      const totalScore = this.calculateTotalScore(weightedScores, weightConfig)

      // 不再应用调整系数，直接使用 totalScore
      // 最终得分将在批量计算后统一归一化到百分制
      const adjustedScore = totalScore

      // 构建详细计算数据
      const calculationDetails = {
        originalScores: { profitScore, positionScore, performanceScore },
        normalizedScores,
        weightedScores,
        totalScore,
        adjustedScore,
        weights: this.extractWeights(weightConfig),
        calculationParams: {
          method: weightConfig.calculationMethod,
          normalizationMethod: weightConfig.normalizationMethod
        }
      }

      return {
        employeeId,
        employee,
        period,
        weightConfigId,
        ...calculationDetails
      }

    } catch (error) {
      console.error('计算员工三维得分失败:', error)
      throw new Error(`计算失败: ${error.message}`)
    }
  }

  /**
   * 获取利润贡献度得分
   */
  async getProfitContributionScore(employeeId, period, options = {}) {
    try {
      // 优先从绩效记录管理导入的数据中获取
      const performanceScoreRecord = await databaseManager.query(`
        SELECT profit_contribution 
        FROM performance_three_dimensional_scores 
        WHERE employee_id = ? AND calculation_period = ?
        LIMIT 1
      `, [employeeId, period])
      
      if (performanceScoreRecord && performanceScoreRecord.length > 0 && performanceScoreRecord[0].profit_contribution !== null) {
        const profitScore = parseFloat(performanceScoreRecord[0].profit_contribution || 0)

        // 直接使用评分 (范围: -100至100)
        return {
          score: parseFloat(profitScore.toFixed(4)),
          details: { source: 'performance_record', value: profitScore },
          dataVersion: new Date().toISOString()
        }
      }
      
      // 如果没有绩效记录，再使用原有计算逻辑
      const contributionData = await profitCalculationService.calculateEmployeeProfitContribution(
        employeeId,
        period,
        options.projectId
      )

      // 综合计算利润贡献得分
      const dimensions = contributionData.dimensions
      
      // 提取score值，支持对象和数值两种格式
      const getScore = (value) => {
        if (typeof value === 'object' && value !== null) {
          return value.score || 0
        }
        return value || 0
      }
      
      const directContribution = getScore(dimensions.directContribution)
      const workloadContribution = getScore(dimensions.workloadContribution)
      const qualityContribution = getScore(dimensions.qualityContribution)
      const positionValueContribution = getScore(dimensions.positionValueContribution)
      
      const score = (
        directContribution * 0.4 +
        workloadContribution * 0.3 +
        qualityContribution * 0.2 +
        positionValueContribution * 0.1
      )
      
      // 防止NaN
      const finalScore = isNaN(score) ? 0 : score


      return {
        score: parseFloat(finalScore.toFixed(4)),
        details: contributionData,
        dataVersion: contributionData.calculatedAt
      }
    } catch (error) {
      console.error(`❌ 获取利润贡献度得分失败 (员工${employeeId}):`, error.message)
      return { score: 0, details: null, dataVersion: null }
    }
  }

  /**
   * 获取岗位价值得分
   */
  async getPositionValueScore(employeeId, period, options = {}) {
    try {
      // 优先从绩效记录管理导入的数据中获取
      const performanceScoreRecord = await databaseManager.query(`
        SELECT position_score 
        FROM performance_three_dimensional_scores 
        WHERE employee_id = ? AND calculation_period = ?
        LIMIT 1
      `, [employeeId, period])
      
      if (performanceScoreRecord && performanceScoreRecord.length > 0 && performanceScoreRecord[0].position_score !== null) {
        const posScore = parseFloat(performanceScoreRecord[0].position_score || 0)
        
        return {
          score: parseFloat(posScore.toFixed(4)),
          details: { source: 'performance_record', value: posScore },
          dataVersion: new Date().toISOString()
        }
      }
      
      // 如果没有绩效记录，再使用原有计算逻辑
      // 使用数据库管理器直接查询员工及关联信息
      const employeeResult = await databaseManager.query(`
        SELECT 
          e.*,
          p.id as position_id,
          p.name as position_name,
          p.level as position_level,
          p.line_id as position_line_id
        FROM employees e
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.id = ?
      `, [employeeId])
      
      if (employeeResult.length === 0) {
        console.warn(`员工 ${employeeId} 不存在`)
        return { score: 0, details: null, dataVersion: null }
      }
      
      const employee = employeeResult[0]
      
      // 检查员工是否有岗位信息
      if (!employee.position_id) {
        console.warn(`员工 ${employeeId} 没有分配岗位`)
        return { score: 0, details: null, dataVersion: null }
      }

      const positionAssessment = await positionValueService.calculatePositionValue(
        employee.position_id,
        period,
        { businessLineId: employee.position_line_id }
      )
      
      // positionAssessment 结构：{ finalAssessment: { weightedScore, totalScore, ... }, ... }
      // 使用加权得分而不是总分，因为totalScore是所有维度得分的总和，可能远超100分
      // 而weightedScore是加权后的得分，应在合理范围内
      const weightedScore = positionAssessment?.finalAssessment?.weightedScore || 0
      
      // 确保得分在0-100范围内
      const normalizedScore = Math.max(0, Math.min(100, weightedScore));

      return {
        score: parseFloat(normalizedScore.toFixed(4)),
        details: positionAssessment,
        dataVersion: positionAssessment?.finalAssessment?.calculatedAt || new Date().toISOString()
      }
    } catch (error) {
      console.warn(`获取岗位价值得分失败 (员工${employeeId}):`, error.message)
      return { score: 0, details: null, dataVersion: null }
    }
  }

  /**
   * 获取绩效表现得分
   */
  async getPerformanceScore(employeeId, period, options = {}) {
    try {
      // 检查是否为全年格式 (YYYY)
      const yearMatch = period.match(/^(\d{4})$/)
      
      if (yearMatch) {
        // 全年计算：汇总当年所有季度绩效取平均值
        const year = yearMatch[1]
        
        const performanceScoreRecords = await databaseManager.query(`
          SELECT performance_score, calculation_period
          FROM performance_three_dimensional_scores 
          WHERE employee_id = ? AND calculation_period LIKE ?
        `, [employeeId, `${year}Q%`])
        
        if (performanceScoreRecords && performanceScoreRecords.length > 0) {
          // 过滤有效分数
          const validScores = performanceScoreRecords
            .map(r => parseFloat(r.performance_score || 0))
            .filter(score => score > 0)
          
          if (validScores.length > 0) {
            // 计算平均值
            const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length
            
            return {
              score: parseFloat(avgScore.toFixed(4)),
              details: {
                source: 'performance_record_yearly_average',
                year,
                quarterScores: performanceScoreRecords.map(r => ({
                  period: r.calculation_period,
                  score: parseFloat(r.performance_score || 0)
                })),
                averageScore: avgScore,
                validQuarters: validScores.length
              },
              dataVersion: new Date().toISOString()
            }
          }
        }
        
        console.log(`  ⚠️ 员工 ${employeeId} 在 ${year} 年没有找到有效季度绩效数据`)
      } else {
        // 单季度/单月计算：保留原有逻辑
        // 优先从绩效记录管理导入的数据中获取
        const performanceScoreRecord = await databaseManager.query(`
          SELECT performance_score 
          FROM performance_three_dimensional_scores 
          WHERE employee_id = ? AND calculation_period = ?
          LIMIT 1
        `, [employeeId, period])
          
        if (performanceScoreRecord && performanceScoreRecord.length > 0 && performanceScoreRecord[0].performance_score !== null) {
          const perfScore = parseFloat(performanceScoreRecord[0].performance_score || 0)
            
          return {
            score: parseFloat(perfScore.toFixed(4)),
            details: { source: 'performance_record', value: perfScore },
            dataVersion: new Date().toISOString()
          }
        }
      }
        
      // 如果没有绩效记录，再使用原有计算逻辑
      // 优先使用绩效评估数据
      const performanceResult = await performanceCalculationService.calculatePerformanceAssessment(
        employeeId,
        period,
        'quarterly', // 评估类型
        options
      )
  
      if (performanceResult && performanceResult.overallScore > 0) {
        return {
          score: parseFloat(performanceResult.overallScore.toFixed(4)),
          details: performanceResult,
          dataVersion: new Date().toISOString()
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无绩效评估数据 (员工${employeeId}):`, error.message)
    }
  
    // 如果没有绩效评估数据,尝试从 performance_records获取绩效系数
    try {
      const performanceRecords = await databaseService.find('performanceRecords', {
        employeeId: employeeId.toString(),
        period: period
      })
  
      if (performanceRecords && performanceRecords.length > 0) {
        const record = performanceRecords[0]
        const coefficient = parseFloat(record.coefficient || 1.0)
          
        // 将绩效系数转换为0-100分数
        // 系数范围: 0.5(D) - 1.5(S)
        // 转换公式: score = (coefficient - 0.5) / 1.0 * 100
        // 0.5 -> 0分, 1.0 -> 50分, 1.5 -> 100分
        const score = Math.max(0, Math.min(100, ((coefficient - 0.5) / 1.0) * 100))
          
          
        return {
          score: parseFloat(score.toFixed(4)),
          details: { source: 'performance_coefficient', coefficient, rating: record.rating },
          dataVersion: new Date().toISOString()
        }
      }
    } catch (error) {
      console.warn(`⚠️ 获取绩效系数失败 (员工${employeeId}):`, error.message)
    }
  
    // 如果都没有,返回默认分数50(相当于系数 1.0)
    console.warn(`⚠️ 员工 ${employeeId} 无任何绩效数据,使用默认分数50`)
    return { score: 50, details: null, dataVersion: null }
  }

  /**
   * 标准化得分
   */
  async normalizeScores(scores, period, options = {}) {
    const normalizationMethod = options.normalizationMethod || 'none'
    
    // 检查是否禁用归一化
    if (normalizationMethod === 'none' || normalizationMethod === 'disabled') {
      console.log(`⚠️ 归一化已禁用，直接使用原始得分：利润=${scores.profitScore.score}, 岗位=${scores.positionScore.score}, 绩效=${scores.performanceScore.score}`)
      return {
        normalizedProfitScore: scores.profitScore.score,
        normalizedPositionScore: scores.positionScore.score,
        normalizedPerformanceScore: scores.performanceScore.score
      }
    }
    
    // 如果提供了当前批次的所有员工得分，优先使用
    if (options.batchScores && options.batchScores.length > 0) {
      console.log(`✅ 使用当前批次数据进行归一化: ${options.batchScores.length} 条记录`)
      const allScores = {
        profitScores: options.batchScores.map(s => s.profitScore.score),
        positionScores: options.batchScores.map(s => s.positionScore.score),
        performanceScores: options.batchScores.map(s => s.performanceScore.score)
      }
      return this.applyNormalization(scores, allScores, normalizationMethod)
    }
    
    // 否则获取历史数据
    const allScores = await this.getAllEmployeeScores(period, options)
    return this.applyNormalization(scores, allScores, normalizationMethod)
  }
  
  /**
   * 应用归一化算法
   */
  applyNormalization(scores, allScores, normalizationMethod) {
    // 如果禁用归一化，直接返回原始得分
    if (normalizationMethod === 'none' || normalizationMethod === 'disabled') {
      return {
        normalizedProfitScore: scores.profitScore.score,
        normalizedPositionScore: scores.positionScore.score,
        normalizedPerformanceScore: scores.performanceScore.score
      }
    }
    
    switch (normalizationMethod) {
      case 'z_score':
        return this.zScoreNormalization(scores, allScores)
      case 'min_max':
        return this.minMaxNormalization(scores, allScores)
      case 'rank_based':
        return this.rankBasedNormalization(scores, allScores)
      case 'percentile':
        return this.percentileNormalization(scores, allScores)
      default:
        return this.minMaxNormalization(scores, allScores)
    }
  }

  /**
   * Z-Score标准化 (转换为0-100范围以便于理解)
   */
  zScoreNormalization(scores, allScores) {
    const normalize = (value, values) => {
      if (values.length === 0) return 50
      
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length
      const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length)
      
      if (stdDev === 0) return 50 // 所有值相同时返回中位数
      
      // 计算Z-Score
      const zScore = (value - mean) / stdDev
      
      // 将Z-Score转换为0-100范围
      // Z-Score通常在-3到+3之间,将其映射到0-100
      // -3 -> 0, 0 -> 50, +3 -> 100
      const normalizedValue = ((zScore + 3) / 6) * 100
      return Math.max(0, Math.min(100, normalizedValue))
    }

    return {
      normalizedProfitScore: normalize(scores.profitScore.score, allScores.profitScores),
      normalizedPositionScore: normalize(scores.positionScore.score, allScores.positionScores),
      normalizedPerformanceScore: normalize(scores.performanceScore.score, allScores.performanceScores)
    }
  }

  /**
   * Min-Max标准化 (归一化到0-100范围,更直观)
   */
  minMaxNormalization(scores, allScores) {
    const normalize = (value, values) => {
      if (values.length === 0) return 50 // 默认中位数
      
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      // 如果所有值相同,返回50(中位数)
      if (max === min) return 50
      
      // 归一化到0-100范围
      const normalizedValue = ((value - min) / (max - min)) * 100
      return Math.max(0, Math.min(100, normalizedValue))
    }

    return {
      normalizedProfitScore: normalize(scores.profitScore.score, allScores.profitScores),
      normalizedPositionScore: normalize(scores.positionScore.score, allScores.positionScores),
      normalizedPerformanceScore: normalize(scores.performanceScore.score, allScores.performanceScores)
    }
  }

  /**
   * 基于排名的标准化 (转换为0-100范围)
   */
  rankBasedNormalization(scores, allScores) {
    const normalize = (value, values) => {
      if (values.length === 0) return 50
      
      const sorted = values.slice().sort((a, b) => b - a)
      const rank = sorted.indexOf(value) + 1
      
      // 排名转换为百分位 (1名 -> 100, 最后一名 -> 0)
      const percentile = (1 - (rank - 1) / values.length) * 100
      return Math.max(0, Math.min(100, percentile))
    }

    return {
      normalizedProfitScore: normalize(scores.profitScore.score, allScores.profitScores),
      normalizedPositionScore: normalize(scores.positionScore.score, allScores.positionScores),
      normalizedPerformanceScore: normalize(scores.performanceScore.score, allScores.performanceScores)
    }
  }

  /**
   * 百分位标准化 (转换为0-100范围)
   */
  percentileNormalization(scores, allScores) {
    const normalize = (value, values) => {
      if (values.length === 0) return 50
      
      const count = values.filter(v => v <= value).length
      
      // 百分位转换为0-100范围
      const percentile = (count / values.length) * 100
      return Math.max(0, Math.min(100, percentile))
    }

    return {
      normalizedProfitScore: normalize(scores.profitScore.score, allScores.profitScores),
      normalizedPositionScore: normalize(scores.positionScore.score, allScores.positionScores),
      normalizedPerformanceScore: normalize(scores.performanceScore.score, allScores.performanceScores)
    }
  }

  /**
   * 计算加权得分
   */
  calculateWeightedScores(normalizedScores, weightConfig) {
    return {
      weightedProfitScore: normalizedScores.normalizedProfitScore * weightConfig.profitContributionWeight,
      weightedPositionScore: normalizedScores.normalizedPositionScore * weightConfig.positionValueWeight,
      weightedPerformanceScore: normalizedScores.normalizedPerformanceScore * weightConfig.performanceWeight
    }
  }

  /**
   * 计算综合得分
   */
  calculateTotalScore(weightedScores, weightConfig) {
    const method = weightConfig.calculationMethod || 'weighted_sum'

    let totalScore;

    switch (method) {
      case 'weighted_sum':
        totalScore = weightedScores.weightedProfitScore +
               weightedScores.weightedPositionScore +
               weightedScores.weightedPerformanceScore
        break

      case 'weighted_product':
        totalScore = Math.pow(weightedScores.weightedProfitScore + 1, weightConfig.profitContributionWeight) *
               Math.pow(weightedScores.weightedPositionScore + 1, weightConfig.positionValueWeight) *
               Math.pow(weightedScores.weightedPerformanceScore + 1, weightConfig.performanceWeight) - 1
        break

      case 'hybrid':
        const sum = weightedScores.weightedProfitScore + weightedScores.weightedPositionScore + weightedScores.weightedPerformanceScore
        const product = Math.pow(weightedScores.weightedProfitScore + 1, 0.33) *
                       Math.pow(weightedScores.weightedPositionScore + 1, 0.33) *
                       Math.pow(weightedScores.weightedPerformanceScore + 1, 0.34) - 1
        totalScore = sum * 0.7 + product * 0.3
        break

      default:
        totalScore = weightedScores.weightedProfitScore +
               weightedScores.weightedPositionScore +
               weightedScores.weightedPerformanceScore
        break
    }
    
    // 确保总分在合理范围内
    const MAX_TOTAL_SCORE = 100; // 加权计算后不应超过100分
    return Math.min(MAX_TOTAL_SCORE, Math.max(0, totalScore));
  }

  /**
   * 应用调整系数
   */
  /**
   * 已弃用: 不再应用调整系数
   * 直接返回 totalScore，最终归一化将在批量计算后统一处理
   */
  applyAdjustmentFactors(totalScore, employee, weightConfig, originalScores) {
    // 直接返回原始得分，不做任何调整
    return totalScore
  }

  /**
   * 获取岗位等级乘数
   */
  getPositionLevelMultiplier(positionLevel, weightConfig) {
    // 根据岗位等级返回不同的乘数
    const levelMap = {
      'senior': weightConfig.positionLevelMultiplier,
      'middle': 1.0,
      'junior': 0.8
    }
    return levelMap[positionLevel] || 1.0
  }

  /**
   * 批量计算员工三维得分
   */
  async batchCalculateScores(employeeIds, period, weightConfigId, options = {}) {
    const results = []
    const errors = []
    const batchSize = options.batchSize || 10 // 批处理大小

    console.log(`📋 开始批量计算: ${employeeIds.length} 名员工，批大小: ${batchSize}`)

    // 预加载权重配置
    const weightConfig = await databaseService.findOne('threeDimensionalWeightConfigs', { _id: weightConfigId })
    if (!weightConfig) {
      throw new Error('权重配置不存在')
    }

    // 预加载员工信息
    const allEmployees = await databaseService.find('employees', {})
    const employees = allEmployees.filter(emp => employeeIds.includes(emp._id || emp.id))

    const employeeMap = new Map()
    employees.forEach(emp => employeeMap.set(emp._id || emp.id, emp))
    
    // ✅ 批量预加载：一次性查询所有员工的绩效数据，避免 N+1 查询
    console.log(`🚀 步骤0/3: 批量预加载绩效数据...`)
    const performanceRecords = await databaseManager.query(`
      SELECT 
        employee_id,
        profit_contribution,
        position_score,
        performance_score,
        calculation_period
      FROM performance_three_dimensional_scores 
      WHERE employee_id IN (?) AND calculation_period = ?
    `, [employeeIds, period])
    
    // 构建员工ID -> 绩效记录的映射
    const performanceMap = new Map()
    performanceRecords.forEach(record => {
      performanceMap.set(record.employee_id, {
        profitContribution: parseFloat(record.profit_contribution || 0),
        positionScore: parseFloat(record.position_score || 0),
        performanceScore: parseFloat(record.performance_score || 0)
      })
    })
    
    console.log(`✅ 预加载完成: ${performanceRecords.length} 条绩效记录`)

    // **第一步：收集所有员工的原始得分**
    console.log('🔍 步骤1/3: 收集原始得分...')
    const allRawScores = []
    
    for (const employeeId of employeeIds) {
      try {
        const employee = employeeMap.get(employeeId)
        if (!employee) {
          errors.push({ employeeId, error: '员工不存在' })
          continue
        }

        // ✅ 从内存中获取预加载的绩效数据，而不是重复查询数据库
        const perfData = performanceMap.get(employeeId)
        
        // 获取三个维度的原始得分（优先使用预加载数据）
        const profitScore = perfData 
          ? { score: perfData.profitContribution, details: { source: 'preloaded' }, dataVersion: new Date().toISOString() }
          : await this.getProfitContributionScore(employeeId, period, options)
        
        const positionScore = perfData
          ? { score: perfData.positionScore, details: { source: 'preloaded' }, dataVersion: new Date().toISOString() }
          : await this.getPositionValueScore(employeeId, period, options)
        
        const performanceScore = perfData
          ? { score: perfData.performanceScore, details: { source: 'preloaded' }, dataVersion: new Date().toISOString() }
          : await this.getPerformanceScore(employeeId, period, options)
        
        allRawScores.push({
          employeeId,
          employee,
          profitScore,
          positionScore,
          performanceScore
        })
      } catch (error) {
        errors.push({ employeeId, error: error.message })
      }
    }
    
    console.log(`✅ 收集完成: ${allRawScores.length} 名员工的原始得分`)
    
    // **第二步：使用当前批次数据统一归一化**
    console.log('🔍 步骤2/3: 统一归一化并计算最终得分...')
    
    for (const rawScore of allRawScores) {
      try {
        const { employeeId, employee, profitScore, positionScore, performanceScore } = rawScore
        
        // 归一化得分（传入所有原始得分作为参考）
        const normalizedScores = await this.normalizeScores(
          { profitScore, positionScore, performanceScore },
          period,
          { 
            ...options,
            batchScores: allRawScores,  // 关键：传入当前批次数据
            normalizationMethod: weightConfig.normalizationMethod || 'min_max'
          }
        )

        // 计算加权得分
        const weightedScores = this.calculateWeightedScores(normalizedScores, weightConfig)

        // 计算综合得分
        const totalScore = this.calculateTotalScore(weightedScores, weightConfig)

        // 不再应用调整系数，直接使用 totalScore
        const adjustedScore = totalScore

        results.push({
          employeeId,
          employee,
          period,
          weightConfigId,
          originalScores: { profitScore, positionScore, performanceScore },
          normalizedScores,
          weightedScores,
          totalScore,
          adjustedScore,
          weights: this.extractWeights(weightConfig),
          calculationParams: {
            method: weightConfig.calculationMethod,
            normalizationMethod: weightConfig.normalizationMethod
          }
        })
      } catch (error) {
        errors.push({ employeeId: rawScore.employeeId, error: error.message })
      }
    }

    console.log(`✅ 批量计算完成: 成功 ${results.length} 个，失败 ${errors.length} 个`)
    
    // 检查是否有得分超过100分，如果有则进行归一化
    console.log(`🔍 步骤3/3: 检查得分范围并归一化...`)
    const maxScore = Math.max(...results.map(r => r.adjustedScore || 0))
    if (maxScore > 100) {
      console.log(`📊 检测到最高分 ${maxScore.toFixed(2)} 超过100分，开始归一化到百分制...`)
      
      // 归一化公式: normalizedScore = (score / maxScore) * 100
      results.forEach(result => {
        const originalScore = result.adjustedScore
        result.adjustedScore = (originalScore / maxScore) * 100
        result.totalScore = result.adjustedScore // 同步更新 totalScore
        
        console.log(`  员工 ${result.employeeId}: ${originalScore.toFixed(2)} → ${result.adjustedScore.toFixed(2)}`)
      })
      
      console.log(`✅ 归一化完成: 所有得分已映射到 0-100 分范围`)
    } else {
      console.log(`✅ 所有得分在 0-100 分范围内，无需归一化`)
    }
    
    return { results, errors }
  }

  /**
   * 保存计算结果到数据库
   */
  async saveCalculationResult(calculationData, bonusPoolId = null) {
    try {
      const {
        employeeId,
        period,
        weightConfigId,
        originalScores,
        normalizedScores,
        weightedScores,
        totalScore,
        adjustedScore,
        calculationParams
      } = calculationData

      // 确保 weightConfigId 有有效值
      const validWeightConfigId = weightConfigId || 0;

      // 检查是否已存在相同记录
      const existingResult = await databaseService.findOne('threeDimensionalCalculationResults', {
        employeeId,
        weightConfigId: validWeightConfigId,
        calculationPeriod: period
      })

      // 计算奖金金额（如果有奖金池信息）
      let baseBonusAmount = null
      let adjustmentAmount = null
      let finalBonusAmount = null

      if (calculationData.bonusPoolAmount && calculationData.totalScoreSum) {
        const distributableAmount = parseFloat(calculationData.bonusPoolAmount)
        const totalScoreSum = parseFloat(calculationData.totalScoreSum)
        const employeeFinalScore = calculationData.finalCoefficientScore || calculationData.adjustedScore || totalScore
        
        console.log(`  💵 员工 ${employeeId} 奖金计算: 最终系数得分=${employeeFinalScore.toFixed(2)}, 总得分=${totalScoreSum.toFixed(2)}, 可分配=${distributableAmount.toLocaleString()}`)

        if (distributableAmount > 0 && totalScoreSum > 0 && employeeFinalScore > 0) {
          // 按照最终系数得分比例分配奖金
          baseBonusAmount = (employeeFinalScore / totalScoreSum) * distributableAmount
          adjustmentAmount = 0 // 默认无调整
          finalBonusAmount = baseBonusAmount + adjustmentAmount
          console.log(`  ✅ 分配奖金: ￥${finalBonusAmount.toFixed(2)}`)
        } else {
          console.warn(`  ⚠️ 奖金计算条件不满足: distributableAmount=${distributableAmount}, totalScoreSum=${totalScoreSum}, employeeFinalScore=${employeeFinalScore}`)
        }
      }

      const resultData = {
        employeeId,
        weightConfigId: validWeightConfigId,
        calculationPeriod: period,
        bonusPoolId,

        // 原始得分
        profitContributionScore: originalScores.profitScore.score,
        positionValueScore: originalScores.positionScore.score,
        performanceScore: originalScores.performanceScore.score,

        // 标准化得分
        normalizedProfitScore: normalizedScores.normalizedProfitScore,
        normalizedPositionScore: normalizedScores.normalizedPositionScore,
        normalizedPerformanceScore: normalizedScores.normalizedPerformanceScore,

        // 加权得分
        weightedProfitScore: weightedScores.weightedProfitScore,
        weightedPositionScore: weightedScores.weightedPositionScore,
        weightedPerformanceScore: weightedScores.weightedPerformanceScore,

        // 综合得分
        totalScore,
        adjustedScore,
        finalScore: calculationData.finalCoefficientScore || adjustedScore || totalScore,  // 使用最终系数得分作为finalScore
        
        // ⭐ 新增：系数字段（用于前端展示计算过程）
        baseThreeDimensionalScore: calculationData.baseThreeDimensionalScore || adjustedScore || totalScore,  // 三维基础得分
        finalCoefficientScore: calculationData.finalCoefficientScore || adjustedScore || totalScore,  // 最终系数得分
        positionBenchmark: calculationData.positionBenchmark || 1.0,  // 岗位基准值系数
        cityCoefficient: calculationData.cityCoefficient || 1.0,  // 城市系数
        businessLineCoefficient: calculationData.businessLineCoefficient || 1.0,  // 业务线系数
        performanceCoefficient: calculationData.performanceCoefficient || 1.0,  // 绩效系数
        timeCoefficient: calculationData.timeCoefficient || 1.0,  // 时间系数

        // 奖金金额
        baseBonusAmount: baseBonusAmount !== null ? Math.round(baseBonusAmount * 100) / 100 : null,
        adjustmentAmount: adjustmentAmount !== null ? Math.round(adjustmentAmount * 100) / 100 : null,
        finalBonusAmount: finalBonusAmount !== null ? Math.round(finalBonusAmount * 100) / 100 : null,

        // 详细计算数据
        profitCalculationDetails: originalScores.profitScore.details,
        positionCalculationDetails: originalScores.positionScore.details,
        performanceCalculationDetails: originalScores.performanceScore.details,

        // 计算方法和参数
        calculationMethod: calculationParams.method,
        calculationParams,

        // 数据版本
        profitDataVersion: originalScores.profitScore.dataVersion,
        positionDataVersion: originalScores.positionScore.dataVersion,
        performanceDataVersion: originalScores.performanceScore.dataVersion,

        // 审核状态 - admin执行的计算自动批准
        reviewStatus: 'approved',
        reviewedBy: null,  // 系统自动批准，无需指定审核人
        reviewedAt: new Date(),
        reviewComments: '系统自动批准',

        calculatedAt: new Date(),
        createdBy: calculationData.createdBy || 1
      }

      let result
      if (existingResult) {
        // 更新现有记录
        await databaseService.update('threeDimensionalCalculationResults', { _id: existingResult._id }, resultData)
        // 返回包含奖金金额的数据
        result = { ...existingResult, ...resultData }
      } else {
        // 创建新记录
        result = await databaseService.insert('threeDimensionalCalculationResults', resultData)
        // 确保返回数据包含奖金字段
        result = { ...result, ...resultData }
      }

      return result
    } catch (error) {
      console.error('保存计算结果失败:', error)
      throw new Error(`保存失败: ${error.message}`)
    }
  }

  /**
   * 批量保存计算结果
   */
  async batchSaveResults(calculationResults, bonusPoolId = null, createdBy = 1) {
    try {
      // 检查是否需要清除之前的计算结果
      if (bonusPoolId && calculationResults && calculationResults.length > 0) {
        // 获取当前奖金池中已有的计算记录数量
        const existingResults = await databaseService.find('threeDimensionalCalculationResults', { bonusPoolId })
        const existingCount = existingResults.length
        const currentCount = calculationResults.length
        
        // 如果当前计算的员工数量少于已存在的计算记录数量，先删除之前的记录
        if (currentCount < existingCount) {
          console.log(`📊 奖金池 ${bonusPoolId}: 当前计算员工数量(${currentCount}) < 已存在记录数量(${existingCount})，删除之前的计算结果...`)
          await databaseService.remove('threeDimensionalCalculationResults', { bonusPoolId })
          console.log(`✅ 已删除奖金池 ${bonusPoolId} 下的 ${existingCount} 条计算结果记录`)
        }
      }
      
      const savedResults = []

      // 计算奖金分配（如果有奖金池）
      let distributableAmount = 0
      let totalScoreSum = 0

      if (bonusPoolId) {
        // 获取奖金池信息
        const bonusPool = await databaseService.findOne('bonusPools', { _id: bonusPoolId })
        if (bonusPool) {
          distributableAmount = parseFloat(bonusPool.distributableAmount || bonusPool.distributable_amount || 0)
          
          // 新的计算逻辑：应用系数后再求和
          console.log('📊 开始计算员工系数...')
          
          for (const result of calculationResults) {
            const employee = result.employee
            const baseScore = result.adjustedScore || result.totalScore || 0
            
            // 1. 岗位基准值系数 (0.1-3.0)
            let positionBenchmark = 1.0
            const employeeId = result.employeeId || employee._id || employee.id
            
            // 直接从数据库查询员工的岗位基准值
            const employeeWithPosition = await databaseManager.query(`
              SELECT p.benchmark_value 
              FROM employees e
              LEFT JOIN positions p ON e.position_id = p.id
              WHERE e.id = ?
            `, [employeeId])
            
            if (employeeWithPosition && employeeWithPosition.length > 0 && employeeWithPosition[0].benchmark_value) {
              positionBenchmark = parseFloat(employeeWithPosition[0].benchmark_value) || 1.0
            }
            
            // 2. 城市系数 (0.8-1.5)
            let cityCoefficient = 1.0
            if (employee.cityId) {
              const city = await databaseService.findOne('cities', { _id: employee.cityId })
              if (city && city.coefficient) {
                cityCoefficient = parseFloat(city.coefficient) || 1.0
              }
            }
            
            // 3. 业务线权重系数 (0.8-1.5)，从百分制权重转换
            let businessLineCoefficient = 1.0
            const businessLineId = employee.businessLineId || employee.business_line_id
            if (businessLineId) {
              const businessLine = await databaseService.findOne('businessLines', { _id: businessLineId })
              if (businessLine && businessLine.weight) {
                const weight = parseFloat(businessLine.weight) || 0
                // 百分制 (0-100) 转换为 0.8-1.5
                businessLineCoefficient = 0.8 + (weight / 100) * 0.7
              }
            }
            
            // 4. 绩效系数 (0.5-2.0)，从百分制转换
            let performanceCoefficient = 1.0
            const performanceScore = result.originalScores?.performanceScore?.score || 0
            if (performanceScore > 0) {
              // 百分制 (0-100) 转换为 0.5-2.0
              performanceCoefficient = 0.5 + (performanceScore / 100) * 1.5
            }
            
            // 5. 时间系数 (0-1.2)，根据实际出勤天数计算
            let timeCoefficient = 1.0
            let workTime = 0
            let realWorkTime = 0
            
            try {
              // 从绩效记录表获取考勤数据
              const attendanceData = await databaseManager.query(`
                SELECT work_time, real_work_time
                FROM performance_three_dimensional_scores
                WHERE employee_id = ? AND calculation_period = ?
                LIMIT 1
              `, [employeeId, result.period])
              
              if (attendanceData && attendanceData.length > 0) {
                workTime = parseFloat(attendanceData[0].work_time) || 0
                realWorkTime = parseFloat(attendanceData[0].real_work_time) || 0
                
                // 计算时间系数
                if (workTime > 0 && realWorkTime > 0) {
                  timeCoefficient = realWorkTime / workTime
                  
                  // 限制时间系数在合理范围内 (0-1.2)
                  // 允许超出一些，但不超过120%
                  timeCoefficient = Math.max(0, Math.min(1.2, timeCoefficient))
                  
                  console.log(`  员工 ${employee.name || employeeId} 考勤: 应出勤=${workTime}天, 实际=${realWorkTime}天, 时间系数=${timeCoefficient.toFixed(2)}`)
                } else if (workTime === 0 && realWorkTime === 0) {
                  // 如果都为0，默认系数为1.0
                  timeCoefficient = 1.0
                  console.log(`  员工 ${employee.name || employeeId} 无考勤数据，时间系数默认1.0`)
                } else {
                  // 异常情况：应出勤为0但实际不为0，或相反
                  console.warn(`  ⚠️ 员工 ${employee.name || employeeId} 考勤数据异常: 应出勤=${workTime}, 实际=${realWorkTime}，使用默认系数1.0`)
                  timeCoefficient = 1.0
                }
              } else {
                console.log(`  员工 ${employee.name || employeeId} 未找到考勤记录，时间系数默认1.0`)
              }
            } catch (error) {
              console.error(`  ❌ 获取员工 ${employeeId} 考勤数据失败:`, error.message)
              timeCoefficient = 1.0
            }
            
            // 计算最终系数得分 = 三维得分 × 岗位基准值 × 城市系数 × 业务线系数 × 绩效系数 × 时间系数
            const finalCoefficientScore = baseScore * positionBenchmark * cityCoefficient * businessLineCoefficient * performanceCoefficient * timeCoefficient
            
            // 保存所有系数到 result 对象（用于数据库存储和前端展示）
            result.baseThreeDimensionalScore = baseScore  // 三维基础得分（应用系数前）
            result.finalCoefficientScore = finalCoefficientScore  // 最终系数得分（应用系数后）
            result.positionBenchmark = positionBenchmark  // 岗位基准值系数
            result.cityCoefficient = cityCoefficient  // 城市系数
            result.businessLineCoefficient = businessLineCoefficient  // 业务线系数
            result.performanceCoefficient = performanceCoefficient  // 绩效系数
            result.timeCoefficient = timeCoefficient  // 时间系数
            result.workTime = workTime  // 应出勤天数（不存数据库）
            result.realWorkTime = realWorkTime  // 实际出勤天数（不存数据库）
            
            console.log(`  员工 ${employee.name || result.employeeId}: 三维=${baseScore.toFixed(2)}, 岗位=${positionBenchmark.toFixed(2)}, 城市=${cityCoefficient.toFixed(2)}, 业务线=${businessLineCoefficient.toFixed(2)}, 绩效=${performanceCoefficient.toFixed(2)}, 时间=${timeCoefficient.toFixed(2)} → 最终=${finalCoefficientScore.toFixed(2)}`)
          }
          
          // 计算所有员工的总得分（使用最终系数得分）
          totalScoreSum = calculationResults.reduce((sum, result) => {
            const score = result.finalCoefficientScore || 0
            return sum + score
          }, 0)

          console.log(`💰 奖金分配: 可分配金额=￥${distributableAmount.toLocaleString()}, 总得分=${totalScoreSum.toFixed(2)}`)
          
          // 如果总得分为0，输出详细诊断信息
          if (totalScoreSum === 0) {
            console.warn(`⚠️ 总得分为0，无法分配奖金！`)
            console.log(`诊断信息:`)
            calculationResults.slice(0, 3).forEach((result, index) => {
              console.log(`  员工${index + 1}:`, {
                employeeId: result.employeeId,
                profitScore: result.originalScores?.profitScore?.score,
                positionScore: result.originalScores?.positionScore?.score,
                performanceScore: result.originalScores?.performanceScore?.score,
                normalizedProfit: result.normalizedScores?.normalizedProfitScore,
                normalizedPosition: result.normalizedScores?.normalizedPositionScore,
                normalizedPerformance: result.normalizedScores?.normalizedPerformanceScore,
                totalScore: result.totalScore,
                adjustedScore: result.adjustedScore
              })
            })
          }
        }
      }

      for (const calculationData of calculationResults) {
        calculationData.createdBy = createdBy
        
        // 如果有奖金池，添加奖金计算参数
        if (distributableAmount > 0 && totalScoreSum > 0) {
          calculationData.bonusPoolAmount = distributableAmount
          calculationData.totalScoreSum = totalScoreSum
        }

        const result = await this.saveCalculationResult(calculationData, bonusPoolId)
        savedResults.push(result)
      }

      // 输出奖金统计
      if (distributableAmount > 0) {
        const totalAllocated = savedResults.reduce((sum, result) => {
          return sum + parseFloat(result.finalBonusAmount || result.final_bonus_amount || 0)
        }, 0)
        console.log(`✅ 奖金分配完成: 已分配=￥${totalAllocated.toLocaleString()}, 剩余=￥${(distributableAmount - totalAllocated).toLocaleString()}`)
      }

      return savedResults
    } catch (error) {
      throw error
    }
  }

  /**
   * 计算排名和百分位
   */
  async calculateRankings(period, weightConfigId = null) {
    try {
      const whereClause = { calculationPeriod: period }
      if (weightConfigId) {
        whereClause.weightConfigId = weightConfigId
      }

      // 获取所有结果
      const results = await databaseService.find('threeDimensionalCalculationResults', whereClause, {
        order: [['final_score', 'DESC']]
      })

      // 手动查询员工信息
      const employeeIds = [...new Set(results.map(r => r.employeeId).filter(Boolean))]
      const employeesMap = new Map()
      
      if (employeeIds.length > 0) {
        const allEmployees = await databaseService.find('employees', {})
        const employees = allEmployees.filter(emp => employeeIds.includes(emp._id || emp.id))
        
        // 查询部门和岗位信息
        const departmentIds = [...new Set(employees.map(e => e.departmentId).filter(Boolean))]
        const positionIds = [...new Set(employees.map(e => e.positionId).filter(Boolean))]
        
        const departmentsMap = new Map()
        const positionsMap = new Map()
        
        if (departmentIds.length > 0) {
          const allDepartments = await databaseService.find('departments', {})
          const departments = allDepartments.filter(dept => departmentIds.includes(dept._id || dept.id))
          departments.forEach(d => departmentsMap.set(d._id, d))
        }
        
        if (positionIds.length > 0) {
          const allPositions = await databaseService.find('positions', {})
          const positions = allPositions.filter(pos => positionIds.includes(pos._id || pos.id))
          positions.forEach(p => positionsMap.set(p._id, p))
        }
        
        // 关联数据
        employees.forEach(emp => {
          employeesMap.set(emp._id, {
            ...emp,
            Department: emp.departmentId ? departmentsMap.get(emp.departmentId) : null,
            Position: emp.positionId ? positionsMap.get(emp.positionId) : null
          })
        })
      }
      
      // 为结果添加员工信息
      results.forEach(result => {
        result.Employee = employeesMap.get(result.employeeId) || null
      })

      // 计算总体排名和百分位
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        await databaseService.update('threeDimensionalCalculationResults', { _id: result._id }, {
          scoreRank: i + 1,
          percentileRank: ((results.length - i) / results.length) * 100
        })
      }

      // 计算部门内排名
      const departmentGroups = {}
      results.forEach(result => {
        // 防止 Employee 未定义导致错误
        if (!result.Employee) {
          console.warn(`⚠️ 员工信息缺失，无法计算部门排名: employeeId=${result.employeeId}`)
          return
        }
        const deptId = result.Employee.departmentId
        if (!deptId) {
          console.warn(`⚠️ 员工部门信息缺失，无法计算部门排名: employeeId=${result.employeeId}`)
          return
        }
        if (!departmentGroups[deptId]) {
          departmentGroups[deptId] = []
        }
        departmentGroups[deptId].push(result)
      })

      for (const deptId in departmentGroups) {
        const deptResults = departmentGroups[deptId]
        for (let i = 0; i < deptResults.length; i++) {
          await databaseService.update('threeDimensionalCalculationResults', { _id: deptResults[i]._id }, {
            departmentRank: i + 1
          })
        }
      }

      // 计算同等级排名
      const levelGroups = {}
      results.forEach(result => {
        // 防止 Employee 未定义导致错误
        if (!result.Employee) {
          console.warn(`⚠️ 员工信息缺失，无法计算等级排名: employeeId=${result.employeeId}`)
          return
        }
        const level = result.Employee.Position?.level || 'unknown'
        if (!levelGroups[level]) {
          levelGroups[level] = []
        }
        levelGroups[level].push(result)
      })

      for (const level in levelGroups) {
        const levelResults = levelGroups[level]
        for (let i = 0; i < levelResults.length; i++) {
          await databaseService.update('threeDimensionalCalculationResults', { _id: levelResults[i]._id }, {
            levelRank: i + 1
          })
        }
      }

      return results
    } catch (error) {
      console.error('计算排名失败:', error)
      throw new Error(`排名计算失败: ${error.message}`)
    }
  }

  /**
   * 优化版本的单个员工计算
   */
  async calculateEmployeeScoreOptimized(employeeId, employee, period, weightConfig, options = {}) {
    try {
      // 并发获取三个维度的得分
      const [profitScore, positionScore, performanceScore] = await Promise.all([
        this.getProfitContributionScore(employeeId, period, options),
        this.getPositionValueScore(employeeId, period, options),
        this.getPerformanceScore(employeeId, period, options)
      ])

      // 标准化得分（简化版）
      const normalizedScores = this.normalizeScoresOptimized({
        profitScore,
        positionScore,
        performanceScore
      }, options)

      // 计算加权得分
      const weightedScores = this.calculateWeightedScores(normalizedScores, weightConfig)

      // 计算综合得分
      const totalScore = this.calculateTotalScore(weightedScores, weightConfig)

      // 不再应用调整系数，直接使用 totalScore
      const adjustedScore = totalScore

      return {
        employeeId,
        employee,
        period,
        weightConfigId: weightConfig.id,
        originalScores: { profitScore, positionScore, performanceScore },
        normalizedScores,
        weightedScores,
        totalScore,
        adjustedScore,
        weights: this.extractWeights(weightConfig),
        calculationParams: {
          method: weightConfig.calculationMethod,
          normalizationMethod: weightConfig.normalizationMethod
        }
      }

    } catch (error) {
      console.error(`优化计算员工${employeeId}得分失败:`, error)
      throw new Error(`计算失败: ${error.message}`)
    }
  }

  /**
   * 优化版本的得分标准化（使用预计算统计值）
   */
  normalizeScoresOptimized(scores, options = {}) {
    // 使用默认的标准化参数或传入的统计值
    const stats = options.normalizationStats || {
      profit: { mean: 0.5, std: 0.2 },
      position: { mean: 0.6, std: 0.25 },
      performance: { mean: 0.7, std: 0.2 }
    }

    const zScoreNormalize = (value, mean, std) => {
      return std > 0 ? (value - mean) / std : 0
    }

    return {
      normalizedProfitScore: zScoreNormalize(
        scores.profitScore.score,
        stats.profit.mean,
        stats.profit.std
      ),
      normalizedPositionScore: zScoreNormalize(
        scores.positionScore.score,
        stats.position.mean,
        stats.position.std
      ),
      normalizedPerformanceScore: zScoreNormalize(
        scores.performanceScore.score,
        stats.performance.mean,
        stats.performance.std
      )
    }
  }

  /**
   * 获取所有员工得分数据（用于标准化）
   */
  async getAllEmployeeScores(period, options = {}) {
    try {
      // 使用 databaseManager 直接查询数据
      const results = await databaseManager.query(`
        SELECT 
          profit_contribution_score,
          position_value_score,
          performance_score
        FROM three_dimensional_calculation_results
        WHERE calculation_period = ?
        ORDER BY calculated_at DESC
      `, [period])

      // 如果有足够的实际数据（至少10条记录），使用实际数据
      if (results && results.length >= 10) {
        console.log(`✅ 使用实际计算数据进行标准化：${results.length} 条记录`)
        return {
          profitScores: results.map(r => parseFloat(r.profit_contribution_score) || 0),
          positionScores: results.map(r => parseFloat(r.position_value_score) || 0),
          performanceScores: results.map(r => parseFloat(r.performance_score) || 0)
        }
      }
      
      // 如果数据不足，尝试使用当前批次的数据（不限制条数）
      if (results && results.length > 0) {
        console.log(`⚠️ 实际数据不足 (${results.length} 条)，使用当前批次数据`)
        return {
          profitScores: results.map(r => parseFloat(r.profit_contribution_score) || 0),
          positionScores: results.map(r => parseFloat(r.position_value_score) || 0),
          performanceScores: results.map(r => parseFloat(r.performance_score) || 0)
        }
      }
    } catch (error) {
      console.warn('获取历史得分数据失败，使用默认值:', error.message)
    }

    // 如果没有任何实际数据，使用默认的模拟数据
    console.log('⚠️ 没有历史数据，使用默认模拟数据进行标准化')
    return {
      // 利润贡献得分范围：0-100
      profitScores: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      // 岗位价值得分范围：0.1-3.0（基准值范围）
      positionScores: [0.1, 0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0],
      // 绩效表现得分范围：0-100
      performanceScores: [30, 40, 50, 60, 70, 75, 80, 85, 90, 95]
    }
  }

  /**
   * 提取权重配置
   */
  extractWeights(weightConfig) {
    return {
      main: {
        profitContributionWeight: weightConfig.profitContributionWeight,
        positionValueWeight: weightConfig.positionValueWeight,
        performanceWeight: weightConfig.performanceWeight
      },
      profit: {
        directContributionWeight: weightConfig.profitDirectContributionWeight,
        workloadWeight: weightConfig.profitWorkloadWeight,
        qualityWeight: weightConfig.profitQualityWeight,
        positionValueWeight: weightConfig.profitPositionValueWeight
      },
      position: {
        skillComplexityWeight: weightConfig.positionSkillComplexityWeight,
        responsibilityWeight: weightConfig.positionResponsibilityWeight,
        decisionImpactWeight: weightConfig.positionDecisionImpactWeight,
        experienceWeight: weightConfig.positionExperienceWeight,
        marketValueWeight: weightConfig.positionMarketValueWeight
      },
      performance: {
        workOutputWeight: weightConfig.performanceWorkOutputWeight,
        workQualityWeight: weightConfig.performanceWorkQualityWeight,
        workEfficiencyWeight: weightConfig.performanceWorkEfficiencyWeight,
        collaborationWeight: weightConfig.performanceCollaborationWeight,
        innovationWeight: weightConfig.performanceInnovationWeight,
        leadershipWeight: weightConfig.performanceLeadershipWeight,
        learningWeight: weightConfig.performanceLearningWeight
      }
    }
  }

  /**
   * 获取计算结果统计
   */
  async getCalculationStatistics(period, weightConfigId = null) {
    try {
      const whereClause = { calculationPeriod: period }
      if (weightConfigId) {
        whereClause.weightConfigId = weightConfigId
      }

      // 使用聚合查询获取统计信息
      const stats = await databaseService.aggregate('threeDimensionalCalculationResults', [
        { $match: whereClause },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            avgScore: { $avg: '$finalScore' },
            maxScore: { $max: '$finalScore' },
            minScore: { $min: '$finalScore' },
            stdDev: { $stdDevPop: '$finalScore' },
            avgProfitScore: { $avg: '$profitContributionScore' },
            avgPositionScore: { $avg: '$positionValueScore' },
            avgPerformanceScore: { $avg: '$performanceScore' }
          }
        }
      ])

      return stats[0] || {}
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw new Error(`统计失败: ${error.message}`)
    }
  }
}

module.exports = new ThreeDimensionalCalculationService()