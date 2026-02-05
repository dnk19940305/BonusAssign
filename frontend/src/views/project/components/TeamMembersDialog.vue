<!--
  团队成员对话框
  展示项目团队成员列表及其角色、参与度等信息
-->
<template>
  <el-dialog
    :model-value="modelValue"
    :title="`团队成员 - ${projectName}`"
    width="1200px"
    @close="handleClose"
  >
    <div v-loading="loading" class="team-members-content">
      <!-- 成员统计 -->
      <div class="member-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ members.length }}</div>
              <div class="stat-label">团队成员</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ activeMembers }}</div>
              <div class="stat-label">活跃成员</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ pendingMembers }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ totalParticipation.toFixed(1) }}%</div>
              <div class="stat-label">总参与度</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 成员列表 -->
      <el-table :data="members" style="width: 100%; margin-top: 20px;" stripe border>
        <el-table-column prop="employeeName" label="姓名" width="100" fixed="left" />
        <el-table-column prop="employeeCode" label="工号" width="150" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="roleName" label="项目角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.roleName" size="small">{{ row.roleName }}</el-tag>
            <span v-else class="text-muted">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="contributionWeight" label="贡献权重" width="100">
          <template #default="{ row }">
            <span>{{ row.contributionWeight || 100 }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedWorkload" label="工作量占比" width="110">
          <template #default="{ row }">
            <span>{{ row.estimatedWorkload || 100 }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="participationRatio" label="参与度" width="100">
          <template #default="{ row }">
                       <span class="percentage-text">{{ row.participationRatio }}%</span>

          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="加入时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.joinDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" v-if="canManage">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              text
              @click="handleApprove(row)"
            >
              批准
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              size="small"
              text
              @click="handleRemove(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button v-if="canManage" type="primary" @click="handleAddMember">
        <el-icon><Plus /></el-icon>
        添加成员
      </el-button>
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
        <el-button type="primary" @click="handleConfirmAddMember">
          确认添加
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
// @ts-ignore
import { projectMemberApi } from '@/api/projectMember'
import { formatDate } from '@/utils/format'
import { getEmployees } from '@/api/employee'

interface Props {
  modelValue: boolean
  projectId: string
  projectName: string
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  projectId: '',
  projectName: '',
  canManage: false
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const members = ref<any[]>([])

// 添加成员相关
const addMemberDialogVisible = ref(false)
const loadingEmployees = ref(false)
const addMemberForm = ref({
  employeeId: '',
  roleId: '',
  participationRatio: 100 // 默认100%参与度
})
const availableEmployees = ref<any[]>([])
const projectRoles = ref<any[]>([])
const employeeSearchKeyword = ref('')
let searchTimer: any = null // 防抖定时器

// 计算属性
const activeMembers = computed(() => {
  return members.value.filter(m => m.status === 'active' || m.status === 'approved').length
})

const pendingMembers = computed(() => {
  return members.value.filter(m => m.status === 'pending').length
})

const totalParticipation = computed(() => {
  const total = members.value.reduce((sum, m) => {
    return sum + (m.participationRatio || 0) // 已经是百分比，直接求和
  }, 0)
  return total
})

// 监听对话框打开
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.projectId) {
    loadMembers()
  }
})

// 加载成员列表
const loadMembers = async () => {
  if (!props.projectId) return

  loading.value = true
  try {
    const response = await projectMemberApi.getProjectMembers(props.projectId)
    console.info('getProjectMembers response:', response)
    if (response.code === 200) {
      // 后端直接返回数组，与项目其他API保持一致
      // 统一将小数形式的participationRatio转换为百分比
      members.value = (response.data || []).map((m: any) => {
        const ratio = m.participationRatio || 0
        return {
          ...m,
          participationRatio: ratio > 1 ? Math.round(ratio) : Math.round(ratio * 100)
        }
      })
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    active: 'success',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待审批',
    active: '已通过',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labelMap[status] || '未知'
}

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
}

// 批准成员
const handleApprove = async (member: any) => {
  try {
    await ElMessageBox.confirm(`确认批准 ${member.employeeName} 加入项目吗？`, '确认操作', {
      type: 'warning'
    })

    const response = await projectMemberApi.approveApplication(member.id || member._id, {
      status: 'active',
      roleId: member.roleId || member.expectedRoleId,
      participationRatio: member.participationRatio || 1.0
    })
    if (response.code === 200 || response.data?.code === 200) {
      ElMessage.success('批准成功')
      loadMembers()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      ElMessage.error('批准失败')
    }
  }
}

// 移除成员
const handleRemove = async (member: any) => {
  try {
    await ElMessageBox.confirm(`确认将 ${member.employeeName} 从项目中移除吗？`, '确认操作', {
      type: 'warning'
    })

    const response = await projectMemberApi.removeMember(member.id)
    if (response.data.code === 200) {
      ElMessage.success('移除成功')
      loadMembers()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('移除失败:', error)
      ElMessage.error('移除失败')
    }
  }
}

// 添加成员 - 显示对话框
const handleAddMember = async () => {
  addMemberDialogVisible.value = true
  await loadProjectRoles()
}

// 加载项目角色
const loadProjectRoles = async () => {
  try {
    const response = await projectMemberApi.getProjectRoles()
    projectRoles.value = response.data || []
  } catch (error: any) {
    console.error('加载项目角色失败:', error)
    ElMessage.warning('加载项目角色失败')
  }
}

// 远程搜索处理函数
const handleRemoteSearch = (query: string) => {
  console.log('🔍 [团队成员-远程搜索] 接收到查询:', query, '长度:', query?.length)
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
  console.log('🔍 [团队成员-搜索员工] 开始搜索, 关键词:', employeeSearchKeyword.value)
  
  // 中文输入至少1个字符就可以搜索
  if (!employeeSearchKeyword.value || employeeSearchKeyword.value.trim().length < 1) {
    console.log('⚠️ [团队成员-搜索员工] 搜索关键词为空或过短，取消搜索')
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
    const memberEmployeeIds = members.value.map(m => m.employeeId)
    availableEmployees.value = employees.filter((emp: any) => {
      const empId = emp.id || emp._id
      const isAlreadyMember = memberEmployeeIds.includes(empId)
      return !isAlreadyMember
    })
    console.log('📊 过滤后可用员工:', availableEmployees.value.length)
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

// 确认添加成员
const handleConfirmAddMember = async () => {
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
      projectId: props.projectId,
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
    await loadMembers()
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

<style scoped lang="scss">
.team-members-content {
  min-height: 400px;

  .member-stats {
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .text-muted {
    color: #999;
    font-size: 13px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
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
