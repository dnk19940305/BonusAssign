<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button 
            v-if="userStore.hasAnyPermission(['role:create', 'admin', '*'])"
            type="primary" 
            @click="showCreateDialog"
          >
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.search"
              placeholder="角色名称/描述"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作 -->
      <div 
        class="batch-actions" 
        v-show="selectedRoles.length > 0 && userStore.hasAnyPermission(['role:update', 'admin', '*'])"
      >
        <el-button 
          v-if="userStore.hasAnyPermission(['role:update', 'admin', '*'])"
          type="success" 
          @click="batchEnable"
        >
          批量启用
        </el-button>
        <el-button 
          v-if="userStore.hasAnyPermission(['role:update', 'admin', '*'])"
          type="warning" 
          @click="batchDisable"
        >
          批量禁用
        </el-button>
        <span class="selected-count">已选择 {{ selectedRoles.length }} 项</span>
      </div>

      <!-- 角色表格 -->
      <el-table
        :data="roleList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" width="200" />
        <el-table-column prop="userCount" label="用户数量" width="100" />
        <el-table-column prop="permissions" label="权限" min-width="300">
          <template #default="{ row }">
            <div class="permissions-container">
              <el-tag
                v-for="permission in row.permissionNames.slice(0, 3)"
                :key="permission"
                size="small"
                class="permission-tag"
              >
                {{ permission }}
              </el-tag>
              <el-tag
                v-if="row.permissionNames.length > 3"
                size="small"
                type="info"
                class="permission-tag"
              >
                +{{ row.permissionNames.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="userStore.hasAnyPermission(['role:update', 'admin', '*'])"
              type="primary" 
              size="small" 
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button type="info" size="small" @click="showPermissionDialog(row)">
              权限详情
            </el-button>
            <el-button
              v-if="userStore.hasAnyPermission(['admin', '*'])"
              type="primary"
              size="small"
              @click="showMenuDialog(row)"
            >
              菜单配置
            </el-button>
            <el-button 
              v-if="userStore.hasAnyPermission(['role:delete', 'admin', '*'])"
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
              :disabled="[1, 2, 3].includes(row.id)"
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
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchRoleList"
          @current-change="fetchRoleList"
        />
      </div>
    </el-card>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialog.visible"
      :title="roleDialog.mode === 'create' ? '新增角色' : '编辑角色'"
      width="800px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="权限配置" prop="permissions">
          <div class="permission-groups">
            <div
              v-for="permissionGroup in permissions"
              :key="permissionGroup.group"
              class="permission-group"
            >
              <div class="group-title">
                <el-checkbox
                  :indeterminate="isGroupIndeterminate(permissionGroup)"
                  :model-value="isGroupChecked(permissionGroup)"
                  @change="handleGroupChange(permissionGroup, $event)"
                >
                  {{ permissionGroup.groupName }}
                </el-checkbox>
              </div>
              <div class="group-permissions">
                <el-checkbox
                  v-for="permission in permissionGroup.permissions"
                  :key="permission.key"
                  :label="permission.name"
                  :model-value="roleForm.permissions.includes(permission.key)"
                  @change="handlePermissionChange(permission.key, $event)"
                />
              </div>
            </div>
          </div>
        </el-form-item>
        <!-- 菜单权限操作已迁移为表格中的独立“菜单配置”按钮 -->
        <el-form-item label="状态" prop="status" v-if="roleDialog.mode === 'edit'">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit" :loading="roleDialog.loading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 菜单分配对话框 -->
    <el-dialog v-model="menuDialog.visible" title="角色菜单分配" width="720px">
      <div style="min-height:300px;">
        <el-spin v-if="menuDialog.loading" />
          <el-tree
          v-else
          ref="menuTreeRef"
          :data="menuTree"
          node-key="id"
          :props="menuTreeProps"
          show-checkbox
          default-expand-all
          :check-strictly="true"
          v-model:checked-keys="menuCheckedKeys"
        >
          <template #default="{ node, data }">
            <span>{{ data ? (data.menuName || data.menu_name || '') : '' }}</span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <el-button @click="menuDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="menuDialog.loading" @click="handleSaveMenus">保存</el-button>
      </template>
    </el-dialog>

    <!-- 角色创建时的菜单选择已移除；菜单通过表格的“菜单配置”按钮单独管理 -->

    <!-- 权限详情对话框 -->
    <el-dialog v-model="permissionDialog.visible" title="权限详情" width="600px">
      <div class="permission-detail">
        <div
          v-for="(permissions, group) in currentRoleGroupedPermissions"
          :key="group"
          class="permission-group-detail"
        >
          <h4 class="group-title-detail">{{ getGroupName(String(group)) }}</h4>
          <div class="group-permissions-detail">
            <el-tag
              v-for="permission in permissions"
              :key="permission.key"
              type="info"
              class="permission-tag-detail"
            >
              {{ permission.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList, createRole, updateRole, deleteRole, batchOperateRoles, getPermissions } from '@/api/role'
import { getMenuTree, getRoleMenuIds, assignMenusToRole } from '@/api/menu'
import { useUserStore } from '@/store/modules/user'

// 权限控制
const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  search: '',
  status: undefined
})

// 角色列表
const roleList = ref<any[]>([])
const loading = ref(false)
const selectedRoles = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 权限数据
const permissions = ref<any[]>([])

// 角色对话框
const roleDialog = reactive({
  visible: false,
  mode: 'create' as 'create' | 'edit',
  loading: false,
  roleId: 0
})

const roleForm = reactive({
  name: '',
  description: '',
  permissions: [] as string[],
  status: 1
})

const roleFormRef = ref<FormInstance>()

// 权限详情对话框
const permissionDialog = reactive({
  visible: false
})

// 菜单分配对话框
const menuDialog = reactive({
  visible: false,
  roleId: null as null | string,
  loading: false
})

const menuTree = ref<any[]>([])
const menuTreeRef = ref()
const menuCheckedKeys = ref<string[]>([])
const menuTreeProps = { children: 'children', label: 'menuName' }

// 角色创建时菜单选择已移除，相关状态已删除

// 归一化菜单项以兼容后端字段命名（snake_case / camelCase）
const normalizeMenuNode = (menu: any) => {
  return {
    id: menu.id || menu.ID || menu.menu_id || menu.menuId || String(menu.id),
    parentId: menu.parent_id ?? menu.parentId ?? null,
    menuName: menu.menuName || menu.menu_name || menu.name || '',
    menuPath: menu.menuPath || menu.menu_path || menu.path || '',
    component: menu.component || menu.componentName || '',
    menuType: menu.menuType || menu.menu_type || 'menu',
    visible: menu.visible === undefined ? (menu.visible === 0 ? 0 : (menu.visible === 1 ? 1 : true)) : menu.visible,
    status: menu.status,
    perms: menu.perms || menu.permissions || null,
    remark: menu.remark || null,
    children: Array.isArray(menu.children) ? menu.children.map(normalizeMenuNode) : []
  }
}

const normalizeMenuList = (menus: any[]) => {
  if (!Array.isArray(menus)) return []
  return menus.map(normalizeMenuNode)
}

const currentRolePermissions = ref<any[]>([])

// 组名映射
const groupNameMap: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  employee: '员工管理',
  department: '部门管理',
  position: '岗位管理',
  position_encyclopedia: '岗位大全',
  business_line: '业务线管理',
  calculation: '奖金计算',
  simulation: '模拟分析',
  project: '项目管理',
  project_member: '项目成员',
  collaboration: '项目协作',
  team: '团队管理',
  member: '成员管理',
  bonus: '奖金管理',
  bonus_pool: '奖金池管理',
  finance: '财务管理',
  report: '报表管理',
  system: '系统配置',
  notification: '通知管理',
  'bonus-pool': '奖金池管理',
  performance: '绩效管理',
  '*': '超级权限'
}

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  permissions: [
    { required: true, message: '请选择权限', trigger: 'change', type: 'array', min: 1 }
  ]
}

// 计算当前角色权限的分组
const currentRoleGroupedPermissions = computed(() => {
  if (!currentRolePermissions.value.length) return {}
  
  return currentRolePermissions.value.reduce((groups: any, permission: any) => {
    const group = permission.group
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(permission)
    return groups
  }, {})
})

// 获取用户列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getRoleList(params)
    roleList.value = res.data.roles
    pagination.total = res.data.pagination.total
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取权限列表
const fetchPermissions = async () => {
  try {
    const res = await getPermissions()
    // 将后端返回的分组权限数据转换为前端期望的格式
    const groupedPermissions = res.data.groupedPermissions
    const permissionsArray = []
    
    for (const [groupKey, permissions] of Object.entries(groupedPermissions)) {
      permissionsArray.push({
        group: groupKey,
        groupName: groupNameMap[groupKey] || groupKey,
        permissions: permissions
      })
    }
    
    permissions.value = permissionsArray as any[]
    console.log('权限数据:', permissions.value)
  } catch (error) {
    console.error('获取权限列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRoleList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    status: undefined
  })
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRoles.value = selection as any[]
}

// 批量启用
const batchEnable = async () => {
  try {
    await batchOperateRoles({
      action: 'enable',
      roleIds: selectedRoles.value.map((role:any) => role.id)
    })
    ElMessage.success('批量启用成功')
    fetchRoleList()
  } catch (error) {
    ElMessage.error('批量启用失败')
  }
}

// 批量禁用
const batchDisable = async () => {
  try {
    await batchOperateRoles({
      action: 'disable',
      roleIds: selectedRoles.value.map((role:any) => role.id)
    })
    ElMessage.success('批量禁用成功')
    fetchRoleList()
  } catch (error) {
    ElMessage.error('批量禁用失败')
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  roleDialog.mode = 'create'
  roleDialog.visible = true
  resetRoleForm()
}

// 显示编辑对话框
const showEditDialog = (row: any) => {
  roleDialog.mode = 'edit'
  roleDialog.visible = true
  roleDialog.roleId = row.id
  Object.assign(roleForm, {
    name: row.name,
    description: row.description,
    permissions: [...row.permissions],
    status: row.status
  })
}

// 显示权限详情对话框
const showPermissionDialog = (row: any) => {
  // 从所有权限组中提取权限并过滤
  const allPermissions = permissions.value.flatMap((group:any) => group.permissions)
  currentRolePermissions.value = allPermissions.filter((permission: any) =>
    row.permissions.includes(permission.key)
  )
  permissionDialog.visible = true
}

// 显示菜单分配对话框
const showMenuDialog = async (row: any) => {
  menuDialog.roleId = row.id
  menuDialog.visible = true
  await loadMenuTreeForRole(row.id)
}

const loadMenuTreeForRole = async (roleId: string) => {
  try {
    menuDialog.loading = true
    // 获取所有菜单树（用于展示）
    const res = await getMenuTree()
    let payload = res && res.data ? res.data : res
    if (payload && payload.success !== undefined && payload.data !== undefined) payload = payload.data
    // 归一化菜单树，确保每个节点含有 `id` 和 `menuName`
    menuTree.value = normalizeMenuList(Array.isArray(payload) ? payload : [])

    // 获取该角色已分配的菜单ID并确保为字符串类型，匹配 tree 的 node-key
    const idsRes = await getRoleMenuIds(roleId)
    let idsPayload = idsRes && idsRes.data ? idsRes.data : idsRes
    if (idsPayload && idsPayload.success !== undefined && idsPayload.data !== undefined) idsPayload = idsPayload.data
    const idsArray = Array.isArray(idsPayload) ? idsPayload.map((x:any) => String(x)) : []
    menuCheckedKeys.value = idsArray
    // 等待 tree 渲染完成后强制设置已选中项，兼容 element-plus 回显问题
    await nextTick()
    try {
      if (menuTreeRef.value && typeof menuTreeRef.value.setCheckedKeys === 'function') {
        menuTreeRef.value.setCheckedKeys(idsArray)
      }
    } catch (e) {
      // ignore
    }
    // 额外一次延迟设置，兼容渲染时序问题
    setTimeout(() => {
      try {
        if (menuTreeRef.value && typeof menuTreeRef.value.setCheckedKeys === 'function') {
          menuTreeRef.value.setCheckedKeys(idsArray)
        }
        // 调试：打印实际被选中的键
        // eslint-disable-next-line no-console
        console.debug('[RoleManagement] tree.getCheckedKeys after set:', menuTreeRef.value && typeof menuTreeRef.value.getCheckedKeys === 'function' ? menuTreeRef.value.getCheckedKeys() : null)
      } catch (err) {
        // ignore
      }
    }, 80)
  } catch (error) {
    ElMessage.error('加载菜单数据失败')
  } finally {
    menuDialog.loading = false
  }
}

const handleSaveMenus = async () => {
  if (!menuDialog.roleId) return
  try {
    menuDialog.loading = true
    // 获取选中的键（使用ref的方式）
    let checked: string[] = []
    try {
      if (menuTreeRef.value && typeof menuTreeRef.value.getCheckedKeys === 'function') {
        checked = menuTreeRef.value.getCheckedKeys()
      } else {
        checked = menuCheckedKeys.value
      }
    } catch (e) {
      checked = menuCheckedKeys.value
    }

    await assignMenusToRole(menuDialog.roleId, checked)
    ElMessage.success('保存成功')
    menuDialog.visible = false
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    menuDialog.loading = false
  }
}

// 角色创建时菜单选择的函数已移除；请使用表格的“菜单配置”入口进行分配

// 重置角色表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    name: '',
    description: '',
    permissions: [],
    
  })
  roleFormRef.value?.clearValidate()
}

// 提交角色表单
const handleRoleSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    roleDialog.loading = true

    // 准备提交数据，根据模式决定传递的字段
    if (roleDialog.mode === 'create') {
      // 创建角色时只提交角色基本信息与权限，菜单通过单独界面分配
      const submitData = {
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions
      }
      await createRole(submitData)
      ElMessage.success('角色创建成功')
    } else {
      // 更新角色时只传递角色相关字段，菜单权限通过单独接口更新
      const submitData = {
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        status: roleForm.status
      }
      await updateRole(roleDialog.roleId, submitData)
      ElMessage.success('角色更新成功')
    }

    roleDialog.visible = false
    resetRoleForm()
    fetchRoleList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(roleDialog.mode === 'create' ? '角色创建失败' : '角色更新失败')
    }
  } finally {
    roleDialog.loading = false
  }
}

// 删除角色
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteRole(row.id)
    ElMessage.success('角色删除成功')
    fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('角色删除失败')
    }
  }
}

// 权限组操作
const isGroupChecked = (permissionGroup: any) => {
  if (!permissionGroup.permissions || permissionGroup.permissions.length === 0) {
    return false
  }
  return permissionGroup.permissions.every((permission: any) => 
    roleForm.permissions.includes(permission.key)
  )
}

const isGroupIndeterminate = (permissionGroup: any) => {
  if (!permissionGroup.permissions || permissionGroup.permissions.length === 0) {
    return false
  }
  const checkedCount = permissionGroup.permissions.filter((permission: any) => 
    roleForm.permissions.includes(permission.key)
  ).length
  return checkedCount > 0 && checkedCount < permissionGroup.permissions.length
}

const handleGroupChange = (permissionGroup: any, checked: boolean) => {
  if (!permissionGroup.permissions) return
  
  if (checked) {
    // 添加组内所有权限
    permissionGroup.permissions.forEach((permission: any) => {
      if (!roleForm.permissions.includes(permission.key)) {
        roleForm.permissions.push(permission.key)
      }
    })
  } else {
    // 移除组内所有权限
    permissionGroup.permissions.forEach((permission: any) => {
      const index = roleForm.permissions.indexOf(permission.key)
      if (index > -1) {
        roleForm.permissions.splice(index, 1)
      }
    })
  }
}

const handlePermissionChange = (permissionKey: string, checked: boolean) => {
  if (checked) {
    if (!roleForm.permissions.includes(permissionKey)) {
      roleForm.permissions.push(permissionKey)
    }
  } else {
    const index = roleForm.permissions.indexOf(permissionKey)
    if (index > -1) {
      roleForm.permissions.splice(index, 1)
    }
  }
}

// 获取组名
const getGroupName = (group: string) => {
  return groupNameMap[group] || group
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRoleList()
  fetchPermissions()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.batch-actions {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-count {
  color: #909399;
  font-size: 14px;
  margin-left: 10px;
}

.permissions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.permission-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.permission-groups {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.permission-group {
  margin-bottom: 20px;
}

.permission-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.group-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: 20px;
}

.permission-detail {
  max-height: 500px;
  overflow-y: auto;
}

.permission-group-detail {
  margin-bottom: 20px;
}

.group-title-detail {
  color: #303133;
  margin-bottom: 10px;
  font-size: 16px;
}

.group-permissions-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag-detail {
  margin-bottom: 5px;
}
</style>