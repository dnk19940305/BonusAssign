/**
 * 周期相关工具函数
 * 统一管理周期格式生成逻辑
 */

export interface PeriodOption {
  label: string
  value: string
}

/**
 * 生成公司级奖金池周期选项（近3年，包含季度/半年/全年）
 * @returns 周期选项列表
 */
export function generateCompanyPeriodOptions(): PeriodOption[] {
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]
  const options: PeriodOption[] = []
  
  years.forEach(year => {
    // 季度（后端格式：2025Q1，无连接符）
    for (let q = 1; q <= 4; q++) {
      options.push({
        label: `${year}-Q${q}`,
        value: `${year}Q${q}`  // 后端期望格式：2025Q1
      })
    }
    // 半年
    options.push(
      { label: `${year}-H1`, value: `${year}H1` },
      { label: `${year}-H2`, value: `${year}H2` }
    )
    // 全年
    options.push({
      label: `${year}年`,
      value: `${year}`
    })
  })
  
  return options
}

/**
 * 生成项目奖金池周期选项（从2023Q1到未来2个季度）
 * @returns 周期选项列表（倒序，最新的在前）
 */
export function generateProjectPeriodOptions(): PeriodOption[] {
  const periods: PeriodOption[] = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentQuarter = Math.ceil(currentMonth / 3) // 1-4

  // 从2023Q1开始
  const startYear = 2023
  const startQuarter = 1

  // 计算结束季度(当前季度+2)
  let endYear = currentYear
  let endQuarter = currentQuarter + 2
  if (endQuarter > 4) {
    endYear += Math.floor(endQuarter / 4)
    endQuarter = endQuarter % 4 || 4
  }

  // 生成期间列表
  for (let year = startYear; year <= endYear; year++) {
    const startQ = year === startYear ? startQuarter : 1
    const endQ = year === endYear ? endQuarter : 4

    for (let q = startQ; q <= endQ; q++) {
      const value = `${year}Q${q}`  // 后端格式：2025Q1
      const label = `${year}-Q${q}` // 显示格式：2025-Q1
      periods.push({ value, label })
    }
  }

  // 倒序排列(最新的在前)
  return periods.reverse()
}

/**
 * 生成个人仪表板季度选项（带"全部期间"和年度选项）
 * @param years 年份数量，默认最近3年
 * @param includeYearOption 是否包含年度选项，默认true
 * @returns 季度选项数组，格式如 ['2025Q1', '2025Q2', '2024Q4', ...]
 */
export function generateQuarterOptions(years: number = 3, includeYearOption: boolean = true): PeriodOption[] {
  const options: PeriodOption[] = []
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentQuarter = Math.ceil(currentMonth / 3)

  // 添加"全部"选项
  options.push({ label: '全部期间', value: '' })

  // 生成最近years年的季度和年度选项
  for (let yearOffset = 0; yearOffset < years; yearOffset++) {
    const year = currentYear - yearOffset
    
    // 添加年度选项
    if (includeYearOption) {
      options.push({ 
        label: `${year}年（全年）`, 
        value: `${year}` 
      })
    }
    
    const startQuarter = yearOffset === 0 ? currentQuarter : 4
    
    for (let quarter = startQuarter; quarter >= 1; quarter--) {
      const value = `${year}Q${quarter}`
      const label = `${year}年第${quarter}季度`
      options.push({ label, value })
    }
  }

  return options
}

/**
 * 生成月度选项列表
 * @param months 月份数量，默认最近12个月
 * @returns 月度选项数组，格式如 ['2025-01', '2024-12', ...]
 */
export function generateMonthOptions(months: number = 12): PeriodOption[] {
  const options: PeriodOption[] = []
  const currentDate = new Date()

  // 添加“全部”选项
  options.push({ label: '全部期间', value: '' })

  // 生成最近months个月
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const value = `${year}-${month}`
    const label = `${year}年${month}月`
    options.push({ label, value })
  }

  return options
}

/**
 * 格式化周期显示
 * @param period 周期值（如：2025Q1）
 * @returns 格式化后的显示文本（如：2025-Q1）
 */
export function formatPeriodLabel(period: string): string {
  if (!period) return ''
  
  // 季度格式：2025Q1 -> 2025-Q1
  const quarterMatch = period.match(/^(\d{4})Q(\d)$/)
  if (quarterMatch) {
    return `${quarterMatch[1]}-Q${quarterMatch[2]}`
  }
  
  // 半年格式：2025H1 -> 2025-H1
  const halfYearMatch = period.match(/^(\d{4})H(\d)$/)
  if (halfYearMatch) {
    return `${halfYearMatch[1]}-H${halfYearMatch[2]}`
  }
  
  // 全年格式：2025 -> 2025年
  if (/^\d{4}$/.test(period)) {
    return `${period}年`
  }
  
  return period
}

/**
 * 解析周期值
 * @param period 周期值（如：2025Q1 或 2025-01）
 * @returns 解析结果 { year, quarter?, half?, month?, type, label }
 */
export function parsePeriod(period: string): {
  year: number
  quarter?: number
  half?: number
  month?: number
  type: 'quarter' | 'half' | 'year' | 'month' | 'unknown'
  label: string
} {
  // 季度格式：2025Q1
  const quarterMatch = period.match(/^(\d{4})Q(\d)$/)
  if (quarterMatch) {
    const year = parseInt(quarterMatch[1])
    const quarter = parseInt(quarterMatch[2])
    return {
      year,
      quarter,
      type: 'quarter',
      label: `${year}年第${quarter}季度`
    }
  }
  
  // 半年格式：2025H1
  const halfYearMatch = period.match(/^(\d{4})H(\d)$/)
  if (halfYearMatch) {
    const year = parseInt(halfYearMatch[1])
    const half = parseInt(halfYearMatch[2])
    return {
      year,
      half,
      type: 'half',
      label: `${year}年${half === 1 ? '上' : '下'}半年`
    }
  }
  
  // 月度格式：2025-01
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/)
  if (monthMatch) {
    const year = parseInt(monthMatch[1])
    const month = parseInt(monthMatch[2])
    return {
      year,
      month,
      type: 'month',
      label: `${year}年${month.toString().padStart(2, '0')}月`
    }
  }
  
  // 全年格式：2025
  if (/^\d{4}$/.test(period)) {
    return {
      year: parseInt(period),
      type: 'year',
      label: `${period}年`
    }
  }
  
  return {
    year: 0,
    type: 'unknown',
    label: period
  }
}

/**
 * 获取当前季度
 * @returns 当前季度字符串，如 '2025Q1'
 */
export function getCurrentQuarter(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const quarter = Math.ceil(month / 3)
  return `${year}Q${quarter}`
}

/**
 * 获取当前月份
 * @returns 当前月份字符串，如 '2025-01'
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 比较两个期间的先后顺序
 * @param period1 期间1
 * @param period2 期间2
 * @returns 正数表示period1较晚，负数表示period1较早，0表示相同
 */
export function comparePeriods(period1: string, period2: string): number {
  const p1 = parsePeriod(period1)
  const p2 = parsePeriod(period2)

  if (p1.year !== p2.year) {
    return p1.year - p2.year
  }

  if (p1.type === 'quarter' && p2.type === 'quarter') {
    return (p1.quarter || 0) - (p2.quarter || 0)
  }

  if (p1.type === 'month' && p2.type === 'month') {
    return (p1.month || 0) - (p2.month || 0)
  }

  return 0
}
