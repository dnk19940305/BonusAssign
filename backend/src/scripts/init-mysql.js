#!/usr/bin/env node

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

/**
 * MySQL数据库初始化脚本
 * 创建数据库、表结构，并可选择导入初始数据
 */
class MySQLInitializer {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpassword',
      database: process.env.DB_NAME || 'bonus-system',
      charset: 'utf8mb4'
    }
  }

  /**
   * 主初始化流程
   */
  async initialize(options = {}) {
    const { importData = false, dropExisting = false } = options
    
    try {
      console.log('🚀 开始初始化MySQL数据库...')
      console.log(`📍 连接配置: ${this.config.user}@${this.config.host}:${this.config.port}`)
      
      // 1. 创建数据库
      await this.createDatabase(dropExisting)
      
      // 2. 创建表结构
      await this.createTables()
      
      // 3. 导入初始数据（可选）
      if (importData) {
        await this.importInitialData()
      }
      
      console.log('✅ MySQL数据库初始化完成!')
      
    } catch (error) {
      console.error('❌ MySQL数据库初始化失败:', error.message)
      throw error
    }
  }

  /**
   * 创建数据库
   */
  async createDatabase(dropExisting = false) {
    try {
      // 连接到MySQL服务器（不指定数据库）
      const connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        charset: this.config.charset
      })

      console.log('✅ 连接到MySQL服务器成功')

      // 删除现有数据库（如果需要）
      if (dropExisting) {
        console.log(`🗑️ 删除现有数据库: ${this.config.database}`)
        await connection.execute(`DROP DATABASE IF EXISTS \`${this.config.database}\``)
      }

      // 创建数据库
      console.log(`📚 创建数据库: ${this.config.database}`)
      await connection.execute(`
        CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` 
        CHARACTER SET utf8mb4 
        COLLATE utf8mb4_unicode_ci
      `)

      await connection.end()
      console.log('✅ 数据库创建成功')

    } catch (error) {
      console.error('❌ 创建数据库失败:', error.message)
      throw error
    }
  }

  /**
   * 创建表结构
   */
  async createTables() {
    try {
      // 连接到目标数据库
      const connection = await mysql.createConnection(this.config)
      console.log(`✅ 连接到数据库: ${this.config.database}`)

      // 读取init.sql文件
      const initSqlPath = path.join(__dirname, '../../../database/init.sql')
      
      if (!fs.existsSync(initSqlPath)) {
        console.warn('⚠️ 未找到init.sql文件，跳过表结构创建')
        await connection.end()
        return
      }

      const sqlContent = fs.readFileSync(initSqlPath, 'utf8')
      console.log('📖 读取init.sql文件成功')

      // 移除注释和空白行，处理多行SQL语句
      const cleanedContent = sqlContent
        .split('\n')
        .filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 0 && 
                 !trimmed.startsWith('--') && 
                 !trimmed.toUpperCase().startsWith('USE ') &&
                 !trimmed.toUpperCase().startsWith('SET NAMES') &&
                 !trimmed.toUpperCase().startsWith('SET FOREIGN_KEY_CHECKS')
        })
        .join(' ')

      // 按分号分割SQL语句
      const allStatements = cleanedContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => 
          stmt.length > 0 && 
          !stmt.toUpperCase().startsWith('COMMIT')
        )

      console.log(`🔧 发现 ${allStatements.length} 个SQL语句`)
      console.log(`📝 所有SQL语句数量: ${allStatements.length}`)
      
      // 调试输出
      if (allStatements.length === 0) {
        console.log('🔍 调试: 前5个SQL语句:')
        allStatements.slice(0, 5).forEach((stmt, idx) => {
          console.log(`  ${idx + 1}: ${stmt.substring(0, 100)}...`)
        })
      }

      // 1. 执行建表语句
      console.log('📋 执行建表语句...')
      for (let i = 0; i < allStatements.length; i++) {
        const statement = allStatements[i]
        
        try {
          await connection.execute(statement)
          
          const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?([^`\s(]+)`?/i)
          if (tableMatch) {
            console.log(`  ✅ 创建表: ${tableMatch[1]}`)
          }
          
          const indexMatch = statement.match(/CREATE\s+INDEX\s+`?([^`\s]+)`?/i)
          if (indexMatch) {
            console.log(`  ✅ 创建索引: ${indexMatch[1]}`)
          }
          
        } catch (error) {
          // 忽略表已存在和索引已存在的错误
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?([^`\s(]+)`?/i)
            if (tableMatch) {
              console.log(`  ℹ️ 表已存在: ${tableMatch[1]}`)
            }
          } else if (error.code === 'ER_DUP_KEYNAME') {
            // 索引已存在，忽略错误
            const indexMatch = statement.match(/CREATE\s+INDEX\s+`?([^`\s]+)`?/i)
            if (indexMatch) {
              console.log(`  ℹ️ 索引已存在: ${indexMatch[1]}`)
            }
          } else {
            console.error(`❌ 建表语句执行失败 (${i + 1}/${allStatements.length}):`, error.message)
            console.error(`语句: ${statement.substring(0, 100)}...`)
            // 不抛出错误，继续执行后续语句
            console.warn('⚠️ 忽略错误，继续执行...')
          }
        }
      }

      await connection.end()
      console.log('✅ 表结构创建完成')

    } catch (error) {
      console.error('❌ 创建表结构失败:', error.message)
      throw error
    }
  }

  /**
   * 导入初始数据
   */
  async importInitialData() {
    try {
      const connection = await mysql.createConnection(this.config)
      console.log('🔧 开始导入初始数据...')

      // 读取数据文件
      const dataSqlPath = path.join(__dirname, '../../../database/bounosassign-clean.sql')
      
      if (!fs.existsSync(dataSqlPath)) {
        console.warn('⚠️ 未找到数据文件，跳过数据导入')
        await connection.end()
        return
      }

      const sqlContent = fs.readFileSync(dataSqlPath, 'utf8')
      console.log('📖 读取数据文件成功')

      // 禁用外键检查（如果支持）
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0')
      } catch (error) {
        console.warn('⚠️ 无法禁用外键检查:', error.message)
      }

      // 分割并执行INSERT语句
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => 
          stmt.length > 0 && 
          (stmt.toUpperCase().includes('INSERT') || stmt.toUpperCase().includes('DELETE'))
        )

      console.log(`🔧 开始执行 ${statements.length} 个INSERT语句...`)

      let successCount = 0
      for (const statement of statements) {
        try {
          await connection.execute(statement)
          successCount++
        } catch (error) {
          // 记录错误但继续执行
          console.warn(`⚠️ INSERT语句执行失败: ${error.message}`)
        }
      }

      // 重新启用外键检查（如果支持）
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1')
      } catch (error) {
        console.warn('⚠️ 无法启用外键检查:', error.message)
      }

      await connection.end()
      console.log(`✅ 初始数据导入完成 (成功: ${successCount}/${statements.length})`)

    } catch (error) {
      console.error('❌ 导入初始数据失败:', error.message)
      throw error
    }
  }

  /**
   * 验证数据库状态
   */
  async validateDatabase() {
    try {
      const connection = await mysql.createConnection(this.config)
      console.log('🔍 验证数据库状态...')

      // 检查主要表
      const tables = [
        'users', 'roles', 'departments', 'positions', 'employees',
        'business_lines', 'projects', 'bonus_pools'
      ]

      for (const table of tables) {
        try {
          const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`)
          console.log(`  📊 ${table}: ${rows[0].count} 条记录`)
        } catch (error) {
          console.warn(`  ❌ 表 ${table} 检查失败: ${error.message}`)
        }
      }

      await connection.end()
      console.log('✅ 数据库状态验证完成')

    } catch (error) {
      console.error('❌ 数据库状态验证失败:', error.message)
      throw error
    }
  }
}

// 命令行执行
async function main() {
  // 加载环境变量
  require('dotenv').config({ path: path.join(__dirname, '../../.env') })

  const args = process.argv.slice(2)
  const options = {
    importData: args.includes('--import-data'),
    dropExisting: args.includes('--drop-existing')
  }

  const initializer = new MySQLInitializer()

  try {
    await initializer.initialize(options)
    await initializer.validateDatabase()
    
    console.log('\\n🎉 数据库初始化完成！')
    console.log('\\n💡 使用说明:')
    console.log('  - 在.env文件中设置 DB_TYPE=mysql 来使用MySQL数据库')
    console.log('  - 启动后端服务: npm run dev')
    
  } catch (error) {
    console.error('\\n💥 初始化失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = MySQLInitializer