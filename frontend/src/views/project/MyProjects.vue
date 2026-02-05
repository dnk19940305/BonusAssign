<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的项目</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showJoinDialog">
          <el-icon><Plus /></el-icon>
          申请加入项目
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalProjects }}</div>
            <div class="stat-label">参与项目</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.activeProjects }}</div>
            <div class="stat-label">活跃项目</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.pendingApplications }}</div>
            <div class="stat-label">待审批申请</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ formatCurrency(stats.totalProjectBonus) }}</div>
            <div class="stat-label">项目奖金</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 项目列表 -->
    <div class="table-section">
      <!-- 搜索栏 -->
      <div class="search-bar" style="margin-bottom: 16px">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索项目名称或编码"
          clearable
          style="width: 300px; margin-right: 12px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <vxe-table
        ref="projectTable"
        :data="projectList"
        stripe
        border
        show-overflow="title"
        height="500"
        width="100%"
        empty-text="暂无项目数据"
        :empty-render="{ name: 'AEmpty' }"
      >
        <vxe-column field="projectName" title="项目名称" width="200">
          <template #default="scope">
            <div v-if="scope && scope.row" class="project-info">
              <div class="project-name">{{ scope.row.projectName }}</div>
              <div class="project-code">{{ scope.row.projectCode }}</div>
            </div>
          </template>
        </vxe-column>

        <vxe-column field="status" title="参与状态" width="120">
          <template #default="scope">
            <el-tag
              v-if="scope && scope.row"
              :type="getMemberStatusType(scope.row.status)"
              size="small"
            >
              {{ getMemberStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </vxe-column>

        <vxe-column field="roleName" title="项目角色" width="120">
          <template #default="scope">
            <span v-if="scope && scope.row && scope.row.roleName">{{ scope.row.roleName }}</span>
            <span v-else-if="scope && scope.row" class="text-muted">未分配</span>
          </template>
        </vxe-column>

        <vxe-column field="participationRatio" title="参与度" width="150">
          <template #default="scope">
             <span class="percentage-text">{{ scope.row.participationRatio }}%</span>
          </template>
        </vxe-column>

        <vxe-column field="projectStatus" title="项目状态" width="100">
          <template #default="scope">
            <el-tag
              v-if="scope && scope.row"
              :type="getProjectStatusType(scope.row.projectStatus)"
              size="small"
            >
              {{ getProjectStatusLabel(scope.row.projectStatus) }}
            </el-tag>
          </template>
        </vxe-column>

        <vxe-column field="joinDate" title="加入时间" width="120">
          <template #default="scope">
            <span v-if="scope && scope.row && scope.row.joinDate">{{ formatDate(scope.row.joinDate) }}</span>
            <span v-else-if="scope && scope.row">-</span>
          </template>
        </vxe-column>

        <vxe-column field="projectBonus" title="项目奖金" width="120">
          <template #default="scope">
            <span v-if="scope && scope.row && scope.row.projectBonus" class="bonus-amount">
              {{ formatCurrency(scope.row.projectBonus) }}
            </span>
            <span v-else-if="scope && scope.row">-</span>
          </template>
        </vxe-column>

        <vxe-column title="操作" width="500" fixed="right">
          <template #default="scope">
            <div v-if="scope && scope.row">
              <el-button
                v-if="scope.row.status === 'pending'"
                type="danger"
                size="small"
                text
                @click="cancelApplication(scope.row)"
              >
                取消申请
              </el-button>
              <el-button
                v-if="scope.row.status === 'active'"
                type="primary"
                size="small"
                text
                @click="viewProjectDetails(scope.row)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="scope.row.status === 'active' || scope.row.status === 'approved'"
                type="primary"
                size="small"
                text
                @click="viewTeamMembers(scope.row)"
              >
                团队成员
              </el-button>
              <el-button
                v-if="(scope.row.status === 'active' || scope.row.status === 'approved') && canManageProject(scope.row)"
                type="warning"
                size="small"
                text
                @click="manageParticipation(scope.row)"
              >
                管理参与度
              </el-button>
              <el-button
                v-if="(scope.row.status === 'active' || scope.row.status === 'approved') && canManageProject(scope.row)"
                type="success"
                size="small"
                text
                @click="manageWorkload(scope.row)"
              >
                管理工作量占比
              </el-button>
              <el-button
                v-if="(scope.row.status === 'active' || scope.row.status === 'approved') && canManageProject(scope.row)"
                type="warning"
                size="small"
                text
                @click="manageContributionWeight(scope.row)"
              >
                管理贡献权重
              </el-button>
              <el-button
                v-if="canManageProject(scope.row)"
                type="warning"
                size="small"
                text
                @click="changeProjectStatus(scope.row)"
              >
                修改状态
              </el-button>
              <el-button
                v-if="scope.row.status === 'approved'"
                type="success"
                size="small"
                text
                @click="viewProjectBonus(scope.row)"
              >
                奖金详情
              </el-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
      
      <!-- 分页器 -->
      <div class="pagination-section" style="margin-top: 16px; text-align: right">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 申请加入项目对话框 -->
    <el-dialog
      v-model="joinDialogVisible"
      title="申请加入项目"
      width="600px"
      @close="resetJoinForm"
    >
      <el-form
        ref="joinFormRef"
        :model="joinForm"
        :rules="joinFormRules"
        label-width="80px"
      >
        <el-form-item label="选择项目" prop="projectId">
          <el-select
            v-model="joinForm.projectId"
            placeholder="请选择要加入的项目"
            style="width: 100%"
            filterable
            @change="handleProjectSelect"
          >
            <el-option
              v-for="project in availableProjects"
              :key="project.id || project._id"
              :label="`${project.name} (${project.code})`"
              :value="project.id || project._id"
            >
              <div class="project-option">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-desc">{{ project.description }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="申请理由" prop="applyReason">
          <el-input
            v-model="joinForm.applyReason"
            type="textarea"
            :rows="4"
            placeholder="请说明申请加入此项目的理由和优势"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="期望角色">
          <el-select
            v-model="joinForm.expectedRole"
            placeholder="请选择期望的项目角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in projectRoles"
              :key="role.code"
              :label="role.name"
              :value="role.code"
            >
              <div>
                <span>{{ role.name }}</span>
                <span class="role-desc" v-if="role.description">{{ role.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="joinDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitJoinApplication" :loading="submitting">
            提交申请
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 我的项目详情对话框 -->
    <MyProjectDetailDialog
      v-model="projectDetailDialogVisible"
      :projectData="selectedProject"
      @viewBonus="handleViewBonusFromDetail"
    />

    <!-- 增强的奖金详情对话框 -->
    <EnhancedBonusDetailDialog
      v-model="bonusDialogVisible"
      :bonusData="selectedProjectBonus"
    />

    <!-- 团队成员对话框 -->
    <TeamMembersDialog
      v-model="teamMembersDialogVisible"
      :project-id="teamDialogProject.projectId"
      :project-name="teamDialogProject.projectName"
      :can-manage="teamDialogProject.canManage"
    />

    <!-- 修改项目状态对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="修改项目状态"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="项目名称">
          <span>{{ statusForm.projectName }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getProjectStatusType(statusForm.currentStatus)" size="small">
            {{ getProjectStatusLabel(statusForm.currentStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.newStatus" placeholder="请选择新状态" style="width: 100%">
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
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveStatusChange"
            :loading="savingStatus"
            :disabled="!statusForm.newStatus || statusForm.newStatus === statusForm.currentStatus"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 参与度管理对话框 -->
    <el-dialog
      v-model="participationDialogVisible"
      :title="`管理项目成员参与度 - ${participationForm.projectName}`"
      width="800px"
    >
      <div v-if="participationForm.members.length > 0">
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #title>
            <div>
              <p style="margin: 0 0 8px 0">参与度说明：</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.6">
                • 参与度范围：10% - 100%<br>
                • 参与度影响项目奖金分配<br>
                • 修改后将立即生效
              </p>
            </div>
          </template>
        </el-alert>

        <vxe-table :data="participationForm.members" border stripe max-height="400" show-overflow="title">
          <vxe-column field="employeeName" title="成员姓名" width="120" />
          <vxe-column field="roleName" title="项目角色" width="140" />
          <vxe-column title="当前参与度" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.originalRatio }}%</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="新参与度" width="280">
            <template #default="{ row }">
              <el-slider
                v-model="row.participationRatio"
                :min="10"
                :max="100"
                :step="5"
                show-input
                :show-input-controls="false"
                style="width: 100%"
              >
                <template #default="{ value }">
                  {{ value }}%
                </template>
              </el-slider>
            </template>
          </vxe-column>
          <vxe-column title="变化" width="100" align="center">
            <template #default="{ row }">
              <span
                v-if="Math.abs(row.participationRatio - row.originalRatio) > 0"
                :style="{
                  color: row.participationRatio > row.originalRatio ? '#67c23a' : '#f56c6c',
                  fontWeight: 'bold'
                }"
              >
                {{ row.participationRatio > row.originalRatio ? '+' : '' }}
                {{ row.participationRatio - row.originalRatio }}%
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </vxe-column>
        </vxe-table>

        <div style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 4px">
          <p style="margin: 0; font-size: 13px; color: #606266">
            <strong>总计：</strong>{{ participationForm.members.length }} 名成员
            <span style="margin-left: 20px">
              <strong>总参与度：</strong>
              {{ participationForm.members.reduce((sum, m) => sum + m.participationRatio, 0) }}%
            </span>
          </p>
        </div>
      </div>
      <el-empty v-else description="暂无成员" />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="participationDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveParticipationChanges"
            :loading="savingParticipation"
            :disabled="participationForm.members.length === 0"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 贡献权重管理对话框 -->
    <el-dialog
      v-model="contributionWeightDialogVisible"
      :title="`管理项目成员贡献权重 - ${contributionWeightForm.projectName}`"
      width="800px"
    >
      <div v-if="contributionWeightForm.members.length > 0">
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #title>
            <div>
              <p style="margin: 0 0 8px 0">贡献权重说明：</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.6">
                • 贡献权重范围：1% - 100%（默认100%）<br>
                • 影响项目奖金分配<br>
                • 数值越高表示贡献越大<br>
                • 修改后将立即生效
              </p>
            </div>
          </template>
        </el-alert>

        <vxe-table :data="contributionWeightForm.members" border stripe max-height="400" show-overflow="title">
          <vxe-column field="employeeName" title="成员姓名" width="120" />
          <vxe-column field="roleName" title="项目角色" width="140" />
          <vxe-column title="当前贡献权重" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.originalWeight.toFixed(0) }}%</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="新贡献权重" width="280">
            <template #default="{ row }">
              <el-slider
                v-model="row.contributionWeight"
                :min="1"
                :max="100"
                :step="1"
                show-stops
                show-input
                :show-input-controls="false"
                style="width: 100%"
              >
                <template #default="{ value }">
                  {{ value }}%
                </template>
              </el-slider>
            </template>
          </vxe-column>
          <vxe-column title="变化" width="100" align="center">
            <template #default="{ row }">
              <span
                v-if="Math.abs(row.contributionWeight - row.originalWeight) > 0.01"
                :style="{
                  color: row.contributionWeight > row.originalWeight ? '#67c23a' : '#f56c6c',
                  fontWeight: 'bold'
                }"
              >
                {{ row.contributionWeight > row.originalWeight ? '+' : '' }}
                {{ (row.contributionWeight - row.originalWeight).toFixed(0) }}%
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </vxe-column>
        </vxe-table>

        <div style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 4px">
          <p style="margin: 0; font-size: 13px; color: #606266">
            <strong>总计：</strong>{{ contributionWeightForm.members.length }} 名成员
            <span style="margin-left: 20px">
              <strong>平均贡献权重：</strong>
              {{ (contributionWeightForm.members.reduce((sum, m) => sum + m.contributionWeight, 0) / contributionWeightForm.members.length || 0).toFixed(2) }}%
            </span>
          </p>
        </div>
      </div>
      <el-empty v-else description="暂无成员" />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="contributionWeightDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveContributionWeightChanges"
            :loading="savingContributionWeight"
            :disabled="contributionWeightForm.members.length === 0"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 工作量占比管理对话框 -->
    <el-dialog
      v-model="workloadDialogVisible"
      :title="`管理项目成员工作量占比 - ${workloadForm.projectName}`"
      width="800px"
    >
      <div v-if="workloadForm.members.length > 0">
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #title>
            <div>
              <p style="margin: 0 0 8px 0">工作量占比说明：</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.6">
                • 工作量占比范围：1% - 100%（默认100%）<br>
                • 表示成员在该项目中投入的时间比例<br>
                • 影响项目奖金计算<br>
                • 兼职多个项目时，所有项目的工作量占比总和应 ≤ 100%
              </p>
            </div>
          </template>
        </el-alert>

        <vxe-table :data="workloadForm.members" border stripe max-height="400" show-overflow="title">
          <vxe-column field="employeeName" title="成员姓名" width="120" />
          <vxe-column field="roleName" title="项目角色" width="140" />
          <vxe-column title="当前工作量占比" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.originalWorkload }}%</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="新工作量占比" width="280">
            <template #default="{ row }">
              <el-slider
                v-model="row.estimatedWorkload"
                :min="1"
                :max="100"
                :step="5"
                show-input
                :show-input-controls="false"
                style="width: 100%"
              >
                <template #default="{ value }">
                  {{ value }}%
                </template>
              </el-slider>
            </template>
          </vxe-column>
          <vxe-column title="变化" width="100" align="center">
            <template #default="{ row }">
              <span
                v-if="Math.abs(row.estimatedWorkload - row.originalWorkload) > 0"
                :style="{
                  color: row.estimatedWorkload > row.originalWorkload ? '#67c23a' : '#f56c6c',
                  fontWeight: 'bold'
                }"
              >
                {{ row.estimatedWorkload > row.originalWorkload ? '+' : '' }}
                {{ row.estimatedWorkload - row.originalWorkload }}%
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </vxe-column>
        </vxe-table>

        <div style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 4px">
          <p style="margin: 0; font-size: 13px; color: #606266">
            <strong>总计：</strong>{{ workloadForm.members.length }} 名成员
            <span style="margin-left: 20px">
              <strong>总工作量占比：</strong>
              {{ workloadForm.members.reduce((sum, m) => sum + m.estimatedWorkload, 0) }}%
            </span>
          </p>
        </div>
      </div>
      <el-empty v-else description="暂无成员" />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="workloadDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveWorkloadChanges"
            :loading="savingWorkload"
            :disabled="workloadForm.members.length === 0"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading, Search } from '@element-plus/icons-vue'
import { projectMemberApi } from '@/api/projectMember'
import { projectApi } from '@/api/project'
import { projectCollaborationApi } from '@/api/projectCollaboration'
import { getProjectRoles } from '@/api/projectRoles'
import { formatCurrency, formatDate } from '@/utils/format'
import MyProjectDetailDialog from './components/MyProjectDetailDialog.vue'
import EnhancedBonusDetailDialog from './components/EnhancedBonusDetailDialog.vue'
import TeamMembersDialog from './components/TeamMembersDialog.vue'

// 数据定义
const loading = ref(false)
const projectList = ref([])
const availableProjects = ref([])
const projectRoles = ref([])
const stats = reactive({
  totalProjects: 0,
  activeProjects: 0,
  pendingApplications: 0,
  totalProjectBonus: 0
})

// 搜索表单
const searchForm = reactive({
  search: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 申请加入项目相关
const joinDialogVisible = ref(false)
const joinFormRef = ref()
const submitting = ref(false)
const joinForm = reactive({
  projectId: '',
  applyReason: '',
  expectedRole: ''
})

const joinFormRules = {
  projectId: [
    { required: true, message: '请选择要加入的项目', trigger: 'change' }
  ],
  applyReason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
  ]
}

// 奖金详情相关
const bonusDialogVisible = ref(false)
const selectedProjectBonus = ref(null)

// 项目详情对话框相关
const projectDetailDialogVisible = ref(false)
const selectedProject = ref(null)
const teamMembersDialogVisible = ref(false)
const teamDialogProject = ref({ projectId: '', projectName: '', canManage: false })
const userStore = useUserStore()

// 修改状态对话框
const statusDialogVisible = ref(false)
const statusForm = reactive({
  projectId: '',
  projectName: '',
  currentStatus: '',
  newStatus: ''
})
const savingStatus = ref(false)

// 参与度管理对话框
const participationDialogVisible = ref(false)
const participationForm = reactive({
  projectId: '',
  projectName: '',
  members: []
})
const savingParticipation = ref(false)

// 贡献权重管理对话框
const contributionWeightDialogVisible = ref(false)
const contributionWeightForm = reactive({
  projectId: '',
  projectName: '',
  members: []
})
const savingContributionWeight = ref(false)

// 工作量占比管理对话框
const workloadDialogVisible = ref(false)
const workloadForm = reactive({
  projectId: '',
  projectName: '',
  members: []
})
const savingWorkload = ref(false)

// 状态和标签映射
const MEMBER_STATUS_LABELS = {
  active: '已通过',
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝'
}

const PROJECT_STATUS_LABELS = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  on_hold: '暂停'
}

const BONUS_STATUS_LABELS = {
  calculated: '已计算',
  approved: '已审批',
  distributed: '已发放'
}

// 方法定义
const getMemberStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    active: 'success',
  }
  return types[status] || 'info'
}

const getMemberStatusLabel = (status) => {
  return MEMBER_STATUS_LABELS[status] || '未知'
}

const getProjectStatusType = (status) => {
  const types = {
    planning: 'info',
    active: 'success',
    completed: 'primary',
    cancelled: 'danger',
    on_hold: 'warning'
  }
  return types[status] || 'info'
}

const getProjectStatusLabel = (status) => {
  return PROJECT_STATUS_LABELS[status] || '未知'
}

const getBonusStatusType = (status) => {
  const types = {
    calculated: 'warning',
    approved: 'primary',
    distributed: 'success'
  }
  return types[status] || 'info'
}

const getBonusStatusLabel = (status) => {
  return BONUS_STATUS_LABELS[status] || '未知'
}

// 加载我的项目列表
const loadMyProjects = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    if (searchForm.search) {
      params.search = searchForm.search
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    const response = await projectMemberApi.getMyProjects(params)

    // 根据后端修复后的数据结构解析
    if (response && response.data && response.data.data) {
      const data = response.data.data
      
      // 新格式：{ list, page, pageSize, total }
      if (Array.isArray(data.list)) {
        projectList.value = data.list.filter(item => item && typeof item === 'object')
        pagination.total = data.total || 0
        pagination.page = data.page || 1
        pagination.pageSize = data.pageSize || 20
      }
      // 兼容旧格式：{ projects, total }
      else if (Array.isArray(data.projects)) {
        projectList.value = data.projects.filter(item => item && typeof item === 'object')
        pagination.total = data.total || projectList.value.length
      } else {
        projectList.value = []
        pagination.total = 0
      }
    } else if (response && response.data && Array.isArray(response.data)) {
      // 兼容格式：直接返回数组
      projectList.value = response.data.filter(item => item && typeof item === 'object')
      pagination.total = projectList.value.length
    } else {
      projectList.value = []
      pagination.total = 0
    }

    // 计算统计数据（基于总数，不是当前页）
    stats.totalProjects = pagination.total
    stats.activeProjects = projectList.value.filter(p => p && p.projectStatus === 'active').length
    stats.pendingApplications = projectList.value.filter(p => p && p.status === 'pending').length
    stats.totalProjectBonus = projectList.value
      .filter(p => p && p.projectBonus && !isNaN(Number(p.projectBonus)))
      .reduce((sum, p) => sum + Number(p.projectBonus), 0)

  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败: ' + (error.message || '未知错误'))
    projectList.value = []
    pagination.total = 0

    // 重置统计数据
    stats.totalProjects = 0
    stats.activeProjects = 0
    stats.pendingApplications = 0
    stats.totalProjectBonus = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1 // 重置到第一页
  loadMyProjects()
}

// 重置搜索
const handleReset = () => {
  searchForm.search = ''
  searchForm.status = ''
  pagination.page = 1
  loadMyProjects()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  loadMyProjects()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadMyProjects()
}

// 加载可申请的项目
const loadAvailableProjects = async () => {
  try {
    // 使用协作中心的API，支持分页和搜索
    const response = await projectCollaborationApi.getAvailableProjects({
      page: 1,
      pageSize: 100  // 加大页面大小以获取更多项目
    })

    // 检查后端返回的数据结构 - 标准分页格式
    if (response && response.data && response.data.list && Array.isArray(response.data.list)) {
      availableProjects.value = response.data.list
      console.log(`✅ 获取可申请项目成功: ${response.data.list.length} 个，总数: ${response.data.total}`)
    } else {
      availableProjects.value = []
      console.warn('⚠️ 响应数据格式异常:', response)
      ElMessage.warning('未找到可申请的项目')
    }
  } catch (error) {
    console.error('加载可申请项目失败:', error)
    availableProjects.value = []
    ElMessage.error('加载可申请项目失败: ' + (error.message || '网络错误'))
  }
}

// 加载项目角色列表
const loadProjectRoles = async () => {
  try {
    const response = await getProjectRoles({ status: 1, pageSize: 100 })
    if (response.data) {
      projectRoles.value = response.data.data || response.data.list || []
    }
  } catch (error) {
    console.error('加载项目角色失败:', error)
    ElMessage.error('加载项目角色失败')
  }
}

// 显示申请加入项目对话框
const showJoinDialog = async () => {
  await loadAvailableProjects()
  await loadProjectRoles()
  joinDialogVisible.value = true
}

// 重置申请表单
const resetJoinForm = () => {
  Object.assign(joinForm, {
    projectId: '',
    applyReason: '',
    expectedRole: ''
  })
  joinFormRef.value?.resetFields()
}

// 提交加入申请
const submitJoinApplication = async () => {
  try {
    const valid = await joinFormRef.value.validate()
    if (!valid) return

    submitting.value = true
    await projectMemberApi.applyToJoin({
      projectId: joinForm.projectId,
      applyReason: joinForm.applyReason,
      expectedRole: joinForm.expectedRole
    })

    ElMessage.success('申请提交成功，请等待项目经理审批')
    joinDialogVisible.value = false
    await loadMyProjects()

  } catch (error) {
    ElMessage.error('提交申请失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// 取消申请
const cancelApplication = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消此项目申请吗？', '确认取消', {
      type: 'warning'
    })

    await projectMemberApi.cancelApplication(row._id)
    ElMessage.success('申请已取消')
    await loadMyProjects()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消申请失败: ' + error.message)
    }
  }
}

// 查看项目详情
const viewProjectDetails = (row) => {
  selectedProject.value = row
  projectDetailDialogVisible.value = true
}

// 查看项目奖金详情
const viewProjectBonus = async (row) => {
  try {
    const response = await projectMemberApi.getProjectBonusDetails(row.projectId, '2024Q4')
    selectedProjectBonus.value = response.data
    bonusDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取奖金详情失败: ' + error.message)
  }
}

// 从详情对话框打开奖金详情
const handleViewBonusFromDetail = (projectData) => {
  viewProjectBonus(projectData)
}

// 查看团队成员管理
const viewTeamMembers = (row) => {
  const userCanManage = userStore.hasAnyPermission(['project:update', 'admin', 'project_manager', '*'])
  teamDialogProject.value = {
    projectId: row.projectId || row.id || row._id,
    projectName: row.projectName || row.name || '',
    canManage: userCanManage || !!(row && (row.isManager === true))
  }
  teamMembersDialogVisible.value = true
}

// 判断是否可以管理项目（是项目经理或有管理权限）
const canManageProject = (row) => {
  if (!row) return false
  // 检查是否是项目经理
  if (row.isManager === true || row.roleName === '项目经理') return true
  // 检查是否有管理权限
  return userStore.hasAnyPermission(['project:update', 'admin', 'project_manager', '*'])
}

// 管理项目成员参与度
const manageParticipation = async (row) => {
  try {
    loading.value = true
    const projectId = row.projectId || row.id || row._id
    
    // 加载项目成员列表
    const response = await projectMemberApi.getProjectMembers(projectId)
    const members = response.data || []
    
    // 过滤活跃成员
    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'approved')
    
    participationForm.projectId = projectId
    participationForm.projectName = row.projectName || row.name || ''
    participationForm.members = activeMembers.map(m => {
      const ratio = m.participationRatio || 0
      return {
        id: m.id || m._id,
        employeeName: m.employeeName || m.employee?.name || '未知',
        roleId: m.roleId || m.role_id,
        roleName: m.roleName || '未分配',
        participationRatio: ratio > 1 ? Math.round(ratio) : Math.round(ratio * 100),
        originalRatio: ratio > 1 ? Math.round(ratio) : Math.round(ratio * 100)
      }
    })
    
    participationDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载成员信息失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 修改项目状态
const changeProjectStatus = (row) => {
  statusForm.projectId = row.projectId || row.id || row._id
  statusForm.projectName = row.projectName || row.name || ''
  statusForm.currentStatus = row.projectStatus || 'planning'
  statusForm.newStatus = row.projectStatus || 'planning'
  statusDialogVisible.value = true
}

// 保存状态修改
const saveStatusChange = async () => {
  try {
    if (!statusForm.newStatus || statusForm.newStatus === statusForm.currentStatus) {
      ElMessage.warning('请选择不同的状态')
      return
    }

    await ElMessageBox.confirm(
      `确定要将项目状态从"${getProjectStatusLabel(statusForm.currentStatus)}"修改为"${getProjectStatusLabel(statusForm.newStatus)}"吗？`,
      '确认修改',
      { type: 'warning' }
    )

    savingStatus.value = true
    
    await projectApi.updateProject(statusForm.projectId, {
      status: statusForm.newStatus
    })

    ElMessage.success('项目状态修改成功')
    statusDialogVisible.value = false

    // 刷新项目列表
    await loadMyProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('修改状态失败: ' + (error.message || '未知错误'))
    }
  } finally {
    savingStatus.value = false
  }
}

// 保存参与度修改
const saveParticipationChanges = async () => {
  try {
    await ElMessageBox.confirm('确定要保存所有成员的参与度修改吗？', '确认保存', {
      type: 'warning'
    })
    
    savingParticipation.value = true
    
    // 找出被修改的成员
    const changedMembers = participationForm.members.filter(m => {
      return Math.abs(m.participationRatio - m.originalRatio) > 0.1
    })
    
    if (changedMembers.length === 0) {
      ElMessage.info('没有任何修改')
      participationDialogVisible.value = false
      return
    }
    // 批量更新
    const updatePromises = changedMembers.map(m => 
      projectMemberApi.setMemberParticipation(m.id, {
        roleId: m.roleId,
        participationRatio: m.participationRatio
      })
    )
    
    await Promise.all(updatePromises)
    
    ElMessage.success(`已成功更新 ${changedMembers.length} 个成员的参与度`)
    participationDialogVisible.value = false
    
    // 刷新项目列表
    await loadMyProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失败: ' + error.message)
    }
  } finally {
    savingParticipation.value = false
  }
}

// 管理项目成员贡献权重
const manageContributionWeight = async (row) => {
  try {
    loading.value = true
    const projectId = row.projectId || row.id || row._id
    
    // 加载项目成员列表
    const response = await projectMemberApi.getProjectMembers(projectId)
    const members = response.data || []
    
    // 过滤活跃成员
    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'approved')
    
    contributionWeightForm.projectId = projectId
    contributionWeightForm.projectName = row.projectName || row.name || ''
    contributionWeightForm.members = activeMembers.map(m => {
      // 贡献权重以百分比形式存储（0-100）
      const weight = m.contributionWeight || m.contribution_weight || 100
      // 如果值小于等于1，说明是旧的小数格式，需要转换为百分比
      const percentageWeight = weight <= 1 ? weight * 100 : weight
      return {
        id: m.id || m._id,
        employeeName: m.employeeName || m.employee?.name || '未知',
        roleId: m.roleId || m.role_id,
        roleName: m.roleName || '未分配',
        contributionWeight: Math.min(100, Math.round(percentageWeight)),
        originalWeight: Math.min(100, Math.round(percentageWeight))
      }
    })
    
    contributionWeightDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载成员信息失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 保存贡献权重修改
const saveContributionWeightChanges = async () => {
  try {
    await ElMessageBox.confirm('确定要保存所有成员的贡献权重修改吗？', '确认保存', {
      type: 'warning'
    })
    
    savingContributionWeight.value = true
    
    // 找出被修改的成员
    const changedMembers = contributionWeightForm.members.filter(m => {
      return Math.abs(m.contributionWeight - m.originalWeight) > 0.01
    })
    
    if (changedMembers.length === 0) {
      ElMessage.info('没有任何修改')
      contributionWeightDialogVisible.value = false
      return
    }
    
    // 批量更新（直接使用百分比值保存）
    const updatePromises = changedMembers.map(m => 
      projectMemberApi.updateMemberRole(m.id, {
        roleId: m.roleId,
        contributionWeight: m.contributionWeight  // 直接使用百分比值
      })
    )
    
    await Promise.all(updatePromises)
    
    ElMessage.success(`已成功更新 ${changedMembers.length} 个成员的贡献权重`)
    contributionWeightDialogVisible.value = false
    
    // 刷新项目列表
    await loadMyProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失败: ' + error.message)
    }
  } finally {
    savingContributionWeight.value = false
  }
}

// 管理项目成员工作量占比
const manageWorkload = async (row) => {
  try {
    loading.value = true
    const projectId = row.projectId || row.id || row._id
    
    // 加载项目成员列表
    const response = await projectMemberApi.getProjectMembers(projectId)
    const members = response.data || []
    console.log('加载到的成员数据:', members)
    
    // 过滤活跃成员
    const activeMembers = members.filter(m => m.status === 'active' || m.status === 'approved')
    
    workloadForm.projectId = projectId
    workloadForm.projectName = row.projectName || row.name || ''
    workloadForm.members = activeMembers.map(m => {
      // 工作量占比以百分比形式存储（1-100）
      const workload = m.estimatedWorkload || m.estimated_workload || 100
      // 如果值小于等于1，说明是旧的小数格式，需要转换为百分比
      const percentageWorkload = workload <= 1 ? workload * 100 : workload
      return {
        id: m.id || m._id,
        employeeName: m.employeeName || m.employee?.name || '未知',
        roleId: m.roleId || m.role_id,
        roleName: m.roleName || '未分配',
        estimatedWorkload: Math.min(100, Math.max(1, Math.round(percentageWorkload))),
        originalWorkload: Math.min(100, Math.max(1, Math.round(percentageWorkload)))
      }
    })
    
    workloadDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载成员信息失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 保存工作量占比修改
const saveWorkloadChanges = async () => {
  try {
    await ElMessageBox.confirm('确定要保存所有成员的工作量占比修改吗？', '确认保存', {
      type: 'warning'
    })
    
    savingWorkload.value = true
    
    // 找出被修改的成员
    const changedMembers = workloadForm.members.filter(m => {
      return Math.abs(m.estimatedWorkload - m.originalWorkload) > 0.01
    })
    
    if (changedMembers.length === 0) {
      ElMessage.info('没有任何修改')
      workloadDialogVisible.value = false
      return
    }
    
    // 批量更新（直接使用百分比值保存）
    const updatePromises = changedMembers.map(m => {
      console.log('更新工作量占比 - 成员ID:', m.id, '工作量:', m.estimatedWorkload)
      return projectMemberApi.updateMemberWorkload(m.id, {
        estimatedWorkload: m.estimatedWorkload  // 直接使用百分比值
      })
    })
    
    await Promise.all(updatePromises)
    
    ElMessage.success(`已成功更新 ${changedMembers.length} 个成员的工作量占比`)
    workloadDialogVisible.value = false
    
    // 刷新项目列表
    await loadMyProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失败: ' + error.message)
    }
  } finally {
    savingWorkload.value = false
  }
}

// 生命周期
onMounted(() => {
  loadMyProjects()
})
</script>

<style scoped>
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

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.project-info .project-name {
  font-weight: 500;
  color: #303133;
}

.project-info .project-code {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.bonus-amount {
  color: #67c23a;
  font-weight: 500;
}

.text-muted {
  color: #c0c4cc;
}

.project-option {
  line-height: 1.4;
}

.project-option .project-name {
  font-weight: 500;
}

.project-option .project-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.role-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.bonus-overview h4 {
  margin-bottom: 16px;
  color: #303133;
}

.calculation-formula {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.calculation-formula p {
  margin: 8px 0;
}
</style>
