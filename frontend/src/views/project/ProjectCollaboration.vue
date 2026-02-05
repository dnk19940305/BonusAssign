<template>
  <div class="project-collaboration">
    <div class="page-header">
      <h2>项目协作中心</h2>
      <p class="page-description">管理项目团队申请、审批流程和协作状态</p>
      <div class="header-actions">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-button @click="showNotifications">
            <el-icon><Bell /></el-icon>
            通知
          </el-button>
        </el-badge>
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="function-intro">
      <el-alert
        title="功能说明"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="intro-content">
            <p><strong>协作中心</strong>专注于项目团队协作流程管理，包括：</p>
            <ul>
              <li><strong>可申请项目</strong>：查看已发布且已指定项目经理的项目，普通成员可以申请加入（自动过滤已申请的项目）</li>
              <li><strong>待审批申请</strong>：管理层审批团队组建申请</li>
              <li><strong>我的申请</strong>：跟踪个人提交的申请状态</li>
            </ul>
            <p><em>注意：项目创建和基础管理请使用“基础管理 → 项目管理”功能。只有已发布(published)且已指定项目经理的项目才会在协作中心展示。</em></p>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 可申请项目 -->
      <el-tab-pane label="可申请项目" name="projects">
        <div class="projects-section">
          <!-- 搜索筛选 -->
          <div class="search-section">
            <el-form :model="queryForm" inline>
              <el-form-item label="搜索">
                <el-input
                  v-model="queryForm.search"
                  placeholder="项目名称、代码"
                  style="width: 200px"
                  clearable
                  @keyup.enter="loadProjects"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadProjects">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="loadProjects">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 项目列表 -->
          <div class="projects-list">
            <el-row :gutter="20">
              <el-col :span="8" v-for="project in projects" :key="project.id">
                <el-card class="project-card" @click="viewProjectDetail(project)">
                  <template #header>
                    <div class="card-header">
                      <span class="project-name">{{ project.name }}</span>
                      <el-tag :type="getCooperationStatusType(project.cooperationStatus)" size="small">
                        {{ getCooperationStatusLabel(project.cooperationStatus) }}
                      </el-tag>
                    </div>
                  </template>
                  
                  <div class="project-info">
                    <p class="project-code">项目代码：{{ project.code }}</p>
                    <p class="project-description">{{ project.description }}</p>
                    <div class="project-meta">
                      <div class="meta-item">
                        <span class="label">预算：</span>
                        <span class="value">{{ formatCurrency(project.budget) }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="label">预估奖金：</span>
                        <span class="value estimated-bonus">{{ formatCurrency((project as any).estimatedBonus || 0) }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="label">实际奖金：</span>
                        <span class="value" :class="(project as any).calculatedBonus > 0 ? 'bonus-value' : ''">
                          {{ formatCurrency((project as any).calculatedBonus || 0) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- 项目财务概览 -->
                    <div class="project-finance">
                      <div class="finance-item">
                        <span class="finance-label">当前成本：</span>
                        <span class="finance-value cost-value">
                          {{ formatCurrency((project as any).cost || 0) }}
                        </span>
                      </div>
                      <div class="finance-item">
                        <span class="finance-label">预期利润：</span>
                        <span class="finance-value" :class="getProfitClass((project as any).expectedProfit || 0)">
                          {{ formatCurrency((project as any).expectedProfit || 0) }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="project-actions">
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click.stop="viewProjectDetail(project)"
                      >
                        查看详情
                      </el-button>
                      <!-- 项目经理申请团队 -->
                      <el-button 
                        size="small" 
                        v-if="canApplyTeam(project)"
                        @click.stop="applyTeam(project)"
                      >
                        申请团队
                      </el-button>
                      <!-- 成员申请加入项目 -->
                      <el-button
                        size="small"
                        type="success"
                        v-if="canApplyAsMember(project)"
                        @click.stop="applyAsMember(project)"
                      >
                        申请加入
                      </el-button>
                      <el-button
                        size="small"
                        type="success"
                        v-if="canStartProject(project)"
                        @click.stop="startProject(project)"
                      >
                        启动项目
                      </el-button>
                      <el-button
                        size="small"
                        type="warning"
                        v-if="canCompleteProject(project)"
                        @click.stop="completeProject(project)"
                      >
                        完成项目
                      </el-button>
                      <el-button
                        size="small"
                        type="danger"
                        v-if="canEarlyComplete(project)"
                        @click.stop="earlyComplete(project)"
                      >
                        提前结项
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="projects.length > 0">
              <el-pagination
                v-model:current-page="queryForm.page"
                v-model:page-size="queryForm.pageSize"
                :total="pagination.total"
                :page-sizes="[6, 12, 18, 24]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="loadProjects"
                @current-change="loadProjects"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 待审批申请 -->
      <el-tab-pane label="待审批申请" name="approvals" v-if="canApprove">
        <div class="approvals-section">
          <div class="section-header">
            <div class="header-title">
              <h3>待审批的团队申请</h3>
              <p class="section-description">审批项目经理提交的团队组建申请</p>
            </div>
            <el-button @click="loadPendingApplications">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <el-table v-loading="approvalsLoading" :data="pendingApplications" style="width: 100%">
            <el-table-column prop="Project.name" label="项目名称" width="150" />
            <el-table-column prop="teamName" label="团队名称" width="120" />
            <el-table-column prop="Applicant.realName" label="申请人" width="100" />
            <el-table-column prop="totalMembers" label="团队人数" width="80" align="center" />
            <el-table-column prop="estimatedCost" label="预估成本" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.estimatedCost) }}
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.submittedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="applicationReason" label="申请理由" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewApplication(row)">详情</el-button>
                <el-button size="small" type="success" @click="approveApplication(row, 'approve')">批准</el-button>
                <el-button size="small" type="warning" @click="approveApplication(row, 'modify')">修改</el-button>
                <el-button size="small" type="danger" @click="approveApplication(row, 'reject')">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 我的申请 -->
      <el-tab-pane label="我的申请" name="my-applications">
        <div class="my-applications-section">
          <div class="section-header">
            <h3>我提交的团队申请</h3>
            <p class="section-description">跟踪和管理您提交的团队组建申请状态</p>
          </div>
          <!-- 搜索筛选 -->
          <div class="search-section">
            <el-form :model="myApplicationsQuery" inline>
              <el-form-item label="项目名称">
                <el-input
                  v-model="myApplicationsQuery.projectName"
                  placeholder="项目名称"
                  style="width: 200px"
                  clearable
                  @keyup.enter="loadMyApplications"
                />
              </el-form-item>
              <el-form-item label="申请状态">
                <el-select v-model="myApplicationsQuery.status" placeholder="全部状态" clearable style="width: 150px">
                  <el-option label="待审批" :value="ApplicationStatus.PENDING" />
                  <el-option label="已批准" :value="ApplicationStatus.APPROVED" />
                  <el-option label="已拒绝" :value="ApplicationStatus.REJECTED" />
                  <el-option label="需修改" :value="ApplicationStatus.NEEDS_MODIFICATION" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadMyApplications">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="resetMyApplicationsQuery">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 我的申请列表 -->
          <el-table v-loading="myApplicationsLoading" :data="myApplications" style="width: 100%">
            <el-table-column prop="Project.name" label="项目名称" width="150" />
            <el-table-column prop="teamName" label="团队名称" width="120" />
            <el-table-column prop="totalMembers" label="团队人数" width="80" align="center" />
            <el-table-column prop="estimatedCost" label="预估成本" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.estimatedCost) }}
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.submittedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getApplicationStatusType(row.status)" size="small">
                  {{ getApplicationStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applicationReason" label="申请理由" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewMyApplication(row)">详情</el-button>
                <el-button 
                  v-if="row.status === ApplicationStatus.REJECTED || row.status === ApplicationStatus.NEEDS_MODIFICATION"
                  size="small" 
                  type="primary" 
                  @click="resubmitApplication(row)"
                >
                  重新提交
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="myApplications.length > 0">
            <el-pagination
              v-model:current-page="myApplicationsQuery.page"
              v-model:page-size="myApplicationsQuery.pageSize"
              :total="myApplicationsPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadMyApplications"
              @current-change="loadMyApplications"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 项目详情对话框 -->
    <EnhancedProjectDetailDialog
      v-model="detailVisible"
      :project="currentProjectDetail"
      @team-applied="handleTeamApplied"
    />

    <!-- 团队申请对话框 -->
    <TeamApplicationDialog
      v-model="teamApplyVisible"
      :project="currentProject"
      :application="currentApplication"
      @success="handleTeamApplied"
    />

    <!-- 审批对话框 -->
    <ApprovalDialog
      v-model="approvalVisible"
      :application="currentApplication"
      @success="handleApprovalSuccess"
    />

    <!-- 通知抽屉 -->
    <NotificationDrawer
      v-model="notificationVisible"
      @notification-read="handleNotificationRead"
    />

    <!-- 成员申请对话框 -->
    <MemberApplicationDialog
      v-model="memberApplyVisible"
      :project="currentProject"
      @success="handleMemberApplied"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Bell, Refresh } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import { projectCollaborationApi } from '@/api/projectCollaboration'
import EnhancedProjectDetailDialog from './components/EnhancedProjectDetailDialog.vue'
import TeamApplicationDialog from './components/TeamApplicationDialog.vue'
import ApprovalDialog from './components/ApprovalDialog.vue'
import NotificationDrawer from './components/NotificationDrawer.vue'
import MemberApplicationDialog from './components/MemberApplicationDialog.vue'
import { useUserStore } from '@/store/modules/user'
import { 
  ApplicationStatus, 
  getStatusLabel as getAppStatusLabel, 
  getStatusType as getAppStatusType 
} from '@/constants/applicationStatus'

const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('projects')
const projects = ref<any[]>([])
const pendingApplications = ref<any[]>([])
const myApplications = ref<any[]>([])
const currentProject = ref<any>(null)
const currentProjectId = ref<string>('')
const currentProjectDetail = ref<any>(null) // 用于详情对话框
const currentApplication = ref<any>(null)

// 加载状态
const projectsLoading = ref(false)
const approvalsLoading = ref(false)
const myApplicationsLoading = ref(false)

// 对话框状态
const detailVisible = ref(false)
const teamApplyVisible = ref(false)
const approvalVisible = ref(false)
const notificationVisible = ref(false)
const memberApplyVisible = ref(false)

// 通知数量
const unreadCount = ref(0)

// 查询表单（协作中心专用接口已自动筛选published状态的项目）
const queryForm = reactive({
  page: 1,
  pageSize: 6,
  search: ''
})

// 分页信息
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 6,
  totalPages: 0
})

// 我的申请查询表单
const myApplicationsQuery = reactive({
  page: 1,
  pageSize: 10,
  projectName: '',
  status: ''
})

// 我的申请分页信息
const myApplicationsPagination = reactive({
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0
})

// 权限计算
const canApprove = computed(() => {
  return userStore.hasAnyPermission(['admin','collaboration:approve'])
})

// 是否可以申请团队（项目经理抢单）
const canApplyTeam = (project: any) => {
  // 超级管理员始终可以申请
  if (userStore.hasAnyPermission(['*', 'admin'])) {
    return true
  }
  
  const currentEmployeeId = (userStore.user as any)?.employeeId
  
  // 如果当前用户已经是该项目的经理,不应该显示"申请团队"按钮
  // 因为项目经理应该通过项目详情或项目管理页面来管理团队
  if (project.managerId && project.managerId === currentEmployeeId) {
    return false
  }
  
  // 情况1:项目已发布(published)
  if (project.cooperationStatus === 'published') {
    // 如果项目未指定项目经理,任何项目经理都可以申请(抢单模式)
    if (!project.managerId) {
      return userStore.hasAnyPermission(['project_manager', 'project:manage'])
    }
    // 如果已指定项目经理且不是当前用户,则不能申请
    return false
  }
  
  // 情况2:项目未发布(draft)且未指定项目经理
  // 项目经理可以申请成为该项目的负责人(抢单模式)
  if ((project.cooperationStatus === 'draft' || !project.cooperationStatus) && !project.managerId) {
    return userStore.hasAnyPermission(['project_manager', 'project:manage'])
  }
  
  return false
}

// 是否可以作为成员申请加入项目
const canApplyAsMember = (project: any) => {

  // 只有已发布的项目才能申请
  if (project.cooperationStatus !== 'published' && project.cooperationStatus !== 'approved') {
   console.log('当前用户是项目经理，不显示申请按钮')

    return false
  }
  // 必须已指定项目经理
  if (!project.Manager) {
    return false
  }
  const currentEmployeeId = (userStore.user as any)?.employeeId
  
  // 如果当前用户是项目经理，不显示申请按钮
  if (project.managerId === currentEmployeeId) {
    
    return false
  }
  
  // TODO: 可以添加检查是否已经申请或已是成员的逻辑
  
  return true
}

// 是否可以提前结项
const canEarlyComplete = (project: any) => {
  const hasRole = userStore.hasAnyPermission(['*', 'admin', 'project_manager'])
  const statusOk = ['approved', 'in_progress'].includes(project.cooperationStatus)
  return hasRole && statusOk
}

// 是否可以启动项目
const canStartProject = (project: any) => {
  const hasRole = userStore.hasAnyPermission(['*', 'admin', 'project_manager'])
  const statusOk = project.cooperationStatus === 'approved'
  return hasRole && statusOk
}

// 是否可以完成项目
const canCompleteProject = (project: any) => {
  const hasRole = userStore.hasAnyPermission(['*', 'admin', 'project_manager'])
  const statusOk = project.cooperationStatus === 'in_progress'
  return hasRole && statusOk
}

// 获取协作状态类型
const getCooperationStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    published: 'success',
    team_building: 'warning',
    pending_approval: 'info',
    approved: 'success',
    rejected: 'danger',
    in_progress: 'primary',
    completed: '',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

// 获取协作状态标签
const getCooperationStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    team_building: '组建中',
    pending_approval: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 获取申请状态类型
const getApplicationStatusType = (status: number) => {
  return getAppStatusType(status)
}

// 获取申请状态标签
const getApplicationStatusLabel = (status: number) => {
  return getAppStatusLabel(status)
}

// 加载项目列表（使用协作中心专用接口）
const loadProjects = async () => {
  projectsLoading.value = true
  try {
    // 使用新的协作中心专用接口，自动过滤已申请项目
    const response = await projectCollaborationApi.getAvailableProjects({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      search: queryForm.search
    })
    projects.value = response.data.list
    pagination.total = response.data.total
    pagination.page = response.data.page
    pagination.pageSize = response.data.pageSize
    pagination.totalPages = Math.ceil(response.data.total / response.data.pageSize)
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    projectsLoading.value = false
  }
}

// 加载待审批申请
const loadPendingApplications = async () => {
  if (!canApprove.value) return
  
  approvalsLoading.value = true
  try {
    const response = await projectCollaborationApi.getPendingApplications()
    pendingApplications.value = response.data.list
  } catch (error) {
    ElMessage.error('加载待审批申请失败')
  } finally {
    approvalsLoading.value = false
  }
}

// 加载我的申请
const loadMyApplications = async () => {
  myApplicationsLoading.value = true
  try {
    const response = await projectCollaborationApi.getMyApplications(myApplicationsQuery)
    myApplications.value = response.data.list
    // 适配新的分页格式
    myApplicationsPagination.page = response.data.page
    myApplicationsPagination.pageSize = response.data.pageSize
    myApplicationsPagination.total = response.data.total
    myApplicationsPagination.totalPages = response.data.totalPages
  } catch (error) {
    ElMessage.error('加载我的申请失败')
  } finally {
    myApplicationsLoading.value = false
  }
}

// 重置我的申请查询表单
const resetMyApplicationsQuery = () => {
  myApplicationsQuery.page = 1
  myApplicationsQuery.pageSize = 10
  myApplicationsQuery.projectName = ''
  myApplicationsQuery.status = ''
  loadMyApplications()
}

// 提前结项
const earlyComplete = async (project: any) => {
  try {
    await ElMessageBox.confirm(
      `确认提前结项"${project.name}"？`,
      '提前结项确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectApi.completeProject(project.id || project._id)
    ElMessage.success('项目已提前结项')
    await loadProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '提前结项失败')
    }
  }
}

// 启动项目
const startProject = async (project: any) => {
  try {
    await ElMessageBox.confirm(
      `确认启动项目"${project.name}"？项目将进入执行阶段。`,
      '启动项目确认',
      {
        confirmButtonText: '确认启动',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    await projectApi.startProject(project.id || project._id)
    ElMessage.success('项目已启动')
    await loadProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '启动项目失败')
    }
  }
}

// 完成项目
const completeProject = async (project: any) => {
  try {
    await ElMessageBox.confirm(
      `确认完成项目"${project.name}"？项目将进入结项阶段。`,
      '完成项目确认',
      {
        confirmButtonText: '确认完成',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectApi.completeProject(project.id || project._id)
    ElMessage.success('项目已完成')
    await loadProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.message || '完成项目失败')
    }
  }
}

// 重新提交申请
const resubmitApplication = (application: any) => {
  // 打开团队申请对话框，预填充原申请数据
  currentApplication.value = application
  teamApplyVisible.value = true
}

// 加载通知数量
const loadNotificationCount = async () => {
  try {
    const response = await projectCollaborationApi.getMyNotifications({ unreadOnly: true, pageSize: 1 })
    unreadCount.value = response.data.unreadCount
  } catch (error) {
    console.error('加载通知数量失败:', error)
  }
}

// 标签页切换
const handleTabChange = (tabName: string) => {
  switch (tabName) {
    case 'projects':
      loadProjects()
      break
    case 'approvals':
      if (canApprove.value) {
        loadPendingApplications()
      }
      break
    case 'my-applications':
      loadMyApplications()
      break
  }
}

// 查看项目详情
const viewProjectDetail = async (project: any) => {
  try {
    // 加载完整的项目详情（包括成员、活动等）
    const response = await projectApi.getProject(project.id || project._id)
    currentProjectDetail.value = response.data
    detailVisible.value = true
  } catch (error) {
    console.error('加载项目详情失败:', error)
    ElMessage.error('加载项目详情失败')
  }
}

// 申请团队
const applyTeam = (project: any) => {
  currentProject.value = project
  teamApplyVisible.value = true
}

// 成员申请加入项目
const applyAsMember = (project: any) => {
  currentProject.value = project
  memberApplyVisible.value = true
}

// 查看申请详情
const viewApplication = (application: any) => {
  currentApplication.value = application
  approvalVisible.value = true
}

// 查看我的申请详情
const viewMyApplication = (application: any) => {
  currentApplication.value = application
  approvalVisible.value = true
}

// 审批申请
const approveApplication = (application: any, action: string) => {
  currentApplication.value = { ...application, action }
  approvalVisible.value = true
}

// 显示通知
const showNotifications = () => {
  notificationVisible.value = true
}

// 团队申请成功回调
const handleTeamApplied = () => {
  loadProjects()
  if (canApprove.value) {
    loadPendingApplications()
  }
}

// 成员申请成功回调
const handleMemberApplied = () => {
  loadProjects()
  loadMyApplications() // 刷新我的申请列表
  ElMessage.success('申请已提交，请等待项目经理审批')
}

// 审批成功回调
const handleApprovalSuccess = () => {
  loadPendingApplications()
  loadProjects()
  loadMyApplications() // 刷新我的申请列表
}

// 通知已读回调
const handleNotificationRead = () => {
  loadNotificationCount()
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
  // 根据 URL 查询参数设置激活的标签页
  const tabParam = route.query.tab as string
  if (tabParam && ['projects', 'approvals', 'my-applications'].includes(tabParam)) {
    activeTab.value = tabParam
  }
  
  // 根据激活的标签页加载对应数据
  if (activeTab.value === 'projects') {
    loadProjects()
  } else if (activeTab.value === 'approvals' && canApprove.value) {
    loadPendingApplications()
  } else if (activeTab.value === 'my-applications') {
    loadMyApplications()
  } else {
    // 默认加载项目列表
    loadProjects()
  }
  
  loadNotificationCount()
})
</script>

<style scoped>
.project-collaboration {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.page-description {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.notification-badge {
  margin-right: 10px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.projects-list {
  min-height: 400px;
}

.project-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-weight: bold;
  color: #303133;
}

.project-info {
  padding: 0;
}

.project-code {
  color: #909399;
  font-size: 12px;
  margin: 0 0 8px 0;
}

.project-description {
  color: #606266;
  font-size: 14px;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 5px;
}

.meta-item .label {
  color: #909399;
}

.meta-item .value {
  color: #409eff;
  font-weight: bold;
}

.project-finance {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.finance-item {
  display: flex;
  align-items: center;
}

.finance-label {
  font-size: 13px;
  color: #909399;
  margin-right: 10px;
}

.finance-value {
  font-size: 14px;
  font-weight: bold;
}

.profit-positive {
  color: #67c23a; /* 绿色 */
}

.profit-negative {
  color: #f56c6c; /* 红色 */
}

.bonus-value {
  color: #67c23a; /* 绿色 - 强调已计算的奖金 */
  font-weight: bold;
}

.bonus-scale {
  color: #e6a23c; /* 橙色 - 奖金规模系数 */
  font-weight: bold;
}

.estimated-bonus {
  color: #409eff; /* 蓝色 - 预估奖金 */
  font-weight: 500;
}

.project-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.approvals-section {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  flex: 1;
}

.section-header h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 18px;
}

.section-description {
  font-size: 14px;
  color: #909399;
}

.function-intro {
  margin-bottom: 20px;
  background-color: #f4f4f4;
  border-radius: 4px;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.intro-content p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.intro-content ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.intro-content li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.intro-content em {
  font-style: italic;
  color: #909399;
}
</style>