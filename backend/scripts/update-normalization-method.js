/**
 * 更新权重配置的归一化方法为 'none'
 * 禁用归一化，直接使用原始得分进行加权
 */

const databaseService = require('../src/services/databaseService')

async function updateNormalizationMethod() {
  try {
    // 初始化数据库连接
    await databaseService.initialize()
    console.log('✅ 数据库连接初始化成功\n')
    
    console.log('🔧 开始更新归一化方法配置...\n')
    
    // 查询当前配置
    const configs = await databaseService.find('threeDimensionalWeightConfigs', {})
    
    console.log(`📊 找到 ${configs.length} 个权重配置:\n`)
    configs.forEach(config => {
      console.log(`  - ID=${config._id}, 名称=${config.name}, 当前归一化方法=${config.normalizationMethod || config.normalization_method}`)
    })
    
    // 更新所有配置
    console.log('\n🔄 更新归一化方法为 "none"...')
    let updatedCount = 0
    for (const config of configs) {
      const currentMethod = config.normalizationMethod || config.normalization_method
      if (currentMethod !== 'none') {
        await databaseService.update(
          'threeDimensionalWeightConfigs',
          { _id: config._id },
          { normalizationMethod: 'none' }
        )
        updatedCount++
      }
    }
    
    console.log(`✅ 更新完成! 影响数量: ${updatedCount}\n`)
    
    // 验证更新
    const updatedConfigs = await databaseService.find('threeDimensionalWeightConfigs', {})
    
    console.log('📋 更新后的配置:')
    updatedConfigs.forEach(config => {
      console.log(`  - ID=${config._id}, 名称=${config.name}, 归一化方法=${config.normalizationMethod || config.normalization_method}`)
    })
    
    console.log('\n✨ 现在计算三维得分时会直接使用原始得分，不再进行归一化处理')
    console.log('例如: 利润70分 × 40% + 岗位83分 × 30% + 绩敀65分 × 30% = 72.4分\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 更新失败:', error)
    process.exit(1)
  }
}

updateNormalizationMethod()
