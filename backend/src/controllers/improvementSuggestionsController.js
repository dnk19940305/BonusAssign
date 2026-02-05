const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')
const ImprovementSuggestionModel = require('../models/ImprovementSuggestion')

class ImprovementSuggestionsController {
  // 获取建议列表
  async getSuggestions(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        employeeId,
        status,
        priority,
        category,
        source
      } = req.query

      logger.info('获取改进建议列表:', { page, pageSize, employeeId, status, priority, category })

      // 构建查询条件
      let whereConditions = []
      let whereParams = []

      if (employeeId) {
        whereConditions.push('employee_id = ?')
        whereParams.push(employeeId)
      }

      if (status) {
        whereConditions.push('status_code = ?')
        whereParams.push(status)
      }

      if (priority) {
        whereConditions.push('priority = ?')
        whereParams.push(priority)
      }

      if (category) {
        whereConditions.push('category = ?')
        whereParams.push(category)
      }

      if (source) {
        whereConditions.push('source = ?')
        whereParams.push(source)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      // 查询总数
      const countQuery = `SELECT COUNT(*) as total FROM improvement_suggestions ${whereClause}`
      const countResult = await databaseService.query(countQuery, whereParams)
      const total = countResult[0].total

      // 分页查询
      const pageNum = parseInt(page)
      const pageSizeNum = parseInt(pageSize)
      const offset = (pageNum - 1) * pageSizeNum
      
      const dataQuery = `
        SELECT * FROM improvement_suggestions 
        ${whereClause}
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          created_at DESC
        LIMIT ${pageSizeNum} OFFSET ${offset}
      `
      const suggestions = await databaseService.query(dataQuery, whereParams)

      // 转换字段名
      const formattedSuggestions = suggestions.map(s => ({
        id: s.id,
        employeeId: s.employee_id,
        employeeName: s.employee_name,
        title: s.title,
        description: s.description,
        category: s.category,
        priority: s.priority,
        statusCode: s.status_code,
        potentialImpact: s.potential_impact,
        timeFrame: s.time_frame,
        source: s.source,
        createdBy: s.created_by,
        createdByName: s.created_by_name,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        completedAt: s.completed_at,
        implementationDate: s.implementation_date,
        implementationFeedback: s.implementation_feedback,
        reviewedBy: s.reviewed_by,
        reviewedByName: s.reviewed_by_name,
        reviewedAt: s.reviewed_at,
        reviewComments: s.review_comments,
        feedback: s.feedback
      }))

      res.json({
        code: 200,
        message: '获取成功',
        data: {
          list: formattedSuggestions,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      })
    } catch (error) {
      logger.error('获取改进建议列表失败:', error)
      next(error)
    }
  }

  // 获取单个建议详情
  async getSuggestionById(req, res, next) {
    try {
      const { id } = req.params

      const query = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const results = await databaseService.query(query, [id])

      if (results.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      const s = results[0]
      const suggestion = {
        id: s.id,
        employeeId: s.employee_id,
        employeeName: s.employee_name,
        title: s.title,
        description: s.description,
        category: s.category,
        priority: s.priority,
        statusCode: s.status_code,
        potentialImpact: s.potential_impact,
        timeFrame: s.time_frame,
        source: s.source,
        createdBy: s.created_by,
        createdByName: s.created_by_name,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        completedAt: s.completed_at,
        implementationDate: s.implementation_date,
        implementationFeedback: s.implementation_feedback,
        reviewedBy: s.reviewed_by,
        reviewedByName: s.reviewed_by_name,
        reviewedAt: s.reviewed_at,
        reviewComments: s.review_comments,
        feedback: s.feedback
      }

      res.json({
        code: 200,
        data: suggestion,
        message: '获取成功'
      })
    } catch (error) {
      logger.error('获取建议详情失败:', error)
      next(error)
    }
  }

  // 创建建议
  async createSuggestion(req, res, next) {
    try {
      const {
        employeeId,
        employeeName,
        title,
        description,
        category,
        priority = 'medium',
        potentialImpact,
        timeFrame
      } = req.body

      // 验证必填字段
      const validationData = {
        employeeId,
        title,
        category,
        priority,
        potentialImpact
      }

      const errors = ImprovementSuggestionModel.validate(validationData)
      if (errors.length > 0) {
        return res.status(400).json({
          code: 400,
          message: errors.join(', '),
          data: null
        })
      }

      const suggestionData = {
        employee_id: employeeId,
        employee_name: employeeName,
        title,
        description,
        category,
        priority,
        status_code: 0,  // 默认待实施
        potential_impact: potentialImpact,
        time_frame: timeFrame,
        source: 'manual',
        created_by: req.user.id,
        created_by_name: req.user.username || req.user.realName
      }

      const query = `
        INSERT INTO improvement_suggestions 
        (employee_id, employee_name, title, description, category, priority, status_code, 
         potential_impact, time_frame, source, created_by, created_by_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const params = [
        suggestionData.employee_id,
        suggestionData.employee_name,
        suggestionData.title,
        suggestionData.description,
        suggestionData.category,
        suggestionData.priority,
        suggestionData.status_code,
        suggestionData.potential_impact,
        suggestionData.time_frame,
        suggestionData.source,
        suggestionData.created_by,
        suggestionData.created_by_name
      ]

      const result = await databaseService.query(query, params)

      logger.info(`创建改进建议成功: ID=${result.insertId}, 员工=${employeeId}`)

      res.json({
        code: 200,
        data: { id: result.insertId },
        message: '创建成功'
      })
    } catch (error) {
      logger.error('创建改进建议失败:', error)
      next(error)
    }
  }

  // 更新建议
  async updateSuggestion(req, res, next) {
    try {
      const { id } = req.params
      const {
        title,
        description,
        category,
        priority,
        status,
        potentialImpact,
        timeFrame,
        feedback
      } = req.body

      // 检查建议是否存在
      const checkQuery = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const existing = await databaseService.query(checkQuery, [id])

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      // 构建更新字段
      const updateFields = []
      const updateParams = []

      if (title !== undefined) {
        updateFields.push('title = ?')
        updateParams.push(title)
      }
      if (description !== undefined) {
        updateFields.push('description = ?')
        updateParams.push(description)
      }
      if (category !== undefined) {
        updateFields.push('category = ?')
        updateParams.push(category)
      }
      if (priority !== undefined) {
        updateFields.push('priority = ?')
        updateParams.push(priority)
      }
      if (status !== undefined) {
        updateFields.push('status_code = ?')
        updateParams.push(status)
        
        // 如果状态改为已完成，记录完成时间
        if (status === 2) {
          updateFields.push('completed_at = NOW()')
        }
      }
      if (potentialImpact !== undefined) {
        updateFields.push('potential_impact = ?')
        updateParams.push(potentialImpact)
      }
      if (timeFrame !== undefined) {
        updateFields.push('time_frame = ?')
        updateParams.push(timeFrame)
      }
      if (feedback !== undefined) {
        updateFields.push('feedback = ?')
        updateParams.push(feedback)
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有要更新的字段',
          data: null
        })
      }

      updateParams.push(id)
      const updateQuery = `
        UPDATE improvement_suggestions 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `

      await databaseService.query(updateQuery, updateParams)

      logger.info(`更新改进建议成功: ID=${id}`)

      res.json({
        code: 200,
        data: { id },
        message: '更新成功'
      })
    } catch (error) {
      logger.error('更新改进建议失败:', error)
      next(error)
    }
  }

  // 删除建议
  async deleteSuggestion(req, res, next) {
    try {
      const { id } = req.params

      // 检查建议是否存在
      const checkQuery = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const existing = await databaseService.query(checkQuery, [id])

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      const deleteQuery = 'DELETE FROM improvement_suggestions WHERE id = ?'
      await databaseService.query(deleteQuery, [id])

      logger.info(`删除改进建议成功: ID=${id}`)

      res.json({
        code: 200,
        data: null,
        message: '删除成功'
      })
    } catch (error) {
      logger.error('删除改进建议失败:', error)
      next(error)
    }
  }

  // 批量更新状态
  async batchUpdateStatus(req, res, next) {
    try {
      const { ids, status } = req.body

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: 'IDs参数无效',
          data: null
        })
      }

      if (!status && status !== 0) {
        return res.status(400).json({
          code: 400,
          message: '状态不能为空',
          data: null
        })
      }

      const validStatuses = [0, 1, 2, -1]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          code: 400,
          message: '状态无效',
          data: null
        })
      }

      const placeholders = ids.map(() => '?').join(',')
      const updateFields = ['status_code = ?']
      const params = [status]

      if (status === 2) {
        updateFields.push('completed_at = NOW()')
      }

      params.push(...ids)

      const query = `
        UPDATE improvement_suggestions 
        SET ${updateFields.join(', ')}
        WHERE id IN (${placeholders})
      `

      const result = await databaseService.query(query, params)

      logger.info(`批量更新建议状态成功: count=${result.affectedRows}`)

      res.json({
        code: 200,
        data: { updatedCount: result.affectedRows },
        message: '批量更新成功'
      })
    } catch (error) {
      logger.error('批量更新建议状态失败:', error)
      next(error)
    }
  }

  // 获取员工的建议统计
  async getSuggestionStats(req, res, next) {
    try {
      const { employeeId } = req.params

      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status_code = 0 THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status_code = 1 THEN 1 ELSE 0 END) as inProgress,
          SUM(CASE WHEN status_code = 2 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status_code = -1 THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highPriority
        FROM improvement_suggestions
        WHERE employee_id = ?
      `

      const results = await databaseService.query(query, [employeeId])
      const stats = results[0]

      res.json({
        code: 200,
        data: {
          total: parseInt(stats.total) || 0,
          pending: parseInt(stats.pending) || 0,
          inProgress: parseInt(stats.inProgress) || 0,
          completed: parseInt(stats.completed) || 0,
          rejected: parseInt(stats.rejected) || 0,
          highPriority: parseInt(stats.highPriority) || 0,
          completionRate: stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100) 
            : 0
        },
        message: '获取成功'
      })
    } catch (error) {
      logger.error('获取建议统计失败:', error)
      next(error)
    }
  }

  // 员工实施完成，提交审核
  async completeImplementation(req, res, next) {
    try {
      const { id } = req.params
      const { feedback } = req.body
      const userId = req.user.employeeId

      // 验证建议存在且状态为待实施
      const checkQuery = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const existing = await databaseService.query(checkQuery, [id])

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      const suggestion = existing[0]
      
      // 验证权限：只有员工本人可以提交实施
      if (suggestion.employee_id !== userId) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限操作此建议',
          data: null
        })
      }

      if (suggestion.status_code !== 0) {
        return res.status(400).json({
          code: 400,
          message: '当前状态不允许此操作',
          data: null
        })
      }

      // 更新为待审核状态
      const updateQuery = `
        UPDATE improvement_suggestions 
        SET status_code = 1,
            implementation_date = NOW(),
            implementation_feedback = ?,
            updated_at = NOW()
        WHERE id = ?
      `
      await databaseService.query(updateQuery, [feedback, id])

      logger.info(`员工提交实施完成: ID=${id}, employee=${userId}`)

      res.json({
        code: 200,
        data: null,
        message: '实施完成，已提交审核'
      })
    } catch (error) {
      logger.error('提交实施完成失败:', error)
      next(error)
    }
  }

  // 上级审核通过
  async approveSuggestion(req, res, next) {
    try {
      const { id } = req.params
      const { comments } = req.body
      const reviewerId = req.user.employeeId
      const reviewerName = req.user.name || req.user.username

      // 验证建议存在且状态为待审核
      const checkQuery = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const existing = await databaseService.query(checkQuery, [id])

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      const suggestion = existing[0]
      
      if (suggestion.status_code !== 1) {
        return res.status(400).json({
          code: 400,
          message: '当前状态不允许此操作',
          data: null
        })
      }

      // 更新为已完成状态
      const updateQuery = `
        UPDATE improvement_suggestions 
        SET status_code = 2,
            completed_at = NOW(),
            reviewed_by = ?,
            reviewed_by_name = ?,
            reviewed_at = NOW(),
            review_comments = ?,
            updated_at = NOW()
        WHERE id = ?
      `
      await databaseService.query(updateQuery, [reviewerId, reviewerName, comments, id])

      logger.info(`审核通过改进建议: ID=${id}, reviewer=${reviewerId}`)

      res.json({
        code: 200,
        data: null,
        message: '审核通过'
      })
    } catch (error) {
      logger.error('审核通过失败:', error)
      next(error)
    }
  }

  // 上级审核拒绝
  async rejectSuggestion(req, res, next) {
    try {
      const { id } = req.params
      const { comments } = req.body
      const reviewerId = req.user.employeeId
      const reviewerName = req.user.name || req.user.username

      if (!comments) {
        return res.status(400).json({
          code: 400,
          message: '拒绝时必须填写审核意见',
          data: null
        })
      }

      // 验证建议存在且状态为待审核
      const checkQuery = 'SELECT * FROM improvement_suggestions WHERE id = ?'
      const existing = await databaseService.query(checkQuery, [id])

      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '建议不存在',
          data: null
        })
      }

      const suggestion = existing[0]
      
      if (suggestion.status_code !== 1) {
        return res.status(400).json({
          code: 400,
          message: '当前状态不允许此操作',
          data: null
        })
      }

      // 更新为已拒绝状态，并重置为待实施
      const updateQuery = `
        UPDATE improvement_suggestions 
        SET status_code = 0,
            reviewed_by = ?,
            reviewed_by_name = ?,
            reviewed_at = NOW(),
            review_comments = ?,
            implementation_date = NULL,
            implementation_feedback = NULL,
            updated_at = NOW()
        WHERE id = ?
      `
      await databaseService.query(updateQuery, [reviewerId, reviewerName, comments, id])

      logger.info(`审核拒绝改进建议: ID=${id}, reviewer=${reviewerId}`)

      res.json({
        code: 200,
        data: null,
        message: '审核拒绝，已返回待实施状态'
      })
    } catch (error) {
      logger.error('审核拒绝失败:', error)
      next(error)
    }
  }
}

module.exports = new ImprovementSuggestionsController()
