const projectPerformanceService = require('../services/projectPerformanceService')
const logger = require('../utils/logger')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

class ProjectPerformanceController {
  /**
   * 下载Excel模板
   */
  async downloadTemplate(req, res, next) {
    try {
      const { poolId } = req.params
      const { period } = req.query  // 从查询参数获取期间

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const buffer = await projectPerformanceService.generateExcelTemplate(poolId, period)

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=project_performance_${poolId}_${period || 'default'}_${Date.now()}.xlsx`)
      res.send(buffer)

    } catch (error) {
      logger.error('下载模板失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '下载模板失败'
      })
    }
  }

  /**
   * 上传Excel数据
   */
  async uploadExcel(req, res, next) {
    try {
      const { poolId } = req.params
      const userId = req.user.id

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传Excel文件'
        })
      }

      const result = await projectPerformanceService.importExcelData(
        poolId, 
        req.file.buffer, 
        userId
      )

      res.json({
        success: true,
        message: `成功导入${result.count}条数据`,
        data: result
      })

    } catch (error) {
      logger.error('上传Excel失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '上传Excel失败'
      })
    }
  }

  /**
   * 获取绩效数据列表
   */
  async getPerformanceData(req, res, next) {
    try {
      const { poolId } = req.params

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const records = await projectPerformanceService.getPerformanceData(poolId)

      res.json({
        success: true,
        data: records
      })

    } catch (error) {
      logger.error('获取绩效数据失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '获取绩效数据失败'
      })
    }
  }

  /**
   * 创建/更新单条绩效记录
   */
  async createPerformanceRecord(req, res, next) {
    try {
      const { poolId, employeeId, profitContribution, positionValue, performanceScore } = req.body
      const userId = req.user.id

      if (!poolId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID和员工ID不能为空'
        })
      }

      const record = await projectPerformanceService.createPerformanceRecord({
        poolId,
        employeeId,
        profitContribution,
        positionValue,
        performanceScore,
        userId
      })

      res.json({
        success: true,
        message: '绩效记录保存成功',
        data: record
      })

    } catch (error) {
      logger.error('创建绩效记录失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '创建绩效记录失败'
      })
    }
  }

  /**
   * 基于手动数据计算奖金
   */
  async calculateBonus(req, res, next) {
    try {
      const { poolId } = req.params

      if (!poolId) {
        return res.status(400).json({
          success: false,
          message: '奖金池ID不能为空'
        })
      }

      const result = await projectPerformanceService.calculateBonusFromManualData(poolId)

      res.json({
        success: true,
        message: '奖金计算完成',
        data: result
      })

    } catch (error) {
      logger.error('计算奖金失败:', error)
      res.status(500).json({
        success: false,
        message: error.message || '计算奖金失败'
      })
    }
  }
}

module.exports = new ProjectPerformanceController()
