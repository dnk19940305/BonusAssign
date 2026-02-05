/**
 * 职业路径模板管理路由
 */

const express = require('express');
const router = express.Router();
const {
  getCareerPathTemplates,
  getCareerPathTemplateById,
  createCareerPathTemplate,
  updateCareerPathTemplate,
  deleteCareerPathTemplate,
  copyCareerPathTemplate,
  incrementTemplateUsage
} = require('../controllers/careerPathTemplateController');
const { authenticateToken, authorize } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取职业路径模板列表（支持分页和筛选）
router.get('/', getCareerPathTemplates);

// 获取单个职业路径模板
router.get('/:id', getCareerPathTemplateById);

// 创建职业路径模板
router.post('/', authorize(['position:manage', 'admin', '*']), createCareerPathTemplate);

// 更新职业路径模板
router.put('/:id', authorize(['position:manage', 'admin', '*']), updateCareerPathTemplate);

// 删除职业路径模板
router.delete('/:id', authorize(['position:manage', 'admin', '*']), deleteCareerPathTemplate);

// 复制职业路径模板
router.post('/:id/copy', authorize(['position:manage', 'admin', '*']), copyCareerPathTemplate);

// 增加模板使用次数
router.post('/:id/usage', incrementTemplateUsage);

module.exports = router;
