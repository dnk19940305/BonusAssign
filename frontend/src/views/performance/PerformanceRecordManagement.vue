<template>
  <div class="performance-record-management">
    <el-card>
      <!-- 页面标题 -->
      <template #header>
        <div class="card-header">
          <span>绩效记录管理</span>
          <div class="header-actions">
            <el-button type="success" @click="downloadTemplate">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增绩效记录
            </el-button>
            <el-button @click="handleBatchImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 分数范围提示 -->
      <el-alert
        title="三维评分范围说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <div style="display: flex; gap: 30px; font-size: 14px">
            <span>🎯 <strong>岗位评分</strong>: 0-100 （百分制）</span>
            <span>📊 <strong>绩效评分</strong>: 0-100 （百分制）</span>
            <span>💰 <strong>利润贡献度(评分)</strong>: -100至100</span>
          </div>
        </template>
      </el-alert>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item label="员工">
          <el-input
            v-model="queryParams.employeeName"
            placeholder="请输入员工姓名或工号"
            clearable
            style="width: 200px"
            @keyup.enter="fetchRecords"
          />
        </el-form-item>

        <el-form-item label="期间">
          <el-input
            v-model="queryParams.period"
            placeholder="如: 2025Q1"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchRecords">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="employee_no" label="员工工号" width="120" />
        <el-table-column prop="employee_name" label="员工姓名" width="120" />
        <el-table-column prop="department_name" label="部门" width="120" />
        <el-table-column prop="position_name" label="岗位" width="120" />
        <el-table-column prop="business_line_name" label="业务线" width="100" />
        <el-table-column prop="calculation_period" label="考核期间" width="100" />

        <!-- 考勤信息 -->
        <el-table-column prop="start_end_time" label="考勤起止日期" width="180">
          <template #default="{ row }">
            {{ row.start_end_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="work_time" label="应出勤时长(小时)" width="140" align="center">
          <template #default="{ row }">
            {{ row.work_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="real_work_time" label="实际出勤时长(小时)" width="160" align="center">
          <template #default="{ row }">
            {{ row.real_work_time || '-' }}
          </template>
        </el-table-column>

        <!-- 三维评分 -->
        <el-table-column prop="position_score" label="岗位评分" width="100">
          <template #default="{ row }">
            {{ parseFloat(row.position_score || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="performance_score" label="绩效评分" width="100">
          <template #default="{ row }">
            {{ parseFloat(row.performance_score || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="profit_contribution" label="利润贡献度(评分)" width="140">
          <template #default="{ row }">
            {{ parseFloat(row.profit_contribution || 0).toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column prop="review_status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.review_status === 'approved' ? 'success' : 'warning'" size="small">
              {{ row.review_status === 'approved' ? '已批准' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="creator_name" label="创建人" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchRecords"
          @current-change="fetchRecords"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="员工" prop="employeeId">
          <el-select
            v-model="formData.employeeId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入员工姓名或工号搜索"
            :remote-method="searchEmployees"
            :loading="employeeLoading"
            style="width: 100%"
            :disabled="!!formData.id"
          >
            <el-option
              v-for="emp in employees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="考核期间" prop="period">
           <el-select 
             v-model="formData.period" 
             placeholder="选择期间" 
             style="width: 100%"
             @change="handlePeriodChange"
           >
            <el-option
              v-for="period in availablePeriods"
              :key="period"
              :label="period"
              :value="period"
            />
          </el-select>
          <div class="form-tip">格式: YYYYQX(季度) 或 YYYYMXX(月度)</div>
        </el-form-item>

        <!-- 考勤信息 -->
        <el-divider content-position="left">考勤信息</el-divider>

        <el-form-item label="考勤起止日期" prop="startEndTime">
          <el-input
            v-model="formData.startEndTime"
            placeholder="自动生成"
            style="width: 100%"
            disabled
          />
          <div class="form-tip">根据期间自动计算，不可修改</div>
        </el-form-item>

        <el-form-item label="应出勤时长(小时)" prop="workTime">
          <el-input-number
            v-model="formData.workTime"
            :min="0"
            :max="5000"
            :step="1"
            :precision="0"
            style="width: 100%"
            disabled
          />
          <div class="form-tip">根据期间自动计算（排除周末，每天按8小时计）</div>
        </el-form-item>

        <el-form-item label="实际出勤时长(小时)" prop="realWorkTime">
          <el-input-number
            v-model="formData.realWorkTime"
            :min="0"
            :max="5000"
            :step="1"
            :precision="0"
            style="width: 100%"
          />
          <div class="form-tip">请输入员工实际出勤时长（小时）</div>
        </el-form-item>

        <!-- 三维评分 -->
        <el-divider content-position="left">三维评分</el-divider>

        <el-form-item label="岗位评分" prop="positionScore">
          <el-input-number
            v-model="formData.positionScore"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="2"
            style="width: 100%"
          />
          <div class="form-tip">范围: 0-100 (百分制)</div>
        </el-form-item>

        <el-form-item label="绩效评分" prop="performanceScore">
          <el-input-number
            v-model="formData.performanceScore"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="2"
            style="width: 100%"
          />
          <div class="form-tip">范围: 0-100 (百分制)</div>
        </el-form-item>

        <el-form-item label="利润贡献度(评分)" prop="profitContribution">
          <el-input-number
            v-model="formData.profitContribution"
            :min="-100"
            :max="100"
            :step="0.1"
            :precision="2"
            style="width: 100%"
          />
          <div class="form-tip">范围: -100至100 (评分制)</div>
        </el-form-item>

        <el-form-item label="评价意见">
          <el-input
            v-model="formData.comments"
            type="textarea"
            :rows="3"
            placeholder="请输入评价意见"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入绩效记录"
      width="600px"
    >
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处,或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx/.xls 格式文件
          </div>
          <div class="el-upload__tip">
            <el-link type="primary" @click="downloadTemplate">下载导入模板</el-link>
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleImportSubmit">
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 期间选择弹窗 -->
    <el-dialog
      v-model="showPeriodDialog"
      title="选择绩效期间"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="绩效期间">
          <el-select v-model="selectedPeriod" placeholder="选择期间" style="width: 100%">
            <el-option
              v-for="period in availablePeriods"
              :key="period"
              :label="period"
              :value="period"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPeriodDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDownload">确认下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Upload, UploadFilled, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import {
  getPerformanceRecords,
  createPerformanceRecord,
  updatePerformanceRecord,
  deletePerformanceRecord,
  batchImportPerformanceRecords,
  downloadPerformanceTemplate
} from '@/api/performance'
import { getEmployees } from '@/api/employee'

// 数据定义
const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<any[]>([])
const employees = ref<any[]>([])
const employeeLoading = ref(false)
const ratingOptions = ref<any[]>([])
const importFile = ref<File | null>(null)
const showPeriodDialog = ref(false)
const selectedPeriod = ref('')
const availablePeriods = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  employeeName: '',
  period: '',
  rating: ''
})

const formData = reactive({
  id: '',
  employeeId: '',
  period: '',
  startEndTime: '',
  workTime: 0,
  realWorkTime: 0,
  positionScore: 0,
  performanceScore: 0,
  profitContribution: 0,
  comments: ''
})

const formRules: FormRules = {
  employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  period: [
    { required: true, message: '请输入考核期间', trigger: 'blur' },
    { pattern: /^\d{4}[QM]\d{1,2}$/, message: '格式不正确', trigger: 'blur' }
  ],
  positionScore: [
    { required: true, message: '请输入岗位评分', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '范围: 0-100', trigger: 'blur' }
  ],
  performanceScore: [
    { required: true, message: '请输入绩效评分', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '范围: 0-100', trigger: 'blur' }
  ],
  profitContribution: [
    { required: true, message: '请输入利润贡献度', trigger: 'blur' },
    { type: 'number', min: -100, max: 100, message: '范围: -100至100', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => formData.id ? '编辑绩效记录' : '新增绩效记录')

// 获取绩效记录列表
const fetchRecords = async () => {
  try {
    loading.value = true
    const response = await getPerformanceRecords(queryParams)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error: any) {
    console.error('获取绩效记录失败:', error)
    ElMessage.error(error.response?.data?.message || '获取绩效记录失败')
  } finally {
    loading.value = false
  }
}

// 获取员工列表（初始加载）
const fetchEmployees = async () => {
  try {
    const response = await getEmployees({ page: 1, pageSize: 50, status: 1 })
    employees.value = response.data?.list || []
  } catch (error) {
    console.error('获取员工列表失败:', error)
  }
}

// 搜索员工（远程搜索）
const searchEmployees = async (query: string) => {
  if (!query) {
    // 如果清空搜索，加载默认员工列表
    fetchEmployees()
    return
  }

  try {
    employeeLoading.value = true
    const response = await getEmployees({
      search: query,
      page: 1,
      pageSize: 50,
      status: 1
    })
    employees.value = response.data.data?.list || []
  } catch (error) {
    console.error('搜索员工失败:', error)
  } finally {
    employeeLoading.value = false
  }
}

// 获取绩效评级选项
const fetchRatingOptions = () => {
  // 三维评分模式不需要评级选项
  ratingOptions.value = []
}

// 获取评级标签类型
const getRatingType = (rating: string) => {
  const typeMap: Record<string, string> = {
    S: 'danger',
    A: 'success',
    B: '',
    C: 'warning',
    D: 'info'
  }
  return typeMap[rating] || ''
}

// 新增
const handleCreate = () => {
  const periods = generatePeriods()
  availablePeriods.value = periods

  Object.assign(formData, {
    id: '',
    employeeId: '',
    period: '',
    startEndTime: '',
    workTime: 0,
    realWorkTime: 0,
    positionScore: 0,
    performanceScore: 0,
    profitContribution: 0,
    comments: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  const periods = generatePeriods()
  availablePeriods.value = periods
  Object.assign(formData, {
    id: row.id,
    employeeId: row.employee_id,
    period: row.calculation_period,
    startEndTime: row.start_end_time || '',
    workTime: parseInt(row.work_time) || 0,
    realWorkTime: parseInt(row.real_work_time) || 0,
    positionScore: parseFloat(row.position_score) || 0,
    performanceScore: parseFloat(row.performance_score) || 0,
    profitContribution: parseFloat(row.profit_contribution) || 0,
    comments: row.comments || ''
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条绩效记录吗?删除后无法恢复!',
      '确认删除',
      { type: 'warning' }
    )

    await deletePerformanceRecord(row.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitting.value = true
      if (formData.id) {
        await updatePerformanceRecord(formData.id, formData as any)
        ElMessage.success('更新成功')
      } else {
        await createPerformanceRecord(formData as any)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchRecords()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 重置查询
const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    pageSize: 20,
    employeeName: '',
    period: '',
    rating: ''
  })
  fetchRecords()
}

// 批量导入
const handleBatchImport = () => {
  importFile.value = null
  importDialogVisible.value = true
}

// 文件选择
const handleFileChange = (file: any) => {
  importFile.value = file.raw
}
const generatePeriods = () => {
  // 生成最近8个季度的期间列表 + 全年统计选项
  const periods = []
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

  // 添加全年统计选项（最近3年）- 格式: '2025' 而不是 '2025年度'
  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    periods.push(`${year}`)
  }

  // 添加季度选项
  for (let i = 0; i < 8; i++) {
    let year = currentYear
    let quarter = currentQuarter - i

    while (quarter <= 0) {
      year--
      quarter += 4
    }

    periods.push(`${year}Q${quarter}`)
  }
  return periods
}

// 根据期间计算考勤信息
const calculateAttendanceInfo = (period: string) => {
  if (!period) {
    return { startEndTime: '', workDays: 0 }
  }

  let startDate: Date, endDate: Date

  try {
    // 判断是否为全年统计
    if (period.includes('年度')) {
      // 旧格式: 2025年度（兼容）
      const match = period.match(/(\d{4})年度/)
      if (!match) {
        return { startEndTime: '', workDays: 0 }
      }

      const year = parseInt(match[1])
      startDate = new Date(year, 0, 1)  // 1月1日
      endDate = new Date(year, 11, 31)  // 12月31日
    } else if (/^\d{4}$/.test(period)) {
      // 新格式: 2025（纯数字年份）
      const year = parseInt(period)
      startDate = new Date(year, 0, 1)  // 1月1日
      endDate = new Date(year, 11, 31)  // 12月31日
    } else if (period.includes('Q')) {
      // 季度格式: 2025Q1
      const match = period.match(/(\d{4})Q(\d)/)
      if (!match) {
        return { startEndTime: '', workDays: 0 }
      }

      const year = parseInt(match[1])
      const quarterNum = parseInt(match[2])

      // 计算季度的起始月份
      const startMonth = (quarterNum - 1) * 3 + 1
      const endMonth = startMonth + 2

      startDate = new Date(year, startMonth - 1, 1)
      endDate = new Date(year, endMonth, 0)
    } else if (period.includes('M')) {
      // 月份格式: 2025M02
      const match = period.match(/(\d{4})M(\d{2})/)
      if (!match) {
        return { startEndTime: '', workDays: 0 }
      }

      const year = parseInt(match[1])
      const month = parseInt(match[2])

      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0)
    } else {
      return { startEndTime: '', workDays: 0 }
    }

    // 格式化日期为 YYYY/MM/DD
    const formatDate = (date: Date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}/${m}/${d}`
    }

    const startEndTime = `${formatDate(startDate)}-${formatDate(endDate)}`

    // 计算应出勤天数（排除周末）
    let workDays = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      // 0=周日, 6=周六
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { startEndTime, workDays }
  } catch (error) {
    console.error('计算考勤信息失败:', error)
    return { startEndTime: '', workDays: 0 }
  }
}

// 期间变化时自动计算考勤信息
const handlePeriodChange = (period: string) => {
  const { startEndTime, workDays } = calculateAttendanceInfo(period)
  formData.startEndTime = startEndTime
  // 将天数转换为小时（每天 × 8小时）
  formData.workTime = workDays * 8
}
// 下载模板 - 显示期间选择弹窗
const downloadTemplate = () => {
  // 生成最近8个季度的期间列表
  const periods = generatePeriods()

  availablePeriods.value = periods
  selectedPeriod.value = periods[0]
  showPeriodDialog.value = true
}

// 确认下载模板
const confirmDownload = async () => {
  showPeriodDialog.value = false
  try {
    const response = await downloadPerformanceTemplate(selectedPeriod.value)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `performance_records_template_${selectedPeriod.value}_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error: any) {
    ElMessage.error(error.message || '模板下载失败')
  }
}

// 导入提交
const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  try {
    importing.value = true

    // 读取Excel文件
    const data = await importFile.value.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // 解析数据(跳过表头) - 三维评分模式
    // 列：员工ID, 员工姓名, 工号, 部门, 岗位, 业务线, 考核期间, 考勤起止日期, 应出勤时长(小时), 实际出勤时长(小时), 岗位评分, 绩效评分, 利润贡献, 备注
    const records = jsonData.slice(1).map((row: any) => ({
      employeeId: row[0],
      employeeName: row[1],
      period: row[6],
      workTime: parseFloat(row[8]) || 0,  // 应出勤时长(小时)
      realWorkTime: parseFloat(row[9]) || 0,  // 实际出勤时长(小时)
      positionScore: parseFloat(row[10]) || 0,
      performanceScore: parseFloat(row[11]) || 0,
      profitContribution: parseFloat(row[12]) || 0,
      comments: row[13] || ''
    })).filter((r: any) => r.employeeId && r.period)

    if (records.length === 0) {
      ElMessage.warning('文件中没有有效数据')
      return
    }

    // 调用导入接口
    const response = await batchImportPerformanceRecords({ records: records as any }) as any

    if (response.code === 200) {
      const result = response.data
      ElMessage.success(`导入完成! 成功: ${result.success}, 失败: ${result.failed}`)

      if (result.errors && result.errors.length > 0) {
        console.log('导入错误:', result.errors)
      }

      importDialogVisible.value = false
      fetchRecords()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 初始化
onMounted(() => {
  fetchRecords()
  fetchEmployees()
  fetchRatingOptions()
})
</script>

<style scoped lang="scss">
.performance-record-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .upload-demo {
    text-align: center;
  }
}
</style>
