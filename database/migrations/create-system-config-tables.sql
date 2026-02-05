-- ===================================================
-- 系统配置表迁移脚本
-- 创建时间: 2025-11-17
-- 说明: 创建系统配置相关表,支持动态配置管理
-- ===================================================

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL COMMENT '配置分类: basic/bonus/calculation/notification/security/feature',
  `key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `value` TEXT NOT NULL COMMENT '配置值(支持JSON)',
  `value_type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '值类型: string/number/boolean/json',
  `description` TEXT COMMENT '配置说明',
  `is_encrypted` TINYINT DEFAULT 0 COMMENT '是否加密存储',
  `is_editable` TINYINT DEFAULT 1 COMMENT '是否可在UI编辑',
  `validation_rule` JSON COMMENT '验证规则',
  `default_value` TEXT COMMENT '默认值',
  `updated_by` INT COMMENT '更新人ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_category_key` (`category`, `key`),
  INDEX `idx_category` (`category`),
  INDEX `idx_editable` (`is_editable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 配置变更历史表
CREATE TABLE IF NOT EXISTS `system_config_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_id` INT NOT NULL COMMENT '配置ID',
  `category` VARCHAR(50) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `old_value` TEXT COMMENT '旧值',
  `new_value` TEXT COMMENT '新值',
  `changed_by` INT COMMENT '变更人ID',
  `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `change_reason` TEXT COMMENT '变更原因',
  INDEX `idx_config_id` (`config_id`),
  INDEX `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配置变更历史表';

-- 业务规则配置表
CREATE TABLE IF NOT EXISTS `business_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `category` VARCHAR(50) NOT NULL COMMENT '规则分类',
  `description` TEXT COMMENT '规则描述',
  `conditions` JSON NOT NULL COMMENT '条件配置',
  `actions` JSON NOT NULL COMMENT '动作配置',
  `priority` INT DEFAULT 0 COMMENT '优先级',
  `enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
  `created_by` INT NOT NULL,
  `updated_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_enabled` (`category`, `enabled`),
  INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务规则配置表';

-- 审批工作流配置表
CREATE TABLE IF NOT EXISTS `approval_workflows` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '工作流名称',
  `description` TEXT COMMENT '描述',
  `trigger_type` VARCHAR(50) NOT NULL COMMENT '触发类型',
  `steps` JSON NOT NULL COMMENT '步骤配置',
  `enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
  `created_by` INT NOT NULL,
  `updated_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_trigger_enabled` (`trigger_type`, `enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批工作流配置表';

-- ===================================================
-- 初始化默认配置数据
-- ===================================================

-- 基础配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `default_value`) VALUES
('basic', 'systemName', '奖金模拟系统', 'string', '系统名称', 1, '奖金模拟系统'),
('basic', 'companyName', '示例公司', 'string', '公司名称', 1, '示例公司'),
('basic', 'version', '1.0.0', 'string', '系统版本', 0, '1.0.0'),
('basic', 'timezone', 'Asia/Shanghai', 'string', '时区设置', 1, 'Asia/Shanghai'),
('basic', 'language', 'zh-CN', 'string', '系统语言', 1, 'zh-CN'),
('basic', 'fiscalYearStart', '1', 'number', '财年开始月份(1-12)', 1, '1'),
('basic', 'bonusCycle', 'quarterly', 'string', '奖金周期:monthly/quarterly/yearly', 1, 'quarterly'),
('basic', 'currency', 'CNY', 'string', '货币单位', 1, 'CNY'),
('basic', 'decimalPlaces', '2', 'number', '小数位数', 1, '2');

-- 奖金配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `validation_rule`, `default_value`) VALUES
('bonus', 'profitWeight', '0.4', 'number', '利润贡献权重', 1, '{"min": 0, "max": 1, "sum": "profitWeight+positionWeight+performanceWeight=1"}', '0.4'),
('bonus', 'positionWeight', '0.3', 'number', '岗位价值权重', 1, '{"min": 0, "max": 1}', '0.3'),
('bonus', 'performanceWeight', '0.3', 'number', '绩效表现权重', 1, '{"min": 0, "max": 1}', '0.3'),
('bonus', 'defaultPoolRatio', '0.1', 'number', '默认奖金池比例', 1, '{"min": 0, "max": 1}', '0.1'),
('bonus', 'reserveRatio', '0.05', 'number', '预留调节金比例', 1, '{"min": 0, "max": 0.5}', '0.05'),
('bonus', 'specialRatio', '0.05', 'number', '特别奖励基金比例', 1, '{"min": 0, "max": 0.5}', '0.05'),
('bonus', 'minBonusRatio', '0.5', 'number', '最小奖金系数', 1, '{"min": 0, "max": 5}', '0.5'),
('bonus', 'maxBonusRatio', '3.0', 'number', '最大奖金系数', 1, '{"min": 0, "max": 10}', '3.0');

-- 计算配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `default_value`) VALUES
('calculation', 'defaultAlgorithm', 'three_dimensional', 'string', '默认计算算法', 1, 'three_dimensional'),
('calculation', 'precision', '4', 'number', '计算精度(小数位)', 1, '4'),
('calculation', 'roundingRule', 'round_half_up', 'string', '舍入规则', 1, 'round_half_up'),
('calculation', 'enableConcurrent', 'true', 'boolean', '启用并发计算', 1, 'true'),
('calculation', 'maxThreads', '4', 'number', '最大线程数', 1, '4'),
('calculation', 'batchSize', '100', 'number', '批处理大小', 1, '100'),
('calculation', 'timeout', '300000', 'number', '超时时间(毫秒)', 1, '300000'),
('calculation', 'retryCount', '3', 'number', '重试次数', 1, '3'),
('calculation', 'cacheStrategy', 'memory', 'string', '缓存策略:memory/redis/none', 1, 'memory'),
('calculation', 'cacheExpiry', '3600', 'number', '缓存过期时间(秒)', 1, '3600');

-- 通知配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `default_value`) VALUES
('notification', 'emailEnabled', 'false', 'boolean', '启用邮件通知', 1, 'false'),
('notification', 'smtpHost', '', 'string', 'SMTP服务器地址', 1, ''),
('notification', 'smtpPort', '587', 'number', 'SMTP端口', 1, '587'),
('notification', 'senderEmail', '', 'string', '发件人邮箱', 1, ''),
('notification', 'emailEvents', '["bonus_calculated", "bonus_approved"]', 'json', '邮件通知事件', 1, '[]'),
('notification', 'systemNotificationEnabled', 'true', 'boolean', '启用系统通知', 1, 'true'),
('notification', 'notificationRetentionDays', '30', 'number', '通知保留天数', 1, '30'),
('notification', 'maxNotificationCount', '1000', 'number', '最大通知数量', 1, '1000');

-- 安全配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `default_value`) VALUES
('security', 'passwordMinLength', '8', 'number', '密码最小长度', 1, '8'),
('security', 'passwordRequirements', '["uppercase", "lowercase", "number"]', 'json', '密码要求', 1, '["uppercase", "lowercase", "number"]'),
('security', 'passwordExpireDays', '90', 'number', '密码过期天数(0=不过期)', 1, '90'),
('security', 'maxLoginFailures', '5', 'number', '最大登录失败次数', 1, '5'),
('security', 'lockoutDuration', '30', 'number', '锁定时长(分钟)', 1, '30'),
('security', 'sessionTimeout', '7200', 'number', '会话超时时间(秒)', 1, '7200'),
('security', 'enableRememberMe', 'true', 'boolean', '启用记住我功能', 1, 'true'),
('security', 'enableSingleSignOn', 'false', 'boolean', '启用单点登录', 1, 'false'),
('security', 'enableIpWhitelist', 'false', 'boolean', '启用IP白名单', 1, 'false'),
('security', 'ipWhitelist', '', 'string', 'IP白名单(逗号分隔)', 1, '');

-- 功能开关配置
INSERT INTO `system_configs` (`category`, `key`, `value`, `value_type`, `description`, `is_editable`, `default_value`) VALUES
('feature', 'enableEmployeeManagement', 'true', 'boolean', '启用员工管理', 1, 'true'),
('feature', 'enableDepartmentManagement', 'true', 'boolean', '启用部门管理', 1, 'true'),
('feature', 'enablePositionManagement', 'true', 'boolean', '启用岗位管理', 1, 'true'),
('feature', 'enableBonusCalculation', 'true', 'boolean', '启用奖金计算', 1, 'true'),
('feature', 'enableSimulationAnalysis', 'true', 'boolean', '启用模拟分析', 1, 'true'),
('feature', 'enableProjectCollaboration', 'true', 'boolean', '启用项目协作', 1, 'true'),
('feature', 'enableAdvancedReporting', 'true', 'boolean', '启用高级报表', 1, 'true'),
('feature', 'enableDataExport', 'true', 'boolean', '启用数据导出', 1, 'true');

-- 完成提示
SELECT '✅ 系统配置表创建完成' AS status;
SELECT COUNT(*) AS total_configs FROM system_configs;
