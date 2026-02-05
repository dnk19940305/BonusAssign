// TypeScript declaration file for projectMember.js
export interface ProjectMemberApi {
  applyToJoin(data: any): Promise<any>
  getMyProjects(): Promise<any>
  cancelApplication(memberId: string): Promise<any>
  getProjectApplications(projectId: string, status?: string | null): Promise<any>
  approveApplication(memberId: string, data: any): Promise<any>
  rejectApplication(memberId: string, data: any): Promise<any>
  getProjectMembers(projectId: string): Promise<any>
  updateMemberRole(memberId: string, data: any): Promise<any>
  setMemberParticipation(memberId: string, data: any): Promise<any>
  removeMember(memberId: string): Promise<any>
  getProjectRoles(): Promise<any>
  batchApproveApplications(data: any): Promise<any>
  addMembers(data: any): Promise<any>
  getProjectBonusDetails(projectId: string): Promise<any>
  updateMemberContribution(memberId: string, data: any): Promise<any>
}

export const projectMemberApi: ProjectMemberApi
