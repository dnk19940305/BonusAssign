const express = require('express')
const router = express.Router()
const menuController = require('../controllers/menuController')
const { authenticateToken, authorize } = require('../middlewares/auth')

// 所有菜单路由都需要认证
router.use(authenticateToken)

/**
 * 获取当前用户的路由菜单
 * GET /api/menus/routes
 */
router.get('/routes', menuController.getUserRoutes)

/**
 * 获取所有菜单列表
 * GET /api/menus
 * 权限：admin, menu:view
 */
router.get('/', authorize(['admin', 'menu:view']), menuController.getAllMenus)

/**
 * 获取菜单树结构
 * GET /api/menus/tree
 * 权限：admin, menu:view
 */
router.get('/tree', authorize(['admin', 'menu:view']), menuController.getMenuTree)

/**
 * 创建菜单
 * POST /api/menus
 * 权限：admin
 */
router.post('/', authorize(['admin']), menuController.createMenu)

/**
 * 更新菜单
 * PUT /api/menus/:id
 * 权限：admin
 */
router.put('/:id', authorize(['admin']), menuController.updateMenu)

/**
 * 删除菜单
 * DELETE /api/menus/:id
 * 权限：admin
 */
router.delete('/:id', authorize(['admin']), menuController.deleteMenu)

/**
 * 为角色分配菜单
 * POST /api/menus/role/:roleId/assign
 * 权限：admin
 */
router.post('/role/:roleId/assign', authorize(['admin']), menuController.assignMenusToRole)

/**
 * 获取角色已分配的菜单ID列表
 * GET /api/menus/role/:roleId/ids
 * 权限：admin, role:view
 */
router.get('/role/:roleId/ids', authorize(['admin', 'role:view']), menuController.getRoleMenuIds)

/**
 * 获取角色的菜单树
 * GET /api/menus/role/:roleId/tree
 * 权限：admin, role:view
 */
router.get('/role/:roleId/tree', authorize(['admin', 'role:view']), menuController.getRoleMenuTree)

module.exports = router
