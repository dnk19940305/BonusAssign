const logger = require('../utils/logger')
const databaseService = require('./databaseService')
const { nanoid } = require('nanoid')
const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs')

class ProjectPerformanceService {
  /**
   * 生成Excel导出模板
   * @param {string} poolId - 奖金池ID
   * @param {string} selectedPeriod - 选择的期间（可选，如果不传则使用奖金池的期间）
   * @returns {Buffer} Excel文件Buffer
   */
  async generateExcelTemplate(poolId, selectedPeriod = null) {
    try {
      // 获取奖金池信息
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }

      // 使用选择的期间或奖金池的期间
      const period = selectedPeriod || pool.period

      // 获取所有员工（不限于项目成员）
      const allEmployees = await databaseService.find('employees', { 
        status: 1  // 只获取在职员工
      })

      // 创建工作簿
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('项目绩效数据')

      // 设置列
      worksheet.columns = [
        { header: '员工ID', key: 'employeeId', width: 20 },
        { header: '员工姓名', key: 'employeeName', width: 15 },
        { header: '工号', key: 'employeeNumber', width: 15 },
        { header: '部门', key: 'department', width: 15 },
        { header: '岗位', key: 'position', width: 15 },
        { header: '业务线', key: 'businessLine', width: 15 },
        { header: '项目角色', key: 'projectRole', width: 15 },
        { header: '绩效期间', key: 'period', width: 15 },
        { header: '奖金池创建时间', key: 'poolCreatedAt', width: 20 },
        { header: '利润贡献', key: 'profitContribution', width: 15 },
        { header: '岗位价值', key: 'positionValue', width: 15 },
        { header: '绩效表现', key: 'performanceScore', width: 15 },
        { header: '备注', key: 'remark', width: 30 }
      ]

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }

      // 填充数据 - 导出所有员工
      for (const employee of allEmployees) {
        // 获取部门信息
        let departmentName = ''
        if (employee.departmentId) {
          const department = await databaseService.findOne('departments', { _id: employee.departmentId })
          departmentName = department?.name || ''
        }

        // 获取岗位信息
        let positionName = ''
        if (employee.positionId) {
          const position = await databaseService.findOne('positions', { _id: employee.positionId })
          positionName = position?.name || ''
        }

        // 获取业务线信息
        let businessLineName = ''
        if (employee.businessLineId) {
          const businessLine = await databaseService.findOne('businessLines', { _id: employee.businessLineId })
          businessLineName = businessLine?.name || ''
        }

        // 检查是否是项目成员，获取项目角色
        let projectRoleName = ''
        const memberRecord = await databaseService.findOne('projectMembers', {
          projectId: pool.projectId,
          employeeId: employee._id || employee.id
        })
        
        if (memberRecord && (memberRecord.roleId || memberRecord.role_id)) {
          try {
            const roleId = memberRecord.roleId || memberRecord.role_id
            const role = await databaseService.query(
              'SELECT name FROM project_roles WHERE id = ? LIMIT 1',
              [parseInt(roleId)]
            )
            if (role && role.length > 0) {
              projectRoleName = role[0].name
            }
          } catch (err) {
            projectRoleName = String(memberRecord.roleId || memberRecord.role_id || '')
          }
        }

        worksheet.addRow({
          employeeId: employee._id || employee.id,
          employeeName: employee.name || '未知',
          employeeNumber: employee.employeeNumber || employee.employee_number || '',
          department: departmentName,
          position: positionName,
          businessLine: businessLineName,
          projectRole: projectRoleName || '非项目成员',
          period: period,
          poolCreatedAt: pool.createdAt ? new Date(pool.createdAt).toLocaleString('zh-CN') : '',
          profitContribution: 0,
          positionValue: 0,
          performanceScore: 0,
          remark: ''
        })
      }

      // 生成Buffer
      const buffer = await workbook.xlsx.writeBuffer()
      logger.info(`生成Excel模板成功: 奖金池${poolId}, 期间${period}, 员工数${allEmployees.length}`)
      return buffer

    } catch (error) {
      logger.error('生成Excel模板失败:', error)
      throw error
    }
  }

  /**
   * 导入Excel数据
   * @param {string} poolId - 奖金池ID
   * @param {Buffer} fileBuffer - Excel文件Buffer
   * @param {string} userId - 操作用户ID
   */
  async importExcelData(poolId, fileBuffer, userId) {
    try {
      // 获取奖金池信息
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }

      // 解析Excel
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(fileBuffer)
      const worksheet = workbook.getWorksheet(1)

      if (!worksheet) {
        throw new Error('Excel文件格式错误')
      }

      const records = []
      const errors = []
      let rowIndex = 0

      worksheet.eachRow((row, rowNumber) => {
        // 跳过表头
        if (rowNumber === 1) return

        rowIndex++
        const employeeId = row.getCell(1).value
        const employeeName = row.getCell(2).value
        const period = row.getCell(3).value
        const profitContribution = parseFloat(row.getCell(5).value) || 0
        const positionValue = parseFloat(row.getCell(6).value) || 0
        const performanceScore = parseFloat(row.getCell(7).value) || 0

        // 验证必填字段
        if (!employeeId) {
          errors.push(`第${rowNumber}行: 员工ID不能为空`)
          return
        }

        if (!employeeName) {
          errors.push(`第${rowNumber}行: 员工姓名不能为空`)
          return
        }

        records.push({
          id: nanoid(),
          poolId,
          employeeId: String(employeeId),
          employeeName: String(employeeName),
          period: pool.period,
          profitContribution,
          positionValue,
          performanceScore,
          status: 'submitted',
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })

      if (errors.length > 0) {
        throw new Error(`导入数据存在错误:\n${errors.join('\n')}`)
      }

      if (records.length === 0) {
        throw new Error('未找到有效数据')
      }

      // 删除该奖金池的旧数据
      await databaseService.deleteMany('projectPerformanceManual', { poolId })

      // 批量插入
      for (const record of records) {
        await databaseService.insert('projectPerformanceManual', record)
      }

      logger.info(`导入绩效数据成功: 奖金池${poolId}, 记录数${records.length}`)
      return {
        success: true,
        count: records.length,
        records
      }

    } catch (error) {
      logger.error('导入Excel数据失败:', error)
      throw error
    }
  }

  /**
   * 获取手动绩效数据列表
   * @param {string} poolId - 奖金池ID
   */
  async getPerformanceData(poolId) {
    try {
      const records = await databaseService.find('projectPerformanceManual', { poolId })
      return records || []
    } catch (error) {
      logger.error('获取绩效数据失败:', error)
      throw error
    }
  }

  /**
   * 手动录入单条绩效数据
   * @param {Object} data - 绩效数据
   */
  async createPerformanceRecord(data) {
    try {
      const { poolId, employeeId, profitContribution, positionValue, performanceScore, userId } = data

      // 验证奖金池
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }

      // 验证员工
      const employee = await databaseService.getEmployeeById(employeeId)
      if (!employee) {
        throw new Error('员工不存在')
      }

      // 检查是否已存在
      const existing = await databaseService.findOne('projectPerformanceManual', { 
        poolId, 
        employeeId 
      })

      const record = {
        poolId,
        employeeId,
        employeeName: employee.name,
        period: pool.period,
        profitContribution: parseFloat(profitContribution) || 0,
        positionValue: parseFloat(positionValue) || 0,
        performanceScore: parseFloat(performanceScore) || 0,
        status: 'submitted',
        updatedBy: userId,
        updatedAt: new Date()
      }

      if (existing) {
        // 更新
        await databaseService.update('projectPerformanceManual', 
          { _id: existing._id }, 
          record
        )
        return { ...existing, ...record }
      } else {
        // 新增
        record.id = nanoid()
        record.createdBy = userId
        record.createdAt = new Date()
        await databaseService.insert('projectPerformanceManual', record)
        return record
      }

    } catch (error) {
      logger.error('创建绩效记录失败:', error)
      throw error
    }
  }

  /**
   * 基于手动录入数据计算奖金
   * @param {string} poolId - 奖金池ID
   */
  async calculateBonusFromManualData(poolId) {
    try {
      // 获取奖金池
      const pool = await databaseService.findOne('projectBonusPools', { _id: poolId })
      if (!pool) {
        throw new Error('奖金池不存在')
      }

      // 获取手动录入的绩效数据
      const performanceRecords = await databaseService.find('projectPerformanceManual', { 
        poolId,
        status: 'submitted'
      })

      if (!performanceRecords || performanceRecords.length === 0) {
        throw new Error('没有可用的绩效数据')
      }

      // 计算总权重
      let totalWeight = 0
      const memberWeights = []

      for (const record of performanceRecords) {
        // 三维加权得分 = 利润贡献 + 岗位价值 + 绩效表现
        const weight = (record.profitContribution || 0) + 
                      (record.positionValue || 0) + 
                      (record.performanceScore || 0)
        
        totalWeight += weight
        memberWeights.push({
          ...record,
          weight
        })
      }

      if (totalWeight <= 0) {
        throw new Error('总权重为0，无法分配奖金')
      }

      // 计算每人奖金
      const allocations = []
      for (const member of memberWeights) {
        const bonusAmount = (pool.totalAmount * member.weight / totalWeight)
        
        allocations.push({
          id: nanoid(),
          poolId: pool._id,
          employeeId: member.employeeId,
          roleId: null,
          roleWeight: 1.0,
          performanceCoeff: 1.0,
          participationRatio: 100, // 默认100%参与度
          bonusAmount: Math.round(bonusAmount * 100) / 100,
          status: 'calculated',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      // 删除旧的分配记录
      await databaseService.deleteMany('projectBonusAllocations', { poolId: pool._id })

      // 保存新的分配记录
      for (const allocation of allocations) {
        await databaseService.insert('projectBonusAllocations', allocation)
      }

      // 更新绩效记录状态
      await databaseService.updateMany('projectPerformanceManual',
        { poolId },
        { status: 'calculated', updatedAt: new Date() }
      )

      // 更新奖金池状态
      await databaseService.update('projectBonusPools',
        { _id: pool._id },
        { status: 'calculated', updatedAt: new Date() }
      )

      logger.info(`基于手动数据计算奖金成功: 奖金池${poolId}, 分配${allocations.length}人`)
      return {
        poolId: pool._id,
        totalAmount: pool.totalAmount,
        memberCount: allocations.length,
        allocations
      }

    } catch (error) {
      logger.error('基于手动数据计算奖金失败:', error)
      throw error
    }
  }
}

module.exports = new ProjectPerformanceService()
