const { fieldNameMap, tableNameMap } = require('../config/fieldMappings')

/**
 * 基础数据库适配器类
 * 提供通用的数据库操作方法和字段转换功能
 */
class BaseDatabaseAdapter {
  constructor(databaseManager) {
    this.manager = databaseManager
    this.isInitialized = false
  }

  /**
   * 检查服务是否已初始化
   */
  checkInitialized() {
    if (!this.isInitialized || !this.manager) {
      throw new Error('数据库服务未初始化，请先调用 initialize() 方法')
    }
  }

  /**
   * 表名和字段名映射辅助方法
   */
  _mapTableAndFields(collection, options = {}) {
    const mysqlTable = tableNameMap[collection] || collection
    const mysqlOptions = { ...options }

    // 转换where条件中的字段名
    if (options.where) {
      const mysqlWhere = {}
      for (const [key, value] of Object.entries(options.where)) {
        const mysqlKey = fieldNameMap[key] || key
        mysqlWhere[mysqlKey] = value
      }
      mysqlOptions.where = mysqlWhere
    }

    // 转换order条件中的字段名
    if (options.order && Array.isArray(options.order)) {
      mysqlOptions.order = options.order.map(([field, direction]) => [
        fieldNameMap[field] || field,
        direction
      ])
    }

    return { mysqlTable, mysqlOptions, fieldNameMap }
  }

  /**
   * 为MySQL记录添加_id字段（NeDB兼容）
   */
  _addNedbId(record) {
    if (!record) return record
    if (Array.isArray(record)) {
      return record.map(r => ({ ...r, _id: r._id || r.id }))
    }
    return { ...record, _id: record._id || record.id }
  }

  /**
   * 转换NeDB查询条件为MySQL格式
   */
  _convertNedbQuery(query, fieldNameMap) {
    const converted = {}

    for (const [key, value] of Object.entries(query)) {
      // 处理$or操作符
      if (key === '$or') {
        converted.$or = value.map(condition => this._convertNedbQuery(condition, fieldNameMap))
        continue
      }

      const mysqlKey = fieldNameMap[key] || key

      // 处理值为对象的情况（包含操作符）
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const mysqlValue = {}
        for (const [op, val] of Object.entries(value)) {
          // 转换NeDB操作符为MySQL操作符
          switch (op) {
            case '$in':
            case '$nin':
            case '$gte':
            case '$gt':
            case '$lte':
            case '$lt':
            case '$ne':
              mysqlValue[op] = val
              break
            default:
              mysqlValue[op] = val
          }
        }
        converted[mysqlKey] = mysqlValue
      } else {
        converted[mysqlKey] = value
      }
    }

    return converted
  }

  /**
   * 将MySQL的snake_case字段名转换为camelCase（NeDB兼容）
   */
  _convertFieldsToNedb(record, fieldNameMap) {
    if (!record) return record

    // 创建反向映射：snake_case -> camelCase
    const reverseMap = {}
    for (const [camelCase, snake_case] of Object.entries(fieldNameMap)) {
      reverseMap[snake_case] = camelCase
    }

    const converted = {}
    for (const [key, value] of Object.entries(record)) {
      const nedbKey = reverseMap[key] || key
      converted[nedbKey] = value
    }

    return converted
  }

  /**
   * 通用CRUD操作方法
   */
  async findAll(table, options = {}) {
    this.checkInitialized()
    const { mysqlTable, mysqlOptions } = this._mapTableAndFields(table, options)
    return await this.manager.findAll(mysqlTable, mysqlOptions)
  }

  async find(collection, query = {}, options = {}) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields(collection, {})

    // 处理$or查询
    if (query.$or) {
      const orConditions = query.$or
      const results = []
      const seenIds = new Set()

      for (const condition of orConditions) {
        const subQuery = this._convertNedbQuery(condition, fieldNameMap)
        const mysqlOptions = { where: subQuery, ...options }

        if (options.sort) {
          mysqlOptions.order = Object.entries(options.sort).map(([field, direction]) => {
            const mysqlField = fieldNameMap[field] || field
            return [mysqlField, direction === 1 ? 'ASC' : 'DESC']
          })
          delete mysqlOptions.sort
        }

        const result = await this.manager.findAll(mysqlTable, mysqlOptions)
        const rows = result.rows || result

        rows.forEach(row => {
          const rowId = row._id || row.id
          if (!seenIds.has(rowId)) {
            seenIds.add(rowId)
            const convertedRow = this._convertFieldsToNedb(row, fieldNameMap)
            results.push(this._addNedbId(convertedRow))
          }
        })
      }

      return results
    }

    // 常规查询
    const mysqlQuery = this._convertNedbQuery(query, fieldNameMap)
    if (mysqlQuery._id) {
      mysqlQuery.id = mysqlQuery._id
      delete mysqlQuery._id
    }

    const mysqlOptions = { where: mysqlQuery, ...options }

    if (options.sort) {
      mysqlOptions.order = Object.entries(options.sort).map(([field, direction]) => {
        const mysqlField = fieldNameMap[field] || field
        return [mysqlField, direction === 1 ? 'ASC' : 'DESC']
      })
      delete mysqlOptions.sort
    }

    const result = await this.manager.findAll(mysqlTable, mysqlOptions)
    const rows = result.rows || result
    return rows.map(row => this._addNedbId(this._convertFieldsToNedb(row, fieldNameMap)))
  }

  async findOne(table, options = {}) {
    this.checkInitialized()
    
    let mysqlOptions = options
    if (options && typeof options === 'object' && !options.where && Object.keys(options).length > 0) {
      mysqlOptions = { where: options }
    }

    const { mysqlTable, mysqlOptions: mappedOptions, fieldNameMap } = this._mapTableAndFields(table, mysqlOptions)

    if (mappedOptions.where && mappedOptions.where._id) {
      mappedOptions.where.id = mappedOptions.where._id
      delete mappedOptions.where._id
    }

    const result = await this.manager.findOne(mysqlTable, mappedOptions)
    const convertedResult = result ? this._convertFieldsToNedb(result, fieldNameMap) : result
    return convertedResult ? this._addNedbId(convertedResult) : convertedResult
  }

  async create(table, data) {
    this.checkInitialized()
    const result = await this.manager.create(table, data)
    return this._addNedbId(result)
  }

  async insert(collection, data) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields(collection, {})

    if (Array.isArray(data)) {
      const mysqlData = data.map(item => this._convertToMysqlFields(item, fieldNameMap))
      const result = await this.manager.bulkCreate(mysqlTable, mysqlData)
      // 转换为NeDB兼容格式
      return Array.isArray(result) ? result.map(r => this._addNedbId(r)) : result
    } else {
      const mysqlData = this._convertToMysqlFields(data, fieldNameMap)
      const result = await this.manager.create(mysqlTable, mysqlData)
      // 转换为NeDB兼容格式
      return this._addNedbId(result)
    }
  }

  async update(table, queryOrId, data) {
    this.checkInitialized()

    if (typeof queryOrId === 'object' && queryOrId !== null) {
      // NeDB风格：update(collection, query, data)
      const { mysqlTable, fieldNameMap } = this._mapTableAndFields(table, {})
      const mysqlQuery = this._convertToMysqlFields(queryOrId, fieldNameMap)
      const mysqlData = this._convertToMysqlFields(data, fieldNameMap)
      return await this.manager.updateMany(mysqlTable, { where: mysqlQuery }, mysqlData)
    } else {
      // MySQL风格：update(table, id, data)
      return await this.manager.update(table, queryOrId, data)
    }
  }

  async remove(collection, query, options = {}) {
    this.checkInitialized()
    const { mysqlTable, fieldNameMap } = this._mapTableAndFields(collection, {})
    const mysqlQuery = this._convertToMysqlFields(query, fieldNameMap)

    if (options.multi || Object.keys(mysqlQuery).length > 0) {
      return await this.manager.destroyMany(mysqlTable, { where: mysqlQuery })
    } else {
      return await this.manager.destroyMany(mysqlTable, {})
    }
  }

  async count(table, options = {}) {
    this.checkInitialized()
    const { mysqlTable, mysqlOptions } = this._mapTableAndFields(table, options)
    return await this.manager.count(mysqlTable, mysqlOptions)
  }

  /**
   * 转换数据字段名到MySQL格式
   */
  _convertToMysqlFields(data, fieldNameMap) {
    const converted = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      const mysqlKey = fieldNameMap[key] || key
      converted[mysqlKey] = value
    }
    return converted
  }

  /**
   * 事务相关方法
   */
  async beginTransaction() {
    this.checkInitialized()
    if (typeof this.manager.beginTransaction === 'function') {
      return await this.manager.beginTransaction()
    } else {
      throw new Error(`数据库管理器不支持事务`)
    }
  }

  async commitTransaction(connection) {
    this.checkInitialized()
    if (typeof this.manager.commitTransaction === 'function') {
      return await this.manager.commitTransaction(connection)
    } else {
      throw new Error(`数据库管理器不支持事务`)
    }
  }

  async rollbackTransaction(connection) {
    this.checkInitialized()
    if (typeof this.manager.rollbackTransaction === 'function') {
      return await this.manager.rollbackTransaction(connection)
    } else {
      throw new Error(`数据库管理器不支持事务`)
    }
  }

  /**
   * 原始SQL查询
   */
  async query(sql, params = []) {
    this.checkInitialized()
    if (typeof this.manager.query === 'function') {
      return await this.manager.query(sql, params)
    } else {
      throw new Error(`数据库管理器不支持原始SQL查询`)
    }
  }
}

module.exports = BaseDatabaseAdapter