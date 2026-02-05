const businessLineService = require('../services/businessLineService')
const logger = require('../utils/logger')

class BusinessLineController {
  // 获取业务线列表
  async getBusinessLines(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        status
      } = req.query

      // 获取所有业务线
      let businessLines = await businessLineService.getBusinessLines()

      // 搜索过滤
      if (search) {
        businessLines = businessLines.filter(line =>
          line.name.toLowerCase().includes(search.toLowerCase()) ||
          line.code.toLowerCase().includes(search.toLowerCase()) ||
          (line.description && line.description.toLowerCase().includes(search.toLowerCase()))
        )
      }
      // 状态过滤
      if (status !== undefined && status !== null && status !== '' && status !== 'undefined') {
        const statusValue = parseInt(status)
        if (!isNaN(statusValue)) {
          businessLines = businessLines.filter(line => line.status === statusValue)
        }
      }

      // 分页处理
      const total = businessLines.length
      const offset = (page - 1) * pageSize
      const paginatedBusinessLines = businessLines.slice(offset, offset + parseInt(pageSize))

      // 获取每个业务线的部门和员工数量
      const businessLinesWithStats = await Promise.all(
        paginatedBusinessLines.map(async (businessLine) => {
          // 使用服务层获取统计信息
          const stats = await businessLineService.getBusinessLineStats(businessLine._id)
          const { departmentCount, employeeCount } = stats

          // 获取管理者信息
          let Manager = null
          if (businessLine.managerId) {
            const manager = await businessLineService.getEmployeeById(businessLine.managerId)
            if (manager) {
              Manager = {
                id: manager._id,
                name: manager.name,
                employeeNo: manager.employeeNo
              }
            }
          }

          // 移除_id，只使用id
          const { _id, ...lineData } = businessLine
          return {
            ...lineData,
            id: _id,
            departmentCount,
            employeeCount,
            Manager
          }
        })
      )

      res.json({
        code: 200,
        data: {
          list: businessLinesWithStats,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get business lines error:', error)
      next(error)
    }
  }

  // 获取业务线详情
  async getBusinessLine(req, res, next) {
    try {
      const { id } = req.params

      const businessLine = await businessLineService.getBusinessLineById(id)

      if (!businessLine) {
        return res.status(404).json({
          code: 404,
          message: '业务线不存在',
          data: null
        })
      }

      // 使用服务层获取统计信息
      const stats = await businessLineService.getBusinessLineStats(businessLine._id)
      const { departmentCount, employeeCount } = stats

      // 获取管理者信息
      let Manager = null
      if (businessLine.managerId) {
        const manager = await businessLineService.getEmployeeById(businessLine.managerId)
        if (manager) {
          Manager = {
            id: manager._id,
            name: manager.name,
            employeeNo: manager.employeeNo
          }
        }
      }

      // 移除_id，只使用id
      const { _id, ...lineData } = businessLine

      res.json({
        code: 200,
        data: {
          ...lineData,
          id: _id,
          departmentCount,
          employeeCount,
          Manager
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get business line error:', error)
      next(error)
    }
  }

  // 创建业务线
  async createBusinessLine(req, res, next) {
    try {
      const businessLineData = req.body

      // 检查代码是否已存在
      const allBusinessLines = await businessLineService.getBusinessLines()
      const existingBusinessLine = allBusinessLines.find(line => line.code === businessLineData.code)

      if (existingBusinessLine) {
        return res.status(400).json({
          code: 400,
          message: '业务线代码已存在',
          data: null
        })
      }

      const newBusinessLine = await businessLineService.createBusinessLine(businessLineData)

      // 移除_id，只使用id
      const { _id, ...newLineData } = newBusinessLine

      res.status(201).json({
        code: 201,
        data: {
          ...newLineData,
          id: _id
        },
        message: '创建成功'
      })

    } catch (error) {
      logger.error('Create business line error:', error)
      next(error)
    }
  }

  // 更新业务线
  async updateBusinessLine(req, res, next) {
    try {
      const { id } = req.params
      const updateData = req.body

      // 检查业务线是否存在
      const existingBusinessLine = await businessLineService.getBusinessLineById(id)
      if (!existingBusinessLine) {
        return res.status(404).json({
          code: 404,
          message: '业务线不存在',
          data: null
        })
      }

      // 如果更新代码，检查是否与其他业务线冲突
      if (updateData.code && updateData.code !== existingBusinessLine.code) {
        const allBusinessLines = await businessLineService.getBusinessLines()
        const codeExists = allBusinessLines.find(line => line.code === updateData.code && line.id !== id)

        if (codeExists) {
          return res.status(400).json({
            code: 400,
            message: '业务线代码已存在',
            data: null
          })
        }
      }

      const result = await businessLineService.updateBusinessLine(id, updateData)

      if (result > 0) {
        const updatedBusinessLine = await businessLineService.getBusinessLineById(id)
        // 移除_id，只使用id
        const { _id, ...lineData } = updatedBusinessLine

        res.json({
          code: 200,
          data: {
            ...lineData,
            id: _id
          },
          message: '更新成功'
        })
      } else {
        res.status(400).json({
          code: 400,
          message: '更新失败',
          data: null
        })
      }

    } catch (error) {
      logger.error('Update business line error:', error)
      next(error)
    }
  }

  // 删除业务线
  async deleteBusinessLine(req, res, next) {
    try {
      const { id } = req.params

      // 检查业务线是否存在
      const existingBusinessLine = await businessLineService.getBusinessLineById(id)
      if (!existingBusinessLine) {
        return res.status(404).json({
          code: 404,
          message: '业务线不存在',
          data: null
        })
      }

      // 使用服务层检查关联数据
      const hasDepartments = await businessLineService.hasDepartments(id)
      if (hasDepartments) {
        return res.status(400).json({
          code: 400,
          message: '该业务线下还有部门，无法删除',
          data: null
        })
      }

      const hasEmployees = await businessLineService.hasEmployees(id)
      if (hasEmployees) {
        return res.status(400).json({
          code: 400,
          message: '该业务线下有员工，无法删除',
          data: null
        })
      }

      const result = await businessLineService.deleteBusinessLine(id)

      if (result > 0) {
        res.json({
          code: 200,
          message: '删除成功',
          data: null
        })
      } else {
        res.status(400).json({
          code: 400,
          message: '删除失败',
          data: null
        })
      }

    } catch (error) {
      logger.error('Delete business line error:', error)
      next(error)
    }
  }

  // 获取业务线统计信息
  async getBusinessLineStats(req, res, next) {
    try {
      const businessLines = await businessLineService.getBusinessLines()

      const stats = await Promise.all(
        businessLines.map(async (businessLine) => {
          const statInfo = await businessLineService.getBusinessLineStats(businessLine._id)
          
          return {
            id: businessLine._id,
            name: businessLine.name,
            code: businessLine.code,
            departmentCount: statInfo.departmentCount,
            employeeCount: statInfo.employeeCount
          }
        })
      )

      res.json({
        code: 200,
        data: stats,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get business line stats error:', error)
      next(error)
    }
  }

  // 获取业务线绩效统计
  async getPerformanceStats(req, res, next) {
    try {
      const { id } = req.params
      const { year = new Date().getFullYear() } = req.query

      const businessLine = await businessLineService.getBusinessLineById(id)
      if (!businessLine) {
        return res.status(404).json({
          code: 404,
          message: '业务线不存在',
          data: null
        })
      }

      // 使用服务层获取统计信息
      const businessLineStats = await businessLineService.getBusinessLineStats(id)
      const { departmentCount, employeeCount } = businessLineStats

      const stats = {
        businessLine: {
          id: businessLine._id,
          name: businessLine.name,
          code: businessLine.code,
          weight: businessLine.weight || 0
        },
        summary: {
          departmentCount,
          employeeCount,
          year: parseInt(year)
        },
        kpiMetrics: businessLine.kpiMetrics || []
      }

      res.json({
        code: 200,
        data: stats,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get performance stats error:', error)
      next(error)
    }
  }

  // 批量操作业务线
  async batchBusinessLines(req, res, next) {
    try {
      const { action, businessLineIds } = req.body

      if (!businessLineIds || !Array.isArray(businessLineIds) || businessLineIds.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要操作的业务线',
          data: null
        })
      }

      let updateData = { updatedAt: new Date() }
      let actionText = ''

      switch (action) {
        case 'enable':
          updateData.status = 1
          actionText = '启用'
          break
        case 'disable':
          updateData.status = 0
          actionText = '禁用'
          break
        default:
          return res.status(400).json({
            code: 400,
            message: '无效的操作类型',
            data: null
          })
      }

      // 批量更新业务线状态
      let updatedCount = 0
      for (const businessLineId of businessLineIds) {
        try {
          const result = await businessLineService.updateBusinessLine(businessLineId, updateData)
          if (result > 0) {
            updatedCount++
          }
        } catch (error) {
          logger.error(`批量操作业务线 ${businessLineId} 失败:`, error.message)
        }
      }

      res.json({
        code: 200,
        data: { updatedCount },
        message: `批量${actionText}成功，共处理${updatedCount}个业务线`
      })

    } catch (error) {
      logger.error('Batch business lines error:', error)
      next(error)
    }
  }

  // 批量更新业务线权重
  async updateBusinessLineWeights(req, res, next) {
    try {
      const { businessLines } = req.body

      if (!businessLines || !Array.isArray(businessLines)) {
        return res.status(400).json({
          code: 400,
          message: '请求数据格式不正确',
          data: null
        })
      }

      // 验证总权重是否接近 1
      const totalWeight = businessLines.reduce((sum, item) => sum + item.weight, 0)
      if (Math.abs(totalWeight - 1) > 0.001) {
        return res.status(400).json({
          code: 400,
          message: '权重总和必须等于 100%',
          data: null
        })
      }

      // 批量更新
      let updatedCount = 0
      for (const item of businessLines) {
        const { id, weight } = item
        // 获取业务线确认其存在
        const existing = await businessLineService.getBusinessLineById(id)
        if (existing) {
          const result = await businessLineService.updateBusinessLine(id, { weight })
          if (result > 0) {
            updatedCount++
          }
        }
      }

      res.json({
        code: 200,
        data: { updatedCount },
        message: '业务线权重更新成功'
      })

    } catch (error) {
      logger.error('Update business line weights error:', error)
      next(error)
    }
  }
}

module.exports = new BusinessLineController()
