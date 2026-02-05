/**
 * 里程碑模板管理控制器
 * 提供模板的CRUD操作和应用功能
 */

const databaseService = require('../services/databaseService')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

/**
 * 获取模板列表
 * GET /api/milestone-templates
 */
async function getTemplates(req, res) {
  try {
    const { category, isSystem, search, page = 1, pageSize = 20 } = req.query

    let query = 'SELECT * FROM milestone_templates WHERE status = 1'
    const params = []

    // 按分类筛选
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    // 按类型筛选(系统/自定义)
    if (isSystem !== undefined) {
      query += ' AND is_system = ?'
      params.push(isSystem === 'true' ? 1 : 0)
    }

    // 搜索
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 排序
    query += ' ORDER BY is_system DESC, usage_count DESC, created_at DESC'

    // 分页 - 直接拼接到SQL中,避免参数类型问题
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    query += ` LIMIT ${parseInt(pageSize)} OFFSET ${offset}`

    const templates = await databaseService.query(query, params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM milestone_templates WHERE status = 1'
    const countParams = []
    
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category)
    }
    if (isSystem !== undefined) {
      countQuery += ' AND is_system = ?'
      countParams.push(isSystem === 'true' ? 1 : 0)
    }
    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const [{ total }] = await databaseService.query(countQuery, countParams)

    // 解析template_data JSON
    const formattedTemplates = templates.map(tpl => ({
      ...tpl,
      templateData: typeof tpl.template_data === 'string' 
        ? JSON.parse(tpl.template_data) 
        : tpl.template_data,
      isSystem: Boolean(tpl.is_system),
      usageCount: tpl.usage_count || 0
    }))

    res.json({
      success: true,
      data: formattedTemplates,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    })
  } catch (error) {
    logger.error('获取模板列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取模板列表失败',
      error: error.message
    })
  }
}

/**
 * 获取模板详情
 * GET /api/milestone-templates/:id
 */
async function getTemplateById(req, res) {
  try {
    const { id } = req.params

    const [template] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ? AND status = 1',
      [id]
    )

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      })
    }

    // 解析JSON
    const formattedTemplate = {
      ...template,
      templateData: typeof template.template_data === 'string'
        ? JSON.parse(template.template_data)
        : template.template_data,
      isSystem: Boolean(template.is_system),
      usageCount: template.usage_count || 0
    }

    res.json({
      success: true,
      data: formattedTemplate
    })
  } catch (error) {
    logger.error('获取模板详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取模板详情失败',
      error: error.message
    })
  }
}

/**
 * 创建自定义模板
 * POST /api/milestone-templates
 */
async function createTemplate(req, res) {
  try {
    const {
      name,
      description,
      category = 'custom',
      templateData
    } = req.body

    // 验证必填字段
    if (!name || !templateData || !templateData.milestones || !templateData.milestones.length) {
      return res.status(400).json({
        success: false,
        message: '模板名称和里程碑数据为必填项'
      })
    }

    const templateId = uuidv4()
    const createdBy = req.user?.id || null

    await databaseService.query(
      `INSERT INTO milestone_templates 
       (id, name, description, category, is_system, template_data, created_by) 
       VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
      [
        templateId,
        name,
        description || null,
        category,
        JSON.stringify(templateData),
        createdBy
      ]
    )

    // 返回创建的模板
    const [created] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ?',
      [templateId]
    )

    const formattedTemplate = {
      ...created,
      templateData: typeof created.template_data === 'string'
        ? JSON.parse(created.template_data)
        : created.template_data,
      isSystem: false,
      usageCount: 0
    }

    logger.info(`用户${createdBy}创建模板: ${name}`)

    res.status(201).json({
      success: true,
      message: '模板创建成功',
      data: formattedTemplate
    })
  } catch (error) {
    logger.error('创建模板失败:', error)
    res.status(500).json({
      success: false,
      message: '创建模板失败',
      error: error.message
    })
  }
}

/**
 * 更新模板
 * PUT /api/milestone-templates/:id
 */
async function updateTemplate(req, res) {
  try {
    const { id } = req.params
    const { name, description, category, templateData } = req.body

    // 检查模板是否存在
    const [existing] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ? AND status = 1',
      [id]
    )

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      })
    }

    // 系统模板不允许修改
    if (existing.is_system) {
      return res.status(403).json({
        success: false,
        message: '系统预设模板不允许修改'
      })
    }

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
    if (category !== undefined) {
      updates.push('category = ?')
      params.push(category)
    }
    if (templateData !== undefined) {
      updates.push('template_data = ?')
      params.push(JSON.stringify(templateData))
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      })
    }

    params.push(id)

    await databaseService.query(
      `UPDATE milestone_templates SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    // 返回更新后的模板
    const [updated] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ?',
      [id]
    )

    const formattedTemplate = {
      ...updated,
      templateData: typeof updated.template_data === 'string'
        ? JSON.parse(updated.template_data)
        : updated.template_data,
      isSystem: Boolean(updated.is_system),
      usageCount: updated.usage_count || 0
    }

    logger.info(`模板更新: ${id}`)

    res.json({
      success: true,
      message: '模板更新成功',
      data: formattedTemplate
    })
  } catch (error) {
    logger.error('更新模板失败:', error)
    res.status(500).json({
      success: false,
      message: '更新模板失败',
      error: error.message
    })
  }
}

/**
 * 删除模板
 * DELETE /api/milestone-templates/:id
 */
async function deleteTemplate(req, res) {
  try {
    const { id } = req.params

    // 检查模板是否存在
    const [existing] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ? AND status = 1',
      [id]
    )

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      })
    }

    // 系统模板不允许删除
    if (existing.is_system) {
      return res.status(403).json({
        success: false,
        message: '系统预设模板不允许删除'
      })
    }

    // 软删除
    await databaseService.query(
      'UPDATE milestone_templates SET status = 0 WHERE id = ?',
      [id]
    )

    logger.info(`模板删除: ${id}`)

    res.json({
      success: true,
      message: '模板删除成功'
    })
  } catch (error) {
    logger.error('删除模板失败:', error)
    res.status(500).json({
      success: false,
      message: '删除模板失败',
      error: error.message
    })
  }
}

/**
 * 应用模板到项目
 * POST /api/milestone-templates/:id/apply
 */
async function applyTemplate(req, res) {
  try {
    const { id } = req.params
    const { projectId, startDate } = req.body

    if (!projectId || !startDate) {
      return res.status(400).json({
        success: false,
        message: '项目ID和开始日期为必填项'
      })
    }

    // 获取模板
    const [template] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ? AND status = 1',
      [id]
    )

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      })
    }

    const templateData = typeof template.template_data === 'string'
      ? JSON.parse(template.template_data)
      : template.template_data

    const milestones = templateData.milestones || []
    const createdBy = req.user?.id || null
    const baseDate = new Date(startDate)
    const createdMilestones = []

    // 创建里程碑
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i]
      const milestoneId = uuidv4()

      // 计算目标日期
      const targetDate = new Date(baseDate)
      targetDate.setDate(targetDate.getDate() + (milestone.offsetDays || 0) + (milestone.durationDays || 7))

      // 处理依赖关系(索引转换为ID)
      const dependencies = (milestone.dependencies || []).map(depIndex => {
        return createdMilestones[depIndex]?.id
      }).filter(Boolean)

      await databaseService.query(
        `INSERT INTO project_milestones 
         (id, project_id, name, description, target_date, status, progress, 
          deliverables, dependencies, sort_order, created_by) 
         VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?, ?)`,
        [
          milestoneId,
          projectId,
          milestone.name,
          milestone.description || null,
          targetDate.toISOString().split('T')[0],
          milestone.deliverables || null,
          dependencies.length > 0 ? JSON.stringify(dependencies) : null,
          i,
          createdBy
        ]
      )

      // 保存创建的里程碑信息
      createdMilestones.push({
        id: milestoneId,
        name: milestone.name,
        targetDate: targetDate.toISOString().split('T')[0]
      })
    }

    // 增加模板使用次数
    await databaseService.query(
      'UPDATE milestone_templates SET usage_count = usage_count + 1 WHERE id = ?',
      [id]
    )

    logger.info(`模板${id}应用到项目${projectId}, 创建${createdMilestones.length}个里程碑`)

    res.json({
      success: true,
      message: `成功创建${createdMilestones.length}个里程碑`,
      data: {
        milestones: createdMilestones
      }
    })
  } catch (error) {
    logger.error('应用模板失败:', error)
    res.status(500).json({
      success: false,
      message: '应用模板失败',
      error: error.message
    })
  }
}

/**
 * 从项目保存为模板
 * POST /api/milestone-templates/from-project
 */
async function createFromProject(req, res) {
  try {
    const { projectId, name, description, category = 'custom' } = req.body

    if (!projectId || !name) {
      return res.status(400).json({
        success: false,
        message: '项目ID和模板名称为必填项'
      })
    }

    // 获取项目的里程碑
    const milestones = await databaseService.query(
      'SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order ASC',
      [projectId]
    )

    if (milestones.length === 0) {
      return res.status(400).json({
        success: false,
        message: '该项目没有里程碑，无法创建模板'
      })
    }

    // 获取项目开始日期(第一个里程碑的目标日期作为基准)
    const projectStartDate = new Date(milestones[0].target_date)

    // 转换里程碑为模板格式
    const milestoneMap = new Map()
    milestones.forEach((m, index) => {
      milestoneMap.set(m.id, index)
    })

    const templateMilestones = milestones.map(m => {
      const targetDate = new Date(m.target_date)
      const offsetDays = Math.floor((targetDate - projectStartDate) / (1000 * 60 * 60 * 24))

      // 转换依赖关系(ID转索引)
      let dependencies = []
      if (m.dependencies) {
        try {
          const deps = typeof m.dependencies === 'string' ? JSON.parse(m.dependencies) : m.dependencies
          dependencies = deps.map(depId => milestoneMap.get(depId)).filter(idx => idx !== undefined)
        } catch (e) {
          dependencies = []
        }
      }

      return {
        name: m.name,
        description: m.description,
        durationDays: 7, // 默认7天
        offsetDays,
        weight: 1.0,
        deliverables: m.deliverables,
        dependencies
      }
    })

    const templateId = uuidv4()
    const createdBy = req.user?.id || null

    await databaseService.query(
      `INSERT INTO milestone_templates 
       (id, name, description, category, is_system, template_data, created_by) 
       VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
      [
        templateId,
        name,
        description || `从项目${projectId}创建的模板`,
        category,
        JSON.stringify({ milestones: templateMilestones }),
        createdBy
      ]
    )

    // 返回创建的模板
    const [created] = await databaseService.query(
      'SELECT * FROM milestone_templates WHERE id = ?',
      [templateId]
    )

    const formattedTemplate = {
      ...created,
      templateData: typeof created.template_data === 'string'
        ? JSON.parse(created.template_data)
        : created.template_data,
      isSystem: false,
      usageCount: 0
    }

    logger.info(`从项目${projectId}创建模板: ${name}`)

    res.status(201).json({
      success: true,
      message: '模板创建成功',
      data: formattedTemplate
    })
  } catch (error) {
    logger.error('从项目创建模板失败:', error)
    res.status(500).json({
      success: false,
      message: '从项目创建模板失败',
      error: error.message
    })
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
  createFromProject
}

