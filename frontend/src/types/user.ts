export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone?: string
  roleId: number
  roleName: string
  departmentId?: number
  departmentName?: string
  employeeId?: string  // 员工ID，用于关联员工表
  status: number
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  permissions: string[]
}