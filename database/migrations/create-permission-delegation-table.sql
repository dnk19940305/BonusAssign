-- 创建权限委派表
CREATE TABLE IF NOT EXISTS `permission_delegations` (
  `id` varchar(50) NOT NULL COMMENT '委派ID',
  `delegator_id` varchar(50) NOT NULL COMMENT '委派者ID',
  `delegatee_id` varchar(50) NOT NULL COMMENT '被委派者ID',
  `permissions` json NOT NULL COMMENT '委派的权限列表',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型',
  `resource_id` varchar(50) DEFAULT NULL COMMENT '资源ID',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态：pending-待审批，active-激活，inactive-未激活，expired-已过期',
  `approval_required` tinyint(1) DEFAULT '0' COMMENT '是否需要审批',
  `reason` text COMMENT '委派原因',
  `conditions` json DEFAULT NULL COMMENT '附加条件',
  `created_by` varchar(50) NOT NULL COMMENT '创建人ID',
  `updated_by` varchar(50) NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_delegator_id` (`delegator_id`),
  KEY `idx_delegatee_id` (`delegatee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限委派表';