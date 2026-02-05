/**
 * 系统配置路由
 */

const express = require('express')
const router = express.Router()
const systemConfigController = require('../controllers/systemConfigController')
const { authenticateToken, authorize } = require('../middlewares/auth')

// 所有路由都需要认证
router.use(authenticateToken)

// 导出配置 (必须在 /configs 之前)
router.get(
  '/configs/export',
  authorize(['system:config']),
  systemConfigController.exportConfigs
)

// 重置所有配置 (必须在 /configs 之前)
router.post(
  '/configs/reset',
  authorize(['system:config']),
  systemConfigController.resetAllConfigs
)

// 验证配置 (必须在 /configs 之前)
router.post(
  '/configs/validate',
  authorize(['system:config']),
  systemConfigController.validateConfigs
)

// 导入配置 (必须在 /configs 之前)
router.post(
  '/configs/import',
  authorize(['system:config']),
  systemConfigController.importConfigs
)

// 获取配置历史
router.get(
  '/config-history',
  authorize(['system:config']),
  systemConfigController.getConfigHistory
)

// 获取所有配置 (需要查看权限)
router.get(
  '/configs',
  authorize(['system:config']),
  systemConfigController.getAllConfigs
)

// 批量更新配置
router.put(
  '/configs/batch',
  authorize(['system:config']),
  systemConfigController.updateConfigs
)

// 获取分类配置
router.get(
  '/configs/:category',
  authorize(['system:config']),
  systemConfigController.getConfigByCategory
)

// 重置单个配置
router.post(
  '/configs/:category/:key/reset',
  authorize(['system:config']),
  systemConfigController.resetConfig
)

// 获取单个配置
router.get(
  '/configs/:category/:key',
  authorize(['system:config']),
  systemConfigController.getConfig
)

// 更新单个配置 (需要配置权限)
router.put(
  '/configs/:category/:key',
  authorize(['system:config']),
  systemConfigController.updateConfig
)

module.exports = router
