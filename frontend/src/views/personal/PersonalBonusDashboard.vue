<template>
  <div class="personal-bonus-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-title">
          <h2>个人奖金仪表板</h2>
          <el-tag v-if="selectedPeriod" type="primary" size="large" class="period-tag">
            {{ getPeriodLabel(selectedPeriod) }}
          </el-tag>
          <el-tag v-else type="info" size="large" class="period-tag">
            全部期间
          </el-tag>
        </div>
        <!-- 时间筛选 -->
        <div class="period-filter">
          <el-select
            v-model="selectedPeriod"
            placeholder="选择统计期间"
            @change="handlePeriodChange"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="option in periodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div class="header-controls">
          <!-- 统计维度切换 -->
          <el-tabs v-model="statisticsViewMode" @tab-change="handleViewModeChange" class="view-mode-tabs">
            <el-tab-pane label="按项目统计" name="byProject">
              <template #label>
                <span class="tab-label">
                  <el-icon><Folder /></el-icon>
                  按项目统计
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="按时间统计" name="byTime">
              <template #label>
                <span class="tab-label">
                  <el-icon><Calendar /></el-icon>
                  按时间统计
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- No Employee Associated Message -->
    <div v-else-if="!employee" class="no-employee-message">
      <el-empty description="您尚未关联员工记录">
        <template #description>
          <p>您尚未关联员工记录，请联系HR进行账户关联</p>
        </template>
        <el-button type="primary" @click="contactHR">联系HR</el-button>
      </el-empty>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- 按项目统计视图 -->
      <template v-if="statisticsViewMode === 'byProject'">
        <ProjectBasedView :project-data="projectData" />
        
        <!-- 绩效与改进建议 -->
        <el-row :gutter="20" class="detail-section">
          <el-col :span="12">
            <el-card class="detail-card" header="绩效表现">
              <div v-if="performanceMetrics" class="performance-detail">
                <div class="performance-score">
                  <div class="score-circle">
                    <div class="score-value">{{ ((performanceMetrics?.overallScore || 0) * 100).toFixed(0) }}</div>
                    <div class="score-label">综合评分</div>
                  </div>
                </div>
                <div class="performance-metrics">
                  <div class="metric-item">
                    <span class="metric-name">工作效率</span>
                    <el-progress :percentage="(performanceMetrics?.efficiency || 0) * 100" />
                  </div>
                  <div class="metric-item">
                    <span class="metric-name">创新能力</span>
                    <el-progress :percentage="(performanceMetrics?.innovation || 0) * 100" />
                  </div>
                  <div class="metric-item">
                    <span class="metric-name">团队协作</span>
                    <el-progress :percentage="(performanceMetrics?.teamwork || 0) * 100" />
                  </div>
                  <div v-if="performanceMetrics?.leadership" class="metric-item">
                    <span class="metric-name">领导力</span>
                    <el-progress :percentage="(performanceMetrics.leadership * 100)" />
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无绩效数据" />
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="suggestions-card" header="改进建议">
              <ImprovementSuggestions
                :suggestions="improvementSuggestions"
                :loading="suggestionsLoading"
                @suggestion-complete="handleSuggestionComplete"
              />
            </el-card>
          </el-col>
        </el-row>
      </template>
      
      <!-- 按时间统计视图（原有逻辑） -->
      <template v-else>
      <!-- Overview Cards -->
      <BonusOverviewCards :bonus-data="bonusData" />

      <!-- 排名信息卡片 -->
      <BonusRankingCard :ranking="bonusData.ranking" :trend="bonusData.trend" />

      <!-- 系数信息卡片 -->
      <BonusCoefficientsCard :coefficients="bonusData.coefficients" />

      <!-- Three-Dimensional Analysis & Trends -->
      <el-row :gutter="20" class="analysis-section">
        <el-col :span="12">
          <el-card class="analysis-card">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>三维奖金构成分析</span>
                <el-button 
                  v-if="isManagementRole" 
                  type="primary" 
                  size="small" 
                  @click="showScoreDetails = true"
                >
                  <el-icon><DataAnalysis /></el-icon>
                  查看详细评分
                </el-button>
              </div>
            </template>
            <ThreeDimensionalBreakdown
              :breakdown="bonusData.bonusBreakdown"
              :total="bonusData.totalBonus"
              :loading="loading"
            />
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="analysis-card" header="奖金趋势分析">
            <HistoricalTrendsChart
              :trend-data="trendData"
              :loading="trendLoading"
              @period-change="handleTrendPeriodChange"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- Performance & Projects -->
      <el-row :gutter="20" class="detail-section">
        <el-col :span="8">
          <el-card class="detail-card" header="绩效表现">
            <div v-if="performanceMetrics" class="performance-detail">
              <div class="performance-score">
                <div class="score-circle">
                  <div class="score-value">{{ ((performanceMetrics?.overallScore || 0) * 100).toFixed(0) }}</div>
                  <div class="score-label">综合评分</div>
                </div>
              </div>
              <div class="performance-metrics">
                <div class="metric-item">
                  <span class="metric-name">工作效率</span>
                  <el-progress :percentage="(performanceMetrics?.efficiency || 0) * 100" />
                </div>
                <div class="metric-item">
                  <span class="metric-name">创新能力</span>
                  <el-progress :percentage="(performanceMetrics?.innovation || 0) * 100" />
                </div>
                <div class="metric-item">
                  <span class="metric-name">团队协作</span>
                  <el-progress :percentage="(performanceMetrics?.teamwork || 0) * 100" />
                </div>
                <div v-if="performanceMetrics?.leadership" class="metric-item">
                  <span class="metric-name">领导力</span>
                  <el-progress :percentage="(performanceMetrics.leadership * 100)" />
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无绩效数据" />
          </el-card>
        </el-col>

        <el-col :span="16">
          <ProjectBonusDetail :project-data="projectData" @tab-change="handleTabChange" />
        </el-col>
      </el-row>

      <!-- Simulation & Suggestions -->
      <el-row :gutter="20" class="interaction-section">
        <el-col :span="14">
          <el-card class="simulation-card" header="奖金模拟分析">
            <BonusSimulation
              :current-bonus="bonusData.totalBonus"
              :current-breakdown="bonusData.bonusBreakdown"
              :employee="employee"
              @simulation-run="handleSimulationResult"
            />
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card class="suggestions-card" header="改进建议">
            <ImprovementSuggestions
              :suggestions="improvementSuggestions"
              :loading="suggestionsLoading"
              @suggestion-complete="handleSuggestionComplete"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- Peer Comparison (if available) -->
      <el-row v-if="peerComparison" :gutter="20" class="comparison-section">
        <el-col :span="24">
          <el-card header="同级别员工对比（匿名）">
            <div class="peer-comparison">
              <div class="comparison-overview">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="comparison-stat">
                      <div class="stat-value">{{ peerComparison?.totalPeers || 0 }}</div>
                      <div class="stat-label">对比员工数</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="comparison-stat">
                      <div class="stat-value">第{{ peerComparison?.myPercentile || 0 }}百分位</div>
                      <div class="stat-label">我的排名</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="comparison-stat">
                      <div class="stat-value">¥{{ formatNumber(peerComparison?.averageBonus || 0) }}</div>
                      <div class="stat-label">平均奖金</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="comparison-stat">
                      <div class="stat-value" :class="getComparisonClass(peerComparison?.comparedToAverage || 0)">
                        {{ (peerComparison?.comparedToAverage || 0) >= 0 ? '+' : '' }}{{ formatNumber(peerComparison?.comparedToAverage || 0) }}
                      </div>
                      <div class="stat-label">与平均值差异</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <div class="comparison-message">
                <el-alert
                  :title="peerComparison?.message || '暂无对比数据'"
                  :type="getPeerComparisonAlertType(peerComparison?.myRanking || 'average')"
                  show-icon
                  :closable="false"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      </template>
    </div>

    <!-- 三维评分明细对话框 -->
    <el-dialog
      v-model="showScoreDetails"
      title="三维评分明细"
      width="90%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <ScoreDetails
        :employee-id="employee?.employeeNumber"
        :period="currentPeriod"
        :profit-score="bonusData.scoreDetails?.normalizedProfitScore || 0"
        :position-score="bonusData.scoreDetails?.normalizedPositionScore || 0"
        :performance-score="bonusData.scoreDetails?.normalizedPerformanceScore || 0"
        :profit-details="scoreDetailsData.profitDetails"
        :position-details="scoreDetailsData.positionDetails"
        :performance-details="scoreDetailsData.performanceDetails"
        :historical-data="scoreDetailsData.historicalData"
        :weight-config="bonusData.weightConfig || undefined"
        :score-details="bonusData.scoreDetails || undefined"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { Refresh, Download, DataAnalysis, Folder, Calendar } from '@element-plus/icons-vue'
import { generateQuarterOptions, parsePeriod } from '@/utils/periodUtils'
import {
  getPersonalBonusOverview,
  getBonusTrend,
  getProjectParticipation,
  getImprovementSuggestions,
  getPeerComparison,
  type PersonalEmployee,
  type PerformanceMetrics,
  type ImprovementSuggestion,
  type PeerComparison,
  type BonusBreakdown
} from '@/api/personalBonus'
import ThreeDimensionalBreakdown from './components/ThreeDimensionalBreakdown.vue'
import HistoricalTrendsChart from './components/HistoricalTrendsChart.vue'
import BonusSimulation from './components/BonusSimulation.vue'
import ImprovementSuggestions from './components/ImprovementSuggestions.vue'
import ScoreDetails from '@/components/ScoreDetails.vue'
import BonusOverviewCards from './components/BonusOverviewCards.vue'
import BonusRankingCard from './components/BonusRankingCard.vue'
import BonusCoefficientsCard from './components/BonusCoefficientsCard.vue'
import ProjectBonusDetail from './components/ProjectBonusDetail.vue'
import ProjectBasedView from './components/ProjectBasedView.vue'

// Reactive data
const loading = ref(false)
const trendLoading = ref(false)
const suggestionsLoading = ref(false)
const selectedPeriod = ref('')
const currentPeriod = ref('')
const showScoreDetails = ref(false)
const statisticsViewMode = ref<'byTime' | 'byProject'>('byProject')
const periodOptions = ref(generateQuarterOptions(3))

const userStore = useUserStore()

const isManagementRole = computed(() => {
  return userStore.hasAnyPermission(['admin', 'hr', 'project_manager', 'finance:view', 'finance:manage'])
})

const employee = ref<PersonalEmployee | null>(null)
const bonusData = reactive({
  totalBonus: 0,
  bonusBreakdown: {
    profitContribution: 0,
    positionValue: 0,
    performance: 0,
    projectBonus: 0
  } as BonusBreakdown,
  coefficients: null as any,
  ranking: null as any,
  scoreDetails: null as any,
  weightConfig: null as any,
  trend: null as any,
  dataQuality: null as any
})

const performanceMetrics = ref<PerformanceMetrics | null>(null)
const projectData = ref<any>(null)
const improvementSuggestions = ref<ImprovementSuggestion[]>([])
const peerComparison = ref<PeerComparison | null>(null)
const trendData = ref<any>(null)

const scoreDetailsData = reactive({
  profitScore: 0,
  positionScore: 0,
  performanceScore: 0,
  profitDetails: {},
  positionDetails: {},
  performanceDetails: {},
  historicalData: []
})

const formatNumber = (num: number) => new Intl.NumberFormat('zh-CN').format(num || 0)

const getPeerComparisonAlertType = (ranking: string) => {
  const rankingMap: Record<string, string> = {
    'top': 'success',
    'average': 'info',
    'bottom': 'warning'
  }
  return rankingMap[ranking] || 'info'
}

const getComparisonClass = (value: number) => value >= 0 ? 'positive' : 'negative'

const getPeriodLabel = (period: string) => {
  if (!period) return '全部期间'
  const parsed = parsePeriod(period)
  return parsed.label
}

const handleViewModeChange = async (viewMode: string) => {
  console.log('统计维度切换:', viewMode)
  statisticsViewMode.value = viewMode as 'byTime' | 'byProject'
  await loadDashboardData()
}

const handlePeriodChange = async (period: string) => {
  console.log('时间筛选变更:', period)
  selectedPeriod.value = period
  await loadDashboardData()
}

const handleTabChange = (tabName: string) => {
  console.log('Tab changed:', tabName)
  // 保存Tab状态，但不重新加载数据
  // Tab切换是组件内部状态变化，不需要重新请求后端
}

const handleTrendPeriodChange = (periods: number) => {
  loadTrendData(periods)
}

const handleSimulationResult = (results: any) => {
  console.log('Simulation results:', results)
  ElMessage.success('模拟分析完成')
}

const handleSuggestionComplete = (suggestionId: string) => {
  const suggestion = improvementSuggestions.value.find(s => s.id === suggestionId)
  if (suggestion) {
    suggestion.completed = true
    ElMessage.success('建议已标记为完成')
  }
}

const refreshData = async () => {
  await loadDashboardData()
}

const exportReport = async () => {
  try {
    ElMessage.info('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const contactHR = () => {
  ElMessageBox.alert(
    '请联系HR部门进行员工账户关联，联系方式：hr@company.com 或 内线1001',
    '联系HR',
    { confirmButtonText: '确定', type: 'info' }
  )
}

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    console.log('📦 开始加载仪表板数据')
    console.log('  - 期间:', selectedPeriod.value)
    console.log('  - 视图模式:', statisticsViewMode.value)
    
    const overviewRes = await getPersonalBonusOverview(selectedPeriod.value, statisticsViewMode.value)
    const overviewData = overviewRes.data
    
    console.log('📦 Overview 接口返回:', overviewRes)
    console.log('📦 Overview data:', overviewData)
    
    if (!overviewData.employee) {
      employee.value = null
      console.error('❌ 未找到员工信息')
      return
    }
    
    employee.value = overviewData.employee
    currentPeriod.value = selectedPeriod.value
    
    console.log('👤 员工信息:', employee.value)
    console.log('💰 原始 bonusData:', overviewData.bonusData)
    console.log('💰 bonusData.totalBonus:', overviewData.bonusData?.totalBonus)
    console.log('💰 bonusData.bonusBreakdown:', overviewData.bonusData?.bonusBreakdown)
    
    Object.assign(bonusData, overviewData.bonusData)
    
    console.log('💰 赋值后 bonusData:', bonusData)
    
    if (overviewData.bonusData) {
      scoreDetailsData.profitDetails = overviewData.bonusData.profitDetails || {}
      scoreDetailsData.positionDetails = overviewData.bonusData.positionDetails || {}
      scoreDetailsData.performanceDetails = overviewData.bonusData.performanceDetails || {}
      
      if (overviewData.bonusData.scoreDetails) {
        scoreDetailsData.profitScore = overviewData.bonusData.scoreDetails.normalizedProfitScore || 0
        scoreDetailsData.positionScore = overviewData.bonusData.scoreDetails.normalizedPositionScore || 0
        scoreDetailsData.performanceScore = overviewData.bonusData.scoreDetails.normalizedPerformanceScore || 0
      }
    }
    
    // 绩效数据已在 overview 中返回
    if (overviewData.performanceMetrics) {
      performanceMetrics.value = overviewData.performanceMetrics
      console.log('✅ 绩效数据加载成功:', performanceMetrics.value)
    } else {
      console.warn('⚠️ 未找到绩效数据')
    }
    
    const [projectRes, suggestionsRes, comparisonRes] = await Promise.allSettled([
      getProjectParticipation(selectedPeriod.value),  // 传递选中的期间
      getImprovementSuggestions(),
      getPeerComparison(selectedPeriod.value)
    ])
    
    console.log('📂 项目数据返回:', projectRes)
    if (projectRes.status === 'fulfilled' && projectRes.value.data.projectBonus) {
      projectData.value = projectRes.value.data
      console.log('✅ 项目奖金数据:', projectData.value.projectBonus)
    } else {
      console.error('❌ 项目数据加载失败')
    }
    
    if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value.data) {
      const suggestionData = suggestionsRes.value.data
      
      // 接口直接返回 suggestions 数组
      if (Array.isArray(suggestionData.suggestions)) {
        improvementSuggestions.value = suggestionData.suggestions
        console.log('✅ 改进建议加载成功:', improvementSuggestions.value.length, '条')
      } else {
        console.error('❌ suggestions 不是数组:', typeof suggestionData.suggestions)
        improvementSuggestions.value = []
      }
    } else {
      console.warn('⚠️ 改进建议加载失败:', suggestionsRes)
    }
    
    if (comparisonRes.status === 'fulfilled' && comparisonRes.value.data.comparison) {
      peerComparison.value = comparisonRes.value.data.comparison
    }
  } catch (error) {
    console.error('❌ Failed to load dashboard data:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadTrendData = async (periods = 12) => {
  trendLoading.value = true
  
  try {
    const trendRes = await getBonusTrend(periods)
    trendData.value = trendRes.data
  } catch (error) {
    console.error('Failed to load trend data:', error)
    ElMessage.error('加载趋势数据失败')
  } finally {
    trendLoading.value = false
  }
}

onMounted(() => {
  // 不设置 period，让后端返回所有历史数据
  selectedPeriod.value = ''
  currentPeriod.value = ''
  
  console.log('🚀 组件挂载，开始加载数据')
  console.log('  - selectedPeriod:', selectedPeriod.value)
  console.log('  - statisticsViewMode:', statisticsViewMode.value)
  
  loadDashboardData()
  loadTrendData()
})
</script>

<style scoped lang="scss">
.personal-bonus-dashboard {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-left {
  flex: 1;
  
  h2 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  .period-tag {
    font-size: 14px;
    padding: 4px 12px;
  }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.period-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.view-mode-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    padding: 8px 20px;
    font-size: 14px;
    height: auto;
    line-height: 1.5;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;

  .el-icon {
    font-size: 16px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.no-employee-message {
  background: white;
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
}

.analysis-section,
.detail-section,
.interaction-section,
.comparison-section {
  margin-bottom: 20px;
}

.analysis-card,
.detail-card,
.simulation-card,
.suggestions-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  height: 100%;
}

.performance-detail {
  padding: 10px 0;
}

.performance-score {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  opacity: 0.8;
}

.performance-metrics {
  space-y: 12px;
}

.metric-item {
  margin-bottom: 12px;
}

.metric-name {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.peer-comparison {
  padding: 10px 0;
}

.comparison-overview {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comparison-stat {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;

  &.positive {
    color: #67c23a;
  }

  &.negative {
    color: #f56c6c;
  }
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.comparison-message {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .personal-bonus-dashboard {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .analysis-section .el-col,
  .detail-section .el-col,
  .interaction-section .el-col {
    margin-bottom: 16px;
  }
}
</style>