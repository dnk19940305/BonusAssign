const express = require('express')
const router = express.Router()
const roleWeightTemplateController = require('../controllers/roleWeightTemplateController')
const { authenticate } = require('../middlewares/auth')

// 获取模板列表 - 任何登录用户都可以查看
router.get('/',
  authenticate,
  roleWeightTemplateController.getTemplates
)

// 获取单个模板 - 任何登录用户都可以查看
router.get('/:id',
  authenticate,
  roleWeightTemplateController.getTemplate
)

// 创建模板
router.post('/',
  authenticate,
  roleWeightTemplateController.createTemplate
)

// 更新模板
router.put('/:id',
  authenticate,
  roleWeightTemplateController.updateTemplate
)

// 删除模板
router.delete('/:id',
  authenticate,
  roleWeightTemplateController.deleteTemplate
)

// 应用模板到项目 - 需要是项目经理或有全局权限
router.post('/apply',
  authenticate,
  roleWeightTemplateController.applyTemplateToProject
)

module.exports = router
