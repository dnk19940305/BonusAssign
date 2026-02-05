<template>
  <el-dialog
    v-model="dialogVisible"
    title="我的项目详情"
    width="900px"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="my-project-detail">
      <el-row :gutter="20" v-if="projectData">
        <!-- 项目基本信息卡片 -->
        <el-col :span="24">
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <span>项目基本信息</span>
                <div class="project-badges">
                  <el-tag :type="getProjectStatusType(projectData.projectStatus)" size="large">
                    {{ getProjectStatusLabel(projectData.projectStatus) }}
                  </el-tag>
                  <el-tag
                    :type="getMemberStatusType(projectData.status)"
                    class="ml-2"
                    size="large"
                  >
                    {{ getMemberStatusLabel(projectData.status) }}
                  </el-tag>
                </div>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>项目名称：</label>
                  <span class="value-text">{{ projectData.projectName }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>项目代码：</label>
                  <span class="value-text">{{ projectData.projectCode }}</span>
                </div>
              </el-col>
            </el-row>

            <div class="detail-item" v-if="fullProjectInfo.description">
              <label>项目描述：</label>
              <span class="value-text">{{ fullProjectInfo.description }}</span>
            </div>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="detail-item">
                  <label>项目经理：</label>
                  <span class="value-text">{{ fullProjectInfo.Manager.name || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <label>项目预算：</label>
                  <span class="value-text">{{ formatCurrency(fullProjectInfo.budget) }}</span>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>

        <!-- 我的参与信息卡片 -->
        <el-col :span="24">
          <el-card class="detail-card member-card">
            <template #header>
              <div class="card-header">
                <span>我的参与信息</span>
                <el-tag type="success" v-if="projectData.status === 'active'">
                  <el-icon><Check /></el-icon>
                  已激活
                </el-tag>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="detail-item">
                  <label>我的角色：</label>
                  <span class="value-text role-badge">
                    <el-tag type="primary">{{ projectData.roleName || '未分配' }}</el-tag>
                  </span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <label>参与度：</label>
                  <span class="value-text highlight-value">{{ formatParticipation(projectData.participationRatio) }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <label>加入日期：</label>
                  <span class="value-text">{{ formatDate(projectData.joinDate) }}</span>
                </div>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="detail-item">
                  <label>角色权重：</label>
                  <span class="value-text">
                    <el-tag type="warning">{{ currentRoleWeight.toFixed(1) }}</el-tag>
                  </span>
                </div>
              </el-col>
              <el-col :span="8" v-if="projectData.contributionWeight">
                <div class="detail-item">
                  <label>贡献权重：</label>
                  <span class="value-text">{{ formatParticipation(projectData.contributionWeight) }}</span>
                </div>
              </el-col>
              <el-col :span="8" v-if="projectData.estimatedWorkload">
                <div class="detail-item">
                  <label>工作量占比：</label>
                  <span class="value-text">{{ formatParticipation(projectData.estimatedWorkload) }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="projectData.projectBonus">
              <el-col :span="8">
                <div class="detail-item">
                  <label>项目奖金：</label>
                  <span class="value-text highlight-value">{{ formatCurrency(projectData.projectBonus) }}</span>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>

        <!-- 项目时间线和进度 -->
        <el-col :span="24" v-if="fullProjectInfo.startDate && fullProjectInfo.endDate">
          <el-card class="detail-card">
            <template #header>
              <span>项目时间线</span>
            </template>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="detail-item">
                  <label>开始日期：</label>
                  <span class="value-text">{{ formatDate(fullProjectInfo.startDate) }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <label>结束日期：</label>
                  <span class="value-text">{{ formatDate(fullProjectInfo.endDate) }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-item">
                  <label>项目工期：</label>
                  <span class="value-text">{{ getProjectDuration() }} 天</span>
                </div>
              </el-col>
            </el-row>

            <div class="timeline-progress">
              <div class="progress-info">
                <span class="progress-label">项目进度</span>
              </div>
              <el-progress
                :percentage="getProjectProgress()"
                :color="getProgressColor()"
                :stroke-width="12"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 团队成员列表 -->
        <el-col :span="24">
          <el-card class="detail-card">
            <template #header>
              <div class="card-header">
                <span>团队成员 ({{ teamMembers.length }}人)</span>
                <div class="header-actions">
                  <el-button
                    v-if="canManageMembers"
                    type="primary"
                    size="small"
                    @click="showAddMemberDialog"
                  >
                    <el-icon><Plus /></el-icon>
                    添加成员
                  </el-button>
                  <el-button
                    size="small"
                    @click="loadTeamMembers"
                    :loading="loadingMembers"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </template>

            <div v-loading="loadingMembers" class="team-members">
              <div
                v-for="member in teamMembers"
                :key="member.id"
                class="member-item"
                :class="{ 'is-me': member.employeeId === projectData.employeeId }"
              >
                <div class="member-avatar">
                  <el-avatar :size="40">
                    {{ member.employeeName?.charAt(0) || '?' }}
                  </el-avatar>
                  <el-tag
                    v-if="member.employeeId === projectData.employeeId"
                    type="success"
                    size="small"
                    class="me-badge"
                  >
                    我
                  </el-tag>
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ member.employeeName }}
                    <el-tag size="small" type="primary" class="ml-1">
                      {{ member.roleName }}
                    </el-tag>
                  </div>
                  <div class="member-meta">
                    <span>参与度: {{ formatParticipation(member.participationRatio) }}</span>
                    <el-divider direction="vertical" />
                    <span>状态: {{ getMemberStatusLabel(member.status) }}</span>
                    <el-divider direction="vertical" />
                    <span>加入: {{ formatDate(member.joinDate) }}</span>
                  </div>
                </div>
                <div class="member-actions">
                  <el-tag :type="getMemberStatusType(member.status)">
                    {{ getMemberStatusLabel(member.status) }}
                  </el-tag>
                </div>
              </div>

              <el-empty
                v-if="teamMembers.length === 0"
                description="暂无团队成员数据"
                :image-size="80"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 项目里程碑 -->
        <el-col :span="24" v-if="fullProjectInfo.id">
          <el-card class="detail-card">
            <template #header>
              <span>项目里程碑</span>
            </template>
            <MilestoneTracker 
              :project-id="String(fullProjectInfo.id)"
              :can-edit="canManageMilestones"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          type="primary"
          @click="viewBonus"
          v-if="projectData && projectData.projectBonus > 0"
        >
          <el-icon><Coin /></el-icon>
          查看奖金详情
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 添加成员对话框 -->
  <el-dialog
    v-model="addMemberDialogVisible"
    title="添加团队成员"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="addMemberForm" label-width="100px">
      <el-form-item label="选择员工" required>
        <el-select
          v-model="addMemberForm.employeeId"
          filterable
          remote
          reserve-keyword
          placeholder="输入员工姓名或编号搜索"
          :remote-method="handleRemoteSearch"
          :loading="loadingEmployees"
          style="width: 100%"
          @change="handleEmployeeSelect"
        >
          <el-option
            v-for="employee in availableEmployees"
            :key="employee.id || employee._id"
            :label="`${employee.name} (${employee.employeeNo})`"
            :value="employee.id || employee._id"
          >
            <div class="employee-option">
              <span class="employee-name">{{ employee.name }}</span>
              <span class="employee-info">{{ employee.employeeNo }}</span>
              <span class="employee-dept" v-if="employee.Department">
                {{ employee.Department.name }}
              </span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="项目角色" required>
        <el-select
          v-model="addMemberForm.roleId"
          placeholder="请选择项目角色"
          style="width: 100%"
        >
          <el-option
            v-for="role in projectRoles"
            :key="role.id || role._id"
            :label="role.name"
            :value="role.id || role._id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="参与度" required>
        <el-slider
          v-model="addMemberForm.participationRatio"
          :min="10"
          :max="100"
          :step="5"
          show-input
          :show-input-controls="false"
          style="width: 100%"
        />
        <div class="form-tip">范围：10% - 100%，表示成员在项目中的参与程度</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancelAddMember">取消</el-button>
        <el-button type="primary" @click="handleAddMember">
          确认添加
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Refresh, Coin, Plus } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
// @ts-ignore
import { projectMemberApi } from '@/api/projectMember'
import * as projectBonusApi from '@/api/projectBonus'
import { getEmployees } from '@/api/employee'
import { useUserStore } from '@/store/modules/user'
import MilestoneTracker from './MilestoneTracker.vue'

// Props & Emits
interface Props {
  modelValue: boolean
  projectData?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'viewBonus', projectData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  projectData: null
})

const emit = defineEmits<Emits>()

// Store
const userStore = useUserStore()

// Refs
const loading = ref(false)
const loadingMembers = ref(false)
const fullProjectInfo = ref<any>({
  Manager: {
    name: ''
  }
})
const teamMembers = ref<any[]>([])
const projectRoleWeights = ref<Record<string, number>>({})
const currentRoleWeight = ref(1.0)

// 添加成员相关
const addMemberDialogVisible = ref(false)
const loadingEmployees = ref(false)
const addMemberForm = ref({
  employeeId: '',
  roleId: '',
  participationRatio: 100 // 默认100%
})
const availableEmployees = ref<any[]>([])
const projectRoles = ref<any[]>([])
const employeeSearchKeyword = ref('')
let searchTimer: any = null // 防抖定时器

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 权限判断：是否可以管理成员(只有项目经理可以)
const canManageMembers = computed(() => {
  if (!props.projectData || !fullProjectInfo.value) return false
  const currentEmployeeId = (userStore.user as any)?.employeeId
  return fullProjectInfo.value.managerId === currentEmployeeId
})

// 权限判断：是否可以管理里程碁(项目经理和管理员可以)
const canManageMilestones = computed(() => {
  if (!props.projectData || !fullProjectInfo.value) return false
  
  // 超级管理员和项目经理可以管理
  if (userStore.hasAnyPermission(['*', 'admin', 'project_manager'])) {
    return true
  }
  
  const currentEmployeeId = (userStore.user as any)?.employeeId
  return fullProjectInfo.value.managerId === currentEmployeeId
})

// Watch dialog visibility
watch(dialogVisible, (visible) => {
  if (visible && props.projectData) {
    loadProjectDetails()
    loadTeamMembers()
    loadRoleWeights()
  }
})

// Load full project details
const loadProjectDetails = async () => {
  if (!props.projectData?.projectId) return

  loading.value = true
  try {
    const response = await projectApi.getProject(props.projectData.projectId)
    fullProjectInfo.value = response.data || {}
  } catch (error: any) {
    console.error('加载项目详情失败:', error)
    // Use basic info from projectData if API fails
    fullProjectInfo.value = {
      description: '',
      managerName: '',
      budget: 0,
      bonusScale: 0,
      startDate: '',
      endDate: ''
    }
  } finally {
    loading.value = false
  }
}

// Load team members
const loadTeamMembers = async () => {
  if (!props.projectData?.projectId) return

  loadingMembers.value = true
  try {
    const response = await projectMemberApi.getProjectMembers(props.projectData.projectId)
    // 后端返回的数据结构是 { code, message, data: members }
    teamMembers.value = response.data?.data || response.data || []
  } catch (error: any) {
    teamMembers.value = []
    ElMessage.warning('加载团队成员失败')
  } finally {
    loadingMembers.value = false
  }
}

// 加载项目角色权重
const loadRoleWeights = async () => {
  if (!props.projectData?.projectId) return

  try {
    const response = await projectBonusApi.getRoleWeights(props.projectData.projectId)
    const weightsData = response?.data?.data || response?.data || {}
    projectRoleWeights.value = weightsData
    
    console.log('🔍 调试信息:', {
      'projectData.roleCode': props.projectData?.roleCode,
      'projectData.roleId': props.projectData?.roleId,
      'projectData.roleName': props.projectData?.roleName,
      '所有权重配置': weightsData
    })
    
    // 获取当前成员的角色权重
    if (props.projectData?.roleCode) {
      const weight = weightsData[props.projectData.roleCode]
      currentRoleWeight.value = weight !== undefined ? weight : 1.0
      console.log(`✅ 使用roleCode查找: ${props.projectData.roleCode} => ${weight}`)
    } else if (props.projectData?.roleId) {
      // 如果没有roleCode,通过API查询角色信息获取code
      try {
        // 先加载角色列表(如果还没加载)
        if (projectRoles.value.length === 0) {
          const rolesResponse = await projectMemberApi.getProjectRoles()
          projectRoles.value = rolesResponse.data || []
        }
        
        // 查找匹配的角色
        const roleId = props.projectData.roleId
        const role = projectRoles.value.find(r => 
          (r.id === roleId || r.id === Number(roleId)) || 
          (r._id === roleId || r._id === Number(roleId))
        )
        
        if (role && role.code) {
          const weight = weightsData[role.code]
          currentRoleWeight.value = weight !== undefined ? weight : 1.0
        } else {
          console.warn('⚠️ 未找到匹配的角色', {roleId, availableRoles: projectRoles.value})
          currentRoleWeight.value = 1.0
        }
      } catch (error) {
        console.error('加载角色列表失败:', error)
        currentRoleWeight.value = 1.0
      }
    } else {
      console.warn('⚠️ roleCode和roleId都为空')
      currentRoleWeight.value = 1.0
    }
    
    console.log('✅ 项目角色权重加载成功:', {
      roleCode: props.projectData?.roleCode,
      roleId: props.projectData?.roleId,
      currentWeight: currentRoleWeight.value,
      allWeights: projectRoleWeights.value
    })
  } catch (error: any) {
    console.error('加载项目角色权重失败:', error)
    currentRoleWeight.value = 1.0
  }
}

// Format functions
const formatDate = (dateString: string): string => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) return '¥0.00'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

const formatPercent = (value: number): string => {
  if (!value || isNaN(value)) return '0%'
  // allocationPercentage 后端存储的已经是百分比数值(如100表示100%),不需要再乘100
  return `${Number(value).toFixed(1)}%`
}

const formatParticipation = (value: number): string => {
  if (!value || isNaN(value)) return '0%'
  // 智能转换：如果值小于等于1且不为0，则视为小数格式(0-1)，需要乘以100
  const displayValue = value > 1 ? Math.round(value) : Math.round(value * 100)
  return `${displayValue}%`
}

// Project status helpers
const getProjectStatusType = (status: string): string => {
  const types: Record<string, string> = {
    active: 'success',
    completed: 'info',
    cancelled: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const getProjectStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    pending: '待开始'
  }
  return labels[status] || '未知'
}

// Member status helpers
const getMemberStatusType = (status: string): string => {
  const types: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    removed: 'danger'
  }
  return types[status] || 'info'
}

const getMemberStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '活跃',
    pending: '待审批',
    removed: '已移除'
  }
  return labels[status] || '未知'
}

// Calculate project duration
const getProjectDuration = (): number => {
  if (!fullProjectInfo.value.startDate || !fullProjectInfo.value.endDate) return 0

  const start = new Date(fullProjectInfo.value.startDate)
  const end = new Date(fullProjectInfo.value.endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate project progress
const getProjectProgress = (): number => {
  // 优先使用后端返回的 overallProgress 值
  if (fullProjectInfo.value.overallProgress !== undefined && fullProjectInfo.value.overallProgress !== null) {
    return fullProjectInfo.value.overallProgress
  }
  
  // 如果后端没有返回，则基于时间计算
  if (!fullProjectInfo.value.startDate || !fullProjectInfo.value.endDate) return 0

  const start = new Date(fullProjectInfo.value.startDate)
  const end = new Date(fullProjectInfo.value.endDate)
  const now = new Date()

  if (now < start) return 0
  if (now > end) return 100

  const totalTime = end.getTime() - start.getTime()
  const elapsedTime = now.getTime() - start.getTime()

  return Math.round((elapsedTime / totalTime) * 100)
}

// Get progress bar color
const getProgressColor = (): string => {
  const progress = getProjectProgress()
  if (progress < 30) return '#409EFF'
  if (progress < 70) return '#E6A23C'
  if (progress < 100) return '#F56C6C'
  return '#67C23A'
}

// View bonus details
const viewBonus = () => {
  emit('viewBonus', props.projectData)
  handleClose()
}

// Handle close
const handleClose = () => {
  dialogVisible.value = false
}

// 显示添加成员对话框
const showAddMemberDialog = async () => {
  addMemberDialogVisible.value = true
  await loadProjectRoles()
}

// 加载项目角色
const loadProjectRoles = async () => {
  try {
    const response = await projectMemberApi.getProjectRoles()
    projectRoles.value = response.data || []
    console.log('项目角色加载成功:', projectRoles.value)
  } catch (error: any) {
    console.error('加载项目角色失败:', error)
    ElMessage.warning('加载项目角色失败')
  }
}

// 远程搜索处理函数
const handleRemoteSearch = (query: string) => {
  console.log('🔍 [远程搜索] 接收到查询:', query, '长度:', query?.length)
  employeeSearchKeyword.value = query
  
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // 防抖：300ms 后才执行搜索，避免输入法连续触发
  searchTimer = setTimeout(() => {
    searchEmployees()
  }, 300)
}

// 搜索员工
const searchEmployees = async () => {
  console.log('🔍 [搜索员工] 开始搜索, 关键词:', employeeSearchKeyword.value)
  
  // 中文输入至少1个字符就可以搜索
  if (!employeeSearchKeyword.value || employeeSearchKeyword.value.trim().length < 1) {
    console.log('⚠️ [搜索员工] 搜索关键词为空或过短，取消搜索')
    availableEmployees.value = []
    return
  }

 
  loadingEmployees.value = true
  try {
    const response = await getEmployees({
      search: employeeSearchKeyword.value,
      status: 1,
      page: 1,
      pageSize: 20
    })

    // 用户确认后端返回标准格式：response.data.list
    const employees = response.data.list || []
  
    
    // 过滤掉已经是团队成员的员工
    const memberEmployeeIds = teamMembers.value.map(m => m.employeeId)
    availableEmployees.value = employees.filter((emp: any) => {
      const empId = emp.id || emp._id
      const isAlreadyMember = memberEmployeeIds.includes(empId)
      return !isAlreadyMember
    })
  } catch (error: any) {
    console.error('搜索员工失败:', error)
    ElMessage.warning('搜索员工失败')
    availableEmployees.value = []
  } finally {
    loadingEmployees.value = false
  }
}

// 选择员工
const handleEmployeeSelect = (employeeId: string) => {
  addMemberForm.value.employeeId = employeeId
}

// 添加成员
const handleAddMember = async () => {
  // 验证表单
  if (!addMemberForm.value.employeeId) {
    ElMessage.warning('请选择员工')
    return
  }
  if (!addMemberForm.value.roleId) {
    ElMessage.warning('请选择项目角色')
    return
  }
  if (!addMemberForm.value.participationRatio || addMemberForm.value.participationRatio <= 0 || addMemberForm.value.participationRatio > 100) {
    ElMessage.warning('参与度必须在 10-100 之间')
    return
  }

  try {
    await projectMemberApi.addMembers({
      projectId: props.projectData.projectId,
      members: [
        {
          employeeId: addMemberForm.value.employeeId,
          roleId: addMemberForm.value.roleId,
          participationRatio: addMemberForm.value.participationRatio
        }
      ]
    })

    ElMessage.success('添加成员成功')
    addMemberDialogVisible.value = false
    
    // 重置表单
    addMemberForm.value = {
      employeeId: '',
      roleId: '',
      participationRatio: 100 // 默认100%
    }
    employeeSearchKeyword.value = ''
    availableEmployees.value = []
    
    // 刷新成员列表
    await loadTeamMembers()
  } catch (error: any) {
    console.error('添加成员失败:', error)
    ElMessage.error(error.response?.data?.message || '添加成员失败')
  }
}

// 取消添加成员
const handleCancelAddMember = () => {
  addMemberDialogVisible.value = false
  addMemberForm.value = {
    employeeId: '',
    roleId: '',
    participationRatio: 100 // 默认100%
  }
  employeeSearchKeyword.value = ''
  availableEmployees.value = []
}
</script>

<style scoped>
.my-project-detail {
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.project-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item label {
  font-weight: 500;
  min-width: 90px;
  color: #606266;
  flex-shrink: 0;
}

.detail-item .value-text {
  color: #303133;
  word-break: break-all;
  flex: 1;
}

.detail-item .highlight-value {
  color: #409EFF;
  font-weight: 500;
  font-size: 15px;
}

.detail-item .role-badge {
  display: flex;
  align-items: center;
}

.member-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border: 2px solid #409EFF;
}

.timeline-progress {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-label {
  font-weight: 500;
  color: #606266;
}

.team-members {
  min-height: 100px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #F5F7FA;
  transition: all 0.3s;
}

.member-item:hover {
  background: #E4E7ED;
  transform: translateX(4px);
}

.member-item.is-me {
  background: linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 100%);
  border: 1px solid #409EFF;
}

.member-item:last-child {
  margin-bottom: 0;
}

.member-avatar {
  position: relative;
  margin-right: 16px;
}

.me-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 10px;
  padding: 0 4px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.member-meta {
  font-size: 13px;
  color: #909399;
}

.member-actions {
  margin-left: 12px;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

.text-muted {
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.employee-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-name {
  font-weight: 500;
  color: #303133;
}

.employee-info {
  font-size: 12px;
  color: #909399;
}

.employee-dept {
  font-size: 12px;
  color: #67C23A;
  margin-left: auto;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
