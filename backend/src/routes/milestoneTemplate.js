/**
 * 里程碑模板管理路由
 */

const express = require('express')
const router = express.Router()
const milestoneTemplateController = require('../controllers/milestoneTemplateController')
const { authenticate } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticate)

/**
 * 获取模板列表
 * GET /api/milestone-templates
 * Query params: category, isSystem, search, page, pageSize
 */
router.get('/', milestoneTemplateController.getTemplates)

/**
 * 获取模板详情
 * GET /api/milestone-templates/:id
 */
router.get('/:id', milestoneTemplateController.getTemplateById)

/**
 * 创建自定义模板
 * POST /api/milestone-templates
 */
router.post('/', milestoneTemplateController.createTemplate)

/**
 * 更新模板
 * PUT /api/milestone-templates/:id
 */
router.put('/:id', milestoneTemplateController.updateTemplate)

/**
 * 删除模板
 * DELETE /api/milestone-templates/:id
 */
router.delete('/:id', milestoneTemplateController.deleteTemplate)

/**
 * 应用模板到项目
 * POST /api/milestone-templates/:id/apply
 * Body: { projectId, startDate }
 */
router.post('/:id/apply', milestoneTemplateController.applyTemplate)

/**
 * 从项目保存为模板
 * POST /api/milestone-templates/from-project
 * Body: { projectId, name, description, category }
 */
router.post('/from-project', milestoneTemplateController.createFromProject)

module.exports = router
