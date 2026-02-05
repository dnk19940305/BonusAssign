const logger = require('../utils/logger')
const { PermissionValidator } = require('../config/permissions')
const databaseService = require('../services/databaseService')


class ProjectCostController {
  /**
   * 创建项目成本记录
   */
  async createCost(req, res, next) {
    try {
      const user = req.user
      const { projectId, costType, amount, description, date, status } = req.body

      // 验证必要字段
      if (!projectId || !costType || !amount || !description) {
        return res.status(400).json({
          code: 400,
          message: '缺少必要字段',
          data: null
        })
      }

      // 验证成本类型
      const validCostTypes = ['人力成本', '材料成本', '其他成本']
      if (!validCostTypes.includes(costType)) {
        return res.status(400).json({
          code: 400,
          message: '无效的成本类型',
          data: null
        })
      }

      // 验证金额
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          code: 400,
          message: '成本金额必须为正数',
          data: null
        })
      }

      // 检查项目是否存在
      const project = await databaseService.findOne('projects', { _id: projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查用户权限
      // 财务人员或项目经理可以添加成本记录
      const hasCreatePermission = PermissionValidator.checkUserPermission(user, [
        'project:cost:create',
        'project:cost:manage',
        'finance:view',
        'finance:manage',
        '*'
      ]) || PermissionValidator.checkProjectPermission(user, 'manage', project)

      if (!hasCreatePermission) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限为此项目添加成本记录',
          data: null
        })
      }

      // 创建成本记录
      const costData = {
        projectId,
        costType,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
        recordedBy: user.employeeId || user.id,
        status: status,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await databaseService.createProjectCost(costData)

      res.status(201).json({
        code: 201,
        message: '成本记录创建成功',
        data: result
      })

    } catch (error) {
      logger.error('Create project cost error:', error)
      next(error)
    }
  }

  /**
   * 获取项目成本列表
   */
  async getCosts(req, res, next) {
    try {
      const user = req.user
      const { projectId, costType, startDate, endDate, page = 1, pageSize = 20 } = req.query

      let costs = []
      let total = 0

      // 构建查询条件
      const query = {}
      if (projectId) query.projectId = projectId
      if (costType) query.costType = costType

      // 日期范围查询
      if (startDate || endDate) {
        query.date = {}
        if (startDate) {
          query.date.$gte = new Date(startDate)
        }
        if (endDate) {
          // 如果也是只有日期字符串，建议设为当天的结束时间，或者直接用日期对象
          // 这里假设传入的是 YYYY-MM-DD 格式，转为 Date
          //为了包含结束日期当天，可以将结束日期设为当天的23:59:59，或者简单地+1天
          // 简单起见，这里直接用 new Date(endDate)，但要注意时区和具体时间点
          // 通常前端传来的如果是 YYYY-MM-DD，new Date() 会是 UTC 0点。
          // 如果需要精确匹配，建议在前端处理好时间，或者后端加一天。
          // 这里暂时直接转换，视具体需求微调。为了包含当天，通常需要处理时间部分。
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          query.date.$lte = end
        }
      }
      // 如果指定了项目ID，检查用户权限
      if (projectId) {
        const project = await databaseService.findOne('projects', { _id: projectId })
        if (!project) {
          return res.status(404).json({
            code: 404,
            message: '项目不存在',
            data: null
          })
        }

        // 检查用户是否有权限查看此项目的成本
        if (!PermissionValidator.checkProjectPermission(user, 'view', project)) {
          return res.status(403).json({
            code: 403,
            message: '您没有权限查看此项目的成本信息',
            data: null
          })
        }

        costs = await databaseService.find('projectCosts', query)
        total = costs.length
      } else {
        // 如果没有指定项目ID，只返回用户有权限查看的项目成本
        // 检查是否是超级管理员或有查看所有项目成本的权限
        const hasAdminPermission = PermissionValidator.checkUserPermission(user, [
          '*',
          'admin',
          'project:cost:view:all',
          'project:cost:manage',
          'finance:view',
          'finance:manage',
          'bonus:view',
          'bonus:create'
        ])

        if (!hasAdminPermission) {
          // 非管理员，需要过滤项目
          const accessibleProjectIds = new Set()

          // 1. 查找用户管理的项目
          const managedProjects = await databaseService.find('projects', {
            managerId: user.employeeId || user.id
          })
          managedProjects.forEach(p => accessibleProjectIds.add(p._id || p.id))

          // 2. 查找用户作为成员的项目（通过project_members表）
          const memberRecords = await databaseService.find('projectMembers', {
            employeeId: user.employeeId || user.id,
            status: 'active'
          })
          memberRecords.forEach(m => accessibleProjectIds.add(m.projectId || m.project_id))

          // 3. 查找公开项目
          const publicProjects = await databaseService.find('projects', {
            status: 'public'
          })
          publicProjects.forEach(p => accessibleProjectIds.add(p._id || p.id))

          if (accessibleProjectIds.size > 0) {
            const projectIds = Array.from(accessibleProjectIds);
            // 使用find方法获取所有成本，然后在应用层过滤
            const allCosts = await databaseService.find('projectCosts', {});
            costs = allCosts.filter(cost => projectIds.includes(cost.projectId));
            total = costs.length;
          } else {
            // 如果用户没有可访问的项目，返回空列表
            return res.json({
              code: 200,
              message: '获取成功',
              data: {
                list: [],
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total: 0,
                totalPages: 0
              }
            })
          }
        } else {
          // 管理员或有权限的用户查询所有成本
          costs = await databaseService.find('projectCosts', query);
          total = costs.length;
        }
      }

      // 获取所有相关项目的信息，用于添加项目名称
      const projectIds = [...new Set(costs.map(cost => cost.projectId))]
      const projects = {}

      // 如果有项目ID，获取项目信息
      if (projectIds.length > 0) {
        const projectList = await Promise.all(
          projectIds.map(id => databaseService.findOne('projects', { _id: id }))
        )

        // 创建项目ID到项目名称的映射
        projectList.forEach(project => {
          if (project) {
            projects[project._id] = project.name
          }
        })
      }

      // 获取所有记录人的用户信息
      const recordedByIds = [...new Set(costs.map(cost => cost.recordedBy).filter(id => id))]
      const recordedByUsers = {}
      // 如果有记录人ID，获取用户信息
      if (recordedByIds.length > 0) {
        const userList = await Promise.all(
          recordedByIds.map(id => databaseService.findOne('employees', { _id: id }))
        )

        // 创建用户ID到用户名的映射
        userList.forEach(user => {
          if (user) {
            recordedByUsers[user._id] = user.realName || user.username || user.name
          }
        })
      }

      // 为每个成本记录添加项目名称和记录人名称
      const costsWithDetails = costs.map(cost => ({
        ...cost,
        projectName: projects[cost.projectId] || '未知项目',
        recordedByName: recordedByUsers[cost.recordedBy] || '未知用户'
      }))

      // 分页
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedCosts = costsWithDetails.slice(startIndex, endIndex)

      res.json({
        code: 200,
        message: '获取成功',
        data: {

          list: paginatedCosts,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      })

    } catch (error) {
      logger.error('Get project costs error:', error)
      next(error)
    }
  }

  /**
   * 根据ID获取成本记录
   */
  async getCostById(req, res, next) {
    try {
      const user = req.user
      const { costId } = req.params

      // 获取成本记录
      const cost = await databaseService.findOne('projectCosts', { _id: costId })
      if (!cost) {
        return res.status(404).json({
          code: 404,
          message: '成本记录不存在',
          data: null
        })
      }

      // 检查用户权限
      const project = await databaseService.findOne('projects', { _id: cost.projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '关联的项目不存在',
          data: null
        })
      }

      if (!PermissionValidator.checkProjectPermission(user, 'view', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限查看此成本记录',
          data: null
        })
      }

      res.json({
        code: 200,
        message: '获取成功',
        data: cost
      })

    } catch (error) {
      logger.error('Get project cost by ID error:', error)
      next(error)
    }
  }

  /**
   * 更新成本记录
   */
  async updateCost(req, res, next) {
    try {
      const user = req.user
      const { costId } = req.params
      const updateData = req.body

      // 获取成本记录
      const cost = await databaseService.findOne('projectCosts', { _id: costId })
      if (!cost) {
        return res.status(404).json({
          code: 404,
          message: '成本记录不存在',
          data: null
        })
      }

      // 检查用户权限
      const project = await databaseService.findOne('projects', { _id: cost.projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '关联的项目不存在',
          data: null
        })
      }

      // 财务人员或项目经理可以修改成本记录
      const hasUpdatePermission = PermissionValidator.checkUserPermission(user, [
        'project:cost:update',
        'project:cost:manage',
        'finance:view',
        'finance:manage',
        '*'
      ]) || PermissionValidator.checkProjectPermission(user, 'manage', project)

      if (!hasUpdatePermission) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限修改此成本记录',
          data: null
        })
      }

      // 验证更新数据
      if (updateData.amount && (typeof updateData.amount !== 'number' || updateData.amount <= 0)) {
        return res.status(400).json({
          code: 400,
          message: '成本金额必须为正数',
          data: null
        })
      }

      if (updateData.costType) {
        const validCostTypes = ['人力成本', '材料成本', '其他成本']
        if (!validCostTypes.includes(updateData.costType)) {
          return res.status(400).json({
            code: 400,
            message: '无效的成本类型',
            data: null
          })
        }
      }

      // 更新成本记录
      const result = await databaseService.updateProjectCost(costId, updateData)

      res.json({
        code: 200,
        message: '成本记录更新成功',
        data: result
      })

    } catch (error) {
      logger.error('Update project cost error:', error)
      next(error)
    }
  }

  /**
   * 删除成本记录
   */
  async deleteCost(req, res, next) {
    try {
      const user = req.user
      const { costId } = req.params

      // 获取成本记录
      const cost = await databaseService.findOne('projectCosts', { _id: costId })
      if (!cost) {
        return res.status(404).json({
          code: 404,
          message: '成本记录不存在',
          data: null
        })
      }

      // 检查用户权限
      const project = await databaseService.findOne('projects', { _id: cost.projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '关联的项目不存在',
          data: null
        })
      }

      // 财务人员或项目经理可以删除成本记录
      const hasDeletePermission = PermissionValidator.checkUserPermission(user, [
        'project:cost:delete',
        'project:cost:manage',
        'finance:manage',
        '*'
      ]) || PermissionValidator.checkProjectPermission(user, 'manage', project)

      if (!hasDeletePermission) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限删除此成本记录',
          data: null
        })
      }

      // 删除成本记录
      await databaseService.deleteProjectCost(costId)

      res.json({
        code: 200,
        message: '成本记录删除成功',
        data: null
      })

    } catch (error) {
      logger.error('Delete project cost error:', error)
      next(error)
    }
  }

  /**
   * 获取项目成本汇总
   */
  async getProjectCostSummary(req, res, next) {
    try {
      const user = req.user
      const { projectId } = req.params

      // 检查项目是否存在
      const project = await databaseService.findOne('projects', { _id: projectId })
      if (!project) {
        return res.status(404).json({
          code: 404,
          message: '项目不存在',
          data: null
        })
      }

      // 检查用户权限
      if (!PermissionValidator.checkProjectPermission(user, 'view', project)) {
        return res.status(403).json({
          code: 403,
          message: '您没有权限查看此项目的成本汇总',
          data: null
        })
      }

      // 获取成本汇总
      const summary = await databaseService.getProjectCostSummary(projectId)

      res.json({
        code: 200,
        message: '获取成功',
        data: summary
      })

    } catch (error) {
      logger.error('Get project cost summary error:', error)
      next(error)
    }
  }

  /**
   * 获取所有项目的成本汇总
   */
  async getAllProjectCostSummaries(req, res, next) {
    try {
      // 获取所有项目的成本汇总
      const summaries = await databaseService.getAllProjectCostSummaries()

      res.json({
        code: 200,
        message: '获取成功',
        data: summaries
      })

    } catch (error) {
      logger.error('Get all project cost summaries error:', error)
      next(error)
    }
  }
}

module.exports = new ProjectCostController()
