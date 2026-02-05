const { databaseManager } = require('../config/database')
const { createModel } = require('../adapters/model-adapter')

// 创建 ProfitData 模型适配器，指定正确的表名
class ProfitDataModel {
  constructor() {
    this.tableName = 'profit_data'
    this.manager = databaseManager
  }

  async findAll(options = {}) {
    return this.manager.findAll(this.tableName, options)
  }

  async findOne(options = {}) {
    return this.manager.findOne(this.tableName, options)
  }

  async findByPk(id, options = {}) {
    return this.manager.findByPk(this.tableName, id, options)
  }

  async findAndCountAll(options = {}) {
    return this.manager.findAll(this.tableName, options)
  }

  async create(data) {
    return this.manager.create(this.tableName, data)
  }

  async update(data, options = {}) {
    if (options.where && options.where.id) {
      return this.manager.update(this.tableName, options.where.id, data)
    }
    return [0]
  }

  async destroy(options = {}) {
    if (options.where && options.where.id) {
      return this.manager.destroy(this.tableName, options.where.id)
    }
    return 0
  }

  belongsTo(model, options = {}) {
    return this
  }

  hasMany(model, options = {}) {
    return this
  }

  hasOne(model, options = {}) {
    return this
  }
}

const ProfitData = new ProfitDataModel()

module.exports = ProfitData