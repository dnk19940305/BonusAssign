/**
 * 重新计算公司级奖金池的三维分配
 */
const { databaseManager } = require('../src/config/database')
const databaseService = require('../src/services/databaseService')
const threeDimensionalService = require('../src/services/threeDimensionalCalculationService')

async function recalculateCompanyBonusPool(poolId) {
  try {
    console.log('🔄 连接数据库...')
    await databaseManager.initialize()
    
    // 初始化 databaseService
    await databaseService.initialize(databaseManager)
    
    console.log(`\n📊 开始三维计算奖金池: ${poolId}`)
    console.log('=' .repeat(60))
    
    // 获取奖金池信息
    const pool = await databaseService.findOne('bonusPools', { _id: poolId })
    if (!pool) {
      throw new Error(`未找到奖金池: ${poolId}`)
    }
    
    console.log(`\n奖金池信息:`)
    console.log(`  期间: ${pool.period}`)
    console.log(`  类型: ${pool.periodType || 'quarterly'}`)
    console.log(`  总金额: ¥${(pool.poolAmount || pool.pool_amount || 0).toLocaleString()}`)
    console.log(`  可分配: ¥${(pool.distributableAmount || pool.distributable_amount || pool.pool_amount || pool.poolAmount || 0).toLocaleString()}`)
    console.log(`  当前状态: ${pool.status}`)
    
    // 修复无效业务线ID
    console.log('\n🔧 检查并修复无效业务线ID...')
    const fixResult = await databaseManager.query(`
      UPDATE employees 
      SET business_line_id = 'XJD1HavHAMpjxdl0' 
      WHERE business_line_id = 'bl_tech'
    `)
    if (fixResult.affectedRows > 0 || fixResult.changedRows > 0) {
      console.log(`✅ 已修复 ${fixResult.affectedRows || fixResult.changedRows} 名员工的无效业务线`)
    }
    
    // 查询所有在职员工
    const employees = await databaseManager.query(`
      SELECT id, name, employee_no, position_id, business_line_id
      FROM employees
      WHERE status = 1
      ORDER BY name
    `)
    
    console.log(`\n✅ 找到 ${employees.length} 名在职员工`)
    
    // 清理旧的分配记录
    console.log('\n🧹 清理旧的奖金分配记录...')
    try {
      await databaseManager.query(`
        UPDATE bonus_allocation_results
        SET status = 'deleted', updated_at = NOW()
        WHERE pool_id = ?
      `, [poolId])
      console.log('  ✅ 旧记录清理完成')
    } catch (cleanError) {
      console.warn('  ⚠️  清理旧记录时出错:', cleanError.message)
    }
    
    // 获取默认权重配置
    const weightConfig = await databaseService.findOne('threeDimensionalWeightConfigs', 
      { code: 'DEFAULT_001', status: 'active' }
    )
    if (!weightConfig) {
      throw new Error('未找到默认权重配置')
    }
    console.log(`\n✅ 使用权重配置: ${weightConfig.name} (ID: ${weightConfig._id || weightConfig.id})`)
    
    // 批量计算三维评分
    console.log('\n🔄 开始批量三维计算...')
    const results = await threeDimensionalService.batchCalculateScores(
      employees.map(e => e.id),
      pool.period,
      weightConfig._id || weightConfig.id,
      { periodType: pool.periodType || 'quarterly' }
    )
    
    console.log(`\n✅ 三维计算完成: 成功 ${results.results.length} 个，失败 ${results.errors.length} 个`)
    
    // 调试：查看前3个结果
    if (results.results.length > 0) {
      console.log('\n🔍 示例计算结果（前3个）:')
      results.results.slice(0, 3).forEach((r, i) => {
        console.log(`${i+1}. 员工ID: ${r.employeeId}`)
        console.log(`   totalScore: ${r.totalScore}, adjustedScore: ${r.adjustedScore}`)
        if (r.originalScores) {
          console.log(`   利润: ${r.originalScores.profitScore?.score}, 岗位: ${r.originalScores.positionScore?.score}, 绩效: ${r.originalScores.performanceScore?.score}`)
        }
      })
    }
    
    // 计算总分和奖金分配
    const validResults = results.results.filter(r => r.totalScore > 0)
    const totalScore = validResults.reduce((sum, r) => sum + (r.adjustedScore || r.totalScore), 0)
    const allocatableAmount = parseFloat(pool.distributableAmount || pool.distributable_amount || pool.pool_amount || pool.poolAmount) || 0
    
    console.log('\n💰 开始奖金分配计算...')
    console.log(`  有效员工: ${validResults.length} 名`)
    console.log(`  总评分: ${totalScore.toFixed(2)}`)
    console.log(`  可分配金额: ¥${allocatableAmount.toLocaleString()}`)
    
    let totalAllocated = 0
    const allocations = []
    
    for (const result of validResults) {
      const employee = employees.find(e => e.id === result.employeeId)
      const finalScore = result.adjustedScore || result.totalScore
      const bonusAmount = (finalScore / totalScore) * allocatableAmount
      
      allocations.push({
        employeeId: result.employeeId,
        employeeName: employee?.name || result.employeeId,
        profitScore: result.originalScores.profitScore.score,
        positionScore: result.originalScores.positionScore.score,
        performanceScore: result.originalScores.performanceScore.score,
        totalScore: result.totalScore,
        adjustedScore: result.adjustedScore,
        bonusRatio: finalScore / totalScore,
        bonusAmount: bonusAmount
      })
      
      totalAllocated += bonusAmount
      
      // 保存到数据库
      await databaseManager.query(`
        INSERT INTO bonus_allocation_results 
        (id, pool_id, employee_id, period, profit_score, position_score, 
         performance_score, total_score, bonus_amount, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'allocated', NOW(), NOW())
      `, [
        require('uuid').v4(),
        poolId,
        result.employeeId,
        pool.period,
        result.originalScores.profitScore.score,
        result.originalScores.positionScore.score,
        result.originalScores.performanceScore.score,
        finalScore,
        bonusAmount
      ])
    }
    
    //更新奖金池状态
    await databaseManager.query(`
      UPDATE bonus_pools 
      SET status = ?, allocated_amount = ?, updated_at = NOW()
      WHERE id = ?
    `, ['allocated', totalAllocated, poolId])
    
    console.log('\n✅ 奖金分配完成!')
    console.log('=' .repeat(60))
    console.log('\n📋 分配结果摘要:')
    console.log(`  已分配总额: ¥${totalAllocated.toLocaleString()}`)
    console.log(`  分配比例: ${(totalAllocated / allocatableAmount * 100).toFixed(2)}%`)
    console.log(`  平均奖金: ¥${(totalAllocated / validResults.length).toLocaleString()}`)
    
    console.log('\n👥 奖金分配明细（前10名）:')
    console.log('-'.repeat(90))
    
    allocations
      .sort((a, b) => b.bonusAmount - a.bonusAmount)
      .slice(0, 10)
      .forEach((alloc, index) => {
        console.log(`${index + 1}. ${alloc.employeeName}`)
        console.log(`   利润评分: ${alloc.profitScore.toFixed(2)} | 岗位评分: ${alloc.positionScore.toFixed(2)} | 绩效评分: ${alloc.performanceScore.toFixed(2)}`)
        console.log(`   总评分: ${alloc.totalScore.toFixed(2)} | 奖金比例: ${(alloc.bonusRatio * 100).toFixed(2)}% | 奖金: ¥${alloc.bonusAmount.toLocaleString()}`)
        console.log('')
      })
    
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
const poolId = process.argv[2] || 'cymzGWfShBkjcwps'

console.log('\n' + '='.repeat(60))
console.log('  公司级奖金池三维计算工具')
console.log('='.repeat(60))

recalculateCompanyBonusPool(poolId)
