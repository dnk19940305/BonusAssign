const { 
  PerformanceIndicator,
  PerformanceAssessment,
  PerformanceIndicatorData,
  Employee,
  Position,
  Department,
  BusinessLine,
  sequelize
} = require('../models')
const { Op } = require('sequelize')
const logger = require('../utils/logger')
const { databaseManager } = require('../config/database')
class PerformanceCalculationService {
  /**
   * 计算员工绩效评估
   */
  async calculatePerformanceAssessment(employeeId, assessmentPeriod, assessmentType = 'quarterly', options = {}) {
    try {
      logger.info(`开始计算员工绩效评估: employeeId=${employeeId}, period=${assessmentPeriod}, type=${assessmentType}`)
      
      // 1. 获取员工信息
      const employee = await this.getEmployeeInfo(employeeId)
      
      // 2. 获取适用的绩效指标
      const indicators = await this.getApplicableIndicators(employeeId)
      
      // 3. 获取或创建评估记录
      const assessment = await this.getOrCreateAssessment(employeeId, assessmentPeriod, assessmentType)
      
      // 4. 计算各指标得分
      const indicatorScores = await this.calculateIndicatorScores(assessment.id, indicators, employee, assessmentPeriod)
      
      // 5. 计算综合得分
      const overallScore = await this.calculateOverallScore(indicatorScores, indicators)
      
      // 6. 计算等级和系数
      const gradeAndCoefficient = this.calculateGradeAndCoefficient(overallScore)
      
      // 7. 更新评估记录
      await this.updateAssessmentResult(assessment, overallScore, gradeAndCoefficient, indicatorScores)
      
      // 8. 生成分析报告
      const analysisReport = await this.generateAnalysisReport(assessment, indicatorScores, employee)
      
      return {
        assessmentId: assessment.id,
        employeeId,
        assessmentPeriod,
        assessmentType,
        employee: {
          name: employee.name,
          employeeNo: employee.employeeNo,
          position: employee.Position ? employee.Position.name : '未分配岗位',
          level: employee.Position ? employee.Position.level : 'N/A'
        },
        overallScore,
        performanceGrade: gradeAndCoefficient.grade,
        finalCoefficient: gradeAndCoefficient.coefficient,
        indicatorScores,
        categoryScores: this.calculateCategoryScores(indicatorScores),
        analysisReport,
        recommendations: this.generateRecommendations(indicatorScores, overallScore)
      }
    } catch (error) {
      logger.error('Calculate performance assessment error:', error)
      throw error
    }
  }
  
  /**
   * 获取员工信息
   */
  async getEmployeeInfo(employeeId) {
    try {
      // 使用数据库管理器直接查询员工及关联信息
      
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
      
      // 构建符合原有结构的员工对象，包含关联的Position和Department
      return {
        id: employee.id,
        name: employee.name,
        employeeNo: employee.employee_no,
        positionId: employee.position_id,
        departmentId: employee.department_id,
        annualSalary: employee.annual_salary,
        entryDate: employee.entry_date,
        status: employee.status,
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
        } : null
      }
    } catch (error) {
      console.error('获取员工信息失败:', error)
      throw error
    }
  }
  
  /**
   * 获取适用的绩效指标
   * 修复了员工对象关联问题
   */
  async getApplicableIndicators(employeeId) {
    try {
      // 使用数据库管理器直接查询员工和岗位信息
      
      const employeeResult = await databaseManager.query(`
        SELECT e.*, p.level as position_level, p.line_id as position_line_id 
        FROM employees e 
        JOIN positions p ON e.position_id = p.id 
        WHERE e.id = ?
      `, [employeeId])
      
      if (employeeResult.length === 0) {
        throw new Error(`Employee ${employeeId} not found`)
      }
      
      const employee = employeeResult[0]
      
      // 构建符合原有结构的员工对象
      const employeeObj = {
        id: employee.id,
        name: employee.name,
        positionId: employee.position_id,
        departmentId: employee.department_id,
        Position: {
          id: employee.position_id,
          level: employee.position_level,
          lineId: employee.position_line_id
        }
      }
      
      // 查询适用的指标
      const indicators = await PerformanceIndicator.findAll({
        where: {
          isActive: 1,
          [Op.or]: [
            // 通用等级指标
            { applicableLevels: null },
            // 特定等级指标
            {
              applicableLevels: {
                [Op.contains]: [employeeObj.Position.level]
              }
            }
          ],
          [Op.or]: [
            // 通用业务线指标
            { applicableBusinessLines: null },
            // 特定业务线指标
            {
              applicableBusinessLines: {
                [Op.contains]: [employeeObj.Position.lineId]
              }
            }
          ]
        },
        order: [['category', 'ASC']]
      })
      
      return indicators
    } catch (error) {
      console.error('获取适用指标失败:', error)
      // 返回空数组而不是抛出错误，避免中断整个流程
      return []
    }
  }
  
  /**
   * 生成随机ID（16位字符串）
   */
  generateId(prefix = '') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = prefix
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 获取或创建评估记录
   */
  async getOrCreateAssessment(employeeId, assessmentPeriod) {
    
    // 查询现有评估记录
    const assessmentResult = await databaseManager.query(`
      SELECT * FROM performance_assessments
      WHERE employee_id = ? AND period = ?
      LIMIT 1
    `, [employeeId, assessmentPeriod])
    
    let assessment = assessmentResult[0]
    
    if (!assessment) {
      // 生成新的 ID
      const newId = this.generateId()
      
      // 创建新的评估记录
      await databaseManager.query(`
        INSERT INTO performance_assessments 
        (id, employee_id, period, review_status, status, created_by, evaluator_id, updated_by, created_at, updated_at)
        VALUES (?, ?, ?, 'in_progress', 1, 1, 1, 1, NOW(), NOW())
      `, [newId, employeeId, assessmentPeriod])
      
      // 获取刚创建的记录
      const newAssessmentResult = await databaseManager.query(`
        SELECT * FROM performance_assessments WHERE id = ?
      `, [newId])
      
      assessment = newAssessmentResult[0] || { id: newId }
    }
    
    return assessment
  }
  
  /**
   * 计算各指标得分
   */
  async calculateIndicatorScores(assessmentId, indicators, employee, period) {
    const indicatorScores = []

    
    for (const indicator of indicators) {
      try {
        // 查询指标数据记录
        const indicatorDataResult = await databaseManager.query(`
          SELECT * FROM performance_indicator_data
          WHERE indicator_id = ? AND employee_id = ? AND period = ?
          LIMIT 1
        `, [indicator.id, employee.id, period])
        
        let indicatorData = indicatorDataResult[0]
        
        if (!indicatorData) {
          // 生成新的 ID
          const newId = this.generateId()
          
          // 创建新的指标数据记录
          await databaseManager.query(`
            INSERT INTO performance_indicator_data 
            (id, indicator_id, employee_id, period, status, created_by, updated_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, 1, 1, 1, NOW(), NOW())
          `, [newId, indicator.id, employee.id, period])
          
          // 获取刚创建的记录
          const newDataResult = await databaseManager.query(`
            SELECT * FROM performance_indicator_data WHERE id = ?
          `, [newId])
          
          indicatorData = newDataResult[0] || { id: newId }
        }
        
        // 计算指标得分
        const score = await this.calculateSingleIndicatorScore(indicator, indicatorData, employee, period)
        
        // 更新指标数据（只更新 score 字段，因为表中没有 data_quality 字段）
        await databaseManager.query(`
          UPDATE performance_indicator_data 
          SET score = ?, updated_at = NOW()
          WHERE id = ?
        `, [score.calculatedScore, indicatorData.id])
        
        indicatorScores.push({
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          indicatorCode: indicator.code,
          category: indicator.category,
          ...score,
          indicator: typeof indicator.toJSON === 'function' ? indicator.toJSON() : indicator
        })
      } catch (error) {
        logger.error(`Calculate indicator ${indicator.code} error:`, error)
        // 记录错误但继续处理其他指标
        indicatorScores.push({
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          indicatorCode: indicator.code,
          category: indicator.category,
          calculatedScore: 0,
          normalizedScore: 0,
          error: error.message
        })
      }
    }
    
    return indicatorScores
  }
  
  /**
   * 计算单个指标得分
   */
  async calculateSingleIndicatorScore(indicator, indicatorData, employee, period) {
    switch (indicator.category) {
      case 'work_output':
        return await this.calculateWorkOutputScore(indicator, indicatorData, employee, period)
      case 'work_quality':
        return await this.calculateWorkQualityScore(indicator, indicatorData, employee, period)
      case 'work_efficiency':
        return await this.calculateWorkEfficiencyScore(indicator, indicatorData, employee, period)
      case 'collaboration':
        return await this.calculateCollaborationScore(indicator, indicatorData, employee, period)
      case 'innovation':
        return await this.calculateInnovationScore(indicator, indicatorData, employee, period)
      case 'leadership':
        return await this.calculateLeadershipScore(indicator, indicatorData, employee, period)
      case 'learning':
        return await this.calculateLearningScore(indicator, indicatorData, employee, period)
      case 'behavior':
        return await this.calculateBehaviorScore(indicator, indicatorData, employee, period)
      default:
        return await this.calculateGenericScore(indicator, indicatorData, employee, period)
    }
  }
  
  /**
   * 计算工作产出得分
   */
  async calculateWorkOutputScore(indicator, indicatorData, employee, period) {
    // 检查员工是否有岗位信息
    if (!employee.Position || !employee.Position.level) {
      console.warn(`员工 ${employee.id} 没有岗位信息，使用默认分数`)
      return {
        calculatedScore: 75,
        normalizedScore: 75,
        method: 'work_output_calculation',
        dataQuality: 'low',
        warning: '员工未分配岗位'
      }
    }
    
    // 基于岗位等级的基础分
    const levelScores = {
      'P1': 70, 'P2': 72, 'P3': 75, 'P4': 78, 'P5': 80, 'P6': 82, 'P7': 85,
      'M1': 75, 'M2': 78, 'M3': 80, 'M4': 85,
      'S1': 72, 'S2': 75, 'S3': 78, 'S4': 80
    }
    
    let baseScore = levelScores[employee.Position.level] || 75
    
    // 根据指标代码进行具体计算
    switch (indicator.code) {
      case 'WORK_OUTPUT_TASKS_COMPLETED':
        // 任务完成数量
        const tasksCompleted = await this.getTasksCompletedCount(employee.id, period)
        const targetTasks = indicator.targetValue || 10
        const completionRate = Math.min(tasksCompleted / targetTasks, 1.5)
        baseScore = Math.round(baseScore * completionRate)
        break
        
      case 'WORK_OUTPUT_DELIVERABLES':
        // 交付物质量
        const deliverableScore = await this.getDeliverableQualityScore(employee.id, period)
        baseScore = Math.round(baseScore + (deliverableScore - 75) * 0.5)
        break
        
      case 'WORK_OUTPUT_REVENUE':
        // 收入贡献（销售人员）
        if (employee.Position.name.includes('销售')) {
          const revenue = await this.getRevenueContribution(employee.id, period)
          const targetRevenue = indicator.targetValue || 1000000
          const revenueRate = Math.min(revenue / targetRevenue, 2.0)
          baseScore = Math.round(75 + revenueRate * 25)
        }
        break
        
      default:
        // 通用计算逻辑
        if (indicatorData.actualValue && indicator.targetValue) {
          const achievementRate = indicatorData.actualValue / indicator.targetValue
          baseScore = Math.round(baseScore * Math.min(achievementRate, 1.5))
        }
    }
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'work_output_calculation',
      dataQuality: 'medium',
      params: {
        baseScore,
        levelBonus: levelScores[employee.Position.level] || 75,
        indicator: indicator.code
      }
    }
  }
  
  /**
   * 计算工作质量得分
   */
  async calculateWorkQualityScore(indicator, indicatorData, employee, period) {
    let baseScore = 75
    
    switch (indicator.code) {
      case 'WORK_QUALITY_DEFECT_RATE':
        // 缺陷率 (越低越好)
        const defectRate = await this.getDefectRate(employee.id, period)
        const targetDefectRate = indicator.targetValue || 0.05 // 5%
        const qualityScore = Math.max(0, (targetDefectRate - defectRate) / targetDefectRate * 100)
        baseScore = Math.min(100, qualityScore)
        break
        
      case 'WORK_QUALITY_REVIEW_SCORE':
        // 代码/工作评审得分
        const reviewScore = await this.getReviewScore(employee.id, period)
        baseScore = reviewScore
        break
        
      case 'WORK_QUALITY_CLIENT_SATISFACTION':
        // 客户满意度
        const clientSatisfaction = await this.getClientSatisfactionScore(employee.id, period)
        baseScore = clientSatisfaction
        break
        
      default:
        if (indicatorData.actualValue !== null) {
          baseScore = Math.min(100, indicatorData.actualValue)
        }
    }
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'work_quality_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算工作效率得分
   */
  async calculateWorkEfficiencyScore(indicator, indicatorData, employee, period) {
    let baseScore = 75
    
    switch (indicator.code) {
      case 'WORK_EFFICIENCY_TIME_MANAGEMENT':
        // 时间管理效率
        const timeEfficiency = await this.getTimeEfficiencyScore(employee.id, period)
        baseScore = timeEfficiency
        break
        
      case 'WORK_EFFICIENCY_PRODUCTIVITY':
        // 生产力指标
        const productivity = await this.getProductivityScore(employee.id, period)
        baseScore = productivity
        break
        
      default:
        if (indicatorData.actualValue !== null && indicator.targetValue) {
          const efficiencyRate = indicatorData.actualValue / indicator.targetValue
          baseScore = Math.min(100, efficiencyRate * 75)
        }
    }
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'work_efficiency_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算协作能力得分
   */
  async calculateCollaborationScore(indicator, indicatorData, employee, period) {
    let baseScore = 75
    
    // 基于同事评价和项目协作表现
    const peerFeedbackScore = await this.getPeerFeedbackScore(employee.id, period)
    const teamworkScore = await this.getTeamworkScore(employee.id, period)
    
    baseScore = (peerFeedbackScore * 0.6 + teamworkScore * 0.4)
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'collaboration_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算创新能力得分
   */
  async calculateInnovationScore(indicator, indicatorData, employee, period) {
    let baseScore = 70 // 创新能力基础分相对较低
    
    // 基于提案数量、专利、改进建议等
    const innovationCount = await this.getInnovationCount(employee.id, period)
    const improvementSuggestions = await this.getImprovementSuggestionsCount(employee.id, period)
    
    baseScore = 60 + Math.min(40, innovationCount * 10 + improvementSuggestions * 5)
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'innovation_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算领导力得分
   */
  async calculateLeadershipScore(indicator, indicatorData, employee, period) {
    let baseScore = 70
    
    // 只对管理岗位计算领导力
    if (employee.Position.level.startsWith('M')) {
      const teamPerformance = await this.getTeamPerformanceScore(employee.id, period)
      const subordinateFeedback = await this.getSubordinateFeedbackScore(employee.id, period)
      
      baseScore = (teamPerformance * 0.7 + subordinateFeedback * 0.3)
    } else {
      // 非管理岗位基于项目领导表现
      const projectLeadership = await this.getProjectLeadershipScore(employee.id, period)
      baseScore = projectLeadership
    }
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'leadership_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算学习能力得分
   */
  async calculateLearningScore(indicator, indicatorData, employee, period) {
    let baseScore = 75
    
    // 基于培训参与、技能提升、认证获得等
    const trainingScore = await this.getTrainingParticipationScore(employee.id, period)
    const skillImprovementScore = await this.getSkillImprovementScore(employee.id, period)
    const certificationScore = await this.getCertificationScore(employee.id, period)
    
    baseScore = (trainingScore * 0.4 + skillImprovementScore * 0.4 + certificationScore * 0.2)
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'learning_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 计算行为表现得分
   */
  async calculateBehaviorScore(indicator, indicatorData, employee, period) {
    let baseScore = 80 // 行为表现基础分较高
    
    // 基于考勤、纪律、价值观践行等
    const attendanceScore = await this.getAttendanceScore(employee.id, period)
    const disciplineScore = await this.getDisciplineScore(employee.id, period)
    const valuesScore = await this.getValuesScore(employee.id, period)
    
    baseScore = (attendanceScore * 0.3 + disciplineScore * 0.3 + valuesScore * 0.4)
    
    const normalizedScore = Math.max(0, Math.min(100, baseScore))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'behavior_calculation',
      dataQuality: 'medium'
    }
  }
  
  /**
   * 通用得分计算
   */
  async calculateGenericScore(indicator, indicatorData, employee, period) {
    let score = 75 // 默认分数
    
    if (indicatorData.actualValue !== null && indicator.targetValue) {
      const achievementRate = indicatorData.actualValue / indicator.targetValue
      score = Math.min(100, achievementRate * 80)
    } else if (indicatorData.actualValue !== null && indicator.maxValue) {
      score = (indicatorData.actualValue / indicator.maxValue) * 100
    }
    
    const normalizedScore = Math.max(0, Math.min(100, score))
    
    return {
      calculatedScore: normalizedScore,
      normalizedScore,
      method: 'generic_calculation',
      dataQuality: 'low'
    }
  }
  
  // ========== 辅助数据获取方法 (模拟) ==========
  
  async getTasksCompletedCount(employeeId, period) {
    // 模拟任务完成数量
    return Math.floor(Math.random() * 20) + 5
  }
  
  async getDeliverableQualityScore(employeeId, period) {
    // 模拟交付物质量得分
    return Math.floor(Math.random() * 30) + 70
  }
  
  async getRevenueContribution(employeeId, period) {
    // 模拟收入贡献
    return Math.floor(Math.random() * 2000000) + 500000
  }
  
  async getDefectRate(employeeId, period) {
    // 模拟缺陷率
    return Math.random() * 0.1
  }
  
  async getReviewScore(employeeId, period) {
    // 模拟评审得分
    return Math.floor(Math.random() * 25) + 75
  }
  
  async getClientSatisfactionScore(employeeId, period) {
    // 模拟客户满意度
    return Math.floor(Math.random() * 20) + 80
  }
  
  async getTimeEfficiencyScore(employeeId, period) {
    return Math.floor(Math.random() * 25) + 70
  }
  
  async getProductivityScore(employeeId, period) {
    return Math.floor(Math.random() * 30) + 70
  }
  
  async getPeerFeedbackScore(employeeId, period) {
    return Math.floor(Math.random() * 20) + 75
  }
  
  async getTeamworkScore(employeeId, period) {
    return Math.floor(Math.random() * 25) + 70
  }
  
  async getInnovationCount(employeeId, period) {
    return Math.floor(Math.random() * 3)
  }
  
  async getImprovementSuggestionsCount(employeeId, period) {
    return Math.floor(Math.random() * 5)
  }
  
  async getTeamPerformanceScore(employeeId, period) {
    return Math.floor(Math.random() * 25) + 70
  }
  
  async getSubordinateFeedbackScore(employeeId, period) {
    return Math.floor(Math.random() * 20) + 75
  }
  
  async getProjectLeadershipScore(employeeId, period) {
    return Math.floor(Math.random() * 30) + 65
  }
  
  async getTrainingParticipationScore(employeeId, period) {
    return Math.floor(Math.random() * 25) + 70
  }
  
  async getSkillImprovementScore(employeeId, period) {
    return Math.floor(Math.random() * 30) + 70
  }
  
  async getCertificationScore(employeeId, period) {
    return Math.floor(Math.random() * 40) + 60
  }
  
  async getAttendanceScore(employeeId, period) {
    return Math.floor(Math.random() * 15) + 85
  }
  
  async getDisciplineScore(employeeId, period) {
    return Math.floor(Math.random() * 10) + 90
  }
  
  async getValuesScore(employeeId, period) {
    return Math.floor(Math.random() * 20) + 80
  }
  
  // ========== 综合计算方法 ==========
  
  /**
   * 计算综合得分
   */
  calculateOverallScore(indicatorScores, indicators) {
    // 防御性检查：如果没有指标或得分，返回默认值
    if (!indicators || indicators.length === 0) {
      console.warn('⚠️ 没有找到绩效指标，返回默认分数 75')
      return 75
    }
    
    if (!indicatorScores || indicatorScores.length === 0) {
      console.warn('⚠️ 没有指标得分数据，返回默认分数 75')
      return 75
    }
    
    const totalWeight = indicators.reduce((sum, indicator) => sum + (indicator.weight || 0), 0)
    
    if (totalWeight === 0) {
      console.warn('⚠️ 总权重为0，返回默认分数 75')
      return 75
    }
    
    const weightedSum = indicatorScores.reduce((sum, score) => {
      const calculatedScore = score.calculatedScore || 0
      const weight = score.weight || 0
      return sum + (calculatedScore * weight)
    }, 0)
    
    const finalScore = Math.round(weightedSum / totalWeight * 100) / 100
    
    // 防止NaN
    if (isNaN(finalScore)) {
      console.error('❌ 计算结果为NaN，返回默认分数 75')
      return 75
    }
    
    return finalScore
  }
  
  /**
   * 计算各类别得分
   */
  calculateCategoryScores(indicatorScores) {
    const categories = {}
    
    indicatorScores.forEach(score => {
      if (!categories[score.category]) {
        categories[score.category] = {
          totalScore: 0,
          totalWeight: 0,
          count: 0
        }
      }
      
      categories[score.category].totalScore += score.calculatedScore * score.weight
      categories[score.category].totalWeight += score.weight
      categories[score.category].count++
    })
    
    // 计算各类别加权平均分
    Object.keys(categories).forEach(category => {
      const cat = categories[category]
      cat.averageScore = cat.totalWeight > 0 ? cat.totalScore / cat.totalWeight : 0
    })
    
    return categories
  }
  
  /**
   * 计算等级和系数
   */
  calculateGradeAndCoefficient(overallScore) {
    let grade, coefficient
    
    if (overallScore >= 95) {
      grade = 'S'
      coefficient = 1.5
    } else if (overallScore >= 90) {
      grade = 'A+'
      coefficient = 1.3
    } else if (overallScore >= 85) {
      grade = 'A'
      coefficient = 1.2
    } else if (overallScore >= 80) {
      grade = 'B+'
      coefficient = 1.1
    } else if (overallScore >= 75) {
      grade = 'B'
      coefficient = 1.0
    } else if (overallScore >= 70) {
      grade = 'C+'
      coefficient = 0.9
    } else if (overallScore >= 65) {
      grade = 'C'
      coefficient = 0.8
    } else {
      grade = 'D'
      coefficient = 0.6
    }
    
    return { grade, coefficient }
  }
  
  /**
   * 更新评估结果
   * 修复了update方法不存在的问题
   */
  async updateAssessmentResult(assessment, overallScore, gradeAndCoefficient, indicatorScores) {
    try {
      // 确保分数是有效数值
      const validOverallScore = isNaN(overallScore) ? 0 : overallScore;
      const validCoefficient = isNaN(gradeAndCoefficient?.coefficient) ? 1 : gradeAndCoefficient.coefficient;
      
      // 构建更新数据（使用数据库实际字段名）
      const updateData = {
        overallScore: validOverallScore,
        rating: gradeAndCoefficient?.grade || 'C',
        coefficient: validCoefficient,
        indicatorScores: indicatorScores || [],
        reviewStatus: 'approved',
        updatedBy: 1
      }
      
      // 使用模型适配器的正确update方法格式
      const result = await PerformanceAssessment.update(updateData, {
        where: { id: assessment.id }
      })
      return result
    } catch (error) {
      console.error('更新评估结果失败:', error)
      throw error
    }
  }
  
  /**
   * 生成分析报告
   */
  async generateAnalysisReport(assessment, indicatorScores, employee) {
    const strengths = []
    const weaknesses = []
    const insights = []
    
    // 分析优势领域
    indicatorScores.forEach(score => {
      if (score.calculatedScore >= 85) {
        strengths.push({
          indicator: score.indicatorName,
          category: score.category,
          score: score.calculatedScore,
          description: `在${score.indicatorName}方面表现优异`
        })
      } else if (score.calculatedScore < 70) {
        weaknesses.push({
          indicator: score.indicatorName,
          category: score.category,
          score: score.calculatedScore,
          description: `${score.indicatorName}需要重点改进`
        })
      }
    })
    
    // 生成洞察
    if (assessment.overallFinalScore >= 85) {
      insights.push('整体绩效表现优秀，在多个维度都有良好表现')
    } else if (assessment.overallFinalScore < 75) {
      insights.push('绩效表现有待提升，建议制定针对性改进计划')
    }
    
    return {
      strengths,
      weaknesses,
      insights,
      overallPerformance: this.getPerformanceDescription(assessment.overallFinalScore),
      benchmarkComparison: await this.getBenchmarkComparison(employee, assessment.overallFinalScore)
    }
  }
  
  /**
   * 生成改进建议
   */
  generateRecommendations(indicatorScores, overallScore) {
    const recommendations = []
    
    // 基于低分指标生成建议
    indicatorScores.forEach(score => {
      if (score.calculatedScore < 70) {
        recommendations.push({
          category: score.category,
          indicator: score.indicatorName,
          currentScore: score.calculatedScore,
          suggestion: this.getImprovementSuggestion(score.category, score.calculatedScore),
          priority: score.calculatedScore < 60 ? 'high' : 'medium'
        })
      }
    })
    
    // 整体建议
    if (overallScore < 75) {
      recommendations.push({
        category: 'overall',
        suggestion: '建议制定全面的绩效改进计划，重点关注薄弱环节',
        priority: 'high'
      })
    }
    
    return recommendations
  }
  
  /**
   * 获取改进建议
   */
  getImprovementSuggestion(category, score) {
    const suggestions = {
      work_output: '建议设定更明确的工作目标，提高任务完成效率',
      work_quality: '建议加强质量控制，注重细节和客户满意度',
      work_efficiency: '建议优化工作流程，提升时间管理能力',
      collaboration: '建议加强团队协作，主动参与跨部门项目',
      innovation: '建议多提创新想法，积极参与改进活动',
      leadership: '建议培养领导技能，加强团队管理能力',
      learning: '建议积极参加培训，持续提升专业技能',
      behavior: '建议保持良好的工作态度和职业操守'
    }
    
    return suggestions[category] || '建议制定具体的改进计划'
  }
  
  /**
   * 获取绩效描述
   */
  getPerformanceDescription(score) {
    if (score >= 95) return '卓越表现，超出预期'
    if (score >= 85) return '优秀表现，符合高标准'
    if (score >= 75) return '良好表现，达到预期'
    if (score >= 65) return '基本达标，有改进空间'
    return '表现不佳，需要重点关注'
  }
  
  /**
   * 获取基准对比
   */
  async getBenchmarkComparison(employee, score) {
    // 模拟基准对比数据
    return {
      departmentAverage: Math.floor(Math.random() * 20) + 70,
      companyAverage: Math.floor(Math.random() * 15) + 75,
      positionAverage: Math.floor(Math.random() * 18) + 72,
      percentileRank: Math.floor((score / 100) * 90) + 10
    }
  }
  
  /**
   * 批量计算绩效评估
   */
  async batchCalculatePerformanceAssessments(employeeIds, assessmentPeriod, assessmentType = 'quarterly') {
    const results = []
    const errors = []
    
    for (const employeeId of employeeIds) {
      try {
        const result = await this.calculatePerformanceAssessment(employeeId, assessmentPeriod, assessmentType)
        results.push(result)
      } catch (error) {
        errors.push({ employeeId, error: error.message })
      }
    }
    
    return { results, errors }
  }
}

module.exports = new PerformanceCalculationService()