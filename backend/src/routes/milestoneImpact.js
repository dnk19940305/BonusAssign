/**
 * 里程碑影响分析路由
 */

const express = require('express')
const router = express.Router()
const impactController = require('../controllers/milestoneImpactController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 分析里程碑延期影响
 * POST /api/milestone-impact/analyze-delay
 * Body: { milestoneId, originalDate, newDate }
 */
router.post('/analyze-delay', impactController.analyzeDelay)

/**
 * 计算项目关键路径
 * POST /api/milestone-impact/critical-path/:projectId
 */
router.post('/critical-path/:projectId', impactController.calculateCriticalPath)

/**
 * 获取项目关键路径
 * GET /api/milestone-impact/critical-path/:projectId
 */
router.get('/critical-path/:projectId', impactController.getCriticalPath)

/**
 * 获取影响分析记录
 * GET /api/milestone-impact/analysis
 * Query: projectId, milestoneId, impactLevel, page, pageSize
 */
router.get('/analysis', impactController.getAnalysisRecords)

/**
 * 获取里程碑的依赖链
 * GET /api/milestone-impact/dependency-chain/:milestoneId
 */
router.get('/dependency-chain/:milestoneId', impactController.getDependencyChain)

/**
 * 刷新项目依赖缓存
 * POST /api/milestone-impact/refresh-cache/:projectId
 */
router.post('/refresh-cache/:projectId', impactController.refreshCache)

module.exports = router
