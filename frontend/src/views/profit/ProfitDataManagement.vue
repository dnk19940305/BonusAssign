<template>
  <div class="profit-data-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>业务线利润数据管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增利润数据
            </el-button>
            <el-button type="success" @click="handleImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item label="业务线">
          <el-select
            v-model="queryParams.businessLineId"
            clearable
            placeholder="请选择业务线"
            style="width: 200px"
          >
            <el-option
              v-for="line in businessLines"
              :key="line.id"
              :label="line.name"
              :value="line.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="期间">
          <el-input
            v-model="queryParams.period"
            placeholder="如: 2025Q4"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="数据来源">
          <el-select v-model="queryParams.dataSource" clearable placeholder="全部" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="手工录入" value="manual" />
            <el-option label="批量导入" value="import" />
            <el-option label="系统集成" value="integration" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchData">
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
        <el-table-column prop="period" label="期间" width="100" />
        <el-table-column prop="BusinessLine.name" label="业务线" width="150">
          <template #default="{ row }">
            {{ row.BusinessLine?.name || '公司总体' }}
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="总收入(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ parseFloat(row.revenue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="总成本(万元)" width="130" align="right">
          <template #default="{ row }">
            {{ parseFloat(row.cost || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="利润(万元)" width="130" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.profit >= 0 ? '#67C23A' : '#F56C6C' }">
              {{ parseFloat(row.profit || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="profitMargin" label="利润率" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.profitMargin >= 0 ? '#67C23A' : '#F56C6C' }">
              {{ row.profitMargin ? (row.profitMargin * 100).toFixed(2) + '%' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据来源" width="100">
          <template #default="{ row }">
            <el-tag :type="getSourceType(row.dataSource)" size="small">
              {{ getSourceLabel(row.dataSource) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
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
          @size-change="fetchData"
          @current-change="fetchData"
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
        <el-form-item label="期间" prop="period">
          <el-select
            v-model="formData.period"
            placeholder="请选择期间"
            :disabled="!!formData.id"
            style="width: 100%"
          >
            <el-option
              v-for="period in availablePeriods"
              :key="period"
              :label="period"
              :value="period"
            />
          </el-select>
          <div class="form-tip">格式: YYYYQX(季度) 或 YYYY-MM(月度)</div>
        </el-form-item>

        <el-form-item label="业务线" prop="businessLineId">
          <el-select
            v-model="formData.businessLineId"
            placeholder="请选择业务线（空为公司总体）"
            clearable
            style="width: 100%"
            :disabled="!!formData.id"
          >
            <el-option
              v-for="line in businessLines"
              :key="line.id"
              :label="line.name"
              :value="line.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="总收入" prop="revenue">
          <el-input-number
            v-model="formData.revenue"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
            placeholder="单位: 万元"
          />
          <div class="form-tip">单位: 万元</div>
        </el-form-item>

        <el-form-item label="总成本" prop="cost">
          <el-input-number
            v-model="formData.cost"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
            placeholder="单位: 万元"
          />
          <div class="form-tip">单位: 万元</div>
        </el-form-item>

        <el-form-item label="利润">
          <el-input
            :model-value="calculatedProfit"
            disabled
            style="width: 100%"
          />
          <div class="form-tip">自动计算 = 总收入 - 总成本</div>
        </el-form-item>

        <el-form-item label="数据来源" prop="dataSource">
          <el-select v-model="formData.dataSource" style="width: 100%">
            <el-option label="手工录入" value="manual" />
            <el-option label="批量导入" value="import" />
            <el-option label="系统集成" value="integration" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
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
      title="批量导入利润数据"
      width="600px"
    >
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div>Excel格式: 期间 | 业务线ID | 总收入 | 总成本 | 数据来源 | 备注</div>
        <div>示例: 2025Q4 | PRODUCT | 1000.00 | 600.00 | manual | 第四季度数据</div>
      </el-alert>

      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx/.xls 格式文件
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Upload, UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import {
  getProfitDataList,
  createProfitData,
  updateProfitData,
  deleteProfitData,
  batchImportProfitData
} from '@/api/profit'
import { getBusinessLines } from '@/api/businessLine'

// 数据定义
const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const total = ref(0)
const tableData = ref<any[]>([])
const businessLines = ref<any[]>([])
const importFile = ref<File | null>(null)
const availablePeriods = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  businessLineId: '',
  period: '',
  dataSource: ''
})

const formData = reactive({
  id: '',
  period: '',
  businessLineId: '',
  revenue: 0,
  cost: 0,
  dataSource: 'manual',
  remarks: ''
})

const formRules: FormRules = {
  period: [
    { required: true, message: '请输入期间', trigger: 'blur' },
    { pattern: /^\d{4}[Q-]\d{1,2}$/, message: '格式不正确', trigger: 'blur' }
  ],
  revenue: [
    { required: true, message: '请输入总收入', trigger: 'blur' }
  ],
  cost: [
    { required: true, message: '请输入总成本', trigger: 'blur' }
  ],
  dataSource: [
    { required: true, message: '请选择数据来源', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => formData.id ? '编辑利润数据' : '新增利润数据')

const calculatedProfit = computed(() => {
  const profit = (formData.revenue || 0) - (formData.cost || 0)
  return profit.toFixed(2) + ' 万元'
})

// 生成期间选项（最近12个季度）
const generatePeriods = () => {
  const periods: string[] = []
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  
  // 生成季度
  for (let i = 0; i < 12; i++) {
    let year = currentYear
    let quarter = currentQuarter - i
    
    while (quarter <= 0) {
      year--
      quarter += 4
    }
    
    periods.push(`${year}Q${quarter}`)
  }
  
  // 生成月度（最近12个月）
  const currentMonth = new Date().getMonth() + 1
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    periods.push(`${y}-${m}`)
  }
  
  availablePeriods.value = periods
}

// 获取数据列表
const fetchData = async () => {
  try {
    loading.value = true
    const response = await getProfitDataList(queryParams)
    console.log('🐞 完整响应:', response)
    console.log('🐞 response.data:', response.data)
    console.log('🐞 response.data.data:', response.data?.data)
    
    // axios拦截器已经返回了 responseData，所以这里 response 就是 { code, data, message }
    tableData.value = response.data.list || []
    total.value = response.data.total || 0
    console.log('✅ 表格数据:', tableData.value, '总数:', total.value)
  } catch (error: any) {
    console.error('获取利润数据失败:', error)
    ElMessage.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 获取业务线列表
const fetchBusinessLines = async () => {
  try {
    const response: any = await getBusinessLines({ page: 1, pageSize: 100 })
    console.log('🐞 业务线数据:', response)
    
    // 处理不同的数据结构
    if (response.data?.data?.list) {
      businessLines.value = response.data.data.list
    } else if (response.data?.list) {
      businessLines.value = response.data.list
    } else if (Array.isArray(response.data?.data)) {
      businessLines.value = response.data.data
    } else if (Array.isArray(response.data)) {
      businessLines.value = response.data
    } else if (response.businessLines) {
      businessLines.value = response.businessLines
    } else {
      businessLines.value = []
      console.warn('⚠️ 未知的业务线数据结构:', response)
    }
    
    console.log('✅ 业务线列表:', businessLines.value)
  } catch (error) {
    console.error('获取业务线列表失败:', error)
    businessLines.value = []
  }
}

// 数据来源类型
const getSourceType = (source: string) => {
  const map: Record<string, string> = {
    manual: '',
    import: 'success',
    integration: 'warning'
  }
  return map[source] || ''
}

const getSourceLabel = (source: string) => {
  const map: Record<string, string> = {
    manual: '手工录入',
    import: '批量导入',
    integration: '系统集成'
  }
  return map[source] || source
}

// 新增
const handleCreate = () => {
  Object.assign(formData, {
    id: '',
    period: '',
    businessLineId: '',
    revenue: 0,
    cost: 0,
    dataSource: 'manual',
    remarks: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  Object.assign(formData, {
    id: row.id,
    period: row.period,
    businessLineId: row.businessLineId || '',
    revenue: parseFloat(row.revenue) || 0,
    cost: parseFloat(row.cost) || 0,
    dataSource: row.dataSource || 'manual',
    remarks: row.remarks || ''
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条利润数据吗？删除后无法恢复！',
      '确认删除',
      { type: 'warning' }
    )

    await deleteProfitData(row.id)
    ElMessage.success('删除成功')
    fetchData()
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
      const submitData = {
        ...formData,
        businessLineId: formData.businessLineId || null
      }
      
      if (formData.id) {
        await updateProfitData(formData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createProfitData(submitData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchData()
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
    businessLineId: '',
    period: '',
    dataSource: ''
  })
  fetchData()
}

// 批量导入
const handleImport = () => {
  importFile.value = null
  importDialogVisible.value = true
}

// 文件选择
const handleFileChange = (file: any) => {
  importFile.value = file.raw
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
    
    // 解析数据(跳过表头)
    const records = jsonData.slice(1).map((row: any) => ({
      period: row[0],
      businessLineId: row[1] || null,
      revenue: parseFloat(row[2]) || 0,
      cost: parseFloat(row[3]) || 0,
      dataSource: row[4] || 'import',
      remarks: row[5] || ''
    })).filter((r: any) => r.period)

    if (records.length === 0) {
      ElMessage.warning('文件中没有有效数据')
      return
    }

    // 调用导入接口
    const response = await batchImportProfitData({ records })
    
    if (response.data.code === 200) {
      const result = response.data.data
      ElMessage.success(`导入完成！成功: ${result.successCount}, 失败: ${result.errorCount}`)
      
      if (result.errors && result.errors.length > 0) {
        console.log('导入错误:', result.errors)
      }
      
      importDialogVisible.value = false
      fetchData()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 初始化
onMounted(() => {
  generatePeriods()
  fetchData()
  fetchBusinessLines()
})
</script>

<style scoped lang="scss">
.profit-data-management {
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
