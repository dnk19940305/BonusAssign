-- ============================================
-- 清除项目相关数据脚本
-- 功能：清空所有项目相关表的数据，保留表结构
-- 注意：此操作不可逆，执行前请确认备份！
-- ============================================

USE bonus_system;

-- 禁用外键检查（避免删除顺序问题）
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 清除项目奖金相关数据
DELETE FROM project_bonus_allocations;
DELETE FROM project_bonus_calculation_history;
DELETE FROM project_bonus_pools;
DELETE FROM project_performance_manual;

-- 2. 清除项目成本数据
DELETE FROM project_costs;

-- 3. 清除项目执行跟踪数据
DELETE FROM project_executions;

-- 4. 清除项目成员数据
DELETE FROM project_members;

-- 5. 清除项目里程碑相关数据
DELETE FROM project_milestones;
DELETE FROM project_milestone_reminder_configs;
DELETE FROM project_milestone_reminder_logs;
DELETE FROM project_milestone_dependency_cache;
DELETE FROM project_milestone_impact_analysis;

-- 6. 清除项目进度日志
DELETE FROM project_progress_logs;

-- 7. 清除项目关键路径数据
DELETE FROM project_critical_paths;

-- 8. 清除项目业务线权重数据
DELETE FROM project_line_weights;

-- 9. 清除项目协作日志
DELETE FROM project_collaboration_logs;

-- 10. 清除项目审批流程数据
DELETE FROM project_approval_instances;
DELETE FROM project_approval_flows;

-- 11. 清除项目通知数据
DELETE FROM project_notifications;

-- 12. 清除项目需求和团队申请数据（如果存在这些表）
-- TRUNCATE TABLE project_team_applications;  -- 表不存在，注释掉
-- TRUNCATE TABLE project_requirements;       -- 表不存在，注释掉
-- TRUNCATE TABLE project_role_weights;         -- 表不存在，注释掉

-- 13. 最后清除项目主表
DELETE FROM projects;

-- 14. 清除员工利润贡献中与项目相关的数据
DELETE FROM employee_profit_contributions WHERE project_id IS NOT NULL;

-- 15. 清除利润数据中与项目相关的数据
DELETE FROM profit_data WHERE project_id IS NOT NULL;

-- 16. 清除通知中与项目相关的数据
DELETE FROM notifications WHERE project_id IS NOT NULL;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 验证清理结果
SELECT 
    'projects' AS table_name, COUNT(*) AS row_count FROM projects
UNION ALL
SELECT 'project_members', COUNT(*) FROM project_members
UNION ALL
SELECT 'project_milestones', COUNT(*) FROM project_milestones
UNION ALL
SELECT 'project_costs', COUNT(*) FROM project_costs
UNION ALL
SELECT 'project_bonus_pools', COUNT(*) FROM project_bonus_pools
UNION ALL
SELECT 'project_bonus_allocations', COUNT(*) FROM project_bonus_allocations
UNION ALL
SELECT 'project_bonus_calculation_history', COUNT(*) FROM project_bonus_calculation_history
UNION ALL
SELECT 'project_line_weights', COUNT(*) FROM project_line_weights
UNION ALL
SELECT 'project_executions', COUNT(*) FROM project_executions
UNION ALL
SELECT 'project_progress_logs', COUNT(*) FROM project_progress_logs
UNION ALL
SELECT 'project_collaboration_logs', COUNT(*) FROM project_collaboration_logs
UNION ALL
SELECT 'project_notifications', COUNT(*) FROM project_notifications
UNION ALL
SELECT 'project_approval_instances', COUNT(*) FROM project_approval_instances
UNION ALL
SELECT 'project_milestone_reminder_configs', COUNT(*) FROM project_milestone_reminder_configs
UNION ALL
SELECT 'project_milestone_reminder_logs', COUNT(*) FROM project_milestone_reminder_logs
UNION ALL
SELECT 'project_milestone_dependency_cache', COUNT(*) FROM project_milestone_dependency_cache
UNION ALL
SELECT 'project_milestone_impact_analysis', COUNT(*) FROM project_milestone_impact_analysis
UNION ALL
SELECT 'project_critical_paths', COUNT(*) FROM project_critical_paths;

-- 检查其他相关表的项目数据
SELECT 'employee_profit_contributions (project related)', COUNT(*) FROM employee_profit_contributions WHERE project_id IS NOT NULL
UNION ALL
SELECT 'profit_data (project related)', COUNT(*) FROM profit_data WHERE project_id IS NOT NULL
UNION ALL
SELECT 'notifications (project related)', COUNT(*) FROM notifications WHERE project_id IS NOT NULL;

-- 显示清理完成信息
SELECT '✅ 项目相关数据已全部清除！' AS status;
