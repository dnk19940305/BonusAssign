<!--
  三维评分明细展示组件
  展示利润贡献、岗位价值、绩效表现的详细评分数据
-->
<template>
  <div class="score-details-container">
    <el-card class="score-card">
      <template #header>
        <div class="card-header">
          <span>📊 三维评分明细</span>
          <el-tag :type="getOverallScoreType(overallScore)">
            综合得分: {{ overallScore.toFixed(2) }}
          </el-tag>
        </div>
      </template>

      <!-- 评分概览 -->
      <div class="score-overview">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="dimension-card profit">
              <div class="dimension-icon">💰</div>
              <div class="dimension-content">
                <div class="dimension-title">利润贡献</div>
                <div class="dimension-score">{{ profitScore.toFixed(2) }}</div>
                <div class="dimension-weight">权重: {{ (weightConfig.profitContributionRate || 40) }}%</div>
                <div class="weighted-score">
                  加权得分: {{ ((profitScore * (weightConfig.profitContributionRate || 40) / 100)).toFixed(2) }}
                </div>
              </div>
              <el-progress
                :percentage="profitScore"
                :color="getProgressColorByScore(profitScore)"
                :stroke-width="8"
              />
            </div>
          </el-col>

          <el-col :span="8">
            <div class="dimension-card position">
              <div class="dimension-icon">🎯</div>
              <div class="dimension-content">
                <div class="dimension-title">岗位价值</div>
                <div class="dimension-score">{{ positionScore.toFixed(2) }}</div>
                <div class="dimension-weight">权重: {{ (weightConfig.positionValueRate || 30) }}%</div>
                <div class="weighted-score">
                  加权得分: {{ ((positionScore * (weightConfig.positionValueRate || 30) / 100)).toFixed(2) }}
                </div>
              </div>
              <el-progress
                :percentage="positionScore"
                :color="getProgressColorByScore(positionScore)"
                :stroke-width="8"
              />
            </div>
          </el-col>

          <el-col :span="8">
            <div class="dimension-card performance">
              <div class="dimension-icon">⭐</div>
              <div class="dimension-content">
                <div class="dimension-title">绩效表现</div>
                <div class="dimension-score">{{ performanceScore.toFixed(2) }}</div>
                <div class="dimension-weight">权重: {{ (weightConfig.performanceRate || 30) }}%</div>
                <div class="weighted-score">
                  加权得分: {{ ((performanceScore * (weightConfig.performanceRate || 30) / 100)).toFixed(2) }}
                </div>
              </div>
              <el-progress
                :percentage="performanceScore"
                :color="getProgressColorByScore(performanceScore)"
                :stroke-width="8"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 评分计算过程 (新增) -->
      <el-divider content-position="left">
        <el-icon><Operation /></el-icon>
        <span style="margin-left: 8px;">评分计算过程</span>
      </el-divider>
      <div class="calculation-process">
        <el-steps :active="3" finish-status="success" align-center>
          <el-step title="原始评分" description="根据实际数据计算" />
          <el-step title="归一化处理" description="标准化到 0-100" />
          <el-step title="权重计算" description="按配置权重加权" />
        </el-steps>

        <div class="process-table" style="margin-top: 24px;">
          <el-table :data="scoreCalculationData" border stripe>
            <el-table-column prop="dimension" label="维度" width="120" align="center" />
            <el-table-column label="原始评分" align="center">
              <template #default="{ row }">
                <el-tag type="info" size="large">{{ row.originalScore.toFixed(4) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="归一化处理" align="center">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="color: #909399;">{{ row.normalizationFactor }}</span>
                  <el-icon><Right /></el-icon>
                  <el-tag 
                    :type="row.normalizedScore >= 0 && row.normalizedScore <= 100 ? 'success' : 'danger'" 
                    size="large"
                  >
                    {{ row.normalizedScore.toFixed(2) }}
                  </el-tag>
                  <el-tooltip v-if="row.normalizedScore < 0 || row.normalizedScore > 100" content="数值异常：归一化后应在0-100之间" placement="top">
                    <el-icon color="#f56c6c"><Warning /></el-icon>
                  </el-tooltip>
                  <el-tooltip v-else content="归一化成功：值在0-100范围内" placement="top">
                    <el-icon color="#67c23a"><SuccessFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="权重" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.weight }}%</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="加权得分" align="center">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span style="color: #909399;">{{ row.normalizedScore.toFixed(2) }} × {{ row.weight }}%</span>
                  <el-icon><Right /></el-icon>
                  <el-tag type="success" size="large">{{ row.weightedScore.toFixed(2) }}</el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="final-score-summary" style="margin-top: 20px; padding: 16px; background: #f5f7fa; border-radius: 8px;">
            <el-row :gutter="16">
              <el-col :span="8">
                <div style="text-align: center;">
                  <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">总评分</div>
                  <div style="font-size: 28px; font-weight: bold; color: #409eff;">
                    {{ (scoreDetails?.totalScore || 0).toFixed(2) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div style="text-align: center;">
                  <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">调整后评分</div>
                  <div style="font-size: 28px; font-weight: bold; color: #67c23a;">
                    {{ ((scoreDetails?.adjustedScore || scoreDetails?.totalScore || 0)).toFixed(2) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div style="text-align: center;">
                  <div style="font-size: 14px; color: #909399; margin-bottom: 8px;">最终评分</div>
                  <div style="font-size: 28px; font-weight: bold; color: #f56c6c;">
                    {{ (scoreDetails?.finalScore || 0).toFixed(2) }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <div style="margin-top: 12px; text-align: center; font-size: 13px; color: #606266;">
              📝 计算公式：最终评分 = 加权利润贡献({{ ((profitScore * (weightConfig?.profitContributionRate || 40) / 100)).toFixed(2) }}) + 加权岗位价值({{ ((positionScore * (weightConfig?.positionValueRate || 30) / 100)).toFixed(2) }}) + 加权绩效表现({{ ((performanceScore * (weightConfig?.performanceRate || 30) / 100)).toFixed(2) }})
            </div>
          </div>
        </div>
      </div>

      <!-- 利润贡献明细 -->
      <el-divider content-position="left">
        <el-icon><Money /></el-icon>
        <span style="margin-left: 8px;">利润贡献明细</span>
      </el-divider>
      <div class="detail-section">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目参与数量">
            {{ profitDetails.projectCount || 0 }} 个
          </el-descriptions-item>
          <el-descriptions-item label="总贡献利润">
            <span class="amount-text">¥{{ formatNumber(profitDetails.totalProfit || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="个人贡献占比">
            {{ (profitDetails.contributionRatio * 100 || 0).toFixed(2) }}%
          </el-descriptions-item>
          <el-descriptions-item label="项目平均利润">
            <span class="amount-text">¥{{ formatNumber(profitDetails.avgProfit || 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="评分说明" :span="2">
            基于项目参与度、利润规模、个人贡献占比综合计算
          </el-descriptions-item>
        </el-descriptions>

        <!-- 项目列表 -->
        <div v-if="profitDetails.projects && profitDetails.projects.length > 0" class="project-list">
          <div class="section-title">参与项目</div>
          <el-table :data="profitDetails.projects" style="width: 100%" size="small">
            <el-table-column prop="name" label="项目名称" width="200" />
            <el-table-column prop="profit" label="项目利润" width="150">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatNumber(row.profit) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="contributionRatio" label="个人占比" width="120">
              <template #default="{ row }">
                {{ (row.contributionRatio * 100).toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column prop="personalProfit" label="个人贡献利润">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatNumber(row.personalProfit) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getProjectStatusType(row.status)" size="small">
                  {{ getProjectStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 岗位价值明细 -->
      <el-divider content-position="left">
        <el-icon><Briefcase /></el-icon>
        <span style="margin-left: 8px;">岗位价值明细</span>
      </el-divider>
      <div class="detail-section">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="岗位名称">
            {{ positionDetails.positionName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="岗位基准值">
            <el-tag type="warning">{{ positionDetails.benchmarkValue || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="岗位层级">
            {{ positionDetails.level || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="岗位序列">
            {{ positionDetails.category || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="技能要求">
            {{ positionDetails.skillRequirements || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="职责范围">
            {{ positionDetails.responsibilities || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="评分说明" :span="2">
            基于岗位基准值、职责复杂度、技能要求等因素综合评定
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 绩效表现明细 -->
      <el-divider content-position="left">
        <el-icon><TrendCharts /></el-icon>
        <span style="margin-left: 8px;">绩效表现明细</span>
      </el-divider>
      <div class="detail-section">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="绩效等级">
            <el-tag :type="getPerformanceGradeType(performanceDetails.grade)">
              {{ performanceDetails.grade || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="绩效系数">
            {{ performanceDetails.coefficient || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="KPI完成率">
            {{ (performanceDetails.kpiCompletionRate * 100 || 0).toFixed(2) }}%
          </el-descriptions-item>
          <el-descriptions-item label="目标达成率">
            {{ (performanceDetails.goalAchievementRate * 100 || 0).toFixed(2) }}%
          </el-descriptions-item>
          <el-descriptions-item label="团队协作">
            {{ performanceDetails.teamworkScore || 0 }} 分
          </el-descriptions-item>
          <el-descriptions-item label="创新贡献">
            {{ performanceDetails.innovationScore || 0 }} 分
          </el-descriptions-item>
          <el-descriptions-item label="评价周期">
            {{ performanceDetails.period || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="评价人">
            {{ performanceDetails.evaluator || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="评语" :span="2">
            {{ performanceDetails.comments || '暂无评语' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 历史趋势 -->
      <el-divider content-position="left">
        <el-icon><DataLine /></el-icon>
        <span style="margin-left: 8px;">历史评分趋势</span>
      </el-divider>
      <div class="trend-section">
        <div id="scoreChart" style="width: 100%; height: 300px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Money, Briefcase, TrendCharts, DataLine, Operation, Right, Warning, SuccessFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

interface Props {
  employeeId?: string
  period?: string
  profitScore: number
  positionScore: number
  performanceScore: number
  profitDetails: any
  positionDetails: any
  performanceDetails: any
  historicalData?: any[]
  weightConfig?: {
    profitContributionRate: number
    positionValueRate: number
    performanceRate: number
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
}

const props = withDefaults(defineProps<Props>(), {
  profitScore: 0,
  positionScore: 0,
  performanceScore: 0,
  profitDetails: () => ({}),
  positionDetails: () => ({}),
  performanceDetails: () => ({}),
  historicalData: () => [],
  weightConfig: () => ({
    profitContributionRate: 40,
    positionValueRate: 30,
    performanceRate: 30
  }),
  scoreDetails: () => ({
    profitContributionScore: 0,
    positionValueScore: 0,
    performanceScore: 0,
    normalizedProfitScore: 0,
    normalizedPositionScore: 0,
    normalizedPerformanceScore: 0,
    weightedProfitScore: 0,
    weightedPositionScore: 0,
    weightedPerformanceScore: 0,
    totalScore: 0,
    adjustedScore: 0,
    finalScore: 0
  })
})

// 计算过程数据
const scoreCalculationData = computed(() => {
  if (!props.scoreDetails) {
    return []
  }
  
  // 计算归一化系数 (现在归一化后的值在0-100范围内)
  const calcNormalizationFactor = (original: number, normalized: number) => {
    if (original === 0) return 'N/A'
    // 不再显示原始系数,而是显示归一化方法
    return '自动'
  }
  
  return [
    {
      dimension: '利润贡献',
      originalScore: props.scoreDetails.profitContributionScore,
      normalizationFactor: '自动归一化',
      normalizedScore: props.scoreDetails.normalizedProfitScore,
      weight: props.weightConfig?.profitContributionRate || 40,
      weightedScore: props.scoreDetails.weightedProfitScore
    },
    {
      dimension: '岗位价值',
      originalScore: props.scoreDetails.positionValueScore,
      normalizationFactor: '自动归一化',
      normalizedScore: props.scoreDetails.normalizedPositionScore,
      weight: props.weightConfig?.positionValueRate || 30,
      weightedScore: props.scoreDetails.weightedPositionScore
    },
    {
      dimension: '绩效表现',
      originalScore: props.scoreDetails.performanceScore,
      normalizationFactor: '自动归一化',
      normalizedScore: props.scoreDetails.normalizedPerformanceScore,
      weight: props.weightConfig?.performanceRate || 30,
      weightedScore: props.scoreDetails.weightedPerformanceScore
    }
  ]
})

// 综合得分
const overallScore = computed(() => {
  return props.profitScore * 0.4 + props.positionScore * 0.3 + props.performanceScore * 0.3
})

// 格式化数字
const formatNumber = (value: number): string => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 根据得分获取进度条颜色
const getProgressColorByScore = (score: number) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#95d475'
  if (score >= 70) return '#e6a23c'
  if (score >= 60) return '#f56c6c'
  return '#909399'
}

// 获取综合评分类型
const getOverallScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 获取项目状态类型
const getProjectStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    completed: 'success',
    in_progress: 'primary',
    pending: 'warning',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取项目状态文本
const getProjectStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待开始',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 获取绩效等级类型
const getPerformanceGradeType = (grade: string) => {
  const typeMap: Record<string, string> = {
    'S': 'danger',
    'A': 'success',
    'B': 'primary',
    'C': 'warning',
    'D': 'info'
  }
  return typeMap[grade] || 'info'
}

// 初始化图表
onMounted(() => {
  if (props.historicalData && props.historicalData.length > 0) {
    initChart()
  }
})

const initChart = () => {
  const chartDom = document.getElementById('scoreChart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['利润贡献', '岗位价值', '绩效表现', '综合得分']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.historicalData.map(d => d.period)
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '利润贡献',
        type: 'line',
        data: props.historicalData.map(d => d.profitScore),
        smooth: true,
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '岗位价值',
        type: 'line',
        data: props.historicalData.map(d => d.positionScore),
        smooth: true,
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '绩效表现',
        type: 'line',
        data: props.historicalData.map(d => d.performanceScore),
        smooth: true,
        itemStyle: { color: '#fac858' }
      },
      {
        name: '综合得分',
        type: 'line',
        data: props.historicalData.map(d => d.overallScore),
        smooth: true,
        itemStyle: { color: '#ee6666' },
        lineStyle: { width: 3 }
      }
    ]
  }

  myChart.setOption(option)
}
</script>

<style scoped lang="scss">
.score-details-container {
  padding: 20px;
}

.score-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
  }
}

.score-overview {
  margin-bottom: 30px;

  .dimension-card {
    padding: 20px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    text-align: center;

    &.profit {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }

    &.position {
      background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
    }

    &.performance {
      background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
      color: white;
    }

    .dimension-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .dimension-content {
      margin-bottom: 15px;

      .dimension-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }

      .dimension-score {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .dimension-weight {
        font-size: 12px;
        color: #999;
      }

      .weighted-score {
        font-size: 14px;
        font-weight: bold;
        margin-top: 5px;
        color: #409eff;
      }
    }
  }
}

.detail-section {
  margin-bottom: 30px;

  .amount-text {
    color: #f56c6c;
    font-weight: bold;
  }

  .section-title {
    font-size: 14px;
    font-weight: bold;
    margin: 15px 0 10px;
    color: #333;
  }

  .project-list {
    margin-top: 15px;
  }
}

.trend-section {
  padding: 20px 0;
}
</style>
