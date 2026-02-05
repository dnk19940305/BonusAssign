/**
 * 时间周期工具函数
 * 用于生成和处理季度、月度等时间周期
 */

/**
 * 生成季度选项列表（包含年度选项）
 * @param years 年份数量，默认最近3年
 * @param includeYearOption 是否包含年度选项，默认true
 * @returns 季度选项数组，格式如 ['2025Q1', '2025Q2', '2024Q4', ...]
 */
export function generateQuarterOptions(years: number = 3, includeYearOption: boolean = true): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = []
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
export function generateMonthOptions(months: number = 12): Array<{ label: string; value: string }> {
  const options: Array<{ label: string; value: string }> = []
  const currentDate = new Date()

  // 添加"全部"选项
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
 * 解析期间字符串
 * @param period 期间字符串，如 '2025Q1' 或 '2025-01'
 * @returns 解析后的信息
 */
export function parsePeriod(period: string): {
  type: 'quarter' | 'month' | 'year' | 'unknown'
  year: number
  quarter?: number
  month?: number
  label: string
} {
  // 季度格式：2025Q1
  const quarterMatch = period.match(/^(\d{4})Q([1-4])$/)
  if (quarterMatch) {
    const year = parseInt(quarterMatch[1])
    const quarter = parseInt(quarterMatch[2])
    return {
      type: 'quarter',
      year,
      quarter,
      label: `${year}年第${quarter}季度`
    }
  }

  // 月度格式：2025-01
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/)
  if (monthMatch) {
    const year = parseInt(monthMatch[1])
    const month = parseInt(monthMatch[2])
    return {
      type: 'month',
      year,
      month,
      label: `${year}年${month.toString().padStart(2, '0')}月`
    }
  }

  // 全年格式：2025
  if (/^\d{4}$/.test(period)) {
    return {
      type: 'year',
      year: parseInt(period),
      label: `${period}年`
    }
  }

  return {
    type: 'unknown',
    year: 0,
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
