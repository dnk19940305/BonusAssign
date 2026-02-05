/**
 * 诊断三维得分计算过程
 * 显示归一化前后的详细数据
 */

// 模拟计算过程
function simulateCalculation(rawScores, allEmployeeScores, weights, normalizationMethod = 'z_score') {
  console.log('====== 三维得分计算诊断 ======\n')
  
  console.log('📊 输入数据:')
  console.log(`  原始得分: 利润=${rawScores.profit}, 岗位=${rawScores.position}, 绩效=${rawScores.performance}`)
  console.log(`  权重配置: 利润=${weights.profit}%, 岗位=${weights.position}%, 绩效=${weights.performance}%`)
  console.log(`  归一化方法: ${normalizationMethod}\n`)
  
  // 步骤1: 归一化
  const normalized = normalize(rawScores, allEmployeeScores, normalizationMethod)
  console.log('📐 步骤1: 归一化处理')
  console.log(`  利润: ${rawScores.profit} → ${normalized.profit.toFixed(2)}`)
  console.log(`  岗位: ${rawScores.position} → ${normalized.position.toFixed(2)}`)
  console.log(`  绩效: ${rawScores.performance} → ${normalized.performance.toFixed(2)}\n`)
  
  // 步骤2: 加权
  const weighted = {
    profit: normalized.profit * (weights.profit / 100),
    position: normalized.position * (weights.position / 100),
    performance: normalized.performance * (weights.performance / 100)
  }
  console.log('⚖️ 步骤2: 加权计算')
  console.log(`  利润: ${normalized.profit.toFixed(2)} × ${weights.profit}% = ${weighted.profit.toFixed(2)}`)
  console.log(`  岗位: ${normalized.position.toFixed(2)} × ${weights.position}% = ${weighted.position.toFixed(2)}`)
  console.log(`  绩效: ${normalized.performance.toFixed(2)} × ${weights.performance}% = ${weighted.performance.toFixed(2)}\n`)
  
  // 步骤3: 综合得分
  const totalScore = weighted.profit + weighted.position + weighted.performance
  console.log('🎯 步骤3: 综合得分')
  console.log(`  ${weighted.profit.toFixed(2)} + ${weighted.position.toFixed(2)} + ${weighted.performance.toFixed(2)} = ${totalScore.toFixed(2)}\n`)
  
  // 对比：如果不归一化
  const directWeighted = 
    rawScores.profit * (weights.profit / 100) +
    rawScores.position * (weights.position / 100) +
    rawScores.performance * (weights.performance / 100)
  
  console.log('💡 对比: 不归一化的加权得分')
  console.log(`  ${rawScores.profit} × ${weights.profit}% + ${rawScores.position} × ${weights.position}% + ${rawScores.performance} × ${weights.performance}% = ${directWeighted.toFixed(2)}`)
  console.log(`  差异: ${(totalScore - directWeighted).toFixed(2)} 分\n`)
  
  return { normalized, weighted, totalScore }
}

// Z-Score归一化
function zScoreNormalize(value, values) {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length)
  
  if (stdDev === 0) return 50
  
  const zScore = (value - mean) / stdDev
  const normalizedValue = ((zScore + 3) / 6) * 100
  return Math.max(0, Math.min(100, normalizedValue))
}

// Min-Max归一化
function minMaxNormalize(value, values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  if (max === min) return 50
  
  return ((value - min) / (max - min)) * 100
}

// 统一归一化接口
function normalize(scores, allScores, method) {
  if (method === 'z_score') {
    return {
      profit: zScoreNormalize(scores.profit, allScores.profit),
      position: zScoreNormalize(scores.position, allScores.position),
      performance: zScoreNormalize(scores.performance, allScores.performance)
    }
  } else {
    return {
      profit: minMaxNormalize(scores.profit, allScores.profit),
      position: minMaxNormalize(scores.position, allScores.position),
      performance: minMaxNormalize(scores.performance, allScores.performance)
    }
  }
}

// 测试案例
const currentEmployee = {
  profit: 70,
  position: 83,
  performance: 65
}

// 模拟所有员工的得分分布（这个很关键！）
const allEmployees = {
  profit: [30, 45, 50, 60, 70, 75, 80, 85, 90, 95],      // 当前员工70分
  position: [40, 50, 60, 70, 75, 80, 83, 85, 90, 95],    // 当前员工83分
  performance: [35, 40, 50, 55, 60, 65, 70, 75, 80, 85]  // 当前员工65分
}

const weights = {
  profit: 40,
  position: 30,
  performance: 30
}

// 测试两种归一化方法
console.log('测试方法1: Z-Score归一化')
console.log('=' .repeat(60))
simulateCalculation(currentEmployee, allEmployees, weights, 'z_score')

console.log('\n测试方法2: Min-Max归一化')
console.log('=' .repeat(60))
simulateCalculation(currentEmployee, allEmployees, weights, 'min_max')

console.log('\n⚠️ 说明:')
console.log('归一化算法会根据所有员工的得分分布重新映射分数')
console.log('如果您的70/83/65在整体中属于中等水平，归一化后会被压缩')
console.log('建议: 查看实际使用的归一化方法和所有员工的得分分布')
