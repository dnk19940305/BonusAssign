/**
 * 项目里程碑和执行跟踪路由
 */

const express = require('express')
const router = express.Router()
const milestoneController = require('../controllers/milestoneController')
const executionController = require('../controllers/executionController')

// ==================== 里程碑管理路由 ====================

/**
 * 获取项目的所有里程碑
 * GET /api/projects/:projectId/milestones
 */
router.get('/projects/:projectId/milestones', milestoneController.getMilestones)

/**
 * 创建新里程碑
 * POST /api/projects/:projectId/milestones
 */
router.post('/projects/:projectId/milestones', milestoneController.createMilestone)

/**
 * 获取单个里程碑详情
 * GET /api/milestones/:id
 */
router.get('/milestones/:id', milestoneController.getMilestoneById)

/**
 * 更新里程碑
 * PUT /api/milestones/:id
 */
router.put('/milestones/:id', milestoneController.updateMilestone)

/**
 * 删除里程碑
 * DELETE /api/milestones/:id
 */
router.delete('/milestones/:id', milestoneController.deleteMilestone)

/**
 * 更新里程碑进度
 * PATCH /api/milestones/:id/progress
 */
router.patch('/milestones/:id/progress', milestoneController.updateMilestoneProgress)

// ==================== 项目执行跟踪路由 ====================

/**
 * 获取项目执行跟踪信息
 * GET /api/projects/:projectId/execution
 */
router.get('/projects/:projectId/execution', executionController.getProjectExecution)

/**
 * 创建或更新项目执行跟踪信息
 * POST /api/projects/:projectId/execution
 */
router.post('/projects/:projectId/execution', executionController.updateProjectExecution)

/**
 * 获取项目进度日志
 * GET /api/projects/:projectId/progress-logs
 */
router.get('/projects/:projectId/progress-logs', executionController.getProgressLogs)

/**
 * 计算项目整体进度（基于里程碑）
 * GET /api/projects/:projectId/calculate-progress
 */
router.get('/projects/:projectId/calculate-progress', executionController.calculateOverallProgress)

module.exports = router
