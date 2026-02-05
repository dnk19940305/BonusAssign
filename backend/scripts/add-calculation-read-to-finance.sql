-- 为财务管理员角色添加 calculation:read 权限
-- 使用前请先备份数据库

-- 查看当前财务角色权限
SELECT id, name, permissions FROM roles WHERE name = '财务管理员' OR code = 'finance';

-- 更新财务角色权限(添加 calculation:read)
-- 注意: 需要根据实际数据库中的 JSON 格式调整
UPDATE roles 
SET permissions = json_insert(permissions, '$[#]', 'calculation:read')
WHERE (name = '财务管理员' OR code = 'finance')
  AND json_type(permissions, '$.calculation:read') IS NULL;

-- 验证更新结果
SELECT id, name, permissions FROM roles WHERE name = '财务管理员' OR code = 'finance';
