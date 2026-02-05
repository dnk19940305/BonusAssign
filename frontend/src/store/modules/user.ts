import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const permissions = ref<string[]>([])
  const isInitialized = ref<boolean>(false)

  const setUser = (userData: User) => {
    // 避免重复设置相同的用户数据
    if (JSON.stringify(user.value) === JSON.stringify(userData)) {
      return
    }
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const setToken = (tokenValue: string) => {
    // 避免重复设置相同的token
    if (token.value === tokenValue) {
      return
    }
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
  }

  const setRefreshToken = (refreshTokenValue: string) => {
    // 避免重复设置相同的refreshToken
    if (refreshToken.value === refreshTokenValue) {
      return
    }
    refreshToken.value = refreshTokenValue
    localStorage.setItem('refreshToken', refreshTokenValue)
  }

  const setPermissions = (perms: string[]) => {
    // 避免重复设置相同的权限
    if (JSON.stringify(permissions.value) === JSON.stringify(perms)) {
      return
    }
    permissions.value = perms
    localStorage.setItem('permissions', JSON.stringify(perms))
  }

  const setLoginData = (data: {
    user: User
    token: string
    refreshToken: string
    permissions: string[]
  }) => {
    setUser(data.user)
    setToken(data.token)
    setRefreshToken(data.refreshToken)
    // 如果后端没有返回 permissions 列表，但返回了 roleName，则从角色映射补全默认权限
    const mapped = mapRoleToPermissions(data.user?.roleName)
    if ((!data.permissions || data.permissions.length === 0) && mapped.length > 0) {
      setPermissions(mapped)
    } else {
      setPermissions(data.permissions || mapped)
    }
    isInitialized.value = true
  }

  const logout = () => {
    user.value = null
    token.value = ''
    refreshToken.value = ''
    permissions.value = []
    isInitialized.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
  }

  const hasPermission = (permission: string): boolean => {
    if (permissions.value.includes('*')) return true
    if (permissions.value.includes(permission)) return true
    // 兼容基于角色名的简单匹配（例如后端仅返回 roleName 而非权限字符串）
    const roleName = user.value?.roleName || ''
    if (roleName && roleName.toString().toLowerCase() === permission.toString().toLowerCase()) return true
    return false
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    // console.log('🔐 权限检查详情:', {
    //   requiredPermissions,
    //   userPermissions: permissions.value,
    //   hasWildcard: permissions.value.includes('*'),
    //   userInfo: user.value,
    //   token: token.value
    // })
    
    if (permissions.value.includes('*')) {
      return true
    }

    const lowerUserPerms = permissions.value.map(p => p.toString().toLowerCase())
    const lowerRequired = requiredPermissions.map(r => r.toString().toLowerCase())

    // 先匹配权限列表
    if (lowerRequired.some(r => lowerUserPerms.includes(r))) return true

    // 再兼容基于角色名的匹配（roleName）
    const roleName = user.value?.roleName ? user.value.roleName.toString().toLowerCase() : ''
    if (roleName && lowerRequired.includes(roleName)) return true

    return false
  }

  // 简单的 roleName -> permissions 映射，便于兼容后端只返回角色名的情况。
  // 仅做默认补全，若后端提供更细粒度权限应以后端为准。
  const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    admin: ['*'],
    super_admin: ['*'],
    hr: ['employee:create', 'employee:update', 'employee:delete', 'employee:export'],
    finance: ['finance:view', 'finance:manage'],
    project_manager: ['project:create', 'project:update', 'project:delete']
  }

  const mapRoleToPermissions = (roleName?: string | null): string[] => {
    if (!roleName) return []
    const key = roleName.toString().toLowerCase()
    return ROLE_PERMISSION_MAP[key] || []
  }

  // 菜单可见性由后端返回的路由 `meta.permissions` 驱动。
  // 不再在前端维护硬编码的路由-权限映射（后端 `/api/menus/routes` 返回的 `menu.meta.permissions` 应为权威来源）。
  // 如果需要客户端快速检查某权限，使用 `hasPermission` 或 `hasAnyPermission`。

  const initFromStorage = () => {
    // 避免重复初始化
    if (isInitialized.value) {
      console.log('🔄 User store already initialized, skipping...')
      return
    }

    console.log('🔄 Initializing user store from localStorage...')
    
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')
    const storedPermissions = localStorage.getItem('permissions')
    
    // 检查token有效性
    if (storedToken && validateStoredToken(storedToken)) {
      token.value = storedToken
      
      // 恢复用户信息
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          user.value = parsedUser
          console.log('✅ User data restored from storage')
        } catch (error) {
          console.error('❌ Failed to parse stored user:', error)
          localStorage.removeItem('user')
        }
      }
      
      // 恢复权限信息
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions)
          if (Array.isArray(parsedPermissions)) {
            permissions.value = parsedPermissions
            console.log('✅ Permissions restored from storage')
          }
        } catch (error) {
          console.error('❌ Failed to parse stored permissions:', error)
          localStorage.removeItem('permissions')
        }
        // 如果本地没有权限但有 roleName，则补全默认权限
      } else if (user.value?.roleName) {
        const mapped = mapRoleToPermissions(user.value.roleName)
        if (mapped.length > 0) {
          permissions.value = mapped
          localStorage.setItem('permissions', JSON.stringify(mapped))
          console.log('ℹ️ Permissions populated from roleName mapping')
        }
      }
    } else if (storedToken) {
      // Token无效，清理所有相关数据
      console.log('❌ Invalid token found, cleaning up storage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
    }
    
    if (storedRefreshToken && validateStoredToken(storedRefreshToken)) {
      refreshToken.value = storedRefreshToken
    } else if (storedRefreshToken) {
      localStorage.removeItem('refreshToken')
    }

    isInitialized.value = true
    console.log('🔄 User store initialization complete:', {
      hasToken: !!token.value,
      hasUser: !!user.value,
      hasPermissions: permissions.value.length > 0,
      isInitialized: isInitialized.value
    })
  }
  
  // 验证存储的token格式
  const validateStoredToken = (tokenStr: string): boolean => {
    if (!tokenStr) return false
    
    try {
      const parts = tokenStr.split('.')
      if (parts.length !== 3) return false
      
      const payload = JSON.parse(atob(parts[1]))
      const now = Math.floor(Date.now() / 1000)
      
      // 检查是否过期（允许5分钟缓冲）
      if (payload.exp && payload.exp < (now - 300)) {
        console.log('❌ Token expired:', { exp: payload.exp, now })
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Token validation failed:', error)
      return false
    }
  }

  // 检查token是否有效
  const validateToken = (): boolean => {
    return validateStoredToken(token.value)
  }

  const isLoggedIn = (): boolean => {
    return !!(token.value && user.value)
  }

  return {
    user,
    token,
    refreshToken,
    permissions,
    isInitialized,
    setUser,
    setToken,
    setRefreshToken,
    setPermissions,
    setLoginData,
    logout,
    hasPermission,
    hasAnyPermission,
    // 前端不再导出 hasMenuPermission；菜单显示请依赖后端返回的 `meta.permissions`。
    initFromStorage,
    isLoggedIn,
    validateToken,
    validateStoredToken
  }
})