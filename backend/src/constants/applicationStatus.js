/**
 * 项目团队申请状态常量
 * 用于统一管理申请状态值，避免字符串硬编码
 */

// 申请状态码（存储在数据库中）
const APPLICATION_STATUS = {
  PENDING: 0,              // 待审批
  APPROVED: 1,             // 已批准
  REJECTED: 2,             // 已拒绝
  NEEDS_MODIFICATION: 3,   // 需修改
  CANCELLED: 4             // 已取消
}

// 状态码到名称的映射
const APPLICATION_STATUS_NAMES = {
  [APPLICATION_STATUS.PENDING]: 'pending',
  [APPLICATION_STATUS.APPROVED]: 'approved',
  [APPLICATION_STATUS.REJECTED]: 'rejected',
  [APPLICATION_STATUS.NEEDS_MODIFICATION]: 'needs_modification',
  [APPLICATION_STATUS.CANCELLED]: 'cancelled'
}

// 状态码到中文名称的映射
const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: '待审批',
  [APPLICATION_STATUS.APPROVED]: '已批准',
  [APPLICATION_STATUS.REJECTED]: '已拒绝',
  [APPLICATION_STATUS.NEEDS_MODIFICATION]: '需修改',
  [APPLICATION_STATUS.CANCELLED]: '已取消'
}

// 名称到状态码的映射（用于向后兼容）
const APPLICATION_STATUS_FROM_NAME = {
  'pending': APPLICATION_STATUS.PENDING,
  'approved': APPLICATION_STATUS.APPROVED,
  'rejected': APPLICATION_STATUS.REJECTED,
  'needs_modification': APPLICATION_STATUS.NEEDS_MODIFICATION,
  'cancelled': APPLICATION_STATUS.CANCELLED
}

/**
 * 获取状态码对应的名称
 * @param {number} statusCode - 状态码
 * @returns {string} 状态名称
 */
function getStatusName(statusCode) {
  return APPLICATION_STATUS_NAMES[statusCode] || 'unknown'
}

/**
 * 获取状态码对应的中文标签
 * @param {number} statusCode - 状态码
 * @returns {string} 中文标签
 */
function getStatusLabel(statusCode) {
  return APPLICATION_STATUS_LABELS[statusCode] || '未知状态'
}

/**
 * 从名称获取状态码（向后兼容旧代码）
 * @param {string} statusName - 状态名称
 * @returns {number} 状态码
 */
function getStatusCode(statusName) {
  return APPLICATION_STATUS_FROM_NAME[statusName] ?? APPLICATION_STATUS.PENDING
}

/**
 * 验证状态码是否有效
 * @param {number} statusCode - 状态码
 * @returns {boolean} 是否有效
 */
function isValidStatus(statusCode) {
  return Object.values(APPLICATION_STATUS).includes(statusCode)
}

module.exports = {
  APPLICATION_STATUS,
  APPLICATION_STATUS_NAMES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_FROM_NAME,
  getStatusName,
  getStatusLabel,
  getStatusCode,
  isValidStatus
}
