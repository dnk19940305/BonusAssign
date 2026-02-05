import request from '@/utils/request'

export interface PerformanceRecord {
  id?: string
  employeeId: string
  period: string
  rating: string
  coefficient: number
  excellenceRating?: string
  excellenceCoefficient?: number | null
  evaluatorId?: string
  comments?: string
  createdAt?: string
  updatedAt?: string
  employee_name?: string
  employee_no?: string
  position_name?: string
  department_name?: string
}

export interface PerformanceQuery {
  page?: number
  pageSize?: number
  employeeId?: string
  employeeName?: string
  period?: string
  rating?: string
  evaluatorId?: string
}

// 获取绩效记录列表
export function getPerformanceRecords(params: PerformanceQuery) {
  return request({
    url: '/performance-records',
    method: 'get',
    params
  })
}

// 获取绩效记录详情
export function getPerformanceRecord(id: string) {
  return request({
    url: `/performance-records/${id}`,
    method: 'get'
  })
}

// 创建绩效记录
export function createPerformanceRecord(data: PerformanceRecord) {
  return request({
    url: '/performance-records',
    method: 'post',
    data
  })
}

// 更新绩效记录
export function updatePerformanceRecord(id: string, data: Partial<PerformanceRecord>) {
  return request({
    url: `/performance-records/${id}`,
    method: 'put',
    data
  })
}

// 删除绩效记录
export function deletePerformanceRecord(id: string) {
  return request({
    url: `/performance-records/${id}`,
    method: 'delete'
  })
}

// 批量导入绩效记录
export function batchImportPerformanceRecords(data: { records: PerformanceRecord[] }) {
  return request({
    url: '/performance-records/batch-import',
    method: 'post',
    data
  })
}

// 下载Excel模板
export function downloadPerformanceTemplate(period?: string) {
  return request({
    url: '/performance-records/template',
    method: 'get',
    params: { period },
    responseType: 'blob'
  })
}

// 导出API对象
export const performanceApi = {
  getPerformanceRecords,
  getPerformanceRecord,
  createPerformanceRecord,
  updatePerformanceRecord,
  deletePerformanceRecord,
  batchImportPerformanceRecords,
  downloadPerformanceTemplate
}
