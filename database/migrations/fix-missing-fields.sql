-- =====================================================
-- 修复缺失的字段
-- =====================================================

USE bonus_system;

-- 1. 给 project_bonus_calculation_history 表添加时间戳字段
ALTER TABLE `project_bonus_calculation_history`
ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' AFTER `notes`,
ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `created_at`;

-- 2. 给 projects 表添加 bonus_status 字段
ALTER TABLE `projects`
ADD COLUMN `bonus_status` varchar(20) DEFAULT NULL COMMENT '奖金状态：pending-待计算, calculated-已计算, approved-已审批, distributed-已发放' AFTER `cooperation_status`;

-- 3. 添加索引优化查询
CREATE INDEX `idx_bonus_status` ON `projects` (`bonus_status`);

SELECT '✅ 字段修复完成！' AS message;
