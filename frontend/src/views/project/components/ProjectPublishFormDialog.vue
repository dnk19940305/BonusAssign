<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="loading"
    >
      <!-- 发布模式选择 -->
      <div class="form-section" v-if="!project">
        <el-radio-group v-model="publishMode" @change="handleModeChange" size="large">
          <el-radio-button value="new">🆕 创建新项目并发布</el-radio-button>
          <el-radio-button value="draft">📄 从草稿项目发布</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 草稿项目选择 -->
      <div class="form-section" v-if="publishMode === 'draft' && !project">
        <el-form-item label="选择草稿" prop="selectedDraftId">
          <el-select 
            v-model="selectedDraftId" 
            placeholder="请选择草稿项目"
            filterable
            style="width: 100%"
            @change="handleDraftSelect"
          >
            <el-option
              v-for="draft in draftProjects"
              :key="draft.id"
              :label="`${draft.name} (${draft.code})`"
              :value="draft.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ draft.name }}</span>
                <span style="color: #8492a6; font-size: 12px; margin-left: 10px;">{{ draft.code }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <!-- 新建项目基本信息表单 -->
      <div class="form-section" v-if="publishMode === 'new' && !project">
        <div class="section-title">📝 项目基本信息</div>
        
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
                ℹ️ 如不指定经理，任何项目经理都可申请组建团队
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
      </div>

      <!-- 项目基本信息（只读显示） -->
      <div class="form-section" v-if="currentProject">
        <div class="section-title">📋 项目基本信息（只读）</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称">
              <el-input :model-value="currentProject?.name || '-'" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目代码">
              <el-input :model-value="currentProject?.code || '-'" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述">
          <el-input
            :model-value="currentProject?.description || '暂无描述'"
            type="textarea"
            :rows="3"
            readonly
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目经理">
              <el-input 
                :model-value="(currentProject as any)?.Manager?.name || (currentProject as any)?.managerName || '未指定'"
                readonly 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-input 
                :model-value="(PROJECT_PRIORITY_LABELS as any)[currentProject?.priority || 'medium']"
                readonly
              >
                <template #prepend>
                  <el-tag size="small" :type="(PROJECT_PRIORITY_COLORS as any)[currentProject?.priority || 'medium']">
                    {{ (PROJECT_PRIORITY_LABELS as any)[currentProject?.priority || 'medium'] }}
                  </el-tag>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期">
              <el-input :model-value="formatDate(currentProject?.startDate) || '未设置'" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期">
              <el-input :model-value="formatDate(currentProject?.endDate) || '未设置'" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目预算">
              <el-input :model-value="formatCurrency(currentProject?.budget) || '未设置'" readonly>
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="利润目标">
              <el-input :model-value="formatCurrency(currentProject?.profitTarget) || '未设置'" readonly>
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目周期">
              <el-input :model-value="getProjectDuration()" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预期利润率">
              <el-input :model-value="getProfitMargin()" readonly>
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目状态">
          <el-input :model-value="(PROJECT_STATUS_LABELS as any)[currentProject?.status || 'planning']" readonly>
            <template #prepend>
              <el-tag size="small" :type="(PROJECT_STATUS_COLORS as any)[currentProject?.status || 'planning']">
                {{ (PROJECT_STATUS_LABELS as any)[currentProject?.status || 'planning'] }}
              </el-tag>
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- 协作发布信息 -->
      <div class="form-section">
        <div class="section-title">🚀 协作发布信息</div>
        
        <el-form-item label="工作内容" prop="workContent">
          <el-input
            v-model="formData.workContent"
            type="textarea"
            :rows="4"
            placeholder="请详细描述项目工作内容、目标和交付物"
          />
        </el-form-item>
      </div>

      <!-- 技能要求 -->
      <div class="form-section">
        <div class="section-title">
          技能要求
          <el-button
            type="primary"
            size="small"
            @click="addSkillRequirement"
            style="margin-left: 10px;"
          >
            添加技能
          </el-button>
        </div>

        <div v-if="formData.skillRequirements.length === 0" class="empty-placeholder">
          暂无技能要求，点击"添加技能"按钮开始设置
        </div>

        <div
          v-for="(skill, index) in formData.skillRequirements"
          :key="`skill-${index}`"
          class="skill-item"
        >
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label-position="top" label="技能名称" :prop="`skillRequirements.${index}.skill`" :rules="[{ required: true, message: '请输入技能名称', trigger: 'blur' }]">
                <el-input
                  v-model="skill.skill"
                  placeholder="技能名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label-position="top" label="技能等级" :prop="`skillRequirements.${index}.level`">
                <el-select v-model="skill.level" placeholder="技能等级">
                  <el-option label="初级" value="beginner" />
                  <el-option label="中级" value="intermediate" />
                  <el-option label="高级" value="advanced" />
                  <el-option label="专家" value="expert" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label-position="top" label="是否必需" :prop="`skillRequirements.${index}.required`">
                <el-checkbox v-model="skill.required">必需</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label-position="top" label="技能描述" :prop="`skillRequirements.${index}.description`">
                <el-input
                  v-model="skill.description"
                  placeholder="技能描述（可选）"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item  label-width="0">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeSkillRequirement(index)"
                >
                  删除
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 项目需求 -->
      <div class="form-section">
        <div class="section-title">
          项目需求
          <el-button
            type="primary"
            size="small"
            @click="addProjectRequirement"
            style="margin-left: 10px;"
          >
            添加需求
          </el-button>
        </div>

        <div v-if="formData.requirements.length === 0" class="empty-placeholder">
          暂无项目需求，点击"添加需求"按钮开始设置
        </div>

        <div
          v-for="(requirement, index) in formData.requirements"
          :key="`requirement-${index}`"
          class="requirement-item"
        >
          <el-row :gutter="16">
            <el-col :span="4">
              <el-form-item label="需求类型" label-position="top" :prop="`requirements.${index}.type`" :rules="[{ required: true, message: '请选择需求类型', trigger: 'change' }]">
                <el-select v-model="requirement.type" placeholder="需求类型">
                  <el-option label="技术需求" value="technical" />
                  <el-option label="业务需求" value="business" />
                  <el-option label="质量需求" value="quality" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="需求标题" label-position="top" :prop="`requirements.${index}.title`" :rules="[{ required: true, message: '请输入需求标题', trigger: 'blur' }]">
                <el-input
                  v-model="requirement.title"
                  placeholder="需求标题"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="需求描述" label-position="top" :prop="`requirements.${index}.description`" :rules="[{ required: true, message: '请输入需求描述', trigger: 'blur' }]">
                <el-input
                  v-model="requirement.description"
                  placeholder="需求描述"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label="优先级" label-position="top" :prop="`requirements.${index}.priority`">
                <el-select v-model="requirement.priority" placeholder="优先级">
                  <el-option
                    v-for="(label, value) in PROJECT_PRIORITY_LABELS"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item label-width="0">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeProjectRequirement(index)"
                >
                  删除
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">
              <el-form-item label="是否必需" label-position="top" :prop="`requirements.${index}.isMandatory`">
                <el-checkbox v-model="requirement.isMandatory">强制</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="20">
              <el-form-item label="验收标准" label-position="top" :prop="`requirements.${index}.acceptanceCriteria`">
                <el-input
                  v-model="acceptanceCriteriaStrings[index]"
                  type="textarea"
                  :rows="2"
                  placeholder="验收标准，用分号(;)分隔多个标准"
                  @input="updateAcceptanceCriteria(index, $event)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          发布项目
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  projectCollaborationApi, 
  type ProjectPublishRequest,
  type ProjectCreateAndPublishRequest 
} from '@/api/projectCollaboration'
import { projectApi } from '@/api/project'
import { employeeApi } from '@/api/employee'
import type {
  SkillRequirement,
  ProjectRequirement,
  ProjectPriority,
  Project,
  ProjectForm
} from '@/types/project'
import {
  PROJECT_PRIORITY_LABELS,
  PROJECT_PRIORITY_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  ProjectPriority as Priority
} from '@/types/project'

// Props & Emits
interface Props {
  modelValue: boolean
  project?: Project  // 可选：如果传入则直接发布该项目
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs
const formRef = ref<FormInstance>()
const loading = ref(false)
const publishMode = ref<'new' | 'draft'>('new')
const selectedDraftId = ref<string>('')
const draftProjects = ref<Project[]>([])
const selectedDraft = ref<Project | null>(null)
const employees = ref<Array<{ id: string; name: string; employeeNo: string }>>([])

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  if (props.project) return '发布项目'
  return publishMode.value === 'new' ? '创建并发布项目' : '从草稿发布项目'
})

const currentProject = computed(() => {
  if (props.project) return props.project
  if (publishMode.value === 'draft' && selectedDraft.value) return selectedDraft.value
  return null
})

// 表单数据（包含新建项目和协作发布信息）
const defaultFormData = {
  name: '',
  code: '',
  description: '',
  managerId: undefined as string | undefined,
  startDate: '',
  endDate: '',
  budget: undefined as number | undefined,
  profitTarget: undefined as number | undefined,
  priority: Priority.MEDIUM,
  workContent: '',

  skillRequirements: [] as SkillRequirement[],
  requirements: [] as ProjectRequirement[]
}

const formData = reactive({ ...defaultFormData })
const acceptanceCriteriaStrings = ref<string[]>([])

// 表单验证规则
const formRules = computed((): FormRules => {
  const rules: FormRules = {
    workContent: [
      { required: true, message: '请输入工作内容', trigger: 'blur' },
      { min: 10, message: '工作内容至少 10 个字符', trigger: 'blur' }
    ]
  }
  
  if (publishMode.value === 'new' && !props.project) {
    Object.assign(rules, {
      name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { min: 2, max: 100, message: '项目名称长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入项目代码', trigger: 'blur' },
        { min: 2, max: 50, message: '项目代码长度在 2 到 50 个字符', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9_-]+$/, message: '项目代码只能包含字母、数字、下划线和横线', trigger: 'blur' }
      ],
      startDate: [
        { required: true, message: '请选择开始日期', trigger: 'change' }
      ],
      endDate: [
        { required: true, message: '请选择结束日期', trigger: 'change' }
      ],
      budget: [
        { required: true, message: '请输入项目预算', trigger: 'blur' },
        { 
          validator: (_rule: any, value: any, callback: any) => {
            if (value === undefined || value === null || value <= 0) {
              callback(new Error('项目预算必须大于0'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      priority: [
        { required: true, message: '请选择优先级', trigger: 'change' }
      ]
    })
  }
  
  if (publishMode.value === 'draft' && !props.project) {
    rules.selectedDraftId = [
      { required: true, message: '请选择草稿项目', trigger: 'change' }
    ]
  }
  
  return rules
})

// 监听对话框显示
watch(dialogVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      initForm()
      if (!props.project) {
        loadDraftProjects()
        loadEmployees()
      }
    })
  }
})

// 初始化表单
const initForm = () => {
  // 重置所有字段为默认值
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.managerId = undefined
  formData.startDate = ''
  formData.endDate = ''
  formData.budget = undefined
  formData.profitTarget = undefined
  formData.priority = Priority.MEDIUM
  formData.workContent = ''
  formData.skillRequirements = []
  formData.requirements = []
  
  acceptanceCriteriaStrings.value = []
  selectedDraftId.value = ''
  selectedDraft.value = null
  if (!props.project) {
    publishMode.value = 'new'
  }
  formRef.value?.clearValidate()
}

// 加载草稿项目列表
const loadDraftProjects = async () => {
  try {
    const response = await projectApi.getProjects({ pageSize: 100 })
    draftProjects.value = response.data.list.filter(
      (p: Project) => p.cooperationStatus === 'draft' || !p.cooperationStatus
    )
  } catch (error) {
    console.error('加载草稿项目失败:', error)
    ElMessage.error('加载草稿项目失败')
  }
}

// 加载员工列表
const loadEmployees = async () => {
  try {
    const response = await employeeApi.getEmployees({ pageSize: 1000 })
    employees.value = response.data.employees.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      employeeNo: emp.employeeNo
    }))
  } catch (error) {
    console.error('加载员工列表失败:', error)
  }
}

// 处理模式切换
const handleModeChange = () => {
  selectedDraftId.value = ''
  selectedDraft.value = null
  
  // 重置新建项目相关字段，避免验证错误
  formData.name = ''
  formData.code = ''
  formData.description = ''
  formData.managerId = undefined
  formData.startDate = ''
  formData.endDate = ''
  formData.budget = undefined
  formData.profitTarget = undefined
  formData.priority = Priority.MEDIUM
  
  // 重置协作发布信息
  formData.workContent = ''
  formData.skillRequirements = []
  formData.requirements = []
  acceptanceCriteriaStrings.value = []
  
  // 使用 nextTick 确保 DOM 更新后再清除验证
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 处理草稿选择
const handleDraftSelect = (draftId: string) => {
  const draft = draftProjects.value.find(p => p.id === draftId)
  if (draft) {
    selectedDraft.value = draft
    
    // 重置协作发布信息，保留草稿项目的基本信息
    formData.workContent = ''
    formData.skillRequirements = []
    formData.requirements = []
    acceptanceCriteriaStrings.value = []
    
    // 使用 nextTick 确保 DOM 更新后再清除验证
    nextTick(() => {
      formRef.value?.clearValidate()
      ElMessage.success(`已选择草稿项目：${draft.name}`)
    })
  }
}

// 添加技能要求
const addSkillRequirement = () => {
  formData.skillRequirements.push({
    skill: '',
    level: 'intermediate',
    required: false,
    description: ''
  })
}

// 删除技能要求
const removeSkillRequirement = (index: number) => {
  formData.skillRequirements.splice(index, 1)
}

// 添加项目需求
const addProjectRequirement = () => {
  const index = formData.requirements.length
  formData.requirements.push({
    type: 'technical',
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    isMandatory: false,
    acceptanceCriteria: []
  })
  acceptanceCriteriaStrings.value[index] = ''
}

// 删除项目需求
const removeProjectRequirement = (index: number) => {
  formData.requirements.splice(index, 1)
  acceptanceCriteriaStrings.value.splice(index, 1)
}

// 更新验收标准
const updateAcceptanceCriteria = (index: number, value: string) => {
  acceptanceCriteriaStrings.value[index] = value
  formData.requirements[index].acceptanceCriteria = value
    .split(';')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化货币
const formatCurrency = (amount?: number): string => {
  if (!amount && amount !== 0) return ''
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 获取项目周期
const getProjectDuration = (): string => {
  if (!currentProject.value?.startDate || !currentProject.value?.endDate) {
    return '未设置'
  }
  const start = new Date(currentProject.value.startDate)
  const end = new Date(currentProject.value.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return '日期异常'
  if (days === 0) return '1天'
  if (days < 30) return `${days}天`
  if (days < 365) return `${Math.floor(days / 30)}个月`
  return `${Math.floor(days / 365)}年${Math.floor((days % 365) / 30)}个月`
}

// 获取预期利润率
const getProfitMargin = (): string => {
  if (!currentProject.value?.budget || !currentProject.value?.profitTarget) {
    return '未设置'
  }
  const margin = (currentProject.value.profitTarget / currentProject.value.budget) * 100
  return margin.toFixed(2)
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  // 根据模式验证不同的字段
  let valid = false
  
  if (publishMode.value === 'draft' && !props.project) {
    // 草稿模式：检查是否选择了草稿项目
    if (!selectedDraftId.value || !selectedDraft.value) {
      ElMessage.warning('请先选择草稿项目')
      return
    }
    
    // 只验证工作内容
    try {
      await formRef.value.validateField('workContent')
      valid = true
    } catch (error) {
      ElMessage.warning('请填写工作内容（至少10个字符）')
      return
    }
  } else {
    // 新建模式或从props传入：验证所有字段
    valid = await formRef.value.validate().catch(() => false)
    if (!valid) {
      ElMessage.warning('请填写完整的项目信息')
      return
    }
  }

  loading.value = true
  try {
    // 如果是新建模式，使用一次性创建并发布接口
    if (publishMode.value === 'new' && !props.project) {
      const createAndPublishData: ProjectCreateAndPublishRequest = {
        // 项目基本信息
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        managerId: formData.managerId || undefined,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        budget: formData.budget!,
        profitTarget: formData.profitTarget || undefined,
        priority: formData.priority,
        // 协作发布信息
        workContent: formData.workContent!,
        skillRequirements: formData.skillRequirements
          .filter(skill => skill.skill.trim())
          .map(skill => skill.skill),
        requirements: formData.requirements
          .filter(req => req.title.trim() && req.description.trim())
      }

      await projectCollaborationApi.createAndPublishProject(createAndPublishData)
      ElMessage.success('项目创建并发布成功，已进入协作流程')
    } else {
      // 从草稿或props传入的项目，只发布
      const project = props.project || selectedDraft.value
      if (!project || !project.id) {
        ElMessage.error('请先选择要发布的项目')
        return
      }
      const projectId = project.id as string

      const publishData: ProjectPublishRequest = {
        // 协作发布信息
        workContent: formData.workContent || '',
        skillRequirements: formData.skillRequirements
          .filter(skill => skill.skill.trim())
          .map(skill => skill.skill),
        requirements: formData.requirements
          .filter(req => req.title.trim() && req.description.trim()),
        // 项目基本信息（用于补充草稿项目缺失的字段）
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined,
        budget: project.budget || undefined,
        profitTarget: project.profitTarget || undefined
      }

      await projectCollaborationApi.publishProject(projectId, publishData)
      ElMessage.success('项目发布成功，已进入协作流程')
    }

    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: flex;
  align-items: center;
}

.empty-placeholder {
  color: #909399;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.skill-item,
.requirement-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.skill-item:last-child,
.requirement-item:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.requirement-item {
  border-left: 4px solid #409eff;
}

.skill-item {
  border-left: 4px solid #67c23a;
}

/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__inner),
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: default;
}

:deep(.el-input__inner[readonly]),
:deep(.el-textarea__inner[readonly]) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: default;
  border-color: #dcdfe6;
}
</style>
