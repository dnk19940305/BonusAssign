/**
 * 检查员工业务线关联情况
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const { databaseManager } = require('../src/config/database')

async function checkEmployeeBusinessLines() {
  try {
    console.log('🔍 开始检查员工业务线关联...\n')
    
    await databaseManager.initialize()
    console.log('✅ 数据库连接成功\n')

    // 查询所有活跃员工及其业务线关联
    const employees = await databaseManager.query(`
      SELECT 
        e.id,
        e.name,
        e.employee_no,
        e.business_line_id as employee_line_id,
        e.department_id,
        d.name as department_name,
        d.line_id as dept_line_id,
        bl_emp.name as direct_business_line,
        bl_dept.name as dept_business_line
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN business_lines bl_emp ON e.business_line_id = bl_emp.id
      LEFT JOIN business_lines bl_dept ON d.line_id = bl_dept.id
      WHERE e.status = 1
      ORDER BY e.name
    `)

    console.log(`📊 共查询到 ${employees.length} 名活跃员工\n`)

    // 统计分类
    let directCount = 0
    let deptCount = 0
    let noneCount = 0
    const noLineEmployees = []

    employees.forEach(emp => {
      if (emp.direct_business_line) {
        directCount++
        console.log(`✅ ${emp.name} (${emp.employee_no}): 直接关联 -> ${emp.direct_business_line}`)
      } else if (emp.dept_business_line) {
        deptCount++
        console.log(`🔗 ${emp.name} (${emp.employee_no}): 部门关联 (${emp.department_name}) -> ${emp.dept_business_line}`)
      } else {
        noneCount++
        noLineEmployees.push(emp)
        console.log(`❌ ${emp.name} (${emp.employee_no}): 无业务线 (部门: ${emp.department_name || '未分配'})`)
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('📈 统计汇总:')
    console.log(`  直接关联业务线: ${directCount} 人`)
    console.log(`  通过部门关联: ${deptCount} 人`)
    console.log(`  无业务线关联: ${noneCount} 人`)
    console.log('='.repeat(60))

    if (noLineEmployees.length > 0) {
      console.log('\n⚠️ 无业务线关联的员工详情:')
      for (const emp of noLineEmployees) {
        console.log(`\n  员工: ${emp.name} (${emp.employee_no})`)
        console.log(`  部门ID: ${emp.department_id || 'null'}`)
        console.log(`  部门名称: ${emp.department_name || '未分配'}`)
        console.log(`  员工业务线ID: ${emp.employee_line_id || 'null'}`)
        console.log(`  部门业务线ID: ${emp.dept_line_id || 'null'}`)
      }

      console.log('\n💡 建议:')
      console.log('  1. 为这些员工直接分配业务线 (employees.business_line_id)')
      console.log('  2. 或为他们所在部门分配业务线 (departments.line_id)')
    }

  } catch (error) {
    console.error('\n❌ 检查失败:', error.message)
    console.error('错误详情:', error)
  } finally {
    if (databaseManager.connection) {
      await databaseManager.connection.end()
      console.log('\n🔒 数据库连接已关闭')
    }
    process.exit(0)
  }
}

checkEmployeeBusinessLines()
