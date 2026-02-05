import request from '@/utils/request'

export interface RoleWeightTemplate {
  id: string
  name: string
  type: string
  description?: string
  weights: Record<string, number>
  is_system: number
  is_active: number
  sort: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface RoleWeightTemplateQuery {
  type?: string
  isActive?: number
}

export interface CreateTemplateData {
  name: string
  type: string
  description?: string
  weights: Record<string, number>
}

export interface UpdateTemplateData {
  name?: string
  type?: string
  description?: string
  weights?: Record<string, number>
  isActive?: number
  sort?: number
}

export interface ApplyTemplateData {
  templateId: string
  projectId: string
}

// 获取模板列表
export function getRoleWeightTemplates(query?: RoleWeightTemplateQuery) {
  return request<RoleWeightTemplate[]>({
    url: '/role-weight-templates',
    method: 'get',
    params: query
  })
}

// 获取单个模板
export function getRoleWeightTemplate(id: string) {
  return request<RoleWeightTemplate>({
    url: `/role-weight-templates/${id}`,
    method: 'get'
  })
}

// 创建模板
export function createRoleWeightTemplate(data: CreateTemplateData) {
  return request({
    url: '/role-weight-templates',
    method: 'post',
    data
  })
}

// 更新模板
export function updateRoleWeightTemplate(id: string, data: UpdateTemplateData) {
  return request({
    url: `/role-weight-templates/${id}`,
    method: 'put',
    data
  })
}

// 删除模板
export function deleteRoleWeightTemplate(id: string) {
  return request({
    url: `/role-weight-templates/${id}`,
    method: 'delete'
  })
}

// 应用模板到项目
export function applyTemplateToProject(data: ApplyTemplateData) {
  return request({
    url: '/role-weight-templates/apply',
    method: 'post',
    data
  })
}
