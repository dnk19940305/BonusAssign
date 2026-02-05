-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

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
