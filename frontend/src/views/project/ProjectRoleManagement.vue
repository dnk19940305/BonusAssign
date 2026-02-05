<template>
  <div class="project-role-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>项目角色管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 200px">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchRoles">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="roleList" 
        v-loading="loading"
        stripe
      >
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色代码" width="150" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="defaultWeight" label="默认权重" width="100">
          <template #default="{ row }">
            {{ row.defaultWeight }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              :type="row.status === 1 ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这个角色吗？"
              @confirm="deleteRole(row._id)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="roleFormRef" 
        :model="roleForm" 
        :rules="roleFormRules" 
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input 
            v-model="roleForm.name" 
            placeholder="请输入角色名称"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input 
            v-model="roleForm.code" 
            placeholder="请输入角色代码"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="默认权重" prop="defaultWeight">
          <el-input-number 
            v-model="roleForm.defaultWeight" 
            :min="0.1"
            :max="5.0"
            :step="0.1"
            style="width: 100%"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="roleForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getProjectRoles, createProjectRole, updateProjectRole, deleteProjectRole as deleteRoleAPI } from '@/api/projectRoles'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)

// 角色列表
const roleList = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  status: undefined
})

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('create') // 'create' 或 'edit'
const dialogTitle = ref('新增角色')

// 表单
const roleFormRef = ref()
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  defaultWeight: 1.0,
  status: 1
})

// 表单验证规则
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 加载角色列表
const loadRoles = async () => {
  loading.value = true
  try {
    const response = await getProjectRoles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status
    })
    
    if (response && response.code === 200) {
      roleList.value = response.data || []
      pagination.total = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response?.message || '获取角色列表失败')
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 搜索角色
const searchRoles = () => {
  pagination.page = 1
  loadRoles()
}

// 重置搜索
const resetSearch = () => {
  searchForm.status = undefined
  pagination.page = 1
  loadRoles()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadRoles()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadRoles()
}

// 显示创建对话框
const showCreateDialog = () => {
  dialogType.value = 'create'
  dialogTitle.value = '新增角色'
  
  // 重置表单
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    defaultWeight: 1.0,
    status: 1
  })
  
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (role) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑角色'
  
  // 填充表单
  Object.assign(roleForm, {
    _id: role._id || role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    defaultWeight: role.defaultWeight,
    status: role.status
  })
  
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    submitting.value = true
    
    if (dialogType.value === 'create') {
      // 创建角色
      const response = await createProjectRole(roleForm)
      if (response && response.code === 200) {
        ElMessage.success('角色创建成功')
        dialogVisible.value = false
        loadRoles()
      } else {
        throw new Error(response?.message || '创建角色失败')
      }
    } else {
      // 更新角色
      const response = await updateProjectRole(roleForm._id, roleForm)
      if (response && response.code === 200) {
        ElMessage.success('角色更新成功')
        dialogVisible.value = false
        loadRoles()
      } else {
        throw new Error(response?.message || '更新角色失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(dialogType.value === 'create' ? '创建角色失败:' : '更新角色失败:', error)
      ElMessage.error((dialogType.value === 'create' ? '创建' : '更新') + '角色失败: ' + (error.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

// 删除角色
const deleteRole = async (id) => {
  try {
    const response = await deleteRoleAPI(id)
    if (response && response.code === 200) {
      ElMessage.success('角色删除成功')
      loadRoles()
    } else {
      throw new Error(response?.message || '删除角色失败')
    }
  } catch (error) {
    console.error('删除角色失败:', error)
    ElMessage.error('删除角色失败: ' + (error.message || '未知错误'))
  }
}

// 切换角色状态
const toggleStatus = async (role) => {
  try {
    const newStatus = role.status === 1 ? 0 : 1
    const response = await updateProjectRole(role._id || role.id, {
      status: newStatus
    })
    
    if (response && response.code === 200) {
      ElMessage.success(`角色已${newStatus === 1 ? '启用' : '禁用'}`)
      loadRoles()
    } else {
      throw new Error(response?.message || '更新角色状态失败')
    }
  } catch (error) {
    console.error('更新角色状态失败:', error)
    ElMessage.error('更新角色状态失败: ' + (error.message || '未知错误'))
  }
}

// 页面加载时初始化数据
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.project-role-management {
  padding: 20px;
  position: relative;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card .pagination {
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