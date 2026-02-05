<template>
  <div class="city-management">
          <!-- 页面头部 -->
    <div class="page-header flex flex-between">
      <h2>城市管理</h2>
     <PermissionButton :permissions="['admin','*']" type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增城市
          </PermissionButton>
    </div>
    <el-card>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="城市名称">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入城市名称" 
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table 
        :data="cityList" 
        v-loading="loading"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="城市名称" width="150" />
        <el-table-column prop="province" label="省份" width="150" />
        <el-table-column prop="coefficient" label="城市系数" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteCity(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 城市编辑/创建对话框 -->
      <el-dialog 
        :title="dialogTitle" 
        v-model="dialogVisible" 
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form 
          :model="cityForm" 
          :rules="formRules" 
          ref="cityFormRef"
          label-width="100px"
        >
          <el-form-item label="城市名称" prop="name">
            <el-input 
              v-model="cityForm.name" 
              placeholder="请输入城市名称"
              :disabled="!!cityForm.id"
            />
          </el-form-item>
          <el-form-item label="省份" prop="province">
            <el-input v-model="cityForm.province" placeholder="请输入省份" />
          </el-form-item>
          <el-form-item label="城市系数" prop="coefficient">
            <el-input-number 
              v-model="cityForm.coefficient" 
              :min="0" 
              :max="10" 
              :step="0.01"
              :precision="2"
              placeholder="请输入城市系数"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input 
              v-model="cityForm.description" 
              type="textarea"
              :rows="3"
              placeholder="请输入城市描述"
            />
          </el-form-item>
          <el-form-item label="状态" prop="isActive">
            <el-switch
              v-model="cityForm.isActive"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { 
  getCities, 
  createCity, 
  updateCity, 
  deleteCity as deleteCityApi,
  getCity 
} from '@/api/city'
import { formatDate } from '@/utils/format'
import PermissionButton from '@/components/PermissionButton.vue'
// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const cityFormRef = ref()

// 表格数据
const cityList = ref([])
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 城市表单
const cityForm = reactive({
  id: undefined,
  name: '',
  province: '',
  coefficient: 1.0,
  description: '',
  isActive: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入城市名称', trigger: 'blur' },
    { min: 1, max: 50, message: '城市名称长度应在1-50个字符之间', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请输入省份', trigger: 'blur' },
    { min: 1, max: 50, message: '省份长度应在1-50个字符之间', trigger: 'blur' }
  ],
  coefficient: [
    { required: true, message: '请输入城市系数', trigger: 'blur' },
    { 
      validator: (rule: any, value: number, callback: Function) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入城市系数'))
        } else if (value < 0 || value > 10) {
          callback(new Error('城市系数应在0-10之间'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 获取城市列表
const fetchCityList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      search: searchForm.name || undefined
    }
    const response = await getCities(params)
    cityList.value = response.data.list || response.data.items || []
    pagination.total = response.data.total || response.data.count || 0
  } catch (error) {
    console.error('获取城市列表失败:', error)
    ElMessage.error('获取城市列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCityList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  pagination.page = 1
  fetchCityList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.page = 1
  pagination.size = size
  fetchCityList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchCityList()
}

// 打开创建对话框
const openCreateDialog = () => {
  dialogTitle.value = '新增城市'
  Object.assign(cityForm, {
    id: undefined,
    name: '',
    province: '',
    coefficient: 1.0,
    description: '',
    isActive: true
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = async (row: any) => {
  try {
    const response = await getCity(row.id)
    if (response.data) {
      Object.assign(cityForm, response.data)
      dialogTitle.value = '编辑城市'
      dialogVisible.value = true
    } else {
      ElMessage.error('获取城市信息失败')
    }
  } catch (error) {
    console.error('获取城市信息失败:', error)
    ElMessage.error('获取城市信息失败')
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await cityFormRef.value.validate()
    
    let response
    if (cityForm.id) {
      // 更新城市
      response = await updateCity(cityForm.id, cityForm)
    } else {
      // 创建城市
      response = await createCity(cityForm)
    }
    
    if (response.data) {
      ElMessage.success(response.data.message || (cityForm.id ? '更新成功' : '创建成功'))
      dialogVisible.value = false
      fetchCityList()
    } else {
      ElMessage.error(response.data?.message || (cityForm.id ? '更新失败' : '创建失败'))
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('提交失败')
    }
  }
}

// 删除城市
const deleteCity = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个城市吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteCityApi(String(id))
    if (response.data) {
      ElMessage.success(response.data.message || '删除成功')
      fetchCityList()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchCityList()
})
</script>

<style scoped>
.city-management {
  padding: 20px;
  position: relative;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 24px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>