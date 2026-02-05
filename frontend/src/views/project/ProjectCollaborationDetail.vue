<template>
  <div class="project-collaboration-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <div class="header-info">
          <h2>{{ project?.name || '加载中...' }}</h2>
          <p class="project-code">项目代码：{{ project?.code }}</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag 
          v-if="project?.status"
          :type="(PROJECT_STATUS_COLORS as any)[project.status]" 
          size="large"
        >
          {{ (PROJECT_STATUS_LABELS as any)[project.status] }}
        </el-tag>
        <el-tag 
          v-if="project?.cooperationStatus"
          :type="(PROJECT_COOPERATION_STATUS_COLORS as any)[project.cooperationStatus]" 
          size="large"
        >
          {{ (PROJECT_COOPERATION_STATUS_LABELS as any)[project.cooperationStatus] }}
        </el-tag>
      </div>
    </div>

    <!-- 项目基本信息 -->
    <el-card class="info-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>项目基本信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="项目经理">
          {{ project?.Manager?.name || '未指定' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag 
            v-if="project?.priority"
            :type="(PROJECT_PRIORITY_COLORS as any)[project.priority]" 
            size="small"
          >
            {{ (PROJECT_PRIORITY_LABELS as any)[project.priority] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目预算">
          {{ formatCurrency(project?.budget || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ project?.startDate ? formatDate(project.startDate) : '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ project?.endDate ? formatDate(project.endDate) : '未设置' }}
        </el-descriptions-item>

        <el-descriptions-item label="当前成本" :span="1">
          <span class="cost-value">{{ formatCurrency((project as any)?.cost || 0) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="预期利润" :span="1">
          <span :class="getProfitClass((project as any)?.expectedProfit || 0)">
            {{ formatCurrency((project as any)?.expectedProfit || 0) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="利润目标" :span="1">
          {{ formatCurrency(project?.profitTarget || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="工作内容" :span="3">
          {{ project?.workContent || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="技能要求" :span="3">
          {{ project?.skillRequirements || '暂无' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="3">
          {{ project?.description || '暂无' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 协作状态时间线 -->
    <el-card class="timeline-card">
      <template #header>
        <div class="card-header">
          <span>协作流程</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-if="project?.publishedAt"
          timestamp="发布时间"
          :type="timelineType('published')"
        >
          <p>项目已发布</p>
          <p class="timeline-detail">{{ formatDateTime(project.publishedAt) }}</p>
          <p class="timeline-user" v-if="project?.PublishedBy">发布人：{{ project.PublishedBy.name }}</p>
        </el-timeline-item>
        <el-timeline-item
          v-if="cooperationHistory.length > 0"
          v-for="item in cooperationHistory"
          :key="item.id"
          :timestamp="item.timestamp"
          :type="timelineType(item.status)"
        >
          <p>{{ item.description }}</p>
          <p class="timeline-detail">{{ formatDateTime(item.createdAt) }}</p>
        </el-timeline-item>
        <el-timeline-item
          v-if="!project?.publishedAt"
          timestamp="当前状态"
          type="info"
        >
          <p>项目尚未发布</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 团队申请列表 -->
    <el-card class="applications-card">
      <template #header>
        <div class="card-header">
          <span>团队申请列表</span>
          <el-button 
            v-if="canApplyTeam"
            type="primary" 
            size="small"
            @click="showApplyDialog"
          >
            申请团队组建
          </el-button>
        </div>
      </template>
      <el-table 
        v-loading="applicationsLoading" 
        :data="applications" 
        style="width: 100%"
      >
        <el-table-column prop="teamName" label="团队名称" width="150" />
        <el-table-column prop="Applicant.realName" label="申请人" width="120" />
        <el-table-column prop="totalMembers" label="团队人数" width="100" align="center" />
        <el-table-column prop="estimatedCost" label="预估成本" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.estimatedCost) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getApplicationStatusType(row.status)" size="small">
              {{ getApplicationStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="150">
          <template #default="{ row }">
            {{ row.submittedAt ? formatDateTime(row.submittedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="applicationReason" label="申请理由" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewApplicationDetail(row)">详情</el-button>
            <el-button 
              v-if="canApprove && row.status === ApplicationStatus.PENDING"
              size="small" 
              type="success" 
              @click="approveApplication(row, 'approve')"
            >
              批准
            </el-button>
            <el-button 
              v-if="canApprove && row.status === ApplicationStatus.PENDING"
              size="small" 
              type="danger" 
              @click="approveApplication(row, 'reject')"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="empty-state" v-if="!applicationsLoading && applications.length === 0">
        <el-empty description="暂无团队申请" />
      </div>
    </el-card>

    <!-- 团队成员列表 -->
    <el-card class="members-card" v-if="project?.cooperationStatus === 'approved' || project?.cooperationStatus === 'in_progress'">
      <template #header>
        <div class="card-header">
          <span>项目团队成员</span>
        </div>
      </template>
      <el-table 
        v-loading="membersLoading" 
        :data="members" 
        style="width: 100%"
      >
        <el-table-column label="成员姓名" width="120">
          <template #default="{ row }">
            {{ row.employeeName || row.employee?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="工号" width="120">
          <template #default="{ row }">
            {{ row.employeeCode || row.employee?.employeeNo || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="项目角色" width="150">
          <template #default="{ row }">
            {{ row.roleName || row.expectedRoleName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="岗位" width="150">
          <template #default="{ row }">
            {{ row.positionName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="部门" width="150">
          <template #default="{ row }">
            {{ row.departmentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="participationRatio" label="工作量(%)" width="100" align="center" />
        <el-table-column prop="allocatedBonus" label="分配奖金" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.allocatedBonus || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="joinedAt" label="加入时间" width="150">
          <template #default="{ row }">
            {{ row.joinDate ? formatDateTime(row.joinDate) : '-' }}
          </template>
        </el-table-column>
      </el-table>
      <div class="empty-state" v-if="!membersLoading && members.length === 0">
        <el-empty description="暂无团队成员" />
      </div>
    </el-card>

    <!-- 项目里程碑 -->
    <el-card class="milestones-card" v-if="project?.id">
      <template #header>
        <div class="card-header">
          <span>项目里程碑</span>
        </div>
      </template>
      <MilestoneTracker 
        :project-id="project.id"
        :can-edit="canEditMilestone"
      />
    </el-card>

    <!-- 团队申请对话框 -->
    <TeamApplicationDialog
      v-model="applyDialogVisible"
      :project="project"
      @success="handleApplySuccess"
    />

    <!-- 审批对话框 -->
    <ApprovalDialog
      v-model="approvalDialogVisible"
      :application="currentApplication"
      @success="handleApprovalSuccess"
    />
    
    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="applicationDetailDialogVisible"
      title="申请详情"
      width="800px"
      :before-close="() => applicationDetailDialogVisible = false"
    >
      <div v-if="currentApplication" class="application-detail">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">团队名称：</span>
            <span class="detail-value">{{ currentApplication.teamName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">申请人：</span>
            <span class="detail-value">{{ currentApplication.Applicant?.realName || currentApplication.applicantName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">团队人数：</span>
            <span class="detail-value">{{ currentApplication.totalMembers || 0 }}人</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">预估成本：</span>
            <span class="detail-value">{{ formatCurrency(currentApplication.estimatedCost || 0) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">申请状态：</span>
            <span class="detail-value">
              <el-tag :type="getApplicationStatusType(currentApplication.status)" size="small">
                {{ getApplicationStatusLabel(currentApplication.status) }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <span class="detail-label">提交时间：</span>
            <span class="detail-value">{{ currentApplication.submittedAt ? formatDateTime(currentApplication.submittedAt) : '-' }}</span>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <span class="detail-label">申请理由：</span>
            <span class="detail-value">{{ currentApplication.applicationReason || '-' }}</span>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <span class="detail-label">备注信息：</span>
            <span class="detail-value">{{ currentApplication.remarks || '-' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-muted">
        暂无申请信息
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="applicationDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import { projectCollaborationApi } from '@/api/projectCollaboration'
import TeamApplicationDialog from './components/TeamApplicationDialog.vue'
import ApprovalDialog from './components/ApprovalDialog.vue'
import MilestoneTracker from './components/MilestoneTracker.vue'
import { useUserStore } from '@/store/modules/user'
import { 
  ApplicationStatus, 
  getStatusLabel, 
  getStatusType 
} from '@/constants/applicationStatus'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_PRIORITY_COLORS,
  PROJECT_COOPERATION_STATUS_LABELS,
  PROJECT_COOPERATION_STATUS_COLORS
} from '@/types/project'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const project = ref<any>(null)
const applications = ref<any[]>([])
const members = ref<any[]>([])
const cooperationHistory = ref<any[]>([])
const currentApplication = ref<any>(null)

// 加载状态
const loading = ref(false)
const applicationsLoading = ref(false)
const membersLoading = ref(false)

// 对话框状态
const applyDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const applicationDetailDialogVisible = ref(false)

// 权限计算
const canApprove = computed(() => {
  return userStore.hasAnyPermission(['project_manager', 'admin', '*'])
})

const canApplyTeam = computed(() => {
  if (!project.value) return false
  
  // 项目必须处于已发布状态
  if (project.value.cooperationStatus !== 'published') {
    return false
  }
  
  // 超级管理员始终可以申请
  if (userStore.hasAnyPermission(['*', 'admin'])) {
    return true
  }
  
  const currentEmployeeId = (userStore.user as any)?.employeeId
  
  // 如果当前用户已经是该项目的经理,不应该显示"申请团队"按钮
  if (project.value.managerId && project.value.managerId === currentEmployeeId) {
    return false
  }
  
  // 如果项目未指定项目经理,任何项目经理都可以申请(抢单模式)
  if (!project.value.managerId) {
    return userStore.hasAnyPermission(['project_manager'])
  }
  
  // 如果已指定项目经理且不是当前用户,则不能申请
  return false
})

// 是否可以编辑里程碑
const canEditMilestone = computed(() => {
  if (!project.value) return false
  
  // 超级管理员和项目经理可以编辑
  if (userStore.hasAnyPermission(['*', 'admin', 'project_manager'])) {
    return true
  }
  
  const currentEmployeeId = (userStore.user as any)?.employeeId
  
  // 项目经理可以编辑自己项目的里程碑
  if (project.value.managerId && project.value.managerId === currentEmployeeId) {
    return true
  }
  
  return false
})

// 返回
const goBack = () => {
  router.back()
}

// 加载项目详情
const loadProject = async () => {
  loading.value = true
  try {
    const projectId = route.params.id as string
    const response = await projectApi.getProject(projectId)
    project.value = response.data
    
    // 项目加载完成后，如果已批准或进行中，加载成员
    if (project.value?.cooperationStatus === 'approved' || project.value?.cooperationStatus === 'in_progress') {
      loadMembers()
    }
  } catch (error) {
    ElMessage.error('加载项目详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 加载团队申请列表
const loadApplications = async () => {
  applicationsLoading.value = true
  try {
    const projectId = route.params.id as string
    const response = await projectCollaborationApi.getProjectApplications(projectId)
    // 适配新的分页格式 { list, page, pageSize, total, totalPages }
    applications.value = response.data.list || []
  } catch (error) {
    ElMessage.error('加载申请列表失败')
    console.error(error)
  } finally {
    applicationsLoading.value = false
  }
}

// 加载团队成员
const loadMembers = async () => {
  membersLoading.value = true
  try {
    const projectId = route.params.id as string
    console.log('加载项目成员:', projectId)
    const response = await projectApi.getProjectMembers(projectId)
    console.log('成员响应数据:', response)
    members.value = response.data || []
    console.log('成员列表:', members.value)
  } catch (error) {
    console.error('加载团队成员失败:', error)
  } finally {
    membersLoading.value = false
  }
}

// 显示申请对话框
const showApplyDialog = () => {
  applyDialogVisible.value = true
}

// 查看申请详情
const viewApplicationDetail = (application: any) => {
  currentApplication.value = application
  applicationDetailDialogVisible.value = true
}

// 审批申请
const approveApplication = (application: any, action: string) => {
  currentApplication.value = { ...application, action }
  approvalDialogVisible.value = true
}

// 申请成功回调
const handleApplySuccess = () => {
  loadApplications()
  loadProject()
}

// 审批成功回调
const handleApprovalSuccess = () => {
  loadApplications()
  loadProject()
  if (project.value?.cooperationStatus === 'approved' || project.value?.cooperationStatus === 'in_progress') {
    loadMembers()
  }
}

// 获取申请状态类型
const getApplicationStatusType = (status: number) => {
  return getStatusType(status)
}

// 获取申请状态标签
const getApplicationStatusLabel = (status: number) => {
  return getStatusLabel(status)
}

// 时间线类型
const timelineType = (status: string) => {
  const types: Record<string, string> = {
    published: 'primary',
    team_building: 'warning',
    pending_approval: 'info',
    approved: 'success',
    rejected: 'danger',
    in_progress: 'success',
    completed: 'success'
  }
  return types[status] || 'info'
}

// 格式化货币
const formatCurrency = (amount: number) => {
  if (!amount) return '¥0'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取利润颜色类
const getProfitClass = (profit: number) => {
  if (profit > 0) {
    return 'profit-positive'
  } else if (profit < 0) {
    return 'profit-negative'
  }
  return ''
}

// 组件挂载
onMounted(() => {
  loadProject()
  loadApplications()
})
</script>

<style scoped>
.project-collaboration-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-info h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.project-code {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 13px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.info-card,
.timeline-card,
.applications-card,
.members-card,
.milestones-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.cost-value {
  color: #E6A23C;
  font-weight: bold;
}

.profit-positive {
  color: #67c23a;
  font-weight: bold;
}

.profit-negative {
  color: #f56c6c;
  font-weight: bold;
}

.timeline-detail {
  font-size: 13px;
  color: #909399;
  margin: 5px 0;
}

.timeline-user {
  font-size: 12px;
  color: #606266;
  margin: 5px 0 0 0;
}

.empty-state {
  padding: 40px 0;
}

.members-section {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.detail-label {
  font-weight: bold;
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-value {
  color: #303133;
  font-size: 14px;
  word-break: break-word;
}
</style>
