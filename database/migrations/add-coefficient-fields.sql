-- ========================================
-- 奖金计算系数字段补充迁移脚本
-- 创建日期: 2025-11-13
-- 说明: 添加业务线系数、城市系数、时间系数相关字段
-- ========================================

-- 1. 创建城市字典表
CREATE TABLE IF NOT EXISTS cities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '城市名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '城市编码',
  tier VARCHAR(20) NOT NULL COMMENT '城市层级: tier1(一线),tier1_new(新一线),tier2(二线),tier3(三线)',
  coefficient DECIMAL(3,2) NOT NULL DEFAULT 1.00 COMMENT '城市系数 0.8-1.3',
  province VARCHAR(50) COMMENT '省份',
  description TEXT COMMENT '描述',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tier (tier),
  INDEX idx_status (status)
) COMMENT='城市字典表';

-- 2. 员工表添加业务线、城市、雇佣类型字段
-- 检查字段是否存在，避免重复添加
SET @dbname = 'bonus_system';
SET @tablename = 'employees';
SET @columnname = 'business_line_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL COMMENT ''业务线ID'' AFTER position_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加城市ID字段
SET @columnname = 'city_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL COMMENT ''城市ID'' AFTER business_line_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加雇佣类型字段
SET @columnname = 'employment_type';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) DEFAULT ''fulltime'' COMMENT ''雇佣类型: fulltime(全职),parttime(兼职),probation(试用期),intern(实习生)'' AFTER city_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加工作时间占比字段
SET @columnname = 'work_hours_ratio';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(3,2) DEFAULT 1.00 COMMENT ''工作时间占比 0.00-1.00'' AFTER employment_type')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. 奖金分配结果表添加系数字段
SET @tablename = 'bonusallocationresults';

-- 添加业务线系数字段
SET @columnname = 'businessLineCoefficient';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(3,2) DEFAULT 1.00 COMMENT ''业务线系数 0.8-1.5'' AFTER bonusCoefficient')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加城市系数字段
SET @columnname = 'cityCoefficient';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(3,2) DEFAULT 1.00 COMMENT ''城市系数 0.8-1.3'' AFTER businessLineCoefficient')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加时间系数字段
SET @columnname = 'timeCoefficient';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(3,2) DEFAULT 1.00 COMMENT ''时间系数 0.5-1.1'' AFTER cityCoefficient')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加岗位基准值快照字段
SET @columnname = 'benchmarkValue';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (TABLE_SCHEMA = @dbname)
   AND (TABLE_NAME = @tablename)
   AND (COLUMN_NAME = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(3,2) NULL COMMENT ''岗位基准值快照'' AFTER timeCoefficient')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. 创建岗位基准值调整历史表
CREATE TABLE IF NOT EXISTS position_benchmark_history (
  id VARCHAR(50) PRIMARY KEY,
  position_id VARCHAR(50) NOT NULL COMMENT '岗位ID',
  old_value DECIMAL(3,2) NOT NULL COMMENT '原基准值',
  new_value DECIMAL(3,2) NOT NULL COMMENT '新基准值',
  change_ratio DECIMAL(5,2) NOT NULL COMMENT '变化比例(%)',
  reason TEXT COMMENT '调整原因',
  approved_by VARCHAR(50) COMMENT '审批人ID',
  approved_at DATETIME COMMENT '审批时间',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending(待审批),approved(已批准),rejected(已拒绝)',
  created_by VARCHAR(50) NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (position_id) REFERENCES positions(id),
  INDEX idx_position (position_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) COMMENT='岗位基准值调整历史表';

-- 5. 初始化城市数据
INSERT INTO cities (id, name, code, tier, coefficient, province, description) VALUES
-- 一线城市 (系数: 1.2-1.3)
('city_beijing', '北京', 'BJ', 'tier1', 1.30, '北京', '首都，经济发达'),
('city_shanghai', '上海', 'SH', 'tier1', 1.30, '上海', '经济中心'),
('city_guangzhou', '广州', 'GZ', 'tier1', 1.25, '广东', '华南经济中心'),
('city_shenzhen', '深圳', 'SZ', 'tier1', 1.25, '广东', '科技创新中心'),

-- 新一线城市 (系数: 1.0-1.1)
('city_chengdu', '成都', 'CD', 'tier1_new', 1.10, '四川', '西南中心城市'),
('city_hangzhou', '杭州', 'HZ', 'tier1_new', 1.10, '浙江', '互联网产业发达'),
('city_wuhan', '武汉', 'WH', 'tier1_new', 1.05, '湖北', '中部交通枢纽'),
('city_xian', '西安', 'XA', 'tier1_new', 1.05, '陕西', '西北中心城市'),
('city_chongqing', '重庆', 'CQ', 'tier1_new', 1.05, '重庆', '西南重要城市'),
('city_nanjing', '南京', 'NJ', 'tier1_new', 1.08, '江苏', '长三角重要城市'),
('city_tianjin', '天津', 'TJ', 'tier1_new', 1.08, '天津', '直辖市'),
('city_suzhou', '苏州', 'SZ2', 'tier1_new', 1.08, '江苏', '制造业发达'),
('city_changsha', '长沙', 'CS', 'tier1_new', 1.00, '湖南', '中部城市'),
('city_zhengzhou', '郑州', 'ZZ', 'tier1_new', 1.00, '河南', '中原枢纽'),

-- 二线城市 (系数: 0.9-1.0)
('city_qingdao', '青岛', 'QD', 'tier2', 0.95, '山东', '沿海城市'),
('city_dalian', '大连', 'DL', 'tier2', 0.95, '辽宁', '东北重要港口'),
('city_ningbo', '宁波', 'NB', 'tier2', 0.95, '浙江', '港口城市'),
('city_xiamen', '厦门', 'XM', 'tier2', 0.95, '福建', '经济特区'),
('city_jinan', '济南', 'JN', 'tier2', 0.90, '山东', '省会城市'),
('city_hefei', '合肥', 'HF', 'tier2', 0.90, '安徽', '科教城市'),
('city_fuzhou', '福州', 'FZ', 'tier2', 0.90, '福建', '省会城市'),

-- 三线城市 (系数: 0.8-0.9)
('city_yangzhou', '扬州', 'YZ', 'tier3', 0.85, '江苏', '历史文化名城'),
('city_zhuhai', '珠海', 'ZH', 'tier3', 0.85, '广东', '宜居城市'),
('city_wuxi', '无锡', 'WX', 'tier3', 0.85, '江苏', '工业城市'),
('city_other', '其他城市', 'OTHER', 'tier3', 0.80, '其他', '其他地区')
ON DUPLICATE KEY UPDATE
  coefficient = VALUES(coefficient),
  description = VALUES(description),
  updated_at = CURRENT_TIMESTAMP;

-- 迁移完成提示
SELECT '✅ 数据库迁移完成：已添加业务线系数、城市系数、时间系数相关字段和表' as message;
