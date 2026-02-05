const path = require('path')
const databaseService = require(path.join(__dirname, '../src/services/databaseService'))

async function cleanBonusAllocations() {
  try {
    // 初始化数据库连接
    await databaseService.initialize()
    
    console.log('=== 查看当前奖金池和分配记录 ===\n')
    
    // 1. 查看所有奖金池
    const pools = await databaseService.query(`
      SELECT 
        pbp.*,
        p.name as project_name,
        p.code as project_code,
        (SELECT COUNT(*) FROM project_bonus_allocations WHERE pool_id = pbp.id) as allocation_count
      FROM project_bonus_pools pbp
      LEFT JOIN projects p ON pbp.project_id = p.id
      ORDER BY pbp.created_at DESC
    `)
    
    console.log('📊 当前所有奖金池：')
    pools.forEach((pool, index) => {
      console.log(`\n${index + 1}. 奖金池ID: ${pool.id}`)
      console.log(`   项目: ${pool.project_name} (${pool.project_code})`)
      console.log(`   期间: ${pool.period}`)
      console.log(`   总额: ${pool.total_amount}`)
      console.log(`   状态: ${pool.status}`)
      console.log(`   分配记录数: ${pool.allocation_count}`)
      console.log(`   创建时间: ${pool.created_at}`)
    })
    
    // 2. 查看所有分配记录
    const allocations = await databaseService.query(`
      SELECT 
        pba.*,
        e.name as employee_name,
        pr.code as role_code,
        pr.name as role_name
      FROM project_bonus_allocations pba
      LEFT JOIN employees e ON pba.employee_id = e.id
      LEFT JOIN project_roles pr ON pba.role_id = pr.id
      ORDER BY pba.created_at DESC
    `)
    
    console.log('\n\n💰 当前所有分配记录：')
    allocations.forEach((alloc, index) => {
      console.log(`\n${index + 1}. 分配ID: ${alloc.id}`)
      console.log(`   奖金池ID: ${alloc.pool_id}`)
      console.log(`   员工: ${alloc.employee_name}`)
      console.log(`   角色: ${alloc.role_name} (${alloc.role_code})`)
      console.log(`   角色权重: ${alloc.role_weight}`)
      console.log(`   奖金金额: ${alloc.bonus_amount}`)
      console.log(`   创建时间: ${alloc.created_at}`)
    })
    
    console.log('\n\n=== 操作选项 ===')
    console.log('请确认您要执行的操作：')
    console.log('1. 删除所有奖金池和分配记录（清空）')
    console.log('2. 仅删除状态为"calculated"的奖金池和对应分配记录')
    console.log('3. 仅删除所有分配记录（保留奖金池，将状态改为pending）')
    console.log('4. 手动指定要删除的奖金池ID')
    console.log('\n请修改脚本中的 ACTION 变量来选择操作')
    
    // ====== 配置区域 ======
    // 修改这里来选择要执行的操作
    const ACTION = 'DELETE_ALL' // 可选值: 'DELETE_ALL', 'DELETE_CALCULATED', 'DELETE_ALLOCATIONS_ONLY', 'DELETE_BY_IDS', 'SHOW_ONLY'
    const POOL_IDS_TO_DELETE = [] // 如果 ACTION='DELETE_BY_IDS'，在这里填写要删除的奖金池ID数组
    // =====================
    
    if (ACTION === 'SHOW_ONLY') {
      console.log('\n当前为查看模式，不执行删除操作')
      console.log('如需删除，请修改脚本中的 ACTION 变量')
      process.exit(0)
    }
    
    if (ACTION === 'DELETE_ALL') {
      console.log('\n⚠️  准备删除所有奖金池和分配记录...')
      
      // 删除所有分配记录
      const allocResult = await databaseService.query('DELETE FROM project_bonus_allocations')
      console.log(`✅ 已删除 ${allocResult.affectedRows} 条分配记录`)
      
      // 删除所有奖金池
      const poolResult = await databaseService.query('DELETE FROM project_bonus_pools')
      console.log(`✅ 已删除 ${poolResult.affectedRows} 个奖金池`)
    }
    
    if (ACTION === 'DELETE_CALCULATED') {
      console.log('\n⚠️  准备删除状态为"calculated"的奖金池和对应分配记录...')
      
      const calculatedPools = pools.filter(p => p.status === 'calculated')
      console.log(`找到 ${calculatedPools.length} 个状态为 calculated 的奖金池`)
      
      for (const pool of calculatedPools) {
        // 删除该奖金池的分配记录
        const allocResult = await databaseService.query(
          'DELETE FROM project_bonus_allocations WHERE pool_id = ?',
          [pool.id]
        )
        console.log(`✅ 删除奖金池 ${pool.id} 的 ${allocResult.affectedRows} 条分配记录`)
        
        // 删除奖金池
        await databaseService.query('DELETE FROM project_bonus_pools WHERE id = ?', [pool.id])
        console.log(`✅ 删除奖金池 ${pool.id}`)
      }
    }
    
    if (ACTION === 'DELETE_ALLOCATIONS_ONLY') {
      console.log('\n⚠️  准备删除所有分配记录，并将奖金池状态重置为pending...')
      
      // 删除所有分配记录
      const allocResult = await databaseService.query('DELETE FROM project_bonus_allocations')
      console.log(`✅ 已删除 ${allocResult.affectedRows} 条分配记录`)
      
      // 将所有奖金池状态改为pending
      const poolResult = await databaseService.query(
        "UPDATE project_bonus_pools SET status = 'pending'"
      )
      console.log(`✅ 已将 ${poolResult.affectedRows} 个奖金池状态重置为pending`)
    }
    
    if (ACTION === 'DELETE_BY_IDS') {
      if (POOL_IDS_TO_DELETE.length === 0) {
        console.log('\n⚠️  未指定要删除的奖金池ID，请在 POOL_IDS_TO_DELETE 数组中添加')
        process.exit(0)
      }
      
      console.log(`\n⚠️  准备删除指定的 ${POOL_IDS_TO_DELETE.length} 个奖金池和对应分配记录...`)
      
      for (const poolId of POOL_IDS_TO_DELETE) {
        // 删除该奖金池的分配记录
        const allocResult = await databaseService.query(
          'DELETE FROM project_bonus_allocations WHERE pool_id = ?',
          [poolId]
        )
        console.log(`✅ 删除奖金池 ${poolId} 的 ${allocResult.affectedRows} 条分配记录`)
        
        // 删除奖金池
        await databaseService.query('DELETE FROM project_bonus_pools WHERE id = ?', [poolId])
        console.log(`✅ 删除奖金池 ${poolId}`)
      }
    }
    
    console.log('\n✅ 操作完成')
    process.exit(0)
    
  } catch (error) {
    console.error('操作失败:', error)
    process.exit(1)
  }
}

cleanBonusAllocations()
