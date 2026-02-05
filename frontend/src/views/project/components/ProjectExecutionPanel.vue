<template>
  <div class="execution-panel">
    <!-- 整体进度卡片 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card class="summary-card progress-card">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">整体进度</div>
            <div class="card-value">{{ execution.overallProgress }}%</div>
            <el-progress 
              :percentage="execution.overallProgress" 
              :color="getProgressColor(execution.overallProgress)"
              :stroke-width="4"
              :show-text="false"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="summary-card budget-card">
          <div class="card-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">预算使用</div>
            <div class="card-value">{{ formatCurrency(execution.budgetUsage) }}</div>
            <div class="card-extra" v-if="execution.costOverrun > 0">
              <el-tag type="danger" size="small">
                超支 {{ formatCurrency(execution.costOverrun) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="summary-card quality-card">
          <div class="card-icon">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">质量评分</div>
            <div class="card-value">{{ execution.qualityScore }}</div>
            <el-rate 
              v-model="qualityStars" 
              disabled 
              show-score 
              :max="5"
              :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="summary-card risk-card" :class="`risk-${execution.riskLevel}`">
          <div class="card-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">风险等级</div>
            <div class="card-value">
              <el-tag :type="getRiskTagType(execution.riskLevel)">
                {{ getRiskLabel(execution.riskLevel) }}
              </el-tag>
            </div>
            <div class="card-extra" v-if="execution.scheduleVariance !== 0">
              <span :class="execution.scheduleVariance < 0 ? 'text-danger' : 'text-success'">
                {{ execution.scheduleVariance > 0 ? '提前' : '延期' }} 
                {{ Math.abs(execution.scheduleVariance) }} 天
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息和操作 -->
    <el-row :gutter="20" class="detail-section">
      <!-- 进度详情 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>执行详情</span>
              <el-button 
                type="primary" 
                size="small" 
                :icon="Edit"
                @click="handleEdit"
                v-if="canEdit"
              >
                更新状态
              </el-button>
            </div>
          </template>

          <div class="execution-details">
            <div class="detail-item">
              <div class="detail-label">
                <el-icon><TrendCharts /></el-icon>
                整体进度
              </div>
              <div class="detail-content">
                <el-progress 
                  :percentage="execution.overallProgress" 
                  :color="getProgressColor(execution.overallProgress)"
                />
              </div>
            </div>

            <el-divider />

            <div class="detail-item">
              <div class="detail-label">
                <el-icon><Money /></el-icon>
                预算情况
              </div>
              <div class="detail-content">
                <div class="budget-info">
                  <div class="budget-row">
                    <span>预算使用：</span>
                    <span class="budget-value">{{ formatCurrency(execution.budgetUsage) }}</span>
                  </div>
                  <div class="budget-row" v-if="execution.costOverrun">
                    <span>成本超支：</span>
                    <span class="budget-value danger">{{ formatCurrency(execution.costOverrun) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="detail-item">
              <div class="detail-label">
                <el-icon><Clock /></el-icon>
                进度偏差
              </div>
              <div class="detail-content">
                <el-tag 
                  :type="execution.scheduleVariance >= 0 ? 'success' : 'warning'"
                  size="large"
                >
                  {{ execution.scheduleVariance > 0 ? '提前' : execution.scheduleVariance < 0 ? '延期' : '按时' }} 
                  <template v-if="execution.scheduleVariance !== 0">
                    {{ Math.abs(execution.scheduleVariance) }} 天
                  </template>
                </el-tag>
              </div>
            </div>

            <el-divider />

            <div class="detail-item">
              <div class="detail-label">
                <el-icon><Medal /></el-icon>
                质量评分
              </div>
              <div class="detail-content">
                <div class="quality-info">
                  <el-progress 
                    type="circle" 
                    :percentage="execution.qualityScore"
                    :width="80"
                    :color="getQualityColor(execution.qualityScore)"
                  />
                  <span class="quality-text">{{ getQualityLevel(execution.qualityScore) }}</span>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="detail-item" v-if="execution.teamPerformance">
              <div class="detail-label">
                <el-icon><User /></el-icon>
                团队表现
              </div>
              <div class="detail-content">
                <div class="team-performance">
                  <div 
                    class="performance-item" 
                    v-for="(value, key) in execution.teamPerformance" 
                    :key="key"
                  >
                    <span class="performance-label">{{ formatPerformanceKey(key) }}：</span>
                    <el-progress 
                      :percentage="Math.round(value * 100)" 
                      :stroke-width="8"
                      :color="getPerformanceColor(value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 进度日志 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>进度日志</span>
              <el-button 
                text 
                :icon="Refresh"
                @click="loadProgressLogs"
              />
            </div>
          </template>

          <div class="progress-logs" v-loading="logsLoading">
            <el-empty 
              v-if="!progressLogs.length && !logsLoading" 
              description="暂无日志"
              :image-size="60"
            />

            <el-timeline v-else>
              <el-timeline-item 
                v-for="log in progressLogs" 
                :key="log.id"
                :timestamp="log.loggedAt ? formatDateTime(log.loggedAt) : ''"
                placement="top"
                :type="getLogType(log.progressType)"
              >
                <div class="log-content">
                  <div class="log-description">{{ log.description }}</div>
                  <div class="log-value" v-if="log.progressValue !== undefined">
                    <template v-if="log.oldValue !== undefined && log.newValue !== undefined">
                      {{ log.oldValue }}% → {{ log.newValue }}%
                    </template>
                    <template v-else>
                      {{ log.progressValue }}%
                    </template>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <div class="logs-footer" v-if="progressLogs.length >= 10">
              <el-button text @click="loadMoreLogs">
                加载更多
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="更新项目执行状态"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="formData" 
        label-width="100px"
      >
        <el-form-item label="整体进度">
          <el-slider 
            v-model="formData.overallProgress" 
            :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
            show-input
          />
        </el-form-item>

        <el-form-item label="预算使用">
          <el-input-number 
            v-model="formData.budgetUsage" 
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="成本超支">
          <el-input-number 
            v-model="formData.costOverrun" 
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="进度偏差">
          <el-input-number 
            v-model="formData.scheduleVariance" 
            controls-position="right"
            style="width: 100%"
          >
            <template #suffix>天</template>
          </el-input-number>
          <div class="form-tip">正数表示提前，负数表示延期</div>
        </el-form-item>

        <el-form-item label="质量评分">
          <el-slider 
            v-model="formData.qualityScore" 
            :min="0"
            :max="100"
            :marks="{ 0: '0分', 60: '及格', 80: '良好', 100: '优秀' }"
            show-input
          />
        </el-form-item>

        <el-form-item label="风险等级">
          <el-select v-model="formData.riskLevel" style="width: 100%">
            <el-option label="低风险" value="low" />
            <el-option label="中等风险" value="medium" />
            <el-option label="高风险" value="high" />
            <el-option label="紧急风险" value="critical" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import {
  TrendCharts,
  Wallet,
  Medal,
  Warning,
  Edit,
  Refresh,
  Money,
  Clock,
  User
} from '@element-plus/icons-vue'
import {
  getProjectExecution,
  updateProjectExecution,
  getProgressLogs,
  type ProjectExecution,
  type ProgressLog
} from '@/api/milestone'

// Props
interface Props {
  projectId: string
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true
})

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// 数据
const loading = ref(false)
const logsLoading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const logsOffset = ref(0)
const logsLimit = ref(10)

const execution = ref<ProjectExecution>({
  projectId: props.projectId,
  overallProgress: 0,
  budgetUsage: 0,
  costOverrun: 0,
  scheduleVariance: 0,
  qualityScore: 0,
  riskLevel: 'low'
})

const progressLogs = ref<ProgressLog[]>([])

const formData = ref<Partial<ProjectExecution>>({
  overallProgress: 0,
  budgetUsage: 0,
  costOverrun: 0,
  scheduleVariance: 0,
  qualityScore: 0,
  riskLevel: 'low'
})

// 计算属性
const qualityStars = computed(() => {
  return Math.round((execution.value.qualityScore / 100) * 5)
})

// 方法
const loadExecution = async () => {
  loading.value = true
  try {
    const res = await getProjectExecution(props.projectId)
    if (res.data.success) {
      execution.value = res.data.data
    }
  } catch (error) {
    console.error('加载执行信息失败:', error)
  } finally {
    loading.value = false
  }
}

const loadProgressLogs = async (loadMore = false) => {
  logsLoading.value = true
  try {
    if (!loadMore) {
      logsOffset.value = 0
      progressLogs.value = []
    }

    const res = await getProgressLogs(props.projectId, {
      limit: logsLimit.value,
      offset: logsOffset.value
    })

    if (res.data.success) {
      const newLogs = res.data.data || []
      if (loadMore) {
        progressLogs.value = [...progressLogs.value, ...newLogs]
      } else {
        progressLogs.value = newLogs
      }
    }
  } catch (error) {
    console.error('加载进度日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

const loadMoreLogs = () => {
  logsOffset.value += logsLimit.value
  loadProgressLogs(true)
}

const handleEdit = () => {
  formData.value = { ...execution.value }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await updateProjectExecution(props.projectId, formData.value)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadExecution()
    loadProgressLogs()
    emit('refresh')
  } catch (error: any) {
    console.error('更新失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67c23a'
  if (progress >= 60) return '#409eff'
  if (progress >= 40) return '#e6a23c'
  return '#f56c6c'
}

const getQualityColor = (score: number) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getPerformanceColor = (value: number) => {
  if (value >= 0.8) return '#67c23a'
  if (value >= 0.6) return '#409eff'
  return '#e6a23c'
}

const getQualityLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '及格'
  return '待改进'
}

const getRiskLabel = (level: string) => {
  const labels: Record<string, string> = {
    low: '低风险',
    medium: '中等',
    high: '高风险',
    critical: '紧急'
  }
  return labels[level] || level
}

const getRiskTagType = (level: string) => {
  const types: Record<string, any> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return types[level] || ''
}

const getLogType = (type: string) => {
  const types: Record<string, any> = {
    milestone: 'primary',
    cost: 'warning',
    quality: 'success',
    risk: 'danger'
  }
  return types[type] || 'info'
}

const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDateTime = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatPerformanceKey = (key: string) => {
  const labels: Record<string, string> = {
    efficiency: '工作效率',
    collaboration: '团队协作',
    quality: '工作质量',
    innovation: '创新能力'
  }
  return labels[key] || key
}

// 生命周期
onMounted(() => {
  loadExecution()
  loadProgressLogs()
})

// 暴露方法给父组件
defineExpose({
  loadExecution,
  loadProgressLogs
})
</script>

<style scoped lang="scss">
.execution-panel {
  .summary-cards {
    margin-bottom: 20px;

    .summary-card {
      .el-card__body {
        display: flex;
        padding: 20px;
      }

      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 28px;
      }

      .card-content {
        flex: 1;

        .card-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .card-value {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .card-extra {
          font-size: 12px;
          margin-top: 8px;
        }
      }

      &.progress-card .card-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.budget-card .card-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
      }

      &.quality-card .card-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: #fff;
      }

      &.risk-card {
        &.risk-low .card-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: #fff;
        }

        &.risk-medium .card-icon {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: #fff;
        }

        &.risk-high .card-icon,
        &.risk-critical .card-icon {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: #fff;
        }
      }
    }
  }

  .detail-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .execution-details {
      .detail-item {
        .detail-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #303133;
        }

        .detail-content {
          .budget-info,
          .quality-info,
          .team-performance {
            .budget-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;

              .budget-value {
                font-weight: 600;

                &.danger {
                  color: #f56c6c;
                }
              }
            }

            .quality-info {
              display: flex;
              align-items: center;
              gap: 20px;

              .quality-text {
                font-size: 16px;
                font-weight: 600;
              }
            }

            .performance-item {
              margin-bottom: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .performance-label {
                display: inline-block;
                width: 80px;
                font-size: 14px;
                color: #606266;
              }
            }
          }
        }
      }
    }

    .progress-logs {
      max-height: 600px;
      overflow-y: auto;

      .log-content {
        .log-description {
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
        }

        .log-value {
          font-size: 12px;
          color: #909399;
        }
      }

      .logs-footer {
        text-align: center;
        padding-top: 12px;
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .text-danger {
    color: #f56c6c;
  }

  .text-success {
    color: #67c23a;
  }
}
</style>
