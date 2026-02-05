const express = require('express')
const simulationController = require('../controllers/simulationController')
const { authenticate, authorize, logOperation } = require('../middlewares/auth')

const router = express.Router()

// 所有模拟分析路由都需要认证
router.use(authenticate)

// 参数模拟
router.post('/parameter-simulation', 
  authorize(['simulation:run']),
  logOperation('simulate', 'parameter'),
  (req, res, next) => simulationController.runParameterSimulation(req, res, next)
)

// 场景管理
router.post('/scenarios', 
  authorize(['simulation:create']),
  logOperation('create', 'scenario'),
  (req, res, next) => simulationController.saveScenario(req, res, next)
)

router.get('/scenarios', 
  authorize(['simulation:view']),
  (req, res, next) => simulationController.getScenarios(req, res, next)
)

router.delete('/scenarios/:id', 
  authorize(['simulation:delete']),
  logOperation('delete', 'scenario'),
  (req, res, next) => simulationController.deleteScenario(req, res, next)
)

// 敏感性分析
router.post('/sensitivity-analysis', 
  authorize(['simulation:analyze']),
  logOperation('analyze', 'sensitivity'),
  (req, res, next) => simulationController.runSensitivityAnalysis(req, res, next)
)

// 历史分析
router.get('/history-analysis', 
  authorize(['simulation:view']),
  (req, res, next) => simulationController.getHistoryAnalysis(req, res, next)
)

module.exports = router