const { Sequelize } = require('sequelize')
const logger = require('../utils/logger')
const MySQLManager = require('../database/mysql-manager')

// MySQL数据库配置)

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'bonus_system'
}

const databaseManager = new MySQLManager(mysqlConfig)

// 创建Sequelize兼容的MySQL对象
const sequelize = {
  async authenticate() {
    logger.info('正在连接MySQL数据库...')
    await databaseManager.initialize()
    return Promise.resolve()
  },

  async sync(options = {}) {
    logger.info('MySQL数据库连接已建立')
    return Promise.resolve()
  },

  async close() {
    logger.info('正在关闭MySQL连接...')
    if (databaseManager) {
      await databaseManager.close()
    }
    return Promise.resolve()
  },

  // 提供数据库管理器访问
  manager: databaseManager,

  // MySQL特有的方法
  async query(sql, options = {}) {
    return await databaseManager.query(sql, options.replacements || [])
  },

  async transaction(callback) {
    return await databaseManager.beginTransaction()
  }
}

module.exports = {
  sequelize,
  Sequelize,
  databaseManager
}