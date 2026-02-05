/**
 * 里程碑统计服务
 * 提供统计计算、报表生成等功能
 */

const databaseService = require('./databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 计算项目里程碑统计
 */
async function calculateProjectStatistics(projectId, statDate = new Date()) {
  try {
    const date = typeof statDate === 'string' ? new Date(statDate) : statDate
    const dateStr = date.toISOString().split('T')[0]
    
    logger.info(`开始计算项目${projectId}的里程碑统计 (${dateStr})`)
    
    // 获取项目所有里程碑
    const milestones = await databaseService.query(
      'SELECT * FROM project_milestones WHERE project_id = ?',
      [projectId]
    )
    
    if (milestones.length === 0) {
      logger.info(`项目${projectId}没有里程碑`)
      return null
    }
    
    // 统计各状态数量
    const stats = {
      total: milestones.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      delayed: 0,
      cancelled: 0,
      onTimeCompleted: 0,
      lateCompleted: 0,
      criticalPath: 0,
      highRisk: 0,
      totalProgress: 0,
      totalDelayDays: 0,
      delayedCount: 0
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const milestone of milestones) {
      // 状态统计
      if (milestone.status === 'completed') {
        stats.completed++
        
        // 按时完成 vs 延期完成
        const targetDate = new Date(milestone.target_date)
        const completionDate = milestone.completion_date 
          ? new Date(milestone.completion_date)
          : new Date(milestone.updated_at)
        
        if (completionDate <= targetDate) {
          stats.onTimeCompleted++
        } else {
          stats.lateCompleted++
          const delayDays = Math.ceil((completionDate - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      } else if (milestone.status === 'in_progress') {
        stats.inProgress++
        
        // 检查是否延期
        const targetDate = new Date(milestone.target_date)
        if (today > targetDate) {
          stats.delayed++
          const delayDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      } else if (milestone.status === 'pending') {
        stats.pending++
        
        // 检查是否延期
        const targetDate = new Date(milestone.target_date)
        if (today > targetDate) {
          stats.delayed++
          const delayDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      } else if (milestone.status === 'cancelled') {
        stats.cancelled++
      }
      
      // 进度累计
      stats.totalProgress += (milestone.progress || 0)
    }
    
    // 获取关键路径里程碑数量
    const [criticalPath] = await databaseService.query(
      `SELECT path_data FROM project_critical_paths 
       WHERE project_id = ? AND is_current = 1 
       ORDER BY calculated_at DESC LIMIT 1`,
      [projectId]
    )
    
    if (criticalPath) {
      const path = JSON.parse(criticalPath.path_data || '[]')
      stats.criticalPath = path.length
    }
    
    // 获取高风险里程碑数量(影响级别为high或critical)
    const [highRiskResult] = await databaseService.query(
      `SELECT COUNT(DISTINCT milestone_id) as count 
       FROM milestone_impact_analysis 
       WHERE project_id = ? 
       AND impact_level IN ('high', 'critical')
       AND analyzed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [projectId]
    )
    
    stats.highRisk = highRiskResult?.count || 0
    
    // 计算比率
    const completionRate = stats.total > 0 
      ? (stats.completed / stats.total * 100).toFixed(2) 
      : 0
    
    const onTimeRate = (stats.completed + stats.lateCompleted) > 0
      ? (stats.onTimeCompleted / (stats.completed + stats.lateCompleted) * 100).toFixed(2)
      : 0
    
    const delayRate = stats.total > 0
      ? (stats.delayed / stats.total * 100).toFixed(2)
      : 0
    
    const avgProgress = stats.total > 0
      ? (stats.totalProgress / stats.total).toFixed(2)
      : 0
    
    const avgDelayDays = stats.delayedCount > 0
      ? (stats.totalDelayDays / stats.delayedCount).toFixed(2)
      : 0
    
    // 保存统计结果
    const statId = uuidv4()
    await databaseService.query(
      `INSERT INTO project_milestone_statistics 
       (id, project_id, stat_date, total_milestones, completed_milestones,
        in_progress_milestones, pending_milestones, delayed_milestones,
        cancelled_milestones, on_time_completed, late_completed,
        completion_rate, on_time_rate, delay_rate, avg_progress,
        avg_delay_days, critical_path_milestones, high_risk_milestones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       total_milestones = VALUES(total_milestones),
       completed_milestones = VALUES(completed_milestones),
       in_progress_milestones = VALUES(in_progress_milestones),
       pending_milestones = VALUES(pending_milestones),
       delayed_milestones = VALUES(delayed_milestones),
       cancelled_milestones = VALUES(cancelled_milestones),
       on_time_completed = VALUES(on_time_completed),
       late_completed = VALUES(late_completed),
       completion_rate = VALUES(completion_rate),
       on_time_rate = VALUES(on_time_rate),
       delay_rate = VALUES(delay_rate),
       avg_progress = VALUES(avg_progress),
       avg_delay_days = VALUES(avg_delay_days),
       critical_path_milestones = VALUES(critical_path_milestones),
       high_risk_milestones = VALUES(high_risk_milestones)`,
      [
        statId, projectId, dateStr,
        stats.total, stats.completed, stats.inProgress, stats.pending,
        stats.delayed, stats.cancelled, stats.onTimeCompleted,
        stats.lateCompleted, completionRate, onTimeRate, delayRate,
        avgProgress, avgDelayDays, stats.criticalPath, stats.highRisk
      ]
    )
    
    // 保存趋势数据
    await saveTrendData('project', projectId, dateStr, {
      completion_rate: completionRate,
      on_time_rate: onTimeRate,
      delay_rate: delayRate,
      avg_progress: avgProgress
    })
    
    logger.info(`项目${projectId}统计完成`)
    
    return {
      projectId,
      statDate: dateStr,
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      pending: stats.pending,
      delayed: stats.delayed,
      cancelled: stats.cancelled,
      onTimeCompleted: stats.onTimeCompleted,
      lateCompleted: stats.lateCompleted,
      completionRate: parseFloat(completionRate),
      onTimeRate: parseFloat(onTimeRate),
      delayRate: parseFloat(delayRate),
      avgProgress: parseFloat(avgProgress),
      avgDelayDays: parseFloat(avgDelayDays),
      criticalPath: stats.criticalPath,
      highRisk: stats.highRisk
    }
  } catch (error) {
    logger.error(`计算项目${projectId}统计失败:`, error)
    throw error
  }
}

/**
 * 计算全局统计
 */
async function calculateGlobalStatistics(statDate = new Date()) {
  try {
    const date = typeof statDate === 'string' ? new Date(statDate) : statDate
    const dateStr = date.toISOString().split('T')[0]
    
    logger.info(`开始计算全局里程碑统计 (${dateStr})`)
    
    // 获取所有项目
    const projects = await databaseService.query('SELECT id FROM projects WHERE status = 1')
    
    // 获取所有里程碑
    const milestones = await databaseService.query('SELECT * FROM project_milestones')
    
    const stats = {
      totalProjects: projects.length,
      total: milestones.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      delayed: 0,
      onTimeCompleted: 0,
      lateCompleted: 0,
      totalDelayDays: 0,
      delayedCount: 0
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const milestone of milestones) {
      if (milestone.status === 'completed') {
        stats.completed++
        
        const targetDate = new Date(milestone.target_date)
        const completionDate = milestone.completion_date 
          ? new Date(milestone.completion_date)
          : new Date(milestone.updated_at)
        
        if (completionDate <= targetDate) {
          stats.onTimeCompleted++
        } else {
          stats.lateCompleted++
          const delayDays = Math.ceil((completionDate - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      } else if (milestone.status === 'in_progress') {
        stats.inProgress++
        
        const targetDate = new Date(milestone.target_date)
        if (today > targetDate) {
          stats.delayed++
          const delayDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      } else if (milestone.status === 'pending') {
        stats.pending++
        
        const targetDate = new Date(milestone.target_date)
        if (today > targetDate) {
          stats.delayed++
          const delayDays = Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))
          stats.totalDelayDays += delayDays
          stats.delayedCount++
        }
      }
    }
    
    const completionRate = stats.total > 0 
      ? (stats.completed / stats.total * 100).toFixed(2) 
      : 0
    
    const onTimeRate = (stats.completed + stats.lateCompleted) > 0
      ? (stats.onTimeCompleted / (stats.completed + stats.lateCompleted) * 100).toFixed(2)
      : 0
    
    const avgDelayDays = stats.delayedCount > 0
      ? (stats.totalDelayDays / stats.delayedCount).toFixed(2)
      : 0
    
    // 保存统计
    const statId = uuidv4()
    await databaseService.query(
      `INSERT INTO global_milestone_statistics 
       (id, stat_date, total_projects, total_milestones, completed_milestones,
        in_progress_milestones, pending_milestones, delayed_milestones,
        completion_rate, on_time_rate, avg_delay_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       total_projects = VALUES(total_projects),
       total_milestones = VALUES(total_milestones),
       completed_milestones = VALUES(completed_milestones),
       in_progress_milestones = VALUES(in_progress_milestones),
       pending_milestones = VALUES(pending_milestones),
       delayed_milestones = VALUES(delayed_milestones),
       completion_rate = VALUES(completion_rate),
       on_time_rate = VALUES(on_time_rate),
       avg_delay_days = VALUES(avg_delay_days)`,
      [
        statId, dateStr, stats.totalProjects, stats.total,
        stats.completed, stats.inProgress, stats.pending, stats.delayed,
        completionRate, onTimeRate, avgDelayDays
      ]
    )
    
    // 保存趋势数据
    await saveTrendData('global', null, dateStr, {
      completion_rate: completionRate,
      on_time_rate: onTimeRate,
      total_milestones: stats.total
    })
    
    logger.info('全局统计完成')
    
    return {
      statDate: dateStr,
      totalProjects: stats.totalProjects,
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      pending: stats.pending,
      delayed: stats.delayed,
      completionRate: parseFloat(completionRate),
      onTimeRate: parseFloat(onTimeRate),
      avgDelayDays: parseFloat(avgDelayDays)
    }
  } catch (error) {
    logger.error('计算全局统计失败:', error)
    throw error
  }
}

/**
 * 保存趋势数据
 */
async function saveTrendData(dimension, dimensionId, statDate, metrics) {
  for (const [metricName, metricValue] of Object.entries(metrics)) {
    const trendId = uuidv4()
    
    await databaseService.query(
      `INSERT INTO milestone_trend_data 
       (id, dimension, dimension_id, metric_name, metric_value, stat_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [trendId, dimension, dimensionId, metricName, metricValue, statDate]
    )
  }
}

/**
 * 获取项目排行榜
 */
async function getProjectRanking(rankBy = 'completion_rate', limit = 10) {
  const validMetrics = ['completion_rate', 'on_time_rate', 'avg_progress']
  const metric = validMetrics.includes(rankBy) ? rankBy : 'completion_rate'
  
  // 获取最新统计日期
  const [latestDate] = await databaseService.query(
    'SELECT MAX(stat_date) as latest FROM project_milestone_statistics'
  )
  
  if (!latestDate || !latestDate.latest) {
    return []
  }
  
  // 获取排行
  const rankings = await databaseService.query(
    `SELECT s.*, p.name as project_name
     FROM project_milestone_statistics s
     JOIN projects p ON s.project_id = p.id
     WHERE s.stat_date = ?
     ORDER BY s.${metric} DESC
     LIMIT ?`,
    [latestDate.latest, parseInt(limit)]
  )
  
  return rankings.map((r, index) => ({
    rank: index + 1,
    projectId: r.project_id,
    projectName: r.project_name,
    completionRate: parseFloat(r.completion_rate),
    onTimeRate: parseFloat(r.on_time_rate),
    avgProgress: parseFloat(r.avg_progress),
    totalMilestones: r.total_milestones,
    completedMilestones: r.completed_milestones
  }))
}

/**
 * 获取趋势数据
 */
async function getTrendData(dimension, dimensionId, metricName, days = 30) {
  let query = `
    SELECT metric_value, stat_date
    FROM milestone_trend_data
    WHERE dimension = ?
    AND metric_name = ?
    AND stat_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ORDER BY stat_date ASC
  `
  
  const params = [dimension, metricName, parseInt(days)]
  
  if (dimensionId) {
    query = `
      SELECT metric_value, stat_date
      FROM milestone_trend_data
      WHERE dimension = ?
      AND dimension_id = ?
      AND metric_name = ?
      AND stat_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY stat_date ASC
    `
    params.splice(1, 0, dimensionId)
  }
  
  const data = await databaseService.query(query, params)
  
  return data.map(d => ({
    date: d.stat_date,
    value: parseFloat(d.metric_value)
  }))
}

/**
 * 批量计算所有项目统计(定时任务调用)
 */
async function calculateAllProjectsStatistics() {
  try {
    logger.info('开始批量计算所有项目统计...')
    
    const projects = await databaseService.query('SELECT id FROM projects WHERE status = 1')
    
    for (const project of projects) {
      try {
        await calculateProjectStatistics(project.id)
      } catch (error) {
        logger.error(`计算项目${project.id}统计失败:`, error)
      }
    }
    
    // 计算全局统计
    await calculateGlobalStatistics()
    
    logger.info(`批量统计完成,共${projects.length}个项目`)
  } catch (error) {
    logger.error('批量计算统计失败:', error)
    throw error
  }
}

module.exports = {
  calculateProjectStatistics,
  calculateGlobalStatistics,
  getProjectRanking,
  getTrendData,
  calculateAllProjectsStatistics
}
