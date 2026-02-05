const logger = require('../utils/logger')
const performanceRecordService = require('../services/performanceRecordService')

class PerformanceRecordController {

  /**
   * 获取绩效记录列表
   * GET /api/performance-records
   */
  async getPerformanceRecords(req, res, next) {
    try {
      const filters = {
        employeeId: req.query.employeeId,
        employeeName: req.query.employeeName,
        period: req.query.period,
        rating: req.query.rating,
        evaluatorId: req.query.evaluatorId
      }

      const pagination = {
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 20
      }

      const result = await performanceRecordService.getPerformanceRecords(filters, pagination)

      res.json({
        code: 200,
        message: '获取成功',
        data: result
      })
    } catch (error) {
      logger.error('获取绩效记录列表失败:', error)
      next(error)
    }
  }

  /**
   * 创建绩效记录
   * POST /api/performance-records
   */
  async createPerformanceRecord(req, res, next) {
    try {
      const record = await performanceRecordService.createThreeDimensionalRecord(
        req.body,
        req.user.id
      )

      logger.info(`用户${req.user.username}创建三维绩效记录: 员工${record.employee_name}, 期间${req.body.period}`)

      res.status(201).json({
        code: 200,
        message: '创建成功',
        data: record
      })
    } catch (error) {
      logger.error('创建绩效记录失败:', error)
      if (error.message) {
        return res.status(400).json({
          code: 400,
          message: error.message
        })
      }
      next(error)
    }
  }

  /**
   * 更新绩效记录
   * PUT /api/performance-records/:id
   */
  async updatePerformanceRecord(req, res, next) {
    try {
      const record = await performanceRecordService.updateThreeDimensionalRecord(
        req.params.id,
        req.body,
        req.user.id
      )

      logger.info(`用户${req.user.username}更新三维绩效记录: ID=${req.params.id}`)

      res.json({
        code: 200,
        message: '更新成功',
        data: record
      })
    } catch (error) {
      logger.error('更新绩效记录失败:', error)
      if (error.message) {
        return res.status(400).json({
          code: 400,
          message: error.message
        })
      }
      next(error)
    }
  }

  /**
   * 删除绩效记录
   * DELETE /api/performance-records/:id
   */
  async deletePerformanceRecord(req, res, next) {
    try {
      await performanceRecordService.deletePerformanceRecord(req.params.id)

      logger.info(`用户${req.user.username}删除三维绩效记录: ID=${req.params.id}`)

      res.json({
        code: 200,
        message: '删除成功'
      })
    } catch (error) {
      logger.error('删除绩效记录失败:', error)
      if (error.message) {
        return res.status(400).json({
          code: 400,
          message: error.message
        })
      }
      next(error)
    }
  }

  /**
   * 批量导入绩效记录（三维评分模式）
   * POST /api/performance-records/batch-import
   */
  async batchImportRecords(req, res, next) {
    try {
      const { records } = req.body

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '导入数据不能为空'
        })
      }

      const results = await performanceRecordService.batchImportRecords(records, req.user.id)

      logger.info(`用户${req.user.username}批量导入三维评分: 成功${results.success}, 失败${results.failed}`)

      res.json({
        code: 200,
        message: '导入完成',
        data: results
      })
    } catch (error) {
      logger.error('批量导入三维评分失败:', error)
      next(error)
    }
  }

  /**
   * 获取绩效评级选项
   * GET /api/performance-records/rating-options
   */
  async getRatingOptions(req, res, next) {
    try {
      const options = performanceRecordService.getRatingOptions()

      res.json({
        code: 200,
        message: '获取成功',
        data: options
      })
    } catch (error) {
      logger.error('获取绩效评级选项失败:', error)
      next(error)
    }
  }

  /**
   * 下载绩效记录Excel模板
   * GET /api/performance-records/template
   */
  async downloadTemplate(req, res, next) {
    try {
      const { period } = req.query
      const buffer = await performanceRecordService.generateExcelTemplate(period)

      // 将期间中的中文字符转换为英文，防止HTTP响应头非法字符错误
      const safePeriod = (period || 'default')
        .replace(/年度/g, '_YEARLY')
        .replace(/年/g, 'Y')
        .replace(/月/g, 'M')
        .replace(/[^\w.-]/g, '_')  // 将其他非单词字符替换为下划线

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=performance_records_template_${safePeriod}_${Date.now()}.xlsx`)
      res.send(buffer)

      logger.info(`生成绩效记录模板成功: 期间=${period}`)
    } catch (error) {
      logger.error('下载绩效记录模板失败:', error)
      next(error)
    }
  }
}

module.exports = new PerformanceRecordController()
