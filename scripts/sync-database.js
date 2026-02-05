const { databaseManager } = require('../backend/src/config/database');

async function syncDatabase() {
  try {
    console.log('开始同步数据库...');
    
    // 初始化数据库连接
    await databaseManager.initialize();
    console.log('✅ 数据库连接成功');
    
    // 创建 three_dimensional_weight_configs 表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS three_dimensional_weight_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '权重配置名称',
        code VARCHAR(50) NOT NULL UNIQUE COMMENT '权重配置代码',
        description TEXT COMMENT '配置描述',
        
        -- 三维权重配置
        profit_contribution_weight DECIMAL(4,3) NOT NULL DEFAULT 0.5 COMMENT '利润贡献度权重',
        position_value_weight DECIMAL(4,3) NOT NULL DEFAULT 0.3 COMMENT '岗位价值权重',
        performance_weight DECIMAL(4,3) NOT NULL DEFAULT 0.2 COMMENT '绩效表现权重',
        
        -- 利润贡献度子权重
        profit_direct_contribution_weight DECIMAL(4,3) NOT NULL DEFAULT 0.4 COMMENT '利润-直接贡献权重',
        profit_workload_weight DECIMAL(4,3) NOT NULL DEFAULT 0.3 COMMENT '利润-工作量权重',
        profit_quality_weight DECIMAL(4,3) NOT NULL DEFAULT 0.2 COMMENT '利润-质量权重',
        profit_position_value_weight DECIMAL(4,3) NOT NULL DEFAULT 0.1 COMMENT '利润-岗位价值权重',
        
        -- 岗位价值子权重
        position_skill_complexity_weight DECIMAL(4,3) NOT NULL DEFAULT 0.25 COMMENT '岗位-技能复杂度权重',
        position_responsibility_weight DECIMAL(4,3) NOT NULL DEFAULT 0.3 COMMENT '岗位-责任范围权重',
        position_decision_impact_weight DECIMAL(4,3) NOT NULL DEFAULT 0.2 COMMENT '岗位-决策影响权重',
        position_experience_weight DECIMAL(4,3) NOT NULL DEFAULT 0.15 COMMENT '岗位-经验要求权重',
        position_market_value_weight DECIMAL(4,3) NOT NULL DEFAULT 0.1 COMMENT '岗位-市场价值权重',
        
        -- 绩效表现子权重
        performance_work_output_weight DECIMAL(4,3) NOT NULL DEFAULT 0.25 COMMENT '绩效-工作产出权重',
        performance_work_quality_weight DECIMAL(4,3) NOT NULL DEFAULT 0.2 COMMENT '绩效-工作质量权重',
        performance_work_efficiency_weight DECIMAL(4,3) NOT NULL DEFAULT 0.15 COMMENT '绩效-工作效率权重',
        performance_collaboration_weight DECIMAL(4,3) NOT NULL DEFAULT 0.15 COMMENT '绩效-协作能力权重',
        performance_innovation_weight DECIMAL(4,3) NOT NULL DEFAULT 0.1 COMMENT '绩效-创新能力权重',
        performance_leadership_weight DECIMAL(4,3) NOT NULL DEFAULT 0.1 COMMENT '绩效-领导力权重',
        performance_learning_weight DECIMAL(4,3) NOT NULL DEFAULT 0.05 COMMENT '绩效-学习能力权重',
        
        -- 调整系数配置
        excellence_bonus DECIMAL(4,3) NOT NULL DEFAULT 0.2 COMMENT '卓越表现奖励系数',
        performance_multiplier DECIMAL(4,3) NOT NULL DEFAULT 1.5 COMMENT '绩效乘数',
        position_level_multiplier DECIMAL(4,3) NOT NULL DEFAULT 1.2 COMMENT '岗位等级乘数',
        
        -- 适用范围配置
        applicable_business_lines JSON COMMENT '适用业务线ID列表',
        applicable_departments JSON COMMENT '适用部门ID列表',
        applicable_position_levels JSON COMMENT '适用岗位等级列表',
        applicable_employee_types JSON COMMENT '适用员工类型列表',
        
        -- 计算方法配置
        calculation_method VARCHAR(50) NOT NULL DEFAULT 'weighted_sum' COMMENT '计算方法：加权和/加权积/混合/自定义',
        normalization_method VARCHAR(30) NOT NULL DEFAULT 'z_score' COMMENT '标准化方法',
        
        -- 高级配置
        weight_adjustment_rules JSON COMMENT '权重调整规则JSON',
        conditional_weights JSON COMMENT '条件权重配置JSON',
        custom_formula TEXT COMMENT '自定义计算公式',
        
        -- 生效时间和版本
        effective_date DATETIME NOT NULL COMMENT '生效日期',
        expiry_date DATETIME COMMENT '失效日期',
        version VARCHAR(20) NOT NULL DEFAULT '1.0' COMMENT '版本号',
        parent_config_id INT COMMENT '父配置ID（版本追踪）',
        
        -- 使用统计
        usage_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
        last_used_at DATETIME COMMENT '最后使用时间',
        
        status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '状态：草稿/生效/失效/归档',
        created_by INT NOT NULL,
        updated_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_weight_config_status_effective (status, effective_date),
        INDEX idx_weight_config_date_range (effective_date, expiry_date),
        INDEX idx_weight_config_usage (usage_count, last_used_at),
        UNIQUE KEY unique_weight_config_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维模型权重配置表';
    `;
    
    await databaseManager.query(createTableSQL);
    console.log('✅ ThreeDimensionalWeightConfig 表已创建');

    // 创建 three_dimensional_calculation_results 表
    const createResultsTableSQL = `
      CREATE TABLE IF NOT EXISTS three_dimensional_calculation_results (
        id VARCHAR(50) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        weight_config_id INT NOT NULL DEFAULT 0,
        calculation_period VARCHAR(20) NOT NULL,
        bonus_pool_id VARCHAR(50) DEFAULT NULL,

        -- 原始维度得分
        profit_contribution_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        position_value_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        performance_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,

        -- 标准化得分
        normalized_profit_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        normalized_position_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        normalized_performance_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,

        -- 加权得分
        weighted_profit_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        weighted_position_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        weighted_performance_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,

        -- 综合得分
        total_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
        final_score DECIMAL(8,4) NOT NULL DEFAULT 0.0000,

        -- 排名与奖金
        score_rank INT DEFAULT NULL,
        percentile_rank DECIMAL(5,2) DEFAULT NULL,
        department_rank INT DEFAULT NULL,
        level_rank INT DEFAULT NULL,
        bonus_coefficient DECIMAL(6,4) DEFAULT NULL,
        base_bonus_amount DECIMAL(12,2) DEFAULT NULL,
        adjustment_amount DECIMAL(12,2) DEFAULT NULL,
        final_bonus_amount DECIMAL(12,2) DEFAULT NULL,

        -- 各维度权重比例
        profit_contribution_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        position_value_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        performance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,

        -- 详细计算数据
        profit_calculation_details JSON DEFAULT NULL,
        position_calculation_details JSON DEFAULT NULL,
        performance_calculation_details JSON DEFAULT NULL,
        calculation_method VARCHAR(50) NOT NULL DEFAULT 'weighted_sum',
        calculation_params JSON DEFAULT NULL,

        -- 数据版本与质量
        profit_data_version VARCHAR(50) DEFAULT NULL,
        position_data_version VARCHAR(50) DEFAULT NULL,
        performance_data_version VARCHAR(50) DEFAULT NULL,
        data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        calculation_confidence DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        outlier_flag TINYINT(1) NOT NULL DEFAULT 0,
        outlier_reason VARCHAR(200) DEFAULT NULL,

        -- 审核信息
        review_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        review_comments TEXT,
        reviewed_by INT DEFAULT NULL,
        reviewed_at DATETIME DEFAULT NULL,

        -- 时间戳与状态
        score_change_rate DECIMAL(6,2) DEFAULT NULL,
        trend_direction VARCHAR(20) DEFAULT NULL,
        calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TINYINT NOT NULL DEFAULT 1,
        created_by VARCHAR(50) NOT NULL,
        updated_by VARCHAR(50) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        UNIQUE KEY unique_employee_config_period (employee_id, weight_config_id, calculation_period),
        INDEX idx_calculation_result_employee_period (employee_id, calculation_period),
        INDEX idx_calculation_result_config_period (weight_config_id, calculation_period),
        INDEX idx_calculation_result_period_score (calculation_period, final_score),
        INDEX idx_calculation_result_pool_score (bonus_pool_id, final_score),
        INDEX idx_calculation_result_review_time (review_status, calculated_at),
        INDEX idx_calculation_result_rankings (score_rank, percentile_rank)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维模型计算结果表';
    `;

    await databaseManager.query(createResultsTableSQL);
    console.log('✅ ThreeDimensionalCalculationResult 表已创建');
    
    console.log('数据库同步完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    process.exit(1);
  }
}

// 运行同步
syncDatabase();