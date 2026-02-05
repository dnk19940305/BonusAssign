const { databaseManager } = require('../config/database');
const logger = require('../utils/logger');

/**
 * 管理驾驶舱数据服务层
 * 负责所有与管理驾驶舱相关的数据查询逻辑
 */
class DashboardService {
  /**
   * 查询核心指标数据
   * @param {string} startDate - 开始日期（如 2025-01）
   * @param {string} endDate - 结束日期（如 2025-12）
   * @returns {Promise<Object>} 核心指标数据
   */
  async getCoreMetricsData(startDate, endDate) {
    try {
      console.log(`📊 [Service] 查询核心指标: startDate=${startDate}, endDate=${endDate}`);
      
      // 查询奖金记录
      let query = `
        SELECT 
          t.final_bonus_amount,
          t.calculation_period,
          t.employee_id,
          b.status
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        WHERE b.status IN ('calculated', 'allocated', 'paid')
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        const startYear = startDate.substring(0, 4);
        const endYear = endDate.substring(0, 4);
        
        if (startYear === endYear) {
          query += ` AND (t.calculation_period COLLATE utf8mb4_unicode_ci LIKE ? COLLATE utf8mb4_unicode_ci
                      OR t.calculation_period COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci)`;
          params.push(`${startYear}%`, startYear);
        } else {
          query += ` AND t.calculation_period COLLATE utf8mb4_unicode_ci BETWEEN ? COLLATE utf8mb4_unicode_ci AND ? COLLATE utf8mb4_unicode_ci`;
          params.push(startDate, endDate);
        }
      }
      
      const results = await databaseManager.query(query, params);
      console.log(`📊 [Service] 查询到 ${results.length} 条奖金记录`);
      
      return results;
    } catch (error) {
      logger.error('[Service] 查询核心指标数据失败:', error);
      throw error;
    }
  }

  /**
   * 查询奖金池总额
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<number>} 奖金池总额
   */
  async getBonusPoolTotal(startDate, endDate) {
    try {
      let query = `SELECT SUM(distributable_amount) as total FROM bonus_pools WHERE status IN ('calculated', 'allocated', 'paid')`;
      const params = [];
      
      if (startDate && endDate) {
        const startYear = startDate.substring(0, 4);
        const endYear = endDate.substring(0, 4);
        
        if (startYear === endYear) {
          query += ` AND (period LIKE ? OR period = ?)`;
          params.push(`${startYear}%`, startYear);
        } else {
          query += ` AND period BETWEEN ? AND ?`;
          params.push(startDate, endDate);
        }
      }
      
      const result = await databaseManager.query(query, params);
      return parseFloat(result[0]?.total || 0);
    } catch (error) {
      logger.error('[Service] 查询奖金池总额失败:', error);
      throw error;
    }
  }

  /**
   * 查询部门奖金排行数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Array>} 部门排行数据
   */
  async getDepartmentRankingData(startDate, endDate) {
    try {
      console.log(`🏆 [Service] 查询部门排行: startDate=${startDate}, endDate=${endDate}`);
      
      let query = `
        SELECT 
          t.employee_id,
          t.final_bonus_amount,
          e.department_id,
          d.name as department_name
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        INNER JOIN employees e ON t.employee_id COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN departments d ON e.department_id COLLATE utf8mb4_unicode_ci = d.id COLLATE utf8mb4_unicode_ci
        WHERE b.status IN ('calculated', 'allocated', 'paid')
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        const startYear = startDate.substring(0, 4);
        const endYear = endDate.substring(0, 4);
        
        if (startYear === endYear) {
          query += ` AND (t.calculation_period COLLATE utf8mb4_unicode_ci LIKE ? COLLATE utf8mb4_unicode_ci
                      OR t.calculation_period COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci)`;
          params.push(`${startYear}%`, startYear);
        } else {
          query += ` AND t.calculation_period COLLATE utf8mb4_unicode_ci BETWEEN ? COLLATE utf8mb4_unicode_ci AND ? COLLATE utf8mb4_unicode_ci`;
          params.push(startDate, endDate);
        }
      }
      
      const results = await databaseManager.query(query, params);
      console.log(`🏆 [Service] 查询到 ${results.length} 条部门奖金记录`);
      
      return results;
    } catch (error) {
      logger.error('[Service] 查询部门排行数据失败:', error);
      throw error;
    }
  }

  /**
   * 查询奖金分布数据
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Array>} 奖金金额数组
   */
  async getBonusDistributionData(startDate, endDate) {
    try {
      console.log(`📊 [Service] 查询奖金分布: startDate=${startDate}, endDate=${endDate}`);
      
      let query = `
        SELECT t.final_bonus_amount
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        WHERE b.status IN ('calculated', 'allocated', 'paid')
      `;
      
      const params = [];
      
      if (startDate && endDate) {
        const startYear = startDate.substring(0, 4);
        const endYear = endDate.substring(0, 4);
        
        if (startYear === endYear) {
          query += ` AND (t.calculation_period COLLATE utf8mb4_unicode_ci LIKE ? COLLATE utf8mb4_unicode_ci
                      OR t.calculation_period COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci)`;
          params.push(`${startYear}%`, startYear);
        } else {
          query += ` AND t.calculation_period COLLATE utf8mb4_unicode_ci BETWEEN ? COLLATE utf8mb4_unicode_ci AND ? COLLATE utf8mb4_unicode_ci`;
          params.push(startDate, endDate);
        }
      }
      
      const results = await databaseManager.query(query, params);
      console.log(`📊 [Service] 查询到 ${results.length} 条奖金分布记录`);
      
      return results;
    } catch (error) {
      logger.error('[Service] 查询奖金分布数据失败:', error);
      throw error;
    }
  }

  /**
   * 查询奖金趋势数据（按期间聚合）
   * @returns {Promise<Array>} 趋势数据
   */
  async getBonusTrendData() {
    try {
      console.log(`📈 [Service] 查询奖金趋势数据`);
      
      const query = `
        SELECT 
          t.calculation_period,
          SUM(t.final_bonus_amount) as total_bonus,
          COUNT(DISTINCT t.employee_id) as employee_count
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        WHERE b.status IN ('calculated', 'allocated', 'paid')
        GROUP BY t.calculation_period
        ORDER BY t.calculation_period
      `;
      
      const results = await databaseManager.query(query);
      console.log(`📈 [Service] 查询到 ${results.length} 个期间的趋势数据`);
      
      return results;
    } catch (error) {
      logger.error('[Service] 查询奖金趋势数据失败:', error);
      throw error;
    }
  }

  /**
   * 查询业务线分布数据
   * @returns {Promise<Array>} 业务线分布数据
   */
  async getBusinessLineDistributionData() {
    try {
      console.log(`🎂 [Service] 查询业务线分布数据`);
      
      const query = `
        SELECT 
          COALESCE(bl.name, '未分配业务线') as business_line_name,
          SUM(t.final_bonus_amount) as total_bonus,
          COUNT(DISTINCT t.employee_id) as employee_count
        FROM three_dimensional_calculation_results t
        INNER JOIN bonus_pools b ON t.bonus_pool_id COLLATE utf8mb4_unicode_ci = b.id COLLATE utf8mb4_unicode_ci
        INNER JOIN employees e ON t.employee_id COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN departments d ON e.department_id COLLATE utf8mb4_unicode_ci = d.id COLLATE utf8mb4_unicode_ci
        LEFT JOIN business_lines bl ON d.line_id COLLATE utf8mb4_unicode_ci = bl.id COLLATE utf8mb4_unicode_ci
        WHERE b.status IN ('calculated', 'allocated', 'paid')
        GROUP BY bl.name
        ORDER BY total_bonus DESC
      `;
      
      const results = await databaseManager.query(query);
      console.log(`🎂 [Service] 查询到 ${results.length} 个业务线分布记录`);
      
      return results;
    } catch (error) {
      logger.error('[Service] 查询业务线分布数据失败:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
