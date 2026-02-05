﻿const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')
const auditService = require('../services/auditService')
const { ProjectStateFlowService, ProjectCooperationStatus } = require('../services/projectStateFlowService')



class ProjectController {
  // 获取项目列表
  async getProjects(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        status,
        priority,
        manager,
        cooperationStatus, // 新增：协作状态过滤
        my = false  // 新增参数：是否只返回当前用户相关的项目
      } = req.query

      let projects = []

      // 检查用户权限
      const userPermissions = req.user.Role?.permissions || req.user.permissions || []
      const isAdmin = userPermissions.includes('*') || userPermissions.includes('admin')
      // 项目经理：检查是否有项目管理相关权限

      const isProjectManager = userPermissions.includes('project_manager') ||
        userPermissions.includes('project:manage') ||
        req.user.Role?.name === '项目经理'
      
      // 财务和HR需要查看所有项目（用于成本管理和奖金计算）
      const isHROrFinance = userPermissions.includes('bonus:view') || 
                            userPermissions.includes('bonus:create') ||
                            userPermissions.includes('calculation:read') ||
                            userPermissions.includes('project:cost:view:all') ||
                            req.user.Role?.name === 'HR管理员' ||
                            req.user.Role?.name === '财务管理员'
      
      if (isAdmin || isHROrFinance) {
        // 管理员、HR、财务可以看到所有项目
        projects = await databaseService.getProjects()
      }
      else if (my === 'true' && req.user) {
        // 获取当前用户参与的项目
        const employee = await databaseService.getEmployeeByUserId(req.user.id)
        if (employee) {
          // 获取用户作为成员参与的项目
          const memberProjects = await databaseService.getEmployeeProjectMembers(employee._id)
          const projectIds = [...new Set(memberProjects.map(m => m.projectId))]

          // 获取项目详情
          const projectPromises = projectIds.map(id => databaseService.getProjectById(id))
          projects = (await Promise.all(projectPromises)).filter(p => p !== null)
        }
      } else if (manager === 'true' && req.user) {
        // manager=true: 获取用户可管理的项目
        // 1. 管理员：返回所有项目
        // 2. HR和财务：返回所有项目（用于奖金计算）
        // 3. 项目经理：只返回自己作为项目经理的项目

        const isHROrFinance = userPermissions.includes('bonus:view') || 
                              userPermissions.includes('bonus:create') ||
                              userPermissions.includes('calculation:read') ||
                              req.user.Role?.name === 'HR管理员' ||
                              req.user.Role?.name === '财务管理员'

        if (isAdmin || isHROrFinance) {
          // 管理员、HR、财务可以查看所有项目
          logger.info('[Manager Query] Admin/HR/Finance user, returning all projects')
          projects = await databaseService.getProjects()
        } else {
          // 普通用户/项目经理：只返回自己管理的项目
          const userEmployee = await databaseService.getEmployeeByUserId(req.user.id)
          if (userEmployee) {
            projects = await databaseService.getProjects()
            projects = projects.filter(project => project.managerId === userEmployee._id)
            logger.info(`[Manager Query] User ${req.user.id} manages ${projects.length} projects`)
          } else {
            projects = []
          }
        }
      }  else if (isProjectManager && req.user) {
        // 项目经理：能看到自己管理的项目 + 自己参与的项目 + 已发布且未指定经理的项目
        const employee = await databaseService.getEmployeeByUserId(req.user.id)
        logger.info(`[Project Manager] User ID: ${req.user.id}, Employee:`, employee ? `${employee.name} (${employee._id})` : 'not found')

        if (employee) {
          // 1. 获取用户管理的项目
          const allProjects = await databaseService.getProjects()
          const managedProjects = allProjects.filter(project => {
            const isManaged = project.managerId === employee._id
            if (isManaged) {
              logger.info(`[Managed Project] ${project.name}, managerId: ${project.managerId}, employeeId: ${employee._id}`)
            }
            return isManaged
          })
          logger.info(`[Project Manager] Found ${managedProjects.length} managed projects`)

          // 2. 获取用户作为成员参与的项目
          const memberProjects = await databaseService.getEmployeeProjectMembers(employee._id)
          const memberProjectIds = [...new Set(memberProjects.map(m => m.projectId))]
          logger.info(`[Project Manager] Found ${memberProjectIds.length} participated project IDs`)

          const projectPromises = memberProjectIds.map(id => databaseService.getProjectById(id))
          const participatedProjects = (await Promise.all(projectPromises)).filter(p => p !== null)
          logger.info(`[Project Manager] Found ${participatedProjects.length} participated projects`)

          // 3. 获取已发布且未指定项目经理的项目（开放抢单）
          const publishedUnassignedProjects = allProjects.filter(project => {
            const isPublished = project.cooperation_status === 'published'
            const hasNoManager = !project.managerId || project.managerId === null || project.managerId === ''
            const isUnassigned = isPublished && hasNoManager
            if (isUnassigned) {
              logger.info(`[Available Project] ${project.name}, cooperation_status: ${project.cooperation_status}, managerId: ${project.managerId || 'null'}`)
            }
            return isUnassigned
          })
          logger.info(`[Project Manager] Found ${publishedUnassignedProjects.length} published unassigned projects (open for application)`)

          // 4. 合并并去重（使用 _id 去重）
          const projectMap = new Map()
          managedProjects.forEach(p => projectMap.set(p._id, p))
          participatedProjects.forEach(p => projectMap.set(p._id, p))
          publishedUnassignedProjects.forEach(p => projectMap.set(p._id, p))
          projects = Array.from(projectMap.values())
          logger.info(`[Project Manager] Total unique projects: ${projects.length}`)
        }
      } else if (req.user) {
        // 普通用户能看到：1) 自己参与的项目 + 2) 已发布且已指定项目经理的项目（可申请加入）
        const employee = await databaseService.getEmployeeByUserId(req.user.id)
        if (employee) {
          // 1. 获取用户作为成员参与的项目
          const memberProjects = await databaseService.getEmployeeProjectMembers(employee._id)
          const projectIds = [...new Set(memberProjects.map(m => m.projectId))]

          // 获取参与的项目详情
          const projectPromises = projectIds.map(id => databaseService.getProjectById(id))
          const participatedProjects = (await Promise.all(projectPromises)).filter(p => p !== null)

          // 2. 获取已发布且已指定项目经理的项目（可供成员申请）
          const allProjects = await databaseService.getProjects()
          const availableProjects = allProjects.filter(project => {
            const isPublished = project.cooperation_status === 'published'
            const hasManager = project.managerId && project.managerId !== null && project.managerId !== ''
            return isPublished && hasManager
          })

          // 3. 合并并去重
          const projectMap = new Map()
          participatedProjects.forEach(p => projectMap.set(p._id, p))
          availableProjects.forEach(p => projectMap.set(p._id, p))
          projects = Array.from(projectMap.values())
        }
      } else {
        // 未登录用户不返回任何项目
        projects = []
      }

      // 搜索过滤
      if (search) {
        projects = projects.filter(project =>
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.code.toLowerCase().includes(search.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // 状态过滤
      if (status) {
        projects = projects.filter(project => project.status === status)
      }

      // 优先级过滤
      if (priority) {
        projects = projects.filter(project => project.priority === priority)
      }

      // 协作状态过滤
      if (cooperationStatus) {
        projects = projects.filter(project => project.cooperation_status === cooperationStatus)
      }

      // 分页处理
      const total = projects.length
      const offset = (page - 1) * pageSize
      const paginatedProjects = projects.slice(offset, offset + parseInt(pageSize))

      // 获取每个项目的经理信息、财务数据和协作信息
      const projectsWithDetails = await Promise.all(
        paginatedProjects.map(async (project) => {
          let manager = null
          if (project.managerId) {
            manager = await databaseService.getEmployeeById(project.managerId)
          }

          // 计算项目成本（汇总所有成本记录）
          let totalCost = 0
          try {
            const costs = await databaseService.getProjectCosts({ projectId: project._id })
            totalCost = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
          } catch (err) {
            logger.warn(`获取项目成本失败: projectId=${project._id}`, err.message)
          }

          // 计算预期利润 = 预算 - 成本
          const budget = project.budget || 0
          const expectedProfit = budget - totalCost

          // 计算预估奖金（根据利润目标计算，假设奖金10%利润）
          const profitTarget = project.profitTarget || 0
          const estimatedBonus = profitTarget > 0 ? profitTarget * 0.1 : 0

          // 获取实际计算出来的项目奖金总额
          let calculatedBonus = 0
          try {
            // 首先获取该项目的所有奖金池
            const bonusPoolsResult = await databaseService.findAll('projectBonusPools', {
              where: { projectId: project._id }
            })
            const bonusPools = bonusPoolsResult.rows || bonusPoolsResult || []

            // 如果有奖金池，查询所有奖金池的分配记录
            if (bonusPools.length > 0) {
              const poolIds = bonusPools.map(pool => pool._id || pool.id)

              for (const poolId of poolIds) {
                const allocationsResult = await databaseService.findAll('projectBonusAllocations', {
                  where: { poolId: poolId }
                })
                const allocations = allocationsResult.rows || allocationsResult || []

                allocations.forEach(allocation => {
                  // databaseService.findAll 会自动将字段名转换为驼峰命名
                  const amount = parseFloat(allocation.bonusAmount) || parseFloat(allocation.bonus_amount) || 0
                  calculatedBonus += amount
                })
              }
            }
          } catch (err) {
            logger.warn(`获取项目实际奖金失败: projectId=${project._id}`, err.message)
          }

          // 获取协作信息（是否发布、申请数量、已批准数量）
          let isPublished = false
          let applicationCount = 0
          let approvedApplicationCount = 0

          try {
            // 检查项目是否已发布（通过项目自身的发布状态字段判断）
            isPublished = project.status == 'active'

            // 获取项目成员申请情况
            const members = await databaseService.getProjectMembers(project._id)
            applicationCount = members.length
            approvedApplicationCount = members.filter(m =>
              m.status === 'active' || m.status === 'approved'
            ).length
          } catch (err) {
            logger.warn(`获取项目协作信息失败: projectId=${project._id}`, err.message)
          }

          // 移除_id，只使用id
          const { _id, ...projectData } = project

          return {
            ...projectData,
            id: _id,
            cooperationStatus: project.cooperation_status || 'draft', // 转换协作状态为驼峰命名
            Manager: manager ? {
              id: manager._id,
              name: manager.name,
              employeeNo: manager.employeeNo
            } : null,
            // 财务数据
            cost: totalCost,
            expectedProfit,

            estimatedBonus, // 预估奖金（基于利润目标计算）
            calculatedBonus, // 实际计算出来的奖金总额
            bonusStatus: project.bonusStatus || project.bonus_status || 'pending', // 奖金状态
            // 协作信息
            isPublished,
            applicationCount,
            approvedApplicationCount
          }
        })
      )
      res.json({
        code: 200,
        data: {
          list: projectsWithDetails,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get projects error:', error)
      next(error)
    }
  }

  // 获取项目详情
  async getProject(req, res, next) {
    try {
      const { id } = req.params

      const project = await databaseService.getProjectById(id)

      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 获取项目经理信息
      let manager = null
      if (project.managerId) {
        manager = await databaseService.getEmployeeById(project.managerId)
      }

      // 获取发布人信息
      let publishedBy = null
      if (project.published_by) {
        const publisher = await databaseService.getUserById(project.published_by)
        if (publisher) {
          publishedBy = {
            id: publisher._id,
            name: publisher.real_name || publisher.username,
            username: publisher.username
          }
        }
      }

      // 获取项目权重配置
      const weights = await databaseService.getProjectWeights(id)

      // 获取项目奖金池信息
      let bonusPool = null;
      let bonusAllocations = [];
      try {
        // 获取最新的奖金池（按期间排序）
        const pools = await databaseService.find('projectBonusPools', {
          projectId: id
        });

        if (pools && pools.length > 0) {
          // 按期间排序，获取最新的
          pools.sort((a, b) => {
            // 简单的期间比较，实际可能需要更复杂的逻辑
            return b.period.localeCompare(a.period);
          });
          bonusPool = pools[0];

          // 获取该奖金池的分配记录
          if (bonusPool._id) {
            const allocations = await databaseService.find('projectBonusAllocations', {
              poolId: bonusPool._id
            });
            bonusAllocations = allocations || [];
          }
        }
      } catch (bonusError) {
        logger.warn(`获取项目奖金信息失败: projectId=${id}`, bonusError.message);
      }

      // 获取项目成员信息（包含员工详细信息）
      let projectMembers = [];
      try {
        const projectMemberService = require('../services/projectMemberService')
        projectMembers = await projectMemberService.getProjectMembers(id);
      } catch (memberError) {
        logger.warn(`获取项目成员信息失败: projectId=${id}`, memberError.message);
      }

      // 获取项目成本并计算预期利润
      let totalCost = 0
      try {
        const costs = await databaseService.getProjectCosts({ projectId: id })
        totalCost = costs.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0)
      } catch (err) {
        logger.warn(`获取项目成本失败: projectId=${id}`, err.message)
      }

      // 计算预期利润 = 预算 - 成本
      const budget = parseFloat(project.budget) || 0
      const expectedProfit = budget - totalCost

      // 计算预估奖金（根据利润目标计算）
      const profitTarget = parseFloat(project.profitTarget || project.profit_target) || 0
      const estimatedBonus = profitTarget > 0 ? profitTarget * 0.1 : 0

      // 获取实际计算出来的项目奖金总额
      let calculatedBonus = 0
      try {
        // 首先获取该项目的所有奖金池
        const bonusPoolsForCalc = await databaseService.findAll('projectBonusPools', {
          where: { projectId: id }
        })
        const poolsForCalc = bonusPoolsForCalc.rows || bonusPoolsForCalc || []

        // 如果有奖金池，查询所有奖金池的分配记录
        if (poolsForCalc.length > 0) {
          const poolIdsForCalc = poolsForCalc.map(pool => pool._id || pool.id)

          for (const poolId of poolIdsForCalc) {
            const allocationsResult = await databaseService.findAll('projectBonusAllocations', {
              where: { poolId: poolId }
            })
            const allocations = allocationsResult.rows || allocationsResult || []

            allocations.forEach(allocation => {
              // databaseService.findAll 会自动将字段名转换为驼峰命名
              const amount = parseFloat(allocation.bonusAmount) || parseFloat(allocation.bonus_amount) || 0
              calculatedBonus += amount
            })
          }
        }
      } catch (err) {
        logger.warn(`获取项目实际奖金失败: projectId=${id}`, err.message)
      }

      // 计算项目进度（基于时间）
      let overallProgress = 0
      if (project.startDate && project.endDate) {
        const start = new Date(project.startDate)
        const end = new Date(project.endDate)
        const now = new Date()

        if (now < start) {
          overallProgress = 0
        } else if (now > end) {
          overallProgress = 100
        } else {
          const totalTime = end.getTime() - start.getTime()
          const elapsedTime = now.getTime() - start.getTime()
          overallProgress = Math.round((elapsedTime / totalTime) * 100)
        }
      }

      // 移除_id，只使用id
      const { _id, ...projectData } = project

      const projectWithDetails = {
        ...projectData,
        id: _id,
        cooperationStatus: project.cooperation_status || 'draft', // 转换协作状态为驼峰命名
        publishedAt: project.published_at, // 发布时间
        Manager: manager ? {
          id: manager._id,
          name: manager.name,
          employeeNo: manager.employeeNo,
          departmentName: manager.departmentName || '',
          positionName: manager.positionName || ''
        } : null,
        PublishedBy: publishedBy, // 发布人信息
        ProjectLineWeights: weights,
        // 添加奖金信息
        bonusPool: bonusPool,
        bonusAllocations: bonusAllocations,
        // 添加成员信息
        projectMembers: projectMembers,
        // 添加财务数据
        budget: budget,
        cost: totalCost,
        profitTarget: profitTarget,
        expectedProfit: expectedProfit,

        estimatedBonus: estimatedBonus, // 预估奖金
        calculatedBonus: calculatedBonus, // 实际计算出来的奖金总额
        bonusStatus: project.bonusStatus || project.bonus_status || 'pending', // 奖金状态
        // 添加计算后的利润率
        profitMargin: budget > 0 ? (expectedProfit / budget * 100).toFixed(2) : 0,
        // 添加项目进度
        overallProgress: overallProgress
      }

      res.json({
        code: 200,
        data: projectWithDetails,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get project error:', error)
      next(error)
    }
  }

  // 创建项目
  async createProject(req, res, next) {
    try {
      const {
        name,
        code,
        description,
        managerId,
        startDate,
        endDate,
        budget,
        profitTarget,
        priority
      } = req.body

      // 检查项目代码是否已存在
      const existingCode = await databaseService.findOne('projects', { code })
      console.log('existingCode', existingCode)
      if (existingCode) {
        return res.status(400).json({
          code: 400,
          message: '项目代码已存在',
          data: null
        })
      }

      // 检查项目名称是否已存在
      const existingName = await databaseService.findOne('projects', { name })
      if (existingName) {
        return res.status(400).json({
          code: 400,
          message: '项目名称已存在',
          data: null
        })
      }

      // 验证项目经理是否存在
      if (managerId) {
        logger.info(`正在验证项目经理ID: ${managerId}`)
        let manager = await databaseService.getEmployeeById(managerId)

        // 如果直接查询失败，尝试从员工列表中查找
        if (!manager) {
          logger.info(`直接查询失败，尝试从员工列表中查找`)
          const allEmployees = await databaseService.getEmployees()
          manager = allEmployees.find(emp => emp._id === managerId)
          if (manager) {
            logger.info(`从员工列表中找到项目经理: ${manager.name}`)
          }
        }

        if (!manager) {
          logger.error(`项目经理ID ${managerId} 不存在`)
          return res.status(400).json({
            code: 400,
            message: '指定项目经理不存在',
            data: null
          })
        }
        logger.info(`项目经理验证成功: ${manager.name}`)
      }

      const project = await databaseService.createProject({
        name,
        code,
        description,
        manager_id: managerId, // 转换为下划线命名
        start_date: startDate, // 转换为下划线命名
        end_date: endDate,     // 转换为下划线命名
        budget: budget || 0,
        profit_target: profitTarget || 0, // 转换为下划线命名
        priority: priority || 'medium'
        // 注意：projects表没有created_by字段，只有created_at和updated_at
      })

      logger.info(`管理员${req.user.username}创建项目: ${name} (${code})`)

      res.status(201).json({
        code: 201,
        data: {
          ...project,
          id: project._id // 兼容前端期望的 id 字段
        },
        message: '项目创建成功'
      })

    } catch (error) {
      logger.error('Create project error:', error)
      next(error)
    }
  }

  // 更新项目
  async updateProject(req, res, next) {
    try {
      const { id } = req.params
      const {
        name,
        code,
        description,
        managerId,
        startDate,
        endDate,
        budget,
        profitTarget,
        priority,
        status
      } = req.body

      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 权限检查：管理员或项目经理
      const userPermissions = req.user.Role?.permissions || req.user.permissions || []
      const hasUpdatePermission = userPermissions.includes('*') ||
        userPermissions.includes('admin') ||
        userPermissions.includes('project:update')

      // 检查是否是项目经理
      let isProjectManager = false
      if (project.managerId && req.user.employeeId) {
        isProjectManager = project.managerId.toString() === req.user.employeeId.toString()
        logger.info(`项目经理权限检查`, {
          projectManagerId: project.managerId,
          userEmployeeId: req.user.employeeId,
          isProjectManager
        })
      }

      if (!hasUpdatePermission && !isProjectManager) {
        logger.warn(`权限不足：用户${req.user.username}尝试更新项目${project.name}`, {
          required: ['project:update', '或为项目经理'],
          userPermissions,
          userId: req.user.id,
          employeeId: req.user.employeeId,
          projectManagerId: project.managerId
        })
        return res.status(403).json({
          code: 403,
          message: '权限不足：只有管理员或项目经理可以修改项目',
          data: null
        })
      }

      // 检查项目代码是否被其他项目使用
      if (code && code !== project.code) {
        const existingCode = await databaseService.findOne('projects', {
          code,
          _id: { $ne: id }
        })

        if (existingCode) {
          return res.status(400).json({
            code: 400,
            message: '项目代码已被其他项目使用',
            data: null
          })
        }
      }

      // 检查项目名称是否被其他项目使用
      if (name && name !== project.name) {
        const existingName = await databaseService.findOne('projects', {
          name,
          _id: { $ne: id }
        })

        if (existingName) {
          return res.status(400).json({
            code: 400,
            message: '项目名称已被其他项目使用',
            data: null
          })
        }
      }

      // 验证项目经理是否存在
      if (managerId && managerId !== project.managerId) {
        const manager = await databaseService.getEmployeeById(managerId)
        if (!manager) {
          return res.status(400).json({
            code: 400,
            message: '指定项目经理不存在',
            data: null
          })
        }
      }

      await databaseService.updateProject(id, {
        name: name || project.name,
        code: code || project.code,
        description: description !== undefined ? description : project.description,
        manager_id: managerId !== undefined ? managerId : project.managerId, // 转换为下划线命名
        start_date: startDate || project.startDate, // 转换为下划线命名
        end_date: endDate || project.endDate,       // 转换为下划线命名
        budget: budget !== undefined ? budget : project.budget,
        profit_target: profitTarget !== undefined ? profitTarget : project.profitTarget, // 转换为下划线命名
        priority: priority || project.priority,
        status: status || project.status
      })

      const operator = isProjectManager ? `项目经理${req.user.username}` : `管理员${req.user.username}`
      logger.info(`${operator}更新项目: ${project.name} (${project.code})`)

      res.json({
        code: 200,
        data: project,
        message: '项目更新成功'
      })

    } catch (error) {
      logger.error('Update project error:', error)
      next(error)
    }
  }

  // 删除项目
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params

      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查项目是否有权重配置
      const weightCount = await databaseService.count('projectLineWeights', { projectId: id })

      if (weightCount > 0) {
        return res.status(400).json({
          code: 400,
          message: `该项目有${weightCount}个业务线权重配置，请先清理权重配置`,
          data: null
        })
      }

      await databaseService.deleteProject(id)

      logger.info(`管理员${req.user.username}删除项目: ${project.name} (${project.code})`)

      res.json({
        code: 200,
        data: null,
        message: '项目删除成功'
      })

    } catch (error) {
      logger.error('Delete project error:', error)
      next(error)
    }
  }

  // 获取项目业务线权重配置
  async getProjectWeights(req, res, next) {
    try {
      const { id } = req.params

      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 获取所有激活的业务线
      const businessLines = await databaseService.getBusinessLines({ status: 1 })

      // 获取项目特定权重配置
      const projectWeights = await databaseService.getProjectWeights(id)

      // 构建权重配置列表
      const weightConfig = businessLines.map(line => {
        const customWeight = projectWeights.find(w => w.businessLineId === line._id)
        return {
          businessLineId: line._id,
          businessLineName: line.name,
          businessLineCode: line.code,
          defaultWeight: line.weight,
          customWeight: customWeight ? customWeight.weight : null,
          isCustom: !!customWeight,
          effectiveWeight: customWeight ? customWeight.weight : line.weight,
          reason: customWeight ? customWeight.reason : null,
          effectiveDate: customWeight ? customWeight.createdAt : null,
          configId: customWeight ? customWeight._id : null
        }
      })

      res.json({
        code: 200,
        data: {
          project: {
            id: project.id,
            name: project.name,
            code: project.code
          },
          weightConfig
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get project weights error:', error)
      next(error)
    }
  }

  // 更新项目业务线权重配置
  async updateProjectWeights(req, res, next) {
    try {
      const { id } = req.params
      const { weights, reason } = req.body

      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 验证权重总和是否为1
      const totalWeight = weights.reduce((sum, w) => sum + parseFloat(w.weight), 0)
      if (Math.abs(totalWeight - 1) > 0.001) {
        return res.status(400).json({
          code: 400,
          message: '权重总和必须等于100%',
          data: null
        })
      }

      // 验证业务线是否存在
      const businessLineIds = weights.map(w => w.businessLineId)
      const existingLines = await databaseService.getBusinessLines()
      const validLines = existingLines.filter(line => businessLineIds.includes(line._id))

      if (validLines.length !== businessLineIds.length) {
        return res.status(400).json({
          code: 400,
          message: '部分业务线不存在',
          data: null
        })
      }

      // 删除现有权重配置
      await databaseService.deleteMany('projectLineWeights', { projectId: id })

      // 创建新的权重配置
      const weightConfigs = weights.map(weight => ({
        projectId: id,
        businessLineId: weight.businessLineId,
        weight: weight.weight,
        reason: reason || null,
        isCustom: true,
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      if (weightConfigs.length > 0) {
        await databaseService.createMany('projectLineWeights', weightConfigs)
      }

      logger.info(`管理员${req.user.username}更新项目${project.name}的业务线权重配置`)

      res.json({
        code: 200,
        data: { updatedCount: weightConfigs.length },
        message: '权重配置更新成功'
      })

    } catch (error) {
      logger.error('Update project weights error:', error)
      next(error)
    }
  }

  // 重置项目权重到默认值
  async resetProjectWeights(req, res, next) {
    try {
      const { id } = req.params

      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 删除项目的自定义权重配置
      const deletedCount = await databaseService.deleteMany('projectLineWeights', { projectId: id })

      logger.info(`管理员${req.user.username}重置项目${project.name}的权重配置，删除${deletedCount}条自定义配置`)

      res.json({
        code: 200,
        data: { deletedCount },
        message: '权重配置已重置为默认值'
      })

    } catch (error) {
      logger.error('Reset project weights error:', error)
      next(error)
    }
  }

  // 获取权重使用情况统计
  async getWeightStatistics(req, res, next) {
    try {
      // 项目数量统计
      const allProjects = await databaseService.getProjects()
      const projectStats = []
      const statusCounts = {}

      allProjects.forEach(project => {
        const status = project.status || 'unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      Object.entries(statusCounts).forEach(([status, count]) => {
        projectStats.push({ status, count })
      })

      // 自定义权重配置统计
      const allWeights = await databaseService.find('projectLineWeights', {})
      const customWeightCount = allWeights.filter(w => w.isCustom).length

      // 业务线权重配置分布
      const lineWeightStats = []
      const businessLines = await databaseService.getBusinessLines()

      businessLines.forEach(line => {
        const lineWeights = allWeights.filter(w => w.businessLineId === line._id)
        if (lineWeights.length > 0) {
          const avgWeight = lineWeights.reduce((sum, w) => sum + w.weight, 0) / lineWeights.length
          lineWeightStats.push({
            businessLineId: line._id,
            projectCount: lineWeights.length,
            avgWeight: avgWeight,
            BusinessLine: {
              name: line.name,
              code: line.code,
              weight: line.weight
            }
          })
        }
      })

      res.json({
        code: 200,
        data: {
          projectStats,
          customWeightCount,
          lineWeightStats
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get weight statistics error:', error)
      next(error)
    }
  }


  // 获取用户可申请的项目列表
  async getAvailableProjects(req, res, next) {
    try {
      const userId = req.user.id
      console.log('获取可申请项目，用户ID:', userId)

      // 获取当前用户的员工信息
      const employee = await databaseService.getEmployeeByUserId(userId)
      if (!employee) {
        console.log('用户未关联员工信息')
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }
      console.log('找到员工信息:', employee.name)

      // 获取所有项目
      const allProjects = await databaseService.getProjects()
      console.log('数据库中的项目总数:', allProjects.length)

      // 放宽状态过滤条件，包含更多状态的项目
      const availableStatuses = ['active', 'planning', 'team_building', 'recruiting']
      const activeProjects = allProjects.filter(project =>
        availableStatuses.includes(project.status)
      )
      console.log('符合状态条件的项目数:', activeProjects.length)
      console.log('项目状态分布:', activeProjects.map(p => ({ name: p.name, status: p.status })))

      // 获取用户已加入的项目ID列表
      const userProjectMembers = await databaseService.getEmployeeProjectMembers(employee._id)
      const joinedProjectIds = userProjectMembers
        .filter(member => member.status === 'active' || member.status === 'pending')
        .map(member => member.projectId)
      console.log('用户已加入的项目ID:', joinedProjectIds)

      // 过滤出用户未加入的项目
      const availableProjects = activeProjects.filter(project =>
        !joinedProjectIds.includes(project._id)
      )
      console.log('最终可申请的项目数:', availableProjects.length)

      // 获取每个项目的经理信息
      const projectsWithManager = await Promise.all(
        availableProjects.map(async (project) => {
          let manager = null
          if (project.managerId) {
            manager = await databaseService.getEmployeeById(project.managerId)
          }

          return {
            ...project,
            id: project._id, // 兼容前端期望的 id 字段
            Manager: manager ? {
              id: manager._id,
              name: manager.name,
              employeeNo: manager.employeeNo
            } : null
          }
        })
      )

      console.log('返回给前端的项目数据:', projectsWithManager.length, '个')
      res.json({
        code: 200,
        data: {
          projects: projectsWithManager,
          total: projectsWithManager.length
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get available projects error:', error)
      next(error)
    }
  }

  // 获取我参与的项目列表
  async getMyProjects(req, res, next) {
    try {
      const userId = req.user.id
      const {
        status,
        page = 1,
        pageSize = 20,
        search
      } = req.query

      // 获取当前用户的员工信息
      const employee = await databaseService.getEmployeeByUserId(userId)
      if (!employee) {
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }

      // 获取用户的项目成员记录
      let projectMembers = await databaseService.getEmployeeProjectMembers(employee._id)

      // 状态过滤
      if (status) {
        projectMembers = projectMembers.filter(member => member.status === status)
      }

      // 获取项目详情
      const projectsWithDetails = await Promise.all(
        projectMembers.map(async (member) => {
          const project = await databaseService.getProjectById(member.projectId)
          if (!project) return null

          // 获取项目经理信息
          let manager = null
          if (project.managerId) {
            manager = await databaseService.getEmployeeById(project.managerId)
          }

          // 获取项目奖金信息
          let projectBonus = 0;
          try {
            const bonusAllocations = await databaseService.findAll('projectBonusAllocations', {
              where: {
                employee_id: employee._id,
                project_id: member.projectId
              }
            });

            const allocations = bonusAllocations.rows || bonusAllocations;
            projectBonus = allocations.reduce((sum, allocation) =>
              sum + (parseFloat(allocation.bonus_amount) || parseFloat(allocation.bonusAmount) || 0), 0);
          } catch (bonusError) {
            logger.warn(`获取项目奖金信息失败: projectId=${member.projectId}, employeeId=${employee._id}`, bonusError.message);
          }

          // 移除_id，只使用id
          const { _id, ...projectData } = project

          return {
            ...projectData,
            id: _id,
            projectName: project.name,           // 前端期望的字段名
            projectCode: project.code,           // 前端期望的字段名
            projectStatus: project.status,       // 前端期望的字段名
            roleName: member.role || '成员',     // 前端期望的字段名
            joinDate: member.joinDate || member.createdAt,
            status: member.status || 'active',   // 参与状态
            participationRatio: member.expectedContribution || member.contributionWeight || 0, // 前端期望的字段名
            projectBonus: projectBonus, // 项目奖金
            Manager: manager ? {
              id: manager._id,
              name: manager.name,
              employeeNo: manager.employeeNo
            } : null
          }
        })
      )

      // 过滤掉不存在的项目
      let validProjects = projectsWithDetails.filter(project => project !== null)

      // 搜索过滤
      if (search) {
        validProjects = validProjects.filter(project =>
          project.projectName.toLowerCase().includes(search.toLowerCase()) ||
          project.projectCode.toLowerCase().includes(search.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // 分页处理
      const total = validProjects.length
      const offset = (page - 1) * pageSize
      const paginatedProjects = validProjects.slice(offset, offset + parseInt(pageSize))

      res.json({
        code: 200,
        data: {
          list: paginatedProjects,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total,
          employee: {
            id: employee._id,
            name: employee.name,
            employeeNo: employee.employeeNo
          }
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get my projects error:', error)
      next(error)
    }
  }

  // 申请加入项目
  async applyToProject(req, res, next) {
    try {
      const userId = req.user.id
      const { projectId, role, reason, expectedContribution } = req.body

      // 获取当前用户的员工信息
      const employee = await databaseService.getEmployeeByUserId(userId)
      if (!employee) {
        return res.status(400).json({
          code: 400,
          message: '当前用户未关联员工信息',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查是否已经申请过该项目
      const existingApplication = await databaseService.findOne('projectMembers', {
        projectId: projectId,
        employeeId: employee._id
      })

      if (existingApplication) {
        return res.status(409).json({
          code: 409,
          message: `您已经${existingApplication.status === 'pending' ? '申请过' : '加入了'}该项目`,
          data: {
            currentStatus: existingApplication.status,
            applicationDate: existingApplication.createdAt
          }
        })
      }

      // 创建项目申请记录
      // 解析角色ID（兼容传入名称或ID）
      let finalRoleId = null
      try {
        if (req.body.roleId) {
          finalRoleId = req.body.roleId
        } else if (role) {
          const roleRecord = await databaseService.getRoleByName(role)
          finalRoleId = roleRecord?._id || roleRecord?.id || roleRecord?.roleId || roleRecord?.ID || null
        }
      } catch (e) {
        // 解析失败时忽略，允许为空
      }

      const application = await databaseService.createProjectMember({
        projectId: projectId,
        employeeId: employee._id,
        roleId: finalRoleId,
        reason: reason,
        expectedContribution: expectedContribution || null,
        status: 'pending', // 待审批状态
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // 获取项目经理信息用于通知
      let projectManager = null
      if (project.managerId) {
        projectManager = await databaseService.getEmployeeById(project.managerId)
      }

      logger.info(`员工${employee.name}申请加入项目${project.name}，角色：${role}`)

      res.json({
        code: 200,
        data: {
          application: {
            id: application._id,
            projectId: projectId,
            projectName: project.name,
            roleId: finalRoleId,
            status: 'pending',
            appliedAt: application.appliedAt,
            projectManager: projectManager ? {
              name: projectManager.name,
              employeeNo: projectManager.employeeNo
            } : null
          },
          nextSteps: [
            '您的申请已提交成功',
            '项目经理将在3个工作日内处理您的申请',
            '您可以在“我的项目”页面查看申请状态'
          ]
        },
        message: '项目申请提交成功'
      })

    } catch (error) {
      logger.error('Apply to project error:', error)
      next(error)
    }
  }

  // 提前结项
  async completeProject(req, res, next) {
    try {
      const { id } = req.params
      const user = req.user

      // 校验项目存在
      const project = await databaseService.getProjectById(id)
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 读取协作状态
      let currentStatus = null
      try {
        currentStatus = await ProjectStateFlowService.getProjectStatus(id)
      } catch (stateErr) {
        // 如果协作状态读取失败，容错使用通用状态
        currentStatus = project.cooperationStatus || project.cooperation_status || null
      }

      if (!currentStatus) {
        return res.status(400).json({
          code: 400,
          message: '项目协作状态不可用，无法执行提前结项',
          data: null
        })
      }

      // 状态机逻辑
      // 允许从 approved 或 in_progress 提前结项
      if (currentStatus === ProjectCooperationStatus.APPROVED) {
        // 先启动，再完成
        await ProjectStateFlowService.startProject(id, user.id)
        await ProjectStateFlowService.completeProject(id, user.id)
      } else if (currentStatus === ProjectCooperationStatus.IN_PROGRESS) {
        // 直接完成
        await ProjectStateFlowService.completeProject(id, user.id)
      } else {
        // 其他状态拒绝：published 或 team_building 等
        const msgMap = {
          [ProjectCooperationStatus.PUBLISHED]: '项目尚未审批通过，不能提前结项',
          [ProjectCooperationStatus.TEAM_BUILDING]: '项目团队组建中，不能提前结项',
          [ProjectCooperationStatus.CANCELLED]: '项目已取消，不能提前结项',
          [ProjectCooperationStatus.COMPLETED]: '项目已完成，无需重复结项'
        }
        return res.status(400).json({
          code: 400,
          message: msgMap[currentStatus] || `当前状态(${currentStatus})不允许提前结项`,
          data: null
        })
      }

      // 同步通用项目状态为 completed（供项目管理列表显示）
      try {
        await databaseService.updateProject(id, { status: 'completed' })
      } catch (syncErr) {
        // 不影响主流程，仅记录警告
        logger.warn('同步项目通用状态失败:', syncErr?.message)
      }

      // 审计日志
      try {
        await auditService.logPermissionAction(
          user,
          'project:update',
          'project',
          id,
          { action: 'early_complete' },
          {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.id
          }
        )
      } catch (auditErr) {
        // 审计失败不影响主流程
      }

      logger.info(`项目${project.name}提前结项成功，操作人：${user.username}`)

      return res.json({
        code: 200,
        message: '项目提前结项成功',
        data: {
          projectId: id,
          newStatus: 'completed'
        }
      })
    } catch (error) {
      logger.error('Early complete project error:', error)
      next(error)
    }
  }
}

module.exports = new ProjectController()
