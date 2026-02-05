const { databaseManager } = require('../backend/src/config/database');

async function createDefaultWeightConfig() {
  try {
    console.log('开始创建默认权重配置...');
    
    // 初始化数据库连接
    await databaseManager.initialize();
    console.log('✅ 数据库连接成功');
    
    // 检查是否已存在默认配置
    const existingConfig = await databaseManager.findOne('three_dimensional_weight_configs', {
      where: { code: 'DEFAULT_CONFIG' }
    });
    
    if (existingConfig) {
      console.log('✅ 默认权重配置已存在');
      process.exit(0);
      return;
    }
    
    // 创建默认权重配置
    const insertSQL = `
      INSERT INTO three_dimensional_weight_configs (
        name, code, description,
        profit_contribution_weight, position_value_weight, performance_weight,
        profit_direct_contribution_weight, profit_workload_weight, profit_quality_weight, profit_position_value_weight,
        position_skill_complexity_weight, position_responsibility_weight, position_decision_impact_weight, position_experience_weight, position_market_value_weight,
        performance_work_output_weight, performance_work_quality_weight, performance_work_efficiency_weight, 
        performance_collaboration_weight, performance_innovation_weight, performance_leadership_weight, performance_learning_weight,
        excellence_bonus, performance_multiplier, position_level_multiplier,
        calculation_method, normalization_method,
        effective_date, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      '默认三维权重配置', 
      'DEFAULT_CONFIG', 
      '系统默认的三维权重配置',
      0.5, 0.3, 0.2,  // 主权重
      0.4, 0.3, 0.2, 0.1,  // 利润子权重
      0.25, 0.3, 0.2, 0.15, 0.1,  // 岗位子权重
      0.25, 0.2, 0.15, 0.15, 0.1, 0.1, 0.05,  // 绩效子权重
      0.2, 1.5, 1.2,  // 调整系数
      'weighted_sum', 'z_score',  // 计算方法
      new Date(), 'active', 1  // 其他字段
    ];
    
    await databaseManager.query(insertSQL, params);
    console.log('✅ 默认权重配置已创建');
    
    console.log('默认数据创建完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 默认数据创建失败:', error);
    process.exit(1);
  }
}

// 运行创建默认数据
createDefaultWeightConfig();