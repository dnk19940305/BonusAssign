<template>
  <div class="project-application-manager">
    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-form :model="queryForm" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="queryForm.projectName"
            placeholder="项目名称"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待审批" :value="ApplicationStatus.PENDING" />
            <el-option label="已批准" :value="ApplicationStatus.APPROVED" />
            <el-option label="已拒绝" :value="ApplicationStatus.REJECTED" />
            <el-option label="需修改" :value="ApplicationStatus.NEEDS_MODIFICATION" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请人">
          <el-input
            v-model="queryForm.applicantName"
            placeholder="申请人姓名"
            style="width: 150px"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">申请总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card pending-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card approved-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.approved }}</div>
              <div class="stat-label">已批准</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rejected-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 申请列表 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="applications"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="projectName" label="项目名称" min-width="150">
          <template #default="{ row }">
            <div class="project-info">
              <span class="project-name">{{ row.projectName || '-' }}</span>
              <el-tag v-if="row.projectCode" size="small" class="project-code">{{ row.projectCode }}</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="employeeName" label="申请人" width="120">
          <template #default="{ row }">
            <span>{{ row.employee?.name || row.employeeName || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="role" label="申请角色" width="120">
          <template #default="{ row }">
            <span>{{ row.role || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="applyReason" label="申请理由" min-width="200">
          <template #default="{ row }">
            <span class="reason-text">{{ row.applyReason || row.apply_reason || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="participationRatio" label="参与比例" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.participationRatio || row.participation_ratio || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)" 
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="appliedAt" label="申请时间" width="160">
          <template #default="{ row }">
            <span v-if="row.appliedAt || row.applied_at">
              {{ formatDateTime(row.appliedAt || row.applied_at) }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showApplicationDetail(row)">
              详情
            </el-button>
            
            <template v-if="canApproveTeam && row.status === ApplicationStatus.PENDING">
              <el-button link type="success" @click="handleApprove(row)">
                批准
              </el-button>
              <el-button link type="danger" @click="handleReject(row)">
                拒绝
              </el-button>
            </template>
            
            <template v-if="row.status === ApplicationStatus.PENDING && isMyApplication(row)">
              <el-button link type="warning" @click="handleWithdraw(row)">
                撤回
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="800px"
      :before-close="() => detailVisible = false"
    >
      <div v-if="currentApplication" class="application-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>项目名称:</label>
                <span>{{ currentApplication.projectName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>项目代码:</label>
                <span>{{ currentApplication.projectCode }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>申请人:</label>
                <span>{{ currentApplication.employee?.name || currentApplication.employeeName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>申请角色:</label>
                <span>{{ currentApplication.role || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>参与比例:</label>
                <span>{{ currentApplication.participationRatio || currentApplication.participation_ratio || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>贡献权重:</label>
                <span>{{ currentApplication.contributionWeight || currentApplication.contribution_weight || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 申请理由 -->
        <div class="detail-section">
          <h4>申请理由</h4>
          <p class="description">{{ currentApplication.applyReason || currentApplication.apply_reason || '-' }}</p>
        </div>

        <!-- 审批信息 -->
        <div class="detail-section" v-if="currentApplication.approvedAt || currentApplication.approved_at || currentApplication.rejectedAt || currentApplication.rejected_at">
          <h4>审批信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>审批时间:</label>
                <span v-if="currentApplication.approvedAt || currentApplication.approved_at || currentApplication.rejectedAt || currentApplication.rejected_at">
                  {{ formatDateTime(currentApplication.approvedAt || currentApplication.approved_at || currentApplication.rejectedAt || currentApplication.rejected_at || '') }}
                </span>
                <span v-else class="text-muted">-</span>
              </div>
            </el-col>
          </el-row>
          <div v-if="currentApplication.remark" class="detail-item">
            <label>审批意见:</label>
            <p class="description">{{ currentApplication.remark }}</p>
          </div>
        </div>
      </div>
      
      <template #footer v-if="currentApplication?.status === ApplicationStatus.PENDING && canApproveTeam">
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="success" @click="handleApprove(currentApplication)">
            批准
          </el-button>
          <el-button type="danger" @click="handleReject(currentApplication)">
            拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <ApprovalDialog
      v-model="approvalVisible"
      :application="currentApplication"
      :action="approvalAction"
      @success="handleApprovalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { projectCollaborationApi } from '@/api/projectCollaboration'
import { useUserStore } from '@/store/modules/user'
import { useProjectPermissions } from '@/composables/useProjectPermissions'
import ApprovalDialog from './ApprovalDialog.vue'
import type {
  ProjectMemberApplication,
  ApplicationListParams,
  ProjectApplicationStatus
} from '@/types/project'
import { 
  ApplicationStatus, 
  getStatusLabel as getAppStatusLabel, 
  getStatusType as getAppStatusType 
} from '@/constants/applicationStatus'

// 组合式函数
const userStore = useUserStore()
const { canApproveTeam } = useProjectPermissions()

// 响应式数据
const loading = ref(false)
const applications = ref<ProjectMemberApplication[]>([])
const selectedApplications = ref<ProjectMemberApplication[]>([])
const currentApplication = ref<ProjectMemberApplication | null>(null)

// 对话框控制
const detailVisible = ref(false)
const approvalVisible = ref(false)
const approvalAction = ref<'approve' | 'reject'>('approve')

// 查询表单
const queryForm = reactive<ApplicationListParams & { page: number; pageSize: number }>({
  page: 1,
  pageSize: 20,
  projectName: '',
  status: undefined,
  applicantName: ''
})

// 分页信息
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0
})

// 统计信息
const statistics = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 计算统计信息
const calculateStatistics = () => {
  statistics.total = applications.value.length
  statistics.pending = applications.value.filter(app => app.status === ApplicationStatus.PENDING).length
  statistics.approved = applications.value.filter(app => app.status === ApplicationStatus.APPROVED).length
  statistics.rejected = applications.value.filter(app => app.status === ApplicationStatus.REJECTED).length
}

// 加载申请列表
const loadApplications = async () => {
  loading.value = true
  try {
    const response = await projectCollaborationApi.getPendingApplications(queryForm)
    applications.value = response.data.list || []
    // 适配新的分页格式
    pagination.page = response.data.page
    pagination.pageSize = response.data.pageSize
    pagination.total = response.data.total
    pagination.totalPages = response.data.totalPages
    calculateStatistics()
  } catch (error) {
    ElMessage.error('加载申请列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryForm.page = 1
  loadApplications()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 20,
    projectName: '',
    status: undefined,
    applicantName: ''
  })
  loadApplications()
}

// 选择变化处理
const handleSelectionChange = (selection: ProjectMemberApplication[]) => {
  selectedApplications.value = selection
}

// 显示申请详情
const showApplicationDetail = (application: ProjectMemberApplication) => {
  currentApplication.value = application
  detailVisible.value = true
}

// 检查是否是我的申请
const isMyApplication = (application: ProjectMemberApplication) => {
  // 转换为字符串进行比较，因为employeeId可能是string，user.id可能是number
  return String(application.employeeId) === String(userStore.user?.id)
}

// 处理批准
const handleApprove = (application: ProjectMemberApplication) => {
  currentApplication.value = application
  approvalAction.value = 'approve'
  approvalVisible.value = true
}

// 处理拒绝
const handleReject = (application: ProjectMemberApplication) => {
  currentApplication.value = application
  approvalAction.value = 'reject'
  approvalVisible.value = true
}

// 处理撤回
const handleWithdraw = async (application: ProjectMemberApplication) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤回申请吗？`,
      '确认撤回',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里需要调用撤回API（假设存在）
    // await projectCollaborationApi.withdrawApplication(application.id)
    ElMessage.success('申请已撤回')
    loadApplications()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('撤回申请失败')
    }
  }
}

// 审批成功回调
const handleApprovalSuccess = () => {
  detailVisible.value = false
  loadApplications()
}

// 格式化货币
const formatCurrency = (amount: number): string => {
  if (amount === 0) return '¥0'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 格式化日期时间
const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return '-'
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 获取状态类型
const getStatusType = (status: number): string => {
  return getAppStatusType(status)
}

// 获取状态标签
const getStatusLabel = (status: number): string => {
  return getAppStatusLabel(status)
}

// 组件挂载
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.project-application-manager {
  padding: 20px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 20px 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.pending-card .stat-value {
  color: #e6a23c;
}

.approved-card .stat-value {
  color: #67c23a;
}

.rejected-card .stat-value {
  color: #f56c6c;
}

.table-section {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  font-weight: 500;
  font-size: 14px;
}

.project-code {
  font-size: 12px;
  align-self: flex-start;
}

.team-name {
  font-weight: 500;
  color: #409eff;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.member-tag {
  font-size: 12px;
  margin-bottom: 2px;
}

.text-muted {
  color: #909399;
}

.pagination-wrapper {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

/* 申请详情样式 */
.application-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  color: #606266;
}

.detail-item span {
  color: #303133;
}

.description {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.cost-info {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
  text-align: center;
}

.cost-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-table) {
  border-radius: 4px 4px 0 0;
}
</style>