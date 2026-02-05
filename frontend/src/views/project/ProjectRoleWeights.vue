<template>
  <div class="project-role-weights">
    <div class="page-header">
      <h2>项目角色权重配置</h2>
      <div class="header-actions">
        <el-button
          v-if="canUpdateWeights"
          type="primary"
          @click="saveWeights"
          :loading="saving"
          :disabled="!selectedProjectId"
        >
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
        <el-button
          v-if="canUpdateWeights"
          @click="resetToDefault"
          :disabled="!selectedProjectId"
        >
          <el-icon><Refresh /></el-icon>
          重置默认
        </el-button>
        <el-tag v-if="!canUpdateWeights" type="info">只读模式</el-tag>
      </div>
    </div>

    <!-- 项目选择区域 -->
    <div class="project-selector">
      <el-form inline>
        <el-form-item label="选择项目">
          <el-select
            v-model="selectedProjectId"
            placeholder="请选择要配置的项目"
            style="width: 300px"
            filterable
            clearable
            @change="loadProjectWeights"
          >
            <el-option
              v-for="project in validProjects"
              :key="project.id || project._id"
              :label="project.name + ' (' + project.code + ')'"
              :value="project.id || project._id"
            >
              <div class="project-option">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-desc">{{ project.description }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template v-if="selectedProjectId">
      <!-- 权重配置面板 -->
      <div class="weights-panel" :key="weightsRefreshKey">
        <div class="panel-header">
          <h3>角色权重配置</h3>
          <div class="panel-actions flex gap-8">
            <el-button size="small" @click="showTemplateDialog">
              <el-icon><Collection /></el-icon>
              权重模板
            </el-button>
            <div class="weight-summary">
              <span>总权重比例: </span>
              <el-tag :type="getTotalWeightType()">{{ getTotalWeight().toFixed(1) }}</el-tag>
            </div>
          </div>
        </div>

        <div class="weights-content">
          <div class="weights-grid">
            <div
              v-for="role in validRoles"
              :key="role.id"
              class="weight-item"
            >
              <div class="role-header">
                <div class="role-info">
                  <h4 class="role-name">{{ role.name }}</h4>
                  <p class="role-desc">{{ role.description }}</p>
                </div>
                <div class="role-weight-display">
                  <span class="weight-value">{{ (weights[resolveRoleKey(role)] || 1).toFixed(1) }}</span>
                </div>
              </div>

              <div class="weight-controls">
                <el-slider
                  v-model="weights[resolveRoleKey(role)]"
                  :min="0.1"
                  :max="5.0"
                  :step="0.1"
                  :disabled="!canUpdateWeights"
                  show-stops
                  style="margin: 10px 0;"
                  @change="updateWeight(resolveRoleKey(role), $event)"
                />

                <div class="weight-input-group">
                  <el-input-number
                    v-model="weights[resolveRoleKey(role)]"
                    :min="0.1"
                    :max="5.0"
                    :precision="1"
                    :step="0.1"
                    :disabled="!canUpdateWeights"
                    size="small"
                    style="width: 100px"
                    @change="updateWeight(resolveRoleKey(role), $event)"
                  />
                  <el-button
                    v-if="canUpdateWeights"
                    size="small"
                    text
                    @click="resetRoleWeight(resolveRoleKey(role))"
                  >
                    重置
                  </el-button>
                </div>
              </div>

              <div class="weight-info">
                <div class="weight-level">
                  <el-tag :type="getWeightLevelType(weights[resolveRoleKey(role)])" size="small">
                    {{ getWeightLevelLabel(weights[resolveRoleKey(role)]) }}
                  </el-tag>
                </div>
                <div class="weight-percentage">
                  占比: {{ getWeightPercentage(resolveRoleKey(role)) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览面板 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h3>角色权重参与奖金分配计算模拟</h3>
          <div class="preview-controls">
            <el-input-number
              v-model="previewAmount"
              :min="1000"
              :max="1000000"
              :step="1000"
              placeholder="项目奖金总额"
              style="width: 150px"
              @change="updatePreview"
            >
              <template #prepend>总额</template>
              <template #append>元</template>
            </el-input-number>
          </div>
        </div>

        <div class="preview-content">
          <vxe-table
            :data="previewData"
            stripe
            border
            height="300"
          >
            <vxe-column field="roleName" title="角色名称" width="150" />
            <vxe-column field="weight" title="权重系数" width="100">
              <template #default="{ row }">
                {{ row.weight.toFixed(1) }}
              </template>
            </vxe-column>
            <vxe-column field="percentage" title="权重占比" width="100">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </vxe-column>
            <vxe-column field="baseAmount" title="基础奖金" width="120">
              <template #default="{ row }">
                <span class="amount">{{ formatCurrency(row.baseAmount) }}</span>
              </template>
            </vxe-column>
            <vxe-column field="description" title="权重说明" show-overflow="tooltip" />
          </vxe-table>
        </div>
      </div>
    </template>

    <!-- 权重模板对话框 -->
    <el-dialog
      v-model="templateListDialogVisible"
      title="权重模板管理"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="templates-dialog-content">
        <div class="template-dialog-header flex-between mb-20">
          <div class="template-info">
            <span class="text-secondary">共 {{ weightTemplates.length }} 个模板</span>
          </div>
          <el-button
            v-if="canUpdateWeights"
            type="primary"
            size="small"
            @click="saveAsTemplate"
            :disabled="!selectedProjectId"
          >
            <el-icon><Plus /></el-icon>
            当前配置保存为模板
          </el-button>
        </div>

        <el-row :gutter="20">
          <el-col :span="12" v-for="template in weightTemplates" :key="template.id" class="mb-20">
            <div class="template-card" :class="{ disabled: !canUpdateWeights }">
              <div class="template-header">
                <h4>{{ template.name }}</h4>
                <div class="template-actions">
                  <el-tag size="small">{{ template.type }}</el-tag>
                  <div class="action-buttons" v-if="!template.is_system">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click.stop="editTemplate(template)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click.stop="deleteTemplate(template)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              <div 
                class="template-body"
                @click="canUpdateWeights && applyTemplateFromDialog(template)"
              >
                <div class="template-weights">
                  <div
                    v-for="(weight, roleCode) in template.weights"
                    :key="roleCode"
                    class="template-weight-item"
                  >
                    <span class="role">{{ getRoleNameByCode(roleCode) }}</span>
                    <span class="weight">{{ weight.toFixed(1) }}</span>
                  </div>
                </div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-empty v-if="weightTemplates.length === 0" description="暂无模板" />
      </div>

      <template #footer>
        <el-button @click="templateListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 保存/编辑模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="isEditMode ? '编辑权重模板' : '保存权重模板'"
      width="500px"
    >
      <el-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateFormRules"
        label-width="80px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input
            v-model="templateForm.name"
            placeholder="请输入模板名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="模板类型" prop="type">
          <el-select v-model="templateForm.type" placeholder="请选择模板类型">
            <el-option label="技术团队" value="tech_team" />
            <el-option label="产品团队" value="product_team" />
            <el-option label="综合团队" value="mixed_team" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述此模板的适用场景"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTemplate" :loading="saving">
            保存模板
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Refresh, Edit, Delete, Plus, Collection } from '@element-plus/icons-vue'
import { projectBonusApi, projectMemberApi } from '@/api/projectMember'
import { projectApi } from '@/api/project'
import { formatCurrency } from '@/utils/format'
import { useUserStore } from '@/store/modules/user'
import { getRoleWeightTemplates, applyTemplateToProject, createRoleWeightTemplate, updateRoleWeightTemplate, deleteRoleWeightTemplate } from '@/api/roleWeightTemplate'

// 数据定义
const loading = ref(false)
const saving = ref(false)
const selectedProjectId = ref('')
const myProjects = ref([])
const projectRoles = ref([])
const weights = reactive({})
const previewAmount = ref(100000)
const weightsRefreshKey = ref(0) // 用于强制刷新权重组件

// 用户权限管理
const userStore = useUserStore()

// 权限计算属性
const canViewWeights = computed(() => {
  return userStore.hasAnyPermission([
    'project:weights:view_own',
    'project:weights:view_all',
    'project:*',
    '*'
  ])
})

const canUpdateWeights = computed(() => {
  return userStore.hasAnyPermission([
    'project:weights:update_own',
    'project:weights:update_all',
    'project:*',
    '*'
  ])
})

const canUpdateAllWeights = computed(() => {
  return userStore.hasAnyPermission([
    'project:weights:update_all',
    'project:*',
    '*'
  ])
})

const canApproveWeights = computed(() => {
  return userStore.hasAnyPermission([
    'project:weights:approve',
    'project:*',
    '*'
  ])
})

// 计算属性：确保数据有效性
const validProjects = computed(() => {
  return myProjects.value.filter(project => project && (project.id || project._id))
})

const validRoles = computed(() => {
  return projectRoles.value.filter(role => role && role.id)
})

// 预览数据
const previewData = computed(() => {
  if (!validRoles.value.length) return []

  const totalWeight = getTotalWeight()
  return validRoles.value.map(role => {
    const weight = weights[resolveRoleKey(role)] || 1
    const percentage = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : '0.0'
    const baseAmount = totalWeight > 0 ? (previewAmount.value * weight / totalWeight) : 0

    return {
      roleName: role.name,
      weight,
      percentage,
      baseAmount,
      description: getWeightDescription(weight)
    }
  })
})

// 模板相关
const templateListDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const templateFormRef = ref()
const templateForm = reactive({
  id: '',
  name: '',
  type: 'tech_team', // 设置默认值
  description: '',
  weights: {}
})
const isEditMode = ref(false)

const templateFormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ]
}

const weightTemplates = ref([])

// 方法定义
const getTotalWeight = () => {
  return Object.values(weights).reduce((sum, weight) => sum + (weight || 0), 0)
}

const getTotalWeightType = () => {
  const total = getTotalWeight()
  if (total < 5) return 'warning'
  if (total > 15) return 'danger'
  return 'success'
}

const getWeightLevelType = (weight) => {
  if (weight >= 3.0) return 'danger'
  if (weight >= 2.0) return 'warning'
  if (weight >= 1.5) return 'success'
  return 'info'
}

const getWeightLevelLabel = (weight) => {
  if (weight >= 3.0) return '核心'
  if (weight >= 2.0) return '重要'
  if (weight >= 1.5) return '一般'
  return '辅助'
}

const getWeightPercentage = (roleKey) => {
  const weight = weights[roleKey] || 0
  const total = getTotalWeight()
  return total > 0 ? ((weight / total) * 100).toFixed(1) : '0.0'
}

const getWeightDescription = (weight) => {
  if (weight >= 3.0) return '核心角色，承担主要责任和风险'
  if (weight >= 2.5) return '高级角色，具有重要影响力'
  if (weight >= 2.0) return '重要角色，承担关键任务'
  if (weight >= 1.5) return '一般角色，参与日常工作'
  return '辅助角色，提供支持服务'
}

const getRoleNameByCode = (roleCode) => {
  const role = projectRoles.value.find(r => r.code === roleCode)
  return role ? role.name : roleCode
}

// 统一角色键：优先 code，其次 roleCode，最后 _id
const resolveRoleKey = (role) => {
  if (!role) return ''
  return role.code || role.roleCode || role.id || ''
}

// 数据加载
const loadMyProjects = async () => {
  try {
    console.log('🔄 正在加载项目列表...')
    
    // 检查是否是超级管理员
    const isAdmin = userStore.hasAnyPermission(['*', 'admin', 'project:weights:update_all'])
    
    let response
    if (isAdmin) {
      // 超级管理员获取所有项目
      console.log('✅ 超级管理员，获取所有项目')
      response = await projectApi.getProjects({ pageSize: 1000 })
    } else {
      // 普通用户只获取自己管理的项目
      console.log('✅ 普通用户，获取我管理的项目')
      response = await projectApi.getProjects({ pageSize: 1000, manager: true })
    }
    
    console.log('📊 项目API响应:', response)

    // 处理后端返回的数据结构
    let projects = []
    if (response && response.data) {
      // 新格式：{ code: 200, data: { list: [...], page, pageSize, total } }
      if (response.data.list && Array.isArray(response.data.list)) {
        projects = response.data.list
        console.log('✅ 使用 response.data.list，项目数:', projects.length)
      }
      // 兼容旧格式：{ code: 200, data: { projects: [...] } }
      else if (response.data.projects && Array.isArray(response.data.projects)) {
        projects = response.data.projects
        console.log('✅ 使用 response.data.projects，项目数:', projects.length)
      }
      // 直接数组格式：{ data: [...] }
      else if (Array.isArray(response.data)) {
        projects = response.data
        console.log('✅ 使用 response.data，项目数:', projects.length)
      }
    }
    
    // 过滤有效项目并设置到组件状态（同时兼容 id 和 _id）
    myProjects.value = projects.filter(project => project && (project.id || project._id))
    console.log('✅ 项目加载成功:', myProjects.value.length, '个项目')
    console.log('👀 第一个项目:', myProjects.value[0])
    
    if (myProjects.value.length === 0) {
      console.warn('⚠️ 没有找到可用的项目')
      ElMessage.warning('没有找到可管理的项目，请联系管理员')
    }
  } catch (error) {
    console.error('❌ 加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败: ' + (error.response?.data?.message || error.message))
    myProjects.value = []
  }
}

const loadProjectRoles = async () => {
  try {
    console.log('🔄 正在加载项目角色列表...')
    const response = await projectMemberApi.getProjectRoles()
    console.log('📊project角色API响应:', response)
    
    // 确保数据是数组并且每个角色都有有效的 _id
    if (response && response.data && Array.isArray(response.data)) {
      projectRoles.value = response.data.filter(role => role && role.id)
    } else {
      console.warn('⚠️ API返回的角色数据格式不正确:', response)
      projectRoles.value = []
    }

    // 初始化权重（使用唯一键，避免 code 缺失导致联动）
    projectRoles.value.forEach(role => {
      const key = resolveRoleKey(role)
      if (!weights[key]) {
        weights[key] = getDefaultWeight(role.code)
      }
    })
    console.log('✅ 项目角色权重初始化完成')
  } catch (error) {
    console.error('❌ 加载项目角色失败:', error)
    ElMessage.error('加载项目角色失败: ' + (error.response?.data?.message || error.message))
    projectRoles.value = []
  }
}

// 加载权重模板
const loadWeightTemplates = async () => {
  try {
    console.log('🔄 正在加载权重模板...')
    const response = await getRoleWeightTemplates({ isActive: 1 })
    console.log('📊 权重模板API响应:', response)
    
    if (response && response.data) {
      weightTemplates.value = Array.isArray(response.data) ? response.data : []
      console.log('✅ 权重模板加载成功:', weightTemplates.value.length, '个模板')
    } else {
      console.warn('⚠️ 没有可用的权重模板')
      weightTemplates.value = []
    }
  } catch (error) {
    console.error('❌ 加载权重模板失败:', error)
    // 加载失败不影响主功能，只给警告
    ElMessage.warning('加载权重模板失败，请稍后重试')
    weightTemplates.value = []
  }
}

const loadProjectWeights = async () => {
  if (!selectedProjectId.value) return

  try {
    const response = await projectBonusApi.getRoleWeights(selectedProjectId.value)
    // console.log('📊 项目角色权重API响应:', response)
    // 兼容响应格式：可能是 { code, data: { success, data } } 或 { code, data }
    const payload = response?.data.data
    const serverData = payload && 'data' in payload ? payload.data : payload
    const serverWeights = serverData && serverData.data ? serverData.data : serverData
    console.log('📊 项目角色权重API响应:', serverWeights)
    if (serverWeights && typeof serverWeights === 'object') {
      // 清空现有权重，然后按界面的唯一键赋值，避免重复键和联动
      Object.keys(weights).forEach(k => delete weights[k])
      console.log(projectRoles)
      projectRoles.value.forEach(role => {
        const key = resolveRoleKey(role)
        const val = serverWeights[role.code]
        weights[key] = typeof val === 'number' ? val : getDefaultWeight(role.code)
      })
    } else {
      // 使用默认权重
      resetToDefault()
    }
  } catch (error) {
    ElMessage.error('加载权重配置失败: ' + error.message)
    resetToDefault()
  }
}

const getDefaultWeight = (roleCode) => {
  const defaultWeights = {
    'tech_lead': 3.0,
    'senior_dev': 2.5,
    'developer': 2.0,
    'junior_dev': 1.5,
    'tester': 1.8,
    'product_mgr': 2.2,
    'ui_designer': 1.8,
    'devops': 2.0
  }
  return defaultWeights[roleCode] || 1.0
}

// 操作方法
const updateWeight = (roleKey, value) => {
  const num = typeof value === 'number' ? value : parseFloat(value)
  weights[roleKey] = !isNaN(num) ? num : 0
  updatePreview()
}

const resetRoleWeight = (roleKey) => {
  const role = projectRoles.value.find(r => resolveRoleKey(r) === roleKey)
  if (role) {
    weights[roleKey] = getDefaultWeight(role.code)
  }
}

const resetToDefault = () => {
  projectRoles.value.forEach(role => {
    const key = resolveRoleKey(role)
    weights[key] = getDefaultWeight(role.code)
  })
}

const updatePreview = () => {
  // 预览数据会自动更新，这里可以添加其他逻辑
}

const saveWeights = async () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }

  if (!canUpdateWeights.value) {
    ElMessage.warning('您没有权限修改项目角色权重配置')
    return
  }

  try {
    saving.value = true
    // 规范化为数值并仅发送角色代码键（跳过缺失 code 的角色）
    const normalized = {}
    projectRoles.value.forEach(role => {
      const key = resolveRoleKey(role)
      const val = weights[key]
      const num = typeof val === 'number' ? val : parseFloat(val)
      if (role.code && !isNaN(num) && num > 0) {
        normalized[role.code] = num
      }
    })
    await projectBonusApi.setRoleWeights(selectedProjectId.value, { weights: normalized })
    ElMessage.success('权重配置保存成功')
  } catch (error) {
    if (error.response?.status === 403) {
      ElMessage.error('权限不足：您没有权限修改此项目的角色权重配置')
    } else {
      ElMessage.error('保存失败: ' + (error.response?.data?.message || error.message))
    }
  } finally {
    saving.value = false
  }
}

const applyTemplateFromDialog = async (template) => {
  try {
    await applyTemplate(template)
    templateListDialogVisible.value = false
  } catch (error) {
    // 错误已在 applyTemplate 中处理
  }
}

const showTemplateDialog = () => {
  templateListDialogVisible.value = true
}

const applyTemplate = async (template) => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要应用 "${template.name}" 模板吗？这将覆盖当前的权重配置。`,
      '应用模板',
      { type: 'warning' }
    )

    // 调用后端API应用模板
    await applyTemplateToProject({
      templateId: template.id,
      projectId: selectedProjectId.value
    })
    
    // 重新加载项目权重
    await loadProjectWeights()
    
    // 强制刷新权重配置面板
    weightsRefreshKey.value++
    
    // 等待下一个 DOM 更新周期
    await nextTick()
    
    // 触发预览更新
    updatePreview()
    
    ElMessage.success('模板应用成功')

  } catch (error) {
    if (error !== 'cancel') {
      console.error('应用模板失败:', error)
      ElMessage.error('应用模板失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const saveAsTemplate = () => {
  isEditMode.value = false
  templateForm.id = ''
  templateForm.name = ''
  templateForm.type = 'tech_team'
  templateForm.description = ''
  templateForm.weights = {}
  templateDialogVisible.value = true
}

const editTemplate = (template) => {
  isEditMode.value = true
  templateForm.id = template.id
  templateForm.name = template.name
  templateForm.type = template.type
  templateForm.description = template.description || ''
  templateForm.weights = { ...template.weights }
  templateDialogVisible.value = true
}

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？`,
      '删除模板',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteRoleWeightTemplate(template.id)
    ElMessage.success('模板删除成功')
    
    // 重新加载模板列表
    await loadWeightTemplates()

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模板失败:', error)
      ElMessage.error('删除模板失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const submitTemplate = async () => {
  try {
    const valid = await templateFormRef.value.validate()
    if (!valid) return

    // 构建权重对象（只使用角色code作为key）
    const templateWeights = isEditMode.value && Object.keys(templateForm.weights).length > 0
      ? templateForm.weights
      : {}
    
    if (!isEditMode.value) {
      // 新建模式：使用当前项目的权重
      projectRoles.value.forEach(role => {
        if (role.code) {
          const key = resolveRoleKey(role)
          const weight = weights[key]
          if (weight !== undefined) {
            templateWeights[role.code] = weight
          }
        }
      })
    }

    saving.value = true
    
    if (isEditMode.value) {
      // 编辑模式
      await updateRoleWeightTemplate(templateForm.id, {
        name: templateForm.name,
        type: templateForm.type,
        description: templateForm.description,
        weights: templateWeights
      })
      ElMessage.success('模板更新成功')
    } else {
      // 新建模式
      await createRoleWeightTemplate({
        name: templateForm.name,
        type: templateForm.type,
        description: templateForm.description,
        weights: templateWeights
      })
      ElMessage.success('模板保存成功')
    }
    
    templateDialogVisible.value = false
    
    // 重新加载模板列表
    await loadWeightTemplates()

  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// 生命周期
onMounted(async () => {
  try {
    console.log('🚀 页面加载开始...')
    await Promise.all([
      loadProjectRoles(),
      loadMyProjects(),
      loadWeightTemplates()
    ])
    console.log('✅ 页面加载完成')
  } catch (error) {
    console.error('❌ 页面加载失败:', error)
    // 即使加载失败，也不阻止页面渲染
  }
})
</script>

<style scoped>
.project-role-weights {
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

.project-selector {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.project-option .project-name {
  font-weight: 500;
}

.project-option .project-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.weights-panel,
.preview-panel,
.templates-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
}

.weight-summary {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.weights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.weight-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.weight-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.role-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #303133;
}

.role-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.role-weight-display {
  text-align: right;
}

.weight-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.weight-input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.weight-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
}

.weight-percentage {
  color: #909399;
}

.preview-controls {
  display: flex;
  align-items: center;
}

.amount {
  color: #67c23a;
  font-weight: 500;
}

.templates-content {
  margin-top: 16px;
}

.template-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.template-header h4 {
  margin: 0;
  color: #303133;
}

.template-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.template-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.template-weights {
  flex: 1;
  margin-bottom: 12px;
}

.template-weight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.template-weight-item .role {
  color: #606266;
}

.template-weight-item .weight {
  color: #409eff;
  font-weight: 500;
}

.template-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.template-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.template-card.disabled:hover {
  border-color: #ebeef5;
  box-shadow: none;
}
</style>