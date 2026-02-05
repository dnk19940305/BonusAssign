/**
 * 里程碑提醒路由
 */

const express = require('express')
const router = express.Router()
const reminderController = require('../controllers/milestoneReminderController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 获取项目的提醒配置
 * GET /api/milestone-reminders/config/:projectId
 */
router.get('/config/:projectId', reminderController.getReminderConfig)

/**
 * 保存项目的提醒配置
 * POST /api/milestone-reminders/config/:projectId
 */
router.post('/config/:projectId', reminderController.saveReminderConfig)

/**
 * 获取提醒日志
 * GET /api/milestone-reminders/logs
 */
router.get('/logs', reminderController.getReminderLogs)

/**
 * 手动触发提醒检查 (管理员功能)
 * POST /api/milestone-reminders/trigger
 */
router.post('/trigger', reminderController.triggerReminderCheck)

module.exports = router
