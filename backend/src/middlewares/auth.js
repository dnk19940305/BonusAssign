﻿const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const databaseService = require('../services/databaseService')
const logger = require('../utils/logger')
const dataMaskingService = require('../services/dataMaskingService')
const { PermissionValidator, PERMISSIONS } = require('../config/permissions')


// 验证访问令牌
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '访问令牌不存在',
        data: null
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 添加调试日志
    // console.log('🔐 JWT Token 解析结果:', JSON.stringify(decoded))
    
    // 验证token类型
    if (decoded.type !== 'access') {
      console.log('❌ Token类型不正确:', decoded.type)
      return res.status(401).json({
        code: 401,
        message: '无效的访问令牌',
        data: null
      })
    }

    // 尝试不同的字段名来获取用户ID
    const userId = decoded.id || decoded.userId || decoded.sub
    // console.log('🔐 尝试获取用户ID:', userId)
    
    if (!userId) {
      console.log('❌ 无法从JWT token中获取用户ID')
      return res.status(401).json({
        code: 401,
        message: '访问令牌格式错误',
        data: null
      })
    }

    // 增加重试机制处理数据库初始化延迟
    let user = null
    let retryCount = 0
    const maxRetries = 5
    const dataService = databaseService
    
    while (!user && retryCount < maxRetries) {
      try {
        // 检查数据库服务是否已初始化
       if (!dataService.isInitialized) {
            throw new Error('MySQL 服务未初始化，请等待初始化完成')
          }
          user = await (dataService.getUserById ? dataService.getUserById(userId) : dataService.findByPk('users', userId))
        
        if (user) break
      } catch (error) {
        console.log(`🔐 用户查询失败 (尝试 ${retryCount + 1}/${maxRetries}): ${error.message}`)
        if (error.message.includes('未初始化') || error.message.includes('is not a function')) {
          // 等待200ms后重试，给更多时间进行初始化
          await new Promise(resolve => setTimeout(resolve, 200))
          retryCount++
        } else {
          throw error
        }
      }
    }
    
    // console.log('🔐 用户查询结果:', user ? '用户存在' : '用户不存在')
    
    if (!user) {
      console.log('❌ 用户不存在:', { userId })
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
        data: null
      })
    }

    // 检查用户激活状态 - 兼容不同字段名
    const isActive = user.isActive === true || user.status === 1 || user.status === true
    if (!isActive) {
      console.log('❌ 用户已被禁用:', { 
        userId, 
        isActive: user.isActive, 
        status: user.status,
        username: user.username 
      })
      return res.status(401).json({
        code: 401,
        message: '用户已被禁用',
        data: null
      })
    }

    // 获取用户角色信息
    let role = null
    // 兼容MySQL的role_id和NeDB的roleId
    const userRoleId = user.roleId || user.role_id;
    if (userRoleId) {
      // console.log('🔐 用户角色ID:', userRoleId)
      try {
        role = await (dataService.getRoleById ? dataService.getRoleById(userRoleId) : dataService.findByPk('roles', userRoleId))
        // console.log('🔐 角色查询结果:', role ? '角色存在' : '角色不存在')
      } catch (error) {
        console.warn('⚠️ 角色查询失败:', error.message)
        // 角色查询失败不阻止认证，但记录警告
      }
    } else {
      console.log('🔐 用户没有角色ID')
    }

    // 查找用户对应的员工信息
    let employee = null
    try {
      // MySQL: employees表通过user_id字段关联users表
      // console.log('🔍 查询员工信息 - 用户ID:', user.id)
      const result = await dataService.findAll('employees', { where: { user_id: user.id } })

      // 处理MySQL返回的 { rows: [...], count: N } 格式
      const employees = result.rows || result
      // console.log('🔍 查询结果 - 员工数组长度:', employees ? employees.length : 0)
      employee = employees && employees.length > 0 ? employees[0] : null
      // console.log('🔍 查询到员工记录:', employee ? 'YES' : 'NO')
      // if (employee) {
      //   console.log('🔍 员工对象字段:', {
      //     id: employee.id,
      //     _id: employee._id,
      //     employee_no: employee.employee_no,
      //     name: employee.name
      //   })
      // }
    } catch (error) {
      console.warn('⚠️ 员工信息查询失败:', error.message)
      console.warn('⚠️ 错误详情:', error)
      // 员工查询失败不阻止认证，但记录警告
    }

    // 构建用户对象,兼容原有结构和Sequelize期望
    const userObj = {
      // 基础用户信息
      ...user,
      id: user._id || user.id, // 兼容原有代码期望的 id 字段

      // 添加员工ID信息 (兼容MySQL的id字段和NeDB的_id字段)
      employeeId: employee?._id || employee?.id || null,

      // Sequelize兼容方法
      toJSON: function() {
        const result = { ...this }
        delete result.toJSON
        delete result.Role
        delete result.password // 确保密码不被序列化
        return result
      }
    }
    
    // 添加角色信息
    if (role) {
      userObj.Role = {
        id: role._id || role.id,
        name: role.name,
        permissions: role.permissions || [],
        // Sequelize兼容方法
        toJSON: function() {
          return {
            id: this.id,
            name: this.name,
            permissions: this.permissions
          }
        }
      }
      
      // 为向后兼容添加roleId和roleName
      userObj.roleId = role._id || role.id
      userObj.roleName = role.name
    } else {
      // 设置默认角色信息
      userObj.Role = null
      // 保留原始的role_id，兼容MySQL和NeDB
      userObj.roleId = user.roleId || user.role_id
      userObj.roleName = null
    }
    
    req.user = userObj
    
    // console.log('🔐 构建的用户对象:', {
    //   id: req.user.id,
    //   username: req.user.username,
    //   employeeId: req.user.employeeId,
    //   hasRole: !!req.user.Role,
    //   roleName: req.user.Role?.name,
    //   permissions: req.user.Role?.permissions?.length || 0
    // })
    next()
  } catch (error) {
    console.error('🔐 认证错误详情:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '访问令牌无效',
        data: null
      })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '访问令牌已过期',
        data: null
      })
    } else if (error.message && error.message.includes('未初始化')) {
      return res.status(503).json({
        code: 503,
        message: '服务暂时不可用，请稍后重试',
        data: null
      })
    }
    
    logger.error('Authentication error:', error)
    return res.status(401).json({
      code: 401,
      message: '身份验证失败',
      data: null
    })
  }
}

// 验证用户身份（兼容旧版本）
const authenticate = authenticateToken

// 验证用户权限
const authorize = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 401,
          message: '用户未认证',
          data: null
        })
      }

      // 确保permissions是数组且不为空
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
      if (requiredPermissions.length === 0 || requiredPermissions.some(p => !p)) {
        console.log('❌ 无效的权限配置:', requiredPermissions)
        return res.status(500).json({
          code: 500,
          message: '权限配置错误',
          data: null
        })
      }
      
      // 使用权限验证器安全获取用户权限
      const userPermissions = PermissionValidator.getUserPermissions(req.user)
      
      if (!PermissionValidator.isValidPermissionArray(userPermissions)) {
        console.log('❌ 用户权限信息缺失或格式错误:', {
          hasRole: !!req.user.Role,
          rolePermissions: req.user.Role?.permissions,
          directPermissions: req.user.permissions,
          userId: req.user.id,
          username: req.user.username
        })
        return res.status(403).json({
          code: 403,
          message: '用户权限信息不完整',
          data: {
            reason: 'INVALID_PERMISSIONS',
            message: '用户权限数据格式错误或缺失'
          }
        })
      }
      
      // console.log('🔐 权限检查:', {
      //   required: requiredPermissions,
      //   user: userPermissions,
      //   username: req.user.username,
      //   userId: req.user.id
      // })
      
      // 使用权限验证器检查权限
      const hasPermission = PermissionValidator.hasPermission(userPermissions, requiredPermissions)

      if (!hasPermission) {
        console.log('❌ 权限不足:', {
          required: requiredPermissions,
          user: userPermissions,
          userId: req.user.id,
          username: req.user.username
        })
        return res.status(403).json({
          code: 403,
          message: '权限不足',
          data: {
            required: requiredPermissions,
            message: `需要以下权限之一: ${requiredPermissions.join(', ')}`
          }
        })
      }

      // console.log('✅ 权限检查通过')
      next()
    } catch (error) {
      console.error('❌ 权限验证异常:', error)
      logger.error('Authorization error:', error)
      return res.status(500).json({
        code: 500,
        message: '权限验证失败',
        data: null
      })
    }
  }
}

// 记录操作日志
const logOperation = (action, targetType) => {
  return (req, res, next) => {
    const originalSend = res.json
    
    res.json = function(data) {
      // 记录操作日志
      if (req.user && res.statusCode < 400) {
        logger.info({
          userId: req.user.id,
          username: req.user.username,
          action,
          targetType,
          targetId: req.params.id || null,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        })
      }
      
      originalSend.call(this, data)
    }
    
    next()
  }
}

// IP白名单验证
const validateIPWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    if (whitelist.length === 0) return next()
    
    const clientIP = req.ip || req.connection.remoteAddress
    const isAllowed = whitelist.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR格式支持
        return isIPInCIDR(clientIP, allowedIP)
      } else {
        return clientIP === allowedIP
      }
    })

    if (!isAllowed) {
      logger.warn(`IP访问被拒绝: ${clientIP}`)
      return res.status(403).json({
        code: 403,
        message: 'IP地址未被授权',
        data: null
      })
    }

    next()
  }
}

// 检查IP是否在CIDR范围内
const isIPInCIDR = (ip, cidr) => {
  const [network, prefixLength] = cidr.split('/')
  const mask = -1 << (32 - parseInt(prefixLength))
  const networkLong = ip2long(network) & mask
  const ipLong = ip2long(ip) & mask
  return networkLong === ipLong
}

// IP转长整型
const ip2long = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

// 基于角色的访问控制（RBAC）
const rbacCheck = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          code: 401,
          message: '用户未认证',
          data: null
        })
      }

      // 验证输入参数
      if (!resource || !action) {
        console.log('❌ RBAC配置错误: 资源或操作未定义', { resource, action })
        return res.status(500).json({
          code: 500,
          message: 'RBAC配置错误',
          data: null
        })
      }

      const userRole = req.user.Role?.name
      
      // 使用权限验证器安全获取用户权限
      const permissions = PermissionValidator.getUserPermissions(req.user)
      
      if (!PermissionValidator.isValidPermissionArray(permissions)) {
        console.log('❌ RBAC权限信息缺失:', {
          hasRole: !!req.user.Role,
          rolePermissions: req.user.Role?.permissions,
          directPermissions: req.user.permissions,
          userId: req.user.id,
          username: req.user.username
        })
        return res.status(403).json({
          code: 403,
          message: '用户权限信息不完整',
          data: {
            reason: 'INVALID_RBAC_PERMISSIONS',
            message: '用户RBAC权限数据格式错误或缺失'
          }
        })
      }

      console.log('🔐 RBAC检查:', {
        resource,
        action,
        userRole,
        permissions: permissions.length,
        username: req.user.username,
        userId: req.user.id
      })

      // 使用权限验证器检查RBAC权限
      const permissionKey = `${resource}:${action}`
      const hasPermission = PermissionValidator.hasRBACPermission(permissions, resource, action)

      // console.log('🔐 权限检查详情:', {
      //   permissionKey,
      //   hasExactPermission: permissions.includes(permissionKey),
      //   hasResourceWildcard: permissions.includes(`${resource}:*`),
      //   hasActionWildcard: permissions.includes(`*:${action}`),
      //   finalResult: hasPermission,
      //   allPermissions: permissions
      // })

      if (!hasPermission) {
        logger.warn(`权限被拒绝 - 用户: ${req.user.id}, 资源: ${resource}, 操作: ${action}`, {
          userId: req.user.id,
          username: req.user.username,
          resource,
          action,
          permissions
        })
        return res.status(403).json({
          code: 403,
          message: `无权限执行${action}操作`,
          data: {
            resource,
            action,
            required: permissionKey
          }
        })
      }

      console.log('✅ RBAC权限检查通过')
      next()
    } catch (error) {
      console.error('❌ RBAC检查失败:', error)
      logger.error('RBAC检查失败:', error)
      res.status(500).json({
        code: 500,
        message: '权限验证失败',
        data: null
      })
    }
  }
}

// 数据访问控制（基于部门/项目）
const dataAccessControl = (options = {}) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '用户未认证',
        data: null
      })
    }

    try {
      const { level = 'department', field = 'departmentId' } = options
      const userRole = req.user.Role?.name
      
      // 管理员和HR可以访问所有数据
      if (['admin', 'hr'].includes(userRole)) {
        return next()
      }

      // 根据访问级别限制数据
      switch (level) {
        case 'self':
          // 只能访问自己的数据
          if (req.params.id && req.params.id !== req.user.id.toString()) {
            return res.status(403).json({
              code: 403,
              message: '只能访问自己的数据',
              data: null
            })
          }
          break

        case 'department':
          // 只能访问同部门数据
          if (req.query[field] && req.query[field] !== req.user.departmentId?.toString()) {
            return res.status(403).json({
              code: 403,
              message: '只能访问本部门数据',
              data: null
            })
          }
          // 如果没有指定部门ID，自动添加用户部门限制
          if (!req.query[field] && req.user.departmentId) {
            req.query[field] = req.user.departmentId
          }
          break

        case 'manager':
          // 经理可以访问下属数据
          // 这里需要根据具体业务逻辑实现
          break
      }

      next()
    } catch (error) {
      logger.error('数据访问控制失败:', error)
      res.status(500).json({
        code: 500,
        message: '访问控制验证失败',
        data: null
      })
    }
  }
}

// 敏感操作二次验证
const sensitiveOperationAuth = () => {
  return async (req, res, next) => {
    const sensitiveActions = ['DELETE', 'PATCH']
    const sensitivePaths = ['/users/', '/bonus-allocation/', '/profit/']

    const isSensitive = sensitiveActions.includes(req.method) ||
                       sensitivePaths.some(path => req.path.includes(path))

    if (isSensitive) {
      const confirmationToken = req.header('X-Confirmation-Token')
      
      if (!confirmationToken) {
        return res.status(400).json({
          code: 400,
          message: '敏感操作需要确认令牌',
          data: { requireConfirmation: true }
        })
      }

      try {
        const decoded = jwt.verify(confirmationToken, process.env.JWT_SECRET)
        if (decoded.type !== 'confirmation' || decoded.userId !== req.user.id) {
          throw new Error('无效的确认令牌')
        }
      } catch (error) {
        return res.status(400).json({
          code: 400,
          message: '确认令牌无效或已过期',
          data: null
        })
      }
    }

    next()
  }
}

// API访问频率限制器
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100,
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options

  return rateLimit({
    windowMs,
    max,
    message: {
      code: 429,
      message,
      data: null
    },
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req) => {
      // 基于用户ID和IP的复合限制
      return req.user ? `${req.user.id}-${req.ip}` : req.ip
    }
  })
}

// 响应数据脱敏中间件
const maskSensitiveData = (maskConfig = []) => {
  return (req, res, next) => {
    const originalJson = res.json

    res.json = function(data) {
      if (data && data.data && maskConfig.length > 0) {
        const userRole = req.user?.Role?.name || 'user'
        data.data = dataMaskingService.maskData(data.data, maskConfig, userRole)
      }
      
      originalJson.call(this, data)
    }

    next()
  }
}

// 操作审计增强版本
const auditLogger = (options = {}) => {
  return (req, res, next) => {
    const startTime = Date.now()
    const originalSend = res.json

    // 记录请求信息
    const requestData = {
      userId: req.user?.id,
      username: req.user?.username,
      userRole: req.user?.Role?.name,
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      sessionId: req.sessionID,
      requestId: req.id || Math.random().toString(36).substring(7)
    }

    // 记录请求体（脱敏处理）
    if (req.body && Object.keys(req.body).length > 0) {
      requestData.requestBody = dataMaskingService.maskLogData(req.body)
    }

    res.json = function(data) {
      const responseTime = Date.now() - startTime
      
      // 记录响应信息
      const auditData = {
        ...requestData,
        statusCode: res.statusCode,
        responseTime,
        success: res.statusCode < 400
      }

      // 记录响应数据（成功时）
      if (res.statusCode < 400 && data && options.logResponseData) {
        auditData.responseData = dataMaskingService.maskLogData(data)
      }

      // 记录错误信息
      if (res.statusCode >= 400 && data) {
        auditData.error = data.message || data.error
      }

      // 异步记录日志
      setImmediate(() => {
        logger.info('API访问审计', auditData)
      })

      originalSend.call(this, data)
    }

    next()
  }
}

// 会话管理中间件
const sessionManagement = () => {
  return async (req, res, next) => {
    if (req.user) {
      // 检查会话是否有效
      const sessionKey = `session:${req.user.id}`
      // 这里可以结合Redis实现分布式会话管理
      
      // 更新最后活动时间
      req.user.lastActiveAt = new Date()
      // 可以异步更新数据库
    }
    
    next()
  }
}

module.exports = {
  authenticate,
  authenticateToken,
  authorize,
  logOperation,
  validateIPWhitelist,
  rbacCheck,
  dataAccessControl,
  sensitiveOperationAuth,
  createRateLimiter,
  maskSensitiveData,
  auditLogger,
  sessionManagement
}