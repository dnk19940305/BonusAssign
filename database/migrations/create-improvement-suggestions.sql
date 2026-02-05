-- 创建改进建议表
CREATE TABLE IF NOT EXISTS improvement_suggestions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '建议ID',
  employee_id VARCHAR(50) NOT NULL COMMENT '关联员工ID',
  employee_name VARCHAR(100) COMMENT '员工姓名',
  title VARCHAR(200) NOT NULL COMMENT '建议标题',
  description TEXT COMMENT '建议详细描述',
  category VARCHAR(50) NOT NULL COMMENT '建议分类: performance(绩效), skills(技能), projects(项目), collaboration(协作)',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' COMMENT '优先级: high, medium, low',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending(待处理), in_progress(进行中), completed(已完成)',
  potential_impact INT COMMENT '预期影响百分比',
  time_frame VARCHAR(50) COMMENT '时间框架',
  source VARCHAR(50) NOT NULL DEFAULT 'manual' COMMENT '来源: manual(手动录入), auto(自动生成)',
  created_by VARCHAR(50) COMMENT '创建人ID',
  created_by_name VARCHAR(100) COMMENT '创建人姓名',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  completed_at DATETIME COMMENT '完成时间',
  feedback TEXT COMMENT '反馈内容',
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='改进建议表';
