<template>
  <div class="performance-manual-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>项目绩效手动录入</h3>
          <div class="actions">
            <el-button type="primary" @click="showPeriodSelector">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :show-file-list="false"
              accept=".xlsx,.xls"
            >
              <el-button type="success">
                <el-icon><Upload /></el-icon>
                上传数据
              </el-button>
            </el-upload>
            <el-button type="warning" @click="handleCalculate" :loading="calculating">
              <el-icon><Operation /></el-icon>
              计算奖金
            </el-button>
          </div>
        </div>
      </template>

      <!-- 奖金池信息 -->
      <el-descriptions :column="3" border class="pool-info">
        <el-descriptions-item label="项目名称">{{ poolInfo.projectName }}</el-descriptions-item>
        <el-descriptions-item label="绩效期间">{{ poolInfo.period }}</el-descriptions-item>
        <el-descriptions-item label="奖金总额">¥{{ poolInfo.totalAmount }}</el-descriptions-item>
      </el-descriptions>

      <!-- 数据列表 -->
      <el-table
        :data="performanceData"
        style="width: 100%; margin-top: 20px"
        v-loading="loading"
        border
      >
        <el-table-column prop="employeeId" label="员工ID" width="180" />
        <el-table-column prop="employeeName" label="员工姓名" width="120" />
        <el-table-column prop="period" label="绩效期间" width="120" />
        <el-table-column prop="profitContribution" label="利润贡献度(评分)(-100至100)" width="180">
          <template #default="{ row }">
            <el-input-number
              v-model="row.profitContribution"
              :precision="2"
              :step="0.1"
              :min="-100"
              :max="100"
              size="small"
              @change="handleDataChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="positionValue" label="岗位评分(0-100)" width="140">
          <template #default="{ row }">
            <el-input-number
              v-model="row.positionValue"
              :precision="2"
              :step="0.1"
              :min="0"
              :max="100"
              size="small"
              @change="handleDataChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="performanceScore" label="绩效评分(0-100)" width="140">
          <template #default="{ row }">
            <el-input-number
              v-model="row.performanceScore"
              :precision="2"
              :step="0.1"
              :min="0"
              :max="100"
              size="small"
              @change="handleDataChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="总权重" width="120">
          <template #default="{ row }">
            {{ calculateWeight(row).toFixed(4) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleSave(row)"
              :loading="row.saving"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 汇总信息 -->
      <el-descriptions :column="3" border class="summary-info">
        <el-descriptions-item label="总人数">{{ performanceData.length }}</el-descriptions-item>
        <el-descriptions-item label="总权重">{{ totalWeight.toFixed(4) }}</el-descriptions-item>
        <el-descriptions-item label="已提交">
          {{ submittedCount }} / {{ performanceData.length }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 期间选择弹窗 -->
    <el-dialog
      v-model="showPeriodDialog"
      title="选择绩效期间"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="绩效期间">
          <el-select v-model="selectedPeriod" placeholder="选择期间" style="width: 100%">
            <el-option
              v-for="period in availablePeriods"
              :key="period"
              :label="period"
              :value="period"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPeriodDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDownload">确认下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Operation } from '@element-plus/icons-vue'
import {
  downloadTemplate as downloadTemplateAPI,
  uploadExcel,
  getPerformanceData,
  savePerformanceRecord,
  calculateBonusManual
} from '@/api/projectPerformance'
import * as projectBonusApi from '@/api/projectBonus'

const route = useRoute()
const poolId = ref(route.query.poolId as string)

const loading = ref(false)
const calculating = ref(false)
const performanceData = ref<any[]>([])
const poolInfo = ref<any>({})
const showPeriodDialog = ref(false)
const selectedPeriod = ref('')
const availablePeriods = ref<string[]>([])

const uploadUrl = computed(() => {
  return `/project-performance/pools/${poolId.value}/import`
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`
  }
})

const totalWeight = computed(() => {
  return performanceData.value.reduce((sum, item) => {
    return sum + calculateWeight(item)
  }, 0)
})

const submittedCount = computed(() => {
  return performanceData.value.filter(item => item.status === 'submitted').length
})

// 计算单个员工权重
function calculateWeight(row: any) {
  const profit = parseFloat(row.profitContribution) || 0
  const position = parseFloat(row.positionValue) || 0
  const performance = parseFloat(row.performanceScore) || 0
  return profit + position + performance
}

// 状态标签类型
function getStatusType(status: string) {
  const map: Record<string, any> = {
    draft: 'info',
    submitted: 'success',
    calculated: 'warning'
  }
  return map[status] || 'info'
}

// 状态文本
function getStatusText(status: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    submitted: '已提交',
    calculated: '已计算'
  }
  return map[status] || status
}

// 显示期间选择弹窗
function showPeriodSelector() {
  // 生成可用期间列表（最近5个季度）
  const periods = []
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  
  for (let i = 0; i < 8; i++) {
    let year = currentYear
    let quarter = currentQuarter - i
    
    while (quarter <= 0) {
      year--
      quarter += 4
    }
    
    periods.push(`${year}Q${quarter}`)
  }
  
  availablePeriods.value = periods
  selectedPeriod.value = poolInfo.value.period || periods[0]
  showPeriodDialog.value = true
}

// 确认下载模板
async function confirmDownload() {
  showPeriodDialog.value = false
  await downloadTemplateWithPeriod()
}

// 下载模板
async function downloadTemplateWithPeriod() {
  try {
    const response = await downloadTemplateAPI(poolId.value, selectedPeriod.value)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `project_performance_${poolId.value}_${selectedPeriod.value}_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '模板下载失败')
  }
}

// 上传成功
function handleUploadSuccess(response: any) {
  if (response.success) {
    ElMessage.success(response.message || '上传成功')
    loadData()
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
function handleUploadError(error: any) {
  ElMessage.error('上传失败')
  console.error(error)
}

// 数据变更
function handleDataChange(row: any) {
  row.status = 'draft'
}

// 保存单条记录
async function handleSave(row: any) {
  try {
    row.saving = true
    await savePerformanceRecord({
      poolId: poolId.value,
      employeeId: row.employeeId,
      profitContribution: row.profitContribution,
      positionValue: row.positionValue,
      performanceScore: row.performanceScore
    })
    row.status = 'submitted'
    ElMessage.success('保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    row.saving = false
  }
}

// 计算奖金
async function handleCalculate() {
  try {
    await ElMessageBox.confirm(
      '确定要基于当前数据计算奖金吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    calculating.value = true
    const response = await calculateBonusManual(poolId.value)
    
    if (response.data.success) {
      ElMessage.success('奖金计算完成')
      loadData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '计算失败')
    }
  } finally {
    calculating.value = false
  }
}

// 加载数据
async function loadData() {
  try {
    loading.value = true
    
    // 加载奖金池信息
    const poolResponse = await projectBonusApi.getBonusPoolDetail(poolId.value)
    if (poolResponse.data.success) {
      poolInfo.value = poolResponse.data.data
    }

    // 加载绩效数据
    const dataResponse = await getPerformanceData(poolId.value)
    if (dataResponse.data.success) {
      performanceData.value = dataResponse.data.data.map((item: any) => ({
        ...item,
        saving: false
      }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.performance-manual-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .pool-info {
    margin-bottom: 20px;
  }

  .summary-info {
    margin-top: 20px;
  }
}
</style>
