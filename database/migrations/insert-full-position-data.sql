-- 岗位分类完整数据（8个主分类）
INSERT INTO position_categories (id, name, code, type, parent_id, level, sort_order, description, icon, color, is_active) VALUES 
('cat_tech', '技术研发', 'TECH', 'main', NULL, 1, 1, '技术研发相关岗位', 'el-icon-cpu', '#409eff', 1),
('cat_tech_fe', '前端开发', 'TECH_FE', 'sub', 'cat_tech', 2, 11, '前端开发岗位', 'el-icon-monitor', '#67c23a', 1),
('cat_tech_be', '后端开发', 'TECH_BE', 'sub', 'cat_tech', 2, 12, '后端开发岗位', 'el-icon-data-line', '#409eff', 1),
('cat_product', '产品设计', 'PRODUCT', 'main', NULL, 1, 2, '产品设计相关岗位', 'el-icon-edit', '#67c23a', 1),
('cat_design', '视觉设计', 'DESIGN', 'main', NULL, 1, 3, '视觉设计相关岗位', 'el-icon-picture', '#e6a23c', 1),
('cat_operation', '运营市场', 'OPERATION', 'main', NULL, 1, 4, '运营市场相关岗位', 'el-icon-data-analysis', '#f56c6c', 1),
('cat_support', '职能支持', 'SUPPORT', 'main', NULL, 1, 5, '职能支持相关岗位', 'el-icon-files', '#909399', 1),
('cat_management', '管理岗位', 'MANAGEMENT', 'main', NULL, 1, 6, '管理类岗位', 'el-icon-user', '#606266', 1);

-- 技能分类完整数据
INSERT INTO skill_categories (id, name, description, color, sort_order) VALUES
('cat_tech_skill', '技术技能', '编程语言、框架、工具等技术能力', '#409eff', 1),
('cat_soft_skill', '软技能', '沟通、协作、领导力等通用能力', '#67c23a', 2),
('cat_domain', '领域知识', '行业知识、业务理解等专业领域', '#e6a23c', 3),
('cat_management', '管理能力', '项目管理、团队管理等管理技能', '#f56c6c', 4);

-- 技能标签完整数据（每个分类下都有标签）
INSERT INTO skill_tags (id, name, code, category_id, level, description, synonyms, related_skills, is_active, is_system) VALUES
-- 技术技能
('skill_frontend', '前端开发', 'FRONTEND', 'cat_tech_skill', 'intermediate', 'Web前端开发技术', '["FE", "前端"]', '["skill_vue", "skill_react"]', 1, 0),
('skill_backend', '后端开发', 'BACKEND', 'cat_tech_skill', 'intermediate', '服务端开发技术', '["BE", "后端"]', '["skill_nodejs", "skill_java"]', 1, 0),
('skill_vue', 'Vue.js', 'VUE', 'cat_tech_skill', 'intermediate', 'Vue框架开发', '["Vue", "Vue3"]', '["skill_frontend"]', 1, 0),
('skill_react', 'React', 'REACT', 'cat_tech_skill', 'intermediate', 'React框架开发', '["ReactJS"]', '["skill_frontend"]', 1, 0),
('skill_nodejs', 'Node.js', 'NODEJS', 'cat_tech_skill', 'intermediate', 'Node.js后端开发', '["NodeJS"]', '["skill_backend"]', 1, 0),
('skill_java', 'Java', 'JAVA', 'cat_tech_skill', 'advanced', 'Java开发', '["Java开发"]', '["skill_backend"]', 1, 0),

-- 软技能
('skill_team', '团队协作', 'TEAMWORK', 'cat_soft_skill', 'basic', '团队沟通协作能力', '["协作", "配合"]', '["skill_pm"]', 1, 0),
('skill_communication', '沟通能力', 'COMMUNICATION', 'cat_soft_skill', 'basic', '有效沟通表达能力', '["表达", "沟通"]', '["skill_team"]', 1, 0),
('skill_leadership', '领导力', 'LEADERSHIP', 'cat_soft_skill', 'advanced', '团队领导能力', '["领导", "带队"]', '["skill_pm"]', 1, 0),
('skill_innovation', '创新思维', 'INNOVATION', 'cat_soft_skill', 'intermediate', '创新和问题解决能力', '["创新", "创造力"]', '[]', 1, 0),

-- 领域知识
('skill_finance', '金融知识', 'FINANCE', 'cat_domain', 'intermediate', '金融行业知识', '["金融", "财务"]', '[]', 1, 0),
('skill_ecommerce', '电商业务', 'ECOMMERCE', 'cat_domain', 'intermediate', '电商行业知识', '["电商", "零售"]', '[]', 1, 0),
('skill_education', '教育行业', 'EDUCATION', 'cat_domain', 'intermediate', '教育行业知识', '["教育", "培训"]', '[]', 1, 0),

-- 管理能力
('skill_pm', '项目管理', 'PROJECT_MANAGEMENT', 'cat_management', 'advanced', '项目规划、执行、监控能力', '["PM", "项目经理"]', '["skill_team", "skill_plan"]', 1, 0),
('skill_plan', '规划能力', 'PLANNING', 'cat_management', 'intermediate', '战略规划和目标设定', '["规划", "计划"]', '["skill_pm"]', 1, 0),
('skill_execution', '执行力', 'EXECUTION', 'cat_management', 'intermediate', '高效执行落地能力', '["执行", "落地"]', '["skill_plan"]', 1, 0);

-- 职业路径模板数据
INSERT INTO career_path_templates (
  id, name, code, level, category, description, version, is_active, is_default, status,
  next_level, estimated_time, lateral_moves, specializations, growth_areas,
  min_experience, skill_assessment, project_contribution, performance_level,
  core_skills, advanced_skills, leadership_skills,
  courses, certifications, projects
) VALUES 
(
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
),
(
  'template_p4_tech',
  'P4高级工程师发展路径',
  'P4_TECH_PATH',
  'P4',
  'technical',
  'P4级别高级工程师的职业发展路径规划',
  '1.0.0',
  1,
  1,
  'active',
  'P5技术专家',
  '24-36个月',
  '["技术架构师", "技术总监"]',
  '["系统架构", "技术决策", "团队建设"]',
  '["技术广度", "架构能力", "影响力"]',
  '4年以上相关工作经验',
  '精通技术栈，具备架构设计能力',
  '主导大型项目，技术难点攻坚',
  '绩效达到优秀',
  '["多技术栈", "系统设计", "性能调优", "安全"]',
  '["架构设计", "技术选型", "技术规划", "团队培养"]',
  '["技术布道", "团队管理", "跨部门协作"]',
  '["架构师课程", "领导力培训", "技术管理"]',
  '["高级技术认证", "架构师认证"]',
  '["大型项目架构", "技术体系建设", "开源项目"]'
);
