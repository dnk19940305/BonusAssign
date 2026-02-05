-- 添加缺失的岗位分类
-- 注意：如果分类已存在，执行时会报错，这是正常的

-- 添加前端开发子分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_tech_fe', '前端开发', 'TECH_FE', 'sub', 'cat_tech', 2, 11, '前端开发岗位', 'el-icon-monitor', '#67c23a', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 添加后端开发子分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_tech_be', '后端开发', 'TECH_BE', 'sub', 'cat_tech', 2, 12, '后端开发岗位', 'el-icon-data-line', '#409eff', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 添加产品设计主分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_product', '产品设计', 'PRODUCT', 'main', NULL, 1, 2, '产品设计相关岗位', 'el-icon-edit', '#67c23a', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 添加视觉设计主分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_design', '视觉设计', 'DESIGN', 'main', NULL, 1, 3, '视觉设计相关岗位', 'el-icon-picture', '#e6a23c', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 添加运营市场主分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_operation', '运营市场', 'OPERATION', 'main', NULL, 1, 4, '运营市场相关岗位', 'el-icon-data-analysis', '#f56c6c', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 添加职能支持主分类
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active, position_count) 
VALUES ('cat_support', '职能支持', 'SUPPORT', 'main', NULL, 1, 5, '职能支持相关岗位', 'el-icon-files', '#909399', 1, 0)
ON DUPLICATE KEY UPDATE name = name;

-- 为现有岗位分配新分类
UPDATE positions SET category_id = 'cat_product' 
WHERE (name LIKE '%产品%' OR code LIKE '%PRODUCT%') 
  AND category_id IS NULL;

UPDATE positions SET category_id = 'cat_design' 
WHERE (name LIKE '%设计%' OR name LIKE '%UI%' OR name LIKE '%UX%') 
  AND category_id IS NULL;

UPDATE positions SET category_id = 'cat_operation' 
WHERE (name LIKE '%运营%' OR name LIKE '%市场%' OR name LIKE '%营销%') 
  AND category_id IS NULL;

UPDATE positions SET category_id = 'cat_support' 
WHERE (name LIKE '%行政%' OR name LIKE '%人事%' OR name LIKE '%财务%') 
  AND category_id IS NULL;

UPDATE positions SET category_id = 'cat_tech_fe' 
WHERE (name LIKE '%前端%' OR code LIKE '%FRONTEND%') 
  AND category_id IS NULL;

UPDATE positions SET category_id = 'cat_tech_be' 
WHERE (name LIKE '%后端%' OR code LIKE '%BACKEND%' OR name LIKE '%Java%' OR name LIKE '%Python%') 
  AND category_id IS NULL;
