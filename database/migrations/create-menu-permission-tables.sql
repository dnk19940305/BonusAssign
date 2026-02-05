-- 菜单权限管理表结构
-- 创建时间：2025-12-31

-- 1. 菜单表
CREATE TABLE IF NOT EXISTS `menus` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '菜单ID',
  `parent_id` VARCHAR(50) DEFAULT NULL COMMENT '父菜单ID，NULL表示顶级菜单',
  `menu_name` VARCHAR(100) NOT NULL COMMENT '菜单名称',
  `menu_path` VARCHAR(200) DEFAULT NULL COMMENT '路由路径',
  `component` VARCHAR(200) DEFAULT NULL COMMENT '组件路径',
  `menu_type` ENUM('directory', 'menu', 'button') NOT NULL DEFAULT 'menu' COMMENT '菜单类型：directory-目录，menu-菜单，button-按钮',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '菜单图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序号',
  `visible` TINYINT(1) DEFAULT 1 COMMENT '是否显示：1-显示，0-隐藏',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：1-启用，0-停用',
  `perms` VARCHAR(100) DEFAULT NULL COMMENT '权限标识，多个用逗号分隔',
  `is_frame` TINYINT(1) DEFAULT 0 COMMENT '是否外链：1-是，0-否',
  `is_cache` TINYINT(1) DEFAULT 1 COMMENT '是否缓存：1-缓存，0-不缓存',
  `redirect` VARCHAR(200) DEFAULT NULL COMMENT '重定向路径',
  `meta_title` VARCHAR(100) DEFAULT NULL COMMENT 'meta标题',
  `meta_description` VARCHAR(500) DEFAULT NULL COMMENT 'meta描述',
  `meta_show_in_menu` TINYINT(1) DEFAULT 1 COMMENT '是否在菜单中显示',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_menu_type` (`menu_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

-- 2. 角色菜单关联表
CREATE TABLE IF NOT EXISTS `role_menus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `role_id` VARCHAR(50) NOT NULL COMMENT '角色ID',
  `menu_id` VARCHAR(50) NOT NULL COMMENT '菜单ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';

-- 3. 为roles表添加菜单检查标志（如果不存在）
-- 检查字段是否存在，不存在则添加
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'bonus_system' 
  AND TABLE_NAME = 'roles' 
  AND COLUMN_NAME = 'menu_check_strictly';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `roles` ADD COLUMN `menu_check_strictly` TINYINT(1) DEFAULT 1 COMMENT ''菜单树选择项是否关联显示：1-严格关联，0-不严格'' AFTER `description`',
  'SELECT ''Column menu_check_strictly already exists'' AS msg');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 插入系统默认菜单数据
-- 顶级目录
INSERT INTO `menus` (`id`, `parent_id`, `menu_name`, `menu_path`, `component`, `menu_type`, `icon`, `sort_order`, `perms`, `meta_title`, `meta_description`) VALUES
-- 首页
('menu_1', NULL, '管理驾驶舱', '/dashboard', 'dashboard/DashboardOverview', 'menu', 'dashboard', 1, NULL, '管理驾驶舱', '查看系统整体数据概览'),

-- 基础数据管理目录
('menu_100', NULL, '基础数据', NULL, NULL, 'directory', 'setting', 2, NULL, '基础数据管理', '组织架构和基础数据管理'),
('menu_101', 'menu_100', '员工管理', '/employee', 'employee/EmployeeManagement', 'menu', 'user', 1, 'employee:view', '员工管理', '员工信息的增删改查'),
('menu_102', 'menu_100', '部门管理', '/department', 'department/DepartmentManagement', 'menu', 'office-building', 2, 'department:view,admin,hr,*', '部门管理', '部门信息管理'),
('menu_103', 'menu_100', '岗位管理', '/position', 'position/PositionManagement', 'menu', 'briefcase', 3, 'position:view', '岗位管理', '岗位信息管理'),
('menu_104', 'menu_100', '岗位大全', '/position/encyclopedia', 'position/PositionEncyclopedia', 'menu', 'collection', 4, 'position:view', '岗位大全', '查看所有岗位详细信息'),
('menu_105', 'menu_100', '业务线管理', '/business-line', 'businessLine/BusinessLineManagement', 'menu', 'connection', 5, 'business_line:view', '业务线管理', '业务线配置管理'),

-- 项目管理目录
('menu_200', NULL, '项目管理', NULL, NULL, 'directory', 'suitcase', 3, NULL, '项目管理', '项目全生命周期管理'),
('menu_201', 'menu_200', '我的项目', '/my-projects', 'project/MyProjects', 'menu', 'folder', 1, NULL, '我的项目', '查看我参与的项目'),
('menu_202', 'menu_200', '项目协作', '/project/collaboration', 'project/ProjectCollaboration', 'menu', 'coordinate', 2, 'project:view,project:create,project:approve,project_manager,*', '项目协作', '项目协作和成员管理'),
('menu_203', 'menu_200', '发布项目', '/project/publish', 'project/ProjectPublish', 'menu', 'plus', 3, 'project:create,*', '发布项目', '创建新项目'),
('menu_204', 'menu_200', '项目管理', '/project/management', 'project/ProjectManagement', 'menu', 'management', 4, 'project:view', '项目管理', '项目信息管理'),
('menu_205', 'menu_200', '项目成员审批', '/project-member-approval', 'project/ProjectMemberApproval', 'menu', 'user-filled', 5, 'project:approve,*', '项目成员审批', '审批项目成员加入'),
('menu_206', 'menu_200', '项目角色权重', '/project-role-weights', 'project/ProjectRoleWeights', 'menu', 'scale', 6, 'project:weights:view,project:weights:view_own,project:weights:view_all,*', '项目角色权重', '项目角色权重配置'),
('menu_207', 'menu_200', '里程碑模板', '/milestone-templates', 'project/MilestoneTemplates', 'menu', 'trophy', 7, 'project:view,project:create,*', '里程碑模板管理', '项目里程碑模板配置'),

-- 财务管理目录
('menu_300', NULL, '财务管理', NULL, NULL, 'directory', 'money', 4, NULL, '财务管理', '财务数据和成本管理'),
('menu_301', 'menu_300', '利润数据录入', '/profit/data', 'profit/ProfitDataManagement', 'menu', 'coin', 1, 'profit:view,finance:view,finance:manage,admin,*', '财务录入（利润数据）', '录入公司利润数据'),
('menu_302', 'menu_300', '项目成本录入', '/project/cost-management', 'project/ProjectCostManagement', 'menu', 'wallet', 2, 'project:cost:view:all,project:cost:manage,finance:view,finance:manage,admin,*', '项目成本录入', '录入项目成本数据'),
('menu_303', 'menu_300', '项目奖金管理', '/project-bonus-management', 'project/ProjectBonusManagement', 'menu', 'present', 3, 'finance:view,finance:manage,bonus:view,bonus:manage,hr,admin,*', '项目奖金管理', '项目奖金分配管理'),

-- 奖金计算目录
('menu_400', NULL, '奖金计算', NULL, NULL, 'directory', 'calculator', 5, 'bonus:calculate,hr,admin,*', '奖金计算', '奖金计算和分配'),
('menu_401', 'menu_400', '奖金计算', '/calculation', 'calculation/BonusCalculation', 'menu', 'calculator', 1, 'bonus:calculate,hr,admin,*', '奖金计算', '执行奖金计算'),
('menu_402', 'menu_400', '模拟分析', '/simulation', 'simulation/SimulationAnalysis', 'menu', 'data-analysis', 2, 'simulation:view', '模拟分析', '奖金分配模拟分析'),

-- 绩效管理目录
('menu_500', NULL, '绩效管理', NULL, NULL, 'directory', 'trend-charts', 6, NULL, '绩效管理', '绩效记录管理'),
('menu_501', 'menu_500', '绩效记录', '/performance/records', 'performance/PerformanceRecordManagement', 'menu', 'document', 1, 'performance:view,hr,admin', '绩效记录管理', '员工绩效记录管理'),

-- 报表查询目录
('menu_600', NULL, '报表查询', NULL, NULL, 'directory', 'data-line', 7, NULL, '报表查询', '各类报表和数据查询'),
('menu_601', 'menu_600', '报表管理', '/reports/management', 'reports/ReportManagement', 'menu', 'document-copy', 1, 'report:view', '报表管理', '查看各类统计报表'),
('menu_602', 'menu_600', '个人奖金查询', '/reports/personal', 'reports/PersonalBonus', 'menu', 'search', 2, 'bonus:view,bonus:personal', '个人奖金查询', '查询个人奖金信息'),
('menu_603', 'menu_600', '我的奖金', '/personal/dashboard', 'personal/PersonalBonusDashboard', 'menu', 'money', 3, NULL, '我的奖金', '查看个人奖金详情、历史趋势和改进建议'),

-- 系统管理目录
('menu_700', NULL, '系统管理', NULL, NULL, 'directory', 'tools', 8, NULL, '系统管理', '系统配置和权限管理'),
('menu_701', 'menu_700', '用户管理', '/system/users', 'system/UserManagement', 'menu', 'user', 1, 'user:view', '用户管理', '系统用户管理'),
('menu_702', 'menu_700', '角色管理', '/system/roles', 'system/RoleManagement', 'menu', 'avatar', 2, 'role:view', '角色管理', '角色和权限管理'),
('menu_703', 'menu_700', '菜单管理', '/system/menus', 'system/MenuManagement', 'menu', 'menu', 3, 'menu:view,admin', '菜单管理', '菜单权限配置'),
('menu_704', 'menu_700', '系统配置', '/system/config', 'system/SystemConfig', 'menu', 'setting', 4, 'system:config', '系统配置', '系统参数配置'),
('menu_705', 'menu_700', '三维权重配置', '/system/weight-config', 'system/WeightConfigManagement', 'menu', 'operation', 5, 'system:config,hr,admin', '三维权重配置', '奖金三维权重配置'),
('menu_706', 'menu_700', '改进建议管理', '/system/improvement-suggestions', 'system/ImprovementSuggestionsManagement', 'menu', 'edit', 6, 'improvement:view,hr,admin,*', '改进建议管理', '员工改进建议管理');

-- 5. 插入角色菜单关联数据（默认为admin角色分配所有菜单）
-- 注意：需要先查询roles表获取实际的角色ID，这里假设admin角色ID为'admin'
-- 实际使用时需要根据真实的角色ID调整

-- 为admin角色分配所有菜单权限（示例）
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 'admin', `id` FROM `menus` WHERE `status` = 1
ON DUPLICATE KEY UPDATE `role_id` = `role_id`;
