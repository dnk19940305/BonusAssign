/**
 * 系统配置服务
 * 提供系统配置的CRUD操作和缓存管理
 */

const { databaseManager } = require('../config/database')
const logger = require('../utils/logger')

class SystemConfigService {
  constructor() {
    this.configCache = new Map()
    this.cacheExpiry = 300000 // 5分钟缓存
    this.lastCacheTime = null
  }

  /**
   * 获取所有系统配置
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 按分类分组的配置对象
   */
  async getAllConfigs(options = {}) {
    try {
      const { useCache = true, category = null } = options

      // 检查缓存
      if (useCache && this.isCacheValid() && !category) {
        logger.debug('从缓存获取系统配置')
        return this.getCachedConfigs()
      }

      // 从数据库查询
      let sql = 'SELECT * FROM system_configs WHERE 1=1'
      const params = []

      if (category) {
        sql += ' AND category = ?'
        params.push(category)
      }

      sql += ' ORDER BY category, `key`'

      const configs = await databaseManager.query(sql, params)

      // 转换为分组对象
      const groupedConfigs = this.groupConfigsByCategory(configs)

      // 更新缓存
      if (!category) {
        this.updateCache(groupedConfigs)
      }

      return groupedConfigs
    } catch (error) {
      logger.error('获取系统配置失败:', error)
      throw error
    }
  }

  /**
   * 获取单个配置值
   * @param {String} category - 配置分类
   * @param {String} key - 配置键
   * @returns {Promise<any>} 配置值
   */
  async getConfig(category, key) {
    try {
      const sql = 'SELECT * FROM system_configs WHERE category = ? AND `key` = ?'
      const result = await databaseManager.query(sql, [category, key])

      if (!result || result.length === 0) {
        return null
      }

      return this.parseConfigValue(result[0])
    } catch (error) {
      logger.error(`获取配置失败 [${category}.${key}]:`, error)
      throw error
    }
  }

  /**
   * 获取分类下的所有配置
   * @param {String} category - 配置分类
   * @returns {Promise<Object>} 配置对象
   */
  async getConfigByCategory(category) {
    try {
      const configs = await this.getAllConfigs({ category })
      return configs[category] || {}
    } catch (error) {
      logger.error(`获取分类配置失败 [${category}]:`, error)
      throw error
    }
  }

  /**
   * 更新配置
   * @param {String} category - 配置分类
   * @param {String} key - 配置键
   * @param {any} value - 配置值
   * @param {Number} userId - 操作用户ID
   * @param {String} changeReason - 变更原因
   * @returns {Promise<Object>} 更新结果
   */
  async updateConfig(category, key, value, userId, changeReason = '') {
    try {
      // 获取原配置
      const oldConfig = await this.getConfig(category, key)
      if (!oldConfig) {
        throw new Error(`配置不存在: ${category}.${key}`)
      }

      // 检查是否可编辑
      if (!oldConfig.is_editable) {
        throw new Error(`配置不可编辑: ${category}.${key}`)
      }

      // 验证配置值
      await this.validateConfigValue(oldConfig, value)

      // 更新配置
      const sql = `
        UPDATE system_configs 
        SET value = ?, updated_by = ?, updated_at = NOW()
        WHERE category = ? AND \`key\` = ?
      `
      await databaseManager.query(sql, [
        this.stringifyConfigValue(value, oldConfig.value_type),
        userId,
        category,
        key
      ])

      // 记录变更历史
      await this.recordConfigHistory(
        oldConfig.id,
        category,
        key,
        oldConfig.value,
        this.stringifyConfigValue(value, oldConfig.value_type),
        userId,
        changeReason
      )

      // 清除缓存
      this.clearCache()

      logger.info(`配置已更新: ${category}.${key} by user ${userId}`)

      return { success: true, category, key, value }
    } catch (error) {
      logger.error(`更新配置失败 [${category}.${key}]:`, error)
      throw error
    }
  }

  /**
   * 批量更新配置
   * @param {Object} configs - 配置对象 { category: { key: value } }
   * @param {Number} userId - 操作用户ID
   * @param {String} changeReason - 变更原因
   * @returns {Promise<Object>} 更新结果
   */
  async updateConfigs(configs, userId, changeReason = '') {
    try {
      const results = []
      const errors = []
      const skipped = []

      for (const [category, categoryConfigs] of Object.entries(configs)) {
        for (const [key, value] of Object.entries(categoryConfigs)) {
          try {
            await this.updateConfig(category, key, value, userId, changeReason)
            results.push({ category, key, success: true })
          } catch (error) {
            // 区分不可编辑字段和真正的错误
            if (error.message.includes('不可编辑') || error.message.includes('not editable')) {
              skipped.push({ category, key, reason: '不可编辑' })
              logger.debug(`跳过不可编辑配置: ${category}.${key}`)
            } else {
              errors.push({ category, key, error: error.message })
              logger.error(`更新配置失败 [${category}.${key}]:`, error.message)
            }
          }
        }
      }

      return {
        success: errors.length === 0,
        updated: results.length,
        failed: errors.length,
        skipped: skipped.length,
        results,
        errors,
        skippedFields: skipped
      }
    } catch (error) {
      logger.error('批量更新配置失败:', error)
      throw error
    }
  }

  /**
   * 重置配置到默认值
   * @param {String} category - 配置分类
   * @param {String} key - 配置键
   * @param {Number} userId - 操作用户ID
   * @returns {Promise<Object>} 重置结果
   */
  async resetConfig(category, key, userId) {
    try {
      const sql = `
        UPDATE system_configs 
        SET value = default_value, updated_by = ?, updated_at = NOW()
        WHERE category = ? AND \`key\` = ?
      `
      await databaseManager.query(sql, [userId, category, key])

      this.clearCache()

      logger.info(`配置已重置: ${category}.${key}`)

      return { success: true, category, key }
    } catch (error) {
      logger.error(`重置配置失败 [${category}.${key}]:`, error)
      throw error
    }
  }

  /**
   * 重置所有配置到默认值
   * @param {Number} userId - 操作用户ID
   * @returns {Promise<Object>} 重置结果
   */
  async resetAllConfigs(userId) {
    try {
      const sql = `
        UPDATE system_configs 
        SET value = default_value, updated_by = ?, updated_at = NOW()
        WHERE is_editable = 1
      `
      const result = await databaseManager.query(sql, [userId])

      this.clearCache()

      logger.info(`所有配置已重置 by user ${userId}`)

      return { success: true, affectedRows: result.affectedRows }
    } catch (error) {
      logger.error('重置所有配置失败:', error)
      throw error
    }
  }

  /**
   * 获取配置变更历史
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 历史记录
   */
  async getConfigHistory(options = {}) {
    try {
      const { category, key, limit = 100 } = options

      let sql = `
        SELECT h.*, u.username as changed_by_name
        FROM system_config_history h
        LEFT JOIN users u ON h.changed_by = u.id
        WHERE 1=1
      `
      const params = []

      if (category) {
        sql += ' AND h.category = ?'
        params.push(category)
      }

      if (key) {
        sql += ' AND h.key = ?'
        params.push(key)
      }

      sql += ' ORDER BY h.changed_at DESC LIMIT ?'
      params.push(limit)

      const history = await databaseManager.query(sql, params)

      return history
    } catch (error) {
      logger.error('获取配置历史失败:', error)
      throw error
    }
  }

  /**
   * 导出配置
   * @returns {Promise<Object>} 配置JSON对象
   */
  async exportConfigs() {
    try {
      const configs = await this.getAllConfigs({ useCache: false })

      const exportData = {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        configs
      }

      return exportData
    } catch (error) {
      logger.error('导出配置失败:', error)
      throw error
    }
  }

  /**
   * 导入配置
   * @param {Object} importData - 导入的配置数据
   * @param {Number} userId - 操作用户ID
   * @returns {Promise<Object>} 导入结果
   */
  async importConfigs(importData, userId) {
    try {
      if (!importData.configs || typeof importData.configs !== 'object' || Array.isArray(importData.configs)) {
        throw new Error('无效的配置数据格式')
      }

      const result = await this.updateConfigs(importData.configs, userId, '配置导入')

      return result
    } catch (error) {
      logger.error('导入配置失败:', error)
      throw error
    }
  }

  /**
   * 验证配置值
   * @private
   */
  async validateConfigValue(config, value) {
    const { value_type, validation_rule } = config

    // 类型验证
    switch (value_type) {
      case 'number':
        if (typeof value === 'string') {
          // 如果是字符串，尝试转换为数字
          if (isNaN(parseFloat(value))) {
            throw new Error('配置值必须是数字')
          }
        } else if (typeof value !== 'number') {
          throw new Error('配置值必须是数字')
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          throw new Error('配置值必须是布尔值')
        }
        break
      case 'json':
        try {
          // 如果已经是对象，直接转换为JSON字符串再解析
          const jsonStr = typeof value === 'string' ? value : JSON.stringify(value)
          JSON.parse(jsonStr)
        } catch (e) {
          throw new Error('配置值必须是有效的JSON格式')
        }
        break
      case 'string':
        if (typeof value !== 'string' && value !== null && value !== undefined) {
          throw new Error('配置值必须是字符串')
        }
        break
    }

    // 自定义验证规则
    if (validation_rule) {
      try {
        const rule = typeof validation_rule === 'string' ? JSON.parse(validation_rule) : validation_rule

        if (value_type === 'number' || typeof value === 'number' || !isNaN(parseFloat(value))) {
          const numValue = parseFloat(value)
          if (rule.min !== undefined && numValue < rule.min) {
            throw new Error(`配置值不能小于 ${rule.min}`)
          }

          if (rule.max !== undefined && numValue > rule.max) {
            throw new Error(`配置值不能大于 ${rule.max}`)
          }
        }
      } catch (parseError) {
        // 如果验证规则无法解析，跳过验证规则检查
        logger.warn('配置验证规则解析失败，跳过自定义验证:', parseError.message)
      }
    }

    return true
  }

  /**
   * 记录配置变更历史
   * @private
   */
  async recordConfigHistory(configId, category, key, oldValue, newValue, userId, reason) {
    try {
      const sql = `
        INSERT INTO system_config_history 
        (config_id, category, \`key\`, old_value, new_value, changed_by, change_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      await databaseManager.query(sql, [configId, category, key, oldValue, newValue, userId, reason])
    } catch (error) {
      logger.error('记录配置历史失败:', error)
      // 不抛出错误,避免影响主流程
    }
  }

  /**
   * 解析配置值
   * @private
   */
  parseConfigValue(config) {
    const { value, value_type } = config

    let parsedValue = value
    switch (value_type) {
      case 'number':
        parsedValue = parseFloat(value)
        break
      case 'boolean':
        parsedValue = value === 'true' || value === true
        break
      case 'json':
        try {
          parsedValue = typeof value === 'string' ? JSON.parse(value) : value
        } catch (e) {
          parsedValue = value
        }
        break
    }

    return {
      ...config,
      parsedValue
    }
  }

  /**
   * 配置值转字符串
   * @private
   */
  stringifyConfigValue(value, valueType) {
    if (valueType === 'json') {
      return typeof value === 'string' ? value : JSON.stringify(value)
    }
    return String(value)
  }

  /**
   * 按分类分组配置
   * @private
   */
  groupConfigsByCategory(configs) {
    const grouped = {}

    configs.forEach(config => {
      const { category } = config
      if (!grouped[category]) {
        grouped[category] = {}
      }

      const parsed = this.parseConfigValue(config)
      grouped[category][config.key] = parsed.parsedValue
    })

    return grouped
  }

  /**
   * 缓存管理
   * @private
   */
  isCacheValid() {
    if (!this.lastCacheTime) return false
    return Date.now() - this.lastCacheTime < this.cacheExpiry
  }

  getCachedConfigs() {
    return this.configCache.get('all_configs')
  }

  updateCache(configs) {
    this.configCache.set('all_configs', configs)
    this.lastCacheTime = Date.now()
  }

  clearCache() {
    this.configCache.clear()
    this.lastCacheTime = null
    logger.debug('配置缓存已清除')
  }
}

module.exports = new SystemConfigService()
