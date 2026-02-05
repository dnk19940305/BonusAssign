```html
<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="900px"
    @close="handleClose"
  >
    <div class="weight-config-content" v-loading="loading">
      <!-- 模式说明 / 项目信息 -->
      <div v-if="mode === 'global'" class="mode-intro">
        <el-alert
          title="全局默认权重配置"
          type="info"
          description="此处配置各业务线在系统中的基础权重比例。该配置将作为所有新项目的初始权重参考。修改此配置不会自动更改已保存的项目特定权重。"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 项目选择 (仅当项目模式且未传入特定项目时显示) -->
      <div v-else-if="mode === 'project' && !project" class="project-section">
        <h3>选择项目 <span style="color: #909399; font-size: 12px; margin-left: 8px">(当前有 {{ projects.length }} 个可管理项目)</span></h3>
        <el-select
          v-model="selectedProjectId"
          placeholder="选择项目进行权重配置"
          style="width: 100%"
          clearable
          filterable
          @change="handleProjectChange"
        >
          <el-option
            v-for="p in projects"
            :key="p.id"
            :label="p.name + ' (' + p.code + ')'"
            :value="p.id"
          >
            <div>
              <span>{{ p.name }}</span>
              <span style="color: #8492a6; font-size: 12px; margin-left: 8px">({{ p.code }})</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 项目信息展示 (当传入特定项目时显示) -->
      <div v-else-if="mode === 'project' && project" class="project-info-section">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
          <el-descriptions-item label="项目代码">{{ project.code }}</el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="PROJECT_STATUS_COLORS[project.status]" size="small">
              {{ PROJECT_STATUS_LABELS[project.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ project.Manager?.name || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 权重配置表格 -->
      <div v-if="weightConfigs.length > 0" class="weight-table-section">
        <h3>
          权重配置
          <el-button link type="primary" @click="resetToDefault" :disabled="!activeProjectId || mode === 'global'">
            重置为默认权重
          </el-button>
        </h3>
        
        <el-table :data="weightConfigs" style="width: 100%" border stripe>
          <el-table-column prop="businessLineName" label="业务线" min-width="150" />
          <el-table-column prop="businessLineCode" label="代码" width="100" />
          <el-table-column label="默认权重" width="120" align="center">
            <template #header>
              <div class="header-with-help">
                <span>默认权重</span>
                <el-tooltip
                  v-if="mode === 'project'"
                  effect="dark"
                  content="此为业务线在系统中的基础权重，当项目未设置特定权重时，将采用此默认值。"
                  placement="top"
                >
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ formatPercent(row.defaultWeight) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="项目权重" width="180" align="center">
            <template #default="{ row, $index }">
              <div class="weight-input">
                <el-input-number
                  v-model="row.effectiveWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :precision="3"
                  size="small"
                  style="width: 130px"
                  @change="handleWeightChange($index)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center" v-if="mode === 'project'">
            <template #default="{ row }">
              <el-tag v-if="row.isCustom" type="warning" size="small">自定义</el-tag>
              <el-tag v-else type="info" size="small">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="权重占比" min-width="150">
            <template #default="{ row }">
              <div class="weight-bar">
                <div 
                  class="weight-fill"
                  :style="{ width: `${(row.effectiveWeight * 100)}%` }"
                ></div>
                <span class="weight-text">{{ formatPercent(row.effectiveWeight) }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 权重总和验证 -->
        <div class="weight-summary">
          <div class="summary-item">
            <span class="label">权重总和：</span>
            <span :class="['value', isWeightValid ? 'valid' : 'invalid']">
              {{ formatPercent(totalWeight) }}
            </span>
          </div>
          <div v-if="!isWeightValid" class="weight-warning">
            <el-alert
              :title="`权重总和必须为100%，当前为${formatPercent(totalWeight)}`"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </div>

        <!-- 调整原因 -->
        <div class="reason-section" v-if="mode === 'project'">
          <h4>调整原因</h4>
          <el-input
            v-model="adjustReason"
            type="textarea"
            :rows="2"
            placeholder="请说明权重调整的原因（例如：根据项目特性调整业务线侧重点）"
            maxlength="500"
            show-word-limit
          />
        </div>

        <!-- 快速调整工具 -->
        <div class="quick-adjust-section">
          <h4>快速调整工具</h4>
          <div class="adjust-tools">
            <el-button @click="averageDistribute" size="small">
              平均分配
            </el-button>
            <el-button @click="copyFromDefault" size="small">
              复制默认权重
            </el-button>
            <el-button @click="normalizeWeights" size="small" :disabled="totalWeight === 0">
              权重标准化
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <el-empty description="暂无权重配置数据，请先选择项目或检查系统业务线配置" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSave"
          :disabled="!canSave"
          :loading="saving"
        >
          保存{{ mode === 'global' ? '默认' : '' }}配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { projectApi } from '@/api/project'
import { businessLineApi, updateBusinessLineWeights } from '@/api/businessLine'
import type { Project, WeightConfig } from '@/types/project'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/types/project'

interface Props {
  modelValue: boolean
  project?: Project | null
  mode?: 'project' | 'global'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'project',
  project: null
})
const emit = defineEmits<Emits>()

const loading = ref(false)
const saving = ref(false)
const projects = ref<Project[]>([])
const selectedProjectId = ref<string | undefined>()
const weightConfigs = ref<WeightConfig[]>([])
const adjustReason = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const dialogTitle = computed(() => {
  if (props.mode === 'global') return '全局默认权重配置'
  return props.project ? `权重配置 - ${props.project.name}` : '项目权重配置'
})

const activeProjectId = computed(() => props.project?.id || selectedProjectId.value)

// 计算权重总和
const totalWeight = computed(() => {
  return weightConfigs.value.reduce((sum, config) => sum + config.effectiveWeight, 0)
})

// 权重是否有效 (允许极小误差)
const isWeightValid = computed(() => {
  return Math.abs(totalWeight.value - 1) < 0.001
})

// 是否可以保存
const canSave = computed(() => {
  if (props.mode === 'global') return isWeightValid.value
  return activeProjectId.value && isWeightValid.value
})

// 格式化百分比
const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

// 获取项目列表 (仅当项目模式且未传入特定项目时有用)
const getProjects = async () => {
  if (props.project || props.mode === 'global') return
  
  try {
    const response = await projectApi.getProjects({ pageSize: 1000, manager: true })
    if (response.data && response.data.list) {
      projects.value = response.data.list
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}

// 获取权重配置
const loadWeightConfig = async (projectId?: string) => {
  try {
    loading.value = true
    
    if (props.mode === 'global' || !projectId) {
      // 全局模式或项目模式未选项目时，只获取启用的业务线 (status: 1)
      const response = await businessLineApi.getBusinessLines({ pageSize: 1000, status: 1 })
      weightConfigs.value = response.data.list.map(bl => ({
        businessLineId: bl.id,
        businessLineName: bl.name,
        businessLineCode: bl.code,
        defaultWeight: bl.weight || 0,
        customWeight: undefined,
        isCustom: false,
        effectiveWeight: bl.weight || 0,
        reason: undefined,
        effectiveDate: undefined,
        configId: undefined
      }))
    } else {
      // 项目模式且已选项目
      const response = await projectApi.getProjectWeights(projectId)
      if (response.data && response.data.weightConfig && response.data.weightConfig.length > 0) {
        // 过滤掉已禁用的业务线 (后端可能返回所有，但前端只展示启用的)
        // 获取当前所有启用的业务线列表以进行比对
        const blResponse = await businessLineApi.getBusinessLines({ pageSize: 1000, status: 1 })
        const activeBlIds = new Set(blResponse.data.list.map(bl => bl.id))
        
        let configs = response.data.weightConfig.filter((config: any) => activeBlIds.has(config.businessLineId))
        
        // 如果有禁用的业务线被移除，需要重新标准化权重以保持 100%
        if (configs.length < response.data.weightConfig.length) {
          const currentTotal = configs.reduce((sum: number, c: any) => sum + (c.effectiveWeight || c.currentWeight || c.defaultWeight || 0), 0)
          if (currentTotal > 0 && Math.abs(currentTotal - 1) > 0.001) {
            configs = configs.map((c: any) => {
              const val = c.effectiveWeight !== undefined ? c.effectiveWeight : c.currentWeight !== undefined ? c.currentWeight : c.defaultWeight;
              return {
                ...c,
                effectiveWeight: val / currentTotal
              }
            })
            ElMessage.info('已自动移除禁用的业务线并重新平衡权重比例')
          }
        } else {
          configs = configs.map((config: any) => ({
            ...config,
            effectiveWeight: config.effectiveWeight !== undefined ? config.effectiveWeight : config.currentWeight !== undefined ? config.currentWeight : config.defaultWeight
          }))
        }
        
        weightConfigs.value = configs
      } else {
        // 如果没有项目特定配置，加载业务线列表并使用默认权重
        await loadWeightConfig()
      }
    }
  } catch (error) {
    ElMessage.error('获取权重配置失败')
    console.error('获取权重配置失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理项目变更
const handleProjectChange = (projectId: string | undefined) => {
  loadWeightConfig(projectId)
  adjustReason.value = ''
}

// 处理权重变更
const handleWeightChange = (index: number) => {
  if (props.mode === 'global') return // 全局模式下不标记为自定义
  const config = weightConfigs.value[index]
  // 标记为自定义权重
  config.isCustom = Math.abs(config.effectiveWeight - config.defaultWeight) > 0.001
}

// 平均分配权重
const averageDistribute = () => {
  if (weightConfigs.value.length === 0) return
  const averageWeight = 1 / weightConfigs.value.length
  weightConfigs.value.forEach((config, index) => {
    config.effectiveWeight = averageWeight
    handleWeightChange(index)
  })
}

// 复制默认权重
const copyFromDefault = () => {
  weightConfigs.value.forEach((config, index) => {
    config.effectiveWeight = config.defaultWeight
    handleWeightChange(index)
  })
}

// 权重标准化
const normalizeWeights = () => {
  const total = totalWeight.value
  if (total === 0) return
  
  weightConfigs.value.forEach((config, index) => {
    config.effectiveWeight = config.effectiveWeight / total
    handleWeightChange(index)
  })
}

// 重置项目权重
const resetToDefault = async () => {
  const projectId = activeProjectId.value
  if (!projectId || props.mode === 'global') return
  
  try {
    await ElMessageBox.confirm(
      '确定要重置当前项目的权重配置为默认值吗？这将清除所有已保存的自定义设置。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectApi.resetProjectWeights(projectId)
    ElMessage.success('重置成功')
    loadWeightConfig(projectId)
    emit('success')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败')
    }
  }
}

// 保存配置
const handleSave = async () => {
  if (!isWeightValid.value) return
  
  try {
    saving.value = true
    
    if (props.mode === 'global') {
      // 保存全局默认权重
      const data = weightConfigs.value.map(config => ({
        id: config.businessLineId,
        weight: config.effectiveWeight
      }))
      await updateBusinessLineWeights(data)
      ElMessage.success('全局默认权重保存成功')
    } else {
      // 保存项目权重
      const projectId = activeProjectId.value
      if (!projectId) return
      
      const weights = weightConfigs.value.map(config => ({
        businessLineId: config.businessLineId,
        weight: config.effectiveWeight
      }))
      await projectApi.updateProjectWeights(projectId, {
        weights,
        reason: adjustReason.value || '项目权重调整'
      })
      ElMessage.success('项目权重配置保存成功')
    }
    
    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  if (!props.project) {
    selectedProjectId.value = undefined
    weightConfigs.value = []
    adjustReason.value = ''
  }
}

// 监听对话框显示
watch(visible, (newVal) => {
  if (newVal) {
    if (props.mode === 'global') {
      loadWeightConfig()
    } else if (props.project) {
      loadWeightConfig(props.project.id)
    } else {
      getProjects()
    }
  }
})

// 初始化
onMounted(() => {
  if (visible.value) {
    if (props.mode === 'global') {
      loadWeightConfig()
    } else if (props.project) {
      loadWeightConfig(props.project.id)
    } else {
      getProjects()
    }
  }
})
</script>

<style lang="scss" scoped>
.weight-config-content {
  .mode-intro {
    margin-bottom: 20px;
  }
  
  .project-section,
  .project-info-section,
  .weight-table-section,
  .reason-section,
  .quick-adjust-section {
    margin-bottom: 24px;
    
    h3, h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    h4 {
      font-size: 14px;
    }

    .header-with-help {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      
      .help-icon {
        cursor: help;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .project-info-section {
    background-color: #f8f9fb;
    padding: 2px;
    border-radius: 4px;
  }
  
  .weight-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  
  .weight-bar {
    position: relative;
    height: 24px;
    background: #f0f2f5;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    
    .weight-fill {
      height: 100%;
      background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .weight-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-weight: bold;
      color: #303133;
      text-shadow: 0 0 2px #fff;
    }
  }
  
  .weight-summary {
    margin-top: 16px;
    padding: 16px;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    border-radius: 6px;
    
    .summary-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .label {
        font-weight: 500;
        margin-right: 8px;
        color: #606266;
      }
      
      .value {
        font-size: 20px;
        font-weight: bold;
        
        &.valid {
          color: #67c23a;
        }
        
        &.invalid {
          color: #f56c6c;
        }
      }
    }
    
    .weight-warning {
      margin-top: 8px;
    }
  }
  
  .adjust-tools {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px; border: 1px dashed #dcdfe6;
  }
  
  .empty-state {
    padding: 60px 0;
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
</style>