/**
 * 岗位基准值调整管理控制器
 * 实现基准值调整申请、审批、历史查询等功能
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const databaseService = require('../services/databaseService');

class PositionBenchmarkController {

  /**
   * 申请岗位基准值调整
   * POST /api/positions/benchmark/adjustment
   */
  async requestAdjustment(req, res, next) {
    try {
      const userId = req.user.id;
      const { positionId, newValue, reason } = req.body;

      // 验证必填字段
      if (!positionId || !newValue || !reason) {
        return res.status(400).json({
          code: 400,
          message: '缺少必填字段：positionId, newValue, reason',
          data: null
        });
      }

      // 验证新值范围
      if (newValue < 0.1 || newValue > 3.0) {
        return res.status(400).json({
          code: 400,
          message: '基准值必须在 0.1-3.0 之间',
          data: null
        });
      }

      const dataService = databaseService;

      // 获取岗位当前基准值
      const position = await dataService.findByPk('positions', positionId);
      if (!position) {
        return res.status(404).json({
          code: 404,
          message: '岗位不存在',
          data: null
        });
      }

      const oldValue = parseFloat(position.benchmarkValue || position.benchmark_value || 1.0);
      const changeRatio = ((newValue - oldValue) / oldValue * 100).toFixed(2);

      // 验证调整幅度限制
      const absChangeRatio = Math.abs(changeRatio);
      if (absChangeRatio > 20) {
        return res.status(400).json({
          code: 400,
          message: `单次调整幅度不能超过±20%，当前调整幅度为${changeRatio}%`,
          data: null
        });
      }

      // 检查年度累计调整幅度
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      const yearlyAdjustments = await dataService.findAll('positionBenchmarkHistory', {
        where: {
          positionId: positionId,
          status: 'approved',
          createdAt: {
            $gte: yearStart,
            $lte: yearEnd
          }
        }
      });

      const records = yearlyAdjustments.rows || yearlyAdjustments || [];
      const yearlyChangeRatio = records.reduce((sum, record) => {
        return sum + parseFloat(record.changeRatio || record.change_ratio || 0);
      }, 0);

      if (Math.abs(yearlyChangeRatio + parseFloat(changeRatio)) > 30) {
        return res.status(400).json({
          code: 400,
          message: `年度累计调整幅度不能超过±30%，当前年度已累计${yearlyChangeRatio.toFixed(2)}%`,
          data: null
        });
      }

      // 创建调整申请记录
      const adjustmentId = uuidv4();
      const adjustment = {
        id: adjustmentId,
        positionId,
        oldValue,
        newValue,
        changeRatio,
        reason,
        status: 'pending',
        createdBy: userId,
        createdAt: new Date()
      };

      await dataService.create('positionBenchmarkHistory', adjustment);

      logger.info(`创建基准值调整申请: 岗位${positionId}, ${oldValue} -> ${newValue} (${changeRatio}%)`);

      res.json({
        code: 200,
        message: '调整申请已提交，等待审批',
        data: {
          adjustmentId,
          position: {
            id: position.id || position._id,
            name: position.name,
            currentValue: oldValue
          },
          adjustment: {
            newValue,
            changeRatio: `${changeRatio}%`,
            reason
          }
        }
      });

    } catch (error) {
      logger.error('申请基准值调整失败:', error);
      next(error);
    }
  }

  /**
   * 审批岗位基准值调整
   * POST /api/positions/benchmark/adjustment/:id/approve
   */
  async approveAdjustment(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { approved, comments } = req.body;

      const dataService = databaseService;

      // 获取调整申请
      const adjustment = await dataService.findByPk('positionBenchmarkHistory', id);
      if (!adjustment) {
        return res.status(404).json({
          code: 404,
          message: '调整申请不存在',
          data: null
        });
      }

      if (adjustment.status !== 'pending') {
        return res.status(400).json({
          code: 400,
          message: '该申请已被处理',
          data: null
        });
      }

      // 更新申请状态
      const newStatus = approved ? 'approved' : 'rejected';
      await dataService.update('positionBenchmarkHistory', id, {
        status: newStatus,
        approvedBy: userId,
        approvedAt: new Date(),
        comments: comments || ''
      });

      // 如果批准，更新岗位基准值
      if (approved) {
        const positionId = adjustment.positionId || adjustment.position_id;
        const newValue = adjustment.newValue || adjustment.new_value;
        
        await dataService.update('positions', positionId, {
          benchmarkValue: newValue,
          updatedAt: new Date()
        });

        logger.info(`批准基准值调整: 岗位${positionId}, 新值=${newValue}`);
      }

      res.json({
        code: 200,
        message: approved ? '调整已批准并生效' : '调整已拒绝',
        data: {
          adjustmentId: id,
          status: newStatus,
          approvedBy: userId,
          approvedAt: new Date()
        }
      });

    } catch (error) {
      logger.error('审批基准值调整失败:', error);
      next(error);
    }
  }

  /**
   * 获取调整申请列表
   * GET /api/positions/benchmark/adjustments
   */
  async getAdjustments(req, res, next) {
    try {
      const { status, positionId, page = 1, limit = 20 } = req.query;

      const dataService = databaseService;
      const where = {};

      if (status) where.status = status;
      if (positionId) where.positionId = positionId;

      const adjustments = await dataService.findAll('positionBenchmarkHistory', {
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      const records = adjustments.rows || adjustments || [];

      // 关联岗位信息
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          const pid = record.positionId || record.position_id;
          const position = await dataService.findByPk('positions', pid);
          return {
            ...record,
            positionName: position?.name || '未知岗位'
          };
        })
      );

      res.json({
        code: 200,
        message: '获取成功',
        data: {
          records: enrichedRecords,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: enrichedRecords.length
          }
        }
      });

    } catch (error) {
      logger.error('获取调整申请列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取岗位调整历史
   * GET /api/positions/:id/benchmark/history
   */
  async getPositionHistory(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      const dataService = databaseService;

      const history = await dataService.findAll('positionBenchmarkHistory', {
        where: { positionId: id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      const records = history.rows || history || [];

      // 计算统计信息
      const approved = records.filter(r => r.status === 'approved');
      const stats = {
        totalAdjustments: records.length,
        approvedCount: approved.length,
        rejectedCount: records.filter(r => r.status === 'rejected').length,
        pendingCount: records.filter(r => r.status === 'pending').length,
        totalChangeRatio: approved.reduce((sum, r) => {
          return sum + parseFloat(r.changeRatio || r.change_ratio || 0);
        }, 0).toFixed(2)
      };

      res.json({
        code: 200,
        message: '获取成功',
        data: {
          history: records,
          stats
        }
      });

    } catch (error) {
      logger.error('获取岗位调整历史失败:', error);
      next(error);
    }
  }

  /**
   * 批量调整岗位基准值（需要高级权限）
   * POST /api/positions/benchmark/batch-adjust
   */
  async batchAdjust(req, res, next) {
    try {
      const userId = req.user.id;
      const { adjustments, reason } = req.body;

      if (!Array.isArray(adjustments) || adjustments.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '调整列表不能为空',
          data: null
        });
      }

      const dataService = databaseService;
      const results = [];
      const errors = [];

      for (const adj of adjustments) {
        try {
          const { positionId, newValue } = adj;

          // 验证
          if (!positionId || !newValue) {
            errors.push({ positionId, error: '缺少必填字段' });
            continue;
          }

          if (newValue < 0.1 || newValue > 3.0) {
            errors.push({ positionId, error: '基准值超出范围' });
            continue;
          }

          const position = await dataService.findByPk('positions', positionId);
          if (!position) {
            errors.push({ positionId, error: '岗位不存在' });
            continue;
          }

          const oldValue = parseFloat(position.benchmarkValue || position.benchmark_value || 1.0);
          const changeRatio = ((newValue - oldValue) / oldValue * 100).toFixed(2);

          // 创建调整记录
          const adjustmentId = uuidv4();
          await dataService.create('positionBenchmarkHistory', {
            id: adjustmentId,
            positionId,
            oldValue,
            newValue,
            changeRatio,
            reason: reason || '批量调整',
            status: 'approved',  // 批量调整直接批准
            createdBy: userId,
            approvedBy: userId,
            approvedAt: new Date(),
            createdAt: new Date()
          });

          // 更新岗位基准值
          await dataService.update('positions', positionId, {
            benchmarkValue: newValue,
            updatedAt: new Date()
          });

          results.push({
            positionId,
            positionName: position.name,
            oldValue,
            newValue,
            changeRatio: `${changeRatio}%`
          });

        } catch (error) {
          errors.push({ positionId: adj.positionId, error: error.message });
        }
      }

      logger.info(`批量调整基准值: 成功${results.length}个, 失败${errors.length}个`);

      res.json({
        code: 200,
        message: `批量调整完成: 成功${results.length}个, 失败${errors.length}个`,
        data: {
          success: results,
          errors
        }
      });

    } catch (error) {
      logger.error('批量调整基准值失败:', error);
      next(error);
    }
  }
}

module.exports = new PositionBenchmarkController();
