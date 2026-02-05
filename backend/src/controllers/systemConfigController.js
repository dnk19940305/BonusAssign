/**
 * 系统配置控制器
 * 处理系统配置相关的HTTP请求
 */

const systemConfigService = require('../services/systemConfigService')
const logger = require('../utils/logger')

/**
 * 获取所有系统配置
 */
const getAllConfigs = async (req, res) => {
  try {
    const { category, useCache = 'true' } = req.query

    const configs = await systemConfigService.getAllConfigs({
      category,
      useCache: useCache === 'true'
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: configs
    })
  } catch (error) {
    logger.error('获取系统配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取系统配置失败',
      error: error.message
    })
  }
}

/**
 * 获取单个配置
 */
const getConfig = async (req, res) => {
  try {
    const { category, key } = req.params

    const config = await systemConfigService.getConfig(category, key)

    if (!config) {
      return res.status(404).json({
        code: 404,
        message: '配置不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: config
    })
  } catch (error) {
    logger.error('获取配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取配置失败',
      error: error.message
    })
  }
}

/**
 * 获取分类配置
 */
const getConfigByCategory = async (req, res) => {
  try {
    const { category } = req.params

    const configs = await systemConfigService.getConfigByCategory(category)

    res.json({
      code: 200,
      message: '获取成功',
      data: configs
    })
  } catch (error) {
    logger.error('获取分类配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取分类配置失败',
      error: error.message
    })
  }
}

/**
 * 更新配置
 */
const updateConfig = async (req, res) => {
  try {
    const { category, key } = req.params
    const { value, changeReason } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      })
    }

    const result = await systemConfigService.updateConfig(
      category,
      key,
      value,
      userId,
      changeReason
    )

    res.json({
      code: 200,
      message: '更新成功',
      data: result
    })
  } catch (error) {
    logger.error('更新配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新配置失败',
      error: error.message
    })
  }
}

/**
 * 批量更新配置
 */
const updateConfigs = async (req, res) => {
  try {
    const { configs, changeReason } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      })
    }

    if (!configs || typeof configs !== 'object' || Array.isArray(configs) || configs === null) {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      })
    }

    // 额外检查对象是否为普通对象
    if (Object.prototype.toString.call(configs) !== '[object Object]') {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      })
    }

    const result = await systemConfigService.updateConfigs(
      configs,
      userId,
      changeReason
    )

    // 构建响应消息
    let message = '更新成功'
    if (result.failed > 0) {
      message = '部分更新失败'
    } else if (result.skipped > 0 && result.updated > 0) {
      message = `更新成功，跳过${result.skipped}个不可编辑字段`
    } else if (result.skipped > 0 && result.updated === 0) {
      message = '所有字段均不可编辑'
    }

    res.json({
      code: 200,
      message,
      data: result
    })
  } catch (error) {
    logger.error('批量更新配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '批量更新配置失败',
      error: error.message
    })
  }
}

/**
 * 重置配置
 */
const resetConfig = async (req, res) => {
  try {
    const { category, key } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      })
    }

    const result = await systemConfigService.resetConfig(category, key, userId)

    res.json({
      code: 200,
      message: '重置成功',
      data: result
    })
  } catch (error) {
    logger.error('重置配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '重置配置失败',
      error: error.message
    })
  }
}

/**
 * 重置所有配置
 */
const resetAllConfigs = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      })
    }

    const result = await systemConfigService.resetAllConfigs(userId)

    res.json({
      code: 200,
      message: '重置成功',
      data: result
    })
  } catch (error) {
    logger.error('重置所有配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '重置所有配置失败',
      error: error.message
    })
  }
}

/**
 * 获取配置历史
 */
const getConfigHistory = async (req, res) => {
  try {
    const { category, key, limit } = req.query

    const history = await systemConfigService.getConfigHistory({
      category,
      key,
      limit: limit ? parseInt(limit) : 100
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: history
    })
  } catch (error) {
    logger.error('获取配置历史失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取配置历史失败',
      error: error.message
    })
  }
}

/**
 * 导出配置
 */
const exportConfigs = async (req, res) => {
  try {
    const exportData = await systemConfigService.exportConfigs()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=system-configs-${Date.now()}.json`)

    res.json(exportData)
  } catch (error) {
    logger.error('导出配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '导出配置失败',
      error: error.message
    })
  }
}

/**
 * 导入配置
 */
const importConfigs = async (req, res) => {
  try {
    const importData = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权'
      })
    }

    const result = await systemConfigService.importConfigs(importData, userId)

    res.json({
      code: 200,
      message: '导入成功',
      data: result
    })
  } catch (error) {
    logger.error('导入配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '导入配置失败',
      error: error.message
    })
  }
}

/**
 * 验证配置
 */
const validateConfigs = async (req, res) => {
  try {
    const { configs } = req.body

    if (!configs || typeof configs !== 'object' || Array.isArray(configs) || configs === null) {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      })
    }
    
    // 额外检查对象是否为普通对象
    if (Object.prototype.toString.call(configs) !== '[object Object]') {
      return res.status(400).json({
        code: 400,
        message: '无效的配置数据'
      })
    }

    // 验证逻辑
    const errors = []

    // 验证奖金权重总和
    if (configs.bonus) {
      const { profitWeight, positionWeight, performanceWeight } = configs.bonus
      if (profitWeight !== undefined && positionWeight !== undefined && performanceWeight !== undefined) {
        const total = parseFloat(profitWeight) + parseFloat(positionWeight) + parseFloat(performanceWeight)
        if (Math.abs(total - 1) > 0.01) {
          errors.push({
            category: 'bonus',
            message: `三维权重总和必须为1,当前为${total.toFixed(2)}`
          })
        }
      }
    }

    res.json({
      code: 200,
      message: errors.length === 0 ? '验证通过' : '验证失败',
      data: {
        valid: errors.length === 0,
        errors
      }
    })
  } catch (error) {
    logger.error('验证配置失败:', error)
    res.status(500).json({
      code: 500,
      message: '验证配置失败',
      error: error.message
    })
  }
}

module.exports = {
  getAllConfigs,
  getConfig,
  getConfigByCategory,
  updateConfig,
  updateConfigs,
  resetConfig,
  resetAllConfigs,
  getConfigHistory,
  exportConfigs,
  importConfigs,
  validateConfigs
}
