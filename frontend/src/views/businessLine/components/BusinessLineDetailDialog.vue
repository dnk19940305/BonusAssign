<template>
  <el-dialog
    v-model="visible"
    title="业务线详情"
    width="900px"
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-content p-20">
      <div v-if="businessLineData" class="business-line-detail">
        <!-- 基本信息 -->
        <div class="detail-section mb-20">
          <h3 class="section-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>业务线名称：</label>
                <span class="value">{{ businessLineData.name }}</span>
                <el-tag v-if="businessLineData.status === 0" type="danger" size="small" class="ml-10">
                  已禁用
                </el-tag>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>业务线代码：</label>
                <span class="value">{{ businessLineData.code }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>负责人：</label>
                <span class="value">
                  {{ businessLineData.Manager?.name || '未指定' }}
                  <span v-if="businessLineData.Manager" class="text-muted">
                    ({{ businessLineData.Manager.employeeNo }})
                  </span>
                </span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>默认权重：</label>
                <span class="value">
                  <el-tag type="info">{{ formatPercent(businessLineData.weight) }}</el-tag>
                </span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>利润目标：</label>
                <span class="value">
                  {{ businessLineData.profitTarget ? formatCurrency(businessLineData.profitTarget)+'万元' : '未设置' }}
                </span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item mb-10">
                <label>创建时间：</label>
                <span class="value">{{ formatDateTime(businessLineData.createdAt) }}</span>
              </div>
            </el-col>
          </el-row>
          <div v-if="businessLineData.description" class="info-item description mt-10">
            <label>描述：</label>
            <div class="value mt-10 p-10">{{ businessLineData.description }}</div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="detail-section mb-20">
          <h3 class="section-title">统计信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="stat-card text-center">
                <div class="stat-item">
                  <div class="stat-value">{{ businessLineData.departmentCount || 0 }}</div>
                  <div class="stat-label">关联部门</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card text-center">
                <div class="stat-item">
                  <div class="stat-value">{{ businessLineData.employeeCount || 0 }}</div>
                  <div class="stat-label">关联员工</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card text-center">
                <div class="stat-item">
                  <div class="stat-value">{{ projectCount }}</div>
                  <div class="stat-label">相关项目</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- KPI指标 -->
        <div v-if="businessLineData.kpi_metrics && businessLineData.kpi_metrics.length > 0" class="detail-section mb-20">
          <h3 class="section-title">KPI指标</h3>
          <el-table :data="businessLineData.kpi_metrics" style="width: 100%">
            <el-table-column prop="name" label="指标名称" />
            <el-table-column prop="target" label="目标值" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.target) }}
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="权重" align="center">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ formatPercent(row.weight) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 绩效统计 -->
        <div v-if="performanceStats" class="detail-section">
          <h3 class="section-title">
            绩效统计
            <el-button link type="primary" @click="refreshPerformance">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </h3>
          <div class="performance-info p-20">
            <p class="m-0 mb-10"><strong>统计年份：</strong>{{ performanceStats.summary.year }}</p>
            <p class="m-0 mb-10"><strong>部门数量：</strong>{{ performanceStats.summary.departmentCount }}</p>
            <p class="m-0 m-0"><strong>员工数量：</strong>{{ performanceStats.summary.employeeCount }}</p>
          </div>
        </div>

        <!-- 操作记录 -->
        <div class="detail-section">
          <h3 class="section-title">操作记录</h3>
          <el-timeline>
            <el-timeline-item
              timestamp="创建时间"
              :time="formatDateTime(businessLineData.createdAt)"
            >
              业务线创建
            </el-timeline-item>
            <el-timeline-item
              v-if="businessLineData.updatedAt !== businessLineData.createdAt"
              timestamp="最后更新"
              :time="formatDateTime(businessLineData.updatedAt)"
            >
              业务线信息更新
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer flex gap-12">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
// API导入 - 暂时禁用进行调试
// import { businessLineApi } from '@/api/businessLine'
import type { BusinessLine, BusinessLinePerformance } from '@/types/businessLine'

interface Props {
  modelValue: boolean
  businessLine: BusinessLine | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', businessLine: BusinessLine): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const businessLineData = ref<BusinessLine | null>(null)
const performanceStats = ref<BusinessLinePerformance | null>(null)
const projectCount = ref(0)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 格式化函数
const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString()}`
}

const formatNumber = (value: number) => {
  return value.toLocaleString()
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取业务线详情
const getBusinessLineDetail = async () => {
  if (!props.businessLine?.id) return

  try {
    loading.value = true
    // 直接使用传入的数据
    businessLineData.value = props.businessLine
    
    // 获取绩效统计(异步加载,不影响基本信息展示)
    await getPerformanceStats()
    
    // TODO: 获取项目数量统计
    projectCount.value = 0
  } catch (error) {
    ElMessage.error('获取业务线详情失败')
  } finally {
    loading.value = false
  }
}

// 获取绩效统计
const getPerformanceStats = async () => {
  if (!businessLineData.value?.id) return

  try {
    // const response = await businessLineApi.getPerformanceStats(businessLineData.value.id)
    // performanceStats.value = response.data
  } catch (error) {
    console.warn('获取绩效统计失败:', error)
  }
}

// 刷新绩效统计
const refreshPerformance = () => {
  getPerformanceStats()
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  businessLineData.value = null
  performanceStats.value = null
  projectCount.value = 0
}

// 处理编辑
const handleEdit = () => {
  if (businessLineData.value) {
    emit('edit', businessLineData.value)
    handleClose()
  }
}

// 监听业务线变化
watch(
  () => props.businessLine,
  (newVal) => {
    if (newVal && visible.value) {
      getBusinessLineDetail()
    }
  },
  { immediate: true }
)

// 监听对话框显示
watch(visible, (newVal) => {
  if (newVal && props.businessLine) {
    getBusinessLineDetail()
  }
})
</script>

<style lang="scss" scoped>
.business-line-detail {
  .detail-section {
    &:last-child {
      margin-bottom: 0;
    }
  }
}

:deep(.el-timeline-item__timestamp) {
  font-weight: 500;
}
</style>