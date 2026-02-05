/**
 * 里程碑提醒服务
 * 负责检查里程碑状态并发送提醒通知
 */

const databaseService = require('./databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 检查并发送截止日期提醒
 */
async function checkDeadlineReminders() {
  try {
    logger.info('开始检查里程碑截止日期提醒...')

    // 获取所有启用的提醒配置
    const configs = await databaseService.query(
      'SELECT * FROM milestone_reminder_configs WHERE status = 1'
    )

    for (const config of configs) {
      const remindDays = JSON.parse(config.remind_before_days || '[]')
      const projectId = config.project_id

      // 获取项目的所有未完成里程碑
      const milestones = await databaseService.query(
        `SELECT * FROM project_milestones 
         WHERE project_id = ? 
         AND status IN ('pending', 'in_progress') 
         AND target_date IS NOT NULL`,
        [projectId]
      )

      for (const milestone of milestones) {
        const targetDate = new Date(milestone.target_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        targetDate.setHours(0, 0, 0, 0)

        const daysUntilDeadline = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))

        // 检查是否需要发送提醒
        if (remindDays.includes(daysUntilDeadline)) {
          const alreadySent = await checkIfReminderSentToday(milestone.id, 'deadline')

          if (!alreadySent) {
            await sendDeadlineReminder(milestone, daysUntilDeadline, config)
          }
        }
      }
    }

    logger.info('截止日期提醒检查完成')
  } catch (error) {
    logger.error('检查截止日期提醒失败:', error)
  }
}

/**
 * 检查并发送进度预警
 */
async function checkProgressWarnings() {
  try {
    logger.info('开始检查里程碑进度预警...')

    const configs = await databaseService.query(
      'SELECT * FROM milestone_reminder_configs WHERE status = 1 AND progress_warning_enabled = 1'
    )

    for (const config of configs) {
      const projectId = config.project_id
      const threshold = config.progress_warning_threshold || 20

      // 获取进行中的里程碑
      const milestones = await databaseService.query(
        `SELECT * FROM project_milestones 
         WHERE project_id = ? 
         AND status = 'in_progress' 
         AND target_date IS NOT NULL`,
        [projectId]
      )

      for (const milestone of milestones) {
        const targetDate = new Date(milestone.target_date)
        const startDate = new Date(milestone.created_at)
        const today = new Date()

        // 计算预期进度
        const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24))
        const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
        const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100)
        const actualProgress = milestone.progress || 0

        // 进度滞后超过阈值
        const progressGap = expectedProgress - actualProgress
        if (progressGap > threshold) {
          const alreadySent = await checkIfReminderSentRecently(milestone.id, 'progress', 24)

          if (!alreadySent) {
            await sendProgressWarning(milestone, expectedProgress, actualProgress, config)
          }
        }
      }
    }

    logger.info('进度预警检查完成')
  } catch (error) {
    logger.error('检查进度预警失败:', error)
  }
}

/**
 * 检查并发送依赖阻塞提醒
 */
async function checkDependencyWarnings() {
  try {
    logger.info('开始检查依赖阻塞提醒...')

    const configs = await databaseService.query(
      'SELECT * FROM milestone_reminder_configs WHERE status = 1 AND dependency_warning_enabled = 1'
    )

    for (const config of configs) {
      const projectId = config.project_id

      const milestones = await databaseService.query(
        `SELECT * FROM project_milestones 
         WHERE project_id = ? 
         AND status IN ('pending', 'in_progress')
         AND dependencies IS NOT NULL`,
        [projectId]
      )

      for (const milestone of milestones) {
        let dependencies = []
        try {
          dependencies = JSON.parse(milestone.dependencies || '[]')
        } catch (e) {
          continue
        }

        if (dependencies.length === 0) continue

        // 检查依赖的里程碑状态
        const placeholders = dependencies.map(() => '?').join(',')
        const [result] = await databaseService.query(
          `SELECT COUNT(*) as count FROM project_milestones 
           WHERE id IN (${placeholders}) 
           AND status != 'completed'
           AND target_date < CURDATE()`,
          dependencies
        )

        if (result.count > 0) {
          const alreadySent = await checkIfReminderSentRecently(milestone.id, 'dependency', 24)

          if (!alreadySent) {
            await sendDependencyWarning(milestone, result.count, config)
          }
        }
      }
    }

    logger.info('依赖阻塞提醒检查完成')
  } catch (error) {
    logger.error('检查依赖阻塞提醒失败:', error)
  }
}

/**
 * 检查并发送逾期提醒
 */
async function checkOverdueReminders() {
  try {
    logger.info('开始检查逾期里程碑提醒...')

    const configs = await databaseService.query(
      'SELECT * FROM milestone_reminder_configs WHERE status = 1 AND overdue_reminder_enabled = 1'
    )

    for (const config of configs) {
      const projectId = config.project_id

      const milestones = await databaseService.query(
        `SELECT * FROM project_milestones 
         WHERE project_id = ? 
         AND status IN ('pending', 'in_progress')
         AND target_date < CURDATE()`,
        [projectId]
      )

      for (const milestone of milestones) {
        const targetDate = new Date(milestone.target_date)
        const today = new Date()
        const overdueDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))

        // 每3天提醒一次
        if (overdueDays % 3 === 0) {
          const alreadySent = await checkIfReminderSentToday(milestone.id, 'overdue')

          if (!alreadySent) {
            await sendOverdueReminder(milestone, overdueDays, config)
          }
        }
      }
    }

    logger.info('逾期提醒检查完成')
  } catch (error) {
    logger.error('检查逾期提醒失败:', error)
  }
}

// 发送提醒函数
async function sendDeadlineReminder(milestone, daysLeft, config) {
  const priority = daysLeft <= 1 ? 'urgent' : daysLeft <= 3 ? 'high' : 'normal'
  const title = `里程碑即将到期: ${milestone.name}`
  const content = `里程碑"${milestone.name}"还有 ${daysLeft} 天到期，请及时完成。目标日期: ${milestone.target_date}`

  await createReminder({
    milestoneId: milestone.id,
    projectId: milestone.project_id,
    type: 'deadline',
    title,
    content,
    priority,
    config
  })
}

async function sendProgressWarning(milestone, expectedProgress, actualProgress, config) {
  const gap = Math.round(expectedProgress - actualProgress)
  const title = `里程碑进度滞后: ${milestone.name}`
  const content = `里程碑"${milestone.name}"进度滞后 ${gap}%。预期进度: ${Math.round(expectedProgress)}%，实际进度: ${actualProgress}%`

  await createReminder({
    milestoneId: milestone.id,
    projectId: milestone.project_id,
    type: 'progress',
    title,
    content,
    priority: gap > 30 ? 'high' : 'normal',
    config
  })
}

async function sendDependencyWarning(milestone, blockedCount, config) {
  const title = `里程碑依赖阻塞: ${milestone.name}`
  const content = `里程碑"${milestone.name}"有 ${blockedCount} 个前置里程碑未完成且已逾期，可能影响进度`

  await createReminder({
    milestoneId: milestone.id,
    projectId: milestone.project_id,
    type: 'dependency',
    title,
    content,
    priority: 'high',
    config
  })
}

async function sendOverdueReminder(milestone, overdueDays, config) {
  const title = `里程碑已逾期: ${milestone.name}`
  const content = `里程碑"${milestone.name}"已逾期 ${overdueDays} 天，请尽快完成。目标日期: ${milestone.target_date}`

  await createReminder({
    milestoneId: milestone.id,
    projectId: milestone.project_id,
    type: 'overdue',
    title,
    content,
    priority: 'urgent',
    config
  })
}

/**
 * 创建提醒记录
 */
async function createReminder({ milestoneId, projectId, type, title, content, priority, config }) {
  const reminderId = uuidv4()
  
  // 确定接收人
  let receivers = []
  if (config.notification_receivers) {
    try {
      receivers = JSON.parse(config.notification_receivers)
    } catch (e) {
      receivers = []
    }
  }

  // 如果没有配置接收人,获取项目成员
  if (receivers.length === 0) {
    const members = await databaseService.query(
      'SELECT user_id FROM project_members WHERE project_id = ? AND status = 1',
      [projectId]
    )
    receivers = members.map(m => m.user_id)
  }

  // 创建提醒日志
  await databaseService.query(
    `INSERT INTO milestone_reminder_logs 
     (id, milestone_id, project_id, reminder_type, reminder_title, reminder_content, 
      priority, sent_to, notification_method) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [reminderId, milestoneId, projectId, type, title, content, priority, 
     JSON.stringify(receivers), 'system']
  )

  // 创建系统通知
  for (const userId of receivers) {
    await createSystemNotification({
      userId,
      title,
      content,
      type: 'milestone',
      relatedId: milestoneId,
      priority
    })
  }

  logger.info(`发送提醒: ${type} - ${title}`)
}

/**
 * 创建系统通知
 */
async function createSystemNotification({ userId, title, content, type, relatedId, priority }) {
  const notificationId = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30天后过期

  await databaseService.query(
    `INSERT INTO system_notifications 
     (id, user_id, title, content, type, related_id, priority, expires_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [notificationId, userId, title, content, type, relatedId, priority, expiresAt]
  )
}

// 检查提醒是否已发送
async function checkIfReminderSentToday(milestoneId, type) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [result] = await databaseService.query(
    `SELECT COUNT(*) as count FROM milestone_reminder_logs 
     WHERE milestone_id = ? 
     AND reminder_type = ? 
     AND sent_at >= ?`,
    [milestoneId, type, today]
  )

  return result.count > 0
}

async function checkIfReminderSentRecently(milestoneId, type, hours) {
  const sinceTime = new Date()
  sinceTime.setHours(sinceTime.getHours() - hours)

  const [result] = await databaseService.query(
    `SELECT COUNT(*) as count FROM milestone_reminder_logs 
     WHERE milestone_id = ? 
     AND reminder_type = ? 
     AND sent_at >= ?`,
    [milestoneId, type, sinceTime]
  )

  return result.count > 0
}

/**
 * 运行所有提醒检查
 */
async function runAllChecks() {
  logger.info('开始运行里程碑提醒检查任务...')
  
  await checkDeadlineReminders()
  await checkProgressWarnings()
  await checkDependencyWarnings()
  await checkOverdueReminders()
  
  logger.info('所有提醒检查任务完成')
}

module.exports = {
  checkDeadlineReminders,
  checkProgressWarnings,
  checkDependencyWarnings,
  checkOverdueReminders,
  runAllChecks
}
