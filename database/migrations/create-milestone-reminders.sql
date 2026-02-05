-- 里程碑提醒功能相关表

-- 1. 里程碑提醒配置表
CREATE TABLE IF NOT EXISTS milestone_reminder_configs (
  id VARCHAR(50) PRIMARY KEY COMMENT '配置ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  remind_before_days JSON NOT NULL COMMENT '提前提醒天数数组 [1, 3, 7]',
  progress_warning_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用进度预警',
  progress_warning_threshold INT DEFAULT 20 COMMENT '进度滞后阈值(%)',
  dependency_warning_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用依赖阻塞预警',
  overdue_reminder_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用逾期提醒',
  email_notification BOOLEAN DEFAULT FALSE COMMENT '是否发送邮件通知',
  notification_receivers JSON COMMENT '通知接收人ID数组',
  created_by VARCHAR(50) COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  INDEX idx_project_id (project_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑提醒配置表';

-- 2. 里程碑提醒日志表
CREATE TABLE IF NOT EXISTS milestone_reminder_logs (
  id VARCHAR(50) PRIMARY KEY COMMENT '日志ID',
  milestone_id VARCHAR(50) NOT NULL COMMENT '里程碑ID',
  project_id VARCHAR(50) NOT NULL COMMENT '项目ID',
  reminder_type VARCHAR(50) NOT NULL COMMENT '提醒类型: deadline/progress/dependency/overdue',
  reminder_title VARCHAR(200) NOT NULL COMMENT '提醒标题',
  reminder_content TEXT COMMENT '提醒内容',
  priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级: low/normal/high/urgent',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  sent_to JSON COMMENT '接收人ID数组',
  notification_method VARCHAR(50) DEFAULT 'system' COMMENT '通知方式: system/email/dingtalk',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  read_at DATETIME COMMENT '阅读时间',
  status VARCHAR(20) DEFAULT 'sent' COMMENT '状态: sent/read/ignored',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_milestone_id (milestone_id),
  INDEX idx_project_id (project_id),
  INDEX idx_reminder_type (reminder_type),
  INDEX idx_sent_at (sent_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑提醒日志表';

-- 3. 系统通知消息表
CREATE TABLE IF NOT EXISTS system_notifications (
  id VARCHAR(50) PRIMARY KEY COMMENT '通知ID',
  user_id VARCHAR(50) NOT NULL COMMENT '接收用户ID',
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT COMMENT '通知内容',
  type VARCHAR(50) NOT NULL COMMENT '通知类型: milestone/project/bonus/system',
  related_id VARCHAR(50) COMMENT '关联对象ID',
  priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级: low/normal/high/urgent',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  read_at DATETIME COMMENT '阅读时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  expires_at DATETIME COMMENT '过期时间',
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统通知消息表';

-- 插入默认提醒配置(可选)
-- INSERT INTO milestone_reminder_configs (id, project_id, remind_before_days, created_by)
-- SELECT 
--   CONCAT('remind_config_', p.id), 
--   p.id, 
--   JSON_ARRAY(1, 3, 7),
--   1
-- FROM projects p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM milestone_reminder_configs WHERE project_id = p.id
-- );
