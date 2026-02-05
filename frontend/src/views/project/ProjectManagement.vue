<template>
  <div class="project-management">
    <div class="page-header">
      <h2>项目管理</h2>
      <div class="header-actions">
        <el-button 
          v-if="canCreateProject" 
          type="primary" 
          @click="showCreateDialog"
        >
          <el-icon><Plus /></el-icon>
          新增项目
        </el-button>
        <el-button 
          v-if="canPublishProject" 
          type="success" 
          @click="showPublishDialog"
        >
          <el-icon><DocumentAdd /></el-icon>
          发布项目
        </el-button>
        <el-button 
          v-if="canViewProject" 
          type="info" 
          @click="showMyApplications"
        >
          <el-icon><List /></el-icon>
          我的申请
        </el-button>
        <el-button 
          v-if="canApproveTeam" 
          type="warning" 
          @click="showApplicationManager"
        >
          <el-icon><Document /></el-icon>
          申请管理
        </el-button>
        <el-button 
          v-if="hasManagementPermission" 
          type="primary" 
          @click="showGlobalWeightDialog"
        >
          <el-icon><Setting /></el-icon>
          权重配置
        </el-button>
        <el-button 
          v-if="canExportData" 
          @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-form :model="queryForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="queryForm.search"
            placeholder="项目名称、代码或描述"
            style="width: 200px"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option
              v-for="(label, value) in PROJECT_STATUS_LABELS"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryForm.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option
              v-for="(label, value) in PROJECT_PRIORITY_LABELS"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="queryForm.isPublished" placeholder="全部项目" clearable style="width: 120px">
            <el-option label="已发布" :value="true" />
            <el-option label="未发布" :value="false" />
          </el-select>
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

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.planning }}</div>
              <div class="stat-label">规划中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(statistics.totalBudget) }}</div>
              <div class="stat-label">总预算</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(statistics.totalProfitTarget) }}</div>
              <div class="stat-label">利润目标</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 项目财务概览 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(financialStats.totalBudget) }}</div>
              <div class="stat-label">项目总预算</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(financialStats.totalCost) }}</div>
              <div class="stat-label">当前总成本</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value" :class="getProfitClass(financialStats.expectedProfit)">{{ formatCurrency(financialStats.expectedProfit) }}</div>
              <div class="stat-label">预期利润</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(financialStats.estimatedBonus) }}</div>
              <div class="stat-label">预估奖金</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 项目列表 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="projects"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="项目名称" min-width="150">
          <template #default="{ row }">
            <div class="project-name">
              <span class="name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
         <el-table-column prop="code" label="项目状态" width="120" >
          <template #default="{ row }">
           <el-tag 
                :type="(PROJECT_STATUS_COLORS as any)[(row as any).status]" 
                size="small"
                class="status-tag"
              >
                {{ (PROJECT_STATUS_LABELS as any)[(row as any).status] }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cooperationStatus" label="协作状态" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="(row as any).cooperationStatus"
              :type="(PROJECT_COOPERATION_STATUS_COLORS as any)[(row as any).cooperationStatus]"
              size="small"
              class="status-tag"
            >
              {{ (PROJECT_COOPERATION_STATUS_LABELS as any)[(row as any).cooperationStatus] }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="项目代码" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="Manager" label="项目经理" width="120">
          <template #default="{ row }">
            <span v-if="row.Manager">{{ row.Manager.name }}</span>
            <span v-else class="text-muted">未指定</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="(PROJECT_PRIORITY_COLORS as any)[(row as any).priority]" size="small">
              {{ (PROJECT_PRIORITY_LABELS as any)[(row as any).priority] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="100">
          <template #default="{ row }">
            <span v-if="row.startDate">{{ formatDate(row.startDate) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="100">
          <template #default="{ row }">
            <span v-if="row.endDate">{{ formatDate(row.endDate) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.budget">{{ formatCurrency(row.budget) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetailDialog(row)">详情</el-button>
            <el-button 
              v-if="canEditProject(row)" 
              link 
              type="primary" 
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="canConfigureWeights(row)" 
              link 
              type="warning" 
              @click="showWeightDialog(row)"
            >
              权重配置
            </el-button>
            <el-dropdown @command="(command: string) => handleCommand(command, row)">
              <el-button link type="primary">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 发布项目：只在协作状态为 draft 时显示 -->
                  <el-dropdown-item 
                    v-if="canPublishProject && (row as any).cooperationStatus === 'draft'" 
                    command="publish"
                  >
                    发布项目
                  </el-dropdown-item>
                  <!-- 协作详情：在项目已发布后显示 -->
                  <el-dropdown-item 
                    command="collaboration" 
                    v-if="canViewCollaboration && (row as any).cooperationStatus && (row as any).cooperationStatus !== 'draft'"
                  >
                    协作详情
                  </el-dropdown-item>
                  <!-- 修改项目状态：修改基本状态（planning/active/completed等） -->
                  <el-dropdown-item 
                    v-if="canManageProjectStatus(row)" 
                    command="status"
                  >
                    修改状态
                  </el-dropdown-item>
                  <!-- 修改协作状态：修改协作流程状态 -->
                  <!-- <el-dropdown-item 
                    v-if="canManageProjectStatus(row)" 
                    command="cooperation-status"
                  >
                    修改协作状态
                  </el-dropdown-item> -->
                  <!-- 删除项目：只有未发布或草稿状态才能删除 -->
                  <el-dropdown-item 
                    v-if="canDeleteProject(row) && (!((row as any).cooperationStatus) || (row as any).cooperationStatus === 'draft')" 
                    command="delete" 
                    class="danger-item"
                  >
                    删除
                  </el-dropdown-item>
                  <!-- 已发布项目的提示 -->
                  <el-dropdown-item 
                    v-if="canDeleteProject(row) && (row as any).cooperationStatus && (row as any).cooperationStatus !== 'draft'" 
                    disabled
                  >
                    已发布项目不可删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 批量操作工具栏 -->
    <div v-if="selectedProjects.length > 0 && canBatchUpdate" class="batch-actions">
      <el-alert
        :title="`已选择 ${selectedProjects.length} 项`"
        type="info"
        show-icon
        :closable="false"
      />
      <div class="batch-buttons">
        <el-button @click="handleBatchStatusChange('active' as ProjectStatus)">批量激活</el-button>
        <el-button @click="handleBatchStatusChange('on_hold' as ProjectStatus)">批量暂停</el-button>
      </div>
    </div>

    <!-- 项目详情对话框 -->
    <ProjectDetailDialog
      v-model="detailVisible"
      :project="currentProject"
      @edit="handleEditFromDetail"
    />

    <!-- 项目表单对话框 -->
    <ProjectFormDialog
      v-model="formVisible"
      :project="currentProject"
      :mode="isEdit ? 'edit' : 'create'"
      @success="handleFormSuccess"
    />

    <!-- 项目发布表单对话框 -->
    <ProjectPublishFormDialog
      v-model="publishFormVisible"
      :project="currentProject || undefined"
      @success="handlePublishSuccess"
    />

    <!-- 申请管理对话框 -->
    <el-dialog
      v-model="applicationManagerVisible"
      title="项目申请管理"
      width="95%"
      :before-close="() => applicationManagerVisible = false"
    >
      <ProjectApplicationManager />
    </el-dialog>

    <!-- 权重配置对话框 -->
    <ProjectWeightDialog
      v-model="weightConfigVisible"
      :project="currentProject"
      @success="handleWeightSuccess"
    />

    <!-- 状态修改对话框 -->
    <el-dialog v-model="statusDialogVisible" title="修改项目状态" width="400px">
      <el-form>
        <el-form-item label="项目状态">
          <el-select v-model="newStatus" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="(label, value) in PROJECT_STATUS_LABELS"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusChange">确定</el-button>
      </template>
    </el-dialog>

    <!-- 协作状态修改对话框 -->
    <el-dialog v-model="cooperationStatusDialogVisible" title="修改协作状态" width="400px">
      <el-form>
        <el-form-item label="协作状态">
          <el-select v-model="newCooperationStatus" placeholder="请选择协作状态" style="width: 100%">
            <el-option label="组建中" value="team_building" />
            <el-option label="协作中" value="in_progress" />
            <el-option label="协作完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-alert
          title="提示：发布、审批等状态由系统自动流转，无需手动修改"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        />
      </el-form>
      <template #footer>
        <el-button @click="cooperationStatusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCooperationStatusChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Download, Search, Refresh, ArrowDown, Money, Wallet, TrendCharts, Present, Document, Setting
} from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import { formatDate as formatDateUtil, formatCurrency as formatCurrencyUtil } from '@/utils/format'
import ProjectDetailDialog from './components/ProjectDetailDialog.vue'
import ProjectFormDialog from './components/ProjectFormDialog.vue'
import ProjectWeightDialog from './components/ProjectWeightDialog.vue'
import ProjectPublishFormDialog from './components/ProjectPublishFormDialog.vue'
import ProjectApplicationManager from './components/ProjectApplicationManager.vue'
import { useProjectPermissions } from '@/composables/useProjectPermissions'
import { useUserStore } from '@/store/modules/user'
import type { 
  Project, 
  ProjectListParams, 
  ProjectStatistics,
  ProjectStatus,
  ProjectPriority,
  ProjectWithCollaboration,
  ProjectCooperationStatus
} from '@/types/project'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_PRIORITY_COLORS,
  PROJECT_COOPERATION_STATUS_LABELS,
  PROJECT_COOPERATION_STATUS_COLORS,
  ProjectStatus as Status
} from '@/types/project'

// 路由
const router = useRouter()

// 用户权限存储
const userStore = useUserStore()

// 权限控制
const { canPublishProject, canApproveTeam, canViewProject } = useProjectPermissions()

// 权限检查计算属性
const hasManagementPermission = computed(() => {
  return userStore.hasAnyPermission(['project:create', 'project:update', 'project:delete', 'admin', 'project_manager', '*'])
})

const canCreateProject = computed(() => {
  return userStore.hasAnyPermission(['project:create', 'admin', 'project_manager', '*'])
})

const canExportData = computed(() => {
  return userStore.hasAnyPermission(['project:export', 'project:view', 'admin', 'project_manager', 'hr', '*'])
})

const canEditProject = (project: Project) => {
  // 管理员和有project:update权限的用户
  if (userStore.hasAnyPermission(['project:update', 'admin', 'project_manager', '*'])) {
    return true
  }
  
  // 项目经理：比较employeeId
  if (project.Manager && userStore.user?.employeeId) {
    return project.Manager.id?.toString() === userStore.user.employeeId.toString()
  }
  
  return false
}

const canDeleteProject = (project: Project) => {
  return userStore.hasAnyPermission(['project:delete', 'admin', '*'])
}

const canManageProjectStatus = (project: Project) => {
  // 管理员和有project:update权限的用户
  if (userStore.hasAnyPermission(['project:update', 'admin', 'project_manager', '*'])) {
    return true
  }
  
  // 项目经理：比较employeeId
  if (project.Manager && userStore.user?.employeeId) {
    return project.Manager.id?.toString() === userStore.user.employeeId.toString()
  }
  
  return false
}

const canConfigureWeights = (project: Project) => {
  // 管理员和有权限的用户
  if (userStore.hasAnyPermission(['project:weights', 'admin', 'project_manager', '*'])) {
    return true
  }
  
  // 项目经理：比较employeeId
  if (project.Manager && userStore.user?.employeeId) {
    return project.Manager.id?.toString() === userStore.user.employeeId.toString()
  }
  
  return false
}

const canViewCollaboration = computed(() => {
  return userStore.hasAnyPermission(['project:view', 'project:collaboration', 'admin', 'project_manager', '*'])
})

const canBatchUpdate = computed(() => {
  return userStore.hasAnyPermission(['project:update', 'admin', 'project_manager', '*'])
})

// 响应式数据
const loading = ref(false)
const projects = ref<Project[]>([])
const selectedProjects = ref<Project[]>([])
const currentProject = ref<Project | null>(null)

// 对话框控制
const detailVisible = ref(false)
const formVisible = ref(false)
const weightConfigVisible = ref(false)
const statusDialogVisible = ref(false)
const cooperationStatusDialogVisible = ref(false)
const publishFormVisible = ref(false)
const applicationManagerVisible = ref(false)
const isEdit = ref(false)
const newStatus = ref<ProjectStatus>()
const newCooperationStatus = ref<ProjectCooperationStatus>()

// 查询表单
const queryForm = reactive<ProjectListParams & { page: number; pageSize: number; isPublished?: boolean }>({
  page: 1,
  pageSize: 20,
  search: '',
  status: undefined,
  priority: undefined,
  isPublished: undefined
})

// 分页信息
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0
})

// 统计信息
const statistics = reactive<ProjectStatistics>({
  total: 0,
  planning: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
  onHold: 0,
  totalBudget: 0,
  totalProfitTarget: 0
})

// 项目财务概览统计
const financialStats = reactive({
  totalBudget: 0,
  totalCost: 0,
  expectedProfit: 0,
  estimatedBonus: 0
})

// 计算统计信息
const calculateStatistics = () => {
  statistics.total = projects.value.length
  statistics.active = projects.value.filter(p => (p as any).status === 'active').length
  statistics.completed = projects.value.filter(p => (p as any).status === 'completed').length
  statistics.planning = projects.value.filter(p => (p as any).status === 'planning').length
  statistics.totalBudget = projects.value.reduce((sum, p) => sum + (p.budget || 0), 0)
  statistics.totalProfitTarget = projects.value.reduce((sum, p) => sum + (p.profitTarget || 0), 0)

  // 计算项目财务概览
  financialStats.totalBudget = projects.value.reduce((sum, p) => sum + (p.budget || 0), 0)
  financialStats.totalCost = projects.value.reduce((sum, p) => sum + ((p as any).cost || 0), 0)
  financialStats.expectedProfit = financialStats.totalBudget - financialStats.totalCost
  financialStats.estimatedBonus = projects.value.reduce((sum, p) => sum + ((p as any).estimatedBonus || 0), 0)
}

// 加载项目列表
const loadProjects = async () => {
  loading.value = true
  try {
    // 项目管理页面：非管理员只能看到自己管理的项目
    const isAdmin = userStore.hasAnyPermission(['*', 'admin'])
    const queryParams = {
      ...queryForm,
      manager: !isAdmin // 非管理员传manager=true，只显示自己管理的项目
    }
    
    const response = await projectApi.getProjects(queryParams)
    projects.value = response.data.list
    pagination.total = response.data.total
    pagination.page = response.data.page
    pagination.pageSize = response.data.pageSize
    pagination.totalPages = Math.ceil(response.data.total / response.data.pageSize)
    calculateStatistics()
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  queryForm.page = 1
  loadProjects()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 20,
    search: '',
    status: undefined,
    priority: undefined,
    isPublished: undefined
  })
  loadProjects()
}

// 显示创建对话框
const showCreateDialog = () => {
  if (!canCreateProject.value) {
    ElMessage.error('您没有创建项目的权限')
    return
  }
  currentProject.value = null
  isEdit.value = false
  formVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (project: Project) => {
  if (!canEditProject(project)) {
    ElMessage.error('您没有编辑该项目的权限')
    return
  }
  currentProject.value = project
  isEdit.value = true
  formVisible.value = true
}

// 从详情页编辑
const handleEditFromDetail = (project: Project) => {
  showEditDialog(project)
}

// 显示详情对话框
const showDetailDialog = (project: Project) => {
  currentProject.value = project
  detailVisible.value = true
}

// 显示权重配置对话框
const showWeightDialog = (project: Project) => {
  if (!canConfigureWeights(project)) {
    ElMessage.error('您没有配置该项目权重的权限')
    return
  }
  currentProject.value = project
  weightConfigVisible.value = true
}

// 显示全局权重配置对话框
const showGlobalWeightDialog = () => {
  currentProject.value = null
  weightConfigVisible.value = true
}

// 显示我的申请
const showMyApplications = () => {
  if (!userStore.hasAnyPermission(['project:view', 'project:apply', '*'])) {
    ElMessage.error('您没有查看申请的权限')
    return
  }
  // 跳转到项目协作页面并激活“我的申请”标签页
  router.push({ 
    path: '/project/collaboration',
    query: { tab: 'my-applications' }
  })
}

// 显示项目发布对话框
const showPublishDialog = () => {
  if (!canPublishProject.value) {
    ElMessage.error('您没有发布项目的权限')
    return
  }
  currentProject.value = null // 清空currentProject，以支持创建新项目模式
  publishFormVisible.value = true
}

// 显示申请管理
const showApplicationManager = () => {
  if (!canApproveTeam.value) {
    ElMessage.error('您没有管理申请的权限')
    return
  }
  applicationManagerVisible.value = true
}

// 表单成功回调
const handleFormSuccess = () => {
  loadProjects()
}

// 权重配置成功回调
const handleWeightSuccess = () => {
  // 可以在这里刷新列表或显示消息
}

// 选择变化处理
const handleSelectionChange = (selection: Project[]) => {
  selectedProjects.value = selection
}

// 命令处理
const handleCommand = (command: string, project: Project) => {
  switch (command) {
    case 'status':
      handleStatusCommand(project)
      break
    case 'cooperation-status':
      handleCooperationStatusCommand(project)
      break
    case 'delete':
      handleDeleteCommand(project.id)
      break
    case 'publish':
      handlePublishProject(project)
      break
    case 'collaboration':
      handleViewCollaboration(project)
      break
  }
}

// 状态修改命令
const handleStatusCommand = (project: Project) => {
  if (!canManageProjectStatus(project)) {
    ElMessage.error('您没有修改该项目状态的权限')
    return
  }
  currentProject.value = project
  newStatus.value = project.status
  statusDialogVisible.value = true
}

// 状态修改确认
const handleStatusChange = async () => {
  if (!currentProject.value || !newStatus.value) return
  
  try {
    await projectApi.updateProject(currentProject.value.id as any, {
      status: newStatus.value
    })
    ElMessage.success('项目状态修改成功')
    statusDialogVisible.value = false
    loadProjects()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '状态修改失败')
  }
}

// 协作状态修改命令
const handleCooperationStatusCommand = (project: Project) => {
  if (!canManageProjectStatus(project)) {
    ElMessage.error('您没有修改该项目协作状态的权限')
    return
  }
  currentProject.value = project
  newCooperationStatus.value = project.cooperationStatus
  cooperationStatusDialogVisible.value = true
}

// 协作状态修改确认
const handleCooperationStatusChange = async () => {
  if (!currentProject.value || !newCooperationStatus.value) return
  
  try {
    await projectApi.updateProject(currentProject.value.id as any, {
      cooperationStatus: newCooperationStatus.value
    })
    ElMessage.success('协作状态修改成功')
    cooperationStatusDialogVisible.value = false
    loadProjects()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '协作状态修改失败')
  }
}

// 删除命令
const handleDeleteCommand = async (projectId: string | number) => {
  const project = projects.value.find(p => p.id.toString() === projectId.toString())
  if (!project) {
    ElMessage.error('未找到要删除的项目')
    return
  }
  
  if (!canDeleteProject(project)) {
    ElMessage.error('您没有删除该项目的权限')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
    
    await projectApi.deleteProject(projectId as any)
    ElMessage.success('项目删除成功')
    loadProjects()
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel') {
      return
    }
    
    console.error('删除项目失败:', error)
    
    // 获取具体错误信息
    let errorMessage = '删除失败'
    if (error?.response?.data) {
      const errorData = error.response.data
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      }
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    // 根据错误类型提供友好提示
    if (errorMessage.includes('依赖') || errorMessage.includes('关联')) {
      ElMessage.error('无法删除项目：该项目存在关联数据，请先清理相关记录')
    } else if (errorMessage.includes('权限') || errorMessage.includes('unauthorized')) {
      ElMessage.error('无法删除项目：您没有删除该项目的权限')
    } else if (errorMessage.includes('网络') || error?.code === 'NETWORK_ERROR') {
      ElMessage.error('网络连接失败，请检查网络后重试')
    } else {
      ElMessage.error(`删除失败：${errorMessage}`)
    }
  }
}

// 批量状态修改
const handleBatchStatusChange = async (status: ProjectStatus) => {
  if (!canBatchUpdate.value) {
    ElMessage.error('您没有批量修改的权限')
    return
  }
  
  if (selectedProjects.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedProjects.value.length} 个项目状态修改为"${PROJECT_STATUS_LABELS[status]}"吗？`,
      '批量修改状态',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量更新状态
    const updatePromises = selectedProjects.value.map(project =>
      projectApi.updateProject(project.id as any, { status })
    )
    
    await Promise.all(updatePromises)
    ElMessage.success('批量状态修改成功')
    loadProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量状态修改失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  if (!canExportData.value) {
    ElMessage.error('您没有导出数据的权限')
    return
  }
  // TODO: 实现数据导出功能
  ElMessage.info('导出功能开发中...')
}

// 格式化日期 - 使用统一工具函数
const formatDate = (dateString: string): string => {
  return formatDateUtil(dateString, 'YYYY/MM/DD')
}

// 格式化货币 - 使用统一工具函数
const formatCurrency = (amount: number): string => {
  if (amount === 0) return '¥0'
  return formatCurrencyUtil(amount, '¥', 0)
}

// 获取利润颜色类
const getProfitClass = (profit: number) => {
  if (profit > 0) {
    return 'profit-positive'
  } else if (profit < 0) {
    return 'profit-negative'
  } else {
    return ''
  }
}

// 处理发布项目
const handlePublishProject = (project: Project) => {
  if (!canPublishProject.value) {
    ElMessage.error('您没有发布项目的权限')
    return
  }
  // 这里可以预填充项目信息到发布表单
  currentProject.value = project
  publishFormVisible.value = true
}

// 查看协作详情
const handleViewCollaboration = (project: Project) => {
  if (!canViewCollaboration.value) {
    ElMessage.error('您没有查看协作详情的权限')
    return
  }
  // 跳转到项目协作详情页面
  router.push(`/project/collaboration/${project.id}`)
}

// 发布成功回调
const handlePublishSuccess = () => {
  loadProjects()
}

// 组件挂载
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-management {
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

.header-actions {
  display: flex;
  gap: 10px;
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
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
  &.profit-positive {
    color: #67c23a;
  }
  &.profit-negative {
    color: #f56c6c;
  }
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.table-section {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 500;
}

.status-tag {
  flex-shrink: 0;
}

.text-muted {
  color: #909399;
}

.pagination-wrapper {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

.batch-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

:deep(.danger-item) {
  color: #f56c6c;
}

:deep(.el-table) {
  border-radius: 4px 4px 0 0;
}

.finance-card {
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}







/* 项目名称和状态样式 */
.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-name .name {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
}

.status-tag {
  flex-shrink: 0;
}
</style>