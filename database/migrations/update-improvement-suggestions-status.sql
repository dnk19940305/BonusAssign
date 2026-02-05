-- 修改改进建议状态字段为数字类型
-- 0: 待实施, 1: 待审核, 2: 已完成, -1: 已拒绝

-- 1. 添加新的数字状态字段
ALTER TABLE improvement_suggestions 
ADD COLUMN status_code TINYINT NOT NULL DEFAULT 0 COMMENT '状态码: 0-待实施, 1-待审核, 2-已完成, -1-已拒绝' 
AFTER status;

-- 2. 迁移旧数据
UPDATE improvement_suggestions 
SET status_code = CASE 
  WHEN status = 'pending' THEN 0
  WHEN status = 'in_progress' THEN 1
  WHEN status = 'completed' THEN 2
  ELSE 0
END;

-- 3. 添加审核相关字段
ALTER TABLE improvement_suggestions 
ADD COLUMN implementation_date DATETIME COMMENT '实施完成时间' AFTER completed_at,
ADD COLUMN implementation_feedback TEXT COMMENT '实施反馈' AFTER feedback,
ADD COLUMN reviewed_by VARCHAR(50) COMMENT '审核人ID' AFTER implementation_feedback,
ADD COLUMN reviewed_by_name VARCHAR(100) COMMENT '审核人姓名' AFTER reviewed_by,
ADD COLUMN reviewed_at DATETIME COMMENT '审核时间' AFTER reviewed_by_name,
ADD COLUMN review_comments TEXT COMMENT '审核意见' AFTER reviewed_at;

-- 4. 删除旧的字符串状态字段（可选，如果要完全切换）
ALTER TABLE improvement_suggestions DROP COLUMN status;

-- 5. 添加索引
ALTER TABLE improvement_suggestions 
ADD INDEX idx_status_code (status_code);
