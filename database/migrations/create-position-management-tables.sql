-- =====================================================
-- 岗位管理设置相关数据表
-- 创建时间: 2024-12-24
-- 包含: 岗位分类、技能标签、职业路径模板
-- =====================================================

-- =====================================================
-- 1. 岗位分类表 (position_categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS position_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类代码',
  type ENUM('main', 'sub') NOT NULL DEFAULT 'main' COMMENT '分类类型: main-主分类, sub-子分类',
  parent_id VARCHAR(50) DEFAULT NULL COMMENT '父分类ID',
  level INT NOT NULL DEFAULT 1 COMMENT '层级: 1-主分类, 2-子分类',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  description TEXT COMMENT '分类描述',
  icon VARCHAR(100) COMMENT '图标',
  color VARCHAR(20) COMMENT '颜色',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  position_count INT NOT NULL DEFAULT 0 COMMENT '关联岗位数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_type (type),
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_active (is_active),
  FOREIGN KEY (parent_id) REFERENCES position_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位分类表';

-- =====================================================
-- 2. 技能分类表 (skill_categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  description TEXT COMMENT '分类描述',
  color VARCHAR(20) NOT NULL DEFAULT '#409eff' COMMENT '分类颜色',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  skill_count INT NOT NULL DEFAULT 0 COMMENT '关联技能数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能分类表';

-- =====================================================
-- 3. 技能标签表 (skill_tags)
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_tags (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '标签名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '标签代码',
  category_id VARCHAR(50) NOT NULL COMMENT '所属分类ID',
  level ENUM('basic', 'intermediate', 'advanced', 'expert') NOT NULL DEFAULT 'basic' COMMENT '技能等级',
  description TEXT COMMENT '标签描述',
  synonyms JSON COMMENT '同义词列表',
  related_skills JSON COMMENT '相关技能ID列表',
  usage_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  is_system BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否系统预设',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id),
  INDEX idx_level (level),
  INDEX idx_is_active (is_active),
  INDEX idx_usage_count (usage_count),
  FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能标签表';

-- =====================================================
-- 4. 职业路径模板表 (career_path_templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS career_path_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT '模板名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '模板代码',
  level VARCHAR(20) NOT NULL COMMENT '适用职级',
  category VARCHAR(50) NOT NULL COMMENT '岗位类别',
  description TEXT COMMENT '模板描述',
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0' COMMENT '版本号',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否默认模板',
  usage_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
  status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft' COMMENT '状态',
  
  -- 职业路径配置
  next_level VARCHAR(100) COMMENT '下一级别',
  estimated_time VARCHAR(50) COMMENT '预计晋升时间',
  lateral_moves JSON COMMENT '横向发展岗位',
  specializations JSON COMMENT '专业方向',
  growth_areas JSON COMMENT '成长领域',
  
  -- 晋升要求
  min_experience VARCHAR(100) COMMENT '最低经验',
  skill_assessment VARCHAR(200) COMMENT '技能评估',
  project_contribution VARCHAR(200) COMMENT '项目贡献',
  performance_level VARCHAR(50) COMMENT '绩效等级',
  
  -- 技能发展
  core_skills JSON COMMENT '核心技能',
  advanced_skills JSON COMMENT '进阶技能',
  leadership_skills JSON COMMENT '领导力技能',
  
  -- 学习路径
  courses JSON COMMENT '推荐课程',
  certifications JSON COMMENT '推荐认证',
  projects JSON COMMENT '推荐项目',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_level (level),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_is_active (is_active),
  INDEX idx_is_default (is_default),
  INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='职业路径模板表';

-- =====================================================
-- 插入初始数据
-- =====================================================

-- 岗位分类初始数据
INSERT INTO position_categories (id, name, code, type, level, sort_order, description, icon, color, is_active) VALUES
('cat_tech', '技术研发', 'TECH', 'main', 1, 1, '技术研发相关岗位', 'icon-tech', '#409eff', TRUE),
('cat_management', '项目管理', 'MANAGEMENT', 'main', 1, 2, '项目管理相关岗位', 'icon-management', '#e6a23c', TRUE),
('cat_presale', '售前业务', 'PRESALE', 'main', 1, 3, '售前业务相关岗位', 'icon-presale', '#67c23a', TRUE),
('cat_tech_mgmt', '技术管理', 'TECH_MANAGEMENT', 'main', 1, 4, '技术管理相关岗位', 'icon-tech-mgmt', '#f56c6c', TRUE),
('cat_ops', '综合运营', 'COMPREHENSIVE_OPS', 'main', 1, 5, '综合运营相关岗位', 'icon-ops', '#909399', TRUE);

INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active) VALUES
('cat_tech_algorithm', '算法工程师', 'ALGORITHM', 'sub', 'cat_tech', 2, 1, '算法相关岗位', 'icon-algorithm', '#67c23a', TRUE),
('cat_tech_software', '软件工程师', 'SOFTWARE', 'sub', 'cat_tech', 2, 2, '软件相关岗位', 'icon-software', '#409eff', TRUE),
('cat_tech_hardware', '硬件工程师', 'HARDWARE', 'sub', 'cat_tech', 2, 3, '硬件相关岗位', 'icon-hardware', '#e6a23c', TRUE);

-- 技能分类初始数据
INSERT INTO skill_categories (id, name, description, color, sort_order) VALUES
('skillcat_management', '管理技能', '管理相关的技能标签', '#409eff', 1),
('skillcat_technical', '技术技能', '技术相关的技能标签', '#67c23a', 2),
('skillcat_business', '业务技能', '业务相关的技能标签', '#e6a23c', 3),
('skillcat_soft', '软技能', '软技能相关的标签', '#f56c6c', 4);

-- 技能标签初始数据
INSERT INTO skill_tags (id, name, code, category_id, level, description, synonyms, related_skills, is_active, is_system) VALUES
('skill_pm', '项目管理', 'PROJECT_MANAGEMENT', 'skillcat_management', 'intermediate', '项目规划、执行、监控和收尾的能力', '["项目协调", "项目统筹"]', '[]', TRUE, TRUE),
('skill_team', '团队协调', 'TEAM_COORDINATION', 'skillcat_management', 'basic', '团队内部协调和沟通能力', '["团队协作", "团队管理"]', '["skill_pm"]', TRUE, TRUE),
('skill_coding', '编程开发', 'CODING', 'skillcat_technical', 'intermediate', '编程和软件开发能力', '["代码编写", "软件开发"]', '[]', TRUE, TRUE),
('skill_architecture', '架构设计', 'ARCHITECTURE', 'skillcat_technical', 'advanced', '系统架构设计能力', '["系统设计", "技术架构"]', '["skill_coding"]', TRUE, TRUE);

-- 职业路径模板初始数据
INSERT INTO career_path_templates (
  id, name, code, level, category, description, version, is_active, is_default, status,
  next_level, estimated_time, lateral_moves, specializations, growth_areas,
  min_experience, skill_assessment, project_contribution, performance_level,
  core_skills, advanced_skills, leadership_skills,
  courses, certifications, projects
) VALUES (
  'template_p3_tech',
  'P3技术工程师发展路径',
  'P3_TECH_ENGINEER',
  'P3',
  'tech',
  'P3技术工程师的标准职业发展路径模板',
  '1.0.0',
  TRUE,
  TRUE,
  'active',
  'P4高级工程师',
  '2-3年',
  '["产品经理", "项目经理"]',
  '["前端开发", "后端开发", "移动开发"]',
  '["技术深度", "业务理解", "团队协作"]',
  '2年以上',
  '通过技术考核',
  '主导过2个以上项目',
  'B级及以上',
  '["编程语言", "框架使用", "数据库操作"]',
  '["架构设计", "性能优化", "安全防护"]',
  '["技术指导", "代码审查", "技术分享"]',
  '["高级编程技术", "软件架构设计", "性能优化实践"]',
  '["相关技术认证", "项目管理认证"]',
  '["开源项目贡献", "技术博客写作"]'
);

-- =====================================================
-- 视图和权限（可选）
-- =====================================================

-- 创建岗位分类树形视图（便于查询）
CREATE OR REPLACE VIEW v_position_category_tree AS
SELECT 
  c1.id,
  c1.name,
  c1.code,
  c1.type,
  c1.parent_id,
  c1.level,
  c1.sort_order,
  c1.is_active,
  c1.position_count,
  c2.name as parent_name,
  c2.code as parent_code
FROM position_categories c1
LEFT JOIN position_categories c2 ON c1.parent_id = c2.id
WHERE c1.is_active = TRUE
ORDER BY c1.level, c1.sort_order;

-- =====================================================
-- 触发器：更新分类岗位数量
-- =====================================================
DELIMITER //

-- 当岗位分类关联变化时，更新分类的position_count
-- 注意: 这个触发器需要根据实际的岗位表结构进行调整
-- 假设岗位表有category_id字段关联到position_categories

-- 触发器示例（需要根据实际情况调整）
-- CREATE TRIGGER update_category_position_count_after_insert
-- AFTER INSERT ON positions
-- FOR EACH ROW
-- BEGIN
--   UPDATE position_categories 
--   SET position_count = position_count + 1 
--   WHERE id = NEW.category_id;
-- END//

DELIMITER ;

-- =====================================================
-- 完成
-- =====================================================
