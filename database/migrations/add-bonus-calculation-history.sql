-- =====================================================
-- 添加奖金池计算历史记录表
-- 用途: 记录每次奖金计算的历史，支持重新计算和历史追溯
-- =====================================================

USE bonus_system;

-- 创建奖金池计算历史记录表
CREATE TABLE IF NOT EXISTS `project_bonus_calculation_history` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算历史ID',
  `pool_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `project_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `calculation_number` int NOT NULL COMMENT '计算次数（第几次计算）',
  `total_amount` decimal(15,2) NOT NULL COMMENT '奖金总额',
  `member_count` int NOT NULL COMMENT '成员数量',
  `total_weight` decimal(15,4) NOT NULL COMMENT '总权重',
  `calculation_data` json DEFAULT NULL COMMENT '计算详情（成员分配明细）',
  `calculated_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算人ID',
  `calculated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  `is_current` tinyint(1) DEFAULT 1 COMMENT '是否为当前有效计算（1=是，0=历史记录）',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_pool_id` (`pool_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_calculated_at` (`calculated_at`),
  KEY `idx_is_current` (`is_current`),
  CONSTRAINT `fk_calculation_history_pool` FOREIGN KEY (`pool_id`) REFERENCES `project_bonus_pools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目奖金池计算历史记录表';

-- 添加索引提升查询性能
CREATE INDEX `idx_pool_calculation` ON `project_bonus_calculation_history` (`pool_id`, `calculation_number`);
