/**
 * 系统通知路由
 */

const express = require('express')
const router = express.Router()
const reminderController = require('../controllers/milestoneReminderController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 获取用户的系统通知
 * GET /api/notifications
 */
router.get('/', reminderController.getNotifications)

/**
 * 标记通知为已读
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', reminderController.markNotificationAsRead)

/**
 * 标记所有通知为已读
 * PUT /api/notifications/read-all
 */
router.put('/read-all', reminderController.markAllAsRead)

module.exports = router
