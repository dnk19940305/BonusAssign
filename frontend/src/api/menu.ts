import request from '@/utils/request'

export interface Menu {
  id: string
  parentId?: string | null
  menuName: string
  menuPath?: string | null
  component?: string | null
  menuType: 'directory' | 'menu' | 'button'
  icon?: string | null
  sortOrder: number
  visible: boolean
  status: boolean
  perms?: string | null
  isFrame: boolean
  isCache: boolean
  redirect?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaShowInMenu: boolean
  createdBy?: string | null
  remark?: string | null
  children?: Menu[]
}

export interface RouteMenu {
  path: string
  name: string
  component: string
  redirect?: string
  meta: {
    title: string
    icon?: string
    requiresAuth: boolean
    showInMenu: boolean
    permissions: string[]
  }
  children?: RouteMenu[]
}

/**
 * 获取当前用户的路由菜单
 */
export function getUserRoutes() {
  return request<{ data: RouteMenu[] }>({
    url: '/menus/routes',
    method: 'get'
  })
}

/**
 * 获取所有菜单列表
 */
export function getAllMenus() {
  return request<{ data: Menu[] }>({
    url: '/menus',
    method: 'get'
  })
}

/**
 * 获取菜单树结构
 */
export function getMenuTree() {
  return request<{ data: Menu[] }>({
    url: '/menus/tree',
    method: 'get'
  })
}

/**
 * 创建菜单
 */
export function createMenu(data: Partial<Menu>) {
  return request<{ data: Menu }>({
    url: '/menus',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export function updateMenu(id: string, data: Partial<Menu>) {
  return request<{ data: Menu }>({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export function deleteMenu(id: string) {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
}

/**
 * 为角色分配菜单
 */
export function assignMenusToRole(roleId: string, menuIds: string[]) {
  return request({
    url: `/menus/role/${roleId}/assign`,
    method: 'post',
    data: { menuIds }
  })
}

/**
 * 获取角色已分配的菜单ID列表
 */
export function getRoleMenuIds(roleId: string) {
  return request<{ data: string[] }>({
    url: `/menus/role/${roleId}/ids`,
    method: 'get'
  })
}

/**
 * 获取角色的菜单树
 */
export function getRoleMenuTree(roleId: string) {
  return request<{ data: Menu[] }>({
    url: `/menus/role/${roleId}/tree`,
    method: 'get'
  })
}
