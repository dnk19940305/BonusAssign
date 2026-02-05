/**
 * 里程碑影响分析控制器
 */

const impactService = require('../services/milestoneImpactAnalysisService')
const databaseService = require('../services/databaseService')
const logger = require('../utils/logger')

/**
 * 分析里程碑延期影响
 * POST /api/milestone-impact/analyze-delay
 */
async function analyzeDelay(req, res) {
  try {
    const { milestoneId, originalDate, newDate } = req.body
    const userId = req.user?.id || null

    if (!milestoneId || !originalDate || !newDate) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const result = await impactService.analyzeMilestoneDelay(
      milestoneId,
      originalDate,
      newDate,
      userId
    )

    res.json({
      success: true,
      message: '影响分析完成',
      data: result
    })
  } catch (error) {
    logger.error('分析里程碑延期影响失败:', error)
    res.status(500).json({
      success: false,
      message: '分析失败',
      error: error.message
    })
  }
}

/**
 * 计算项目关键路径
 * POST /api/milestone-impact/critical-path/:projectId
 */
async function calculateCriticalPath(req, res) {
  try {
    const { projectId } = req.params

    const result = await impactService.calculateCriticalPath(projectId)

    res.json({
      success: true,
      message: '关键路径计算完成',
      data: result
    })
  } catch (error) {
    logger.error('计算关键路径失败:', error)
    res.status(500).json({
      success: false,
      message: '计算失败',
      error: error.message
    })
  }
}

/**
 * 获取项目关键路径
 * GET /api/milestone-impact/critical-path/:projectId
 */
async function getCriticalPath(req, res) {
  try {
    const { projectId } = req.params

    const [result] = await databaseService.query(
      `SELECT * FROM project_critical_paths 
       WHERE project_id = ? AND is_current = 1 
       ORDER BY calculated_at DESC LIMIT 1`,
      [projectId]
    )

    if (!result) {
      // 如果没有,先计算
      const calculated = await impactService.calculateCriticalPath(projectId)
      return res.json({
        success: true,
        data: calculated
      })
    }

    res.json({
      success: true,
      data: {
        id: result.id,
        projectId: result.project_id,
        path: JSON.parse(result.path_data),
        duration: result.total_duration,
        finishDate: result.earliest_finish_date,
        calculatedAt: result.calculated_at
      }
    })
  } catch (error) {
    logger.error('获取关键路径失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 获取影响分析记录
 * GET /api/milestone-impact/analysis
 */
async function getAnalysisRecords(req, res) {
  try {
    const { projectId, milestoneId, impactLevel, page = 1, pageSize = 20 } = req.query

    let query = 'SELECT * FROM milestone_impact_analysis WHERE 1=1'
    const params = []

    if (projectId) {
      query += ' AND project_id = ?'
      params.push(projectId)
    }

    if (milestoneId) {
      query += ' AND milestone_id = ?'
      params.push(milestoneId)
    }

    if (impactLevel) {
      query += ' AND impact_level = ?'
      params.push(impactLevel)
    }

    query += ' ORDER BY analyzed_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize))

    const records = await databaseService.query(query, params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM milestone_impact_analysis WHERE 1=1'
    const countParams = []
    
    if (projectId) {
      countQuery += ' AND project_id = ?'
      countParams.push(projectId)
    }
    if (milestoneId) {
      countQuery += ' AND milestone_id = ?'
      countParams.push(milestoneId)
    }
    if (impactLevel) {
      countQuery += ' AND impact_level = ?'
      countParams.push(impactLevel)
    }

    const [{ total }] = await databaseService.query(countQuery, countParams)

    // 格式化记录
    const formattedRecords = records.map(record => ({
      ...record,
      affectedMilestoneIds: JSON.parse(record.affected_milestone_ids || '[]'),
      dependencyChain: JSON.parse(record.dependency_chain || '{}'),
      isCriticalPath: Boolean(record.is_critical_path)
    }))

    res.json({
      success: true,
      data: formattedRecords,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    })
  } catch (error) {
    logger.error('获取影响分析记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 获取里程碑的依赖链
 * GET /api/milestone-impact/dependency-chain/:milestoneId
 */
async function getDependencyChain(req, res) {
  try {
    const { milestoneId } = req.params

    const [milestone] = await databaseService.query(
      'SELECT project_id FROM project_milestones WHERE id = ?',
      [milestoneId]
    )

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      })
    }

    const chain = await impactService.buildDependencyChain(
      milestoneId,
      milestone.project_id
    )

    res.json({
      success: true,
      data: chain
    })
  } catch (error) {
    logger.error('获取依赖链失败:', error)
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    })
  }
}

/**
 * 刷新项目依赖缓存
 * POST /api/milestone-impact/refresh-cache/:projectId
 */
async function refreshCache(req, res) {
  try {
    const { projectId } = req.params

    await impactService.refreshProjectDependencyCache(projectId)

    res.json({
      success: true,
      message: '依赖缓存已刷新'
    })
  } catch (error) {
    logger.error('刷新依赖缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '刷新失败',
      error: error.message
    })
  }
}

module.exports = {
  analyzeDelay,
  calculateCriticalPath,
  getCriticalPath,
  getAnalysisRecords,
  getDependencyChain,
  refreshCache
}
