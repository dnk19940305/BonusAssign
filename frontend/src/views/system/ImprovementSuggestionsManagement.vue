<template>
  <div class="improvement-suggestions-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>改进建议管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        录入建议
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="员工">
          <el-select 
            v-model="filters.employeeId" 
            placeholder="输入员工姓名或编号搜索" 
            clearable 
            filterable
            remote
            reserve-keyword
            :remote-method="handleFilterEmployeeSearch"
            :loading="searchingFilterEmployees"
            style="width: 200px"
          >
            <el-option
              v-for="emp in filterSearchedEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo || emp.id})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 200px">
            <el-option label="待实施" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已拒绝" :value="-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="选择优先级" clearable style="width: 200px">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="选择分类" clearable style="width: 200px">
            <el-option label="绩效" value="performance" />
            <el-option label="技能" value="skills" />
            <el-option label="项目" value="projects" />
            <el-option label="协作" value="collaboration" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadSuggestions">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="suggestions" v-loading="loading" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeName" label="员工" width="120" />
        <el-table-column prop="title" label="建议标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusCode" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusCode)">
              {{ getStatusLabel(row.statusCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="potentialImpact" label="预期提升" width="100">
          <template #default="{ row }">
            <span v-if="row.potentialImpact">+{{ row.potentialImpact }}%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdByName" label="录入人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">查看</el-button>
            <el-button link type="primary" @click="editSuggestion(row)">编辑</el-button>
            <el-button 
              v-if="row.statusCode === 1" 
              link 
              type="success" 
              @click="approveSuggestion(row)"
            >
              审核通过
            </el-button>
            <el-button 
              v-if="row.statusCode === 1" 
              link 
              type="warning" 
              @click="rejectSuggestion(row)"
            >
              审核拒绝
            </el-button>
            <el-button link type="danger" @click="deleteSuggestion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadSuggestions"
        @current-change="loadSuggestions"
        class="pagination"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="员工" prop="employeeId">
          <el-select 
            v-model="form.employeeId" 
            placeholder="输入员工姓名或编号搜索" 
            filterable 
            remote
            reserve-keyword
            :remote-method="handleDialogEmployeeSearch"
            :loading="searchingDialogEmployees"
            :teleported="false"
            style="width: 100%"
            @change="handleEmployeeSelect"
          >
            <el-option
              v-for="emp in dialogSearchedEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo || emp.id})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="建议标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入建议标题" />
        </el-form-item>
        <el-form-item label="建议描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入建议详细描述" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类" :teleported="false">
            <el-option label="绩效" value="performance" />
            <el-option label="技能" value="skills" />
            <el-option label="项目" value="projects" />
            <el-option label="协作" value="collaboration" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="选择优先级" :teleported="false">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="预期提升" prop="potentialImpact">
          <el-input-number v-model="form.potentialImpact" :min="0" :max="100" :step="5" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="时间框架" prop="timeFrame">
          <el-input v-model="form.timeFrame" placeholder="例如：1-3个月" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态" :teleported="false">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="建议详情" width="600px">
      <el-descriptions :column="2" border v-if="currentSuggestion">
        <el-descriptions-item label="员工">{{ currentSuggestion.employeeName }}</el-descriptions-item>
        <el-descriptions-item label="录入人">{{ currentSuggestion.createdByName }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentSuggestion.title }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentSuggestion.description }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag :type="getCategoryType(currentSuggestion.category)">
            {{ getCategoryLabel(currentSuggestion.category) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(currentSuggestion.priority)">
            {{ getPriorityLabel(currentSuggestion.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentSuggestion.statusCode)">
            {{ getStatusLabel(currentSuggestion.statusCode) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预期提升">
          <span v-if="currentSuggestion.potentialImpact">+{{ currentSuggestion.potentialImpact }}%</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="时间框架">{{ currentSuggestion.timeFrame || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentSuggestion.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" v-if="currentSuggestion.updatedAt">
          {{ formatDate(currentSuggestion.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" v-if="currentSuggestion.completedAt">
          {{ formatDate(currentSuggestion.completedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getImprovementSuggestions,
  createImprovementSuggestion,
  updateImprovementSuggestion,
  deleteImprovementSuggestion,
  approveSuggestion as approveSuggestionApi,
  rejectSuggestion as rejectSuggestionApi,
  type ImprovementSuggestion
} from '@/api/improvementSuggestions'
import { getEmployees } from '@/api/employee'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

const filters = reactive({
  employeeId: '',
  status: '' as number | '',
  priority: '',
  category: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const suggestions = ref<ImprovementSuggestion[]>([])
const filterSearchedEmployees = ref<any[]>([])
const dialogSearchedEmployees = ref<any[]>([])
const currentSuggestion = ref<ImprovementSuggestion | null>(null)
const searchingFilterEmployees = ref(false)
const searchingDialogEmployees = ref(false)
let filterSearchTimer: any = null
let dialogSearchTimer: any = null

const form = reactive({
  id: 0,
  employeeId: '',
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  status: 'pending',
  potentialImpact: 0,
  timeFrame: ''
})

const rules: FormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  title: [{ required: true, message: '请输入建议标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

// 筛选区员工远程搜索
const handleFilterEmployeeSearch = (query: string) => {
  if (filterSearchTimer) {
    clearTimeout(filterSearchTimer)
  }
  
  filterSearchTimer = setTimeout(async () => {
    if (!query || query.trim().length < 1) {
      filterSearchedEmployees.value = []
      return
    }

    searchingFilterEmployees.value = true
    try {
      const response = await getEmployees({
        search: query,
        status: 1,
        page: 1,
        pageSize: 20
      })
      filterSearchedEmployees.value = response.data.list || []
    } catch (error: any) {
      console.error('搜索员工失败:', error)
      ElMessage.warning('搜索员工失败')
      filterSearchedEmployees.value = []
    } finally {
      searchingFilterEmployees.value = false
    }
  }, 300)
}

// 弹窗员工远程搜索
const handleDialogEmployeeSearch = (query: string) => {
  if (dialogSearchTimer) {
    clearTimeout(dialogSearchTimer)
  }
  
  dialogSearchTimer = setTimeout(async () => {
    if (!query || query.trim().length < 1) {
      dialogSearchedEmployees.value = []
      return
    }

    searchingDialogEmployees.value = true
    try {
      const response = await getEmployees({
        search: query,
        status: 1,
        page: 1,
        pageSize: 20
      })
      dialogSearchedEmployees.value = response.data.list || []
    } catch (error: any) {
      console.error('搜索员工失败:', error)
      ElMessage.warning('搜索员工失败')
      dialogSearchedEmployees.value = []
    } finally {
      searchingDialogEmployees.value = false
    }
  }, 300)
}

// 选择员工
const handleEmployeeSelect = (employeeId: string) => {
  const employee = dialogSearchedEmployees.value.find(emp => emp.id === employeeId)
  if (employee) {
    // 可以在这里设置员工名称等信息
    console.log('选中员工:', employee)
  }
}

// 加载建议列表
const loadSuggestions = async () => {
  loading.value = true
  try {
    const res = await getImprovementSuggestions({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    })
    
    if (res && res.data) {
      // 标准分页格式：data.list
      const responseData = res.data
      
      if (responseData.list && Array.isArray(responseData.list)) {
        suggestions.value = responseData.list
        pagination.total = responseData.total || 0
      } else {
        suggestions.value = []
        pagination.total = 0
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '录入改进建议'
  dialogVisible.value = true
}

// 编辑建议
const editSuggestion = (row: ImprovementSuggestion) => {
  isEdit.value = true
  dialogTitle.value = '编辑改进建议'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 查看详情
const viewDetail = (row: ImprovementSuggestion) => {
  currentSuggestion.value = row
  detailVisible.value = true
}

// 审核通过
const approveSuggestion = async (row: ImprovementSuggestion) => {
  try {
    await ElMessageBox.prompt('请输入审核意见（可选）', '审核通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入审核意见...'
    })
    
    await approveSuggestionApi(row.id, (ElMessageBox as any).inputValue || '')
    ElMessage.success('审核通过')
    loadSuggestions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '审核失败')
    }
  }
}

// 审核拒绝
const rejectSuggestion = async (row: ImprovementSuggestion) => {
  try {
    const result = await ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝原因...',
      inputValidator: (value: string) => {
        if (!value || !value.trim()) {
          return '请输入拒绝原因'
        }
        return true
      },
      inputErrorMessage: '拒绝原因不能为空'
    })
    
    await rejectSuggestionApi(row.id, result.value)
    ElMessage.success('已拒绝')
    loadSuggestions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '操作失败')
    }
  }
}

// 删除建议
const deleteSuggestion = async (row: ImprovementSuggestion) => {
  try {
    await ElMessageBox.confirm('确定删除此建议吗？', '确认删除', {
      type: 'warning'
    })
    
    await deleteImprovementSuggestion(row.id)
    ElMessage.success('删除成功')
    loadSuggestions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const employee = dialogSearchedEmployees.value.find(e => e.id === form.employeeId)
      const employeeName = employee?.name
      
      if (isEdit.value) {
        await updateImprovementSuggestion(form.id, {
          ...form,
          employeeName
        })
        ElMessage.success('更新成功')
      } else {
        await createImprovementSuggestion({
          ...form,
          employeeName
        })
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      loadSuggestions()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    employeeId: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'pending',
    potentialImpact: 0,
    timeFrame: ''
  })
  dialogSearchedEmployees.value = []
}

// 重置筛选
const resetFilters = () => {
  Object.assign(filters, {
    employeeId: '',
    status: '',
    priority: '',
    category: ''
  })
  loadSuggestions()
}

// 格式化日期
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    performance: '绩效',
    skills: '技能',
    projects: '项目',
    collaboration: '协作'
  }
  return labels[category] || category
}

const getCategoryType = (category: string): any => {
  const types: Record<string, string> = {
    performance: 'success',
    skills: 'warning',
    projects: 'primary',
    collaboration: 'info'
  }
  return types[category] || ''
}

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const getPriorityType = (priority: string): any => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || ''
}

// 获取状态标签
const getStatusLabel = (statusCode: number) => {
  const labels: Record<number, string> = {
    0: '待实施',
    1: '待审核',
    2: '已完成',
    [-1]: '已拒绝',
    [-2]: '系统建议'
  }
  return labels[statusCode] || '未知'
}

const getStatusType = (statusCode: number): any => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    [-1]: 'danger',
    [-2]: ''  // 系统建议使用默认样式
  }
  return types[statusCode] || ''
}

onMounted(() => {
  loadSuggestions()
})
</script>

<style scoped lang="scss">
.improvement-suggestions-management {
  padding: 20px;
  position: relative;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card {
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
