/**
 * 技能标签管理路由
 */

const express = require('express');
const router = express.Router();
const {
  // 技能分类
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  
  // 技能标签
  getSkillTags,
  getSkillTagById,
  createSkillTag,
  updateSkillTag,
  deleteSkillTag,
  batchOperateSkillTags,
  mergeSkillTags
} = require('../controllers/skillTagController');
const { authenticateToken, authorize } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// ==================== 技能分类 ====================
// 获取所有技能分类
router.get('/categories', getSkillCategories);

// 创建技能分类
router.post('/categories', authorize(['position:manage', 'admin', '*']), createSkillCategory);

// 更新技能分类
router.put('/categories/:id', authorize(['position:manage', 'admin', '*']), updateSkillCategory);

// 删除技能分类
router.delete('/categories/:id', authorize(['position:manage', 'admin', '*']), deleteSkillCategory);

// ==================== 技能标签 ====================
// 获取技能标签列表（支持分页和筛选）
router.get('/', getSkillTags);

// 获取单个技能标签
router.get('/:id', getSkillTagById);

// 创建技能标签
router.post('/', authorize(['position:manage', 'admin', '*']), createSkillTag);

// 更新技能标签
router.put('/:id', authorize(['position:manage', 'admin', '*']), updateSkillTag);

// 删除技能标签
router.delete('/:id', authorize(['position:manage', 'admin', '*']), deleteSkillTag);

// 批量操作技能标签
router.post('/batch', authorize(['position:manage', 'admin', '*']), batchOperateSkillTags);

// 合并技能标签
router.post('/merge', authorize(['position:manage', 'admin', '*']), mergeSkillTags);

module.exports = router;
