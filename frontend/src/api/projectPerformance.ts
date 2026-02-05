import request from '@/utils/request'

/**
 * 下载Excel模板
 */
export function downloadTemplate(poolId: string, period?: string) {
  return request({
    url: `/project-performance/pools/${poolId}/template`,
    method: 'get',
    params: { period },
    responseType: 'blob'
  })
}

/**
 * 上传Excel数据
 */
export function uploadExcel(poolId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: `/project-performance/pools/${poolId}/import`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取绩效数据列表
 */
export function getPerformanceData(poolId: string) {
  return request({
    url: `/project-performance/pools/${poolId}/data`,
    method: 'get'
  })
}

/**
 * 创建/更新绩效记录
 */
export function savePerformanceRecord(data: {
  poolId: string
  employeeId: string
  profitContribution: number
  positionValue: number
  performanceScore: number
}) {
  return request({
    url: '/project-performance/records',
    method: 'post',
    data
  })
}

/**
 * 基于手动数据计算奖金
 */
export function calculateBonusManual(poolId: string) {
  return request({
    url: `/project-performance/pools/${poolId}/calculate`,
    method: 'post'
  })
}
