-- 里程碑与奖金挂钩相关表

-- 1. 里程碑奖金配置表
CREATE TABLE IF NOT EXISTS milestone_bonus_config (
  id VARCHAR(50) PRIMARY KEY COMMENT '配置ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  bonus_weight DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '奖金权重(%)',
  base_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '基础奖金金额',
  completion_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '完成奖金',
  quality_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '质量奖金',
  on_time_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '按时完成奖金',
  delay_penalty_rate DECIMAL(5,2) DEFAULT 10 COMMENT '延期惩罚率(%/天)',
  max_penalty_rate DECIMAL(5,2) DEFAULT 50 COMMENT '最大惩罚率(%)',
  is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_milestone (milestone_id),
  INDEX idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑奖金配置表';

-- 2. 里程碑奖金计算记录表
CREATE TABLE IF NOT EXISTS milestone_bonus_calculations (
  id VARCHAR(50) PRIMARY KEY COMMENT '计算ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  calculation_date DATETIME NOT NULL COMMENT '计算时间',
  calculated_by VARCHAR(50) COMMENT '计算人(null为系统自动)',
  base_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '基础奖金',
  completion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '完成率(%)',
  completion_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '完成奖金',
  quality_score DECIMAL(5,2) DEFAULT 0 COMMENT '质量得分',
  quality_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '质量奖金',
  delay_days INT DEFAULT 0 COMMENT '延期天数',
  delay_penalty DECIMAL(12,2) DEFAULT 0 COMMENT '延期扣减',
  on_time_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '按时奖金',
  total_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '总奖金',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/approved/distributed',
  approved_by VARCHAR(50) COMMENT '审核人',
  approved_at DATETIME COMMENT '审核时间',
  distributed_at DATETIME COMMENT '发放时间',
  notes TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_calculation_date (calculation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑奖金计算记录表';

-- 3. 里程碑成员奖金分配表
CREATE TABLE IF NOT EXISTS milestone_member_bonuses (
  id VARCHAR(50) PRIMARY KEY COMMENT '分配ID',
  calculation_id VARCHAR(50) NOT NULL COMMENT '计算记录ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
  role VARCHAR(50) COMMENT '角色',
  contribution_weight DECIMAL(5,2) DEFAULT 0 COMMENT '贡献权重(%)',
  allocated_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '分配奖金',
  performance_score DECIMAL(5,2) COMMENT '个人绩效得分',
  adjustment_amount DECIMAL(12,2) DEFAULT 0 COMMENT '调整金额',
  final_bonus DECIMAL(12,2) DEFAULT 0 COMMENT '最终奖金',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/approved/paid',
  paid_at DATETIME COMMENT '发放时间',
  notes TEXT COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_calculation_id (calculation_id),
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑成员奖金分配表';

-- 4. 里程碑质量评分表
CREATE TABLE IF NOT EXISTS milestone_quality_scores (
  id VARCHAR(50) PRIMARY KEY COMMENT '评分ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  scored_by VARCHAR(50) NOT NULL COMMENT '评分人',
  quality_score DECIMAL(5,2) NOT NULL COMMENT '质量得分(0-100)',
  score_details JSON COMMENT '评分详情',
  comments TEXT COMMENT '评分意见',
  scored_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评分时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_scored_by (scored_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑质量评分表';

-- 5. 项目奖金池表
CREATE TABLE IF NOT EXISTS project_bonus_pools (
  id VARCHAR(50) PRIMARY KEY COMMENT '奖金池ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  total_budget DECIMAL(12,2) NOT NULL COMMENT '总预算',
  allocated_amount DECIMAL(12,2) DEFAULT 0 COMMENT '已分配金额',
  remaining_amount DECIMAL(12,2) DEFAULT 0 COMMENT '剩余金额',
  milestone_allocated DECIMAL(12,2) DEFAULT 0 COMMENT '里程碑已分配',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目奖金池表';
