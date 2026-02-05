const express = require('express')
const router = express.Router()
const projectMemberController = require('../controllers/projectMemberController')
const { authenticateToken, authorize } = require('../middlewares/auth')

// 项目角色管理接口
router.get('/', authenticateToken, projectMemberController.getProjectRoles) // 获取启用的项目角色列表（兼容旧接口）
router.get('/all', authenticateToken, projectMemberController.getAllProjectRoles) // 获取所有项目角色（包括禁用的）
router.post('/', authenticateToken, authorize(['admin', 'hr-manager']), projectMemberController.createProjectRole) // 创建项目角色
router.put('/:id', authenticateToken, authorize(['admin', 'hr-manager']), projectMemberController.updateProjectRole) // 更新项目角色
router.delete('/:id', authenticateToken, authorize(['admin', 'hr-manager']), projectMemberController.deleteProjectRole) // 删除项目角色

module.exports = router