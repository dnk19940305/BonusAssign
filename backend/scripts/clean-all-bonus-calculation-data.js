/**
 * 清理所有奖金计算相关数据（危险操作）
 * 警告：此脚本会删除所有奖金计算、分配、三维计算结果等数据，请谨慎使用！
 *
 * 清理范围：
 * 1. 公司级奖金池和计算结果
 * 2. 项目级奖金池和分配记录
 * 3. 三维计算结果
 * 4. 业务线奖金分配
 * 5. 员工奖金记录
 * 6. 计算历史记录
 */
const path = require('path')
const databaseService = require(path.join(__dirname, '../src/services/databaseService'))

async function cleanAllBonusCalculationData() {
  try {
    // 初始化数据库连接
    await databaseService.initialize()

    console.log('=== 查看当前奖金计算数据 ===\n')

    // 1. 查看公司级奖金池
    const companyBonusPools = await databaseService.query(`
      SELECT
        bp.*,
        (SELECT COUNT(*) FROM three_dimensional_calculation_results
         WHERE bonus_pool_id COLLATE utf8mb4_unicode_ci = bp.id COLLATE utf8mb4_unicode_ci) as calculation_count
      FROM bonus_pools bp
      ORDER BY bp.created_at DESC
    `)

    console.log('📊 公司级奖金池：')
    if (companyBonusPools.length === 0) {
      console.log('  无数据')
    } else {
      companyBonusPools.forEach((pool, index) => {
        console.log(`\n${index + 1}. 奖金池ID: ${pool.id}`)
        console.log(`   期间: ${pool.period}`)
        console.log(`   总利润: ${pool.total_profit || 0}`)
        console.log(`   奖金池金额: ${pool.pool_amount || 0}`)
        console.log(`   可分配金额: ${pool.distributable_amount || 0}`)
        console.log(`   状态: ${pool.status}`)
        console.log(`   三维计算记录数: ${pool.calculation_count}`)
        console.log(`   创建时间: ${pool.created_at}`)
      })
    }

    // 2. 查看三维计算结果
    const threeDimensionalResults = await databaseService.query(`
      SELECT COUNT(*) as count FROM three_dimensional_calculation_results
    `)
    console.log(`\n\n🧮 三维计算结果总数: ${threeDimensionalResults[0].count}`)

    // 3. 查看项目级奖金池
    const projectBonusPools = await databaseService.query(`
      SELECT
        pbp.*,
        p.name as project_name,
        p.code as project_code,
        (SELECT COUNT(*) FROM project_bonus_allocations
         WHERE pool_id COLLATE utf8mb4_unicode_ci = pbp.id COLLATE utf8mb4_unicode_ci) as allocation_count
      FROM project_bonus_pools pbp
      LEFT JOIN projects p ON pbp.project_id COLLATE utf8mb4_unicode_ci = p.id COLLATE utf8mb4_unicode_ci
      ORDER BY pbp.created_at DESC
    `)

    console.log(`\n\n💼 项目级奖金池：`)
    if (projectBonusPools.length === 0) {
      console.log('  无数据')
    } else {
      projectBonusPools.forEach((pool, index) => {
        console.log(`\n${index + 1}. 奖金池ID: ${pool.id}`)
        console.log(`   项目: ${pool.project_name} (${pool.project_code})`)
        console.log(`   期间: ${pool.period}`)
        console.log(`   总金额: ${pool.total_amount || 0}`)
        console.log(`   状态: ${pool.status}`)
        console.log(`   分配记录数: ${pool.allocation_count}`)
        console.log(`   创建时间: ${pool.created_at}`)
      })
    }

    // 4. 查看项目奖金分配记录
    const projectAllocations = await databaseService.query(`
      SELECT COUNT(*) as count FROM project_bonus_allocations
    `)
    console.log(`\n\n💰 项目奖金分配记录总数: ${projectAllocations[0].count}`)

    // 5. 查看业务线奖金分配
    const lineAllocations = await databaseService.query(`
      SELECT COUNT(*) as count FROM line_bonus_allocations
    `)
    console.log(`📈 业务线奖金分配记录总数: ${lineAllocations[0].count}`)

    // 6. 查看员工奖金记录
    const employeeBonusRecords = await databaseService.query(`
      SELECT COUNT(*) as count FROM employee_bonus_records
    `)
    console.log(`👤 员工奖金记录总数: ${employeeBonusRecords[0].count}`)

    // 7. 查看奖金分配结果
    const bonusAllocationResults = await databaseService.query(`
      SELECT COUNT(*) as count FROM bonus_allocation_results
    `)
    console.log(`📋 奖金分配结果总数: ${bonusAllocationResults[0].count}`)

    // 8. 查看计算历史
    const calculationHistory = await databaseService.query(`
      SELECT COUNT(*) as count FROM project_bonus_calculation_history
    `)
    console.log(`📜 计算历史记录总数: ${calculationHistory[0].count}`)

    console.log('\n\n=== 数据统计汇总 ===')
    const totalRecords =
      companyBonusPools.length +
      threeDimensionalResults[0].count +
      projectBonusPools.length +
      projectAllocations[0].count +
      lineAllocations[0].count +
      employeeBonusRecords[0].count +
      bonusAllocationResults[0].count +
      calculationHistory[0].count

    console.log(`📊 总记录数: ${totalRecords}`)
    console.log(`   - 公司级奖金池: ${companyBonusPools.length}`)
    console.log(`   - 三维计算结果: ${threeDimensionalResults[0].count}`)
    console.log(`   - 项目级奖金池: ${projectBonusPools.length}`)
    console.log(`   - 项目奖金分配: ${projectAllocations[0].count}`)
    console.log(`   - 业务线奖金分配: ${lineAllocations[0].count}`)
    console.log(`   - 员工奖金记录: ${employeeBonusRecords[0].count}`)
    console.log(`   - 奖金分配结果: ${bonusAllocationResults[0].count}`)
    console.log(`   - 计算历史记录: ${calculationHistory[0].count}`)

    console.log('\n\n=== 操作选项 ===')
    console.log('⚠️⚠️⚠️  警告：以下操作将删除所有奖金计算相关数据，无法恢复！')
    console.log('1. 删除所有奖金计算数据（完全清空）')
    console.log('2. 仅删除公司级奖金池和三维计算结果')
    console.log('3. 仅删除项目级奖金池和分配记录')
    console.log('4. 仅删除指定期间的数据')
    console.log('5. 仅查看，不执行删除')
    console.log('\n请修改脚本中的 ACTION 变量来选择操作')

    // ====== 配置区域 ======
    const ACTION = 'DELETE_ALL' // 可选值: 'DELETE_ALL', 'DELETE_COMPANY_BONUS', 'DELETE_PROJECT_BONUS', 'DELETE_BY_PERIOD', 'SHOW_ONLY'
    const PERIOD_TO_DELETE = '' // 如果 ACTION='DELETE_BY_PERIOD'，在这里填写期间（如：2025-Q1）
    // =====================

    if (ACTION === 'SHOW_ONLY') {
      console.log('\n✅ 当前为查看模式，不执行删除操作')
      console.log('如需删除，请修改脚本中的 ACTION 变量')
      process.exit(0)
    }

    if (ACTION === 'DELETE_ALL') {
      console.log('\n⚠️⚠️⚠️  准备删除所有奖金计算数据...')
      console.log('这将删除以下数据：')
      console.log('  - 公司级奖金池 (bonus_pools)')
      console.log('  - 三维计算结果 (three_dimensional_calculation_results)')
      console.log('  - 项目级奖金池 (project_bonus_pools)')
      console.log('  - 项目奖金分配 (project_bonus_allocations)')
      console.log('  - 业务线奖金分配 (line_bonus_allocations)')
      console.log('  - 员工奖金记录 (employee_bonus_records)')
      console.log('  - 奖金分配结果 (bonus_allocation_results)')
      console.log('  - 计算历史记录 (project_bonus_calculation_history)')
      console.log('')

      // 按照外键依赖顺序删除
      console.log('🗑️  开始删除...\n')

      // 1. 删除三维计算结果（依赖 bonus_pools）
      const threeDimResult = await databaseService.query('DELETE FROM three_dimensional_calculation_results')
      console.log(`✅ 已删除 ${threeDimResult.affectedRows || 0} 条三维计算结果`)

      // 2. 删除奖金分配结果（依赖 bonus_pools）
      const allocResultsResult = await databaseService.query('DELETE FROM bonus_allocation_results')
      console.log(`✅ 已删除 ${allocResultsResult.affectedRows || 0} 条奖金分配结果`)

      // 3. 删除业务线奖金分配（依赖 bonus_pools）
      const lineAllocResult = await databaseService.query('DELETE FROM line_bonus_allocations')
      console.log(`✅ 已删除 ${lineAllocResult.affectedRows || 0} 条业务线奖金分配`)

      // 4. 删除员工奖金记录（依赖 bonus_pools）
      const empBonusResult = await databaseService.query('DELETE FROM employee_bonus_records')
      console.log(`✅ 已删除 ${empBonusResult.affectedRows || 0} 条员工奖金记录`)

      // 5. 删除公司级奖金池
      const companyPoolResult = await databaseService.query('DELETE FROM bonus_pools')
      console.log(`✅ 已删除 ${companyPoolResult.affectedRows || 0} 个公司级奖金池`)

      // 6. 删除项目奖金分配记录（依赖 project_bonus_pools）
      const projectAllocResult = await databaseService.query('DELETE FROM project_bonus_allocations')
      console.log(`✅ 已删除 ${projectAllocResult.affectedRows || 0} 条项目奖金分配记录`)

      // 7. 删除项目奖金计算历史
      const historyResult = await databaseService.query('DELETE FROM project_bonus_calculation_history')
      console.log(`✅ 已删除 ${historyResult.affectedRows || 0} 条计算历史记录`)

      // 8. 删除项目级奖金池
      const projectPoolResult = await databaseService.query('DELETE FROM project_bonus_pools')
      console.log(`✅ 已删除 ${projectPoolResult.affectedRows || 0} 个项目级奖金池`)
    }

    if (ACTION === 'DELETE_COMPANY_BONUS') {
      console.log('\n⚠️  准备删除公司级奖金池和三维计算结果...')

      // 1. 删除三维计算结果
      const threeDimResult = await databaseService.query('DELETE FROM three_dimensional_calculation_results')
      console.log(`✅ 已删除 ${threeDimResult.affectedRows || 0} 条三维计算结果`)

      // 2. 删除奖金分配结果
      const allocResultsResult = await databaseService.query('DELETE FROM bonus_allocation_results')
      console.log(`✅ 已删除 ${allocResultsResult.affectedRows || 0} 条奖金分配结果`)

      // 3. 删除业务线奖金分配
      const lineAllocResult = await databaseService.query('DELETE FROM line_bonus_allocations')
      console.log(`✅ 已删除 ${lineAllocResult.affectedRows || 0} 条业务线奖金分配`)

      // 4. 删除员工奖金记录
      const empBonusResult = await databaseService.query('DELETE FROM employee_bonus_records')
      console.log(`✅ 已删除 ${empBonusResult.affectedRows || 0} 条员工奖金记录`)

      // 5. 删除公司级奖金池
      const companyPoolResult = await databaseService.query('DELETE FROM bonus_pools')
      console.log(`✅ 已删除 ${companyPoolResult.affectedRows || 0} 个公司级奖金池`)
    }

    if (ACTION === 'DELETE_PROJECT_BONUS') {
      console.log('\n⚠️  准备删除项目级奖金池和分配记录...')

      // 1. 删除项目奖金分配记录
      const projectAllocResult = await databaseService.query('DELETE FROM project_bonus_allocations')
      console.log(`✅ 已删除 ${projectAllocResult.affectedRows || 0} 条项目奖金分配记录`)

      // 2. 删除项目奖金计算历史
      const historyResult = await databaseService.query('DELETE FROM project_bonus_calculation_history')
      console.log(`✅ 已删除 ${historyResult.affectedRows || 0} 条计算历史记录`)

      // 3. 删除项目级奖金池
      const projectPoolResult = await databaseService.query('DELETE FROM project_bonus_pools')
      console.log(`✅ 已删除 ${projectPoolResult.affectedRows || 0} 个项目级奖金池`)
    }

    if (ACTION === 'DELETE_BY_PERIOD') {
      if (!PERIOD_TO_DELETE) {
        console.log('\n⚠️  未指定要删除的期间，请在 PERIOD_TO_DELETE 变量中填写')
        process.exit(0)
      }

      console.log(`\n⚠️  准备删除期间 ${PERIOD_TO_DELETE} 的所有奖金计算数据...`)

      // 1. 删除该期间的三维计算结果
      const threeDimResult = await databaseService.query(
        'DELETE FROM three_dimensional_calculation_results WHERE calculation_period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${threeDimResult.affectedRows || 0} 条三维计算结果`)

      // 2. 删除该期间的奖金分配结果
      const allocResultsResult = await databaseService.query(
        'DELETE FROM bonus_allocation_results WHERE period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${allocResultsResult.affectedRows || 0} 条奖金分配结果`)

      // 3. 删除该期间的业务线奖金分配
      const lineAllocResult = await databaseService.query(
        'DELETE FROM line_bonus_allocations WHERE period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${lineAllocResult.affectedRows || 0} 条业务线奖金分配`)

      // 4. 删除该期间的员工奖金记录
      const empBonusResult = await databaseService.query(
        'DELETE FROM employee_bonus_records WHERE period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${empBonusResult.affectedRows || 0} 条员工奖金记录`)

      // 5. 删除该期间的公司级奖金池
      const companyPoolResult = await databaseService.query(
        'DELETE FROM bonus_pools WHERE period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${companyPoolResult.affectedRows || 0} 个公司级奖金池`)

      // 6. 删除该期间的项目奖金分配记录
      const projectAllocResult = await databaseService.query(
        'DELETE FROM project_bonus_allocations WHERE pool_id IN (SELECT id FROM project_bonus_pools WHERE period = ?)',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${projectAllocResult.affectedRows || 0} 条项目奖金分配记录`)

      // 7. 删除该期间的项目级奖金池
      const projectPoolResult = await databaseService.query(
        'DELETE FROM project_bonus_pools WHERE period = ?',
        [PERIOD_TO_DELETE]
      )
      console.log(`✅ 已删除 ${projectPoolResult.affectedRows || 0} 个项目级奖金池`)
    }

    console.log('\n✅ 操作完成')
    process.exit(0)

  } catch (error) {
    console.error('❌ 操作失败:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

cleanAllBonusCalculationData()
