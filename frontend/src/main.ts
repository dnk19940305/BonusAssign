import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入VXE Table
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import App from './App.vue'
import router, { addDynamicRoutes } from './router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

// 全局样式
import '@/assets/styles/main.css'

// 全局错误处理覆盖
import '@/utils/global-error-handler'

// 开发环境调试工具
if (process.env.NODE_ENV !== 'production') {
  import('@/utils/debug-login-refresh')
}

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(VXETable)

// 初始化用户状态
const userStore = useUserStore()
userStore.initFromStorage()

// 恢复本地菜单并注入路由（防止刷新时白屏）
const permissionStore = usePermissionStore()
try {
  const cached = permissionStore.restoreRoutesFromStorage()
  if (cached && cached.length) {
    console.log('♻️ 注入本地缓存路由，数量:', cached.length)
    addDynamicRoutes(cached)
  }
} catch (e) {
  console.warn('⚠️ 恢复本地路由时出错:', e)
}

// 异步从后端刷新路由（非阻塞）
if (userStore.isLoggedIn()) {
  permissionStore.generateRoutes().then(routes => {
    if (routes && routes.length) {
      console.log('🔄 后端刷新路由并注入，数量:', routes.length)
      addDynamicRoutes(routes)
    }
  }).catch(err => console.warn('⚠️ 后端刷新路由失败:', err))
}

// 添加调试信息
console.log('App startup - User store initialized:', {
  hasToken: !!userStore.token,
  hasUser: !!userStore.user,
  hasPermissions: userStore.permissions.length > 0,
  token: userStore.token ? (userStore.token.startsWith('mock-') ? 'mock-token' : 'real-token') : 'none'
})

router.isReady().then(() => app.mount('#app'))