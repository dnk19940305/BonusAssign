-- 里程碑影响分析相关表

-- 1. 里程碑影响分析记录表
CREATE TABLE IF NOT EXISTS milestone_impact_analysis (
  id VARCHAR(50) PRIMARY KEY COMMENT '分析ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  analysis_type VARCHAR(50) NOT NULL COMMENT '分析类型: delay/change/delete',
  original_date DATE COMMENT '原始目标日期',
  new_date DATE COMMENT '新目标日期',
  delay_days INT COMMENT '延期天数',
  affected_milestones_count INT DEFAULT 0 COMMENT '受影响的里程碑数量',
  affected_milestone_ids JSON COMMENT '受影响的里程碑ID列表',
  impact_level VARCHAR(20) DEFAULT 'low' COMMENT '影响级别: low/medium/high/critical',
  is_critical_path BOOLEAN DEFAULT FALSE COMMENT '是否在关键路径上',
  project_delay_days INT DEFAULT 0 COMMENT '导致项目延期天数',
  dependency_chain JSON COMMENT '依赖链数据',
  risk_assessment TEXT COMMENT '风险评估描述',
  suggestions TEXT COMMENT '建议措施',
  analyzed_by VARCHAR(50) COMMENT '分析人ID',
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '分析时间',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/reviewed/approved',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_analysis_type (analysis_type),
  INDEX idx_analyzed_at (analyzed_at),
  INDEX idx_impact_level (impact_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑影响分析记录表';

-- 2. 项目关键路径表
CREATE TABLE IF NOT EXISTS project_critical_paths (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  path_data JSON NOT NULL COMMENT '关键路径数据(里程碑ID数组)',
  total_duration INT COMMENT '总持续时间(天)',
  earliest_finish_date DATE COMMENT '最早完成日期',
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  is_current BOOLEAN DEFAULT TRUE COMMENT '是否为最新版本',
  INDEX idx_project_id (project_id),
  INDEX idx_is_current (is_current),
  INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目关键路径表';

-- 3. 里程碑依赖关系缓存表(用于快速查询)
CREATE TABLE IF NOT EXISTS milestone_dependency_cache (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  all_predecessors JSON COMMENT '所有前置里程碑(递归)',
  all_successors JSON COMMENT '所有后续里程碑(递归)',
  depth_from_start INT DEFAULT 0 COMMENT '距离起点的深度',
  depth_to_end INT DEFAULT 0 COMMENT '距离终点的深度',
  is_on_critical_path BOOLEAN DEFAULT FALSE COMMENT '是否在关键路径上',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_milestone (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_critical_path (is_on_critical_path),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑依赖关系缓存表';
