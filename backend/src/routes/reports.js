const express = require('express')
const reportsController = require('../controllers/reportsController')
const { authenticate, authorize, logOperation } = require('../middlewares/auth')

const router = express.Router()

// 所有报表路由都需要认证
router.use(authenticate)

// 获取报表列表
router.get('/', 
  authorize(['report:view']),
  (req, res, next) => reportsController.getReports(req, res, next)
)

// 创建报表
router.post('/', 
  authorize(['report:create', 'report:*']),
  logOperation('create', 'report'),
  (req, res, next) => reportsController.createReport(req, res, next)
)

// 删除报表
router.delete('/:id', 
  authorize(['report:delete', 'report:*']),
  logOperation('delete', 'report'),
  (req, res, next) => reportsController.deleteReport(req, res, next)
)

// 下载报表
router.get('/:id/download', 
  authorize(['report:view']),
  (req, res, next) => reportsController.downloadReport(req, res, next)
)

// 预览报表
router.get('/:id/preview', 
  authorize(['report:view']),
  (req, res, next) => reportsController.previewReport(req, res, next)
)

// 重新生成报表
router.post('/:id/regenerate', 
  authorize(['report:create', 'report:*']),
  logOperation('regenerate', 'report'),
  (req, res, next) => reportsController.regenerateReport(req, res, next)
)

// 获取报表模板
router.get('/templates', 
  authorize(['report:view']),
  (req, res, next) => reportsController.getReportTemplates(req, res, next)
)

// 使用模板创建报表
router.post('/templates/:templateId/generate', 
  authorize(['report:create', 'report:*']),
  logOperation('create', 'template_report'),
  (req, res, next) => reportsController.createReportFromTemplate(req, res, next)
)

// 查询个人奖金信息
router.get('/personal-bonus', 
  authorize(['report:personal', 'report:view', 'bonus:view']),
  (req, res, next) => reportsController.queryPersonalBonus(req, res, next)
)

// 导出个人奖金报告
router.post('/personal-bonus/export', 
  authorize(['report:export', 'report:*']),
  logOperation('export', 'personal_bonus'),
  (req, res, next) => reportsController.exportPersonalBonusReport(req, res, next)
)

// 获取员工历史奖金数据
router.get('/employees/:employeeId/bonus-history', 
  authorize(['report:view', 'bonus:view']),
  (req, res, next) => reportsController.getEmployeeBonusHistory(req, res, next)
)

// 获取员工绩效雷达图数据
router.get('/employees/:employeeId/performance-radar', 
  authorize(['report:view', 'employee:view']),
  (req, res, next) => reportsController.getEmployeePerformanceRadar(req, res, next)
)

module.exports = router