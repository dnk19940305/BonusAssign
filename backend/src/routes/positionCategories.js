/**
 * 岗位分类管理路由
 */

const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
} = require('../controllers/positionCategoryController');
const { authenticateToken, authorize } = require('../middlewares/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取所有分类（树形结构）
router.get('/', getCategories);

// 获取单个分类详情
router.get('/:id', getCategoryById);

// 创建分类
router.post('/', authorize(['position:manage', 'admin', '*']), createCategory);

// 更新分类
router.put('/:id', authorize(['position:manage', 'admin', '*']), updateCategory);

// 删除分类
router.delete('/:id', authorize(['position:manage', 'admin', '*']), deleteCategory);

// 更新分类排序
router.post('/order', authorize(['position:manage', 'admin', '*']), updateCategoryOrder);

module.exports = router;
