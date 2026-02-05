const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const PerformanceAssessment = sequelize.define('PerformanceAssessment', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
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
    comment: '评估期间，格式：YYYY-MM 或 YYYY-Q1'
  },
  overallScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '总体得分'
  },
  rating: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'C',
    comment: '评级'
  },
  coefficient: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 1.00,
    comment: '系数'
  },
  excellenceRating: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: '卓越评级'
  },
  excellenceCoefficient: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: '卓越系数'
  },
  indicatorScores: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '指标得分'
  },
  assessmentComments: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '评估评语'
  },
  evaluatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'performanceassessments',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  comment: '绩效评估表',
  indexes: [
    {
      fields: ['employeeId', 'period'],
      name: 'idx_employee_period'
    },
    {
      fields: ['period'],
      name: 'idx_period'
    },
    {
      fields: ['rating'],
      name: 'idx_rating'
    },
    {
      fields: ['reviewStatus'],
      name: 'idx_review_status'
    },
    {
      fields: ['status'],
      name: 'idx_status'
    }
  ]
})

module.exports = PerformanceAssessment