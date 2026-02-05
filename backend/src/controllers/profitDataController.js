const ProfitData = require('../models/ProfitData')
const { BusinessLine, Project, sequelize } = require('../models')
const { Op } = require('sequelize')
const logger = require('../utils/logger')
const databaseService = require('../services/databaseService')

class ProfitDataController {
  // 获取利润数据列表
  async getProfitData(req, res, next) {
    try {
      const { 
        page = 1, 
        pageSize = 20, 
        period,
        businessLineId,
        projectId,
        dataSource,
        startPeriod,
        endPeriod
      } = req.query

      const where = {}
      
      // 期间筛选
      if (period) {
        where.period = period
      } else if (startPeriod && endPeriod) {
        where.period = {
          [Op.between]: [startPeriod, endPeriod]
        }
      } else if (startPeriod) {
        where.period = {
          [Op.gte]: startPeriod
        }
      } else if (endPeriod) {
        where.period = {
          [Op.lte]: endPeriod
        }
      }

      // 业务线筛选
      if (businessLineId) {
        where.businessLineId = businessLineId
      }

      // 项目筛选
      if (projectId) {
        where.projectId = projectId
      }

      // 数据来源筛选
      if (dataSource) {
        where.dataSource = dataSource
      }

      const offset = (page - 1) * pageSize

      const { count, rows } = await ProfitData.findAndCountAll({
        where,
        offset,
        limit: parseInt(pageSize),
        order: [['period', 'DESC'], ['createdAt', 'DESC']]
      })

      // 手动关联业务线数据
      const businessLineIds = [...new Set(rows.map(r => r.businessLineId).filter(Boolean))]
      const businessLinesMap = new Map()
      
      if (businessLineIds.length > 0) {
        // BusinessLine.findAll 直接返回数组（通过 ModelAdapter）
        const businessLinesData = await BusinessLine.findAll({
          where: {
            id: { [Op.in]: businessLineIds }
          }
        })
        
        if (Array.isArray(businessLinesData)) {
          businessLinesData.forEach(bl => {
            businessLinesMap.set(bl.id, bl)
          })
        }
      }

      // 为每条记录添加业务线信息，并移除 _id 冗余字段
      const enrichedRows = rows.map(row => {
        // 移除 _id 冗余字段
        const { _id, ...cleanRow } = row
        
        return {
          ...cleanRow,
          BusinessLine: cleanRow.businessLineId ? businessLinesMap.get(cleanRow.businessLineId) : null
        }
      })

      res.json({
        code: 200,
        data: {
          list: enrichedRows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get profit data error:', error)
      next(error)
    }
  }

  // 获取利润数据详情
  async getProfitDataDetail(req, res, next) {
    try {
      const { id } = req.params

      const profitData = await ProfitData.findByPk(id, {
        include: [
          {
            model: BusinessLine,
            attributes: ['id', 'name', 'code', 'weight']
          },
          {
            model: Project,
            attributes: ['id', 'name', 'code', 'status']
          }
        ]
      })

      if (!profitData) {
        return res.status(404).json({
          code: 404,
          message: '利润数据不存在',
          data: null
        })
      }

      res.json({
        code: 200,
        data: profitData,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get profit data detail error:', error)
      next(error)
    }
  }

  // 创建利润数据
  async createProfitData(req, res, next) {
    try {
      const { 
        period, 
        businessLineId, 
        projectId,
        revenue,
        cost,
        dataSource = 'manual',
        remarks
      } = req.body

      // 检查重复记录
      const existingData = await ProfitData.findOne({
        where: {
          period,
          businessLineId: businessLineId || null,
          projectId: projectId || null
        }
      })

      if (existingData) {
        return res.status(400).json({
          code: 400,
          message: '该期间的利润数据已存在',
          data: null
        })
      }

      // 验证业务线是否存在
      if (businessLineId) {
        const businessLine = await BusinessLine.findByPk(businessLineId)
        if (!businessLine) {
          return res.status(400).json({
            code: 400,
            message: '指定业务线不存在',
            data: null
          })
        }
      }

      // 验证项目是否存在
      if (projectId) {
        const project = await Project.findByPk(projectId)
        if (!project) {
          return res.status(400).json({
            code: 400,
            message: '指定项目不存在',
            data: null
          })
        }
      }

      // 计算利润和利润率
      const profit = revenue - cost
      const profitMargin = revenue > 0 ? profit / revenue : 0

      const profitData = await ProfitData.create({
        period,
        businessLineId,
        projectId,
        total_revenue: revenue,
        total_cost: cost,
        profit,
        profitMargin,
        dataSource,
        remarks,
        createdBy: req.user.id
      })

      logger.info(`管理员${req.user.username}创建利润数据: ${period}`)

      res.status(201).json({
        code: 201,
        data: profitData,
        message: '利润数据创建成功'
      })

    } catch (error) {
      logger.error('Create profit data error:', error)
      next(error)
    }
  }

  // 更新利润数据
  async updateProfitData(req, res, next) {
    try {
      const { id } = req.params
      const { 
        revenue,
        cost,
        dataSource,
        remarks
      } = req.body

      // 使用 databaseService 查询数据
      const profitData = await databaseService.findOne('profit_data', { id })
      if (!profitData) {
        return res.status(404).json({
          code: 404,
          message: '利润数据不存在',
          data: null
        })
      }

      // 计算利润和利润率
      const totalRevenue = revenue !== undefined ? revenue : profitData.total_revenue
      const totalCost = cost !== undefined ? cost : profitData.total_cost
      const profit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? profit / totalRevenue : 0

      // 使用 databaseService 更新数据
      await databaseService.update('profit_data', { id }, {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        profit,
        profitMargin,
        data_source: dataSource || profitData.data_source,
        remarks: remarks !== undefined ? remarks : profitData.remarks,
        updated_by: req.user.id,
        updated_at: new Date()
      })

      logger.info(`管理员${req.user.username}更新利润数据: ${profitData.period}`)

      res.json({
        code: 200,
        data: profitData,
        message: '利润数据更新成功'
      })

    } catch (error) {
      logger.error('Update profit data error:', error)
      next(error)
    }
  }

  // 删除利润数据
  async deleteProfitData(req, res, next) {
    try {
      const { id } = req.params

      // 使用 databaseService 查询数据
      const profitData = await databaseService.findOne('profit_data', { id })
      if (!profitData) {
        return res.status(404).json({
          code: 404,
          message: '利润数据不存在',
          data: null
        })
      }

      // 使用 databaseService 删除数据
      await databaseService.destroy('profit_data', id)

      logger.info(`管理员${req.user.username}删除利润数据: ${profitData.period}`)

      res.json({
        code: 200,
        data: null,
        message: '利润数据删除成功'
      })

    } catch (error) {
      logger.error('Delete profit data error:', error)
      next(error)
    }
  }

  // 批量导入利润数据
  async batchImportProfitData(req, res, next) {
    try {
      const { profitDataList } = req.body

      if (!Array.isArray(profitDataList) || profitDataList.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请提供有效的利润数据列表',
          data: null
        })
      }

      const results = []
      const errors = []

      for (let i = 0; i < profitDataList.length; i++) {
        try {
          const item = profitDataList[i]
          
          // 检查重复记录 - 使用 databaseService
          const existingData = await databaseService.findOne('profit_data', {
            period: item.period,
            business_line_id: item.businessLineId || null,
            project_id: item.projectId || null
          })

          if (existingData) {
            // 更新现有记录
            const profit = item.revenue - item.cost
            const profitMargin = item.revenue > 0 ? profit / item.revenue : 0
            
            await databaseService.update('profit_data', { id: existingData.id }, {
              total_revenue: item.revenue,
              total_cost: item.cost,
              profit,
              profit_margin: profitMargin,
              data_source: 'import',
              remarks: item.remarks,
              updated_by: req.user.id,
              updated_at: new Date()
            })
            results.push({ index: i, id: existingData.id, action: 'updated' })
          } else {
            // 创建新记录
            const profit = item.revenue - item.cost
            const profitMargin = item.revenue > 0 ? profit / item.revenue : 0
            
            const newData = await ProfitData.create({
              period: item.period,
              businessLineId: item.businessLineId,
              projectId: item.projectId,
              total_revenue: item.revenue,
              total_cost: item.cost,
              profit,
              profitMargin,
              dataSource: 'import',
              remarks: item.remarks,
              createdBy: req.user.id
            })
            results.push({ index: i, id: newData.id, action: 'created' })
          }
        } catch (error) {
          errors.push({ index: i, error: error.message })
        }
      }

      logger.info(`管理员${req.user.username}批量导入利润数据: 成功${results.length}条，失败${errors.length}条`)

      res.json({
        code: 200,
        data: {
          successCount: results.length,
          errorCount: errors.length,
          results,
          errors
        },
        message: `批量导入完成：成功${results.length}条，失败${errors.length}条`
      })

    } catch (error) {
      logger.error('Batch import profit data error:', error)
      next(error)
    }
  }

  // 获取利润数据统计
  async getProfitDataStatistics(req, res, next) {
    try {
      const { period, businessLineId } = req.query

      const where = {}
      
      if (period) {
        where.period = period
      }
      
      if (businessLineId) {
        where.businessLineId = businessLineId
      }

      // 获取基础统计
      const totalData = await ProfitData.findAll({
        where,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('revenue')), 'totalRevenue'],
          [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost'],
          [sequelize.fn('SUM', sequelize.col('profit')), 'totalProfit'],
          [sequelize.fn('AVG', sequelize.col('profitMargin')), 'avgProfitMargin'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount']
        ],
        raw: true
      })

      // 按业务线统计
      const lineStats = await ProfitData.findAll({
        where,
        include: [
          {
            model: BusinessLine,
            attributes: ['id', 'name', 'code']
          }
        ],
        attributes: [
          'businessLineId',
          [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('cost')), 'cost'],
          [sequelize.fn('SUM', sequelize.col('profit')), 'profit'],
          [sequelize.fn('AVG', sequelize.col('profitMargin')), 'profitMargin'],
          [sequelize.fn('COUNT', sequelize.col('ProfitData.id')), 'recordCount']
        ],
        group: ['businessLineId', 'BusinessLine.id'],
        raw: true
      })

      // 按期间统计
      const periodStats = await ProfitData.findAll({
        where,
        attributes: [
          'period',
          [sequelize.fn('SUM', sequelize.col('revenue')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('cost')), 'cost'],
          [sequelize.fn('SUM', sequelize.col('profit')), 'profit'],
          [sequelize.fn('AVG', sequelize.col('profitMargin')), 'profitMargin']
        ],
        group: ['period'],
        order: [['period', 'ASC']],
        raw: true
      })

      res.json({
        code: 200,
        data: {
          summary: totalData[0],
          lineStats,
          periodStats
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get profit data statistics error:', error)
      next(error)
    }
  }

  // 获取期间选项
  async getPeriodOptions(req, res, next) {
    try {
      const periods = await ProfitData.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('period')), 'period']
        ],
        order: [['period', 'DESC']],
        raw: true
      })

      res.json({
        code: 200,
        data: periods.map(p => p.period),
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get period options error:', error)
      next(error)
    }
  }
}

module.exports = new ProfitDataController()