-- 为 profit_data 表添加缺失的字段
USE bonus_system;

-- 添加数据来源字段
ALTER TABLE `profit_data` 
ADD COLUMN `data_source` VARCHAR(20) DEFAULT 'manual' COMMENT '数据来源: manual-手工录入, import-批量导入, integration-系统集成' AFTER `project_id`;

-- 添加备注字段
ALTER TABLE `profit_data` 
ADD COLUMN `remarks` TEXT COMMENT '备注说明' AFTER `data_source`;

-- 添加创建人字段
ALTER TABLE `profit_data` 
ADD COLUMN `created_by` VARCHAR(50) COMMENT '创建人ID' AFTER `remarks`;

-- 添加更新人字段
ALTER TABLE `profit_data` 
ADD COLUMN `updated_by` VARCHAR(50) COMMENT '更新人ID' AFTER `created_by`;

-- 更新现有数据的默认值
UPDATE `profit_data` SET `data_source` = 'integration' WHERE `data_source` IS NULL;
