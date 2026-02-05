<template>
  <div class="page-container">
    <!-- 头部 -->
    <div class="page-header flex-between mb-20">
      <h2>里程碑模板管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        创建自定义模板
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <el-card class="mb-20">
      <div class="flex gap-12" style="align-items: center">
        <el-input
          v-model="searchText"
          placeholder="搜索模板名称或描述"
          clearable
          style="width: 300px"
          @change="loadTemplates"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterCategory"
          placeholder="选择分类"
          clearable
          style="width: 150px"
          @change="loadTemplates"
        >
          <el-option label="软件开发" value="software" />
          <el-option label="市场活动" value="marketing" />
          <el-option label="产品研发" value="product" />
          <el-option label="自定义" value="custom" />
        </el-select>

        <el-radio-group v-model="filterType" @change="loadTemplates">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="system">系统模板</el-radio-button>
          <el-radio-button label="custom">我的模板</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 模板卡片列表 -->
    <el-row :gutter="16" v-loading="loading" class="template-grid">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        v-for="template in templates"
        :key="template.id"
        class="mb-20"
      >
        <el-card class="template-card" shadow="hover">
          <!-- 卡片头部 -->
          <template #header>
            <div class="card-header flex-between">
              <span class="template-name">{{ template.name }}</span>
              <el-tag
                :type="template.isSystem ? 'success' : 'info'"
                size="small"
              >
                {{ template.isSystem ? '系统' : '自定义' }}
              </el-tag>
            </div>
          </template>

          <!-- 卡片内容 -->
          <div class="template-content">
            <div class="template-meta">
              <el-icon><Collection /></el-icon>
              <span>{{ getCategoryLabel(template.category) }}</span>
            </div>

            <p class="template-desc">{{ template.description || '暂无描述' }}</p>

            <div class="template-stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ template.templateData?.milestones?.length || 0 }} 个里程碑</span>
              </div>
              <div class="stat-item">
                <el-icon><Star /></el-icon>
                <span>已使用 {{ template.usageCount || 0 }} 次</span>
              </div>
            </div>
          </div>

          <!-- 卡片底部操作 -->
          <template #footer>
            <div class="card-actions flex-between gap-8" style="flex-wrap: wrap">
              <el-button text type="primary" @click="viewTemplate(template)">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button text type="success" @click="showApplyDialog(template)">
                <el-icon><Check /></el-icon>
                应用到项目
              </el-button>
              <el-dropdown v-if="!template.isSystem">
                <el-button text type="info">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editTemplate(template)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteTemplate(template)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <el-empty v-if="!loading && templates.length === 0" description="暂无模板" />

    <!-- 分页 -->
    <div class="flex-center mt-20" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadTemplates"
        @size-change="loadTemplates"
      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="模板详情"
      width="700px"
    >
      <div v-if="currentTemplate" class="template-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">
            {{ currentTemplate.name }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryLabel(currentTemplate.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="currentTemplate.isSystem ? 'success' : 'info'">
              {{ currentTemplate.isSystem ? '系统预设' : '自定义' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="使用次数">
            {{ currentTemplate.usageCount || 0 }} 次
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentTemplate.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        <h3 class="mt-20 mb-10">里程碑列表</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(milestone, index) in currentTemplate.templateData?.milestones || []"
            :key="index"
            :timestamp="`第 ${index + 1} 个里程碑`"
          >
            <el-card>
              <h4>{{ milestone.name }}</h4>
              <p class="milestone-desc">{{ milestone.description || '暂无描述' }}</p>
              <div class="milestone-info flex gap-8 mt-10">
                <el-tag size="small">持续 {{ milestone.durationDays }} 天</el-tag>
                <el-tag size="small" type="info">偏移 {{ milestone.offsetDays }} 天</el-tag>
                <el-tag size="small" type="warning">权重 {{ milestone.weight }}</el-tag>
                <el-tag
                  v-if="milestone.dependencies?.length"
                  size="small"
                  type="danger"
                >
                  依赖: {{ milestone.dependencies.join(', ') }}
                </el-tag>
              </div>
              <p v-if="milestone.deliverables" class="deliverables">
                <strong>交付物:</strong> {{ milestone.deliverables }}
              </p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="showApplyDialog(currentTemplate)">
          应用到项目
        </el-button>
      </template>
    </el-dialog>

    <!-- 应用模板对话框 -->
    <el-dialog
      v-model="applyDialogVisible"
      title="应用模板到项目"
      width="500px"
    >
      <el-form :model="applyForm" label-width="100px">
        <el-form-item label="选择项目" required>
          <el-select
            v-model="applyForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="project in projects"
              :key="project.id || project._id"
              :label="project.name + ' (' + project.code + ')'"
              :value="project.id || project._id"
            />
          </el-select>
          <div v-if="projects.length === 0" class="mt-8" style="color: #f56c6c; font-size: 12px">
            没有可用的项目，请确认您有项目管理权限
          </div>
          <div v-else class="mt-8" style="color: #909399; font-size: 12px">
            当前有 {{ projects.length }} 个可用项目
          </div>
        </el-form-item>

        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="applyForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-alert
          v-if="currentTemplate"
          :title="`将创建 ${currentTemplate.templateData?.milestones?.length || 0} 个里程碑`"
          type="info"
          :closable="false"
          show-icon
          class="mt-10"
        />
      </el-form>

      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApply" :loading="applying">
          确认应用
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editMode === 'create' ? '创建自定义模板' : '编辑模板'"
      width="800px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="editForm.name" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="editForm.category" placeholder="选择分类">
            <el-option label="软件开发" value="software" />
            <el-option label="市场活动" value="marketing" />
            <el-option label="产品研发" value="product" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>

        <el-form-item label="里程碑列表" required>
          <div class="milestone-editor">
            <el-button
              type="primary"
              size="small"
              @click="addMilestone"
              class="mb-10"
            >
              <el-icon><Plus /></el-icon>
              添加里程碑
            </el-button>

            <div
              v-for="(milestone, index) in editForm.milestones"
              :key="index"
              class="milestone-item"
            >
              <div class="milestone-item-header flex-between mb-10" style="font-weight: 600">
                <span>里程碑 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeMilestone(index)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>

              <el-row :gutter="12">
                <el-col :span="12">
                  <el-input
                    v-model="milestone.name"
                    placeholder="里程碑名称"
                    size="small"
                  />
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="milestone.description"
                    placeholder="描述"
                    size="small"
                  />
                </el-col>
              </el-row>

              <el-row :gutter="12" class="mt-8">
                <el-col :span="8">
                  <div class="input-label">持续天数</div>
                  <el-input-number
                    v-model="milestone.durationDays"
                    :min="1"
                    placeholder="持续天数"
                    size="small"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <div class="input-label">偏移天数</div>
                  <el-input-number
                    v-model="milestone.offsetDays"
                    :min="0"
                    placeholder="偏移天数"
                    size="small"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="8">
                  <div class="input-label">权重</div>
                  <el-input-number
                    v-model="milestone.weight"
                    :min="0.1"
                    :step="0.1"
                    placeholder="权重"
                    size="small"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>

              <el-input
                v-model="milestone.deliverables"
                placeholder="交付物(可选)"
                size="small"
                class="mt-8"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit" :loading="saving">
          {{ editMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Collection, Document, Star, View, Check, More,
  Edit, Delete
} from '@element-plus/icons-vue'
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate as deleteTemplateApi,
  applyTemplate as applyTemplateApi
} from '@/api/milestoneTemplate'
import { getProjects } from '@/api/project'

// 数据
const loading = ref(false)
const templates = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 筛选
const searchText = ref('')
const filterCategory = ref('')
const filterType = ref('')

// 项目列表
const projects = ref<any[]>([])

// 查看详情
const detailDialogVisible = ref(false)
const currentTemplate = ref<any>(null)

// 应用模板
const applyDialogVisible = ref(false)
const applying = ref(false)
const applyForm = reactive({
  projectId: '',
  startDate: ''
})

// 创建/编辑模板
const editDialogVisible = ref(false)
const editMode = ref<'create' | 'edit'>('create')
const saving = ref(false)
const editForm = reactive<any>({
  id: null,
  name: '',
  description: '',
  category: 'custom',
  milestones: []
})

// 加载模板列表
async function loadTemplates() {
  try {
    loading.value = true
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value
    }

    if (searchText.value) params.search = searchText.value
    if (filterCategory.value) params.category = filterCategory.value
    if (filterType.value) params.isSystem = filterType.value === 'system'

    const res: any = await getTemplates(params)
    
    templates.value = res.data.data || []
    total.value = res.data.pagination?.total || 0
  } catch (error: any) {
    console.error('❌ [里程碑模板] 加载失败:', error)
    ElMessage.error(error.message || '加载模板列表失败')
  } finally {
    loading.value = false
  }
}

// 加载项目列表
async function loadProjects() {
  try {
    console.log('🔍 开始加载项目列表...')
    const res: any = await getProjects({ pageSize: 1000, manager: true })
    console.log('📡 API响应:', res)
    
    // 处理嵌套的data结构
    if (res.data) {
      // 新格式：{ code: 200, data: { list: [...], page, pageSize, total } }
      if (res.data.list && Array.isArray(res.data.list)) {
        projects.value = res.data.list
        console.log('✅ 使用 res.data.list，项目数:', projects.value.length)
      }
      // 兼容旧格式：{ code: 200, data: { projects: [...] } }
      else if (res.data.projects && Array.isArray(res.data.projects)) {
        projects.value = res.data.projects
        console.log('✅ 使用 res.data.projects，项目数:', projects.value.length)
      }
      // 直接数组格式
      else if (Array.isArray(res.data)) {
        projects.value = res.data
        console.log('✅ 使用 res.data，项目数:', projects.value.length)
      } else {
        console.warn('⚠️ 未知的数据结构:', res.data)
        projects.value = []
      }
    }
    
    console.log('👀 第一个项目:', projects.value[0])
    
    if (projects.value.length === 0) {
      console.warn('⚠️ 没有可用的项目')
      ElMessage.warning('没有可管理的项目')
    }
  } catch (error) {
    console.error('❌ 加载项目列表失败:', error)
    projects.value = []
  }
}

// 查看模板详情
function viewTemplate(template: any) {
  currentTemplate.value = template
  detailDialogVisible.value = true
}

// 显示应用对话框
function showApplyDialog(template: any) {
  currentTemplate.value = template
  applyForm.projectId = ''
  applyForm.startDate = new Date().toISOString().split('T')[0]
  applyDialogVisible.value = true
  detailDialogVisible.value = false
  
  // 确保项目列表已加载
  if (projects.value.length === 0) {
    console.log('🔄 项目列表为空，重新加载...')
    loadProjects()
  }
}

// 确认应用模板
async function confirmApply() {
  if (!applyForm.projectId || !applyForm.startDate) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    applying.value = true
    const res: any = await applyTemplateApi(currentTemplate.value!.id, applyForm)
    ElMessage.success('应用成功')
    applyDialogVisible.value = false
    loadTemplates()
  } catch (error: any) {
    ElMessage.error(error.message || '应用失败')
  } finally {
    applying.value = false
  }
}

// 显示创建对话框
function showCreateDialog() {
  editMode.value = 'create'
  editForm.id = null
  editForm.name = ''
  editForm.description = ''
  editForm.category = 'custom'
  editForm.milestones = []
  editDialogVisible.value = true
}

// 编辑模板
function editTemplate(template: any) {
  editMode.value = 'edit'
  editForm.id = template.id
  editForm.name = template.name
  editForm.description = template.description
  editForm.category = template.category
  editForm.milestones = JSON.parse(JSON.stringify(template.templateData?.milestones || []))
  editDialogVisible.value = true
}

// 添加里程碑
function addMilestone() {
  editForm.milestones.push({
    name: '',
    description: '',
    durationDays: 7,
    offsetDays: 0,
    weight: 1.0,
    deliverables: '',
    dependencies: []
  })
}

// 删除里程碑
function removeMilestone(index: number) {
  editForm.milestones.splice(index, 1)
}

// 确认创建/编辑
async function confirmEdit() {
  if (!editForm.name || editForm.milestones.length === 0) {
    ElMessage.warning('请填写模板名称并至少添加一个里程碑')
    return
  }

  try {
    saving.value = true
    const data = {
      name: editForm.name,
      description: editForm.description,
      category: editForm.category,
      templateData: {
        milestones: editForm.milestones
      }
    }

    console.log('📤 [里程碑模板] 提交数据:', data)

    let res: any
    if (editMode.value === 'create') {
      res = await createTemplate(data)
      console.log('✅ [里程碑模板] 创建响应:', res)
    } else {
      res = await updateTemplate(editForm.id, data)
      console.log('✅ [里程碁模板] 更新响应:', res)
    }

    // 关闭弹窗
    editDialogVisible.value = false
    
    // 显示成功消息
    ElMessage.success(editMode.value === 'create' ? '模板创建成功' : '模板更新成功')
    
    // 刷新列表
    await loadTemplates()
    
  } catch (error: any) {
    console.error('❌ [里程碑模板] 操作失败:', error)
    ElMessage.error(error.message || error.response?.data?.message || '操作失败')
    // 即使失败也关闭弹窗
    editDialogVisible.value = false
  } finally {
    saving.value = false
  }
}

// 删除模板
async function deleteTemplate(template: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗?`,
      '确认删除',
      { type: 'warning' }
    )

    const res: any = await deleteTemplateApi(template.id)
    ElMessage.success('删除成功')
    loadTemplates()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 获取分类标签
function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    software: '软件开发',
    marketing: '市场活动',
    product: '产品研发',
    custom: '自定义'
  }
  return labels[category] || category
}

onMounted(() => {
  loadTemplates()
  loadProjects()
})
</script>

<style scoped lang="scss">
.template-grid {
  .template-card {
    min-height: 350px;
    height: auto;
    display: flex;
    flex-direction: column;

    .card-header {
      .template-name {
        font-weight: 600;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        margin-right: 8px;
      }
    }

    .template-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 180px;

      .template-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #909399;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .template-desc {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 15px;
        min-height: 42px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .template-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: auto;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}

.template-detail {
  .milestone-desc {
    color: #606266;
    margin: 10px 0;
  }

  .deliverables {
    margin-top: 10px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
  }
}

.milestone-editor {
  width: 100%;

  .milestone-item {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 10px;
  }

  .input-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
    font-weight: 500;
  }
}
</style>
