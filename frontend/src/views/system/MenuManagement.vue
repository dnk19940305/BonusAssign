<template>
  <div class="menu-management">
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="panel">
          <div class="panel-header">
            <span>菜单树</span>
            <div>
              <PermissionButton :permissions="['admin','*']" size="small" type="primary" @click="openAdd(null)">新增根节点</PermissionButton>
              <el-button size="small" @click="loadTree">刷新</el-button>
            </div>
          </div>

          <el-tree
            :data="treeData"
            node-key="id"
            :props="defaultProps"
            highlight-current
            default-expand-all
            @node-click="onNodeClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ data ? data.menuName : '' }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="panel">
          <div class="panel-header">
            <span>详情</span>
            <div>
              <PermissionButton :permissions="['admin','*']" size="small" type="primary" @click="openAdd(selectedNode)">新增子节点</PermissionButton>
              <PermissionButton :permissions="['admin','*']" size="small" type="warning" @click="openEdit(selectedNode)" :disabled="!selectedNode">编辑</PermissionButton>
              <PermissionButton :permissions="['admin','*']" size="small" type="danger" @click="confirmDelete(selectedNode)" :disabled="!selectedNode">删除</PermissionButton>
            </div>
          </div>

          <div v-if="!selectedNode" class="empty">请选择左侧节点查看或操作</div>

          <div v-else class="detail">
            <el-form :model="selectedNode" label-width="120px">
              <el-form-item label="名称">
                <span>{{ selectedNode.menuName }}</span>
              </el-form-item>
              <el-form-item label="路径">
                <span>{{ selectedNode.menuPath || '-' }}</span>
              </el-form-item>
              <el-form-item label="组件">
                <span>{{ selectedNode.component || '-' }}</span>
              </el-form-item>
              <el-form-item label="类型">
                <span>{{ selectedNode.menuType }}</span>
              </el-form-item>
              <el-form-item label="可见">
                <el-switch v-model="selectedNode.visible" disabled />
              </el-form-item>
              <el-form-item label="在菜单显示">
                <el-switch v-model="selectedNode.metaShowInMenu" disabled />
              </el-form-item>
              <el-form-item label="备注">
                <span>{{ selectedNode.remark || '-' }}</span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" @close="dialogVisible = false">
      <el-form :model="form" ref="formRef" label-width="120px">
        <el-form-item label="名称" :required="true">
          <el-input v-model="form.menuName" />
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="form.menuPath" placeholder="例如 /system/menus" />
        </el-form-item>
        <el-form-item label="组件">
          <el-input v-model="form.component" placeholder="例如 system/MenuManagement" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.menuType" placeholder="请选择">
            <el-option label="目录" value="directory" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见">
          <el-switch v-model="form.visible" />
        </el-form-item>
        <el-form-item label="在菜单显示">
          <el-switch v-model="form.metaShowInMenu" />
        </el-form-item>
        <el-form-item label="权限 (逗号分隔)">
          <el-input v-model="form.perms" placeholder="例如 menu:view,admin" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <PermissionButton :permissions="['admin','*']" type="primary" @click="submitForm">保存</PermissionButton>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { Menu } from '@/api/menu'
import { usePermissionStore } from '@/store/modules/permission'
import PermissionButton from '@/components/PermissionButton.vue'

interface MenuNode {
  id: string
  parentId?: string | null
  menuName: string
  menuPath?: string | null
  component?: string | null
  menuType?: string
  visible?: boolean
  metaShowInMenu?: boolean
  status?: boolean
  perms?: string | null
  remark?: string | null
  children?: MenuNode[]
}

const treeData = ref<MenuNode[]>([])
const defaultProps = { children: 'children', label: 'menuName' }
const selectedNode = ref<MenuNode | null>(null)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)
const formRef = ref()
const form = reactive<any>({
  id: '',
  parentId: null,
  menuName: '',
  menuPath: '',
  component: '',
  menuType: 'menu',
  visible: true,
  metaShowInMenu: true,
  perms: '',
  remark: ''
})

const permissionStore = usePermissionStore()

const normalizeMenu = (menu: any): MenuNode => {
  const isVisible = menu.visible === 0 ? false : (menu.visible === 1 ? true : (menu.visible === undefined ? true : !!menu.visible));
  const isMetaShowInMenu = (menu.meta_show_in_menu === 0 || menu.metaShowInMenu === 0) ? false : ((menu.meta_show_in_menu === 1 || menu.metaShowInMenu === 1) ? true : (menu.metaShowInMenu === undefined ? true : !!menu.metaShowInMenu));

  return {
    id: menu.id || menu.ID || menu.id,
    parentId: menu.parent_id ?? menu.parentId ?? menu.parentId ?? null,
    menuName: menu.menuName || menu.menu_name || menu.name || '',
    menuPath: menu.menuPath || menu.menu_path || menu.path || '',
    component: menu.component || menu.componentName || '',
    menuType: menu.menuType || menu.menu_type || 'menu',
    visible: isVisible,
    metaShowInMenu: isMetaShowInMenu,
    status: menu.status === 0 ? false : (menu.status === 1 ? true : !!menu.status),
    perms: menu.perms || menu.permissions || null,
    remark: menu.remark || null,
    children: Array.isArray(menu.children) ? menu.children.map(normalizeMenu) : []
  }
}

const normalizeMenus = (menus: any[]): MenuNode[] => {
  if (!Array.isArray(menus)) return []
  return menus.map(normalizeMenu)
}

const loadTree = async () => {
  try {
    const res = await getMenuTree()
    let payload: any = res
    if (res && (res as any).data) {
      payload = (res as any).data
    }
    // 处理嵌套格式 { data: { data: [...] } }
    if (payload && payload.data) {
      payload = payload.data
    }

    const normalized = normalizeMenus(payload as unknown as any[]) || []
    // 调试输出
    // eslint-disable-next-line no-console
    console.debug('[MenuManagement] loadTree payload:', payload)
    // eslint-disable-next-line no-console
    console.debug('[MenuManagement] normalized tree:', normalized)
    treeData.value = normalized
  } catch (e) {
    ElMessage.error('加载菜单树失败')
  }
}

const onNodeClick = (data: MenuNode) => {
  // 解除与树数据的引用，避免直接修改树节点
  selectedNode.value = data ? JSON.parse(JSON.stringify(data)) : null
}

const openAdd = (parent: MenuNode | null) => {
  isEditing.value = false
  dialogTitle.value = parent ? `新增子节点 - ${parent.menuName}` : '新增根节点'
  form.id = ''
  form.parentId = parent ? parent.id : null
  form.menuName = ''
  form.menuPath = ''
  form.component = ''
  form.menuType = 'menu'
  form.visible = true
  form.metaShowInMenu = true
  form.perms = ''
  form.remark = ''
  dialogVisible.value = true
}

const openEdit = (node: MenuNode | null) => {
  if (!node) return
  isEditing.value = true
  dialogTitle.value = `编辑 - ${node.menuName}`
  form.id = node.id
  form.parentId = node.parentId || null
  form.menuName = node.menuName
  form.menuPath = node.menuPath || ''
  form.component = node.component || ''
  form.menuType = node.menuType || 'menu'
  form.visible = node.visible !== undefined ? node.visible : true
  form.metaShowInMenu = node.metaShowInMenu !== undefined ? node.metaShowInMenu : true
  form.perms = node.perms || ''
  form.remark = node.remark || ''
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (!form.menuName) {
      ElMessage.warning('请输入名称')
      return
    }
    const payload = {
      parentId: form.parentId,
      menuName: form.menuName,
      menuPath: form.menuPath || null,
      component: form.component || null,
      menuType: form.menuType as any,
      visible: !!form.visible,
      metaShowInMenu: form.metaShowInMenu,
      perms: form.perms || null,
      remark: form.remark || null
    } as Partial<Menu>
    if (isEditing.value && form.id) {
      await updateMenu(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createMenu(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadTree()
    // 刷新权限路由缓存并注入最新菜单
    try { await permissionStore.generateRoutes() } catch (e) { /* ignore */ }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const confirmDelete = async (node: MenuNode | null) => {
  if (!node) return
  try {
    await ElMessageBox.confirm(`确认删除 ${node.menuName} 及其子节点吗？`, '提示', { type: 'warning' })
    await deleteMenu(node.id)
    ElMessage.success('删除成功')
    selectedNode.value = null
    await loadTree()
    try { await permissionStore.generateRoutes() } catch (e) { /* ignore */ }
  } catch (e) {
    // 取消或失败
  }
}

onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.menu-management {
  padding: 8px;
}
.panel {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  min-height: 320px;
}
.panel-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.empty { padding: 40px; color: #888 }
.detail { padding: 8px }
</style>
