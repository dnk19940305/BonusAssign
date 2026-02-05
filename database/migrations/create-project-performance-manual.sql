-- 创建项目成员手动绩效录入表
DROP TABLE IF EXISTS `project_performance_manual`;
CREATE TABLE `project_performance_manual` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录ID',
  `pool_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `employee_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工姓名',
  `period` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '绩效期间',
  `profit_contribution` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '利润贡献值',
  `position_value` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '岗位价值值',
  `performance_score` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '绩效表现值',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'draft' COMMENT '状态：draft-草稿，submitted-已提交，calculated-已计算',
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人ID',
  `updated_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pool_employee` (`pool_id`, `employee_id`),
  KEY `idx_period` (`period`),
  KEY `idx_employee` (`employee_id`),
  CONSTRAINT `project_performance_manual_ibfk_1` FOREIGN KEY (`pool_id`) REFERENCES `project_bonus_pools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_performance_manual_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员手动绩效录入表';
