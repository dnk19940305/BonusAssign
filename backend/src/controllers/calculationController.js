const databaseService = require('../services/databaseService')
const { BonusPool, Employee, Department, Position, BusinessLine } = require('../models')
const logger = require('../utils/logger')
const bonusAllocationService = require('../services/bonusAllocationService')
const threeDimensionalCalculationService = require('../services/threeDimensionalCalculationService')
const projectBonusService = require('../services/projectBonusService')
const personalBonusService = require('../services/personalBonusService')


class CalculationController {
  /**
   * 验证给定期间是否录入了员工绩效数据
   */
  async validatePerformanceData(req, res, next) {
    try {
      const { period } = req.query

      if (!period) {
        return res.status(400).json({
          code: 400,
          message: '期间不能为空',
          data: null
        })
      }

      const { databaseManager } = require('../config/database')

      // 获取所有活跃员工数量（排除管理员）
      const activeEmployees = await databaseManager.query(`
        SELECT e.id
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE e.status = 1
          AND (r.name IS NULL OR r.name != '系统管理员')
      `)

      const totalActiveEmployees = activeEmployees.length

      // 查询该期间有绩效数据的员工数量
      let performanceRecords
      
      // 判断是年度计算还是季度/月度计算
      if (/^\d{4}$/.test(period)) {
        // 年度计算：查找该年的所有季度数据
        performanceRecords = await databaseManager.query(`
          SELECT DISTINCT employee_id
          FROM performance_three_dimensional_scores
          WHERE calculation_period LIKE ?
            AND performance_score IS NOT NULL
            AND performance_score > 0
        `, [`${period}Q%`])
      } else {
        // 季度/月度计算
        performanceRecords = await databaseManager.query(`
          SELECT DISTINCT employee_id
          FROM performance_three_dimensional_scores
          WHERE calculation_period = ?
            AND performance_score IS NOT NULL
            AND performance_score > 0
        `, [period])
      }

      const employeesWithPerformance = performanceRecords.length
      const coverageRate = totalActiveEmployees > 0 
        ? (employeesWithPerformance / totalActiveEmployees * 100).toFixed(2)
        : 0

      // 如果没有任何绩效数据，返回错误
      if (employeesWithPerformance === 0) {
        return res.status(200).json({
          code: 400,
          message: `该期间（${period}）没有录入任何员工绩效数据，请先在绩效记录管理中录入员工绩效。`,
          data: {
            period,
            totalActiveEmployees,
            employeesWithPerformance: 0,
            coverageRate: '0.00',
            hasPerformanceData: false
          }
        })
      }

      // 如果覆盖率过低（小于50%），给出警告
      if (coverageRate < 50) {
        return res.json({
          code: 200,
          message: `该期间绩效数据不完整，仅录入了 ${employeesWithPerformance}/${totalActiveEmployees} 人（${coverageRate}%），建议补充其他员工的绩效数据。`,
          data: {
            period,
            totalActiveEmployees,
            employeesWithPerformance,
            coverageRate,
            hasPerformanceData: true,
            warning: true
          }
        })
      }

      // 数据完整
      res.json({
        code: 200,
        message: `绩效数据验证通过，已录入 ${employeesWithPerformance}/${totalActiveEmployees} 人（${coverageRate}%）。`,
        data: {
          period,
          totalActiveEmployees,
          employeesWithPerformance,
          coverageRate,
          hasPerformanceData: true,
          warning: false
        }
      })

    } catch (error) {
      logger.error('Validate performance data error:', error)
      next(error)
    }
  }

  // 获取奖金池列表
  async getBonusPools(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        status
      } = req.query

      const offset = (page - 1) * pageSize
      const where = {}

      if (status) where.status = status

      // 使用动态服务选择
      const allPools = await databaseService.find('bonusPools', where)
      const count = allPools.length

      // 手动分页
      const rows = allPools
        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
        .slice(offset, offset + parseInt(pageSize))

      res.json({
        code: 200,
        data: {
          bonusPools: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(count / pageSize)
          }
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get bonus pools error:', error)
      next(error)
    }
  }

  // 获取奖金池详情
  async getBonusPoolDetail(req, res, next) {
    try {
      const { id } = req.params

      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      res.json({
        code: 200,
        data: bonusPool,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get bonus pool detail error:', error)
      next(error)
    }
  }

  // 更新奖金池
  async updateBonusPool(req, res, next) {
    try {
      const { id } = req.params
      const updates = req.body

      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // ✅ 已发放的奖金池不能修改
      if (bonusPool.status === 'paid') {
        return res.status(400).json({
          code: 400,
          message: '已发放的奖金池不能修改',
          data: null
        })
      }

      // 重新计算相关金额
      if (updates.totalProfit || updates.poolRatio) {
        const totalProfit = updates.totalProfit || bonusPool.totalProfit
        const poolRatio = updates.poolRatio || bonusPool.poolRatio
        const reserveRatio = updates.reserveRatio || bonusPool.reserveRatio
        const specialRatio = updates.specialRatio || bonusPool.specialRatio

        updates.poolAmount = totalProfit * poolRatio
        updates.distributableAmount = updates.poolAmount * (1 - reserveRatio - specialRatio)
      }

      await databaseService.update('bonusPools', { _id: id }, updates)
      const updatedPool = await databaseService.findOne('bonusPools', { _id: id })

      logger.info(`奖金池更新成功: ${updatedPool.period}`)

      res.json({
        code: 200,
        data: updatedPool,
        message: '更新成功'
      })

    } catch (error) {
      logger.error('Update bonus pool error:', error)
      next(error)
    }
  }

  // 导出奖金池计算结果
  async exportBonusPoolResult(req, res, next) {
    try {
      const { id } = req.params
      const { format = 'excel' } = req.query

      // 获取奖金池信息
      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 查询三维计算结果（而不是bonus_allocation_results）
      const allocations = await databaseService.find('threeDimensionalCalculationResults', {
        bonusPoolId: id
      })

      if (!allocations || allocations.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '该奖金池暂无计算结果',
          data: null
        })
      }

      // 获取员工信息以丰富导出数据
      const employeeIds = [...new Set(allocations.map(a => a.employeeId))]
      const employees = await databaseService.find('employees', {})
      const employeeMap = new Map(employees.map(e => [e.id || e._id, e]))

      // 获取部门和岗位信息
      const departments = await databaseService.find('departments', {})
      const positions = await databaseService.find('positions', {})
      const departmentMap = new Map(departments.map(d => [d.id || d._id, d]))
      const positionMap = new Map(positions.map(p => [p.id || p._id, p]))

      // 准备导出数据
      const exportData = allocations.map(item => {
        const employee = employeeMap.get(item.employeeId || item.employee_id) || {}
        const department = departmentMap.get(employee.departmentId || employee.department_id) || {}
        const position = positionMap.get(employee.positionId || employee.position_id) || {}
        
        return {
          '员工工号': employee.employeeNo || employee.employee_no || '',
          '员工姓名': employee.name || '',
          '部门': department.name || '',
          '岗位': position.name || '',
          '期间': item.calculationPeriod || item.calculation_period || bonusPool.period,
          '利润贡献评分': (item.profitContributionScore || item.profit_contribution_score || 0).toFixed(2),
          '岗位价值评分': (item.positionValueScore || item.position_value_score || 0).toFixed(2),
          '绩效评分': (item.performanceScore || item.performance_score || 0).toFixed(2),
          '总评分': (item.totalScore || item.total_score || 0).toFixed(2),
          '最终评分': (item.finalScore || item.final_score || 0).toFixed(2),
          '基础奖金金额': (item.baseBonusAmount || item.base_bonus_amount || 0).toFixed(2),
          '调整金额': (item.adjustmentAmount || item.adjustment_amount || 0).toFixed(2),
          '最终奖金金额': (item.finalBonusAmount || item.final_bonus_amount || 0).toFixed(2),
          '评审状态': item.reviewStatus === 'pending' ? '待审核' : item.reviewStatus === 'approved' ? '已批准' : item.reviewStatus === 'rejected' ? '已拒绝' : item.reviewStatus || item.review_status || '',
          '计算时间': item.calculatedAt || item.calculated_at || item.createdAt || item.created_at
        }
      })

      // 使用导出服务
      const dataExportService = require('../services/dataExportService')
      const exportResult = await dataExportService.exportToExcel(
        exportData,
        `奖金池计算结果_${bonusPool.period}`,
        {
          sheetName: '分配明细',
          headers: Object.keys(exportData[0] || {})
        }
      )

      if (!exportResult.success) {
        throw new Error(exportResult.error || '导出失败')
      }

      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(exportResult.fileName)}"`)

      // 读取并发送文件
      const fs = require('fs')
      const fileStream = fs.createReadStream(exportResult.filePath)
      fileStream.pipe(res)

      // 文件发送后删除临时文件
      fileStream.on('end', () => {
        fs.unlinkSync(exportResult.filePath)
      })

      logger.info(`用户 ${req.user?.id} 导出奖金池 ${id} 的计算结果`)

    } catch (error) {
      logger.error('Export bonus pool result error:', error)
      next(error)
    }
  }

  // 删除奖金池
  async deleteBonusPool(req, res, next) {
    try {
      const { id } = req.params

      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // ✅ 已发放的奖金池不能删除
      if (bonusPool.status === 'allocated' || bonusPool.status === 'paid') {
        return res.status(400).json({
          code: 400,
          message: bonusPool.status === 'paid' ? '已发放的奖金池不能删除' : '已分配的奖金池不能删除',
          data: null
        })
      }

      // 删除奖金池前先删除相关的三维计算结果
      await databaseService.remove('threeDimensionalCalculationResults', { bonus_pool_id: id })
      
      await databaseService.remove('bonusPools', { _id: id })

      logger.info(`奖金池删除成功: ${bonusPool.period}，已同时删除相关三维计算结果`)

      res.json({
        code: 200,
        data: null,
        message: '删除成功'
      })

    } catch (error) {
      logger.error('Delete bonus pool error:', error)
      next(error)
    }
  }

  // 创建奖金池
  async createBonusPool(req, res, next) {
    try {
      const {
        period,
        totalProfit,
        poolRatio,
        reserveRatio = 0.02,
        specialRatio = 0.03,
        lineWeights
      } = req.body

      logger.info(`尝试创建奖金池: period=${period}, totalProfit=${totalProfit}, poolRatio=${poolRatio}`)

      // 检查期间是否已存在
      const existingPool = await databaseService.findOne('bonusPools', { period })
      if (existingPool) {
        logger.warn(`奖金池已存在: period=${period}, existingPoolId=${existingPool.id || existingPool._id}, existingPeriod=${existingPool.period}`)
        return res.status(400).json({
          code: 400,
          message: '该期间的奖金池已存在',
          data: null
        })
      }

      logger.info(`未找到已存在的奖金池，继续创建: period=${period}`)

      // 计算奖金池金额
      const poolAmount = totalProfit * poolRatio
      const distributableAmount = poolAmount * (1 - reserveRatio - specialRatio)
      
      // 后端财务验证：获取公司总体财务数据
      try {
        const projectCostService = require('../services/projectCostService')
        const allProjectCosts = await projectCostService.getAllProjectCostSummaries()
        
        // 计算公司总预算、总成本和总利润
        const companyTotalBudget = allProjectCosts.reduce((sum, project) => sum + (Number(project.totalBudget) || 0), 0)
        const companyTotalCost = allProjectCosts.reduce((sum, project) => sum + (Number(project.totalCost) || 0), 0)
        const companyExpectedProfit = companyTotalBudget - companyTotalCost
        const companyAllocatedBonus = allProjectCosts.reduce((sum, project) => sum + (Number(project.allocatedProjectBonus) || 0), 0)
        const companyAvailableProfit = allProjectCosts.reduce((sum, project) => sum + (Number(project.availableProfit) || 0), 0)
        
        // 查询已创建的公司级奖金池总额
        const existingBonusPools = await databaseService.find('bonusPools', {})
        const allocatedCompanyBonus = existingBonusPools.reduce((sum, pool) => sum + (parseFloat(pool.poolAmount) || 0), 0)
        
        // 计算真正的可用利润 = 可用利润 - 已分配的公司级奖金
        const finalAvailableProfit = companyAvailableProfit - allocatedCompanyBonus
        
        logger.info(`公司财务校验 - 总预算: ${companyTotalBudget}, 总成本: ${companyTotalCost}, 预期利润: ${companyExpectedProfit}, 已分配项目奖金: ${companyAllocatedBonus}, 已分配公司奖金: ${allocatedCompanyBonus}, 最终可用利润: ${finalAvailableProfit}, 输入总利润: ${totalProfit}, 奖金池金额: ${poolAmount}`)
        
        // 硬性限制：奖金池金额不能超过公司总预算
        if (companyTotalBudget > 0 && poolAmount > companyTotalBudget) {
          logger.warn(`奖金池金额 ${poolAmount} 超过公司总预算 ${companyTotalBudget}`)
          return res.status(400).json({
            code: 400,
            message: `奖金池金额 ¥${poolAmount.toLocaleString()} 不能超过公司总预算 ¥${companyTotalBudget.toLocaleString()}`,
            data: null
          })
        }
        
        // 软性警告：输入的总利润超过实际可用利润150%时记录警告
        if (finalAvailableProfit > 0 && totalProfit > finalAvailableProfit * 1.5) {
          logger.warn(`输入的总利润 ${totalProfit} 超过实际可用利润 ${finalAvailableProfit} 的50%`)
        }
        
        // 硬性限制：奖金池金额不能超过输入的总利润
        if (poolAmount > totalProfit) {
          logger.warn(`奖金池金额 ${poolAmount} 超过输入的总利润 ${totalProfit}`)
          return res.status(400).json({
            code: 400,
            message: `奖金池金额 ¥${poolAmount.toLocaleString()} 不能超过公司总利润 ¥${totalProfit.toLocaleString()}`,
            data: null
          })
        }
        
        // 软性警告：如果奖金池金额超过可用利润，记录警告
        if (finalAvailableProfit > 0 && poolAmount > finalAvailableProfit) {
          logger.warn(`奖金池金额 ${poolAmount} 超过可用利润 ${finalAvailableProfit}（已扣除历史奖金）`)
        }
        
      } catch (verifyError) {
        // 如果财务校验失败，记录警告但不阻止创建
        logger.warn('公司财务数据校验失败:', verifyError.message)
      }

      const bonusPool = await databaseService.insert('bonusPools', {
        period,
        totalProfit,
        poolRatio,
        poolAmount,
        reserveRatio,
        specialRatio,
        distributableAmount,
        status: 'draft',
        createdBy: req.user?.id || 'system'
      })

      logger.info(`奖金池创建成功: ${period}`)

      res.json({
        code: 200,
        data: {
          id: bonusPool._id || bonusPool.id,
          period: bonusPool.period,
          poolAmount: bonusPool.poolAmount,
          distributableAmount: bonusPool.distributableAmount
        },
        message: '创建成功'
      })

    } catch (error) {
      logger.error('Create bonus pool error:', error)
      next(error)
    }
  }

  // 执行奖金计算
  async calculate(req, res, next) {
    try {
      const {
        poolId,
        weightConfigId,
        allocationRuleId,
        calculationType = 'three_dimensional',
        mode = 'full',
        departments = [],
        businessLines = [],
        minScoreThreshold = 0
      } = req.body

      // 验证输入参数
      if (!poolId) {
        return res.status(400).json({
          code: 400,
          message: '奖金池ID不能为空',
          data: null
        })
      }

      const bonusPool = await databaseService.findOne('bonusPools', { _id: poolId })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 检查奖金池状态
      if (bonusPool.status === 'allocated') {
        return res.status(400).json({
          code: 400,
          message: '该奖金池已经完成分配，无法重复计算',
          data: null
        })
      }

      // 生成计算任务ID
      const taskId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const userId = req.user?.id || 1

      logger.info(`奖金计算任务启动: ${taskId}`, {
        poolId,
        calculationType,
        userId,
        weightConfigId,
        allocationRuleId,
        mode,
        departments: departments.length,
        businessLines: businessLines.length
      })

      // 启动异步计算任务，传递计算选项
      this.executeCalculation(
        taskId,
        poolId,
        {
          weightConfigId,
          allocationRuleId,
          mode,
          departments,
          businessLines,
          minScoreThreshold
        },
        calculationType,
        userId
      )
        .catch(error => {
          logger.error(`计算任务 ${taskId} 执行失败:`, error)
        })

      res.json({
        code: 200,
        data: {
          taskId,
          poolId,
          status: 'processing',
          startTime: new Date().toISOString()
        },
        message: '计算任务已提交'
      })

    } catch (error) {
      logger.error('Start calculation error:', error)
      next(error)
    }
  }

  // 获取计算结果
  async getResult(req, res, next) {
    try {
      const { taskId } = req.params

      if (!taskId) {
        return res.status(400).json({
          code: 400,
          message: '任务ID不能为空',
          data: null
        })
      }

      // 从缓存或数据库中获取计算结果
      const result = this.getCalculationResult(taskId)

      if (!result) {
        return res.status(404).json({
          code: 404,
          message: '计算结果不存在或已过期',
          data: null
        })
      }

      res.json({
        code: 200,
        data: result,
        message: result.status === 'error' ? '计算失败' : 'success'
      })

    } catch (error) {
      logger.error('Get calculation result error:', error)
      next(error)
    }
  }

  // 模拟计算
  async simulate(req, res, next) {
    try {
      const { poolId, allocationRuleId, ...options } = req.body

      if (!poolId) {
        return res.status(400).json({
          code: 400,
          message: '奖金池ID不能为空',
          data: null
        })
      }

      const bonusPool = await databaseService.findOne('bonusPools', { _id: poolId })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 获取实际的员工数量，并排除系统管理员（与三维计算保持一致）
      let employees = await Employee.findAll({
        where: { status: 1 },
        include: ['Department', 'Position']
      })

      // 确保 employees 是一个数组
      if (!employees) {
        employees = []
      }

      // **排除admin超级管理员权限的用户**
      const filteredEmployees = []
      for (const emp of employees) {
        // 获取员工对应的用户信息
        if (emp.userId || emp.user_id) {
          try {
            const userId = emp.userId || emp.user_id
            const user = await databaseService.findOne('users', { _id: userId })

            if (user && (user.roleId || user.role_id)) {
              const roleId = user.roleId || user.role_id
              const role = await databaseService.findOne('roles', { _id: roleId })
              // 检查角色名称是否为"系统管理员"或权限为
            if (role && (role.name === '系统管理员')) {
                logger.info(`⚠️ 模拟计算跳过系统管理员: ${emp.name} (userId: ${userId}, role: ${role.name})`)
                continue // 跳过该员工
              }
            }
          } catch (error) {
            logger.warn(`检查员工${emp.name}角色时出错:`, error.message)
            // 如果查询失败，保留该员工
          }
        }

        // 添加到过滤后的列表
        filteredEmployees.push(emp)
      }

      const totalEmployees = filteredEmployees.length
      logger.info(`开始模拟计算: 奖金池${poolId}, 期间${bonusPool.period}, 过滤后员工数=${totalEmployees}`)

      // 使用真实的模拟计算服务
      let simulationResult

      if (allocationRuleId) {
        // 使用奖金分配服务进行模拟
        simulationResult = await bonusAllocationService.simulateAllocation(
          poolId,
          allocationRuleId,
          {
            ...options,
            createdBy: req.user?.id || 1
          }
        )
      } else {
        // 使用简化的模拟逻辑
        const totalAmount = parseFloat(bonusPool.distributableAmount) || parseFloat(bonusPool.poolAmount) || 0

        simulationResult = {
          status: 'completed',
          summary: {
            totalEmployees: totalEmployees,
            totalBonus: totalAmount * 0.95,
            averageBonus: totalEmployees > 0 ? (totalAmount * 0.95) / totalEmployees : 0,
            maxBonus: totalEmployees > 0 ? (totalAmount * 0.95) / totalEmployees * 3.5 : 0,
            minBonus: totalEmployees > 0 ? (totalAmount * 0.95) / totalEmployees * 0.4 : 0
          },
          distribution: {
            byDepartment: {
              '实施': {
                count: Math.floor(totalEmployees * 0.53),
                amount: totalAmount * 0.55
              },
              '售前': {
                count: Math.floor(totalEmployees * 0.20),
                amount: totalAmount * 0.20
              },
              '市场': {
                count: Math.floor(totalEmployees * 0.16),
                amount: totalAmount * 0.15
              },
              '运营': {
                count: Math.floor(totalEmployees * 0.11),
                amount: totalAmount * 0.10
              }
            }
          },
          isSimulation: true
        }
      }

      logger.info(`模拟计算完成: ${bonusPool.period}`)

      res.json({
        code: 200,
        data: simulationResult,
        message: '模拟计算完成'
      })

    } catch (error) {
      logger.error('Simulate calculation error:', error)

      // 返回详细错误信息
      res.status(500).json({
        code: 500,
        message: `模拟计算失败: ${error.message}`,
        data: null,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  // 获取统计信息
  async getStatistics(req, res, next) {
    try {
      const allPools = await databaseService.find('bonusPools', {})
      const totalPools = allPools.length
      const allocatedPools = allPools.filter(p => p.status === 'allocated').length
      const totalAmount = allPools.reduce((sum, p) => sum + (parseFloat(p.poolAmount) || 0), 0)

      // 获取实际的员工数量
      const employees = await databaseService.getEmployees()
      const activeEmployees = employees // All employees are active with hard delete
      const totalEmployees = activeEmployees.length

      const statistics = {
        totalPools,
        allocatedPools,
        totalAmount,
        totalEmployees
      }

      res.json({
        code: 200,
        data: statistics,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get statistics error:', error)
      next(error)
    }
  }

  // 导出结果
  async exportResult(req, res, next) {
    try {
      const { id } = req.params
      const { format = 'excel' } = req.query

      const bonusPool = await BonusPool.findByPk(id)
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      if (bonusPool.status === 'draft') {
        return res.status(400).json({
          code: 400,
          message: '草稿状态的奖金池无法导出',
          data: null
        })
      }

      // 这里应该生成实际的导出文件
      logger.info(`导出奖金池结果: ${bonusPool.period}, 格式: ${format}`)

      res.json({
        code: 200,
        data: {
          downloadUrl: `/exports/bonus-pool-${id}-${Date.now()}.${format}`,
          fileName: `奖金池-${bonusPool.period}.${format}`
        },
        message: '导出成功'
      })

    } catch (error) {
      logger.error('Export result error:', error)
      next(error)
    }
  }

  /**
   * 执行计算任务
   */
  async executeCalculation(taskId, poolId, options, calculationType, userId) {
    try {
      // 设置任务状态为处理中
      this.setCalculationResult(taskId, {
        status: 'processing',
        startTime: new Date(),
        progress: 0
      })

      let result

      switch (calculationType) {
        case 'three_dimensional':
          result = await this.executeThreeDimensionalCalculation(poolId, options.weightConfigId, userId, options)
          break
        case 'project_bonus':
          result = await this.executeProjectBonusCalculation(poolId, userId)
          break
        case 'bonus_allocation':
          result = await this.executeBonusAllocation(poolId, options.allocationRuleId, userId)
          break
        default:
          throw new Error(`不支持的计算类型: ${calculationType}`)
      }

      // 检查计算结果是否包含错误
      let finalStatus = 'completed';
      if (result && result.summary && result.summary.errorCount > 0 && result.summary.calculatedEmployees === 0) {
        finalStatus = 'error';
      }

      // 设置任务状态
      this.setCalculationResult(taskId, {
        status: finalStatus,
        endTime: new Date(),
        progress: 100,
        result
      })

      logger.info(`计算任务完成: ${taskId}`, { status: finalStatus })

    } catch (error) {
      logger.error(`计算任务失败: ${taskId}`, error)

      // 设置任务状态为错误
      this.setCalculationResult(taskId, {
        status: 'error',
        endTime: new Date(),
        progress: 0,
        error: error.message
      })
    }
  }

  /**
   * 执行三维计算
   */
  async executeThreeDimensionalCalculation(poolId, weightConfigId, userId, options = {}) {
    // 获取奖金池信息
    const bonusPool = await databaseService.findOne('bonusPools', { _id: poolId })
    if (!bonusPool) {
      throw new Error('奖金池不存在')
    }

    // 获取所有需要计算的员工
    let employees = await Employee.findAll({
      where: { status: 1 },
      include: ['Department', 'Position']
    })

    // 确保 employees 是一个数组
    if (!employees) {
      employees = [];
    }

    // **排除admin超级管理员权限的用户**
    const filteredEmployees = []
    for (const emp of employees) {
      // 获取员工对应的用户信息
      if (emp.userId || emp.user_id) {
        try {
          const userId = emp.userId || emp.user_id
          const user = await databaseService.findOne('users', { _id: userId })
          
          if (user && (user.roleId || user.role_id)) {
            const roleId = user.roleId || user.role_id
            const role = await databaseService.findOne('roles', { _id: roleId })
            // 检查角色名称是否为"系统管理员"
               if (role && (role.name === '系统管理员' )) {
              logger.info(`⚠️ 跳过系统管理员: ${emp.name} (userId: ${userId}, role: ${role.name})`)
              continue // 跳过该员工
            }
          }
        } catch (error) {
          logger.warn(`检查员工${emp.name}角色时出错:`, error.message)
          // 如果查询失败，保留该员工
        }
      }
      
      // 添加到过滤后的列表
      filteredEmployees.push(emp)
    }

    employees = filteredEmployees
    logger.info(`过滤后的员工数: ${employees.length}`)

    // **根据计算模式过滤员工**
    const mode = options.mode || 'full'
    const departments = options.departments || []
    const businessLines = options.businessLines || []

    if (mode === 'department' && departments.length > 0) {
      // 按部门计算：只保留选中部门的员工
      employees = employees.filter(emp => {
        const deptId = emp.departmentId || emp.department_id
        return departments.includes(deptId)
      })
      logger.info(`按部门计算: 选择了 ${departments.length} 个部门，过滤后员工数=${employees.length}`)
    } else if (mode === 'line' && businessLines.length > 0) {
      // 按业务线计算：只保留选中业务线的员工
      // 支持直接关联(employees.business_line_id)和间接关联(departments.line_id)
      employees = employees.filter(emp => {
        // 优先检查员工直接关联的业务线
        const directLineId = emp.businessLineId || emp.business_line_id
        if (directLineId && businessLines.includes(directLineId)) {
          return true
        }
        // 如果没有直接关联，检查部门的业务线
        // 注意: departments表的line_id字段在databaseService中被转换为businessLineId
        const deptId = emp.departmentId || emp.department_id
        if (deptId && emp.Department) {
          const deptLineId = emp.Department.businessLineId || emp.Department.lineId || emp.Department.line_id
          return deptLineId && businessLines.includes(deptLineId)
        }
        return false
      })
      logger.info(`按业务线计算: 选择了 ${businessLines.length} 个业务线，过滤后员工数=${employees.length}`)
    } else {
      logger.info(`全员计算: 员工数=${employees.length}`)
    }

    if (employees.length === 0) {
      throw new Error('没有符合条件的员工数据')
    }

    const employeeIds = employees.map(emp => emp.id)

    // 获取权重配置ID，如果未指定则使用默认配置
    let actualWeightConfigId = weightConfigId || bonusPool.weightConfigId;

    // 如果仍然没有权重配置ID，则使用默认配置
    if (!actualWeightConfigId) {
      const defaultWeightConfig = await databaseService.findOne('threeDimensionalWeightConfigs', {
        code: 'DEFAULT_CONFIG'
      });

      if (defaultWeightConfig) {
        actualWeightConfigId = defaultWeightConfig._id || defaultWeightConfig.id;
      } else {
        throw new Error('未找到默认权重配置');
      }
    }

    logger.info(`开始三维计算: 奖金池ID=${poolId}, 期间=${bonusPool.period}, 权重配置ID=${actualWeightConfigId}, 员工数=${employeeIds.length}`);

    // 批量计算三维得分
    const calculationResults = await threeDimensionalCalculationService.batchCalculateScores(
      employeeIds,
      bonusPool.period,
      actualWeightConfigId,
      { createdBy: userId }
    )

    // 确保 calculationResults 具有正确的结构
    if (!calculationResults || typeof calculationResults !== 'object') {
      throw new Error('计算结果格式不正确')
    }

    // 确保 results 和 errors 属性存在
    const results = Array.isArray(calculationResults.results) ? calculationResults.results : []
    const errors = Array.isArray(calculationResults.errors) ? calculationResults.errors : []

    logger.info(`三维计算完成: 成功=${results.length}, 失败=${errors.length}`);

    // 如果有错误，记录前几个错误详情
    if (errors.length > 0) {
      const errorSample = errors.slice(0, 3);
      logger.error(`计算错误详情 (前${errorSample.length}个):`, errorSample);
    }

    // 保存计算结果
    if (results.length > 0) {
      await threeDimensionalCalculationService.batchSaveResults(
        results,
        poolId,
        userId
      )

      // 计算排名
      await threeDimensionalCalculationService.calculateRankings(
        bonusPool.period,
        actualWeightConfigId
      )

      // 更新奖金池状态为已计算
      await databaseService.update('bonusPools', { _id: poolId }, {
        status: 'calculated',
        calculated_at: new Date(),
        updated_at: new Date()
      })
      logger.info(`奖金池状态已更新为已计算: ${poolId}`);
    } else if (errors.length > 0) {
      // 即使所有计算都失败，也更新奖金池状态为计算完成（但有错误）
      await databaseService.update('bonusPools', { _id: poolId }, {
        status: 'calculated',
        calculated_at: new Date(),
        updated_at: new Date()
      })
      logger.info(`奖金池状态已更新为已计算（有错误）: ${poolId}`);
    }

    return {
      summary: {
        totalEmployees: employees.length,
        calculatedEmployees: results.length,
        errorCount: errors.length
      },
      results: results,
      errors: errors
    }
  }

  /**
   * 执行项目奖金计算
   */
  async executeProjectBonusCalculation(poolId, userId) {
    const result = await projectBonusService.calculateProjectBonus(poolId)
    return result
  }

  /**
   * 执行奖金分配
   */
  async executeBonusAllocation(poolId, allocationRuleId, userId) {
    if (!allocationRuleId) {
      throw new Error('奖金分配规则ID不能为空')
    }

    const result = await bonusAllocationService.allocateBonusPool(
      poolId,
      allocationRuleId,
      { createdBy: userId }
    )
    return result
  }

  /**
   * 设置计算结果缓存
   */
  setCalculationResult(taskId, result) {
    if (!this.calculationResults) {
      this.calculationResults = new Map()
    }

    this.calculationResults.set(taskId, {
      ...result,
      updatedAt: new Date()
    })

    // 设置过期时间（30分钟）
    setTimeout(() => {
      this.calculationResults.delete(taskId)
    }, 30 * 60 * 1000)
  }

  /**
   * 获取计算结果缓存
   */
  getCalculationResult(taskId) {
    if (!this.calculationResults) {
      return null
    }
    return this.calculationResults.get(taskId)
  }

  /**
   * 复制奖金池
   */
  async copyBonusPool(req, res, next) {
    try {
      const { id } = req.params
      const { newPeriod } = req.body

      if (!newPeriod) {
        return res.status(400).json({
          code: 400,
          message: '新期间不能为空',
          data: null
        })
      }

      const sourcePool = await databaseService.findOne('bonusPools', { _id: id })
      if (!sourcePool) {
        return res.status(404).json({
          code: 404,
          message: '源奖金池不存在',
          data: null
        })
      }

      // 检查新期间是否已存在
      const existingPool = await databaseService.findOne('bonusPools', { period: newPeriod })

      if (existingPool) {
        return res.status(400).json({
          code: 400,
          message: '该期间已存在奖金池',
          data: null
        })
      }

      // 创建新的奖金池
      const newPool = await databaseService.insert('bonusPools', {
        period: newPeriod,
        totalProfit: sourcePool.totalProfit,
        poolRatio: sourcePool.poolRatio,
        reserveRatio: sourcePool.reserveRatio,
        specialRatio: sourcePool.specialRatio,
        poolAmount: sourcePool.poolAmount,
        distributableAmount: sourcePool.distributableAmount,
        status: 'draft',
        weightConfigId: sourcePool.weightConfigId,
        createdBy: req.user?.id || sourcePool.createdBy || 1
      })

      res.json({
        code: 200,
        data: newPool,
        message: '奖金池复制成功'
      })

    } catch (error) {
      logger.error('Copy bonus pool error:', error)
      next(error)
    }
  }

  /**
   * 获取可分配员工列表
   */
  async getEligibleEmployees(req, res, next) {
    try {
      const { id } = req.params

      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 获取活跃员工
      let employees = await Employee.findAll({
        where: { status: 1 },
        include: [
          { model: Department, as: 'Department' },
          { model: Position, as: 'Position' }
        ]
      })

      // 确保 employees 是一个数组
      if (!employees) {
        employees = [];
      }

      res.json({
        code: 200,
        data: {
          employees,
          total: employees.length
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get eligible employees error:', error)
      next(error)
    }
  }

  /**
   * 预览计算结果
   */
  async previewCalculation(req, res, next) {
    try {
      const { poolId, mode = 'full', departments, businessLines, minScoreThreshold = 0.6 } = req.body

      if (!poolId) {
        return res.status(400).json({
          code: 400,
          message: '奖金池ID不能为空',
          data: null
        })
      }

      const bonusPool = await databaseService.findOne('bonusPools', { _id: poolId })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 执行预览计算
      const result = await this.executeThreeDimensionalCalculation(
        poolId,
        bonusPool.weightConfigId,
        req.user?.id || 1
      )

      res.json({
        code: 200,
        data: result,
        message: '预览计算完成'
      })

    } catch (error) {
      logger.error('Preview calculation error:', error)
      next(error)
    }
  }

  /**
   * 获取奖金池的计算结果
   */
  async getBonusPoolCalculations(req, res, next) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: '奖金池ID不能为空',
          data: null
        })
      }

      // 获取奖金池信息
      const bonusPool = await databaseService.findOne('bonusPools', { id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 获取该奖金池的所有计算结果
      const calculations = await databaseService.findAll('bonusAllocationResults', {
        where: { poolId: id },
        order: [['createdAt', 'DESC']]
      })

      // 获取三维计算结果
      const threeDimensionalResults = await databaseService.findAll('threeDimensionalCalculationResults', {
        where: { 
          bonusPoolId: id,
          calculationPeriod: bonusPool.period  // 只查询当前期间
        },
        order: [['createdAt', 'DESC']]
      })

      // 关联员工信息并过滤admin
      const resultsWithEmployees = await Promise.all(
        (threeDimensionalResults.rows || []).map(async (result) => {
          try {
            const employee = await databaseService.getEmployeeById(result.employeeId || result.employee_id)
            
            if (employee) {
              // 检查是否为admin用户
              if (employee.userId || employee.user_id) {
                const userId = employee.userId || employee.user_id
                const user = await databaseService.findOne('users', { _id: userId })
                
                if (user && (user.roleId || user.role_id)) {
                  const roleId = user.roleId || user.role_id
                  const role = await databaseService.findOne('roles', { _id: roleId })
                  
                  // 过滤系统管理员
                  // if (role && (role.name === '系统管理员' || 
                  //              (role.permissions && 
                  //               (role.permissions === '*' || 
                  //                (Array.isArray(role.permissions) && role.permissions.includes('*')) ||
                  //                (typeof role.permissions === 'string' && role.permissions.includes('*'))
                  //               )
                  //              )
                  //            )) {
                                if (role && (role.name === '系统管理员') ){
                    console.log(`⚠️ 过滤结果中的系统管理员: ${employee.name} (userId: ${userId})`)
                    return null  // 返回null表示过滤掉
                  }
                }
              }
              
              // 获取部门、岗位和业务线信息
              let department = null
              if (employee.departmentId) {
                department = await databaseService.getDepartmentById(employee.departmentId)
              }
              
              let position = null
              if (employee.positionId) {
                position = await databaseService.getPositionById(employee.positionId)
              }
              
              // 业务线双重关联:优先员工直接关联,其次部门关联
              let businessLine = null
              const directLineId = employee.businessLineId || employee.business_line_id
              if (directLineId) {
                businessLine = await databaseService.findOne('businessLines', { _id: directLineId })
                if (businessLine) {
                  logger.debug(`员工 ${employee.name} 直接关联业务线: ${businessLine.name}`)
                }
              } else if (department) {
                // departments表的line_id字段在databaseService中被转换为businessLineId
                const deptLineId = department.businessLineId || department.lineId || department.line_id
                if (deptLineId) {
                  businessLine = await databaseService.findOne('businessLines', { _id: deptLineId })
                  if (businessLine) {
                    logger.debug(`员工 ${employee.name} 通过部门 ${department.name} 关联业务线: ${businessLine.name}`)
                  } else {
                    logger.warn(`员工 ${employee.name} 的部门 ${department.name} 关联的业务线ID ${deptLineId} 不存在`)
                  }
                } else {
                  logger.warn(`员工 ${employee.name} 的部门 ${department.name} 没有配置业务线`)
                }
              } else {
                logger.warn(`员工 ${employee.name} 无业务线: directLineId=${directLineId}, department=null`)
              }
              
              return {
                ...result,
                // 添加员工基本信息
                employeeNo: employee.employeeNo,
                employeeName: employee.name,
                departmentName: department?.name || '-',
                positionName: position?.name || '-',
                businessLineName: businessLine?.name || '-',
                // 保留完整的员工对象供需要时使用（包含嵌套对象格式，供前端多种格式支持）
                employee: {
                  ...employee,
                  department,
                  position
                },
                // 添加嵌套对象格式以支持前端的多种检查方式
                businessLine: businessLine ? {
                  name: businessLine.name,
                  id: businessLine._id || businessLine.id
                } : null
              }
            }
            
            return result
          } catch (error) {
            console.error(`获取员工信息失败 (employeeId: ${result.employeeId || result.employee_id}):`, error.message)
            return result
          }
        })
      )
      
      // 过滤掉null结果(即admin用户)
      const filteredResults = resultsWithEmployees.filter(r => r !== null)

      // 汇总统计数据 - 从三维计算结果中获取
      const calculationRows = calculations.rows || []

      // 从三维计算结果中计算总奖金和平均奖金
      const totalBonus = filteredResults.reduce((sum, item) => {
        return sum + (parseFloat(item.finalBonusAmount || item.final_bonus_amount) || 0)
      }, 0)

      const averageBonus = filteredResults.length > 0 ? totalBonus / filteredResults.length : 0

      res.json({
        code: 200,
        data: {
          bonusPool,
          calculations: calculationRows,
          threeDimensionalResults: filteredResults,
          summary: {
            totalEmployees: filteredResults.length,
            totalBonus,
            averageBonus,
            distributableAmount: parseFloat(bonusPool.distributableAmount) || 0,
            utilization: bonusPool.distributableAmount > 0
              ? (totalBonus / bonusPool.distributableAmount * 100).toFixed(2)
              : 0
          }
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get bonus pool calculations error:', error)
      next(error)
    }
  }

  /**
   * 发放奖金
   * POST /api/calculation/bonus-pools/:id/payment
   */
  async payBonusPool(req, res, next) {
    try {
      const { id } = req.params

      // 检查奖金池是否存在
      const bonusPool = await databaseService.findOne('bonusPools', { _id: id })
      if (!bonusPool) {
        return res.status(404).json({
          code: 404,
          message: '奖金池不存在',
          data: null
        })
      }

      // 检查奖金池状态
      if (bonusPool.status !== 'calculated' && bonusPool.status !== 'allocated') {
        return res.status(400).json({
          code: 400,
          message: `奖金池状态为"${bonusPool.status}"，只有已计算或已分配的奖金池才能发放`,
          data: null
        })
      }

      // 已经发放过的不能重复发放
      if (bonusPool.status === 'paid') {
        return res.status(400).json({
          code: 400,
          message: '该奖金池已经发放，不能重复发放',
          data: null
        })
      }

      // 更新奖金池状态为已发放（只更新status和updatedAt）
      const updateData = {
        status: 'paid',
        updatedAt: new Date()
      }

      await databaseService.update('bonusPools', { _id: id }, updateData)

      const updatedPool = await databaseService.findOne('bonusPools', { _id: id })

      logger.info(`奖金池发放成功: ${bonusPool.period}, 发放时间: ${updateData.updatedAt}`)

      res.json({
        code: 200,
        data: updatedPool,
        message: '发放成功'
      })

    } catch (error) {
      logger.error('Pay bonus pool error:', error)
      next(error)
    }
  }
}

module.exports = new CalculationController()
