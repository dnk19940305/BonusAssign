/**
 * 清理所有项目相关数据（危险操作）
 * 警告：此脚本会删除所有项目及相关数据，请谨慎使用！
 */
const path = require('path')
const databaseService = require(path.join(__dirname, '../src/services/databaseService'))

async function cleanAllProjectData() {
  try {
    // 初始化数据库连接
    await databaseService.initialize()

    console.log('=== 查看当前项目数据 ===\n')

    // 1. 查看所有项目
    const projects = await databaseService.query(`
      SELECT
        p.*,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM project_bonus_pools WHERE project_id = p.id) as pool_count,
        (SELECT COUNT(*) FROM project_costs WHERE project_id = p.id) as cost_count
      FROM projects p
      ORDER BY p.created_at DESC
    `)

    console.log('📊 当前所有项目：')
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. 项目ID: ${project.id}`)
      console.log(`   项目名称: ${project.name}`)
      console.log(`   项目代码: ${project.code}`)
      console.log(`   状态: ${project.status}`)
      console.log(`   预算: ${project.budget}`)
      console.log(`   成员数: ${project.member_count}`)
      console.log(`   奖金池数: ${project.pool_count}`)
      console.log(`   成本记录数: ${project.cost_count}`)
      console.log(`   创建时间: ${project.created_at}`)
    })

    console.log('\n\n=== 操作选项 ===')
    console.log('⚠️  警告：以下操作将删除项目及所有相关数据，无法恢复！')
    console.log('1. 删除所有项目及相关数据（完全清空）')
    console.log('2. 仅删除指定项目及相关数据')
    console.log('3. 仅查看，不执行删除')
    console.log('\n请修改脚本中的 ACTION 变量来选择操作')

    // ====== 配置区域 ======
    const ACTION = 'DELETE_ALL' // 可选值: 'DELETE_ALL', 'DELETE_BY_IDS', 'SHOW_ONLY'
    const PROJECT_IDS_TO_DELETE = [] // 如果 ACTION='DELETE_BY_IDS'，在这里填写要删除的项目ID数组
    // =====================

    if (ACTION === 'SHOW_ONLY') {
      console.log('\n✅ 当前为查看模式，不执行删除操作')
      console.log('如需删除，请修改脚本中的 ACTION 变量')
      process.exit(0)
    }

    if (ACTION === 'DELETE_ALL') {
      console.log('\n⚠️⚠️⚠️  准备删除所有项目及相关数据...')
      console.log('这将删除以下数据：')
      console.log('  - 项目基本信息 (projects)')
      console.log('  - 项目成员 (project_members)')
      console.log('  - 项目奖金池 (project_bonus_pools)')
      console.log('  - 项目奖金分配 (project_bonus_allocations)')
      console.log('  - 项目成本 (project_costs)')
      console.log('  - 项目里程碑 (project_milestones)')
      console.log('  - 项目角色权重 (project_role_weights)')
      console.log('  - 项目团队申请 (project_team_applications)')
      console.log('  - 项目成员个人申请 (project_applications)')
      console.log('  - 项目协作日志 (project_collaboration_logs)')
      console.log('  - 项目状态历史 (project_state_history)')
      console.log('  - 项目审批流程实例 (project_approval_instances)')
      console.log('')

      // 按照外键依赖顺序删除
      console.log('🗑️  开始删除...\n')

      // 1. 删除项目奖金分配记录
      const allocResult = await databaseService.query('DELETE FROM project_bonus_allocations')
      console.log(`✅ 已删除 ${allocResult.affectedRows || 0} 条奖金分配记录`)

      // 2. 删除项目奖金池
      const poolResult = await databaseService.query('DELETE FROM project_bonus_pools')
      console.log(`✅ 已删除 ${poolResult.affectedRows || 0} 个奖金池`)

      // 3. 删除项目成员
      const memberResult = await databaseService.query('DELETE FROM project_members')
      console.log(`✅ 已删除 ${memberResult.affectedRows || 0} 条项目成员记录`)

      // 4. 删除项目成本
      const costResult = await databaseService.query('DELETE FROM project_costs')
      console.log(`✅ 已删除 ${costResult.affectedRows || 0} 条项目成本记录`)

      // 5. 删除项目里程碑
      const milestoneResult = await databaseService.query('DELETE FROM project_milestones')
      console.log(`✅ 已删除 ${milestoneResult.affectedRows || 0} 条项目里程碑记录`)

      // 6. 删除项目审批流程实例
      const approvalInstanceResult = await databaseService.query('DELETE FROM project_approval_instances')
      console.log(`✅ 已删除 ${approvalInstanceResult.affectedRows || 0} 条项目审批流程实例`)

      // 7. 删除项目团队申请
      const teamApplicationResult = await databaseService.query('DELETE FROM project_team_applications')
      console.log(`✅ 已删除 ${teamApplicationResult.affectedRows || 0} 条项目团队申请`)

      // 8. 删除项目成员个人申请
      const memberApplicationResult = await databaseService.query('DELETE FROM project_applications')
      console.log(`✅ 已删除 ${memberApplicationResult.affectedRows || 0} 条项目成员个人申请`)

      // 9. 删除项目协作日志
      const collaborationLogResult = await databaseService.query('DELETE FROM project_collaboration_logs')
      console.log(`✅ 已删除 ${collaborationLogResult.affectedRows || 0} 条项目协作日志`)

      // 10. 删除项目状态历史
      const stateHistoryResult = await databaseService.query('DELETE FROM project_state_history')
      console.log(`✅ 已删除 ${stateHistoryResult.affectedRows || 0} 条项目状态历史`)

      // 11. 删除项目角色权重
      const weightResult = await databaseService.query('DELETE FROM project_role_weights')
      console.log(`✅ 已删除 ${weightResult.affectedRows || 0} 条项目角色权重配置`)

      // 12. 最后删除项目本身
      const projectResult = await databaseService.query('DELETE FROM projects')
      console.log(`✅ 已删除 ${projectResult.affectedRows || 0} 个项目`)
    }

    if (ACTION === 'DELETE_BY_IDS') {
      if (PROJECT_IDS_TO_DELETE.length === 0) {
        console.log('\n⚠️  未指定要删除的项目ID，请在 PROJECT_IDS_TO_DELETE 数组中添加')
        process.exit(0)
      }

      console.log(`\n⚠️  准备删除指定的 ${PROJECT_IDS_TO_DELETE.length} 个项目及相关数据...`)

      for (const projectId of PROJECT_IDS_TO_DELETE) {
        console.log(`\n🗑️  删除项目 ${projectId}...`)

        // 1. 删除项目奖金分配记录
        const allocResult = await databaseService.query(
          'DELETE FROM project_bonus_allocations WHERE pool_id IN (SELECT id FROM project_bonus_pools WHERE project_id = ?)',
          [projectId]
        )
        console.log(`  ✅ 删除 ${allocResult.affectedRows || 0} 条奖金分配记录`)

        // 2. 删除项目奖金池
        const poolResult = await databaseService.query(
          'DELETE FROM project_bonus_pools WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${poolResult.affectedRows || 0} 个奖金池`)

        // 3. 删除项目成员
        const memberResult = await databaseService.query(
          'DELETE FROM project_members WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${memberResult.affectedRows || 0} 条项目成员记录`)

        // 4. 删除项目成本
        const costResult = await databaseService.query(
          'DELETE FROM project_costs WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${costResult.affectedRows || 0} 条项目成本记录`)

        // 5. 删除项目里程碑
        const milestoneResult = await databaseService.query(
          'DELETE FROM project_milestones WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${milestoneResult.affectedRows || 0} 条项目里程碑记录`)

        // 6. 删除项目审批流程实例
        const approvalInstanceResult = await databaseService.query(
          'DELETE FROM project_approval_instances WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${approvalInstanceResult.affectedRows || 0} 条项目审批流程实例`)

        // 7. 删除项目团队申请
        const teamApplicationResult = await databaseService.query(
          'DELETE FROM project_team_applications WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${teamApplicationResult.affectedRows || 0} 条项目团队申请`)

        // 8. 删除项目成员个人申请
        const memberApplicationResult = await databaseService.query(
          'DELETE FROM project_applications WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${memberApplicationResult.affectedRows || 0} 条项目成员个人申请`)

        // 9. 删除项目协作日志
        const collaborationLogResult = await databaseService.query(
          'DELETE FROM project_collaboration_logs WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${collaborationLogResult.affectedRows || 0} 条项目协作日志`)

        // 10. 删除项目状态历史
        const stateHistoryResult = await databaseService.query(
          'DELETE FROM project_state_history WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${stateHistoryResult.affectedRows || 0} 条项目状态历史`)

        // 11. 删除项目角色权重
        const weightResult = await databaseService.query(
          'DELETE FROM project_role_weights WHERE project_id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除 ${weightResult.affectedRows || 0} 条项目角色权重配置`)

        // 12. 最后删除项目本身
        const projectResult = await databaseService.query(
          'DELETE FROM projects WHERE id = ?',
          [projectId]
        )
        console.log(`  ✅ 删除项目`)
      }
    }

    console.log('\n✅ 操作完成')
    process.exit(0)

  } catch (error) {
    console.error('❌ 操作失败:', error)
    process.exit(1)
  }
}

cleanAllProjectData()
