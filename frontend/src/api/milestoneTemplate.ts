/**
 * 里程碑模板管理 API
 */

import request from '@/utils/request'

export interface MilestoneTemplateItem {
  name: string
  description?: string
  durationDays: number
  offsetDays: number
  weight: number
  deliverables?: string
  dependencies: number[]
}

export interface MilestoneTemplate {
  id?: string
  name: string
  description?: string
  category: 'software' | 'marketing' | 'product' | 'custom'
  isSystem: boolean
  templateData: {
    milestones: MilestoneTemplateItem[]
  }
  usageCount?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 获取模板列表
 */
export function getTemplates(params?: {
  category?: string
  isSystem?: boolean
  search?: string
  page?: number
  pageSize?: number
}) {
  return request({
    url: '/milestone-templates',
    method: 'get',
    params
  })
}

/**
 * 获取模板详情
 */
export function getTemplateById(id: string) {
  return request({
    url: `/milestone-templates/${id}`,
    method: 'get'
  })
}

/**
 * 创建自定义模板
 */
export function createTemplate(data: Partial<MilestoneTemplate>) {
  return request({
    url: '/milestone-templates',
    method: 'post',
    data
  })
}

/**
 * 更新模板
 */
export function updateTemplate(id: string, data: Partial<MilestoneTemplate>) {
  return request({
    url: `/milestone-templates/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除模板
 */
export function deleteTemplate(id: string) {
  return request({
    url: `/milestone-templates/${id}`,
    method: 'delete'
  })
}

/**
 * 应用模板到项目
 */
export function applyTemplate(id: string, data: {
  projectId: string
  startDate: string
}) {
  return request({
    url: `/milestone-templates/${id}/apply`,
    method: 'post',
    data
  })
}

/**
 * 从项目保存为模板
 */
export function createFromProject(data: {
  projectId: string
  name: string
  description?: string
  category?: string
}) {
  return request({
    url: '/milestone-templates/from-project',
    method: 'post',
    data
  })
}
