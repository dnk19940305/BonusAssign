/**
 * 重新计算指定奖金池的分配
 */
const { databaseManager } = require('../src/config/database')
const databaseService = require('../src/services/databaseService')
const projectBonusService = require('../src/services/projectBonusService')

async function recalculateBonusPool(poolId) {
  try {
    console.log('🔄 连接数据库...')
    await databaseManager.initialize()
    
    // 初始化 databaseService
    await databaseService.initialize(databaseManager)
    
    console.log(`\n📊 开始重新计算奖金池: ${poolId}`)
    console.log('=' .repeat(60))
    
    // 清理旧的分配记录
    console.log('🧹 清理旧的奖金分配记录...')
    try {
      const oldAllocations = await databaseService.find('projectBonusAllocations', { poolId })
      if (oldAllocations && oldAllocations.length > 0) {
        console.log(`  发现 ${oldAllocations.length} 条旧记录，标记为已删除`)
        await databaseService.update(
          'projectBonusAllocations',
          { poolId },
          { status: 'deleted', deletedAt: new Date() }
        )
        console.log('  ✅ 旧记录清理完成')
      } else {
        console.log('  无需清理，没有找到旧记录')
      }
    } catch (cleanError) {
      console.warn('  ⚠️  清理旧记录时出错:', cleanError.message)
    }
    
    const result = await projectBonusService.calculateProjectBonus(poolId)
    
    console.log('\n✅ 奖金计算完成!')
    console.log('=' .repeat(60))
    console.log('\n📋 计算结果摘要:')
    console.log(`  项目ID: ${result.projectId}`)
    console.log(`  期间: ${result.period}`)
    console.log(`  奖金池总额: ¥${result.totalAmount.toLocaleString()}`)
    console.log(`  已分配总额: ¥${result.totalAllocated.toLocaleString()}`)
    console.log(`  成员人数: ${result.memberCount}`)
    
    console.log('\n👥 成员奖金分配明细:')
    console.log('-'.repeat(60))
    
    for (const allocation of result.allocations) {
      console.log(`  ${allocation.employeeName || '员工' + allocation.employeeId}`)
      console.log(`    角色: ${allocation.roleName || allocation.roleId}`)
      console.log(`    角色权重: ${allocation.roleWeight}`)
      console.log(`    绩效系数: ${allocation.performanceCoeff}`)
      console.log(`    参与比例: ${(allocation.participationRatio * 100).toFixed(1)}%`)
      console.log(`    奖金金额: ¥${allocation.bonusAmount.toLocaleString()}`)
      console.log(`    状态: ${allocation.status}`)
      console.log('')
    }
    
    console.log('\n📈 统计信息:')
    console.log(`  有效成员数: ${result.summary.validMembers}`)
    console.log(`  总权重: ${result.summary.totalWeight.toFixed(2)}`)
    console.log(`  平均奖金: ¥${result.summary.averageBonus.toFixed(2)}`)
    console.log(`  最高奖金: ¥${result.summary.maxBonus.toFixed(2)}`)
    console.log(`  最低奖金: ¥${result.summary.minBonus.toFixed(2)}`)
    
    await databaseManager.close()
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ 计算失败:', error.message)
    console.error(error.stack)
    
    try {
      await databaseManager.close()
    } catch (closeError) {
      // 忽略关闭错误
    }
    
    process.exit(1)
  }
}

// 从命令行参数获取奖金池ID
const poolId = process.argv[2] || 'TqWYmqvLIWHL6ODv'

console.log('\n' + '='.repeat(60))
console.log('  项目奖金池重新计算工具')
console.log('='.repeat(60))

recalculateBonusPool(poolId)
