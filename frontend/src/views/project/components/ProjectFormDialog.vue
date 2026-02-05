<template>
  <el-dialog
    v-model="dialogVisible"
    :title="mode === 'create' ? '新增项目' : '编辑项目'"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入项目名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目代码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入项目代码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入项目描述"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目经理" prop="managerId">
            <el-select
              v-model="formData.managerId"
              placeholder="请选择项目经理（可留空开放抢单）"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="employee in employees"
                :key="employee.id"
                :label="`${employee.name} (${employee.employeeNo})`"
                :value="employee.id"
              />
            </el-select>
            <div style="color: #909399; font-size: 12px; margin-top: 4px;">
              ℹ️ 如不指定经理，发布后任何项目经理都可申请组建团队（抢单模式）
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="(label, value) in PROJECT_PRIORITY_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate" required>
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate" required>
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目预算" prop="budget">
            <el-input-number
              v-model="formData.budget"
              :min="0"
              :precision="2"
              :step="1000"
              placeholder="请输入项目预算"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="利润目标" prop="profitTarget">
            <el-input-number
              v-model="formData.profitTarget"
              :min="0"
              :precision="2"
              :step="1000"
              placeholder="请输入利润目标"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'create' ? '创建' : '更新' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { projectApi } from '@/api/project'
import { employeeApi } from '@/api/employee'
import type { Project, ProjectForm, ProjectPriority } from '@/types/project'
import { PROJECT_PRIORITY_LABELS, ProjectPriority as Priority } from '@/types/project'

// Props & Emits
interface Props {
  modelValue: boolean
  project?: Project | null
  mode: 'create' | 'edit'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
  mode: 'create'
})

const emit = defineEmits<Emits>()

// Refs
const formRef = ref<FormInstance>()
const loading = ref(false)
const employees = ref<Array<{ id: string; name: string; employeeNo: string }>>([])

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 表单数据
const defaultFormData: ProjectForm = {
  name: '',
  code: '',
  description: '',
  managerId: undefined,
  startDate: '',
  endDate: '',
  budget: undefined,
  profitTarget: undefined,
  priority: Priority.MEDIUM
}

const formData = reactive<ProjectForm>({ ...defaultFormData })

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目代码', trigger: 'blur' },
    { min: 2, max: 50, message: '项目代码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '项目代码只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  // managerId: 非必填，支持抢单模式
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && formData.startDate && new Date(value) <= new Date(formData.startDate)) {
          callback(new Error('结束日期必须晚于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  budget: [
    { required: true, message: '请输入项目预算', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === undefined || value === null || value <= 0) {
          callback(new Error('项目预算必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听对话框显示，重置表单
watch(dialogVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      initForm()
      loadEmployees()
    })
  }
})

// 初始化表单
const initForm = () => {
  if (props.mode === 'edit' && props.project) {
    Object.assign(formData, {
      name: props.project.name,
      code: props.project.code,
      description: props.project.description || '',
      managerId: props.project.managerId,
      // 将ISO格式的日期转换为YYYY-MM-DD格式，避免时区问题
      startDate: props.project.startDate ? props.project.startDate.split('T')[0] : '',
      endDate: props.project.endDate ? props.project.endDate.split('T')[0] : '',
      budget: props.project.budget,
      profitTarget: props.project.profitTarget,
      priority: props.project.priority
    })
  } else {
    Object.assign(formData, defaultFormData)
  }
  formRef.value?.clearValidate()
}

// 加载员工列表
const loadEmployees = async () => {
  try {
    const response = await employeeApi.getEmployees({ page: 1, pageSize: 1000 })
    
    // 兼容多种返回格式
    let employeeList: any[] = []
    
    if (response.data?.data?.list) {
      employeeList = response.data.data.list
    } else if (response.data?.list) {
      employeeList = response.data.list
    } else if (response.data?.data?.employees) {
      employeeList = response.data.data.employees
    } else if (response.data?.employees) {
      employeeList = response.data.employees
    } else if (Array.isArray(response.data?.data)) {
      employeeList = response.data.data
    } else if (Array.isArray(response.data)) {
      employeeList = response.data
    }
    
    employees.value = employeeList.map((emp: any) => ({
      id: emp.id || emp._id,
      name: emp.name,
      employeeNo: emp.employeeNo || emp.employee_no || emp.employNo || ''
    }))
    
    if (employees.value.length === 0) {
      ElMessage.warning('未找到可选择的员工数据')
    }
  } catch (error: any) {
    console.error('加载员工列表失败:', error)
    ElMessage.error('加载员工列表失败: ' + (error.message || '未知错误'))
  }
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      managerId: formData.managerId || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budget: formData.budget || undefined,
      profitTarget: formData.profitTarget || undefined,
      priority: formData.priority
    }

    if (props.mode === 'create') {
      await projectApi.createProject(data)
      ElMessage.success('项目创建成功')
    } else if (props.project) {
      await projectApi.updateProject(props.project.id as any, data)
      ElMessage.success('项目更新成功')
    }

    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || `项目${props.mode === 'create' ? '创建' : '更新'}失败`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>