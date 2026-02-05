const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const net = require('net')

// 根据环境加载对应的配置文件
let envFile;
if (process.env.NODE_ENV === 'development') {
  envFile = 'env.development';
} else if (process.env.NODE_ENV === 'production') {
  envFile = 'env.production';
} else {
  envFile = '.env';
}
const envPath = path.join(__dirname, '..', envFile);


// 检查文件是否存在并加载环境变量
if (!fs.existsSync(envPath)) {
  console.warn('⚠️ 环境文件不存在，回退到默认.env文件')
  const fallbackPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(fallbackPath)) {
    require('dotenv').config({ path: fallbackPath })
  } else {
    console.error('❌ 找不到任何环境配置文件')
  }
} else {
  require('dotenv').config({ path: envPath })
}

// 验证关键环境变量并提供后备方案
if (!process.env.JWT_SECRET) {
  console.error('❌ 错误: JWT_SECRET 环境变量未设置!')
  console.error('尝试加载的配置文件:', envPath)
  console.error('当前环境变量 NODE_ENV:', process.env.NODE_ENV)
  
  // 使用后备方案避免系统崩溃
  if (process.env.NODE_ENV === 'development') {
    process.env.JWT_SECRET = 'dev-fallback-jwt-secret-key-2024'
    process.env.JWT_REFRESH_SECRET = 'dev-fallback-refresh-secret-key-2024'
    process.env.JWT_EXPIRES_IN = '2h'
    process.env.JWT_REFRESH_EXPIRES_IN = '7d'
    console.warn('⚠️ 开发环境：使用后备JWT密钥')
  } else {
    console.error('❌ 生产环境必须设置JWT_SECRET!')
    process.exit(1)
  }
}


const logger = require('./utils/logger')
const errorHandler = require('./middlewares/error')

// 数据库服务延迟加载
let databaseService = null

// 延迟加载路由模块函数
function loadRoutes() {
  return {
    authRoutes: require('./routes/auth'),
    userRoutes: require('./routes/user'),
    roleRoutes: require('./routes/roles'),
    employeeRoutes: require('./routes/employee'),
    departmentRoutes: require('./routes/departments'),
    positionRoutes: require('./routes/positions'),
    businessLineRoutes: require('./routes/businessLines'),
    projectRoutes: require('./routes/projects'),
    calculationRoutes: require('./routes/calculation'),
    simulationRoutes: require('./routes/simulation'),
    profitRoutes: require('./routes/profitRoutes'),
    positionValueRoutes: require('./routes/positionValueRoutes'),
    performanceRoutes: require('./routes/performanceRoutes'),
    performanceRecordRoutes: require('./routes/performanceRecordRoutes'),
    threeDimensionalRoutes: require('./routes/threeDimensionalRoutes'),
    bonusAllocationRoutes: require('./routes/bonusAllocationRoutes'),
    dataImportExportRoutes: require('./routes/dataImportExportRoutes'),
    personalBonusRoutes: require('./routes/personalBonus'),
    bonusRoutes: require('./routes/bonus'),
    projectCollaborationRoutes: require('./routes/projectCollaboration'),
    permissionDelegationRoutes: require('./routes/permissionDelegation'),
    projectCostRoutes: require('./routes/projectCosts'),
    positionRequirementRoutes: require('./routes/positionRequirements'),
    projectMembersRoutes: require('./routes/projectMembers'),
    projectRolesRoutes: require('./routes/projectRoles'),
    projectBonusRoutes: require('./routes/projectBonus'),
    roleWeightTemplateRoutes: require('./routes/roleWeightTemplateRoutes'),
    milestoneRoutes: require('./routes/milestone'),
    milestoneTemplateRoutes: require('./routes/milestoneTemplate'),
    milestoneReminderRoutes: require('./routes/milestoneReminder'),
    milestoneImpactRoutes: require('./routes/milestoneImpact'),
    milestoneStatisticsRoutes: require('./routes/milestoneStatistics'),
    milestoneCollaborationRoutes: require('./routes/milestoneCollaboration'),
    milestoneBonusRoutes: require('./routes/milestoneBonus'),
    notificationRoutes: require('./routes/notifications'),
    reportsRoutes: require('./routes/reports'),
    dashboardRoutes: require('./routes/dashboard'),
    healthRoutes: require('./routes/health'),
    positionBenchmarkRoutes: require('./routes/positionBenchmark'),
    systemConfigRoutes: require('./routes/systemConfig'),
    positionCategoryRoutes: require('./routes/positionCategories'),
    skillTagRoutes: require('./routes/skillTags'),
    careerPathTemplateRoutes: require('./routes/careerPathTemplates'),
    projectPerformanceRoutes: require('./routes/projectPerformance'),
    improvementSuggestionsRoutes: require('./routes/improvementSuggestions'),
    menuRoutes: require('./routes/menus'),
    cityRoutes: require('./routes/cities')
  }
}

const app = express()
const PORT = process.env.PORT || 3000

// 端口可用性检查与回退
async function findAvailablePort(preferredPort, maxTries = 5) {
  return new Promise((resolve) => {
    const tryPort = (port, triesLeft) => {
      const tester = net.createServer()
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            if (triesLeft > 0) {
              tryPort(port + 1, triesLeft - 1)
            } else {
              resolve(null)
            }
          } else {
            resolve(null)
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(port))
        })
      tester.listen(Number(port), '0.0.0.0')
    }
    tryPort(Number(preferredPort), Number(maxTries))
  })
}

// 中间件配置
app.use(helmet())
app.use(cors({
  //origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  origin: '*',
  credentials: true
}))

// 限流配置（已禁用）
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15分钟
//   max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 生产环境100次，开发环境1000次
//   message: '请求过于频繁，请稍后再试',
//   standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` headers 中
//   legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
// })
// app.use('/api/', limiter)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// 路由配置函数 - 在NeDB初始化后调用
function setupRoutes(routes) {
  app.use('/api/auth', routes.authRoutes)
  app.use('/api/users', routes.userRoutes)
  app.use('/api/roles', routes.roleRoutes)
  app.use('/api/employees', routes.employeeRoutes)
  app.use('/api/departments', routes.departmentRoutes)
  app.use('/api/positions', routes.positionRoutes)
  app.use('/api/business-lines', routes.businessLineRoutes)
  app.use('/api/projects', routes.projectRoutes)
  app.use('/api/project-members', routes.projectMembersRoutes)
  app.use('/api/project-roles', routes.projectRolesRoutes)
  app.use('/api/project-bonus', routes.projectBonusRoutes)
  app.use('/api/role-weight-templates', routes.roleWeightTemplateRoutes)
  app.use('/api', routes.milestoneRoutes)
  app.use('/api/milestone-templates', routes.milestoneTemplateRoutes)
  app.use('/api/milestone-reminders', routes.milestoneReminderRoutes)
  app.use('/api/milestone-impact', routes.milestoneImpactRoutes)
  app.use('/api/milestone-stats', routes.milestoneStatisticsRoutes)
  app.use('/api/milestone-collaboration', routes.milestoneCollaborationRoutes)
  app.use('/api/milestone-bonus', routes.milestoneBonusRoutes)
  app.use('/api/notifications', routes.notificationRoutes)
  app.use('/api/calculations', routes.calculationRoutes)
  app.use('/api/simulations', routes.simulationRoutes)
  app.use('/api/profit', routes.profitRoutes)
  app.use('/api/position-value', routes.positionValueRoutes)
  app.use('/api/performance', routes.performanceRoutes)
  app.use('/api/performance-records', routes.performanceRecordRoutes)
  app.use('/api/three-dimensional', routes.threeDimensionalRoutes)
  app.use('/api/bonus-allocation', routes.bonusAllocationRoutes)
  app.use('/api/data', routes.dataImportExportRoutes)
  app.use('/api/personal-bonus', routes.personalBonusRoutes)
  app.use('/api/bonus', routes.bonusRoutes)
  app.use('/api/project-collaboration', routes.projectCollaborationRoutes)
  app.use('/api/permission-delegation', routes.permissionDelegationRoutes)
  app.use('/api/project-costs', routes.projectCostRoutes)
  app.use('/api/position-requirements', routes.positionRequirementRoutes)
  app.use('/api/reports', routes.reportsRoutes)
  app.use('/api/dashboard', routes.dashboardRoutes)
  app.use('/api', routes.healthRoutes)
  app.use('/api/positions/benchmark', routes.positionBenchmarkRoutes)
  app.use('/api/project-performance', routes.projectPerformanceRoutes)
  app.use('/api/system', routes.systemConfigRoutes)
  app.use('/api/position-categories', routes.positionCategoryRoutes)
  app.use('/api/skill-tags', routes.skillTagRoutes)
  app.use('/api/career-path-templates', routes.careerPathTemplateRoutes)
  app.use('/api/improvement-suggestions', routes.improvementSuggestionsRoutes)
  app.use('/api/menus', routes.menuRoutes)
  app.use('/api/cities', routes.cityRoutes)
  console.log('✅ API路由配置完成')
}

// Swagger API文档
if (process.env.NODE_ENV !== 'production') {
  try {
    const swaggerUi = require('swagger-ui-express')
    const swaggerSpec = require('./docs/swagger')
    
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    logger.info('Swagger文档已启用: http://localhost:' + PORT + '/api/docs')
  } catch (error) {
    logger.warn('Swagger文档加载失败:', error.message)
  }
}

// 错误处理中间件
app.use(errorHandler)

// 启动服务器
async function startServer() {
  try {
    
    // 初始化MySQL数据库服务
    console.log('🔄 开始初始化MySQL数据库服务...')
      
      if (!databaseService) {
        databaseService = require('./services/databaseService')
      }
      
      let retryCount = 0
      const maxRetries = 5
      const retryDelay = 2000 // 2秒
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 尝试初始化MySQL数据库服务 (${retryCount + 1}/${maxRetries})...`)
          
          await databaseService.initialize()
          
          if (!databaseService.isInitialized) {
            throw new Error('MySQL数据库服务初始化状态验证失败')
          }
          
          logger.info('✅ MySQL数据库服务初始化成功')
          global.databaseService = databaseService
          break
          
        } catch (initError) {
          retryCount++
          const errorMsg = initError.message || initError.toString()
          console.error(`❌ MySQL初始化失败 (尝试 ${retryCount}/${maxRetries}): ${errorMsg}`)
          logger.error(`MySQL初始化失败 (尝试 ${retryCount}/${maxRetries}):`, initError)
          
          if (retryCount >= maxRetries) {
            throw new Error(`MySQL初始化失败，已尝试 ${maxRetries} 次: ${errorMsg}`)
          }
          
          const delay = retryDelay * retryCount
          console.log(`⏱️ 等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      // 设置全局数据库服务引用，供其他模块使用
      global.databaseService = databaseService
    
    const routes = loadRoutes()
    setupRoutes(routes)
    
    // 启动 HTTP 服务器（禁用端口自动切换）
    const portToUse = PORT
    const server = app.listen(portToUse, '0.0.0.0', () => {
      logger.info(`🚀 服务器启动成功，端口: ${portToUse}`)
      logger.info(`🌐 服务器地址: http://localhost:${portToUse}`)
      
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`📚 API文档地址: http://localhost:${portToUse}/api/docs`)
      }
      
      // 异步获取数据库统计信息，不阻塞启动流程
      setImmediate(async () => {
        try {
          logger.info(`📊 获取数据库统计信息...`)
          
          let stats
          if (global.databaseService) {
            stats = await global.databaseService.getDatabaseStats()
          }
          
          if (stats) {
            logger.info(`📊 数据库统计信息 (mysql):`, stats)
          }
        } catch (err) {
          logger.warn('获取数据库统计信息失败:', err.message)
        }
      })
      
      // 启动里程碑提醒定时任务
      try {
        const reminderJob = require('./jobs/milestoneReminderJob')
        reminderJob.startReminderJob()
      } catch (err) {
        logger.warn('启动里程碑提醒定时任务失败:', err.message)
      }
    })
    
    // 设置服务器超时时间，避免长时间连接挂起
    server.timeout = 30000 // 30秒
    
    // 记录服务器实例用于后续清理
    global.httpServer = server
    
    // 设置服务器错误监听
    server.on('error', (error) => {
      console.error('❌ 服务器错误:', error)
      logger.error('Server error:', error)
      
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${portToUse} 已被占用，请停止占用该端口的进程或修改 .env 文件中的 PORT 配置`)
        console.error(`💡 提示: 在 Windows 上可以使用命令查找占用进程: netstat -ano | findstr :${portToUse}`)
        process.exit(1)
      }
    })
    
    // 保存服务器实例供优雅关闭使用
    global.httpServer = server
    
  } catch (error) {
    const errorMsg = error.message || error.toString()
    console.error('❌ 服务器启动失败:', errorMsg)
    console.error('详细错误信息:', error)
    logger.error('Server startup failed:', error)
    
    // 清理资源
    if (databaseService && typeof databaseService.close === 'function') {
      try {
        await databaseService.close()
      } catch (closeError) {
        console.error('数据库服务关闭失败:', closeError.message)
      }
    }
    
    process.exit(1)
  }
}

// 优雅关闭函数
async function gracefulShutdown(signal) {
  console.log(`\n收到 ${signal} 信号，开始优雅关闭服务器...`)
  logger.info(`收到 ${signal} 信号，正在关闭服务器...`)

  // 设置超时机制，防止关闭过程无限期挂起
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      console.log('⏰ 优雅关闭超时，强制退出...')
      logger.warn('Graceful shutdown timeout, forcing exit...')
      process.exit(1)
    }, 10000) // 10秒超时
  })

  const shutdownPromise = (async () => {
    try {
      // 停止接受新连接
      if (global.httpServer) {
        console.log('🔄 关闭 HTTP 服务器...')
        await new Promise((resolve, reject) => {
          global.httpServer.close((err) => {
            if (err) {
              console.error('关闭 HTTP 服务器时出错:', err.message)
              reject(err)
            } else {
              console.log('✅ HTTP 服务器已关闭')
              resolve()
            }
          })
        })
      }

      // 停止性能监控
      try {
        const { performanceMonitor } = require('./middlewares/performanceMonitor')
        performanceMonitor.stop()
        console.log('✅ 性能监控已停止')
      } catch (err) {
        console.log('停止性能监控失败:', err.message)
      }

      // 停止定时任务
      try {
        const reminderJob = require('./jobs/milestoneReminderJob')
        reminderJob.stopReminderJob()
        console.log('✅ 定时任务已停止')
      } catch (err) {
        console.log('停止定时任务失败:', err.message)
      }

      // 关闭数据库连接
      if (global.databaseService && typeof global.databaseService.close === 'function') {
        console.log('🔄 关闭数据库连接...')
        await global.databaseService.close()
        console.log('✅ 数据库连接已关闭')
      }
      
      console.log('✅ 服务器优雅关闭完成')
      logger.info('服务器优雅关闭完成')
      
      // 清除全局引用
      delete global.httpServer
      delete global.databaseService
      
      process.exit(0)
      
    } catch (error) {
      console.error('❌ 优雅关闭过程中发生错误:', error.message)
      logger.error('Graceful shutdown error:', error)
      process.exit(1)
    }
  })()
  
  // 等待关闭操作完成或超时
  await Promise.race([shutdownPromise, timeoutPromise])
}

// 优雅关闭
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
// process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 未处理的异常捕获
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error)
  logger.error('未捕获的异常:', error)
  
  // 尝试清理资源
  try {
    if (global.httpServer) {
      global.httpServer.close(() => {
        console.log('✅ 服务器在异常时已关闭')
      })
    }
    
    if (global.databaseService && typeof global.databaseService.close === 'function') {
      global.databaseService.close()
    }
  } catch (cleanupError) {
    console.error('异常清理过程出错:', cleanupError)
  }
  
  // 给予一些时间来记录日志，然后退出
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝 at:', promise, 'reason:', reason)
  logger.error('未处理的 Promise 拒绝:', { reason, promise })
  
  // 尝试清理资源
  try {
    if (global.httpServer) {
      global.httpServer.close(() => {
        console.log('✅ 服务器在未处理Promise拒绝时已关闭')
      })
    }
    
    if (global.databaseService && typeof global.databaseService.close === 'function') {
      global.databaseService.close()
    }
  } catch (cleanupError) {
    console.error('异常清理过程出错:', cleanupError)
  }
  
  // 给予一些时间来记录日志，然后退出
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})

// 内存警告
process.on('warning', (warning) => {
  console.warn('⚠️ Node.js 警告:', warning.name, warning.message)
  logger.warn('Node.js warning:', warning)
})

// 启动服务器
setImmediate(() => {
  startServer().catch((error) => {
    console.error('❌ 启动服务器时发生未捕获的错误:', error)
    logger.error('Uncaught server startup error:', error)
    process.exit(1)
  })
})

module.exports = app