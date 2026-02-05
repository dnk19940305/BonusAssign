<template>
  <el-dialog
    v-model="dialogVisible"
    title="我的项目奖金详情"
    width="1000px"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="bonus-detail">
      <el-row :gutter="20" v-if="bonusData">
        <!-- 奖金概况卡片 -->
        <el-col :span="24">
          <el-card class="detail-card overview-card">
            <template #header>
              <div class="card-header">
                <span>奖金概况</span>
                <el-tag :type="getBonusStatusType(bonusData.bonusStatus)" size="large">
                  {{ getBonusStatusLabel(bonusData.bonusStatus) }}
                </el-tag>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">项目奖金</div>
                  <div class="stat-value primary">{{ formatCurrency(bonusData.bonusAmount) }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">角色权重</div>
                  <div class="stat-value">{{ bonusData.roleWeight }}</div>
                </div>
              </el-col>

              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-label">参与度</div>
                  <div class="stat-value">{{ bonusData.participationRatio }}%</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>

        <!-- 详细信息 -->
        <el-col :span="24">
          <el-card class="detail-card">
            <template #header>
              <span>详细信息</span>
            </template>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目名称">
                {{ bonusData.projectName }}
              </el-descriptions-item>
              <el-descriptions-item label="奖金期间">
                {{ bonusData.period }}
              </el-descriptions-item>
              <el-descriptions-item label="我的角色">
                <el-tag type="primary">{{ bonusData.roleName }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="项目奖金池">
                {{ formatCurrency(bonusData.poolTotalAmount) }}
              </el-descriptions-item>
              <el-descriptions-item label="计算日期" v-if="bonusData.calculatedAt">
                {{ formatDateTime(bonusData.calculatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="审批日期" v-if="bonusData.approvedAt">
                {{ formatDateTime(bonusData.approvedAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- 计算公式卡片 -->
        <el-col :span="24">
          <el-card class="detail-card formula-card">
            <template #header>
              <div class="card-header">
                <span>计算说明</span>
                <el-button size="small" @click="showFormulaDetail">
                  <el-icon><QuestionFilled /></el-icon>
                  查看详细说明
                </el-button>
              </div>
            </template>

            <div class="formula-content">
              <div class="formula-title">计算公式：</div>
              <div class="formula-expression">
                项目奖金 = 项目奖金池 × 角色权重 × 参与度
              </div>

              <el-divider />

              <div class="formula-calculation">
                <div class="calculation-step">
                  <span class="step-label">项目奖金池:</span>
                  <span class="step-value">{{ formatCurrency(bonusData.poolTotalAmount) }}</span>
                </div>
                <div class="calculation-operator">×</div>
                <div class="calculation-step">
                  <span class="step-label">角色权重:</span>
                  <span class="step-value">{{ bonusData.roleWeight }}</span>
                </div>
                <div class="calculation-operator">×</div>
                <div class="calculation-step">
                  <span class="step-label">参与度:</span>
                  <span class="step-value">{{ bonusData.participationRatio }}%</span>
                </div>
                <div class="calculation-operator">=</div>
                <div class="calculation-result">
                  <span class="result-label">我的项目奖金:</span>
                  <span class="result-value">{{ formatCurrency(bonusData.bonusAmount) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 奖金趋势图表（如果有历史数据） -->
        <el-col :span="24" v-if="historicalData.length > 0">
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <span>历史奖金趋势</span>
                <el-button size="small" @click="loadHistoricalData">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </template>

            <div ref="chartContainer" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 奖金构成分析 -->
        <el-col :span="12">
          <el-card class="detail-card">
            <template #header>
              <span>奖金影响因素</span>
            </template>

            <div class="factor-list">
              <div class="factor-item">
                <div class="factor-header">
                  <span class="factor-name">角色权重</span>
                  <span class="factor-score">{{ bonusData.roleWeight }}</span>
                </div>
                <el-progress
                  :percentage="calculateFactorPercentage(bonusData.roleWeight, 5)"
                  :color="getProgressColor(bonusData.roleWeight, 5)"
                />
                <div class="factor-desc">基于角色的基础奖金分配权重</div>
              </div>



              <div class="factor-item">
                <div class="factor-header">
                  <span class="factor-name">参与度</span>
                  <span class="factor-score">{{ bonusData.participationRatio }}%</span>
                </div>
                <el-progress
                  :percentage="bonusData.participationRatio"
                  :color="getProgressColor(bonusData.participationRatio, 100)"
                />
                <div class="factor-desc">在项目中的工作投入占比</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 与平均水平对比 -->
        <el-col :span="12">
          <el-card class="detail-card">
            <template #header>
              <span>奖金对比分析</span>
            </template>

            <div class="comparison-content">
              <div class="comparison-item">
                <div class="comparison-label">
                  <el-icon><User /></el-icon>
                  我的奖金
                </div>
                <div class="comparison-value highlight">
                  {{ formatCurrency(bonusData.bonusAmount) }}
                </div>
              </div>

              <el-divider />

              <div class="comparison-item" v-if="averageBonus > 0">
                <div class="comparison-label">
                  <el-icon><User /></el-icon>
                  项目平均
                </div>
                <div class="comparison-value">
                  {{ formatCurrency(averageBonus) }}
                </div>
              </div>

              <div class="comparison-indicator" v-if="averageBonus > 0">
                <el-tag
                  :type="bonusData.bonusAmount >= averageBonus ? 'success' : 'warning'"
                  size="large"
                >
                  {{ bonusData.bonusAmount >= averageBonus ? '高于平均' : '低于平均' }}
                  {{ formatPercent(Math.abs((bonusData.bonusAmount - averageBonus) / averageBonus)) }}
                </el-tag>
              </div>

              <el-alert
                v-if="averageBonus > 0"
                :type="bonusData.bonusAmount >= averageBonus ? 'success' : 'info'"
                :closable="false"
                show-icon
                class="mt-3"
              >
                <template #title>
                  <span v-if="bonusData.bonusAmount >= averageBonus">
                    表现优秀！你的项目奖金高于团队平均水平
                  </span>
                  <span v-else>
                    继续努力！提升绩效和参与度可以获得更高奖金
                  </span>
                </template>
              </el-alert>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="success" @click="exportData">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled, Refresh, User, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// Props & Emits
interface Props {
  modelValue: boolean
  bonusData?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  bonusData: null
})

const emit = defineEmits<Emits>()

// Refs
const loading = ref(false)
const chartContainer = ref<HTMLElement>()
const historicalData = ref<any[]>([])
const averageBonus = ref(0)
let chart: echarts.ECharts | null = null

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Watch dialog visibility
watch(dialogVisible, async (visible) => {
  if (visible && props.bonusData) {
    await loadHistoricalData()
    await loadAverageBonus()
    nextTick(() => {
      if (historicalData.value.length > 0) {
        initChart()
      }
    })
  } else {
    if (chart) {
      chart.dispose()
      chart = null
    }
  }
})

// Load historical bonus data
const loadHistoricalData = async () => {
  // Mock data - replace with actual API call
  historicalData.value = [
    { period: '2024Q1', amount: 8000 },
    { period: '2024Q2', amount: 9500 },
    { period: '2024Q3', amount: 10200 },
    { period: '2024Q4', amount: props.bonusData?.bonusAmount || 11000 }
  ]
}

// Load average bonus for comparison
const loadAverageBonus = async () => {
  // Mock data - replace with actual API call
  averageBonus.value = 9500
}

// Initialize chart
const initChart = () => {
  if (!chartContainer.value || historicalData.value.length === 0) return

  chart = echarts.init(chartContainer.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>奖金: ¥${param.value.toLocaleString()}`
      }
    },
    xAxis: {
      type: 'category',
      data: historicalData.value.map(d => d.period),
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
        color: '#606266'
      }
    },
    series: [
      {
        name: '项目奖金',
        type: 'line',
        data: historicalData.value.map(d => d.amount),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ],
    grid: {
      left: '60px',
      right: '20px',
      top: '20px',
      bottom: '40px'
    }
  }

  chart.setOption(option)
}

// Format functions
const formatCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) return '¥0.00'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const formatPercent = (value: number): string => {
  if (!value || isNaN(value)) return '0%'
  return `${(value * 100).toFixed(1)}%`
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// Bonus status helpers
const getBonusStatusType = (status: string): string => {
  const types: Record<string, string> = {
    calculated: 'warning',
    approved: 'primary',
    distributed: 'success'
  }
  return types[status] || 'info'
}

const getBonusStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    calculated: '已计算',
    approved: '已审批',
    distributed: '已发放'
  }
  return labels[status] || '未知'
}

// Calculate factor percentage
const calculateFactorPercentage = (value: number, max: number): number => {
  return Math.min((value / max) * 100, 100)
}

// Get progress bar color
const getProgressColor = (value: number, max: number): string => {
  const percentage = (value / max) * 100
  if (percentage < 30) return '#F56C6C'
  if (percentage < 60) return '#E6A23C'
  if (percentage < 90) return '#409EFF'
  return '#67C23A'
}

// Show formula detail
const showFormulaDetail = () => {
  ElMessageBox.alert(
    `
      <div style="line-height: 1.8;">
        <h4>奖金计算公式说明：</h4>
        <p><strong>1. 项目奖金池：</strong>项目总奖金额度，根据项目规模和预算确定</p>
        <p><strong>2. 角色权重：</strong>不同角色的基础奖金分配权重，反映角色责任大小</p>
        <p><strong>3. 参与度：</strong>在项目中的工作时间投入占比</p>
        <br/>
        <p style="color: #909399;">最终奖金 = 这三个因素的乘积</p>
      </div>
    `,
    '计算公式详解',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '我知道了'
    }
  )
}

// Export data
const exportData = () => {
  ElMessage.success('导出功能开发中...')
  // TODO: Implement export functionality
}

// Handle close
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.bonus-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.overview-card :deep(.el-card__header) {
  border-bottom-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.stat-item {
  text-align: center;
  padding: 12px;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.stat-value.primary {
  font-size: 32px;
}

.formula-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.formula-content {
  padding: 16px;
}

.formula-title {
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
}

.formula-expression {
  font-size: 16px;
  color: #303133;
  background: #F0F9FF;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
  font-weight: 500;
}

.formula-calculation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.calculation-step {
  background: #F5F7FA;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-label {
  font-size: 12px;
  color: #909399;
}

.step-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.calculation-operator {
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}

.calculation-result {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: white;
  flex: 1;
  min-width: 200px;
}

.result-label {
  font-size: 13px;
  opacity: 0.9;
}

.result-value {
  font-size: 24px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.factor-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.factor-item {
  padding: 16px;
  background: #F5F7FA;
  border-radius: 8px;
}

.factor-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.factor-name {
  font-weight: 500;
  color: #303133;
}

.factor-score {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.factor-desc {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.comparison-content {
  padding: 16px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.comparison-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.comparison-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.comparison-value.highlight {
  color: #409EFF;
  font-size: 24px;
}

.comparison-indicator {
  text-align: center;
  margin: 20px 0;
}

.mt-3 {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
