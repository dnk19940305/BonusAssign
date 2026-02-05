-- 移除 allocation_percentage 字段
-- 原因：该字段与项目奖金计算中的 participation_ratio 功能重复，造成混淆
-- 日期：2025-12-25

USE bonus_system;

-- 删除 project_members 表的 allocation_percentage 列
ALTER TABLE project_members DROP COLUMN allocation_percentage;

-- 注释说明：
-- allocation_percentage 原本用于团队申请时的分配比例（总和必须100%）
-- 但实际项目奖金计算使用的是 participation_ratio（参与度，可以任意值）
-- 删除此字段避免业务逻辑混淆，统一使用 participation_ratio
