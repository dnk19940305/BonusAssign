<template>
  <div class="main-layout">
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <h1 class="system-title">🎯 奖金模拟系统</h1>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleUserAction">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.user?.realName || userStore.user?.username || '管理员' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container>
        <!-- 侧边导航菜单（由后端返回菜单树驱动） -->
        <el-aside width="250px" class="sidebar">
          <el-menu
            :default-active="currentRoute"
            class="sidebar-menu"
            @select="handleMenuSelect"
            router
          >
            <!-- 固定项：管理驾驶舱 -->
            <el-menu-item index="/dashboard">
              <el-icon><Monitor /></el-icon>
              <span>管理驾驶舱</span>
            </el-menu-item>

            <!-- 固定项：我的奖金 -->
            <el-menu-item index="/personal/dashboard">
              <el-icon><Money /></el-icon>
              <span>我的奖金</span>
            </el-menu-item>

            <!-- 动态菜单项（来自后端，已过滤重复项） -->
            <template v-for="menu in menuTree" :key="menu.id">
              <component
                :is="menu.children && menu.children.length ? 'el-sub-menu' : 'el-menu-item'"
                :index="menu.path || menu.menu_path || ('/' + menu.id)"
              >
                <template #title v-if="menu.children && menu.children.length">
                  <span>{{ menu.meta?.title || menu.menu_name || menu.menuName }}</span>
                </template>

                <template v-if="!menu.children || menu.children.length === 0">
                  <span>{{ menu.meta?.title || menu.menu_name || menu.menuName }}</span>
                </template>

                <!-- 子菜单递归渲染 -->
                <template v-if="menu.children && menu.children.length">
                  <template v-for="child in menu.children" :key="child.id">
                    <el-menu-item :index="child.path || child.menu_path || ('/' + child.id)">
                      <span>{{ child.meta?.title || child.menu_name || child.menuName }}</span>
                    </el-menu-item>
                  </template>
                </template>
              </component>
            </template>
          </el-menu>
        </el-aside>

        <!-- 主要内容区域 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, ArrowDown, Monitor, Management, OfficeBuilding,
  Suitcase, TrendCharts, Folder, Money, Operation, DataAnalysis,
  Document, DataLine, UserFilled, Setting, Key, Tools, FolderOpened, Wallet, Calendar
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 固定菜单路径（用于过滤后端返回的重复菜单）
const FIXED_MENU_PATHS = ['/dashboard', '/personal/dashboard']

// 菜单树（由后端返回的 menu tree 驱动，过滤掉与固定菜单重复的项）
const menuTree = computed(() => {
  const backendMenus = permissionStore.getMenuTree()
  return filterDuplicateMenus(backendMenus)
})

// 过滤重复菜单的函数（深拷贝避免修改原对象）
const filterDuplicateMenus = (menus: any[]): any[] => {
  if (!menus || !Array.isArray(menus)) return []

  return menus
    .filter(menu => {
      const menuPath = menu.path || menu.menu_path
      // 过滤掉与固定菜单路径相同的菜单
      if (FIXED_MENU_PATHS.includes(menuPath)) return false
      // 过滤掉设置了 showInMenu: false 或 0 的菜单
      if (menu.meta?.showInMenu === false || Number(menu.meta?.showInMenu) === 0) return false
      return true
    })
    .map(menu => {
      // 创建新对象，避免修改原对象
      const newMenu = { ...menu }
      // 递归过滤子菜单
      if (newMenu.children && newMenu.children.length > 0) {
        newMenu.children = filterDuplicateMenus(newMenu.children)
      }
      return newMenu
    })
}

// 当前激活的路由
const currentRoute = computed(() => route.path)

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index)
}

// 处理用户操作
const handleUserAction = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确认退出登录吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        
        console.log('Starting logout process...')
        
        // 先调用后端登出API（如果有的话）
        try {
          const { logout } = await import('@/api/auth')
          await logout()
          console.log('Backend logout successful')
        } catch (error) {
          console.warn('Backend logout failed:', error)
          // 即使后端登出失败，也继续前端登出
        }
        
        // 前端登出 - 清除所有状态
        console.log('Clearing user state...')
        userStore.logout()
        
        // 确保localStorage也被清除
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        
        console.log('User state cleared, redirecting to login...')
        
        // 使用replace而不是push，避免用户通过后退按钮回到已登出状态
        await router.replace('/login')
        
        ElMessage.success('已退出登录')
      } catch (error) {
        // 用户取消或其他错误
        console.log('Logout cancelled or failed:', error)
      }
      break
  }
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left .system-title {
  margin: 0;
  color: #409eff;
  font-size: 24px;
  font-weight: bold;
}

.header-right .user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.user-info:hover {
  color: #409eff;
}

.sidebar {
  background: #f5f5f5;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 45px;
  line-height: 45px;
  padding-left: 40px !important;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
}

.el-container {
  height: 100%;
}
</style>