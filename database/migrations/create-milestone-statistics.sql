-- 里程碑统计相关表

-- 1. 项目里程碑统计表(每日更新)
CREATE TABLE IF NOT EXISTS project_milestone_statistics (
  id VARCHAR(50) PRIMARY KEY COMMENT '统计ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  total_milestones INT DEFAULT 0 COMMENT '总里程碑数',
  completed_milestones INT DEFAULT 0 COMMENT '已完成里程碑数',
  in_progress_milestones INT DEFAULT 0 COMMENT '进行中里程碑数',
  pending_milestones INT DEFAULT 0 COMMENT '未开始里程碑数',
  delayed_milestones INT DEFAULT 0 COMMENT '延期里程碑数',
  cancelled_milestones INT DEFAULT 0 COMMENT '已取消里程碑数',
  on_time_completed INT DEFAULT 0 COMMENT '按时完成数',
  late_completed INT DEFAULT 0 COMMENT '延期完成数',
  completion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '完成率(%)',
  on_time_rate DECIMAL(5,2) DEFAULT 0 COMMENT '按时完成率(%)',
  delay_rate DECIMAL(5,2) DEFAULT 0 COMMENT '延期率(%)',
  avg_progress DECIMAL(5,2) DEFAULT 0 COMMENT '平均进度(%)',
  avg_delay_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均延期天数',
  critical_path_milestones INT DEFAULT 0 COMMENT '关键路径里程碑数',
  high_risk_milestones INT DEFAULT 0 COMMENT '高风险里程碑数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_project_date (project_id, stat_date),
  INDEX idx_project_id (project_id),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑统计表';

-- 2. 部门里程碑统计表
CREATE TABLE IF NOT EXISTS department_milestone_statistics (
  id VARCHAR(50) PRIMARY KEY COMMENT '统计ID',
  department_id VARCHAR(50) NOT NULL COMMENT '部门ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  total_projects INT DEFAULT 0 COMMENT '项目总数',
  total_milestones INT DEFAULT 0 COMMENT '总里程碑数',
  completed_milestones INT DEFAULT 0 COMMENT '已完成里程碑数',
  delayed_milestones INT DEFAULT 0 COMMENT '延期里程碑数',
  completion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '完成率(%)',
  on_time_rate DECIMAL(5,2) DEFAULT 0 COMMENT '按时完成率(%)',
  avg_delay_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均延期天数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_dept_date (department_id, stat_date),
  INDEX idx_department_id (department_id),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门里程碑统计表';

-- 3. 全局里程碑统计表
CREATE TABLE IF NOT EXISTS global_milestone_statistics (
  id VARCHAR(50) PRIMARY KEY COMMENT '统计ID',
  stat_date DATE NOT NULL COMMENT '统计日期',
  total_projects INT DEFAULT 0 COMMENT '项目总数',
  total_milestones INT DEFAULT 0 COMMENT '总里程碑数',
  completed_milestones INT DEFAULT 0 COMMENT '已完成里程碑数',
  in_progress_milestones INT DEFAULT 0 COMMENT '进行中里程碑数',
  pending_milestones INT DEFAULT 0 COMMENT '未开始里程碑数',
  delayed_milestones INT DEFAULT 0 COMMENT '延期里程碑数',
  completion_rate DECIMAL(5,2) DEFAULT 0 COMMENT '完成率(%)',
  on_time_rate DECIMAL(5,2) DEFAULT 0 COMMENT '按时完成率(%)',
  avg_delay_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均延期天数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_stat_date (stat_date),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全局里程碑统计表';

-- 4. 里程碑趋势数据表(用于图表展示)
CREATE TABLE IF NOT EXISTS milestone_trend_data (
  id VARCHAR(50) PRIMARY KEY COMMENT '记录ID',
  dimension VARCHAR(50) NOT NULL COMMENT '维度: project/department/global',
  dimension_id VARCHAR(50) COMMENT '维度ID(项目ID或部门ID)',
  metric_name VARCHAR(50) NOT NULL COMMENT '指标名称: completion_rate/delay_rate等',
  metric_value DECIMAL(10,2) COMMENT '指标值',
  stat_date DATE NOT NULL COMMENT '统计日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_dimension (dimension, dimension_id),
  INDEX idx_metric (metric_name),
  INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑趋势数据表';
