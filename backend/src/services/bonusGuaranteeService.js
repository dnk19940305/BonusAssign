﻿/**
 * 奖金保障机制服务
 * 实现最低保障、最高限制、历史平滑等机制
 */

const logger = require('../utils/logger');
const databaseService = require('./databaseService');

class BonusGuaranteeService {

  /**
   * 应用奖金保障机制
   * @param {Number} calculatedBonus - 计算得出的奖金
   * @param {Number} baseBonus - 基础奖金
   * @param {Object} employee - 员工信息
   * @param {Object} options - 配置选项
   * @returns {Object} 调整后的奖金和调整信息
   */
  async applyBonusGuarantee(calculatedBonus, baseBonus, employee, options = {}) {
    try {
      const {
        minimumRatio = 0.5,     // 最低保障比例 (50%)
        maximumRatio = 3.0,     // 最高限制比例 (300%)
        enableSmoothing = false, // 是否启用平滑
        smoothingFactor = 0.3    // 平滑因子
      } = options;

      let finalBonus = calculatedBonus;
      const adjustments = [];

      // 1. 最低奖金保障
      const minimumBonus = baseBonus * minimumRatio;
      if (finalBonus < minimumBonus) {
        adjustments.push({
          type: 'minimum_guarantee',
          originalAmount: finalBonus,
          adjustedAmount: minimumBonus,
          difference: minimumBonus - finalBonus,
          reason: `应用最低保障：基础奖金的${(minimumRatio * 100).toFixed(0)}%`
        });
        finalBonus = minimumBonus;
        logger.info(`应用最低保障: 员工${employee.name || employee.id}, 原${calculatedBonus} -> ${minimumBonus}`);
      }

      // 2. 最高奖金限制
      const maximumBonus = baseBonus * maximumRatio;
      if (finalBonus > maximumBonus) {
        adjustments.push({
          type: 'maximum_limit',
          originalAmount: finalBonus,
          adjustedAmount: maximumBonus,
          difference: finalBonus - maximumBonus,
          reason: `应用最高限制：基础奖金的${(maximumRatio * 100).toFixed(0)}%`
        });
        finalBonus = maximumBonus;
        logger.info(`应用最高限制: 员工${employee.name || employee.id}, 原${calculatedBonus} -> ${maximumBonus}`);
      }

      // 3. 历史奖金平滑（可选）
      if (enableSmoothing && employee) {
        const historicalAverage = await this.getHistoricalAverageBonus(employee.id || employee._id);
        if (historicalAverage > 0) {
          const smoothedBonus = finalBonus * (1 - smoothingFactor) + historicalAverage * smoothingFactor;
          
          // 只有在差异较大时才应用平滑
          const changePct = Math.abs(finalBonus - historicalAverage) / historicalAverage;
          if (changePct > 0.3) {  // 变化超过30%才平滑
            adjustments.push({
              type: 'historical_smoothing',
              originalAmount: finalBonus,
              adjustedAmount: smoothedBonus,
              difference: smoothedBonus - finalBonus,
              historicalAverage: historicalAverage,
              smoothingFactor: smoothingFactor,
              reason: `应用历史平滑：防止奖金波动过大（变化${(changePct * 100).toFixed(1)}%）`
            });
            finalBonus = smoothedBonus;
            logger.info(`应用历史平滑: 员工${employee.name || employee.id}, ${calculatedBonus} -> ${smoothedBonus}`);
          }
        }
      }

      return {
        originalBonus: calculatedBonus,
        finalBonus: Math.round(finalBonus * 100) / 100,  // 保留两位小数
        adjustments,
        guaranteeApplied: adjustments.length > 0,
        minimumBonus,
        maximumBonus
      };

    } catch (error) {
      logger.error('应用奖金保障机制失败:', error);
      return {
        originalBonus: calculatedBonus,
        finalBonus: calculatedBonus,
        adjustments: [],
        guaranteeApplied: false,
        error: error.message
      };
    }
  }

  /**
   * 批量应用奖金保障机制
   * @param {Array} bonusResults - 奖金计算结果数组
   * @param {Object} options - 配置选项
   * @returns {Array} 调整后的结果数组
   */
  async applyBatchGuarantee(bonusResults, options = {}) {
    const results = [];
    
    for (const result of bonusResults) {
      const baseBonus = result.baseAmount || result.baseBonus || 10000;  // 默认基础奖金
      const calculatedBonus = result.totalAmount || result.totalBonus || 0;
      const employee = result.employee || { id: result.employeeId };

      const guaranteeResult = await this.applyBonusGuarantee(
        calculatedBonus,
        baseBonus,
        employee,
        options
      );

      results.push({
        ...result,
        originalCalculatedAmount: guaranteeResult.originalBonus,
        totalAmount: guaranteeResult.finalBonus,
        totalBonus: guaranteeResult.finalBonus,
        adjustments: guaranteeResult.adjustments,
        guaranteeApplied: guaranteeResult.guaranteeApplied,
        minAmountApplied: guaranteeResult.adjustments.some(a => a.type === 'minimum_guarantee'),
        maxAmountApplied: guaranteeResult.adjustments.some(a => a.type === 'maximum_limit'),
        smoothingApplied: guaranteeResult.adjustments.some(a => a.type === 'historical_smoothing')
      });
    }

    return results;
  }

  /**
   * 获取员工历史平均奖金
   * @param {String} employeeId - 员工ID
   * @param {Number} periods - 统计期数（默认3期）
   * @returns {Number} 历史平均奖金
   */
  async getHistoricalAverageBonus(employeeId, periods = 3) {
    try {
      const dataService = databaseService;
      
      // 查询最近N期的奖金记录
      const historicalResults = await dataService.findAll('bonusAllocationResults', {
        where: { employeeId: employeeId.toString() },
        order: [['createdAt', 'DESC']],
        limit: periods
      });

      const records = historicalResults.rows || historicalResults;
      
      if (!records || records.length === 0) {
        return 0;
      }

      // 计算平均值
      const totalBonus = records.reduce((sum, record) => {
        const amount = parseFloat(record.totalBonus || record.total_bonus || record.totalAmount || record.total_amount || 0);
        return sum + amount;
      }, 0);

      const average = totalBonus / records.length;
      
      logger.info(`员工${employeeId}历史${records.length}期平均奖金: ${average}`);
      return average;

    } catch (error) {
      logger.error('获取历史平均奖金失败:', error);
      return 0;
    }
  }

  /**
   * 检测奖金异常
   * @param {Number} bonus - 奖金金额
   * @param {Number} baseBonus - 基础奖金
   * @param {Object} employee - 员工信息
   * @returns {Object} 异常检测结果
   */
  detectBonusAnomaly(bonus, baseBonus, employee) {
    const anomalies = [];
    
    // 检测1: 奖金为负数
    if (bonus < 0) {
      anomalies.push({
        type: 'negative_bonus',
        severity: 'critical',
        message: '奖金金额为负数'
      });
    }

    // 检测2: 奖金为0
    if (bonus === 0) {
      anomalies.push({
        type: 'zero_bonus',
        severity: 'warning',
        message: '奖金金额为0'
      });
    }

    // 检测3: 奖金异常高
    if (bonus > baseBonus * 5) {
      anomalies.push({
        type: 'extremely_high',
        severity: 'error',
        message: `奖金金额异常高（超过基础奖金500%）: ¥${bonus}`
      });
    }

    // 检测4: 奖金异常低（但不为0）
    if (bonus > 0 && bonus < baseBonus * 0.3) {
      anomalies.push({
        type: 'extremely_low',
        severity: 'warning',
        message: `奖金金额异常低（低于基础奖金30%）: ¥${bonus}`
      });
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      requiresReview: anomalies.some(a => a.severity === 'critical' || a.severity === 'error')
    };
  }

  /**
   * 生成奖金调整报告
   * @param {Array} bonusResults - 调整后的奖金结果
   * @returns {Object} 调整报告
   */
  generateAdjustmentReport(bonusResults) {
    const report = {
      totalEmployees: bonusResults.length,
      adjustedCount: 0,
      minimumGuaranteeCount: 0,
      maximumLimitCount: 0,
      smoothingCount: 0,
      totalAdjustmentAmount: 0,
      adjustmentDetails: []
    };

    bonusResults.forEach(result => {
      if (result.guaranteeApplied) {
        report.adjustedCount++;
        
        if (result.minAmountApplied) report.minimumGuaranteeCount++;
        if (result.maxAmountApplied) report.maximumLimitCount++;
        if (result.smoothingApplied) report.smoothingCount++;

        const adjustmentAmount = (result.totalBonus || result.totalAmount) - result.originalCalculatedAmount;
        report.totalAdjustmentAmount += adjustmentAmount;

        report.adjustmentDetails.push({
          employeeId: result.employeeId,
          employeeName: result.employee?.name || result.employeeName,
          original: result.originalCalculatedAmount,
          adjusted: result.totalBonus || result.totalAmount,
          difference: adjustmentAmount,
          adjustments: result.adjustments
        });
      }
    });

    report.adjustmentRate = (report.adjustedCount / report.totalEmployees * 100).toFixed(2) + '%';

    return report;
  }
}

module.exports = new BonusGuaranteeService();
