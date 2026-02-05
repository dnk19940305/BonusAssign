const logger = require('../utils/logger');
const databaseService = require('../services/databaseService');
const dashboardService = require('../services/dashboardService');


/**
 * 管理驾驶舱控制器
 */
class DashboardController {
  /**
   * 获取管理驾驶舱概览数据
   */
  async getOverview(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // 获取核心指标
      const metrics = await this.getCoreMetrics(startDate, endDate);
      
      // 获取部门排行
      const departmentRanking = await this.getDepartmentRanking(startDate, endDate);
      
      // 获取奖金分布统计
      const bonusDistribution = await this.getBonusDistribution(startDate, endDate);
      
      // 获取系统动态
      const recentActivities = await this.getRecentActivities();
      
      res.json({
        code: 200,
        message: '获取驾驶舱数据成功',
        data: {
          metrics,
          departmentRanking,
          bonusDistribution,
          recentActivities
        }
      });
      
    } catch (error) {
      logger.error('获取驾驶舱概览数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取驾驶舱数据失败',
        error: error.message
      });
    }
  }

  /**
   * 获取核心指标
   */
  async getCoreMetrics(startDate, endDate) {
    try {
      // ✅ 调用 Service 层查询数据
      const results = await dashboardService.getCoreMetricsData(startDate, endDate);
      
      if (results && results.length > 0) {
        // 计算统计指标
        let totalBonus = 0;
        const uniqueEmployees = new Set();
        
        for (const record of results) {
          const finalBonus = parseFloat(record.final_bonus_amount || 0);
          totalBonus += finalBonus;
          uniqueEmployees.add(record.employee_id);
        }
        
        const employeeCount = uniqueEmployees.size;
        const avgBonus = employeeCount > 0 ? Math.round(totalBonus / employeeCount) : 0;
        
        // 获取奖金池总额计算利用率
        const budgetPool = await dashboardService.getBonusPoolTotal(startDate, endDate);
        const utilizationRate = budgetPool > 0 ? totalBonus / budgetPool : 0;
        
        console.log(`✅ 统计结果: 总奖金=￥${totalBonus}, 人数=${employeeCount}, 平均=￥${avgBonus}, 利用率=${(utilizationRate * 100).toFixed(2)}%`);
        
        return {
          totalBonus: Math.round(totalBonus),
          avgBonus,
          utilizationRate: Math.round(utilizationRate * 1000) / 1000,
          totalEmployees: employeeCount,
          bonusGrowth: 0,
          avgGrowth: 0,
          utilizationChange: 0,
          employeeGrowth: 0
        };
      } else {
        console.log(`⚠️ 未找到符合条件的奖金记录`);
        
        // 获取总员工数
        const employeesResult = await databaseService.findAll('employees');
        const employees = employeesResult.rows || employeesResult;
        const totalEmployees = employees.length;
        
        return {
          totalBonus: 0,
          avgBonus: 0,
          utilizationRate: 0,
          totalEmployees,
          bonusGrowth: 0,
          avgGrowth: 0,
          utilizationChange: 0,
          employeeGrowth: 0
        };
      }
      
    } catch (error) {
      logger.error('获取核心指标失败:', error);
      throw error;
    }
  }

  /**
   * 获取部门奖金排行
   */
  async getDepartmentRanking(startDate, endDate) {
    try {
      // ✅ 调用 Service 层查询数据
      const results = await dashboardService.getDepartmentRankingData(startDate, endDate);
      
      if (results && results.length > 0) {
        // 按部门统计
        const deptStats = {};
        
        for (const record of results) {
          const deptId = record.department_id;
          const deptName = record.department_name || '未分配部门';
          
          if (!deptStats[deptId]) {
            deptStats[deptId] = {
              id: deptId,
              name: deptName,
              totalBonus: 0,
              employeeCount: 0,
              employees: new Set()
            };
          }
          
          const finalBonus = parseFloat(record.final_bonus_amount || 0);
          deptStats[deptId].totalBonus += finalBonus;
          deptStats[deptId].employees.add(record.employee_id);
        }
        
        // 转换为数组并计算员工数
        const result = Object.values(deptStats).map(stat => ({
          id: stat.id,
          name: stat.name,
          totalBonus: Math.round(stat.totalBonus),
          employeeCount: stat.employees.size
        })).sort((a, b) => b.totalBonus - a.totalBonus).slice(0, 10);
        
        console.log(`✅ 部门排行: 找到${result.length}个部门`);
        return result;
      }
      
      console.log(`⚠️ 未找到部门数据`);
      return [];
        
    } catch (error) {
      logger.error('获取部门排行失败:', error);
      return [];
    }
  }

  /**
   * 获取奖金分布统计
   */
  async getBonusDistribution(startDate, endDate) {
    try {
      // ✅ 调用 Service 层查询数据
      const results = await dashboardService.getBonusDistributionData(startDate, endDate);
      
      if (results && results.length > 0) {
        const bonusAmounts = results.map(r => parseFloat(r.final_bonus_amount || 0)).filter(b => b > 0);
        bonusAmounts.sort((a, b) => a - b);
        
        // 计算分布区间
        const ranges = [
          { min: 0, max: 10000, count: 0 },
          { min: 10000, max: 20000, count: 0 },
          { min: 20000, max: 30000, count: 0 },
          { min: 30000, max: 40000, count: 0 },
          { min: 40000, max: 50000, count: 0 },
          { min: 50000, max: 100000, count: 0 },
          { min: 100000, max: 200000, count: 0 }
        ];
        
        bonusAmounts.forEach(bonus => {
          const range = ranges.find(r => bonus >= r.min && bonus < r.max);
          if (range) range.count++;
        });
        
        // 计算中位数
        const median = bonusAmounts.length > 0 ? 
          bonusAmounts[Math.floor(bonusAmounts.length / 2)] : 0;
        
        // 计算标准差
        const mean = bonusAmounts.reduce((sum, bonus) => sum + bonus, 0) / bonusAmounts.length || 0;
        const variance = bonusAmounts.reduce((sum, bonus) => sum + Math.pow(bonus - mean, 2), 0) / bonusAmounts.length || 0;
        const standardDeviation = Math.sqrt(variance);
        
        // 简单的基尼系数估算
        const giniCoefficient = this.calculateGini(bonusAmounts);
        
        console.log(`✅ 奖金分布: ${bonusAmounts.length}人, 中位数=￥${median}`);
        
        return {
          ranges: ranges.filter(r => r.count > 0),
          median: Math.round(median),
          giniCoefficient: Math.round(giniCoefficient * 1000) / 1000,
          standardDeviation: Math.round(standardDeviation)
        };
      }
      
      console.log(`⚠️ 未找到奖金分布数据`);
      return {
        ranges: [],
        median: 0,
        giniCoefficient: 0,
        standardDeviation: 0
      };
      
    } catch (error) {
      logger.error('获取奖金分布统计失败:', error);
      return {
        ranges: [],
        median: 0,
        giniCoefficient: 0,
        standardDeviation: 0
      };
    }
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(req, res) {
    try {
      const { type = 'total', months = 6 } = req.query;
      
      // ✅ 调用 Service 层查询数据
      const results = await dashboardService.getBonusTrendData();
      
      if (results && results.length > 0) {
        const trendData = results.map(row => ({
          period: row.calculation_period,
          totalBonus: Math.round(parseFloat(row.total_bonus || 0)),
          avgBonus: row.employee_count > 0 ? Math.round(parseFloat(row.total_bonus || 0) / row.employee_count) : 0,
          employeeCount: parseInt(row.employee_count || 0)
        }));
        
        console.log(`✅ 趋势数据: 找到${trendData.length}个期间`);
        
        res.json({
          code: 200,
          message: '获取趋势数据成功',
          data: type === 'avg' ? trendData.map(d => ({
            period: d.period,
            value: d.avgBonus
          })) : trendData.map(d => ({
            period: d.period,
            value: d.totalBonus
          }))
        });
        return;
      }
      
      console.log(`⚠️ 未找到趋势数据`);
      res.json({
        code: 200,
        message: '暂无趋势数据',
        data: []
      });
      
    } catch (error) {
      logger.error('获取趋势数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取趋势数据失败',
        error: error.message
      });
    }
  }

  /**
   * 获取业务线分布数据
   */
  async getDistributionData(req, res) {
    try {
      const { type = 'amount' } = req.query;
      
      // ✅ 调用 Service 层查询数据
      const results = await dashboardService.getBusinessLineDistributionData();
      
      if (results && results.length > 0) {
        const distributionData = results.map(row => ({
          name: row.business_line_name,
          value: type === 'amount' ? Math.round(parseFloat(row.total_bonus || 0)) : parseInt(row.employee_count || 0)
        }));
        
        console.log(`✅ 业务线分布: 找到${distributionData.length}个业务线`);
        
        res.json({
          code: 200,
          message: '获取分布数据成功',
          data: distributionData
        });
        return;
      }
      
      console.log(`⚠️ 未找到业务线分布数据`);
      res.json({
        code: 200,
        message: '暂无分布数据',
        data: []
      });
      
    } catch (error) {
      logger.error('获取分布数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取分布数据失败',
        error: error.message
      });
    }
  }

  /**
   * 获取系统动态
   */
  async getRecentActivities() {
    try {
      const dataService = databaseService;
      
      // 从审计日志获取最近的系统动态
      // 注意：如果audit_logs表不存在，将返回默认数据
      try {
        const auditLogsResult = await dataService.findAll('audit_logs', { 
          order: [['created_at', 'DESC']], 
          limit: 10 
        });
        const auditLogs = auditLogsResult.rows || auditLogsResult;
        
        if (auditLogs && auditLogs.length > 0) {
          return auditLogs.map(log => ({
            id: log.id,
            title: this.getActivityTitle(log.operation),
            description: log.details || log.description,
            user: log.userName || log.userId,
            timestamp: this.formatTimestamp(log.createdAt || log.created_at),
            type: this.getActivityType(log.operation)
          }));
        }
      } catch (dbError) {
        // 如果表不存在或查询失败，记录警告但不抛出错误
        logger.warn('审计日志表不存在或查询失败，使用默认数据:', dbError.message);
      }
      
      // 返回默认数据
      return [
        {
          id: 1,
          title: '系统启动',
          description: '奖金模拟系统已成功启动',
          user: '系统',
          timestamp: new Date().toLocaleString('zh-CN'),
          type: 'info'
        }
      ];
      
    } catch (error) {
      logger.error('获取系统动态失败:', error);
      // 返回默认数据
      return [
        {
          id: 1,
          title: '系统启动',
          description: '奖金模拟系统已成功启动',
          user: '系统',
          timestamp: new Date().toLocaleString('zh-CN'),
          type: 'info'
        }
      ];
    }
  }

  // 工具方法
  getPositionMultiplier(positionName) {
    const multipliers = {
      '总监': 3.0,
      '高级经理': 2.5,
      '经理': 2.0,
      '主管': 1.5,
      '高级专员': 1.3,
      '专员': 1.0,
      '助理': 0.8
    };
    
    for (const [key, value] of Object.entries(multipliers)) {
      if (positionName && positionName.includes(key)) {
        return value;
      }
    }
    return 1.0;
  }

  getDepartmentMultiplier(departmentName) {
    const multipliers = {
      '实施部': 1.2,
      '售前部': 1.1,
      '研发部': 1.0,
      '市场部': 0.9,
      '运营部': 0.85,
      '人事部': 0.8,
      '财务部': 0.8
    };
    
    return multipliers[departmentName] || 1.0;
  }

  getBusinessLineByDepartment(departmentName) {
    const mapping = {
      '实施部': '项目实施',
      '售前部': '销售支持',
      '研发部': '产品研发',
      '市场部': '市场营销',
      '运营部': '运营支持',
      '人事部': '人力资源',
      '财务部': '财务管理'
    };
    
    return mapping[departmentName] || '其他';
  }

  calculateGini(values) {
    if (values.length === 0) return 0;
    
    const sortedValues = [...values].sort((a, b) => a - b);
    const n = sortedValues.length;
    const sum = sortedValues.reduce((a, b) => a + b, 0);
    
    if (sum === 0) return 0;
    
    let gini = 0;
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * sortedValues[i];
    }
    
    return gini / (n * sum);
  }

  getActivityTitle(operation) {
    const titles = {
      'CREATE': '数据创建',
      'UPDATE': '数据更新', 
      'DELETE': '数据删除',
      'LOGIN': '用户登录',
      'LOGOUT': '用户退出',
      'CALCULATE': '奖金计算',
      'EXPORT': '数据导出',
      'IMPORT': '数据导入'
    };
    
    return titles[operation] || '系统操作';
  }

  getActivityType(operation) {
    const types = {
      'CREATE': 'success',
      'UPDATE': 'primary',
      'DELETE': 'danger',
      'LOGIN': 'info',
      'LOGOUT': 'info',
      'CALCULATE': 'success',
      'EXPORT': 'warning',
      'IMPORT': 'warning'
    };
    
    return types[operation] || 'info';
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return new Date().toLocaleString('zh-CN');
    return new Date(timestamp).toLocaleString('zh-CN');
  }
}

module.exports = new DashboardController();