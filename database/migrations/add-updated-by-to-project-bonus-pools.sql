-- =====================================================
-- 添加 updated_by 字段到 project_bonus_pools 表
-- 用途: 记录奖金池的最后更新人
-- =====================================================

USE bonus_system;

-- 检查字段是否已存在，如果不存在则添加
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bonus_system' 
    AND TABLE_NAME = 'project_bonus_pools' 
    AND COLUMN_NAME = 'updated_by'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `project_bonus_pools` ADD COLUMN `updated_by` VARCHAR(50) NULL COMMENT ''更新人ID'' AFTER `created_by`', 
    'SELECT ''Column already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;