/**
 * 项目执行跟踪控制器
 * 提供项目执行情况的实时监控和数据分析
 */

const databaseService = require('../services/databaseService')
const { v4: uuidv4 } = require('uuid')

/**
 * 获取项目执行跟踪信息
 * GET /api/projects/:projectId/execution
 */
async function getProjectExecution(req, res) {
  try {
    const { projectId } = req.params

    const executions = await databaseService.query(
      'SELECT * FROM project_executions WHERE project_id = ?',
      [projectId]
    )

    if (executions.length === 0) {
      // 如果没有执行记录，返回默认值
      return res.json({
        success: true,
        data: {
          projectId,
          overallProgress: 0,
          budgetUsage: 0,
          costOverrun: 0,
          scheduleVariance: 0,
          qualityScore: 0,
          riskLevel: 'low',
          teamPerformance: null
        }
      })
    }

    const execution = databaseService.convertFieldsToNedb(executions[0], {
      projectId: 'project_id',
      overallProgress: 'overall_progress',
      budgetUsage: 'budget_usage',
      costOverrun: 'cost_overrun',
      scheduleVariance: 'schedule_variance',
      qualityScore: 'quality_score',
      riskLevel: 'risk_level',
      teamPerformance: 'team_performance',
      lastUpdatedBy: 'last_updated_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    })

    // 解析JSON字段
    if (execution.teamPerformance && typeof execution.teamPerformance === 'string') {
      execution.teamPerformance = JSON.parse(execution.teamPerformance)
    }

    res.json({
      success: true,
      data: execution
    })
  } catch (error) {
    console.error('获取项目执行信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取项目执行信息失败',
      error: error.message
    })
  }
}

/**
 * 创建或更新项目执行跟踪信息
 * POST /api/projects/:projectId/execution
 */
async function updateProjectExecution(req, res) {
  try {
    const { projectId } = req.params
    const {
      overallProgress,
      budgetUsage,
      costOverrun,
      scheduleVariance,
      qualityScore,
      riskLevel,
      teamPerformance
    } = req.body

    const userId = req.user?.id || null

    // 检查是否已存在执行记录
    const existing = await databaseService.query(
      'SELECT * FROM project_executions WHERE project_id = ?',
      [projectId]
    )

    if (existing.length === 0) {
      // 创建新记录
      const executionId = uuidv4()
      
      await databaseService.query(
        `INSERT INTO project_executions 
         (id, project_id, overall_progress, budget_usage, cost_overrun, 
          schedule_variance, quality_score, risk_level, team_performance, last_updated_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          executionId,
          projectId,
          overallProgress || 0,
          budgetUsage || 0,
          costOverrun || 0,
          scheduleVariance || 0,
          qualityScore || 0,
          riskLevel || 'low',
          teamPerformance ? JSON.stringify(teamPerformance) : null,
          userId
        ]
      )

      // 记录日志
      await logProgress(projectId, 'cost', '创建执行跟踪记录', overallProgress || 0, userId)
    } else {
      // 更新现有记录
      const updates = []
      const params = []

      if (overallProgress !== undefined) {
        updates.push('overall_progress = ?')
        params.push(overallProgress)
      }
      if (budgetUsage !== undefined) {
        updates.push('budget_usage = ?')
        params.push(budgetUsage)
      }
      if (costOverrun !== undefined) {
        updates.push('cost_overrun = ?')
        params.push(costOverrun)
      }
      if (scheduleVariance !== undefined) {
        updates.push('schedule_variance = ?')
        params.push(scheduleVariance)
      }
      if (qualityScore !== undefined) {
        updates.push('quality_score = ?')
        params.push(qualityScore)
      }
      if (riskLevel !== undefined) {
        updates.push('risk_level = ?')
        params.push(riskLevel)
      }
      if (teamPerformance !== undefined) {
        updates.push('team_performance = ?')
        params.push(JSON.stringify(teamPerformance))
      }
      if (userId) {
        updates.push('last_updated_by = ?')
        params.push(userId)
      }

      if (updates.length > 0) {
        params.push(projectId)
        await databaseService.query(
          `UPDATE project_executions SET ${updates.join(', ')} WHERE project_id = ?`,
          params
        )

        // 记录关键变化日志
        if (overallProgress !== undefined && overallProgress !== existing[0].overall_progress) {
          await logProgress(
            projectId,
            'cost',
            '整体进度更新',
            overallProgress,
            userId,
            existing[0].overall_progress,
            overallProgress
          )
        }
        if (riskLevel !== undefined && riskLevel !== existing[0].risk_level) {
          await logProgress(
            projectId,
            'risk',
            `风险等级变更: ${existing[0].risk_level} → ${riskLevel}`,
            null,
            userId
          )
        }
      }
    }

    // 返回更新后的数据
    const [updated] = await databaseService.query(
      'SELECT * FROM project_executions WHERE project_id = ?',
      [projectId]
    )

    const execution = databaseService.convertFieldsToNedb(updated, {
      projectId: 'project_id',
      overallProgress: 'overall_progress',
      budgetUsage: 'budget_usage',
      costOverrun: 'cost_overrun',
      scheduleVariance: 'schedule_variance',
      qualityScore: 'quality_score',
      riskLevel: 'risk_level',
      teamPerformance: 'team_performance',
      lastUpdatedBy: 'last_updated_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    })

    if (execution.teamPerformance && typeof execution.teamPerformance === 'string') {
      execution.teamPerformance = JSON.parse(execution.teamPerformance)
    }

    res.json({
      success: true,
      message: '项目执行信息更新成功',
      data: execution
    })
  } catch (error) {
    console.error('更新项目执行信息失败:', error)
    res.status(500).json({
      success: false,
      message: '更新项目执行信息失败',
      error: error.message
    })
  }
}

/**
 * 获取项目进度日志
 * GET /api/projects/:projectId/progress-logs
 */
async function getProgressLogs(req, res) {
  try {
    const { projectId } = req.params
    const { progressType, limit = 50, offset = 0 } = req.query

    let query = 'SELECT * FROM project_progress_logs WHERE project_id = ?'
    const params = [projectId]

    if (progressType) {
      query += ' AND progress_type = ?'
      params.push(progressType)
    }

    query += ' ORDER BY logged_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const logs = await databaseService.query(query, params)

    const formattedLogs = logs.map(log => 
      databaseService.convertFieldsToNedb(log, {
        projectId: 'project_id',
        milestoneId: 'milestone_id',
        progressType: 'progress_type',
        progressValue: 'progress_value',
        oldValue: 'old_value',
        newValue: 'new_value',
        loggedBy: 'logged_by',
        loggedAt: 'logged_at'
      })
    )

    res.json({
      success: true,
      data: formattedLogs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedLogs.length
      }
    })
  } catch (error) {
    console.error('获取进度日志失败:', error)
    res.status(500).json({
      success: false,
      message: '获取进度日志失败',
      error: error.message
    })
  }
}

/**
 * 计算项目整体进度（基于里程碑）
 * GET /api/projects/:projectId/calculate-progress
 */
async function calculateOverallProgress(req, res) {
  try {
    const { projectId } = req.params

    // 获取所有里程碑
    const milestones = await databaseService.query(
      'SELECT progress FROM project_milestones WHERE project_id = ? AND status != ?',
      [projectId, 'cancelled']
    )

    if (milestones.length === 0) {
      return res.json({
        success: true,
        data: { overallProgress: 0 }
      })
    }

    // 计算平均进度
    const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0)
    const overallProgress = Math.round(totalProgress / milestones.length)

    // 更新执行跟踪表
    const userId = req.user?.id || null
    
    const existing = await databaseService.query(
      'SELECT * FROM project_executions WHERE project_id = ?',
      [projectId]
    )

    if (existing.length === 0) {
      const executionId = uuidv4()
      await databaseService.query(
        'INSERT INTO project_executions (id, project_id, overall_progress, last_updated_by) VALUES (?, ?, ?, ?)',
        [executionId, projectId, overallProgress, userId]
      )
    } else {
      await databaseService.query(
        'UPDATE project_executions SET overall_progress = ?, last_updated_by = ? WHERE project_id = ?',
        [overallProgress, userId, projectId]
      )
    }

    res.json({
      success: true,
      message: '整体进度计算完成',
      data: {
        overallProgress,
        milestoneCount: milestones.length
      }
    })
  } catch (error) {
    console.error('计算整体进度失败:', error)
    res.status(500).json({
      success: false,
      message: '计算整体进度失败',
      error: error.message
    })
  }
}

/**
 * 记录进度日志（内部方法）
 */
async function logProgress(projectId, progressType, description, progressValue, loggedBy, oldValue = null, newValue = null) {
  try {
    const logId = uuidv4()
    
    await databaseService.query(
      `INSERT INTO project_progress_logs 
       (id, project_id, progress_type, description, progress_value, old_value, new_value, logged_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, projectId, progressType, description, progressValue, oldValue, newValue, loggedBy]
    )
  } catch (error) {
    console.error('记录进度日志失败:', error)
  }
}

module.exports = {
  getProjectExecution,
  updateProjectExecution,
  getProgressLogs,
  calculateOverallProgress
}
