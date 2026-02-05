const express = require('express')
const router = express.Router()
const projectPerformanceController = require('../controllers/projectPerformanceController')
const { authenticate } = require('../middlewares/auth')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

// 下载Excel模板
router.get('/pools/:poolId/template', 
  authenticate, 
  projectPerformanceController.downloadTemplate
)

// 上传Excel数据
router.post('/pools/:poolId/import', 
  authenticate, 
  upload.single('file'), 
  projectPerformanceController.uploadExcel
)

// 获取绩效数据列表
router.get('/pools/:poolId/data', 
  authenticate, 
  projectPerformanceController.getPerformanceData
)

// 创建/更新单条绩效记录
router.post('/records', 
  authenticate, 
  projectPerformanceController.createPerformanceRecord
)

// 基于手动数据计算奖金
router.post('/pools/:poolId/calculate', 
  authenticate, 
  projectPerformanceController.calculateBonus
)

module.exports = router
