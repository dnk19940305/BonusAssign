const { createModel } = require('../adapters/model-adapter');

// 创建兼容 NeDB/MySQL 的模型
const ThreeDimensionalWeightConfig = createModel('three_dimensional_weight_configs');

// 为了向后兼容，添加静态属性
ThreeDimensionalWeightConfig.attributes = {
  id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
  name: { type: 'STRING', allowNull: false },
  code: { type: 'STRING', allowNull: false, unique: true },
  description: { type: 'TEXT', allowNull: true },
  
  // 三维权重配置
  profitContributionWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.5 },
  positionValueWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.3 },
  performanceWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.2 },
  
  // 利润贡献度子权重
  profitDirectContributionWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.4 },
  profitWorkloadWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.3 },
  profitQualityWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.2 },
  profitPositionValueWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.1 },
  
  // 岗位价值子权重
  positionSkillComplexityWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.25 },
  positionResponsibilityWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.3 },
  positionDecisionImpactWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.2 },
  positionExperienceWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.15 },
  positionMarketValueWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.1 },
  
  // 绩效表现子权重
  performanceWorkOutputWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.25 },
  performanceWorkQualityWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.2 },
  performanceWorkEfficiencyWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.15 },
  performanceCollaborationWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.15 },
  performanceInnovationWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.1 },
  performanceLeadershipWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.1 },
  performanceLearningWeight: { type: 'DECIMAL', allowNull: false, defaultValue: 0.05 },
  
  // 调整系数配置
  excellenceBonus: { type: 'DECIMAL', allowNull: false, defaultValue: 0.2 },
  performanceMultiplier: { type: 'DECIMAL', allowNull: false, defaultValue: 1.5 },
  positionLevelMultiplier: { type: 'DECIMAL', allowNull: false, defaultValue: 1.2 },
  
  // 计算方法配置
  calculationMethod: { type: 'STRING', allowNull: false, defaultValue: 'weighted_sum' },
  normalizationMethod: { type: 'STRING', allowNull: false, defaultValue: 'none' },
  
  // 生效时间和版本
  effectiveDate: { type: 'DATE', allowNull: false },
  status: { type: 'STRING', allowNull: false, defaultValue: 'draft' },
  createdBy: { type: 'INTEGER', allowNull: false }
};

module.exports = ThreeDimensionalWeightConfig;