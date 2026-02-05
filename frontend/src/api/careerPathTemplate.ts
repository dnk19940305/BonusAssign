/**
 * 职业路径模板管理 API
 */

import request from '@/utils/request';

// 职业路径模板数据结构
export interface CareerPathTemplate {
  id: string;
  name: string;
  code: string;
  level: string;
  category: string;
  description?: string;
  version: string;
  isActive: boolean;
  isDefault: boolean;
  usageCount: number;
  status: 'draft' | 'active' | 'inactive';
  
  careerPath: {
    nextLevel?: string;
    estimatedTime?: string;
    lateralMoves: string[];
    specializations: string[];
    growthAreas: string[];
    requirements: {
      minExperience?: string;
      skillAssessment?: string;
      projectContribution?: string;
      performanceLevel?: string;
    };
  };
  
  skillDevelopment: {
    coreSkills: string[];
    advancedSkills: string[];
    leadershipSkills: string[];
    learningPath: {
      courses: string[];
      certifications: string[];
      projects: string[];
    };
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface CareerPathTemplateForm {
  name: string;
  code: string;
  level: string;
  category: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  isDefault?: boolean;
  status?: 'draft' | 'active' | 'inactive';
  careerPath?: Partial<CareerPathTemplate['careerPath']>;
  skillDevelopment?: Partial<CareerPathTemplate['skillDevelopment']>;
}

/**
 * 获取职业路径模板列表（支持分页和筛选）
 */
export const getCareerPathTemplates = (params?: {
  level?: string;
  category?: string;
  status?: 'draft' | 'active' | 'inactive';
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    templates: CareerPathTemplate[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>('/career-path-templates', { params });
};

/**
 * 获取单个职业路径模板
 */
export const getCareerPathTemplateById = (id: string) => {
  return request.get<CareerPathTemplate>(`/career-path-templates/${id}`);
};

/**
 * 创建职业路径模板
 */
export const createCareerPathTemplate = (data: CareerPathTemplateForm) => {
  return request.post<CareerPathTemplate>('/career-path-templates', data);
};

/**
 * 更新职业路径模板
 */
export const updateCareerPathTemplate = (id: string, data: Partial<CareerPathTemplateForm>) => {
  return request.put<CareerPathTemplate>(`/career-path-templates/${id}`, data);
};

/**
 * 删除职业路径模板
 */
export const deleteCareerPathTemplate = (id: string) => {
  return request.delete(`/career-path-templates/${id}`);
};

/**
 * 复制职业路径模板
 */
export const copyCareerPathTemplate = (id: string) => {
  return request.post<CareerPathTemplate>(`/career-path-templates/${id}/copy`);
};

/**
 * 增加模板使用次数
 */
export const incrementTemplateUsage = (id: string) => {
  return request.post(`/career-path-templates/${id}/usage`);
};

export const careerPathTemplateApi = {
  getCareerPathTemplates,
  getCareerPathTemplateById,
  createCareerPathTemplate,
  updateCareerPathTemplate,
  deleteCareerPathTemplate,
  copyCareerPathTemplate,
  incrementTemplateUsage
};

export default careerPathTemplateApi;
