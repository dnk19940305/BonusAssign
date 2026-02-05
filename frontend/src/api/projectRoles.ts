import request from '@/utils/request'

export interface ProjectRole {
  _id?: string
  id?: string
  name: string
  code: string
  description: string
  defaultWeight: number
  responsibilities?: any[]
  requiredSkills?: any[]
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateProjectRoleParams {
  name: string
  code: string
  description?: string
  defaultWeight?: number
  responsibilities?: any[]
  requiredSkills?: any[]
}

export interface UpdateProjectRoleParams {
  name?: string
  code?: string
  description?: string
  defaultWeight?: number
  responsibilities?: any[]
  requiredSkills?: any[]
  status?: number
}

// 获取项目角色列表（启用的）
export function getProjectRoles(params: {
  page?: number
  pageSize?: number
  status?: number
}) {
  return request({
    url: '/project-roles',
    method: 'get',
    params
  })
}

// 获取所有项目角色（包括禁用的）
export function getAllProjectRoles(params: {
  page?: number
  pageSize?: number
  status?: number
}) {
  return request({
    url: '/project-roles/all',
    method: 'get',
    params
  })
}

// 创建项目角色
export function createProjectRole(data: CreateProjectRoleParams) {
  return request({
    url: '/project-roles',
    method: 'post',
    data
  })
}

// 更新项目角色
export function updateProjectRole(id: string, data: UpdateProjectRoleParams) {
  return request({
    url: `/project-roles/${id}`,
    method: 'put',
    data
  })
}

// 删除项目角色
export function deleteProjectRole(id: string) {
  return request({
    url: `/project-roles/${id}`,
    method: 'delete'
  })
}