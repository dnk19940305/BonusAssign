-- 角色创建时同时分配菜单权限的说明
-- 这个脚本不是直接执行的，而是说明后端逻辑变更
-- 实际逻辑在后端代码中实现

-- 由于角色权限迁移脚本已经创建了role_permissions表，这里不再重复创建
-- 现有结构已经支持角色和菜单权限的分离管理

-- 验证表结构
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bonus_system' AND TABLE_NAME IN ('roles', 'role_menus', 'role_permissions')
ORDER BY TABLE_NAME, ORDINAL_POSITION;