-- =====================================================
-- 优化团队申请状态字段：从 varchar 改为 tinyint
-- =====================================================
-- 创建时间: 2026-01-16
-- 说明: 
--   1. 使用整数类型存储状态，提升性能和可维护性
--   2. 添加状态常量对照表
--   3. 保持数据一致性

USE bonus_system;

-- =====================================================
-- 第一步：添加新的 status_code 字段（临时字段）
-- =====================================================
ALTER TABLE `project_team_applications`
ADD COLUMN `status_code` tinyint NOT NULL DEFAULT 0 COMMENT '申请状态码（0-待审批 1-已批准 2-已拒绝 3-需修改 4-已取消）'
AFTER `status`;

-- =====================================================
-- 第二步：数据迁移 - 将字符串状态转换为整数
-- =====================================================
UPDATE `project_team_applications` 
SET `status_code` = CASE 
    WHEN `status` = 'pending' THEN 0
    WHEN `status` = 'approved' THEN 1
    WHEN `status` = 'rejected' THEN 2
    WHEN `status` = 'needs_modification' THEN 3
    WHEN `status` = 'cancelled' THEN 4
    ELSE 0  -- 默认为待审批
END;

-- =====================================================
-- 第三步：验证数据迁移
-- =====================================================
SELECT 
    `status` as old_status,
    `status_code` as new_status,
    COUNT(*) as count
FROM `project_team_applications`
GROUP BY `status`, `status_code`
ORDER BY `status_code`;

-- =====================================================
-- 第四步：删除旧的 status 字段，重命名 status_code
-- =====================================================
-- 注意：执行此步骤前请确保代码已更新！
-- ALTER TABLE `project_team_applications` DROP COLUMN `status`;
-- ALTER TABLE `project_team_applications` CHANGE COLUMN `status_code` `status` tinyint NOT NULL DEFAULT 0 COMMENT '申请状态码（0-待审批 1-已批准 2-已拒绝 3-需修改 4-已取消）';

-- =====================================================
-- 状态码对照表
-- =====================================================
-- 0: pending (待审批) - 申请已提交，等待审批
-- 1: approved (已批准) - 申请已通过审批
-- 2: rejected (已拒绝) - 申请被拒绝
-- 3: needs_modification (需修改) - 申请需要修改后重新提交
-- 4: cancelled (已取消) - 申请被申请人主动取消

-- =====================================================
-- 添加索引（如果需要）
-- =====================================================
-- CREATE INDEX `idx_status_code` ON `project_team_applications`(`status_code`);

SELECT '✅ 状态字段迁移脚本准备完成！' as result;
SELECT '⚠️  请先更新代码中的状态值，然后再执行第四步的字段替换操作' as warning;
