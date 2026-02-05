import request from '@/utils/request'

export interface WeightConfig {
  id?: string
  name: string
  code: string
  description?: string
  profitContributionWeight: number
  positionValueWeight: number
  performanceWeight: number
  profitDirectContributionWeight: number
  profitWorkloadWeight: number
  profitQualityWeight: number
  profitPositionValueWeight: number
  positionSkillComplexityWeight: number
  positionResponsibilityWeight: number
  positionDecisionImpactWeight: number
  positionExperienceWeight: number
  positionMarketValueWeight: number
  performanceWorkOutputWeight: number
  performanceWorkQualityWeight: number
  performanceWorkEfficiencyWeight: number
  performanceCollaborationWeight: number
  performanceInnovationWeight: number
  performanceLeadershipWeight: number
  performanceLearningWeight: number
  effectiveDate?: string | Date
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface WeightConfigQuery {
  page?: number
  limit?: number
  status?: string
}

// 获取权重配置列表
export function getWeightConfigs(params: WeightConfigQuery) {
  return request({
    url: '/three-dimensional/weight-configs',
    method: 'get',
    params
  })
}

// 获取权重配置详情
export function getWeightConfig(id: string) {
  return request({
    url: `/three-dimensional/weight-configs/${id}`,
    method: 'get'
  })
}

// 创建权重配置
export function createWeightConfig(data: WeightConfig) {
  return request({
    url: '/three-dimensional/weight-configs',
    method: 'post',
    data
  })
}

// 更新权重配置
export function updateWeightConfig(id: string, data: Partial<WeightConfig>) {
  return request({
    url: `/three-dimensional/weight-configs/${id}`,
    method: 'put',
    data
  })
}

// 删除权重配置
export function deleteWeightConfig(id: string) {
  return request({
    url: `/three-dimensional/weight-configs/${id}`,
    method: 'delete'
  })
}

// 复制权重配置
export function copyWeightConfig(id: string, data: { name: string; code: string }) {
  return request({
    url: `/three-dimensional/weight-configs/${id}/copy`,
    method: 'post',
    data
  })
}

// 导出API对象
export const weightConfigApi = {
  getWeightConfigs,
  getWeightConfig,
  createWeightConfig,
  updateWeightConfig,
  deleteWeightConfig,
  copyWeightConfig
}
