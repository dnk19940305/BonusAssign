const express = require('express')
const router = express.Router()
const projectMemberController = require('../controllers/projectMemberController')
const { authenticateToken, authorize } = require('../middlewares/auth')

// 员工相关接口
router.post('/apply', authenticateToken, projectMemberController.applyToJoinProject) // 申请加入项目
router.get('/my-projects', authenticateToken, projectMemberController.getEmployeeProjects) // 获取我参与的项目

// 项目经理相关接口
router.get('/pending-applications', authenticateToken, projectMemberController.getPendingApplications) // 获取待审批申请
router.get('/applications', authenticateToken, projectMemberController.getPendingApplications) // 获取项目申请列表（兼容前端）
router.put('/:memberId/approve', authenticateToken, projectMemberController.approveMemberApplication) // 审批申请
router.put('/:memberId/reject', authenticateToken, projectMemberController.approveMemberApplication) // 拒绝申请（复用审批方法）
router.post('/batch-approve', authenticateToken, projectMemberController.batchApproveApplications) // 批量审批

// 申请管理
router.put('/:memberId/cancel', authenticateToken, projectMemberController.cancelApplication) // 取消申请

// 项目成员管理
router.get('/project/:projectId', authenticateToken, projectMemberController.getProjectMembers) // 获取项目成员
router.get('/projects/:projectId/members', authenticateToken, projectMemberController.getProjectMembers) // 获取项目成员（兼容前端）
router.post('/add', authenticateToken, projectMemberController.addProjectMembers) // 直接添加成员（项目经理）
router.put('/:memberId/role', authenticateToken, projectMemberController.updateMemberRole) // 更新成员角色
router.put('/:memberId/participation', authenticateToken, projectMemberController.updateMemberRole) // 设置成员参与度（复用角色更新方法）
router.put('/:memberId/workload', authenticateToken, projectMemberController.updateMemberWorkload) // 更新成员工作量占比
router.delete('/:memberId', authenticateToken, projectMemberController.removeProjectMember) // 移除成员

// 项目角色管理
router.get('/roles', authenticateToken, projectMemberController.getProjectRoles) // 获取项目角色列表

module.exports = router