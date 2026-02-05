/**
 * 创建项目里程碑和执行跟踪相关数据库表
 * 遵循MySQL规范，使用snake_case命名
 */

const mysql = require('mysql2/promise')

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'bonus_system'
}

async function createMilestoneTables() {
  let connection

  try {
    console.log('🚀 开始创建里程碑和执行跟踪表...\n')
    
    connection = await mysql.createConnection(mysqlConfig)
    console.log('✅ MySQL连接成功\n')

    // 1. 创建项目里程碑表
    console.log('📝 创建 project_milestones 表...')
    const createMilestonesTable = `
      CREATE TABLE IF NOT EXISTS project_milestones (
        id VARCHAR(50) COLLATE utf8mb4_unicode_ci PRIMARY KEY COMMENT '里程碑ID',
        project_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
        name VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑名称',
        description TEXT COLLATE utf8mb4_unicode_ci COMMENT '里程碑描述',
        target_date DATE NOT NULL COMMENT '目标完成日期',
        completion_date DATE COMMENT '实际完成日期',
        status VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '状态：pending-待开始，in_progress-进行中，completed-已完成，delayed-延期，cancelled-已取消',
        progress INT DEFAULT 0 COMMENT '完成进度(0-100)',
        deliverables TEXT COLLATE utf8mb4_unicode_ci COMMENT '交付成果',
        dependencies VARCHAR(500) COLLATE utf8mb4_unicode_ci COMMENT '依赖的里程碑ID列表（JSON格式）',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        created_by VARCHAR(50) COLLATE utf8mb4_unicode_ci COMMENT '创建人ID',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_project_id (project_id),
        INDEX idx_status (status),
        INDEX idx_target_date (target_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑表';
    `
    
    await connection.query(createMilestonesTable)
    console.log('✅ project_milestones 表创建成功\n')

    // 2. 创建项目执行跟踪表
    console.log('📝 创建 project_executions 表...')
    const createExecutionsTable = `
      CREATE TABLE IF NOT EXISTS project_executions (
        id VARCHAR(50) COLLATE utf8mb4_unicode_ci PRIMARY KEY COMMENT '执行记录ID',
        project_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE COMMENT '项目ID',
        overall_progress INT DEFAULT 0 COMMENT '整体进度(0-100)',
        budget_usage DECIMAL(15,2) DEFAULT 0 COMMENT '预算使用金额',
        cost_overrun DECIMAL(15,2) DEFAULT 0 COMMENT '成本超支金额',
        schedule_variance INT DEFAULT 0 COMMENT '进度偏差（天数，负数表示延期）',
        quality_score INT DEFAULT 0 COMMENT '质量评分(0-100)',
        risk_level VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT 'low' COMMENT '风险等级：low-低，medium-中，high-高，critical-紧急',
        team_performance JSON COMMENT '团队表现数据',
        last_updated_by VARCHAR(50) COLLATE utf8mb4_unicode_ci COMMENT '最后更新人ID',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_project_id (project_id),
        INDEX idx_risk_level (risk_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目执行跟踪表';
    `
    
    await connection.query(createExecutionsTable)
    console.log('✅ project_executions 表创建成功\n')

    // 3. 创建项目进度日志表
    console.log('📝 创建 project_progress_logs 表...')
    const createProgressLogsTable = `
      CREATE TABLE IF NOT EXISTS project_progress_logs (
        id VARCHAR(50) COLLATE utf8mb4_unicode_ci PRIMARY KEY COMMENT '日志ID',
        project_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目ID',
        milestone_id VARCHAR(50) COLLATE utf8mb4_unicode_ci COMMENT '关联的里程碑ID',
        progress_type VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '进度类型：milestone-里程碑，cost-成本，quality-质量，risk-风险',
        description TEXT COLLATE utf8mb4_unicode_ci COMMENT '进度描述',
        progress_value INT COMMENT '进度数值',
        old_value INT COMMENT '变更前的值',
        new_value INT COMMENT '变更后的值',
        logged_by VARCHAR(50) COLLATE utf8mb4_unicode_ci COMMENT '记录人ID',
        logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (milestone_id) REFERENCES project_milestones(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_progress_type (progress_type),
        INDEX idx_logged_at (logged_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目进度日志表';
    `
    
    await connection.query(createProgressLogsTable)
    console.log('✅ project_progress_logs 表创建成功\n')

    // 验证表是否创建成功
    console.log('='.repeat(70))
    console.log('📊 验证表结构...')
    console.log('='.repeat(70))
    
    const tables = ['project_milestones', 'project_executions', 'project_progress_logs']
    
    for (const table of tables) {
      const [columns] = await connection.query(`DESCRIBE ${table}`)
      console.log(`\n${table} (${columns.length} 个字段):`)
      columns.forEach(col => {
        console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`)
      })
    }

    console.log('\n' + '='.repeat(70))
    console.log('✨ 所有表创建成功！')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('❌ 创建表失败:', error.message)
    
    // 提供更详细的错误信息
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('数据库连接权限错误，请检查用户名和密码')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('数据库不存在，请先创建 bonus_system 数据库')
    } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.error('表已存在，跳过创建')
    }
    
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 MySQL连接已关闭')
    }
  }
}

// 执行创建
if (require.main === module) {
  createMilestoneTables()
    .then(() => {
      console.log('\n✅ 数据库表创建完成!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 数据库表创建失败:', error)
      process.exit(1)
    })
}

module.exports = { createMilestoneTables }
