const express = require('express')
const router = express.Router()
const improvementSuggestionsController = require('../controllers/improvementSuggestionsController')
const { authenticateToken, authorize, logOperation } = require('../middlewares/auth')

// 获取建议列表
router.get('/',
  authenticateToken,
  authorize(['improvement:view', 'admin']),
  (req, res, next) => improvementSuggestionsController.getSuggestions(req, res, next)
)

// 获取单个建议详情
router.get('/:id',
  authenticateToken,
  authorize(['improvement:view', 'admin']),
  (req, res, next) => improvementSuggestionsController.getSuggestionById(req, res, next)
)

// 创建建议
router.post('/',
  authenticateToken,
  authorize(['improvement:create', 'admin']),
  logOperation('create', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.createSuggestion(req, res, next)
)

// 更新建议
router.put('/:id',
  authenticateToken,
  authorize(['improvement:edit', 'admin']),
  logOperation('update', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.updateSuggestion(req, res, next)
)

// 删除建议
router.delete('/:id',
  authenticateToken,
  authorize(['improvement:delete', 'admin']),
  logOperation('delete', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.deleteSuggestion(req, res, next)
)

// 批量更新状态
router.post('/batch/status',
  authenticateToken,
  authorize(['improvement:edit', 'admin']),
  logOperation('batch_update', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.batchUpdateStatus(req, res, next)
)

// 获取员工建议统计
router.get('/stats/:employeeId',
  authenticateToken,
  authorize(['improvement:view', 'admin']),
  (req, res, next) => improvementSuggestionsController.getSuggestionStats(req, res, next)
)

// 员工提交实施完成
router.post('/:id/complete',
  authenticateToken,
  logOperation('complete', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.completeImplementation(req, res, next)
)

// 上级审核通过
router.post('/:id/approve',
  authenticateToken,
  authorize(['improvement:review', 'admin']),
  logOperation('approve', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.approveSuggestion(req, res, next)
)

// 上级审核拒绝
router.post('/:id/reject',
  authenticateToken,
  authorize(['improvement:review', 'admin']),
  logOperation('reject', 'improvement_suggestion'),
  (req, res, next) => improvementSuggestionsController.rejectSuggestion(req, res, next)
)

module.exports = router
