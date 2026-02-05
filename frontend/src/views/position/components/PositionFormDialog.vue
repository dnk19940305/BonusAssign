<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑岗位' : '新增岗位'"
    width="800px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入岗位名称"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位代码" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="请输入岗位代码"
                  maxlength="50"
                  :disabled="isEdit"
                />
                <div class="form-tip">岗位代码创建后不可修改</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="职级" prop="level">
                <el-select v-model="form.level" placeholder="请选择职级" style="width: 100%">
                  <el-option
                    v-for="level in levelOptions"
                    :key="level.value"
                    :label="level.label"
                    :value="level.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="基准值" prop="benchmarkValue">
                <el-input-number
                  v-model="form.benchmarkValue"
                  :min="0.1"
                  :max="3.0"
                  :step="0.1"
                  :precision="2"
                  placeholder="请输入基准值"
                  style="width: 100%"
                />
                <div class="form-tip">基准值范围：0.1-3.0，影响奖金计算权重</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="业务线" prop="businessLineId">
                <el-select v-model="form.businessLineId" placeholder="请选择业务线" clearable style="width: 100%">
                  <el-option
                    v-for="line in businessLines"
                    :key="line.id"
                    :label="line.name"
                    :value="line.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位分类">
                <el-cascader
                  v-model="categoryPath"
                  :options="categoryOptions"
                  :props="{ value: 'id', label: 'name', children: 'children', emitPath: false, checkStrictly: true }"
                  placeholder="请选择岗位分类"
                  clearable
                  style="width: 100%"
                  @change="handleCategoryChange"
                />
                <div class="form-tip">选择岗位所属分类，便于在岗位大全中筛选</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="岗位描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入岗位描述"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </el-tab-pane>

        <!-- 职责要求 Tab -->
        <el-tab-pane label="职责要求" name="duty">
          <el-card class="form-section">
            <template #header>
              <div class="section-header">
                <span>岗位职责</span>
                <el-button size="small" @click="addResponsibility">
                  <el-icon><Plus /></el-icon>
                  添加职责
                </el-button>
              </div>
            </template>

            <div v-if="!form.responsibilities || form.responsibilities.length === 0" class="empty-list">
              暂无岗位职责，点击"添加职责"按钮添加
            </div>

            <div
              v-for="(responsibility, index) in form.responsibilities"
              :key="index"
              class="list-item"
            >
              <el-input
                v-model="form.responsibilities![index]"
                placeholder="请输入岗位职责"
                maxlength="200"
              />
              <el-button
                type="danger"
                size="small"
                @click="removeResponsibility(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-card>

          <el-card class="form-section">
            <template #header>
              <div class="section-header">
                <span>任职要求</span>
                <el-button size="small" @click="addRequirement">
                  <el-icon><Plus /></el-icon>
                  添加要求
                </el-button>
              </div>
            </template>

            <div v-if="!form.requirements || form.requirements.length === 0" class="empty-list">
              暂无任职要求，点击"添加要求"按钮添加
            </div>

            <div
              v-for="(requirement, index) in form.requirements"
              :key="index"
              class="list-item"
            >
              <el-input
                v-model="form.requirements![index]"
                placeholder="请输入任职要求"
                maxlength="200"
              />
              <el-button
                type="danger"
                size="small"
                @click="removeRequirement(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 详细信息 Tab -->
        <el-tab-pane label="详细信息" name="detail">
          <el-form-item label="核心技能" prop="coreSkills">
            <el-select
              v-model="form.coreSkills"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入核心技能"
              style="width: 100%"
            >
              <el-option
                v-for="skill in commonSkills"
                :key="skill"
                :label="skill"
                :value="skill"
              />
            </el-select>
          </el-form-item>

          <el-card class="form-section">
            <template #header>职业路径</template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="下一级别">
                  <el-select
                    v-model="form.careerPath!.nextLevel"
                    placeholder="请选择下级岗位"
                    clearable
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="pos in filteredPositions"
                      :key="pos.id"
                      :label="`${pos.name} (${pos.level})`"
                      :value="pos.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="预计时间">
                  <el-input
                    v-model="form.careerPath!.estimatedTime"
                    placeholder="预计晋升时间"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="横向发展">
                  <el-select
                    v-model="form.careerPath!.lateralMoves"
                    multiple
                    filterable
                    allow-create
                    placeholder="横向发展"
                    style="width: 100%"
                  >
                    <el-option label="产品经理" value="产品经理" />
                    <el-option label="项目经理" value="项目经理" />
                    <el-option label="技术经理" value="技术经理" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="专业方向">
                  <el-select
                    v-model="form.careerPath!.specializations"
                    multiple
                    filterable
                    allow-create
                    placeholder="专业方向"
                    style="width: 100%"
                  >
                    <el-option label="技术架构" value="技术架构" />
                    <el-option label="业务咨询" value="业务咨询" />
                    <el-option label="团队管理" value="团队管理" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成长领域">
                  <el-select
                    v-model="form.careerPath!.growthAreas"
                    multiple
                    filterable
                    allow-create
                    placeholder="成长领域"
                    style="width: 100%"
                  >
                    <el-option label="战略规划" value="战略规划" />
                    <el-option label="团队建设" value="团队建设" />
                    <el-option label="客户关系" value="客户关系" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="form-section">
            <template #header>工作环境</template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出差频率">
                  <el-select v-model="form.workEnvironment!.travel" placeholder="出差频率" style="width: 100%">
                    <el-option label="不出差" value="不出差" />
                    <el-option label="偶尔出差" value="偶尔出差" />
                    <el-option label="经常出差" value="经常出差" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作类型">
                  <el-select v-model="form.workEnvironment!.workType" placeholder="工作类型" style="width: 100%">
                    <el-option label="全职" value="全职" />
                    <el-option label="兼职" value="兼职" />
                    <el-option label="外包" value="外包" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-form-item label="岗位特性">
            <el-checkbox v-model="form.isComprehensive">综合岗位</el-checkbox>
            <el-checkbox v-model="form.isMarket" style="margin-left: 20px;">市场岗位</el-checkbox>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import {
  createPosition,
  updatePosition,
  getPositions,
  type Position,
  type PositionForm
} from '@/api/position'
import { getBusinessLines } from '@/api/businessLine'
import { getCategories, type PositionCategory } from '@/api/positionCategory'

interface Props {
  visible: boolean
  position: Position | null
  isEdit: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const activeTab = ref('basic')
const businessLines = ref<any[]>([])
const allPositions = ref<Position[]>([])

// 分类相关
const categoryOptions = ref<PositionCategory[]>([])
const categoryPath = ref<string>('')

const commonSkills = [
  'JavaScript', 'TypeScript', 'Vue.js', 'React', 'Node.js',
  'Python', 'Java', '项目管理', '团队管理', '数据分析',
  '沟通协调', '问题解决', '产品设计', 'UI/UX', 'SQL'
]

const levelOptions = ref([
  { value: 'P1', label: 'P1 - 初级' },
  { value: 'P2', label: 'P2 - 中级' },
  { value: 'P3', label: 'P3 - 高级' },
  { value: 'P4', label: 'P4 - 资深' },
  { value: 'P5', label: 'P5 - 专家' },
  { value: 'P6', label: 'P6 - 高级专家' },
  { value: 'P7', label: 'P7 - 首席专家' },
  { value: 'M1', label: 'M1 - 组长' },
  { value: 'M2', label: 'M2 - 经理' },
  { value: 'M3', label: 'M3 - 高级经理' },
  { value: 'M4', label: 'M4 - 总监' }
])

const filteredPositions = computed(() => {
  if (!props.position) return allPositions.value
  return allPositions.value.filter(p => String(p.id) !== String(props.position?.id))
})

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 表单数据
const form = reactive<PositionForm>({
  name: '',
  code: '',
  level: '',
  benchmarkValue: 0,
  description: '',
  businessLineId: undefined,
  responsibilities: [],
  requirements: [],
  coreSkills: [],
  careerPath: {
    nextLevel: '',
    estimatedTime: '',
    lateralMoves: [],
    specializations: [],
    growthAreas: []
  },
  workEnvironment: {
    travel: '',
    workType: ''
  },
  isComprehensive: false,
  isMarket: false
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 100, message: '岗位名称长度为 2 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入岗位代码', trigger: 'blur' },
    { min: 2, max: 50, message: '岗位代码长度为 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_-]+$/, message: '岗位代码只能包含大写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择职级', trigger: 'change' }
  ],
  benchmarkValue: [
    { required: true, message: '请输入基准值', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 3.0, message: '基准值范围为 0.1-3.0', trigger: 'blur' }
  ],
  description: [
    { max: 1000, message: '岗位描述不能超过 1000 个字符', trigger: 'blur' }
  ]
}

// 监听对话框显示状态
watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
    if (props.isEdit && props.position) {
      populateForm()
    }
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    code: '',
    level: '',
    benchmarkValue: 0,
    description: '',
    businessLineId: undefined,
    categoryId: undefined,
    responsibilities: [],
    requirements: [],
    coreSkills: [],
    careerPath: {
      nextLevel: '',
      estimatedTime: '',
      lateralMoves: [],
      specializations: [],
      growthAreas: []
    },
    workEnvironment: {
      travel: '',
      workType: ''
    },
    isComprehensive: false,
    isMarket: false
  })
  
  categoryPath.value = ''
  activeTab.value = 'basic'
  formRef.value?.clearValidate()
}

// 填充表单数据（编辑时）
const populateForm = () => {
  if (!props.position) return
  
  const pos = props.position as any
  Object.assign(form, {
    name: pos.name,
    code: pos.code,
    level: pos.level,
    benchmarkValue: pos.benchmarkValue,
    description: pos.description || '',
    businessLineId: pos.businessLineId || pos.lineId,
    categoryId: pos.categoryId,
    responsibilities: pos.responsibilities ? [...pos.responsibilities] : [],
    requirements: pos.requirements ? [...pos.requirements] : [],
    coreSkills: pos.core_skills ? [...pos.core_skills] : [],
    careerPath: pos.career_path ? { ...pos.career_path } : {
      nextLevel: '',
      estimatedTime: '',
      lateralMoves: [],
      specializations: [],
      growthAreas: []
    },
    workEnvironment: pos.work_environment ? { ...pos.work_environment } : {
      travel: '',
      workType: ''
    },
    isComprehensive: Boolean(pos.is_comprehensive) || false,
    isMarket: Boolean(pos.is_market) || false
  })
  
  // 设置分类选择器的值
  categoryPath.value = pos.categoryId || '' // 使用category_id
  
  console.log(form)
}

// 添加职责
const addResponsibility = () => {
  if (!form.responsibilities) form.responsibilities = []
  form.responsibilities.push('')
}

// 移除职责
const removeResponsibility = (index: number) => {
  form.responsibilities?.splice(index, 1)
}

// 添加要求
const addRequirement = () => {
  if (!form.requirements) form.requirements = []
  form.requirements.push('')
}

// 移除要求
const removeRequirement = (index: number) => {
  form.requirements?.splice(index, 1)
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 加载业务线列表
const loadBusinessLines = async () => {
  try {
    const { data } = await getBusinessLines({ page: 1, pageSize: 100 })
    businessLines.value = data.list || []
  } catch (error) {
    console.error('加载业务线失败:', error)
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await getCategories({ isActive: true })
    if (response.data) {
      categoryOptions.value = response.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 分类变更处理
const handleCategoryChange = (value: string) => {
  form.categoryId = value
}

// 加载岗位列表
const loadAllPositions = async () => {
  try {
    const { data } = await getPositions({ page: 1, pageSize: 1000, status: 1 })
    allPositions.value = data.list || []
  } catch (error) {
    console.error('加载岗位列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
  loadBusinessLines()
  loadAllPositions()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 过滤掉空的职责和要求
    const filteredResponsibilities = (form.responsibilities || []).filter(item => item.trim())
    const filteredRequirements = (form.requirements || []).filter(item => item.trim())
    
    const submitData = {
      ...form,
      categoryId: categoryPath.value || undefined, // 使用categoryPath的值
      responsibilities: filteredResponsibilities,
      requirements: filteredRequirements
    }
    
    console.log('提交数据:', submitData)
    loading.value = true
    
    if (props.isEdit && props.position?.id) {
      await updatePosition(props.position.id as any, submitData)
      ElMessage.success('岗位更新成功')
    } else {
      await createPosition(submitData)
      ElMessage.success('岗位创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('表单提交失败:', error)
    if (error !== false) { // 不是表单验证失败
      ElMessage.error(props.isEdit ? '岗位更新失败' : '岗位创建失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-section {
  margin-bottom: 20px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.empty-list {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  background-color: #fafafa;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.list-item:last-child {
  margin-bottom: 0;
}

.list-item .el-input {
  flex: 1;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>