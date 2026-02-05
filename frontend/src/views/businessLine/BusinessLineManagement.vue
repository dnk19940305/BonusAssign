<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h2>业务线管理</h2>
      <div class="header-actions flex gap-12">
        <el-button 
          v-if="hasManagementPermission"
          type="primary" 
          @click="showCreateDialog"
        >
          <el-icon><Plus /></el-icon>
          新增业务线
        </el-button>
        <el-button 
          v-if="hasManagementPermission"
          type="primary" 
          @click="showGlobalWeightDialog"
        >
          <el-icon><Setting /></el-icon>
          默认权重设置
        </el-button>
        <el-button 
          v-if="hasManagementPermission"
          type="primary" 
          @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="mb-20">
      <el-form :model="queryForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="queryForm.search"
            placeholder="业务线名称、代码或描述"
            style="width: 200px"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片区域 -->
    <div class="stats-section mb-20">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card stat-card-primary">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.total }}</div>
                <div class="stat-label">业务线总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-card-success">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.active }}</div>
                <div class="stat-label">启用状态</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-card-warning">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalDepartments }}</div>
                <div class="stat-label">关联部门</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card stat-card-info">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalEmployees }}</div>
                <div class="stat-label">关联员工</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 业务线列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="businessLines"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="业务线名称" min-width="150">
          <template #default="{ row }">
            <div class="business-line-name gap-8">
              <span class="name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
         <el-table-column prop="status" label="状态" min-width="150">
          <template #default="{ row }">
            <div class="business-line-name gap-8">
              <el-tag v-if="row.status === 0" type="danger" size="small">已禁用</el-tag>
              <el-tag v-else type="success" size="small">已启用</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="业务线代码" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="Manager" label="负责人" width="120">
          <template #default="{ row }">
            <span v-if="row.Manager">{{ row.Manager.name }}</span>
            <span v-else class="text-muted">未指定</span>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="默认权重" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ formatPercent(row.weight) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="profitTarget" label="利润目标(万元)" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.profitTarget">{{ formatCurrency(row.profitTarget) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="departmentCount" label="部门数" width="80" align="center" />
        <el-table-column prop="employeeCount" label="员工数" width="80" align="center" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button 
              v-if="userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])"
              link 
              type="primary" 
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])"
              link 
              type="warning" 
              @click="showWeightDialog(row)"
            >
              权重配置
            </el-button>
            <el-dropdown 
              v-if="userStore.hasAnyPermission(['business_line:update', 'business_line:delete', 'admin', '*'])"
              @command="handleCommand"
            >
              <el-button link type="primary">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-if="userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])"
                    :command="`${row.status === 1 ? 'disable' : 'enable'}_${row.id}`"
                  >
                    {{ row.status === 1 ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="userStore.hasAnyPermission(['business_line:delete', 'admin', '*'])"
                    :command="`delete_${row.id}`" 
                    class="danger-item"
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper py-20 flex-center">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 批量操作工具栏 -->
    <div 
      v-if="selectedBusinessLines.length > 0 && userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])" 
      class="batch-actions fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white p-24 rounded shadow-md flex-between gap-16 z-1000"
    >
      <el-alert
        :title="`已选择 ${selectedBusinessLines.length} 项`"
        type="info"
        show-icon
        :closable="false"
      />
      <div class="batch-buttons flex gap-8">
        <el-button 
          v-if="userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])"
          @click="handleBatchEnable"
        >
          批量启用
        </el-button>
        <el-button 
          v-if="userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])"
          @click="handleBatchDisable"
        >
          批量禁用
        </el-button>
      </div>
    </div>

    <!-- 业务线详情对话框 -->
    <BusinessLineDetailDialog
      v-model="detailVisible"
      :business-line="currentBusinessLine"
      @edit="handleEditFromDetail"
    />

    <!-- 权重配置对话框 -->
    <project-weight-dialog
      v-model="weightConfigVisible"
      mode="global"
      @success="handleQuery"
    />

    <!-- 业务线表单对话框 -->
    <BusinessLineFormDialog
      v-model="formVisible"
      :business-line="currentBusinessLine"
      :mode="isEdit ? 'edit' : 'create'"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { Plus, Search, Refresh, Delete, View, Edit, Setting, Download, ArrowDown, Grid, CircleCheck, OfficeBuilding, User } from '@element-plus/icons-vue'
import { shouldShowError } from '@/utils/error-handler'
// API导入
import { businessLineApi } from '@/api/businessLine'
import BusinessLineDetailDialog from './components/BusinessLineDetailDialog.vue'
import BusinessLineFormDialog from './components/BusinessLineFormDialog.vue'
import ProjectWeightDialog from '@/views/project/components/ProjectWeightDialog.vue'

// 权限控制
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const businessLines = ref<any[]>([])
const selectedBusinessLines = ref<any[]>([])

// 查询表单
const queryForm = reactive({
  page: 1,
  pageSize: 20,
  search: '',
  status: undefined
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// 统计数据
const statistics = ref({
  total: 0,
  active: 0,
  totalDepartments: 0,
  totalEmployees: 0
})

// 对话框状态
const detailVisible = ref(false)
const formVisible = ref(false)
const weightConfigVisible = ref(false)
const isEdit = ref(false)
const currentBusinessLine = ref<any>(null)
const dialogVisible = ref(false)

// 计算属性
const hasManagementPermission = computed(() => {
  return userStore.hasAnyPermission(['business_line:update', 'admin', 'hr', '*'])
})

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

const formatCurrency = (value: number) => {
  return `¥${value.toLocaleString()}`
}

// 获取业务线列表
const getBusinessLineList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    // 只添加有值的参数
    if (queryForm.search) {
      params.search = queryForm.search
    }
    if (queryForm.status !== undefined && queryForm.status !== null) {
      params.status = queryForm.status
    }
    
    const response = await businessLineApi.getBusinessLines(params)
    
    businessLines.value = response.data.list as any[]
    pagination.total = response.data.total
    pagination.page = response.data.page
    pagination.pageSize = response.data.pageSize
    
    // 更新统计数据
    updateStatistics()
  } catch (error) {
    if (shouldShowError(error as any)) {
      ElMessage.error('获取业务线列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStatistics = () => {
  statistics.value.total = businessLines.value.length
  statistics.value.active = businessLines.value.filter((item:any) => item.status === 1).length
  statistics.value.totalDepartments = businessLines.value.reduce((sum:number, item:any) => sum + (item.departmentCount || 0), 0)
  statistics.value.totalEmployees = businessLines.value.reduce((sum:number, item:any) => sum + (item.employeeCount || 0), 0)
}

// 搜索
const handleQuery = () => {
  pagination.page = 1
  getBusinessLineList()
}

// 重置搜索
const resetQuery = () => {
  queryForm.search = ''
  queryForm.status = undefined
  handleQuery()
}

// 选择变更
const handleSelectionChange = (selection: any[]) => {
  selectedBusinessLines.value = selection as any[]
}

// 显示创建对话框
const showCreateDialog = () => {
  currentBusinessLine.value = null
  isEdit.value = false
  formVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: any) => {
  console.log('showEditDialog', row)
  currentBusinessLine.value = row
  isEdit.value = true
  formVisible.value = true
}

// 从详情页编辑
const handleEditFromDetail = (businessLine: any) => {
  detailVisible.value = false
  showEditDialog(businessLine)
}

// 显示详情对话框
const showDetail = (row: any) => {
  currentBusinessLine.value = row
  detailVisible.value = true
}

// 显示权重配置对话框
const showWeightDialog = (row: any) => {
  currentBusinessLine.value = row
  weightConfigVisible.value = true
}

// 显示全局权重配置
const showGlobalWeightDialog = () => {
  weightConfigVisible.value = true
}

// 处理命令
const handleCommand = async (command: string) => {
  const [action, id] = command.split('_')
  const businessLineId = id
  
  if (action === 'enable' || action === 'disable') {
    await handleToggleStatus(businessLineId, action === 'enable')
  } else if (action === 'delete') {
    await handleDelete(businessLineId)
  }
}

// 切换状态
const handleToggleStatus = async (id: string, enable: boolean) => {
  try {
    await businessLineApi.updateBusinessLine(id, { status: enable ? 1 : 0 })
    ElMessage.success(`${enable ? '启用' : '禁用'}成功`)
    getBusinessLineList()
  } catch (error) {
    if (shouldShowError(error as any)) {
      ElMessage.error(`${enable ? '启用' : '禁用'}失败`)
    }
  }
}

// 删除业务线
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个业务线吗？删除后不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await businessLineApi.deleteBusinessLine(id)
    ElMessage.success('删除成功')
    getBusinessLineList()
  } catch (error) {
    if (error !== 'cancel' && shouldShowError(error as any)) {
      ElMessage.error('删除失败')
    }
  }
}

// 批量启用
const handleBatchEnable = async () => {
  try {
    const ids = selectedBusinessLines.value.map(item => item.id)
    await businessLineApi.batchBusinessLines('enable', ids)
    ElMessage.success('批量启用成功')
    getBusinessLineList()
    selectedBusinessLines.value = []
  } catch (error) {
    if (shouldShowError(error as any)) {
      ElMessage.error('批量启用失败')
    }
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  try {
    const ids = selectedBusinessLines.value.map(item => item.id)
    await businessLineApi.batchBusinessLines('disable', ids)
    ElMessage.success('批量禁用成功')
    getBusinessLineList()
    selectedBusinessLines.value = []
  } catch (error) {
    if (shouldShowError(error as any)) {
      ElMessage.error('批量禁用失败')
    }
  }
}

// 导出数据
const handleExport = async () => {
  try {
    // TODO: 实现导出功能
    ElMessage.info('导出功能开发中...')
  } catch (error) {
    if (shouldShowError(error as any)) {
      ElMessage.error('导出失败')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  getBusinessLineList()
}

// 权重配置成功回调
const handleWeightSuccess = () => {
  getBusinessLineList()
}

// 初始化
onMounted(() => {
  console.log('=== BUSINESS LINE MANAGEMENT onMounted ===')
  getBusinessLineList()
})
</script>

<style lang="scss" scoped>
.stats-section {
  :deep(.stat-card) {
    transition: all 0.3s ease;
    cursor: default;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
    }
    
    .el-card__body {
      padding: 20px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      padding: 0;
      
      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
        
        .el-icon {
          font-size: 32px !important;
          color: #fff !important;
        }
      }
      
      .stat-content {
        flex: 1;
        text-align: left;
        
        .stat-value {
          font-size: 32px !important;
          font-weight: 700 !important;
          line-height: 1.2;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        
        .stat-label {
          font-size: 13px !important;
          color: #909399 !important;
          font-weight: 500;
        }
      }
    }
    
    &.stat-card-primary {
      .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      }
      
      .stat-value {
        color: #667eea !important;
      }
    }
    
    &.stat-card-success {
      .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
      }
      
      .stat-value {
        color: #f5576c !important;
      }
    }
    
    &.stat-card-warning {
      .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
      }
      
      .stat-value {
        color: #4facfe !important;
      }
    }
    
    &.stat-card-info {
      .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
      }
      
      .stat-value {
        color: #43e97b !important;
      }
    }
  }
}

.business-line-name {
  .name {
    font-weight: 500;
  }
}

.text-muted {
  color: #909399;
}

.batch-actions {
  z-index: 1000;
}

:deep(.danger-item) {
  color: #f56c6c !important;
}
</style>