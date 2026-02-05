-- =====================================================
-- 清除项目和奖金计算相关数据脚本
-- 用途: 重置系统以便从头开始完整流程测试
-- 警告: 此操作不可逆，仅用于测试环境
-- =====================================================

USE bonus_system;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 清除奖金计算相关数据
-- =====================================================

-- 三维计算结果
TRUNCATE TABLE three_dimensional_calculation_results;

-- 奖金分配结果
TRUNCATE TABLE bonus_allocation_results;

-- 奖金池
TRUNCATE TABLE bonus_pools;

-- 项目奖金池
TRUNCATE TABLE project_bonus_pools;

-- 绩效三维评分（绩效记录管理导入的数据）
TRUNCATE TABLE performance_three_dimensional_scores;

-- =====================================================
-- 2. 清除项目相关数据
-- =====================================================

-- 项目成员
TRUNCATE TABLE project_members;

-- 项目协作日志（实际表名）
TRUNCATE TABLE project_collaboration_logs;

-- 项目状态历史
TRUNCATE TABLE project_state_history;

-- 项目成本
TRUNCATE TABLE project_costs;

-- 项目执行记录
TRUNCATE TABLE project_executions;

-- 项目进度日志
TRUNCATE TABLE project_progress_logs;

-- 项目通知
TRUNCATE TABLE project_notifications;

-- 项目团队申请
TRUNCATE TABLE project_team_applications;

-- 项目里程碑
TRUNCATE TABLE project_milestones;

-- 项目审批流程实例
TRUNCATE TABLE project_approval_instances;

-- 项目关键路径
TRUNCATE TABLE project_critical_paths;

-- 项目需求
TRUNCATE TABLE project_requirements;

-- 项目手动绩效记录
TRUNCATE TABLE project_performance_manual;

-- 项目奖金分配
TRUNCATE TABLE project_bonus_allocations;

-- 项目
TRUNCATE TABLE projects;

-- =====================================================
-- 3. 清除利润数据（可选）
-- =====================================================

-- 如果需要重新录入利润数据，取消下面的注释
-- TRUNCATE TABLE profit_data;
-- TRUNCATE TABLE employee_profit_contributions;

-- =====================================================
-- 4. 清除绩效记录（可选）
-- =====================================================

-- 如果需要重新录入绩效记录，取消下面的注释
-- TRUNCATE TABLE performance_records;

-- =====================================================
-- 重新启用外键检查
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;

-- 显示清理结果
SELECT '项目数据已清空' as status;
SELECT COUNT(*) as projects_count FROM projects;
SELECT COUNT(*) as project_members_count FROM project_members;
SELECT COUNT(*) as bonus_pools_count FROM bonus_pools;
SELECT COUNT(*) as calculation_results_count FROM three_dimensional_calculation_results;
SELECT COUNT(*) as allocation_results_count FROM bonus_allocation_results;
SELECT COUNT(*) as performance_scores_count FROM performance_three_dimensional_scores;
