const express = require('express')
const router = express.Router()
const performanceRecordController = require('../controllers/performanceRecordController')
const { authenticate, authorize } = require('../middlewares/auth')

// ========== 绩效记录管理路由 ==========

// 获取绩效记录列表
router.get('/', 
  authenticate, 
  performanceRecordController.getPerformanceRecords
)

// 创建绩效记录
router.post('/', 
  authenticate, 
  authorize(['admin', 'hr', 'manager']), 
  performanceRecordController.createPerformanceRecord
)

// 更新绩效记录
router.put('/:id', 
  authenticate, 
  authorize(['admin', 'hr', 'manager']), 
  performanceRecordController.updatePerformanceRecord
)

// 删除绩效记录
router.delete('/:id', 
  authenticate, 
  authorize(['admin', 'hr']), 
  performanceRecordController.deletePerformanceRecord
)

// 批量导入绩效记录
router.post('/batch-import', 
  authenticate, 
  authorize(['admin', 'hr']), 
  performanceRecordController.batchImportRecords
)

// 获取绩效评级选项
router.get('/rating-options', 
  authenticate, 
  performanceRecordController.getRatingOptions
)

// 下载Excel模板
router.get('/template',
  authenticate,
  performanceRecordController.downloadTemplate
)

module.exports = router
