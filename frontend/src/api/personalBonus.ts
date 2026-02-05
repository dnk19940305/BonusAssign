import request from '@/utils/request'

// Personal Bonus API Interfaces

// User and Employee Info
export interface PersonalUser {
  id: number
  username: string
  realName: string
  email: string
  phone?: string
  roleId: number
  roleName: string
}

export interface PersonalEmployee {
  id: number
  employeeNumber: string
  name: string
  departmentId: number
  departmentName: string
  positionId: number
  positionName: string
  level?: number
  status: number
  joinDate: string
  userId?: number
}

// Performance Metrics
export interface PerformanceMetrics {
  overallScore: number
  efficiency: number
  innovation: number
  teamwork: number
  leadership?: number
  customerSatisfaction?: number
  lastEvaluationDate: string
  evaluator?: string
  period: string
}

// Bonus Breakdown
export interface BonusBreakdown {
  profitContribution: number
  positionValue: number
  performance: number
  projectBonus?: number
  specialBonus?: number
}

// Bonus Coefficients (新增)
export interface BonusCoefficients {
  businessLine: number  // 业务线系数 0.8-1.5
  city: number          // 城市系数 0.8-1.3
  time: number          // 时间系数 0.5-1.1
  benchmark: number     // 岗位基准值 0.1-3.0
}

// Project Participation
export interface ProjectParticipation {
  projectId: number
  projectName: string
  role: string
  joinDate: string
  endDate?: string
  contributionScore?: number
  bonusAmount: number
  status: string
}

// Three-Dimensional Score
export interface ThreeDimensionalScore {
  profitContribution: number
  positionValue: number
  performance: number
  finalScore: number
  calculationDate: string
  weights: {
    profit: number
    position: number
    performance: number
  }
}

// Historical Record
export interface HistoricalBonusRecord {
  id: number
  period: string
  amount: number
  type: 'regular' | 'project' | 'special'
  status: 'paid' | 'pending' | 'cancelled'
  breakdown?: BonusBreakdown
  calculationDate: string
  paymentDate?: string
}

// Simulation Scenario
export interface SimulationScenario {
  name: string
  performanceAdjustment?: number
  profitAdjustment?: number
  positionAdjustment?: number
  projectParticipation?: boolean
  additionalProjects?: number
}

export interface SimulationResult {
  scenario: string
  originalBonus: number
  projectedBonus: number
  difference: number
  percentageChange: number
  breakdown: BonusBreakdown
  description: string
}

// Improvement Suggestion
export interface ImprovementSuggestion {
  id: string
  category: 'performance' | 'skills' | 'projects' | 'collaboration'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  potentialImpact: number
  timeFrame: string
  actionSteps: string[]
  statusCode: number  // 0-待实施, 1-待审核, 2-已完成, -1-已拒绝
  completed?: boolean  // 兼容旧字段
  source?: 'manual' | 'auto'  // 新增：标识是手动录入还是自动生成
  createdByName?: string       // 新增：创建人姓名
  createdAt?: string           // 新增：创建时间
  status?: string              // 旧字段，兼容保留
  implementationDate?: string
  implementationFeedback?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  reviewComments?: string
}

// Peer Comparison
export interface PeerComparison {
  totalPeers: number
  averageBonus: number
  medianBonus: number
  percentile: number
  myRanking: 'top' | 'average' | 'bottom'
  myPercentile: number
  topQuartile: number
  bottomQuartile: number
  comparedToAverage: number
  comparedToMedian: number
  message: string
}

// Trend Analysis
export interface TrendAnalysis {
  trend: 'rising' | 'declining' | 'stable' | 'insufficient_data'
  growthRate: number
  volatility: number
  recentAverage: number
  olderAverage: number
  totalPeriods: number
  message: string
}

// API Response Types
export interface PersonalBonusOverviewResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentPeriod: string
  bonusData: {
    totalBonus: number
    bonusBreakdown: BonusBreakdown
    coefficients?: BonusCoefficients  // 新增系数信息
    ranking?: {
      scoreRank: number | null
      percentileRank: number
      departmentRank: number | null
      levelRank: number | null
    }
    scoreDetails?: {
      profitContributionScore: number
      positionValueScore: number
      performanceScore: number
      normalizedProfitScore: number
      normalizedPositionScore: number
      normalizedPerformanceScore: number
      weightedProfitScore: number
      weightedPositionScore: number
      weightedPerformanceScore: number
      totalScore: number
      adjustedScore: number
      finalScore: number
    }
    weightConfig?: {
      profitContributionRate: number
      positionValueRate: number
      performanceRate: number
    }
    trend?: {
      previousPeriodScore: number
      scoreChangeRate: number
      trendDirection: string | null
    }
    dataQuality?: any
    profitDetails?: any  // 利润贡献明细
    positionDetails?: any  // 岗位价值明细
    performanceDetails?: any  // 绩效表现明细
    projectBonus?: {
      totalAmount: number
      projectCount: number
      allocations: Array<{
        projectName: string
        amount: number
        role: string
      }>
    }
  }
  performanceMetrics?: PerformanceMetrics
  message?: string
}

export interface PersonalBonusHistoryResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  history: HistoricalBonusRecord[]
  summary: {
    totalEarnings: number
    averageBonus: number
    bestMonth: {
      period: string
      amount: number
    }
    totalPeriods: number
  }
  message?: string
}

export interface BonusSimulationResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentBonus: number
  scenarios: SimulationResult[]
  recommendations: string[]
  message?: string
}

export interface ImprovementSuggestionsResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  suggestions: ImprovementSuggestion[]
  categories: {
    performance: ImprovementSuggestion[]
    skills: ImprovementSuggestion[]
    projects: ImprovementSuggestion[]
    collaboration: ImprovementSuggestion[]
  }
  prioritySuggestions: ImprovementSuggestion[]
  message?: string
}

export interface PerformanceDetailResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentPeriod: string
  performanceMetrics: PerformanceMetrics | null
  bonusImpact: {
    performanceContribution: number
    totalBonus: number
    performanceRatio: number
  }
  message?: string
}

export interface ProjectParticipationResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentPeriod: string
  projectBonus: {
    totalAmount: number
    projectCount: number
    allocations: ProjectParticipation[]
  }
  summary: {
    totalProjectBonus: number
    activeProjects: number
    averageBonusPerProject: number
    projectContributionRatio: number
  }
  message?: string
}

export interface ThreeDimensionalDetailResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentPeriod: string
  threeDimensionalScore: ThreeDimensionalScore | null
  bonusBreakdown: BonusBreakdown
  totalBonus: number
  scoreAnalysis?: {
    profitContributionLevel: string
    positionValueLevel: string
    performanceLevel: string
    overallLevel: string
  }
  message?: string
}

export interface BonusTrendResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  summary: {
    totalEarnings: number
    averageBonus: number
    bestMonth: {
      period: string
      amount: number
    }
    totalPeriods: number
  }
  trendAnalysis: TrendAnalysis
  chartData: {
    periods: string[]
    totalAmounts: number[]
    regularBonuses: Array<{ period: string; amount: number }>
    projectBonuses: Array<{ period: string; amount: number }>
  }
  message?: string
}

export interface PeerComparisonResponse {
  user: PersonalUser
  employee: PersonalEmployee | null
  currentPeriod: string
  myBonus: number
  comparison: PeerComparison | null
  message?: string
}

// API Functions

/**
 * Get personal bonus overview
 */
export const getPersonalBonusOverview = (period?: string, viewMode?: 'byTime' | 'byProject') => {
  return request<PersonalBonusOverviewResponse>({
    url: '/personal-bonus/overview',
    method: 'get',
    params: { period, viewMode }
  })
}

/**
 * Get personal bonus history
 */
export const getPersonalBonusHistory = (limit = 12) => {
  return request<PersonalBonusHistoryResponse>({
    url: '/personal-bonus/history',
    method: 'get',
    params: { limit }
  })
}

/**
 * Get bonus simulation analysis
 */
export const getBonusSimulation = (scenarios?: Record<string, SimulationScenario>) => {
  if (scenarios && Object.keys(scenarios).length > 0) {
    return request<BonusSimulationResponse>({
      url: '/personal-bonus/simulation',
      method: 'post',
      data: { scenarios }
    })
  } else {
    return request<BonusSimulationResponse>({
      url: '/personal-bonus/simulation',
      method: 'get'
    })
  }
}

/**
 * Get improvement suggestions
 */
export const getImprovementSuggestions = () => {
  return request<ImprovementSuggestionsResponse>({
    url: '/personal-bonus/improvement-suggestions',
    method: 'get'
  })
}

/**
 * Get performance detail
 */
export const getPerformanceDetail = (period?: string) => {
  return request<PerformanceDetailResponse>({
    url: '/personal-bonus/performance',
    method: 'get',
    params: { period }
  })
}

/**
 * Get project participation details
 */
export const getProjectParticipation = (period?: string) => {
  return request<ProjectParticipationResponse>({
    url: '/personal-bonus/projects',
    method: 'get',
    params: { period }
  })
}

/**
 * Get three-dimensional breakdown
 */
export const getThreeDimensionalDetail = (period?: string) => {
  return request<ThreeDimensionalDetailResponse>({
    url: '/personal-bonus/three-dimensional',
    method: 'get',
    params: { period }
  })
}

/**
 * Get bonus trend analysis
 */
export const getBonusTrend = (periods = 12) => {
  return request<BonusTrendResponse>({
    url: '/personal-bonus/trend',
    method: 'get',
    params: { periods }
  })
}

/**
 * Get peer comparison
 */
export const getPeerComparison = (period?: string) => {
  return request<PeerComparisonResponse>({
    url: '/personal-bonus/peer-comparison',
    method: 'get',
    params: { period }
  })
}