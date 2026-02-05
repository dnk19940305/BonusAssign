const { createModel } = require('../adapters/model-adapter');

// 创建兼容 NeDB/MySQL 的模型
const ThreeDimensionalCalculationResult = createModel('three_dimensional_calculation_results');

// 为了向后兼容，添加静态属性
ThreeDimensionalCalculationResult.attributes = {
  id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
  employeeId: { type: 'INTEGER', allowNull: false },
  weightConfigId: { type: 'INTEGER', allowNull: false },
  calculationPeriod: { type: 'STRING', allowNull: false },
  bonusPoolId: { type: 'INTEGER', allowNull: true },
  
  // 原始维度得分
  profitContributionScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  positionValueScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  performanceScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  
  // 标准化得分
  normalizedProfitScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  normalizedPositionScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  normalizedPerformanceScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  
  // 加权得分
  weightedProfitScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  weightedPositionScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  weightedPerformanceScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  
  // 综合得分
  totalScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  adjustedScore: { type: 'DECIMAL', allowNull: true },
  finalScore: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  
  // 排名和百分位
  scoreRank: { type: 'INTEGER', allowNull: true },
  percentileRank: { type: 'DECIMAL', allowNull: true },
  departmentRank: { type: 'INTEGER', allowNull: true },
  levelRank: { type: 'INTEGER', allowNull: true },
  
  // 奖金计算
  bonusCoefficient: { type: 'DECIMAL', allowNull: true },
  baseBonusAmount: { type: 'DECIMAL', allowNull: true },
  adjustmentAmount: { type: 'DECIMAL', allowNull: true },
  finalBonusAmount: { type: 'DECIMAL', allowNull: true },
  
  // 维度贡献分析
  profitContributionRate: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  positionValueRate: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  performanceRate: { type: 'DECIMAL', allowNull: false, defaultValue: 0 },
  
  // 详细计算数据
  profitCalculationDetails: { type: 'JSON', allowNull: true },
  positionCalculationDetails: { type: 'JSON', allowNull: true },
  performanceCalculationDetails: { type: 'JSON', allowNull: true },
  
  // 计算方法和参数
  calculationMethod: { type: 'STRING', allowNull: false, defaultValue: 'weighted_sum' },
  calculationParams: { type: 'JSON', allowNull: true },
  
  // 数据来源标识
  profitDataVersion: { type: 'STRING', allowNull: true },
  positionDataVersion: { type: 'STRING', allowNull: true },
  performanceDataVersion: { type: 'STRING', allowNull: true },
  
  // 质量指标
  dataCompleteness: { type: 'DECIMAL', allowNull: false, defaultValue: 100 },
  calculationConfidence: { type: 'DECIMAL', allowNull: false, defaultValue: 80 },
  
  // 异常检测
  outlierFlag: { type: 'BOOLEAN', allowNull: false, defaultValue: false },
  outlierReason: { type: 'STRING', allowNull: true },
  
  // 审核状态
  reviewStatus: { type: 'STRING', allowNull: false, defaultValue: 'pending' },
  reviewComments: { type: 'TEXT', allowNull: true },
  reviewedBy: { type: 'INTEGER', allowNull: true },
  reviewedAt: { type: 'DATE', allowNull: true },
  
  // 历史对比
  previousPeriodScore: { type: 'DECIMAL', allowNull: true },
  scoreChangeRate: { type: 'DECIMAL', allowNull: true },
  trendDirection: { type: 'STRING', allowNull: true },
  
  // 计算时间戳
  calculatedAt: { type: 'DATE', allowNull: false },
  status: { type: 'INTEGER', allowNull: false, defaultValue: 1 },
  createdBy: { type: 'INTEGER', allowNull: false },
  updatedBy: { type: 'INTEGER', allowNull: true }
};

module.exports = ThreeDimensionalCalculationResult;