-- 创建项目状态变更历史表
-- 用于记录项目协作状态的所有变更，便于审计和追溯

USE bonus_system;

CREATE TABLE IF NOT EXISTS project_state_history (
  id VARCHAR(36) PRIMARY KEY COMMENT '记录ID',
  project_id VARCHAR(36) NOT NULL COMMENT '项目ID',
  from_status VARCHAR(50) DEFAULT NULL COMMENT '变更前状态',
  to_status VARCHAR(50) NOT NULL COMMENT '变更后状态',
  reason VARCHAR(255) DEFAULT NULL COMMENT '变更原因',
  metadata JSON DEFAULT NULL COMMENT '元数据（JSON格式，存储申请ID、审批人等信息）',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at),
  INDEX idx_to_status (to_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目状态变更历史表';
