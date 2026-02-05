-- =====================================================
-- 给岗位表添加分类关联
-- 创建时间: 2026-01-16
-- 功能: 将岗位与岗位分类表关联，实现分类筛选功能
-- =====================================================

-- 添加 category_id 字段到 positions 表
ALTER TABLE positions 
ADD COLUMN category_id VARCHAR(50) COMMENT '岗位分类ID' AFTER line_id,
ADD INDEX idx_category_id (category_id),
ADD CONSTRAINT fk_positions_category 
  FOREIGN KEY (category_id) 
  REFERENCES position_categories(id) 
  ON DELETE SET NULL;

-- =====================================================
-- 为现有岗位分配分类（根据岗位名称自动匹配）
-- =====================================================

-- 技术研发 - 算法工程师
UPDATE positions SET category_id = 'cat_tech_algorithm' 
WHERE name LIKE '%算法%';

-- 技术研发 - 软件工程师
UPDATE positions SET category_id = 'cat_tech_software' 
WHERE name IN ('开发工程师', '高级开发工程师', '软件工程师') 
   OR name LIKE '%软件%' 
   OR name LIKE '%开发%';

-- 技术研发 - 硬件工程师
UPDATE positions SET category_id = 'cat_tech_hardware' 
WHERE name LIKE '%硬件%';

-- 项目管理 - 项目经理
UPDATE positions SET category_id = 'cat_management' 
WHERE name IN ('项目经理', '产品经理', '高级产品经理', '产品专员', '产品总监')
   OR name LIKE '%项目%' 
   OR name LIKE '%产品%';

-- 售前业务
UPDATE positions SET category_id = 'cat_presale' 
WHERE name LIKE '%售前%' 
   OR name LIKE '%实施%' 
   OR name LIKE '%咨询%'
   OR name LIKE '%顾问%';

-- 技术管理
UPDATE positions SET category_id = 'cat_tech_mgmt' 
WHERE name IN ('技术总监', 'CTO', '技术经理')
   OR (name LIKE '%技术%' AND name LIKE '%总监%');

-- 综合运营
UPDATE positions SET category_id = 'cat_ops' 
WHERE name IN ('人事行政专员', '市场专员', '商务经理', '财务经理', '市场工程总监')
   OR name LIKE '%运营%' 
   OR name LIKE '%市场%' 
   OR name LIKE '%商务%'
   OR name LIKE '%财务%'
   OR name LIKE '%人事%'
   OR name LIKE '%行政%';

-- 部门经理和总经理默认到项目管理
UPDATE positions SET category_id = 'cat_management' 
WHERE name IN ('部门经理', '总经理', '大客户总监') 
  AND category_id IS NULL;

-- 技术支持和测试
UPDATE positions SET category_id = 'cat_tech_software' 
WHERE name IN ('技术支持专员', '测试', '网络运维') 
  AND category_id IS NULL;

-- =====================================================
-- 验证数据
-- =====================================================
-- 查看未分类的岗位
-- SELECT id, name, code, category_id FROM positions WHERE category_id IS NULL;

-- 查看各分类的岗位数量
-- SELECT 
--   pc.name as category_name, 
--   COUNT(p.id) as position_count
-- FROM position_categories pc
-- LEFT JOIN positions p ON p.category_id = pc.id
-- WHERE pc.type = 'main'
-- GROUP BY pc.id, pc.name
-- ORDER BY pc.sort_order;
