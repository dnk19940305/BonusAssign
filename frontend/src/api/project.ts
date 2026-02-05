import request from '@/utils/request'
import type {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectListParams,
  ProjectListResponse,
  ProjectWeightsResponse,
  UpdateWeightsData,
  WeightStatisticsResponse
} from '@/types/project'

// 项目管理API
export const projectApi = {
  // 获取项目列表
  getProjects(params: ProjectListParams = {}) {
    return request.get<ProjectListResponse>('/projects', { params })
  },

  // 获取项目详情
  getProject(id: string | number) {
    return request.get<Project>(`/projects/${id}`)
  },

  // 创建项目
  createProject(data: ProjectCreateData) {
    return request.post<Project>('/projects', data)
  },

  // 更新项目
  updateProject(id: string | number, data: ProjectUpdateData) {
    return request.put<Project>(`/projects/${id}`, data)
  },

  // 删除项目
  deleteProject(id: string | number) {
    return request.delete(`/projects/${id}`)
  },

  // 获取项目权重配置
  getProjectWeights(id: string) {
    return request.get<ProjectWeightsResponse>(`/projects/${id}/weights`)
  },

  // 更新项目权重配置
  updateProjectWeights(id: string, data: UpdateWeightsData) {
    return request.put(`/projects/${id}/weights`, data)
  },

  // 重置项目权重配置
  resetProjectWeights(id: string) {
    return request.post(`/projects/${id}/weights/reset`)
  },

  // 获取权重统计
  getWeightStatistics() {
    return request.get<WeightStatisticsResponse>('/projects/statistics/weights')
  },

  // 已废弃：请使用 projectCollaborationApi.getAvailableProjects() 代替
  // 新API支持分页、搜索、权限控制等功能
  // getAvailableProjects() {
  //   return request.get('/projects/available')
  // },

  // 获取项目团队成员
  getProjectMembers(id: string | number) {
    return request.get(`/project-members/projects/${id}/members`)
  },

  // 启动项目
  startProject(id: string | number) {
    return request.post(`/projects/${id}/start`)
  },

  // 完成项目
  completeProject(id: string | number) {
    return request.post(`/projects/${id}/complete`)
  },

  // 提前结项
  earlyCompleteProject(id: string | number) {
    return request.post(`/projects/${id}/early-complete`)
  }
}

// 导出便捷函数（保持向后兼容）
export function getProjects(params?: ProjectListParams) {
  return projectApi.getProjects(params)
}

export function getProject(id: string | number) {
  return projectApi.getProject(id)
}

export function createProject(data: ProjectCreateData) {
  return projectApi.createProject(data)
}

export function updateProject(id: string | number, data: ProjectUpdateData) {
  return projectApi.updateProject(id, data)
}

export function deleteProject(id: string | number) {
  return projectApi.deleteProject(id)
}

export function getProjectWeights(id: string) {
  return projectApi.getProjectWeights(id)
}

export function updateProjectWeights(id: string, data: UpdateWeightsData) {
  return projectApi.updateProjectWeights(id, data)
}

export function resetProjectWeights(id: string) {
  return projectApi.resetProjectWeights(id)
}

export function getWeightStatistics() {
  return projectApi.getWeightStatistics()
}

export default projectApi