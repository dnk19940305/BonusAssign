import request from '@/utils/request'

export interface City {
  id: string
  name: string
  code: string
  tier: string
  coefficient: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface CityQuery {
  page?: number
  pageSize?: number
  search?: string
  tier?: string
}

// 获取城市列表
export function getCities(params?: CityQuery) {
  return request({
    url: '/cities',
    method: 'get',
    params
  })
}

// 获取城市详情
export function getCity(id: string) {
  return request({
    url: `/cities/${id}`,
    method: 'get'
  })
}

// 获取所有城市（不分页）
export function getAllCities() {
  return request({
    url: '/cities/all',
    method: 'get'
  })
}

// 创建城市
export function createCity(data: Partial<City>) {
  return request({
    url: '/cities',
    method: 'post',
    data
  })
}

// 更新城市
export function updateCity(id: string, data: Partial<City>) {
  return request({
    url: `/cities/${id}`,
    method: 'put',
    data
  })
}

// 删除城市
export function deleteCity(id: string) {
  return request({
    url: `/cities/${id}`,
    method: 'delete'
  })
}

// 获取城市详情
export function getCityById(id: string) {
  return request({
    url: `/cities/${id}`,
    method: 'get'
  })
}