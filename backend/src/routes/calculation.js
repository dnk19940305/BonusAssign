const express = require('express')
const { calculationController } = require('../controllers')
const { authenticate, authorize, logOperation } = require('../middlewares/auth')

const router = express.Router()

// 所有计算路由都需要认证
router.use(authenticate)

// 奖金池管理
router.post('/bonus-pools', 
  authorize(['calculation:create']),
  logOperation('create', 'bonus_pool'),
  calculationController.createBonusPool.bind(calculationController)
)

router.get('/bonus-pools', 
  authorize(['calculation:read']),
  calculationController.getBonusPools.bind(calculationController)
)

router.get('/bonus-pools/:id', 
  authorize(['calculation:read']),
  calculationController.getBonusPoolDetail.bind(calculationController)
)

router.put('/bonus-pools/:id', 
  authorize(['calculation:update']),
  logOperation('update', 'bonus_pool'),
  calculationController.updateBonusPool.bind(calculationController)
)

router.delete('/bonus-pools/:id', 
  authorize(['calculation:delete']),
  logOperation('delete', 'bonus_pool'),
  calculationController.deleteBonusPool.bind(calculationController)
)

// 奖金计算
router.post('/bonus-calculations', 
  authorize(['calculation:execute']),
  logOperation('calculate', 'bonus'),
  calculationController.calculate.bind(calculationController)
)

// 验证绩效数据
router.get('/bonus-calculations/validate-performance', 
  authorize(['calculation:read']),
  calculationController.validatePerformanceData.bind(calculationController)
)

router.get('/bonus-calculations/:taskId', 
  authorize(['calculation:read']),
  calculationController.getResult.bind(calculationController)
)

router.post('/bonus-calculations/simulate', 
  authorize(['calculation:simulate']),
  calculationController.simulate.bind(calculationController)
)

// 统计和导出
router.get('/bonus-calculations/statistics', 
  authorize(['calculation:read']),
  calculationController.getStatistics.bind(calculationController)
)

router.get('/bonus-pools/:id/export', 
  authorize(['calculation:export']),
  logOperation('export', 'bonus_pool_result'),
  calculationController.exportBonusPoolResult.bind(calculationController)
)

// 复制奖金池
router.post('/bonus-pools/:id/copy', 
  authorize(['calculation:create']),
  logOperation('copy', 'bonus_pool'),
  calculationController.copyBonusPool.bind(calculationController)
)

// 获取可分配员工列表
router.get('/bonus-pools/:id/eligible-employees', 
  authorize(['calculation:read']),
  calculationController.getEligibleEmployees.bind(calculationController)
)

// 预览计算结果
router.post('/bonus-calculations/preview', 
  authorize(['calculation:simulate']),
  calculationController.previewCalculation.bind(calculationController)
)

// 获取奖金池的计算结果
router.get('/bonus-pools/:id/calculations', 
  authorize(['calculation:read']),
  calculationController.getBonusPoolCalculations.bind(calculationController)
)

// 发放奖金
router.post('/bonus-pools/:id/payment', 
  authorize(['calculation:payment', 'admin']),
  logOperation('payment', 'bonus_pool'),
  calculationController.payBonusPool.bind(calculationController)
)

module.exports = router