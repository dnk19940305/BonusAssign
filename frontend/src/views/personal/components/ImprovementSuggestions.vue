<template>
  <div class="improvement-suggestions">
    <!-- Header -->
    <div class="suggestions-header">
      <div class="header-content">
        <h4>改进建议</h4>
        <div class="suggestions-stats" v-if="suggestions.length > 0">
          <span class="stats-item">共 {{ suggestions.length }} 条建议</span>
          <span class="stats-item" v-if="highPrioritySuggestions.length > 0">高优先级 {{ highPrioritySuggestions.length }} 条</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- No Suggestions -->
    <div v-else-if="suggestions.length === 0" class="no-suggestions">
      <el-empty description="暂无改进建议" />
    </div>

    <!-- Suggestions List -->
    <div v-else class="suggestions-content">
      <div class="suggestions-list">
        <div 
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          class="suggestion-item"
          :class="{ completed: suggestion.statusCode === 2 }"
        >
          <div class="item-header">
            <div class="category-icon" :class="getCategoryClass(suggestion.category)">
              <el-icon>
                <component :is="getCategoryIcon(suggestion.category)" />
              </el-icon>
            </div>
            <div class="item-info">
              <h6>{{ suggestion.title }}</h6>
              <p>{{ suggestion.description }}</p>
            </div>
            <div class="item-meta">
              <el-tag :type="getPriorityTagType(suggestion.priority)" size="small">
                {{ getPriorityLabel(suggestion.priority) }}
              </el-tag>
              <div class="potential-impact" v-if="suggestion.potentialImpact">+{{ suggestion.potentialImpact }}%</div>
            </div>
          </div>
          
          <div class="item-footer">
            <div class="footer-info">
              <span class="status-badge" :class="getStatusClass(suggestion.statusCode)">
                <el-icon><component :is="getStatusIcon(suggestion.statusCode)" /></el-icon>
                {{ getStatusLabel(suggestion.statusCode) }}
              </span>
              <span class="time-frame" v-if="suggestion.timeFrame">
                <el-icon><Clock /></el-icon>
                {{ suggestion.timeFrame }}
              </span>
              <span class="source-tag" v-if="suggestion.source === 'manual'">
                <el-tag size="small" type="info">手动录入</el-tag>
              </span>
            </div>
            <div class="footer-actions">
              <el-button size="small" @click="showSuggestionDetail(suggestion)">
                详情
              </el-button>
              <el-button 
                v-if="suggestion.statusCode === 0"
                size="small" 
                type="primary" 
                @click="handleCompleteImplementation(suggestion)"
              >
                实施完成
              </el-button>
              <el-tag v-else-if="suggestion.statusCode === 1" type="warning" size="small">待审核</el-tag>
              <el-tag v-else-if="suggestion.statusCode === 2" type="success" size="small">已完成</el-tag>
              <el-tag v-else-if="suggestion.statusCode === -1" type="danger" size="small">已拒绝</el-tag>
              <el-tag v-else-if="suggestion.statusCode === -2" type="info" size="small">
                <el-icon><TrendCharts /></el-icon>
                参考建议
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggestion Detail Dialog -->
    <el-dialog 
      v-model="showDetailDialog" 
      :title="selectedSuggestion?.title"
      width="600px"
      class="suggestion-detail-dialog"
    >
      <div v-if="selectedSuggestion" class="suggestion-detail">
        <div class="detail-header">
          <div class="category-info">
            <el-tag :type="getCategoryTagType(selectedSuggestion.category)">
              {{ getCategoryLabel(selectedSuggestion.category) }}
            </el-tag>
            <el-tag :type="getPriorityTagType(selectedSuggestion.priority)" size="small">
              {{ getPriorityLabel(selectedSuggestion.priority) }}优先级
            </el-tag>
          </div>
          <div class="impact-info">
            <div class="impact-value">+{{ selectedSuggestion.potentialImpact }}%</div>
            <div class="impact-label">预期提升</div>
          </div>
        </div>

        <div class="detail-description">
          <h6>详细说明</h6>
          <p>{{ selectedSuggestion.description }}</p>
        </div>

        <div class="action-steps">
          <h6>执行步骤</h6>
          <el-steps :active="activeStep" direction="vertical" size="small">
            <el-step
              v-for="(step, index) in selectedSuggestion.actionSteps"
              :key="index"
              :title="`步骤 ${index + 1}`"
              :description="step"
              :status="getStepStatus(index)"
            />
          </el-steps>
        </div>

        <div class="detail-meta">
          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            <span>预计时间: {{ selectedSuggestion.timeFrame }}</span>
          </div>
          <div class="meta-item">
            <el-icon><TrendCharts /></el-icon>
            <span>影响程度: {{ selectedSuggestion.potentialImpact }}%</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <!-- 系统建议：只读，不显示操作按钮 -->
          <template v-if="selectedSuggestion && selectedSuggestion.statusCode !== -2">
            <!-- 待实施：显示实施完成按钮 -->
            <el-button 
              v-if="selectedSuggestion.statusCode === 0" 
              type="primary" 
              @click="handleCompleteImplementation(selectedSuggestion)"
            >
              实施完成
            </el-button>
            <!-- 待审核 -->
            <el-button 
              v-else-if="selectedSuggestion.statusCode === 1" 
              type="warning" 
              disabled
            >
              待审核
            </el-button>
            <!-- 已完成 -->
            <el-button 
              v-else-if="selectedSuggestion.statusCode === 2" 
              type="success" 
              disabled
            >
              已完成
            </el-button>
            <!-- 已拒绝 -->
            <el-button 
              v-else-if="selectedSuggestion.statusCode === -1" 
              type="danger" 
              disabled
            >
              已拒绝
            </el-button>
          </template>
          <!-- 系统建议提示 -->
          <el-alert
            v-if="selectedSuggestion?.statusCode === -2"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 12px"
          >
            <template #title>
              <span style="font-size: 13px">这是系统智能分析生成的建议，仅供参考</span>
            </template>
          </el-alert>
        </div>
      </template>
    </el-dialog>

    <!-- 实施完成对话框 -->
    <el-dialog 
      v-model="completeDialogVisible" 
      title="提交实施完成"
      width="500px"
    >
      <el-form :model="completeForm" label-width="80px">
        <el-form-item label="建议标题">
          <div>{{ currentSuggestion?.title }}</div>
        </el-form-item>
        <el-form-item label="实施反馈" required>
          <el-input
            v-model="completeForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请描述实施过程、效果和心得..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete" :loading="submitting">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Filter, ArrowDown, Star, TrendCharts, Clock,
  User, Tools, FolderOpened, UserFilled
} from '@element-plus/icons-vue'
import type { ImprovementSuggestion } from '@/api/personalBonus'
import { completeImplementation } from '@/api/improvementSuggestions'

// Define SuggestionItem component inline
const SuggestionItem = {
  props: {
    suggestion: {
      type: Object as PropType<ImprovementSuggestion>,
      required: true
    }
  },
  emits: ['complete', 'detail'],
  template: `
    <div class="suggestion-item" :class="{ completed: suggestion.completed }">
      <div class="item-header">
        <div class="category-icon" :class="getCategoryClass(suggestion.category)">
          <el-icon>
            <component :is="getCategoryIcon(suggestion.category)" />
          </el-icon>
        </div>
        <div class="item-info">
          <h6>{{ suggestion.title }}</h6>
          <p>{{ suggestion.description }}</p>
        </div>
        <div class="item-meta">
          <el-tag :type="getPriorityTagType(suggestion.priority)" size="small">
            {{ getPriorityLabel(suggestion.priority) }}
          </el-tag>
          <div class="potential-impact">+{{ suggestion.potentialImpact }}%</div>
        </div>
      </div>
      
      <div class="item-footer">
        <div class="footer-info">
          <span class="time-frame">
            <el-icon><Clock /></el-icon>
            {{ suggestion.timeFrame }}
          </span>
          <span class="steps-count">{{ suggestion.actionSteps.length }} 个步骤</span>
        </div>
        <div class="footer-actions">
          <el-button size="small" @click="$emit('detail', suggestion)">
            详情
          </el-button>
          <el-button 
            v-if="!suggestion.completed"
            size="small" 
            type="primary" 
            @click="$emit('complete', suggestion.id)"
          >
            完成
          </el-button>
          <el-tag v-else type="success" size="small">已完成</el-tag>
        </div>
      </div>
    </div>
  `
}

interface Props {
  suggestions: ImprovementSuggestion[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  suggestionComplete: [suggestionId: string]
}>()

// Reactive data
const currentFilter = ref('all')
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(5)
const showDetailDialog = ref(false)
const selectedSuggestion = ref<ImprovementSuggestion | null>(null)
const activeStep = ref(0)

// 实施完成相关
const completeDialogVisible = ref(false)
const currentSuggestion = ref<ImprovementSuggestion | null>(null)
const completeForm = ref({
  feedback: ''
})
const submitting = ref(false)

// Computed properties
const filteredSuggestions = computed(() => {
  let filtered = props.suggestions

  // Apply filter
  switch (currentFilter.value) {
    case 'high':
      filtered = filtered.filter(s => s.priority === 'high')
      break
    case 'pending':
      // 待处理：包括待实施(0)和待审核(1)，不包括系统建议(-2)
      filtered = filtered.filter(s => s.statusCode === 0 || s.statusCode === 1)
      break
    case 'completed':
      // 已完成：只包括状态码2
      filtered = filtered.filter(s => s.statusCode === 2)
      break
  }

  // Apply category filter
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(s => s.category === activeCategory.value)
  }

  return filtered
})

const paginatedSuggestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSuggestions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSuggestions.value.length / pageSize.value)
})

const highPrioritySuggestions = computed(() => {
  return props.suggestions.filter(s => s.priority === 'high')
})

const completedSuggestions = computed(() => {
  return props.suggestions.filter(s => s.statusCode === 2)
})

const completionPercentage = computed(() => {
  if (props.suggestions.length === 0) return 0
  // 排除系统建议，只计算手动建议的完成率
  const manualSuggestions = props.suggestions.filter(s => s.statusCode !== -2)
  if (manualSuggestions.length === 0) return 0
  return Math.round((completedSuggestions.value.length / manualSuggestions.length) * 100)
})

const completedHighPriority = computed(() => {
  return highPrioritySuggestions.value.filter(s => s.statusCode === 2).length
})

const totalPotentialImpact = computed(() => {
  return props.suggestions.reduce((sum, s) => sum + s.potentialImpact, 0)
})

// Utility functions
const getCategoryClass = (category: string) => {
  const classes: Record<string, string> = {
    performance: 'category-performance',
    skills: 'category-skills',
    projects: 'category-projects',
    collaboration: 'category-collaboration'
  }
  return classes[category] || 'category-default'
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    performance: 'TrendCharts',
    skills: 'Tools',
    projects: 'FolderOpened',
    collaboration: 'UserFilled'
  }
  return icons[category] || 'Star'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    performance: '绩效提升',
    skills: '技能发展',
    projects: '项目参与',
    collaboration: '团队协作'
  }
  return labels[category] || category
}

const getCategoryTagType = (category: string) => {
  const types: Record<string, string> = {
    performance: 'success',
    skills: 'primary',
    projects: 'warning',
    collaboration: 'info'
  }
  return types[category] || 'info'
}

const getPriorityTagType = (priority: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

// 状态相关方法
const getStatusLabel = (statusCode: number) => {
  const labels: Record<number, string> = {
    0: '待实施',
    1: '待审核',
    2: '已完成',
    [-1]: '已拒绝',
    [-2]: '系统建议'  // 自动生成的建议
  }
  return labels[statusCode] || '未知'
}

const getStatusClass = (statusCode: number) => {
  const classes: Record<number, string> = {
    0: 'status-pending',
    1: 'status-reviewing',
    2: 'status-completed',
    [-1]: 'status-rejected',
    [-2]: 'status-system'  // 系统建议的样式
  }
  return classes[statusCode] || ''
}

const getStatusIcon = (statusCode: number) => {
  const icons: Record<number, string> = {
    0: 'Clock',
    1: 'View',
    2: 'Check',
    [-1]: 'Close',
    [-2]: 'TrendCharts'  // 系统建议用趋势图标
  }
  return icons[statusCode] || 'Clock'
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getSuggestionsByCategory = (category: string) => {
  return props.suggestions.filter(s => s.category === category)
}

const getStepStatus = (index: number) => {
  if (selectedSuggestion.value?.statusCode === 2) return 'success'
  if (index <= activeStep.value) return 'process'
  return 'wait'
}

// Event handlers
const refreshSuggestions = () => {
  ElMessage.info('刷新建议功能开发中...')
}

const handleFilterChange = (command: string) => {
  currentFilter.value = command
  currentPage.value = 1
}

const handleCategoryClick = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const showSuggestionDetail = (suggestion: ImprovementSuggestion) => {
  selectedSuggestion.value = suggestion
  activeStep.value = suggestion.statusCode === 2 ? (suggestion.actionSteps?.length || 0) - 1 : 0
  showDetailDialog.value = true
}

// 处理实施完成
const handleCompleteImplementation = (suggestion: ImprovementSuggestion) => {
  currentSuggestion.value = suggestion
  completeForm.value.feedback = ''
  completeDialogVisible.value = true
}

// 提交实施完成
const submitComplete = async () => {
  if (!currentSuggestion.value) return
  
  if (!completeForm.value.feedback.trim()) {
    ElMessage.warning('请填写实施反馈')
    return
  }

  try {
    submitting.value = true
    await completeImplementation(
      Number(currentSuggestion.value.id),
      completeForm.value.feedback
    )
    
    ElMessage.success('已提交审核，请等待上级审核')
    completeDialogVisible.value = false
    emit('suggestionComplete', String(currentSuggestion.value.id))
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// Register global component functions (for template usage)
const globalFunctions = {
  getCategoryClass,
  getCategoryIcon,
  getCategoryLabel,
  getPriorityTagType,
  getPriorityLabel
}

// Make functions available globally for SuggestionItem component
Object.assign(window, globalFunctions)
</script>

<style scoped>
.improvement-suggestions {
  padding: 20px 0;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.suggestions-stats {
  display: flex;
  gap: 16px;
}

.stats-item {
  font-size: 12px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.loading-container {
  padding: 40px 20px;
}

.no-suggestions {
  padding: 60px 20px;
  text-align: center;
}

.priority-section {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  border-radius: 8px;
  border: 1px solid #fed7aa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h5 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ea580c;
  font-size: 14px;
  font-weight: 600;
}

.priority-badge {
  background: #ea580c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.priority-suggestions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.priority-suggestion-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  transition: all 0.3s ease;
}

.priority-suggestion-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-category {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.suggestion-category.category-performance {
  color: #67c23a;
}

.suggestion-category.category-skills {
  color: #409eff;
}

.suggestion-category.category-projects {
  color: #e6a23c;
}

.suggestion-category.category-collaboration {
  color: #909399;
}

.card-content {
  padding: 16px;
}

.card-content h6 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.card-content p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.suggestion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.potential-impact,
.time-frame {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
}

.category-tabs {
  margin-bottom: 24px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.suggestion-item.completed {
  background: #f0f9ff;
  border-color: #67c23a;
  opacity: 0.8;
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.category-icon.category-performance {
  background: #f0f9ff;
  color: #67c23a;
}

.category-icon.category-skills {
  background: #e3f2fd;
  color: #409eff;
}

.category-icon.category-projects {
  background: #fff8e1;
  color: #e6a23c;
}

.category-icon.category-collaboration {
  background: #f5f5f5;
  color: #909399;
}

.item-info {
  flex: 1;
}

.item-info h6 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.item-info p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.potential-impact {
  font-size: 12px;
  font-weight: 600;
  color: #67c23a;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.status-pending {
  background: #f4f4f5;
  color: #909399;
}

.status-badge.status-reviewing {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-badge.status-completed {
  background: #f0f9ff;
  color: #67c23a;
}

.status-badge.status-rejected {
  background: #fef0f0;
  color: #f56c6c;
}

.status-badge.status-system {
  background: #e8f4ff;
  color: #409eff;
}

.time-frame {
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin: 24px 0;
  text-align: center;
}

.progress-summary {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-header h5 {
  margin: 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.progress-stats {
  font-size: 12px;
  color: #909399;
}

.progress-details {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}

.detail-item {
  font-size: 12px;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.suggestion-detail-dialog .suggestion-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.category-info {
  display: flex;
  gap: 8px;
}

.impact-info {
  text-align: right;
}

.impact-value {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
  line-height: 1;
}

.impact-label {
  font-size: 12px;
  color: #909399;
}

.detail-description {
  margin-bottom: 24px;
}

.detail-description h6 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.detail-description p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.action-steps {
  margin-bottom: 24px;
}

.action-steps h6 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.detail-meta {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .improvement-suggestions {
    padding: 12px 0;
  }
  
  .suggestions-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .priority-suggestions {
    grid-template-columns: 1fr;
  }
  
  .item-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .item-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .item-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: space-between;
  }
  
  .progress-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .detail-meta {
    flex-direction: column;
    gap: 12px;
  }
}
</style>