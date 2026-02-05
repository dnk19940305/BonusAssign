<!--
  成员申请加入项目对话框
  用于普通员工申请加入已发布的项目
-->
<template>
  <el-dialog
    :model-value="modelValue"
    title="申请加入项目"
    width="600px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="member-application-content">
      <!-- 项目信息展示 -->
      <div class="project-info-section" v-if="project">
        <h4>项目信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
          <el-descriptions-item label="项目代码">{{ project.code }}</el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ project.Manager?.name || project.managerName || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="预算">{{ formatCurrency(project.budget) }}</el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">
            {{ project.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 申请表单 -->
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-width="100px"
        style="margin-top: 20px;"
      >
        <el-form-item label="申请角色" prop="expectedRole">
          <el-select 
            v-model="formData.expectedRole" 
            placeholder="请选择期望的项目角色"
            style="width: 100%"
            :loading="loadingRoles"
          >
            <el-option 
              v-for="role in projectRoles" 
              :key="role.code" 
              :label="role.name" 
              :value="role.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="参与比例" prop="participationRatio">
          <el-input-number
            v-model="formData.participationRatio"
            :min="1"
            :max="100"
            :step="1"
            :precision="0"
            style="width: 100%"
          />
          <div class="form-tip">请填写您在此项目中的参与比例（1-100），100表示全职参与</div>
        </el-form-item>

        <el-form-item label="申请理由" prop="applyReason">
          <el-input
            v-model="formData.applyReason"
            type="textarea"
            :rows="5"
            placeholder="请简要说明您申请加入该项目的理由，包括您的技能、经验以及能为项目带来的价值"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 说明信息 -->
      <el-alert
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 10px;"
      >
        <template #title>
          <span style="font-size: 13px;">提交申请后，需要等待项目经理审批。审批通过后您将成为该项目的团队成员。</span>
        </template>
      </el-alert>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交申请
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { projectMemberApi } from '@/api/projectMember'
import { getProjectRoles, type ProjectRole } from '@/api/projectRoles'
import { useUserStore } from '@/store/modules/user'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Store
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const loadingRoles = ref(false)
const formRef = ref<FormInstance>()

// 项目角色列表
const projectRoles = ref<ProjectRole[]>([])

// 表单数据
const formData = reactive({
  expectedRole: '',
  participationRatio: 100,
  applyReason: ''
})

// 表单验证规则
const rules: FormRules = {
  expectedRole: [
    { required: true, message: '请选择期望的项目角色', trigger: 'change' }
  ],
  participationRatio: [
    { required: true, message: '请填写参与比例', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '参与比例必须在1-100之间', trigger: 'blur' }
  ],
  applyReason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少需要10个字符', trigger: 'blur' }
  ]
}

// 加载项目角色列表
const loadProjectRoles = async () => {
  loadingRoles.value = true
  try {
    const response = await getProjectRoles({ status: 1, pageSize: 100 })
    if (response.data) {
      projectRoles.value = response.data  || []
    }
  } catch (error) {
    console.error('加载项目角色失败:', error)
    ElMessage.error('加载项目角色失败')
  } finally {
    loadingRoles.value = false
  }
}

// 监听对话框打开，重置表单
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 组件挂载时加载角色列表
onMounted(() => {
  loadProjectRoles()
})

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

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.expectedRole = ''
  formData.participationRatio = 100
  formData.applyReason = ''
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
}

// 提交申请
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 表单验证
    await formRef.value.validate()

    // 检查项目信息
    if (!props.project || !props.project.id) {
      ElMessage.error('项目信息错误')
      return
    }

    // 检查用户信息
    const employeeId = (userStore.user as any)?.employeeId
    if (!employeeId) {
      ElMessage.error('无法获取用户信息，请重新登录')
      return
    }

    submitting.value = true

    // 调用API提交申请
    const response = await projectMemberApi.applyToJoin({
      projectId: props.project.id,
      employeeId: employeeId,
      expectedRole: formData.expectedRole,
      participationRatio: formData.participationRatio, // 保持百分制
      applyReason: formData.applyReason
    })

    if (response.code === 200 || response.data?.code === 200) {
      ElMessage.success('申请已提交，请等待项目经理审批')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(response.message || response.data?.message || '申请提交失败')
    }
  } catch (error: any) {
    console.error('提交申请失败:', error)
    const errorMessage = error?.response?.data?.message || error?.message || '申请提交失败'
    ElMessage.error(errorMessage)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.member-application-content {
  max-height: 600px;
  overflow-y: auto;
}

.project-info-section {
  margin-bottom: 20px;
}

.project-info-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
