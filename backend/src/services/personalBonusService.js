﻿const projectBonusService = require('./projectBonusService')
const logger = require('../utils/logger')
const databaseService = require('./databaseService')
const { databaseManager } = require('../config/database')

/**
 * 个人奖金服务
 * 为所有员工提供个人奖金信息查询和分析功能
 */
class PersonalBonusService {

  /**
   * 获取个人奖金概览
   * @param {string} userId - 用户ID
   * @param {string} period - 期间 (可选，默认当前期间)
   * @param {string} viewMode - 视图模式 ('byTime' | 'byProject')
   */
  async getPersonalBonusOverview(userId, period = null, viewMode = 'byTime') {
    try {
      // 验证输入参数
      if (!userId) {
        throw new Error('用户ID不能为空')
      }

      console.log(`📋 开始获取用户 ${userId} 的个人奖金概览，视图模式: ${viewMode}`)

      // 获取用户信息
      const dataService = databaseService;
      const user = await dataService.getUserById(userId)
      if (!user) {
        throw new Error(`用户不存在: ${userId}`)
      }

      console.log(`👤 用户信息:`, {
        id: user._id,
        username: user.username,
        realName: user.realName
      })

      // 尝试获取关联的员工记录
      const employee = await this.getEmployeeByUserId(userId)
      
      console.log(`🔍 getEmployeeByUserId 返回结果:`, {
        employeeFound: !!employee,
        employeeId: employee?._id,
        employeeName: employee?.name,
        employeeNo: employee?.employeeNo
      })
      
      // 如果没有当前期间，获取最新期间
      if (!period) {
        period = await this.getCurrentPeriod()
      }

      console.log(`📅 使用期间: ${period}, 视图模式: ${viewMode}`)
      
      if (employee) {
        console.log(`👷 员工信息:`, {
          id: employee.id || employee._id,
          _id: employee._id,
          rawId: employee.id,
          name: employee.name,
          employeeNo: employee.employeeNo || employee.employee_no,
          departmentId: employee.departmentId || employee.department_id,
          positionId: employee.positionId || employee.position_id
        })
        
        // 获取部门和岗位信息
        const department = await this.getDepartmentInfo(employee.departmentId || employee.department_id)
        const position = await this.getPositionInfo(employee.positionId || employee.position_id)
        
        // 将部门和岗位信息添加到员工对象中
        employee.department = department
        employee.position = position
      } else {
        console.warn(`⚠️ 未找到用户 ${userId} 对应的员工记录`)
      }

      console.log(`🔍 构建结果对象前的状态:`, {
        employeeExists: !!employee,
        employeeId: employee?.id || employee?._id,
        employeeName: employee?.name,
        employeeNo: employee?.employeeNo || employee?.employee_no
      })

      const employeeId = employee?.id || employee?._id
      const result = {
        user: {
          id: user._id || user.id,
          username: user.username,
          realName: user.realName,
          email: user.email
        },
        employee: employee ? {
          id: employeeId,
          employeeNumber: employee.employeeNo || employee.employee_no,
          name: employee.name,
          departmentId: employee.departmentId || employee.department_id,
          departmentName: employee.department ? employee.department.name : null,
          positionId: employee.positionId || employee.position_id,
          positionName: employee.position ? employee.position.name : null,
          level: employee.position ? employee.position.level : null,
          status: employee.status,
          joinDate: employee.hireDate || employee.hire_date || employee.entryDate || employee.entry_date,
          userId: employee.userId || employee.user_id
        } : null,
        currentPeriod: period,
        viewMode: viewMode || 'byTime',
        bonusData: await this.calculateBonusData(userId, employee, period, viewMode),
        historicalData: await this.getBonusHistory(userId, employeeId, 5),
        performanceMetrics: employee ? await this.getPerformanceMetrics(employeeId, period) : null
      }

      console.log(`🔍 构建结果对象后的状态:`, {
        resultEmployeeExists: !!result.employee,
        resultEmployeeId: result.employee?.id,
        resultEmployeeName: result.employee?.name
      })

      console.log(`💰 奖金数据汇总:`, {
        totalBonus: result.bonusData.totalBonus,
        regularBonus: result.bonusData.regularBonus?.totalAmount || 0,
        projectBonus: result.bonusData.projectBonus?.totalAmount || 0,
        breakdown: result.bonusData.bonusBreakdown
      })

      logger.info(`获取个人奖金概览成功: 用户${userId}, 期间${period}, 视图模式${viewMode}`)
      return result

    } catch (error) {
      console.error(`🚫 获取个人奖金概览失败:`, {
        userId,
        period,
        viewMode,
        error: error.message
      })
      logger.error('获取个人奖金概览失败:', error)
      throw new Error(`获取个人奖金概览失败: ${error.message}`)
    }
  }

  /**
   * 获取个人奖金信息
   * @param {string} employeeId - 员工ID
   * @returns {Object} 个人奖金信息
   */
  async getPersonalBonusInfo(employeeId) {
    try {
      // 获取员工信息
      const dataService = databaseService;
      const employeeResult = await dataService.findAll('employees', { where: { id: employeeId } });
      const employee = (employeeResult.rows || employeeResult)[0];
      if (!employee) {
        logger.error('员工不存在:', { 
          employeeId, 
          searchResult: 'null'
        })
        throw new Error(`员工不存在 (ID: ${employeeId})`)
      }

      // 获取奖金分配记录
      const allocationsResult = await dataService.findAll('bonus_allocations', {
        where: { 
          employee_id: employeeId,
          status: 'approved'
        }
      });
      const allocations = allocationsResult.rows || allocationsResult;

      // 计算总奖金
      const totalBonus = allocations.reduce((sum, allocation) => sum + (allocation.amount || 0), 0)

      // 获取项目信息
      const projectIds = [...new Set(allocations.map(a => a.projectId || a.project_id).filter(Boolean))]
      const projectsResults = await Promise.all(
        projectIds.map(id => dataService.findAll('projects', { where: { id } }))
      )
      const projects = projectsResults.map(result => (result.rows || result)[0]).filter(Boolean);

      // 按项目分组
      const bonusByProject = {}
      allocations.forEach(allocation => {
        const project = projects.find(p => p._id === allocation.projectId)
        if (project) {
          if (!bonusByProject[project._id]) {
            bonusByProject[project._id] = {
              projectId: project._id,
              projectName: project.name,
              projectCode: project.code,
              totalAmount: 0,
              allocations: []
            }
          }
          bonusByProject[project._id].totalAmount += allocation.amount || 0
          bonusByProject[project._id].allocations.push(allocation)
        }
      })

      return {
        employeeId,
        employeeName: employee.name,
        totalBonus,
        totalAllocations: allocations.length,
        bonusByProject: Object.values(bonusByProject),
        lastUpdated: new Date()
      }
    } catch (error) {
      logger.error('获取个人奖金信息失败:', error)
      throw error
    }
  }

  /**
   * 获取个人奖金历史
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 奖金历史信息
   */
  async getPersonalBonusHistory(userId, options = {}) {
    try {
      console.log(`🔍 getPersonalBonusHistory 开始: userId=${userId}, options=`, options)
      
      // 首先获取用户和员工信息
      const dataService = databaseService;
      const user = await dataService.getUserById(userId)
      if (!user) {
        console.log(`❌ 用户不存在: ${userId}`)
        throw new Error(`用户不存在: ${userId}`)
      }
      console.log(`✅ 找到用户: ${user.username}`)

      // 获取员工信息
      const employee = await this.getEmployeeByUserId(userId)
      if (!employee) {
        console.log(`⚠️ 未找到员工信息，返回默认结果`)
        // 如果没有员工信息，返回包含用户信息但员工为null的结果
        return {
          user: {
            id: user._id,
            username: user.username,
            realName: user.realName,
            email: user.email
          },
          employee: null,
          history: [],
          summary: {
            totalBonus: 0,
            totalAllocations: 0,
            averageBonus: 0
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      }
      console.log(`✅ 找到员工: ${employee.name}`)

      const { startDate, endDate, page = 1, limit = 10 } = options
      console.log(`📊 查询参数: startDate=${startDate}, endDate=${endDate}, page=${page}, limit=${limit}`)

      // 构建查询条件 - 使用正确的集合和字段
      const query = { employeeId: employee._id }
      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) query.createdAt.$gte = new Date(startDate)
        if (endDate) query.createdAt.$lte = new Date(endDate)
      }
      console.log(`🔍 查询条件:`, query)
      console.log(`🔍 员工ID: ${employee._id}`)
      console.log(`🔍 员工姓名: ${employee.name}`)

      // 尝试从不同的集合获取奖金分配记录
      let allocations = []
      
      // 首先尝试从 bonusAllocationResults 集合查询
      console.log(`🔍 尝试从 bonus_allocation_results 表查询...`)
      try {
        const tableName = 'bonus_allocation_results';
        const fieldName = 'employee_id';
        const allocationsResult = await dataService.findAll(tableName, { where: { [fieldName]: employee._id || employee.id } });
        allocations = allocationsResult.rows || allocationsResult;
        console.log(`✅ 从 ${tableName} 找到 ${allocations.length} 条记录`)
        if (allocations.length > 0) {
          console.log(`🔍 第一条记录示例:`, {
            _id: allocations[0]._id || allocations[0].id,
            employeeId: allocations[0].employeeId || allocations[0].employee_id,
            allocationPeriod: allocations[0].allocationPeriod || allocations[0].allocation_period,
            totalAmount: allocations[0].totalAmount || allocations[0].total_amount
          })
        }
      } catch (error) {
        console.error(`❌ 查询 bonus_allocation_results 失败:`, error)
        console.error(`❌ 错误堆栈:`, error.stack)
      }

      // 如果没有找到，尝试从 projectBonusAllocations 集合查询
      if (allocations.length === 0) {
        console.log(`🔍 尝试从 project_bonus_allocations 表查询...`)
        try {
          const tableName = 'project_bonus_allocations';
          const fieldName = 'employee_id';
          const allocationsResult = await dataService.findAll(tableName, { where: { [fieldName]: employee._id || employee.id } });
          allocations = allocationsResult.rows || allocationsResult;
          console.log(`✅ 从 ${tableName} 找到 ${allocations.length} 条记录`)
        } catch (error) {
          console.warn(`⚠️ 查询 project_bonus_allocations 失败:`, error.message)
        }
      }

      // 如果还是没有找到，尝试从 bonusAllocations 集合查询
      if (allocations.length === 0) {
        console.log(`🔍 尝试从 bonus_allocations 表查询...`)
        try {
          const tableName = 'bonus_allocations';
          const fieldName = 'employee_id';
          const allocationsResult = await dataService.findAll(tableName, { where: { [fieldName]: employee._id || employee.id } });
          allocations = allocationsResult.rows || allocationsResult;
          console.log(`✅ 从 ${tableName} 找到 ${allocations.length} 条记录`)
        } catch (error) {
          console.warn(`⚠️ 查询 bonus_allocations 失败:`, error.message)
        }
      }

      console.log(`📊 总共找到 ${allocations.length} 条奖金分配记录`)
      const total = allocations.length

      // 分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedAllocations = allocations.slice(startIndex, endIndex)
      console.log(`📄 分页结果: ${startIndex}-${endIndex}, 共 ${paginatedAllocations.length} 条`)

      // 获取项目信息
      const projectIdField = 'project_id';
      const projectIds = [...new Set(paginatedAllocations.map(a => a[projectIdField] || a.projectId || a.project_id).filter(Boolean))]
      console.log(`🔍 需要查询的项目ID:`, projectIds)
      
      const projects = await Promise.all(
        projectIds.map(async (id) => {
          try {
            const projectResult = await dataService.findAll('projects', { where: { id } });
            const project = (projectResult.rows || projectResult)[0];
            return project
          } catch (error) {
            console.warn(`⚠️ 查询项目 ${id} 失败:`, error.message)
            return null
          }
        })
      )
      console.log(`✅ 成功查询 ${projects.filter(p => p).length} 个项目信息`)

      // 组装数据
      const history = paginatedAllocations.map(allocation => {
        const project = projects.find(p => p && p._id === allocation.projectId)
        return {
          ...allocation,
          projectName: project?.name || '未知项目',
          projectCode: project?.code || 'N/A'
        }
      })

      // 计算汇总信息
      const totalBonus = allocations.reduce((sum, a) => sum + (a.amount || a.bonusAmount || 0), 0)
      const averageBonus = total > 0 ? totalBonus / total : 0

      const result = {
        user: {
          id: user._id,
          username: user.username,
          realName: user.realName,
          email: user.email
        },
        employee: {
          id: employee._id,
          name: employee.name,
          employeeNo: employee.employeeNo,
          departmentId: employee.departmentId,
          positionId: employee.positionId
        },
        history,
        summary: {
          totalBonus,
          totalAllocations: total,
          averageBonus
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }

      console.log(`✅ getPersonalBonusHistory 完成: 返回 ${history.length} 条历史记录`)
      return result
      
    } catch (error) {
      console.error(`❌ getPersonalBonusHistory 失败:`, error)
      console.error(`❌ 错误堆栈:`, error.stack)
      logger.error('获取个人奖金历史失败:', error)
      throw error
    }
  }

  /**
   * 获取个人奖金统计
   * @param {string} employeeId - 员工ID
   * @param {Object} options - 查询选项
   * @returns {Object} 奖金统计信息
   */
  async getPersonalBonusStats(employeeId, options = {}) {
    try {
      const dataService = databaseService;
      const { startDate, endDate } = options

      // 构建查询条件
      const where = { employee_id: employeeId }
      if (startDate || endDate) {
        where.created_at = {}
        if (startDate) where.created_at.$gte = new Date(startDate)
        if (endDate) where.created_at.$lte = new Date(endDate)
      }

      // 获取奖金分配记录
      const allocationsResult = await dataService.findAll('bonus_allocations', { where });
      const allocations = allocationsResult.rows || allocationsResult;

      // 计算统计信息
      const totalBonus = allocations.reduce((sum, a) => sum + (a.amount || 0), 0)
      const totalAllocations = allocations.length
      const approvedAllocations = allocations.filter(a => a.status === 'approved').length
      const pendingAllocations = allocations.filter(a => a.status === 'pending').length
      const rejectedAllocations = allocations.filter(a => a.status === 'rejected').length

      // 按月份统计
      const monthlyStats = {}
      allocations.forEach(allocation => {
        const month = new Date(allocation.createdAt).toISOString().slice(0, 7)
        if (!monthlyStats[month]) {
          monthlyStats[month] = { count: 0, totalAmount: 0 }
        }
        monthlyStats[month].count++
        monthlyStats[month].totalAmount += allocation.amount || 0
      })

      // 按项目统计
      const projectStats = {}
      allocations.forEach(allocation => {
        const projectId = allocation.projectId
        if (!projectStats[projectId]) {
          projectStats[projectId] = { count: 0, totalAmount: 0 }
        }
        projectStats[projectId].count++
        projectStats[projectId].totalAmount += allocation.amount || 0
      })

      return {
        overview: {
          totalBonus,
          totalAllocations,
          approvedAllocations,
          pendingAllocations,
          rejectedAllocations
        },
        monthlyStats,
        projectStats,
        timeRange: { startDate, endDate }
      }
    } catch (error) {
      logger.error('获取个人奖金统计失败:', error)
      throw error
    }
  }

  /**
   * 创建奖金调整申请
   * @param {Object} adjustmentData - 调整申请数据
   * @returns {Object} 创建的调整申请
   */
  async createBonusAdjustmentRequest(adjustmentData) {
    try {
      const dataService = databaseService;
      const adjustment = {
        ...adjustmentData,
        created_at: new Date(),
        updated_at: new Date()
      }

      const result = await dataService.create('bonus_adjustments', adjustment);
      logger.info('奖金调整申请创建成功', {
        adjustmentId: result.id || result._id,
        allocationId: adjustmentData.allocationId,
        employeeId: adjustmentData.employeeId,
        adjustmentAmount: adjustmentData.adjustmentAmount
      })

      return result
    } catch (error) {
      logger.error('创建奖金调整申请失败:', error)
      throw error
    }
  }

  /**
   * 审批奖金调整申请
   * @param {string} adjustmentId - 调整申请ID
   * @param {string} approverId - 审批人ID
   * @param {boolean} approved - 是否批准
   * @param {string} comments - 审批意见
   * @returns {Object} 审批结果
   */
  async approveBonusAdjustment(adjustmentId, approverId, approved, comments) {
    try {
      const dataService = databaseService;
      const adjustment = await dataService.findByPk('bonus_adjustments', adjustmentId);
      if (!adjustment) {
        throw new Error('调整申请不存在')
      }

      // 更新调整申请状态
      const updatedAdjustment = await dataService.update('bonus_adjustments', adjustmentId, {
        status: approved ? 'approved' : 'rejected',
        approved_by: approverId,
        approved_at: new Date(),
        approval_comments: comments,
        updated_at: new Date()
      });

      if (approved) {
        // 如果批准，更新奖金分配
        const allocation = await dataService.findByPk('bonus_allocations', adjustment.allocationId || adjustment.allocation_id);
        if (allocation) {
          const newAmount = (allocation.amount || 0) + adjustment.adjustmentAmount
          await dataService.update('bonus_allocations', adjustment.allocationId || adjustment.allocation_id, {
            amount: newAmount,
            updated_at: new Date()
          });
          logger.info('奖金分配已更新', {
            allocationId: adjustment.allocationId || adjustment.allocation_id,
            oldAmount: allocation.amount,
            newAmount,
            adjustmentAmount: adjustment.adjustmentAmount
          })
        }
      }

      logger.info('奖金调整申请已处理', {
        adjustmentId,
        approved,
        allocationId: adjustment.allocationId,
        employeeId: adjustment.employeeId
      })

      return updatedAdjustment
    } catch (error) {
      logger.error('审批奖金调整申请失败:', error)
      throw error
    }
  }

  /**
   * 获取奖金模拟分析
   * @param {string} userId - 用户ID
   * @param {Object} scenarios - 模拟场景
   */
  async getBonusSimulation(userId, scenarios = {}) {
    try {
      const dataService = databaseService;
      const user = await dataService.getUserById(userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      const employee = await this.getEmployeeByUserId(userId)
      if (!employee) {
        return {
          user: { id: user._id, username: user.username, realName: user.realName },
          employee: null,
          simulation: null,
          message: '未找到关联的员工记录，无法进行奖金模拟'
        }
      }

      const currentPeriod = await this.getCurrentPeriod()
      const currentBonus = await this.getPersonalBonusOverview(userId, currentPeriod)

      // 模拟不同的业绩表现情况
      const simulationResults = []

      // 场景1: 当前表现保持不变
      simulationResults.push({
        scenario: 'current',
        name: '当前表现保持',
        description: '基于当前绩效水平的奖金预测',
        bonusAmount: currentBonus.bonusData.totalBonus,
        breakdown: currentBonus.bonusData.bonusBreakdown,
        changes: {
          performance: 0,
          positionValue: 0,
          profitContribution: 0
        }
      })

      // 场景2: 绩效提升10%
      const improvedBonus = await this.simulateBonusWithPerformanceChange(employee, 1.1, currentPeriod)
      simulationResults.push({
        scenario: 'improved_10',
        name: '绩效提升10%',
        description: '如果个人绩效评分提升10%的奖金预测',
        bonusAmount: improvedBonus.totalAmount,
        breakdown: improvedBonus.breakdown,
        changes: {
          performance: improvedBonus.totalAmount - currentBonus.bonusData.totalBonus,
          positionValue: 0,
          profitContribution: 0
        }
      })

      // 场景3: 绩效提升20%
      const highImprovedBonus = await this.simulateBonusWithPerformanceChange(employee, 1.2, currentPeriod)
      simulationResults.push({
        scenario: 'improved_20',
        name: '绩效提升20%',
        description: '如果个人绩效评分提升20%的奖金预测',
        bonusAmount: highImprovedBonus.totalAmount,
        breakdown: highImprovedBonus.breakdown,
        changes: {
          performance: highImprovedBonus.totalAmount - currentBonus.bonusData.totalBonus,
          positionValue: 0,
          profitContribution: 0
        }
      })

      // 场景4: 晋升到更高职位
      if (scenarios.promotionPositionId) {
        const promotionBonus = await this.simulateBonusWithPositionChange(employee, scenarios.promotionPositionId, currentPeriod)
        simulationResults.push({
          scenario: 'promotion',
          name: '职位晋升',
          description: '如果晋升到更高职位的奖金预测',
          bonusAmount: promotionBonus.totalAmount,
          breakdown: promotionBonus.breakdown,
          changes: {
            performance: 0,
            positionValue: promotionBonus.totalAmount - currentBonus.bonusData.totalBonus,
            profitContribution: 0
          }
        })
      }

      // 场景5: 参与更多项目
      const projectBonus = await this.simulateAdditionalProjectBonus(employee._id, scenarios.additionalProjects || [])
      if (projectBonus.totalAmount > 0) {
        simulationResults.push({
          scenario: 'more_projects',
          name: '参与更多项目',
          description: '如果参与更多项目的奖金预测',
          bonusAmount: currentBonus.bonusData.totalBonus + projectBonus.totalAmount,
          breakdown: {
            ...currentBonus.bonusData.bonusBreakdown,
            project: currentBonus.bonusData.bonusBreakdown.project + projectBonus.totalAmount
          },
          changes: {
            performance: 0,
            positionValue: 0,
            profitContribution: projectBonus.totalAmount
          }
        })
      }

      return {
        user: {
          id: user._id,
          username: user.username,
          realName: user.realName
        },
        employee: {
          id: employee._id,
          name: employee.name,
          employeeNo: employee.employeeNo
        },
        currentBonusAmount: currentBonus.bonusData.totalBonus,
        simulations: simulationResults,
        recommendations: await this.generateBonusRecommendations(employee, simulationResults)
      }

    } catch (error) {
      logger.error('获取奖金模拟分析失败:', error)
      throw error
    }
  }

  /**
   * 获取个人改进建议
   * @param {string} userId - 用户ID
   */
  async getImprovementSuggestions(userId) {
    try {
      const dataService = databaseService;
      const user = await dataService.getUserById(userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      const employee = await this.getEmployeeByUserId(userId)
      if (!employee) {
        return {
          user: { id: user._id, username: user.username, realName: user.realName },
          employee: null,
          suggestions: [],
          message: '未找到关联的员工记录，无法提供改进建议'
        }
      }

      const currentPeriod = await this.getCurrentPeriod()
      const bonusOverview = await this.getPersonalBonusOverview(userId, currentPeriod)
      const performanceMetrics = await this.getPerformanceMetrics(employee._id, currentPeriod)

      const suggestions = []

      // 获取手动录入的建议（只获取未完成的）
      // 注意：improvement_suggestions表中的employee_id是员工的实际ID（如工号），不是数据库主键_id
      // 需要同时尝试employee.id, employee.employee_no, employee.name来匹配
      const employeeIdentifiers = [
        employee.id,
        employee.employee_no,  // MySQL字段
        employee.name
      ].filter(Boolean)
      
      console.log('🔍 查询改进建议，员工标识:', employeeIdentifiers)
      console.log('👤 员工信息:', {
        id: employee.id,
        name: employee.name,
        employee_no: employee.employee_no
      })
      
      // 构建IN查询的占位符
      const placeholders = employeeIdentifiers.map(() => '?').join(', ')
      const manualSuggestionsQuery = `
        SELECT * FROM improvement_suggestions
        WHERE employee_id IN (${placeholders}) AND status_code != 2
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          created_at DESC
        LIMIT 10
      `
      const manualSuggestions = await databaseService.query(manualSuggestionsQuery, employeeIdentifiers)
      
      console.log('📋 查询到的手动建议数量:', manualSuggestions?.length || 0)
      
      // 转换手动建议格式
      if (manualSuggestions && manualSuggestions.length > 0) {
        manualSuggestions.forEach(s => {
          suggestions.push({
            id: String(s.id),
            category: s.category,
            title: s.title,
            priority: s.priority,
            impact: s.priority, // 使用优先级作为影响
            description: s.description,
            timeFrame: s.time_frame,
            potentialImpact: s.potential_impact || 0,
            statusCode: s.status_code,
            source: 'manual',
            createdByName: s.created_by_name,
            createdAt: s.created_at,
            actionSteps: []  // 手动建议暂不提供步骤
          })
        })
      }

      // 基于绩效表现的自动建议
      if (performanceMetrics && performanceMetrics.finalScore < 80) {
        suggestions.push({
          id: 'auto-performance-1',
          category: 'performance',
          title: '提升个人绩效评分',
          priority: 'high',
          impact: 'high',
          description: '当前绩效评分偏低，提升绩效可以直接增加奖金收入',
          actionSteps: [
            '与直属上级讨论绩效改进计划',
            '参加相关技能培训课程',
            '主动承担更多工作职责',
            '改善工作质量和效率'
          ],
          timeFrame: '3-6个月',
          potentialImpact: await this.calculatePerformanceImprovementImpact(employee, performanceMetrics.finalScore, 85) || 10,
          statusCode: -2,  // -2表示系统建议，无需审核
          source: 'auto'
        })
      }

      // 基于项目参与的建议
      const projectParticipation = await this.getEmployeeProjectParticipation(employee._id, currentPeriod)
      if (projectParticipation.activeProjects < 2) {
        suggestions.push({
          id: 'auto-projects-1',
          category: 'projects',
          title: '增加项目参与度',
          priority: 'medium',
          impact: 'medium',
          description: '参与更多项目可以获得额外的项目奖金',
          actionSteps: [
            '主动申请参与新项目',
            '提升项目相关技能',
            '在当前项目中承担更重要角色',
            '跨部门项目合作'
          ],
          timeFrame: '1-3个月',
          potentialImpact: await this.estimateProjectBonusOpportunity(employee) || 15,
          statusCode: -2,  // -2表示系统建议，无需审核
          source: 'auto'
        })
      }

      // 基于职业发展的建议
      const positionInfo = await this.getPositionInfo(employee.positionId)
      const higherPositions = await this.getAvailablePromotionPositions(employee)
      if (higherPositions.length > 0) {
        suggestions.push({
          id: 'auto-collaboration-1',
          category: 'collaboration',
          title: '职业发展规划',
          priority: 'medium',
          impact: 'high',
          description: '职位晋升可以显著提升奖金水平',
          actionSteps: [
            '制定职业发展计划',
            '提升岗位所需核心技能',
            '积累管理经验',
            '获得相关认证或资质'
          ],
          timeFrame: '6-12个月',
          potentialImpact: await this.calculatePromotionImpact(employee, higherPositions[0]) || 20,
          statusCode: -2,  // -2表示系统建议，无需审核
          availablePositions: higherPositions,
          source: 'auto'
        })
      }

      // 排序建议（手动建议优先，然后按优先级和影响力）
      suggestions.sort((a, b) => {
        // 手动建议优先
        if (a.source === 'manual' && b.source !== 'manual') return -1
        if (a.source !== 'manual' && b.source === 'manual') return 1
        
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const impactOrder = { high: 3, medium: 2, low: 1 }
        
        const aScore = priorityOrder[a.priority] * impactOrder[a.impact]
        const bScore = priorityOrder[b.priority] * impactOrder[b.impact]
        
        return bScore - aScore
      })

      return {
        user: {
          id: user._id,
          username: user.username,
          realName: user.realName
        },
        employee: {
          id: employee._id,
          name: employee.name,
          employeeNo: employee.employee_no,  // 转换为驼峰命名返回给前端
          position: positionInfo
        },
        currentBonusAmount: bonusOverview.bonusData.totalBonus,
        currentPeriod,
        suggestions: suggestions.slice(0, 10), // 最多返回10个建议
        performanceInsights: {
          currentPerformance: performanceMetrics,
          projectParticipation
        }
      }

    } catch (error) {
      logger.error('获取个人改进建议失败:', error)
      throw error
    }
  }

  /**
   * 计算个人奖金数据
   */
  async calculateBonusData(userId, employee, period, viewMode = 'byTime') {
    try {
      // 如果员工信息不存在，返回默认值
      if (!employee) {
        console.log(`⚠️ 员工信息不存在，返回默认奖金数据`)
        return {
          regularBonus: null,
          projectBonus: null,
          totalBonus: 0,
          bonusBreakdown: {
            profitContribution: 0,
            positionValue: 0,
            performance: 0,
            projectBonus: 0
          },
          viewMode: viewMode || 'byTime'
        }
      }

      console.log(`💰 calculateBonusData 开始:`, {
        userId,
        employeeId: employee.id || employee._id,
        employeeNo: employee.employeeNo || employee.employee_no,
        employeeName: employee.name,
        period,
        viewMode
      })

      const employeeId = employee.id || employee._id
      const employeeNo = employee.employeeNo || employee.employee_no
      
      const regularBonus = await this.getRegularBonus(userId, employeeId, employeeNo, period)
      
      console.log(`📊 regularBonus 结果:`, {
        found: !!regularBonus,
        totalAmount: regularBonus?.totalAmount,
        period: regularBonus?.period
      })
      
      // 先尝试获取指定期间的项目奖金
      let projectBonus = await this.getProjectBonus(userId, employeeId, period)
      
      // 如果没有找到指定期间的项目奖金，不再查询所有项目奖金
      // 这样可以确保每个期间显示的是该期间的真实数据

      console.log(`📊 projectBonus 结果:`, {
        found: !!projectBonus,
        totalAmount: projectBonus?.totalAmount,
        projectCount: projectBonus?.projectCount
      })

      // 计算总奖金
      const totalBonus = (regularBonus?.totalAmount || 0) + (projectBonus?.totalAmount || 0)

      // 计算奖金构成
      const bonusBreakdown = {
        profitContribution: regularBonus?.profitContribution || 0,
        positionValue: regularBonus?.positionValue || 0,
        performance: regularBonus?.performance || 0,
        projectBonus: projectBonus?.totalAmount || 0  // 前端期望 projectBonus
      }

      console.log(`💰 奖金计算结果:`, {
        regularBonusTotal: regularBonus?.totalAmount || 0,
        projectBonusTotal: projectBonus?.totalAmount || 0,
        totalBonus,
        projectCount: projectBonus?.projectCount || 0,
        coefficients: regularBonus?.coefficients,
        viewMode
      })

      return {
        regularBonus,
        projectBonus,
        totalBonus,
        bonusBreakdown,
        viewMode: viewMode || 'byTime',
        // 添加系数信息
        coefficients: regularBonus?.coefficients || {
          businessLine: 1.0,
          city: 1.0,
          time: 1.0,
          benchmark: 0
        },
        // 添加排名信息
        ranking: regularBonus?.ranking || null,
        // 添加详细评分
        scoreDetails: regularBonus?.scoreDetails || null,
        // 添加权重配置
        weightConfig: regularBonus?.weightConfig || null,
        // 添加趋势信息
        trend: regularBonus?.trend || null,
        // 添加数据质量信息
        dataQuality: regularBonus?.dataQuality || null,
        // 添加三维详细数据 (新增)
        profitDetails: regularBonus?.profitDetails || {},
        positionDetails: regularBonus?.positionDetails || {},
        performanceDetails: regularBonus?.performanceDetails || {}
      }
    } catch (error) {
      console.error('计算奖金数据失败:', error)
      return {
        regularBonus: null,
        projectBonus: null,
        totalBonus: 0,
        bonusBreakdown: {
          profitContribution: 0,
          positionValue: 0,
          performance: 0,
          projectBonus: 0
        },
        viewMode: viewMode || 'byTime'
      }
    }
  }

  // ====== 辅助方法 ======

  /**
   * 通过用户ID获取员工记录
   */
  async getEmployeeByUserId(userId) {
    try {
      console.log(`🔍 开始查找用户 ${userId} 关联的员工记录`)
      
      // 获取用户信息
      const dataService = databaseService;
      const user = await dataService.getUserById(userId)
      console.log(`👤 查询到的用户信息:`, {
        userId: userId,
        userFound: !!user,
        username: user?.username,
        realName: user?.realName,
        email: user?.email,
        employeeId: user?.employeeId
      })
      
      if (!user || !user.username) {
        console.log(`❌ 未找到用户信息或用户名为空`)
        return null
      }

      // 方法1: 优先通过用户表中的employeeId字段直接关联
      if (user.employeeId || user.employee_id) {
        const empId = user.employeeId || user.employee_id;
        console.log(`🔗 尝试通过employeeId直接关联: ${empId}`)
        const employee = await dataService.findByPk('employees', empId);
        if (employee) {
          console.log(`✅ 通过employeeId找到员工: ${employee.name}`)
          return employee
        } else {
          console.log(`⚠️ employeeId ${empId} 对应的员工不存在`)
        }
      }

      // 方法2: 通过realName匹配员工姓名（最可靠的关联方式）
      const realName = user.realName || user.real_name;
      if (realName) {
        console.log(`🔍 尝试通过realName匹配员工姓名: ${realName}`)
        const employeeByNameResult = await dataService.findAll('employees', { where: { name: realName } });
        const employeeByName = (employeeByNameResult.rows || employeeByNameResult)[0];
        if (employeeByName) {
          console.log(`✅ 通过realName匹配到员工: ${employeeByName.name}`)
          console.log(`🔗 用户-员工关联: ${user.username} -> ${employeeByName.name}`)
          return employeeByName
        }
      }

      // 方法3: 通过用户名作为员工工号(employeeNo)匹配
      console.log(`🔍 尝试通过用户名作为员工工号匹配: ${user.username}`)
      const fieldName = 'employee_id';
      const employeeResult = await dataService.findAll('employees', { where: { [fieldName]: user.username } });
      const employee = (employeeResult.rows || employeeResult)[0];
      if (employee) {
        console.log(`✅ 通过用户名匹配到员工: ${employee.name} (工号: ${employee.employeeNo || employee.employee_no})`)
        console.log(`🔗 用户-员工关联: ${user.username} -> ${employee.name}`)
        return employee
      }

      // 方法4: 通过邮箱匹配
      if (user.email) {
        console.log(`🔍 尝试通过邮箱匹配: ${user.email}`)
        const employeeByEmailResult = await dataService.findAll('employees', { where: { email: user.email } });
        const employeeByEmail = (employeeByEmailResult.rows || employeeByEmailResult)[0];
        if (employeeByEmail) {
          console.log(`✅ 通过邮箱匹配到员工: ${employeeByEmail.name}`)
          console.log(`🔗 用户-员工关联: ${user.username} -> ${employeeByEmail.name}`)
          return employeeByEmail
        }
      }

      // 如果都没有找到，记录日志并返回null
      console.log(`❌ 用户 ${userId} 未找到关联的员工记录`)
      return null
    } catch (error) {
      console.error(`❌ 获取用户关联员工记录失败:`, error)
      logger.error('获取用户关联员工记录失败:', error)
      return null
    }
  }

  /**
   * 获取当前期间
   */
  async getCurrentPeriod() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * 获取部门信息
   */
  async getDepartmentInfo(departmentId) {
    if (!departmentId) return null
    try {
      const dataService = databaseService;
      const department = await dataService.findByPk('departments', departmentId);
      return department ? {
        id: department.id || department._id,
        name: department.name,
        code: department.code
      } : null
    } catch (error) {
      return null
    }
  }

  /**
   * 获取职位信息
   */
  async getPositionInfo(positionId) {
    if (!positionId) return null
    try {
      const dataService = databaseService;
      const position = await dataService.findByPk('positions', positionId);
      return position ? {
        id: position.id || position._id,
        name: position.name,
        level: position.level,
        baseSalary: position.baseSalary || position.base_salary
      } : null
    } catch (error) {
      return null
    }
  }

  /**
   * 获取业务线信息
   */
  async getBusinessLineInfo(businessLineId) {
    if (!businessLineId) return null
    try {
      const dataService = databaseService;
      const businessLine = await dataService.findByPk('business_lines', businessLineId);
      return businessLine ? {
        id: businessLine.id || businessLine._id,
        name: businessLine.name,
        code: businessLine.code,
        coefficient: parseFloat(businessLine.weight) || 1.0  // 业务线系数
      } : null
    } catch (error) {
      return null
    }
  }

  /**
   * 获取城市信息
   */
  async getCityInfo(cityId) {
    if (!cityId) return null
    try {
      const dataService = databaseService;
      const city = await dataService.findByPk('cities', cityId);
      return city ? {
        id: city.id || city._id,
        name: city.name,
        code: city.code,
        tier: city.tier,
        coefficient: parseFloat(city.coefficient) || 1.0  // 城市系数
      } : null
    } catch (error) {
      return null
    }
  }

  /**
   * 计算业务线系数
   * @param {Object} employee - 员工对象
   * @returns {Number} 业务线系数 (0.8-1.5)
   */
  async getBusinessLineCoefficient(employee) {
    if (!employee || !employee.businessLineId && !employee.business_line_id) {
      return 1.0  // 默认系数
    }
    try {
      const businessLineId = employee.businessLineId || employee.business_line_id;
      const businessLine = await this.getBusinessLineInfo(businessLineId);
      if (businessLine && businessLine.coefficient) {
        const coefficient = parseFloat(businessLine.coefficient);
        // 确保系数在合理范围内
        return Math.max(0.8, Math.min(1.5, coefficient));
      }
      return 1.0
    } catch (error) {
      logger.error('获取业务线系数失败:', error)
      return 1.0
    }
  }

  /**
   * 计算城市系数
   * @param {Object} employee - 员工对象
   * @returns {Number} 城市系数 (0.8-1.3)
   */
  async getCityCoefficient(employee) {
    if (!employee || !employee.cityId && !employee.city_id) {
      return 1.0  // 默认系数
    }
    try {
      const cityId = employee.cityId || employee.city_id;
      const city = await this.getCityInfo(cityId);
      if (city && city.coefficient) {
        const coefficient = parseFloat(city.coefficient);
        // 确保系数在合理范围内
        return Math.max(0.8, Math.min(1.3, coefficient));
      }
      return 1.0
    } catch (error) {
      logger.error('获取城市系数失败:', error)
      return 1.0
    }
  }

  /**
   * 计算时间系数
   * @param {Object} employee - 员工对象
   * @returns {Number} 时间系数 (0.5-1.1)
   */
  getTimeCoefficient(employee) {
    if (!employee) {
      return 1.0  // 默认全职系数
    }

    try {
      const employmentType = employee.employmentType || employee.employment_type || 'fulltime';
      const workHoursRatio = parseFloat(employee.workHoursRatio || employee.work_hours_ratio || 1.0);

      // 根据雇佣类型和工作时间占比计算时间系数
      let coefficient = 1.0;

      switch (employmentType) {
        case 'fulltime':  // 全职
          coefficient = 1.0;
          break;
        case 'probation':  // 试用期
          coefficient = 0.8;
          break;
        case 'parttime':  // 兼职
          coefficient = workHoursRatio * 0.9;  // 兼职按工作时间比例打折
          break;
        case 'intern':  // 实习生
          coefficient = 0.5;
          break;
        default:
          coefficient = 1.0;
      }

      // 应用工作时间占比调整
      coefficient *= workHoursRatio;

      // 确保系数在合理范围内
      return Math.max(0.5, Math.min(1.1, coefficient));
    } catch (error) {
      logger.error('计算时间系数失败:', error)
      return 1.0
    }
  }

  /**
   * 查询三维计算结果，并检查奖金池状态
   * 只返回奖金池状态为 calculated/allocated/paid 的结果
   */
  async getThreeDimResultWithPoolStatus(employeeId, period) {
    try {
      const { databaseManager } = require('../config/database')
      
      // 使用 JOIN 查询，同时检查奖金池状态
      // ✅ 使用 COLLATE utf8mb4_unicode_ci 统一排序规则，避免字符集冲突
      const query = `
        SELECT t.*
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        WHERE t.employee_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
          AND t.calculation_period COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
          AND b.status IN ('calculated', 'allocated', 'paid')
        LIMIT 1
      `
      
      const results = await databaseManager.query(query, [employeeId.toString(), period])
      
      if (results && results.length > 0) {
        console.log(`✅ 找到合格的三维计算结果: 员工ID=${employeeId}, 期间=${period}`)
        return results[0]
      }
      
      console.log(`⚠️ 未找到合格的三维计算结果: 员工ID=${employeeId}, 期间=${period}`)
      return null
    } catch (error) {
      console.error(`查询三维计算结果失败:`, error)
      return null
    }
  }

  /**
   * 获取年度常规奖金（聚合所有季度数据）
   */
  async getRegularBonusForYear(userId, employeeId, employeeNo, year) {
    try {
      console.log(`📅 开始聚合年度奖金: 员工ID=${employeeId}, 年份=${year}`)
      
      const { databaseManager } = require('../config/database')
      
      // 🔍 先检查这个年份的奖金池是否存在
      console.log(`🔍 检查年份${year}的奖金池...`)
      const poolCheck = await databaseManager.query(
        "SELECT id, period, status FROM bonus_pools WHERE period = ? OR period LIKE ?",
        [year, `${year}%`]
      )
      console.log(`📊 找到${poolCheck.length}个奖金池:`, poolCheck.map(p => ({
        id: p.id,
        period: p.period,
        status: p.status
      })))
      
      // 🔍 检查该员工的所有三维计算结果
      console.log(`🔍 检查员工${employeeId}的所有三维计算结果...`)
      const allResults = await databaseManager.query(
        "SELECT id, employee_id, calculation_period, bonus_pool_id, final_bonus_amount FROM three_dimensional_calculation_results WHERE employee_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci LIMIT 10",
        [employeeId.toString()]
      )
      console.log(`📊 找到${allResults.length}条记录:`, allResults.map(r => ({
        id: r.id,
        period: r.calculation_period,
        poolId: r.bonus_pool_id,
        amount: r.final_bonus_amount
      })))
      
      // ✅ 修复：先尝试精确匹配年度格式（如"2025"）
      // ✅ 使用 COLLATE utf8mb4_unicode_ci 统一排序规则，避免字符集冲突
      let query = `
        SELECT t.*
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        WHERE t.employee_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
          AND t.calculation_period COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
          AND b.status IN ('calculated', 'allocated', 'paid')
        LIMIT 1
      `
      
      let results = await databaseManager.query(query, [employeeId.toString(), year])
      
      // 如果没找到精确匹配，再尝试季度格式匹配
      if (!results || results.length === 0) {
        console.log(`⚠️ 未找到精确匹配的年度数据，尝试季度格式...`)
        query = `
          SELECT t.*
          FROM three_dimensional_calculation_results t
          INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
          WHERE t.employee_id COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
            AND t.calculation_period COLLATE utf8mb4_unicode_ci LIKE ? COLLATE utf8mb4_unicode_ci
            AND b.status IN ('calculated', 'allocated', 'paid')
          ORDER BY t.calculation_period
        `
        results = await databaseManager.query(query, [employeeId.toString(), `${year}%`])
      }
      
      if (!results || results.length === 0) {
        console.log(`⚠️ 未找到${year}年的任何数据`)
        return null
      }
      
      console.log(`✅ 找到${results.length}条记录，开始聚合...`)
      
      // 聚合所有季度的奖金
      let totalBonus = 0
      let totalProfitContribution = 0
      let totalPositionValue = 0
      let totalPerformance = 0
      const quarterDetails = []
      
      for (const result of results) {
        const finalBonusAmount = parseFloat(result.final_bonus_amount || result.finalBonusAmount || 0)
        const quarterPeriod = result.calculation_period || result.calculationPeriod
        
        // ✅ 修复：加权得分是 0-100 的分数，需要按比例转换为奖金金额
        const profitScore = parseFloat(result.weighted_profit_score || result.weightedProfitScore || 0)
        const positionScore = parseFloat(result.weighted_position_score || result.weightedPositionScore || 0)
        const performanceScore = parseFloat(result.weighted_performance_score || result.weightedPerformanceScore || 0)
        
        // 计算总分（用于比例分配）
        const totalScore = profitScore + positionScore + performanceScore
        
        // 按比例将奖金分配到三个维度
        let profitAmount = 0
        let positionAmount = 0
        let performanceAmount = 0
        
        if (totalScore > 0 && finalBonusAmount > 0) {
          profitAmount = (profitScore / totalScore) * finalBonusAmount
          positionAmount = (positionScore / totalScore) * finalBonusAmount
          performanceAmount = (performanceScore / totalScore) * finalBonusAmount
        }
        
        totalBonus += finalBonusAmount
        totalProfitContribution += profitAmount
        totalPositionValue += positionAmount
        totalPerformance += performanceAmount
        
        quarterDetails.push({
          period: quarterPeriod,
          totalBonus: finalBonusAmount,
          profitContribution: profitAmount,
          positionValue: positionAmount,
          performance: performanceAmount
        })
      }
      
      // 获取员工信息以获取真实的系数值
      const dataService = databaseService
      const employee = await dataService.getEmployeeById(employeeId)
      let realCoefficients = {
        businessLine: 1.0,
        city: 1.0,
        time: 1.0,
        benchmark: 1.0
      }
      
      if (employee) {
        // 获取岗位信息
        if (employee.positionId) {
          const position = await dataService.getPositionById(employee.positionId)
          if (position && position.benchmarkValue) {
            realCoefficients.benchmark = parseFloat(position.benchmarkValue)
          }
        }
        
        // 获取业务线系数
        if (employee.businessLineId) {
          const businessLine = await dataService.getBusinessLineById(employee.businessLineId)
          if (businessLine && businessLine.coefficient) {
            realCoefficients.businessLine = parseFloat(businessLine.coefficient)
          }
        }
        
        // 获取城市系数 - 使用 findOne 方法
        if (employee.cityId) {
          const cityResult = await dataService.findOne('cities', { _id: employee.cityId })
          if (cityResult && cityResult.coefficient) {
            realCoefficients.city = parseFloat(cityResult.coefficient)
          }
        }
      }
      
      console.log(`📊 年度奖金聚合结果: 总额=${totalBonus}, 季度数=${results.length}`)
      
      return {
        period: `${year}年（全年）`,
        totalAmount: totalBonus,
        profitContribution: totalProfitContribution,
        positionValue: totalPositionValue,
        performance: totalPerformance,
        coefficients: realCoefficients,
        quarterDetails: quarterDetails, // 各季度明细
        isYearlyAggregation: true // 标记为年度聚合数据
      }
    } catch (error) {
      console.error(`聚合年度奖金失败:`, error)
      return null
    }
  }

  /**
   * 获取常规奖金（基于三维模型的奖金分配结果）
   */
  async getRegularBonus(userId, employeeId, employeeNo, period) {
    try {
      if (!employeeId && !employeeNo) {
        console.warn(`无员工ID和员工编号，无法获取常规奖金`)
        return null
      }

      console.log(`📊 查找常规奖金: 员工ID=${employeeId}, 员工编号=${employeeNo}, 期间=${period}`)
      console.log(`📅 期间格式分析:`, {
        period,
        isYearFormat: /^\d{4}$/.test(period),
        isQuarterFormat: /^\d{4}Q\d$/.test(period),
        isMonthFormat: /^\d{4}-\d{2}$/.test(period)
      })

      // 检查是否为年度格式（2025）
      if (period && /^\d{4}$/.test(period)) {
        console.log(`📅 检测到年度格式: ${period}，将聚合各季度数据`)
        return await this.getRegularBonusForYear(userId, employeeId, employeeNo, period)
      }

      const dataService = databaseService;
      
      // 优先查询三维计算结果（最新的奖金分配）
      if (employeeId) {
        console.log(`🔍 优先从 three_dimensional_calculation_results 表查询... (员工ID=${employeeId})`)
        
        // 首先尝试精确匹配期间，并检查奖金池状态
        let threeDimResult = await this.getThreeDimResultWithPoolStatus(employeeId, period)
        
        // 如果没找到，且期间是月份格式（YYYY-MM），尝试转换为季度格式（YYYYQX）
        if (!threeDimResult && period && /^\d{4}-\d{2}$/.test(period)) {
          const [year, month] = period.split('-')
          const quarter = Math.ceil(parseInt(month) / 3)
          const quarterPeriod = `${year}Q${quarter}`
          
          console.log(`🔄 期间格式转换: ${period} -> ${quarterPeriod}`)
          
          threeDimResult = await this.getThreeDimResultWithPoolStatus(employeeId, quarterPeriod)
        }
        
        // 如果还是没找到，不再查询最新记录，直接返回null
        // 这样可以确保每个期间显示的是该期间的真实数据
        if (!threeDimResult) {
          console.log(`⚠️ 未找到期间 ${period} 的三维计算结果，返回null`)
        }
        
        if (threeDimResult) {
          console.log(`✅ 找到三维计算奖金数据:`, {
            finalBonusAmount: threeDimResult.finalBonusAmount || threeDimResult.final_bonus_amount,
            finalScore: threeDimResult.finalScore || threeDimResult.final_score,
            period: threeDimResult.calculationPeriod || threeDimResult.calculation_period
          })
          
          const finalBonusAmount = parseFloat(threeDimResult.finalBonusAmount || threeDimResult.final_bonus_amount || 0)
          
          // 提取详细计算数据 (JSON字段)
          let profitDetails = null
          let positionDetails = null
          let performanceDetails = null
          
          try {
            // 尝试解析JSON字段
            if (threeDimResult.profitCalculationDetails || threeDimResult.profit_calculation_details) {
              const detailsStr = threeDimResult.profitCalculationDetails || threeDimResult.profit_calculation_details
              profitDetails = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr
            }
            
            if (threeDimResult.positionCalculationDetails || threeDimResult.position_calculation_details) {
              const detailsStr = threeDimResult.positionCalculationDetails || threeDimResult.position_calculation_details
              const rawPositionDetails = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr
              
              // 将嵌套的岗位数据转换为扁平化格式，以匹配前端ScoreDetails组件的期望
              if (rawPositionDetails && rawPositionDetails.position) {
                positionDetails = {
                  positionName: rawPositionDetails.position.name,
                  benchmarkValue: rawPositionDetails.position.benchmarkValue,
                  level: rawPositionDetails.position.level,
                  category: rawPositionDetails.criteria?.category || '-',
                  skillRequirements: rawPositionDetails.dimensionScores?.skillComplexity 
                    ? `技能复杂度评分: ${rawPositionDetails.dimensionScores.skillComplexity.toFixed(2)}` 
                    : '-',
                  responsibilities: rawPositionDetails.dimensionScores?.responsibility 
                    ? `责任范围评分: ${rawPositionDetails.dimensionScores.responsibility.toFixed(2)}` 
                    : '-',
                  // 保留原始数据供高级功能使用
                  dimensionScores: rawPositionDetails.dimensionScores,
                  finalAssessment: rawPositionDetails.finalAssessment
                }
              } else {
                positionDetails = rawPositionDetails
              }
            }
            
            if (threeDimResult.performanceCalculationDetails || threeDimResult.performance_calculation_details) {
              const detailsStr = threeDimResult.performanceCalculationDetails || threeDimResult.performance_calculation_details
              performanceDetails = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr
            }
          } catch (error) {
            console.warn('解析计算详情失败:', error.message)
          }
          
          // 获取员工信息以获取真实的系数值
          const employee = await dataService.getEmployeeById(employeeId)
          let realCoefficients = {
            businessLine: 1.0,
            city: 1.0,
            time: 1.0,
            benchmark: 1.0
          }
          
          if (employee) {
            // 获取岗位信息
            if (employee.positionId) {
              const position = await dataService.getPositionById(employee.positionId)
              if (position && position.benchmarkValue) {
                realCoefficients.benchmark = parseFloat(position.benchmarkValue)
              }
            }
            
            // 获取业务线系数
            if (employee.businessLineId) {
              const businessLine = await dataService.getBusinessLineById(employee.businessLineId)
              if (businessLine && businessLine.coefficient) {
                realCoefficients.businessLine = parseFloat(businessLine.coefficient)
              }
            }
            
            // 获取城市系数
            if (employee.cityId) {
              const city = await dataService.getCityById(employee.cityId)
              if (city && city.coefficient) {
                realCoefficients.city = parseFloat(city.coefficient)
              }
            }
            
            // 获取时间系数（基于入职时间）
            if (employee.entryDate) {
              const entryDate = new Date(employee.entryDate)
              const now = new Date()
              const yearsOfService = (now - entryDate) / (365 * 24 * 60 * 60 * 1000)
              
              // 时间系数计算规则：0.5-1.1
              if (yearsOfService < 0.5) {
                realCoefficients.time = 0.5
              } else if (yearsOfService < 1) {
                realCoefficients.time = 0.6 + (yearsOfService - 0.5) * 0.2
              } else if (yearsOfService < 3) {
                realCoefficients.time = 0.7 + (yearsOfService - 1) * 0.15
              } else if (yearsOfService < 5) {
                realCoefficients.time = 1.0 + (yearsOfService - 3) * 0.025
              } else {
                realCoefficients.time = 1.05 + Math.min((yearsOfService - 5) * 0.01, 0.05)
              }
              realCoefficients.time = Math.min(realCoefficients.time, 1.1)
            }
          }
          
          // ✅ 修复：加权得分是 0-100 的分数，需要按比例转换为奖金金额
          const profitScore = parseFloat(threeDimResult.weightedProfitScore || threeDimResult.weighted_profit_score || 0)
          const positionScore = parseFloat(threeDimResult.weightedPositionScore || threeDimResult.weighted_position_score || 0)
          const performanceScore = parseFloat(threeDimResult.weightedPerformanceScore || threeDimResult.weighted_performance_score || 0)
          
          // 计算总分（用于比例分配）
          const totalScore = profitScore + positionScore + performanceScore
          
          // 按比例将奖金分配到三个维度
          let profitAmount = finalBonusAmount * 0.4  // 默认值
          let positionAmount = finalBonusAmount * 0.3
          let performanceAmount = finalBonusAmount * 0.3
          
          if (totalScore > 0) {
            profitAmount = (profitScore / totalScore) * finalBonusAmount
            positionAmount = (positionScore / totalScore) * finalBonusAmount
            performanceAmount = (performanceScore / totalScore) * finalBonusAmount
          }
          
          return {
            allocationId: threeDimResult._id,
            period: threeDimResult.calculationPeriod || threeDimResult.calculation_period,
            totalAmount: finalBonusAmount,
            // ✅ 使用计算后的奖金金额，而不是分数
            profitContribution: profitAmount,
            positionValue: positionAmount,
            performance: performanceAmount,
            baseAmount: parseFloat(threeDimResult.baseBonusAmount || threeDimResult.base_bonus_amount || 0),
            performanceAmount: parseFloat(threeDimResult.weightedPerformanceScore || threeDimResult.weighted_performance_score || finalBonusAmount * 0.3),
            adjustmentAmount: parseFloat(threeDimResult.adjustmentAmount || threeDimResult.adjustment_amount || 0),
            finalScore: parseFloat(threeDimResult.finalScore || threeDimResult.final_score || 0),
            rank: threeDimResult.scoreRank || threeDimResult.score_rank || 0,
            allocationDate: threeDimResult.createdAt || threeDimResult.created_at,
            status: threeDimResult.reviewStatus || threeDimResult.review_status || 'approved',
            // 使用真实的系数信息
            coefficients: realCoefficients,
            // 添加排名信息
            ranking: {
              scoreRank: threeDimResult.scoreRank || threeDimResult.score_rank || null,
              percentileRank: parseFloat(threeDimResult.percentileRank || threeDimResult.percentile_rank || 0),
              departmentRank: threeDimResult.departmentRank || threeDimResult.department_rank || null,
              levelRank: threeDimResult.levelRank || threeDimResult.level_rank || null
            },
            // 添加详细评分
            scoreDetails: {
              profitContributionScore: parseFloat(threeDimResult.profitContributionScore || threeDimResult.profit_contribution_score || 0),
              positionValueScore: parseFloat(threeDimResult.positionValueScore || threeDimResult.position_value_score || 0),
              performanceScore: parseFloat(threeDimResult.performanceScore || threeDimResult.performance_score || 0),
              normalizedProfitScore: parseFloat(threeDimResult.normalizedProfitScore || threeDimResult.normalized_profit_score || 0),
              normalizedPositionScore: parseFloat(threeDimResult.normalizedPositionScore || threeDimResult.normalized_position_score || 0),
              normalizedPerformanceScore: parseFloat(threeDimResult.normalizedPerformanceScore || threeDimResult.normalized_performance_score || 0),
              weightedProfitScore: parseFloat(threeDimResult.weightedProfitScore || threeDimResult.weighted_profit_score || 0),
              weightedPositionScore: parseFloat(threeDimResult.weightedPositionScore || threeDimResult.weighted_position_score || 0),
              weightedPerformanceScore: parseFloat(threeDimResult.weightedPerformanceScore || threeDimResult.weighted_performance_score || 0),
              totalScore: parseFloat(threeDimResult.totalScore || threeDimResult.total_score || 0),
              adjustedScore: parseFloat(threeDimResult.adjustedScore || threeDimResult.adjusted_score || 0),
              finalScore: parseFloat(threeDimResult.finalScore || threeDimResult.final_score || 0)
            },
            // 添加权重配置
            weightConfig: {
              profitContributionRate: parseFloat(threeDimResult.profitContributionRate || threeDimResult.profit_contribution_rate || 0),
              positionValueRate: parseFloat(threeDimResult.positionValueRate || threeDimResult.position_value_rate || 0),
              performanceRate: parseFloat(threeDimResult.performanceRate || threeDimResult.performance_rate || 0)
            },
            // 添加趋势信息
            trend: {
              previousPeriodScore: parseFloat(threeDimResult.previousPeriodScore || threeDimResult.previous_period_score || 0),
              scoreChangeRate: parseFloat(threeDimResult.scoreChangeRate || threeDimResult.score_change_rate || 0),
              trendDirection: threeDimResult.trendDirection || threeDimResult.trend_direction || null
            },
            // 添加详细计算数据
            profitDetails: profitDetails,
            positionDetails: positionDetails,
            performanceDetails: performanceDetails,
            // 添加数据质量信息
            dataQuality: {
              dataCompleteness: parseFloat(threeDimResult.dataCompleteness || threeDimResult.data_completeness || 100),
              calculationConfidence: parseFloat(threeDimResult.calculationConfidence || threeDimResult.calculation_confidence || 80),
              outlierFlag: threeDimResult.outlierFlag || threeDimResult.outlier_flag || false,
              outlierReason: threeDimResult.outlierReason || threeDimResult.outlier_reason || null
            }
          }
        }
        
        console.log(`⚠️ 未找到三维计算结果，尝试从 bonusAllocationResults 表查询...`)
      }

      // 如果没有三维计算结果，再查询旧的奖金分配结果
      if (!employeeNo) {
        console.log(`⚠️ 无员工编号，无法查询 bonusAllocationResults`)
        return null
      }
      
      const fieldName = 'employee_id';
      // 注意：bonusAllocationResults 表可能没有 allocation_period 字段
      // 先尝试查询所有记录，然后筛选
      console.log(`🔍 尝试从 bonus_allocation_results 表查询...`)
      const allBonusAllocations = await dataService.findAll('bonusAllocationResults', {
        where: { [fieldName]: employeeNo.toString() }
      })
      
      const bonusAllocations = allBonusAllocations.rows || allBonusAllocations
      console.log(`📄 查询到 ${bonusAllocations.length} 条奖金分配记录`)
      
      // 根据 period 筛选
      let bonusAllocation = null
      if (period && bonusAllocations.length > 0) {
        // 尝试多个可能的期间字段名
        bonusAllocation = bonusAllocations.find(a => 
          a.allocation_period === period || 
          a.allocationPeriod === period ||
          a.period === period ||
          a.calculation_period === period ||
          a.calculationPeriod === period
        )
        
        if (!bonusAllocation) {
          console.log(`⚠️ 未找到期间 ${period} 的奖金记录，返回最新记录`)
          bonusAllocation = bonusAllocations
            .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))[0]
        }
      } else if (bonusAllocations.length > 0) {
        bonusAllocation = bonusAllocations
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))[0]
      }

      if (!bonusAllocation) {
        console.log(`未找到员工 ${employeeNo} 的奖金分配结果`)
        return null
      }

      console.log(`✅ 找到常规奖金数据:`, {
        totalAmount: bonusAllocation.total_amount,
        period: bonusAllocation.allocation_period,
        status: bonusAllocation.status
      })

      return {
        allocationId: bonusAllocation._id,
        period: bonusAllocation.allocation_period,
        totalAmount: parseFloat(bonusAllocation.total_amount) || 0,
        profitContribution: parseFloat(bonusAllocation.profit_contribution_amount) || 0,
        positionValue: parseFloat(bonusAllocation.position_value_amount) || 0,
        performance: parseFloat(bonusAllocation.performance_amount) || 0,
        baseAmount: parseFloat(bonusAllocation.base_amount) || 0,
        performanceAmount: parseFloat(bonusAllocation.performance_amount) || 0,
        adjustmentAmount: parseFloat(bonusAllocation.adjustment_amount) || 0,
        finalScore: parseFloat(bonusAllocation.final_score) || 0,
        rank: bonusAllocation.score_rank || 0,
        allocationDate: bonusAllocation.allocation_date,
        status: bonusAllocation.status || 'calculated',
        // 添加系数信息
        coefficients: {
          businessLine: parseFloat(bonusAllocation.businessLineCoefficient || bonusAllocation.business_line_coefficient) || 1.0,
          city: parseFloat(bonusAllocation.cityCoefficient || bonusAllocation.city_coefficient) || 1.0,
          benchmark: parseFloat(bonusAllocation.benchmarkValue || bonusAllocation.benchmark_value) || 0
        }
      }
    } catch (error) {
      console.error(`获取员工 ${employeeNo} 常规奖金失败:`, error.message)
      logger.error('获取常规奖金失败:', error)
      return null
    }
  }

  /**
   * 获取项目奖金
   */
  async getProjectBonus(userId, employeeId, period) {
    try {
      if (!employeeId) {
        console.warn(`无员工ID，无法获取项目奖金`)
        return null
      }

      console.log(`📊 查找项目奖金: 员工ID=${employeeId}, 期间=${period}`)

      // 查询该员工的所有项目奖金分配记录（不限期间）
      const dataService = databaseService;
      const fieldName = 'employee_id';
      
      // 使用 findAll 方法查询
      const projectAllocationsResult = await dataService.findAll('projectBonusAllocations', {
        where: { [fieldName]: employeeId.toString() }
      });
      const projectAllocations = projectAllocationsResult.rows || projectAllocationsResult;

      console.log(`🔍 查询到 ${projectAllocations.length} 条项目奖金分配记录`)

      if (!projectAllocations || projectAllocations.length === 0) {
        console.log(`未找到员工 ${employeeId} 的项目奖金分配记录`)
        return {
          totalAmount: 0,
          projectCount: 0,
          allocations: [],
          period
        }
      }

      // 如果没有指定期间，返回所有项目奖金
      // 否则，需要通过project_bonus_pools表来筛选期间
      let currentPeriodAllocations = []
      
      console.log(`🔍 处理 ${projectAllocations.length} 条项目奖金分配记录`)
      
      for (const allocation of projectAllocations) {
        try {
          const poolIdField = 'pool_id';
          const poolId = allocation[poolIdField] || allocation.poolId || allocation.pool_id;
          
          console.log(`🔍 查询奖金池: poolId=${poolId}`)
          
          // 获取对应的项目奖金池信息
          const poolResult = await dataService.findAll('projectBonusPools', { 
            where: { id: poolId } 
          });
          const pool = (poolResult.rows || poolResult)[0];
          
          if (pool) {
            console.log(`✅ 找到奖金池: 项目ID=${pool.projectId || pool.project_id}, 期间=${pool.period}`)
            
            // 获取项目名称
            const projectIdField = 'project_id';
            const projectId = pool[projectIdField] || pool.projectId || pool.project_id;
            
            let projectName = `项目${projectId}`;
            try {
              const projectResult = await dataService.findAll('projects', { 
                where: { id: projectId } 
              });
              const project = (projectResult.rows || projectResult)[0];
              if (project) {
                projectName = project.name;
              }
            } catch (error) {
              console.warn(`查询项目名称失败: ${error.message}`)
            }
            
            // 如果没有指定期间，或者期间匹配，则添加到结果中
            // 支持：精确匹配、月份→季度、年度→季度、季度→月份范围
            let periodMatch = false
            if (!period) {
              // 不传期间：匹配所有
              periodMatch = true
            } else if (pool.period === period) {
              // 精确匹配
              periodMatch = true
            } else if (period && /^\d{4}$/.test(period)) {
              // ✅ 年度格式(2025) -> 匹配该年所有季度和月份
              const inputYear = period
              
              // 匹配季度格式：2025Q1, 2025Q2, 2025Q3, 2025Q4
              const poolQuarterMatch = pool.period && pool.period.match(/^(\d{4})Q(\d)$/)
              if (poolQuarterMatch) {
                const poolYear = poolQuarterMatch[1]
                periodMatch = poolYear === inputYear
              }
              
              // 匹配月份格式：2025-01, 2025-02, ..., 2025-12
              const poolMonthMatch = pool.period && pool.period.match(/^(\d{4})-(\d{2})$/)
              if (poolMonthMatch) {
                const poolYear = poolMonthMatch[1]
                periodMatch = poolYear === inputYear
              }
              
              // 匹配年度格式：2025
              if (pool.period && /^\d{4}$/.test(pool.period)) {
                periodMatch = pool.period === inputYear
              }
            } else if (period && /^\d{4}-\d{2}$/.test(period)) {
              // 月份格式(2025-12) -> 季度格式(2025Q4)
              const [year, month] = period.split('-')
              const quarter = Math.ceil(parseInt(month) / 3)
              const quarterPeriod = `${year}Q${quarter}`
              periodMatch = pool.period === quarterPeriod
            } else if (pool.period && /^\d{4}Q\d$/.test(pool.period)) {
              // 季度格式(2025Q4) -> 月份范围匹配
              const quarterMatch = pool.period.match(/^(\d{4})Q(\d)$/)
              if (quarterMatch && period) {
                const poolYear = quarterMatch[1]
                const poolQuarter = parseInt(quarterMatch[2])
                const [inputYear, inputMonth] = period.split('-')
                const inputQuarter = Math.ceil(parseInt(inputMonth || '0') / 3)
                periodMatch = poolYear === inputYear && poolQuarter === inputQuarter
              }
            }
            
            if (periodMatch) {
              const bonusAmountField = 'bonus_amount';
              const bonusAmount = allocation[bonusAmountField] || allocation.bonusAmount || allocation.bonus_amount || 0;
              
              currentPeriodAllocations.push({
                ...allocation,
                projectId: projectId,
                projectName: projectName,
                poolTotalAmount: pool.totalAmount || pool.total_amount || 0,
                period: pool.period,
                bonusAmount: bonusAmount
              })
              
              console.log(`✅ 添加项目奖金: ${projectName}, 金额¥${bonusAmount}, 期间=${pool.period}`)
            } else {
              console.log(`⏳ 跳过不同期间的项目: ${projectName}, 期间${pool.period} vs ${period}`)
            }
          } else {
            console.warn(`⚠️ 未找到奖金池: ${poolId}，直接添加该奖金记录`)
            // 即使找不到奖金池，也添加这条记录（使用默认值）
            const bonusAmountField = 'bonus_amount';
            const bonusAmount = allocation[bonusAmountField] || allocation.bonusAmount || allocation.bonus_amount || 0;
            
            currentPeriodAllocations.push({
              ...allocation,
              projectId: 'unknown',
              projectName: '未知项目',
              poolTotalAmount: 0,
              period: period || 'unknown',
              bonusAmount: bonusAmount
            })
          }
        } catch (error) {
          console.error(`处理项目奖金分配 ${allocation._id || allocation.id} 时出错:`, error.message)
        }
      }

      if (currentPeriodAllocations.length === 0) {
        console.log(`员工 ${employeeId} 在期间 ${period} 没有项目奖金`)
        return {
          totalAmount: 0,
          projectCount: 0,
          allocations: [],
          period
        }
      }

      // 去重处理：同一个项目只保留一条记录，金额累加
      const uniqueProjects = new Map();
      currentPeriodAllocations.forEach(allocation => {
        const key = `${allocation.projectId}-${allocation.period}`;
        if (uniqueProjects.has(key)) {
          // 如果已存在，累加金额
          const existing = uniqueProjects.get(key);
          existing.bonusAmount = (parseFloat(existing.bonusAmount) || 0) + (parseFloat(allocation.bonusAmount) || 0);
          existing.allocations.push(allocation);
        } else {
          // 如果不存在，创建新记录
          uniqueProjects.set(key, {
            ...allocation,
            bonusAmount: parseFloat(allocation.bonusAmount) || 0,
            allocations: [allocation]
          });
        }
      });
      
      const uniqueAllocations = Array.from(uniqueProjects.values());
      
      const totalAmount = uniqueAllocations.reduce((sum, allocation) => 
        sum + (parseFloat(allocation.bonusAmount) || 0), 0)

      console.log(`✅ 找到项目奖金数据:`, {
        totalAmount,
        projectCount: uniqueAllocations.length,
        详细记录: uniqueAllocations.map(a => ({
          项目: a.projectName,
          金额: a.bonusAmount,
          期间: a.period
        }))
      })

      return {
        totalAmount: Math.round(totalAmount * 100) / 100,
        projectCount: uniqueAllocations.length,
        allocations: uniqueAllocations.map(allocation => ({
          projectId: allocation.projectId,
          projectName: allocation.projectName,
          amount: parseFloat(allocation.bonusAmount) || 0, // 前端API类型定义期望 amount
          role: allocation.role || '成员',
          status: allocation.status || 'calculated'
        })),
        period
      }
    } catch (error) {
      console.error(`获取员工 ${employeeId} 项目奖金失败:`, error.message)
      console.error(`错误堆栈:`, error.stack)
      logger.error('获取项目奖金失败:', error)
      return {
        totalAmount: 0,
        projectCount: 0,
        allocations: [],
        period
      }
    }
  }

  /**
   * 获取奖金历史记录
   */
  async getBonusHistory(userId, employeeId, limit = 12) {
    try {
      const history = []

      if (employeeId) {
        // 获取常规奖金历史
        const dataService = databaseService;
        const employee = await dataService.getEmployeeById(employeeId)
        if (employee) {
          const regularHistory = await this.getRegularBonusHistory(employee.employeeNo, limit)
          
          // 获取项目奖金历史
          const projectHistory = await this.getProjectBonusHistory(employeeId, limit)
          
          // 合并历史记录
          return this.combineAndSortHistory(regularHistory, projectHistory)
        }
      }

      return []
    } catch (error) {
      logger.error('获取奖金历史失败:', error)
      return []
    }
  }

  /**
   * 获取常规奖金历史
   */
  async getRegularBonusHistory(employeeNo, limit = 12) {
    try {
      if (!employeeNo) return []

      const dataService = databaseService;
      // MySQL 使用 employee_id 字段
      const allocations = await dataService.find('bonusAllocationResults', {
        employee_id: employeeNo
      })

      return allocations
        .sort((a, b) => new Date(b.allocationDate) - new Date(a.allocationDate))
        .slice(0, limit)
        .map(allocation => ({
          type: 'regular',
          period: allocation.allocationPeriod,
          date: allocation.allocationDate,
          amount: allocation.totalAmount || 0,
          breakdown: {
            profitContribution: allocation.profitContributionAmount || 0,
            positionValue: allocation.positionValueAmount || 0,
            performance: allocation.performanceAmount || 0
          },
          score: allocation.finalScore,
          rank: allocation.scoreRank,
          status: allocation.status
        }))
    } catch (error) {
      logger.error('获取常规奖金历史失败:', error)
      return []
    }
  }

  /**
   * 获取项目奖金历史
   */
  async getProjectBonusHistory(employeeId, limit = 12) {
    try {
      if (!employeeId) return []

      const dataService = databaseService;
      // MySQL 使用 employee_id 字段
      const allocations = await dataService.find('projectBonusAllocations', {
        employee_id: employeeId
      })

      const history = []
      for (const allocation of allocations) {
        const pool = await dataService.findOne('projectBonusPools', { _id: allocation.poolId })
        if (pool) {
          history.push({
            type: 'project',
            period: pool.period,
            date: allocation.calculatedAt || allocation.createdAt,
            amount: allocation.bonusAmount || 0,
            projectId: pool.projectId,
            projectName: pool.projectName || `项目${pool.projectId}`,
            role: allocation.roleId,
            roleWeight: allocation.roleWeight,
            participationRatio: allocation.participationRatio,
            status: allocation.status
          })
        }
      }

      return history
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit)
    } catch (error) {
      logger.error('获取项目奖金历史失败:', error)
      return []
    }
  }

  /**
   * 合并并排序历史记录
   */
  combineAndSortHistory(regularHistory, projectHistory) {
    const combined = [...regularHistory, ...projectHistory]
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  /**
   * 计算历史汇总统计
   */
  calculateHistorySummary(history) {
    if (history.length === 0) {
      return {
        totalPeriods: 0,
        totalBonusReceived: 0,
        averageBonusPerPeriod: 0,
        highestBonus: { amount: 0, period: null },
        lowestBonus: { amount: 0, period: null }
      }
    }

    const totalBonus = history.reduce((sum, record) => sum + record.amount, 0)
    const amounts = history.map(record => record.amount)
    const maxAmount = Math.max(...amounts)
    const minAmount = Math.min(...amounts)

    return {
      totalPeriods: history.length,
      totalBonusReceived: totalBonus,
      averageBonusPerPeriod: totalBonus / history.length,
      highestBonus: {
        amount: maxAmount,
        period: history.find(r => r.amount === maxAmount)?.period
      },
      lowestBonus: {
        amount: minAmount,
        period: history.find(r => r.amount === minAmount)?.period
      }
    }
  }

  /**
   * 获取绩效指标
   */
  async getPerformanceMetrics(employeeId, period) {
    try {
      const dataService = databaseService;
      
      // 首先尝试从 performance_three_dimensional_scores 表获取（绩效记录管理导入的数据）
      let performanceData = null
      
      try {
        // 支持季度格式查询：如果 period 是季度格式（2025Q1），需要查询该季度的所有月份
        let queryCondition = '';
        let queryParams = [employeeId];
        
        if (period && /^\d{4}Q[1-4]$/.test(period)) {
          // 季度格式：2025Q1 -> 查询 2025-01, 2025-02, 2025-03
          const match = period.match(/^(\d{4})Q([1-4])$/);
          const year = match[1];
          const quarter = parseInt(match[2]);
          const startMonth = (quarter - 1) * 3 + 1;
          const endMonth = quarter * 3;
          
          queryCondition = `AND (calculation_period = ? OR (calculation_period LIKE ? AND CAST(SUBSTRING(calculation_period, 6, 2) AS UNSIGNED) BETWEEN ? AND ?))`;
          queryParams.push(
            period,  // 精确匹配季度格式
            `${year}-%`,  // 模糊匹配月份格式
            startMonth,
            endMonth
          );
        } else if (period) {
          // 月份格式或其他格式，精确匹配
          queryCondition = 'AND calculation_period = ?';
          queryParams.push(period);
        }
        
        const scoreResult = await databaseManager.query(`
          SELECT 
            employee_id,
            calculation_period,
            position_score,
            performance_score,
            profit_contribution,
            created_at,
            review_status
          FROM performance_three_dimensional_scores 
          WHERE employee_id = ? ${queryCondition}
          ORDER BY calculation_period DESC
          LIMIT 1
        `, queryParams)
        
        if (scoreResult && scoreResult.length > 0) {
          const score = scoreResult[0]
          console.log(`✅ 从 performance_three_dimensional_scores 表找到绩效数据:`, score)
          
          // 绩效评分转换为 0-1 范围
          const performanceScore = parseFloat(score.performance_score || 0) / 100
          
          performanceData = {
            overallScore: performanceScore,  // 总评分使用绩效评分
            efficiency: performanceScore * 0.9,      // 工作效率（绩效的90%）
            innovation: performanceScore * 0.85,     // 创新能力（绩效的85%）
            teamwork: performanceScore * 0.95,       // 团队协作（绩效的95%）
            leadership: performanceScore * 0.8,      // 领导力（绩效的80%）
            status: score.review_status || 'active',
            evaluationDate: score.created_at,
            period: score.calculation_period  // 返回实际的期间
          }
          console.log(`✅ 转换后的绩效数据:`, performanceData)
          return performanceData
        }
      } catch (err) {
        console.warn('⚠️ performance_three_dimensional_scores 表查询失败:', err.message)
      }
      
      // 如果 performance_three_dimensional_scores 没有数据，尝试从 performanceAssessments 表获取
      const assessment = await dataService.findOne('performanceAssessments', {
        employee_id: employeeId,
        period: period
      })

      if (!assessment) {
        console.warn(`⚠️ 未找到员工 ${employeeId} 期间 ${period} 的绩效数据`)
        return null
      }

      console.log(`✅ 从 performanceAssessments 表找到绩效数据:`, assessment)
      return {
        overallScore: (assessment.finalScore || 0) / 100,
        efficiency: 0.75,  // 默认值
        innovation: 0.70,  // 默认值
        teamwork: 0.80,    // 默认值
        leadership: 0,
        finalScore: assessment.finalScore || 0,
        indicators: assessment.indicators || [],
        selfEvaluation: assessment.selfEvaluation || 0,
        supervisorEvaluation: assessment.supervisorEvaluation || 0,
        peerEvaluation: assessment.peerEvaluation || 0,
        status: assessment.status,
        evaluationDate: assessment.evaluationDate,
        period: assessment.period
      }
    } catch (error) {
      logger.error('获取绩效指标失败:', error)
      return null
    }
  }

  /**
   * 获取三维分数
   */
  async getThreeDimensionalScore(employeeId, period) {
    try {
      const dataService = databaseService;
      // MySQL 使用 employee_id 字段
      const result = await dataService.findOne('three_dimensional_calculation_results', {
        employee_id: employeeId,
        calculationPeriod: period
      })

      if (!result) return null

      return {
        profitContribution: result.profitContributionScore || 0,
        positionValue: result.positionValueScore || 0,
        performance: result.performanceScore || 0,
        finalScore: result.finalScore || 0,
        calculationDate: result.calculationDate
      }
    } catch (error) {
      logger.error('获取三维分数失败:', error)
      return null
    }
  }

  /**
   * 模拟绩效变化对奖金的影响
   */
  async simulateBonusWithPerformanceChange(employee, performanceMultiplier, period) {
    try {
      // 获取当前奖金数据
      const currentBonus = await this.getRegularBonus(null, employee._id, employee.employeeNo, period)
      if (!currentBonus) {
        return { totalAmount: 0, breakdown: {} }
      }

      // 模拟绩效提升后的奖金
      const simulatedPerformanceAmount = (currentBonus.performance || 0) * performanceMultiplier
      const totalAmount = (currentBonus.profitContribution || 0) + 
                         (currentBonus.positionValue || 0) + 
                         simulatedPerformanceAmount

      return {
        totalAmount,
        breakdown: {
          profitContribution: currentBonus.profitContribution || 0,
          positionValue: currentBonus.positionValue || 0,
          performance: simulatedPerformanceAmount,
          project: 0
        }
      }
    } catch (error) {
      logger.error('模拟绩效变化失败:', error)
      return { totalAmount: 0, breakdown: {} }
    }
  }

  /**
   * 模拟职位变化对奖金的影响
   */
  async simulateBonusWithPositionChange(employee, newPositionId, period) {
    try {
      const currentBonus = await this.getRegularBonus(null, employee._id, employee.employeeNo, period)
      if (!currentBonus) {
        return { totalAmount: 0, breakdown: {} }
      }

      const newPosition = await this.getPositionInfo(newPositionId)
      const currentPosition = await this.getPositionInfo(employee.positionId)

      if (!newPosition || !currentPosition) {
        return { totalAmount: 0, breakdown: {} }
      }

      // 假设职位价值提升比例基于基础薪资差异
      const positionValueMultiplier = (newPosition.baseSalary || currentPosition.baseSalary) / 
                                     (currentPosition.baseSalary || newPosition.baseSalary || 1)

      const simulatedPositionValue = (currentBonus.positionValue || 0) * positionValueMultiplier
      const totalAmount = (currentBonus.profitContribution || 0) + 
                         simulatedPositionValue + 
                         (currentBonus.performance || 0)

      return {
        totalAmount,
        breakdown: {
          profitContribution: currentBonus.profitContribution || 0,
          positionValue: simulatedPositionValue,
          performance: currentBonus.performance || 0,
          project: 0
        }
      }
    } catch (error) {
      logger.error('模拟职位变化失败:', error)
      return { totalAmount: 0, breakdown: {} }
    }
  }

  /**
   * 模拟额外项目奖金
   */
  async simulateAdditionalProjectBonus(employeeId, additionalProjects) {
    try {
      if (!additionalProjects || additionalProjects.length === 0) {
        return { totalAmount: 0, projects: [] }
      }

      let totalAmount = 0
      const projects = []

      for (const projectConfig of additionalProjects) {
        // 基于项目规模和角色估算奖金
        const estimatedAmount = (projectConfig.estimatedBudget || 100000) * 
                               (projectConfig.roleWeight || 0.1) * 
                               0.05 // 假设奖金占项目预算的5%

        totalAmount += estimatedAmount
        projects.push({
          projectId: projectConfig.projectId,
          estimatedAmount,
          role: projectConfig.role,
          participationRatio: projectConfig.participationRatio || 1
        })
      }

      return { totalAmount, projects }
    } catch (error) {
      logger.error('模拟额外项目奖金失败:', error)
      return { totalAmount: 0, projects: [] }
    }
  }

  /**
   * 生成奖金建议
   */
  async generateBonusRecommendations(employee, simulationResults) {
    const recommendations = []

    // 找出最佳提升方案
    const bestScenario = simulationResults
      .filter(s => s.scenario !== 'current')
      .sort((a, b) => b.bonusAmount - a.bonusAmount)[0]

    if (bestScenario) {
      recommendations.push({
        type: 'best_opportunity',
        title: '最佳提升机会',
        scenario: bestScenario.scenario,
        description: `通过${bestScenario.name}可以获得最大的奖金提升`,
        potentialIncrease: bestScenario.bonusAmount - simulationResults[0].bonusAmount,
        priority: 'high'
      })
    }

    // 短期建议
    recommendations.push({
      type: 'short_term',
      title: '短期行动建议',
      description: '可以立即开始的改进行动',
      actions: [
        '主动与上级讨论绩效目标',
        '参与团队的重要项目',
        '提高工作质量和效率'
      ],
      timeframe: '1-3个月',
      priority: 'high'
    })

    // 长期建议
    recommendations.push({
      type: 'long_term',
      title: '长期发展建议',
      description: '职业发展和能力提升建议',
      actions: [
        '制定职业发展规划',
        '提升核心技能和专业能力',
        '积累管理和领导经验'
      ],
      timeframe: '6-12个月',
      priority: 'medium'
    })

    return recommendations
  }

  /**
   * 分析奖金趋势
   */
  analyzeBonusTrend(history) {
    if (history.length < 3) {
      return { trend: 'insufficient_data', message: '历史数据不足以分析趋势' }
    }

    const recent = history.slice(0, 3).map(h => h.amount)
    const earlier = history.slice(3, 6).map(h => h.amount)

    const recentAvg = recent.reduce((sum, amt) => sum + amt, 0) / recent.length
    const earlierAvg = earlier.length > 0 ? 
      earlier.reduce((sum, amt) => sum + amt, 0) / earlier.length : recentAvg

    const changeRatio = (recentAvg - earlierAvg) / (earlierAvg || 1)

    let trend = 'stable'
    if (changeRatio > 0.1) trend = 'rising'
    else if (changeRatio < -0.1) trend = 'declining'

    return {
      trend,
      recentAverage: recentAvg,
      earlierAverage: earlierAvg,
      changeRatio,
      changeAmount: recentAvg - earlierAvg
    }
  }

  // 其他辅助计算方法的占位符
  async calculatePerformanceImprovementImpact(employee, currentScore, targetScore) {
    // 计算绩效提升的百分比影响：绩效提升10分对应奖金增长5%
    const scoreDiff = targetScore - currentScore
    const impactPercent = (scoreDiff / 10) * 5 // 每提升10分，奖金增长5%
    return Math.round(Math.max(0, Math.min(100, impactPercent))) // 限制在0-100%之间
  }

  async estimateProjectBonusOpportunity(employee) {
    // 估算项目奖金机会：返回百分比
    // 根据员工当前奖金水平，参与新项目预计能增长10-20%
    try {
      const currentBonus = await this.getRegularBonus(null, employee._id, employee.employee_no || employee.employeeNo, await this.getCurrentPeriod())
      if (currentBonus && currentBonus.totalAmount > 0) {
        // 如果有当前奖金，预计新项目能增长15%
        return 15
      }
      // 如果没有当前奖金，预计首个项目能带来显著提升
      return 20
    } catch (error) {
      logger.error('估算项目奖金机会失败:', error)
      return 15
    }
  }

  async getAvailablePromotionPositions(employee) {
    // 简化实现：返回更高级别的岗位
    const dataService = databaseService;
    const allPositions = await dataService.getPositions()
    const currentPosition = await this.getPositionInfo(employee.positionId)

    if (!currentPosition) return []

    return allPositions
      .filter(pos => (pos.level || 0) > (currentPosition.level || 0))
      .slice(0, 3) // 返回最多3个晋升机会
      .map(pos => ({
        id: pos._id,
        name: pos.name,
        level: pos.level,
        baseSalary: pos.baseSalary
      }))
  }

  async calculatePromotionImpact(employee, targetPosition) {
    // 计算职位晋升影响：返回百分比
    try {
      const currentPosition = await this.getPositionInfo(employee.positionId)
      if (!currentPosition || !targetPosition) return 20 // 默认晋升可增长20%
      
      // 根据薪资差异计算奖金增长百分比
      const currentSalary = currentPosition.baseSalary || 50000
      const targetSalary = targetPosition.baseSalary || currentSalary * 1.3
      
      // 薪资增长比例通常对应相同的奖金增长比例
      const salaryIncreasePercent = ((targetSalary - currentSalary) / currentSalary) * 100
      
      return Math.round(Math.max(15, Math.min(50, salaryIncreasePercent))) // 限制在15-50%之间
    } catch (error) {
      logger.error('计算晋升影响失败:', error)
      return 20
    }
  }

  async calculateProfitContributionImpact(employee, targetScore) {
    const currentBonus = await this.getRegularBonus(null, employee._id, employee.employeeNo, await this.getCurrentPeriod())
    return (currentBonus?.profitContribution || 0) * (targetScore / 0.7 - 1)
  }

  async calculatePositionValueImpact(employee, targetScore) {
    const currentBonus = await this.getRegularBonus(null, employee._id, employee.employeeNo, await this.getCurrentPeriod())
    return (currentBonus?.positionValue || 0) * (targetScore / 0.75 - 1)
  }

  async getEmployeeProjectParticipation(employeeId, period) {
    try {
      const dataService = databaseService;
      const projectMembers = await dataService.getEmployeeProjectMembers(employeeId)
      const activeProjects = projectMembers.filter(pm => pm.status === 'approved').length

      return {
        activeProjects,
        totalProjects: projectMembers.length,
        currentPeriodProjects: projectMembers.filter(pm => {
          // 这里需要根据项目的期间来判断
          return pm.status === 'approved' // 简化实现
        }).length
      }
    } catch (error) {
      logger.error('获取员工项目参与情况失败:', error)
      return { activeProjects: 0, totalProjects: 0, currentPeriodProjects: 0 }
    }
  }
}

module.exports = new PersonalBonusService()