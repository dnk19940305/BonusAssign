const { createModel } = require('../adapters/model-adapter')

const ProjectBonusAllocation = createModel('project_bonus_allocations')

// 项目奖金分配记录表 - 记录每个成员的项目奖金
ProjectBonusAllocation.attributes = {
  id: { type: 'STRING', primaryKey: true },
  poolId: { type: 'STRING', allowNull: false }, // 奖金池ID
  employeeId: { type: 'STRING', allowNull: false }, // 员工ID
  roleId: { type: 'STRING', allowNull: true }, // 项目角色ID
  roleWeight: { 
    type: 'DECIMAL', 
    allowNull: false,
    defaultValue: 1.0 // 角色权重
  },
  performanceCoefficient: { 
    type: 'DECIMAL', 
    allowNull: false,
    defaultValue: 1.0 // 绩效系数
  },
  participationRatio: {
    type: 'DECIMAL',
    allowNull: false,
    defaultValue: 100 // 参与比例（百分比，0-100）
  },
  bonusAmount: { 
    type: 'DECIMAL', 
    allowNull: false,
    defaultValue: 0 // 奖金金额
  },
  status: { 
    type: 'STRING', 
    allowNull: false, 
    defaultValue: 'calculated' // calculated-已计算, confirmed-已确认, paid-已发放
  },
  approvedAt: { type: 'DATE', allowNull: true }, // 审批时间
  deletedAt: { type: 'DATE', allowNull: true }, // 删除时间
  createdAt: { type: 'DATE', defaultValue: Date.now },
  updatedAt: { type: 'DATE', defaultValue: Date.now }
}

module.exports = ProjectBonusAllocation