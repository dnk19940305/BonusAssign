/**
 * 岗位基准值调整路由
 */

const express = require('express');
const router = express.Router();
const positionBenchmarkController = require('../controllers/positionBenchmarkController');
// const { authenticate } = require('../middlewares/authMiddleware');
const { authenticateToken } = require('../middlewares/auth')
// 所有路由都需要认证
router.use(authenticateToken);

/**
 * @route POST /api/positions/benchmark/adjustment
 * @desc 申请岗位基准值调整
 * @access Private
 */
router.post('/adjustment', positionBenchmarkController.requestAdjustment);

/**
 * @route POST /api/positions/benchmark/adjustment/:id/approve
 * @desc 审批岗位基准值调整
 * @access Private (需要审批权限)
 */
router.post('/adjustment/:id/approve', positionBenchmarkController.approveAdjustment);

/**
 * @route GET /api/positions/benchmark/adjustments
 * @desc 获取调整申请列表
 * @access Private
 */
router.get('/adjustments', positionBenchmarkController.getAdjustments);

/**
 * @route GET /api/positions/:id/benchmark/history
 * @desc 获取岗位调整历史
 * @access Private
 */
router.get('/:id/history', positionBenchmarkController.getPositionHistory);

/**
 * @route POST /api/positions/benchmark/batch-adjust
 * @desc 批量调整岗位基准值
 * @access Private (需要高级权限)
 */
router.post('/batch-adjust', positionBenchmarkController.batchAdjust);

module.exports = router;
