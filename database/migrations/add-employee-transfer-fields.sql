-- 添加员工调动相关字段
-- 创建时间: 2025-12-24

USE bonus_system;

-- 添加调动原因字段
ALTER TABLE employees 
ADD COLUMN transfer_reason VARCHAR(500) COMMENT '调动原因' AFTER resign_reason;

-- 添加生效日期字段
ALTER TABLE employees 
ADD COLUMN effective_date DATE COMMENT '调动生效日期' AFTER transfer_reason;

-- 验证字段添加
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    COLUMN_COMMENT 
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = 'bonus_system' 
    AND TABLE_NAME = 'employees' 
    AND COLUMN_NAME IN ('transfer_reason', 'effective_date');
