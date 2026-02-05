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

 Date: 03/02/2026 19:22:17
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
-- Records of approval_workflows
-- ----------------------------

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
-- Records of audit_logs
-- ----------------------------

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
-- Records of bonus_allocation_results
-- ----------------------------

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
-- Records of bonus_allocation_rules
-- ----------------------------

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
-- Records of bonus_pools
-- ----------------------------
INSERT INTO `bonus_pools` VALUES ('vWPfxdVQcyYtm2Ge', '2025', 1000000.00, 0.15, 150000.00, 0.02, 0.03, 142500.00, 'paid', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 17:15:48', '2026-02-03 17:47:53', '2026-02-03 17:35:37');

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
-- Records of business_lines
-- ----------------------------
INSERT INTO `business_lines` VALUES ('9KwOiW6b4kJiBpbi', '产品研发线', 'PRODUCT', '产品开发与优化（核心业务，30%）', 0.3000, '4Yc3pjFRO7SACMSC', 12.01, '[]', 1, '2025-08-17 01:00:44', '2026-02-02 15:59:09');
INSERT INTO `business_lines` VALUES ('GuDI5gOHb8rjdQ8U', '商务渠道线', 'BUSINESS_MARKET', '商务流程、渠道拓展、商机汇总、合同管理（15%）', 0.3500, 'ALRVuAaWddFzdu7h', 5.00, '[{\"name\": \"asdd\", \"target\": 1, \"weight\": 1}]', 1, '2025-08-22 12:20:47', '2026-02-02 15:59:42');
INSERT INTO `business_lines` VALUES ('Ly6kLcrzWVgszZXW', '市场工程线', 'MARKETING_ENG', '售前支持、市场推广、技术支持（7%）', 0.0700, '4Yc3pjFRO7SACMSC', 0.00, '[]', 1, '2025-08-17 01:00:44', '2026-02-02 16:00:09');
INSERT INTO `business_lines` VALUES ('SA0HPyflKXdlOyXv', '运营支持线', 'OPERATION', '内部运营管理（支持性业务，3%）', 0.0300, 'EbPi9xDqgDWYb0CL', 0.00, '[]', 1, '2025-08-17 01:00:44', '2026-02-02 15:59:34');
INSERT INTO `business_lines` VALUES ('sales', '销售市场', 'SALES', '销售和市场推广（已禁用，由市场工程线统一管理）', 0.0000, NULL, 0.00, NULL, 0, '2025-08-28 12:20:18', '2026-01-14 16:39:07');
INSERT INTO `business_lines` VALUES ('tech', '技术研发', 'TECH', '技术开发相关业务（基础研发，20%）', 0.0000, NULL, 0.00, '[]', 0, '2025-08-28 12:20:18', '2026-01-16 15:54:32');
INSERT INTO `business_lines` VALUES ('XJD1HavHAMpjxdl0', '项目实施线', 'IMPLEMENTATION', '项目交付实施（重要交付，25%）', 0.2500, 'NBwpI13bBbTJGjwY', 0.00, '[]', 1, '2025-08-17 01:00:44', '2026-02-02 15:59:20');

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
-- Records of business_rules
-- ----------------------------

-- ----------------------------
-- Table structure for career_path_templates
-- ----------------------------
DROP TABLE IF EXISTS `career_path_templates`;
CREATE TABLE `career_path_templates`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '????',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1.0.0' COMMENT '???',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '????',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '??????',
  `usage_count` int NOT NULL DEFAULT 0 COMMENT '????',
  `status` enum('draft','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft' COMMENT '??',
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
-- Records of career_path_templates
-- ----------------------------
INSERT INTO `career_path_templates` VALUES ('template_p3_tech', 'P3技术工程师发展路径', 'P3_TECH_PATH', 'P3', 'technical', 'P3级别技术工程师的职业发展路径规划', '1.0.0', 1, 1, 0, 'active', 'P4高级工程师', '18-24个月', '[\"技术专家\", \"技术经理\"]', '[\"架构设计\", \"性能优化\", \"技术创新\"]', '[\"技术深度\", \"业务理解\", \"团队协作\"]', '2年以上相关工作经验', '掌握核心技术栈，能独立完成复杂任务', '主导中型项目，贡献核心模块', '绩效达到良好及以上', '[\"编程语言\", \"框架使用\", \"数据库\", \"版本控制\"]', '[\"架构设计\", \"性能优化\", \"代码审查\", \"技术文档\"]', '[\"技术分享\", \"新人指导\", \"跨团队协作\"]', '[\"高级编程课程\", \"架构设计课程\", \"性能优化专题\"]', '[\"相关技术认证\", \"行业认证\"]', '[\"核心项目开发\", \"技术攻坚项目\", \"开源贡献\"]', '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `career_path_templates` VALUES ('template_p4_tech', 'P4高级工程师发展路径', 'P4_TECH_PATH', 'P4', 'technical', 'P4级别高级工程师的职业发展路径规划', '1.0.0', 1, 1, 0, 'active', 'P5技术专家', '24-36个月', '[\"技术架构师\", \"技术总监\"]', '[\"系统架构\", \"技术决策\", \"团队建设\"]', '[\"技术广度\", \"架构能力\", \"影响力\"]', '4年以上相关工作经验', '精通技术栈，具备架构设计能力', '主导大型项目，技术难点攻坚', '绩效达到优秀', '[\"多技术栈\", \"系统设计\", \"性能调优\", \"安全\"]', '[\"架构设计\", \"技术选型\", \"技术规划\", \"团队培养\"]', '[\"技术布道\", \"团队管理\", \"跨部门协作\"]', '[\"架构师课程\", \"领导力培训\", \"技术管理\"]', '[\"高级技术认证\", \"架构师认证\"]', '[\"大型项目架构\", \"技术体系建设\", \"开源项目\"]', '2025-12-24 18:26:41', '2025-12-24 18:26:41');

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
-- Records of cities
-- ----------------------------
INSERT INTO `cities` VALUES ('city_beijing', '北京', 'BJ', 'tier1', 1.30, '直辖市', '一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_changsha', '长沙', 'CS', 'tier1_new', 1.00, '湖南省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_chengdu', '成都', 'CD', 'tier1_new', 1.10, '四川省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_chongqing', '重庆', 'CQ', 'tier1_new', 1.05, '直辖市', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_dalian', '大连', 'DL', 'tier2', 0.95, '辽宁省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_fuzhou', '福州', 'FZ', 'tier2', 0.90, '福建省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_guangzhou', '广州', 'GZ', 'tier1', 1.25, '广东省', '一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_hangzhou', '杭州', 'HZ', 'tier1_new', 1.10, '浙江省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_hefei', '合肥', 'HF', 'tier2', 0.90, '安徽省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_jinan', '济南', 'JN', 'tier2', 0.90, '山东省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_nanjing', '南京', 'NJ', 'tier1_new', 1.08, '江苏省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_ningbo', '宁波', 'NB', 'tier2', 0.95, '浙江省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_other', '其他城市', 'OTHER', 'tier3', 0.80, '全国', '其他城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_qingdao', '青岛', 'QD', 'tier2', 0.95, '山东省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_shanghai', '上海', 'SH', 'tier1', 1.30, '直辖市', '一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_shenzhen', '深圳', 'SZ', 'tier1', 1.25, '广东省', '一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_suzhou', '苏州', 'SZ2', 'tier1_new', 1.08, '江苏省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_tianjin', '天津', 'TJ', 'tier1_new', 1.08, '直辖市', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_wuhan', '武汉', 'WH', 'tier1_new', 1.05, '湖北省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_wuxi', '无锡', 'WX', 'tier3', 0.85, '江苏省', '三线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_xiamen', '厦门', 'XM', 'tier2', 0.95, '福建省', '二线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_xian', '西安', 'XA', 'tier1_new', 1.05, '陕西省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_yangzhou', '扬州', 'YZ', 'tier3', 0.85, '江苏省', '三线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_zhengzhou', '郑州', 'ZZ', 'tier1_new', 1.00, '河南省', '新一线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');
INSERT INTO `cities` VALUES ('city_zhuhai', '珠海', 'ZH', 'tier3', 0.85, '广东省', '三线城市', 1, '2025-11-13 09:51:28', '2025-11-13 09:51:28');

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
-- Records of departments
-- ----------------------------
INSERT INTO `departments` VALUES ('4BAUkcwX5jhIKb1U', '项目实施(成都一组)', 'IMPL_CD_01', '', 'g5DpgVqv95UhsYeE', 'XJD1HavHAMpjxdl0', NULL, 1, 0, '2026-02-02 11:45:33', '2026-02-02 12:37:25', NULL);
INSERT INTO `departments` VALUES ('4CuiR2OCppDcvdTP', '项目及质量管理办', 'PRO_Q_MANAGE_OFFICE', '', 'DVT8oKugiR2rB5Zr', NULL, NULL, 1, 0, '2026-02-02 12:42:42', '2026-02-02 12:42:42', NULL);
INSERT INTO `departments` VALUES ('d9zSGsgB7KP3kXKF', '商务部', 'BUSINESS', '商务拓展与合作', 'ZE5q0Z1U3fCr7JsW', 'GuDI5gOHb8rjdQ8U', NULL, 1, 5, '2025-08-16 17:00:43', '2026-02-02 11:52:11', NULL);
INSERT INTO `departments` VALUES ('dept_operation', '运营部', 'OPERATION', '业务运营部门', NULL, 'SA0HPyflKXdlOyXv', NULL, 1, 0, '2025-08-28 04:20:17', '2025-10-16 09:49:54', 1);
INSERT INTO `departments` VALUES ('dept_tech', '技术部', 'TECH', '技术开发部门', NULL, '9KwOiW6b4kJiBpbi', NULL, 1, 0, '2025-08-28 04:20:17', '2026-01-08 19:39:04', 1);
INSERT INTO `departments` VALUES ('DsYMP3aBv5fLHeuW', '综合管理部', 'ADMINISTRATION', '财务、人事、行政管理', NULL, 'SA0HPyflKXdlOyXv', NULL, 1, 6, '2025-08-16 17:00:43', '2026-01-07 17:08:44', NULL);
INSERT INTO `departments` VALUES ('DVT8oKugiR2rB5Zr', '总经办', 'GMAMAGEROFFICE', '', NULL, NULL, '4Yc3pjFRO7SACMSC', 1, 0, '2026-02-02 12:39:48', '2026-02-02 12:40:08', NULL);
INSERT INTO `departments` VALUES ('frLU1y7leCn9riSx', '产品研发(北京一组)', 'PROD_BJ_01', '', 'ji5a5e48BWNBG0Sl', NULL, NULL, 1, 0, '2026-02-02 11:53:28', '2026-02-02 12:37:55', NULL);
INSERT INTO `departments` VALUES ('g5DpgVqv95UhsYeE', '项目实施部', 'IMPL', '', NULL, 'XJD1HavHAMpjxdl0', NULL, 1, 0, '2026-02-02 11:47:43', '2026-02-02 11:47:43', NULL);
INSERT INTO `departments` VALUES ('iXaGZDGLiquvqFVf', '人力资源办', 'HR_OFFICE', '', 'DVT8oKugiR2rB5Zr', NULL, '0s4u0CI64MgvYpM4', 1, 0, '2026-02-02 12:43:25', '2026-02-02 12:43:25', NULL);
INSERT INTO `departments` VALUES ('IZgCF3yn0hjFwDdy', '财务管理办', 'FMANAGEOFFICE', '', 'DVT8oKugiR2rB5Zr', 'SA0HPyflKXdlOyXv', 'uW6c7E69lecxMM0c', 1, 0, '2026-02-02 12:41:46', '2026-02-02 16:05:24', NULL);
INSERT INTO `departments` VALUES ('ji5a5e48BWNBG0Sl', '产品研发部', 'PRODUCT', '产品规划、设计、研发、优化', NULL, '9KwOiW6b4kJiBpbi', NULL, 1, 1, '2025-08-16 17:00:43', '2026-02-02 11:49:18', NULL);
INSERT INTO `departments` VALUES ('LrjB7X5dm5NwVONx', '项目实施(北京一组)', 'IMPL_02', '客户项目交付实施', 'g5DpgVqv95UhsYeE', 'XJD1HavHAMpjxdl0', NULL, 1, 3, '2025-08-16 17:00:43', '2026-02-02 12:37:38', NULL);
INSERT INTO `departments` VALUES ('N9ZDMR5BICNv4phQ', '测试部', '002323', '爱上对方爱上对方', NULL, 'Ly6kLcrzWVgszZXW', 'AEj02DNLHOssk29p', 0, 0, '2025-08-17 17:55:10', '2025-10-16 09:49:54', NULL);
INSERT INTO `departments` VALUES ('NUd4vzaNoxq57jrS', '项目实施(北京二组)', 'IMPL_01', '客户项目交付实施', 'g5DpgVqv95UhsYeE', 'XJD1HavHAMpjxdl0', NULL, 1, 2, '2025-08-16 17:00:43', '2026-02-02 12:37:31', NULL);
INSERT INTO `departments` VALUES ('ovlYHVmYZe9xPTvF', '品宣培训组', 'PROD_BRAND', '', 'ZE5q0Z1U3fCr7JsW', 'Ly6kLcrzWVgszZXW', NULL, 1, 0, '2026-02-02 11:51:24', '2026-02-02 15:58:45', NULL);
INSERT INTO `departments` VALUES ('pMluTilSAzLdZu7U', '产品研发(成都一组)', 'PROD_CD_01', '', 'ji5a5e48BWNBG0Sl', '9KwOiW6b4kJiBpbi', NULL, 1, 0, '2025-09-08 10:19:15', '2026-02-02 12:38:12', NULL);
INSERT INTO `departments` VALUES ('ZE5q0Z1U3fCr7JsW', '市场工程部', 'MARKETING_ENG', '售前支持、市场推广、技术支持', NULL, 'Ly6kLcrzWVgszZXW', NULL, 1, 4, '2025-08-16 17:00:43', '2025-10-16 09:49:54', NULL);

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
-- Records of employee_bonus_records
-- ----------------------------

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
-- Records of employee_profit_contributions
-- ----------------------------
INSERT INTO `employee_profit_contributions` VALUES ('0FfUiOtDgWyqtE6J', '9xgYQ4MYWRZ8Fh4u', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('0R2BkqJG5gUme70d', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('0YnDg06ccTrzZtmL', 'IdfqHfaqF25MD78C', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('185SjbG0zxgxQObK', '4Yc3pjFRO7SACMSC', '2026Q2', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('1Fil0FsEKKUIEx9T', 'xxrgyt4dDrY0wYZs', '2025Q3', NULL, 'direct', 0.00, 0.7360, 160.00, 0.1000, 0.86, 1.20, 0.80, 0.12, 0.86, 0.74, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('1tNL7SsMdMjVaGaN', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('1ZLRDec04l1lNIYJ', 'BTBIiv5yHnfkyeKb', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('2GjxzyBc6IcNbsxf', '4Yc3pjFRO7SACMSC', '2025', NULL, 'direct', 0.00, 1.0480, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 1.05, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('2HwKIq1y2XMsF0zk', 'ALRVuAaWddFzdu7h', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('4BhIXjflhGQ5EAUb', 'OuM2daatV8gWJpiI', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('4CrndjKq2Z1KmL9T', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('54CNsXQjiA8jj4Ar', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('5HKsnafmoPvSpR2D', 'BqPRlZFYwwG376AZ', '2026Q1', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('5jCXD2DFixWH9sEi', 'FZOpTvVEQ0NWPs1a', '2025Q3', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('67NB4kwtCmBgWTZB', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('6873IdYWWFnQHZdZ', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('6GQ90SlllpOr2IRt', 'D3fZif5G61ZHTexI', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('6kNFu7zoZrDEcGNA', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('6p9yMPXedrZag0vV', 'uW6c7E69lecxMM0c', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('6RSnuNptycWsfoNg', 'IdfqHfaqF25MD78C', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('6ujaQQE9wqhfQSHW', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 11:37:00', '2026-01-15 11:37:00');
INSERT INTO `employee_profit_contributions` VALUES ('7n0kdtHUwtuzas3H', 'BqPRlZFYwwG376AZ', '2025Q1', NULL, 'direct', 80409.80, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 103354.496}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('7S1vlmBO0ooBxCcc', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('7XnbQM9YDLJobeFQ', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('8hiyr8tIRJAExWbR', 'Zf2TO8nUll7qk2b8', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('8hrV2ijYlCje4MqM', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('8pTPzJccydFqnEix', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('8wbUDBPO1u3LUXBq', 'D3fZif5G61ZHTexI', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('8zrPCuXUEZOCZQN0', 'Zf2TO8nUll7qk2b8', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('9J9VrA7gJ7EqtRmO', '0s4u0CI64MgvYpM4', '2025Q3', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `employee_profit_contributions` VALUES ('9MlV3ZCBFGcLadF7', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('9W4o6lTPUHqo94jf', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('9WjjZFFRXUSFkqND', 'lSBwKv6QG9O3EFsr', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('A2JpZgizlN91HXMt', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('aHJ4dJiuuzE00mAW', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:25:48', '2026-01-15 10:25:48');
INSERT INTO `employee_profit_contributions` VALUES ('aJMqQgztLdZIPeFi', 'BqPRlZFYwwG376AZ', '2025', NULL, 'direct', 0.00, 1.0480, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 1.05, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('aniAXk9H3DWfaBMf', 'rRaokmUmAVXtkaRu', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('apzjzZM5512Mrbf9', 'WBtjGNZ2h7hDwbRq', '2025', NULL, 'direct', 0.00, 0.5740, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.57, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('B61usW9B4Wls18kh', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('btN28Kh7DUgbtCAn', '0s4u0CI64MgvYpM4', '2026Q2', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('BUoO2X3SkIdB7uvs', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('bx5Oc91jl752qz3m', 'JGDxmyz6YvhgVXzm', '2025Q1', NULL, 'direct', 173582.89, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 287388.896}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('bZo7PTAo0lQ6rcLK', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('c89f3pLluXuGEn0D', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('cdjxOobmLjhwTZf1', 'OuM2daatV8gWJpiI', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('ciIheBugcHxYlcmH', 'Zf2TO8nUll7qk2b8', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('ckLn5FGkEfIkd8RI', '4Yc3pjFRO7SACMSC', '2026Q2', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('CpZehaXjsBn59C1h', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:57:33', '2026-01-15 10:57:33');
INSERT INTO `employee_profit_contributions` VALUES ('cUvAMJJ4S9781hUp', '5NQDb4fAifAEuuK5', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('cvqQrv1CFjah2y7K', '0s4u0CI64MgvYpM4', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('DAepkRMDXLUHjP2h', '6aha8mGPcBt2T2L7', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('DAnHutm8bjGj3vvi', 'D3fZif5G61ZHTexI', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('deoFsEcB3MJJGKOm', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 11:33:47', '2026-01-15 11:33:47');
INSERT INTO `employee_profit_contributions` VALUES ('DU4Pm1G6jXtN1PEI', 'IdfqHfaqF25MD78C', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('e112We7tC4ZOIgkJ', 'rRaokmUmAVXtkaRu', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:21', '2026-02-02 10:31:21');
INSERT INTO `employee_profit_contributions` VALUES ('E7MKiLqFOxYwqRK2', 'JGDxmyz6YvhgVXzm', '2026Q2', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('efdErSDx0l5Vn96z', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('EGauvGELdemz7B32', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('erJo2lhWyS07WbtP', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('eUz6w4nzWEAJsUB4', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('F6hL0Pf94Pjox805', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('f9cspOwGv9h66Q1o', 'xxrgyt4dDrY0wYZs', '2026Q2', NULL, 'direct', 0.00, 0.5850, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.59, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('fGVdS3H0OpsXNnog', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('fkUS1g9ETUAJ8sYO', 'FZOpTvVEQ0NWPs1a', '2025Q1', NULL, 'direct', 85769.17, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 142001.93600000002}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('FoET8Ijl6GlCpXHl', 'Zf2TO8nUll7qk2b8', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:21', '2026-02-02 10:31:21');
INSERT INTO `employee_profit_contributions` VALUES ('fWS3xZRWxhCY3zgK', 'rRaokmUmAVXtkaRu', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('gaDQn7euBcOo3Hqm', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('gaqcTdPPW6P1qpR4', 'IdfqHfaqF25MD78C', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('gfngcH0Ai3We1Vdg', 'Kr7ubEuz626z45Tr', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('GHqm9alaSOuK72Gc', 'j46LEwS76rO6rSi7', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('Gjb0EPsLZ1AKqnbg', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 15:02:34', '2025-12-29 15:02:34');
INSERT INTO `employee_profit_contributions` VALUES ('gQaldtepVUGook5i', 'h0nwwaAsi4gJjFen', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('GSrxM7w3hZ3d7zkE', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('gtHh581ClQLtxEqw', 'LIbzH09aNTu9LPiZ', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('gvIAfrRVjeto8O7k', 'IdfqHfaqF25MD78C', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('GyEOk0yroheRfcLe', 'xxrgyt4dDrY0wYZs', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('hBXf1M9E1iUld0P6', '4Yc3pjFRO7SACMSC', '2025Q3', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `employee_profit_contributions` VALUES ('hCl392a4EGCxWj2l', 'rRaokmUmAVXtkaRu', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('hcxdgxhhrep25vzv', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('hQcK8TM4d2tHTMTB', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('ht8zX21a0tfH02OB', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 15:03:29', '2025-12-29 15:03:29');
INSERT INTO `employee_profit_contributions` VALUES ('I8CHKJN5DrAfEIS8', 'FZOpTvVEQ0NWPs1a', '2026Q2', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('Ia8mwZaKGIFHOKZ3', 'IdfqHfaqF25MD78C', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('IegZ7uxIu0XWPrNW', '5NQDb4fAifAEuuK5', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('IFX6ZxXp7bM2xTib', 'NBwpI13bBbTJGjwY', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('igzcTosCPzNSrZqX', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('iIG5OHyXMbidhQ3u', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('iNSBkFo4dnF2zrs8', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('IOgl4XZyXTD9L6PV', 'xxrgyt4dDrY0wYZs', '2026Q1', NULL, 'direct', 0.00, 0.7360, 160.00, 0.1000, 0.86, 1.20, 0.80, 0.12, 0.86, 0.74, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('J6Bym96JTQ3nQBva', 'Fre5c30QkfgDhYPg', '2025', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('jaUOxZhwoUZWKZS4', 'rRaokmUmAVXtkaRu', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('JHR2hqQ5kug4oXFl', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:28:13', '2026-01-15 10:28:13');
INSERT INTO `employee_profit_contributions` VALUES ('JMdLWVvjOqlOa9O7', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('kGTusfWlwVHV7F3l', 'BqPRlZFYwwG376AZ', '2026Q2', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('kH5RYzwZ141UoZut', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 11:22:52', '2026-01-15 11:22:52');
INSERT INTO `employee_profit_contributions` VALUES ('kRwF6VIZQUwFcsrq', 'Zf2TO8nUll7qk2b8', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('KxrdI8UFti3fKC8n', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('kzvCHAcKv0WGmj3v', 'OuM2daatV8gWJpiI', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:21', '2026-02-02 10:31:21');
INSERT INTO `employee_profit_contributions` VALUES ('l2PT0Dub1DtSELY9', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:31:13', '2026-01-15 10:31:13');
INSERT INTO `employee_profit_contributions` VALUES ('la92yS07OICfyKNr', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:38', '2025-12-29 11:23:38');
INSERT INTO `employee_profit_contributions` VALUES ('lADBfigJP6S0mm4A', 'D3fZif5G61ZHTexI', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('lBzAIdg9RIBcjQs3', 'JGDxmyz6YvhgVXzm', '2025Q3', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('lCjlsorWpLsTzcN5', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('lH73KfR1zRRaMSLP', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-12 11:25:09', '2026-01-12 11:25:09');
INSERT INTO `employee_profit_contributions` VALUES ('lSdKOPx5GF11tY4t', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('LVgLSFkjOpOEHhlp', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('lXvK1YmsEIo1YRus', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 11:29:28', '2026-01-15 11:29:28');
INSERT INTO `employee_profit_contributions` VALUES ('Mc0tq9ifivQjELHy', '5NQDb4fAifAEuuK5', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `employee_profit_contributions` VALUES ('MkDT9hAfqXceddfW', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('MlPDtZ208yVSJViv', 'j46LEwS76rO6rSi7', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('Mpzm8bFFszfSKBXy', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('mWMr3ztjVmIybwA3', 'emp_hr001', '2025Q4', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-08 19:39:56', '2026-01-08 19:39:56');
INSERT INTO `employee_profit_contributions` VALUES ('NjQxGJweZSQw8Xuq', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-08 19:39:56', '2026-01-08 19:39:56');
INSERT INTO `employee_profit_contributions` VALUES ('oa004oA9VSjVFY2R', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('oCCMnPr6H7rXrNQA', 'xxrgyt4dDrY0wYZs', '2026Q2', NULL, 'direct', 0.00, 0.5850, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.59, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:21', '2026-02-02 10:31:21');
INSERT INTO `employee_profit_contributions` VALUES ('ODpknANgVRNDE4rW', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('ofg0fkoN5mYQMd0P', '5NQDb4fAifAEuuK5', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('OIniDXGCcWe7R4zV', 'D3fZif5G61ZHTexI', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `employee_profit_contributions` VALUES ('OZioBkIiM1XD0T3n', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('prVcXgKN1fLlUKsL', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('pSYzmSYFXJ35vXZ6', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('PVJ1tonrk6qtKOd6', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('PX5oyxOeKBWybdqf', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('PxpwW9zoPR3GhV9N', 'OuM2daatV8gWJpiI', '2025Q1', NULL, 'direct', 240733.79, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('Q2qEanFWMV3HABXP', '4Yc3pjFRO7SACMSC', '2026Q1', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('q4bOafqzB70CDEfc', '5NQDb4fAifAEuuK5', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('Q8gwAaFFNs0JdyJ4', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:57:31', '2025-12-26 17:57:31');
INSERT INTO `employee_profit_contributions` VALUES ('Q9KAwYDAiiDnVezz', '0s4u0CI64MgvYpM4', '2026Q1', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('QcxFwwprbh6Ur5mP', 'Zf2TO8nUll7qk2b8', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('qhYlqc4WasxAbNHY', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('r7zHhdu136oQAxCh', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:51:08', '2025-12-29 14:51:08');
INSERT INTO `employee_profit_contributions` VALUES ('RIMkSA6HEeIkl0lD', 'j46LEwS76rO6rSi7', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('RJg8iPWfcDJp6IEP', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:30:57', '2026-01-15 10:30:57');
INSERT INTO `employee_profit_contributions` VALUES ('rYJRzYzjgvp0CdME', 'Zf2TO8nUll7qk2b8', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('sGnLwWknKxnKLzil', 'OuM2daatV8gWJpiI', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('sgX976Q4OnVAcINO', 'cDsFeXUrthIIC3ER', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('syk4r7sQcsgRBuEo', '5NQDb4fAifAEuuK5', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('t07NoXo5LueAktAz', 'rRaokmUmAVXtkaRu', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('t1nt5CcgRsFPVLf1', 'JGDxmyz6YvhgVXzm', '2026Q1', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('T1UYrLkKjgAc11WG', 'FZOpTvVEQ0NWPs1a', '2026Q1', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('tNJeRA3b3jcUUQzu', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:38:03', '2026-01-15 10:38:03');
INSERT INTO `employee_profit_contributions` VALUES ('tnYgtbYfnxaA4Dcc', '0s4u0CI64MgvYpM4', '2026Q2', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('TWXJezFD6ywypObJ', 'xxrgyt4dDrY0wYZs', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('u0NIF8GPenIbtRNZ', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 11:15:38', '2026-01-15 11:15:38');
INSERT INTO `employee_profit_contributions` VALUES ('UdSdYa84C59Acn0o', 'BqPRlZFYwwG376AZ', '2025Q3', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `employee_profit_contributions` VALUES ('ufiXnBBuoPFBHG8c', '4Yc3pjFRO7SACMSC', '2025Q1', NULL, 'direct', 80409.80, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 103354.496}', 'pending', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `employee_profit_contributions` VALUES ('ufJt4lCeEGl3WA5c', 'D3fZif5G61ZHTexI', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('ugiu5woREyvGwE0O', 'j46LEwS76rO6rSi7', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:33', '2026-01-15 11:14:33');
INSERT INTO `employee_profit_contributions` VALUES ('UqGuxNTv4IDoZUen', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('UzJ7m1TDLfSM9J38', 'IULJmYjMyXorOru3', '2025', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('V2pGyQCpHqYUTTqr', 'JGDxmyz6YvhgVXzm', '2025Q4', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('V5JwGnwLq7umXLOe', 'OuM2daatV8gWJpiI', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('vlscWHxexR1eBKHM', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:47:06', '2025-12-29 14:47:06');
INSERT INTO `employee_profit_contributions` VALUES ('vtvswIlyKww7GUUZ', 'FZOpTvVEQ0NWPs1a', '2026Q2', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('W9BEcJ9ey9yGQ7ef', 'j46LEwS76rO6rSi7', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('WCp4WeAfY4Zx6o4N', 'j46LEwS76rO6rSi7', '2026Q2', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');
INSERT INTO `employee_profit_contributions` VALUES ('wftgcKlfsGYbm55P', 'qqtcss15Te6aN9HH', '2025', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('wiYFgj7TD6ABshKA', '5NQDb4fAifAEuuK5', '2025Q3', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `employee_profit_contributions` VALUES ('wyXroPzV81U3maC3', 'j46LEwS76rO6rSi7', '2026Q1', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `employee_profit_contributions` VALUES ('Xd9OhGmMo25Yg85J', 'EbPi9xDqgDWYb0CL', '2025', NULL, 'direct', 0.00, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-03 16:08:20', '2026-02-03 16:08:20');
INSERT INTO `employee_profit_contributions` VALUES ('xF9519LPj4I6VxCV', 'rRaokmUmAVXtkaRu', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 17:53:40', '2025-12-26 17:53:40');
INSERT INTO `employee_profit_contributions` VALUES ('XghZYNPac7lOcjpq', 'BqPRlZFYwwG376AZ', '2025Q4', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-29 11:23:39', '2025-12-29 11:23:39');
INSERT INTO `employee_profit_contributions` VALUES ('XlzDRbdyznXvs3xD', 'xxrgyt4dDrY0wYZs', '2025Q1', NULL, 'direct', 273426.03, 0.7360, 160.00, 0.1000, 0.86, 1.20, 0.80, 0.12, 0.86, 0.74, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 371502.76}', 'pending', 1, 1, 1, '2026-01-12 12:06:31', '2026-01-12 12:06:31');
INSERT INTO `employee_profit_contributions` VALUES ('xmWcBC2itRAkfxuW', 'OuM2daatV8gWJpiI', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('Y1zwxU3Ro3kmxl9m', '4Yc3pjFRO7SACMSC', '2025Q4', NULL, 'direct', 31120.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2025-12-29 14:57:40', '2025-12-29 14:57:40');
INSERT INTO `employee_profit_contributions` VALUES ('YEJ6so9vfvodU1DD', 'D3fZif5G61ZHTexI', '2025Q4', NULL, 'direct', 25920.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 40000}', 'pending', 1, 1, 1, '2026-01-15 10:17:47', '2026-01-15 10:17:47');
INSERT INTO `employee_profit_contributions` VALUES ('YfL2ylbydjdI8RGE', 'BqPRlZFYwwG376AZ', '2026Q2', NULL, 'direct', 0.00, 0.7780, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.78, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:38', '2026-02-02 10:31:38');
INSERT INTO `employee_profit_contributions` VALUES ('ZaTcqwZLo1iPlEBe', '0s4u0CI64MgvYpM4', '2025Q1', NULL, 'direct', 68420.68, 0.6620, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.66, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 103354.496}', 'pending', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `employee_profit_contributions` VALUES ('ZmQwvhDkSJC8u7ux', 'IdfqHfaqF25MD78C', '2025Q4', NULL, 'direct', 0.00, 0.6480, 160.00, 0.1000, 0.86, 1.20, 0.60, 0.12, 0.86, 0.65, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-26 14:20:30');
INSERT INTO `employee_profit_contributions` VALUES ('ZTZAgk66w89Gu506', 'JGDxmyz6YvhgVXzm', '2026Q2', NULL, 'direct', 0.00, 0.6040, 160.00, 0.1000, 0.86, 1.20, 0.50, 0.12, 0.86, 0.60, 'auto_formula', '{\"allocationRule\": {\"qualityBonus\": 0.15, \"qualityWeight\": 0.2, \"workloadWeight\": 0.3, \"excellenceBonus\": 0.2, \"performanceWeight\": 0.2, \"maxContributionCap\": 2, \"positionValueWeight\": 0.1, \"directContributionWeight\": 0.4}, \"availableProfit\": 0}', 'pending', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:20');

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
-- Records of employees
-- ----------------------------
INSERT INTO `employees` VALUES ('0s4u0CI64MgvYpM4', 'FZ-BJ-DLL', '笪莱利', 'DsYMP3aBv5fLHeuW', 'MONoncdbS6WKO15X', 'SA0HPyflKXdlOyXv', 'city_beijing', 'fulltime', 1.00, 1000000.00, '2025-12-27', 1, 'gTgqsvcJXtqwFuiI', '2025-12-29 15:17:58', '2026-02-02 12:45:21', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('4Yc3pjFRO7SACMSC', 'FZ-BJ-LL', '刘静', 'DsYMP3aBv5fLHeuW', 'AzygHw0Cpbx1YyUe', 'SA0HPyflKXdlOyXv', 'city_beijing', 'fulltime', 1.00, 200000.00, '2023-04-30', 1, '51d8bcc23b510771d9a4bd3c9995b62e', '2025-12-25 10:51:50', '2026-02-02 17:01:39', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('5NQDb4fAifAEuuK5', 'FZ-CD-KJL', '康纪兰', '4BAUkcwX5jhIKb1U', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_chengdu', 'fulltime', 1.00, 100000.00, '2023-04-29', 1, 'nF95BFf8NtITeMTG', '2025-12-25 10:46:52', '2026-02-02 12:44:57', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('6aha8mGPcBt2T2L7', 'FZ-BJ-ZXZ', '周贤泽', 'NUd4vzaNoxq57jrS', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:54:27', '2026-02-02 12:54:27', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('9xgYQ4MYWRZ8Fh4u', 'FZ-BJ-ZPH', '周培豪', 'NUd4vzaNoxq57jrS', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:53:52', '2026-02-02 12:53:52', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('ALRVuAaWddFzdu7h', 'FZ-BJ-GHY', '郭洪印', 'd9zSGsgB7KP3kXKF', 'MONoncdbS6WKO15X', 'GuDI5gOHb8rjdQ8U', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:55:47', '2026-02-02 12:55:47', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('BqPRlZFYwwG376AZ', 'FZ-CD-LCW', '罗朝文', 'DsYMP3aBv5fLHeuW', 'AzygHw0Cpbx1YyUe', 'SA0HPyflKXdlOyXv', 'city_chengdu', 'fulltime', 1.00, 200000.00, '2024-03-31', 1, 'lpiNsp56xoXddcMO', '2025-12-25 10:37:36', '2026-02-02 12:45:35', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('BTBIiv5yHnfkyeKb', 'FZ-BJ-XHL', '相昊霖', 'LrjB7X5dm5NwVONx', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:50:46', '2026-02-02 12:50:46', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('cDsFeXUrthIIC3ER', 'FZ-BJ-LYF', '刘帆远', 'NUd4vzaNoxq57jrS', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:53:18', '2026-02-02 12:53:18', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('D3fZif5G61ZHTexI', 'FZ-BJ-YSH', '杨盛海', 'frLU1y7leCn9riSx', 'pos_dev', '9KwOiW6b4kJiBpbi', 'city_beijing', 'fulltime', 1.00, 100000.00, '2025-11-03', 1, NULL, '2026-01-07 17:50:24', '2026-02-02 12:45:16', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('EbPi9xDqgDWYb0CL', 'FZ-BJ-LMW', '兰明伟', 'ZE5q0Z1U3fCr7JsW', 'MONoncdbS6WKO15X', 'Ly6kLcrzWVgszZXW', 'city_beijing', 'fulltime', 1.00, 100000.00, '2020-02-08', 1, '69f40ae09c93fe3b266e64e95b431933', '2026-02-02 11:55:15', '2026-02-02 14:56:21', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('emp_admin', 'EMP_ADMIN', '系统管理员', 'dept_admin', 'pos_admin', NULL, NULL, 'fulltime', 1.00, 500000.00, '2024-01-01', 1, 'admin_user', '2025-12-25 10:20:36', '2025-12-25 10:20:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('Fre5c30QkfgDhYPg', 'FZ-BJ-LFX', '李凤肖', 'IZgCF3yn0hjFwDdy', 'wBDXLF5ogfaE6L4l', NULL, 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-01', 1, NULL, '2026-02-02 12:58:24', '2026-02-02 16:07:34', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('h0nwwaAsi4gJjFen', 'FZ-BG-HZZ', '贺梓涵', 'ovlYHVmYZe9xPTvF', 'MONoncdbS6WKO15X', NULL, 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-01', 1, NULL, '2026-02-02 12:47:00', '2026-02-02 16:07:14', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('IdfqHfaqF25MD78C', 'FZ-CD-DNK', '董乃坤', 'dept_tech', 'pos_dev', '9KwOiW6b4kJiBpbi', 'city_chengdu', 'fulltime', 1.00, 100000.00, '2023-04-30', 1, '1PJ4LLB7uQpD9g0K', '2025-12-25 10:36:10', '2026-02-02 12:44:19', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('IULJmYjMyXorOru3', 'FZ-BJ-CM', '陈萌', 'LrjB7X5dm5NwVONx', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:49:39', '2026-02-02 12:49:39', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('j46LEwS76rO6rSi7', 'FZ-CD-LJX', '刘嘉兴', '4BAUkcwX5jhIKb1U', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_chengdu', 'fulltime', 1.00, 100000.00, '2023-06-06', 1, '82L6gsMTlIu3gnzh', '2025-12-25 10:44:23', '2026-02-02 12:44:25', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('Kr7ubEuz626z45Tr', 'FZ-BJ-LHJ', '李怀健', 'NUd4vzaNoxq57jrS', 'MONoncdbS6WKO15X', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, 'c1eed6e3c69694efb6633a1a17f7a1eb', '2026-02-02 12:52:33', '2026-02-02 14:55:26', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('LIbzH09aNTu9LPiZ', 'FZ-BJ-XWX', '玄文雪', 'LrjB7X5dm5NwVONx', 'MONoncdbS6WKO15X', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:48:56', '2026-02-02 12:48:56', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('lSBwKv6QG9O3EFsr', 'FZ-BJ-WLY', '王莉莹', 'LrjB7X5dm5NwVONx', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:50:15', '2026-02-02 12:50:15', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('NBwpI13bBbTJGjwY', 'FZ-BJ-LJJ', '卢建杰', 'g5DpgVqv95UhsYeE', 'MONoncdbS6WKO15X', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:48:03', '2026-02-02 12:48:03', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('OuM2daatV8gWJpiI', 'FZ-CD-CXL', '池小龙', 'dept_tech', 'pos_dev', '9KwOiW6b4kJiBpbi', NULL, 'fulltime', 1.00, 100000.00, '2023-05-01', 1, NULL, '2025-12-25 10:47:35', '2026-02-02 12:44:30', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('qqtcss15Te6aN9HH', 'FZ-BJ-LST', '刘淑婷', 'IZgCF3yn0hjFwDdy', 'wBDXLF5ogfaE6L4l', NULL, 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-01', 1, NULL, '2026-02-02 14:54:22', '2026-02-02 16:07:55', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('rRaokmUmAVXtkaRu', 'FZ-CD-LL', '李磊', '4BAUkcwX5jhIKb1U', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_chengdu', 'fulltime', 1.00, 100000.00, '2023-04-29', 1, '51fabbac53d3367aa6e4ff97805c4d84', '2025-12-25 10:50:38', '2026-02-02 12:44:35', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('uW6c7E69lecxMM0c', 'FZ-BJ-ZL', '邹莉', 'IZgCF3yn0hjFwDdy', 'MONoncdbS6WKO15X', 'SA0HPyflKXdlOyXv', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 16:05:08', '2026-02-02 16:05:08', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('WBtjGNZ2h7hDwbRq', 'FZ-BJ-MYH', '苗育红', 'ZE5q0Z1U3fCr7JsW', 'WMrOtmuSYm6TtLCK', 'Ly6kLcrzWVgszZXW', 'city_beijing', 'fulltime', 1.00, 100000.00, '2026-02-02', 1, NULL, '2026-02-02 12:57:02', '2026-02-02 12:57:02', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `employees` VALUES ('xxrgyt4dDrY0wYZs', 'FZ-CD-RCC', '任聪聪', '4BAUkcwX5jhIKb1U', 'pos_dev', 'XJD1HavHAMpjxdl0', 'city_beijing', 'fulltime', 1.00, 200000.00, '2023-04-13', 1, NULL, '2025-12-25 10:48:46', '2026-02-02 12:46:09', '', '', '', '', '', '大明湖畔', NULL, NULL, 'dsadasdasdasdasd', '2026-01-16', NULL, NULL);
INSERT INTO `employees` VALUES ('Zf2TO8nUll7qk2b8', 'FZ-CD-WSQ', '王守琴', 'dept_tech', 'pos_dev', '9KwOiW6b4kJiBpbi', NULL, 'fulltime', 1.00, 100000.00, '2023-05-01', 1, NULL, '2025-12-25 10:50:08', '2026-02-02 12:44:43', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL);

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
  `status_code` tinyint NOT NULL DEFAULT 0 COMMENT '???: 0-???, 1-???, 2-???, -1-???',
  `potential_impact` int NULL DEFAULT NULL COMMENT '预期影响百分比',
  `time_frame` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '时间框架',
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'manual' COMMENT '来源: manual(手动录入), auto(自动生成)',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_by_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人姓名',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `implementation_date` datetime NULL DEFAULT NULL COMMENT '??????',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '反馈内容',
  `implementation_feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  `reviewed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '???ID',
  `reviewed_by_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '?????',
  `reviewed_at` datetime NULL DEFAULT NULL COMMENT '????',
  `review_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_employee_id`(`employee_id` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_status_code`(`status_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '改进建议表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of improvement_suggestions
-- ----------------------------
INSERT INTO `improvement_suggestions` VALUES (2, 'IdfqHfaqF25MD78C', '董乃坤', '测试', '测试测试测试', 'performance', 'medium', 2, 20, '123123', 'manual', 'admin_user', 'admin', '2026-01-19 13:50:46', '2026-01-19 14:01:44', '2026-01-19 14:01:44', '2026-01-19 13:56:58', NULL, 'asdasdasdasdasdas', 'emp_admin', 'admin', '2026-01-19 14:01:44', '');

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
-- Records of line_bonus_allocations
-- ----------------------------

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
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES ('menu_1', NULL, '管理驾驶舱', '/dashboard', 'dashboard/DashboardOverview', 'menu', 'dashboard', 1, 1, 1, NULL, 0, 1, NULL, '管理驾驶舱', '查看系统整体数据概览', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_100', NULL, '基础数据', NULL, NULL, 'directory', 'setting', 2, 1, 1, NULL, 0, 1, NULL, '基础数据管理', '组织架构和基础数据管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_101', 'menu_100', '员工管理', '/employee', 'employee/EmployeeManagement', 'menu', 'user', 1, 1, 1, 'employee:view', 0, 1, NULL, '员工管理', '员工信息的增删改查', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_102', 'menu_100', '部门管理', '/department', 'department/DepartmentManagement', 'menu', 'office-building', 2, 1, 1, 'department:view,admin,hr,*', 0, 1, NULL, '部门管理', '部门信息管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_103', 'menu_100', '岗位管理', '/position', 'position/PositionManagement', 'menu', 'briefcase', 3, 1, 1, 'position:view', 0, 1, NULL, '岗位管理', '岗位信息管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_104', 'menu_100', '岗位大全', '/position/encyclopedia', 'position/PositionEncyclopedia', 'menu', 'collection', 4, 1, 1, 'position:view', 0, 1, NULL, '岗位大全', '查看所有岗位详细信息', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_105', 'menu_100', '业务线管理', '/business-line', 'businessLine/BusinessLineManagement', 'menu', 'connection', 5, 1, 1, 'business_line:view', 0, 1, NULL, '业务线管理', '业务线配置管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_1768181720541', 'menu_200', '协作详情', '/project/collaboration/:id', 'project/ProjectCollaborationDetail', 'menu', NULL, 0, 0, 1, '*', 0, 1, NULL, NULL, NULL, 1, '2026-01-12 09:35:20', '2026-01-12 10:23:26', 'admin_user', NULL);
INSERT INTO `menus` VALUES ('menu_1768275650742', 'menu_500', '手动录入项目绩效', '/project/ProjectPerformanceManual', 'project/ProjectPerformanceManual', 'menu', NULL, 0, 1, 1, NULL, 0, 1, NULL, NULL, NULL, 0, '2026-01-13 11:40:50', '2026-01-13 16:16:18', 'admin_user', NULL);
INSERT INTO `menus` VALUES ('menu_1768473380041', 'menu_700', '项目角色配置', '/system/projectRoles', 'project/ProjectRoleManagement', 'menu', NULL, 7, 1, 1, NULL, 0, 1, NULL, NULL, NULL, 1, '2026-01-15 18:36:20', '2026-01-15 18:38:49', 'admin_user', NULL);
INSERT INTO `menus` VALUES ('menu_200', NULL, '项目管理', NULL, NULL, 'directory', 'suitcase', 3, 1, 1, NULL, 0, 1, NULL, '项目管理', '项目全生命周期管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_201', 'menu_200', '我的项目', '/my-projects', 'project/MyProjects', 'menu', 'folder', 1, 1, 1, NULL, 0, 1, NULL, '我的项目', '查看我参与的项目', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_202', 'menu_200', '项目协作', '/project/collaboration', 'project/ProjectCollaboration', 'menu', 'coordinate', 2, 1, 1, 'project:view,project:create,project:approve,project_manager,*', 0, 1, NULL, '项目协作', '项目协作和成员管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_204', 'menu_200', '项目管理', '/project/management', 'project/ProjectManagement', 'menu', 'management', 4, 1, 1, 'project:view', 0, 1, NULL, '项目管理', '项目信息管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_205', 'menu_200', '项目成员审批', '/project-member-approval', 'project/ProjectMemberApproval', 'menu', 'user-filled', 5, 1, 1, 'project:approve,*', 0, 1, NULL, '项目成员审批', '审批项目成员加入', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_206', 'menu_200', '项目角色权重', '/project-role-weights', 'project/ProjectRoleWeights', 'menu', 'scale', 6, 1, 1, 'project:weights:view,project:weights:view_own,project:weights:view_all,*', 0, 1, NULL, '项目角色权重', '项目角色权重配置', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_207', 'menu_200', '里程碑模板', '/milestone-templates', 'project/MilestoneTemplates', 'menu', 'trophy', 7, 1, 1, 'project:view,project:create,*', 0, 1, NULL, '里程碑模板管理', '项目里程碑模板配置', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_300', NULL, '财务管理', NULL, NULL, 'directory', 'money', 4, 1, 1, NULL, 0, 1, NULL, '财务管理', '财务数据和成本管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_301', 'menu_300', '利润数据录入', '/profit/data', 'profit/ProfitDataManagement', 'menu', 'coin', 1, 1, 1, 'profit:view,finance:view,finance:manage,admin,*', 0, 1, NULL, '财务录入（利润数据）', '录入公司利润数据', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_302', 'menu_300', '项目成本录入', '/project/cost-management', 'project/ProjectCostManagement', 'menu', 'wallet', 2, 1, 1, 'project:cost:view:all,project:cost:manage,finance:view,finance:manage,admin,*', 0, 1, NULL, '项目成本录入', '录入项目成本数据', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_303', 'menu_400', '项目奖金计算', '/project-bonus-management', 'project/ProjectBonusManagement', 'menu', 'present', 3, 1, 1, 'finance:view,finance:manage,bonus:view,bonus:manage,hr,admin,*', 0, 1, NULL, '项目奖金计算', '项目奖金分配管理', 1, '2025-12-31 09:19:04', '2026-01-15 16:29:55', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_400', NULL, '奖金计算', NULL, NULL, 'directory', 'calculator', 5, 1, 1, 'bonus:calculate,hr,admin,*', 0, 1, NULL, '奖金计算', '奖金计算和分配', 1, '2025-12-31 09:19:04', '2026-01-15 16:29:41', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_401', 'menu_400', '三维奖金计算', '/calculation', 'calculation/BonusCalculation', 'menu', 'calculator', 1, 1, 1, 'bonus:calculate,hr,admin,*', 0, 1, NULL, '三维奖金计算', '执行奖金计算', 1, '2025-12-31 09:19:04', '2026-01-15 16:29:47', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_402', 'menu_400', '模拟分析', '/simulation', 'simulation/SimulationAnalysis', 'menu', 'data-analysis', 2, 1, 1, 'simulation:view', 0, 1, NULL, '模拟分析', '奖金分配模拟分析', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_500', NULL, '绩效管理', NULL, NULL, 'directory', 'trend-charts', 6, 1, 1, NULL, 0, 1, NULL, '绩效管理', '绩效记录管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_501', 'menu_500', '绩效记录', '/performance/records', 'performance/PerformanceRecordManagement', 'menu', 'document', 1, 1, 1, 'performance:view,hr,admin', 0, 1, NULL, '绩效记录管理', '员工绩效记录管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_600', NULL, '报表查询', NULL, NULL, 'directory', 'data-line', 7, 1, 1, NULL, 0, 1, NULL, '报表查询', '各类报表和数据查询', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_601', 'menu_600', '报表管理', '/reports/management', 'reports/ReportManagement', 'menu', 'document-copy', 1, 1, 1, 'report:view', 0, 1, NULL, '报表管理', '查看各类统计报表', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_602', 'menu_600', '个人奖金查询', '/reports/personal', 'reports/PersonalBonus', 'menu', 'search', 2, 1, 1, 'bonus:view,bonus:personal', 0, 1, NULL, '个人奖金查询', '查询个人奖金信息', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_603', 'menu_600', '我的奖金', '/personal/dashboard', 'personal/PersonalBonusDashboard', 'menu', 'money', 3, 1, 1, NULL, 0, 1, NULL, '我的奖金', '查看个人奖金详情、历史趋势和改进建议', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_700', NULL, '系统管理', NULL, NULL, 'directory', 'tools', 8, 1, 1, NULL, 0, 1, NULL, '系统管理', '系统配置和权限管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_701', 'menu_700', '用户管理', '/system/users', 'system/UserManagement', 'menu', 'user', 1, 1, 1, 'user:view', 0, 1, NULL, '用户管理', '系统用户管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_702', 'menu_700', '角色管理', '/system/roles', 'system/RoleManagement', 'menu', 'avatar', 2, 1, 1, 'role:view', 0, 1, NULL, '角色管理', '角色和权限管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_703', 'menu_700', '菜单管理', '/system/menus', 'system/MenuManagement', 'menu', 'menu', 3, 1, 1, 'menu:view,admin', 0, 1, NULL, '菜单管理', '菜单权限配置', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_704', 'menu_700', '系统配置', '/system/config', 'system/SystemConfig', 'menu', 'setting', 4, 1, 1, 'system:config', 0, 1, NULL, '系统配置', '系统参数配置', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_705', 'menu_700', '三维权重配置', '/system/weight-config', 'system/WeightConfigManagement', 'menu', 'operation', 5, 1, 1, 'system:config,hr,admin', 0, 1, NULL, '三维权重配置', '奖金三维权重配置', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_706', 'menu_700', '改进建议管理', '/system/improvement-suggestions', 'system/ImprovementSuggestionsManagement', 'menu', 'edit', 6, 1, 1, 'improvement:view,hr,admin,*', 0, 1, NULL, '改进建议管理', '员工改进建议管理', 1, '2025-12-31 09:19:04', '2025-12-31 09:19:04', NULL, NULL);
INSERT INTO `menus` VALUES ('menu_707', 'menu_700', '城市管理', '/system/cities', 'system/CityManagement', 'menu', 'OfficeBuilding', 7, 1, 1, 'city:view,city:create,city:update,city:delete', 0, 1, NULL, '城市管理', '城市信息管理', 1, '2026-01-15 14:38:18', '2026-01-15 14:51:43', NULL, '城市信息管理模块');

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
-- Records of milestone_dependency_cache
-- ----------------------------

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
-- Records of milestone_impact_analysis
-- ----------------------------

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
-- Records of milestone_reminder_configs
-- ----------------------------

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
-- Records of milestone_reminder_logs
-- ----------------------------

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
-- Records of milestone_templates
-- ----------------------------
INSERT INTO `milestone_templates` VALUES ('7afa1a69-1b63-4b42-9f59-b140f1a986e6', '自定义', '阶段性的突破', 'custom', 0, '{\"milestones\": [{\"name\": \"需求分析阶段\", \"weight\": 1, \"offsetDays\": 4, \"description\": \"需求分析阶段\", \"deliverables\": \"需求分析阶段\", \"dependencies\": [], \"durationDays\": 7}, {\"name\": \"产品设计阶段\", \"weight\": 1, \"offsetDays\": 0, \"description\": \"产品设计阶段\", \"deliverables\": \"产品设计阶段\", \"dependencies\": [], \"durationDays\": 7}, {\"name\": \"项目实施阶段\", \"weight\": 1, \"offsetDays\": 4, \"description\": \"项目实施阶段\", \"deliverables\": \"项目实施阶段\", \"dependencies\": [], \"durationDays\": 9}]}', 1, 'DZaqxd5FxFvLIiFO', '2025-11-28 11:11:01', '2026-02-02 17:21:30', 1);
INSERT INTO `milestone_templates` VALUES ('tpl_agile_sprint_001', '敏捷开发Sprint模板', '适用于敏捷开发的2周Sprint周期', 'software', 1, '{\"milestones\": [{\"name\": \"Sprint规划\", \"weight\": 0.5, \"offsetDays\": 0, \"description\": \"制定Sprint目标和任务清单\", \"deliverables\": \"Sprint Backlog\", \"dependencies\": [], \"durationDays\": 1}, {\"name\": \"Sprint开发\", \"weight\": 2.0, \"offsetDays\": 1, \"description\": \"执行开发任务\", \"deliverables\": \"功能增量\", \"dependencies\": [0], \"durationDays\": 10}, {\"name\": \"Sprint评审\", \"weight\": 0.5, \"offsetDays\": 11, \"description\": \"演示和评审开发成果\", \"deliverables\": \"演示文档\", \"dependencies\": [1], \"durationDays\": 1}, {\"name\": \"Sprint回顾\", \"weight\": 0.5, \"offsetDays\": 12, \"description\": \"团队复盘和改进\", \"deliverables\": \"改进行动项\", \"dependencies\": [2], \"durationDays\": 1}]}', 0, 'system', '2025-11-27 15:29:14', '2025-11-27 15:29:14', 1);
INSERT INTO `milestone_templates` VALUES ('tpl_marketing_001', '市场活动项目标准模板', '适用于市场推广活动，包含策划、准备、执行、评估等阶段', 'marketing', 1, '{\"milestones\": [{\"name\": \"活动策划\", \"weight\": 1.0, \"offsetDays\": 0, \"description\": \"制定活动方案和预算\", \"deliverables\": \"活动方案、预算表\", \"dependencies\": [], \"durationDays\": 7}, {\"name\": \"物料准备\", \"weight\": 1.0, \"offsetDays\": 7, \"description\": \"设计制作活动物料\", \"deliverables\": \"活动物料、宣传资料\", \"dependencies\": [0], \"durationDays\": 10}, {\"name\": \"宣传推广\", \"weight\": 1.2, \"offsetDays\": 17, \"description\": \"通过各渠道进行宣传\", \"deliverables\": \"推广渠道覆盖报告\", \"dependencies\": [1], \"durationDays\": 14}, {\"name\": \"活动执行\", \"weight\": 1.5, \"offsetDays\": 31, \"description\": \"现场活动组织和执行\", \"deliverables\": \"活动执行记录、照片视频\", \"dependencies\": [2], \"durationDays\": 3}, {\"name\": \"效果评估\", \"weight\": 0.8, \"offsetDays\": 34, \"description\": \"统计活动效果和ROI\", \"deliverables\": \"活动效果报告\", \"dependencies\": [3], \"durationDays\": 7}]}', 0, 'system', '2025-11-27 15:29:14', '2025-11-27 15:29:14', 1);
INSERT INTO `milestone_templates` VALUES ('tpl_product_dev_001', '产品研发项目标准模板', '适用于新产品研发，包含调研、设计、开发、验证、发布等阶段', 'product', 1, '{\"milestones\": [{\"name\": \"市场调研\", \"weight\": 1.0, \"offsetDays\": 0, \"description\": \"分析市场需求和竞品\", \"deliverables\": \"市场调研报告\", \"dependencies\": [], \"durationDays\": 10}, {\"name\": \"产品设计\", \"weight\": 1.2, \"offsetDays\": 10, \"description\": \"完成产品设计和规格定义\", \"deliverables\": \"产品设计文档、原型\", \"dependencies\": [0], \"durationDays\": 14}, {\"name\": \"原型开发\", \"weight\": 1.5, \"offsetDays\": 24, \"description\": \"开发产品原型或MVP\", \"deliverables\": \"MVP产品\", \"dependencies\": [1], \"durationDays\": 21}, {\"name\": \"试产验证\", \"weight\": 1.0, \"offsetDays\": 45, \"description\": \"小批量试产和用户测试\", \"deliverables\": \"用户反馈报告、改进方案\", \"dependencies\": [2], \"durationDays\": 14}, {\"name\": \"量产发布\", \"weight\": 1.0, \"offsetDays\": 59, \"description\": \"正式发布和批量生产\", \"deliverables\": \"产品发布、市场推广\", \"dependencies\": [3], \"durationDays\": 7}]}', 0, 'system', '2025-11-27 15:29:14', '2025-11-27 15:29:14', 1);
INSERT INTO `milestone_templates` VALUES ('tpl_software_dev_001', '软件开发项目标准模板', '适用于常规软件开发项目，包含需求分析、设计、开发、测试、上线等完整流程', 'software', 1, '{\"milestones\": [{\"name\": \"需求分析\", \"weight\": 1.0, \"offsetDays\": 0, \"description\": \"收集和分析业务需求，编写需求文档\", \"deliverables\": \"需求规格说明书、原型设计\", \"dependencies\": [], \"durationDays\": 14}, {\"name\": \"系统设计\", \"weight\": 1.2, \"offsetDays\": 14, \"description\": \"完成系统架构设计和详细设计\", \"deliverables\": \"系统设计文档、数据库设计\", \"dependencies\": [0], \"durationDays\": 10}, {\"name\": \"开发实现\", \"weight\": 1.5, \"offsetDays\": 24, \"description\": \"编码实现系统功能\", \"deliverables\": \"可运行的系统代码\", \"dependencies\": [1], \"durationDays\": 30}, {\"name\": \"测试验收\", \"weight\": 1.0, \"offsetDays\": 54, \"description\": \"执行单元测试、集成测试、系统测试\", \"deliverables\": \"测试报告、Bug修复记录\", \"dependencies\": [2], \"durationDays\": 14}, {\"name\": \"上线部署\", \"weight\": 0.8, \"offsetDays\": 68, \"description\": \"生产环境部署和上线\", \"deliverables\": \"上线报告、运维文档\", \"dependencies\": [3], \"durationDays\": 7}]}', 3, 'system', '2025-11-27 15:29:14', '2026-01-27 11:53:18', 1);

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
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES ('8KRR7bZBo0BLPVSS', 'cf8f2265-89fc-408f-87d7-d5c407d8e650', 'N9PYnuJC7tcLFGnz', 'team_approved', '团队申请申请已批准', 'sadsadsadsad', 'N9PYnuJC7tcLFGnz', '{\"action\": \"approve\", \"applicationId\": \"13\"}', 0, NULL, '2025-11-18 16:39:57', '2025-11-18 16:39:57');
INSERT INTO `notifications` VALUES ('8vwodZR6jnUbUgiI', 'Kr7ubEuz626z45Tr', 'T4lXc5Dtezprp818', 'team_approved', '团队申请申请已批准', '132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队', 'T4lXc5Dtezprp818', '{\"action\": \"approve\", \"applicationId\": \"14\"}', 0, NULL, '2026-02-02 15:00:40', '2026-02-02 15:00:40');
INSERT INTO `notifications` VALUES ('8wRqZmHTBxdAqVna', 'JGDxmyz6YvhgVXzm', 'wt6lwcSn0po41yyU', 'team_approved', '团队申请申请已批准', 'TEST2TEST2TEST2TEST2TEST2', 'wt6lwcSn0po41yyU', '{\"action\": \"approve\", \"applicationId\": \"12\"}', 0, NULL, '2026-01-18 16:29:01', '2026-01-18 16:29:01');
INSERT INTO `notifications` VALUES ('98OwpnBFTFW9ceaS', 'JGDxmyz6YvhgVXzm', 'wt6lwcSn0po41yyU', 'team_rejected', '团队申请申请已拒绝', '审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请审批团队申请', 'wt6lwcSn0po41yyU', '{\"action\": \"reject\", \"applicationId\": \"12\"}', 0, NULL, '2026-01-18 14:21:29', '2026-01-18 14:21:29');
INSERT INTO `notifications` VALUES ('CXDGDiJ1bKVpYR02', 'JGDxmyz6YvhgVXzm', 'A9S0gd037gFry2WL', 'team_rejected', '团队申请申请已拒绝', 'getAvailableProjectsgetAvailableProjectsgetAvailableProjectsgetAvailableProjectsgetAvailableProjectsgetAvailableProjectsgetAvailableProjects', 'A9S0gd037gFry2WL', '{\"action\": \"reject\", \"applicationId\": \"8\"}', 0, NULL, '2026-01-18 13:43:20', '2026-01-18 13:43:20');
INSERT INTO `notifications` VALUES ('D1eMEiVTsuwF2Qyn', 'JGDxmyz6YvhgVXzm', 'Y7Uo0SYExNrInST8', 'team_approved', '团队申请申请已批准', 'asdasdasd项目团队asdasdasd项目团队asdasdasd项目团队asdasdasd项目团队asdasdasd项目团队', 'Y7Uo0SYExNrInST8', '{\"action\": \"approve\", \"applicationId\": \"13\"}', 0, NULL, '2026-01-21 09:25:17', '2026-01-21 09:25:17');
INSERT INTO `notifications` VALUES ('DQ6YxE3AlAlozLhT', 'Kr7ubEuz626z45Tr', 'z8SO5PP0uBEgilZU', 'team_approved', '团队申请申请已批准', '1.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.00', 'z8SO5PP0uBEgilZU', '{\"action\": \"approve\", \"applicationId\": \"15\"}', 0, NULL, '2026-02-02 17:14:22', '2026-02-02 17:14:22');
INSERT INTO `notifications` VALUES ('EN9EAvkc26EPZVgT', 'JGDxmyz6YvhgVXzm', 'tzQvfDo4CKOYSxAA', 'team_approved', '团队申请申请已批准', '分配合理同意同意同意同意', 'tzQvfDo4CKOYSxAA', '{\"action\": \"approve\", \"applicationId\": \"1\"}', 0, NULL, '2025-12-25 19:51:45', '2025-12-25 19:51:45');
INSERT INTO `notifications` VALUES ('JdPCILwyfFYUJh6M', 'JGDxmyz6YvhgVXzm', 't7VQYYi7kFjATvnz', 'team_approved', '团队申请申请已批准', 'ApplicationStatusApplicationStatusApplicationStatusApplicationStatusApplicationStatusApplicationStatus', 't7VQYYi7kFjATvnz', '{\"action\": \"approve\", \"applicationId\": \"11\"}', 0, NULL, '2026-01-18 14:16:08', '2026-01-18 14:16:08');
INSERT INTO `notifications` VALUES ('kLWPj5rCD314xk0Z', 'JGDxmyz6YvhgVXzm', 'zp8Rp04h4TOmEdkF', 'team_approved', '团队申请申请已批准', 'pmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwangpmbjwang', 'zp8Rp04h4TOmEdkF', '{\"action\": \"approve\", \"applicationId\": \"1\"}', 0, NULL, '2025-12-26 14:49:07', '2025-12-26 14:49:07');
INSERT INTO `notifications` VALUES ('m99HrkRpwYfi0kMs', 'JGDxmyz6YvhgVXzm', 'jAZqJ7Os0RonOPXF', 'team_approved', '团队申请申请已批准', 'pmbjlipmbjlipmbjlipmbjlipmbjlipmbjlipmbjli', 'jAZqJ7Os0RonOPXF', '{\"action\": \"approve\", \"applicationId\": \"6\"}', 0, NULL, '2026-01-16 18:43:06', '2026-01-16 18:43:06');
INSERT INTO `notifications` VALUES ('OQwhKVaGHFsxLbLD', '0s4u0CI64MgvYpM4', '9t0y59TSA1PHAAuF', 'team_rejected', '团队申请申请已拒绝', 'ssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadas', '9t0y59TSA1PHAAuF', '{\"action\": \"reject\", \"applicationId\": \"9\"}', 0, NULL, '2026-01-18 12:05:48', '2026-01-18 12:05:48');
INSERT INTO `notifications` VALUES ('p9w5xkseyNhADoay', 'JGDxmyz6YvhgVXzm', 'nmKOcgoMbOVloekE', 'team_approved', '团队申请申请已批准', '城市超市菜市场项目团队', 'nmKOcgoMbOVloekE', '{\"action\": \"approve\", \"applicationId\": \"2\"}', 0, NULL, '2025-12-25 20:00:06', '2025-12-25 20:00:06');
INSERT INTO `notifications` VALUES ('UunbxOZVI67qjQb5', 'JGDxmyz6YvhgVXzm', '9t0y59TSA1PHAAuF', 'team_needs_modification', '团队申请已要求修改申请', 'ssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadasssddsdsadsadas', '9t0y59TSA1PHAAuF', '{\"action\": \"modify\", \"applicationId\": \"10\"}', 0, NULL, '2026-01-18 12:06:44', '2026-01-18 12:06:44');
INSERT INTO `notifications` VALUES ('XB97jxR1sin5pcLB', 'JGDxmyz6YvhgVXzm', 't7VQYYi7kFjATvnz', 'team_needs_modification', '团队申请已要求修改申请', 'TEST1TEST1TEST1TEST1TEST1TEST1TEST1', 't7VQYYi7kFjATvnz', '{\"action\": \"modify\", \"applicationId\": \"11\"}', 0, NULL, '2026-01-18 14:09:54', '2026-01-18 14:09:54');
INSERT INTO `notifications` VALUES ('YeM9kcoNPB6idlMF', 'JGDxmyz6YvhgVXzm', '9t0y59TSA1PHAAuF', 'team_approved', '团队申请申请已批准', '待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请待审批的团队申请', '9t0y59TSA1PHAAuF', '{\"action\": \"approve\", \"applicationId\": \"10\"}', 0, NULL, '2026-01-18 12:31:51', '2026-01-18 12:31:51');

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
-- Records of operation_logs
-- ----------------------------

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
-- Records of performance_assessments
-- ----------------------------
INSERT INTO `performance_assessments` VALUES ('04A2i8CgvruIn1vK', 'JGDxmyz6YvhgVXzm', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('1aYWPGVFRnvNmzvF', 'xxrgyt4dDrY0wYZs', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('1EyHo8fq2Uf0HUDq', 'dYQ6jmlhgpNLpt7u', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('2F1eWdSR4fXGP4n8', 'UA1Ub1ppCOQirMQN', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 82, \"levelBonus\": 82}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 82, \"normalizedScore\": 82}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('2IfssSWfcUnufMzz', 'xxrgyt4dDrY0wYZs', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('2PrPLjmn1UNh1sIh', 'BqPRlZFYwwG376AZ', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('2SQNYY6Bi6B6Wniz', 'Zf2TO8nUll7qk2b8', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('3QMCJO7YEHll34Ku', 'JGDxmyz6YvhgVXzm', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('3WeThVK951qgtEhO', 'N0Q3uA6XXmErvFyr', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('3X4sxU63f0iOudMp', 'OuM2daatV8gWJpiI', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('5nSjmSzIJD1wxCi7', 'ft2QPHYNGvEGS94O', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-21 16:19:34', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('6EgEbnPs32mLyAl9', '5NQDb4fAifAEuuK5', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('6xXhf0ghtT8Fj4SB', 'JGDxmyz6YvhgVXzm', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('72T81KpXWQkmJdeg', 'IdfqHfaqF25MD78C', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('75Uxfn1PBtYJxYBs', 'IdfqHfaqF25MD78C', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('9Wvgj40uSnz78HL8', 'BqPRlZFYwwG376AZ', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('a0prq8CFTJen8GUw', 'Zf2TO8nUll7qk2b8', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('AkjzJa9QPldQpONg', 'xxrgyt4dDrY0wYZs', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('arFG36i3YO8mGKQx', 'j46LEwS76rO6rSi7', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('AT48rRyjptGbwXtG', '0s4u0CI64MgvYpM4', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_assessments` VALUES ('bAm8N2XBfeXDwoEZ', 'CBfK070SlZeqWuBJ', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('C26dzdoHNv7A9v8S', 'rRaokmUmAVXtkaRu', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('c8gLcztRVwSW1shZ', 'M7qF7Od1EeeVi180', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('Cdvbad6GAHcMXy77', '4Yc3pjFRO7SACMSC', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('ceuMm7AWq4dvpewd', 'dDBn9fGohVDpn8ou', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('ChurLMtYpCDdnXq6', '96b53f9e-eab5-4133-9f93-47cb640b277a', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('CRIyFlvcLNBHc1Hx', 'j46LEwS76rO6rSi7', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('CSZ2KWtHb41D4LFa', 'D3fZif5G61ZHTexI', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-08 19:39:56', '2026-01-15 11:37:00');
INSERT INTO `performance_assessments` VALUES ('CtEiUdCEAiinVd5I', '5NQDb4fAifAEuuK5', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('CV9idEHoQxJrH6Q8', 'SEZU6i8X6eibaa8D', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('D6ZwbYFpOyhyFCe9', 'OuM2daatV8gWJpiI', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('dFeTKSWecMilqvAL', '5B3OF8cpsVIyPUDr', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('dN4QEAa90r2oFDsk', 'ebAPESo4mdhpHCHi', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('dZPcYSz6NfNuzfk5', 'IdfqHfaqF25MD78C', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('Er5oHhqE1McYJEuA', 'BqPRlZFYwwG376AZ', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_assessments` VALUES ('Ez9h0Mo4F9BrMTKA', 'FZOpTvVEQ0NWPs1a', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('F8bDKs3l99xSbyev', 'b0pCjq6NiNitrX64', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('fBernU0erc0pTMPe', 'BqPRlZFYwwG376AZ', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('fiUlTcCAmSb1MVIv', 'j46LEwS76rO6rSi7', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('GefuUtfwKxXAXMZc', 'AEj02DNLHOssk29p', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('hEd6uzJ1EY9LdTA4', '0s4u0CI64MgvYpM4', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_assessments` VALUES ('HMpXBGv8q43YUkzp', 'j46LEwS76rO6rSi7', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('hSXEeDeXgCqkBwu3', 'cf8f2265-89fc-408f-87d7-d5c407d8e650', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('HyPNtxW8rnIt2TFp', 'snxuBWDUaWdINQPp', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('IH0dZN6bIoVapubZ', 'djyXvATz3naKO4Z9', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('IjB3yG61vUTSVGiw', '0s4u0CI64MgvYpM4', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('InjoXess5ffg50Yb', 'D3fZif5G61ZHTexI', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('IPB8XoaMYU1EQzJO', 'Zf2TO8nUll7qk2b8', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('j19aGkuPWy7qpCeA', '4S0AcqCTtddHBRRF', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('jB1GXvqowOgj6AsE', 'D3fZif5G61ZHTexI', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('k7QTxiHKrnRrTX0A', 'zCUP0ivcv5z0g760', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('KnmaCQyxrLVB15Gi', 'D3fZif5G61ZHTexI', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('KUB0SfM4ixctyPV4', 'JGDxmyz6YvhgVXzm', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('lPV5tY6nY2k3kk1c', 'OuM2daatV8gWJpiI', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('lXMuOr7sDqjeyzJd', '5NQDb4fAifAEuuK5', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_assessments` VALUES ('MIbYTN6sezugvmZJ', '4Yc3pjFRO7SACMSC', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 15:03:29');
INSERT INTO `performance_assessments` VALUES ('MKJyyDu6MhQ25wT2', 'L2tJlIFHpZAPVSHu', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('mmFqqKStcMebsqRF', 'xxrgyt4dDrY0wYZs', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('mvOCt7JZlxWZjUD9', 'hGVyJqRpgVuah4UP', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('MvSmqqK405Z5vtzn', 'xhQbxOYOjCck3lFI', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('nFi02UHRGxnSJUL1', '5NQDb4fAifAEuuK5', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('nO8vEwBX5GGJZsmB', '4Yc3pjFRO7SACMSC', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_assessments` VALUES ('nrYsN80A1fWdSk1b', 'rRaokmUmAVXtkaRu', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('o7Z7Ff7ScmwLc8zI', '1QZC9ZBvJUGmQsYW', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('OjEKa5AtjcK6IPZe', '4Yc3pjFRO7SACMSC', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('os1Mg8OlqUhKYRG0', 'rRaokmUmAVXtkaRu', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('plJag7vUTCCXoKbr', 'emp_admin_001', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('PWOfCnJA6hNobouZ', '4Yc3pjFRO7SACMSC', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_assessments` VALUES ('q2ugYbz5YU0ly62B', 'FZOpTvVEQ0NWPs1a', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('qaLvYhK0NQOOUpdP', '5NQDb4fAifAEuuK5', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_assessments` VALUES ('QeqxO5rs6ADqj1f6', 'V1KCN40qYrkSYE8g', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('QkruC8grgFLMOq8s', 'IdfqHfaqF25MD78C', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('qMRYy2XtFbeSElRa', 'rRaokmUmAVXtkaRu', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('QsRO65m0Aaxlt3la', 'gy5xcfa86cFEz5wR', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('R3PWstpu5D4bTQE0', 'xxrgyt4dDrY0wYZs', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('sbg0Ilq5LiJUESpx', 'D3fZif5G61ZHTexI', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('sEUuQnLoFmwjtStL', 'FZOpTvVEQ0NWPs1a', '2025Q3', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:33');
INSERT INTO `performance_assessments` VALUES ('soGqXrDssaxFUntl', 'FZOpTvVEQ0NWPs1a', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('svs7B8vQHP9iXVsG', 'rRaokmUmAVXtkaRu', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('SWJIq6Dx4r7fsGpY', 'JB4Z9xA5a9Af41h4', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('TMmjEe93fVmSklVL', 'emp_hr001', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-08 19:39:56', '2026-01-08 19:39:56');
INSERT INTO `performance_assessments` VALUES ('tQc52CsBUlJjgOf3', 'OuM2daatV8gWJpiI', '2026Q2', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_assessments` VALUES ('uDoZ0JDlMLzZZZMQ', '1fLcLgLfX8X1McmK', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('uEY9JBBWztpZiQkN', 'Zf2TO8nUll7qk2b8', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('UGZDL1FPInS3MjmC', 'JGDxmyz6YvhgVXzm', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('ui5iV8aoNLgukA63', 'OuM2daatV8gWJpiI', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('UZ39tVQgLDRiBtIi', 'yBTKqGWMdKg9IMLS', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('WefEpvztrhUD32xM', 'j46LEwS76rO6rSi7', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('wfXHjazqrnTZ1JfO', 'VU9LFcUfr1dO11Kz', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('wnfG04PcDsexBb0d', '0aa4a034-f676-4f7a-a91d-c33593558d6f', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-21 16:19:34', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('wu42jpcKfHN7DusS', 'WsyuiWSnQcNIs2yl', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 80, \"levelBonus\": 80}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 80, \"normalizedScore\": 80}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('wwMpg92M5FabwJTC', 'HVIqlzEXuWgLWJ97', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('x7OVgHi1cdq8Mf4k', 'GSlbTvB78NZGTnkC', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"business_line_id\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_assessments` VALUES ('xjhigRfr1xHOPbzz', 'emp_admin', '2025Q4', 75.00, 'B', 1.00, NULL, NULL, '[]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:29', '2025-12-26 17:53:40');
INSERT INTO `performance_assessments` VALUES ('YMRx9czAhtHXl5L7', 'IdfqHfaqF25MD78C', '2025Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:31');
INSERT INTO `performance_assessments` VALUES ('yVZKxTvc2Kb0Mgcr', 'Zf2TO8nUll7qk2b8', '2025Q4', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 75, \"levelBonus\": 75}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"_id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 75, \"normalizedScore\": 75}]', NULL, 1, 'approved', 1, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:08');
INSERT INTO `performance_assessments` VALUES ('yzqPkflIuNeOgb4Z', 'BqPRlZFYwwG376AZ', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 85, \"levelBonus\": 85}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 85, \"normalizedScore\": 85}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_assessments` VALUES ('zaLZ4NcomKomKY20', '0s4u0CI64MgvYpM4', '2026Q1', 0.00, 'D', 0.60, NULL, NULL, '[{\"method\": \"work_output_calculation\", \"params\": {\"baseScore\": 78, \"levelBonus\": 78}, \"category\": \"work_output\", \"indicator\": {\"id\": \"pi_default_001\", \"name\": \"任务完成率\", \"unit\": \"%\", \"weight\": 0.4, \"category\": \"work_output\", \"createdAt\": \"2025-11-06T07:16:12.000Z\", \"createdBy\": 1, \"is_active\": 1, \"updatedAt\": \"2025-11-06T07:16:12.000Z\", \"updatedBy\": 1, \"description\": \"工作任务按时完成的比例\", \"target_value\": 95, \"businessLineId\": null, \"calculationMethod\": \"auto\"}, \"dataQuality\": \"medium\", \"indicatorId\": \"pi_default_001\", \"indicatorName\": \"任务完成率\", \"calculatedScore\": 78, \"normalizedScore\": 78}]', NULL, 1, 'approved', 1, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');

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
-- Records of performance_indicator_data
-- ----------------------------
INSERT INTO `performance_indicator_data` VALUES ('083Nce6cHRz2mgZQ', 'pi_default_001', 'BqPRlZFYwwG376AZ', '2026Q1', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('1rqRaSoYBJX58uh9', 'pi_default_001', 'OuM2daatV8gWJpiI', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('2IbA3y8aGMdE2bD5', 'pi_default_001', 'xxrgyt4dDrY0wYZs', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('2LsIoEh8csBwaKqD', 'pi_default_001', 'N0Q3uA6XXmErvFyr', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('2RaSVYGe43Anaqyy', 'pi_default_001', 'dYQ6jmlhgpNLpt7u', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('3xrjXMhPWTFiIUTS', 'pi_default_001', 'j46LEwS76rO6rSi7', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('45b6M9T7br852DHB', 'pi_default_001', 'IdfqHfaqF25MD78C', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('4Ys4ZqeFJ1hXO9xZ', 'pi_default_001', 'AEj02DNLHOssk29p', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('4z1CDMz9n75Lx8q0', 'pi_default_001', 'xxrgyt4dDrY0wYZs', '2026Q2', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('5lspZZDyytjfX5je', 'pi_default_001', 'IdfqHfaqF25MD78C', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('5M9DmZtdt8Ritwi1', 'pi_default_001', 'D3fZif5G61ZHTexI', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('5njZr24zfi8Ht6mL', 'pi_default_001', '0s4u0CI64MgvYpM4', '2026Q2', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('5rRKymyEP3jan6Nv', 'pi_default_001', 'j46LEwS76rO6rSi7', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('5VQBn0q5Dram4W7S', 'pi_default_001', 'OuM2daatV8gWJpiI', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('7CBpWgtufw0jy4AP', 'pi_default_001', 'b0pCjq6NiNitrX64', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('852KOgaYlybxfKSk', 'pi_default_001', 'IdfqHfaqF25MD78C', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('8bIDcLEDrEGqxw1s', 'pi_default_001', 'rRaokmUmAVXtkaRu', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('9iak19onhzZiMVbJ', 'pi_default_001', 'ft2QPHYNGvEGS94O', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-21 16:19:34', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('9KdQH8S9W9adNU1r', 'pi_default_001', 'xxrgyt4dDrY0wYZs', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('amv9y4BDrGI3Reb5', 'pi_default_001', 'xxrgyt4dDrY0wYZs', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('aWZEDHmVupfjULbh', 'pi_default_001', 'OuM2daatV8gWJpiI', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('AYh4UlElgNOzga4b', 'pi_default_001', 'cf8f2265-89fc-408f-87d7-d5c407d8e650', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('b3SauD6Z3ccKJadd', 'pi_default_001', 'yBTKqGWMdKg9IMLS', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('BcOhB74NmRyXhFgw', 'pi_default_001', 'CBfK070SlZeqWuBJ', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('BlC6RDS5KS3Kz8Qa', 'pi_default_001', 'OuM2daatV8gWJpiI', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('BYezdKzyYKN7Vzd6', 'pi_default_001', '5NQDb4fAifAEuuK5', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('c3JQtN9E0atwrb4p', 'pi_default_001', 'BqPRlZFYwwG376AZ', '2025Q3', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('CG4v7fGqzGxECCjR', 'pi_default_001', '0s4u0CI64MgvYpM4', '2025Q3', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('CXIGour7EbS4SyPD', 'pi_default_001', 'VU9LFcUfr1dO11Kz', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('DgVrDQqmkyYqgLBd', 'pi_default_001', 'j46LEwS76rO6rSi7', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('diX2Bt7qNBNW65pb', 'pi_default_001', '5NQDb4fAifAEuuK5', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('DQAxarHFJIjMWm2i', 'pi_default_001', '4S0AcqCTtddHBRRF', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('dQKKvoDjUlhMXbzK', 'pi_default_001', '0aa4a034-f676-4f7a-a91d-c33593558d6f', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-21 16:19:34', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('EhCqb10vWE8Kqq9K', 'pi_default_001', 'djyXvATz3naKO4Z9', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('EohnI8LJ02kkhJkK', 'pi_default_001', 'FZOpTvVEQ0NWPs1a', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('FeYzdIZGyuhuEZRD', 'pi_default_001', 'emp_hr001', '2025Q4', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-08 19:39:56', '2026-01-08 19:39:56');
INSERT INTO `performance_indicator_data` VALUES ('fqcy7Fm1FBKR6aI7', 'pi_default_001', 'FZOpTvVEQ0NWPs1a', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('FUEP84ntgr4Fo6Xr', 'pi_default_001', 'gy5xcfa86cFEz5wR', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('g0rIzYCVZuXPrNkd', 'pi_default_001', '4Yc3pjFRO7SACMSC', '2025Q3', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('h41GLborVKiIr92n', 'pi_default_001', 'Zf2TO8nUll7qk2b8', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('hGYVg4prPTJvq1C1', 'pi_default_001', 'D3fZif5G61ZHTexI', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-08 19:39:56', '2026-01-15 11:36:59');
INSERT INTO `performance_indicator_data` VALUES ('hiTjnki5Zkl7UJgk', 'pi_default_001', '96b53f9e-eab5-4133-9f93-47cb640b277a', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('hNRk2m7SjFQ1XVNK', 'pi_default_001', 'JGDxmyz6YvhgVXzm', '2026Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('hvJoDd9hgCzv4dDM', 'pi_default_001', 'Zf2TO8nUll7qk2b8', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('HVTTXl3fy0jznmDy', 'pi_default_001', 'GSlbTvB78NZGTnkC', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('hxUZ2WGA1HqEDR15', 'pi_default_001', 'Zf2TO8nUll7qk2b8', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('Hyg9mXY1kLl2PPIc', 'pi_default_001', 'dDBn9fGohVDpn8ou', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('i8946VQGeLtJxaLH', 'pi_default_001', 'UA1Ub1ppCOQirMQN', '2025Q1', 0.00, NULL, 0.0000, 82.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('Ic54otMc984uF3bq', 'pi_default_001', 'xxrgyt4dDrY0wYZs', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('iHgiZYbRQkXzgb6H', 'pi_default_001', 'JGDxmyz6YvhgVXzm', '2025Q4', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('ILFgIPlwNLsBQGxQ', 'pi_default_001', 'D3fZif5G61ZHTexI', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('joewj9wYxsmMQBG0', 'pi_default_001', 'j46LEwS76rO6rSi7', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('JpIxfmtRQH2oNxkF', 'pi_default_001', 'IdfqHfaqF25MD78C', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('k8iEMf1SPo7wKXdr', 'pi_default_001', 'M7qF7Od1EeeVi180', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('kD7MyfrCv09WmnpU', 'pi_default_001', '4Yc3pjFRO7SACMSC', '2026Q1', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('KiAyMWTlBVyjvfdA', 'pi_default_001', 'ebAPESo4mdhpHCHi', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('kQjx8BYGpJPf2K3z', 'pi_default_001', 'JB4Z9xA5a9Af41h4', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('KWeGDsw8alv5tx7E', 'pi_default_001', '0s4u0CI64MgvYpM4', '2026Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('ldJoj4ueLFpIHLB4', 'pi_default_001', 'rRaokmUmAVXtkaRu', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('LudZkPZErRPweTuR', 'pi_default_001', 'HVIqlzEXuWgLWJ97', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('MGrzBzy5Cze1rhbs', 'pi_default_001', 'SEZU6i8X6eibaa8D', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('mRkc9g1zP9ONs3xA', 'pi_default_001', '1QZC9ZBvJUGmQsYW', '2025Q1', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('nfIOOCh4asQoyoUC', 'pi_default_001', 'emp_admin_001', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('nntWURnx00ZwrMR6', 'pi_default_001', 'JGDxmyz6YvhgVXzm', '2025Q3', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('oZo8qn1tMLkmFV3g', 'pi_default_001', 'D3fZif5G61ZHTexI', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('PJ9YaRKvWdUYK1dv', 'pi_default_001', '5NQDb4fAifAEuuK5', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('PkhZTeVxJe7mwq3n', 'pi_default_001', 'JGDxmyz6YvhgVXzm', '2026Q2', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('pWZuSVGqd4EB4ozr', 'pi_default_001', 'xhQbxOYOjCck3lFI', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('QkxxDE0kD3SWQNyf', 'pi_default_001', '5NQDb4fAifAEuuK5', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('qO6MzxD3cQ47tHMI', 'pi_default_001', 'j46LEwS76rO6rSi7', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('qrzWHBRO4TKCMQHU', 'pi_default_001', 'rRaokmUmAVXtkaRu', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('RfcWfJi6KyyEulBP', 'pi_default_001', '4Yc3pjFRO7SACMSC', '2026Q2', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('ruODC2al2ZrT5Z0Z', 'pi_default_001', 'FZOpTvVEQ0NWPs1a', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('RvTmHuwhrAhI1MHb', 'pi_default_001', '4Yc3pjFRO7SACMSC', '2025Q1', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('sCREyVkIl7KvGxFX', 'pi_default_001', 'WsyuiWSnQcNIs2yl', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('SeCjEs5Lp5RnNfKv', 'pi_default_001', 'FZOpTvVEQ0NWPs1a', '2025Q3', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-15 11:14:32', '2026-01-15 11:14:32');
INSERT INTO `performance_indicator_data` VALUES ('SN33OMr3qhKt4hHe', 'pi_default_001', '5B3OF8cpsVIyPUDr', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('sZy3DRoMOpMLRbmW', 'pi_default_001', 'rRaokmUmAVXtkaRu', '2025Q4', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('tb78oI2rq0171sya', 'pi_default_001', 'L2tJlIFHpZAPVSHu', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('tKecGuqGjYSnQZNp', 'pi_default_001', 'BqPRlZFYwwG376AZ', '2026Q2', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:37');
INSERT INTO `performance_indicator_data` VALUES ('u64VYv7WfOeViUAa', 'pi_default_001', 'BqPRlZFYwwG376AZ', '2025Q4', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 14:51:07');
INSERT INTO `performance_indicator_data` VALUES ('UCWPtSJ5rZO3MyCP', 'pi_default_001', '4Yc3pjFRO7SACMSC', '2025Q4', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2025-12-26 14:20:30', '2025-12-29 15:03:28');
INSERT INTO `performance_indicator_data` VALUES ('UgIND5slKohwOhmr', 'pi_default_001', 'Zf2TO8nUll7qk2b8', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('W7kw1tF1h45yMuCJ', 'pi_default_001', 'zCUP0ivcv5z0g760', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('wDu48yUoAp6yQUsP', 'pi_default_001', 'hGVyJqRpgVuah4UP', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('WKP6lCDkaCBuvAC3', 'pi_default_001', 'rRaokmUmAVXtkaRu', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('Wpp0IoqwDHqoafqh', 'pi_default_001', 'JGDxmyz6YvhgVXzm', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('X5EtIxydk5rMehDU', 'pi_default_001', '0s4u0CI64MgvYpM4', '2025Q1', 0.00, NULL, 0.0000, 78.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('xhEqMYONQTUmnvIL', 'pi_default_001', '1fLcLgLfX8X1McmK', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:45');
INSERT INTO `performance_indicator_data` VALUES ('xhh36OPoMjlvl8ij', 'pi_default_001', '5NQDb4fAifAEuuK5', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('XLBZt9sZQIuRst14', 'pi_default_001', 'snxuBWDUaWdINQPp', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('xmj0PSDLYKQYu92S', 'pi_default_001', 'BqPRlZFYwwG376AZ', '2025Q1', 0.00, NULL, 0.0000, 85.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('XvRT3r9BgQe15Pbz', 'pi_default_001', 'Zf2TO8nUll7qk2b8', '2026Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 11:43:34', '2026-01-12 11:43:34');
INSERT INTO `performance_indicator_data` VALUES ('YHBSKD5uclv2G8f1', 'pi_default_001', 'IdfqHfaqF25MD78C', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');
INSERT INTO `performance_indicator_data` VALUES ('zlTxMVpG4EEATe9z', 'pi_default_001', 'V1KCN40qYrkSYE8g', '2025Q1', 0.00, NULL, 0.0000, 80.00, NULL, 'pending', 1, NULL, 1, 1, '2025-11-14 14:28:58', '2025-11-28 10:58:46');
INSERT INTO `performance_indicator_data` VALUES ('zpIeLHaPVb4z0zlj', 'pi_default_001', 'OuM2daatV8gWJpiI', '2026Q2', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-02-02 10:31:20', '2026-02-02 10:31:38');
INSERT INTO `performance_indicator_data` VALUES ('zzEGCGFy8Utpy5kc', 'pi_default_001', 'D3fZif5G61ZHTexI', '2025Q1', 0.00, NULL, 0.0000, 75.00, NULL, 'pending', 1, NULL, 1, 1, '2026-01-12 12:06:30', '2026-01-12 12:06:30');

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
-- Records of performance_indicators
-- ----------------------------
INSERT INTO `performance_indicators` VALUES ('pi_default_001', NULL, 'work_output', '任务完成率', '工作任务按时完成的比例', 0.40, 95.00, '%', 'auto', 1, 1, 1, '2025-11-06 15:16:12', '2025-11-06 15:16:12');

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
-- Records of performance_records
-- ----------------------------

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
  `start_end_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '考勤起止日期',
  `work_time` int NULL DEFAULT NULL COMMENT '应到考勤天数',
  `real_work_time` int NULL DEFAULT NULL COMMENT '实际出勤天数',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_employee_period`(`employee_id` ASC, `calculation_period` ASC) USING BTREE,
  INDEX `idx_period`(`calculation_period` ASC) USING BTREE,
  INDEX `idx_employee`(`employee_id` ASC) USING BTREE,
  INDEX `idx_review_status`(`review_status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of performance_three_dimensional_scores
-- ----------------------------
INSERT INTO `performance_three_dimensional_scores` VALUES ('_mEienpzAEV5hZIURQz9Y', '5NQDb4fAifAEuuK5', '2025Q4', 86.00, 86.00, 86.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('_P2LuMyotp0RzAwzowIYt', 'ALRVuAaWddFzdu7h', '2025Q4', 83.00, 84.00, 85.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('-xAD8g7WO0vIcRmHaUcO6', 'Kr7ubEuz626z45Tr', '2025', 85.00, 86.00, 87.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1888, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('16nbM8uXJl1-fL672tcRU', 'EbPi9xDqgDWYb0CL', '2025', 88.00, 89.00, 90.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('3POTZ5PCDkwyZRLwH01v1', 'qqtcss15Te6aN9HH', '2025', 89.00, 90.00, 91.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('4BSqqaebVyZsUf3skwizt', 'cDsFeXUrthIIC3ER', '2025', 90.00, 91.00, 92.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('4bzW3VN0Xx4ChTEcS75lD', '9xgYQ4MYWRZ8Fh4u', '2025Q4', 82.00, 82.00, 82.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('50MOSkjLrGrY0MQbBUsGn', 'OuM2daatV8gWJpiI', '2025', 84.00, 84.00, 84.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('69lwyQJywfxibxobsO7hF', 'IULJmYjMyXorOru3', '2025Q4', 81.00, 82.00, 83.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('6gcblzop1mkwCmC69XIQR', 'IULJmYjMyXorOru3', '2025', 81.00, 82.00, 83.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('7zsOIBzrUmJADEn_yVMyE', 'IdfqHfaqF25MD78C', '2025', 85.00, 85.00, 85.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 2053);
INSERT INTO `performance_three_dimensional_scores` VALUES ('80viH4Pu59yzSEGen6kgK', 'h0nwwaAsi4gJjFen', '2025Q4', 80.00, 81.00, 82.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('81Ax6KCB34Jwm_KpRm4JE', 'BqPRlZFYwwG376AZ', '2025', 87.00, 87.00, 87.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1529);
INSERT INTO `performance_three_dimensional_scores` VALUES ('84tC0NL2ANxmasjFQZ0cN', 'D3fZif5G61ZHTexI', '2025', 80.00, 80.00, 80.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('AOWRE-k-I9oPuKTw7PVpu', 'rRaokmUmAVXtkaRu', '2025Q4', 89.00, 89.00, 89.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:50', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:50', '2026-02-03 16:15:50', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('bCHldMdRXBc_M6UZ_IdQ1', '4Yc3pjFRO7SACMSC', '2025', 87.00, 88.00, 89.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('bLEaEm7_A-hGxRRV_w7GW', '5NQDb4fAifAEuuK5', '2025', 86.00, 86.00, 86.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 2334);
INSERT INTO `performance_three_dimensional_scores` VALUES ('bXss3oMCbs7GYduc2QtxN', 'Fre5c30QkfgDhYPg', '2025Q4', 84.00, 85.00, 86.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('coiTqfxIFMm9I1qcL9nkt', 'BqPRlZFYwwG376AZ', '2025Q4', 87.00, 87.00, 87.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('eayZWgOyLqsRVYiZnugKL', 'j46LEwS76rO6rSi7', '2025Q4', 88.00, 88.00, 88.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('EyD1V7zFdQIq9uHI26IdV', 'h0nwwaAsi4gJjFen', '2025', 80.00, 81.00, 82.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('F90YxcYZEoE0tuASv5KQu', 'LIbzH09aNTu9LPiZ', '2025', 94.00, 95.00, 96.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1888, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('FAmSDdudwDGzkTT7KZ3Xg', 'j46LEwS76rO6rSi7', '2025', 88.00, 88.00, 88.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1888, 2141);
INSERT INTO `performance_three_dimensional_scores` VALUES ('G-U4d85ZsG-Yba__-T3o2', 'uW6c7E69lecxMM0c', '2025Q4', 81.00, 81.00, 81.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('H77egZb1ytXPdFQvX5CoK', 'WBtjGNZ2h7hDwbRq', '2025Q4', 91.00, 92.00, 93.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('h77QjHFdy8VtIpH9zmfRT', '6aha8mGPcBt2T2L7', '2025', 83.00, 83.00, 83.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('Hv4nBOtkFMydd3WxBWJ4O', 'IdfqHfaqF25MD78C', '2025Q4', 85.00, 85.00, 85.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('hWXMoeV7RMfdXEcqZb9Ux', 'cDsFeXUrthIIC3ER', '2025Q4', 90.00, 91.00, 92.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('I032RvTFFkBXNYyFLHBek', '9xgYQ4MYWRZ8Fh4u', '2025', 82.00, 82.00, 82.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('iJrHBYA7CstWl9nZq7FeS', 'NBwpI13bBbTJGjwY', '2025', 86.00, 87.00, 88.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('kidSi86uNDWimxLyahMks', 'Fre5c30QkfgDhYPg', '2025', 84.00, 85.00, 86.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('KKwIteCWZ53pFYSQ43cxc', 'xxrgyt4dDrY0wYZs', '2025Q4', 90.00, 90.00, 90.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:50', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:50', '2026-02-03 16:15:50', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('KW5ljBA9xwaN4lpJyhEpO', 'rRaokmUmAVXtkaRu', '2025', 89.00, 89.00, 89.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 2452);
INSERT INTO `performance_three_dimensional_scores` VALUES ('MAQs4WIwdlsVgNxvv8DOC', 'EbPi9xDqgDWYb0CL', '2025Q4', 88.00, 89.00, 90.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('ND2YMO3FhHS_rlWc7zh2v', 'WBtjGNZ2h7hDwbRq', '2025', 91.00, 92.00, 93.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('NRHW-6ZOTPQnCdt44y567', 'lSBwKv6QG9O3EFsr', '2025', 92.00, 93.00, 94.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('o8QtvybyD6WZWs0hpFdIy', 'xxrgyt4dDrY0wYZs', '2025', 90.00, 90.00, 90.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1785);
INSERT INTO `performance_three_dimensional_scores` VALUES ('o9i2rMEuObZkH-Cn2vOe0', 'Zf2TO8nUll7qk2b8', '2025Q4', 91.00, 91.00, 91.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:50', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:50', '2026-02-03 16:15:50', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('oeqnYA3ED-anRheJLjS18', 'OuM2daatV8gWJpiI', '2025Q4', 84.00, 84.00, 84.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('OLuObRpwcsJrAr5Eb1t-u', '4Yc3pjFRO7SACMSC', '2025Q4', 87.00, 88.00, 89.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('pnGe6nv_F1mHIs4FnrNGK', 'Zf2TO8nUll7qk2b8', '2025', 91.00, 91.00, 91.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1757);
INSERT INTO `performance_three_dimensional_scores` VALUES ('PWqOGnQeTkS8u14SDELgy', 'uW6c7E69lecxMM0c', '2025', 81.00, 81.00, 81.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('QbW03ZD2Kf8nflbl8DOwY', 'BTBIiv5yHnfkyeKb', '2025', 93.00, 94.00, 95.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('QG5DHfr49M6pFhSxiKbVl', 'lSBwKv6QG9O3EFsr', '2025Q4', 92.00, 93.00, 94.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('SDvcsPu-IH-3weu8r7f2B', 'qqtcss15Te6aN9HH', '2025Q4', 89.00, 90.00, 91.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('TWT-LaC-22-N0oKHfZ0WR', 'NBwpI13bBbTJGjwY', '2025Q4', 86.00, 87.00, 88.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('tyobF03E2holHG8KLnKKW', 'ALRVuAaWddFzdu7h', '2025', 83.00, 84.00, 85.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('tYOGvbxMrEjeyI2R3lmD1', '6aha8mGPcBt2T2L7', '2025Q4', 83.00, 83.00, 83.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('uA3E5PgYr3hohb-t7TMh5', 'BTBIiv5yHnfkyeKb', '2025Q4', 93.00, 94.00, 95.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('UiLpfVw6vP0-AaEpxB0-g', '0s4u0CI64MgvYpM4', '2025', 82.00, 83.00, 84.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:14:32', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:14:32', '2026-02-03 16:14:32', '2025/01/01-2025/12/31', 1992, 1992);
INSERT INTO `performance_three_dimensional_scores` VALUES ('yCXKkqGge3Duly5ZlyJNd', 'D3fZif5G61ZHTexI', '2025Q4', 80.00, 80.00, 80.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('yl0C2zBjsh-VTb3XBN4ID', 'LIbzH09aNTu9LPiZ', '2025Q4', 94.00, 95.00, 96.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('Z7xWM1TZ1ziUQ4QV-RZLw', 'Kr7ubEuz626z45Tr', '2025Q4', 85.00, 86.00, 87.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);
INSERT INTO `performance_three_dimensional_scores` VALUES ('zd566R3rLF2JL_nf19e_4', '0s4u0CI64MgvYpM4', '2025Q4', 82.00, 83.00, 84.00, 'approved', '批量导入', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 16:15:49', '', 'import', '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 16:15:49', '2026-02-03 16:15:49', '2025/10/01-2025/12/31', 528, 528);

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
-- Records of position_benchmark_history
-- ----------------------------

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
-- Records of position_categories
-- ----------------------------
INSERT INTO `position_categories` VALUES ('cat_design', '视觉设计', 'DESIGN', 'main', NULL, 1, 3, '视觉设计相关岗位', 'el-icon-picture', '#e6a23c', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_management', '管理岗位', 'MANAGEMENT', 'main', NULL, 1, 6, '管理类岗位', 'el-icon-user', '#606266', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_operation', '运营市场', 'OPERATION', 'main', NULL, 1, 4, '运营市场相关岗位', 'el-icon-data-analysis', '#f56c6c', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_product', '产品设计', 'PRODUCT', 'main', NULL, 1, 2, '产品设计相关岗位', 'el-icon-edit', '#67c23a', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_support', '职能支持', 'SUPPORT', 'main', NULL, 1, 5, '职能支持相关岗位', 'el-icon-files', '#909399', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_tech', '技术研发', 'TECH', 'main', NULL, 1, 1, '技术研发相关岗位', 'el-icon-cpu', '#409eff', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_tech_be', '后端开发', 'TECH_BE', 'sub', 'cat_tech', 2, 12, '后端开发岗位', 'el-icon-data-line', '#409eff', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `position_categories` VALUES ('cat_tech_fe', '前端开发', 'TECH_FE', 'sub', 'cat_tech', 2, 11, '前端开发岗位', 'el-icon-monitor', '#67c23a', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');

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
-- Records of position_market_data
-- ----------------------------

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
-- Records of position_value_assessments
-- ----------------------------

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
-- Records of position_value_criterias
-- ----------------------------
INSERT INTO `position_value_criterias` VALUES ('pvc_default_001', NULL, 'M3', 0.30, 0.25, 0.25, 0.20, 150000.00, 1, 1, 1, '2025-11-06 15:16:12', '2025-11-06 15:16:12');

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关联岗位标签',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '岗位表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of positions
-- ----------------------------
INSERT INTO `positions` VALUES ('0BPrxtIAgT1r5e0j', '项目经理', 'PROJECT_MANAGER', 'M1', 2.40, NULL, '项目管理与团队协调', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_management');
INSERT INTO `positions` VALUES ('1cFUuSJ30bnx5cq1', '高级售前顾问', 'SR_PRESALE_CONSULTANT', 'P5', 0.80, NULL, '售前技术支持与方案设计', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('4PtXSjEn6Xrp6WR5', '高级产品经理', 'SR_PRODUCT_MANAGER', 'P6', 1.10, NULL, '核心产品设计与优化', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_management');
INSERT INTO `positions` VALUES ('AzygHw0Cpbx1YyUe', '总经理', 'CEO', 'M4', 3.00, 'Ly6kLcrzWVgszZXW', '公司全面管理，重点监管市场部', '[]', '[]', '[]', '{\"nextLevel\": \"\", \"growthAreas\": [], \"lateralMoves\": [], \"estimatedTime\": \"\", \"specializations\": []}', '{\"travel\": \"\", \"workType\": \"\"}', 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-02-03 13:00:28', NULL);
INSERT INTO `positions` VALUES ('b7TSp2bT6Y462Gpd', '商务经理', 'BUSINESS_MANAGER', 'M1', 0.90, NULL, '商务拓展与合作管理', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_ops');
INSERT INTO `positions` VALUES ('C5GGO2X3HewtCbR3', '技术支持专员', 'TECH_SUPPORT_SPECIALIST', 'P4', 0.60, NULL, '技术支持与运维保障', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_tech_software');
INSERT INTO `positions` VALUES ('dzwOrRGcGxkhyihH', '售前顾问', 'PRESALE_CONSULTANT', 'P4', 0.60, NULL, '售前支持与客户沟通', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('iY3Qfbj1ahgVaIzT', '产品经理', 'PRODUCT_MANAGER', 'P5', 0.80, NULL, '产品功能设计与迭代', '[]', '[]', '[]', '{\"nextLevel\": \"\", \"growthAreas\": [], \"lateralMoves\": [], \"estimatedTime\": \"\", \"specializations\": []}', '{\"travel\": \"\", \"workType\": \"\"}', 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_management');
INSERT INTO `positions` VALUES ('jvP4509BoI6I6beD', '初级实施顾问', 'JR_IMPL_CONSULTANT', 'P3', 0.40, NULL, '基础实施与支持', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('MONoncdbS6WKO15X', '部门经理', 'DEPT_MANAGER', 'M2', 1.10, NULL, '部门管理与业务统筹', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2025-08-22 09:12:04', NULL);
INSERT INTO `positions` VALUES ('PBjIKYfzZ72JDPir', '人事行政专员', 'HR_ADMIN_SPECIALIST', 'P4', 0.50, NULL, '人事行政管理', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_ops');
INSERT INTO `positions` VALUES ('PGlOi0ascfXoSzmo', '大客户总监', 'KEY_ACCOUNT_DIRECTOR', 'M3', 1.30, NULL, '大客户关系管理与战略合作', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-22 09:23:51', '2025-08-22 09:23:51', NULL);
INSERT INTO `positions` VALUES ('piZJ5sOBOfEIO9pj', '产品总监', 'PRODUCT_DIRECTOR', 'M3', 1.30, NULL, '产品规划与团队管理', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_management');
INSERT INTO `positions` VALUES ('pos_dev', '开发工程师', 'DEVELOPER', 'P3', 1.00, '9KwOiW6b4kJiBpbi', '', '[]', '[]', '[]', '{\"nextLevel\": \"\", \"growthAreas\": [], \"lateralMoves\": [], \"estimatedTime\": \"\", \"specializations\": []}', '{\"travel\": \"\", \"workType\": \"\"}', 0, 0, 1, NULL, NULL, '2025-08-28 04:20:17', '2026-01-20 11:02:45', 'cat_tech_software');
INSERT INTO `positions` VALUES ('pos_pm', '产品经理', 'PM', 'P4', 1.30, '9KwOiW6b4kJiBpbi', 'asdasdasdasdasdas', '[\"adsdasdsad\"]', '[\"asdasdasds\"]', '[\"TypeScript\"]', '{\"nextLevel\": \"产品经理\", \"growthAreas\": [\"战略规划\"], \"lateralMoves\": [\"产品经理\"], \"estimatedTime\": \"2025-06-28\", \"specializations\": [\"技术架构\"]}', '{\"travel\": \"偶尔出差\", \"workType\": \"兼职\"}', 0, 1, 1, NULL, NULL, '2025-08-28 04:20:17', '2026-01-20 11:02:45', 'cat_management');
INSERT INTO `positions` VALUES ('pos_senior_dev', '高级开发工程师', 'SENIOR_DEV', 'P4', 1.30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-28 04:20:17', '2026-01-20 11:02:45', 'cat_tech_software');
INSERT INTO `positions` VALUES ('qUa7XiPw8pZnjfHI', '市场专员', 'MARKETING_SPECIALIST', 'P4', 0.60, NULL, '市场推广与品牌建设', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_ops');
INSERT INTO `positions` VALUES ('TG8wmUwADIBwRH9i', '测试', 'TEST', 'P3', 0.80, NULL, '测试', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-09-16 07:06:27', '2026-01-20 11:02:45', 'cat_tech_software');
INSERT INTO `positions` VALUES ('Uu0uml9myYj19zvU', '产品专员', 'PRODUCT_SPECIALIST', 'P4', 0.70, NULL, '产品执行与协调', '[]', '[]', '[]', '{\"nextLevel\": \"\", \"growthAreas\": [], \"lateralMoves\": [], \"estimatedTime\": \"\", \"specializations\": []}', '{\"travel\": \"不出差\", \"workType\": \"兼职\"}', 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:08:08', 'cat_tech');
INSERT INTO `positions` VALUES ('w2ifFZ5Y1Mg4QlhU', '实施总监', 'IMPL_DIRECTOR', 'M3', 1.20, NULL, '实施团队管理与项目监督', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('wBDXLF5ogfaE6L4l', '财务经理', 'FINANCE_MANAGER', 'M1', 0.80, 'SA0HPyflKXdlOyXv', '财务管理与成本控制', '[]', '[]', '[]', '{\"nextLevel\": \"\", \"growthAreas\": [], \"lateralMoves\": [], \"estimatedTime\": \"\", \"specializations\": []}', '{\"travel\": \"\", \"workType\": \"\"}', 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_ops');
INSERT INTO `positions` VALUES ('WMrOtmuSYm6TtLCK', '实施顾问', 'IMPL_CONSULTANT', 'P4', 0.60, NULL, '项目实施与配置', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('x4auMxrRphLpJ8e6', '网络运维', 'NET_MANAGE', 'P1', 0.10, NULL, '', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-09-16 02:34:41', '2025-09-16 02:34:41', NULL);
INSERT INTO `positions` VALUES ('yEaNxoMxsW5T3Kof', '高级实施顾问', 'SR_IMPL_CONSULTANT', 'P5', 0.80, NULL, '复杂项目实施与技术指导', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_presale');
INSERT INTO `positions` VALUES ('YTb4JczHYc9PexhJ', '市场工程总监', 'MARKETING_ENG_DIRECTOR', 'M3', 1.20, NULL, '市场工程团队管理', NULL, NULL, NULL, NULL, NULL, 0, 0, 1, NULL, NULL, '2025-08-16 17:00:43', '2026-01-20 11:02:45', 'cat_ops');

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
-- Records of profit_allocation_rules
-- ----------------------------
INSERT INTO `profit_allocation_rules` VALUES (1, '默认利润分配规则', '系统默认的利润分配规则配置', NULL, 'ratio', NULL, NULL, 0.40, 0.30, 0.20, 0.10, 0.20, 0.05, 0.10, 0.30, 0.25, 0.25, 0.20, 0.20, 0.15, 0.10, NULL, NULL, 2.0000, '2025-11-06', NULL, '1.0', NULL, 'active', 1, 1, '2025-11-06 18:25:08', '2025-11-06 18:25:08');

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
-- Records of profit_data
-- ----------------------------

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
-- Records of project_applications
-- ----------------------------

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
-- Records of project_approval_flows
-- ----------------------------

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
-- Records of project_approval_instances
-- ----------------------------

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
-- Records of project_bonus_allocations
-- ----------------------------
INSERT INTO `project_bonus_allocations` VALUES ('aOkgE9eAzcdKzASn', '6gANvFORvi88VdUe', 'xxrgyt4dDrY0wYZs', 'DEVELOPER', 1.50, 1.00, 55.00, 56.00, 390.93, 'approved', '2026-02-03 00:00:00', NULL, '2026-02-03 16:47:48', '2026-02-03 17:14:55');
INSERT INTO `project_bonus_allocations` VALUES ('CKZYypMxMw2Gygd9', '6gANvFORvi88VdUe', 'Kr7ubEuz626z45Tr', 'PM', 2.00, 1.00, 100.00, 59.00, 998.48, 'approved', '2026-02-03 00:00:00', NULL, '2026-02-03 16:47:48', '2026-02-03 17:14:55');
INSERT INTO `project_bonus_allocations` VALUES ('p5GQIDeSIPZ4XoMw', '6gANvFORvi88VdUe', 'IdfqHfaqF25MD78C', 'DEVELOPER', 1.50, 1.00, 50.00, 58.00, 368.08, 'approved', '2026-02-03 00:00:00', NULL, '2026-02-03 16:47:48', '2026-02-03 17:14:55');
INSERT INTO `project_bonus_allocations` VALUES ('RAHnfqRiDgoNR9yd', '6gANvFORvi88VdUe', '5NQDb4fAifAEuuK5', 'TESTER', 1.00, 1.00, 45.00, 58.00, 242.50, 'approved', '2026-02-03 00:00:00', NULL, '2026-02-03 16:47:48', '2026-02-03 17:14:55');

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
-- Records of project_bonus_calculation_history
-- ----------------------------
INSERT INTO `project_bonus_calculation_history` VALUES ('7WL9gl089nwKe2Yq', '6gANvFORvi88VdUe', 'T4lXc5Dtezprp818', 4, 2000.00, 4, 1.2054, '[{\"id\": \"CKZYypMxMw2Gygd9\", \"_id\": \"CKZYypMxMw2Gygd9\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"PM\", \"status\": \"calculated\", \"roleName\": \"项目经理\", \"createdAt\": \"2026-02-03T08:47:48.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:48.000Z\", \"approvedAt\": null, \"employeeId\": \"Kr7ubEuz626z45Tr\", \"roleWeight\": 2, \"bonusAmount\": 998.48, \"employeeName\": \"李怀健\", \"calculatedWeight\": 0.6, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 59, \"participationRatio\": 100, \"contribution_weight\": 59}, {\"id\": \"p5GQIDeSIPZ4XoMw\", \"_id\": \"p5GQIDeSIPZ4XoMw\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:47:48.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:48.000Z\", \"approvedAt\": null, \"employeeId\": \"IdfqHfaqF25MD78C\", \"roleWeight\": 1.5, \"bonusAmount\": 368.08, \"employeeName\": \"董乃坤\", \"calculatedWeight\": 0.22, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 58, \"participationRatio\": 50, \"contribution_weight\": 58}, {\"id\": \"aOkgE9eAzcdKzASn\", \"_id\": \"aOkgE9eAzcdKzASn\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:47:48.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:48.000Z\", \"approvedAt\": null, \"employeeId\": \"xxrgyt4dDrY0wYZs\", \"roleWeight\": 1.5, \"bonusAmount\": 390.93, \"employeeName\": \"任聪聪\", \"calculatedWeight\": 0.24, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 56, \"participationRatio\": 55, \"contribution_weight\": 56}, {\"id\": \"RAHnfqRiDgoNR9yd\", \"_id\": \"RAHnfqRiDgoNR9yd\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"TESTER\", \"status\": \"calculated\", \"roleName\": \"测试工程师\", \"createdAt\": \"2026-02-03T08:47:48.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:48.000Z\", \"approvedAt\": null, \"employeeId\": \"5NQDb4fAifAEuuK5\", \"roleWeight\": 1, \"bonusAmount\": 242.5, \"employeeName\": \"康纪兰\", \"calculatedWeight\": 0.15, \"performanceCoeff\": 1, \"estimatedWorkload\": 56, \"contributionWeight\": 58, \"participationRatio\": 45, \"contribution_weight\": 58}]', 'ZJ0wtB2dshDttI5I', '2026-02-03 16:47:48', 1, NULL, '2026-02-03 16:47:48', '2026-02-03 16:47:48');
INSERT INTO `project_bonus_calculation_history` VALUES ('b8AgXv8njx3aN4dx', '6gANvFORvi88VdUe', 'T4lXc5Dtezprp818', 3, 2000.00, 4, 1.2054, '[{\"id\": \"SvYka56aGKjt7B8h\", \"_id\": \"SvYka56aGKjt7B8h\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"PM\", \"status\": \"calculated\", \"roleName\": \"项目经理\", \"createdAt\": \"2026-02-03T08:47:40.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:40.000Z\", \"approvedAt\": null, \"employeeId\": \"Kr7ubEuz626z45Tr\", \"roleWeight\": 2, \"bonusAmount\": 998.48, \"employeeName\": \"李怀健\", \"calculatedWeight\": 0.6, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 59, \"participationRatio\": 100, \"contribution_weight\": 59}, {\"id\": \"U9r8mA30pYfjf0Hg\", \"_id\": \"U9r8mA30pYfjf0Hg\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:47:40.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:40.000Z\", \"approvedAt\": null, \"employeeId\": \"IdfqHfaqF25MD78C\", \"roleWeight\": 1.5, \"bonusAmount\": 368.08, \"employeeName\": \"董乃坤\", \"calculatedWeight\": 0.22, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 58, \"participationRatio\": 50, \"contribution_weight\": 58}, {\"id\": \"67iLLqJ7KETCsTfw\", \"_id\": \"67iLLqJ7KETCsTfw\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:47:40.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:40.000Z\", \"approvedAt\": null, \"employeeId\": \"xxrgyt4dDrY0wYZs\", \"roleWeight\": 1.5, \"bonusAmount\": 390.93, \"employeeName\": \"任聪聪\", \"calculatedWeight\": 0.24, \"performanceCoeff\": 1, \"estimatedWorkload\": 51, \"contributionWeight\": 56, \"participationRatio\": 55, \"contribution_weight\": 56}, {\"id\": \"ouaBju97D7kusg5A\", \"_id\": \"ouaBju97D7kusg5A\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"TESTER\", \"status\": \"calculated\", \"roleName\": \"测试工程师\", \"createdAt\": \"2026-02-03T08:47:40.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:47:40.000Z\", \"approvedAt\": null, \"employeeId\": \"5NQDb4fAifAEuuK5\", \"roleWeight\": 1, \"bonusAmount\": 242.5, \"employeeName\": \"康纪兰\", \"calculatedWeight\": 0.15, \"performanceCoeff\": 1, \"estimatedWorkload\": 56, \"contributionWeight\": 58, \"participationRatio\": 45, \"contribution_weight\": 58}]', 'ZJ0wtB2dshDttI5I', '2026-02-03 16:47:40', 0, NULL, '2026-02-03 16:47:40', '2026-02-03 16:47:48');
INSERT INTO `project_bonus_calculation_history` VALUES ('BDBkmJPJUVwr5dn8', '6gANvFORvi88VdUe', 'T4lXc5Dtezprp818', 1, 2000.00, 4, 1.2054, '[{\"id\": \"f6VX1ZYg6WQOKwok\", \"_id\": \"f6VX1ZYg6WQOKwok\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"PM\", \"status\": \"calculated\", \"roleName\": \"项目经理\", \"createdAt\": \"2026-02-03T08:42:08.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:08.000Z\", \"approvedAt\": null, \"employeeId\": \"Kr7ubEuz626z45Tr\", \"roleWeight\": 2, \"bonusAmount\": 998.48, \"employeeName\": \"李怀健\", \"performanceCoeff\": 1, \"participationRatio\": 100, \"contribution_weight\": 59}, {\"id\": \"ANUVypaHITwwti5W\", \"_id\": \"ANUVypaHITwwti5W\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:42:08.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:08.000Z\", \"approvedAt\": null, \"employeeId\": \"IdfqHfaqF25MD78C\", \"roleWeight\": 1.5, \"bonusAmount\": 368.08, \"employeeName\": \"董乃坤\", \"performanceCoeff\": 1, \"participationRatio\": 50, \"contribution_weight\": 58}, {\"id\": \"hy8Fk3lINdEXCvFW\", \"_id\": \"hy8Fk3lINdEXCvFW\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:42:08.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:08.000Z\", \"approvedAt\": null, \"employeeId\": \"xxrgyt4dDrY0wYZs\", \"roleWeight\": 1.5, \"bonusAmount\": 390.93, \"employeeName\": \"任聪聪\", \"performanceCoeff\": 1, \"participationRatio\": 55, \"contribution_weight\": 56}, {\"id\": \"b3PG3qP5wot8tV1h\", \"_id\": \"b3PG3qP5wot8tV1h\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"TESTER\", \"status\": \"calculated\", \"roleName\": \"测试工程师\", \"createdAt\": \"2026-02-03T08:42:08.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:08.000Z\", \"approvedAt\": null, \"employeeId\": \"5NQDb4fAifAEuuK5\", \"roleWeight\": 1, \"bonusAmount\": 242.5, \"employeeName\": \"康纪兰\", \"performanceCoeff\": 1, \"participationRatio\": 45, \"contribution_weight\": 58}]', 'ZJ0wtB2dshDttI5I', '2026-02-03 16:42:08', 0, NULL, '2026-02-03 16:42:08', '2026-02-03 16:47:48');
INSERT INTO `project_bonus_calculation_history` VALUES ('P2qIOuAug9TFH1Dy', '6gANvFORvi88VdUe', 'T4lXc5Dtezprp818', 2, 2000.00, 4, 1.2054, '[{\"id\": \"MtCQhkN8Mfdmg2xR\", \"_id\": \"MtCQhkN8Mfdmg2xR\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"PM\", \"status\": \"calculated\", \"roleName\": \"项目经理\", \"createdAt\": \"2026-02-03T08:42:45.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:45.000Z\", \"approvedAt\": null, \"employeeId\": \"Kr7ubEuz626z45Tr\", \"roleWeight\": 2, \"bonusAmount\": 998.48, \"employeeName\": \"李怀健\", \"performanceCoeff\": 1, \"participationRatio\": 100, \"contribution_weight\": 59}, {\"id\": \"ygK1gSna6QM6mnop\", \"_id\": \"ygK1gSna6QM6mnop\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:42:45.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:45.000Z\", \"approvedAt\": null, \"employeeId\": \"IdfqHfaqF25MD78C\", \"roleWeight\": 1.5, \"bonusAmount\": 368.08, \"employeeName\": \"董乃坤\", \"performanceCoeff\": 1, \"participationRatio\": 50, \"contribution_weight\": 58}, {\"id\": \"xrEPISplozuEeuH2\", \"_id\": \"xrEPISplozuEeuH2\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"DEVELOPER\", \"status\": \"calculated\", \"roleName\": \"开发工程师\", \"createdAt\": \"2026-02-03T08:42:45.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:45.000Z\", \"approvedAt\": null, \"employeeId\": \"xxrgyt4dDrY0wYZs\", \"roleWeight\": 1.5, \"bonusAmount\": 390.93, \"employeeName\": \"任聪聪\", \"performanceCoeff\": 1, \"participationRatio\": 55, \"contribution_weight\": 56}, {\"id\": \"vQgorCX0WdYkv8oW\", \"_id\": \"vQgorCX0WdYkv8oW\", \"poolId\": \"6gANvFORvi88VdUe\", \"roleId\": \"TESTER\", \"status\": \"calculated\", \"roleName\": \"测试工程师\", \"createdAt\": \"2026-02-03T08:42:45.000Z\", \"deletedAt\": null, \"updatedAt\": \"2026-02-03T08:42:45.000Z\", \"approvedAt\": null, \"employeeId\": \"5NQDb4fAifAEuuK5\", \"roleWeight\": 1, \"bonusAmount\": 242.5, \"employeeName\": \"康纪兰\", \"performanceCoeff\": 1, \"participationRatio\": 45, \"contribution_weight\": 58}]', 'ZJ0wtB2dshDttI5I', '2026-02-03 16:42:45', 0, NULL, '2026-02-03 16:42:45', '2026-02-03 16:47:48');

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
-- Records of project_bonus_pools
-- ----------------------------
INSERT INTO `project_bonus_pools` VALUES ('6gANvFORvi88VdUe', 'T4lXc5Dtezprp818', '2025Q4', 2000.00, 0.20, 'approved', '', 'ZJ0wtB2dshDttI5I', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-03 00:00:00', NULL, NULL, '2026-02-03 16:42:04', '2026-02-03 17:14:55', 10000.00);

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
-- Records of project_collaboration_logs
-- ----------------------------

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
-- Records of project_costs
-- ----------------------------
INSERT INTO `project_costs` VALUES ('D2eiQYlHdCXDHDFj', 'T4lXc5Dtezprp818', '人力成本', 10000.00, '工资工资工资工资', '2026-02-02', 'Kr7ubEuz626z45Tr', 'confirmed', '2026-02-02 15:06:18', '2026-02-02 15:06:18');
INSERT INTO `project_costs` VALUES ('QfgqqsfAfaPUi2GV', 'T4lXc5Dtezprp818', '材料成本', 2000.00, '材料打印成本', '2026-02-02', 'Kr7ubEuz626z45Tr', 'confirmed', '2026-02-02 15:06:34', '2026-02-02 15:06:34');
INSERT INTO `project_costs` VALUES ('WeyXHp2AB2haygFi', 'T4lXc5Dtezprp818', '其他成本', 3000.00, '出差 机票费用', '2026-02-02', 'Kr7ubEuz626z45Tr', 'confirmed', '2026-02-02 15:07:02', '2026-02-02 15:07:02');

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
-- Records of project_critical_paths
-- ----------------------------

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
-- Records of project_executions
-- ----------------------------

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
-- Records of project_line_weights
-- ----------------------------
INSERT INTO `project_line_weights` VALUES ('3DXN78oPUxf87WNL', 'rchPunW0qQKxpipw', 'GuDI5gOHb8rjdQ8U', 0.3700, '项目权重调整', '2026-01-16 10:36:39', '2026-01-16 10:36:39', 1, '2026-01-16 00:00:00');
INSERT INTO `project_line_weights` VALUES ('4Bkd13lCKfYHaIig', 'IdrwX6VWazfmxQqs', 'tech', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('9wK6JRqSHi4QOHt6', 'IdrwX6VWazfmxQqs', 'XJD1HavHAMpjxdl0', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('f1HMKA1y1BZ6dqyw', 'rchPunW0qQKxpipw', 'XJD1HavHAMpjxdl0', 0.2500, '项目权重调整', '2026-01-16 10:36:39', '2026-01-16 10:36:39', 1, '2026-01-16 00:00:00');
INSERT INTO `project_line_weights` VALUES ('G365CReMXpCxDoea', 'rchPunW0qQKxpipw', '9KwOiW6b4kJiBpbi', 0.2800, '项目权重调整', '2026-01-16 10:36:39', '2026-01-16 10:36:39', 1, '2026-01-16 00:00:00');
INSERT INTO `project_line_weights` VALUES ('G97cp0Xt5VPE8I7E', 'IdrwX6VWazfmxQqs', 'GuDI5gOHb8rjdQ8U', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('kK9ruAjmTn4HE894', 'IdrwX6VWazfmxQqs', 'sales', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('nImj7o6MKex75OeI', 'IdrwX6VWazfmxQqs', 'SA0HPyflKXdlOyXv', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('o3U5dCG6YBajhoH1', 'IdrwX6VWazfmxQqs', 'Ly6kLcrzWVgszZXW', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('rko7XCr85DhD0CFf', 'IdrwX6VWazfmxQqs', '9KwOiW6b4kJiBpbi', 0.1429, '项目权重调整', '2026-01-14 16:39:31', '2026-01-14 16:39:31', 1, '2026-01-14 00:00:00');
INSERT INTO `project_line_weights` VALUES ('rWhjDxCzgjTZDBY1', 'rchPunW0qQKxpipw', 'Ly6kLcrzWVgszZXW', 0.0700, '项目权重调整', '2026-01-16 10:36:39', '2026-01-16 10:36:39', 1, '2026-01-16 00:00:00');
INSERT INTO `project_line_weights` VALUES ('vQ4kBZ4nGTr5VcZY', 'rchPunW0qQKxpipw', 'SA0HPyflKXdlOyXv', 0.0300, '项目权重调整', '2026-01-16 10:36:39', '2026-01-16 10:36:39', 1, '2026-01-16 00:00:00');

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
-- Records of project_members
-- ----------------------------
INSERT INTO `project_members` VALUES ('0a3c35c2dcfc8ce0', 'z8SO5PP0uBEgilZU', 'xxrgyt4dDrY0wYZs', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('5966f171317b5369', 'z8SO5PP0uBEgilZU', 'Zf2TO8nUll7qk2b8', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('5c2a62071d170afc', 'z8SO5PP0uBEgilZU', 'OuM2daatV8gWJpiI', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('633955065c47386b', 'z8SO5PP0uBEgilZU', '9xgYQ4MYWRZ8Fh4u', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('665a62518896a72e', 'T4lXc5Dtezprp818', 'Kr7ubEuz626z45Tr', 14, '项目经理', 'active', '2026-02-02', NULL, '2026-02-02 15:00:15', '2026-02-03 16:25:18', '申请人（项目经理）', NULL, '2026-02-02 15:00:40', NULL, NULL, 100.00, 59.00, 51.00, 'gTgqsvcJXtqwFuiI', NULL, 1, '项目经理');
INSERT INTO `project_members` VALUES ('74d87a297463a03a', 'T4lXc5Dtezprp818', 'IdfqHfaqF25MD78C', 14, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 15:00:15', '2026-02-03 16:25:18', '', NULL, '2026-02-02 15:00:40', NULL, NULL, 50.00, 58.00, 51.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('790e47c9a3a0d57f', 'T4lXc5Dtezprp818', 'xxrgyt4dDrY0wYZs', 14, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 15:00:15', '2026-02-03 16:25:18', '', NULL, '2026-02-02 15:00:40', NULL, NULL, 55.00, 56.00, 51.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('99e496ed629f12dc', 'z8SO5PP0uBEgilZU', '5NQDb4fAifAEuuK5', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('9f483f0ceac9a45f', 'z8SO5PP0uBEgilZU', 'Kr7ubEuz626z45Tr', 15, '项目经理', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:16:10', '申请人（项目经理）', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 1, '项目经理');
INSERT INTO `project_members` VALUES ('d53c807041aeb9a9', 'z8SO5PP0uBEgilZU', '6aha8mGPcBt2T2L7', 15, '开发工程师', 'active', '2026-02-02', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22', '', NULL, '2026-02-02 17:14:22', NULL, NULL, 100.00, 100.00, 100.00, 'gTgqsvcJXtqwFuiI', NULL, 4, '开发工程师');
INSERT INTO `project_members` VALUES ('trjaQpbQ28yJs3ax', 'T4lXc5Dtezprp818', '5NQDb4fAifAEuuK5', NULL, NULL, 'active', '2026-02-02', NULL, '2026-02-02 16:35:44', '2026-02-03 16:25:18', '我要参加亚奥参加要参加', NULL, '2026-02-02 00:00:00', NULL, NULL, 45.00, 58.00, 56.00, 'c1eed6e3c69694efb6633a1a17f7a1eb', '', 5, NULL);

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
-- Records of project_milestones
-- ----------------------------
INSERT INTO `project_milestones` VALUES ('37ad691c-6aa9-4b35-bd0f-59a664ee2dc2', 'z8SO5PP0uBEgilZU', '项目实施阶段', '项目实施阶段', '2026-02-15', NULL, 'pending', 0, '项目实施阶段', NULL, 2, 'c1eed6e3c69694efb6633a1a17f7a1eb', '2026-02-02 17:21:30', '2026-02-02 17:21:30');
INSERT INTO `project_milestones` VALUES ('d14b1bec-6f93-430c-bf61-1f4ee8733a52', 'z8SO5PP0uBEgilZU', '产品设计阶段', '产品设计阶段', '2026-02-09', '2026-02-02', 'completed', 100, '产品设计阶段', NULL, 1, 'c1eed6e3c69694efb6633a1a17f7a1eb', '2026-02-02 17:21:30', '2026-02-02 17:22:35');
INSERT INTO `project_milestones` VALUES ('d6edd0c4-5903-402a-b221-f8b0e9936b62', 'z8SO5PP0uBEgilZU', '需求分析阶段', '需求分析阶段', '2026-02-13', '2026-02-02', 'completed', 100, '需求分析阶段', NULL, 0, 'c1eed6e3c69694efb6633a1a17f7a1eb', '2026-02-02 17:21:30', '2026-02-02 17:22:27');

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
-- Records of project_notifications
-- ----------------------------

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
-- Records of project_performance_manual
-- ----------------------------

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
-- Records of project_progress_logs
-- ----------------------------
INSERT INTO `project_progress_logs` VALUES ('92a80d78-5ca9-42f1-a15a-2fe0034b09a7', 'z8SO5PP0uBEgilZU', 'd6edd0c4-5903-402a-b221-f8b0e9936b62', 'milestone', '里程碑进度更新: 需求分析阶段', 51, 0, 51, NULL, '2026-02-02 17:22:04');
INSERT INTO `project_progress_logs` VALUES ('a69dacdb-a9ab-4ff3-a65e-e49b013e59f5', 'z8SO5PP0uBEgilZU', 'd6edd0c4-5903-402a-b221-f8b0e9936b62', 'milestone', '里程碑进度更新: 需求分析阶段', 100, 51, 100, NULL, '2026-02-02 17:22:27');
INSERT INTO `project_progress_logs` VALUES ('de201c4e-b437-41f0-a521-0068ab929d2a', 'z8SO5PP0uBEgilZU', 'd14b1bec-6f93-430c-bf61-1f4ee8733a52', 'milestone', '里程碑进度更新: 产品设计阶段', 100, 0, 100, NULL, '2026-02-02 17:22:35');

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
-- Records of project_requirements
-- ----------------------------

-- ----------------------------
-- Table structure for project_role_weight_templates
-- ----------------------------
DROP TABLE IF EXISTS `project_role_weight_templates`;
CREATE TABLE `project_role_weight_templates`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板类型：tech_team-技术团队, product_team-产品团队, mixed_team-综合团队, custom-自定义',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '模板描述',
  `weights` json NOT NULL COMMENT '权重配置（JSON格式，key为角色code，value为权重值）',
  `is_system` tinyint(1) NULL DEFAULT 0 COMMENT '是否系统预置模板：1-是，0-否',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用：1-启用，0-禁用',
  `sort` int NULL DEFAULT 0 COMMENT '排序',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_sort`(`sort` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '项目角色权重模板表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_role_weight_templates
-- ----------------------------
INSERT INTO `project_role_weight_templates` VALUES ('TDKb90RTyVNxI0-Rdua97', '测试', 'custom', 'ssssssss', '{\"PM\": 2, \"TESTER\": 1, \"DEVELOPER\": 1, \"TECH_LEAD\": 1.8, \"SENIOR_DEV\": 1.5, \"PRODUCT_MANAGE\": 1}', 0, 1, 0, 'admin_user', '2026-01-18 16:06:36', '2026-01-18 16:44:00');
INSERT INTO `project_role_weight_templates` VALUES ('tpl_balanced', '均衡团队', 'mixed_team', '各角色权重相对均衡的配置', '{\"PM\": 2, \"TESTER\": 1, \"DEVELOPER\": 1, \"TECH_LEAD\": 1.8, \"SENIOR_DEV\": 1.5, \"PRODUCT_MANAGE\": 1}', 1, 1, 3, 'system', '2026-01-18 16:05:23', '2026-01-18 16:07:59');
INSERT INTO `project_role_weight_templates` VALUES ('tpl_product_oriented', '产品导向团队', 'product_team', '适用于产品设计和用户体验重要的项目', '{\"PM\": 2, \"TESTER\": 1, \"DEVELOPER\": 1, \"TECH_LEAD\": 1.8, \"SENIOR_DEV\": 1.5, \"PRODUCT_MANAGE\": 1}', 1, 1, 2, 'system', '2026-01-18 16:05:23', '2026-01-18 16:08:02');
INSERT INTO `project_role_weight_templates` VALUES ('tpl_standard_tech', '标准技术团队', 'tech_team', '适用于以开发为主的技术项目', '{\"PM\": 2, \"TESTER\": 1, \"DEVELOPER\": 1, \"TECH_LEAD\": 1.8, \"SENIOR_DEV\": 1.5, \"PRODUCT_MANAGE\": 1}', 1, 1, 1, 'system', '2026-01-18 16:05:23', '2026-01-18 16:08:04');

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
-- Records of project_role_weights
-- ----------------------------
INSERT INTO `project_role_weights` VALUES ('IxcRrXBFnW0Plqjd', 'T4lXc5Dtezprp818', '{\"PM\": 2, \"TESTER\": 1, \"DEVELOPER\": 1.5, \"TECH_LEAD\": 1.8, \"SENIOR_DEV\": 1.5, \"PRODUCT_MANAGE\": 1}', 'c1eed6e3c69694efb6633a1a17f7a1eb', 'c1eed6e3c69694efb6633a1a17f7a1eb', '2026-02-02 15:52:42', '2026-02-03 16:25:35');

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
-- Records of project_roles
-- ----------------------------
INSERT INTO `project_roles` VALUES ('项目经理', 1, 'PM', '项目整体管理', '[\"项目规划\", \"资源协调\", \"进度管理\", \"风险控制\"]', '[\"项目管理\", \"沟通协调\", \"团队管理\"]', 'senior', 1, 1, '2025-11-13 17:59:59', '2025-11-13 17:59:59', NULL);
INSERT INTO `project_roles` VALUES ('技术负责人', 2, 'TECH_LEAD', '技术方案和团队管理', '[\"技术方案设计\", \"代码审查\", \"技术团队管理\"]', '[\"架构设计\", \"技术选型\", \"团队协作\"]', 'senior', 1, 1, '2025-11-13 17:59:59', '2025-11-13 17:59:59', NULL);
INSERT INTO `project_roles` VALUES ('高级开发工程师', 3, 'SENIOR_DEV', '核心功能开发', '[\"核心模块开发\", \"技术难点攻关\", \"代码质量\"]', '[\"编程能力\", \"系统设计\", \"问题解决\"]', 'senior', 1, 1, '2025-11-13 17:59:59', '2025-11-13 17:59:59', NULL);
INSERT INTO `project_roles` VALUES ('开发工程师', 4, 'DEVELOPER', '功能开发', '[\"功能实现\", \"单元测试\", \"文档编写\"]', '[\"编程基础\", \"框架使用\", \"协作开发\"]', 'middle', 1, 1, '2025-11-13 17:59:59', '2025-11-13 17:59:59', NULL);
INSERT INTO `project_roles` VALUES ('测试工程师', 5, 'TESTER', '质量保证和测试', '[\"测试用例设计\", \"功能测试\", \"缺陷跟踪管理\"]', '[\"测试方法\", \"自动化测试\", \"质量意识\"]', 'middle', 1, 1, '2025-11-13 17:59:59', '2025-11-13 17:59:59', NULL);
INSERT INTO `project_roles` VALUES ('产品经理', 6, 'PRODUCT_MANAGE', '项目选择测试', '[]', '[]', NULL, 0, 1, '2026-01-15 18:47:22', '2026-01-15 18:47:22', 1);

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
-- Records of project_state_history
-- ----------------------------
INSERT INTO `project_state_history` VALUES ('76202c2e-0017-11f1-8141-047c1686c53b', 'z8SO5PP0uBEgilZU', 'published', 'team_building', 'application_submitted', '{\"applicantId\": \"Kr7ubEuz626z45Tr\", \"applicationId\": 15}', '2026-02-02 17:13:39');
INSERT INTO `project_state_history` VALUES ('8fef83aa-0017-11f1-8141-047c1686c53b', 'z8SO5PP0uBEgilZU', 'team_building', 'approved', 'application_approved', '{\"approverId\": \"gTgqsvcJXtqwFuiI\", \"applicationId\": \"15\"}', '2026-02-02 17:14:22');
INSERT INTO `project_state_history` VALUES ('d3975122-0004-11f1-8141-047c1686c53b', 'T4lXc5Dtezprp818', 'published', 'team_building', 'application_submitted', '{\"applicantId\": \"Kr7ubEuz626z45Tr\", \"applicationId\": 14}', '2026-02-02 15:00:15');
INSERT INTO `project_state_history` VALUES ('e278499c-0004-11f1-8141-047c1686c53b', 'T4lXc5Dtezprp818', 'team_building', 'approved', 'application_approved', '{\"approverId\": \"gTgqsvcJXtqwFuiI\", \"applicationId\": \"14\"}', '2026-02-02 15:00:40');

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
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending' COMMENT '???pending-????approved-????rejected-???',
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
  INDEX `idx_pta_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '???????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of project_team_applications
-- ----------------------------
INSERT INTO `project_team_applications` VALUES (14, 'T4lXc5Dtezprp818', 'Kr7ubEuz626z45Tr', '132仿真项目项目团队', '132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队', 3, 30000.00, '132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队', 'pending', 1, '2026-02-02 15:00:15', 'gTgqsvcJXtqwFuiI', '2026-02-02 15:00:40', '132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队132仿真项目项目团队', NULL, '2026-02-02 15:00:15', '2026-02-02 15:00:40');
INSERT INTO `project_team_applications` VALUES (15, 'z8SO5PP0uBEgilZU', 'Kr7ubEuz626z45Tr', '桅顶模型项目团队', '确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目', 7, 90000.00, '确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目确定要为项目', 'pending', 1, '2026-02-02 17:13:39', 'gTgqsvcJXtqwFuiI', '2026-02-02 17:14:22', '1.001.001.001.001.001.001.001.001.001.001.001.001.001.001.001.00', NULL, '2026-02-02 17:13:39', '2026-02-02 17:14:22');

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
-- Records of projects
-- ----------------------------
INSERT INTO `projects` VALUES ('T4lXc5Dtezprp818', '132仿真项目', 'SIM_132', '132仿真项目', 'Kr7ubEuz626z45Tr', 'completed', '2026-02-01', '2026-02-27', 100000.00, '2026-02-02 14:57:31', '2026-02-03 16:47:48', 'medium', 50000.00, '132仿真项目132仿真项目', NULL, 'approved', 'calculated', 'gTgqsvcJXtqwFuiI', '2026-02-02 14:57:31');
INSERT INTO `projects` VALUES ('z8SO5PP0uBEgilZU', '桅顶模型', 'SIM_WD', '桅顶模型', 'Kr7ubEuz626z45Tr', 'active', '2026-01-31', '2026-02-26', 1000000.00, '2026-02-02 17:10:31', '2026-02-02 17:57:13', 'medium', 500000.00, '桅顶模型桅顶模型桅顶模型桅顶模型桅顶模型桅顶模型', NULL, 'approved', 'calculated', '51d8bcc23b510771d9a4bd3c9995b62e', '2026-02-02 17:10:59');

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
-- Records of reports
-- ----------------------------
INSERT INTO `reports` VALUES ('1767081658891', '员工奖金明细_2025-12-30', 'bonus', '详细的员工奖金计算明细', '[\"2025-12\", \"2025-12\"]', '[\"employeeName\", \"baseAmount\", \"performanceBonus\", \"totalBonus\"]', '{}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2025-12-30 16:00:59', '2026-01-08 19:38:23', NULL, '2026-01-08 19:38:23', NULL);
INSERT INTO `reports` VALUES ('1767884517946', '奖金分布统计_2026-01-08', 'statistics', '奖金分布区间和统计分析', '[\"2026-01\", \"2026-01\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-08 23:01:58', '2026-01-09 10:24:57', NULL, '2026-01-09 10:24:57', NULL);
INSERT INTO `reports` VALUES ('1767884535058', '绩效分析报告_2026-01-08', 'statistics', '员工绩效评估和分析报告', '[\"2026-01\", \"2026-01\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-08 23:02:15', '2026-01-09 10:24:56', NULL, '2026-01-09 10:24:55', NULL);
INSERT INTO `reports` VALUES ('1767923533484', '月度奖金汇总_2026-01-09', 'bonus', '按部门统计月度奖金发放情况', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-09 09:52:13', '2026-01-09 10:24:54', NULL, '2026-01-09 10:24:54', NULL);
INSERT INTO `reports` VALUES ('1YAhd76G3B376Itj', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 9940, '[{\"员工ID\":\"5B3OF8cpsVIyPUDr\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"xhQbxOYOjCck3lFI\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"4S0AcqCTtddHBRRF\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dDBn9fGohVDpn8ou\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1fLcLgLfX8X1McmK\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1QZC9ZBvJUGmQsYW\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2522.24,\"绩效奖金\":0,\"总奖金\":2522.24,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"SEZU6i8X6eibaa8D\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"djyXvATz3naKO4Z9\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"snxuBWDUaWdINQPp\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2173.33,\"绩效奖金\":0,\"总奖金\":2173.33,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"0aa4a034-f676-4f7a-a91d-c33593558d6f\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"GSlbTvB78NZGTnkC\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"emp_admin_001\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"VU9LFcUfr1dO11Kz\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2174.74,\"绩效奖金\":0,\"总奖金\":2174.74,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"M7qF7Od1EeeVi180\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"AEj02DNLHOssk29p\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dYQ6jmlhgpNLpt7u\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"N0Q3uA6XXmErvFyr\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"JB4Z9xA5a9Af41h4\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"UA1Ub1ppCOQirMQN\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2285.88,\"绩效奖金\":0,\"总奖金\":2285.88,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"V1KCN40qYrkSYE8g\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"yBTKqGWMdKg9IMLS\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2319.65,\"绩效奖金\":0,\"总奖金\":2319.65,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ebAPESo4mdhpHCHi\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"hGVyJqRpgVuah4UP\",\"员工姓名\":\"未知\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"gy5xcfa86cFEz5wR\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"96b53f9e-eab5-4133-9f93-47cb640b277a\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"CBfK070SlZeqWuBJ\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"HVIqlzEXuWgLWJ97\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ft2QPHYNGvEGS94O\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"zCUP0ivcv5z0g760\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"WsyuiWSnQcNIs2yl\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"L2tJlIFHpZAPVSHu\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"b0pCjq6NiNitrX64\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"cf8f2265-89fc-408f-87d7-d5c407d8e650\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 18:10:48', '2025-11-26 18:13:02', '2025-11-26 18:10:47', '2025-11-26 18:13:01', NULL);
INSERT INTO `reports` VALUES ('6ahnKyFfFcVGlhHG', '月度奖金汇总_2026-01-09', 'bonus', '按部门统计月度奖金发放情况', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-09 10:21:40', '2026-01-09 10:24:50', NULL, '2026-01-09 10:24:50', NULL);
INSERT INTO `reports` VALUES ('7ThKRAA6QE0KYYfm', '奖金分布统计_2025-11-28', 'statistics', '奖金分布区间和统计分析', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 344, '[{\"指标名称\":\"员工总数\",\"数值\":33,\"单位\":\"人\"},{\"指标名称\":\"部门总数\",\"数值\":10,\"单位\":\"个\"},{\"指标名称\":\"奖金池总数\",\"数值\":1,\"单位\":\"个\"},{\"指标名称\":\"总奖金金额\",\"数值\":71250,\"单位\":\"元\"},{\"指标名称\":\"人均奖金\",\"数值\":2159,\"单位\":\"元\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 09:55:11', '2025-11-28 10:00:36', '2025-11-28 09:55:10', '2025-11-28 10:00:35', NULL);
INSERT INTO `reports` VALUES ('8fVsoBeHZynS61Re', '奖金分布统计_2026-01-09', 'statistics', '奖金分布区间和统计分析', '[\"2026-01\", \"2026-01\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'completed', 1492, '[{\"奖金区间\":\"0-1万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":0,\"最大值\":10000},{\"奖金区间\":\"1-2万\",\"人数\":11,\"占比\":\"78.57%\",\"最小值\":10000,\"最大值\":20000},{\"奖金区间\":\"2-3万\",\"人数\":2,\"占比\":\"14.29%\",\"最小值\":20000,\"最大值\":30000},{\"奖金区间\":\"3-4万\",\"人数\":1,\"占比\":\"7.14%\",\"最小值\":30000,\"最大值\":40000},{\"奖金区间\":\"4-5万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":40000,\"最大值\":50000},{\"奖金区间\":\"5-10万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":50000,\"最大值\":100000},{\"奖金区间\":\"10万以上\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":100000,\"最大值\":\"无上限\"},{\"奖金区间\":\"--- 统计汇总 ---\",\"人数\":\"\",\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"总人数\",\"人数\":14,\"占比\":\"100%\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"平均奖金\",\"人数\":20357,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"中位数\",\"人数\":19803,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最高奖金\",\"人数\":30992,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最低奖金\",\"人数\":13650,\"占比\":\"\",\"最小值\":\"\",\"最大값\":\"\"}]', 'admin_user', 'admin', '2026-01-09 10:29:09', '2026-01-09 10:29:08', '2026-01-09 10:29:08', NULL, NULL);
INSERT INTO `reports` VALUES ('AxXuQTetGKllLx3M', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'completed', 4272, '[{\"员工ID\":\"4Yc3pjFRO7SACMSC\",\"员工姓名\":\"刘静\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":30992.16,\"绩效奖金\":0,\"总奖金\":30992.16,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"FZOpTvVEQ0NWPs1a\",\"员工姓名\":\"李风肖\",\"部门\":\"商务部\",\"岗位\":\"财务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"j46LEwS76rO6rSi7\",\"员工姓名\":\"刘嘉兴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"JGDxmyz6YvhgVXzm\",\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"产品经理\",\"基础奖金\":20498.72,\"绩效奖金\":0,\"总奖金\":20498.72,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"BqPRlZFYwwG376AZ\",\"员工姓名\":\"罗朝文\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"rRaokmUmAVXtkaRu\",\"员工姓名\":\"李磊\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"IdfqHfaqF25MD78C\",\"员工姓名\":\"董乃坤\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"Zf2TO8nUll7qk2b8\",\"员工姓名\":\"王守琴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"xxrgyt4dDrY0wYZs\",\"员工姓名\":\"任聪聪\",\"部门\":\"技术部\",\"岗位\":\"商务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"5NQDb4fAifAEuuK5\",\"员工姓名\":\"康纪兰\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"0s4u0CI64MgvYpM4\",\"员工姓名\":\"笪莱利\",\"部门\":\"运营部\",\"岗位\":\"部门经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"OuM2daatV8gWJpiI\",\"员工姓名\":\"池小龙\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"D3fZif5G61ZHTexI\",\"员工姓名\":\"杨盛海\",\"部门\":\"产品部\",\"岗位\":\"开发工程师\",\"基础奖金\":13649.98,\"绩效奖金\":0,\"总奖金\":13649.98,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"},{\"员工ID\":\"emp_hr001\",\"员工姓名\":\"王人事\",\"部门\":\"综合管理部\",\"岗位\":\"部门经理\",\"基础奖金\":21827.63,\"绩效奖金\":0,\"总奖金\":21827.63,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 16:49:29', '2026-01-09 10:24:59', '2026-01-09 10:24:59', '2025-11-26 00:00:00', NULL);
INSERT INTO `reports` VALUES ('b48JyeyEeBhZZL8B', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 16:57:38', '2025-11-26 17:00:21', NULL, '2025-11-26 00:00:00', NULL);
INSERT INTO `reports` VALUES ('BStkzUg81wAlPzL2', '奖金分布统计_2025-11-28', 'statistics', '奖金分布区间和统计分析', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 1484, '[{\"奖金区间\":\"0-1万\",\"人数\":33,\"占比\":\"100.00%\",\"最小值\":0,\"最大值\":10000},{\"奖金区间\":\"1-2万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":10000,\"最大值\":20000},{\"奖金区间\":\"2-3万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":20000,\"最大值\":30000},{\"奖金区间\":\"3-4万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":30000,\"最大值\":40000},{\"奖金区间\":\"4-5万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":40000,\"最大值\":50000},{\"奖金区间\":\"5-10万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":50000,\"最大值\":100000},{\"奖金区间\":\"10万以上\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":100000,\"最大值\":\"无上限\"},{\"奖金区间\":\"--- 统计汇总 ---\",\"人数\":\"\",\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"总人数\",\"人数\":33,\"占比\":\"100%\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"平均奖金\",\"人数\":2159,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"中位数\",\"人数\":2156,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最高奖金\",\"人数\":2522,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最低奖金\",\"人数\":1898,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:06:02', '2025-11-28 10:08:00', '2025-11-28 10:06:01', '2025-11-28 10:08:00', NULL);
INSERT INTO `reports` VALUES ('CUW123jvCdCreYWz', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 4, '[]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 17:56:20', '2025-11-26 17:58:12', '2025-11-26 17:56:20', '2025-11-26 17:58:11', NULL);
INSERT INTO `reports` VALUES ('ENkKjj6ZcIKZWsOu', '奖金分布统计_2025-11-28', 'statistics', '奖金分布区间和统计分析', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 1484, '[{\"奖金区间\":\"0-1万\",\"人数\":33,\"占比\":\"100.00%\",\"最小值\":0,\"最大值\":10000},{\"奖金区间\":\"1-2万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":10000,\"最大值\":20000},{\"奖金区间\":\"2-3万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":20000,\"最大值\":30000},{\"奖金区间\":\"3-4万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":30000,\"最大值\":40000},{\"奖金区间\":\"4-5万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":40000,\"最大值\":50000},{\"奖金区间\":\"5-10万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":50000,\"最大值\":100000},{\"奖金区间\":\"10万以上\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":100000,\"最大值\":\"无上限\"},{\"奖金区间\":\"--- 统计汇总 ---\",\"人数\":\"\",\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"总人数\",\"人数\":33,\"占比\":\"100%\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"平均奖金\",\"人数\":2159,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"中位数\",\"人数\":2156,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最高奖金\",\"人数\":2522,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最低奖金\",\"人数\":1898,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:17:28', '2026-01-08 23:02:36', '2025-11-28 10:17:27', '2026-01-08 23:02:36', NULL);
INSERT INTO `reports` VALUES ('EWFQwju5PMS2QHD0', '月度奖金汇总_2026-01-09', 'bonus', '按部门统计月度奖金发放情况', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-09 10:09:41', '2026-01-09 10:24:52', NULL, '2026-01-09 10:24:51', NULL);
INSERT INTO `reports` VALUES ('fdVB8NY4riEeFpDc', '绩效分析报告_2025-11-28', 'statistics', '员工绩效评估和分析报告', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 344, '[{\"指标名称\":\"员工总数\",\"数值\":33,\"单位\":\"人\"},{\"指标名称\":\"部门总数\",\"数值\":10,\"单位\":\"个\"},{\"指标名称\":\"奖金池总数\",\"数值\":1,\"单位\":\"个\"},{\"指标名称\":\"总奖金金额\",\"数值\":71250,\"单位\":\"元\"},{\"指标名称\":\"人均奖金\",\"数值\":2159,\"单位\":\"元\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 09:54:51', '2025-11-28 10:00:39', '2025-11-28 09:54:50', '2025-11-28 10:00:38', NULL);
INSERT INTO `reports` VALUES ('gOEjeoCCa77WpxV0', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 17:00:21', '2025-11-26 17:01:45', NULL, '2025-11-26 00:00:00', NULL);
INSERT INTO `reports` VALUES ('hfw533FVm0y7OX55', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 16:23:22', '2025-11-26 16:49:27', NULL, '2025-11-26 00:00:00', NULL);
INSERT INTO `reports` VALUES ('jR47lEnTRhApI4zo', '员工奖金明细_2026-01-09', 'bonus', '详细的员工奖金计算明细', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"baseAmount\", \"performanceBonus\", \"totalBonus\"]', '{}', 'excel', 'completed', 4272, '[{\"员工ID\":\"4Yc3pjFRO7SACMSC\",\"员工姓名\":\"刘静\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":30992.16,\"绩效奖金\":0,\"总奖金\":30992.16,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"FZOpTvVEQ0NWPs1a\",\"员工姓名\":\"李风肖\",\"部门\":\"商务部\",\"岗位\":\"财务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"j46LEwS76rO6rSi7\",\"员工姓名\":\"刘嘉兴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"JGDxmyz6YvhgVXzm\",\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"产品经理\",\"基础奖金\":20498.72,\"绩效奖金\":0,\"总奖金\":20498.72,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"BqPRlZFYwwG376AZ\",\"员工姓名\":\"罗朝文\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"rRaokmUmAVXtkaRu\",\"员工姓名\":\"李磊\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"IdfqHfaqF25MD78C\",\"员工姓名\":\"董乃坤\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"Zf2TO8nUll7qk2b8\",\"员工姓名\":\"王守琴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"xxrgyt4dDrY0wYZs\",\"员工姓名\":\"任聪聪\",\"部门\":\"技术部\",\"岗位\":\"商务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"5NQDb4fAifAEuuK5\",\"员工姓名\":\"康纪兰\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"0s4u0CI64MgvYpM4\",\"员工姓名\":\"笪莱利\",\"部门\":\"运营部\",\"岗位\":\"部门经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"OuM2daatV8gWJpiI\",\"员工姓名\":\"池小龙\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"D3fZif5G61ZHTexI\",\"员工姓名\":\"杨盛海\",\"部门\":\"产品部\",\"岗位\":\"开发工程师\",\"基础奖金\":13649.98,\"绩效奖金\":0,\"总奖金\":13649.98,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"},{\"员工ID\":\"emp_hr001\",\"员工姓名\":\"王人事\",\"部门\":\"综合管理部\",\"岗位\":\"部门经理\",\"基础奖金\":21827.63,\"绩效奖金\":0,\"总奖金\":21827.63,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"}]', 'admin_user', 'admin', '2026-01-09 10:28:17', '2026-01-09 10:28:17', '2026-01-09 10:28:17', NULL, NULL);
INSERT INTO `reports` VALUES ('KD8Yp6x1rQ6c2CK2', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 4, '[]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 17:22:33', '2025-11-26 17:53:23', '2025-11-26 17:22:32', '2025-11-26 17:53:22', NULL);
INSERT INTO `reports` VALUES ('KIjzVCozFOjxj8Kr', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 9940, '[{\"员工ID\":\"5B3OF8cpsVIyPUDr\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"xhQbxOYOjCck3lFI\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"4S0AcqCTtddHBRRF\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dDBn9fGohVDpn8ou\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1fLcLgLfX8X1McmK\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1QZC9ZBvJUGmQsYW\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2522.24,\"绩效奖金\":0,\"总奖金\":2522.24,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"SEZU6i8X6eibaa8D\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"djyXvATz3naKO4Z9\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"snxuBWDUaWdINQPp\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2173.33,\"绩效奖金\":0,\"总奖金\":2173.33,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"0aa4a034-f676-4f7a-a91d-c33593558d6f\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"GSlbTvB78NZGTnkC\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"emp_admin_001\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"VU9LFcUfr1dO11Kz\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2174.74,\"绩效奖金\":0,\"总奖金\":2174.74,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"M7qF7Od1EeeVi180\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"AEj02DNLHOssk29p\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dYQ6jmlhgpNLpt7u\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"N0Q3uA6XXmErvFyr\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"JB4Z9xA5a9Af41h4\",\"员工姓名\":\"未知\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"UA1Ub1ppCOQirMQN\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2285.88,\"绩效奖金\":0,\"总奖金\":2285.88,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"V1KCN40qYrkSYE8g\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"yBTKqGWMdKg9IMLS\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2319.65,\"绩效奖金\":0,\"总奖金\":2319.65,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ebAPESo4mdhpHCHi\",\"员工姓名\":\"未知\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"hGVyJqRpgVuah4UP\",\"员工姓名\":\"未知\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"gy5xcfa86cFEz5wR\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"96b53f9e-eab5-4133-9f93-47cb640b277a\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"CBfK070SlZeqWuBJ\",\"员工姓名\":\"未知\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"HVIqlzEXuWgLWJ97\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ft2QPHYNGvEGS94O\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"zCUP0ivcv5z0g760\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"WsyuiWSnQcNIs2yl\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"L2tJlIFHpZAPVSHu\",\"员工姓名\":\"未知\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"b0pCjq6NiNitrX64\",\"员工姓名\":\"未知\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"cf8f2265-89fc-408f-87d7-d5c407d8e650\",\"员工姓名\":\"未知\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 18:13:03', '2025-11-26 18:15:14', '2025-11-26 18:13:02', '2025-11-26 18:15:14', NULL);
INSERT INTO `reports` VALUES ('kjjFxyg23tdAeljB', '月度奖金汇总_2026-01-09', 'bonus', '按部门统计月度奖金发放情况', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-09 09:57:38', '2026-01-09 10:24:53', NULL, '2026-01-09 10:24:53', NULL);
INSERT INTO `reports` VALUES ('lHykpjzrpOHByHB6', '奖金分布统计_2025-11-28', 'statistics', '奖金分布区间和统计分析', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 1484, '[{\"奖金区间\":\"0-1万\",\"人数\":33,\"占比\":\"100.00%\",\"最小值\":0,\"最大值\":10000},{\"奖金区间\":\"1-2万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":10000,\"最大值\":20000},{\"奖金区间\":\"2-3万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":20000,\"最大值\":30000},{\"奖金区间\":\"3-4万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":30000,\"最大值\":40000},{\"奖金区间\":\"4-5万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":40000,\"最大值\":50000},{\"奖金区间\":\"5-10万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":50000,\"最大值\":100000},{\"奖金区间\":\"10万以上\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":100000,\"最大值\":\"无上限\"},{\"奖金区间\":\"--- 统计汇总 ---\",\"人数\":\"\",\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"总人数\",\"人数\":33,\"占比\":\"100%\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"平均奖金\",\"人数\":2159,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"中位数\",\"人数\":2156,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最高奖金\",\"人数\":2522,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最低奖金\",\"人数\":1898,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:06:02', '2025-11-28 10:08:02', '2025-11-28 10:06:01', '2025-11-28 10:08:01', NULL);
INSERT INTO `reports` VALUES ('O42jYxG73RDopMxc', '员工奖金明细_2026-01-09', 'bonus', '详细的员工奖金计算明细', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"baseAmount\", \"performanceBonus\", \"totalBonus\"]', '{}', 'excel', 'deleted', 0, NULL, 'admin_user', 'admin', '2026-01-09 10:25:00', '2026-01-09 10:29:27', NULL, '2026-01-09 10:29:27', NULL);
INSERT INTO `reports` VALUES ('ppI4tJj9tQDvX8Ri', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 10176, '[{\"员工ID\":\"5B3OF8cpsVIyPUDr\",\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"xhQbxOYOjCck3lFI\",\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"4S0AcqCTtddHBRRF\",\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dDBn9fGohVDpn8ou\",\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1fLcLgLfX8X1McmK\",\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1QZC9ZBvJUGmQsYW\",\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2522.24,\"绩效奖金\":0,\"总奖金\":2522.24,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"SEZU6i8X6eibaa8D\",\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"djyXvATz3naKO4Z9\",\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"snxuBWDUaWdINQPp\",\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2173.33,\"绩效奖金\":0,\"总奖金\":2173.33,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"0aa4a034-f676-4f7a-a91d-c33593558d6f\",\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"GSlbTvB78NZGTnkC\",\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"emp_admin_001\",\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"VU9LFcUfr1dO11Kz\",\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2174.74,\"绩效奖金\":0,\"总奖金\":2174.74,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"M7qF7Od1EeeVi180\",\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"AEj02DNLHOssk29p\",\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dYQ6jmlhgpNLpt7u\",\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"N0Q3uA6XXmErvFyr\",\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"JB4Z9xA5a9Af41h4\",\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"UA1Ub1ppCOQirMQN\",\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2285.88,\"绩效奖金\":0,\"总奖金\":2285.88,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"V1KCN40qYrkSYE8g\",\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"yBTKqGWMdKg9IMLS\",\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2319.65,\"绩效奖金\":0,\"总奖金\":2319.65,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ebAPESo4mdhpHCHi\",\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"hGVyJqRpgVuah4UP\",\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"gy5xcfa86cFEz5wR\",\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"96b53f9e-eab5-4133-9f93-47cb640b277a\",\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"CBfK070SlZeqWuBJ\",\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"HVIqlzEXuWgLWJ97\",\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ft2QPHYNGvEGS94O\",\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"zCUP0ivcv5z0g760\",\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"WsyuiWSnQcNIs2yl\",\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"L2tJlIFHpZAPVSHu\",\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"b0pCjq6NiNitrX64\",\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"cf8f2265-89fc-408f-87d7-d5c407d8e650\",\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 18:15:15', '2026-01-08 23:02:35', '2025-11-26 18:15:15', '2026-01-08 23:02:34', NULL);
INSERT INTO `reports` VALUES ('pQOhxpdNFUDFSEUr', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 4, '[]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 17:49:34', '2025-11-26 17:56:19', '2025-11-26 17:49:34', '2025-11-26 17:56:19', NULL);
INSERT INTO `reports` VALUES ('Q2Wmf1bUZFECSCRD', '奖金分布统计_2025-11-28', 'statistics', '奖金分布区间和统计分析', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 1484, '[{\"奖金区间\":\"0-1万\",\"人数\":33,\"占比\":\"100.00%\",\"最小值\":0,\"最大值\":10000},{\"奖金区间\":\"1-2万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":10000,\"最大值\":20000},{\"奖金区间\":\"2-3万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":20000,\"最大值\":30000},{\"奖金区间\":\"3-4万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":30000,\"最大值\":40000},{\"奖金区间\":\"4-5万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":40000,\"最大值\":50000},{\"奖金区间\":\"5-10万\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":50000,\"最大值\":100000},{\"奖金区间\":\"10万以上\",\"人数\":0,\"占比\":\"0.00%\",\"最小值\":100000,\"最大值\":\"无上限\"},{\"奖金区间\":\"--- 统计汇总 ---\",\"人数\":\"\",\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"总人数\",\"人数\":33,\"占比\":\"100%\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"平均奖金\",\"人数\":2159,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"中位数\",\"人数\":2156,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最高奖金\",\"人数\":2522,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"},{\"奖金区间\":\"最低奖金\",\"人数\":1898,\"占比\":\"\",\"最小值\":\"\",\"最大值\":\"\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:00:41', '2025-11-28 10:05:59', '2025-11-28 10:00:40', '2025-11-28 10:05:58', NULL);
INSERT INTO `reports` VALUES ('QqTfeiyAsKsAtNJf', '员工奖金明细_2025-11-28', 'bonus', '详细的员工奖金计算明细', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"baseAmount\", \"performanceBonus\", \"totalBonus\"]', '{}', 'excel', 'deleted', 10364, '[{\"员工ID\":\"5B3OF8cpsVIyPUDr\",\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"高级实施顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"xhQbxOYOjCck3lFI\",\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"售前顾问\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"4S0AcqCTtddHBRRF\",\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"初级实施顾问\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dDBn9fGohVDpn8ou\",\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"高级实施顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1fLcLgLfX8X1McmK\",\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"实施总监\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"1QZC9ZBvJUGmQsYW\",\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":2522.24,\"绩效奖金\":0,\"总奖金\":2522.24,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"SEZU6i8X6eibaa8D\",\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"产品总监\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"djyXvATz3naKO4Z9\",\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"产品专员\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"snxuBWDUaWdINQPp\",\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"财务经理\",\"基础奖金\":2173.33,\"绩效奖金\":0,\"总奖金\":2173.33,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"0aa4a034-f676-4f7a-a91d-c33593558d6f\",\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"GSlbTvB78NZGTnkC\",\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"emp_admin_001\",\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"VU9LFcUfr1dO11Kz\",\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"商务经理\",\"基础奖金\":2174.74,\"绩效奖金\":0,\"总奖金\":2174.74,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"M7qF7Od1EeeVi180\",\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"AEj02DNLHOssk29p\",\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"实施顾问\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"dYQ6jmlhgpNLpt7u\",\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"N0Q3uA6XXmErvFyr\",\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"技术支持专员\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"JB4Z9xA5a9Af41h4\",\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"人事行政专员\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"UA1Ub1ppCOQirMQN\",\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"高级产品经理\",\"基础奖金\":2285.88,\"绩效奖金\":0,\"总奖金\":2285.88,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"V1KCN40qYrkSYE8g\",\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"高级实施顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"yBTKqGWMdKg9IMLS\",\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"部门经理\",\"基础奖金\":2319.65,\"绩效奖金\":0,\"总奖金\":2319.65,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ebAPESo4mdhpHCHi\",\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"实施顾问\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"hGVyJqRpgVuah4UP\",\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"高级开发工程师\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"gy5xcfa86cFEz5wR\",\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"高级售前顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"96b53f9e-eab5-4133-9f93-47cb640b277a\",\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"高级售前顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"CBfK070SlZeqWuBJ\",\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"产品经理\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"HVIqlzEXuWgLWJ97\",\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"实施顾问\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"ft2QPHYNGvEGS94O\",\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"技术支持专员\",\"基础奖金\":2027.48,\"绩效奖金\":0,\"总奖金\":2027.48,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工ID\":\"zCUP0ivcv5z0g760\",\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"市场工程总监\",\"基础奖金\":2443.46,\"绩效奖金\":0,\"总奖金\":2443.46,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"WsyuiWSnQcNIs2yl\",\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"高级实施顾问\",\"基础奖金\":2156.45,\"绩效奖金\":0,\"总奖金\":2156.45,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"L2tJlIFHpZAPVSHu\",\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"初级实施顾问\",\"基础奖金\":1897.58,\"绩效奖金\":0,\"总奖金\":1897.58,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"b0pCjq6NiNitrX64\",\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"市场专员\",\"基础奖金\":2027.01,\"绩效奖金\":0,\"总奖金\":2027.01,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工ID\":\"cf8f2265-89fc-408f-87d7-d5c407d8e650\",\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"项目经理\",\"基础奖金\":2213.66,\"绩效奖金\":0,\"总奖金\":2213.66,\"期间\":\"2025Q1\",\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 09:54:29', '2026-01-08 23:02:33', '2025-11-28 09:54:29', '2026-01-08 23:02:32', NULL);
INSERT INTO `reports` VALUES ('RlVvTKUzIqoacMdf', '绩效分析报告_2025-11-28', 'statistics', '员工绩效评估和分析报告', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 9158, '[{\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":450,\"绩效表现得分\":0,\"综合得分\":537.83,\"最终奖金\":2522,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.43,\"最终奖金\":2173,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.32,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.73,\"最终奖金\":2175,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":408,\"绩效表现得分\":0,\"综合得分\":487.43,\"最终奖金\":2286,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":414,\"绩效表现得分\":0,\"综合得分\":494.63,\"最终奖金\":2320,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:17:26', '2025-11-28 10:59:10', '2025-11-28 10:17:26', '2025-11-28 10:59:09', NULL);
INSERT INTO `reports` VALUES ('SgEy5QsBzHVEdfS2', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 0, NULL, 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 16:56:25', '2025-11-26 16:57:37', NULL, '2025-11-26 00:00:00', NULL);
INSERT INTO `reports` VALUES ('t9LAPo2Y2e6MOEtH', '月度奖金汇总_2026-01-09', 'bonus', '按部门统计月度奖金发放情况', '[\"2026-01\", \"2026-01\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'completed', 4272, '[{\"员工ID\":\"4Yc3pjFRO7SACMSC\",\"员工姓名\":\"刘静\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":30992.16,\"绩效奖金\":0,\"总奖金\":30992.16,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"FZOpTvVEQ0NWPs1a\",\"员工姓名\":\"李风肖\",\"部门\":\"商务部\",\"岗位\":\"财务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"j46LEwS76rO6rSi7\",\"员工姓名\":\"刘嘉兴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"JGDxmyz6YvhgVXzm\",\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"产品经理\",\"基础奖金\":20498.72,\"绩效奖金\":0,\"总奖金\":20498.72,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"BqPRlZFYwwG376AZ\",\"员工姓名\":\"罗朝文\",\"部门\":\"综合管理部\",\"岗位\":\"总经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"rRaokmUmAVXtkaRu\",\"员工姓名\":\"李磊\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"IdfqHfaqF25MD78C\",\"员工姓名\":\"董乃坤\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"Zf2TO8nUll7qk2b8\",\"员工姓名\":\"王守琴\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"xxrgyt4dDrY0wYZs\",\"员工姓名\":\"任聪聪\",\"部门\":\"技术部\",\"岗位\":\"商务经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"5NQDb4fAifAEuuK5\",\"员工姓名\":\"康纪兰\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"0s4u0CI64MgvYpM4\",\"员工姓名\":\"笪莱利\",\"部门\":\"运营部\",\"岗位\":\"部门经理\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"OuM2daatV8gWJpiI\",\"员工姓名\":\"池小龙\",\"部门\":\"技术部\",\"岗位\":\"开发工程师\",\"基础奖金\":19803.15,\"绩效奖金\":0,\"总奖金\":19803.15,\"期间\":\"2025Q4\",\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工ID\":\"D3fZif5G61ZHTexI\",\"员工姓名\":\"杨盛海\",\"部门\":\"产品部\",\"岗位\":\"开发工程师\",\"基础奖金\":13649.98,\"绩效奖金\":0,\"总奖金\":13649.98,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"},{\"员工ID\":\"emp_hr001\",\"员工姓名\":\"王人事\",\"部门\":\"综合管理部\",\"岗位\":\"部门经理\",\"基础奖金\":21827.63,\"绩效奖金\":0,\"总奖金\":21827.63,\"期间\":\"2025Q4\",\"计算日期\":\"2026-01-08T11:39:56.000Z\"}]', 'admin_user', 'admin', '2026-01-09 10:24:23', '2026-01-09 10:24:22', '2026-01-09 10:24:22', NULL, NULL);
INSERT INTO `reports` VALUES ('Unw4eVMrBSe3Et7v', '绩效分析报告_2025-11-28', 'statistics', '员工绩效评估和分析报告', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 9224, '[{\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":35,\"综合得分\":494.83,\"最终奖金\":2078,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":50,\"综合得分\":482.23,\"最终奖金\":2026,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":35,\"综合得分\":439.63,\"最终奖金\":1847,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":35,\"综合得分\":494.83,\"最终奖金\":2078,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":50,\"综合得分\":571.03,\"最终奖金\":2399,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":450,\"绩效表现得分\":50,\"综合得分\":587.83,\"最终奖金\":2469,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":65,\"综合得分\":586.03,\"最终奖金\":2462,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":65,\"综合得分\":497.23,\"最终奖金\":2089,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":388,\"绩效表现得分\":35,\"综合得分\":498.43,\"最终奖金\":2094,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":65,\"综合得分\":537.03,\"最终奖金\":2256,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":65,\"综合得分\":537.03,\"最终奖金\":2256,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":65,\"综合得分\":537.03,\"最终奖金\":2256,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.32,\"岗位价值得分\":388,\"绩效表现得分\":80,\"综合得分\":543.73,\"最终奖金\":2284,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":35,\"综合得分\":507.03,\"最终奖金\":2130,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":35,\"综合得分\":467.23,\"最终奖金\":1963,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":35,\"综合得分\":507.03,\"最终奖金\":2130,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":50,\"综合得分\":482.33,\"最终奖金\":2026,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":50,\"综合得分\":482.23,\"最终奖金\":2026,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":408,\"绩效表现得分\":35,\"综合得分\":522.43,\"最终奖金\":2194,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":80,\"综合得分\":539.83,\"最终奖金\":2267,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":414,\"绩效表现得分\":50,\"综合得分\":544.63,\"最终奖金\":2288,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":65,\"综合得分\":497.23,\"最终奖金\":2089,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":65,\"综合得分\":497.33,\"最终奖金\":2089,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":35,\"综合得分\":494.83,\"最终奖金\":2078,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":50,\"综合得分\":509.83,\"最终奖金\":2141,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":80,\"综合得分\":539.83,\"最终奖金\":2267,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":50,\"综合得分\":482.23,\"最终奖金\":2026,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":50,\"综合得分\":482.33,\"最终奖金\":2026,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":50,\"综合得分\":571.03,\"最终奖金\":2399,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":80,\"综合得分\":539.83,\"最终奖金\":2267,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":50,\"综合得分\":454.63,\"最终奖金\":1910,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":80,\"综合得分\":512.23,\"最终奖金\":2152,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":50,\"综合得分\":522.03,\"最终奖金\":2193,\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:59:11', '2026-01-08 19:38:28', '2025-11-28 10:59:11', '2026-01-08 19:38:28', NULL);
INSERT INTO `reports` VALUES ('xkQiHTxYpX9XutAA', '绩效分析报告_2025-11-28', 'statistics', '员工绩效评估和分析报告', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 9158, '[{\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":450,\"绩效表现得分\":0,\"综合得分\":537.83,\"最终奖金\":2522,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.43,\"最终奖金\":2173,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.32,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.73,\"最终奖金\":2175,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":408,\"绩效表现得分\":0,\"综合得分\":487.43,\"最终奖金\":2286,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":414,\"绩效表现得分\":0,\"综合得分\":494.63,\"最终奖金\":2320,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:08:03', '2025-11-28 10:17:25', '2025-11-28 10:08:03', '2025-11-28 10:17:25', NULL);
INSERT INTO `reports` VALUES ('XqJ1WM5zjSpxWFwf', '绩效分析报告_2026-01-09', 'statistics', '员工绩效评估和分析报告', '[\"2026-01\", \"2026-01\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'completed', 3730, '[{\"员工姓名\":\"刘静\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":100,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":75.29,\"最终奖金\":30992,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"李风肖\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"刘嘉兴\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":10,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":49.8,\"最终奖金\":20499,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"罗朝文\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"李磊\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"董乃坤\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"王守琴\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"任聪聪\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"康纪兰\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"笪莱利\",\"部门\":\"运营部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"池小龙\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":5,\"岗位价值得分\":70,\"绩效表现得分\":85,\"综合得分\":48.11,\"最终奖金\":19803,\"计算日期\":\"2025-12-30T07:52:46.000Z\"},{\"员工姓名\":\"杨盛海\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":0,\"绩效表现得分\":50,\"综合得分\":33.16,\"最终奖金\":13650,\"计算日期\":\"2026-01-08T11:39:56.000Z\"},{\"员工姓名\":\"王人事\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":414,\"绩效表现得分\":50,\"综合得分\":53.03,\"最终奖金\":21828,\"计算日期\":\"2026-01-08T11:39:56.000Z\"}]', 'admin_user', 'admin', '2026-01-09 10:28:56', '2026-01-09 10:28:55', '2026-01-09 10:28:55', NULL, NULL);
INSERT INTO `reports` VALUES ('Yk8d4DChUDwVPxzh', '绩效分析报告_2025-11-28', 'statistics', '员工绩效评估和分析报告', '[\"2025-11\", \"2025-11\"]', '[\"metric\", \"value\", \"unit\"]', '{}', 'excel', 'deleted', 9158, '[{\"员工姓名\":\"陈高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"尤售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"周初级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘高级实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张实施总监\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张总经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":450,\"绩效表现得分\":0,\"综合得分\":537.83,\"最终奖金\":2522,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"李产品总监\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"刘产品专员\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"施财务经理\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.43,\"最终奖金\":2173,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"李项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"系统管理员\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吕商务经理\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.32,\"岗位价值得分\":388,\"绩效表现得分\":0,\"综合得分\":463.73,\"最终奖金\":2175,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王项目经理\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"赵实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"郑项目经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"何技术支持专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"张人事行政专员\",\"部门\":\"综合管理部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王高级产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":408,\"绩效表现得分\":0,\"综合得分\":487.43,\"最终奖金\":2286,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"冯高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"吴部门经理\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":414,\"绩效表现得分\":0,\"综合得分\":494.63,\"最终奖金\":2320,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"孙实施顾问\",\"部门\":\"项目实施二部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"测试员工2\",\"部门\":\"技术部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"秦高级售前顾问\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"普通员工-李四\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"陈产品经理\",\"部门\":\"产品部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"韩实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"王五\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.24,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.33,\"最终奖金\":2027,\"计算日期\":\"2025-11-21T08:19:35.000Z\"},{\"员工姓名\":\"朱市场工程总监\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":436,\"绩效表现得分\":0,\"综合得分\":521.03,\"最终奖金\":2443,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"卫高级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":385,\"绩效表现得分\":0,\"综合得分\":459.83,\"最终奖金\":2156,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"杨初级实施顾问\",\"部门\":\"项目实施一部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":339,\"绩效表现得分\":0,\"综合得分\":404.63,\"最终奖金\":1898,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"许市场专员\",\"部门\":\"市场工程部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.2,\"岗位价值得分\":362,\"绩效表现得分\":0,\"综合得分\":432.23,\"最终奖金\":2027,\"计算日期\":\"2025-11-14T03:28:49.000Z\"},{\"员工姓名\":\"项目经理-张三\",\"部门\":\"商务部\",\"岗位\":\"未知\",\"利润贡献度得分\":0.28,\"岗位价值得分\":395,\"绩效表现得分\":0,\"综合得分\":472.03,\"最终奖金\":2214,\"计算日期\":\"2025-11-14T03:28:49.000Z\"}]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-28 10:00:40', '2025-11-28 10:06:00', '2025-11-28 10:00:39', '2025-11-28 10:06:00', NULL);
INSERT INTO `reports` VALUES ('Z5ATjJP0H0SgWHsR', '月度奖金汇总_2025-11-26', 'bonus', '按部门统计月度奖金发放情况', '[\"2025-11\", \"2025-11\"]', '[\"employeeName\", \"department\", \"totalBonus\", \"period\"]', '{\"period\": \"current_month\"}', 'excel', 'deleted', 4, '[]', 'DZaqxd5FxFvLIiFO', 'admin', '2025-11-26 17:58:13', '2025-11-26 17:58:34', '2025-11-26 17:58:13', '2025-11-26 17:58:34', NULL);

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
-- Records of role_menus
-- ----------------------------
INSERT INTO `role_menus` VALUES (78, '3cUruZzYPErB074T', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (79, '3cUruZzYPErB074T', 'menu_100', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (80, '3cUruZzYPErB074T', 'menu_101', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (81, '3cUruZzYPErB074T', 'menu_102', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (82, '3cUruZzYPErB074T', 'menu_103', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (83, '3cUruZzYPErB074T', 'menu_104', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (84, '3cUruZzYPErB074T', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (85, '3cUruZzYPErB074T', 'menu_201', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (86, '3cUruZzYPErB074T', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (87, '3cUruZzYPErB074T', 'menu_500', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (88, '3cUruZzYPErB074T', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (89, '3cUruZzYPErB074T', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (90, '3cUruZzYPErB074T', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (91, 'business_expert_001', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (92, 'business_expert_001', 'menu_100', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (93, 'business_expert_001', 'menu_101', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (94, 'business_expert_001', 'menu_102', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (95, 'business_expert_001', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (96, 'business_expert_001', 'menu_201', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (97, 'business_expert_001', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (98, 'business_expert_001', 'menu_500', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (99, 'business_expert_001', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (100, 'business_expert_001', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (101, 'business_expert_001', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (102, 'collab_admin_001', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (103, 'collab_admin_001', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (104, 'collab_admin_001', 'menu_201', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (105, 'collab_admin_001', 'menu_202', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (106, 'collab_admin_001', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (107, 'collab_admin_001', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (108, 'collab_admin_001', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (109, 'collab_admin_001', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (126, 'eQe0vpMd3emXERl9', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (127, 'eQe0vpMd3emXERl9', 'menu_100', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (128, 'eQe0vpMd3emXERl9', 'menu_101', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (129, 'eQe0vpMd3emXERl9', 'menu_102', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (130, 'eQe0vpMd3emXERl9', 'menu_103', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (131, 'eQe0vpMd3emXERl9', 'menu_104', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (132, 'eQe0vpMd3emXERl9', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (133, 'eQe0vpMd3emXERl9', 'menu_201', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (134, 'eQe0vpMd3emXERl9', 'menu_202', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (136, 'eQe0vpMd3emXERl9', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (137, 'eQe0vpMd3emXERl9', 'menu_207', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (138, 'eQe0vpMd3emXERl9', 'menu_400', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (139, 'eQe0vpMd3emXERl9', 'menu_401', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (140, 'eQe0vpMd3emXERl9', 'menu_402', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (141, 'eQe0vpMd3emXERl9', 'menu_500', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (142, 'eQe0vpMd3emXERl9', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (143, 'eQe0vpMd3emXERl9', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (144, 'eQe0vpMd3emXERl9', 'menu_602', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (145, 'eQe0vpMd3emXERl9', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (146, 'eQe0vpMd3emXERl9', 'menu_700', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (147, 'eQe0vpMd3emXERl9', 'menu_704', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (170, 'Eln8qiLDJhs73Sc7', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (171, 'Eln8qiLDJhs73Sc7', 'menu_100', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (172, 'Eln8qiLDJhs73Sc7', 'menu_101', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (173, 'Eln8qiLDJhs73Sc7', 'menu_102', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (174, 'Eln8qiLDJhs73Sc7', 'menu_103', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (175, 'Eln8qiLDJhs73Sc7', 'menu_105', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (176, 'Eln8qiLDJhs73Sc7', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (177, 'Eln8qiLDJhs73Sc7', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (178, 'Eln8qiLDJhs73Sc7', 'menu_300', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (179, 'Eln8qiLDJhs73Sc7', 'menu_301', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (180, 'Eln8qiLDJhs73Sc7', 'menu_302', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (181, 'Eln8qiLDJhs73Sc7', 'menu_303', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (182, 'Eln8qiLDJhs73Sc7', 'menu_400', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (183, 'Eln8qiLDJhs73Sc7', 'menu_401', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (184, 'Eln8qiLDJhs73Sc7', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (185, 'Eln8qiLDJhs73Sc7', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (186, 'Eln8qiLDJhs73Sc7', 'menu_602', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (187, 'Eln8qiLDJhs73Sc7', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (210, 'simulation_expert_001', 'menu_1', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (211, 'simulation_expert_001', 'menu_200', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (212, 'simulation_expert_001', 'menu_204', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (213, 'simulation_expert_001', 'menu_402', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (214, 'simulation_expert_001', 'menu_600', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (215, 'simulation_expert_001', 'menu_601', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (216, 'simulation_expert_001', 'menu_603', '2025-12-31 10:02:37');
INSERT INTO `role_menus` VALUES (334, 'QIUgWkY0NMp444Qt', 'menu_1', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (335, 'QIUgWkY0NMp444Qt', 'menu_100', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (336, 'QIUgWkY0NMp444Qt', 'menu_101', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (337, 'QIUgWkY0NMp444Qt', 'menu_102', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (338, 'QIUgWkY0NMp444Qt', 'menu_103', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (339, 'QIUgWkY0NMp444Qt', 'menu_104', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (340, 'QIUgWkY0NMp444Qt', 'menu_105', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (341, 'QIUgWkY0NMp444Qt', 'menu_200', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (342, 'QIUgWkY0NMp444Qt', 'menu_201', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (343, 'QIUgWkY0NMp444Qt', 'menu_202', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (344, 'QIUgWkY0NMp444Qt', 'menu_207', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (345, 'QIUgWkY0NMp444Qt', 'menu_400', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (346, 'QIUgWkY0NMp444Qt', 'menu_402', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (347, 'QIUgWkY0NMp444Qt', 'menu_600', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (348, 'QIUgWkY0NMp444Qt', 'menu_602', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (349, 'QIUgWkY0NMp444Qt', 'menu_603', '2026-01-06 09:29:03');
INSERT INTO `role_menus` VALUES (367, 'CdFv8NCPauLjt7se', 'menu_1', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (368, 'CdFv8NCPauLjt7se', 'menu_100', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (369, 'CdFv8NCPauLjt7se', 'menu_101', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (370, 'CdFv8NCPauLjt7se', 'menu_102', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (371, 'CdFv8NCPauLjt7se', 'menu_103', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (372, 'CdFv8NCPauLjt7se', 'menu_105', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (373, 'CdFv8NCPauLjt7se', 'menu_200', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (374, 'CdFv8NCPauLjt7se', 'menu_201', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (375, 'CdFv8NCPauLjt7se', 'menu_202', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (377, 'CdFv8NCPauLjt7se', 'menu_204', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (378, 'CdFv8NCPauLjt7se', 'menu_205', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (379, 'CdFv8NCPauLjt7se', 'menu_206', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (380, 'CdFv8NCPauLjt7se', 'menu_207', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (381, 'CdFv8NCPauLjt7se', 'menu_300', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (382, 'CdFv8NCPauLjt7se', 'menu_302', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (383, 'CdFv8NCPauLjt7se', 'menu_402', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (384, 'CdFv8NCPauLjt7se', 'menu_600', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (385, 'CdFv8NCPauLjt7se', 'menu_601', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (386, 'CdFv8NCPauLjt7se', 'menu_602', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (387, 'CdFv8NCPauLjt7se', 'menu_603', '2026-01-06 17:03:13');
INSERT INTO `role_menus` VALUES (494, 'vd7p1lxn9lOaRKKJ', 'menu_1', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (495, 'vd7p1lxn9lOaRKKJ', 'menu_100', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (496, 'vd7p1lxn9lOaRKKJ', 'menu_101', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (497, 'vd7p1lxn9lOaRKKJ', 'menu_102', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (498, 'vd7p1lxn9lOaRKKJ', 'menu_103', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (499, 'vd7p1lxn9lOaRKKJ', 'menu_104', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (500, 'vd7p1lxn9lOaRKKJ', 'menu_105', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (501, 'vd7p1lxn9lOaRKKJ', 'menu_200', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (502, 'vd7p1lxn9lOaRKKJ', 'menu_201', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (503, 'vd7p1lxn9lOaRKKJ', 'menu_202', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (504, 'vd7p1lxn9lOaRKKJ', 'menu_204', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (505, 'vd7p1lxn9lOaRKKJ', 'menu_205', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (506, 'vd7p1lxn9lOaRKKJ', 'menu_206', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (507, 'vd7p1lxn9lOaRKKJ', 'menu_207', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (508, 'vd7p1lxn9lOaRKKJ', 'menu_300', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (509, 'vd7p1lxn9lOaRKKJ', 'menu_301', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (510, 'vd7p1lxn9lOaRKKJ', 'menu_302', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (511, 'vd7p1lxn9lOaRKKJ', 'menu_303', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (512, 'vd7p1lxn9lOaRKKJ', 'menu_400', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (513, 'vd7p1lxn9lOaRKKJ', 'menu_401', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (514, 'vd7p1lxn9lOaRKKJ', 'menu_402', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (515, 'vd7p1lxn9lOaRKKJ', 'menu_500', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (516, 'vd7p1lxn9lOaRKKJ', 'menu_1768275650742', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (517, 'vd7p1lxn9lOaRKKJ', 'menu_501', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (518, 'vd7p1lxn9lOaRKKJ', 'menu_600', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (519, 'vd7p1lxn9lOaRKKJ', 'menu_601', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (520, 'vd7p1lxn9lOaRKKJ', 'menu_602', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (521, 'vd7p1lxn9lOaRKKJ', 'menu_603', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (522, 'vd7p1lxn9lOaRKKJ', 'menu_700', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (523, 'vd7p1lxn9lOaRKKJ', 'menu_701', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (524, 'vd7p1lxn9lOaRKKJ', 'menu_702', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (525, 'vd7p1lxn9lOaRKKJ', 'menu_703', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (526, 'vd7p1lxn9lOaRKKJ', 'menu_704', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (527, 'vd7p1lxn9lOaRKKJ', 'menu_705', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (528, 'vd7p1lxn9lOaRKKJ', 'menu_706', '2026-01-13 15:26:45');
INSERT INTO `role_menus` VALUES (553, 'GlpDpQngrkgDMNh2', 'menu_1', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (554, 'GlpDpQngrkgDMNh2', 'menu_100', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (555, 'GlpDpQngrkgDMNh2', 'menu_101', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (556, 'GlpDpQngrkgDMNh2', 'menu_102', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (557, 'GlpDpQngrkgDMNh2', 'menu_103', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (558, 'GlpDpQngrkgDMNh2', 'menu_104', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (559, 'GlpDpQngrkgDMNh2', 'menu_105', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (560, 'GlpDpQngrkgDMNh2', 'menu_200', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (561, 'GlpDpQngrkgDMNh2', 'menu_1768181720541', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (562, 'GlpDpQngrkgDMNh2', 'menu_201', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (563, 'GlpDpQngrkgDMNh2', 'menu_202', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (564, 'GlpDpQngrkgDMNh2', 'menu_204', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (565, 'GlpDpQngrkgDMNh2', 'menu_205', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (566, 'GlpDpQngrkgDMNh2', 'menu_206', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (567, 'GlpDpQngrkgDMNh2', 'menu_207', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (568, 'GlpDpQngrkgDMNh2', 'menu_400', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (569, 'GlpDpQngrkgDMNh2', 'menu_402', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (570, 'GlpDpQngrkgDMNh2', 'menu_600', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (571, 'GlpDpQngrkgDMNh2', 'menu_601', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (572, 'GlpDpQngrkgDMNh2', 'menu_602', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (573, 'GlpDpQngrkgDMNh2', 'menu_603', '2026-01-14 17:29:24');
INSERT INTO `role_menus` VALUES (574, 'Qz8jzlt6I2qitXpw', 'menu_1', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (575, 'Qz8jzlt6I2qitXpw', 'menu_100', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (576, 'Qz8jzlt6I2qitXpw', 'menu_101', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (577, 'Qz8jzlt6I2qitXpw', 'menu_102', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (578, 'Qz8jzlt6I2qitXpw', 'menu_103', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (579, 'Qz8jzlt6I2qitXpw', 'menu_104', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (580, 'Qz8jzlt6I2qitXpw', 'menu_105', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (581, 'Qz8jzlt6I2qitXpw', 'menu_200', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (582, 'Qz8jzlt6I2qitXpw', 'menu_1768181720541', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (583, 'Qz8jzlt6I2qitXpw', 'menu_202', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (584, 'Qz8jzlt6I2qitXpw', 'menu_204', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (585, 'Qz8jzlt6I2qitXpw', 'menu_205', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (586, 'Qz8jzlt6I2qitXpw', 'menu_206', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (587, 'Qz8jzlt6I2qitXpw', 'menu_300', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (588, 'Qz8jzlt6I2qitXpw', 'menu_301', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (589, 'Qz8jzlt6I2qitXpw', 'menu_302', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (590, 'Qz8jzlt6I2qitXpw', 'menu_303', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (591, 'Qz8jzlt6I2qitXpw', 'menu_400', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (592, 'Qz8jzlt6I2qitXpw', 'menu_401', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (593, 'Qz8jzlt6I2qitXpw', 'menu_500', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (594, 'Qz8jzlt6I2qitXpw', 'menu_501', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (595, 'Qz8jzlt6I2qitXpw', 'menu_600', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (596, 'Qz8jzlt6I2qitXpw', 'menu_601', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (597, 'Qz8jzlt6I2qitXpw', 'menu_602', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (598, 'Qz8jzlt6I2qitXpw', 'menu_603', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (599, 'Qz8jzlt6I2qitXpw', 'menu_700', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (600, 'Qz8jzlt6I2qitXpw', 'menu_701', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (601, 'Qz8jzlt6I2qitXpw', 'menu_702', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (602, 'Qz8jzlt6I2qitXpw', 'menu_705', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (603, 'Qz8jzlt6I2qitXpw', 'menu_706', '2026-01-14 17:29:44');
INSERT INTO `role_menus` VALUES (604, 'admin', 'city_management', '2026-01-15 14:44:33');
INSERT INTO `role_menus` VALUES (605, 'SUPER_ADMIN', 'city_management', '2026-01-15 14:44:33');

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
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 'Qz8jzlt6I2qitXpw', 'improvement:view', '2026-01-07');
INSERT INTO `role_permissions` VALUES (2, 'Qz8jzlt6I2qitXpw', 'improvement:edit', '2026-01-07');
INSERT INTO `role_permissions` VALUES (3, 'Qz8jzlt6I2qitXpw', 'improvement:delete', '2026-01-07');
INSERT INTO `role_permissions` VALUES (4, 'vd7p1lxn9lOaRKKJ', 'improvement:*', '2026-01-07');
INSERT INTO `role_permissions` VALUES (5, 'QIUgWkY0NMp444Qt', 'improvement:create', '2026-01-07');
INSERT INTO `role_permissions` VALUES (6, 'QIUgWkY0NMp444Qt', 'improvement:view', '2026-01-07');

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
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES ('3cUruZzYPErB074T', '高级工程师', '负责核心功能开发和代码审查', 1, '[\"employee:view\", \"department:view\", \"position:view\", \"project:view\", \"project:update\", \"project_member:view\", \"project_member:update\", \"calculation:read\", \"report:view\", \"collaboration:view\", \"team:view\", \"member:view\"]', 1, '2025-08-21 08:55:31', '2025-12-25 11:26:52');
INSERT INTO `roles` VALUES ('business_expert_001', '业务专家', '负责总体业务指导和用户交互顾问', 1, '[\"project:view\", \"collaboration:view\", \"collaboration:apply\", \"team:view\", \"member:view\", \"calculation:read\", \"report:view\", \"employee:view\", \"department:view\"]', 1, '2025-08-21 08:55:31', '2025-08-21 08:55:31');
INSERT INTO `roles` VALUES ('CdFv8NCPauLjt7se', '项目经理', '负责项目全生命周期管理', 1, '[\"employee:view\", \"department:view\", \"position:view\", \"business_line:view\", \"project:view\", \"project:create\", \"project:update\", \"project_member:view\", \"project_member:create\", \"project_member:update\", \"calculation:read\", \"calculation:create\", \"report:view\", \"collaboration:view\", \"collaboration:publish\", \"team:build\", \"team:manage\", \"member:recruit\", \"member:approve\", \"member:assign\", \"member:remove\", \"bonus:view\", \"simulation:view\", \"report:export\", \"project:cost:update\", \"project:cost:manage\", \"collaboration:approve\", \"collaboration:apply\", \"collaboration:*\", \"project_member:delete\", \"project_member:*\", \"project:cost:view\", \"project:apply\", \"project:update\", \"project:publish\", \"project:delete\", \"project:approve\", \"project:start\", \"project:pause\", \"project:close\", \"project:manage\", \"project:cost:create\", \"project:cost:delete\", \"project:weights:view\", \"project:weights:view_own\", \"project:weights:update\", \"project:weights:update_own\", \"notification:view\", \"project_member:update\", \"team:approve\", \"team:view\", \"team:*\", \"member:view\", \"member:*\", \"project:*\", \"project:weights:update_all\", \"project:weights:view_all\", \"project:weights:approve\", \"project:cost:view:all\"]', 1, '2025-08-21 08:55:31', '2026-01-14 19:37:38');
INSERT INTO `roles` VALUES ('collab_admin_001', '项目协作管理员', '负责项目协作流程管理和团队申请审批', 1, '[\"collaboration:view\", \"collaboration:publish\", \"collaboration:approve\", \"team:view\", \"team:build\", \"team:manage\", \"member:view\", \"member:recruit\", \"member:approve\", \"member:assign\", \"member:remove\", \"project:view\", \"project:update\", \"report:view\", \"report:export\"]', 1, '2025-08-21 08:55:31', '2025-12-25 11:26:26');
INSERT INTO `roles` VALUES ('Eln8qiLDJhs73Sc7', '财务管理员', '财务相关权限', 1, '[\"report:view\", \"report:export\", \"employee:view\", \"department:view\", \"project:cost:view:all\", \"project:cost:manage\", \"finance:view\", \"finance:manage\", \"finance:approve\", \"calculation:create\", \"calculation:execute\", \"calculation:export\", \"business_line:view\", \"position:view\", \"project:cost:create\", \"project:cost:update\", \"project:cost:delete\", \"project:cost:view\", \"project:view\", \"bonus_pool:view\", \"bonus_pool:create\", \"bonus_pool:update\", \"bonus_pool:delete\", \"bonus_pool:calculate\", \"bonus_pool:approve\", \"bonus_pool:export\", \"bonus_pool:manage_own\", \"bonus_pool:manage_all\", \"bonus_pool:*\", \"bonus:view\", \"bonus:create\", \"bonus:calculate\", \"bonus:approve\", \"bonus:distribute\", \"bonus:adjust\", \"bonus:*\", \"calculation:read\"]', 1, '2025-08-16 17:00:43', '2026-02-02 07:41:28');
INSERT INTO `roles` VALUES ('eQe0vpMd3emXERl9', '技术总监', '负责技术架构设计和技术团队管理', 1, '[\"employee:view\", \"employee:create\", \"employee:update\", \"department:view\", \"department:update\", \"position:view\", \"position:create\", \"position:update\", \"project:view\", \"project:create\", \"project:update\", \"project:delete\", \"calculation:read\", \"calculation:create\", \"calculation:update\", \"report:view\", \"report:export\", \"system:config\", \"collaboration:view\", \"collaboration:publish\", \"team:build\", \"team:manage\", \"member:recruit\", \"member:approve\", \"member:assign\", \"member:remove\", \"project:*\", \"team:*\", \"member:*\", \"bonus:view\", \"bonus:calculate\", \"simulation:view\", \"simulation:run\"]', 1, '2025-08-21 08:55:31', '2025-12-25 11:26:52');
INSERT INTO `roles` VALUES ('GlpDpQngrkgDMNh2', '部门经理', '负责部门日常管理和团队协调', 1, '[\"employee:view\", \"employee:create\", \"employee:update\", \"department:view\", \"department:update\", \"position:view\", \"position:update\", \"business_line:view\", \"project:view\", \"project:create\", \"project:update\", \"calculation:read\", \"calculation:create\", \"report:view\", \"report:export\", \"collaboration:view\", \"collaboration:apply\", \"team:view\", \"member:view\", \"member:approve\", \"bonus:view\", \"report:personal\", \"simulation:view\", \"bonus_pool:view\"]', 1, '2025-08-21 08:55:31', '2025-12-25 11:40:03');
INSERT INTO `roles` VALUES ('L30E54H8hq3fFZjs', '总经理', '全部权限', 1, '[\"*\"]', 1, '2026-02-02 17:01:19', '2026-02-02 17:01:19');
INSERT INTO `roles` VALUES ('QIUgWkY0NMp444Qt', '普通员工', '基础员工权限', 1, '[\"employee:view\", \"department:view\", \"position:view\", \"project:view\", \"project_member:view\", \"calculation:read\", \"collaboration:view\", \"collaboration:apply\", \"team:view\", \"member:view\", \"report:personal\", \"bonus:view\", \"notification:view\", \"position_encyclopedia:view\", \"business_line:view\", \"simulation:view\"]', 1, '2025-08-21 08:55:31', '2026-01-05 11:12:55');
INSERT INTO `roles` VALUES ('Qz8jzlt6I2qitXpw', 'HR管理员', '人事管理权限', 1, '[\"employee:view\", \"employee:create\", \"employee:update\", \"employee:delete\", \"department:view\", \"department:create\", \"department:update\", \"position:view\", \"position:create\", \"position:update\", \"business_line:view\", \"user:view\", \"user:create\", \"user:update\", \"collaboration:view\", \"team:view\", \"member:view\", \"member:approve\", \"bonus:view\", \"bonus:approve\", \"report:view\", \"report:export\", \"simulation:view\", \"simulation:run\", \"simulation:create\", \"simulation:delete\", \"simulation:analyze\", \"simulation:*\", \"calculation:read\", \"calculation:create\", \"calculation:update\", \"calculation:delete\", \"calculation:execute\", \"calculation:simulate\", \"calculation:export\", \"calculation:*\", \"business_line:create\", \"business_line:update\", \"business_line:delete\", \"business_line:*\", \"position_encyclopedia:view\", \"position_encyclopedia:manage\", \"position_encyclopedia:update_requirements\", \"position_encyclopedia:update_career_path\", \"position_encyclopedia:update_skills\", \"position_encyclopedia:bulk_update\", \"position_encyclopedia:export\", \"position_encyclopedia:*\", \"position:delete\", \"position:approve\", \"position:*\", \"department:delete\", \"department:*\", \"employee:transfer\", \"employee:*\", \"role:view\", \"role:assign\", \"role:*\", \"role:update\", \"user:delete\", \"user:reset-password\", \"user:*\", \"project:approve\", \"project:cost:update\", \"project:cost:create\", \"project:cost:view\", \"project:cost:delete\", \"project:cost:manage\", \"bonus:create\", \"bonus:calculate\", \"bonus:distribute\", \"bonus:adjust\", \"bonus:*\", \"bonus_pool:view\", \"bonus_pool:create\", \"bonus_pool:update\", \"bonus_pool:delete\", \"bonus_pool:calculate\", \"bonus_pool:approve\", \"bonus_pool:export\", \"bonus_pool:manage_own\", \"bonus_pool:manage_all\", \"bonus_pool:*\", \"report:personal\", \"report:*\", \"improvement:view\", \"improvement:create\", \"improvement:edit\", \"improvement:delete\", \"improvement:*\", \"project:view\", \"project:publish\", \"project:create\", \"project:update\", \"project:apply\", \"project:delete\", \"project:start\", \"project:pause\", \"project:close\", \"project:manage\", \"project:cost:view:all\", \"project:weights:view\", \"project:weights:view_own\", \"project:weights:view_all\", \"project:weights:update\", \"project:weights:update_own\", \"project:weights:update_all\", \"project:weights:approve\", \"project:*\", \"project_member:view\", \"project_member:create\", \"project_member:update\", \"project_member:delete\", \"project_member:*\", \"collaboration:publish\", \"collaboration:apply\", \"collaboration:approve\", \"collaboration:*\", \"team:build\", \"team:manage\", \"team:approve\", \"team:*\", \"finance:view\", \"finance:manage\", \"finance:approve\", \"finance:*\", \"member:recruit\", \"member:assign\", \"member:remove\", \"member:*\", \"notification:view\", \"notification:create\", \"notification:update\", \"notification:delete\", \"notification:manage\", \"notification:*\"]', 1, '2025-08-16 17:00:43', '2026-01-14 18:35:45');
INSERT INTO `roles` VALUES ('simulation_expert_001', '模拟分析专家', '负责奖金模拟分析和敏感性分析', 1, '[\"simulation:view\", \"simulation:run\", \"simulation:create\", \"simulation:analyze\", \"calculation:read\", \"calculation:simulate\", \"report:view\", \"report:export\", \"project:view\", \"collaboration:view\"]', 1, '2025-08-21 08:55:31', '2025-08-21 08:55:31');
INSERT INTO `roles` VALUES ('vd7p1lxn9lOaRKKJ', '系统管理员', '拥有所有系统权限', 1, '[\"*\"]', 1, '2025-08-16 17:00:43', '2025-08-21 08:55:31');

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
-- Records of simulation_scenarios
-- ----------------------------

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
-- Records of skill_categories
-- ----------------------------
INSERT INTO `skill_categories` VALUES ('cat_domain', '领域知识', '行业知识、业务理解等专业领域', '#e6a23c', 3, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_categories` VALUES ('cat_management', '管理能力', '项目管理、团队管理等管理技能', '#f56c6c', 4, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_categories` VALUES ('cat_soft_skill', '软技能', '沟通、协作、领导力等通用能力', '#67c23a', 2, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_categories` VALUES ('cat_tech_skill', '技术技能', '编程语言、框架、工具等技术能力', '#409eff', 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');

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
-- Records of skill_tags
-- ----------------------------
INSERT INTO `skill_tags` VALUES ('skill_backend', '后端开发', 'BACKEND', 'cat_tech_skill', 'intermediate', '服务端开发技术', '[\"BE\", \"后端\"]', '[\"skill_nodejs\", \"skill_java\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_communication', '沟通能力', 'COMMUNICATION', 'cat_soft_skill', 'basic', '有效沟通表达能力', '[\"表达\", \"沟通\"]', '[\"skill_team\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_ecommerce', '电商业务', 'ECOMMERCE', 'cat_domain', 'intermediate', '电商行业知识', '[\"电商\", \"零售\"]', '[]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_education', '教育行业', 'EDUCATION', 'cat_domain', 'intermediate', '教育行业知识', '[\"教育\", \"培训\"]', '[]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_execution', '执行力', 'EXECUTION', 'cat_management', 'intermediate', '高效执行落地能力', '[\"执行\", \"落地\"]', '[\"skill_plan\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_finance', '金融知识', 'FINANCE', 'cat_domain', 'intermediate', '金融行业知识', '[\"金融\", \"财务\"]', '[]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_frontend', '前端开发', 'FRONTEND', 'cat_tech_skill', 'intermediate', 'Web前端开发技术', '[\"FE\", \"前端\"]', '[\"skill_vue\", \"skill_react\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_innovation', '创新思维', 'INNOVATION', 'cat_soft_skill', 'intermediate', '创新和问题解决能力', '[\"创新\", \"创造力\"]', '[]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_java', 'Java', 'JAVA', 'cat_tech_skill', 'advanced', 'Java开发', '[\"Java开发\"]', '[\"skill_backend\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_leadership', '领导力', 'LEADERSHIP', 'cat_soft_skill', 'advanced', '团队领导能力', '[\"领导\", \"带队\"]', '[\"skill_pm\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_nodejs', 'Node.js', 'NODEJS', 'cat_tech_skill', 'intermediate', 'Node.js后端开发', '[\"NodeJS\"]', '[\"skill_backend\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_plan', '规划能力', 'PLANNING', 'cat_management', 'intermediate', '战略规划和目标设定', '[\"规划\", \"计划\"]', '[\"skill_pm\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_pm', '项目管理', 'PROJECT_MANAGEMENT', 'cat_management', 'advanced', '项目规划、执行、监控能力', '[\"PM\", \"项目经理\"]', '[\"skill_team\", \"skill_plan\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_react', 'React', 'REACT', 'cat_tech_skill', 'intermediate', 'React框架开发', '[\"ReactJS\"]', '[\"skill_frontend\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_team', '团队协作', 'TEAMWORK', 'cat_soft_skill', 'basic', '团队沟通协作能力', '[\"协作\", \"配合\"]', '[\"skill_pm\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');
INSERT INTO `skill_tags` VALUES ('skill_vue', 'Vue.js', 'VUE', 'cat_tech_skill', 'intermediate', 'Vue框架开发', '[\"Vue\", \"Vue3\"]', '[\"skill_frontend\"]', 0, 1, 0, '2025-12-24 18:26:41', '2025-12-24 18:26:41');

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
-- Records of system_config_history
-- ----------------------------
INSERT INTO `system_config_history` VALUES (1, 1, 'basic', 'systemName', '奖金模拟系统', '奖金模拟系统', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (2, 2, 'basic', 'companyName', '示例公司', '示例公司', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (3, 4, 'basic', 'timezone', 'Asia/Shanghai', 'Asia/Shanghai', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (4, 5, 'basic', 'language', 'zh-CN', 'zh-CN', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (5, 6, 'basic', 'fiscalYearStart', '1', '1', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (6, 7, 'basic', 'bonusCycle', 'quarterly', 'quarterly', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (7, 8, 'basic', 'currency', 'CNY', 'CNY', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (8, 9, 'basic', 'decimalPlaces', '2', '2', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (9, 10, 'bonus', 'profitWeight', '0.4', '0.4', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (10, 11, 'bonus', 'positionWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (11, 12, 'bonus', 'performanceWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (12, 13, 'bonus', 'defaultPoolRatio', '0.1', '0.1', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (13, 14, 'bonus', 'reserveRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (14, 15, 'bonus', 'specialRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (15, 16, 'bonus', 'minBonusRatio', '0.5', '0.5', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (16, 17, 'bonus', 'maxBonusRatio', '3', '3', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (17, 18, 'calculation', 'defaultAlgorithm', 'three_dimensional', 'three_dimensional', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (18, 19, 'calculation', 'precision', '4', '4', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (19, 20, 'calculation', 'roundingRule', 'round_half_up', 'round_half_up', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (20, 21, 'calculation', 'enableConcurrent', 'true', 'true', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (21, 22, 'calculation', 'maxThreads', '4', '4', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (22, 23, 'calculation', 'batchSize', '100', '100', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (23, 24, 'calculation', 'timeout', '300000', '300000', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (24, 25, 'calculation', 'retryCount', '3', '3', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (25, 26, 'calculation', 'cacheStrategy', 'memory', 'memory', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (26, 27, 'calculation', 'cacheExpiry', '3600', '3600', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (27, 28, 'notification', 'emailEnabled', 'false', 'false', 'admin_user', '2026-01-16 15:25:17', '');
INSERT INTO `system_config_history` VALUES (28, 29, 'notification', 'smtpHost', '', '', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (29, 30, 'notification', 'smtpPort', '587', '587', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (30, 31, 'notification', 'senderEmail', '', '', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (31, 32, 'notification', 'emailEvents', '[\"bonus_calculated\", \"bonus_approved\"]', '[\"bonus_calculated\",\"bonus_approved\"]', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (32, 33, 'notification', 'systemNotificationEnabled', 'true', 'true', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (33, 34, 'notification', 'notificationRetentionDays', '30', '30', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (34, 35, 'notification', 'maxNotificationCount', '1000', '1000', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (35, 36, 'security', 'passwordMinLength', '8', '8', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (36, 37, 'security', 'passwordRequirements', '[\"uppercase\", \"lowercase\", \"number\"]', '[\"uppercase\",\"lowercase\",\"number\"]', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (37, 38, 'security', 'passwordExpireDays', '90', '90', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (38, 39, 'security', 'maxLoginFailures', '5', '5', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (39, 40, 'security', 'lockoutDuration', '30', '30', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (40, 41, 'security', 'sessionTimeout', '7200', '7200', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (41, 42, 'security', 'enableRememberMe', 'true', 'true', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (42, 43, 'security', 'enableSingleSignOn', 'false', 'false', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (43, 44, 'security', 'enableIpWhitelist', 'false', 'false', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (44, 45, 'security', 'ipWhitelist', '', '', 'admin_user', '2026-01-16 15:25:18', '');
INSERT INTO `system_config_history` VALUES (45, 1, 'basic', 'systemName', '奖金模拟系统', '奖金模拟系统', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (46, 2, 'basic', 'companyName', '示例公司', '示例公司', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (47, 4, 'basic', 'timezone', 'Asia/Shanghai', 'Asia/Shanghai', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (48, 5, 'basic', 'language', 'zh-CN', 'zh-CN', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (49, 6, 'basic', 'fiscalYearStart', '1', '1', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (50, 7, 'basic', 'bonusCycle', 'quarterly', 'quarterly', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (51, 8, 'basic', 'currency', 'CNY', 'CNY', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (52, 9, 'basic', 'decimalPlaces', '2', '2', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (53, 10, 'bonus', 'profitWeight', '0.4', '0.4', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (54, 11, 'bonus', 'positionWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (55, 12, 'bonus', 'performanceWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (56, 13, 'bonus', 'defaultPoolRatio', '0.1', '0.1', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (57, 14, 'bonus', 'reserveRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (58, 15, 'bonus', 'specialRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (59, 16, 'bonus', 'minBonusRatio', '0.5', '0.5', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (60, 17, 'bonus', 'maxBonusRatio', '3', '3', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (61, 18, 'calculation', 'defaultAlgorithm', 'three_dimensional', 'three_dimensional', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (62, 19, 'calculation', 'precision', '4', '4', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (63, 20, 'calculation', 'roundingRule', 'round_half_up', 'round_half_up', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (64, 21, 'calculation', 'enableConcurrent', 'true', 'true', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (65, 22, 'calculation', 'maxThreads', '4', '4', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (66, 23, 'calculation', 'batchSize', '100', '100', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (67, 24, 'calculation', 'timeout', '300000', '300000', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (68, 25, 'calculation', 'retryCount', '3', '3', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (69, 26, 'calculation', 'cacheStrategy', 'memory', 'memory', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (70, 27, 'calculation', 'cacheExpiry', '3600', '3600', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (71, 28, 'notification', 'emailEnabled', 'false', 'false', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (72, 29, 'notification', 'smtpHost', '', '', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (73, 30, 'notification', 'smtpPort', '587', '587', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (74, 31, 'notification', 'senderEmail', '', '', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (75, 32, 'notification', 'emailEvents', '[\"bonus_calculated\",\"bonus_approved\"]', '[\"bonus_calculated\",\"bonus_approved\"]', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (76, 33, 'notification', 'systemNotificationEnabled', 'true', 'true', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (77, 34, 'notification', 'notificationRetentionDays', '30', '30', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (78, 35, 'notification', 'maxNotificationCount', '1000', '1000', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (79, 36, 'security', 'passwordMinLength', '8', '8', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (80, 37, 'security', 'passwordRequirements', '[\"uppercase\",\"lowercase\",\"number\"]', '[\"uppercase\",\"lowercase\",\"number\"]', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (81, 38, 'security', 'passwordExpireDays', '90', '90', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (82, 39, 'security', 'maxLoginFailures', '5', '5', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (83, 40, 'security', 'lockoutDuration', '30', '30', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (84, 41, 'security', 'sessionTimeout', '7200', '7200', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (85, 42, 'security', 'enableRememberMe', 'true', 'true', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (86, 43, 'security', 'enableSingleSignOn', 'false', 'false', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (87, 44, 'security', 'enableIpWhitelist', 'false', 'false', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (88, 45, 'security', 'ipWhitelist', '', '', 'admin_user', '2026-01-16 15:27:21', '');
INSERT INTO `system_config_history` VALUES (89, 1, 'basic', 'systemName', '奖金模拟系统', '奖金模拟系统', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (90, 2, 'basic', 'companyName', '示例公司', '示例公司', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (91, 4, 'basic', 'timezone', 'Asia/Shanghai', 'Asia/Shanghai', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (92, 5, 'basic', 'language', 'zh-CN', 'zh-CN', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (93, 6, 'basic', 'fiscalYearStart', '1', '1', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (94, 7, 'basic', 'bonusCycle', 'quarterly', 'quarterly', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (95, 8, 'basic', 'currency', 'CNY', 'CNY', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (96, 9, 'basic', 'decimalPlaces', '2', '2', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (97, 10, 'bonus', 'profitWeight', '0.4', '0.4', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (98, 11, 'bonus', 'positionWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (99, 12, 'bonus', 'performanceWeight', '0.3', '0.3', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (100, 13, 'bonus', 'defaultPoolRatio', '0.1', '0.1', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (101, 14, 'bonus', 'reserveRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (102, 15, 'bonus', 'specialRatio', '0.05', '0.05', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (103, 16, 'bonus', 'minBonusRatio', '0.5', '0.5', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (104, 17, 'bonus', 'maxBonusRatio', '3', '3', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (105, 18, 'calculation', 'defaultAlgorithm', 'three_dimensional', 'three_dimensional', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (106, 19, 'calculation', 'precision', '4', '4', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (107, 20, 'calculation', 'roundingRule', 'round_half_up', 'round_half_up', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (108, 21, 'calculation', 'enableConcurrent', 'true', 'true', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (109, 22, 'calculation', 'maxThreads', '4', '4', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (110, 23, 'calculation', 'batchSize', '100', '100', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (111, 24, 'calculation', 'timeout', '300000', '300000', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (112, 25, 'calculation', 'retryCount', '3', '3', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (113, 26, 'calculation', 'cacheStrategy', 'memory', 'memory', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (114, 27, 'calculation', 'cacheExpiry', '3600', '3600', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (115, 28, 'notification', 'emailEnabled', 'false', 'false', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (116, 29, 'notification', 'smtpHost', '', '', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (117, 30, 'notification', 'smtpPort', '587', '587', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (118, 31, 'notification', 'senderEmail', '', '', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (119, 32, 'notification', 'emailEvents', '[\"bonus_calculated\",\"bonus_approved\"]', '[\"bonus_calculated\",\"bonus_approved\"]', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (120, 33, 'notification', 'systemNotificationEnabled', 'true', 'true', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (121, 34, 'notification', 'notificationRetentionDays', '30', '30', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (122, 35, 'notification', 'maxNotificationCount', '1000', '1000', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (123, 36, 'security', 'passwordMinLength', '8', '8', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (124, 37, 'security', 'passwordRequirements', '[\"uppercase\",\"lowercase\",\"number\"]', '[\"uppercase\",\"lowercase\",\"number\"]', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (125, 38, 'security', 'passwordExpireDays', '90', '90', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (126, 39, 'security', 'maxLoginFailures', '5', '5', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (127, 40, 'security', 'lockoutDuration', '30', '30', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (128, 41, 'security', 'sessionTimeout', '7200', '7200', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (129, 42, 'security', 'enableRememberMe', 'true', 'true', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (130, 43, 'security', 'enableSingleSignOn', 'false', 'false', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (131, 44, 'security', 'enableIpWhitelist', 'false', 'false', 'admin_user', '2026-01-16 15:31:58', '');
INSERT INTO `system_config_history` VALUES (132, 45, 'security', 'ipWhitelist', '', '', 'admin_user', '2026-01-16 15:31:58', '');

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
-- Records of system_configs
-- ----------------------------
INSERT INTO `system_configs` VALUES (1, 'basic', 'systemName', '奖金模拟系统', 'string', '系统名称', 0, 1, NULL, '奖金模拟系统', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (2, 'basic', 'companyName', '示例公司', 'string', '公司名称', 0, 1, NULL, '示例公司', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (3, 'basic', 'version', '1.0.0', 'string', '系统版本', 0, 0, NULL, '1.0.0', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (4, 'basic', 'timezone', 'Asia/Shanghai', 'string', '时区设置', 0, 1, NULL, 'Asia/Shanghai', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (5, 'basic', 'language', 'zh-CN', 'string', '系统语言', 0, 1, NULL, 'zh-CN', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (6, 'basic', 'fiscalYearStart', '1', 'number', '财年开始月份(1-12)', 0, 1, NULL, '1', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (7, 'basic', 'bonusCycle', 'quarterly', 'string', '奖金周期:monthly/quarterly/yearly', 0, 1, NULL, 'quarterly', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (8, 'basic', 'currency', 'CNY', 'string', '货币单位', 0, 1, NULL, 'CNY', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (9, 'basic', 'decimalPlaces', '2', 'number', '小数位数', 0, 1, NULL, '2', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (10, 'bonus', 'profitWeight', '0.4', 'number', '利润贡献权重', 0, 1, '{\"max\": 1, \"min\": 0, \"sum\": \"profitWeight+positionWeight+performanceWeight=1\"}', '0.4', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (11, 'bonus', 'positionWeight', '0.3', 'number', '岗位价值权重', 0, 1, '{\"max\": 1, \"min\": 0}', '0.3', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (12, 'bonus', 'performanceWeight', '0.3', 'number', '绩效表现权重', 0, 1, '{\"max\": 1, \"min\": 0}', '0.3', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (13, 'bonus', 'defaultPoolRatio', '0.1', 'number', '默认奖金池比例', 0, 1, '{\"max\": 1, \"min\": 0}', '0.1', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (14, 'bonus', 'reserveRatio', '0.05', 'number', '预留调节金比例', 0, 1, '{\"max\": 0.5, \"min\": 0}', '0.05', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (15, 'bonus', 'specialRatio', '0.05', 'number', '特别奖励基金比例', 0, 1, '{\"max\": 0.5, \"min\": 0}', '0.05', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (16, 'bonus', 'minBonusRatio', '0.5', 'number', '最小奖金系数', 0, 1, '{\"max\": 5, \"min\": 0}', '0.5', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (17, 'bonus', 'maxBonusRatio', '3', 'number', '最大奖金系数', 0, 1, '{\"max\": 10, \"min\": 0}', '3.0', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (18, 'calculation', 'defaultAlgorithm', 'three_dimensional', 'string', '默认计算算法', 0, 1, NULL, 'three_dimensional', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (19, 'calculation', 'precision', '4', 'number', '计算精度(小数位)', 0, 1, NULL, '4', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (20, 'calculation', 'roundingRule', 'round_half_up', 'string', '舍入规则', 0, 1, NULL, 'round_half_up', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (21, 'calculation', 'enableConcurrent', 'true', 'boolean', '启用并发计算', 0, 1, NULL, 'true', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (22, 'calculation', 'maxThreads', '4', 'number', '最大线程数', 0, 1, NULL, '4', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (23, 'calculation', 'batchSize', '100', 'number', '批处理大小', 0, 1, NULL, '100', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (24, 'calculation', 'timeout', '300000', 'number', '超时时间(毫秒)', 0, 1, NULL, '300000', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (25, 'calculation', 'retryCount', '3', 'number', '重试次数', 0, 1, NULL, '3', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (26, 'calculation', 'cacheStrategy', 'memory', 'string', '缓存策略:memory/redis/none', 0, 1, NULL, 'memory', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (27, 'calculation', 'cacheExpiry', '3600', 'number', '缓存过期时间(秒)', 0, 1, NULL, '3600', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (28, 'notification', 'emailEnabled', 'false', 'boolean', '启用邮件通知', 0, 1, NULL, 'false', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (29, 'notification', 'smtpHost', '', 'string', 'SMTP服务器地址', 0, 1, NULL, '', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (30, 'notification', 'smtpPort', '587', 'number', 'SMTP端口', 0, 1, NULL, '587', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (31, 'notification', 'senderEmail', '', 'string', '发件人邮箱', 0, 1, NULL, '', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (32, 'notification', 'emailEvents', '[\"bonus_calculated\",\"bonus_approved\"]', 'json', '邮件通知事件', 0, 1, NULL, '[]', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (33, 'notification', 'systemNotificationEnabled', 'true', 'boolean', '启用系统通知', 0, 1, NULL, 'true', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (34, 'notification', 'notificationRetentionDays', '30', 'number', '通知保留天数', 0, 1, NULL, '30', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (35, 'notification', 'maxNotificationCount', '1000', 'number', '最大通知数量', 0, 1, NULL, '1000', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (36, 'security', 'passwordMinLength', '8', 'number', '密码最小长度', 0, 1, NULL, '8', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (37, 'security', 'passwordRequirements', '[\"uppercase\",\"lowercase\",\"number\"]', 'json', '密码要求', 0, 1, NULL, '[\"uppercase\", \"lowercase\", \"number\"]', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (38, 'security', 'passwordExpireDays', '90', 'number', '密码过期天数(0=不过期)', 0, 1, NULL, '90', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (39, 'security', 'maxLoginFailures', '5', 'number', '最大登录失败次数', 0, 1, NULL, '5', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (40, 'security', 'lockoutDuration', '30', 'number', '锁定时长(分钟)', 0, 1, NULL, '30', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (41, 'security', 'sessionTimeout', '7200', 'number', '会话超时时间(秒)', 0, 1, NULL, '7200', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (42, 'security', 'enableRememberMe', 'true', 'boolean', '启用记住我功能', 0, 1, NULL, 'true', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (43, 'security', 'enableSingleSignOn', 'false', 'boolean', '启用单点登录', 0, 1, NULL, 'false', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (44, 'security', 'enableIpWhitelist', 'false', 'boolean', '启用IP白名单', 0, 1, NULL, 'false', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (45, 'security', 'ipWhitelist', '', 'string', 'IP白名单(逗号分隔)', 0, 1, NULL, '', 'admin_user', '2025-11-17 11:21:15', '2026-01-16 15:31:58');
INSERT INTO `system_configs` VALUES (46, 'feature', 'enableEmployeeManagement', 'true', 'boolean', '启用员工管理', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (47, 'feature', 'enableDepartmentManagement', 'true', 'boolean', '启用部门管理', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (48, 'feature', 'enablePositionManagement', 'true', 'boolean', '启用岗位管理', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (49, 'feature', 'enableBonusCalculation', 'true', 'boolean', '启用奖金计算', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (50, 'feature', 'enableSimulationAnalysis', 'true', 'boolean', '启用模拟分析', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (51, 'feature', 'enableProjectCollaboration', 'true', 'boolean', '启用项目协作', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (52, 'feature', 'enableAdvancedReporting', 'true', 'boolean', '启用高级报表', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');
INSERT INTO `system_configs` VALUES (53, 'feature', 'enableDataExport', 'true', 'boolean', '启用数据导出', 0, 1, NULL, 'true', NULL, '2025-11-17 11:21:15', '2025-11-17 11:21:15');

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
-- Records of system_notifications
-- ----------------------------

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
  `position_benchmark` decimal(6, 2) NULL DEFAULT 1.00 COMMENT '岗位基准值系数(范围:0.1-3.0)',
  `city_coefficient` decimal(4, 2) NULL DEFAULT 1.00 COMMENT '城市系数(范围:0.8-1.5)',
  `business_line_coefficient` decimal(4, 2) NULL DEFAULT 1.00 COMMENT '业务线系数(范围:0.8-1.5)',
  `performance_coefficient` decimal(4, 2) NULL DEFAULT 1.00 COMMENT '绩效系数(范围:0.5-2.0)',
  `time_coefficient` decimal(4, 2) NULL DEFAULT 1.00 COMMENT '时间系数(范围:0-1.2)',
  `base_three_dimensional_score` decimal(8, 4) NULL DEFAULT NULL COMMENT '应用系数前的三维基础得分',
  `final_coefficient_score` decimal(8, 4) NULL DEFAULT NULL COMMENT '应用所有系数后的最终系数得分',
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
  INDEX `idx_calculation_result_rankings`(`score_rank` ASC, `percentile_rank` ASC) USING BTREE,
  INDEX `idx_coefficient_scores`(`bonus_pool_id` ASC, `final_coefficient_score` DESC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '??????? - ????????????????' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of three_dimensional_calculation_results
-- ----------------------------
INSERT INTO `three_dimensional_calculation_results` VALUES ('1fDROeeGOkzmYOLh', '5NQDb4fAifAEuuK5', 1, '2025', 'vWPfxdVQcyYtm2Ge', 86.0000, 86.0000, 86.0000, 86.0000, 86.0000, 86.0000, 34.4000, 25.8000, 25.8000, 86.0000, 86.0000, 159.0723, 1.00, 1.10, 0.80, 1.79, 1.17, 86.0000, 159.0723, 16, 44.44, 3, 6, NULL, 4638.79, 0.00, 4638.79, 0.00, 0.00, 0.00, '{\"value\": 86, \"source\": \"performance_record\"}', '{\"value\": 86, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 86, \"quarterScores\": [{\"score\": 86, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.959Z', '2026-02-03T09:35:36.959Z', '2026-02-03T09:35:36.959Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('2gn826gmFHesUXp0', 'WBtjGNZ2h7hDwbRq', 1, '2025', 'vWPfxdVQcyYtm2Ge', 93.0000, 91.0000, 92.0000, 93.0000, 91.0000, 92.0000, 37.2000, 27.3000, 27.6000, 92.1000, 92.1000, 108.1105, 0.60, 1.30, 0.80, 1.88, 1.00, 92.1000, 108.1105, 27, 3.70, 2, 1, NULL, 3152.67, 0.00, 3152.67, 0.00, 0.00, 0.00, '{\"value\": 93, \"source\": \"performance_record\"}', '{\"value\": 91, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 92, \"quarterScores\": [{\"score\": 92, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.974Z', '2026-02-03T09:35:36.974Z', '2026-02-03T09:35:36.974Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('60ftR6v0YLMuZgQj', 'D3fZif5G61ZHTexI', 1, '2025', 'vWPfxdVQcyYtm2Ge', 80.0000, 80.0000, 80.0000, 80.0000, 80.0000, 80.0000, 32.0000, 24.0000, 24.0000, 80.0000, 80.0000, 141.8113, 1.00, 1.30, 0.80, 1.70, 1.00, 80.0000, 141.8113, 23, 18.52, 1, 11, NULL, 4135.43, 0.00, 4135.43, 0.00, 0.00, 0.00, '{\"value\": 80, \"source\": \"performance_record\"}', '{\"value\": 80, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 80, \"quarterScores\": [{\"score\": 80, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.964Z', '2026-02-03T09:35:36.964Z', '2026-02-03T09:35:36.964Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('7PXaEZXybiKPikXq', 'h0nwwaAsi4gJjFen', 1, '2025', 'vWPfxdVQcyYtm2Ge', 82.0000, 80.0000, 81.0000, 82.0000, 80.0000, 81.0000, 32.8000, 24.0000, 24.3000, 81.1000, 81.1000, 198.8937, 1.10, 1.30, 1.00, 1.72, 1.00, 81.1000, 198.8937, 4, 88.89, 1, 2, NULL, 5800.05, 0.00, 5800.05, 0.00, 0.00, 0.00, '{\"value\": 82, \"source\": \"performance_record\"}', '{\"value\": 80, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 81, \"quarterScores\": [{\"score\": 81, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.965Z', '2026-02-03T09:35:36.966Z', '2026-02-03T09:35:36.966Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('899YeFbEsBcTIZRn', 'j46LEwS76rO6rSi7', 1, '2025', 'vWPfxdVQcyYtm2Ge', 88.0000, 88.0000, 88.0000, 88.0000, 88.0000, 88.0000, 35.2000, 26.4000, 26.4000, 88.0000, 88.0000, 160.1771, 1.00, 1.10, 0.80, 1.82, 1.13, 88.0000, 160.1771, 15, 48.15, 2, 5, NULL, 4671.01, 0.00, 4671.01, 0.00, 0.00, 0.00, '{\"value\": 88, \"source\": \"performance_record\"}', '{\"value\": 88, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 88, \"quarterScores\": [{\"score\": 88, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.967Z', '2026-02-03T09:35:36.967Z', '2026-02-03T09:35:36.968Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('8CVaxVtcRg5WYDXO', 'qqtcss15Te6aN9HH', 1, '2025', 'vWPfxdVQcyYtm2Ge', 91.0000, 89.0000, 90.0000, 91.0000, 89.0000, 90.0000, 36.4000, 26.7000, 27.0000, 90.1000, 90.1000, 173.3524, 0.80, 1.30, 1.00, 1.85, 1.00, 90.1000, 173.3524, 11, 62.96, 1, 1, NULL, 5055.22, 0.00, 5055.22, 0.00, 0.00, 0.00, '{\"value\": 91, \"source\": \"performance_record\"}', '{\"value\": 89, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 90, \"quarterScores\": [{\"score\": 90, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.972Z', '2026-02-03T09:35:36.972Z', '2026-02-03T09:35:36.973Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('9qAf97iJqVDoH90j', 'BqPRlZFYwwG376AZ', 1, '2025', 'vWPfxdVQcyYtm2Ge', 87.0000, 87.0000, 87.0000, 87.0000, 87.0000, 87.0000, 34.8000, 26.1000, 26.1000, 87.0000, 87.0000, 318.2970, 3.00, 1.10, 0.80, 1.81, 0.77, 87.0000, 318.2970, 2, 96.30, 2, 2, NULL, 9282.03, 0.00, 9282.03, 0.00, 0.00, 0.00, '{\"value\": 87, \"source\": \"performance_record\"}', '{\"value\": 87, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 87, \"quarterScores\": [{\"score\": 87, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.961Z', '2026-02-03T09:35:36.962Z', '2026-02-03T09:35:36.962Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('A03N1wAzEuWvPb73', 'Fre5c30QkfgDhYPg', 1, '2025', 'vWPfxdVQcyYtm2Ge', 86.0000, 84.0000, 85.0000, 86.0000, 84.0000, 85.0000, 34.4000, 25.2000, 25.5000, 85.1000, 85.1000, 157.0946, 0.80, 1.30, 1.00, 1.78, 1.00, 85.1000, 157.0946, 18, 37.04, 3, 2, NULL, 4581.12, 0.00, 4581.12, 0.00, 0.00, 0.00, '{\"value\": 86, \"source\": \"performance_record\"}', '{\"value\": 84, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 85, \"quarterScores\": [{\"score\": 85, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.965Z', '2026-02-03T09:35:36.965Z', '2026-02-03T09:35:36.965Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('B8dlFGCPNPAaizwn', 'xxrgyt4dDrY0wYZs', 1, '2025', 'vWPfxdVQcyYtm2Ge', 90.0000, 90.0000, 90.0000, 90.0000, 90.0000, 90.0000, 36.0000, 27.0000, 27.0000, 90.0000, 90.0000, 155.5054, 1.00, 1.30, 0.80, 1.85, 0.90, 90.0000, 155.5054, 19, 33.33, 4, 7, NULL, 4534.78, 0.00, 4534.78, 0.00, 0.00, 0.00, '{\"value\": 90, \"source\": \"performance_record\"}', '{\"value\": 90, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 90, \"quarterScores\": [{\"score\": 90, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.975Z', '2026-02-03T09:35:36.975Z', '2026-02-03T09:35:36.975Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('BshMvBYJonoC1du3', 'EbPi9xDqgDWYb0CL', 1, '2025', 'vWPfxdVQcyYtm2Ge', 90.0000, 88.0000, 89.0000, 90.0000, 88.0000, 89.0000, 36.0000, 26.4000, 26.7000, 89.1000, 89.1000, 187.1568, 1.10, 1.30, 0.80, 1.84, 1.00, 89.1000, 187.1568, 6, 81.48, 1, 3, NULL, 5457.78, 0.00, 5457.78, 0.00, 0.00, 0.00, '{\"value\": 90, \"source\": \"performance_record\"}', '{\"value\": 88, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 89, \"quarterScores\": [{\"score\": 89, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.964Z', '2026-02-03T09:35:36.964Z', '2026-02-03T09:35:36.965Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('DuhxWs4sP0OB5MtQ', 'IULJmYjMyXorOru3', 1, '2025', 'vWPfxdVQcyYtm2Ge', 83.0000, 81.0000, 82.0000, 83.0000, 81.0000, 82.0000, 33.2000, 24.3000, 24.6000, 82.1000, 82.1000, 148.0374, 1.00, 1.30, 0.80, 1.73, 1.00, 82.1000, 148.0374, 21, 25.93, 4, 9, NULL, 4317.00, 0.00, 4317.00, 0.00, 0.00, 0.00, '{\"value\": 83, \"source\": \"performance_record\"}', '{\"value\": 81, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 82, \"quarterScores\": [{\"score\": 82, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.967Z', '2026-02-03T09:35:36.967Z', '2026-02-03T09:35:36.967Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('eO8Fr7Iw4IxqsyXM', 'ALRVuAaWddFzdu7h', 1, '2025', 'vWPfxdVQcyYtm2Ge', 85.0000, 83.0000, 84.0000, 85.0000, 83.0000, 84.0000, 34.0000, 24.9000, 25.2000, 84.1000, 84.1000, 169.8489, 1.10, 1.30, 0.80, 1.76, 1.00, 84.1000, 169.8489, 13, 55.56, 1, 6, NULL, 4953.05, 0.00, 4953.05, 0.00, 0.00, 0.00, '{\"value\": 85, \"source\": \"performance_record\"}', '{\"value\": 83, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 84, \"quarterScores\": [{\"score\": 84, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.961Z', '2026-02-03T09:35:36.961Z', '2026-02-03T09:35:36.961Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('gPONqTZ8K6WX8Uvx', 'LIbzH09aNTu9LPiZ', 1, '2025', 'vWPfxdVQcyYtm2Ge', 96.0000, 94.0000, 95.0000, 96.0000, 94.0000, 95.0000, 38.4000, 28.2000, 28.5000, 95.1000, 95.1000, 221.4489, 1.10, 1.30, 0.80, 1.92, 1.06, 95.1000, 221.4489, 3, 92.59, 1, 1, NULL, 6457.79, 0.00, 6457.79, 0.00, 0.00, 0.00, '{\"value\": 96, \"source\": \"performance_record\"}', '{\"value\": 94, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 95, \"quarterScores\": [{\"score\": 95, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.969Z', '2026-02-03T09:35:36.969Z', '2026-02-03T09:35:36.969Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('iDWdLVsJgoKoCqzE', '0s4u0CI64MgvYpM4', 1, '2025', 'vWPfxdVQcyYtm2Ge', 84.0000, 82.0000, 83.0000, 84.0000, 82.0000, 83.0000, 33.6000, 24.6000, 24.9000, 83.1000, 83.1000, 165.9344, 1.10, 1.30, 0.80, 1.74, 1.00, 83.1000, 165.9344, 14, 51.85, 3, 7, NULL, 4838.90, 0.00, 4838.90, 0.00, 0.00, 0.00, '{\"value\": 84, \"source\": \"performance_record\"}', '{\"value\": 82, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 83, \"quarterScores\": [{\"score\": 83, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.956Z', '2026-02-03T09:35:36.957Z', '2026-02-03T09:35:36.958Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('j4gTn81WrIZLNIap', 'cDsFeXUrthIIC3ER', 1, '2025', 'vWPfxdVQcyYtm2Ge', 92.0000, 90.0000, 91.0000, 92.0000, 90.0000, 91.0000, 36.8000, 27.0000, 27.3000, 91.1000, 91.1000, 177.0841, 1.00, 1.30, 0.80, 1.87, 1.00, 91.1000, 177.0841, 10, 66.67, 2, 3, NULL, 5164.04, 0.00, 5164.04, 0.00, 0.00, 0.00, '{\"value\": 92, \"source\": \"performance_record\"}', '{\"value\": 90, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 91, \"quarterScores\": [{\"score\": 91, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.963Z', '2026-02-03T09:35:36.963Z', '2026-02-03T09:35:36.963Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('lofYK7awrxMvZFyf', '9xgYQ4MYWRZ8Fh4u', 1, '2025', 'vWPfxdVQcyYtm2Ge', 82.0000, 82.0000, 82.0000, 82.0000, 82.0000, 82.0000, 32.8000, 24.6000, 24.6000, 82.0000, 82.0000, 147.8571, 1.00, 1.30, 0.80, 1.73, 1.00, 82.0000, 147.8571, 22, 22.22, 4, 10, NULL, 4311.74, 0.00, 4311.74, 0.00, 0.00, 0.00, '{\"value\": 82, \"source\": \"performance_record\"}', '{\"value\": 82, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 82, \"quarterScores\": [{\"score\": 82, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.960Z', '2026-02-03T09:35:36.960Z', '2026-02-03T09:35:36.961Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('Ml0dn39qUwyv1QMX', 'Kr7ubEuz626z45Tr', 1, '2025', 'vWPfxdVQcyYtm2Ge', 87.0000, 85.0000, 86.0000, 87.0000, 85.0000, 86.0000, 34.8000, 25.5000, 25.8000, 86.1000, 86.1000, 186.4312, 1.10, 1.30, 0.80, 1.79, 1.06, 86.1000, 186.4312, 7, 77.78, 1, 4, NULL, 5436.62, 0.00, 5436.62, 0.00, 0.00, 0.00, '{\"value\": 87, \"source\": \"performance_record\"}', '{\"value\": 85, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 86, \"quarterScores\": [{\"score\": 86, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.968Z', '2026-02-03T09:35:36.968Z', '2026-02-03T09:35:36.968Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('N6ZiT9Zr7o2Fx8iV', 'BTBIiv5yHnfkyeKb', 1, '2025', 'vWPfxdVQcyYtm2Ge', 95.0000, 93.0000, 94.0000, 95.0000, 93.0000, 94.0000, 38.0000, 27.9000, 28.2000, 94.1000, 94.1000, 187.3291, 1.00, 1.30, 0.80, 1.91, 1.00, 94.1000, 187.3291, 5, 85.19, 2, 1, NULL, 5462.80, 0.00, 5462.80, 0.00, 0.00, 0.00, '{\"value\": 95, \"source\": \"performance_record\"}', '{\"value\": 93, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 94, \"quarterScores\": [{\"score\": 94, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.962Z', '2026-02-03T09:35:36.962Z', '2026-02-03T09:35:36.963Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('oICDjme8nevtX5rR', '6aha8mGPcBt2T2L7', 1, '2025', 'vWPfxdVQcyYtm2Ge', 83.0000, 83.0000, 83.0000, 83.0000, 83.0000, 83.0000, 33.2000, 24.9000, 24.9000, 83.0000, 83.0000, 150.9579, 1.00, 1.30, 0.80, 1.74, 1.00, 83.0000, 150.9579, 20, 29.63, 3, 8, NULL, 4402.16, 0.00, 4402.16, 0.00, 0.00, 0.00, '{\"value\": 83, \"source\": \"performance_record\"}', '{\"value\": 83, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 83, \"quarterScores\": [{\"score\": 83, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.959Z', '2026-02-03T09:35:36.960Z', '2026-02-03T09:35:36.960Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('pqJKCJmFjSaU6LvT', 'IdfqHfaqF25MD78C', 1, '2025', 'vWPfxdVQcyYtm2Ge', 85.0000, 85.0000, 85.0000, 85.0000, 85.0000, 85.0000, 34.0000, 25.5000, 25.5000, 85.0000, 85.0000, 137.1949, 1.00, 1.10, 0.80, 1.78, 1.03, 85.0000, 137.1949, 24, 14.81, 1, 12, NULL, 4000.81, 0.00, 4000.81, 0.00, 0.00, 0.00, '{\"value\": 85, \"source\": \"performance_record\"}', '{\"value\": 85, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 85, \"quarterScores\": [{\"score\": 85, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.966Z', '2026-02-03T09:35:36.966Z', '2026-02-03T09:35:36.966Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('qlNTVn1E9EYfz8m3', 'Zf2TO8nUll7qk2b8', 1, '2025', 'vWPfxdVQcyYtm2Ge', 91.0000, 91.0000, 91.0000, 91.0000, 91.0000, 91.0000, 36.4000, 27.3000, 27.3000, 91.0000, 91.0000, 120.0691, 1.00, 1.00, 0.80, 1.87, 0.88, 91.0000, 120.0691, 25, 11.11, 2, 13, NULL, 3501.40, 0.00, 3501.40, 0.00, 0.00, 0.00, '{\"value\": 91, \"source\": \"performance_record\"}', '{\"value\": 91, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 91, \"quarterScores\": [{\"score\": 91, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.975Z', '2026-02-03T09:35:36.976Z', '2026-02-03T09:35:36.976Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('r7A9YYHcjG0XEGCy', 'rRaokmUmAVXtkaRu', 1, '2025', 'vWPfxdVQcyYtm2Ge', 89.0000, 89.0000, 89.0000, 89.0000, 89.0000, 89.0000, 35.6000, 26.7000, 26.7000, 89.0000, 89.0000, 172.8379, 1.00, 1.10, 0.80, 1.84, 1.20, 89.0000, 172.8379, 12, 59.26, 1, 4, NULL, 5040.22, 0.00, 5040.22, 0.00, 0.00, 0.00, '{\"value\": 89, \"source\": \"performance_record\"}', '{\"value\": 89, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 89, \"quarterScores\": [{\"score\": 89, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.973Z', '2026-02-03T09:35:36.973Z', '2026-02-03T09:35:36.973Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('RcS2NR2RyZZ4YOhI', '4Yc3pjFRO7SACMSC', 1, '2025', 'vWPfxdVQcyYtm2Ge', 89.0000, 87.0000, 88.0000, 89.0000, 87.0000, 88.0000, 35.6000, 26.1000, 26.4000, 88.1000, 88.1000, 500.3984, 3.00, 1.30, 0.80, 1.82, 1.00, 88.1000, 500.3984, 1, 100.00, 1, 1, NULL, 14592.38, 0.00, 14592.38, 0.00, 0.00, 0.00, '{\"value\": 89, \"source\": \"performance_record\"}', '{\"value\": 87, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 88, \"quarterScores\": [{\"score\": 88, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.958Z', '2026-02-03T09:35:36.958Z', '2026-02-03T09:35:36.958Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('ssQ4MXL73E9atejV', 'NBwpI13bBbTJGjwY', 1, '2025', 'vWPfxdVQcyYtm2Ge', 88.0000, 86.0000, 87.0000, 88.0000, 86.0000, 87.0000, 35.2000, 25.8000, 26.1000, 87.1000, 87.1000, 180.2480, 1.10, 1.30, 0.80, 1.81, 1.00, 87.1000, 180.2480, 9, 70.37, 1, 5, NULL, 5256.31, 0.00, 5256.31, 0.00, 0.00, 0.00, '{\"value\": 88, \"source\": \"performance_record\"}', '{\"value\": 86, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 87, \"quarterScores\": [{\"score\": 87, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.970Z', '2026-02-03T09:35:36.971Z', '2026-02-03T09:35:36.971Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('SZrCxa7cy3uuZ4fu', 'uW6c7E69lecxMM0c', 1, '2025', 'vWPfxdVQcyYtm2Ge', 81.0000, 81.0000, 81.0000, 81.0000, 81.0000, 81.0000, 32.4000, 24.3000, 24.3000, 81.0000, 81.0000, 158.9605, 1.10, 1.30, 0.80, 1.72, 1.00, 81.0000, 158.9605, 17, 40.74, 2, 8, NULL, 4635.53, 0.00, 4635.53, 0.00, 0.00, 0.00, '{\"value\": 81, \"source\": \"performance_record\"}', '{\"value\": 81, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 81, \"quarterScores\": [{\"score\": 81, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.973Z', '2026-02-03T09:35:36.974Z', '2026-02-03T09:35:36.974Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('x38uKIrY7JMq7uQH', 'OuM2daatV8gWJpiI', 1, '2025', 'vWPfxdVQcyYtm2Ge', 84.0000, 84.0000, 84.0000, 84.0000, 84.0000, 84.0000, 33.6000, 25.2000, 25.2000, 84.0000, 84.0000, 118.5825, 1.00, 1.00, 0.80, 1.76, 1.00, 84.0000, 118.5825, 26, 7.41, 3, 14, NULL, 3458.05, 0.00, 3458.05, 0.00, 0.00, 0.00, '{\"value\": 84, \"source\": \"performance_record\"}', '{\"value\": 84, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 84, \"quarterScores\": [{\"score\": 84, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.971Z', '2026-02-03T09:35:36.972Z', '2026-02-03T09:35:36.972Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');
INSERT INTO `three_dimensional_calculation_results` VALUES ('zsSmmd5a7S3v8UMK', 'lSBwKv6QG9O3EFsr', 1, '2025', 'vWPfxdVQcyYtm2Ge', 94.0000, 92.0000, 93.0000, 94.0000, 92.0000, 93.0000, 37.6000, 27.6000, 27.9000, 93.1000, 93.1000, 183.8828, 1.00, 1.30, 0.80, 1.90, 1.00, 93.1000, 183.8828, 8, 74.07, 3, 2, NULL, 5362.31, 0.00, 5362.31, 0.00, 0.00, 0.00, '{\"value\": 94, \"source\": \"performance_record\"}', '{\"value\": 92, \"source\": \"performance_record\"}', '{\"year\": \"2025\", \"source\": \"performance_record_yearly_average\", \"averageScore\": 93, \"quarterScores\": [{\"score\": 93, \"period\": \"2025Q4\"}], \"validQuarters\": 1}', 'weighted_sum', '{\"method\": \"weighted_sum\", \"normalizationMethod\": \"none\"}', '2026-02-03T09:35:36.970Z', '2026-02-03T09:35:36.970Z', '2026-02-03T09:35:36.970Z', 100.00, 80.00, 0, NULL, 'approved', '系统自动批准', NULL, '2026-02-03 17:35:37', NULL, NULL, NULL, '2026-02-03 17:35:37', 1, '51d8bcc23b510771d9a4bd3c9995b62e', NULL, '2026-02-03 17:15:50', '2026-02-03 17:35:37');

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
-- Records of three_dimensional_weight_configs
-- ----------------------------
INSERT INTO `three_dimensional_weight_configs` VALUES (1, '532', 'DEFAULT_CONFIG', '系统默认的三维权重配置', 0.400, 0.300, 0.300, 0.400, 0.300, 0.200, 0.100, 0.250, 0.300, 0.200, 0.150, 0.100, 0.250, 0.200, 0.150, 0.150, 0.100, 0.100, 0.050, 0.200, 1.500, 1.200, NULL, NULL, NULL, NULL, 'weighted_sum', 'none', NULL, NULL, NULL, '2025-11-03 00:00:00', NULL, '1', NULL, 0, NULL, 'active', '1', '51d8bcc23b510771d9a4bd3c9995b62e', '2025-11-04 18:03:01', '2026-02-03 10:36:44');

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

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1PJ4LLB7uQpD9g0K', 'dongnaikun', '$2a$12$S8JyI6itoCEHhRon1qQzBO/QBTTW23LcbDV/Cigb8VQeYTu8PYmh6', '董乃坤', 'IdfqHfaqF25MD78C', NULL, NULL, 'QIUgWkY0NMp444Qt', 'dept_tech', 1, '2026-02-03 17:14:12', '2025-12-25 11:00:40', '2026-02-03 17:14:12');
INSERT INTO `users` VALUES ('51d8bcc23b510771d9a4bd3c9995b62e', 'liujing', '$2a$12$3b6X/tQxv1hkJvDCHYdBnOibcMRwXjP/UIpbzsG99aU29NWsoC2dK', '刘静', NULL, NULL, NULL, 'L30E54H8hq3fFZjs', 'DsYMP3aBv5fLHeuW', 1, '2026-02-03 14:30:17', '2026-02-02 17:01:39', '2026-02-03 14:30:17');
INSERT INTO `users` VALUES ('51fabbac53d3367aa6e4ff97805c4d84', 'lilei', '$2a$12$jtTHNkEF96r1DiGmQFL1o.gyB3km3kMhKZK6g4YFRMksXhNG/0V/S', '李磊', NULL, NULL, NULL, 'QIUgWkY0NMp444Qt', 'dept_tech', 1, '2026-01-16 18:41:53', '2026-01-16 18:41:39', '2026-02-02 11:19:31');
INSERT INTO `users` VALUES ('69f40ae09c93fe3b266e64e95b431933', 'lanmingwei', '$2a$12$OizdX/px.PhnY7TzTaveZuALDSkDxiVN47MZS.zHxja5nSrbVt3qW', '兰明伟', NULL, NULL, NULL, 'GlpDpQngrkgDMNh2', 'ZE5q0Z1U3fCr7JsW', 1, NULL, '2026-02-02 14:56:21', '2026-02-02 14:56:21');
INSERT INTO `users` VALUES ('82L6gsMTlIu3gnzh', 'liujiaxing', '$2a$12$WcXo9Ia69iwsBWpH/ttpTurrgbNyWjU1HZMZXFByxJ/X8UPMXo0H.', '刘嘉兴', 'j46LEwS76rO6rSi7', '13211115555@133.com', '13211115555', 'QIUgWkY0NMp444Qt', 'dept_tech', 1, NULL, '2025-12-25 15:45:57', '2026-02-02 11:19:41');
INSERT INTO `users` VALUES ('admin_user', 'admin', '$2a$12$rHTfIEK6x9nftgeNJuIpo.12qm0UPaJu4XzF7hCoGEIr2.FG0ypqK', '系统管理员', 'emp_admin', 'admin@example.com', NULL, 'vd7p1lxn9lOaRKKJ', NULL, 1, '2026-02-02 10:21:49', '2025-12-25 10:12:57', '2026-02-02 10:21:49');
INSERT INTO `users` VALUES ('c1eed6e3c69694efb6633a1a17f7a1eb', 'lihuaijian', '$2a$12$POThbkrJb0dtHc1sXzUOWupPgdyhWuPjtIUkKBauA00MGcdUa0vei', '李怀健', NULL, NULL, NULL, 'CdFv8NCPauLjt7se', 'NUd4vzaNoxq57jrS', 1, '2026-02-03 16:18:38', '2026-02-02 14:55:26', '2026-02-03 16:18:38');
INSERT INTO `users` VALUES ('gTgqsvcJXtqwFuiI', 'dalaili', '$2a$12$sFaLCocDUMO7BMb4lEN1AOc6WABu8Hg4q.RyStzm92WwN0HnBryTC', '笪莱利', NULL, NULL, NULL, 'Qz8jzlt6I2qitXpw', 'DsYMP3aBv5fLHeuW', 1, '2026-02-02 14:54:45', '2025-12-29 15:18:37', '2026-02-02 14:54:45');
INSERT INTO `users` VALUES ('lpiNsp56xoXddcMO', 'luozhaowen', '$2a$12$ScxrJ5bTRJEuA6JGMj1kTu67CTZ3NFYhaLmpX/uvZQEU7FfjF9AdK', '罗朝文', 'BqPRlZFYwwG376AZ', NULL, NULL, 'GlpDpQngrkgDMNh2', 'DsYMP3aBv5fLHeuW', 1, '2025-12-25 15:46:29', '2025-12-25 11:03:37', '2025-12-29 10:17:59');
INSERT INTO `users` VALUES ('nF95BFf8NtITeMTG', 'kangjilan', '$2a$12$dHpnZ4ZO0XfANtRq7kPzcuviCB8uzSHaR.hUDAGCyjguZAzyebEmu', '康纪兰', '5NQDb4fAifAEuuK5', NULL, NULL, 'QIUgWkY0NMp444Qt', 'dept_tech', 1, '2026-02-03 17:13:58', '2025-12-25 11:01:23', '2026-02-03 17:13:58');
INSERT INTO `users` VALUES ('T4m0FHzpiX6Bfo5b', 'pmbjwang', '$2a$12$3EHIcvR.Dw/2F2k1yfrH2uAJbFq0AC2KY1xYzcttAu1hvPXMsus/e', '王项目经理', 'JGDxmyz6YvhgVXzm', NULL, NULL, 'CdFv8NCPauLjt7se', 'NUd4vzaNoxq57jrS', 0, '2026-01-28 11:19:00', '2025-12-25 19:25:17', '2026-02-02 14:55:33');
INSERT INTO `users` VALUES ('ZJ0wtB2dshDttI5I', 'lifengxiao', '$2a$12$ggs7hPeuBtoWHRbYNwZOEO2ZCUHFdHN3c.I/GSjHUFlm982Zdx5jK', '李风肖', NULL, NULL, NULL, 'Eln8qiLDJhs73Sc7', 'dept_operation', 1, '2026-02-03 16:39:59', '2025-12-29 15:20:41', '2026-02-03 16:39:59');

SET FOREIGN_KEY_CHECKS = 1;
