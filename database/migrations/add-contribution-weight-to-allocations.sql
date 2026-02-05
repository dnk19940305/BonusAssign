-- 为 project_bonus_allocations 表添加 contribution_weight 字段
-- 用于支持成员贡献权重的百分比存储（0-100）

USE bonus_system;

-- 添加 contribution_weight 字段
ALTER TABLE `project_bonus_allocations`
ADD COLUMN `contribution_weight` decimal(5, 2) NOT NULL DEFAULT 100.00 COMMENT '贡献权重（百分比，0-100）' 
AFTER `participation_ratio`;

-- 更新说明
-- 1. contribution_weight 默认值为 100，表示 100% 贡献
-- 2. 字段类型为 decimal(5,2)，支持 0.00 到 999.99 的范围
-- 3. 实际使用范围是 0-100，表示百分比
-- 4. 在奖金计算时需要除以100转换为系数

SELECT '✅ contribution_weight 字段添加成功' as result;
