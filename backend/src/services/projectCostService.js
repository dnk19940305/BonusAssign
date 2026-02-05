const databaseService = require('./databaseService')
const logger = require('../utils/logger')

/**
 * 项目成本服务
 * 处理项目成本相关的业务逻辑
 */
class ProjectCostService {
  /**
   * 创建项目成本记录
   */
  async createProjectCost(costData) {
    const data = {
      ...costData,
      created_at: new Date(),
      updated_at: new Date()
    }
    return await databaseService.insert('projectCosts', data)
  }

  /**
   * 获取项目成本列表
   */
  async getProjectCosts(query = {}) {
    return await databaseService.find('projectCosts', query)
  }

  /**
   * 更新项目成本记录
   */
  async updateProjectCost(costId, updateData) {
    const data = {
      ...updateData,
      updated_at: new Date()
    }
    return await databaseService.manager.update('project_costs', costId, data)
  }

  /**
   * 删除项目成本记录
   */
  async deleteProjectCost(costId) {
    return await databaseService.manager.destroy('project_costs', costId)
  }

  /**
   * 获取项目成本汇总
   */
  async getProjectCostSummary(projectId) {
    const project = await databaseService.findOne('projects', { _id: projectId })
    if (!project) {
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

    const costs = await databaseService.find('projectCosts', { projectId })

    const totalCost = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    const costByType = {}

    costs.forEach(cost => {
      const type = cost.costType || 'other'
      if (!costByType[type]) {
        costByType[type] = 0
      }
      costByType[type] += cost.amount || 0
    })

    const totalBudget = parseFloat(project.budget) || 0
    const expectedProfit = totalBudget - totalCost

    let allocatedProjectBonus = 0
    try {
      const bonusPools = await databaseService.find('projectBonusPools', { projectId })
      allocatedProjectBonus = bonusPools.reduce((sum, pool) => {
        return sum + (parseFloat(pool.totalAmount || pool.total_amount) || 0)
      }, 0)

      logger.info(`项目 ${projectId} 已分配奖金: ${allocatedProjectBonus}`)
    } catch (error) {
      logger.warn(`获取项目 ${projectId} 奖金池失败:`, error.message)
      allocatedProjectBonus = 0
    }

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

  /**
   * 获取所有项目成本汇总
   */
  async getAllProjectCostSummaries() {
    const projects = await databaseService.find('projects', {})
    const summaries = await Promise.all(
      projects.map(project => this.getProjectCostSummary(project._id || project.id))
    )
    return summaries
  }
}

module.exports = new ProjectCostService()
