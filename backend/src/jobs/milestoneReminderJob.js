/**
 * 里程碑提醒定时任务
 * 使用node-cron定时执行提醒检查
 */

const cron = require('node-cron')
const reminderService = require('../services/milestoneReminderService')
const logger = require('../utils/logger')

// 定时任务实例
let cronJob = null

/**
 * 启动定时任务
 * 每天上午9点和下午5点执行
 */
function startReminderJob() {
  if (cronJob) {
    logger.warn('里程碑提醒任务已经在运行中')
    return
  }

  // 每天9:00和17:00执行
  cronJob = cron.schedule('0 9,17 * * *', async () => {
    logger.info('⏰ 触发里程碑提醒定时任务')
    
    try {
      await reminderService.runAllChecks()
    } catch (error) {
      logger.error('里程碑提醒任务执行失败:', error)
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  })

  logger.info('✅ 里程碑提醒定时任务已启动 (每天9:00和17:00执行)')
}

/**
 * 停止定时任务
 */
function stopReminderJob() {
  if (cronJob) {
    cronJob.stop()
    cronJob = null
    logger.info('里程碑提醒定时任务已停止')
  }
}

/**
 * 手动触发提醒检查
 */
async function triggerManually() {
  logger.info('手动触发里程碑提醒检查')
  await reminderService.runAllChecks()
}

module.exports = {
  startReminderJob,
  stopReminderJob,
  triggerManually
}
