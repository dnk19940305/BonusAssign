const logger = require('../utils/logger')
const databaseService = require('./databaseService')
const { databaseManager } = require('../config/database')
const { nanoid } = require('nanoid')
const ExcelJS = require('exceljs')

class PerformanceRecordService {
  /**
   * 根据期间计算考勤起止日期和应出勤时长
   * @param {string} period - 期间，支持格式: "2025Q1", "2025-Q1", "202502", "2025-02", "2025年度" (全年)
   * @returns {object} { startEndTime: "2025/02/01-2025/02/28", workDays: 20, workHours: 160 }
   */
  calculateAttendanceInfo(period) {
    try {
      if (!period) {
        return { startEndTime: '', workDays: 0, workHours: 0 }
      }

      let startDate, endDate
      
      // 判断是否为全年统计
      if (period.includes('年度')) {
        // 旧格式: 2025年度（兼容）
        const match = period.match(/(\d{4})年度/)
        if (!match) {
          logger.error(`无效的年度格式: ${period}`)
          return { startEndTime: '', workDays: 0, workHours: 0 }
        }
        
        const year = parseInt(match[1])
        startDate = new Date(year, 0, 1)  // 1月1日
        endDate = new Date(year, 11, 31)  // 12月31日
      } else if (/^\d{4}$/.test(period)) {
        // 新格式: 2025（纯数字年份）
        const year = parseInt(period)
        startDate = new Date(year, 0, 1)  // 1月1日
        endDate = new Date(year, 11, 31)  // 12月31日
      } else if (period.includes('Q')) {
        // 季度格式: 2025Q1 或 2025-Q1
        const match = period.match(/(\d{4})-?Q(\d)/)
        if (!match) {
          logger.error(`无效的季度格式: ${period}`)
          return { startEndTime: '', workDays: 0, workHours: 0 }
        }
        
        const year = parseInt(match[1])
        const quarterNum = parseInt(match[2])
        
        // 计算季度的起始月份
        const startMonth = (quarterNum - 1) * 3 + 1
        const endMonth = startMonth + 2
        
        startDate = new Date(year, startMonth - 1, 1)
        endDate = new Date(year, endMonth, 0) // 月份为0表示上个月的最后一天
      } else if (period.includes('M') || period.includes('-')) {
        // 月份格式: 2025M02, 202502, 2025-02
        const match = period.match(/(\d{4})-?M?(\d{2})/)
        if (!match) {
          logger.error(`无效的月份格式: ${period}`)
          return { startEndTime: '', workDays: 0, workHours: 0 }
        }
        
        const year = parseInt(match[1])
        const month = parseInt(match[2])
        
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 0)
      } else {
        logger.error(`无法识别的期间格式: ${period}`)
        return { startEndTime: '', workDays: 0, workHours: 0 }
      }
      
      // 验证日期是否有效
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        logger.error(`日期计算失败: period=${period}`)
        return { startEndTime: '', workDays: 0, workHours: 0 }
      }
      
      // 格式化日期为 YYYY/MM/DD
      const formatDate = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}/${m}/${d}`
      }
      
      const startEndTime = `${formatDate(startDate)}-${formatDate(endDate)}`
      
      // 计算应出勤天数（排除周末）
      let workDays = 0
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay()
        // 0=周日, 6=周六
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workDays++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // 计算应出勤时长（天数 × 8小时/天）
      const workHours = workDays * 8
      
      return { startEndTime, workDays, workHours }
    } catch (error) {
      logger.error('计算考勤信息失败:', error)
      return { startEndTime: '', workDays: 0, workHours: 0 }
    }
  }

  /**
   * 获取绩效记录列表
   */
  async getPerformanceRecords(filters, pagination) {
    try {
      const {
        employeeId,
        employeeName,
        period,
        rating,
        evaluatorId
      } = filters

      const { page = 1, pageSize = 20 } = pagination

      // 构建查询条件
      let whereClauses = []
      const params = []

      if (employeeId) {
        whereClauses.push('pr.employee_id = ?')
        params.push(employeeId)
      }

      if (employeeName) {
        whereClauses.push('(e.name LIKE ? OR e.employee_no LIKE ?)')
        params.push(`%${employeeName}%`, `%${employeeName}%`)
      }

      if (period) {
        whereClauses.push('pr.calculation_period = ?')
        params.push(period)
      }

      if (evaluatorId) {
        whereClauses.push('pr.reviewed_by = ?')
        params.push(evaluatorId)
      }

      const whereClause = whereClauses.length > 0 ? 'AND ' + whereClauses.join(' AND ') : ''

      // 查询总数
      const countSql = `
        SELECT COUNT(*) as total
        FROM performance_three_dimensional_scores pr
        LEFT JOIN employees e ON pr.employee_id = e.id
        WHERE 1=1 ${whereClause}
      `
      const countResult = await databaseManager.query(countSql, params)
      const total = countResult[0].total || 0

      // 分页查询
      const pageNum = parseInt(page) || 1
      const pageSizeNum = parseInt(pageSize) || 20
      const offset = (pageNum - 1) * pageSizeNum

      const sql = `
        SELECT 
          pr.*,
          e.name as employee_name,
          e.employee_no,
          p.name as position_name,
          d.name as department_name,
          COALESCE(bl.name, bl_dept.name) as business_line_name,
          u.username as creator_name
        FROM performance_three_dimensional_scores pr
        LEFT JOIN employees e ON pr.employee_id = e.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN business_lines bl ON e.business_line_id = bl.id
        LEFT JOIN business_lines bl_dept ON d.line_id = bl_dept.id
        LEFT JOIN users u ON pr.created_by = u.id
        WHERE 1=1 ${whereClause}
        ORDER BY pr.created_at DESC 
        LIMIT ${pageSizeNum} OFFSET ${offset}
      `

      const records = await databaseManager.query(sql, params)

      return {
        list: records,
        total,
        page: pageNum,
        pageSize: pageSizeNum
      }
    } catch (error) {
      logger.error('获取绩效记录列表失败:', error)
      throw error
    }
  }

  /**
   * 创建三维绩效记录
   */
  async createThreeDimensionalRecord(data, userId) {
    try {
      const {
        employeeId,
        period,
        positionScore,
        performanceScore,
        profitContribution,
        comments
      } = data

      // 验证必填字段
      if (!employeeId || !period) {
        throw new Error('员工ID和期间为必填字段')
      }

      // 验证员工是否存在
      const employee = await databaseManager.query(
        'SELECT id, name FROM employees WHERE id = ?',
        [employeeId]
      )

      if (employee.length === 0) {
        throw new Error('员工不存在')
      }

      // 验证期间格式
      if (!/^\d{4}[QM]\d{1,2}$/.test(period)) {
        throw new Error('期间格式不正确,应为YYYYQX或YYYYMXX格式')
      }

      // 检查是否已存在
      const existing = await databaseManager.query(
        'SELECT id FROM performance_three_dimensional_scores WHERE employee_id = ? AND calculation_period = ?',
        [employeeId, period]
      )

      if (existing.length > 0) {
        throw new Error('该员工在此期间的三维绩效记录已存在')
      }

      // 验证分数范围
      if (positionScore !== undefined && (positionScore < 0 || positionScore > 100)) {
        throw new Error('岗位评分应在0-100之间')
      }

      if (performanceScore !== undefined && (performanceScore < 0 || performanceScore > 100)) {
        throw new Error('绩效评分应在0-100之间')
      }

      if (profitContribution !== undefined && (profitContribution < -100 || profitContribution > 100)) {
        throw new Error('利润贡献度应在-100至100之间')
      }

      // 创建记录
      const id = nanoid()
      await databaseManager.query(`
        INSERT INTO performance_three_dimensional_scores (
          id, employee_id, calculation_period,
          position_score, performance_score, profit_contribution,
          review_status, reviewed_by, reviewed_at, review_comments,
          source, comments, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, NOW(), ?, 'manual', ?, ?, NOW(), NOW())
      `, [
        id,
        employeeId,
        period,
        positionScore || 0,
        performanceScore || 0,
        profitContribution || 0,
        userId,
        comments || '',
        comments || '',
        userId
      ])

      // 获取创建的记录
      const [record] = await databaseManager.query(`
        SELECT 
          pts.*,
          e.name as employee_name,
          e.employee_no,
          p.name as position_name,
          d.name as department_name,
          COALESCE(bl.name, bl_dept.name) as business_line_name,
          u.username as creator_name
        FROM performance_three_dimensional_scores pts
        LEFT JOIN employees e ON pts.employee_id = e.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN business_lines bl ON e.business_line_id = bl.id
        LEFT JOIN business_lines bl_dept ON d.line_id = bl_dept.id
        LEFT JOIN users u ON pts.created_by = u.id
        WHERE pts.id = ?
      `, [id])

      logger.info(`创建三维绩效记录: 员工=${employee[0].name}, 期间=${period}`)

      return record
    } catch (error) {
      logger.error('创建三维绩效记录失败:', error)
      throw error
    }
  }

  /**
   * 更新三维绩效记录
   */
  async updateThreeDimensionalRecord(id, data, userId) {
    try {
      const {
        positionScore,
        performanceScore,
        profitContribution,
        reviewStatus,
        reviewComments,
        comments
      } = data

      // 检查记录是否存在
      const existing = await databaseManager.query(
        'SELECT * FROM performance_three_dimensional_scores WHERE id = ?',
        [id]
      )

      if (existing.length === 0) {
        throw new Error('绩效记录不存在')
      }

      // 构建更新字段
      const updateFields = []
      const updateParams = []

      if (positionScore !== undefined) {
        if (positionScore < 0 || positionScore > 100) {
          throw new Error('岗位评分应在0-100之间')
        }
        updateFields.push('position_score = ?')
        updateParams.push(positionScore)
      }

      if (performanceScore !== undefined) {
        if (performanceScore < 0 || performanceScore > 100) {
          throw new Error('绩效评分应在0-100之间')
        }
        updateFields.push('performance_score = ?')
        updateParams.push(performanceScore)
      }

      if (profitContribution !== undefined) {
        if (profitContribution < -100 || profitContribution > 100) {
          throw new Error('利润贡献度应在-100至100之间')
        }
        updateFields.push('profit_contribution = ?')
        updateParams.push(profitContribution)
      }

      if (reviewStatus !== undefined) {
        updateFields.push('review_status = ?')
        updateParams.push(reviewStatus)
      }

      if (reviewComments !== undefined) {
        updateFields.push('review_comments = ?')
        updateParams.push(reviewComments)
      }

      if (comments !== undefined) {
        updateFields.push('comments = ?')
        updateParams.push(comments)
      }

      // 更新审核信息
      if (reviewStatus !== undefined) {
        updateFields.push('reviewed_by = ?')
        updateParams.push(userId)
        updateFields.push('reviewed_at = NOW()')
      }

      updateFields.push('updated_by = ?')
      updateFields.push('updated_at = NOW()')
      updateParams.push(userId)

      updateParams.push(id)

      await databaseManager.query(`
        UPDATE performance_three_dimensional_scores 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateParams)

      // 获取更新后的记录
      const [record] = await databaseManager.query(`
        SELECT 
          pts.*,
          e.name as employee_name,
          e.employee_no,
          p.name as position_name,
          d.name as department_name,
          COALESCE(bl.name, bl_dept.name) as business_line_name,
          u.username as creator_name
        FROM performance_three_dimensional_scores pts
        LEFT JOIN employees e ON pts.employee_id = e.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN business_lines bl ON e.business_line_id = bl.id
        LEFT JOIN business_lines bl_dept ON d.line_id = bl_dept.id
        LEFT JOIN users u ON pts.created_by = u.id
        WHERE pts.id = ?
      `, [id])

      logger.info(`更新三维绩效记录: ID=${id}`)

      return record
    } catch (error) {
      logger.error('更新三维绩效记录失败:', error)
      throw error
    }
  }

  /**
   * 删除绩效记录
   */
  async deletePerformanceRecord(id) {
    try {
      // 检查记录是否存在
      const existing = await databaseManager.query(
        'SELECT * FROM performance_three_dimensional_scores WHERE id = ?',
        [id]
      )

      if (existing.length === 0) {
        throw new Error('绩效记录不存在')
      }

      // 检查是否被三维计算引用
      const referenced = await databaseManager.query(`
        SELECT id FROM three_dimensional_calculation_results 
        WHERE employee_id = ? AND calculation_period = ?
        LIMIT 1
      `, [existing[0].employee_id, existing[0].calculation_period])

      if (referenced.length > 0) {
        throw new Error('该绩效记录已被三维计算引用,无法删除')
      }

      // 删除记录
      await databaseManager.query(
        'DELETE FROM performance_three_dimensional_scores WHERE id = ?',
        [id]
      )

      logger.info(`删除三维绩效记录: ID=${id}`)

      return true
    } catch (error) {
      logger.error('删除三维绩效记录失败:', error)
      throw error
    }
  }

  /**
   * 批量导入绩效记录
   */
  async batchImportRecords(records, userId) {
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: []
      }

      for (const record of records) {
        try {
          const {
            employeeId,
            employeeName,
            period,
            positionScore,
            performanceScore,
            profitContribution,
            workTime,  // 应出勤时长（小时）
            realWorkTime,
            comments
          } = record

          // 验证必填字段
          if (!employeeId || !period) {
            results.failed++
            results.errors.push(`员工${employeeName || employeeId}：缺少员工ID或期间`)
            continue
          }

          // 验证员工是否存在（排除admin）
          const [employee] = await databaseManager.query(
            'SELECT id, name, employee_no FROM employees WHERE id = ?',
            [employeeId]
          )

          if (!employee) {
            results.failed++
            results.errors.push(`员工ID ${employeeId} 不存在`)
            continue
          }

          // 检查是否是admin
          const adminCheck = await databaseManager.query(`
            SELECT u.id
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'admin' 
              AND (u.employee_id = ? OR u.real_name = ?)
            LIMIT 1
          `, [employeeId, employee.name])

          if (adminCheck.length > 0 || employee.employee_no === 'EMP_ADMIN') {
            results.failed++
            results.errors.push(`超级管理员 ${employee.name} 不参与奖金计算`)
            continue
          }

          // 检查是否已存在
          const existing = await databaseManager.query(
            'SELECT id FROM performance_three_dimensional_scores WHERE employee_id = ? AND calculation_period = ?',
            [employeeId, period]
          )

          const positionScoreNum = parseFloat(positionScore) || 0
          const performanceScoreNum = parseFloat(performanceScore) || 0
          const profitContributionNum = parseFloat(profitContribution) || 0

          // 验证分数范围
          if (positionScoreNum < 0 || positionScoreNum > 100) {
            results.failed++
            results.errors.push(`员工 ${employee.name} 的岗位评分超出范围(0-100): ${positionScoreNum}`)
            continue
          }
          if (performanceScoreNum < 0 || performanceScoreNum > 100) {
            results.failed++
            results.errors.push(`员工 ${employee.name} 的绩效评分超出范围(0-100): ${performanceScoreNum}`)
            continue
          }
          if (profitContributionNum < -100 || profitContributionNum > 100) {
            results.failed++
            results.errors.push(`员工 ${employee.name} 的利润贡献度超出范围(-100至100): ${profitContributionNum}`)
            continue
          }

          // 计算考勤起止日期和应出勤时长
          const attendanceInfo = this.calculateAttendanceInfo(period)
          const { startEndTime, workDays, workHours } = attendanceInfo
          
          // 应出勤时长：优先使用表格中用户填写的值，如果没有则使用自动计算的值
          const workTimeNum = parseFloat(workTime) || workHours
          const realWorkTimeNum = parseFloat(realWorkTime) || 0
          
          logger.info(`导入考勤信息: 员工=${employeeName}, 期间=${period}, 表格填写workTime=${workTime}, 自动计算workHours=${workHours}, 最终使用=${workTimeNum}小时`)

          if (existing.length > 0) {
            // 更新已存在的记录
            await databaseManager.query(`
              UPDATE performance_three_dimensional_scores 
              SET 
                position_score = ?,
                performance_score = ?,
                profit_contribution = ?,
                start_end_time = ?,
                work_time = ?,
                real_work_time = ?,
                review_status = 'approved',
                reviewed_by = ?,
                reviewed_at = NOW(),
                review_comments = ?,
                source = 'import',
                updated_by = ?,
                updated_at = NOW()
              WHERE id = ?
            `, [
              positionScoreNum,
              performanceScoreNum,
              profitContributionNum,
              startEndTime,
              workTimeNum,  // 使用表格填写的应出勤时长
              realWorkTimeNum,
              userId,
              comments || '批量导入更新',
              userId,
              existing[0].id
            ])
          } else {
            // 创建新记录
            await databaseManager.query(`
              INSERT INTO performance_three_dimensional_scores (
                id, employee_id, calculation_period,
                position_score, performance_score, profit_contribution,
                start_end_time, work_time, real_work_time,
                review_status, reviewed_by, reviewed_at, review_comments,
                source, comments, created_by, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW(), ?, 'import', ?, ?, NOW(), NOW())
            `, [
              nanoid(),
              employeeId,
              period,
              positionScoreNum,
              performanceScoreNum,
              profitContributionNum,
              startEndTime,
              workTimeNum,  // 使用表格填写的应出勤时长
              realWorkTimeNum,
              userId,
              '批量导入',
              comments || '',
              userId
            ])
          }

          results.success++

        } catch (error) {
          results.failed++
          const errorMsg = `员工${record.employeeName || record.employeeId || '未知'}: ${error.message}`
          results.errors.push(errorMsg)
          logger.error('单条记录导入失败:', errorMsg, error.stack)
        }
      }

      logger.info(`批量导入三维评分: 成功${results.success}, 失败${results.failed}`)
      
      // 打印所有错误信息
      if (results.errors.length > 0) {
        logger.error(`导入错误详情 (${results.errors.length}条):`)
        results.errors.forEach((error, index) => {
          logger.error(`  [${index + 1}] ${error}`)
        })
      }

      return results
    } catch (error) {
      logger.error('批量导入三维评分失败:', error)
      throw error
    }
  }

  /**
   * 生成Excel模板
   */
  async generateExcelTemplate(period) {
    try {
      // 获取所有在职员工（排除超级管理员）
      const employees = await databaseManager.query(`
        SELECT DISTINCT
          e.id,
          e.name,
          e.employee_no,
          d.name as department_name,
          p.name as position_name,
          COALESCE(bl.name, bl_dept.name) as business_line_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN business_lines bl ON e.business_line_id = bl.id
        LEFT JOIN business_lines bl_dept ON d.line_id = bl_dept.id
        LEFT JOIN users u ON u.employee_id = e.id OR u.real_name = e.name
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE e.status = 1
          AND (r.name IS NULL OR r.name != 'admin')
          AND e.employee_no != 'EMP_ADMIN'
        ORDER BY e.employee_no
      `)

      // 计算考勤信息
      const attendanceInfo = this.calculateAttendanceInfo(period)
      const { startEndTime, workDays, workHours } = attendanceInfo

      logger.info(`计算考勤信息: period=${period}, 工作天数=${workDays}, 工作时长=${workHours}小时`)

      // 创建Excel工作簿
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('绩效记录')

      // 设置列
      worksheet.columns = [
        { header: '员工ID', key: 'employeeId', width: 20 },
        { header: '员工姓名', key: 'employeeName', width: 15 },
        { header: '工号', key: 'employeeNumber', width: 15 },
        { header: '部门', key: 'department', width: 15 },
        { header: '岗位', key: 'position', width: 15 },
        { header: '业务线', key: 'businessLine', width: 15 },
        { header: '考核期间', key: 'period', width: 15 },
        { header: '考勤起止日期', key: 'startEndTime', width: 25 },
        { header: '应出勤时长(小时)', key: 'workTime', width: 18 },
        { header: '实际出勤时长(小时)', key: 'realWorkTime', width: 20 },
        { header: '岗位评分(0-100)', key: 'positionScore', width: 15 },
        { header: '绩效评分(0-100)', key: 'performanceScore', width: 15 },
        { header: '利润贡献评分(-100-100)', key: 'profitContributionScore', width: 18 },
        { header: '备注', key: 'comments', width: 30 }
      ]

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }

      // 填充员工数据
      for (const emp of employees) {
        worksheet.addRow({
          employeeId: emp.id,
          employeeName: emp.name || '',
          employeeNumber: emp.employee_no || '',
          department: emp.department_name || '',
          position: emp.position_name || '',
          businessLine: emp.business_line_name || '',
          period: period || '',
          startEndTime: startEndTime || '',
          workTime: workHours || 0,
          realWorkTime: 0,
          positionScore: 0,
          performanceScore: 0,
          profitContribution: 0,
          comments: ''
        })
      }

      // 生成Excel文件
      const buffer = await workbook.xlsx.writeBuffer()

      logger.info(`生成绩效记录模板成功: 期间=${period}, 员工数=${employees.length}`)

      return buffer
    } catch (error) {
      logger.error('生成绩效记录模板失败:', error)
      throw error
    }
  }

  /**
   * 获取评级选项
   */
  getRatingOptions() {
    return [
      { rating: 'S', label: '卓越', coefficient: 1.2, color: '#FF6B6B' },
      { rating: 'A', label: '优秀', coefficient: 1.1, color: '#4ECDC4' },
      { rating: 'B', label: '良好', coefficient: 1.0, color: '#95E1D3' },
      { rating: 'C', label: '合格', coefficient: 0.9, color: '#F9CA24' },
      { rating: 'D', label: '待改进', coefficient: 0.7, color: '#A8A8A8' }
    ]
  }
}

module.exports = new PerformanceRecordService()
