-- 创建绩效三维评分录入表
-- 用于存储HR录入的原始绩效分数，与计算结果表分离

-- 临时禁用严格模式
SET SESSION sql_mode = '';

DROP TABLE IF EXISTS `performance_three_dimensional_scores`;

CREATE TABLE `performance_three_dimensional_scores` (
  `id` VARCHAR(50) NOT NULL COMMENT '记录ID',
  `employee_id` VARCHAR(50) NOT NULL COMMENT '员工ID',
  `calculation_period` VARCHAR(20) NOT NULL COMMENT '考核期间 (如: 2025Q4, 2025-12)',
  
  -- 三维评分（原始分数）
  `position_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '岗位评分 (0-100)',
  `performance_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '绩效评分 (0-100)',
  `profit_contribution` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '利润贡献 (万元，0-10000)',
  
  -- 审核状态
  `review_status` VARCHAR(20) NOT NULL DEFAULT 'approved' COMMENT '审核状态: pending-待审核, approved-已批准, rejected-已拒绝',
  `review_comments` TEXT COMMENT '审核备注',
  `reviewed_by` VARCHAR(50) DEFAULT NULL COMMENT '审核人ID',
  `reviewed_at` DATETIME DEFAULT NULL COMMENT '审核时间',
  
  -- 元数据
  `comments` TEXT COMMENT '备注信息',
  `source` VARCHAR(20) DEFAULT 'manual' COMMENT '数据来源: manual-手工录入, import-批量导入, system-系统生成',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人ID',
  `updated_by` VARCHAR(50) DEFAULT NULL COMMENT '更新人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_period` (`employee_id`, `calculation_period`),
  KEY `idx_period` (`calculation_period`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_review_status` (`review_status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='绩效三维评分录入表';

-- 说明：
-- 1. 此表存储HR录入的原始绩效分数
-- 2. 每个员工每个期间只能有一条记录（唯一索引）
-- 3. 分数范围：岗位评分(0-100)、绩效评分(0-100)、利润贡献(0-10000万元)
-- 4. 默认自动批准（review_status='approved'），可后续修改为需要审核
-- 5. 数据来源标识：手工录入、批量导入、系统生成
