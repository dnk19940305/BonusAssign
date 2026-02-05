/**
 * 技能标签管理 API
 */

import request from '@/utils/request';

// 技能分类数据结构
export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  sortOrder: number;
  skillCount: number;
  createdAt: string;
  updatedAt: string;
}

// 技能标签数据结构
export interface SkillTag {
  id: string;
  name: string;
  code: string;
  category: string;
  categoryId: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  synonyms: string[];
  relatedSkills: string[];
  usageCount: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategoryForm {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}

export interface SkillTagForm {
  name: string;
  code: string;
  categoryId: string;
  level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  synonyms?: string[];
  relatedSkills?: string[];
  isActive?: boolean;
}

// ==================== 技能分类 API ====================

/**
 * 获取所有技能分类
 */
export const getSkillCategories = () => {
  return request.get<SkillCategory[]>('/skill-tags/categories');
};

/**
 * 创建技能分类
 */
export const createSkillCategory = (data: SkillCategoryForm) => {
  return request.post<SkillCategory>('/skill-tags/categories', data);
};

/**
 * 更新技能分类
 */
export const updateSkillCategory = (id: string, data: Partial<SkillCategoryForm>) => {
  return request.put<SkillCategory>(`/skill-tags/categories/${id}`, data);
};

/**
 * 删除技能分类
 */
export const deleteSkillCategory = (id: string) => {
  return request.delete(`/skill-tags/categories/${id}`);
};

// ==================== 技能标签 API ====================

/**
 * 获取技能标签列表（支持分页和筛选）
 */
export const getSkillTags = (params?: {
  categoryId?: string;
  level?: string;
  isActive?: boolean;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    tags: SkillTag[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>('/skill-tags', { params });
};

/**
 * 获取单个技能标签
 */
export const getSkillTagById = (id: string) => {
  return request.get<SkillTag>(`/skill-tags/${id}`);
};

/**
 * 创建技能标签
 */
export const createSkillTag = (data: SkillTagForm) => {
  return request.post<SkillTag>('/skill-tags', data);
};

/**
 * 更新技能标签
 */
export const updateSkillTag = (id: string, data: Partial<SkillTagForm>) => {
  return request.put<SkillTag>(`/skill-tags/${id}`, data);
};

/**
 * 删除技能标签
 */
export const deleteSkillTag = (id: string) => {
  return request.delete(`/skill-tags/${id}`);
};

/**
 * 批量操作技能标签
 */
export const batchOperateSkillTags = (ids: string[], operation: 'enable' | 'disable' | 'delete') => {
  return request.post('/skill-tags/batch', { ids, operation });
};

/**
 * 合并技能标签
 */
export const mergeSkillTags = (primaryTagId: string, secondaryTagId: string, description?: string) => {
  return request.post('/skill-tags/merge', { primaryTagId, secondaryTagId, description });
};

/**
 * 切换标签状态
 */
export const toggleTagStatus = (id: string) => {
  return getSkillTagById(id).then(response => {
    const tag = response.data;
    return updateSkillTag(id, { isActive: !tag.isActive });
  });
};

export const skillTagApi = {
  // 分类
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  
  // 标签
  getSkillTags,
  getSkillTagById,
  createSkillTag,
  updateSkillTag,
  deleteSkillTag,
  batchOperateSkillTags,
  mergeSkillTags,
  toggleTagStatus
};

export default skillTagApi;
