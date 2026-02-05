const databaseService = require('../services/databaseService')

// 验证字段
function validate(data) {
  const errors = []

  if (!data.employeeId) {
    errors.push('员工ID不能为空')
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.push('建议标题不能为空')
  }

  if (data.title && data.title.length > 200) {
    errors.push('建议标题不能超过200个字符')
  }

  if (!data.category) {
    errors.push('建议分类不能为空')
  }

  const validCategories = ['performance', 'skills', 'projects', 'collaboration']
  if (data.category && !validCategories.includes(data.category)) {
    errors.push('建议分类无效')
  }

  const validPriorities = ['high', 'medium', 'low']
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push('优先级无效')
  }

  const validStatuses = ['pending', 'in_progress', 'completed']
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('状态无效')
  }

  if (data.potentialImpact !== undefined && data.potentialImpact !== null) {
    const impact = parseInt(data.potentialImpact)
    if (isNaN(impact) || impact < 0 || impact > 100) {
      errors.push('预期影响必须在0-100之间')
    }
  }

  return errors
}

module.exports = {
  tableName: 'improvement_suggestions',
  validate
}
