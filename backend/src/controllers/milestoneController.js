/**
 * 项目里程碑管理控制器
 * 提供里程碑的CRUD操作和进度跟踪
 */

const databaseService = require('../services/databaseService')
const { v4: uuidv4 } = require('uuid')

/**
 * 获取项目的所有里程碑
 * GET /api/projects/:projectId/milestones
 */
async function getMilestones(req, res) {
  try {
    const { projectId } = req.params
    const { status, sortBy = 'sortOrder' } = req.query

    // 构建查询条件
    const query = { projectId }
    if (status) {
      query.status = status
    }

    // 构建排序选项
    const allowedSortFields = ['sortOrder', 'targetDate', 'createdAt', 'progress']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'sortOrder'
    const options = {
      sort: { [sortField]: 1 } // 1 = ASC
    }

    // 使用find方法,会自动进行字段名转换
    const milestones = await databaseService.find('projectMilestones', query, options)

    res.json({
      success: true,
      data: milestones
    })
  } catch (error) {
    console.error('获取里程碑列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取里程碑列表失败',
      error: error.message
    })
  }
}

/**
 * 获取单个里程碑详情
 * GET /api/milestones/:id
 */
async function getMilestoneById(req, res) {
  try {
    const { id } = req.params

    const milestone = await databaseService.findOne('projectMilestones', { _id: id })

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      })
    }

    res.json({
      success: true,
      data: milestone
    })
  } catch (error) {
    console.error('获取里程碑详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取里程碑详情失败',
      error: error.message
    })
  }
}

/**
 * 创建新里程碑
 * POST /api/projects/:projectId/milestones
 */
async function createMilestone(req, res) {
  try {
    const { projectId } = req.params
    const {
      name,
      description,
      targetDate,
      status = 'pending',
      deliverables,
      dependencies,
      sortOrder = 0
    } = req.body

    // 验证必填字段
    if (!name || !targetDate) {
      return res.status(400).json({
        success: false,
        message: '里程碑名称和目标日期为必填项'
      })
    }

    const milestoneId = uuidv4()
    const createdBy = req.user?.id || null

    const insertData = {
      id: milestoneId,
      project_id: projectId,
      name,
      description: description || null,
      target_date: targetDate,
      status,
      progress: 0,
      deliverables: deliverables || null,
      dependencies: dependencies ? JSON.stringify(dependencies) : null,
      sort_order: sortOrder,
      created_by: createdBy
    }

    await databaseService.query(
      `INSERT INTO project_milestones 
       (id, project_id, name, description, target_date, status, progress, 
        deliverables, dependencies, sort_order, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        insertData.id,
        insertData.project_id,
        insertData.name,
        insertData.description,
        insertData.target_date,
        insertData.status,
        insertData.progress,
        insertData.deliverables,
        insertData.dependencies,
        insertData.sort_order,
        insertData.created_by
      ]
    )

    // 记录日志
    await logProgress(projectId, milestoneId, 'milestone', '创建里程碑', 0, createdBy)

    // 返回创建的里程碑
    const createdMilestone = await databaseService.findOne('projectMilestones', { _id: milestoneId })

    res.status(201).json({
      success: true,
      message: '里程碑创建成功',
      data: createdMilestone
    })
  } catch (error) {
    console.error('创建里程碑失败:', error)
    res.status(500).json({
      success: false,
      message: '创建里程碑失败',
      error: error.message
    })
  }
}

/**
 * 更新里程碑
 * PUT /api/milestones/:id
 */
async function updateMilestone(req, res) {
  try {
    const { id } = req.params
    const {
      name,
      description,
      targetDate,
      completionDate,
      status,
      progress,
      deliverables,
      dependencies,
      sortOrder
    } = req.body

    // 检查里程碑是否存在
    const existing = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      })
    }

    const oldProgress = existing[0].progress
    const newProgress = progress !== undefined ? progress : oldProgress

    // 构建更新语句
    const updates = []
    const params = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (targetDate !== undefined) {
      updates.push('target_date = ?')
      params.push(targetDate)
    }
    if (completionDate !== undefined) {
      updates.push('completion_date = ?')
      params.push(completionDate)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    if (progress !== undefined) {
      updates.push('progress = ?')
      params.push(progress)
    }
    if (deliverables !== undefined) {
      updates.push('deliverables = ?')
      params.push(deliverables)
    }
    if (dependencies !== undefined) {
      updates.push('dependencies = ?')
      params.push(JSON.stringify(dependencies))
    }
    if (sortOrder !== undefined) {
      updates.push('sort_order = ?')
      params.push(sortOrder)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      })
    }

    params.push(id)

    await databaseService.query(
      `UPDATE project_milestones SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    // 如果进度有变化，记录日志
    if (newProgress !== oldProgress) {
      const userId = req.user?.id || null
      await logProgress(
        existing[0].project_id,
        id,
        'milestone',
        `里程碑进度更新: ${name || existing[0].name}`,
        newProgress,
        userId,
        oldProgress,
        newProgress
      )
    }

    // 返回更新后的里程碑
    const updatedMilestone = await databaseService.findOne('projectMilestones', { _id: id })

    res.json({
      success: true,
      message: '里程碑更新成功',
      data: updatedMilestone
    })
  } catch (error) {
    console.error('更新里程碑失败:', error)
    res.status(500).json({
      success: false,
      message: '更新里程碑失败',
      error: error.message
    })
  }
}

/**
 * 删除里程碑
 * DELETE /api/milestones/:id
 */
async function deleteMilestone(req, res) {
  try {
    const { id } = req.params

    // 检查里程碑是否存在
    const existing = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      })
    }

    await databaseService.query('DELETE FROM project_milestones WHERE id = ?', [id])

    res.json({
      success: true,
      message: '里程碑删除成功'
    })
  } catch (error) {
    console.error('删除里程碑失败:', error)
    res.status(500).json({
      success: false,
      message: '删除里程碑失败',
      error: error.message
    })
  }
}

/**
 * 更新里程碑进度
 * PATCH /api/milestones/:id/progress
 */
async function updateMilestoneProgress(req, res) {
  try {
    const { id } = req.params
    const { progress } = req.body

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: '进度值必须在0-100之间'
      })
    }

    // 获取当前里程碑信息
    const existing = await databaseService.query(
      'SELECT * FROM project_milestones WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '里程碑不存在'
      })
    }

    const oldProgress = existing[0].progress
    const milestone = existing[0]

    // 更新进度
    await databaseService.query(
      'UPDATE project_milestones SET progress = ? WHERE id = ?',
      [progress, id]
    )

    // 如果进度达到100%，自动设置完成日期和状态
    if (progress === 100 && milestone.status !== 'completed') {
      await databaseService.query(
        'UPDATE project_milestones SET status = ?, completion_date = CURDATE() WHERE id = ?',
        ['completed', id]
      )
    }

    // 记录进度日志
    const userId = req.user?.id || null
    await logProgress(
      milestone.project_id,
      id,
      'milestone',
      `里程碑进度更新: ${milestone.name}`,
      progress,
      userId,
      oldProgress,
      progress
    )

    // 返回更新后的里程碑
    const updated = await databaseService.findOne('projectMilestones', { _id: id })

    res.json({
      success: true,
      message: '进度更新成功',
      data: updated
    })
  } catch (error) {
    console.error('更新进度失败:', error)
    res.status(500).json({
      success: false,
      message: '更新进度失败',
      error: error.message
    })
  }
}

/**
 * 记录进度日志（内部方法）
 */
async function logProgress(projectId, milestoneId, progressType, description, progressValue, loggedBy, oldValue = null, newValue = null) {
  try {
    const logId = uuidv4()
    
    await databaseService.query(
      `INSERT INTO project_progress_logs 
       (id, project_id, milestone_id, progress_type, description, progress_value, old_value, new_value, logged_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, projectId, milestoneId, progressType, description, progressValue, oldValue, newValue, loggedBy]
    )
  } catch (error) {
    console.error('记录进度日志失败:', error)
    // 不抛出错误，避免影响主流程
  }
}

module.exports = {
  getMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  updateMilestoneProgress
}
