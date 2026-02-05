const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')
const { nanoid } = require('nanoid')

class RoleWeightTemplateController {
  // 获取模板列表
  async getTemplates(req, res, next) {
    try {
      const { type, isActive = 1 } = req.query

      const conditions = []
      const params = []

      if (type) {
        conditions.push('type = ?')
        params.push(type)
      }

      if (isActive !== undefined) {
        conditions.push('is_active = ?')
        params.push(parseInt(isActive))
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
      const sql = `SELECT * FROM project_role_weight_templates ${whereClause} ORDER BY sort ASC, created_at DESC`

      const templates = await databaseService.query(sql, params)

      // 解析 JSON 字段
      const parsedTemplates = templates.map(template => ({
        ...template,
        weights: typeof template.weights === 'string' ? JSON.parse(template.weights) : template.weights
      }))

      res.json({
        code: 200,
        data: parsedTemplates,
        message: '获取成功'
      })
    } catch (error) {
      logger.error('Get role weight templates error:', error)
      next(error)
    }
  }

  // 获取单个模板
  async getTemplate(req, res, next) {
    try {
      const { id } = req.params

      const templates = await databaseService.query(
        'SELECT * FROM project_role_weight_templates WHERE id = ?',
        [id]
      )

      if (!templates || templates.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '模板不存在',
          data: null
        })
      }

      const template = templates[0]
      template.weights = typeof template.weights === 'string' ? JSON.parse(template.weights) : template.weights

      res.json({
        code: 200,
        data: template,
        message: '获取成功'
      })
    } catch (error) {
      logger.error('Get role weight template error:', error)
      next(error)
    }
  }

  // 创建模板
  async createTemplate(req, res, next) {
    try {
      const { name, type, description, weights } = req.body

      // 验证必填字段
      if (!name || !type || !weights) {
        return res.status(400).json({
          code: 400,
          message: '模板名称、类型和权重配置不能为空',
          data: null
        })
      }

      // 验证权重配置
      if (typeof weights !== 'object' || Array.isArray(weights)) {
        return res.status(400).json({
          code: 400,
          message: '权重配置格式不正确',
          data: null
        })
      }

      const templateId = nanoid()
      const weightsJson = JSON.stringify(weights)

      await databaseService.query(
        `INSERT INTO project_role_weight_templates 
        (id, name, type, description, weights, is_system, is_active, created_by, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())`,
        [templateId, name, type, description || '', weightsJson, req.user.id]
      )

      logger.info(`用户${req.user.username}创建角色权重模板: ${name}`)

      res.json({
        code: 200,
        data: {
          id: templateId,
          name,
          type,
          description,
          weights
        },
        message: '创建成功'
      })
    } catch (error) {
      logger.error('Create role weight template error:', error)
      next(error)
    }
  }

  // 更新模板
  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params
      const { name, type, description, weights, isActive, sort } = req.body

      // 检查模板是否存在
      const existingTemplates = await databaseService.query(
        'SELECT * FROM project_role_weight_templates WHERE id = ?',
        [id]
      )

      if (!existingTemplates || existingTemplates.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '模板不存在',
          data: null
        })
      }

      const existingTemplate = existingTemplates[0]

      // 系统预置模板只能修改启用状态和排序
      if (existingTemplate.is_system === 1 && (name || type || description || weights)) {
        return res.status(403).json({
          code: 403,
          message: '系统预置模板不允许修改基本信息，只能修改启用状态和排序',
          data: null
        })
      }

      const updates = []
      const params = []

      if (name) {
        updates.push('name = ?')
        params.push(name)
      }

      if (type) {
        updates.push('type = ?')
        params.push(type)
      }

      if (description !== undefined) {
        updates.push('description = ?')
        params.push(description)
      }

      if (weights) {
        if (typeof weights !== 'object' || Array.isArray(weights)) {
          return res.status(400).json({
            code: 400,
            message: '权重配置格式不正确',
            data: null
          })
        }
        updates.push('weights = ?')
        params.push(JSON.stringify(weights))
      }

      if (isActive !== undefined) {
        updates.push('is_active = ?')
        params.push(parseInt(isActive))
      }

      if (sort !== undefined) {
        updates.push('sort = ?')
        params.push(parseInt(sort))
      }

      if (updates.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有要更新的字段',
          data: null
        })
      }

      updates.push('updated_at = NOW()')
      params.push(id)

      await databaseService.query(
        `UPDATE project_role_weight_templates SET ${updates.join(', ')} WHERE id = ?`,
        params
      )

      logger.info(`用户${req.user.username}更新角色权重模板: ${id}`)

      res.json({
        code: 200,
        data: null,
        message: '更新成功'
      })
    } catch (error) {
      logger.error('Update role weight template error:', error)
      next(error)
    }
  }

  // 删除模板
  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params

      // 检查模板是否存在
      const existingTemplates = await databaseService.query(
        'SELECT * FROM project_role_weight_templates WHERE id = ?',
        [id]
      )

      if (!existingTemplates || existingTemplates.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '模板不存在',
          data: null
        })
      }

      const existingTemplate = existingTemplates[0]

      // 系统预置模板不允许删除
      if (existingTemplate.is_system === 1) {
        return res.status(403).json({
          code: 403,
          message: '系统预置模板不允许删除',
          data: null
        })
      }

      await databaseService.query(
        'DELETE FROM project_role_weight_templates WHERE id = ?',
        [id]
      )

      logger.info(`用户${req.user.username}删除角色权重模板: ${id}`)

      res.json({
        code: 200,
        data: null,
        message: '删除成功'
      })
    } catch (error) {
      logger.error('Delete role weight template error:', error)
      next(error)
    }
  }

  // 应用模板到项目
  async applyTemplateToProject(req, res, next) {
    try {
      const { templateId, projectId } = req.body

      if (!templateId || !projectId) {
        return res.status(400).json({
          code: 400,
          message: '模板ID和项目ID不能为空',
          data: null
        })
      }

      // 获取模板
      const templates = await databaseService.query(
        'SELECT * FROM project_role_weight_templates WHERE id = ? AND is_active = 1',
        [templateId]
      )

      if (!templates || templates.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '模板不存在或已禁用',
          data: null
        })
      }

      const template = templates[0]
      const weights = typeof template.weights === 'string' ? JSON.parse(template.weights) : template.weights

      // 验证项目是否存在
      const projects = await databaseService.query(
        'SELECT id, manager_id FROM projects WHERE id = ?',
        [projectId]
      )
      
      if (!projects || projects.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }
      
      const project = projects[0]
      logger.info(`项目查询结果: projectId=${projectId}, manager_id=${project.manager_id}, 类型=${typeof project.manager_id}`)

      // 检查权限：admin跳过，或者是项目经理，或有全局权限
      const isAdmin = req.user.role === 'admin' || req.user.username === 'admin'
      const hasGlobalPermission = req.user.permissions && req.user.permissions.includes('project:weights:update_all')
      
      // 类型转换：确保两者都是字符串比较
      const managerId = String(project.manager_id || '')
      const employeeId = String(req.user.employeeId || '')
      const isProjectManager = managerId === employeeId

      logger.info(`权限检查: user=${req.user.employeeId}, username=${req.user.username}, role=${req.user.role}, isAdmin=${isAdmin}, manager=${project.manager_id}, hasGlobal=${hasGlobalPermission}, isPM=${isProjectManager}, 类型: manager=${typeof project.manager_id}, employee=${typeof req.user.employeeId}`)

      if (!isAdmin && !hasGlobalPermission && !isProjectManager) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限修改此项目的权重配置',
          data: null
        })
      }

      // 调用 projectBonusController 的设置权重接口
      const projectBonusService = require('../services/projectBonusService')
      await projectBonusService.setProjectRoleWeights(projectId, weights, req.user.id)

      logger.info(`用户${req.user.username}将模板${template.name}应用到项目${projectId}`)

      res.json({
        code: 200,
        data: {
          projectId,
          templateId,
          weights
        },
        message: '模板应用成功'
      })
    } catch (error) {
      logger.error('Apply template to project error:', error)
      next(error)
    }
  }
}

module.exports = new RoleWeightTemplateController()
