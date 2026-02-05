import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { getUserRoutes } from '@/api/menu'
import type { RouteMenu } from '@/api/menu'

// 组件映射表
const componentsMap: Record<string, () => Promise<any>> = {
  'dashboard/DashboardOverview': () => import('@/views/dashboard/DashboardOverview.vue'),
  'employee/EmployeeManagement': () => import('@/views/employee/EmployeeManagement.vue'),
  'department/DepartmentManagement': () => import('@/views/department/DepartmentManagement.vue'),
  'position/PositionManagement': () => import('@/views/position/PositionManagement.vue'),
  'position/PositionEncyclopedia': () => import('@/views/position/PositionEncyclopedia.vue'),
  'position/PositionDetail': () => import('@/views/position/PositionDetail.vue'),
  'businessLine/BusinessLineManagement': () => import('@/views/businessLine/BusinessLineManagement.vue'),
  'project/MyProjects': () => import('@/views/project/MyProjects.vue'),
  'project/ProjectCollaboration': () => import('@/views/project/ProjectCollaboration.vue'),
  'project/ProjectPublish': () => import('@/views/project/ProjectPublish.vue'),
  'project/ProjectManagement': () => import('@/views/project/ProjectManagement.vue'),
  'project/ProjectMemberApproval': () => import('@/views/project/ProjectMemberApproval.vue'),
  'project/ProjectRoleWeights': () => import('@/views/project/ProjectRoleWeights.vue'),
  'project/MilestoneTemplates': () => import('@/views/project/MilestoneTemplates.vue'),
  'project/ProjectCostManagement': () => import('@/views/project/ProjectCostManagement.vue'),
  'project/ProjectBonusManagement': () => import('@/views/project/ProjectBonusManagement.vue'),
  'project/ProjectPerformanceManual': () => import('@/views/project/ProjectPerformanceManual.vue'),
  'profit/ProfitDataManagement': () => import('@/views/profit/ProfitDataManagement.vue'),
  'calculation/BonusCalculation': () => import('@/views/calculation/BonusCalculation.vue'),
  'simulation/SimulationAnalysis': () => import('@/views/simulation/SimulationAnalysis.vue'),
  'performance/PerformanceRecordManagement': () => import('@/views/performance/PerformanceRecordManagement.vue'),
  'reports/ReportManagement': () => import('@/views/reports/ReportManagement.vue'),
  'reports/PersonalBonus': () => import('@/views/reports/PersonalBonus.vue'),
  'personal/PersonalBonusDashboard': () => import('@/views/personal/PersonalBonusDashboard.vue'),
  'system/UserManagement': () => import('@/views/system/UserManagement.vue'),
  'system/RoleManagement': () => import('@/views/system/RoleManagement.vue'),
  'system/MenuManagement': () => import('@/views/system/MenuManagement.vue'),
  'system/SystemConfig': () => import('@/views/system/SystemConfig.vue'),
  'system/WeightConfigManagement': () => import('@/views/system/WeightConfigManagement.vue'),
  'system/ImprovementSuggestionsManagement': () => import('@/views/system/ImprovementSuggestionsManagement.vue'),
  'system/CityManagement': () => import('@/views/system/CityManagement.vue'),
  'project/ProjectCollaborationDetail': () => import('@/views/project/ProjectCollaborationDetail.vue'),
  'project/ProjectRoleManagement': () => import('@/views/project/ProjectRoleManagement.vue')
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuRoutes = ref<any>([])
  const isRoutesLoaded = ref(false)

  // 安全日志：防止运行时全局 console 被覆盖导致调用异常
  const safeLog = (...args: any[]) => {
    try {
      if (typeof console !== 'undefined' && typeof console.log === 'function') console.log(...args)
    } catch (e) {
      // noop
    }
  }
  const safeError = (...args: any[]) => {
    try {
      if (typeof console !== 'undefined' && typeof console.error === 'function') console.error(...args)
    } catch (e) {
      // noop
    }
  }

  /**
   * 将后端菜单数据转换为Vue Router路由配置
   */
  // 过滤并去重菜单（按 path），并移除 /dashboard，以避免与前端常量路由重复
  const filterAndDeduplicateMenus = (menus: (RouteMenu & Record<string, any>)[]): (RouteMenu & Record<string, any>)[] => {
    const seen = new Set<string>()

    const recurse = (list: (RouteMenu & Record<string, any>)[] = []) => {
      const out: (RouteMenu & Record<string, any>)[] = []
      for (const item of list) {
        const path = (item.path ?? item.menu_path ?? (item.id ? `/${item.id}` : '')).toString()
        if (!path || path === '/dashboard') continue
        if (seen.has(path)) continue
        seen.add(path)
        const copy: any = { ...item }
        if (item.children && item.children.length) {
          copy.children = recurse(item.children)
        }
        out.push(copy)
      }
      return out
    }

    return recurse(menus)
  }

  const convertToRoutes = (menus: (RouteMenu & Record<string, any>)[]): RouteRecordRaw[] => {
    // safeLog('🔄 开始转换菜单为路由:', menus)
  
    return menus.map(menu => {
      // safeLog('📝 转换菜单:', menu.path, menu.name, menu.component)
      // 规范化路径，确保以 '/' 开头
      const rawPath = menu.path ?? menu.menu_path ?? (menu.id ? `/${menu.id}` : '/')
      let routePath = String(rawPath || '/')
      if (!routePath.startsWith('/')) routePath = '/' + routePath
  
      // 组件回退：
      // - 如果 menu.component 有映射，使用映射组件
      // - 如果无 component 但有 children，使用 RouterView 作为占位容器以渲染子路由
      // - 其他情况回退到 Dashboard
      let componentFactory: any
      if (menu.component && componentsMap[menu.component]) {
        componentFactory = componentsMap[menu.component]
      } else if (menu.component && typeof menu.component === 'string') {
        // 尝试按后端返回的 component 字符串动态导入，例如 'system/MenuManagement' -> '../../views/system/MenuManagement.vue'
        componentFactory = () => import(`../../views/${menu.component}.vue`).catch(() => import('@/views/dashboard/DashboardOverview.vue'))
      } else if (menu.children && menu.children.length > 0) {
        componentFactory = RouterView
      } else {
        componentFactory = () => import('@/views/dashboard/DashboardOverview.vue')
      }
  
      // 保证路由 name 全局唯一：优先使用 menu.id，否则使用基于 path 的惟一标识
      const generatedName = menu.id ? String(menu.id) : (routePath.replace(/^[\/]?/, '').replace(/[\/]/g, '_') || 'root')
      const route: RouteRecordRaw = {
        path: routePath,
        name: generatedName,
        component: componentFactory,
        meta: {
          title: menu.meta?.title || menu.menu_name,
          icon: menu.meta?.icon,
          requiresAuth: menu.meta?.requiresAuth !== false,
          showInMenu: menu.meta?.showInMenu !== false,
          permissions: menu.meta?.permissions || []
        }
      }
  
      // 处理重定向
      if (menu.redirect) {
        (route as any).redirect = menu.redirect
      }
  
      // 递归处理子路由
      if (menu.children && menu.children.length > 0) {
        (route as any).children = convertToRoutes(menu.children)
      }
  
      // 记录 component 类型，便于调试刷新时的渲染问题
      try {
        // safeLog('✅ 路由转换完成:', { path: route.path, name: route.name, componentType: typeof (route as any).component })
      } catch (e) {
        // safeLog('✅ 路由转换完成:', route)
      }
      return route
    })
  }

  /**
   * 检查菜单树中是否存在指定路径
   */
  const hasMenuPath = (menus: (RouteMenu & Record<string, any>)[], targetPath: string): boolean => {
    const normalize = (p: any) => String(p || '').trim().replace(/\/$/, '')
    const target = normalize(targetPath)

    for (const menu of menus) {
      const path = normalize(menu.path || menu.menu_path)
      if (path === target) return true
      if (menu.children && hasMenuPath(menu.children, targetPath)) return true
    }
    return false
  }

  /**
   * 为特定路由添加详情页路由（作为同级路由注入到 Layout）
   */
  const injectDetailRoutes = (dynamicRoutes: RouteRecordRaw[], menus: RouteMenu[]) => {
    const detailRoutesConfigs = [
      {
        parentPath: '/position/encyclopedia',
        detailPath: '/position/encyclopedia/:id',
        name: 'PositionEncyclopediaDetail',
        component: 'position/PositionDetail',
        title: '岗位详情'
      },
      {
        parentPath: '/department',
        detailPath: '/department/:id',
        name: 'DepartmentDetail',
        component: 'department/DepartmentManagement',
        title: '部门详情'
      },
      {
        parentPath: '/employee',
        detailPath: '/employee/:id',
        name: 'EmployeeDetail',
        component: 'employee/EmployeeManagement',
        title: '员工详情'
      },
      {
        parentPath: '/project/collaboration',
        detailPath: '/project/collaboration/:id',
        name: 'ProjectCollaborationDetail',
        component: 'project/ProjectCollaborationDetail',
        title: '项目协作详情'
      }
    ]

    detailRoutesConfigs.forEach(config => {
      if (hasMenuPath(menus, config.parentPath)) {
        // safeLog(`🔧 注入详情页路由: ${config.detailPath}`)
        const exists = dynamicRoutes.some(r => r.name === config.name || r.path === config.detailPath)
        if (!exists) {
          dynamicRoutes.push({
            path: config.detailPath,
            name: config.name,
            component: componentsMap[config.component] || componentsMap['dashboard/DashboardOverview'],
            meta: {
              title: config.title,
              requiresAuth: true,
              showInMenu: false,
              permissions: []
            }
          })
        }
      }
    })
  }

  /**
   * 生成动态路由
   */
  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    try {
      // safeLog('🔄 开始加载用户路由...')

      // 从后端获取用户的路由菜单
      const { data: responseData } = await getUserRoutes()
      const userMenus = (responseData as any).data || responseData || []

      // safeLog('✅ 获取到用户菜单:', userMenus)

      // 保存菜单数据（过滤 /dashboard 并去重）
      const cleanedMenus = filterAndDeduplicateMenus(userMenus as (RouteMenu & Record<string, any>)[])
      menuRoutes.value = cleanedMenus
      // 持久化菜单以便刷新时可以快速恢复
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(menuRoutes.value))
      } catch (e) {
        safeError('⚠️ 保存菜单到 localStorage 失败:', e)
      }

      // 转换为路由配置
      const dynamicRoutes = convertToRoutes(userMenus as (RouteMenu & Record<string, any>)[])

      // 注入详情页路由
      injectDetailRoutes(dynamicRoutes, userMenus as (RouteMenu & Record<string, any>)[])

      // 保存路由数据
      routes.value = dynamicRoutes
      isRoutesLoaded.value = true

      safeLog('✅ 动态路由生成完成:', dynamicRoutes)

      return dynamicRoutes
    } catch (error) {
      safeError('❌ 加载用户路由失败:', error)
      isRoutesLoaded.value = false
      throw error
    }
  }

  // 本地存储键名
  const STORAGE_KEY = 'app_menu_routes_v1'

  // 从 localStorage 恢复菜单并转换为路由（同步）
  const restoreRoutesFromStorage = (): RouteRecordRaw[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      menuRoutes.value = parsed as (RouteMenu & Record<string, any>)[]
      const dynamicRoutes = convertToRoutes(menuRoutes.value)

      // 注入详情页路由
      injectDetailRoutes(dynamicRoutes, menuRoutes.value)

      routes.value = dynamicRoutes
      isRoutesLoaded.value = true
      safeLog('♻️ 从 localStorage 恢复路由成功:', dynamicRoutes)
      return dynamicRoutes
    } catch (e) {
      safeError('⚠️ 从 localStorage 恢复路由失败:', e)
      return []
    }
  }

  /**
   * 重置路由状态
   */
  const resetRoutes = () => {
    routes.value = []
    menuRoutes.value = []
    isRoutesLoaded.value = false
  }

  /**
   * 获取菜单树（用于侧边栏渲染）
   */
  const getMenuTree = (): RouteMenu[] => {
    return menuRoutes.value
  }

  return {
    routes,
    menuRoutes,
    isRoutesLoaded,
    generateRoutes,
    resetRoutes,
    getMenuTree,
    restoreRoutesFromStorage
  }
})
