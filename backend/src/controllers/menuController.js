const menuService = require('../services/menuService')
const logger = require('../utils/logger')

/**
 * 获取所有菜单列表
 */
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await menuService.getAllMenus()
    res.json({
      success: true,
      data: menus
    })
  } catch (error) {
    logger.error('获取菜单列表失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 获取菜单树结构
 */
exports.getMenuTree = async (req, res) => {
  try {
    const tree = await menuService.getMenuTree()
    res.json({
      success: true,
      data: tree
    })
  } catch (error) {
    logger.error('获取菜单树失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 获取当前用户的路由菜单
 */
exports.getUserRoutes = async (req, res) => {
  try {
    const user = req.user
    logger.info(`🔍 获取用户路由: userId=${user.id}, roleId=${user.roleId}`)

    if (!user || !user.roleId) {
      return res.status(401).json({
        success: false,
        message: '未授权的访问'
      })
    }

    let menus = []

    // 检查是否为admin用户
    const { PermissionValidator } = require('../config/permissions')
    const userPermissions = PermissionValidator.getUserPermissions(user)
    const isAdmin = userPermissions.includes('*') || userPermissions.includes('admin') || 
                   (Array.isArray(user.roleIds) && user.roleIds.includes('admin')) ||
                   user.roleId === 'admin' ||
                   (typeof user.roleId === 'string' && user.roleId.includes('admin'))

    if (isAdmin) {
      logger.info(`🔍 Admin用户，返回所有菜单: userId=${user.id}`)
      // Admin用户获取所有启用且可见的菜单
      const allMenus = await menuService.getAllMenus()
      menus = allMenus.filter(m => m.status === 1 && m.visible === 1)
      menus = menuService.buildMenuTree(menus)
    } else {
      // 优先使用基于角色的菜单分配（role_menus表）
      // 这样可以精确控制每个角色能看到哪些菜单
      const roleIds = []
      if (Array.isArray(user.roleIds) && user.roleIds.length > 0) {
        roleIds.push(...user.roleIds)
      } else if (user.roleId) {
        // 允许 roleId 为逗号分隔字符串或单一值
        if (typeof user.roleId === 'string' && user.roleId.includes(',')) {
          roleIds.push(...user.roleId.split(',').map(r => r.trim()).filter(Boolean))
        } else {
          roleIds.push(user.roleId)
        }
      }

      if (roleIds.length === 1) {
        logger.info(`🔍 使用角色菜单分配: roleId=${roleIds[0]}`)
        menus = await menuService.getMenusByRoleId(roleIds[0])
      } else if (roleIds.length > 1) {
        logger.info(`🔍 使用多角色菜单分配: roleIds=${JSON.stringify(roleIds)}`)
        menus = await menuService.getMenusByRoleIds(roleIds)
      } else {
        // 如果没有角色，尝试使用权限数组生成菜单（兼容直接分配权限的情况）
        if (PermissionValidator.isValidPermissionArray(userPermissions)) {
          logger.info(`🔍 使用用户权限生成菜单: permissions=${JSON.stringify(userPermissions)}`)
          menus = await menuService.getMenusByPermissions(userPermissions)
        } else {
          // 无权限也无角色，返回空菜单
          logger.info(`⚠️ 用户无角色也无权限，返回空菜单`)
          menus = []
        }
      }
    }

    // 转换为前端路由格式
    const routes = this.convertMenusToRoutes(menus || [])
    
    res.json({
      success: true,
      data: routes
    })
  } catch (error) {
    logger.error('获取用户路由失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 将菜单数据转换为前端路由格式
 */
exports.convertMenusToRoutes = (menus) => {
  return menus.map(menu => {
    // 兼容不同数据源返回的字段名（snake_case、camelCase）
    const routePath = menu.menu_path || menu.menuPath || menu.path || menu.path_name || null
    const routeName = menu.name || menu.menu_name || menu.menuName || menu.id
    const component = menu.component || menu.componentName || null
    const metaTitle = menu.meta_title || menu.metaTitle || menu.menu_name || menu.menuName || ''
    const icon = menu.icon || null
    const requiresAuth = menu.requiresAuth !== undefined ? menu.requiresAuth : true
    const showInMenu = menu.meta_show_in_menu !== undefined ? menu.meta_show_in_menu : (menu.metaShowInMenu !== undefined ? menu.metaShowInMenu : true)
    const permissions = menu.perms || menu.permissions || ''

    const finalPath = routePath || (`/menu-${routeName}`)

    const route = {
      path: finalPath,
      name: routeName,
      component: component,
      meta: {
        title: metaTitle,
        icon: icon,
        requiresAuth: requiresAuth,
        showInMenu: showInMenu,
        permissions: permissions ? permissions.split(',') : []
      }
    }

    // 处理重定向
    if (menu.redirect) {
      route.redirect = menu.redirect
    }

    // 处理子菜单
    if (menu.children && menu.children.length > 0) {
      route.children = this.convertMenusToRoutes(menu.children)
    }

    return route
  })
}

/**
 * 创建菜单
 */
exports.createMenu = async (req, res) => {
  try {
    const menuData = req.body
    menuData.createdBy = req.user.id
    
    const menu = await menuService.createMenu(menuData)
    
    res.json({
      success: true,
      data: menu,
      message: '菜单创建成功'
    })
  } catch (error) {
    logger.error('创建菜单失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 更新菜单
 */
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params
    const menuData = req.body
    
    const menu = await menuService.updateMenu(id, menuData)
    
    res.json({
      success: true,
      data: menu,
      message: '菜单更新成功'
    })
  } catch (error) {
    logger.error('更新菜单失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 删除菜单
 */
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params
    
    await menuService.deleteMenu(id)
    
    res.json({
      success: true,
      message: '菜单删除成功'
    })
  } catch (error) {
    logger.error('删除菜单失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 为角色分配菜单
 */
exports.assignMenusToRole = async (req, res) => {
  try {
    const { roleId } = req.params
    const { menuIds } = req.body
    
    if (!Array.isArray(menuIds)) {
      return res.status(400).json({
        success: false,
        message: 'menuIds必须是数组'
      })
    }
    
    const result = await menuService.assignMenusToRole(roleId, menuIds)
    
    res.json({
      success: true,
      data: result,
      message: '菜单分配成功'
    })
  } catch (error) {
    logger.error('分配菜单失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 获取角色已分配的菜单ID列表
 */
exports.getRoleMenuIds = async (req, res) => {
  try {
    const { roleId } = req.params
    
    const menuIds = await menuService.getRoleMenuIds(roleId)
    
    res.json({
      success: true,
      data: menuIds
    })
  } catch (error) {
    logger.error('获取角色菜单失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * 获取角色的菜单树
 */
exports.getRoleMenuTree = async (req, res) => {
  try {
    const { roleId } = req.params
    
    const menus = await menuService.getMenusByRoleId(roleId)
    
    res.json({
      success: true,
      data: menus
    })
  } catch (error) {
    logger.error('获取角色菜单树失败:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
