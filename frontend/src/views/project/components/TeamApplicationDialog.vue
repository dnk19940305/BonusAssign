<template>
  <el-dialog
    v-model="visible"
    :title="props.application ? '重新提交团队申请' : '申请团队组建'"
    width="95%"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <!-- 项目信息 -->
      <el-card class="form-section" header="项目信息" v-if="project">
        <el-descriptions :column="2">
          <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
          <el-descriptions-item label="项目代码">{{ project.code }}</el-descriptions-item>
          <el-descriptions-item label="预算">{{ formatCurrency(project.budget) }}</el-descriptions-item>

          <el-descriptions-item label="利润目标">{{ formatCurrency(project.profitTarget || 0) }}</el-descriptions-item>
          <el-descriptions-item label="工期">{{ project.duration || '未设定' }}</el-descriptions-item>
        </el-descriptions>
        <el-form-item label="工作内容" style="margin-top: 15px" v-if="project.workContent">
          <div class="work-content">{{ project.workContent }}</div>
        </el-form-item>
        <el-form-item label="项目描述" style="margin-top: 15px" v-if="project.description">
          <div class="work-content">{{ project.description }}</div>
        </el-form-item>
      </el-card>

      <!-- 团队信息 -->
      <el-card class="form-section" header="团队信息">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="团队名称" prop="teamName">
              <el-input v-model="form.teamName" placeholder="请输入团队名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预估成本" prop="estimatedCost">
              <el-input-number
                v-model="form.estimatedCost"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入预估成本"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="团队描述" prop="teamDescription">
          <el-input
            v-model="form.teamDescription"
            type="textarea"
            :rows="3"
            placeholder="请描述团队的组成、分工和协作方式"
          />
        </el-form-item>

        <el-form-item label="申请理由" prop="applicationReason">
          <el-input
            v-model="form.applicationReason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明为什么需要这个团队配置，以及预期的项目成果"
          />
        </el-form-item>
      </el-card>

      <!-- 团队成员 -->
      <el-card class="form-section" header="团队成员配置">
        <div class="members-section">
          <div class="members-header">
            <span>已选择 {{ form.members.length }} 名成员</span>
            <el-button type="primary" size="small" @click="showMemberSelector">
              <el-icon><Plus /></el-icon>
              添加成员
            </el-button>
          </div>

          <div class="members-list" v-if="form.members.length > 0">
            <el-table :data="form.members" style="width: 100%">
              <el-table-column prop="Employee.name" label="姓名" width="100" />
              <el-table-column prop="Employee.employeeNo" label="工号" width="100" />
              <el-table-column prop="Employee.department" label="部门" width="120" />
              <el-table-column prop="Employee.position" label="岗位" width="120" />
              <el-table-column prop="roleName" label="项目角色" width="120">
                <template #default="{ row, $index }">
                  <el-select
                    v-model="row.roleId"
                    placeholder="选择角色"
                    size="small"
                    style="width: 100%"
                    @change="handleRoleChange(row)"
                  >
                    <el-option
                      v-for="role in projectRoles"
                      :key="role.id"
                      :label="role.name"
                      :value="role.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="contributionWeight" label="贡献权重" width="120">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-model="row.contributionWeight"
                    :min="1"
                    :max="100"
                    :step="1"
                    size="small"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column prop="estimatedWorkload" label="工作量占比" width="120">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-model="row.estimatedWorkload"
                    :min="1"
                    :max="100"
                    :step="1"
                    :precision="0"
                    size="small"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row, $index }">
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="removeMember($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 实时验证反馈 -->
            <div class="validation-section" style="margin-top: 20px">
              <!-- 成本预算检查 -->
              <el-alert
                :title="costCheck.message"
                :type="costCheck.type"
                :closable="false"
                show-icon
              >
                <div class="validation-detail">
                  <div>预估成本: <strong>{{ formatCurrency(form.estimatedCost || 0) }}</strong></div>
                  <div v-if="project && project.budget">
                    项目预算: <strong>{{ formatCurrency(project.budget) }}</strong>
                  </div>
                </div>
              </el-alert>
            </div>
          </div>

          <el-empty v-else description="暂无团队成员，请添加成员" />
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ props.application ? '重新提交' : '提交申请' }}
        </el-button>
        <div v-if="!canSubmit && form.members.length > 0" class="submit-tip">
          <el-text type="info" size="small">
            {{ !costCheck.valid ? '请调整预估成本' :
               form.members.length < 2 ? '至少需要2名成员' : '' }}
          </el-text>
        </div>
      </div>
    </template>

    <!-- 成员选择器 -->
    <MemberSelectorDialog
      v-model="memberSelectorVisible"
      :selected-members="form.members"
      @confirm="handleMembersSelected"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { projectCollaborationApi } from '@/api/projectCollaboration'
import { projectMemberApi } from '@/api/projectMember'
import type { TeamApplicationRequest, TeamMember } from '@/api/projectCollaboration'
import MemberSelectorDialog from './MemberSelectorDialog.vue'

// Props
const props = defineProps<{
  modelValue: boolean
  project: any
  application?: any  // 用于重新提交的现有申请数据
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref()
const submitting = ref(false)
const memberSelectorVisible = ref(false)

// 表单数据
const form = reactive<TeamApplicationRequest>({
  teamName: '',
  teamDescription: '',
  applicationReason: '',
  estimatedCost: 0,
  members: []
})

// 项目角色列表（从接口动态获取）
const projectRoles = ref<Array<{ id: number; code: string; name: string }>>([])

// 加载项目角色列表
const loadProjectRoles = async () => {
  try {
    const response = await projectMemberApi.getProjectRoles()
    if (response.data && Array.isArray(response.data)) {
      projectRoles.value = response.data.map((role: any) => ({
        id: role.id || role._id,
        code: role.code,
        name: role.name
      }))
    }
  } catch (error) {
    console.error('加载项目角色失败:', error)
    ElMessage.warning('加载项目角色失败，请刷新页面重试')
  }
}

// 组件挂载时加载角色列表
onMounted(() => {
  loadProjectRoles()
})

// 处理角色变更
const handleRoleChange = (member: TeamMember) => {
  const role = projectRoles.value.find(r => r.id === Number(member.roleId))
  if (role) {
    member.roleName = role.name
  }
}

// 表单验证规则
const rules = {
  teamName: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  teamDescription: [
    { required: true, message: '请输入团队描述', trigger: 'blur' },
    { min: 20, message: '团队描述不少于20个字符', trigger: 'blur' }
  ],
  applicationReason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 50, message: '申请理由不少于50个字符', trigger: 'blur' }
  ]
}

// ===== 实时验证逻辑 =====

// 预估成本自动计算
const calculateEstimatedCost = () => {
  let totalCost = 0
  for (const member of form.members) {
    // 基于员工工资 × 贡献权重 × 工作量占比 (百分比)
    // 假设平均月薅15000元,实际应从员工数据获取
    const baseSalary = (member as any).Employee?.salary || 15000
    const workloadScale = (member.estimatedWorkload || 100) / 100 // 百分比转为系数，默认100%
    // 贡献权重以百分比形式存储和计算
    const contributionScale = (member.contributionWeight || 100) / 100
    const memberCost = baseSalary * contributionScale * workloadScale
    totalCost += memberCost
  }
  form.estimatedCost = Math.round(totalCost)
}

// 监听成员变化自动计算成本
watch(() => form.members, calculateEstimatedCost, { deep: true })

// 成本预算检查
const costCheck = computed(() => {
  if (!props.project || !props.project.budget) {
    return { valid: true, type: 'info', message: '项目预算未设置' }
  }

  const cost = form.estimatedCost || 0
  const budget = props.project.budget
  const percentage = (cost / budget * 100).toFixed(2)

  if (cost > budget * 1.2) {
    return {
      valid: false,
      type: 'error',
      message: `成本超出预算120% (当前${percentage}%)`
    }
  } else if (cost > budget) {
    return {
      valid: true,
      type: 'warning',
      message: `成本超出预算${percentage}%,请说明原因`
    }
  } else {
    return {
      valid: true,
      type: 'success',
      message: `成本合理,占预算${percentage}% ✓`
    }
  }
})

// 提交按钮可用状态
const canSubmit = computed(() => {
  return costCheck.value.valid &&
    form.members.length >= 2 &&
    !submitting.value
})

// 监听项目变化
watch(() => props.project, (newProject) => {
  if (newProject) {
    // 根据项目信息初始化团队名称
    form.teamName = `${newProject.name}项目团队`
  }
}, { immediate: true })

// 监听application变化，用于重新提交场景
watch(() => props.application, (application) => {
  if (application) {
    // 如果是重新提交，预填充表单数据
    if (application.teamName) form.teamName = application.teamName
    if (application.teamDescription) form.teamDescription = application.teamDescription
    if (application.applicationReason) form.applicationReason = application.applicationReason
    if (application.estimatedCost) form.estimatedCost = application.estimatedCost
    
    // 如果application包含成员信息，也预填充成员
    if (application.Members && Array.isArray(application.Members)) {
      // 清空现有成员
      form.members = []
      // 添加成员，复制必要的属性
      application.Members.forEach((member: any) => {
        const newMember = {
          employeeId: member.employeeId,
          roleId: member.roleId,
          roleName: member.roleName || member.role,
          contributionWeight: member.contributionWeight,
          estimatedWorkload: member.estimatedWorkload,
        }
        // 如果有员工信息，添加到新成员对象
        if (member.Employee) {
          (newMember as any).Employee = member.Employee
        }
        form.members.push(newMember)
      })
    } else if (application.members && Array.isArray(application.members)) {
      // 兼容小写的members字段
      form.members = []
      application.members.forEach((member: any) => {
        const newMember = {
          employeeId: member.employeeId,
          roleId: member.roleId,
          roleName: member.roleName || member.role,
          contributionWeight: member.contributionWeight,
          estimatedWorkload: member.estimatedWorkload,
        }
        // 如果有员工信息，添加到新成员对象
        if (member.Employee) {
          (newMember as any).Employee = member.Employee
        }
        form.members.push(newMember)
      })
    }
  }
}, { immediate: true })

// 显示成员选择器
const showMemberSelector = () => {
  memberSelectorVisible.value = true
}

// 处理成员选择
const handleMembersSelected = (selectedMembers: TeamMember[]) => {
  // 合并成员列表，避免重复（基于 employeeId 去重）
  const existingEmployeeIds = form.members.map(m => m.employeeId)
  const newMembers = selectedMembers.filter(m => !existingEmployeeIds.includes(m.employeeId))
  form.members.push(...newMembers)
}

// 移除成员
const removeMember = (index: number) => {
  form.members.splice(index, 1)
}

// 提交申请
const handleSubmit = async () => {
  try {
    // 1. 表单基础验证
    await formRef.value?.validate()

    // 2. 成员数量验证
    if (form.members.length < 2) {
      ElMessage.warning('团队至少需要2名成员')
      return
    }

    // 3. 成员角色验证
    const missingRoles = form.members.filter(member => !member.roleName)
    if (missingRoles.length > 0) {
      ElMessage.warning('请为所有成员分配项目角色')
      return
    }

    // 4. 成本预算验证
    if (!costCheck.value.valid) {
      ElMessage.error(costCheck.value.message)
      return
    }

    // 5. 贡献权重验证
    const invalidWeights = form.members.filter(m =>
      !m.contributionWeight || m.contributionWeight < 1 || m.contributionWeight > 100
    )
    if (invalidWeights.length > 0) {
      ElMessage.warning('成员贡献权重应在1%-100%之间')
      return
    }

    // 6. 工作量验证
    const invalidWorkloads = form.members.filter(m =>
      !m.estimatedWorkload || m.estimatedWorkload < 1 || m.estimatedWorkload > 100
    )
    if (invalidWorkloads.length > 0) {
      ElMessage.warning('成员工作量占比应在1%-100%之间')
      return
    }

    await ElMessageBox.confirm(
      `确定要${props.application ? '重新提交' : `为项目"${props.project.name}"申请`}团队${props.application ? '申请' : '组建'}吗？`,
      props.application ? '确认重新提交' : '确认申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: props.application ? 'warning' : 'info'
      }
    )

    submitting.value = true
    
    // 提交前保持百分比格式 (e.g. 50% -> 50)
    const submitForm = JSON.parse(JSON.stringify(form))
    submitForm.members = submitForm.members.map((m: any) => ({
      ...m,
      estimatedWorkload: m.estimatedWorkload || 100,
      participationRatio: m.participationRatio || 100,  // 使用独立的participationRatio字段
      contributionWeight: m.contributionWeight || 100  // 直接使用百分比值
    }))

    if (props.application && props.application.id) {
      // 重新提交申请
      await projectCollaborationApi.resubmitApplication(props.application.id, submitForm)
      ElMessage.success('团队申请重新提交成功，请等待审批')
    } else {
      // 新建申请
      await projectCollaborationApi.applyTeamBuilding(props.project.id, submitForm)
      ElMessage.success('团队申请提交成功，请等待审批')
    }
    emit('success')
    handleClose()

  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '申请提交失败')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  // 重置表单
  setTimeout(() => {
    Object.assign(form, {
      teamName: '',
      teamDescription: '',
      applicationReason: '',
      estimatedCost: 0,
      members: []
    })
    formRef.value?.clearValidate()
  }, 300)
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
</script>

<style scoped>
.form-section {
  margin-bottom: 20px;
}

.form-section :deep(.el-card__header) {
  background: #f5f7fa;
  font-weight: bold;
  color: #303133;
}

.work-content {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  color: #606266;
  line-height: 1.5;
}

.members-section {
  min-height: 200px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.members-header span {
  color: #303133;
  font-weight: 500;
}

.members-list {
  margin-bottom: 20px;
}

.validation-section {
  margin-top: 20px;
}

.validation-detail {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.validation-detail strong {
  color: #303133;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.submit-tip {
  color: #909399;
  font-size: 13px;
  margin-top: 5px;
}

.el-alert {
  border-radius: 6px;
}

.el-alert :deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 500;
}
</style>