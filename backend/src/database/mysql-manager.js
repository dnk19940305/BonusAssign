const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

/**
 * MySQL数据库管理器
 * 提供与SQLiteManager兼容的接口，支持MySQL数据库操作
 */
class MySQLManager {
  constructor(config) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user || 'root',
      password: config.password || 'rootpassword',
      database: config.database || 'bonus_system',
      charset: 'utf8mb4',
      ...config
    }

    this.pool = null
    this.isInitialized = false

    console.log(`🔧 MySQL管理器配置:`)
    console.log(`   主机: ${this.config.host}:${this.config.port}`)
    console.log(`   数据库: ${this.config.database}`)
    console.log(`   用户: ${this.config.user}`)
  }

  /**
   * 初始化MySQL连接池
   */
  async initialize() {
    try {
      console.log('🚀 开始初始化MySQL连接池...')

      // 创建连接池
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // 设置时区
        timezone: '+08:00'
      })

      // 测试连接
      await this.testConnection()

      this.isInitialized = true
      console.log('✅ MySQL连接池初始化成功!')

    } catch (error) {
      console.error('❌ MySQL连接池初始化失败:', error.message)
      throw error
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    try {
      const connection = await this.pool.getConnection()
      // 设置连接字符集
      await connection.query("SET NAMES 'utf8mb4'")
      await connection.query("SET CHARACTER SET utf8mb4")
      await connection.ping()
      connection.release()
    } catch (error) {
      console.error('❌ MySQL数据库连接测试失败:', error.message)
      throw error
    }
  }

  /**
   * 执行SQL查询
   */
  async query(sql, params = []) {
    try {
      // 过滤掉参数中的 undefined 值，将其转换为 null
      // 并确保数值参数是 Number 类型
      // 但要避免对ID字段的转换，因为某些表的ID是VARCHAR类型
      const filteredParams = params.map((param, index) => {
        if (param === undefined) return null;
        
        // 检查是否是UPDATE或DELETE语句的WHERE子句中的ID字段
        // 如果SQL语句是UPDATE table SET ... WHERE id = ? 或 DELETE FROM table WHERE id = ?
        const isIdFieldInWhere = /\b(UPDATE|DELETE)\b/i.test(sql) && 
                                 /\bWHERE\s+.*\b(id|`id`)\s*=\s*\?/i.test(sql) &&
                                 index === params.length - 1; // 最后一个参数通常是WHERE子句的值
        
        // 如果是WHERE子句中的ID字段，保持原类型
        if (isIdFieldInWhere) {
          return param;
        }
        
        // ⚠️ 检查是否为期间相关字段（奖金池、绩效记录等的期间字段）
        // 期间字段的值可能是 '2025' 或 '2025Q4'，必须保持字符串类型
        // 否则 WHERE period = 2025 会匹配到 '2025Q4'（MySQL隐式转换）
        // 支持的字段：period, calculation_period, allocation_period 等
        const isPeriodField = /\bWHERE\s+.*\b(period|calculation_period|allocation_period|\w+_period)\s*=\s*\?/i.test(sql)
        if (isPeriodField) {
          return param; // 保持字符串类型
        }
        
        // 如果是字符串形式的数字，转换为数字
        // 但排除身份证号、电话号等敏感字段，避免科学计数法问题
        if (typeof param === 'string' && /^\d+$/.test(param) && param.length < 15) {
          return parseInt(param, 10);
        }
        return param;
      });
      // console.log('🔍 SQL参数调试:', { original: params, filtered: filteredParams });
      
      // 根据参数数量决定使用哪种查询方法
      let result;
      if (filteredParams.length === 0) {
        result = await this.pool.query(sql);
      } else {
        // 先检查SQL中的占位符数量是否与参数数量匹配
        const placeholderCount = (sql.match(/\?/g) || []).length;
        if (placeholderCount !== filteredParams.length) {
          console.warn(`⚠️ 占位符数量(${placeholderCount})与参数数量(${filteredParams.length})不匹配，SQL: ${sql}, 参数:`, filteredParams);
          // 尝试使用 query 方法（带参数）而不是 execute 方法
          result = await this.pool.query(sql, filteredParams);
        } else {
          result = await this.pool.execute(sql, filteredParams);
        }
      }
      
      const [rows] = result;
      return rows
    } catch (error) {
      console.error('❌ SQL查询执行失败:', error.message)
      console.error('SQL:', sql)
      console.error('原始参数:', params)
      throw error
    }
  }

  /**
   * 将snake_case字段名转换为camelCase
   */
  _convertFieldNameToJS(fieldName) {
    // snake_case到camelCase的映射表
    const fieldMap = {
      'manager_id': 'managerId',
      'start_date': 'startDate',
      'end_date': 'endDate',
      'profit_target': 'profitTarget',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'line_id': 'businessLineId',
      'department_id': 'departmentId',
      'position_id': 'positionId',
      'employee_id': 'employeeId',
      'user_id': 'userId',
      'role_id': 'roleId',
      'application_id': 'applicationId',
      'employee_no': 'employeeNo',
      'annual_salary': 'annualSalary',
      'entry_date': 'entryDate',
      'benchmark_value': 'benchmarkValue',
      'salary_range': 'salaryRange',
      'real_name': 'realName',
      'last_login': 'lastLogin',
      'target_date': 'targetDate',
      'completion_date': 'completionDate',
      'sort_order': 'sortOrder',
      'created_by': 'createdBy',
      'overall_progress': 'overallProgress',
      'budget_usage': 'budgetUsage',
      'cost_overrun': 'costOverrun',
      'schedule_variance': 'scheduleVariance',
      'quality_score': 'qualityScore',
      'risk_level': 'riskLevel',
      'team_performance': 'teamPerformance',
      'last_updated_by': 'lastUpdatedBy',
      'milestone_id': 'milestoneId',
      'progress_type': 'progressType',
      'progress_value': 'progressValue',
      'old_value': 'oldValue',
      'new_value': 'newValue',
      'logged_by': 'loggedBy',
      'logged_at': 'loggedAt',
      'is_read': 'isRead',
      'read_at': 'readAt',
      'notification_type': 'notificationType',
      'related_id': 'relatedId',
      'cost_type': 'costType',
      'recorded_by': 'recordedBy',
      'join_date': 'joinDate',
      'leave_date': 'leaveDate',
      'total_amount': 'totalAmount',
      'profit_ratio': 'profitRatio',
      'approved_by': 'approvedBy',
      'approved_at': 'approvedAt',
      'deleted_by': 'deletedBy',
      'deleted_at': 'deletedAt',
      'pool_id': 'poolId',
      'role_weight': 'roleWeight',
      'performance_coeff': 'performanceCoeff',
      'participation_ratio': 'participationRatio',
      'bonus_amount': 'bonusAmount',
      'updated_by': 'updatedBy',
      'total_profit': 'totalProfit',
      'pool_ratio': 'poolRatio',
      'pool_amount': 'poolAmount',
      'reserve_ratio': 'reserveRatio',
      'special_ratio': 'specialRatio',
      'distributable_amount': 'distributableAmount',
      'is_custom': 'isCustom',
      'effective_date': 'effectiveDate',
      'project_id': 'projectId',
      // 添加奖金计算历史记录字段映射
      'calculation_number': 'calculationNumber',
      'member_count': 'memberCount',
      'total_weight': 'totalWeight',
      'calculation_data': 'calculationData',
      'calculated_by': 'calculatedBy',
      'calculated_at': 'calculatedAt',
      'is_current': 'isCurrent',
      // 添加三维权重配置字段映射
      'profit_contribution_weight': 'profitContributionWeight',
      'position_value_weight': 'positionValueWeight',
      'performance_weight': 'performanceWeight',
      'profit_direct_contribution_weight': 'profitDirectContributionWeight',
      'profit_workload_weight': 'profitWorkloadWeight',
      'profit_quality_weight': 'profitQualityWeight',
      'profit_position_value_weight': 'profitPositionValueWeight',
      'position_skill_complexity_weight': 'positionSkillComplexityWeight',
      'position_responsibility_weight': 'positionResponsibilityWeight',
      'position_decision_impact_weight': 'positionDecisionImpactWeight',
      'position_experience_weight': 'positionExperienceWeight',
      // 添加利润数据表字段映射
      'total_revenue': 'revenue',
      'total_cost': 'cost',
      'profit_margin': 'profitMargin',
      'data_source': 'dataSource',
      'business_line_id': 'businessLineId',
      'position_market_value_weight': 'positionMarketValueWeight',
      'performance_work_output_weight': 'performanceWorkOutputWeight',
      'performance_work_quality_weight': 'performanceWorkQualityWeight',
      'performance_work_efficiency_weight': 'performanceWorkEfficiencyWeight',
      'performance_collaboration_weight': 'performanceCollaborationWeight',
      'performance_innovation_weight': 'performanceInnovationWeight',
      'performance_leadership_weight': 'performanceLeadershipWeight',
      'performance_learning_weight': 'performanceLearningWeight',
      'excellence_bonus': 'excellenceBonus',
      'performance_multiplier': 'performanceMultiplier',
      'position_level_multiplier': 'positionLevelMultiplier',
      'calculation_method': 'calculationMethod',
      'normalization_method': 'normalizationMethod',
      'expiry_date': 'expiryDate',
      'category_id': 'categoryId',
      'estimated_workload': 'estimatedWorkload'
    }

    return fieldMap[fieldName] || fieldName
  }

  /**
   * 转换数据库记录为JS对象格式（snake_case -> camelCase）
   */
  _convertRowToJS(row) {
    if (!row || typeof row !== 'object') return row

    const converted = {}
    Object.entries(row).forEach(([key, value]) => {
      const camelKey = this._convertFieldNameToJS(key)
      // 特殊处理身份证号、电话等敏感字段，确保它们始终作为字符串返回
      if (key === 'id_card' || key === 'phone' || key === 'emergency_phone' || key === 'emergency_contact') {
        converted[camelKey] = value !== null && value !== undefined ? String(value) : value
      }
      // 确保decimal类型被正确转换为JavaScript数值类型
      else if (typeof value === 'object' && value !== null && value.constructor.name === 'Decimal') {
        converted[camelKey] = parseFloat(value.toString())
      } else if (typeof value === 'string' && /^\d+\.\d+$/.test(value) && value.length < 15) {
        // 处理可能以字符串形式返回的decimal值
        // 但排除身份证号、电话号等敏感字段，避免科学计数法问题
        converted[camelKey] = parseFloat(value)
      } else if (value != null) {
        // 解析JSON字段（权重配置与三维计算结果相关字段）
        const __jsonRowFields = [
          'weights',
          'calculation_params',
          'profit_calculation_details',
          'position_calculation_details',
          'performance_calculation_details',
          'detailed_calculation_data',
          'applicable_business_lines',
          'applicable_departments',
          'applicable_position_levels',
          'applicable_employee_types',
          'weight_adjustment_rules',
          'conditional_weights',
          'calculation_data'  // 奖金计算历史记录的计算数据
        ]
        if (__jsonRowFields.includes(key)) {
          try {
            if (typeof value === 'string') {
              converted[camelKey] = JSON.parse(value)
            } else {
              converted[camelKey] = value
            }
          } catch (e) {
            // 解析失败则原样返回，避免抛错影响其他字段
            converted[camelKey] = value
          }
        } else {
          converted[camelKey] = value
        }
      } else {
        converted[camelKey] = value
      }
    })

    return converted
  }

  /**
   * 通用查询方法 - 兼容SQLiteManager接口
   */
  async findAll(table, options = {}) {
    const { where = {}, include = [], limit, offset, order = [] } = options
    
    // 转换表名为 snake_case
    const dbTableName = this._convertTableName(table)

    let sql = `SELECT * FROM ${dbTableName}`
    let params = []

    // 处理WHERE条件
    if (Object.keys(where).length > 0) {
      const conditions = []
      Object.entries(where).forEach(([key, value]) => {
        // 转换字段名为 snake_case，传入表名用于特殊处理
        const dbFieldName = this._convertFieldName(key, table)
        
        if (typeof value === 'object' && value !== null) {
          if (value.$like) {
            conditions.push(`${dbFieldName} LIKE ?`)
            params.push(`%${value.$like.replace(/%/g, '')}%`)
          } else if (value.$in) {
            const placeholders = value.$in.map(() => '?').join(',')
            conditions.push(`${dbFieldName} IN (${placeholders})`)
            params.push(...value.$in)
          } else if (value.$ne) {
            conditions.push(`${dbFieldName} != ?`)
            params.push(value.$ne)
          } else if (value.$gte) {
            conditions.push(`${dbFieldName} >= ?`)
            params.push(value.$gte)
          } else if (value.$lte) {
            conditions.push(`${dbFieldName} <= ?`)
            params.push(value.$lte)
          } else {
            conditions.push(`${dbFieldName} = ?`)
            params.push(value)
          }
        } else {
          conditions.push(`${dbFieldName} = ?`)
          params.push(value)
        }
      })

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`
      }
    }

    // 处理排序
    if (order.length > 0) {
      const orderClauses = order.map(([field, direction]) => {
        const dbFieldName = this._convertFieldName(field, table)
        return `${dbFieldName} ${direction}`
      })
      sql += ` ORDER BY ${orderClauses.join(', ')}`
    }

    // 处理分页 - 使用字符串拼接而不是预处理参数
    if (limit !== undefined && limit !== null) {
      const limitValue = parseInt(limit)
      if (!isNaN(limitValue) && limitValue > 0) {
        sql += ` LIMIT ${limitValue}` // 直接拼接而不是使用参数

        if (offset !== undefined && offset !== null) {
          const offsetValue = parseInt(offset)
          if (!isNaN(offsetValue) && offsetValue >= 0) {
            sql += ` OFFSET ${offsetValue}` // 直接拼接而不是使用参数
          }
        }
      }
    }

    try {
      const rows = await this.query(sql, params)

      // 转换所有行的字段名为camelCase
      const convertedRows = rows.map(row => this._convertRowToJS(row))

      // 获取总数（用于分页）
      let total = convertedRows.length
      if (limit || offset) {
        let countSql = `SELECT COUNT(*) as count FROM ${dbTableName}`
        let countParams = []

        if (Object.keys(where).length > 0) {
          const conditions = []
          Object.entries(where).forEach(([key, value]) => {
            const dbFieldName = this._convertFieldName(key, table)
            
            if (typeof value === 'object' && value !== null) {
              if (value.$like) {
                conditions.push(`${dbFieldName} LIKE ?`)
                countParams.push(`%${value.$like.replace(/%/g, '')}%`)
              } else if (value.$in) {
                const placeholders = value.$in.map(() => '?').join(',')
                conditions.push(`${dbFieldName} IN (${placeholders})`)
                countParams.push(...value.$in)
              } else if (value.$ne) {
                conditions.push(`${dbFieldName} != ?`)
                countParams.push(value.$ne)
              } else if (value.$gte) {
                conditions.push(`${dbFieldName} >= ?`)
                countParams.push(value.$gte)
              } else if (value.$lte) {
                conditions.push(`${dbFieldName} <= ?`)
                countParams.push(value.$lte)
              } else {
                conditions.push(`${dbFieldName} = ?`)
                countParams.push(value)
              }
            } else {
              conditions.push(`${dbFieldName} = ?`)
              countParams.push(value)
            }
          })

          if (conditions.length > 0) {
            countSql += ` WHERE ${conditions.join(' AND ')}`
          }
        }

        const countResult = await this.query(countSql, countParams)
        total = countResult[0]?.count || 0
      }

      return { rows: convertedRows, count: total }

    } catch (error) {
      console.error('❌ findAll查询失败:', error.message)
      throw error
    }
  }

  /**
   * 查找单条记录
   */
  async findOne(table, options = {}) {
    // 如果options本身就是查询条件对象
    if (options && typeof options === 'object' && !options.where) {
      return this.findOne(table, { where: options })
    }

    const result = await this.findAll(table, { ...options, limit: 1 })
    return result.rows[0] || null
  }

  /**
   * 根据ID查找
   */
  async findByPk(table, id, options = {}) {
    return this.findOne(table, { ...options, where: { id } })
  }

  /**
   * 创建记录
   */
  async create(table, data) {
    try {
      // 转换表名为 snake_case
      const dbTableName = this._convertTableName(table)
      
      // 转换字段名：camelCase -> snake_case
      const convertedData = {}
      
      Object.entries(data).forEach(([key, value]) => {
        // 过滤掉 undefined 值，将其转换为 null
        if (value === undefined) {
          return; // 跳过 undefined 值
        }

        // 转换字段名为 snake_case，传入表名用于特殊处理
        const snakeKey = this._convertFieldName(key, table)
        // 转换日期值为MySQL DATE格式
        let convertedValue = this._convertDateValue(snakeKey, value)
        // 处理JSON字段
        const __jsonCreateFields = [
          'weights',
          'calculation_params',
          'profit_calculation_details',
          'position_calculation_details',
          'performance_calculation_details',
          'detailed_calculation_data',
          'applicable_business_lines',
          'applicable_departments',
          'applicable_position_levels',
          'applicable_employee_types',
          'weight_adjustment_rules',
          'conditional_weights'
        ]
        if (__jsonCreateFields.includes(snakeKey) && convertedValue != null) {
          if (typeof convertedValue !== 'string') {
            try {
              convertedValue = JSON.stringify(convertedValue)
            } catch (e) {
              // 保持原值，避免写入失败
            }
          }
        }
        convertedData[snakeKey] = convertedValue
      })

      // 定义使用自增整数ID的表(不需要手动生成ID)
      const autoIncrementIdTables = [
        'project_requirements',
        'project_roles',
        'project_team_applications',
        'milestones',
        'milestone_reminders',
        'milestone_templates'
      ]
      
      // 如果是自增ID表,删除id字段,让数据库自动生成
      if (autoIncrementIdTables.includes(dbTableName)) {
        delete convertedData.id
      } else if (!convertedData.id) {
        // 如果不是自增表且没有id,生成16位随机ID(用于varchar类型的主键)
        const generateId = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          let result = ''
          for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
          }
          return result
        }
        convertedData.id = generateId()
      }

      const fields = [...Object.keys(convertedData)]
      const values = [...Object.values(convertedData)]

      // 添加时间戳
      if (!convertedData.created_at) {
        fields.push('created_at')
        values.push(new Date())
      }
      if (!convertedData.updated_at) {
        fields.push('updated_at')
        values.push(new Date())
      }

      const placeholders = fields.map(() => '?').join(',')
      const sql = `INSERT INTO ${dbTableName} (${fields.join(',')}) VALUES (${placeholders})`
      const result = await this.query(sql, values)

      // 获取插入的记录
      const insertId = result.insertId
      if (insertId) {
        return await this.findByPk(table, insertId)
      }

      // 如果没有自增ID，使用生成的id返回记录
      return await this.findByPk(table, convertedData.id)

    } catch (error) {
      console.error('❌ create操作失败:', error.message)
      throw error
    }
  }

  /**
   * 将camelCase表名转换为snake_case
   * 例如: performanceIndicators -> performance_indicators
   */
  _convertTableName(tableName) {
    if (!tableName) return tableName
    // 转换为 snake_case：在小写和大写之间加下划线
    return tableName
      .replace(/([a-z])([A-Z])/g, '$1_$2')  // 在小写和大写之间加下划线
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')  // 处理连续大写
      .toLowerCase()
  }

  /**
   * 将camelCase字段名转换为snake_case
   * 例如: userId -> user_id, createdAt -> created_at
   */
  _convertFieldName(fieldName, table = null) {
    // departments 和 positions 表的特殊字段映射
    // 这两个表使用 line_id 而不是 business_line_id
    const departmentPositionTables = ['departments', 'positions']
    
    if (table && departmentPositionTables.includes(table.toLowerCase())) {
      if (fieldName === 'businessLineId') {
        return 'line_id'
      }
    }
    
    // 通用转换：camelCase -> snake_case
    return fieldName.replace(/([A-Z])/g, '_$1').toLowerCase()
  }

  /**
   * 转换日期值为MySQL DATE格式 (YYYY-MM-DD)
   */
  _convertDateValue(fieldName, value) {
    // DATE类型字段列表
    const dateFields = [
      'start_date', 'end_date', 'target_date', 'completion_date',
      'entry_date', 'join_date', 'leave_date', 'approved_at', 'deleted_at',
      'date', 'effective_date'  // 添加effective_date字段
    ]

    // 如果是日期字段且值不为空
    if (dateFields.includes(fieldName) && value) {
      // 如果是Date对象或ISO字符串，转换为YYYY-MM-DD格式
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]
      } else if (typeof value === 'string' && value.includes('T')) {
        // ISO格式字符串，提取日期部分
        return value.split('T')[0]
      }
    }

    return value
  }

  /**
   * 更新记录
   */
  async update(table, id, data) {
    try {
      // 转换表名为 snake_case
      const dbTableName = this._convertTableName(table)
      
      // 转换字段名：camelCase -> snake_case
      const convertedData = {}
      
      Object.entries(data).forEach(([key, value]) => {
        // 过滤掉 undefined 值，将其转换为 null
        if (value === undefined) {
          return; // 跳过 undefined 值
        }

        const snakeKey = this._convertFieldName(key, table)
        // 转换日期值为MySQL DATE格式
        let convertedValue = this._convertDateValue(snakeKey, value)
        // 处理JSON字段
        const __jsonUpdateFields = [
          'weights',
          'calculation_params',
          'profit_calculation_details',
          'position_calculation_details',
          'performance_calculation_details',
          'detailed_calculation_data',
          'applicable_business_lines',
          'applicable_departments',
          'applicable_position_levels',
          'applicable_employee_types',
          'weight_adjustment_rules',
          'conditional_weights'
        ]
        if (__jsonUpdateFields.includes(snakeKey) && convertedValue != null) {
          if (typeof convertedValue !== 'string') {
            try {
              convertedValue = JSON.stringify(convertedValue)
            } catch (e) {
              // 保持原值
            }
          }
        }
        convertedData[snakeKey] = convertedValue
      })

      const fields = [...Object.keys(convertedData)]
      const values = [...Object.values(convertedData)]

      // 添加更新时间戳
      if (!convertedData.updated_at) {
        fields.push('updated_at')
        values.push(new Date())
      }

      const setClauses = fields.map(field => `${field} = ?`).join(',')
      values.push(id)

      const sql = `UPDATE ${dbTableName} SET ${setClauses} WHERE id = ?`
      const result = await this.query(sql, values)

      return [result.affectedRows]

    } catch (error) {
      console.error('❌ update操作失败:', error.message)
      throw error
    }
  }

  /**
   * 批量更新记录
   */
  async updateMany(table, options, data) {
    try {
      const { where = {} } = options;
      
      // 转换表名为 snake_case
      const dbTableName = this._convertTableName(table)

      // 转换字段名：camelCase -> snake_case
      const convertedData = {}
      Object.entries(data).forEach(([key, value]) => {
        // 过滤掉 undefined 值，将其转换为 null
        if (value === undefined) {
          return; // 跳过 undefined 值
        }

        const snakeKey = this._convertFieldName(key, table)
        // 转换日期值为MySQL DATE格式
        let convertedValue = this._convertDateValue(snakeKey, value)
        // 处理JSON字段
        const __jsonBatchFields = [
          'weights',
          'calculation_params',
          'profit_calculation_details',
          'position_calculation_details',
          'performance_calculation_details',
          'detailed_calculation_data',
          'applicable_business_lines',
          'applicable_departments',
          'applicable_position_levels',
          'applicable_employee_types',
          'weight_adjustment_rules',
          'conditional_weights'
        ]
        if (__jsonBatchFields.includes(snakeKey) && convertedValue != null) {
          if (typeof convertedValue !== 'string') {
            try {
              convertedValue = JSON.stringify(convertedValue)
            } catch (e) {
              // 保持原值
            }
          }
        }
        convertedData[snakeKey] = convertedValue
      })

      const fields = [...Object.keys(convertedData)]
      const values = [...Object.values(convertedData)]

      // 添加更新时间戳
      if (!convertedData.updated_at) {
        fields.push('updated_at')
        values.push(new Date())
      }

      const setClauses = fields.map(field => `${field} = ?`).join(',')

      let sql = `UPDATE ${dbTableName} SET ${setClauses}`
      let whereParams = []

      // 处理WHERE条件
      if (Object.keys(where).length > 0) {
        const conditions = []
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if (value.$like) {
              conditions.push(`${key} LIKE ?`)
              whereParams.push(`%${value.$like.replace(/%/g, '')}%`)
            } else if (value.$in) {
              const placeholders = value.$in.map(() => '?').join(',')
              conditions.push(`${key} IN (${placeholders})`)
              whereParams.push(...value.$in)
            } else if (value.$ne) {
              conditions.push(`${key} != ?`)
              whereParams.push(value.$ne)
            } else {
              conditions.push(`${key} = ?`)
              whereParams.push(value)
            }
          } else {
            conditions.push(`${key} = ?`)
            whereParams.push(value)
          }
        })

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`
        }
      }

      const result = await this.query(sql, [...values, ...whereParams])
      return [result.affectedRows]

    } catch (error) {
      console.error('❌ updateMany操作失败:', error.message)
      throw error
    }
  }

  /**
   * 删除记录
   */
  async destroy(table, id) {
    try {
      const dbTableName = this._convertTableName(table)
      const sql = `DELETE FROM ${dbTableName} WHERE id = ?`
      const result = await this.query(sql, [id])
      return result.affectedRows

    } catch (error) {
      console.error('❌ destroy操作失败:', error.message)
      throw error
    }
  }

  /**
   * 批量删除记录
   */
  async destroyMany(table, options) {
    try {
      const { where = {} } = options;
      
      const dbTableName = this._convertTableName(table)

      let sql = `DELETE FROM ${dbTableName}`
      let params = []

      // 处理WHERE条件
      if (Object.keys(where).length > 0) {
        const conditions = []
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            if (value.$like) {
              conditions.push(`${key} LIKE ?`)
              params.push(`%${value.$like.replace(/%/g, '')}%`)
            } else if (value.$in) {
              const placeholders = value.$in.map(() => '?').join(',')
              conditions.push(`${key} IN (${placeholders})`)
              params.push(...value.$in)
            } else if (value.$ne) {
              conditions.push(`${key} != ?`)
              params.push(value.$ne)
            } else {
              conditions.push(`${key} = ?`)
              params.push(value)
            }
          } else {
            conditions.push(`${key} = ?`)
            params.push(value)
          }
        })

        if (conditions.length > 0) {
          sql += ` WHERE ${conditions.join(' AND ')}`
        }
      }

      const result = await this.query(sql, params)
      return result.affectedRows

    } catch (error) {
      console.error('❌ destroyMany操作失败:', error.message)
      throw error
    }
  }

  /**
   * 批量创建
   */
  async bulkCreate(table, dataArray) {
    try {
      // 如果数据为空，直接返回空数组
      if (!dataArray || dataArray.length === 0) {
        return [];
      }

      // 使用事务确保数据一致性
      const connection = await this.beginTransaction();

      try {
        const records = [];

        for (const data of dataArray) {
          const record = await this.create(table, data);
          records.push(record);
        }

        await this.commitTransaction(connection);
        return records;
      } catch (error) {
        await this.rollbackTransaction(connection);
        throw error;
      }

    } catch (error) {
      console.error('❌ bulkCreate操作失败:', error.message);
      throw error;
    }
  }

  /**
   * 计数方法
   */
  async count(table, options = {}) {
    const { where = {} } = options
    
    const dbTableName = this._convertTableName(table)

    let sql = `SELECT COUNT(*) as count FROM ${dbTableName}`
    let params = []

    // 处理WHERE条件
    if (Object.keys(where).length > 0) {
      const conditions = []
      Object.entries(where).forEach(([key, value]) => {
        // 转换字段名为 snake_case，传入表名用于特殊处理
        const dbFieldName = this._convertFieldName(key, table)
        
        if (typeof value === 'object' && value !== null) {
          if (value.$like) {
            conditions.push(`${dbFieldName} LIKE ?`)
            params.push(`%${value.$like.replace(/%/g, '')}%`)
          } else if (value.$in) {
            const placeholders = value.$in.map(() => '?').join(',')
            conditions.push(`${dbFieldName} IN (${placeholders})`)
            params.push(...value.$in)
          } else if (value.$ne) {
            conditions.push(`${dbFieldName} != ?`)
            params.push(value.$ne)
          } else if (value.$gte) {
            conditions.push(`${dbFieldName} >= ?`)
            params.push(value.$gte)
          } else if (value.$lte) {
            conditions.push(`${dbFieldName} <= ?`)
            params.push(value.$lte)
          } else {
            conditions.push(`${dbFieldName} = ?`)
            params.push(value)
          }
        } else {
          conditions.push(`${dbFieldName} = ?`)
          params.push(value)
        }
      })

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`
      }
    }

    try {
      const result = await this.query(sql, params)
      return result[0]?.count || 0

    } catch (error) {
      console.error('❌ count查询失败:', error.message)
      throw error
    }
  }

  /**
   * 开始事务
   */
  async beginTransaction() {
    const connection = await this.pool.getConnection()
    await connection.beginTransaction()
    return connection
  }

  /**
   * 提交事务
   */
  async commitTransaction(connection) {
    await connection.commit()
    connection.release()
  }

  /**
   * 回滚事务
   */
  async rollbackTransaction(connection) {
    await connection.rollback()
    connection.release()
  }

  /**
   * 关闭连接池
   */
  async close() {
    if (this.pool) {
      await this.pool.end()
      console.log('✅ MySQL连接池已关闭')
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats() {
    try {
      const stats = {}

      const tables = [
        'users', 'roles', 'departments', 'positions', 'employees',
        'business_lines', 'projects', 'bonus_pools'
      ]

      for (const table of tables) {
        try {
          const count = await this.count(table)
          stats[table] = count
        } catch (error) {
          console.warn(`获取表 ${table} 统计失败:`, error.message)
          stats[table] = 0
        }
      }

      return stats

    } catch (error) {
      console.error('❌ 获取数据库统计失败:', error.message)
      return {}
    }
  }

  /**
   * 用户相关方法 - 与nedbService兼容
   */

  /**
   * 根据用户名查找用户
   */
  async getUserByUsername(username) {
    return this.findOne('users', { where: { username } })
  }

  /**
   * 根据ID查找用户
   */
  async getUserById(id) {
    return this.findByPk('users', id)
  }

  /**
   * 根据ID查找用户（别名）
   */
  async findUserById(id) {
    return this.getUserById(id)
  }

  /**
   * 根据用户名或邮箱查找用户
   */
  async findUserByUsernameOrEmail(username, email) {
    let sql = 'SELECT * FROM users WHERE username = ?'
    let params = [username]

    if (email) {
      sql += ' OR email = ?'
      params.push(email)
    }

    const result = await this.query(sql, params)
    return result[0] || null
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    return this.create('users', userData)
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(userId) {
    return this.update('users', userId, { last_login: new Date() })
  }

  /**
   * 更新用户密码
   */
  async updatePassword(userId, hashedPassword) {
    return this.update('users', userId, { password: hashedPassword })
  }

  /**
   * 根据ID查找角色
   */
  async getRoleById(id) {
    return this.findByPk('roles', id)
  }

  /**
   * 聚合查询（简化版）
   */
  async aggregate(table, pipeline) {
    try {
      // 简化版聚合，只支持基本的 $group 操作
      const data = await this.findAll(table, {})
      const rows = data.rows || data

      if (pipeline.length === 0) return rows

      // 处理 $group 操作
      const groupStage = pipeline.find(stage => stage.$group)
      if (groupStage) {
        const grouped = {}
        rows.forEach(row => {
          // 转换字段名为camelCase
          const doc = this._convertRowToJS(row)

          const groupKey = groupStage.$group._id
          let key

          if (typeof groupKey === 'string') {
            key = doc[groupKey]
          } else if (groupKey && typeof groupKey === 'object') {
            // 处理复合键
            key = Object.keys(groupKey).map(k => doc[k]).join('|')
          }

          if (!grouped[key]) {
            grouped[key] = { _id: key }
            Object.keys(groupStage.$group).forEach(field => {
              if (field !== '_id') {
                const fieldConfig = groupStage.$group[field]
                if (fieldConfig.$sum) {
                  grouped[key][field] = 0
                } else if (fieldConfig.$avg) {
                  grouped[key][field] = { sum: 0, count: 0 }
                }
              }
            })
          }

          Object.keys(groupStage.$group).forEach(field => {
            if (field !== '_id') {
              const fieldConfig = groupStage.$group[field]
              if (fieldConfig.$sum) {
                grouped[key][field] += doc[fieldConfig.$sum] || 0
              } else if (fieldConfig.$avg) {
                grouped[key][field].sum += doc[fieldConfig.$avg] || 0
                grouped[key][field].count += 1
              }
            }
          })
        })

        // 计算平均值
        Object.keys(grouped).forEach(key => {
          Object.keys(grouped[key]).forEach(field => {
            if (grouped[key][field] && typeof grouped[key][field] === 'object' && grouped[key][field].sum !== undefined) {
              grouped[key][field] = grouped[key][field].sum / grouped[key][field].count
            }
          })
        })

        return Object.values(grouped)
      }

      // 转换字段名为camelCase
      return rows.map(row => this._convertRowToJS(row))
    } catch (error) {
      console.error('❌ aggregate操作失败:', error.message)
      throw error
    }
  }
}

module.exports = MySQLManager
