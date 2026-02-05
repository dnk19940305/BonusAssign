/**
 * 数据库字段映射配置
 * 将NeDB的camelCase命名转换为MySQL的snake_case命名
 */

// 表名映射：NeDB camelCase -> MySQL snake_case
const tableNameMap = {
  'businessLines': 'business_lines',
  'departments': 'departments',
  'positions': 'positions',
  'employees': 'employees',
  'projects': 'projects',
  'projectMembers': 'project_members',
  'projectLineWeights': 'project_line_weights',
  'projectCosts': 'project_costs',
  'projectBonusPools': 'project_bonus_pools',
  'projectBonusAllocations': 'project_bonus_allocations',
  'projectRoleWeights': 'project_role_weights',
  'projectMilestones': 'project_milestones',
  'projectProgressLogs': 'project_progress_logs',
  'performanceRecords': 'performance_records',
  'bonusPools': 'bonus_pools',
  'teamApplications': 'project_team_applications',
  'users': 'users',
  'roles': 'roles',
  'notifications': 'notifications',
  // 个人奖金相关表名映射
  'bonusAllocationResults': 'bonus_allocation_results',
  'performanceAssessments': 'performance_records',
  'threeDimensionalCalculationResults': 'three_dimensional_calculation_results',
  'performanceThreeDimensionalScores': 'performance_three_dimensional_scores',
  'employeeBonusRecords': 'employee_bonus_records',
  'threeDimensionalWeightConfigs': 'three_dimensional_weight_configs'
}

// 字段名映射：NeDB camelCase -> MySQL snake_case
const fieldNameMap = {
  // 主键映射
  '_id': 'id',
  'businessLineId': 'line_id',
  'departmentId': 'department_id',
  'positionId': 'position_id',
  'managerId': 'manager_id',
  'parentId': 'parent_id',
  'employeeId': 'employee_id',
  'projectId': 'project_id',
  'applicationId': 'application_id',
  'userId': 'user_id',
  'roleId': 'role_id',
  'cityId': 'city_id',
  'categoryId': 'category_id',
  
  // 员工字段
  'employeeNo': 'employee_no',
  'annualSalary': 'annual_salary',
  'entryDate': 'entry_date',
  'benchmarkValue': 'benchmark_value',
  'salaryRange': 'salary_range',
  'realName': 'real_name',
  
  // 项目字段
  'startDate': 'start_date',
  'endDate': 'end_date',
  'profitTarget': 'profit_target',
  'targetDate': 'target_date',
  'completionDate': 'completion_date',
  'sortOrder': 'sort_order',
  
  // 通用字段
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'lastLogin': 'last_login',
  
  // 项目执行跟踪字段
  'overallProgress': 'overall_progress',
  'budgetUsage': 'budget_usage',
  'costOverrun': 'cost_overrun',
  'scheduleVariance': 'schedule_variance',
  'qualityScore': 'quality_score',
  'riskLevel': 'risk_level',
  'teamPerformance': 'team_performance',
  'lastUpdatedBy': 'last_updated_by',
  
  // 进度日志字段
  'milestoneId': 'milestone_id',
  'progressType': 'progress_type',
  'progressValue': 'progress_value',
  'oldValue': 'old_value',
  'newValue': 'new_value',
  'loggedBy': 'logged_by',
  'loggedAt': 'logged_at',
  
  // 通知字段
  'isRead': 'is_read',
  'readAt': 'read_at',
  'notificationType': 'notification_type',
  'relatedId': 'related_id',
  
  // 项目成本字段
  'costType': 'cost_type',
  'recordedBy': 'recorded_by',
  
  // 项目成员字段
  'joinDate': 'join_date',
  'leaveDate': 'leave_date',
  'applyReason': 'apply_reason',
  'appliedAt': 'applied_at',
  'rejectedAt': 'rejected_at',
  'contributionWeight': 'contribution_weight',
  
  // 项目奖金字段
  'totalAmount': 'total_amount',
  'profitRatio': 'profit_ratio',
  'approvedBy': 'approved_by',
  'approvedAt': 'approved_at',
  'deletedBy': 'deleted_by',
  'deletedAt': 'deleted_at',
  'poolId': 'pool_id',
  'roleWeight': 'role_weight',
  'performanceCoeff': 'performance_coeff',
  'participationRatio': 'participation_ratio',
  'bonusAmount': 'bonus_amount',
  
  // 标准奖金池字段
  'totalProfit': 'total_profit',
  'poolRatio': 'pool_ratio',
  'poolAmount': 'pool_amount',
  'reserveRatio': 'reserve_ratio',
  'specialRatio': 'special_ratio',
  'distributableAmount': 'distributable_amount',
  
  // 团队申请字段
  'applicantId': 'applicant_id',
  'teamName': 'team_name',
  'teamDescription': 'team_description',
  'totalMembers': 'total_members',
  'estimatedCost': 'estimated_cost',
  'applicationReason': 'application_reason',
  'submittedAt': 'submitted_at',
  'approvalComments': 'approval_comments',
  'rejectionReason': 'rejection_reason',
  'estimatedWorkload': 'estimated_workload',
  'costCenter': 'cost_center',
  
  // 个人奖金字段
  'allocationPeriod': 'allocation_period',
  
  // 三维计算字段
  'weightConfigId': 'weight_config_id',
  'bonusPoolId': 'bonus_pool_id',
  'calculationPeriod': 'calculation_period',
  'profitContributionScore': 'profit_contribution_score',
  'positionValueScore': 'position_value_score',
  'performanceScore': 'performance_score',
  'normalizedProfitScore': 'normalized_profit_score',
  'normalizedPositionScore': 'normalized_position_score',
  'normalizedPerformanceScore': 'normalized_performance_score',
  'weightedProfitScore': 'weighted_profit_score',
  'weightedPositionScore': 'weighted_position_score',
  'weightedPerformanceScore': 'weighted_performance_score',
  'totalScore': 'total_score',
  'adjustedScore': 'adjusted_score',
  'finalScore': 'final_score',
  'scoreRank': 'score_rank',
  'percentileRank': 'percentile_rank',
  'departmentRank': 'department_rank',
  'levelRank': 'level_rank',
  'bonusCoefficient': 'bonus_coefficient',
  'baseBonusAmount': 'base_bonus_amount',
  'adjustmentAmount': 'adjustment_amount',
  'finalBonusAmount': 'final_bonus_amount',
  'profitContributionRate': 'profit_contribution_rate',
  'positionValueRate': 'position_value_rate',
  'performanceRate': 'performance_rate',
  'profitCalculationDetails': 'profit_calculation_details',
  'positionCalculationDetails': 'position_calculation_details',
  'performanceCalculationDetails': 'performance_calculation_details',
  'calculationMethod': 'calculation_method',
  'calculationParams': 'calculation_params',
  'profitDataVersion': 'profit_data_version',
  'positionDataVersion': 'position_data_version',
  'performanceDataVersion': 'performance_data_version',
  'dataCompleteness': 'data_completeness',
  'calculationConfidence': 'calculation_confidence',
  'outlierFlag': 'outlier_flag',
  'outlierReason': 'outlier_reason',
  'reviewStatus': 'review_status',
  'reviewComments': 'review_comments',
  'reviewedBy': 'reviewed_by',
  'reviewedAt': 'reviewed_at',
  'previousPeriodScore': 'previous_period_score',
  'scoreChangeRate': 'score_change_rate',
  'trendDirection': 'trend_direction',
  'calculatedAt': 'calculated_at',
  'status': 'status',
  'createdBy': 'created_by',
  'updatedBy': 'updated_by'
}

module.exports = {
  tableNameMap,
  fieldNameMap
}