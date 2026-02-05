/**
 * 岗位分类管理 API
 */

import request from '@/utils/request';

// 岗位分类数据结构
export interface PositionCategory {
  id: string;
  name: string;
  code: string;
  type: 'main' | 'sub';
  parentId?: string;
  level: number;
  sortOrder: number;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  positionCount: number;
  positions?: Array<{ id: string; name: string }>;
  children?: PositionCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryForm {
  name: string;
  code: string;
  type: 'main' | 'sub';
  parentId?: string;
  level?: number;
  sortOrder?: number;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

/**
 * 获取所有分类（树形结构）
 */
export const getCategories = (params?: {
  type?: 'main' | 'sub';
  parentId?: string | null;
  isActive?: boolean;
}) => {
  return request.get<PositionCategory[]>('/position-categories', { params });
};

/**
 * 获取单个分类详情
 */
export const getCategoryById = (id: string) => {
  return request.get<PositionCategory>(`/position-categories/${id}`);
};

/**
 * 创建分类
 */
export const createCategory = (data: CategoryForm) => {
  return request.post<PositionCategory>('/position-categories', data);
};

/**
 * 更新分类
 */
export const updateCategory = (id: string, data: Partial<CategoryForm>) => {
  return request.put<PositionCategory>(`/position-categories/${id}`, data);
};

/**
 * 删除分类
 */
export const deleteCategory = (id: string) => {
  return request.delete(`/position-categories/${id}`);
};

/**
 * 更新分类排序
 */
export const updateCategoryOrder = (orders: Array<{ id: string; sortOrder: number }>) => {
  return request.post('/position-categories/order', { orders });
};

export const categoryApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
};

export default categoryApi;
