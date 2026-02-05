const projectBonusService = require('../services/projectBonusService')
const logger = require('../utils/logger')
const { PermissionValidator } = require('../config/permissions')
const databaseService = require('../services/databaseService')


class ProjectBonusController {
  /**
   * 创建项目奖金池
   */
  async createBonusPool(req, res, next) {
    try {
      const { projectId, period, totalAmount, profitRatio, projectProfit } = req.body
      const createdBy = req.user.id

      if (!projectId || !period || !totalAmount) {
        return res.status(400).json({
          success: false,
          message: '项目ID、期间和奖金总额不能为空'
        })
      }

      // 项目经理权限验证：只能创建自己管理的项目的奖金池
      const userPermissions = PermissionValidator.getUserPermissions(req.user)
      const isAdmin = PermissionValidator.hasPermission(userPermissions, ['admin', '*'])
      
      // 财务和HR可以为任何项目创建奖金池（优先判断角色名）
      const isHROrFinance = req.user.Role?.name === 'HR管理员' || 
                            req.user.Role?.name === '财务管理员' ||
                            PermissionValidator.hasPermission(userPermissions, [
                              'bonus:create',
                              'calculation:create',
                              'finance:manage'
                            ])

      // 如果不是管理员、财务或HR，需要验证是否为项目经理
      if (!isAdmin && !isHROrFinance) {
        const project = await databaseService.getProjectById(projectId)
        if (!project) {
          return res.status(404).json({
            success: false,
            message: '项目不存在'
          })
        }

        // 验证是否为项目经理
        const isProjectManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
          (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
          (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
          (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())

        if (!isProjectManager) {
          return res.status(403).json({
            success: false,
            message: '权限不足：项目经理只能创建自己管理的项目的奖金池'
          })
        }
      }

      const pool = await projectBonusService.createProjectBonusPool(
        projectId, period, totalAmount, profitRatio, createdBy, projectProfit
      )

      // 确保返回的奖金池有 id 字段而不是 _id
      const formattedPool = pool ? {
        id: pool._id || pool.id,
        ...pool
      } : null

      res.json({
        success: true,
        message: '项目奖金池创建成功',
        data: formattedPool
      })
    } catch (error) {
      logger.error('创建项目奖金池失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '创建项目奖金池失败'
      })
    }
  }

  /**
   * 计算项目奖金分配
   */
  async calculateBonus(req, res, next) {
    try {
      const { poolId } = req.params
      const calculatedBy = req.user.id // 记录计算人

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const result = await projectBonusService.calculateProjectBonus(poolId, calculatedBy)

      // 更新项目状态为已计算
      const pool = await projectBonusService.getBonusPoolById(poolId);
      if (pool && pool.projectId) {
        try {
          await databaseService.update('projects',
            pool.projectId,
            { bonusStatus: 'calculated' }
          );
        } catch (updateError) {
          logger.warn('更新项目奖金状态失败:', updateError);
        }
      }

      // 确保返回的结果有正确的 id 字段
      const formattedResult = result ? {
        ...result,
        poolId: result.poolId,
        id: result.id || result.poolId  // 确保有 id 字段
      } : null

      res.json({
        success: true,
        message: '项目奖金计算完成',
        data: formattedResult
      })
    } catch (error) {
      logger.error('计算项目奖金失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '计算项目奖金失败'
      })
    }
  }

  /**
   * 设置项目角色权重
   */
  async setRoleWeights(req, res, next) {
    try {
      const { projectId } = req.params
      const { weights, role, weight } = req.body
      const updatedBy = req.user.id

      if (!projectId || (!weights && !(role && (weight !== undefined)))) {
        return res.status(400).json({
          success: false,
          message: '项目ID和权重配置不能为空（支持整包或单角色）'
        })
      }

      // 权限检查：获取项目信息以验证用户权限
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在'
        })
      }

      // 使用权限验证器获取用户权限
      const userPermissions = PermissionValidator.getUserPermissions(req.user)

      // 检查用户是否有权限修改项目角色权重
      let hasPermission = false

      // 检查是否有管理所有项目权重的权限
      if (PermissionValidator.hasPermission(userPermissions, ['project:weights:update_all', 'project:*', '*'])) {
        hasPermission = true
      }
      // 检查是否有管理自己项目权重的权限，并且确实是项目管理者
      else if (PermissionValidator.hasPermission(userPermissions, 'project:weights:update_own')) {
        // 验证用户是否为项目管理者
        let isManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
          (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
          (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
          (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())

        // 增强：检查是否为待审批团队申请的申请人
        if (!isManager) {
          try {
            const teamApps = await databaseService.find('project_team_applications', {
              projectId,
              status: 'pending'
            })
            isManager = teamApps.some(app =>
              (app.applicantId && req.user.id && app.applicantId.toString() === req.user.id.toString()) ||
              (app.applicant_id && req.user.id && app.applicant_id.toString() === req.user.id.toString())
            )
          } catch (err) {
            logger.warn('检查团队申请状态失败:', err.message)
          }
        }

        if (isManager) {
          hasPermission = true
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足：您没有权限修改此项目的角色权重配置',
          data: {
            required: ['project:weights:update_own', 'project:weights:update_all'],
            message: '需要项目权重管理权限，且只能管理自己负责的项目（除非有全局权限）'
          }
        })
      }

      let result
      // 支持单角色独立更新
      if (role && (weight !== undefined)) {
        result = await projectBonusService.setProjectRoleWeight(projectId, role, weight, updatedBy)
      } else {
        result = await projectBonusService.setProjectRoleWeights(projectId, weights, updatedBy)
      }

      res.json({
        success: true,
        message: '项目角色权重设置成功',
        data: result
      })
    } catch (error) {
      logger.error('设置项目角色权重失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '设置项目角色权重失败'
      })
    }
  }

  /**
   * 设置单个角色权重（独立路由）
   */
  async setRoleWeight(req, res, next) {
    try {
      const { projectId, role } = req.params
      const { weight } = req.body
      const updatedBy = req.user.id

      if (!projectId || !role || weight === undefined) {
        return res.status(400).json({
          success: false,
          message: '项目ID、角色与权重不能为空'
        })
      }

      // 权限检查：获取项目信息以验证用户权限
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在'
        })
      }

      const userPermissions = PermissionValidator.getUserPermissions(req.user)
      let hasPermission = false
      if (PermissionValidator.hasPermission(userPermissions, ['project:weights:update_all', 'project:*', '*'])) {
        hasPermission = true
      } else if (PermissionValidator.hasPermission(userPermissions, 'project:weights:update_own')) {
        let isManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
          (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
          (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
          (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())

        // 增强：检查是否为待审批团队申请的申请人
        if (!isManager) {
          try {
            const teamApps = await databaseService.find('project_team_applications', {
              projectId,
              status: 'pending'
            })
            isManager = teamApps.some(app =>
              (app.applicantId && req.user.id && app.applicantId.toString() === req.user.id.toString()) ||
              (app.applicant_id && req.user.id && app.applicant_id.toString() === req.user.id.toString())
            )
          } catch (err) {
            logger.warn('检查团队申请状态失败:', err.message)
          }
        }

        if (isManager) {
          hasPermission = true
        }
      }
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足：您没有权限修改此项目的角色权重配置',
          data: {
            required: ['project:weights:update_own', 'project:weights:update_all'],
            message: '需要项目权重管理权限，且只能管理自己负责的项目（除非有全局权限）'
          }
        })
      }

      const result = await projectBonusService.setProjectRoleWeight(projectId, role, weight, updatedBy)
      res.json({
        success: true,
        message: '角色权重设置成功',
        data: result
      })
    } catch (error) {
      logger.error('设置单个角色权重失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '设置单个角色权重失败'
      })
    }
  }

  /**
   * 获取项目角色权重
   */
  async getRoleWeights(req, res, next) {
    try {
      const { projectId } = req.params

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: '项目ID不能为空'
        })
      }

      // 权限检查：获取项目信息以验证用户权限
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在'
        })
      }

      // 使用权限验证器获取用户权限
      const userPermissions = PermissionValidator.getUserPermissions(req.user)

      // 检查用户是否有权限查看项目角色权重
      let hasPermission = false

      // 检查是否有查看所有项目权重的权限
      if (PermissionValidator.hasPermission(userPermissions, ['project:weights:view_all', 'project:*', '*'])) {
        hasPermission = true
      }
      // 检查是否有查看自己项目权重的权限，并且确实是项目管理者
      else if (PermissionValidator.hasPermission(userPermissions, 'project:weights:view_own')) {
        // 验证用户是否为项目管理者或参与者
        let isManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
          (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
          (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
          (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())

        // 增强：检查是否为待审批团队申请的申请人
        if (!isManager) {
          try {
            const teamApps = await databaseService.find('project_team_applications', {
              projectId,
              status: 'pending'
            })
            isManager = teamApps.some(app =>
              (app.applicantId && req.user.id && app.applicantId.toString() === req.user.id.toString()) ||
              (app.applicant_id && req.user.id && app.applicant_id.toString() === req.user.id.toString())
            )
          } catch (err) {
            logger.warn('检查团队申请状态失败:', err.message)
          }
        }

        if (isManager || (project.members && project.members.includes(req.user.employeeId))) {
          hasPermission = true
        }
      }
      // 如果用户有project:view权限,且是项目经理或成员,也允许查看
      else if (PermissionValidator.hasPermission(userPermissions, 'project:view')) {
        // 检查是否为项目经理(通过employeeId匹配)
        if (project.managerId && req.user.employeeId &&
          project.managerId.toString() === req.user.employeeId.toString()) {
          hasPermission = true
        }
        // 检查是否为项目成员(查询project_members表)
        else {
          try {
            const members = await databaseService.find('projectMembers', { projectId })
            const isMember = members.some(m => m.employeeId === req.user.employeeId)
            if (isMember) {
              hasPermission = true
            }
          } catch (err) {
            // 忽略查询错误
          }
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足：您没有权限查看此项目的角色权重配置',
          data: {
            required: ['project:weights:view_own', 'project:weights:view_all'],
            message: '需要项目权重查看权限，且只能查看自己参与的项目（除非有全局权限）'
          }
        })
      }

      const weights = await projectBonusService.getProjectRoleWeights(projectId)

      res.json({
        success: true,
        data: weights
      })
    } catch (error) {
      logger.error('获取项目角色权重失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取项目角色权重失败'
      })
    }
  }

  /**
   * 获取项目奖金分配详情
   */
  async getBonusDetails(req, res, next) {
    try {
      const { projectId, period } = req.params

      if (!projectId || !period) {
        return res.status(400).json({
          success: false,
          message: '项目ID和期间不能为空'
        })
      }

      const details = await projectBonusService.getProjectBonusDetails(projectId, period)

      res.json({
        success: true,
        data: details
      })
    } catch (error) {
      logger.error('获取项目奖金详情失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取项目奖金详情失败'
      })
    }
  }

  /**
   * 审批项目奖金分配
   */
  async approveBonus(req, res, next) {
    try {
      const { poolId } = req.params
      const approvedBy = req.user.id

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      // 获取奖金池信息
      const pool = await projectBonusService.getBonusPoolById(poolId)
      if (!pool) {
        return res.status(404).json({
          success: false,
          message: '奖金池不存在'
        })
      }

      // 检查项目状态：只有已完成的项目才能提交审批
      const project = await databaseService.getProjectById(pool.projectId)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: '项目不存在'
        })
      }

      if (project.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: `项目当前状态为"${project.status}"，只有已完成(completed)的项目才能提交奖金审批`,
          data: {
            projectStatus: project.status,
            requiredStatus: 'completed'
          }
        })
      }

      const approvalResult = await projectBonusService.approveProjectBonusAllocation(poolId, approvedBy)

      // 如果返回了审批结果，确保有 id 字段
      if (approvalResult) {
        const formattedResult = {
          id: approvalResult._id || approvalResult.id,
          ...approvalResult
        }

        res.json({
          success: true,
          message: '项目奖金分配审批完成',
          data: formattedResult
        })
      } else {
        res.json({
          success: true,
          message: '项目奖金分配审批完成'
        })
      }
    } catch (error) {
      logger.error('审批项目奖金分配失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '审批项目奖金分配失败'
      })
    }
  }

  /**
   * 获取奖金池列表
   */
  async getBonusPools(req, res, next) {
    try {
      const { projectId, period, status } = req.query
      const filters = {}

      if (projectId) filters.projectId = projectId
      if (period) filters.period = period
      if (status) filters.status = status

      const pools = await projectBonusService.getBonusPools(filters)

      // 确保所有返回的奖金池都有 id 字段而不是 _id
      const formattedPools = pools.map(pool => ({
        id: pool._id || pool.id,
        ...pool
      }))
      res.json({
        success: true,
        data: formattedPools,
        message: '获取奖金池列表成功'
      })
    } catch (error) {
      logger.error('获取奖金池列表失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取奖金池列表失败'
      })
    }
  }

  /**
   * 获取单个奖金池详情
   */
  async getBonusPoolDetail(req, res, next) {
    try {
      const { poolId } = req.params

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const pool = await projectBonusService.getBonusPoolById(poolId)

      res.json({
        success: true,
        data: pool,
        message: '获取奖金池详情成功'
      })
    } catch (error) {
      logger.error('获取奖金池详情失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取奖金池详情失败'
      })
    }
  }

  /**
   * 编辑项目奖金池
   */
  async updateBonusPool(req, res, next) {
    try {
      const { poolId } = req.params
      const { totalAmount, profitRatio, description, projectProfit } = req.body
      const updatedBy = req.user.id

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      // 获取当前奖金池信息，检查状态
      const currentPool = await projectBonusService.getBonusPoolById(poolId)
      if (!currentPool) {
        return res.status(404).json({
          success: false,
          message: '奖金池不存在'
        })
      }

      // pending和calculated状态的奖金池可以编辑
      if (currentPool.status !== 'pending' && currentPool.status !== 'calculated') {
        return res.status(400).json({
          success: false,
          message: `奖金池状态为"${currentPool.status}"，只有"待计算"或"已计算"状态的奖金池可以编辑`
        })
      }

      // 检查权限：创建者、项目绋理、财务或管理员可以编辑
      const userPermissions = PermissionValidator.getUserPermissions(req.user)
      const isAdmin = PermissionValidator.hasPermission(userPermissions, ['admin', '*'])
      const isFinance = PermissionValidator.hasPermission(userPermissions, 'finance')
      const isCreator = currentPool.createdBy === updatedBy

      // 如果不是管理员、财务或创建者，验证是否为项目经理
      let hasPermission = isAdmin || isFinance || isCreator

      if (!hasPermission) {
        // 获取项目信息，验证是否为项目经理
        const project = await databaseService.getProjectById(currentPool.projectId)
        if (project) {
          const isProjectManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
            (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
            (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
            (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())
          hasPermission = isProjectManager
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足：只有创建者、项目经理、财务或管理员可以编辑奖金池'
        })
      }

      const updateData = {}
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount
      if (profitRatio !== undefined) updateData.profitRatio = profitRatio
      if (description !== undefined) updateData.description = description
      if (projectProfit !== undefined) updateData.projectProfit = projectProfit
      updateData.updatedBy = updatedBy

      const updatedPool = await projectBonusService.updateBonusPool(poolId, updateData)

      // 确保返回的更新后的奖金池有 id 字段而不是 _id
      const formattedPool = updatedPool ? {
        id: updatedPool._id || updatedPool.id,
        ...updatedPool
      } : null

      res.json({
        success: true,
        data: formattedPool,
        message: '奖金池编辑成功'
      })
    } catch (error) {
      logger.error('编辑奖金池失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '编辑奖金池失败'
      })
    }
  }

  /**
   * 删除项目奖金池
   */
  async deleteBonusPool(req, res, next) {
    try {
      const { poolId } = req.params
      const deletedBy = req.user.id

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      // 获取当前奖金池信息，检查状态
      const currentPool = await projectBonusService.getBonusPoolById(poolId)
      if (!currentPool) {
        return res.status(404).json({
          success: false,
          message: '奖金池不存在'
        })
      }

      // // 只有pending状态的奖金池可以删除
      // if (currentPool.status !== 'pending') {
      //   return res.status(400).json({
      //     success: false,
      //     message: `奖金池状态为"${currentPool.status}"，只有"待审批"状态的奖金池可以删除`
      //   })
      // }

      // 检查权限：创建者、项目经理、财务或管理员可以删除
      const userPermissions = PermissionValidator.getUserPermissions(req.user)
      const isAdmin = PermissionValidator.hasPermission(userPermissions, ['admin', '*'])
      const isFinance = PermissionValidator.hasPermission(userPermissions, 'finance')
      const isCreator = currentPool.createdBy === deletedBy

      // 如果不是管理员、财务或创建者，验证是否为项目经理
      let hasPermission = isAdmin || isFinance || isCreator

      if (!hasPermission) {
        // 获取项目信息，验证是否为项目经理
        const project = await databaseService.getProjectById(currentPool.projectId)
        if (project) {
          const isProjectManager = (project.managerId && req.user.employeeId && project.managerId.toString() === req.user.employeeId.toString()) ||
            (project.manager_id && req.user.employeeId && project.manager_id.toString() === req.user.employeeId.toString()) ||
            (project.createdBy && req.user.id && project.createdBy.toString() === req.user.id.toString()) ||
            (project.created_by && req.user.id && project.created_by.toString() === req.user.id.toString())
          hasPermission = isProjectManager
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足：只有创建者、项目经理、财务或管理员可以删除奖金池'
        })
      }

      await projectBonusService.deleteBonusPool(poolId, deletedBy)

      res.json({
        success: true,
        message: '奖金池删除成功'
      })
    } catch (error) {
      logger.error('删除奖金池失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '删除奖金池失败'
      })
    }
  }

  /**
   * 获取奖金池计算历史
   */
  async getCalculationHistory(req, res, next) {
    try {
      const { poolId } = req.params

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const histories = await projectBonusService.getCalculationHistory(poolId)

      // 确保所有返回的历史记录都有 id 字段而不是 _id
      const formattedHistories = histories.map(history => ({
        id: history._id || history.id,
        ...history
      }))

      res.json({
        success: true,
        data: formattedHistories,
        message: '获取计算历史成功'
      })
    } catch (error) {
      logger.error('获取计算历史失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取计算历史失败'
      })
    }
  }
}

module.exports = new ProjectBonusController()
