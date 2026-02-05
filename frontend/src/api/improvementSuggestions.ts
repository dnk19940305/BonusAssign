import request from '@/utils/request'

export interface ImprovementSuggestion {
  id: number
  employeeId: string
  employeeName?: string
  title: string
  description?: string
  category: 'performance' | 'skills' | 'projects' | 'collaboration'
  priority: 'high' | 'medium' | 'low'
  statusCode: number  // 0-待实施, 1-待审核, 2-已完成, -1-已拒绝
  potentialImpact?: number
  timeFrame?: string
  source: 'manual' | 'auto'
  createdBy?: string
  createdByName?: string
  createdAt?: string
  updatedAt?: string
  completedAt?: string
  implementationDate?: string
  implementationFeedback?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  reviewComments?: string
  feedback?: string
}

export interface ImprovementSuggestionsResponse {
  code: number
  message: string
  data: {
    list: ImprovementSuggestion[]
    total: number
    page: number
    pageSize: number
  }
}

export interface CreateSuggestionParams {
  employeeId: string
  employeeName?: string
  title: string
  description?: string
  category: string
  priority?: string
  potentialImpact?: number
  timeFrame?: string
}

export interface UpdateSuggestionParams {
  employeeId?: string
  employeeName?: string
  title?: string
  description?: string
  category?: string
  priority?: string
  status?: string
  potentialImpact?: number
  timeFrame?: string
  feedback?: string
}

export interface SuggestionStatsResponse {
  code: number
  data: {
    total: number
    pending: number
    inProgress: number
    completed: number
    rejected: number
    highPriority: number
    completionRate: number
  }
  message: string
}

// 获取建议列表
export function getImprovementSuggestions(params: {
  page?: number
  pageSize?: number
  employeeId?: string
  status?: number | string
  priority?: string
  category?: string
  source?: string
}) {
  return request<ImprovementSuggestionsResponse>({
    url: '/improvement-suggestions',
    method: 'get',
    params
  })
}

// 获取单个建议详情
export function getImprovementSuggestionById(id: number) {
  return request({
    url: `/improvement-suggestions/${id}`,
    method: 'get'
  })
}

// 创建建议
export function createImprovementSuggestion(data: CreateSuggestionParams) {
  return request({
    url: '/improvement-suggestions',
    method: 'post',
    data
  })
}

// 更新建议
export function updateImprovementSuggestion(id: number, data: UpdateSuggestionParams) {
  return request({
    url: `/improvement-suggestions/${id}`,
    method: 'put',
    data
  })
}

// 删除建议
export function deleteImprovementSuggestion(id: number) {
  return request({
    url: `/improvement-suggestions/${id}`,
    method: 'delete'
  })
}

// 批量更新状态
export function batchUpdateSuggestionStatus(ids: number[], status: string) {
  return request({
    url: '/improvement-suggestions/batch/status',
    method: 'post',
    data: { ids, status }
  })
}

// 获取员工建议统计
export function getSuggestionStats(employeeId: string) {
  return request<SuggestionStatsResponse>({
    url: `/improvement-suggestions/stats/${employeeId}`,
    method: 'get'
  })
}

// 员工提交实施完成
export function completeImplementation(id: number, feedback: string) {
  return request({
    url: `/improvement-suggestions/${id}/complete`,
    method: 'post',
    data: { feedback }
  })
}

// 上级审核通过
export function approveSuggestion(id: number, comments?: string) {
  return request({
    url: `/improvement-suggestions/${id}/approve`,
    method: 'post',
    data: { comments }
  })
}

// 上级审核拒绝
export function rejectSuggestion(id: number, comments: string) {
  return request({
    url: `/improvement-suggestions/${id}/reject`,
    method: 'post',
    data: { comments }
  })
}
