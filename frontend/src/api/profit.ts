import request from '@/utils/request'

// 获取利润数据列表
export const getProfitDataList = (params: any) => {
  return request({
    url: '/profit/data',
    method: 'get',
    params
  })
}

// 获取利润数据详情
export const getProfitDataDetail = (id: string) => {
  return request({
    url: `/profit/data/${id}`,
    method: 'get'
  })
}

// 创建利润数据
export const createProfitData = (data: any) => {
  return request({
    url: '/profit/data',
    method: 'post',
    data
  })
}

// 更新利润数据
export const updateProfitData = (id: string, data: any) => {
  return request({
    url: `/profit/data/${id}`,
    method: 'put',
    data
  })
}

// 删除利润数据
export const deleteProfitData = (id: string) => {
  return request({
    url: `/profit/data/${id}`,
    method: 'delete'
  })
}

// 批量导入利润数据
export const batchImportProfitData = (data: any) => {
  return request({
    url: '/profit/data/batch-import',
    method: 'post',
    data
  })
}

// 获取利润数据统计
export const getProfitDataStatistics = (params: any) => {
  return request({
    url: '/profit/data/statistics',
    method: 'get',
    params
  })
}

// 获取期间选项
export const getPeriodOptions = () => {
  return request({
    url: '/profit/data/periods',
    method: 'get'
  })
}
