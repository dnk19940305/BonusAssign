/**
 * 项目里程碑管理 API
 */

import request from '@/utils/request'

export interface Milestone {
  id?: string
  projectId: string
  name: string
  description?: string
  targetDate: string
  completionDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  progress: number
  deliverables?: string
  dependencies?: string[]
  sortOrder?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectExecution {
  id?: string
  projectId: string
  overallProgress: number
  budgetUsage: number
  costOverrun: number
  scheduleVariance: number
  qualityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  teamPerformance?: Record<string, any>
  lastUpdatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProgressLog {
  id?: string
  projectId: string
  milestoneId?: string
  progressType: 'milestone' | 'cost' | 'quality' | 'risk'
  description: string
  progressValue?: number
  oldValue?: number
  newValue?: number
  loggedBy?: string
  loggedAt?: string
}

/**
 * 获取项目的所有里程碑
 */
export function getMilestones(projectId: string, params?: {
  status?: string
  sortBy?: string
}) {
  return request({
    url: `/projects/${projectId}/milestones`,
    method: 'get',
    params
  })
}

/**
 * 获取里程碑详情
 */
export function getMilestoneById(id: string) {
  return request({
    url: `/milestones/${id}`,
    method: 'get'
  })
}

/**
 * 创建里程碑
 */
export function createMilestone(projectId: string, data: Partial<Milestone>) {
  return request({
    url: `/projects/${projectId}/milestones`,
    method: 'post',
    data
  })
}

/**
 * 更新里程碑
 */
export function updateMilestone(id: string, data: Partial<Milestone>) {
  return request({
    url: `/milestones/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除里程碑
 */
export function deleteMilestone(id: string) {
  return request({
    url: `/milestones/${id}`,
    method: 'delete'
  })
}

/**
 * 更新里程碑进度
 */
export function updateMilestoneProgress(id: string, progress: number) {
  return request({
    url: `/milestones/${id}/progress`,
    method: 'patch',
    data: { progress }
  })
}

/**
 * 获取项目执行跟踪信息
 */
export function getProjectExecution(projectId: string) {
  return request({
    url: `/projects/${projectId}/execution`,
    method: 'get'
  })
}

/**
 * 更新项目执行跟踪信息
 */
export function updateProjectExecution(projectId: string, data: Partial<ProjectExecution>) {
  return request({
    url: `/projects/${projectId}/execution`,
    method: 'post',
    data
  })
}

/**
 * 获取项目进度日志
 */
export function getProgressLogs(projectId: string, params?: {
  progressType?: string
  limit?: number
  offset?: number
}) {
  return request({
    url: `/projects/${projectId}/progress-logs`,
    method: 'get',
    params
  })
}

/**
 * 计算项目整体进度
 */
export function calculateOverallProgress(projectId: string) {
  return request({
    url: `/projects/${projectId}/calculate-progress`,
    method: 'get'
  })
}
