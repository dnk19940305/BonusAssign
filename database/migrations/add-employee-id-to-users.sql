-- 为 users 表添加 employee_id 字段，建立与 employees 表的正式关联
-- 执行时间: 2025-12-29

-- 1. 添加 employee_id 字段
ALTER TABLE `users` 
ADD COLUMN `employee_id` VARCHAR(50) NULL COMMENT '员工ID，关联employees表' AFTER `real_name`;

-- 2. 创建索引
ALTER TABLE `users` 
ADD INDEX `idx_users_employee_id` (`employee_id`);

-- 3. 添加外键约束（可选，如果需要强制完整性）
-- ALTER TABLE `users` 
-- ADD CONSTRAINT `fk_users_employee_id` 
-- FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. 根据姓名匹配更新现有数据
UPDATE `users` u
INNER JOIN `employees` e ON u.real_name = e.name
SET u.employee_id = e.id
WHERE u.employee_id IS NULL;

-- 5. 验证更新结果
SELECT 
    u.id,
    u.username,
    u.real_name,
    u.employee_id,
    e.name as employee_name,
    e.employee_no
FROM users u
LEFT JOIN employees e ON u.employee_id = e.id
ORDER BY u.username;

-- 说明：
-- 1. employee_id 允许为 NULL，因为有些用户可能不对应实际员工（如系统管理员）
-- 2. 外键约束默认注释掉，如果需要强制完整性可以取消注释
-- 3. 自动根据姓名匹配更新现有用户的 employee_id
-- 4. 未来新增用户时应直接指定 employee_id
