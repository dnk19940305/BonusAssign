/**
 * 为员工批量分配业务线
 * 根据部门和岗位自动匹配业务线
 */

const MySQLManager = require('../src/database/mysql-manager')
const config = require('../src/config/database')

const db = new MySQLManager(config)

async function assignBusinessLines() {
  try {
    // 初始化数据库连接
    await db.initialize()
    
    console.log('开始为员工分配业务线...\n')

    // 1. 查看当前业务线
    const businessLines = await db.query(`
      SELECT id, name, code, weight
      FROM business_lines
      ORDER BY weight DESC
    `)
    
    console.log('=== 可用业务线 ===')
    businessLines.forEach(bl => {
      console.log(`${bl.code.padEnd(20)} | ${bl.name.padEnd(10)} | 权重:${(bl.weight * 100).toFixed(0)}%`)
    })

    // 2. 查询没有业务线的员工
    const employeesWithoutBL = await db.query(`
      SELECT 
        e.id,
        e.name,
        e.employee_no,
        d.name as department_name,
        d.code as department_code,
        p.name as position_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.status = 1
        AND (e.business_line_id IS NULL OR e.business_line_id = '')
        AND e.employee_no != 'EMP_ADMIN'
      ORDER BY e.employee_no
    `)

    console.log(`\n=== 需要分配业务线的员工: ${employeesWithoutBL.length}个 ===\n`)

    if (employeesWithoutBL.length === 0) {
      console.log('✅ 所有员工都已有业务线，无需处理')
      return
    }

    // 3. 定义匹配规则（根据部门代码匹配业务线）
    const matchingRules = {
      // 技术部门 -> 实施业务线
      'dept_tech': 'BL_IMPLEMENTATION',
      'CD-TEC': 'BL_IMPLEMENTATION',
      'BJ-TEC': 'BL_IMPLEMENTATION',
      
      // 销售部门 -> 售前业务线
      'dept_sales': 'BL_PRESALES',
      'SALES': 'BL_PRESALES',
      
      // 市场部门 -> 市场业务线
      'dept_market': 'BL_MARKET',
      'MARKET': 'BL_MARKET',
      
      // 运营部门 -> 运营业务线
      'dept_operations': 'BL_OPERATIONS',
      'OPS': 'BL_OPERATIONS'
    }

    // 4. 默认业务线（实施线，权重最大）
    const defaultBusinessLine = businessLines.find(bl => bl.code === 'BL_IMPLEMENTATION') || businessLines[0]

    // 5. 批量分配
    let assignedCount = 0
    const assignments = []

    for (const emp of employeesWithoutBL) {
      // 根据部门代码匹配业务线
      let businessLineCode = null
      
      for (const [deptKey, blCode] of Object.entries(matchingRules)) {
        if (emp.department_code?.includes(deptKey) || emp.department_name?.includes(deptKey)) {
          businessLineCode = blCode
          break
        }
      }

      // 如果没有匹配到，使用默认业务线
      if (!businessLineCode) {
        businessLineCode = defaultBusinessLine.code
      }

      const businessLine = businessLines.find(bl => bl.code === businessLineCode)

      if (businessLine) {
        assignments.push({
          employeeId: emp.id,
          employeeName: emp.name,
          employeeNo: emp.employee_no,
          departmentName: emp.department_name,
          businessLineId: businessLine.id,
          businessLineName: businessLine.name,
          businessLineCode: businessLine.code
        })
      }
    }

    // 6. 确认分配方案
    console.log('=== 分配方案预览 ===')
    assignments.forEach(a => {
      console.log(`${a.employeeNo.padEnd(15)} | ${a.employeeName.padEnd(10)} | ${a.departmentName?.padEnd(10) || '未知'.padEnd(10)} -> ${a.businessLineName}`)
    })

    console.log(`\n共 ${assignments.length} 个员工将被分配业务线`)
    console.log('\n开始执行分配...\n')

    // 7. 执行更新
    for (const assignment of assignments) {
      await db.query(
        'UPDATE employees SET business_line_id = ? WHERE id = ?',
        [assignment.businessLineId, assignment.employeeId]
      )
      assignedCount++
      console.log(`✅ ${assignment.employeeNo} ${assignment.employeeName} -> ${assignment.businessLineName}`)
    }

    console.log(`\n=== 分配完成 ===`)
    console.log(`✅ 成功为 ${assignedCount} 个员工分配业务线`)

    // 8. 验证结果
    const stillWithoutBL = await db.query(`
      SELECT COUNT(*) as count
      FROM employees
      WHERE status = 1
        AND (business_line_id IS NULL OR business_line_id = '')
        AND employee_no != 'EMP_ADMIN'
    `)

    console.log(`\n剩余未分配业务线的员工: ${stillWithoutBL[0].count} 个`)

  } catch (error) {
    console.error('❌ 分配业务线失败:', error)
    throw error
  }
}

// 执行脚本
assignBusinessLines()
  .then(() => {
    console.log('\n✅ 脚本执行完成')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ 脚本执行失败:', err)
    process.exit(1)
  })
