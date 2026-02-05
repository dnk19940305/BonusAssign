const path = require('path')
const databaseService = require(path.join(__dirname, '../src/services/databaseService'))

async function checkAllocations() {
  try {
    // 初始化数据库连接
    await databaseService.initialize()
    
    console.log('=== 检查当前奖金分配数据 ===\n')
    
    // 1. 查看最近的奖金分配记录
    const allocations = await databaseService.query(`
      SELECT pba.*, pr.code as role_code 
      FROM project_bonus_allocations pba 
      LEFT JOIN project_roles pr ON pba.role_id = pr.id 
      ORDER BY pba.created_at DESC 
      LIMIT 10
    `)
    
    console.log('📋 最近的奖金分配记录:')
    allocations.forEach(a => {
      console.log(`  员工ID: ${a.employee_id}, 角色ID: ${a.role_id}, 角色code: ${a.role_code}, 权重: ${a.role_weight}, 金额: ${a.bonus_amount}`)
    })
    
    // 2. 查看角色权重配置
    const weights = await databaseService.query('SELECT project_id, weights FROM project_role_weights')
    
    console.log('\n⚙️  角色权重配置:')
    weights.forEach(w => {
      const weightsObj = typeof w.weights === 'string' ? JSON.parse(w.weights) : w.weights
      console.log(`  项目: ${w.project_id}`)
      console.log(`  配置: ${JSON.stringify(weightsObj, null, 2)}`)
    })
    
    // 3. 查看项目角色定义
    const roles = await databaseService.query('SELECT id, code, name FROM project_roles')
    
    console.log('\n👤 项目角色定义:')
    roles.forEach(r => {
      console.log(`  ID: ${r.id}, Code: ${r.code}, Name: ${r.name}`)
    })
    
    // 4. 检查是否有权重为2.0的PM分配记录
    const pmAllocations = await databaseService.query(`
      SELECT pba.*, pr.code as role_code, e.name as employee_name
      FROM project_bonus_allocations pba 
      LEFT JOIN project_roles pr ON pba.role_id = pr.id 
      LEFT JOIN employees e ON pba.employee_id = e.id
      WHERE pba.role_weight = 2.0
      ORDER BY pba.created_at DESC
      LIMIT 5
    `)
    
    console.log('\n⚠️  权重为2.0的分配记录（需要重新计算）:')
    if (pmAllocations.length === 0) {
      console.log('  无')
    } else {
      pmAllocations.forEach(a => {
        console.log(`  ${a.employee_name || a.employeeId} - 角色: ${a.role_code} (ID: ${a.roleId}), 权重: ${a.roleWeight}`)
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('检查失败:', error)
    process.exit(1)
  }
}

checkAllocations()
