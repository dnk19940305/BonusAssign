/**
 * 里程碑奖金路由
 */

const express = require('express')
const router = express.Router()
const bonusController = require('../controllers/milestoneBonusController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 奖金配置
 */

// 配置里程碑奖金
router.post('/config', bonusController.configureMilestoneBonus)

// 获取奖金配置
router.get('/config/:milestoneId', bonusController.getBonusConfig)

// 获取项目所有里程碑奖金配置
router.get('/project/:projectId/configs', bonusController.getProjectMilestoneBonusConfigs)

// 批量配置奖金权重
router.post('/project/:projectId/batch-config', bonusController.batchConfigureBonusWeights)

/**
 * 奖金计算
 */

// 计算里程碑奖金
router.post('/calculate/:milestoneId', bonusController.calculateMilestoneBonus)

// 获取计算记录
router.get('/calculation/:calculationId', bonusController.getCalculation)

// 审核奖金计算
router.post('/approve/:calculationId', bonusController.approveBonusCalculation)

/**
 * 奖金分配
 */

// 分配奖金到成员
router.post('/allocate/:calculationId', bonusController.allocateBonusToMembers)

// 获取成员奖金分配
router.get('/members/:calculationId', bonusController.getMemberBonuses)

/**
 * 质量评分
 */

// 提交质量评分
router.post('/quality-score', bonusController.submitQualityScore)

/**
 * 奖金池
 */

// 获取项目奖金池
router.get('/pool/:projectId', bonusController.getProjectBonusPool)

// 创建或更新项目奖金池
router.post('/pool/:projectId', bonusController.createOrUpdateBonusPool)

module.exports = router
