/**
 * 里程碑奖金控制器
 */

const bonusService = require('../services/milestoneBonusService')
const logger = require('../utils/logger')

/**
 * 配置里程碑奖金
 * POST /api/milestone-bonus/config
 */
async function configureMilestoneBonus(req, res) {
  try {
    const data = req.body

    if (!data.projectId || !data.milestoneId || data.bonusWeight === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const config = await bonusService.configureMilestoneBonus(data)

    res.json({
      success: true,
      message: '配置成功',
      data: config
    })
  } catch (error) {
    logger.error('配置里程碑奖金失败:', error)
    res.status(500).json({
      success: false,
      message: '配置失败',
      error: error.message
    })
  }
}

/**
 * 获取奖金配置
 * GET /api/milestone-bonus/config/:milestoneId
 */
async function getBonusConfig(req, res) {
  try {
    const { milestoneId } = req.params

    const config = await bonusService.getBonusConfig(milestoneId)

    if (!config) {
      return res.status(404).json({
        success: false,
        message: '未找到配置'
      })
    }

    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    logger.error('获取奖金配置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 计算里程碑奖金
 * POST /api/milestone-bonus/calculate/:milestoneId
 */
async function calculateMilestoneBonus(req, res) {
  try {
    const { milestoneId } = req.params
    const userId = req.user.id

    const calculation = await bonusService.calculateMilestoneBonus(milestoneId, userId)

    res.json({
      success: true,
      message: '计算成功',
      data: calculation
    })
  } catch (error) {
    logger.error('计算里程碑奖金失败:', error)
    res.status(500).json({
      success: false,
      message: '计算失败',
      error: error.message
    })
  }
}

/**
 * 获取计算记录
 * GET /api/milestone-bonus/calculation/:calculationId
 */
async function getCalculation(req, res) {
  try {
    const { calculationId } = req.params

    const calculation = await bonusService.getCalculationById(calculationId)

    if (!calculation) {
      return res.status(404).json({
        success: false,
        message: '未找到计算记录'
      })
    }

    res.json({
      success: true,
      data: calculation
    })
  } catch (error) {
    logger.error('获取计算记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 分配奖金到成员
 * POST /api/milestone-bonus/allocate/:calculationId
 */
async function allocateBonusToMembers(req, res) {
  try {
    const { calculationId } = req.params
    const { allocations } = req.body

    if (!allocations || !Array.isArray(allocations)) {
      return res.status(400).json({
        success: false,
        message: '请提供分配方案'
      })
    }

    const bonuses = await bonusService.allocateBonusToMembers(calculationId, allocations)

    res.json({
      success: true,
      message: '分配成功',
      data: bonuses
    })
  } catch (error) {
    logger.error('分配奖金失败:', error)
    res.status(500).json({
      success: false,
      message: '分配失败',
      error: error.message
    })
  }
}

/**
 * 获取成员奖金分配
 * GET /api/milestone-bonus/members/:calculationId
 */
async function getMemberBonuses(req, res) {
  try {
    const { calculationId } = req.params

    const bonuses = await bonusService.getMemberBonuses(calculationId)

    res.json({
      success: true,
      data: bonuses
    })
  } catch (error) {
    logger.error('获取成员奖金失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 审核奖金计算
 * POST /api/milestone-bonus/approve/:calculationId
 */
async function approveBonusCalculation(req, res) {
  try {
    const { calculationId } = req.params
    const userId = req.user.id

    const calculation = await bonusService.approveBonusCalculation(calculationId, userId)

    res.json({
      success: true,
      message: '审核通过',
      data: calculation
    })
  } catch (error) {
    logger.error('审核奖金计算失败:', error)
    res.status(500).json({
      success: false,
      message: '审核失败',
      error: error.message
    })
  }
}

/**
 * 提交质量评分
 * POST /api/milestone-bonus/quality-score
 */
async function submitQualityScore(req, res) {
  try {
    const data = req.body
    data.scoredBy = req.user.id

    if (!data.milestoneId || !data.projectId || data.qualityScore === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const score = await bonusService.submitQualityScore(data)

    res.json({
      success: true,
      message: '评分成功',
      data: score
    })
  } catch (error) {
    logger.error('提交质量评分失败:', error)
    res.status(500).json({
      success: false,
      message: '评分失败',
      error: error.message
    })
  }
}

/**
 * 获取项目奖金池
 * GET /api/milestone-bonus/pool/:projectId
 */
async function getProjectBonusPool(req, res) {
  try {
    const { projectId } = req.params

    const pool = await bonusService.getProjectBonusPool(projectId)

    res.json({
      success: true,
      data: pool || {}
    })
  } catch (error) {
    logger.error('获取奖金池失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 创建或更新项目奖金池
 * POST /api/milestone-bonus/pool/:projectId
 */
async function createOrUpdateBonusPool(req, res) {
  try {
    const { projectId } = req.params
    const { totalBudget } = req.body

    if (!totalBudget || totalBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的预算金额'
      })
    }

    const pool = await bonusService.createOrUpdateBonusPool(projectId, totalBudget)

    res.json({
      success: true,
      message: '设置成功',
      data: pool
    })
  } catch (error) {
    logger.error('设置奖金池失败:', error)
    res.status(500).json({
      success: false,
      message: '设置失败',
      error: error.message
    })
  }
}

/**
 * 获取项目所有里程碑奖金配置
 * GET /api/milestone-bonus/project/:projectId/configs
 */
async function getProjectMilestoneBonusConfigs(req, res) {
  try {
    const { projectId } = req.params

    const configs = await bonusService.getProjectMilestoneBonusConfigs(projectId)

    res.json({
      success: true,
      data: configs
    })
  } catch (error) {
    logger.error('获取项目里程碑奖金配置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 批量配置里程碑奖金权重
 * POST /api/milestone-bonus/project/:projectId/batch-config
 */
async function batchConfigureBonusWeights(req, res) {
  try {
    const { projectId } = req.params
    const { configurations } = req.body

    if (!configurations || !Array.isArray(configurations)) {
      return res.status(400).json({
        success: false,
        message: '请提供配置数据'
      })
    }

    const configs = await bonusService.batchConfigureBonusWeights(projectId, configurations)

    res.json({
      success: true,
      message: '批量配置成功',
      data: configs
    })
  } catch (error) {
    logger.error('批量配置奖金权重失败:', error)
    res.status(500).json({
      success: false,
      message: '配置失败',
      error: error.message
    })
  }
}

module.exports = {
  configureMilestoneBonus,
  getBonusConfig,
  calculateMilestoneBonus,
  getCalculation,
  allocateBonusToMembers,
  getMemberBonuses,
  approveBonusCalculation,
  submitQualityScore,
  getProjectBonusPool,
  createOrUpdateBonusPool,
  getProjectMilestoneBonusConfigs,
  batchConfigureBonusWeights
}
