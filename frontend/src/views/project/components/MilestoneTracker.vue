<template>
  <div class="milestone-tracker">
    <!-- 头部操作栏 -->
    <div class="tracker-header">
      <div class="header-left">
        <h3>项目里程碑</h3>
        <el-tag :type="getStatusTagType(currentStatus)" size="small">
          {{ getStatusLabel(currentStatus) }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleAddMilestone"
          v-if="canEdit"
        >
          添加里程碑
        </el-button>
        <el-button 
          :icon="Refresh" 
          @click="loadMilestones"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 里程碑列表 -->
    <div class="milestone-list" v-loading="loading">
      <el-empty 
        v-if="!milestones.length && !loading" 
        description="暂无里程碑，点击上方按钮添加"
      />
      
      <div 
        class="milestone-item" 
        v-for="(milestone, index) in milestones" 
        :key="milestone.id"
        :class="getMilestoneClass(milestone)"
      >
        <!-- 里程碑序号和连接线 -->
        <div class="milestone-timeline">
          <div class="timeline-dot" :class="getStatusClass(milestone.status)">
            <el-icon v-if="milestone.status === 'completed'">
              <CircleCheck />
            </el-icon>
            <el-icon v-else-if="milestone.status === 'in_progress'">
              <Loading />
            </el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="timeline-line" v-if="index < milestones.length - 1"></div>
        </div>

        <!-- 里程碑内容 -->
        <el-card class="milestone-content" shadow="hover">
          <div class="content-header">
            <div class="content-left">
              <h4 class="milestone-name">
                {{ milestone.name }}
                <el-tag 
                  :type="getStatusTagType(milestone.status)" 
                  size="small"
                  class="status-tag"
                >
                  {{ getStatusLabel(milestone.status) }}
                </el-tag>
              </h4>
              <p class="milestone-description" v-if="milestone.description">
                {{ milestone.description }}
              </p>
            </div>
            <div class="content-right">
              <el-dropdown 
                v-if="canEdit" 
                trigger="click"
                @command="(cmd: string) => handleCommand(cmd, milestone)"
              >
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      command="start" 
                      :icon="CircleCheck"
                      v-if="milestone.status === 'pending'"
                    >
                      开始执行
                    </el-dropdown-item>
                    <el-dropdown-item command="edit" :icon="Edit">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="updateProgress" :icon="Odometer">
                      更新进度
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="complete" 
                      :icon="CircleCheck"
                      v-if="milestone.status === 'in_progress' && milestone.progress < 100"
                    >
                      标记为完成
                    </el-dropdown-item>
                    <el-dropdown-item 
                      command="delete" 
                      :icon="Delete"
                      v-if="milestone.status !== 'completed'"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-label">完成进度</span>
              <span class="progress-value">{{ milestone.progress }}%</span>
            </div>
            <el-progress 
              :percentage="milestone.progress" 
              :color="getProgressColor(milestone.progress)"
              :stroke-width="8"
              :status="milestone.progress === 100 ? 'success' : undefined"
            />
          </div>

          <!-- 详细信息 -->
          <div class="milestone-details">
            <div class="detail-row">
              <div class="detail-item">
                <el-icon class="detail-icon"><Calendar /></el-icon>
                <span class="detail-label">目标日期：</span>
                <span class="detail-value">{{ formatDate(milestone.targetDate) }}</span>
              </div>
              <div class="detail-item" v-if="milestone.completionDate">
                <el-icon class="detail-icon"><CircleCheck /></el-icon>
                <span class="detail-label">完成日期：</span>
                <span class="detail-value">{{ formatDate(milestone.completionDate) }}</span>
              </div>
            </div>

            <div class="detail-row" v-if="milestone.deliverables">
              <div class="detail-item deliverables">
                <el-icon class="detail-icon"><Document /></el-icon>
                <span class="detail-label">交付成果：</span>
                <span class="detail-value">{{ milestone.deliverables }}</span>
              </div>
            </div>

            <div class="detail-row" v-if="milestone.dependencies && milestone.dependencies.length">
              <div class="detail-item">
                <el-icon class="detail-icon"><Connection /></el-icon>
                <span class="detail-label">依赖里程碑：</span>
                <span class="detail-value">{{ getDependencyNames(milestone.dependencies) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑里程碑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑里程碑' : '添加里程碑'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-form-item label="里程碑名称" prop="name">
          <el-input 
            v-model="formData.name" 
            placeholder="请输入里程碑名称"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入里程碑描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="目标日期" prop="targetDate">
          <el-date-picker
            v-model="formData.targetDate"
            type="date"
            placeholder="选择目标完成日期"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待开始" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="延期" value="delayed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="完成进度" prop="progress">
          <el-slider 
            v-model="formData.progress" 
            :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
          />
        </el-form-item>

        <el-form-item label="交付成果" prop="deliverables">
          <el-input 
            v-model="formData.deliverables" 
            type="textarea" 
            :rows="2"
            placeholder="请输入交付成果"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="依赖里程碑" prop="dependencies">
          <el-select 
            v-model="formData.dependencies" 
            multiple 
            placeholder="选择依赖的里程碑"
            style="width: 100%"
          >
            <el-option 
              v-for="m in availableDependencies" 
              :key="m.id" 
              :label="m.name" 
              :value="m.id"
              :disabled="m.id === formData.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序顺序" prop="sortOrder">
          <el-input-number 
            v-model="formData.sortOrder" 
            :min="0" 
            :max="999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新里程碑进度"
      width="500px"
    >
      <div class="progress-update">
        <div class="current-progress">
          <span>当前进度：</span>
          <span class="progress-number">{{ currentMilestone?.progress }}%</span>
        </div>
        <el-form label-width="80px">
          <el-form-item label="新进度">
            <el-slider 
              v-model="newProgress" 
              :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
              show-input
            />
          </el-form-item>
        </el-form>
        <el-alert 
          v-if="newProgress === 100" 
          title="进度达到100%时，里程碑将自动标记为已完成"
          type="success"
          :closable="false"
          show-icon
        />
      </div>

      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProgressUpdate" :loading="submitting">
          更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Refresh,
  Edit,
  Delete,
  More,
  CircleCheck,
  Loading,
  Calendar,
  Document,
  Connection,
  Odometer
} from '@element-plus/icons-vue'
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  updateMilestoneProgress,
  type Milestone
} from '@/api/milestone'

// Props
interface Props {
  projectId: string
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true
})

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'progress-updated', progress: number): void
}>()

// 数据
const loading = ref(false)
const milestones = ref<Milestone[]>([])
const dialogVisible = ref(false)
const progressDialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const currentMilestone = ref<Milestone | null>(null)
const newProgress = ref(0)

// 表单数据
const formData = ref<Partial<Milestone>>({
  name: '',
  description: '',
  targetDate: '',
  status: 'pending',
  progress: 0,
  deliverables: '',
  dependencies: [],
  sortOrder: 0
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入里程碑名称', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  targetDate: [
    { required: true, message: '请选择目标日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const currentStatus = computed(() => {
  if (!milestones.value.length) return 'pending'
  const inProgress = milestones.value.find(m => m.status === 'in_progress')
  if (inProgress) return 'in_progress'
  const allCompleted = milestones.value.every(m => m.status === 'completed')
  return allCompleted ? 'completed' : 'pending'
})

const availableDependencies = computed(() => {
  return milestones.value.filter(m => m.id !== formData.value.id)
})

// 方法
const loadMilestones = async () => {
  loading.value = true
  try {
    const res = await getMilestones(props.projectId, { sortBy: 'sort_order' })
    console.log('📥 [里程碑] 原始响应:', res)
    if (res.data.success) {
      // 解析 dependencies 字段（从 JSON 字符串转为数组）
      milestones.value = (res.data.data || []).map((m: any) => {
        console.log('🔍 [里程碑] 单条数据:', m)
        return {
          ...m,
          // 确保 id 字段存在（兼容 _id）
          id: m.id || m._id,
          dependencies: Array.isArray(m.dependencies) 
            ? m.dependencies 
            : (m.dependencies ? JSON.parse(m.dependencies) : [])
        }
      })
      console.log('✅ [里程碑] 转换后的数据:', milestones.value)
    }
  } catch (error) {
    console.error('加载里程碑失败:', error)
    ElMessage.error('加载里程碑失败')
  } finally {
    loading.value = false
  }
}

const handleAddMilestone = () => {
  isEditing.value = false
  formData.value = {
    name: '',
    description: '',
    targetDate: '',
    status: 'pending',
    progress: 0,
    deliverables: '',
    dependencies: [],
    sortOrder: milestones.value.length
  }
  dialogVisible.value = true
}

const handleCommand = (command: string, milestone: Milestone) => {
  currentMilestone.value = milestone
  
  switch (command) {
    case 'start':
      handleStartMilestone(milestone)
      break
    case 'edit':
      handleEdit(milestone)
      break
    case 'updateProgress':
      handleUpdateProgress(milestone)
      break
    case 'complete':
      handleCompleteMilestone(milestone)
      break
    case 'delete':
      handleDelete(milestone)
      break
  }
}

const handleEdit = (milestone: Milestone) => {
  isEditing.value = true
  formData.value = {
    ...milestone,
    targetDate: milestone.targetDate,
    dependencies: Array.isArray(milestone.dependencies) 
      ? milestone.dependencies 
      : (milestone.dependencies ? JSON.parse(milestone.dependencies as any) : [])
  }
  dialogVisible.value = true
}

const handleUpdateProgress = (milestone: Milestone) => {
  currentMilestone.value = milestone
  newProgress.value = milestone.progress
  progressDialogVisible.value = true
}

const handleDelete = async (milestone: Milestone) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除里程碑"${milestone.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteMilestone(milestone.id!)
    ElMessage.success('删除成功')
    loadMilestones()
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleStartMilestone = async (milestone: Milestone) => {
  console.log('🚀 [开始里程碑] 里程碑对象:', milestone)
  console.log('🚀 [开始里程碑] milestone.id:', milestone.id)
  
  if (!milestone.id) {
    console.error('❌ [开始里程碁] 里程碁ID为undefined')
    ElMessage.error('里程碑ID不存在，无法开始')
    return
  }
  
  try {
    await updateMilestone(milestone.id, {
      status: 'in_progress'
    })
    ElMessage.success('已开始执行里程碑')
    loadMilestones()
    emit('refresh')
  } catch (error: any) {
    console.error('开始里程碁失败:', error)
    ElMessage.error(error.message || '开始失败')
  }
}

const handleCompleteMilestone = async (milestone: Milestone) => {
  try {
    await ElMessageBox.confirm(
      `确定要将里程碑"${milestone.name}"标记为完成吗？`,
      '完成确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    await updateMilestoneProgress(milestone.id!, 100)
    ElMessage.success('里程碑已完成')
    loadMilestones()
    emit('refresh')
    emit('progress-updated', 100)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('标记完成失败:', error)
      ElMessage.error(error.message || '标记完成失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data = {
        ...formData.value,
        projectId: props.projectId,
        targetDate: formatDateToString(formData.value.targetDate as any)
      }

      if (isEditing.value) {
        await updateMilestone(formData.value.id!, data)
        ElMessage.success('更新成功')
      } else {
        await createMilestone(props.projectId, data)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadMilestones()
      emit('refresh')
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleProgressUpdate = async () => {
  if (!currentMilestone.value) return

  submitting.value = true
  try {
    await updateMilestoneProgress(currentMilestone.value.id!, newProgress.value)
    ElMessage.success('进度更新成功')
    progressDialogVisible.value = false
    loadMilestones()
    emit('refresh')
    emit('progress-updated', newProgress.value)
  } catch (error: any) {
    console.error('更新进度失败:', error)
    ElMessage.error(error.message || '更新进度失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    delayed: '延期',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    pending: '',
    in_progress: 'warning',
    completed: 'success',
    delayed: 'danger',
    cancelled: 'info'
  }
  return types[status] || ''
}

const getStatusClass = (status: string) => {
  return `status-${status}`
}

const getMilestoneClass = (milestone: Milestone) => {
  return {
    'is-completed': milestone.status === 'completed',
    'is-in-progress': milestone.status === 'in_progress',
    'is-delayed': milestone.status === 'delayed'
  }
}

const getProgressColor = (progress: number) => {
  if (progress === 100) return '#67c23a'
  if (progress >= 75) return '#409eff'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDateToString = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 86400000
}

const getDependencyNames = (dependencies: string[] | string) => {
  // 如果是字符串，解析为数组
  let deps: string[] = []
  if (Array.isArray(dependencies)) {
    deps = dependencies
  } else if (typeof dependencies === 'string' && dependencies) {
    try {
      deps = JSON.parse(dependencies)
    } catch (e) {
      console.error('解析 dependencies 失败:', e)
      return ''
    }
  }
  
  return deps
    .map(id => milestones.value.find(m => m.id === id)?.name)
    .filter(Boolean)
    .join('、')
}

// 生命周期
onMounted(() => {
  loadMilestones()
})

// 暴露方法给父组件
defineExpose({
  loadMilestones
})
</script>

<style scoped lang="scss">
.milestone-tracker {
  .tracker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .milestone-list {
    min-height: 200px;

    .milestone-item {
      display: flex;
      margin-bottom: 24px;
      position: relative;

      &.is-completed {
        opacity: 0.85;
      }

      .milestone-timeline {
        flex-shrink: 0;
        width: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 20px;

        .timeline-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          background: #f0f0f0;
          color: #999;
          border: 2px solid #e0e0e0;
          position: relative;
          z-index: 1;

          &.status-pending {
            background: #fff;
            border-color: #d9d9d9;
          }

          &.status-in_progress {
            background: #fef0e6;
            border-color: #faad14;
            color: #faad14;
          }

          &.status-completed {
            background: #f0f9ff;
            border-color: #52c41a;
            color: #52c41a;
          }

          &.status-delayed {
            background: #fff1f0;
            border-color: #ff4d4f;
            color: #ff4d4f;
          }

          &.status-cancelled {
            background: #f5f5f5;
            border-color: #bfbfbf;
            color: #bfbfbf;
          }
        }

        .timeline-line {
          flex: 1;
          width: 2px;
          background: linear-gradient(to bottom, #e0e0e0, transparent);
          margin-top: 8px;
        }
      }

      .milestone-content {
        flex: 1;

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .content-left {
            flex: 1;

            .milestone-name {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;

              .status-tag {
                font-weight: normal;
              }
            }

            .milestone-description {
              margin: 0;
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
          }

          .content-right {
            flex-shrink: 0;
          }
        }

        .progress-section {
          margin-bottom: 16px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .progress-label {
              font-size: 14px;
              color: #666;
            }

            .progress-value {
              font-size: 14px;
              font-weight: 600;
              color: #409eff;
            }
          }
        }

        .milestone-details {
          .detail-row {
            display: flex;
            gap: 24px;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }

            .detail-item {
              display: flex;
              align-items: center;
              font-size: 14px;
              color: #666;

              &.deliverables {
                flex: 1;
                align-items: flex-start;

                .detail-icon {
                  margin-top: 2px;
                }
              }

              .detail-icon {
                margin-right: 6px;
                color: #999;
              }

              .detail-label {
                margin-right: 4px;
              }

              .detail-value {
                color: #333;
              }
            }
          }
        }
      }
    }
  }

  .progress-update {
    .current-progress {
      margin-bottom: 24px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .progress-number {
        font-size: 24px;
        font-weight: 600;
        color: #409eff;
      }
    }
  }
}
</style>
