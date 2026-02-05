-- 岗位分类初始数据
INSERT INTO position_categories (id, name, code, type, level, sort_order, description, icon, color, is_active) VALUES 
('cat_tech', '技术研发', 'TECH', 'main', 1, 1, '技术研发相关岗位', 'icon-tech', '#409eff', 1),
('cat_product', '产品设计', 'PRODUCT', 'main', 1, 2, '产品设计相关岗位', 'icon-product', '#67c23a', 1),
('cat_operation', '运营市场', 'OPERATION', 'main', 1, 3, '运营市场相关岗位', 'icon-operation', '#e6a23c', 1),
('cat_support', '职能支持', 'SUPPORT', 'main', 1, 4, '职能支持相关岗位', 'icon-support', '#909399', 1);

-- 技能分类初始数据
INSERT INTO skill_categories (id, name, description, color, sort_order) VALUES
('cat_tech_skill', '技术技能', '编程语言、框架、工具等技术能力', '#409eff', 1),
('cat_soft_skill', '软技能', '沟通、协作、领导力等通用能力', '#67c23a', 2),
('cat_domain', '领域知识', '行业知识、业务理解等专业领域', '#e6a23c', 3),
('cat_management', '管理能力', '项目管理、团队管理等管理技能', '#f56c6c', 4);

-- 技能标签初始数据
INSERT INTO skill_tags (id, name, code, category_id, level, description, synonyms, related_skills, is_active, is_system) VALUES
('skill_pm', '项目管理', 'PROJECT_MANAGEMENT', 'cat_management', 'advanced', '项目规划、执行、监控能力', '["PM", "项目经理"]', '["skill_team", "skill_plan"]', 1, 0),
('skill_team', '团队协作', 'TEAMWORK', 'cat_soft_skill', 'basic', '团队沟通协作能力', '["协作", "配合"]', '["skill_pm"]', 1, 0),
('skill_frontend', '前端开发', 'FRONTEND', 'cat_tech_skill', 'intermediate', 'Web前端开发技术', '["FE", "前端"]', '["skill_vue", "skill_react"]', 1, 0),
('skill_backend', '后端开发', 'BACKEND', 'cat_tech_skill', 'intermediate', '服务端开发技术', '["BE", "后端"]', '["skill_nodejs", "skill_java"]', 1, 0);

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
  'P3_TECH_PATH',
  'P3',
  'technical',
  'P3级别技术工程师的职业发展路径规划',
  '1.0.0',
  1,
  1,
  'active',
  'P4高级工程师',
  '18-24个月',
  '["技术专家", "技术经理"]',
  '["架构设计", "性能优化", "技术创新"]',
  '["技术深度", "业务理解", "团队协作"]',
  '2年以上相关工作经验',
  '掌握核心技术栈，能独立完成复杂任务',
  '主导中型项目，贡献核心模块',
  '绩效达到良好及以上',
  '["编程语言", "框架使用", "数据库", "版本控制"]',
  '["架构设计", "性能优化", "代码审查", "技术文档"]',
  '["技术分享", "新人指导", "跨团队协作"]',
  '["高级编程课程", "架构设计课程", "性能优化专题"]',
  '["相关技术认证", "行业认证"]',
  '["核心项目开发", "技术攻坚项目", "开源贡献"]'
);
