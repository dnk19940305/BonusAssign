/**
 * 里程碑提醒管理控制器
 */

const databaseService = require('../services/databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')
const { triggerManually } = require('../jobs/milestoneReminderJob')

/**
 * 获取项目的提醒配置
 * GET /api/milestone-reminders/config/:projectId
 */
async function getReminderConfig(req, res) {
  try {
    const { projectId } = req.params

    const [config] = await databaseService.query(
      'SELECT * FROM milestone_reminder_configs WHERE project_id = ? AND status = 1',
      [projectId]
    )

    if (!config) {
      // 返回默认配置
      return res.json({
        success: true,
        data: {
          projectId,
          remindBeforeDays: [1, 3, 7],
          progressWarningEnabled: true,
          progressWarningThreshold: 20,
          dependencyWarningEnabled: true,
          overdueReminderEnabled: true,
          emailNotification: false,
          notificationReceivers: []
        }
      })
    }

    // 格式化返回
    const formattedConfig = {
      id: config.id,
      projectId: config.project_id,
      remindBeforeDays: JSON.parse(config.remind_before_days || '[]'),
      progressWarningEnabled: Boolean(config.progress_warning_enabled),
      progressWarningThreshold: config.progress_warning_threshold,
      dependencyWarningEnabled: Boolean(config.dependency_warning_enabled),
      overdueReminderEnabled: Boolean(config.overdue_reminder_enabled),
      emailNotification: Boolean(config.email_notification),
      notificationReceivers: JSON.parse(config.notification_receivers || '[]'),
      createdAt: config.created_at,
      updatedAt: config.updated_at
    }

    res.json({
      success: true,
      data: formattedConfig
    })
  } catch (error) {
    logger.error('获取提醒配置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取提醒配置失败',
      error: error.message
    })
  }
}

/**
 * 保存项目的提醒配置
 * POST /api/milestone-reminders/config/:projectId
 */
async function saveReminderConfig(req, res) {
  try {
    const { projectId } = req.params
    const {
      remindBeforeDays,
      progressWarningEnabled,
      progressWarningThreshold,
      dependencyWarningEnabled,
      overdueReminderEnabled,
      emailNotification,
      notificationReceivers
    } = req.body

    const createdBy = req.user?.id || null

    // 检查是否已存在配置
    const [existing] = await databaseService.query(
      'SELECT id FROM milestone_reminder_configs WHERE project_id = ?',
      [projectId]
    )

    if (existing) {
      // 更新
      await databaseService.query(
        `UPDATE milestone_reminder_configs 
         SET remind_before_days = ?,
             progress_warning_enabled = ?,
             progress_warning_threshold = ?,
             dependency_warning_enabled = ?,
             overdue_reminder_enabled = ?,
             email_notification = ?,
             notification_receivers = ?
         WHERE project_id = ?`,
        [
          JSON.stringify(remindBeforeDays || [1, 3, 7]),
          progressWarningEnabled !== false,
          progressWarningThreshold || 20,
          dependencyWarningEnabled !== false,
          overdueReminderEnabled !== false,
          emailNotification || false,
          JSON.stringify(notificationReceivers || []),
          projectId
        ]
      )
    } else {
      // 创建
      const configId = uuidv4()
      await databaseService.query(
        `INSERT INTO milestone_reminder_configs 
         (id, project_id, remind_before_days, progress_warning_enabled, 
          progress_warning_threshold, dependency_warning_enabled, 
          overdue_reminder_enabled, email_notification, 
          notification_receivers, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          configId,
          projectId,
          JSON.stringify(remindBeforeDays || [1, 3, 7]),
          progressWarningEnabled !== false,
          progressWarningThreshold || 20,
          dependencyWarningEnabled !== false,
          overdueReminderEnabled !== false,
          emailNotification || false,
          JSON.stringify(notificationReceivers || []),
          createdBy
        ]
      )
    }

    logger.info(`保存项目${projectId}的提醒配置`)

    res.json({
      success: true,
      message: '提醒配置保存成功'
    })
  } catch (error) {
    logger.error('保存提醒配置失败:', error)
    res.status(500).json({
      success: false,
      message: '保存提醒配置失败',
      error: error.message
    })
  }
}

/**
 * 获取提醒日志
 * GET /api/milestone-reminders/logs
 */
async function getReminderLogs(req, res) {
  try {
    const { projectId, milestoneId, type, page = 1, pageSize = 20 } = req.query

    let query = 'SELECT * FROM milestone_reminder_logs WHERE 1=1'
    const params = []

    if (projectId) {
      query += ' AND project_id = ?'
      params.push(projectId)
    }

    if (milestoneId) {
      query += ' AND milestone_id = ?'
      params.push(milestoneId)
    }

    if (type) {
      query += ' AND reminder_type = ?'
      params.push(type)
    }

    query += ' ORDER BY sent_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize))

    const logs = await databaseService.query(query, params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM milestone_reminder_logs WHERE 1=1'
    const countParams = []
    
    if (projectId) {
      countQuery += ' AND project_id = ?'
      countParams.push(projectId)
    }
    if (milestoneId) {
      countQuery += ' AND milestone_id = ?'
      countParams.push(milestoneId)
    }
    if (type) {
      countQuery += ' AND reminder_type = ?'
      countParams.push(type)
    }

    const [{ total }] = await databaseService.query(countQuery, countParams)

    // 格式化日志
    const formattedLogs = logs.map(log => ({
      ...log,
      sentTo: JSON.parse(log.sent_to || '[]'),
      isRead: Boolean(log.is_read)
    }))

    res.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    })
  } catch (error) {
    logger.error('获取提醒日志失败:', error)
    res.status(500).json({
      success: false,
      message: '获取提醒日志失败',
      error: error.message
    })
  }
}

/**
 * 获取用户的系统通知
 * GET /api/notifications
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user?.id
    const { type, isRead, page = 1, pageSize = 20 } = req.query

    let query = 'SELECT * FROM system_notifications WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())'
    const params = [userId]

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    if (isRead !== undefined) {
      query += ' AND is_read = ?'
      params.push(isRead === 'true' || isRead === true)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize))

    const notifications = await databaseService.query(query, params)

    // 获取未读数量
    const [{ unreadCount }] = await databaseService.query(
      `SELECT COUNT(*) as unreadCount FROM system_notifications 
       WHERE user_id = ? AND is_read = 0 AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId]
    )

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    logger.error('获取系统通知失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统通知失败',
      error: error.message
    })
  }
}

/**
 * 标记通知为已读
 * PUT /api/notifications/:id/read
 */
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params
    const userId = req.user?.id

    await databaseService.query(
      `UPDATE system_notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    )

    res.json({
      success: true,
      message: '已标记为已读'
    })
  } catch (error) {
    logger.error('标记通知已读失败:', error)
    res.status(500).json({
      success: false,
      message: '标记通知已读失败',
      error: error.message
    })
  }
}

/**
 * 标记所有通知为已读
 * PUT /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  try {
    const userId = req.user?.id

    await databaseService.query(
      `UPDATE system_notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    )

    res.json({
      success: true,
      message: '所有通知已标记为已读'
    })
  } catch (error) {
    logger.error('标记所有通知已读失败:', error)
    res.status(500).json({
      success: false,
      message: '标记所有通知已读失败',
      error: error.message
    })
  }
}

/**
 * 手动触发提醒检查 (管理员功能)
 * POST /api/milestone-reminders/trigger
 */
async function triggerReminderCheck(req, res) {
  try {
    // 异步执行,不等待完成
    triggerManually().catch(err => {
      logger.error('手动触发提醒检查失败:', err)
    })

    res.json({
      success: true,
      message: '提醒检查任务已触发'
    })
  } catch (error) {
    logger.error('触发提醒检查失败:', error)
    res.status(500).json({
      success: false,
      message: '触发提醒检查失败',
      error: error.message
    })
  }
}

module.exports = {
  getReminderConfig,
  saveReminderConfig,
  getReminderLogs,
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  triggerReminderCheck
}
