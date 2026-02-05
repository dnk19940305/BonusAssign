/*
 Navicat Premium Dump SQL

 Source Server         : mydatabase
 Source Server Type    : MySQL
 Source Server Version : 80035 (8.0.35)
 Source Host           : localhost:3306
 Source Schema         : bonus_system

 Target Server Type    : MySQL
 Target Server Version : 80035 (8.0.35)
 File Encoding         : 65001

 Date: 18/01/2026 13:46:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for approval_workflows
-- ----------------------------
DROP TABLE IF EXISTS `approval_workflows`;
CREATE TABLE `approval_workflows`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `trigger_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `steps` json NOT NULL COMMENT '????',
  `enabled` tinyint(1) NULL DEFAULT 1 COMMENT '????',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_trigger_enabled`(`trigger_type` ASC, `enabled` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '????????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作用户ID',
  `user_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作用户名称',
  `operation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作模块',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '操作详情',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '用户代理',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'success' COMMENT '操作状态：success-成功，failed-失败',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_audit_logs_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_audit_logs_operation`(`operation` ASC) USING BTREE,
  INDEX `idx_audit_logs_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_audit_logs_module`(`module` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '审计日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for bonus_allocation_results
-- ----------------------------
DROP TABLE IF EXISTS `bonus_allocation_results`;
CREATE TABLE `bonus_allocation_results`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分配结果ID',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期间',
  `profit_contribution` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '利润贡献',
  `position_value` decimal(10, 4) NOT NULL DEFAULT 0.0000 COMMENT '岗位价值',
  `performance_score` decimal(10, 4) NOT NULL DEFAULT 0.0000 COMMENT '绩效得分',
  `weight_config` json NULL COMMENT '权重配置',
  `weighted_scores` json NULL COMMENT '加权得分',
  `composite_score` decimal(10, 4) NOT NULL DEFAULT 0.0000 COMMENT '综合得分',
  `ranking` int NOT NULL DEFAULT 0 COMMENT '排名',
  `bonus_coefficient` decimal(5, 2) NOT NULL DEFAULT 1.00 COMMENT '奖金系数',
  `business_line_coefficient` decimal(3, 2) NULL DEFAULT 1.00 COMMENT '????? 0.8-1.5',
  `city_coefficient` decimal(3, 2) NULL DEFAULT 1.00 COMMENT '???? 0.8-1.3',
  `time_coefficient` decimal(3, 2) NULL DEFAULT 1.00 COMMENT '???? 0.5-1.1',
  `benchmark_value` decimal(3, 2) NULL DEFAULT NULL COMMENT '???????',
  `base_bonus` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '基础奖金',
  `excellence_bonus` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '卓越奖金',
  `quality_bonus` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '质量奖金',
  `total_bonus` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '总奖金',
  `calculation_params` json NULL COMMENT '计算参数',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'calculated' COMMENT '状态：calculated-已计算，confirmed-已确认，paid-已发放',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pool_employee`(`pool_id` ASC, `employee_id` ASC) USING BTREE,
  INDEX `idx_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_period`(`period` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖金分配结果表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for bonus_allocation_rules
-- ----------------------------
DROP TABLE IF EXISTS `bonus_allocation_rules`;
CREATE TABLE `bonus_allocation_rules`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '规则描述',
  `profit_sharing_ratio` decimal(5, 2) NOT NULL DEFAULT 0.80 COMMENT '利润分享比例',
  `excellence_bonus_ratio` decimal(5, 2) NOT NULL DEFAULT 0.20 COMMENT '卓越奖金比例',
  `quality_bonus_ratio` decimal(5, 2) NOT NULL DEFAULT 0.15 COMMENT '质量奖金比例',
  `max_bonus_cap` decimal(5, 2) NOT NULL DEFAULT 3.00 COMMENT '奖金上限系数',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expiry_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_business_line_active`(`business_line_id` ASC, `is_active` ASC) USING BTREE,
  INDEX `idx_effective_date`(`effective_date` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖金分配规则表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for bonus_pools
-- ----------------------------
DROP TABLE IF EXISTS `bonus_pools`;
CREATE TABLE `bonus_pools`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算期间',
  `total_profit` decimal(15, 2) NOT NULL COMMENT '公司总利润',
  `pool_ratio` decimal(5, 2) NOT NULL COMMENT '奖金池比例',
  `pool_amount` decimal(15, 2) NOT NULL COMMENT '奖金池总额',
  `reserve_ratio` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '预留调节金比例',
  `special_ratio` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '特别奖励基金比例',
  `distributable_amount` decimal(15, 2) NOT NULL COMMENT '可分配金额',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '状态：draft-草稿，active-生效，archived-归档',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `calculated_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `period`(`period` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖金池表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for business_lines
-- ----------------------------
DROP TABLE IF EXISTS `business_lines`;
CREATE TABLE `business_lines`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '业务线ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '条线名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '条线代码',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '条线描述',
  `weight` decimal(10, 4) NULL DEFAULT 0.0000,
  `manager_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线经理ID',
  `profit_target` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '利润目标(万元)',
  `kpi_metrics` json NULL COMMENT 'KPI指标配置',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '业务条线表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for business_rules
-- ----------------------------
DROP TABLE IF EXISTS `business_rules`;
CREATE TABLE `business_rules`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `conditions` json NOT NULL COMMENT '????',
  `actions` json NOT NULL COMMENT '????',
  `priority` int NULL DEFAULT 0 COMMENT '???',
  `enabled` tinyint NULL DEFAULT 1 COMMENT '????',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_enabled`(`category` ASC, `enabled` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for career_path_templates
-- ----------------------------
DROP TABLE IF EXISTS `career_path_templates`;
CREATE TABLE `career_path_templates`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1.0.0' COMMENT '???',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '????',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '??????',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '????',
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'draft' COMMENT '??',
  `next_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '????',
  `estimated_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??????',
  `lateral_moves` json NULL COMMENT '??????',
  `specializations` json NULL COMMENT '????',
  `growth_areas` json NULL COMMENT '????',
  `min_experience` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '????',
  `skill_assessment` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '????',
  `project_contribution` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '????',
  `performance_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '????',
  `core_skills` json NULL COMMENT '????',
  `advanced_skills` json NULL COMMENT '????',
  `leadership_skills` json NULL COMMENT '?????',
  `courses` json NULL COMMENT '????',
  `certifications` json NULL COMMENT '????',
  `projects` json NULL COMMENT '????',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_level`(`level` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_is_default`(`is_default` ASC) USING BTREE,
  INDEX `idx_usage_count`(`usage_count` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for cities
-- ----------------------------
DROP TABLE IF EXISTS `cities`;
CREATE TABLE `cities`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `tier` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????: tier1(??),tier1_new(???),tier2(??),tier3(??)',
  `coefficient` decimal(3, 2) NOT NULL DEFAULT 1.00 COMMENT '???? 0.8-1.3',
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '??',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `status` tinyint NULL DEFAULT 1 COMMENT '??: 1-??, 0-??',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_tier`(`tier` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门代码',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '部门描述',
  `parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '上级部门ID',
  `line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属条线ID',
  `manager_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '部门经理ID',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sort` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `level` int NULL DEFAULT NULL COMMENT '部门层级',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '部门表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for employee_bonus_records
-- ----------------------------
DROP TABLE IF EXISTS `employee_bonus_records`;
CREATE TABLE `employee_bonus_records`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金记录ID',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门ID',
  `line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '条线ID',
  `position_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位ID',
  `benchmark_value` decimal(10, 2) NOT NULL COMMENT '岗位基准值',
  `performance_coefficient` decimal(3, 2) NOT NULL COMMENT '绩效系数',
  `basic_points` decimal(8, 2) NOT NULL COMMENT '基础积分',
  `basic_bonus` decimal(12, 2) NOT NULL COMMENT '基础奖金',
  `excellence_rating` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '卓越贡献评级',
  `excellence_bonus` decimal(12, 2) NULL DEFAULT 0.00 COMMENT '卓越贡献奖金',
  `total_bonus` decimal(12, 2) NOT NULL COMMENT '总奖金',
  `history_average` decimal(12, 2) NULL DEFAULT NULL COMMENT '历史平均奖金',
  `minimum_bonus` decimal(12, 2) NULL DEFAULT NULL COMMENT '保底金额',
  `final_bonus` decimal(12, 2) NOT NULL COMMENT '最终奖金',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'calculated' COMMENT '状态：calculated-已计算，confirmed-已确认，paid-已发放',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_bonus_records_pool_employee`(`pool_id` ASC, `employee_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '员工奖金记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for employee_profit_contributions
-- ----------------------------
DROP TABLE IF EXISTS `employee_profit_contributions`;
CREATE TABLE `employee_profit_contributions`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贡献记录ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期间',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '项目ID',
  `contribution_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'direct' COMMENT '贡献类型：direct-直接贡献，indirect-间接贡献',
  `contribution_amount` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '贡献金额',
  `contribution_ratio` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '贡献比例',
  `work_hours` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '工作小时数',
  `work_hours_ratio` decimal(5, 4) NULL DEFAULT 0.0000 COMMENT '工时比例',
  `quality_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '质量评分',
  `efficiency_score` decimal(5, 2) NULL DEFAULT 1.00 COMMENT '效率评分',
  `direct_contribution_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '直接贡献评分',
  `workload_contribution_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '工作量贡献评分',
  `quality_contribution_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '质量贡献评分',
  `total_contribution_score` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '总贡献评分',
  `calculated_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'auto_formula' COMMENT '计算方式：auto_formula-自动公式，manual-手动',
  `calculation_params` json NULL COMMENT '计算参数',
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态：pending-待审核，approved-已审核，rejected-已拒绝',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_project_period`(`project_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_period`(`period` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '员工利润贡献记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for employees
-- ----------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `employee_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工号',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '部门ID',
  `position_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `city_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '??ID',
  `employment_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'fulltime' COMMENT '????: fulltime(??),parttime(??),probation(???),intern(???)',
  `work_hours_ratio` decimal(3, 2) NULL DEFAULT 1.00 COMMENT '?????? 0.00-1.00',
  `annual_salary` decimal(12, 2) NOT NULL COMMENT '年薪',
  `entry_date` date NOT NULL COMMENT '入职日期',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-在职，0-离职',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联用户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `id_card` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证号',
  `emergency_contact` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '紧急联系人',
  `emergency_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '紧急联系电话',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地址',
  `resign_date` date NULL DEFAULT NULL COMMENT '离职日期',
  `resign_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '离职原因',
  `transfer_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '调动原因',
  `effective_date` date NULL DEFAULT NULL COMMENT '调动生效日期',
  `handover_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '交接状态',
  `base_salary` decimal(12, 2) NULL DEFAULT NULL COMMENT '基本工资',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `employee_no`(`employee_no` ASC) USING BTREE,
  INDEX `idx_employees_no`(`employee_no` ASC) USING BTREE,
  INDEX `idx_employees_department`(`department_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '员工表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for improvement_suggestions
-- ----------------------------
DROP TABLE IF EXISTS `improvement_suggestions`;
CREATE TABLE `improvement_suggestions`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '建议ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '关联员工ID',
  `employee_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '员工姓名',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '建议标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '建议详细描述',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '建议分类: performance(绩效), skills(技能), projects(项目), collaboration(协作)',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'medium' COMMENT '优先级: high, medium, low',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending' COMMENT '状态: pending(待处理), in_progress(进行中), completed(已完成)',
  `potential_impact` int NULL DEFAULT NULL COMMENT '预期影响百分比',
  `time_frame` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '时间框架',
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'manual' COMMENT '来源: manual(手动录入), auto(自动生成)',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_by_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人姓名',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '反馈内容',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '改进建议表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_bonus_allocations
-- ----------------------------
DROP TABLE IF EXISTS `line_bonus_allocations`;
CREATE TABLE `line_bonus_allocations`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分配ID',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '条线ID',
  `weight` decimal(5, 2) NOT NULL COMMENT '权重',
  `bonus_amount` decimal(15, 2) NOT NULL COMMENT '分配金额',
  `basic_amount` decimal(15, 2) NOT NULL COMMENT '基础奖金池',
  `excellence_amount` decimal(15, 2) NOT NULL COMMENT '卓越贡献奖金池',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '条线奖金分配表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单ID',
  `parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '父菜单ID，NULL表示顶级菜单',
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称',
  `menu_path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '路由路径',
  `component` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '组件路径',
  `menu_type` enum('directory','menu','button') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menu' COMMENT '菜单类型：directory-目录，menu-菜单，button-按钮',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '菜单图标',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序号',
  `visible` tinyint(1) NULL DEFAULT 1 COMMENT '是否显示：1-显示，0-隐藏',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态：1-启用，0-停用',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '权限标识，多个用逗号分隔',
  `is_frame` tinyint(1) NULL DEFAULT 0 COMMENT '是否外链：1-是，0-否',
  `is_cache` tinyint(1) NULL DEFAULT 1 COMMENT '是否缓存：1-缓存，0-不缓存',
  `redirect` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '重定向路径',
  `meta_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'meta标题',
  `meta_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'meta描述',
  `meta_show_in_menu` tinyint(1) NULL DEFAULT 1 COMMENT '是否在菜单中显示',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_menu_type`(`menu_type` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '菜单权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for milestone_dependency_cache
-- ----------------------------
DROP TABLE IF EXISTS `milestone_dependency_cache`;
CREATE TABLE `milestone_dependency_cache`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录ID',
  `milestone_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `all_predecessors` json NULL COMMENT '所有前置里程碑(递归)',
  `all_successors` json NULL COMMENT '所有后续里程碑(递归)',
  `depth_from_start` int NULL DEFAULT 0 COMMENT '距离起点的深度',
  `depth_to_end` int NULL DEFAULT 0 COMMENT '距离终点的深度',
  `is_on_critical_path` tinyint(1) NULL DEFAULT 0 COMMENT '是否在关键路径上',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_milestone`(`milestone_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_critical_path`(`is_on_critical_path` ASC) USING BTREE,
  INDEX `idx_updated_at`(`updated_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑依赖关系缓存表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for milestone_impact_analysis
-- ----------------------------
DROP TABLE IF EXISTS `milestone_impact_analysis`;
CREATE TABLE `milestone_impact_analysis`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分析ID',
  `milestone_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `analysis_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分析类型: delay/change/delete',
  `original_date` date NULL DEFAULT NULL COMMENT '原始目标日期',
  `new_date` date NULL DEFAULT NULL COMMENT '新目标日期',
  `delay_days` int NULL DEFAULT NULL COMMENT '延期天数',
  `affected_milestones_count` int NULL DEFAULT 0 COMMENT '受影响的里程碑数量',
  `affected_milestone_ids` json NULL COMMENT '受影响的里程碑ID列表',
  `impact_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'low' COMMENT '影响级别: low/medium/high/critical',
  `is_critical_path` tinyint(1) NULL DEFAULT 0 COMMENT '是否在关键路径上',
  `project_delay_days` int NULL DEFAULT 0 COMMENT '导致项目延期天数',
  `dependency_chain` json NULL COMMENT '依赖链数据',
  `risk_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '风险评估描述',
  `suggestions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '建议措施',
  `analyzed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分析人ID',
  `analyzed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分析时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态: pending/reviewed/approved',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_milestone_id`(`milestone_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_analysis_type`(`analysis_type` ASC) USING BTREE,
  INDEX `idx_analyzed_at`(`analyzed_at` ASC) USING BTREE,
  INDEX `idx_impact_level`(`impact_level` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑影响分析记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for milestone_reminder_configs
-- ----------------------------
DROP TABLE IF EXISTS `milestone_reminder_configs`;
CREATE TABLE `milestone_reminder_configs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `remind_before_days` json NOT NULL COMMENT '提前提醒天数数组 [1, 3, 7]',
  `progress_warning_enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用进度预警',
  `progress_warning_threshold` int NULL DEFAULT 20 COMMENT '进度滞后阈值(%)',
  `dependency_warning_enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用依赖阻塞预警',
  `overdue_reminder_enabled` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用逾期提醒',
  `email_notification` tinyint(1) NULL DEFAULT 0 COMMENT '是否发送邮件通知',
  `notification_receivers` json NULL COMMENT '通知接收人ID数组',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑提醒配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for milestone_reminder_logs
-- ----------------------------
DROP TABLE IF EXISTS `milestone_reminder_logs`;
CREATE TABLE `milestone_reminder_logs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `milestone_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `reminder_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提醒类型: deadline/progress/dependency/overdue',
  `reminder_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提醒标题',
  `reminder_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '提醒内容',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'normal' COMMENT '优先级: low/normal/high/urgent',
  `sent_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `sent_to` json NULL COMMENT '接收人ID数组',
  `notification_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'system' COMMENT '通知方式: system/email/dingtalk',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'sent' COMMENT '状态: sent/read/ignored',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_milestone_id`(`milestone_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_reminder_type`(`reminder_type` ASC) USING BTREE,
  INDEX `idx_sent_at`(`sent_at` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑提醒日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for milestone_templates
-- ----------------------------
DROP TABLE IF EXISTS `milestone_templates`;
CREATE TABLE `milestone_templates`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '模板描述',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '模板分类(software/marketing/product/custom)',
  `is_system` tinyint(1) NULL DEFAULT 0 COMMENT '是否系统预设模板',
  `template_data` json NOT NULL COMMENT '模板数据(包含里程碑列表)',
  `usage_count` int NULL DEFAULT 0 COMMENT '使用次数',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '里程碑模板表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知ID',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '接收用户ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联项目ID',
  `notification_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知内容',
  `related_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联业务ID',
  `metadata` json NULL COMMENT '附加元数据',
  `is_read` tinyint NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_notifications_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_notifications_is_read`(`is_read` ASC) USING BTREE,
  INDEX `idx_notifications_type`(`notification_type` ASC) USING BTREE,
  INDEX `idx_notifications_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '通知表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作用户ID',
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作动作',
  `target_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标类型',
  `target_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '目标ID',
  `details` json NULL COMMENT '操作详情',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_operation_logs_user_action`(`user_id` ASC, `action` ASC) USING BTREE,
  INDEX `idx_operation_logs_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '操作日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for performance_assessments
-- ----------------------------
DROP TABLE IF EXISTS `performance_assessments`;
CREATE TABLE `performance_assessments`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评估ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评估期间',
  `overall_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '总体得分',
  `rating` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C' COMMENT '评级',
  `coefficient` decimal(3, 2) NOT NULL DEFAULT 1.00 COMMENT '系数',
  `excellence_rating` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '卓越评级',
  `excellence_coefficient` decimal(3, 2) NULL DEFAULT NULL COMMENT '卓越系数',
  `indicator_scores` json NULL COMMENT '各指标得分详情',
  `assessment_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评估意见',
  `evaluator_id` int NOT NULL COMMENT '评估人ID',
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态：pending-待审核，approved-已审核，rejected-已拒绝',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_period`(`period` ASC) USING BTREE,
  INDEX `idx_rating`(`rating` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '绩效评估表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for performance_indicator_data
-- ----------------------------
DROP TABLE IF EXISTS `performance_indicator_data`;
CREATE TABLE `performance_indicator_data`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '数据ID',
  `indicator_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '指标ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期间',
  `actual_value` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '实际值',
  `target_value` decimal(10, 2) NULL DEFAULT NULL COMMENT '目标值',
  `achievement_rate` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '达成率',
  `score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '得分',
  `evaluator_id` int NULL DEFAULT NULL COMMENT '评估人ID',
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态：pending-待审核，approved-已审核，rejected-已拒绝',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_indicator_period`(`indicator_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '绩效指标数据表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for performance_indicators
-- ----------------------------
DROP TABLE IF EXISTS `performance_indicators`;
CREATE TABLE `performance_indicators`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '指标ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '指标类别',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '指标名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '指标描述',
  `weight` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '权重',
  `target_value` decimal(10, 2) NULL DEFAULT NULL COMMENT '目标值',
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '单位',
  `calculation_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual' COMMENT '计算方式：manual-手动，auto-自动',
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_business_line_category`(`business_line_id` ASC, `category` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '绩效指标定义表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for performance_records
-- ----------------------------
DROP TABLE IF EXISTS `performance_records`;
CREATE TABLE `performance_records`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '绩效记录ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '考核期间',
  `rating` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '绩效评级',
  `coefficient` decimal(3, 2) NOT NULL COMMENT '绩效系数',
  `excellence_rating` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '卓越贡献评级',
  `excellence_coefficient` decimal(3, 2) NULL DEFAULT NULL COMMENT '卓越贡献系数',
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评价意见',
  `evaluator_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评价人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_performance_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '绩效记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for performance_three_dimensional_scores
-- ----------------------------
DROP TABLE IF EXISTS `performance_three_dimensional_scores`;
CREATE TABLE `performance_three_dimensional_scores`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `calculation_period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '考核期间',
  `position_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '岗位评分',
  `performance_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '绩效评分',
  `profit_contribution` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '利润贡献',
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `review_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `reviewed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'manual',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_employee_period`(`employee_id` ASC, `calculation_period` ASC) USING BTREE,
  INDEX `idx_period`(`calculation_period` ASC) USING BTREE,
  INDEX `idx_employee`(`employee_id` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for position_benchmark_history
-- ----------------------------
DROP TABLE IF EXISTS `position_benchmark_history`;
CREATE TABLE `position_benchmark_history`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `old_value` decimal(3, 2) NOT NULL COMMENT '????',
  `new_value` decimal(3, 2) NOT NULL COMMENT '????',
  `change_ratio` decimal(5, 2) NOT NULL COMMENT '????(%)',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `approved_at` datetime NULL DEFAULT NULL COMMENT '????',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '??: pending(???),approved(???),rejected(???)',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_position`(`position_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `position_benchmark_history_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '??????????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for position_categories
-- ----------------------------
DROP TABLE IF EXISTS `position_categories`;
CREATE TABLE `position_categories`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `type` enum('main','sub') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'main' COMMENT '????: main-???, sub-???',
  `parent_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '???ID',
  `level` int NOT NULL DEFAULT 1 COMMENT '??: 1-???, 2-???',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '??',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '????',
  `position_count` int NOT NULL DEFAULT 0 COMMENT '??????',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  CONSTRAINT `position_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `position_categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for position_market_data
-- ----------------------------
DROP TABLE IF EXISTS `position_market_data`;
CREATE TABLE `position_market_data`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '市场数据ID',
  `position_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位标题',
  `position_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '岗位类别',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位等级',
  `base_salary_median` decimal(10, 2) NULL DEFAULT NULL COMMENT '基本工资中位数',
  `total_compensation_median` decimal(10, 2) NULL DEFAULT NULL COMMENT '总薪酬中位数',
  `demand_index` decimal(3, 1) NULL DEFAULT 5.0 COMMENT '需求指数 (1-10)',
  `supply_index` decimal(3, 1) NULL DEFAULT 5.0 COMMENT '供给指数 (1-10)',
  `experience_years_min` int NULL DEFAULT 0 COMMENT '最低经验年限要求',
  `experience_years_max` int NULL DEFAULT 0 COMMENT '最高经验年限要求',
  `data_source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '数据来源',
  `data_collection_date` date NOT NULL COMMENT '数据采集日期',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_position_level`(`position_title` ASC, `level` ASC) USING BTREE,
  INDEX `idx_data_collection_date`(`data_collection_date` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '岗位市场数据表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for position_value_assessments
-- ----------------------------
DROP TABLE IF EXISTS `position_value_assessments`;
CREATE TABLE `position_value_assessments`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评估ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评估期间',
  `position_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `responsibility_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '责任评分',
  `skill_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '技能评分',
  `experience_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '经验评分',
  `impact_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '影响评分',
  `composite_score` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '综合评分',
  `normalized_score` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '标准化评分',
  `market_ratio` decimal(5, 2) NOT NULL DEFAULT 1.00 COMMENT '市场比率',
  `final_value_score` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '最终价值评分',
  `evaluator_id` int NOT NULL COMMENT '评估人ID',
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态：pending-待审核，approved-已审核，rejected-已拒绝',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1-有效，0-无效',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee_period`(`employee_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_position`(`position_id` ASC) USING BTREE,
  INDEX `idx_business_line`(`business_line_id` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '岗位价值评估表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for position_value_criterias
-- ----------------------------
DROP TABLE IF EXISTS `position_value_criterias`;
CREATE TABLE `position_value_criterias`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标准ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `position_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位等级',
  `responsibility_weight` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '责任权重',
  `skill_weight` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '技能权重',
  `experience_weight` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '经验权重',
  `impact_weight` decimal(5, 2) NOT NULL DEFAULT 0.00 COMMENT '影响权重',
  `market_benchmark` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '市场基准值',
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NOT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_business_line_level`(`business_line_id` ASC, `position_level` ASC) USING BTREE,
  INDEX `idx_position_level`(`position_level` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '岗位价值评估标准表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for positions
-- ----------------------------
DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位代码',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位等级',
  `benchmark_value` decimal(10, 2) NOT NULL COMMENT '基准值比例',
  `line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属条线ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '岗位描述',
  `responsibilities` json NULL,
  `requirements` json NULL,
  `core_skills` json NULL,
  `career_path` json NULL,
  `work_environment` json NULL,
  `is_comprehensive` tinyint(1) NULL DEFAULT 0,
  `is_market` tinyint(1) NULL DEFAULT 0,
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属部门ID',
  `salary_range` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '薪资范围',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '岗位表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for profit_allocation_rules
-- ----------------------------
DROP TABLE IF EXISTS `profit_allocation_rules`;
CREATE TABLE `profit_allocation_rules`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '规则描述',
  `business_line_id` int NULL DEFAULT NULL COMMENT '业务线ID，为空表示全局规则',
  `rule_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ratio' COMMENT '规则类型：公式/比例/混合/自定义',
  `allocation_formula` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '分配公式表达式',
  `base_ratio` decimal(5, 4) NULL DEFAULT NULL COMMENT '基础分配比例',
  `direct_contribution_weight` decimal(3, 2) NOT NULL DEFAULT 0.40 COMMENT '直接贡献权重',
  `workload_weight` decimal(3, 2) NOT NULL DEFAULT 0.30 COMMENT '工作量权重',
  `quality_weight` decimal(3, 2) NOT NULL DEFAULT 0.20 COMMENT '质量权重',
  `position_value_weight` decimal(3, 2) NOT NULL DEFAULT 0.10 COMMENT '岗位价值权重',
  `performance_weight` decimal(3, 2) NOT NULL DEFAULT 0.20 COMMENT '绩效调整权重',
  `seniority_weight` decimal(3, 2) NOT NULL DEFAULT 0.05 COMMENT '资历权重',
  `skill_weight` decimal(3, 2) NOT NULL DEFAULT 0.10 COMMENT '技能权重',
  `code_quality_weight` decimal(3, 2) NOT NULL DEFAULT 0.30 COMMENT '代码质量权重',
  `delivery_on_time_weight` decimal(3, 2) NOT NULL DEFAULT 0.25 COMMENT '按时交付权重',
  `client_satisfaction_weight` decimal(3, 2) NOT NULL DEFAULT 0.25 COMMENT '客户满意度权重',
  `defect_rate_weight` decimal(3, 2) NOT NULL DEFAULT 0.20 COMMENT '缺陷率权重 (负向指标)',
  `excellence_bonus` decimal(3, 2) NOT NULL DEFAULT 0.20 COMMENT '卓越表现奖励系数',
  `quality_bonus` decimal(3, 2) NOT NULL DEFAULT 0.15 COMMENT '质量奖励系数',
  `innovation_bonus` decimal(3, 2) NOT NULL DEFAULT 0.10 COMMENT '创新奖励系数',
  `applicable_roles` json NULL COMMENT '适用角色列表',
  `min_contribution_threshold` decimal(8, 4) NULL DEFAULT NULL COMMENT '最小贡献度阈值',
  `max_contribution_cap` decimal(8, 4) NULL DEFAULT NULL COMMENT '最大贡献度上限',
  `effective_date` date NOT NULL COMMENT '生效日期',
  `expiry_date` date NULL DEFAULT NULL COMMENT '失效日期',
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0' COMMENT '版本号',
  `parent_rule_id` int NULL DEFAULT NULL COMMENT '父规则ID（用于版本追踪）',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT '状态：草稿/生效/失效/归档',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `updated_by` int NULL DEFAULT NULL COMMENT '更新人ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_allocation_rules_business_line`(`business_line_id` ASC) USING BTREE,
  INDEX `idx_allocation_rules_status_effective`(`status` ASC, `effective_date` ASC) USING BTREE,
  INDEX `idx_allocation_rules_date_range`(`effective_date` ASC, `expiry_date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '利润分配规则表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for profit_data
-- ----------------------------
DROP TABLE IF EXISTS `profit_data`;
CREATE TABLE `profit_data`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '数据ID',
  `business_line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '业务线ID',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期间',
  `total_revenue` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '总收入',
  `total_cost` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '总成本',
  `profit` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '利润',
  `profit_margin` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '利润率',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '项目ID',
  `data_source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'manual' COMMENT '????: manual-????, import-????, integration-????',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_business_line_period`(`business_line_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_project_period`(`project_id` ASC, `period` ASC) USING BTREE,
  INDEX `idx_period`(`period` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '利润数据表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_applications
-- ----------------------------
DROP TABLE IF EXISTS `project_applications`;
CREATE TABLE `project_applications`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '项目id',
  `application_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '团队申请id',
  `status` int NULL DEFAULT NULL COMMENT '申请状态 0 待审批  1  已取消 2 已拒绝',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for project_approval_flows
-- ----------------------------
DROP TABLE IF EXISTS `project_approval_flows`;
CREATE TABLE `project_approval_flows`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `flow_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `flow_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????team_application-????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `steps` json NOT NULL COMMENT '??????',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '???????',
  `status` tinyint NULL DEFAULT 1 COMMENT '???1-???0-??',
  `created_by` int NOT NULL COMMENT '???ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_approval_instances
-- ----------------------------
DROP TABLE IF EXISTS `project_approval_instances`;
CREATE TABLE `project_approval_instances`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `flow_id` int NOT NULL COMMENT '????ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `application_id` int NULL DEFAULT NULL COMMENT '????ID',
  `current_step` int NULL DEFAULT 1 COMMENT '????',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '???pending-????approved-????rejected-???',
  `initiated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???ID',
  `initiated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '????',
  `approval_data` json NULL COMMENT '????',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pai_project`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_bonus_allocations
-- ----------------------------
DROP TABLE IF EXISTS `project_bonus_allocations`;
CREATE TABLE `project_bonus_allocations`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分配id',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池id',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工id',
  `role_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色id',
  `role_weight` decimal(5, 2) NOT NULL COMMENT '角色权重',
  `performance_coeff` decimal(5, 2) NOT NULL COMMENT '绩效系数',
  `participation_ratio` decimal(5, 2) NOT NULL COMMENT '参与比例',
  `contribution_weight` decimal(5, 2) NOT NULL DEFAULT 100.00 COMMENT '贡献权重（百分比，0-100）',
  `bonus_amount` decimal(15, 2) NOT NULL COMMENT '奖金金额',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'calculated' COMMENT '状态：calculated-已计算，approved-已审批，deleted-已删除',
  `approved_at` datetime NULL DEFAULT NULL COMMENT '审批时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `pool_id`(`pool_id` ASC) USING BTREE,
  INDEX `employee_id`(`employee_id` ASC) USING BTREE,
  CONSTRAINT `project_bonus_allocations_ibfk_1` FOREIGN KEY (`pool_id`) REFERENCES `project_bonus_pools` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `project_bonus_allocations_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目奖金分配表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_bonus_calculation_history
-- ----------------------------
DROP TABLE IF EXISTS `project_bonus_calculation_history`;
CREATE TABLE `project_bonus_calculation_history`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算历史ID',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `calculation_number` int NOT NULL COMMENT '计算次数（第几次计算）',
  `total_amount` decimal(15, 2) NOT NULL COMMENT '奖金总额',
  `member_count` int NOT NULL COMMENT '成员数量',
  `total_weight` decimal(15, 4) NOT NULL COMMENT '总权重',
  `calculation_data` json NULL COMMENT '计算详情（成员分配明细）',
  `calculated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算人ID',
  `calculated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  `is_current` tinyint(1) NULL DEFAULT 1 COMMENT '是否为当前有效计算（1=是，0=历史记录）',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pool_id`(`pool_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_calculated_at`(`calculated_at` ASC) USING BTREE,
  INDEX `idx_is_current`(`is_current` ASC) USING BTREE,
  INDEX `idx_pool_calculation`(`pool_id` ASC, `calculation_number` ASC) USING BTREE,
  CONSTRAINT `fk_calculation_history_pool` FOREIGN KEY (`pool_id`) REFERENCES `project_bonus_pools` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目奖金池计算历史记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_bonus_pools
-- ----------------------------
DROP TABLE IF EXISTS `project_bonus_pools`;
CREATE TABLE `project_bonus_pools`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目id',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计算期间',
  `total_amount` decimal(15, 2) NOT NULL COMMENT '奖金总额',
  `profit_ratio` decimal(5, 2) NULL DEFAULT NULL COMMENT '利润比例',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态：pending-待审批，approved-已审批，distributed-已分配，deleted-已删除',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '描述',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人id',
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审批人id',
  `approved_at` datetime NULL DEFAULT NULL COMMENT '审批时间',
  `deleted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '删除人id',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_profit` decimal(20, 2) NULL DEFAULT NULL COMMENT '项目利润',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_project_period`(`project_id` ASC, `period` ASC) USING BTREE,
  CONSTRAINT `project_bonus_pools_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目奖金池表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_collaboration_logs
-- ----------------------------
DROP TABLE IF EXISTS `project_collaboration_logs`;
CREATE TABLE `project_collaboration_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `actor_id` int NOT NULL COMMENT '???ID',
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????publish-???apply-???approve-???reject-??',
  `action_target` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '?????project-???team-???member-??',
  `action_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `old_data` json NULL COMMENT '???',
  `new_data` json NULL COMMENT '???',
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'IP??',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pcl_project`(`project_id` ASC) USING BTREE,
  INDEX `idx_pcl_actor`(`actor_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_costs
-- ----------------------------
DROP TABLE IF EXISTS `project_costs`;
CREATE TABLE `project_costs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '成本ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目id',
  `cost_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '成本类型',
  `amount` decimal(12, 2) NOT NULL COMMENT '成本金额',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '成本描述',
  `date` date NOT NULL COMMENT '成本发生日期',
  `recorded_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录人',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态：pending-待审，confirmed-已确认，rejected-已拒绝',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_costs_project`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目成本表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_critical_paths
-- ----------------------------
DROP TABLE IF EXISTS `project_critical_paths`;
CREATE TABLE `project_critical_paths`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `path_data` json NOT NULL COMMENT '关键路径数据(里程碑ID数组)',
  `total_duration` int NULL DEFAULT NULL COMMENT '总持续时间(天)',
  `earliest_finish_date` date NULL DEFAULT NULL COMMENT '最早完成日期',
  `calculated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  `is_current` tinyint(1) NULL DEFAULT 1 COMMENT '是否为最新版本',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_is_current`(`is_current` ASC) USING BTREE,
  INDEX `idx_calculated_at`(`calculated_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目关键路径表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_executions
-- ----------------------------
DROP TABLE IF EXISTS `project_executions`;
CREATE TABLE `project_executions`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '执行记录ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `overall_progress` int NULL DEFAULT 0 COMMENT '整体进度(0-100)',
  `budget_usage` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '预算使用金额',
  `cost_overrun` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '成本超支金额',
  `schedule_variance` int NULL DEFAULT 0 COMMENT '进度偏差（天数，负数表示延期）',
  `quality_score` int NULL DEFAULT 0 COMMENT '质量评分(0-100)',
  `risk_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'low' COMMENT '风险等级：low-低，medium-中，high-高，critical-紧急',
  `team_performance` json NULL COMMENT '团队表现数据',
  `last_updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_risk_level`(`risk_level` ASC) USING BTREE,
  CONSTRAINT `project_executions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目执行跟踪表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_line_weights
-- ----------------------------
DROP TABLE IF EXISTS `project_line_weights`;
CREATE TABLE `project_line_weights`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权重ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目id',
  `line_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '业务线id',
  `weight` decimal(10, 4) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '权重设置原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_custom` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否为自定义权重（1=项目特定权重，0=使用默认权重）',
  `effective_date` datetime NULL DEFAULT NULL COMMENT '权重生效日期',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_line_weights_project`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目业务线权重表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_members
-- ----------------------------
DROP TABLE IF EXISTS `project_members`;
CREATE TABLE `project_members`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '成员ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目id',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `application_id` int NULL DEFAULT NULL COMMENT '????ID',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '在项目中的角色',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'active' COMMENT '状态：active-活跃，inactive-非活跃，left-离开',
  `join_date` date NULL DEFAULT NULL COMMENT '加入日期',
  `leave_date` date NULL DEFAULT NULL COMMENT '离开日期',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `apply_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '申请理由',
  `applied_at` datetime NULL DEFAULT NULL COMMENT '申请时间',
  `approved_at` datetime NULL DEFAULT NULL COMMENT '审批时间',
  `rejected_at` datetime NULL DEFAULT NULL COMMENT '拒绝时间',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注/审批意见',
  `participation_ratio` decimal(5, 2) NULL DEFAULT 1.00 COMMENT '参与比例',
  `contribution_weight` decimal(5, 2) NULL DEFAULT 1.00 COMMENT '贡献权重',
  `estimated_workload` decimal(5, 2) NULL DEFAULT 1.00 COMMENT '?????',
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `approval_comments` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role_id` int NULL DEFAULT NULL COMMENT '项目角色ID，关联project_roles表',
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_members_project`(`project_id` ASC) USING BTREE,
  INDEX `idx_project_members_employee`(`employee_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目成员表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_milestones
-- ----------------------------
DROP TABLE IF EXISTS `project_milestones`;
CREATE TABLE `project_milestones`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '里程碑描述',
  `target_date` date NOT NULL COMMENT '目标完成日期',
  `completion_date` date NULL DEFAULT NULL COMMENT '实际完成日期',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '状态：pending-待开始，in_progress-进行中，completed-已完成，delayed-延期，cancelled-已取消',
  `progress` int NULL DEFAULT 0 COMMENT '完成进度(0-100)',
  `deliverables` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '交付成果',
  `dependencies` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '依赖的里程碑ID列表（JSON格式）',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序顺序',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_target_date`(`target_date` ASC) USING BTREE,
  CONSTRAINT `project_milestones_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目里程碑表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_notifications
-- ----------------------------
DROP TABLE IF EXISTS `project_notifications`;
CREATE TABLE `project_notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `recipient_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???ID',
  `sender_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `notification_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??',
  `related_id` int NULL DEFAULT NULL COMMENT '????ID',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '????',
  `read_at` datetime NULL DEFAULT NULL COMMENT '????',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pn_recipient`(`recipient_id` ASC, `is_read` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_performance_manual
-- ----------------------------
DROP TABLE IF EXISTS `project_performance_manual`;
CREATE TABLE `project_performance_manual`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '记录ID',
  `pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '奖金池ID',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工ID',
  `employee_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '员工姓名',
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '绩效期间',
  `profit_contribution` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '利润贡献值',
  `position_value` decimal(10, 4) NOT NULL DEFAULT 0.0000 COMMENT '岗位价值值',
  `performance_score` decimal(10, 4) NOT NULL DEFAULT 0.0000 COMMENT '绩效表现值',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '状态：draft-草稿，submitted-已提交，calculated-已计算',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人ID',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '更新人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pool_employee`(`pool_id` ASC, `employee_id` ASC) USING BTREE,
  INDEX `idx_period`(`period` ASC) USING BTREE,
  INDEX `idx_employee`(`employee_id` ASC) USING BTREE,
  CONSTRAINT `project_performance_manual_ibfk_1` FOREIGN KEY (`pool_id`) REFERENCES `project_bonus_pools` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `project_performance_manual_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目成员手动绩效录入表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_progress_logs
-- ----------------------------
DROP TABLE IF EXISTS `project_progress_logs`;
CREATE TABLE `project_progress_logs`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `milestone_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联的里程碑ID',
  `progress_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '进度类型：milestone-里程碑，cost-成本，quality-质量，risk-风险',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '进度描述',
  `progress_value` int NULL DEFAULT NULL COMMENT '进度数值',
  `old_value` int NULL DEFAULT NULL COMMENT '变更前的值',
  `new_value` int NULL DEFAULT NULL COMMENT '变更后的值',
  `logged_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '记录人ID',
  `logged_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `milestone_id`(`milestone_id` ASC) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_progress_type`(`progress_type` ASC) USING BTREE,
  INDEX `idx_logged_at`(`logged_at` ASC) USING BTREE,
  CONSTRAINT `project_progress_logs_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `project_progress_logs_ibfk_2` FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目进度日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_requirements
-- ----------------------------
DROP TABLE IF EXISTS `project_requirements`;
CREATE TABLE `project_requirements`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `requirement_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????technical-???business-???quality-??',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'medium' COMMENT '????low-??medium-??high-??critical-??',
  `is_mandatory` tinyint(1) NULL DEFAULT 1 COMMENT '??????',
  `acceptance_criteria` json NULL COMMENT '????',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pr_project`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_role_weights
-- ----------------------------
DROP TABLE IF EXISTS `project_role_weights`;
CREATE TABLE `project_role_weights`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权重id',
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目id',
  `weights` json NOT NULL COMMENT '角色权重配置',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人id',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '更新人id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_project`(`project_id` ASC) USING BTREE,
  CONSTRAINT `project_role_weights_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目角色权重表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_roles
-- ----------------------------
DROP TABLE IF EXISTS `project_roles`;
CREATE TABLE `project_roles`  (
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `responsibilities` json NULL COMMENT '????',
  `required_skills` json NULL COMMENT '????',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '????',
  `is_system_role` tinyint(1) NULL DEFAULT 0 COMMENT '???????',
  `status` tinyint NULL DEFAULT 1 COMMENT '???1-???0-??',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `default_weight` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_state_history
-- ----------------------------
DROP TABLE IF EXISTS `project_state_history`;
CREATE TABLE `project_state_history`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `project_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `from_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '?????',
  `to_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '????',
  `metadata` json NULL COMMENT '????JSON???????ID????????',
  `created_at` datetime NOT NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_project_id`(`project_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_to_status`(`to_status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '?????????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_team_applications
-- ----------------------------
DROP TABLE IF EXISTS `project_team_applications`;
CREATE TABLE `project_team_applications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `applicant_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???ID??????',
  `team_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '????',
  `team_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `total_members` int NULL DEFAULT 0 COMMENT '?????',
  `estimated_cost` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '????',
  `application_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '废弃字段，保留仅用于向后兼容',
  `status_code` tinyint NOT NULL DEFAULT 0 COMMENT '申请状态码（0-待审批 1-已批准 2-已拒绝 3-需修改 4-已取消）',
  `submitted_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '???ID',
  `approved_at` datetime NULL DEFAULT NULL COMMENT '????',
  `approval_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_pta_project`(`project_id` ASC) USING BTREE,
  INDEX `idx_pta_status_code`(`status_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目代码',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '项目描述',
  `manager_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '项目经理ID',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'planning' COMMENT '状态：planning-计划中，active-进行中，completed-已完成，paused-暂停',
  `start_date` date NULL DEFAULT NULL COMMENT '开始日期',
  `end_date` date NULL DEFAULT NULL COMMENT '结束日期',
  `budget` decimal(15, 2) NULL DEFAULT NULL COMMENT '项目预算',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'medium' COMMENT '优先级：low-低，medium-中，high-高，critical-紧急',
  `profit_target` decimal(15, 2) NULL DEFAULT NULL COMMENT '利润目标',
  `work_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '工作内容详情',
  `skill_requirements` json NULL COMMENT '技能要求',
  `cooperation_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'draft' COMMENT '协作状态：draft-草稿，published-已发布，team_building-组建中，pending_approval-待审批，approved-已批准，rejected-已拒绝',
  `bonus_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '?????pending-???, calculated-???, approved-???, distributed-???',
  `published_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '发布人ID',
  `published_at` datetime NULL DEFAULT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_projects_manager`(`manager_id` ASC) USING BTREE,
  INDEX `idx_projects_status`(`status` ASC) USING BTREE,
  INDEX `idx_projects_cooperation_status`(`cooperation_status` ASC) USING BTREE,
  INDEX `idx_projects_published_by`(`published_by` ASC) USING BTREE,
  INDEX `idx_bonus_status`(`bonus_status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for reports
-- ----------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '??ID',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '?????bonus-?????statistics-?????custom-?????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `date_range` json NULL COMMENT '????',
  `fields` json NULL COMMENT '????',
  `filters` json NULL COMMENT '????',
  `format` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'excel' COMMENT '?????excel/pdf/csv',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'generating' COMMENT '???generating-????completed-????failed-???deleted-???',
  `size` bigint NULL DEFAULT 0 COMMENT '????????',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '?????JSON???',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???ID',
  `created_by_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '?????',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '????',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '????',
  `error` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_menus
-- ----------------------------
DROP TABLE IF EXISTS `role_menus`;
CREATE TABLE `role_menus`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色ID',
  `menu_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单ID',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_menu`(`role_id` ASC, `menu_id` ASC) USING BTREE,
  INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
  INDEX `idx_menu_id`(`menu_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 607 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色菜单关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_at` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `menu_check_strictly` tinyint(1) NULL DEFAULT 1 COMMENT '菜单树选择项是否关联显示：1-严格关联，0-不严格',
  `permissions` json NULL COMMENT '权限列表',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for simulation_scenarios
-- ----------------------------
DROP TABLE IF EXISTS `simulation_scenarios`;
CREATE TABLE `simulation_scenarios`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '场景描述',
  `base_pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '基础奖金池ID',
  `parameters` json NOT NULL COMMENT '模拟参数',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '创建人ID',
  `is_public` tinyint(1) NULL DEFAULT 0 COMMENT '是否公开',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '模拟场景表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for skill_categories
-- ----------------------------
DROP TABLE IF EXISTS `skill_categories`;
CREATE TABLE `skill_categories`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '#409eff' COMMENT '????',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '??',
  `skill_count` int NOT NULL DEFAULT 0 COMMENT '??????',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for skill_tags
-- ----------------------------
DROP TABLE IF EXISTS `skill_tags`;
CREATE TABLE `skill_tags`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????ID',
  `level` enum('basic','intermediate','advanced','expert') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'basic' COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `synonyms` json NULL COMMENT '?????',
  `related_skills` json NULL COMMENT '????ID??',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '????',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '????',
  `is_system` tinyint(1) NOT NULL DEFAULT 0 COMMENT '??????',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '????',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_category_id`(`category_id` ASC) USING BTREE,
  INDEX `idx_level`(`level` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_usage_count`(`usage_count` ASC) USING BTREE,
  CONSTRAINT `skill_tags_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `skill_categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for system_config_history
-- ----------------------------
DROP TABLE IF EXISTS `system_config_history`;
CREATE TABLE `system_config_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_id` int NOT NULL COMMENT '??ID',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '??',
  `changed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `changed_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `change_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_config_id`(`config_id` ASC) USING BTREE,
  INDEX `idx_changed_at`(`changed_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 133 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for system_configs
-- ----------------------------
DROP TABLE IF EXISTS `system_configs`;
CREATE TABLE `system_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '????: basic/bonus/calculation/notification/security/feature',
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???',
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '???(??JSON)',
  `value_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string' COMMENT '???: string/number/boolean/json',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '????',
  `is_encrypted` tinyint NULL DEFAULT 0 COMMENT '??????',
  `is_editable` tinyint NULL DEFAULT 1 COMMENT '????UI??',
  `validation_rule` json NULL COMMENT '????',
  `default_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '???',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_category_key`(`category` ASC, `key` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_editable`(`is_editable` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 54 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '?????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for system_notifications
-- ----------------------------
DROP TABLE IF EXISTS `system_notifications`;
CREATE TABLE `system_notifications`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知ID',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '接收用户ID',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '通知内容',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型: milestone/project/bonus/system',
  `related_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联对象ID',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'normal' COMMENT '优先级: low/normal/high/urgent',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `read_at` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `expires_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_is_read`(`is_read` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '系统通知消息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for three_dimensional_calculation_results
-- ----------------------------
DROP TABLE IF EXISTS `three_dimensional_calculation_results`;
CREATE TABLE `three_dimensional_calculation_results`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `weight_config_id` int NOT NULL DEFAULT 0,
  `calculation_period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `bonus_pool_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `profit_contribution_score` decimal(15, 4) NOT NULL DEFAULT 0.0000,
  `position_value_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `performance_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `normalized_profit_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `normalized_position_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `normalized_performance_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `weighted_profit_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `weighted_position_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `weighted_performance_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `total_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `adjusted_score` decimal(8, 4) NULL DEFAULT NULL,
  `final_score` decimal(8, 4) NOT NULL DEFAULT 0.0000,
  `score_rank` int NULL DEFAULT NULL,
  `percentile_rank` decimal(5, 2) NULL DEFAULT NULL,
  `department_rank` int NULL DEFAULT NULL,
  `level_rank` int NULL DEFAULT NULL,
  `bonus_coefficient` decimal(6, 4) NULL DEFAULT NULL,
  `base_bonus_amount` decimal(12, 2) NULL DEFAULT NULL,
  `adjustment_amount` decimal(12, 2) NULL DEFAULT NULL,
  `final_bonus_amount` decimal(12, 2) NULL DEFAULT NULL,
  `profit_contribution_rate` decimal(5, 2) NOT NULL DEFAULT 0.00,
  `position_value_rate` decimal(5, 2) NOT NULL DEFAULT 0.00,
  `performance_rate` decimal(5, 2) NOT NULL DEFAULT 0.00,
  `profit_calculation_details` json NULL,
  `position_calculation_details` json NULL,
  `performance_calculation_details` json NULL,
  `calculation_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'weighted_sum',
  `calculation_params` json NULL,
  `profit_data_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `position_data_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `performance_data_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `data_completeness` decimal(5, 2) NOT NULL DEFAULT 100.00,
  `calculation_confidence` decimal(5, 2) NOT NULL DEFAULT 80.00,
  `outlier_flag` tinyint(1) NOT NULL DEFAULT 0,
  `outlier_reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `review_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending',
  `review_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `reviewed_by` int NULL DEFAULT NULL,
  `reviewed_at` datetime NULL DEFAULT NULL,
  `previous_period_score` decimal(8, 4) NULL DEFAULT NULL,
  `score_change_rate` decimal(6, 2) NULL DEFAULT NULL,
  `trend_direction` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `calculated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT 1,
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_employee_config_period`(`employee_id` ASC, `weight_config_id` ASC, `calculation_period` ASC) USING BTREE,
  INDEX `idx_calculation_result_employee_period`(`employee_id` ASC, `calculation_period` ASC) USING BTREE,
  INDEX `idx_calculation_result_config_period`(`weight_config_id` ASC, `calculation_period` ASC) USING BTREE,
  INDEX `idx_calculation_result_period_score`(`calculation_period` ASC, `final_score` ASC) USING BTREE,
  INDEX `idx_calculation_result_pool_score`(`bonus_pool_id` ASC, `final_score` ASC) USING BTREE,
  INDEX `idx_calculation_result_review_time`(`review_status` ASC, `calculated_at` ASC) USING BTREE,
  INDEX `idx_calculation_result_rankings`(`score_rank` ASC, `percentile_rank` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for three_dimensional_weight_configs
-- ----------------------------
DROP TABLE IF EXISTS `three_dimensional_weight_configs`;
CREATE TABLE `three_dimensional_weight_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权重配置名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权重配置代码',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '配置描述',
  `profit_contribution_weight` decimal(4, 3) NOT NULL DEFAULT 0.500 COMMENT '利润贡献度权重',
  `position_value_weight` decimal(4, 3) NOT NULL DEFAULT 0.300 COMMENT '岗位价值权重',
  `performance_weight` decimal(4, 3) NOT NULL DEFAULT 0.200 COMMENT '绩效表现权重',
  `profit_direct_contribution_weight` decimal(4, 3) NOT NULL DEFAULT 0.400 COMMENT '利润-直接贡献权重',
  `profit_workload_weight` decimal(4, 3) NOT NULL DEFAULT 0.300 COMMENT '利润-工作量权重',
  `profit_quality_weight` decimal(4, 3) NOT NULL DEFAULT 0.200 COMMENT '利润-质量权重',
  `profit_position_value_weight` decimal(4, 3) NOT NULL DEFAULT 0.100 COMMENT '利润-岗位价值权重',
  `position_skill_complexity_weight` decimal(4, 3) NOT NULL DEFAULT 0.250 COMMENT '岗位-技能复杂度权重',
  `position_responsibility_weight` decimal(4, 3) NOT NULL DEFAULT 0.300 COMMENT '岗位-责任范围权重',
  `position_decision_impact_weight` decimal(4, 3) NOT NULL DEFAULT 0.200 COMMENT '岗位-决策影响权重',
  `position_experience_weight` decimal(4, 3) NOT NULL DEFAULT 0.150 COMMENT '岗位-经验要求权重',
  `position_market_value_weight` decimal(4, 3) NOT NULL DEFAULT 0.100 COMMENT '岗位-市场价值权重',
  `performance_work_output_weight` decimal(4, 3) NOT NULL DEFAULT 0.250 COMMENT '绩效-工作产出权重',
  `performance_work_quality_weight` decimal(4, 3) NOT NULL DEFAULT 0.200 COMMENT '绩效-工作质量权重',
  `performance_work_efficiency_weight` decimal(4, 3) NOT NULL DEFAULT 0.150 COMMENT '绩效-工作效率权重',
  `performance_collaboration_weight` decimal(4, 3) NOT NULL DEFAULT 0.150 COMMENT '绩效-协作能力权重',
  `performance_innovation_weight` decimal(4, 3) NOT NULL DEFAULT 0.100 COMMENT '绩效-创新能力权重',
  `performance_leadership_weight` decimal(4, 3) NOT NULL DEFAULT 0.100 COMMENT '绩效-领导力权重',
  `performance_learning_weight` decimal(4, 3) NOT NULL DEFAULT 0.050 COMMENT '绩效-学习能力权重',
  `excellence_bonus` decimal(4, 3) NOT NULL DEFAULT 0.200 COMMENT '卓越表现奖励系数',
  `performance_multiplier` decimal(4, 3) NOT NULL DEFAULT 1.500 COMMENT '绩效乘数',
  `position_level_multiplier` decimal(4, 3) NOT NULL DEFAULT 1.200 COMMENT '岗位等级乘数',
  `applicable_business_lines` json NULL COMMENT '适用业务线ID列表',
  `applicable_departments` json NULL COMMENT '适用部门ID列表',
  `applicable_position_levels` json NULL COMMENT '适用岗位等级列表',
  `applicable_employee_types` json NULL COMMENT '适用员工类型列表',
  `calculation_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'weighted_sum' COMMENT '计算方法：加权和/加权积/混合/自定义',
  `normalization_method` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'z_score' COMMENT '标准化方法',
  `weight_adjustment_rules` json NULL COMMENT '权重调整规则JSON',
  `conditional_weights` json NULL COMMENT '条件权重配置JSON',
  `custom_formula` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '自定义计算公式',
  `effective_date` datetime NOT NULL COMMENT '生效日期',
  `expiry_date` datetime NULL DEFAULT NULL COMMENT '失效日期',
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0' COMMENT '版本号',
  `parent_config_id` int NULL DEFAULT NULL COMMENT '父配置ID（版本追踪）',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '使用次数',
  `last_used_at` datetime NULL DEFAULT NULL COMMENT '最后使用时间',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT '状态：草稿/生效/失效/归档',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `unique_weight_config_code`(`code` ASC) USING BTREE,
  INDEX `idx_weight_config_status_effective`(`status` ASC, `effective_date` ASC) USING BTREE,
  INDEX `idx_weight_config_date_range`(`effective_date` ASC, `expiry_date` ASC) USING BTREE,
  INDEX `idx_weight_config_usage`(`usage_count` ASC, `last_used_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '三维模型权重配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '员工ID，关联employees表',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色ID',
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '部门ID',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `last_login` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  INDEX `department_id`(`department_id` ASC) USING BTREE,
  INDEX `idx_users_username`(`username` ASC) USING BTREE,
  INDEX `idx_users_email`(`email` ASC) USING BTREE,
  INDEX `idx_users_employee_id`(`employee_id` ASC) USING BTREE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
