-- 添加系数字段到三维计算结果表
-- 用于展示最终得分的计算过程，便于用户验证计算准确性

USE bonus_system;

-- 添加系数字段（如果字段已存在会报错，可以忽略）
ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `position_benchmark` DECIMAL(6, 2) NULL DEFAULT 1.00 COMMENT '岗位基准值系数 (0.1-3.0)' AFTER `final_score`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `city_coefficient` DECIMAL(4, 2) NULL DEFAULT 1.00 COMMENT '城市系数 (0.8-1.5)' AFTER `position_benchmark`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `business_line_coefficient` DECIMAL(4, 2) NULL DEFAULT 1.00 COMMENT '业务线系数 (0.8-1.5)' AFTER `city_coefficient`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `performance_coefficient` DECIMAL(4, 2) NULL DEFAULT 1.00 COMMENT '绩效系数 (0.5-2.0)' AFTER `business_line_coefficient`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `time_coefficient` DECIMAL(4, 2) NULL DEFAULT 1.00 COMMENT '时间系数 (0-1.2)' AFTER `performance_coefficient`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `base_three_dimensional_score` DECIMAL(8, 4) NULL DEFAULT NULL COMMENT '应用系数前的三维基础得分' AFTER `time_coefficient`;

ALTER TABLE `three_dimensional_calculation_results` 
ADD COLUMN `final_coefficient_score` DECIMAL(8, 4) NULL DEFAULT NULL COMMENT '应用所有系数后的最终系数得分' AFTER `base_three_dimensional_score`;

-- 添加索引以提高查询性能
CREATE INDEX `idx_coefficient_scores` ON `three_dimensional_calculation_results`(`bonus_pool_id`, `final_coefficient_score` DESC);

-- 添加注释说明
ALTER TABLE `three_dimensional_calculation_results` COMMENT = '三维计算结果表 - 包含完整的得分计算过程和各项系数';

-- 验证字段是否添加成功
SELECT 
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '数据类型',
    IS_NULLABLE AS '允许空值',
    COLUMN_DEFAULT AS '默认值',
    COLUMN_COMMENT AS '注释'
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'bonus_system'
    AND TABLE_NAME = 'three_dimensional_calculation_results'
    AND COLUMN_NAME IN (
        'position_benchmark',
        'city_coefficient', 
        'business_line_coefficient',
        'performance_coefficient',
        'time_coefficient',
        'base_three_dimensional_score',
        'final_coefficient_score'
    )
ORDER BY ORDINAL_POSITION;
