const logger = require('../utils/logger')
const { PermissionValidator } = require('../config/permissions')
const databaseService = require('../services/databaseService')

// MySQL日期格式化工具函数
function toMySQLDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

class ReportsController {
  // 获取报表列表
  async getReports(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        category,
        status,
        search
      } = req.query

      console.log('📊 获取报表列表请求:', { page, pageSize, category, status, search })

      // 构建查询条件
      let query = { status: { $ne: 'deleted' } }

      if (category && category !== 'all') {
        query.category = category
      }

      if (status) {
        query.status = status
      }

      // 获取所有报表记录
      let reports = await databaseService.find('reports', query)
      console.log('📋 查询到报表记录:', reports.length, '条')

      // 搜索过滤
      if (search) {
        reports = reports.filter(report =>
          report.name.toLowerCase().includes(search.toLowerCase()) ||
          (report.description && report.description.toLowerCase().includes(search.toLowerCase()))
        )
      }

      // 排序
      reports.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB - dateA // 按创建时间倒序
      })

      // 分页处理
      const total = reports.length
      const offset = (page - 1) * pageSize
      const paginatedReports = reports.slice(offset, offset + parseInt(pageSize))

      // 数据格式化 - 优化创建人显示
      const formattedReports = paginatedReports.map(report => ({
        id: report._id || report.id,
        name: report.name,
        category: report.category,
        description: report.description,
        status: report.status,
        size: report.size,
        createdBy: report.createdByName || report.createdBy || '未知',
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        downloadUrl: report.downloadUrl
      }))

      res.json({
        code: 200,
        data: formattedReports,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get reports error:', error)
      next(error)
    }
  }

  // 创建报表
  async createReport(req, res, next) {
    try {
      const {
        name,
        category,
        description,
        dateRange,
        fields,
        filters,
        format = 'excel'
      } = req.body

      if (!name || !category) {
        return res.status(400).json({
          code: 400,
          message: '报表名称和分类不能为空',
          data: null
        })
      }

      console.log('📊 创建报表请求:', { name, category, dateRange })

      // 创建报表记录
      const reportData = {
        name,
        category,
        description,
        dateRange,
        fields: fields || [],
        filters: filters || {},
        format,
        status: 'generating',
        createdBy: req.user.id,
        createdByName: req.user.username || req.user.realName
      }

      const report = await databaseService.insert('reports', reportData)

      // 异步生成报表内容 - 保存this到闭包
      const self = this
      setImmediate(async () => {
        try {
          await self.generateReportContent(report._id, reportData)
        } catch (error) {
          logger.error(`报表生成失败 ${report._id}:`, error)
        }
      })

      logger.info(`报表创建成功: ${name}`)

      res.json({
        code: 200,
        data: {
          ...report,
          id: report._id
        },
        message: '报表创建成功，正在生成中'
      })

    } catch (error) {
      logger.error('Create report error:', error)
      next(error)
    }
  }

  // 生成报表内容
  async generateReportContent(reportId, reportData) {
    try {
      console.log(`📊 开始生成报表内容: ${reportId}`, { category: reportData.category, type: reportData.type })

      let reportContent = []
      let size = 0

      // 根据报表类型生成内容 - 优先使用type字段区分
      if (reportData.type === 'analysis' || (reportData.category === 'statistics' && reportData.name.includes('绩效'))) {
        // 绩效分析报告
        reportContent = await this.generatePerformanceAnalysisReport(reportData)
      } else if (reportData.type === 'statistics' || (reportData.category === 'statistics' && reportData.name.includes('分布'))) {
        // 奖金分布统计
        reportContent = await this.generateBonusDistributionReport(reportData)
      } else {
        // 原有逻辑
        switch (reportData.category) {
          case 'bonus':
            reportContent = await this.generateBonusReport(reportData)
            break
          case 'statistics':
            reportContent = await this.generateStatisticsReport(reportData)
            break
          case 'custom':
            reportContent = await this.generateCustomReport(reportData)
            break
          default:
            throw new Error('不支持的报表类型')
        }
      }

      // 计算文件大小（模拟）
      size = JSON.stringify(reportContent).length * 2

      // 更新报表状态
      await databaseService.update('reports',
        reportId,
        {
          status: 'completed',
          size: size,
          content: reportContent,
          completedAt: toMySQLDateTime(new Date()),
          updatedAt: toMySQLDateTime(new Date())
        }
      )

      console.log(`✅ 报表生成完成: ${reportId}`)

    } catch (error) {
      console.error(`❌ 报表生成失败: ${reportId}`, error)

      // 更新为失败状态
      await databaseService.update('reports',
        reportId,
        {
          status: 'failed',
          error: error.message,
          updatedAt: toMySQLDateTime(new Date())
        }
      )
    }
  }

  // 生成奖金报表
  async generateBonusReport(reportData) {
    console.log('📊 生成奖金报表')

    try {
      // 优先查询三维计算结果(新系统)
      const threeDimensionalResults = await databaseService.find('threeDimensionalCalculationResults', {})
      console.log('📊 查询到三维计算结果:', threeDimensionalResults.length, '条')

      // 如果没有三维计算结果,再查询旧的bonusAllocationResults
      let bonusData = []
      if (threeDimensionalResults.length > 0) {
        bonusData = threeDimensionalResults
        console.log('👉 使用三维计算结果生成报表')
      } else {
        const bonusAllocations = await databaseService.find('bonusAllocationResults', {})
        console.log('📊 查询到奖金分配记录:', bonusAllocations.length, '条')
        bonusData = bonusAllocations
        console.log('👉 使用奖金分配结果生成报表')
      }

      if (bonusData.length === 0) {
        console.warn('⚠️ 警告: 无奖金数据,报表将没有内容')
        console.log('💡 提示: 请先在奖金计算页面执行奖金计算以生成数据')
        return []
      }

      // 获取员工信息
      const employees = await databaseService.find('employees', {})
      console.log('📊 查询到员工记录:', employees.length, '条')

      // 获取部门信息
      const departments = await databaseService.find('departments', { status: 1 })
      console.log('📊 查询到部门记录:', departments.length, '条')

      // 获取岗位信息
      const positions = await databaseService.find('positions', { status: 1 })
      console.log('📊 查询到岗位记录:', positions.length, '条')

      // 合并数据生成报表
      const reportContent = bonusData.map(record => {
        // 处理employeeId字段 - 可能是employeeId或employee_id
        const empId = record.employeeId || record.employee_id

        // 员工查找 - 同时匹配_id和id
        const employee = employees.find(emp => emp._id === empId || emp.id === empId)

        // 获取员工姓名 - 可能是name、realName或real_name
        const employeeName = employee?.name || employee?.realName || employee?.real_name || '未知'

        // 获取部门
        const department = employee ? departments.find(dept => dept._id === employee.departmentId || dept.id === employee.departmentId) : null

        // 获取岗位 - 通过positionId关联positions表
        const position = employee?.positionId ? positions.find(pos => pos._id === employee.positionId || pos.id === employee.positionId) : null
        const positionName = position?.name || employee?.position || '未知'

        // 处理不同数据源的字段
        const baseBonus = record.baseBonusAmount || record.baseAmount || 0
        const performanceBonus = record.excellenceBonusAmount || record.performanceAmount || 0
        const totalBonus = record.finalBonusAmount || record.totalAmount || 0
        const period = record.calculationPeriod || record.allocationPeriod || '未知'

        return {
          '员工ID': empId,
          '员工姓名': employeeName,
          '部门': department?.name || '未知',
          '岗位': positionName,
          '基础奖金': Number(baseBonus) || 0,
          '绩效奖金': Number(performanceBonus) || 0,
          '总奖金': Number(totalBonus) || 0,
          '期间': period,
          '计算日期': record.createdAt
        }
      })

      console.log('✅ 生成报表内容行数:', reportContent.length)

      return reportContent
    } catch (error) {
      console.error('❌ 生成奖金报表失败:', error)
      return []
    }
  }

  // 生成统计报表(基础统计)
  async generateStatisticsReport(reportData) {
    console.log('📊 生成统计报表')

    try {
      // 获取各种统计数据
      const employeeCount = await databaseService.count('employees', {})
      const departmentCount = await databaseService.count('departments', { status: 1 })
      const bonusPoolCount = await databaseService.count('bonusPools', {})

      // 优先查询三维计算结果
      const threeDimensionalResults = await databaseService.find('threeDimensionalCalculationResults', {})
      let bonusData = []
      if (threeDimensionalResults.length > 0) {
        bonusData = threeDimensionalResults
      } else {
        bonusData = await databaseService.find('bonusAllocationResults', {})
      }

      console.log('📊 统计数据:', { employeeCount, departmentCount, bonusPoolCount, bonusDataCount: bonusData.length })

      // 计算统计指标
      const totalBonusAmount = bonusData.reduce((sum, record) => {
        const amount = record.finalBonusAmount || record.totalAmount || 0
        return sum + Number(amount)
      }, 0)
      const avgBonusAmount = bonusData.length > 0 ? totalBonusAmount / bonusData.length : 0

      const reportContent = [{
        '指标名称': '员工总数',
        '数值': employeeCount,
        '单位': '人'
      }, {
        '指标名称': '部门总数',
        '数值': departmentCount,
        '单位': '个'
      }, {
        '指标名称': '奖金池总数',
        '数值': bonusPoolCount,
        '单位': '个'
      }, {
        '指标名称': '总奖金金额',
        '数值': Math.round(totalBonusAmount),
        '单位': '元'
      }, {
        '指标名称': '人均奖金',
        '数值': Math.round(avgBonusAmount),
        '单位': '元'
      }]

      console.log('✅ 生成统计报表行数:', reportContent.length)
      return reportContent
    } catch (error) {
      console.error('❌ 生成统计报表失败:', error)
      return []
    }
  }

  // 生成绩效分析报告
  async generatePerformanceAnalysisReport(reportData) {
    console.log('📊 生成绩效分析报告')

    try {
      // 获取三维计算结果
      const threeDimensionalResults = await databaseService.find('threeDimensionalCalculationResults', {})
      console.log('📊 [绩效分析] 查询到三维计算结果:', threeDimensionalResults.length, '条')

      if (threeDimensionalResults.length === 0) {
        console.warn('⚠️ [绩效分析] 无三维计算数据,请先在奖金计算页面执行三维计算')
        return []
      }

      console.log('🔍 [绩效分析] 第一条数据示例:', JSON.stringify(threeDimensionalResults[0], null, 2))

      // 获取员工信息
      const employees = await databaseService.find('employees', {})
      console.log('📊 [绩效分析] 查询员工记录:', employees.length, '条')

      const departments = await databaseService.find('departments', { status: 1 })
      console.log('📊 [绩效分析] 查询部门记录:', departments.length, '条')

      // 生成绩效分析数据
      const reportContent = threeDimensionalResults.map(record => {
        const empId = record.employeeId || record.employee_id
        const employee = employees.find(emp => emp._id === empId || emp.id === empId)
        const department = employee ? departments.find(dept => dept._id === employee.departmentId || dept.id === employee.departmentId) : null

        return {
          '员工姓名': employee?.name || employee?.realName || employee?.real_name || '未知',
          '部门': department?.name || '未知',
          '岗位': employee?.position || '未知',
          '利润贡献度得分': Math.round((record.profitContributionScore || 0) * 100) / 100,
          '岗位价值得分': Math.round((record.positionValueScore || 0) * 100) / 100,
          '绩效表现得分': Math.round((record.performanceScore || 0) * 100) / 100,
          '综合得分': Math.round((record.totalScore || 0) * 100) / 100,
          '最终奖金': Math.round(record.finalBonusAmount || 0),
          '计算日期': record.createdAt || record.created_at
        }
      })

      console.log('✅ [绩效分析] 生成报告行数:', reportContent.length)
      console.log('🔍 [绩效分析] 第一行数据示例:', JSON.stringify(reportContent[0], null, 2))
      return reportContent
    } catch (error) {
      console.error('❌ [绩效分析] 生成报告失败:', error)
      return []
    }
  }

  // 生成奖金分布统计报告
  async generateBonusDistributionReport(reportData) {
    console.log('📊 生成奖金分布统计报告')

    try {
      // 获取奖金数据
      const threeDimensionalResults = await databaseService.find('threeDimensionalCalculationResults', {})
      console.log('📊 [奖金分布] 查询到三维计算结果:', threeDimensionalResults.length, '条')

      let bonusData = []
      if (threeDimensionalResults.length > 0) {
        bonusData = threeDimensionalResults
        console.log('👉 [奖金分布] 使用三维计算结果')
      } else {
        bonusData = await databaseService.find('bonusAllocationResults', {})
        console.log('📊 [奖金分布] 查询到旧奖金分配记录:', bonusData.length, '条')
        console.log('👉 [奖金分布] 使用旧奖金分配结果')
      }

      if (bonusData.length === 0) {
        console.warn('⚠️ [奖金分布] 无奖金数据,请先在奖金计算页面执行奖金计算')
        return []
      }

      console.log('🔍 [奖金分布] 第一条数据示例:', JSON.stringify(bonusData[0], null, 2))

      // 提取奖金金额
      const bonusAmounts = bonusData.map(record => {
        const amount = record.finalBonusAmount || record.totalAmount || 0
        return Number(amount)
      }).filter(amount => amount > 0)

      console.log('📊 [奖金分布] 有效奖金数据条数:', bonusAmounts.length)
      if (bonusAmounts.length > 0) {
        console.log('🔍 [奖金分布] 奖金金额示例:', bonusAmounts.slice(0, 5))
      }

      bonusAmounts.sort((a, b) => a - b)

      // 定义分布区间
      const ranges = [
        { min: 0, max: 10000, label: '0-1万' },
        { min: 10000, max: 20000, label: '1-2万' },
        { min: 20000, max: 30000, label: '2-3万' },
        { min: 30000, max: 40000, label: '3-4万' },
        { min: 40000, max: 50000, label: '4-5万' },
        { min: 50000, max: 100000, label: '5-10万' },
        { min: 100000, max: Infinity, label: '10万以上' }
      ]

      // 计算每个区间的人数
      const reportContent = ranges.map(range => {
        const count = bonusAmounts.filter(amount => amount >= range.min && amount < range.max).length
        const percentage = bonusData.length > 0 ? ((count / bonusData.length) * 100).toFixed(2) : 0

        return {
          '奖金区间': range.label,
          '人数': count,
          '占比': `${percentage}%`,
          '最小值': range.min,
          '最大值': range.max === Infinity ? '无上限' : range.max
        }
      })

      // 添加统计汇总
      const median = bonusAmounts.length > 0 ? bonusAmounts[Math.floor(bonusAmounts.length / 2)] : 0
      const total = bonusAmounts.reduce((sum, v) => sum + v, 0)
      const avg = bonusAmounts.length > 0 ? total / bonusAmounts.length : 0
      const max = bonusAmounts.length > 0 ? bonusAmounts[bonusAmounts.length - 1] : 0
      const min = bonusAmounts.length > 0 ? bonusAmounts[0] : 0

      // 添加汇总行
      reportContent.push(
        { '奖金区间': '--- 统计汇总 ---', '人数': '', '占比': '', '最小值': '', '最大值': '' },
        { '奖金区间': '总人数', '人数': bonusData.length, '占比': '100%', '最小值': '', '最大值': '' },
        { '奖金区间': '平均奖金', '人数': Math.round(avg), '占比': '', '最小值': '', '最大值': '' },
        { '奖金区间': '中位数', '人数': Math.round(median), '占比': '', '最小值': '', '最大值': '' },
        { '奖金区间': '最高奖金', '人数': Math.round(max), '占比': '', '最小值': '', '最大值': '' },
        { '奖金区间': '最低奖金', '人数': Math.round(min), '占比': '', '最小值': '', '最大값': '' }
      )

      console.log('✅ [奖金分布] 生成报告行数:', reportContent.length)
      console.log('🔍 [奖金分布] 第一行数据示例:', JSON.stringify(reportContent[0], null, 2))
      return reportContent
    } catch (error) {
      console.error('❌ [奖金分布] 生成报告失败:', error)
      return []
    }
  }

  // 生成自定义报表
  async generateCustomReport(reportData) {
    console.log('📊 生成自定义报表')

    const { fields = [], filters = {} } = reportData

    // 根据用户选择的字段生成报表
    let reportContent = []

    if (fields.includes('employees')) {
      const employees = await databaseService.find('employees', {})
      reportContent = reportContent.concat(employees.map(emp => ({
        type: 'employee',
        id: emp._id,
        name: emp.realName,
        department: emp.departmentName || '未知',
        position: emp.position || '未知',
        hireDate: emp.hireDate
      })))
    }

    if (fields.includes('bonus')) {
      const bonusAllocations = await databaseService.find('bonusAllocationResults', {})
      reportContent = reportContent.concat(bonusAllocations.map(allocation => ({
        type: 'bonus',
        employeeId: allocation.employeeId,
        amount: allocation.totalBonus || allocation.totalAmount,
        period: allocation.period,
        date: allocation.createdAt
      })))
    }

    return reportContent
  }

  // 删除报表
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params

      const report = await databaseService.findOne('reports', { _id: id })
      if (!report) {
        return res.status(404).json({
          code: 404,
          message: '报表不存在',
          data: null
        })
      }

      // 软删除
      await databaseService.update('reports',
        id,
        { status: 'deleted', deletedAt: toMySQLDateTime(new Date()) }
      )

      logger.info(`报表删除成功: ${id}`)

      res.json({
        code: 200,
        data: null,
        message: '删除成功'
      })

    } catch (error) {
      logger.error('Delete report error:', error)
      next(error)
    }
  }

  // 下载报表
  async downloadReport(req, res, next) {
    try {
      const { id } = req.params
      const { format = 'excel' } = req.query  // 支持format参数

      const report = await databaseService.findOne('reports', { _id: id })
      if (!report || report.status !== 'completed') {
        return res.status(404).json({
          code: 404,
          message: '报表不存在或未完成',
          data: null
        })
      }

      // 解析content（可能是JSON字符串）
      let reportContent = report.content
      if (typeof reportContent === 'string') {
        try {
          reportContent = JSON.parse(reportContent)
        } catch (e) {
          logger.error('解析报表内容失败:', e)
          reportContent = []
        }
      }

      // 确保是数组
      if (!Array.isArray(reportContent)) {
        reportContent = []
      }

      // 调试日志
      console.log('📊 下载报表:', {
        id,
        format,
        contentLength: reportContent.length,
        contentSample: reportContent.slice(0, 2)
      })

      // 检查报表内容
      if (reportContent.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '报表内容为空，无法下载。请确认数据库中有奖金分配记录。',
          data: null
        })
      }

      // 根据格式导出
      if (format === 'excel' || format === 'xlsx') {
        // 使用dataExportService导出Excel
        const dataExportService = require('../services/dataExportService')

        console.log('📊 准备导出Excel，数据行数:', reportContent.length)

        const exportResult = await dataExportService.exportToExcel(
          reportContent,
          {
            fileName: report.name,
            sheetName: this.getCategoryName(report.category),
            outputPath: './exports/reports'
          }
        )

        console.log('📊 导出结果:', exportResult)

        if (!exportResult.success) {
          throw new Error(exportResult.error || '导出失败')
        }

        // 设置响应头
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(exportResult.fileName)}"`)

        // 读取并发送文件
        const fs = require('fs')
        const fileStream = fs.createReadStream(exportResult.filePath)

        fileStream.on('end', () => {
          // 删除临时文件
          fs.unlink(exportResult.filePath, (err) => {
            if (err) logger.error('删除临时文件失败:', err)
          })
        })

        fileStream.pipe(res)
      } else {
        // 默认或JSON格式
        const content = JSON.stringify(reportContent, null, 2)
        const filename = `${report.name}_${new Date().toISOString().split('T')[0]}.json`

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
        res.setHeader('Content-Type', 'application/json')
        res.send(content)
      }

    } catch (error) {
      logger.error('Download report error:', error)
      next(error)
    }
  }

  // 预览报表
  async previewReport(req, res, next) {
    try {
      const { id } = req.params

      const report = await databaseService.findOne('reports', { _id: id })
      if (!report || report.status !== 'completed') {
        return res.status(404).json({
          code: 404,
          message: '报表不存在或未完成',
          data: null
        })
      }

      // 解析content（可能是JSON字符串）
      let reportContent = report.content
      if (typeof reportContent === 'string') {
        try {
          reportContent = JSON.parse(reportContent)
        } catch (e) {
          logger.error('解析报表内容失败:', e)
          reportContent = []
        }
      }

      // 确保是数组
      if (!Array.isArray(reportContent)) {
        reportContent = []
      }

      // 返回预览数据（前100条）
      const previewData = reportContent.slice(0, 100)

      console.log('📊 [后端] 预览报表:', {
        id,
        name: report.name,
        category: report.category,
        type: report.type,
        dataLength: previewData.length
      })

      res.json({
        code: 200,
        data: {
          preview: previewData,
          total: reportContent.length,
          columns: this.getReportColumns(report.category, report.type, report.name)
        },
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Preview report error:', error)
      next(error)
    }
  }

  // 获取分类名称
  getCategoryName(category) {
    const names = {
      bonus: '奖金报表',
      statistics: '统计报表',
      custom: '自定义报表'
    }
    return names[category] || '报表'
  }

  // 获取报表列定义 - 根据类型和名称返回不同的列
  getReportColumns(category, type, name) {
    // 优先根据type或name区分
    if (type === 'analysis' || (name && name.includes('绩效'))) {
      // 绩效分析报告
      return [
        { prop: '员工姓名', label: '员工姓名', width: 120 },
        { prop: '部门', label: '部门', width: 150 },
        { prop: '岗位', label: '岗位', width: 150 },
        { prop: '利润贡献度得分', label: '利润贡献度', width: 120 },
        { prop: '岗位价值得分', label: '岗位价值', width: 120 },
        { prop: '绩效表现得分', label: '绩效表现', width: 120 },
        { prop: '综合得分', label: '综合得分', width: 120 },
        { prop: '最终奖金', label: '最终奖金(元)', width: 120 },
        { prop: '计算日期', label: '计算日期', width: 180 }
      ]
    } else if (type === 'statistics' || (name && name.includes('分布'))) {
      // 奖金分布统计报告
      return [
        { prop: '奖金区间', label: '奖金区间', width: 150 },
        { prop: '人数', label: '人数', width: 100 },
        { prop: '占比', label: '占比', width: 100 },
        { prop: '最小值', label: '最小值(元)', width: 120 },
        { prop: '最大值', label: '最大值(元)', width: 120 }
      ]
    }

    // 原有逻辑 - 根据category返回
    const columnMap = {
      bonus: [
        { prop: '员工姓名', label: '员工姓名' },
        { prop: '部门', label: '部门' },
        { prop: '岗位', label: '岗位' },
        { prop: '基础奖金', label: '基础奖金' },
        { prop: '绩效奖金', label: '绩效奖金' },
        { prop: '总奖金', label: '总奖金' },
        { prop: '期间', label: '期间' }
      ],
      statistics: [
        { prop: '指标名称', label: '指标名称' },
        { prop: '数值', label: '数值' },
        { prop: '单位', label: '单位' }
      ],
      custom: [
        { prop: 'type', label: '类型' },
        { prop: 'name', label: '名称' },
        { prop: 'value', label: '值' }
      ]
    }

    return columnMap[category] || []
  }

  // 重新生成报表
  async regenerateReport(req, res, next) {
    try {
      const { id } = req.params

      const report = await databaseService.findOne('reports', { _id: id })
      if (!report) {
        return res.status(404).json({
          code: 404,
          message: '报表不存在',
          data: null
        })
      }

      // 更新状态为生成中
      await databaseService.update('reports',
        id,
        { status: 'generating', updatedAt: toMySQLDateTime(new Date()) }
      )

      // 异步重新生成 - 保存this到闭包
      const self = this
      setImmediate(async () => {
        try {
          await self.generateReportContent(id, report)
        } catch (error) {
          logger.error(`报表重新生成失败 ${id}:`, error)
        }
      })

      res.json({
        code: 200,
        data: null,
        message: '开始重新生成报表'
      })

    } catch (error) {
      logger.error('Regenerate report error:', error)
      next(error)
    }
  }

  // 获取报表模板
  async getReportTemplates(req, res, next) {
    try {
      const templates = [
        {
          id: 1,
          name: '月度奖金汇总',
          description: '按部门统计月度奖金发放情况',
          type: 'bonus',
          category: 'bonus',
          fields: ['employeeName', 'department', 'totalBonus', 'period'],
          defaultFilters: { period: 'current_month' }
        },
        {
          id: 2,
          name: '员工奖金明细',
          description: '详细的员工奖金计算明细',
          type: 'detail',
          category: 'bonus',
          fields: ['employeeName', 'baseAmount', 'performanceBonus', 'totalBonus'],
          defaultFilters: {}
        },
        {
          id: 3,
          name: '绩效分析报告',
          description: '员工绩效评估和分析报告',
          type: 'analysis',
          category: 'statistics',
          fields: ['metric', 'value', 'unit'],
          defaultFilters: {}
        },
        {
          id: 4,
          name: '奖金分布统计',
          description: '奖金分布区间和统计分析',
          type: 'statistics',
          category: 'statistics',
          fields: ['metric', 'value', 'unit'],
          defaultFilters: {}
        }
      ]

      res.json({
        code: 200,
        data: templates,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get report templates error:', error)
      next(error)
    }
  }

  // 使用模板创建报表
  async createReportFromTemplate(req, res, next) {
    try {
      const { templateId } = req.params
      const { dateRange, filters = {} } = req.body

      // 获取模板数据
      const templates = [
        {
          id: 1,
          name: '月度奖金汇总',
          description: '按部门统计月度奖金发放情况',
          type: 'bonus',
          category: 'bonus',
          fields: ['employeeName', 'department', 'totalBonus', 'period'],
          defaultFilters: { period: 'current_month' }
        },
        {
          id: 2,
          name: '员工奖金明细',
          description: '详细的员工奖金计算明细',
          type: 'detail',
          category: 'bonus',
          fields: ['employeeName', 'baseAmount', 'performanceBonus', 'totalBonus'],
          defaultFilters: {}
        },
        {
          id: 3,
          name: '绩效分析报告',
          description: '员工绩效评估和分析报告',
          type: 'analysis',
          category: 'statistics',
          fields: ['metric', 'value', 'unit'],
          defaultFilters: {}
        },
        {
          id: 4,
          name: '奖金分布统计',
          description: '奖金分布区间和统计分析',
          type: 'statistics',
          category: 'statistics',
          fields: ['metric', 'value', 'unit'],
          defaultFilters: {}
        }
      ]
      const template = templates.find(t => t.id === parseInt(templateId))

      if (!template) {
        return res.status(404).json({
          code: 404,
          message: '模板不存在',
          data: null
        })
      }

      // 使用模板创建报表
      const reportData = {
        name: `${template.name}_${new Date().toISOString().split('T')[0]}`,
        category: template.category,
        description: template.description,
        dateRange,
        fields: template.fields,
        filters: { ...template.defaultFilters, ...filters },
        format: 'excel'
      }

      // 直接复制 createReport 的逻辑
      req.body = reportData

      // 创建报表记录
      const report = await databaseService.insert('reports', {
        ...reportData,
        status: 'generating',
        createdBy: req.user.id,
        createdByName: req.user.username || req.user.realName
      })

      // 异步生成报表内容 - 保存this到闭包
      const self = this
      setImmediate(async () => {
        try {
          await self.generateReportContent(report._id, reportData)
        } catch (error) {
          logger.error(`报表生成失败 ${report._id}:`, error)
        }
      })

      logger.info(`从模板创建报表成功: ${reportData.name}`)

      res.json({
        code: 200,
        data: {
          ...report,
          id: report._id
        },
        message: '报表创建成功，正在生成中'
      })

    } catch (error) {
      logger.error('Create report from template error:', error)
      next(error)
    }
  }

  // 查询个人奖金信息
  async queryPersonalBonus(req, res, next) {
    try {
      const { period, employeeId, employeeName } = req.query
      const currentUserId = req.user.id

      // 构建查询条件
      let employeeQuery = { status: 1 }

      if (employeeId) {
        employeeQuery._id = employeeId
      } else if (employeeName) {
        employeeQuery.realName = new RegExp(employeeName, 'i')
      } else {
        // 默认查询当前用户
        employeeQuery.userId = currentUserId
      }

      const employee = await databaseService.findOne('employees', employeeQuery)
      if (!employee) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在',
          data: null
        })
      }

      // 查询奖金分配记录
      let bonusQuery = { employeeId: employee._id }
      if (period) {
        bonusQuery.period = period
      }

      const bonusAllocation = await databaseService.findOne('bonusAllocations', bonusQuery)

      // 构建返回数据
      const bonusInfo = {
        employeeId: employee._id,
        employeeName: employee.realName,
        department: employee.departmentName || '未知',
        position: employee.position || '未知',
        businessLine: employee.businessLineName || '未知',
        totalBonus: bonusAllocation?.totalAmount || 0,
        baseBonus: bonusAllocation?.baseAmount || 0,
        performanceBonus: bonusAllocation?.performanceBonus || 0,
        totalScore: bonusAllocation?.totalScore || 0,
        bonusRatio: bonusAllocation?.bonusRatio || 0,
        baseAmount: bonusAllocation?.baseAmount || 0,
        calculationDetails: bonusAllocation?.calculationDetails || [],
        compared: {
          monthlyGrowth: 0,
          yearlyGrowth: 0,
          departmentRanking: 1,
          companyRanking: 1
        },
        insights: [
          { id: 1, type: 'info', text: '本月奖金计算已完成' }
        ]
      }

      res.json({
        code: 200,
        data: bonusInfo,
        message: '查询成功'
      })

    } catch (error) {
      logger.error('Query personal bonus error:', error)
      next(error)
    }
  }

  // 导出个人奖金报告
  async exportPersonalBonusReport(req, res, next) {
    try {
      const { period, format = 'excel', content = [] } = req.body

      // 获取个人奖金数据
      req.query = { period }
      const bonusData = await this.queryPersonalBonus(req, { json: (data) => data }, () => {})

      if (!bonusData || bonusData.code !== 200) {
        return res.status(404).json({
          code: 404,
          message: '个人奖金数据不存在',
          data: null
        })
      }

      // 生成导出内容
      const exportContent = JSON.stringify(bonusData.data, null, 2)
      const filename = `个人奖金报告_${period || 'latest'}.json`

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
      res.setHeader('Content-Type', 'application/json')
      res.send(exportContent)

    } catch (error) {
      logger.error('Export personal bonus report error:', error)
      next(error)
    }
  }

  // 获取员工历史奖金数据
  async getEmployeeBonusHistory(req, res, next) {
    try {
      const { employeeId } = req.params
      const { months = 12 } = req.query

      const bonusHistory = await databaseService.find('bonusAllocations', {
        employeeId: employeeId
      })

      // 按时间倒序排列并限制数量
      bonusHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const limitedHistory = bonusHistory.slice(0, parseInt(months))

      const historyData = limitedHistory.map(allocation => ({
        period: allocation.period,
        totalAmount: allocation.totalAmount || 0,
        baseAmount: allocation.baseAmount || 0,
        performanceBonus: allocation.performanceBonus || 0,
        date: allocation.createdAt
      }))

      res.json({
        code: 200,
        data: historyData,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get employee bonus history error:', error)
      next(error)
    }
  }

  // 获取员工绩效雷达图数据
  async getEmployeePerformanceRadar(req, res, next) {
    try {
      const { employeeId } = req.params
      const { period } = req.query

      // 查询员工绩效数据
      const performanceData = await databaseService.findOne('bonusAllocations', {
        employeeId: employeeId,
        period: period
      })

      const radarData = {
        indicators: [
          { name: '工作质量', max: 100 },
          { name: '工作效率', max: 100 },
          { name: '团队协作', max: 100 },
          { name: '创新能力', max: 100 },
          { name: '学习能力', max: 100 }
        ],
        data: [{
          value: [
            (performanceData?.qualityScore || 80),
            (performanceData?.efficiencyScore || 75),
            (performanceData?.collaborationScore || 85),
            (performanceData?.innovationScore || 70),
            (performanceData?.learningScore || 90)
          ],
          name: '当前绩效'
        }]
      }

      res.json({
        code: 200,
        data: radarData,
        message: '获取成功'
      })

    } catch (error) {
      logger.error('Get employee performance radar error:', error)
      next(error)
    }
  }
}

module.exports = new ReportsController()
