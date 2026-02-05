const databaseService = require('./databaseService')
const Menu = require('../models/Menu')
const RoleMenu = require('../models/RoleMenu')
const logger = require('../utils/logger')

class MenuService {
  /**
   * 获取所有菜单列表
   */
  async getAllMenus() {
    const query = `
      SELECT * FROM menus 
      ORDER BY sort_order ASC, id ASC
    `
    return await databaseService.query(query)
  }

  /**
   * 获取菜单树结构
   */
  async getMenuTree(parentId = null) {
    const allMenus = await this.getAllMenus()
    return this.buildMenuTree(allMenus, parentId)
  }

  /**
   * 构建菜单树
   */
  buildMenuTree(menus, parentId = null) {
    const tree = []
    for (const menu of menus) {
      if (menu.parent_id === parentId) {
        const children = this.buildMenuTree(menus, menu.id)
        const menuNode = {
          ...menu,
          children: children.length > 0 ? children : undefined
        }
        tree.push(menuNode)
      }
    }
    return tree
  }

  /**
   * 根据角色ID获取菜单
   */
  async getMenusByRoleId(roleId) {
    logger.info(`🔍 查询角色菜单: roleId=${roleId}`)
    
    const query = `
      SELECT m.* 
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      WHERE rm.role_id = ? 
        AND m.status = 1 
        AND m.visible = 1
      ORDER BY m.sort_order ASC, m.id ASC
    `
    const menus = await databaseService.query(query, [roleId])
    logger.info(`✅ 查询到 ${menus.length} 个菜单`)
    
    return this.buildMenuTree(menus)
  }

  /**
   * 根据多个角色ID获取菜单（支持用户有多个角色的情况）
   */
  async getMenusByRoleIds(roleIds) {
    if (!roleIds || roleIds.length === 0) {
      return []
    }

    logger.info(`🔍 查询多角色菜单: roleIds=${JSON.stringify(roleIds)}`)
    
    const placeholders = roleIds.map(() => '?').join(', ')
    const query = `
      SELECT DISTINCT m.* 
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      WHERE rm.role_id IN (${placeholders})
        AND m.status = 1 
        AND m.visible = 1
      ORDER BY m.sort_order ASC, m.id ASC
    `
    const menus = await databaseService.query(query, roleIds)
    logger.info(`✅ 查询到 ${menus.length} 个菜单`)
    
    return this.buildMenuTree(menus)
  }

  /**
   * 根据用户权限获取菜单（考虑用户的所有权限）
   */
  async getMenusByPermissions(permissions) {
    logger.info(`🔍 根据权限查询菜单: permissions=${JSON.stringify(permissions)}`)
    
    // 如果用户有 * 权限，返回所有菜单
    if (permissions.includes('*') || permissions.includes('admin')) {
      const allMenus = await this.getAllMenus()
      return this.buildMenuTree(allMenus.filter(m => m.status === 1 && m.visible === 1))
    }

    // 构建权限匹配条件
    const permsConditions = []
    const params = []
    
    for (const perm of permissions) {
      permsConditions.push(`FIND_IN_SET(?, m.perms) > 0`)
      params.push(perm)
    }

    const query = `
      SELECT DISTINCT m.* 
      FROM menus m
      WHERE m.status = 1 
        AND m.visible = 1
        AND (
          m.perms IS NULL 
          OR m.perms = '' 
          OR ${permsConditions.join(' OR ')}
        )
      ORDER BY m.sort_order ASC, m.id ASC
    `
    
    const menus = await databaseService.query(query, params)
    logger.info(`✅ 查询到 ${menus.length} 个菜单`)
    
    return this.buildMenuTree(menus)
  }

  /**
   * 创建菜单
   */
  async createMenu(menuData) {
    const id = menuData.id || `menu_${Date.now()}`
    
    const query = `
      INSERT INTO menus (
        id, parent_id, menu_name, menu_path, component, menu_type, 
        icon, sort_order, visible, status, perms, is_frame, is_cache, 
        redirect, meta_title, meta_description, meta_show_in_menu, 
        created_by, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      id,
      menuData.parentId || null,
      menuData.menuName,
      menuData.menuPath || null,
      menuData.component || null,
      menuData.menuType || 'menu',
      menuData.icon || null,
      menuData.sortOrder || 0,
      menuData.visible !== undefined ? menuData.visible : 1,
      menuData.status !== undefined ? menuData.status : 1,
      menuData.perms || null,
      menuData.isFrame || 0,
      menuData.isCache !== undefined ? menuData.isCache : 1,
      menuData.redirect || null,
      menuData.metaTitle || null,
      menuData.metaDescription || null,
      menuData.metaShowInMenu !== undefined ? menuData.metaShowInMenu : 1,
      menuData.createdBy || null,
      menuData.remark || null
    ]
    
    await databaseService.query(query, params)
    
    // 自动为具有超级权限的角色分配新创建的菜单权限（admin 或拥有 * 权限的角色）
    try {
      // 首先获取所有拥有 * 权限的角色
      const superPermissionRolesQuery = `
        SELECT DISTINCT rp.role_id 
        FROM role_permissions rp 
        WHERE rp.permission IN ('*', 'admin')
      `
      const superPermissionRoles = await databaseService.query(superPermissionRolesQuery)
      
      // 收集需要分配权限的角色ID（包括admin角色）
      const roleIds = ['admin'] // 默认包含admin角色
      superPermissionRoles.forEach(role => {
        if (!roleIds.includes(role.role_id)) {
          roleIds.push(role.role_id)
        }
      })
      
      // 为所有这些角色分配新菜单权限
      if (roleIds.length > 0) {
        // 构建SQL查询 - 为每个角色ID创建一个(role_id, menu_id)对
        const valuesClauses = roleIds.map(() => '(?, ?)').join(', ')
        const adminRoleQuery = `INSERT IGNORE INTO role_menus (role_id, menu_id) VALUES ${valuesClauses}`
              
        // 构建参数数组
        const params = []
        roleIds.forEach(roleId => {
          params.push(roleId, id)
        })
              
        await databaseService.query(adminRoleQuery, params)
        logger.info(`自动为以下角色分配菜单权限: ${roleIds.join(', ')} -> 菜单ID: ${id}`)
      }
    } catch (error) {
      logger.warn(`为超级权限角色分配菜单权限失败: ${id}`, error)
    }
    
    return { id, ...menuData }
  }

  /**
   * 更新菜单
   */
  async updateMenu(id, menuData) {
    const updates = []
    const params = []
    
    const fields = {
      parent_id: menuData.parentId,
      menu_name: menuData.menuName,
      menu_path: menuData.menuPath,
      component: menuData.component,
      menu_type: menuData.menuType,
      icon: menuData.icon,
      sort_order: menuData.sortOrder,
      visible: menuData.visible,
      status: menuData.status,
      perms: menuData.perms,
      is_frame: menuData.isFrame,
      is_cache: menuData.isCache,
      redirect: menuData.redirect,
      meta_title: menuData.menuName,
      meta_description: menuData.metaDescription,
      meta_show_in_menu: menuData.metaShowInMenu,
      remark: menuData.remark
    }
    
    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${field} = ?`)
        params.push(value)
      }
    }
    
    if (updates.length === 0) {
      throw new Error('没有要更新的字段')
    }
    
    params.push(id)
    const query = `UPDATE menus SET ${updates.join(', ')} WHERE id = ?`
    
    await databaseService.query(query, params)
    
    // 如果菜单权限(perms)发生变化，可能需要更新角色菜单关联
    if (menuData.perms !== undefined) {
      try {
        // 首先获取所有拥有 * 或 admin 权限的角色
        const superPermissionRolesQuery = `
          SELECT DISTINCT rp.role_id 
          FROM role_permissions rp 
          WHERE rp.permission IN ('*', 'admin')
        `
        const superPermissionRoles = await databaseService.query(superPermissionRolesQuery)
        
        // 收集需要分配权限的角色ID（包括admin角色）
        const roleIds = ['admin'] // 默认包含admin角色
        superPermissionRoles.forEach(role => {
          if (!roleIds.includes(role.role_id)) {
            roleIds.push(role.role_id)
          }
        })
        
        // 为所有这些角色重新分配菜单权限
        if (roleIds.length > 0) {
          // 构建SQL查询 - 为每个角色ID创建一个(role_id, menu_id)对
          const valuesClauses = roleIds.map(() => '(?, ?)').join(', ')
          const adminRoleQuery = `INSERT IGNORE INTO role_menus (role_id, menu_id) VALUES ${valuesClauses}`
          
          // 构建参数数组
          const updateParams = []
          roleIds.forEach(roleId => {
            updateParams.push(roleId, id)
          })
          
          await databaseService.query(adminRoleQuery, updateParams)
          logger.info(`菜单更新后，自动为以下角色分配菜单权限: ${roleIds.join(', ')} -> 菜单ID: ${id}`)
        }
      } catch (error) {
        logger.warn(`菜单更新后，为超级权限角色重新分配菜单权限失败: ${id}`, error)
      }
    }
    
    return { id, ...menuData }
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id) {
    // 检查是否有子菜单
    const children = await databaseService.query(
      'SELECT COUNT(*) as count FROM menus WHERE parent_id = ?',
      [id]
    )
    
    if (children[0].count > 0) {
      throw new Error('该菜单下存在子菜单，无法删除')
    }
    
    // 删除角色菜单关联
    await databaseService.query('DELETE FROM role_menus WHERE menu_id = ?', [id])
    
    // 删除菜单
    await databaseService.query('DELETE FROM menus WHERE id = ?', [id])
    
    return { success: true }
  }

  /**
   * 为角色分配菜单
   */
  async assignMenusToRole(roleId, menuIds) {
    // 先删除该角色的所有菜单权限
    await databaseService.query('DELETE FROM role_menus WHERE role_id = ?', [roleId])
    
    // 批量插入新的菜单权限
    if (menuIds && menuIds.length > 0) {
      const values = menuIds.map(menuId => `('${roleId}', '${menuId}')`).join(', ')
      const query = `INSERT INTO role_menus (role_id, menu_id) VALUES ${values}`
      await databaseService.query(query)
    }
    
    return { success: true, count: menuIds.length }
  }

  /**
   * 获取角色已分配的菜单ID列表
   * 只返回启用且可见的菜单ID，与 getUserRoutes 保持一致
   */
  async getRoleMenuIds(roleId) {
    const query = `
      SELECT rm.menu_id
      FROM role_menus rm
      INNER JOIN menus m ON rm.menu_id = m.id
      WHERE rm.role_id = ?
        AND m.status = 1
        AND m.visible = 1
    `
    const result = await databaseService.query(query, [roleId])
    return result.map(r => r.menu_id)
  }
}

module.exports = new MenuService()
