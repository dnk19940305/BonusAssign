/**
 * 项目团队申请状态常量
 * 用于统一管理申请状态值，避免字符串硬编码
 */

// 申请状态码（与后端保持一致）
export enum ApplicationStatus {
  PENDING = 0,              // 待审批
  APPROVED = 1,             // 已批准
  REJECTED = 2,             // 已拒绝
  NEEDS_MODIFICATION = 3,   // 需修改
  CANCELLED = 4             // 已取消
}

// 状态码到名称的映射
export const APPLICATION_STATUS_NAMES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'pending',
  [ApplicationStatus.APPROVED]: 'approved',
  [ApplicationStatus.REJECTED]: 'rejected',
  [ApplicationStatus.NEEDS_MODIFICATION]: 'needs_modification',
  [ApplicationStatus.CANCELLED]: 'cancelled'
}

// 状态码到中文标签的映射
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: '待审批',
  [ApplicationStatus.APPROVED]: '已批准',
  [ApplicationStatus.REJECTED]: '已拒绝',
  [ApplicationStatus.NEEDS_MODIFICATION]: '需修改',
  [ApplicationStatus.CANCELLED]: '已取消'
}

// 状态码到 Element Plus Tag 类型的映射
export const APPLICATION_STATUS_TYPES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'warning',
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.REJECTED]: 'danger',
  [ApplicationStatus.NEEDS_MODIFICATION]: 'warning',
  [ApplicationStatus.CANCELLED]: 'info'
}

// 名称到状态码的映射（用于向后兼容）
export const APPLICATION_STATUS_FROM_NAME: Record<string, ApplicationStatus> = {
  'pending': ApplicationStatus.PENDING,
  'approved': ApplicationStatus.APPROVED,
  'rejected': ApplicationStatus.REJECTED,
  'needs_modification': ApplicationStatus.NEEDS_MODIFICATION,
  'cancelled': ApplicationStatus.CANCELLED
}

/**
 * 获取状态码对应的名称
 * @param statusCode 状态码
 * @returns 状态名称
 */
export function getStatusName(statusCode: ApplicationStatus): string {
  return APPLICATION_STATUS_NAMES[statusCode] || 'unknown'
}

/**
 * 获取状态码对应的中文标签
 * @param statusCode 状态码
 * @returns 中文标签
 */
export function getStatusLabel(statusCode: ApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[statusCode] || '未知状态'
}

/**
 * 获取状态码对应的 Tag 类型
 * @param statusCode 状态码
 * @returns Tag 类型
 */
export function getStatusType(statusCode: ApplicationStatus): string {
  return APPLICATION_STATUS_TYPES[statusCode] || 'info'
}

/**
 * 从名称获取状态码（向后兼容旧代码）
 * @param statusName 状态名称
 * @returns 状态码
 */
export function getStatusCode(statusName: string): ApplicationStatus {
  return APPLICATION_STATUS_FROM_NAME[statusName] ?? ApplicationStatus.PENDING
}

/**
 * 验证状态码是否有效
 * @param statusCode 状态码
 * @returns 是否有效
 */
export function isValidStatus(statusCode: number): statusCode is ApplicationStatus {
  return Object.values(ApplicationStatus).includes(statusCode)
}

/**
 * 获取所有状态选项（用于下拉框）
 * @returns 状态选项数组
 */
export function getAllStatusOptions() {
  return Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({
    value: Number(value),
    label
  }))
}
