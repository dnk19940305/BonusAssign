-- 里程碑模板管理相关表

-- 1. 里程碑模板表
CREATE TABLE IF NOT EXISTS milestone_templates (
  id VARCHAR(50) PRIMARY KEY COMMENT '模板ID',
  name VARCHAR(200) NOT NULL COMMENT '模板名称',
  description TEXT COMMENT '模板描述',
  category VARCHAR(50) COMMENT '模板分类(software/marketing/product/custom)',
  is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统预设模板',
  template_data JSON NOT NULL COMMENT '模板数据(包含里程碑列表)',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  created_by VARCHAR(50) COMMENT '创建人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  INDEX idx_category (category),
  INDEX idx_created_by (created_by),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑模板表';

-- 插入系统预设模板

-- 模板1: 软件开发项目
INSERT INTO milestone_templates (id, name, description, category, is_system, template_data, created_by) VALUES 
('tpl_software_dev_001', 
 '软件开发项目标准模板', 
 '适用于常规软件开发项目，包含需求分析、设计、开发、测试、上线等完整流程',
 'software',
 TRUE,
 JSON_OBJECT(
   'milestones', JSON_ARRAY(
     JSON_OBJECT(
       'name', '需求分析',
       'description', '收集和分析业务需求，编写需求文档',
       'durationDays', 14,
       'offsetDays', 0,
       'weight', 1.0,
       'deliverables', '需求规格说明书、原型设计',
       'dependencies', JSON_ARRAY()
     ),
     JSON_OBJECT(
       'name', '系统设计',
       'description', '完成系统架构设计和详细设计',
       'durationDays', 10,
       'offsetDays', 14,
       'weight', 1.2,
       'deliverables', '系统设计文档、数据库设计',
       'dependencies', JSON_ARRAY(0)
     ),
     JSON_OBJECT(
       'name', '开发实现',
       'description', '编码实现系统功能',
       'durationDays', 30,
       'offsetDays', 24,
       'weight', 1.5,
       'deliverables', '可运行的系统代码',
       'dependencies', JSON_ARRAY(1)
     ),
     JSON_OBJECT(
       'name', '测试验收',
       'description', '执行单元测试、集成测试、系统测试',
       'durationDays', 14,
       'offsetDays', 54,
       'weight', 1.0,
       'deliverables', '测试报告、Bug修复记录',
       'dependencies', JSON_ARRAY(2)
     ),
     JSON_OBJECT(
       'name', '上线部署',
       'description', '生产环境部署和上线',
       'durationDays', 7,
       'offsetDays', 68,
       'weight', 0.8,
       'deliverables', '上线报告、运维文档',
       'dependencies', JSON_ARRAY(3)
     )
   )
 ),
 'system');

-- 模板2: 市场活动项目
INSERT INTO milestone_templates (id, name, description, category, is_system, template_data, created_by) VALUES 
('tpl_marketing_001', 
 '市场活动项目标准模板', 
 '适用于市场推广活动，包含策划、准备、执行、评估等阶段',
 'marketing',
 TRUE,
 JSON_OBJECT(
   'milestones', JSON_ARRAY(
     JSON_OBJECT(
       'name', '活动策划',
       'description', '制定活动方案和预算',
       'durationDays', 7,
       'offsetDays', 0,
       'weight', 1.0,
       'deliverables', '活动方案、预算表',
       'dependencies', JSON_ARRAY()
     ),
     JSON_OBJECT(
       'name', '物料准备',
       'description', '设计制作活动物料',
       'durationDays', 10,
       'offsetDays', 7,
       'weight', 1.0,
       'deliverables', '活动物料、宣传资料',
       'dependencies', JSON_ARRAY(0)
     ),
     JSON_OBJECT(
       'name', '宣传推广',
       'description', '通过各渠道进行宣传',
       'durationDays', 14,
       'offsetDays', 17,
       'weight', 1.2,
       'deliverables', '推广渠道覆盖报告',
       'dependencies', JSON_ARRAY(1)
     ),
     JSON_OBJECT(
       'name', '活动执行',
       'description', '现场活动组织和执行',
       'durationDays', 3,
       'offsetDays', 31,
       'weight', 1.5,
       'deliverables', '活动执行记录、照片视频',
       'dependencies', JSON_ARRAY(2)
     ),
     JSON_OBJECT(
       'name', '效果评估',
       'description', '统计活动效果和ROI',
       'durationDays', 7,
       'offsetDays', 34,
       'weight', 0.8,
       'deliverables', '活动效果报告',
       'dependencies', JSON_ARRAY(3)
     )
   )
 ),
 'system');

-- 模板3: 产品研发项目
INSERT INTO milestone_templates (id, name, description, category, is_system, template_data, created_by) VALUES 
('tpl_product_dev_001', 
 '产品研发项目标准模板', 
 '适用于新产品研发，包含调研、设计、开发、验证、发布等阶段',
 'product',
 TRUE,
 JSON_OBJECT(
   'milestones', JSON_ARRAY(
     JSON_OBJECT(
       'name', '市场调研',
       'description', '分析市场需求和竞品',
       'durationDays', 10,
       'offsetDays', 0,
       'weight', 1.0,
       'deliverables', '市场调研报告',
       'dependencies', JSON_ARRAY()
     ),
     JSON_OBJECT(
       'name', '产品设计',
       'description', '完成产品设计和规格定义',
       'durationDays', 14,
       'offsetDays', 10,
       'weight', 1.2,
       'deliverables', '产品设计文档、原型',
       'dependencies', JSON_ARRAY(0)
     ),
     JSON_OBJECT(
       'name', '原型开发',
       'description', '开发产品原型或MVP',
       'durationDays', 21,
       'offsetDays', 24,
       'weight', 1.5,
       'deliverables', 'MVP产品',
       'dependencies', JSON_ARRAY(1)
     ),
     JSON_OBJECT(
       'name', '试产验证',
       'description', '小批量试产和用户测试',
       'durationDays', 14,
       'offsetDays', 45,
       'weight', 1.0,
       'deliverables', '用户反馈报告、改进方案',
       'dependencies', JSON_ARRAY(2)
     ),
     JSON_OBJECT(
       'name', '量产发布',
       'description', '正式发布和批量生产',
       'durationDays', 7,
       'offsetDays', 59,
       'weight', 1.0,
       'deliverables', '产品发布、市场推广',
       'dependencies', JSON_ARRAY(3)
     )
   )
 ),
 'system');

-- 模板4: 敏捷开发Sprint
INSERT INTO milestone_templates (id, name, description, category, is_system, template_data, created_by) VALUES 
('tpl_agile_sprint_001', 
 '敏捷开发Sprint模板', 
 '适用于敏捷开发的2周Sprint周期',
 'software',
 TRUE,
 JSON_OBJECT(
   'milestones', JSON_ARRAY(
     JSON_OBJECT(
       'name', 'Sprint规划',
       'description', '制定Sprint目标和任务清单',
       'durationDays', 1,
       'offsetDays', 0,
       'weight', 0.5,
       'deliverables', 'Sprint Backlog',
       'dependencies', JSON_ARRAY()
     ),
     JSON_OBJECT(
       'name', 'Sprint开发',
       'description', '执行开发任务',
       'durationDays', 10,
       'offsetDays', 1,
       'weight', 2.0,
       'deliverables', '功能增量',
       'dependencies', JSON_ARRAY(0)
     ),
     JSON_OBJECT(
       'name', 'Sprint评审',
       'description', '演示和评审开发成果',
       'durationDays', 1,
       'offsetDays', 11,
       'weight', 0.5,
       'deliverables', '演示文档',
       'dependencies', JSON_ARRAY(1)
     ),
     JSON_OBJECT(
       'name', 'Sprint回顾',
       'description', '团队复盘和改进',
       'durationDays', 1,
       'offsetDays', 12,
       'weight', 0.5,
       'deliverables', '改进行动项',
       'dependencies', JSON_ARRAY(2)
     )
   )
 ),
 'system');
