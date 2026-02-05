/**
 * 里程碑统计控制器
 */

const statisticsService = require('../services/milestoneStatisticsService')
const databaseService = require('../services/databaseService')
const logger = require('../utils/logger')
const ExcelJS = require('exceljs')

/**
 * 获取项目统计
 * GET /api/milestone-stats/project/:projectId
 */
async function getProjectStatistics(req, res) {
  try {
    const { projectId } = req.params
    const { date } = req.query

    // 先尝试从数据库获取
    const statDate = date || new Date().toISOString().split('T')[0]
    
    const [stats] = await databaseService.query(
      'SELECT * FROM project_milestone_statistics WHERE project_id = ? AND stat_date = ?',
      [projectId, statDate]
    )

    let result = stats

    // 如果没有,实时计算
    if (!result) {
      result = await statisticsService.calculateProjectStatistics(projectId, statDate)
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('获取项目统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error.message
    })
  }
}

/**
 * 获取全局统计
 * GET /api/milestone-stats/global
 */
async function getGlobalStatistics(req, res) {
  try {
    const { date } = req.query
    const statDate = date || new Date().toISOString().split('T')[0]

    const [stats] = await databaseService.query(
      'SELECT * FROM global_milestone_statistics WHERE stat_date = ?',
      [statDate]
    )

    let result = stats

    if (!result) {
      result = await statisticsService.calculateGlobalStatistics(statDate)
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('获取全局统计失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计失败',
      error: error.message
    })
  }
}

/**
 * 获取项目排行榜
 * GET /api/milestone-stats/ranking
 */
async function getProjectRanking(req, res) {
  try {
    const { rankBy = 'completion_rate', limit = 10 } = req.query

    const ranking = await statisticsService.getProjectRanking(rankBy, limit)

    res.json({
      success: true,
      data: ranking
    })
  } catch (error) {
    logger.error('获取项目排行榜失败:', error)
    res.status(500).json({
      success: false,
      message: '获取排行榜失败',
      error: error.message
    })
  }
}

/**
 * 获取趋势数据
 * GET /api/milestone-stats/trend
 */
async function getTrendData(req, res) {
  try {
    const { dimension, dimensionId, metric, days = 30 } = req.query

    if (!dimension || !metric) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const data = await statisticsService.getTrendData(
      dimension,
      dimensionId,
      metric,
      days
    )

    res.json({
      success: true,
      data
    })
  } catch (error) {
    logger.error('获取趋势数据失败:', error)
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败',
      error: error.message
    })
  }
}

/**
 * 触发统计计算
 * POST /api/milestone-stats/calculate/:projectId
 */
async function calculateStatistics(req, res) {
  try {
    const { projectId } = req.params

    const result = await statisticsService.calculateProjectStatistics(projectId)

    res.json({
      success: true,
      message: '统计计算完成',
      data: result
    })
  } catch (error) {
    logger.error('计算统计失败:', error)
    res.status(500).json({
      success: false,
      message: '计算失败',
      error: error.message
    })
  }
}

/**
 * 导出统计报表(Excel)
 * GET /api/milestone-stats/export/:projectId
 */
async function exportStatistics(req, res) {
  try {
    const { projectId } = req.params
    const { startDate, endDate } = req.query

    // 获取项目信息
    const [project] = await databaseService.query(
      'SELECT name FROM projects WHERE id = ?',
      [projectId]
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    // 获取统计数据
    let query = 'SELECT * FROM project_milestone_statistics WHERE project_id = ?'
    const params = [projectId]

    if (startDate && endDate) {
      query += ' AND stat_date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    query += ' ORDER BY stat_date DESC'

    const statistics = await databaseService.query(query, params)

    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('里程碑统计')

    // 设置列
    worksheet.columns = [
      { header: '统计日期', key: 'stat_date', width: 15 },
      { header: '总里程碑数', key: 'total_milestones', width: 15 },
      { header: '已完成', key: 'completed_milestones', width: 12 },
      { header: '进行中', key: 'in_progress_milestones', width: 12 },
      { header: '未开始', key: 'pending_milestones', width: 12 },
      { header: '延期', key: 'delayed_milestones', width: 12 },
      { header: '完成率(%)', key: 'completion_rate', width: 12 },
      { header: '按时完成率(%)', key: 'on_time_rate', width: 15 },
      { header: '延期率(%)', key: 'delay_rate', width: 12 },
      { header: '平均进度(%)', key: 'avg_progress', width: 12 },
      { header: '平均延期天数', key: 'avg_delay_days', width: 15 },
      { header: '关键路径里程碑', key: 'critical_path_milestones', width: 15 },
      { header: '高风险里程碑', key: 'high_risk_milestones', width: 15 }
    ]

    // 添加数据
    statistics.forEach(stat => {
      worksheet.addRow({
        stat_date: stat.stat_date,
        total_milestones: stat.total_milestones,
        completed_milestones: stat.completed_milestones,
        in_progress_milestones: stat.in_progress_milestones,
        pending_milestones: stat.pending_milestones,
        delayed_milestones: stat.delayed_milestones,
        completion_rate: stat.completion_rate,
        on_time_rate: stat.on_time_rate,
        delay_rate: stat.delay_rate,
        avg_progress: stat.avg_progress,
        avg_delay_days: stat.avg_delay_days,
        critical_path_milestones: stat.critical_path_milestones,
        high_risk_milestones: stat.high_risk_milestones
      })
    })

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=milestone-statistics-${project.name}-${Date.now()}.xlsx`
    )

    // 写入响应
    await workbook.xlsx.write(res)
    res.end()

  } catch (error) {
    logger.error('导出统计报表失败:', error)
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    })
  }
}

module.exports = {
  getProjectStatistics,
  getGlobalStatistics,
  getProjectRanking,
  getTrendData,
  calculateStatistics,
  exportStatistics
}
