<!--
  岗位基准值调整管理页面
  支持申请调整、审批、查看历史等功能
-->
<template>
  <div class="benchmark-management">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>🎯 岗位基准值调整管理</span>
          <el-button type="primary" @click="showAdjustDialog = true">
            <el-icon><Plus /></el-icon>
            申请调整
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审批" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select 
            v-model="queryParams.positionId" 
            placeholder="选择岗位" 
            clearable 
            filterable
            style="width: 200px"
          >
            <el-option 
              v-for="pos in positions" 
              :key="pos.id" 
              :label="pos.name" 
              :value="pos.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAdjustments">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 调整申请列表 -->
    <el-card class="table-card">
      <el-table 
        v-loading="loading" 
        :data="adjustmentList" 
        stripe 
        border
        style="width: 100%"
      >
        <el-table-column prop="positionName" label="岗位名称" width="150" />
        <el-table-column prop="oldValue" label="原基准值" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.oldValue || row.old_value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="newValue" label="新基准值" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.newValue || row.new_value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="changeRatio" label="调整幅度" width="100" align="center">
          <template #default="{ row }">
            <span :class="getChangeClass(row.changeRatio || row.change_ratio)">
              {{ (row.changeRatio || row.change_ratio) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="调整理由" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt || row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small"
              @click="approveAdjustment(row, true)"
            >
              批准
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small"
              @click="approveAdjustment(row, false)"
            >
              拒绝
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              link
              @click="viewHistory(row)"
            >
              查看历史
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadAdjustments"
        @current-change="loadAdjustments"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 申请调整对话框 -->
    <el-dialog 
      v-model="showAdjustDialog" 
      title="申请岗位基准值调整" 
      width="600px"
    >
      <el-form 
        :model="adjustForm" 
        :rules="adjustRules" 
        ref="adjustFormRef" 
        label-width="120px"
      >
        <el-form-item label="岗位" prop="positionId">
          <el-select 
            v-model="adjustForm.positionId" 
            placeholder="选择岗位" 
            filterable
            style="width: 100%"
            @change="onPositionChange"
          >
            <el-option 
              v-for="pos in positions" 
              :key="pos.id" 
              :label="pos.name" 
              :value="pos.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="当前基准值">
          <el-tag type="info" size="large">{{ currentBenchmark }}</el-tag>
          <span style="margin-left: 10px; color: #999; font-size: 12px;">
            范围: 0.1 - 3.0
          </span>
        </el-form-item>

        <el-form-item label="新基准值" prop="newValue">
          <el-input-number 
            v-model="adjustForm.newValue" 
            :min="0.1" 
            :max="3.0" 
            :step="0.1" 
            :precision="2"
            style="width: 200px"
            @change="calculateChangeRatio"
          />
        </el-form-item>

        <el-form-item label="调整幅度">
          <el-tag 
            :type="getChangeRatioType(changeRatio)" 
            size="large"
          >
            {{ changeRatio > 0 ? '+' : '' }}{{ changeRatio.toFixed(2) }}%
          </el-tag>
          <div v-if="Math.abs(changeRatio) > 20" style="color: #f56c6c; font-size: 12px; margin-top: 5px;">
            ⚠️ 单次调整幅度不能超过±20%
          </div>
        </el-form-item>

        <el-form-item label="调整理由" prop="reason">
          <el-input 
            v-model="adjustForm.reason" 
            type="textarea" 
            :rows="4"
            placeholder="请说明调整理由，如：岗位职责变更、市场薪酬调整等"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAdjustDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitAdjustment"
          :loading="submitting"
        >
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog 
      v-model="showApproveDialog" 
      :title="approveAction ? '批准调整申请' : '拒绝调整申请'" 
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="岗位">
          {{ currentApproval?.positionName }}
        </el-form-item>
        <el-form-item label="调整">
          {{ currentApproval?.oldValue || currentApproval?.old_value }} 
          → 
          {{ currentApproval?.newValue || currentApproval?.new_value }}
          ({{ currentApproval?.changeRatio || currentApproval?.change_ratio }}%)
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input 
            v-model="approvalComments" 
            type="textarea" 
            :rows="3"
            placeholder="请输入审批意见（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showApproveDialog = false">取消</el-button>
        <el-button 
          :type="approveAction ? 'success' : 'danger'" 
          @click="confirmApproval"
          :loading="submitting"
        >
          确认{{ approveAction ? '批准' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog 
      v-model="showHistoryDialog" 
      title="岗位基准值调整历史" 
      width="900px"
    >
      <div v-if="historyData.stats" class="history-stats">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="总调整次数">
            {{ historyData.stats.totalAdjustments }}
          </el-descriptions-item>
          <el-descriptions-item label="已批准">
            <el-tag type="success">{{ historyData.stats.approvedCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="已拒绝">
            <el-tag type="danger">{{ historyData.stats.rejectedCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="累计调整">
            <span :class="getChangeClass(historyData.stats.totalChangeRatio)">
              {{ historyData.stats.totalChangeRatio }}%
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-timeline style="margin-top: 20px; max-height: 400px; overflow-y: auto;">
        <el-timeline-item 
          v-for="record in historyData.history" 
          :key="record.id"
          :timestamp="formatDate(record.createdAt || record.created_at)"
          :type="getStatusType(record.status)"
        >
          <el-card>
            <div class="history-item">
              <div>
                <el-tag :type="getStatusType(record.status)" size="small">
                  {{ getStatusText(record.status) }}
                </el-tag>
                <span style="margin-left: 10px;">
                  {{ record.oldValue || record.old_value }} → {{ record.newValue || record.new_value }}
                  ({{ record.changeRatio || record.change_ratio }}%)
                </span>
              </div>
              <div style="margin-top: 8px; color: #666; font-size: 13px;">
                理由: {{ record.reason }}
              </div>
              <div v-if="record.comments" style="margin-top: 5px; color: #999; font-size: 12px;">
                审批意见: {{ record.comments }}
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import axios from 'axios'

// 查询参数
const queryParams = reactive({
  status: '',
  positionId: '',
  page: 1,
  limit: 20
})

// 数据
const loading = ref(false)
const submitting = ref(false)
const adjustmentList = ref<any[]>([])
const positions = ref<any[]>([])
const total = ref(0)

// 对话框
const showAdjustDialog = ref(false)
const showApproveDialog = ref(false)
const showHistoryDialog = ref(false)

// 表单
const adjustFormRef = ref<FormInstance>()
const adjustForm = reactive({
  positionId: '',
  newValue: 1.0,
  reason: ''
})

const adjustRules: FormRules = {
  positionId: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  newValue: [
    { required: true, message: '请输入新基准值', trigger: 'blur' },
    { 
      validator: (_rule, value, callback) => {
        if (value < 0.1 || value > 3.0) {
          callback(new Error('基准值必须在 0.1-3.0 之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  reason: [
    { required: true, message: '请输入调整理由', trigger: 'blur' },
    { min: 10, message: '调整理由至少10个字符', trigger: 'blur' }
  ]
}

// 审批相关
const currentApproval = ref<any>(null)
const approveAction = ref(true)
const approvalComments = ref('')

// 历史记录
const historyData = reactive({
  history: [],
  stats: null
})

// 计算属性
const currentBenchmark = computed(() => {
  if (!adjustForm.positionId) return '-'
  const pos = positions.value.find(p => p.id === adjustForm.positionId)
  return pos ? (pos.benchmarkValue || pos.benchmark_value || 1.0) : '-'
})

const changeRatio = ref(0)

// 方法
const loadPositions = async () => {
  try {
    const response = await axios.get('/api/positions')
    if (response.data.code === 200) {
      positions.value = response.data.data.rows || response.data.data
    }
  } catch (error) {
    console.error('加载岗位列表失败:', error)
  }
}

const loadAdjustments = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/positions/benchmark/adjustments', {
      params: queryParams
    })
    if (response.data.code === 200) {
      adjustmentList.value = response.data.data.records
      total.value = response.data.data.pagination.total
    }
  } catch (error) {
    console.error('加载调整申请失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.status = ''
  queryParams.positionId = ''
  queryParams.page = 1
  loadAdjustments()
}

const onPositionChange = () => {
  calculateChangeRatio()
}

const calculateChangeRatio = () => {
  const current = parseFloat(currentBenchmark.value as string)
  if (isNaN(current) || current === 0) {
    changeRatio.value = 0
    return
  }
  changeRatio.value = ((adjustForm.newValue - current) / current) * 100
}

const submitAdjustment = async () => {
  if (!adjustFormRef.value) return

  await adjustFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (Math.abs(changeRatio.value) > 20) {
      ElMessage.error('单次调整幅度不能超过±20%')
      return
    }

    submitting.value = true
    try {
      const response = await axios.post('/api/positions/benchmark/adjustment', adjustForm)
      if (response.data.code === 200) {
        ElMessage.success('调整申请已提交')
        showAdjustDialog.value = false
        adjustFormRef.value?.resetFields()
        loadAdjustments()
      } else {
        ElMessage.error(response.data.message || '提交失败')
      }
    } catch (error: any) {
      console.error('提交调整申请失败:', error)
      ElMessage.error(error.response?.data?.message || '提交失败')
    } finally {
      submitting.value = false
    }
  })
}

const approveAdjustment = (row: any, approved: boolean) => {
  currentApproval.value = row
  approveAction.value = approved
  approvalComments.value = ''
  showApproveDialog.value = true
}

const confirmApproval = async () => {
  submitting.value = true
  try {
    const response = await axios.post(
      `/api/positions/benchmark/adjustment/${currentApproval.value.id}/approve`,
      {
        approved: approveAction.value,
        comments: approvalComments.value
      }
    )
    if (response.data.code === 200) {
      ElMessage.success(response.data.message)
      showApproveDialog.value = false
      loadAdjustments()
    } else {
      ElMessage.error(response.data.message || '操作失败')
    }
  } catch (error: any) {
    console.error('审批失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const viewHistory = async (row: any) => {
  try {
    const response = await axios.get(`/api/positions/${row.positionId || row.position_id}/benchmark/history`)
    if (response.data.code === 200) {
      historyData.history = response.data.data.history
      historyData.stats = response.data.data.stats
      showHistoryDialog.value = true
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
    ElMessage.error('加载历史记录失败')
  }
}

// 工具方法
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

const getChangeClass = (ratio: number) => {
  const r = parseFloat(ratio as any)
  if (r > 0) return 'positive-change'
  if (r < 0) return 'negative-change'
  return ''
}

const getChangeRatioType = (ratio: number) => {
  const abs = Math.abs(ratio)
  if (abs > 20) return 'danger'
  if (abs > 10) return 'warning'
  return 'success'
}

// 生命周期
onMounted(() => {
  loadPositions()
  loadAdjustments()
})
</script>

<style scoped lang="scss">
.benchmark-management {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .filter-form {
    margin-bottom: 0;
  }

  .table-card {
    .positive-change {
      color: #67c23a;
      font-weight: bold;
    }

    .negative-change {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .history-stats {
    margin-bottom: 20px;
  }

  .history-item {
    font-size: 14px;
  }
}
</style>
