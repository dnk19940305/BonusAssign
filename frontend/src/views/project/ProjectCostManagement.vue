<template>
  <div class="project-cost-management">
    <div class="page-header">
      <h2>项目成本管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateCostDialog">
          <el-icon>
            <Plus />
          </el-icon>
          录入成本
        </el-button>
        <el-button @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-form :model="queryForm" inline>
        <el-form-item label="项目">
          <el-select v-model="queryForm.projectId" placeholder="选择项目" clearable style="width: 200px">
            <el-option v-for="project in projectOptions" :key="project._id || project.id || `project-${Math.random()}`"
              :label="project.name || '未知项目'" :value="project._id || project.id || ''" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本类型">
          <el-select v-model="queryForm.costType" placeholder="选择类型" clearable style="width: 150px">
            <el-option label="人力成本" value="人力成本" />
            <el-option label="材料成本" value="材料成本" />
            <el-option label="其他成本" value="其他成本" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="queryForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 财务概览统计 -->
    <div class="finance-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon budget-icon">
                <el-icon>
                  <Money />
                </el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ formatCurrency(financialOverview.totalBudget) }}</div>
                <div class="overview-label">总预算</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon cost-icon">
                <el-icon>
                  <Wallet />
                </el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ formatCurrency(financialOverview.totalCost) }}</div>
                <div class="overview-label">总成本</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon profit-icon">
                <el-icon>
                  <TrendCharts />
                </el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-value" :class="getProfitClass(financialOverview.expectedProfit)">
                  {{ formatCurrency(financialOverview.expectedProfit) }}
                </div>
                <div class="overview-label">预期利润</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon bonus-icon">
                <el-icon>
                  <Present />
                </el-icon>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ formatCurrency(financialOverview.estimatedBonus) }}</div>
                <div class="overview-label">预估奖金</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 成本记录列表 -->
    <div class="table-section">
      <el-table v-loading="loading" :data="costRecords" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="projectName" label="项目名称" min-width="150" />
        <el-table-column prop="costType" label="成本类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCostTypeTagType(row.costType)" size="small">
              {{ row.costType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="cost-amount">{{ formatCurrency(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="date" label="发生日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recordedByName" label="记录人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showEditCostDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteCost(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch" @current-change="handleSearch" />
      </div>
    </div>

    <!-- 成本录入/编辑对话框 -->
    <el-dialog v-model="costDialogVisible" :title="isEdit ? '编辑成本记录' : '录入成本记录'" width="600px"
      :close-on-click-modal="false">
      <el-form ref="costFormRef" :model="costForm" :rules="costFormRules" label-width="100px">
        <el-form-item label="项目" prop="projectId">
          <el-select v-model="costForm.projectId" placeholder="请选择项目" style="width: 100%" filterable
            @change="handleProjectChange">
            <el-option v-for="project in projectOptions" :key="project._id || project.id || `project-${Math.random()}`"
              :label="project.name + project.code || '未知项目'" :value="project._id || project.id || ''" />
          </el-select>
        </el-form-item>

        <!-- 项目预算信息卡片 -->
        <el-alert v-if="selectedProject && selectedProject.budget" :type="'info'" :closable="false"
          style="margin-bottom: 15px">
          <template #title>
            <div style="font-size: 13px">
              <div style="margin-bottom: 5px">
                <strong>项目预算：</strong>{{ formatCurrency(selectedProject.budget || 0) }}
              </div>
              <div style="margin-bottom: 5px">
                <strong>已用成本：</strong>{{ formatCurrency(selectedProject.totalCost || 0) }}
                <span style="margin-left: 10px; color: #909399">
                  ({{ selectedProject.budget > 0 ? ((selectedProject.totalCost || 0) / selectedProject.budget *
                    100).toFixed(1) : 0 }}%)
                </span>
              </div>
              <div>
                <strong>剩余预算：</strong>
                <span
                  :style="{ color: (selectedProject.budget - (selectedProject.totalCost || 0)) < 0 ? '#f56c6c' : '#67c23a' }">
                  {{ formatCurrency((selectedProject.budget || 0) - (selectedProject.totalCost || 0)) }}
                </span>
              </div>
            </div>
          </template>
        </el-alert>

        <el-form-item label="成本类型" prop="costType">
          <el-select v-model="costForm.costType" placeholder="请选择成本类型" style="width: 100%">
            <el-option label="人力成本" value="人力成本">
              <span style="float: left">人力成本</span>
              <span style="float: right; color: #8492a6; font-size: 13px">员工工资、福利等</span>
            </el-option>
            <el-option label="材料成本" value="材料成本">
              <span style="float: left">材料成本</span>
              <span style="float: right; color: #8492a6; font-size: 13px">设备、软件、工具等</span>
            </el-option>
            <el-option label="其他成本" value="其他成本">
              <span style="float: left">其他成本</span>
              <span style="float: right; color: #8492a6; font-size: 13px">差旅、办公等</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="costForm.amount" :min="0.01" :max="99999999.99" :precision="2" :step="100"
            style="width: 100%" placeholder="请输入成本金额">
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <!-- 成本预算检查提示 -->
        <el-alert v-if="costBudgetCheck.showDetails && costForm.amount > 0" :type="costBudgetCheck.type"
          :closable="false" style="margin-bottom: 15px">
          <template #title>
            <div style="font-size: 13px">
              <div style="margin-bottom: 8px">
                {{ costBudgetCheck.message }}
              </div>
              <div v-if="costBudgetCheck.details" style="font-size: 12px; color: #606266">
                <div>录入后累计：{{ formatCurrency(costBudgetCheck.details.totalAfterAdd) }}</div>
                <div v-if="costBudgetCheck.details.budget > 0">
                  占预算比例：{{ costBudgetCheck.details.percentage }}%
                </div>
              </div>
            </div>
          </template>
        </el-alert>

        <el-form-item label="发生日期" prop="date">
          <el-date-picker v-model="costForm.date" type="date" placeholder="请选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%"
            :disabled-date="(time: Date) => time.getTime() > Date.now()" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="costForm.status">
            <el-radio label="confirmed">已确认</el-radio>
            <el-radio label="pending">待审核</el-radio>
          </el-radio-group>
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            已确认的成本将立即计入项目总成本
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="costForm.description" type="textarea" :rows="4" placeholder="请详细描述成本情况，包括成本项目、用途等（5-500字）"
            maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="costDialogVisible = false" :disabled="submitting">
            取消
          </el-button>
          <el-button type="primary" @click="handleSubmitCost" :loading="submitting"
            :disabled="!costForm.projectId || !costForm.costType || costForm.amount <= 0">
            <el-icon v-if="!submitting">
              <Check />
            </el-icon>
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Search, Refresh, Money, Wallet, TrendCharts, Present, Check } from '@element-plus/icons-vue'
import { projectCostApi } from '@/api/projectCosts'
import { projectApi } from '@/api/project'
import type { ProjectCost, ProjectCostQuery, ProjectCostResponse } from '@/api/projectCosts'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const costDialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref<string>('')  // 当前编辑的成本记录ID
const selectedCosts = ref<ProjectCost[]>([])

// 查询表单
const queryForm = reactive<ProjectCostQuery & { dateRange?: string[] }>({
  page: 1,
  pageSize: 20,
  projectId: '',
  costType: '',
  dateRange: []
})

// 分页信息
const pagination = reactive({
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0
})

// 成本记录列表
const costRecords = ref<ProjectCost[]>([])

// 项目选项
const projectOptions = ref<any[]>([])

// 财务概览
const financialOverview = reactive({
  totalBudget: 0,
  totalCost: 0,
  expectedProfit: 0,
  estimatedBonus: 0
})

// 成本表单
const costForm = reactive<{
  projectId: string
  costType: '人力成本' | '材料成本' | '其他成本' | ''
  amount: number
  description: string
  date: string
  status?: 'pending' | 'confirmed' | 'rejected'
}>({
  projectId: '',
  costType: '',
  amount: 0,
  description: '',
  date: '',
  status: 'confirmed'
})

// 选中的项目信息
const selectedProject = ref<any>(null)

// 自定义金额验证器
const validateAmount = (rule: any, value: number, callback: any) => {
  if (!value || value <= 0) {
    callback(new Error('金额必须大于0'))
    return
  }

  if (!selectedProject.value) {
    callback()
    return
  }

  const projectBudget = selectedProject.value.budget || 0
  const currentCost = selectedProject.value.totalCost || 0

  // 如果项目没有预算，给出提示但允许录入
  if (!projectBudget || projectBudget <= 0) {
    callback()
    return
  }

  // 单次成本不应超过项目预算的50%
  if (value > projectBudget * 0.5) {
    callback(new Error(`单次成本过大，不应超过项目预算的50%(${formatCurrency(projectBudget * 0.5)})`))
    return
  }

  // 累计成本超过预算120%时阻止
  const totalAfterAdd = currentCost + value
  if (totalAfterAdd > projectBudget * 1.2) {
    callback(new Error(`累计成本将超过预算的120%，当前已用${formatCurrency(currentCost)}，预算${formatCurrency(projectBudget)}`))
    return
  }

  callback()
}

// 表单验证规则
const costFormRules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  costType: [
    { required: true, message: '请选择成本类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入成本金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' },
    { validator: validateAmount, trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入成本描述', trigger: 'blur' },
    { min: 5, max: 500, message: '描述长度应在5-500个字符之间', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择发生日期', trigger: 'change' }
  ]
}

const costFormRef = ref()

// 计算属性：成本预算检查
const costBudgetCheck = computed(() => {
  if (!selectedProject.value || !costForm.amount || costForm.amount <= 0) {
    return { valid: true, type: 'info', message: '请选择项目并输入金额', showDetails: false }
  }

  const project = selectedProject.value
  const budget = project.budget || 0
  const currentCost = project.totalCost || 0
  const inputAmount = costForm.amount || 0
  const totalAfterAdd = currentCost + inputAmount
  const remainingBudget = budget - currentCost

  // 项目没有预算
  if (!budget || budget <= 0) {
    return {
      valid: true,
      type: 'warning',
      message: '该项目未设置预算，请谨慎录入',
      showDetails: true,
      details: {
        budget: 0,
        currentCost,
        inputAmount,
        totalAfterAdd,
        remainingBudget: 0,
        percentage: 0
      }
    }
  }

  const percentage = (totalAfterAdd / budget * 100).toFixed(1)
  const usagePercentage = (currentCost / budget * 100).toFixed(1)

  // 超过预算120% - 错误
  if (totalAfterAdd > budget * 1.2) {
    return {
      valid: false,
      type: 'error',
      message: `⛔ 累计成本超过预算120%，无法录入`,
      showDetails: true,
      details: {
        budget,
        currentCost,
        inputAmount,
        totalAfterAdd,
        remainingBudget,
        percentage,
        usagePercentage
      }
    }
  }

  // 超过预算100% - 严重警告
  if (totalAfterAdd > budget) {
    return {
      valid: true,
      type: 'error',
      message: `⚠️ 累计成本将超出预算 ${percentage}%，请说明原因`,
      showDetails: true,
      details: {
        budget,
        currentCost,
        inputAmount,
        totalAfterAdd,
        remainingBudget,
        percentage,
        usagePercentage
      }
    }
  }

  // 超过预算80% - 警告
  if (totalAfterAdd > budget * 0.8) {
    return {
      valid: true,
      type: 'warning',
      message: `⚠️ 累计成本将达到预算的 ${percentage}%，接近上限`,
      showDetails: true,
      details: {
        budget,
        currentCost,
        inputAmount,
        totalAfterAdd,
        remainingBudget,
        percentage,
        usagePercentage
      }
    }
  }

  // 正常范围
  return {
    valid: true,
    type: 'success',
    message: `✅ 成本合理，将占预算的 ${percentage}%`,
    showDetails: true,
    details: {
      budget,
      currentCost,
      inputAmount,
      totalAfterAdd,
      remainingBudget,
      percentage,
      usagePercentage
    }
  }
})

// 监听项目选择变化
const handleProjectChange = async (projectId: string) => {
  if (!projectId) {
    selectedProject.value = null
    return
  }

  // 从项目列表中找到选中的项目
  const project = projectOptions.value.find(p => (p._id || p.id) === projectId)
  if (!project) {
    selectedProject.value = null
    return
  }

  try {
    // 加载项目的成本汇总信息
    const response = await projectCostApi.getProjectCostSummary(projectId)
    const summary = response.data || {}

    selectedProject.value = {
      ...project,
      totalCost: summary.totalCost || 0
    }

  } catch (error) {

    selectedProject.value = {
      ...project,
      totalCost: 0
    }
  }

  // 触发金额验证
  if (costFormRef.value && costForm.amount > 0) {
    costFormRef.value.validateField('amount')
  }
}

// 组件挂载
onMounted(() => {
  loadProjects()
  loadCostRecords()
  loadFinancialOverview()
})

// 加载项目列表（只加载已发布/进行中的项目，不包括草稿项目）
const loadProjects = async () => {
  try {

    const response = await projectApi.getProjects()
    // 处理不同的API响应结构
    let projects: any[] = response.data.list
    // 检查projects是否为数组
    if (!Array.isArray(projects)) {
      projectOptions.value = []
      return
    }

    // 筛选有效项目：必须有ID、名称，且协作状态不能是draft（草稿）
    const validProjects = projects.filter(project => {
      const hasBasicInfo = project && (project._id || project.id) && project.name
      const isNotDraft = project.cooperation_status !== 'draft'
      const isValid = hasBasicInfo && isNotDraft
      return isValid
    })


    projectOptions.value = validProjects
  } catch (error: any) {

    ElMessage.error('加载项目列表失败')
    projectOptions.value = []
  }
}

// 加载成本记录
const loadCostRecords = async () => {
  loading.value = true
  try {

    const params: any = { ...queryForm }


    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      // 处理日期范围查询
      params.startDate = queryForm.dateRange[0]
      params.endDate = queryForm.dateRange[1]
    }
    
    // 移除不被后端识别的数组字段
    delete params.dateRange

    const response = await projectCostApi.getCosts(params)


    costRecords.value = response.data.list || []
    
    pagination.total = response.data.total || 0
    pagination.page = response.data.page || 1
    pagination.pageSize = response.data.pageSize || 20
    pagination.totalPages = response.data.totalPages || 0

  } catch (error: any) {


    // 根据错误类型显示不同的错误信息
    if (error.response?.status === 500) {
      ElMessage.warning('服务器暂时不可用，显示默认数据')
      // 设置默认的空数据
      costRecords.value = []
      pagination.total = 0
      pagination.page = 1
      pagination.pageSize = 20
      pagination.totalPages = 0
    } else {
      ElMessage.error('加载成本记录失败')
    }

    costRecords.value = []
  } finally {
    loading.value = false
  }
}

// 加载财务概览
const loadFinancialOverview = async () => {
  try {

    const response = await projectCostApi.getAllProjectCostSummaries()


    const summaries = response.data || []


    // 安全地计算财务数据，避免undefined或null值
    financialOverview.totalBudget = summaries.reduce((sum, s) => sum + (Number(s?.totalBudget) || 0), 0)
    financialOverview.totalCost = summaries.reduce((sum, s) => sum + (Number(s?.totalCost) || 0), 0)
    financialOverview.expectedProfit = summaries.reduce((sum, s) => sum + (Number(s?.expectedProfit) || 0), 0)
    financialOverview.estimatedBonus = summaries.reduce((sum, s) => sum + (Number(s?.estimatedBonus) || 0), 0)


  } catch (error: any) {


    // 根据错误类型显示不同的错误信息
    if (error.response?.status === 500) {
      ElMessage.warning('服务器暂时不可用，显示默认数据')
    } else {
      ElMessage.error('加载财务概览失败')
    }

    // 设置默认值，避免页面显示异常
    financialOverview.totalBudget = 0
    financialOverview.totalCost = 0
    financialOverview.expectedProfit = 0
    financialOverview.estimatedBonus = 0
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadCostRecords()
}

// 重置
const handleReset = () => {
  queryForm.projectId = ''
  queryForm.costType = ''
  queryForm.dateRange = []
  queryForm.page = 1
  loadCostRecords()
}

// 显示创建成本对话框
const showCreateCostDialog = () => {
  isEdit.value = false
  currentEditId.value = ''

  // 重置表单
  Object.assign(costForm, {
    projectId: '',
    costType: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'confirmed'
  })

  // 重置选中的项目
  selectedProject.value = null

  // 重置表单验证
  if (costFormRef.value) {
    costFormRef.value.clearValidate()
  }

  costDialogVisible.value = true
}

// 显示编辑成本对话框
const showEditCostDialog = async (cost: ProjectCost) => {
  isEdit.value = true
  currentEditId.value = cost._id || ''

  // 填充表单数据
  Object.assign(costForm, {
    projectId: cost.projectId,
    costType: cost.costType,
    amount: cost.amount,
    description: cost.description,
    date: cost.date,
    status: cost.status
  })

  // 加载选中项目的信息
  if (cost.projectId) {
    await handleProjectChange(cost.projectId)
  }

  // 重置表单验证
  if (costFormRef.value) {
    costFormRef.value.clearValidate()
  }

  costDialogVisible.value = true
}

// 提交成本表单
const handleSubmitCost = async () => {
  if (!costFormRef.value) return

  try {
    // 验证表单
    await costFormRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      // 编辑模式
      if (!currentEditId.value) {
        ElMessage.error('无法获取成本记录ID')
        return
      }

      // 验证costType不为空
      if (!costForm.costType) {
        ElMessage.error('请选择成本类型')
        return
      }

      // 准备更新数据
      const updateData: Partial<ProjectCost> = {
        projectId: costForm.projectId,
        costType: costForm.costType as '人力成本' | '材料成本' | '其他成本',
        amount: costForm.amount,
        description: costForm.description,
        date: costForm.date,
        status: costForm.status as 'pending' | 'confirmed' | 'rejected'
      }

      await projectCostApi.updateCost(currentEditId.value, updateData)
      ElMessage.success('成本记录更新成功')

    } else {
      // 创建模式
      const createData = {
        projectId: costForm.projectId,
        costType: costForm.costType as '人力成本' | '材料成本' | '其他成本',
        amount: costForm.amount,
        description: costForm.description,
        date: costForm.date,
        recordedBy: '', // 后端会自动填充
        status: costForm.status as 'pending' | 'confirmed' | 'rejected'
      }

      await projectCostApi.createCost(createData)
      ElMessage.success('成本记录创建成功')
    }

    // 关闭对话框并刷新数据
    costDialogVisible.value = false
    await loadCostRecords()
    await loadFinancialOverview()

  } catch (error: any) {


    // 详细的错误处理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数有误，请检查输入')
          break
        case 403:
          ElMessage.error('您没有权限执行此操作')
          break
        case 404:
          ElMessage.error('未找到相关记录')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(data.message || '操作失败，请重试')
      }
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error(isEdit.value ? '更新失败，请重试' : '创建失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 删除成本记录
const handleDeleteCost = async (cost: ProjectCost) => {
  try {
    await ElMessageBox.confirm('确定要删除这条成本记录吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    if (!cost._id) {
      ElMessage.error('无法获取成本记录ID')
      return
    }

    await projectCostApi.deleteCost(cost._id)
    ElMessage.success('删除成功')
    await loadCostRecords()
    await loadFinancialOverview()
  } catch (error: any) {


    if (error !== 'cancel') {
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 403:
            ElMessage.error('您没有权限删除此成本记录')
            break
          case 404:
            ElMessage.error('未找到该成本记录')
            break
          case 500:
            ElMessage.error('服务器错误，请稍后重试')
            break
          default:
            ElMessage.error(data.message || '删除失败，请重试')
        }
      } else {
        ElMessage.error('删除失败，请重试')
      }
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: ProjectCost[]) => {
  selectedCosts.value = selection
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 工具函数
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount || 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getCostTypeTagType = (costType: string) => {
  const types: Record<string, string> = {
    '人力成本': 'primary',
    '材料成本': 'success',
    '其他成本': 'warning'
  }
  return types[costType] || 'info'
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    'pending': 'warning',
    'confirmed': 'success',
    'rejected': 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': '待审核',
    'confirmed': '已确认',
    'rejected': '已拒绝'
  }
  return labels[status] || status
}

const getProfitClass = (profit: number) => {
  if (profit > 0) {
    return 'profit-positive'
  } else if (profit < 0) {
    return 'profit-negative'
  }
  return ''
}
</script>

<style scoped>
.project-cost-management {
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
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.finance-overview {
  margin-bottom: 20px;
}

.overview-card {
  text-align: center;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.overview-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.overview-icon {
  font-size: 48px;
  margin-right: 20px;
}

.budget-icon {
  color: #409eff;
}

.cost-icon {
  color: #e6a23c;
}

.profit-icon {
  color: #67c23a;
}

.bonus-icon {
  color: #f56c6c;
}

.overview-content {
  text-align: left;
}

.overview-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.overview-label {
  font-size: 14px;
  color: #909399;
}

.profit-positive {
  color: #67c23a;
}

.profit-negative {
  color: #f56c6c;
}

.table-section {
  background: white;
  border-radius: 4px;
  padding: 20px;
}

.cost-amount {
  font-weight: bold;
  color: #e6a23c;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.batch-actions {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}
</style>
