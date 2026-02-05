import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import projectCollaborationRoutes from './modules/projectCollaboration'

// 基础路由（不需要权限的路由）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      // 动态路由将在这里注入
      // 添加一个默认的dashboard路由作为后备
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardOverview.vue'),
        meta: {
          title: '管理驾驶舱',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 动态添加路由的方法
export const addDynamicRoutes = (routes: RouteRecordRaw[]) => {
  console.log('🔧 开始添加动态路由，共', routes.length, '个')

  // 将动态路由添加到Layout路由的children中
  routes.forEach(route => {
    try {
      // 避免重复注入：按 route.name 或 route.path 检查
      const routeName = String(route.name)
      const existsByName = routeName && router.hasRoute && router.hasRoute(routeName)
      const existsByPath = router.getRoutes().some(r => r.path === route.path)
      if (existsByName || existsByPath) {
        // console.log('⚠️ 跳过重复路由注入:', route.path, route.name)
      } else {
        router.addRoute('Layout', route)
        // console.log('✅ 路由已注入到 Layout:', route.path, route.name)
      }
    } catch (error) {
      console.error('❌ 添加路由失败:', route.path, error)
    }
  })

  console.log('📋 当前所有路由:', router.getRoutes().map(r => ({ path: r.path, name: r.name })))
}

// 重置路由的方法
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: constantRoutes
  })
    ; (router as any).matcher = (newRouter as any).matcher
}

// 路由守卫状态管理
let isRestoringUser = false
let hasLoadedRoutes = false

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const { useUserStore } = await import('@/store/modules/user')
  const { usePermissionStore } = await import('@/store/modules/permission')
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  console.log(`🚀 Route Guard: ${from.path} -> ${to.path}`, {
    hasToken: !!token,
    hasUser: !!userStore.user,
    isRestoringUser,
    isInitialized: userStore.isInitialized,
    hasLoadedRoutes
  })

  // 如果目标页面是登录页
  if (to.path === '/login') {
    // 如果已经有有效token和用户信息，重定向到dashboard
    if (token && userStore.user && userStore.isLoggedIn()) {
      console.log('✅ User already logged in, redirecting to dashboard')
      next('/dashboard')
      return
    }
    // 允许访问登录页并确保状态清理
    console.log('✅ Allowing access to login page')
    if (!token) {
      userStore.logout() // 确保状态完全清除
      hasLoadedRoutes = false // 重置路由加载状态
    }
    next()
    return
  }

  // 如果需要认证但没有token，跳转到登录页
  if (to.meta.requiresAuth && !token) {
    console.log('❌ No token found, redirecting to login')
    userStore.logout() // 确保状态清除
    hasLoadedRoutes = false
    next('/login')
    return
  }

  // 如果有token但用户信息为空（页面刷新等情况），需要恢复用户状态
  if (token && !userStore.user && to.meta.requiresAuth && !isRestoringUser) {
    console.log('🔄 Token exists but no user info, attempting to restore user state')

    // 首先验证token格式
    if (!userStore.validateToken()) {
      console.log('❌ Invalid token format, redirecting to login')
      userStore.logout()
      hasLoadedRoutes = false
      next('/login')
      return
    }

    isRestoringUser = true
    try {
      console.log('📡 Fetching user info from API')
      const { getCurrentUserForRouter } = await import('@/api/auth')
      const response = await getCurrentUserForRouter()

      console.log('✅ User info API response received')
      userStore.setLoginData({
        user: response.data.user,
        token: token,
        refreshToken: localStorage.getItem('refreshToken') || '',
        permissions: response.data.permissions || []
      })

      // 恢复用户状态后重置路由加载状态
      hasLoadedRoutes = false

      console.log('✅ User state restored successfully')
      isRestoringUser = false
      next({ ...to, replace: true })
      return
    } catch (error) {
      console.error('❌ Failed to restore user state:', error)
      isRestoringUser = false
      userStore.logout()
      hasLoadedRoutes = false
      next('/login')
      return
    }
  }

  // 如果正在恢复用户状态，等待完成
  if (isRestoringUser) {
    console.log('⏳ User restoration in progress, waiting...')
    // 等待恢复完成
    const checkRestoration = () => {
      if (!isRestoringUser) {
        next()
      } else {
        setTimeout(checkRestoration, 100)
      }
    }
    checkRestoration()
    return
  }

  // 如果没有匹配到任何路由记录，但 permission store 已经恢复/注入了路由，尝试重新解析导航
  if (to.matched.length === 0) {
    try {
      const { usePermissionStore } = await import('@/store/modules/permission')
      const permissionStore = usePermissionStore()
      if (permissionStore.isRoutesLoaded) {
        console.log('⚡ No matched route records but permission routes loaded — re-resolving navigation')
        next({ ...to, replace: true })
        return
      }
    } catch (e) {
      console.warn('⚠️ 检查 permissionStore 状态失败', e)
    }
  }

  // 动态路由加载
  if (token && userStore.user && !hasLoadedRoutes && to.meta.requiresAuth) {
    // console.log('🔄 Loading dynamic routes...')
    try {
      // 加载用户路由
      const dynamicRoutes = await permissionStore.generateRoutes()

      // 注入动态路由
      addDynamicRoutes(dynamicRoutes)

      hasLoadedRoutes = true
      console.log('✅ Dynamic routes loaded successfully')

      // 重新导航到目标路由
      next({ ...to, replace: true })
      return
    } catch (error) {
      console.error('❌ Failed to load dynamic routes:', error)
      // 加载路由失败不阻塞导航，继续访问
    }
  }

  // 权限检查已移除：
  // 由于系统已改为基于角色菜单分配（role_menus表）来控制菜单显示，
  // 用户能看到的菜单就应该能访问，不需要在路由守卫中再次检查权限。
  // 这样可以避免菜单显示与路由访问权限不一致的问题。

  // 允许访问
  // 调试：打印匹配到的路由记录，帮助定位重定向/未命中问题
  const matchedRoutes = router.getRoutes().filter(r => r.path === to.path || String(r.name) === String(to.name))
  // console.log('🔍 Matched routes for target:', to.path, { matchedCount: matchedRoutes.length, matchedRoutes: matchedRoutes.map(r => ({ path: r.path, name: r.name })) })
  // 打印匹配路由的 component 类型以排查渲染失败问题
  try {
    const compInfo = matchedRoutes.map(r => ({ path: r.path, name: r.name, hasComponent: !!(r as any).component || !!(r as any).components, componentType: typeof (r as any).component, componentsField: (r as any).components }))
    console.log('🔎 Matched routes component info:', compInfo)
  } catch (e) {
    console.warn('⚠️ Failed to inspect matched route components', e)
  }
  console.log('ℹ️ to.matched length:', to.matched.length, 'matched names:', to.matched.map(m => m.name))
  console.log('✅ Route access granted')
  next()
})

export default router