-- 项目角色权重模板表
CREATE TABLE IF NOT EXISTS `project_role_weight_templates` (
  `id` varchar(50) NOT NULL COMMENT '模板ID',
  `name` varchar(100) NOT NULL COMMENT '模板名称',
  `type` varchar(50) NOT NULL COMMENT '模板类型：tech_team-技术团队, product_team-产品团队, mixed_team-综合团队, custom-自定义',
  `description` text COMMENT '模板描述',
  `weights` json NOT NULL COMMENT '权重配置（JSON格式，key为角色code，value为权重值）',
  `is_system` tinyint(1) DEFAULT 0 COMMENT '是否系统预置模板：1-是，0-否',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `sort` int DEFAULT 0 COMMENT '排序',
  `created_by` varchar(50) DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目角色权重模板表';

-- 插入系统预置模板
INSERT INTO `project_role_weight_templates` (`id`, `name`, `type`, `description`, `weights`, `is_system`, `is_active`, `sort`, `created_by`) VALUES
('tpl_standard_tech', '标准技术团队', 'tech_team', '适用于以开发为主的技术项目', 
 '{"tech_lead": 3.0, "senior_dev": 2.5, "developer": 2.0, "junior_dev": 1.5, "tester": 1.8, "devops": 2.0}', 
 1, 1, 1, 'system'),
('tpl_product_oriented', '产品导向团队', 'product_team', '适用于产品设计和用户体验重要的项目', 
 '{"product_mgr": 2.8, "ui_designer": 2.3, "tech_lead": 2.5, "developer": 2.0, "tester": 1.8}', 
 1, 1, 2, 'system'),
('tpl_balanced', '均衡团队', 'mixed_team', '各角色权重相对均衡的配置', 
 '{"tech_lead": 2.2, "senior_dev": 2.0, "developer": 1.8, "product_mgr": 2.0, "ui_designer": 1.8, "tester": 1.8}', 
 1, 1, 3, 'system');
