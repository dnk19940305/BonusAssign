import request from '@/utils/request'

export interface ProjectPublishRequest {
  // 协作发布信息
  workContent?: string
  bonusScale?: number
  skillRequirements?: string[]
  requirements?: ProjectRequirement[]
  // 项目基本信息（可选，用于补充草稿项目缺失的字段）
  startDate?: string
  endDate?: string
  budget?: number
  profitTarget?: number
}

export interface ProjectCreateAndPublishRequest {
  // 项目基本信息
  name: string
  code: string
  description?: string
  managerId?: string
  startDate: string
  endDate: string
  budget: number
  profitTarget?: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  // 协作发布信息
  workContent: string
  bonusScale?: number
  skillRequirements?: string[]
  requirements?: ProjectRequirement[]
}

export interface ProjectRequirement {
  type: 'technical' | 'business' | 'quality'
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  isMandatory?: boolean
  acceptanceCriteria?: string[]
}

export interface TeamMember {
  employeeId: string
  roleId?: string
  roleName: string
  contributionWeight?: number
  estimatedWorkload?: number
  reason?: string
}

export interface TeamApplicationRequest {
  teamName: string
  teamDescription: string
  applicationReason: string
  estimatedCost?: number
  members: TeamMember[]
}

export interface ApprovalRequest {
  action: 'approve' | 'reject' | 'modify'
  comments?: string
  modifications?: {
    memberId: string
    action: 'remove' | 'modify'
    reason?: string
  }[]
}

export interface ProjectCollaborationResponse {
  project: any
  requirements: ProjectRequirement[]
  applications: any[]
  members: any[]
  recentLogs: any[]
}

export interface NotificationResponse {
  notifications: any[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  unreadCount: number
}

// 项目协作API
export const projectCollaborationApi = {
  // 管理层发布项目（将已存在的项目发布为协作项目）
  publishProject: (projectId: string, data: ProjectPublishRequest) => {
    return request.post(`/project-collaboration/${projectId}/publish`, data)
  },

  // 创建并发布项目（一次性完成）
  createAndPublishProject: (data: ProjectCreateAndPublishRequest) => {
    return request.post('/project-collaboration/create-and-publish', data)
  },

  // 项目经理申请团队组建
  applyTeamBuilding: (projectId: string, data: TeamApplicationRequest) => {
    return request.post(`/project-collaboration/${projectId}/apply-team`, data)
  },

  // 管理层审批团队申请
  approveTeamApplication: (applicationId: string, data: ApprovalRequest) => {
    return request.post(`/project-collaboration/applications/${applicationId}/approve`, data)
  },

  // 重新提交申请（修改后）
  resubmitApplication: (applicationId: string, data: TeamApplicationRequest) => {
    return request.post(`/project-collaboration/applications/${applicationId}/resubmit`, data)
  },

  // 获取项目协作详情
  getProjectCollaboration: (projectId: string): Promise<{ data: ProjectCollaborationResponse }> => {
    return request.get(`/project-collaboration/${projectId}`)
  },

  // 获取项目的申请列表
  getProjectApplications: (projectId: string, params?: {
    page?: number
    pageSize?: number
    status?: string
  }) => {
    return request.get(`/project-collaboration/${projectId}/applications`, { params })
  },

  // 获取待审批的团队申请列表
  getPendingApplications: (params?: {
    page?: number
    pageSize?: number
    projectId?: string
    status?: string
  }) => {
    return request.get('/project-collaboration/applications/pending', { params })
  },

  // 获取我的申请列表
  getMyApplications: (params?: {
    page?: number
    pageSize?: number
    projectName?: string
    status?: string
  }) => {
    return request.get('/project-collaboration/applications/my', { params })
  },

  // 获取我的通知
  getMyNotifications: (params?: {
    page?: number
    pageSize?: number
    unreadOnly?: boolean
  }): Promise<{ data: NotificationResponse }> => {
    return request.get('/project-collaboration/notifications/my', { params })
  },

  // 标记通知为已读
  markNotificationRead: (notificationId: string) => {
    return request.post(`/project-collaboration/notifications/${notificationId}/read`)
  },

  // 批量标记通知为已读
  markAllNotificationsRead: () => {
    return request.post('/project-collaboration/notifications/mark-all-read')
  },

  // 获取协作中心可申请项目列表（已过滤已申请项目）
  getAvailableProjects: (params?: {
    page?: number
    pageSize?: number
    search?: string
  }) => {
    return request.get('/project-collaboration/available-projects', { params })
  }
}
