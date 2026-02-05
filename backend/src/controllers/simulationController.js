const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')
const projectBonusService = require('../services/projectBonusService')

class SimulationController {
  // 根据业务线代码获取当前默认权重
  getLineCurrentWeight(code) {
    const defaultWeights = {
      'implementation': 0.55,  // 实施
      'presales': 0.20,        // 售前
      'marketing': 0.15,       // 市场
      'operation': 0.10        // 运营
    }
    return defaultWeights[code] || 0.25 // 默认平均权重
  }
  // 运行参数模拟
  async runParameterSimulation(req, res, next) {
    try {
      const {
        bonusPoolId,
        totalProfit,
        poolRatio,
        lineWeights,
        minBonusRatio,
        maxBonusRatio,
        businessLines = []
      } = req.body

      console.log('📊 参数模拟请求:', { bonusPoolId, totalProfit, poolRatio, lineWeights })

      // 获取奖金池信息（用于对比）
      const bonusPool = await databaseService.findOne('bonusPools', { _id: bonusPoolId })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 使用新参数计算模拟的奖金池总额
      const newPoolAmount = totalProfit * poolRatio
      const newDistributableAmount = newPoolAmount * 0.95 // 95%可分配

      // 根据业务线权重分配奖金
      const lineAllocations = []
      let totalWeight = 0

      // 计算总权重
      for (const lineId in lineWeights) {
        totalWeight += lineWeights[lineId]
      }

      // 按权重分配奖金
      for (const lineId in lineWeights) {
        const weight = lineWeights[lineId]
        const lineBonus = newDistributableAmount * (weight / totalWeight)
        
        // 查找业务线信息
        const line = businessLines.find(l => l.id === lineId)
        
        lineAllocations.push({
          lineId,
          lineName: line ? line.name : '未知业务线',
          lineCode: line ? line.code : '',
          weight: weight / totalWeight,
          simulatedBonus: lineBonus
        })
      }

      // 计算当前实际值（用于对比）
      const currentPoolAmount = bonusPool.pool_amount || 0
      const currentDistributableAmount = currentPoolAmount * 0.95

      // 构建对比数据
      const lineComparison = lineAllocations.map(allocation => {
        // 使用当前奖金池的权重计算当前值
        const currentBonus = currentDistributableAmount * allocation.weight
        
        return {
          lineId: allocation.lineId,
          lineName: allocation.lineName,
          currentBonus,
          simulatedBonus: allocation.simulatedBonus,
          change: currentBonus > 0 ? (allocation.simulatedBonus - currentBonus) / currentBonus : 0,
          changeAmount: allocation.simulatedBonus - currentBonus
        }
      })

      // 计算总体变化
      const totalSimulatedBonus = lineAllocations.reduce((sum, item) => sum + item.simulatedBonus, 0)
      const totalCurrentBonus = currentDistributableAmount
      const totalBonusChange = totalCurrentBonus > 0 ? (totalSimulatedBonus - totalCurrentBonus) / totalCurrentBonus : 0

      const simulationResult = {
        totalBonusChange,
        avgBonusChange: totalBonusChange, // 简化，直接使用总体变化率
        affectedEmployees: 0, // 这里不计算具体人数，因为是全局模拟
        lineComparison,
        detail: {
          currentTotal: totalCurrentBonus,
          simulatedTotal: totalSimulatedBonus,
          poolAmount: newPoolAmount,
          distributableAmount: newDistributableAmount,
          parameters: {
            totalProfit,
            poolRatio,
            lineWeights
          }
        }
      }

      logger.info(`参数模拟完成: 奖金池${bonusPoolId}, 模拟总额${totalSimulatedBonus.toFixed(2)}`)

      res.json({
        code: 200,
        data: simulationResult,
        message: '参数模拟完成'
      })

    } catch (error) {
      logger.error('Parameter simulation error:', error)
      next(error)
    }
  }

  // 保存模拟场景
  async saveScenario(req, res, next) {
    try {
      const {
        name,
        description,
        basePoolId,
        parameters,
        isPublic = false
      } = req.body

      if (!name) {
        return res.status(400).json({
          code: 400,
          message: '场景名称不能为空',
          data: null
        })
      }

      // 这里应该保存到数据库，暂时模拟
      const scenario = {
        id: Date.now(),
        name,
        description,
        basePoolId,
        parameters,
        isPublic,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        // 模拟计算结果
        totalBonus: 1500000,
        avgBonus: 10000,
        utilizationRate: 0.95
      }

      logger.info(`模拟场景创建: ${name}`)

      res.json({
        code: 200,
        data: scenario,
        message: '场景保存成功'
      })

    } catch (error) {
      logger.error('Save scenario error:', error)
      next(error)
    }
  }

  // 获取保存的场景列表
  async getScenarios(req, res, next) {
    try {
      const { page = 1, pageSize = 20, isPublic } = req.query

      // 模拟场景数据
      const scenarios = [
        {
          id: 1,
          name: '基准场景',
          description: '当前参数配置',
          totalBonus: 1350000,
          avgBonus: 9000,
          utilizationRate: 0.95,
          createdAt: new Date().toISOString(),
          isPublic: true
        },
        {
          id: 2,
          name: '激进场景',
          description: '提高奖金池比例至18%',
          totalBonus: 1620000,
          avgBonus: 10800,
          utilizationRate: 0.97,
          createdAt: new Date().toISOString(),
          isPublic: false
        },
        {
          id: 3,
          name: '保守场景',
          description: '降低奖金池比例至12%',
          totalBonus: 1080000,
          avgBonus: 7200,
          utilizationRate: 0.92,
          createdAt: new Date().toISOString(),
          isPublic: true
        }
      ]

      res.json({
        code: 200,
        data: {
          scenarios,
          pagination: {
            total: scenarios.length,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(scenarios.length / pageSize)
          }
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get scenarios error:', error)
      next(error)
    }
  }

  // 运行敏感性分析
  async runSensitivityAnalysis(req, res, next) {
    try {
      const {
        bonusPoolId,
        parameter,
        range,
        step,
        lineWeights = {},
        businessLines = []
      } = req.body

      console.log('📊 敏感性分析请求:', { bonusPoolId, parameter, range, step, businessLines: businessLines.length })

      const bonusPool = await databaseService.findOne('bonusPools', { _id: bonusPoolId })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 敏感性分析计算
      const rangeValue = parseFloat(range)
      const stepValue = parseFloat(step)
      const steps = Math.floor(rangeValue * 2 / stepValue) + 1

      const analysisData = []
      for (let i = 0; i < steps; i++) {
        const changeRatio = -rangeValue + i * stepValue
        let newValue, impact

        // 解析参数类型
        if (parameter.startsWith('lineWeight_')) {
          // 业务线权重敏感性分析
          const lineId = parameter.replace('lineWeight_', '')
          const currentWeight = lineWeights[lineId] || 0.25
          newValue = currentWeight * (1 + changeRatio)
          
          // 计算业务线权重变化对总奖金的影响
          // 假设该业务线占总奖金池的当前权重比例
          impact = changeRatio * currentWeight
        } else {
          // 传统参数敏感性分析
          switch (parameter) {
            case 'totalProfit':
              newValue = bonusPool.totalAmount * (1 + changeRatio)
              impact = changeRatio * (bonusPool.profitRatio || 0.15)
              break
            case 'poolRatio':
              newValue = (bonusPool.profitRatio || 0.15) * (1 + changeRatio)
              impact = changeRatio
              break
            default:
              impact = changeRatio * 0.8 // 默认影响系数
          }
        }

        analysisData.push({
          changeRatio,
          parameter: newValue,
          impact: 1 + impact
        })
      }

      // 计算敏感度系数
      const maxImpact = Math.max(...analysisData.map(d => Math.abs(d.impact - 1)))
      const coefficient = maxImpact / rangeValue

      // 确定参数显示名称
      let parameterDisplayName = '总奖金'
      if (parameter.startsWith('lineWeight_')) {
        const lineId = parameter.replace('lineWeight_', '')
        const line = businessLines.find(l => l.id === lineId)
        parameterDisplayName = line ? `${line.name}条线权重` : '条线权重'
      } else if (parameter === 'totalProfit') {
        parameterDisplayName = '公司利润'
      } else if (parameter === 'poolRatio') {
        parameterDisplayName = '奖金池比例'
      }

      const sensitivityResult = {
        parameter,
        parameterDisplayName,
        range: rangeValue,
        step: stepValue,
        data: analysisData,
        mostSensitive: {
          metric: parameterDisplayName,
          coefficient
        },
        recommendedRange: coefficient > 1.5 ? '±10%' : coefficient > 1.0 ? '±15%' : '±20%',
        riskLevel: coefficient > 1.5 ? '高' : coefficient > 1.0 ? '中' : '低'
      }

      logger.info(`敏感性分析完成: 奖金池${bonusPoolId}, 参数${parameter}`)

      res.json({
        code: 200,
        data: sensitivityResult,
        message: '敏感性分析完成'
      })

    } catch (error) {
      logger.error('Sensitivity analysis error:', error)
      next(error)
    }
  }

  // 获取历史分析数据
  async getHistoryAnalysis(req, res, next) {
    try {
      const { dateRange, metric = 'totalBonus' } = req.query

      if (!dateRange) {
        return res.status(400).json({
          code: 400,
          message: '请选择日期范围',
          data: null
        })
      }

      // 模拟历史数据
      const historyData = {
        metric,
        periods: ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'],
        values: [1200000, 1350000, 1280000, 1450000, 1420000],
        avgGrowthRate: 8.5,
        maxVolatility: 12.3,
        trendPrediction: 6.2
      }

      res.json({
        code: 200,
        data: historyData,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get history analysis error:', error)
      next(error)
    }
  }

  // 删除场景
  async deleteScenario(req, res, next) {
    try {
      const { id } = req.params

      // 这里应该从数据库删除
      logger.info(`删除模拟场景: ${id}`)

      res.json({
        code: 200,
        data: null,
        message: '删除成功'
      })

    } catch (error) {
      logger.error('Delete scenario error:', error)
      next(error)
    }
  }
}

module.exports = new SimulationController()