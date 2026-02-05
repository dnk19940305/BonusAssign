const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const PerformanceIndicatorData = sequelize.define('PerformanceIndicatorData', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  indicatorId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '绩效指标ID'
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '员工ID'
  },
  period: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [4, 20]
    },
    comment: '期间'
  },
  actualValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '实际值'
  },
  targetValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '目标值'
  },
  achievementRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0.0000,
    comment: '达成率'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '得分'
  },
  evaluatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '评估人ID'
  },
  reviewStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '审核状态'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isIn: [[0, 1]]
    },
    comment: '状态：0-无效，1-有效'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建人ID'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '更新人ID'
  }
}, {
  tableName: 'performanceindicatordata',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  comment: '绩效指标数据表',
  indexes: [
    {
      fields: ['indicatorId', 'employeeId'],
      name: 'idx_indicator_data_indicator_employee'
    },
    {
      fields: ['employeeId', 'period'],
      name: 'idx_indicator_data_employee_period'
    },
    {
      fields: ['reviewStatus'],
      name: 'idx_indicator_data_review_status'
    },
    {
      fields: ['status'],
      name: 'idx_indicator_data_status'
    }
  ]
})

module.exports = PerformanceIndicatorData