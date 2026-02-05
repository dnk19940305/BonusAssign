/**
 * 里程碑统计路由
 */

const express = require('express')
const router = express.Router()
const statsController = require('../controllers/milestoneStatisticsController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 获取项目统计
 * GET /api/milestone-stats/project/:projectId
 */
router.get('/project/:projectId', statsController.getProjectStatistics)

/**
 * 获取全局统计
 * GET /api/milestone-stats/global
 */
router.get('/global', statsController.getGlobalStatistics)

/**
 * 获取项目排行榜
 * GET /api/milestone-stats/ranking
 */
router.get('/ranking', statsController.getProjectRanking)

/**
 * 获取趋势数据
 * GET /api/milestone-stats/trend
 */
router.get('/trend', statsController.getTrendData)

/**
 * 触发统计计算
 * POST /api/milestone-stats/calculate/:projectId
 */
router.post('/calculate/:projectId', statsController.calculateStatistics)

/**
 * 导出统计报表
 * GET /api/milestone-stats/export/:projectId
 */
router.get('/export/:projectId', statsController.exportStatistics)

module.exports = router
