/**
 * 执行三维奖金计算
 * 直接调用后端服务进行2025Q1奖金池的三维计算
 */
const { databaseManager } = require('../src/config/database')
const databaseService = require('../src/services/databaseService')
const threeDimensionalCalculationService = require('../src/services/threeDimensionalCalculationService')

async function calculateThreeDimensional() {
  try {
    console.log('🔄 连接数据库...')
    await databaseManager.initialize()
    
    // 初始化 databaseService
    await databaseService.initialize(databaseManager)
    
    const poolId = 'cymzGWfShBkjcwps'
    const period = '2025Q1'
    
    console.log(`\n📊 开始执行三维奖金计算`)
    console.log('=' .repeat(60))
    console.log(`奖金池ID: ${poolId}`)
    console.log(`计算期间: ${period}`)
    
    // 检查奖金池
    const pool = await databaseService.findOne('bonusPools', { _id: poolId })
    if (!pool) {
      throw new Error('奖金池不存在')
    }
    
    console.log(`\n✅ 找到奖金池:`)
    console.log(`   总利润: ¥${parseFloat(pool.totalProfit).toLocaleString('zh-CN')}`)
    console.log(`   奖金池金额: ¥${parseFloat(pool.poolAmount).toLocaleString('zh-CN')}`)
    console.log(`   可分配金额: ¥${parseFloat(pool.distributableAmount).toLocaleString('zh-CN')}`)
    console.log(`   当前状态: ${pool.status}`)
    
    // 查找分配规则或权重配置
    const weightConfigs = await databaseService.find('threeDimensionalWeightConfigs', { 
      status: 'active'
    })
    
    if (!weightConfigs || weightConfigs.length === 0) {
      throw new Error('未找到可用的三维权重配置')
    }
    
    const weightConfig = weightConfigs[0]
    console.log(`\n✅ 使用权重配置: ${weightConfig.configName || '默认配置'}`)
    console.log(`   利润权重: ${(weightConfig.profitWeight * 100).toFixed(1)}%`)
    console.log(`   岗位权重: ${(weightConfig.positionWeight * 100).toFixed(1)}%`)
    console.log(`   绩效权重: ${(weightConfig.performanceWeight * 100).toFixed(1)}%`)
    
    // 获取所有在职员工
    const employees = await databaseManager.query(`
      SELECT id, name, employee_no
      FROM employees
      WHERE status = 1
      ORDER BY employee_no
    `)
    
    console.log(`\n✅ 找到 ${employees.length} 名在职员工`)
    
    // 执行三维计算
    console.log(`\n🎯 开始批量执行三维奖金分配...`)
    console.log('=' .repeat(60))
    
    const employeeIds = employees.map(emp => emp.id)
    const results = await threeDimensionalCalculationService.batchCalculateScores(
      employeeIds,
      period,
      weightConfig._id,
      {
        bonusPoolId: poolId,
        distributableAmount: parseFloat(pool.distributableAmount),
        createdBy: 'DZaqxd5FxFvLIiFO'
      }
    )
    
    console.log(`\n✅ 三维计算完成！`)
    console.log('=' .repeat(60))
    console.log(`\n📋 计算结果摘要:`)
    console.log(`   参与员工: ${result.summary.totalEmployees} 人`)
    console.log(`   总分配金额: ¥${result.summary.totalAllocated.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`   平均奖金: ¥${result.summary.averageBonus.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`   最高奖金: ¥${result.summary.maxBonus.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`   最低奖金: ¥${result.summary.minBonus.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    console.log(`   剩余金额: ¥${result.summary.remainingAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    
    // 按业务线统计
    if (result.summary.distribution && result.summary.distribution.byDepartment) {
      console.log(`\n📊 部门分布:`)
      const deptDist = result.summary.distribution.byDepartment
      Object.keys(deptDist).forEach(dept => {
        const data = deptDist[dept]
        console.log(`   ${dept}: ${data.count}人, ¥${data.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`)
      })
    }
    
    // 显示前10名员工
    console.log(`\n👥 奖金前10名员工:`)
    console.log('─'.repeat(80))
    const topEmployees = result.results
      .sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount))
      .slice(0, 10)
    
    topEmployees.forEach((emp, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${emp.employeeName.padEnd(15)} ` +
        `¥${parseFloat(emp.totalAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2 }).padStart(12)} ` +
        `(利润${emp.profitContribution.toFixed(0)} + 岗位${emp.positionValue.toFixed(2)} + 绩效${emp.performanceScore.toFixed(2)})`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 三维奖金计算完成！数据已保存到数据库。')
    console.log('\n💡 提示:')
    console.log('  - 您可以在前端"奖金计算"页面查看详细结果')
    console.log('  - 每个员工的奖金已根据利润贡献、岗位价值、绩效评价三维计算')
    console.log('  - 分配记录已保存到 bonus_allocation_results 表')
    
  } catch (error) {
    console.error('\n❌ 计算失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await databaseManager.close()
    process.exit(0)
  }
}

calculateThreeDimensional()
