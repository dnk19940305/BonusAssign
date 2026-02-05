const express = require('express')
const router = express.Router()
const projectBonusController = require('../controllers/projectBonusController')
const { authenticateToken, authorize } = require('../middlewares/auth')

// 获取奖金池列表 - 需要基本认证
router.get('/pools', 
  authenticateToken, 
  projectBonusController.getBonusPools
)

// 获取单个奖金池详情 - 需要基本认证
router.get('/pools/:poolId', 
  authenticateToken, 
  projectBonusController.getBonusPoolDetail
)

// 创建项目奖金池 - 需要财务权限、管理员或项目管理权限
router.post('/pools', 
  authenticateToken, 
  authorize(['finance', 'admin', 'project_manager', 'project:manage', 'bonus:create']), 
  projectBonusController.createBonusPool
)

// 编辑项目奖金池 - 需要财务权限、管理员或项目管理权限（创建者）
router.put('/pools/:poolId', 
  authenticateToken, 
  authorize(['finance', 'admin', 'project_manager', 'project:manage', 'bonus:update']), 
  projectBonusController.updateBonusPool
)

// 删除项目奖金池 - 需要财务权限、管理员或项目管理权限（创建者）
router.delete('/pools/:poolId', 
  authenticateToken, 
  authorize(['finance', 'admin', 'project_manager', 'project:manage', 'bonus:delete']), 
  projectBonusController.deleteBonusPool
)

// 计算项目奖金分配 - 需要项目经理、HR、管理员或项目管理权限
router.post('/pools/:poolId/calculate', 
  authenticateToken, 
  authorize(['project_manager', 'hr', 'admin', 'project:manage', 'bonus:calculate', 'calculation:create']), 
  projectBonusController.calculateBonus
)

// 审批项目奖金分配 - 需要HR权限
router.post('/pools/:poolId/approve', 
  authenticateToken, 
  authorize(['hr', 'admin']), 
  projectBonusController.approveBonus
)

// 设置项目角色权重 - 需要项目经理权限（支持权限码）
router.put('/projects/:projectId/role-weights', 
  authenticateToken, 
  authorize(['project_manager', 'admin', 'project:weights:update_own', 'project:weights:update_all', '*']), 
  projectBonusController.setRoleWeights
)

// 设置单个角色权重（独立更新）
router.put('/projects/:projectId/role-weights/:role', 
  authenticateToken, 
  authorize(['project_manager', 'admin', 'project:weights:update_own', 'project:weights:update_all', '*']), 
  projectBonusController.setRoleWeight
)

// 获取项目角色权重（支持权限码）
router.get('/projects/:projectId/role-weights', 
  authenticateToken,
  projectBonusController.getRoleWeights
)

// 获取项目奖金分配详情
router.get('/projects/:projectId/periods/:period', 
  authenticateToken, 
  projectBonusController.getBonusDetails
)

// 获取奖金池计算历史
router.get('/pools/:poolId/history', 
  authenticateToken, 
  projectBonusController.getCalculationHistory
)

module.exports = router
