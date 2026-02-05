<template>
  <div class="milestone-gantt">
    <div class="gantt-header">
      <div class="header-left">
        <h3>里程碑甘特图</h3>
        <el-tag type="info" size="small">
          共 {{ milestones.length }} 个里程碑
        </el-tag>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button 
            :type="viewMode === 'day' ? 'primary' : ''" 
            size="small"
            @click="changeViewMode('day')"
          >
            日
          </el-button>
          <el-button 
            :type="viewMode === 'week' ? 'primary' : ''" 
            size="small"
            @click="changeViewMode('week')"
          >
            周
          </el-button>
          <el-button 
            :type="viewMode === 'month' ? 'primary' : ''" 
            size="small"
            @click="changeViewMode('month')"
          >
            月
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button 
          :icon="EditPen" 
          size="small"
          :type="editMode ? 'primary' : ''"
          @click="toggleEditMode"
        >
          {{ editMode ? '退出编辑' : '编辑模式' }}
        </el-button>
        
        <el-button 
          :icon="Refresh" 
          size="small"
          @click="$emit('refresh')"
        >
          刷新
        </el-button>
      </div>
    </div>

    <div class="gantt-container" ref="ganttContainer">
      <el-empty v-if="!milestones.length" description="暂无里程碑数据" />
      
      <div v-else class="gantt-chart-wrapper">
        <!-- 里程碑列表 -->
        <div class="gantt-list">
          <div class="list-header">
            <div class="list-cell name-cell">里程碑名称</div>
            <div class="list-cell status-cell">状态</div>
            <div class="list-cell progress-cell">进度</div>
            <div class="list-cell date-cell">目标日期</div>
          </div>
          <div 
            class="list-row" 
            v-for="task in ganttTasks" 
            :key="task.id"
            :style="{ height: rowHeight + 'px' }"
          >
            <div class="list-cell name-cell">
              <el-icon v-if="task.dependencies?.length" style="margin-right: 4px; color: #409eff;">
                <Connection />
              </el-icon>
              {{ task.label }}
            </div>
            <div class="list-cell status-cell">
              <el-tag :type="getStatusTagType(task.status)" size="small">
                {{ getStatusLabel(task.status) }}
              </el-tag>
            </div>
            <div class="list-cell progress-cell">
              <el-progress 
                :percentage="task.progress" 
                :stroke-width="8"
                :show-text="false"
              />
              <span class="progress-text">{{ task.progress }}%</span>
            </div>
            <div class="list-cell date-cell">
              {{ formatDate(task.end) }}
            </div>
          </div>
        </div>

        <!-- 甘特图时间轴和条形图 -->
        <div class="gantt-timeline" ref="timelineContainer">
          <svg 
            :width="timelineWidth" 
            :height="timelineHeight"
            class="gantt-svg"
          >
            <!-- 时间刻度背景 -->
            <g class="timeline-grid">
              <rect 
                v-for="(col, index) in timeColumns" 
                :key="'bg-' + index"
                :x="col.x" 
                :y="0" 
                :width="col.width" 
                :height="timelineHeight"
                :fill="index % 2 === 0 ? '#fafafa' : '#fff'"
              />
              <line 
                v-for="(col, index) in timeColumns" 
                :key="'line-' + index"
                :x1="col.x" 
                :y1="0" 
                :x2="col.x" 
                :y2="timelineHeight"
                stroke="#e4e7ed"
                stroke-width="1"
              />
            </g>

            <!-- 今日线 -->
            <line 
              v-if="todayX > 0"
              :x1="todayX" 
              :y1="0" 
              :x2="todayX" 
              :y2="timelineHeight"
              stroke="#f56c6c"
              stroke-width="2"
              stroke-dasharray="5,5"
            />

            <!-- 里程碑条形 -->
            <g class="milestone-bars">
              <g 
                v-for="(task, index) in ganttTasks" 
                :key="task.id"
                :transform="`translate(0, ${headerHeight + index * rowHeight})`"
              >
                <!-- 条形背景 -->
                <rect 
                  :x="task.barX" 
                  :y="(rowHeight - barHeight) / 2" 
                  :width="task.barWidth" 
                  :height="barHeight"
                  :fill="getBarColor(task.status)"
                  :opacity="0.9"
                  :rx="4"
                  class="milestone-bar"
                  :class="{ 'editable': editMode }"
                  @mousedown="editMode && startDrag(task, $event)"
                />
                
                <!-- 进度条 -->
                <rect 
                  :x="task.barX" 
                  :y="(rowHeight - barHeight) / 2" 
                  :width="task.barWidth * task.progress / 100" 
                  :height="barHeight"
                  :fill="getProgressColor(task.status)"
                  :rx="4"
                  class="progress-bar"
                />
                
                <!-- 条形文字 -->
                <text 
                  :x="task.barX + task.barWidth / 2" 
                  :y="rowHeight / 2 + 5" 
                  text-anchor="middle"
                  fill="#fff"
                  font-size="12"
                  font-weight="500"
                  v-if="task.barWidth > 80"
                >
                  {{ task.progress }}%
                </text>
              </g>
            </g>

            <!-- 依赖关系连线 -->
            <g class="dependency-lines">
              <g v-for="dep in dependencyLines" :key="dep.key">
                <path 
                  :d="dep.path" 
                  fill="none"
                  stroke="#409eff"
                  stroke-width="2"
                  :stroke-dasharray="dep.isCircular ? '5,5' : ''"
                  marker-end="url(#arrowhead)"
                />
              </g>
            </g>

            <!-- 箭头标记 -->
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#409eff" />
              </marker>
            </defs>
          </svg>

          <!-- 时间刻度标签 -->
          <div class="timeline-header" :style="{ width: timelineWidth + 'px' }">
            <div 
              v-for="(col, index) in timeColumns" 
              :key="'header-' + index"
              class="time-label"
              :style="{ left: col.x + 'px', width: col.width + 'px' }"
            >
              {{ col.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑提示 -->
    <el-alert 
      v-if="editMode" 
      title="编辑模式已开启" 
      type="info" 
      :closable="false"
      class="edit-tip"
    >
      拖拽里程碑条形可调整时间，拖拽结束后自动保存
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Refresh, Connection } from '@element-plus/icons-vue'
import type { Milestone } from '@/api/milestone'
import { updateMilestone } from '@/api/milestone'

interface Props {
  milestones: Milestone[]
  projectId: string
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true
})

const emit = defineEmits(['refresh', 'update'])

// 响应式数据
const viewMode = ref<'day' | 'week' | 'month'>('week')
const editMode = ref(false)
const ganttContainer = ref<HTMLElement>()
const timelineContainer = ref<HTMLElement>()

// 常量
const rowHeight = 40
const barHeight = 24
const headerHeight = 40
const dayWidth = 30  // 每天的宽度（像素）

// 计算时间范围
const timeRange = computed(() => {
  if (!props.milestones.length) {
    const today = new Date()
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
    }
  }

  const dates = props.milestones.map(m => new Date(m.targetDate))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

  // 扩展一些缓冲时间
  const start = new Date(minDate)
  start.setDate(start.getDate() - 7)
  
  const end = new Date(maxDate)
  end.setDate(end.getDate() + 14)

  return { start, end }
})

// 计算时间列
const timeColumns = computed(() => {
  const { start, end } = timeRange.value
  const columns: Array<{ x: number; width: number; label: string; date: Date }> = []
  
  let currentDate = new Date(start)
  let x = 0

  if (viewMode.value === 'day') {
    while (currentDate <= end) {
      columns.push({
        x,
        width: dayWidth,
        label: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        date: new Date(currentDate)
      })
      x += dayWidth
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (viewMode.value === 'week') {
    // 调整到周一
    while (currentDate.getDay() !== 1) {
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    while (currentDate <= end) {
      const weekWidth = dayWidth * 7
      columns.push({
        x,
        width: weekWidth,
        label: `第${getWeekNumber(currentDate)}周`,
        date: new Date(currentDate)
      })
      x += weekWidth
      currentDate.setDate(currentDate.getDate() + 7)
    }
  } else {
    // 月视图
    currentDate = new Date(start.getFullYear(), start.getMonth(), 1)
    
    while (currentDate <= end) {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
      const monthWidth = dayWidth * daysInMonth / 2 // 月视图缩小显示
      
      columns.push({
        x,
        width: monthWidth,
        label: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`,
        date: new Date(currentDate)
      })
      x += monthWidth
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  }

  return columns
})

// 时间轴宽度和高度
const timelineWidth = computed(() => {
  const lastCol = timeColumns.value[timeColumns.value.length - 1]
  return lastCol ? lastCol.x + lastCol.width : 800
})

const timelineHeight = computed(() => {
  return headerHeight + props.milestones.length * rowHeight
})

// 今日线位置
const todayX = computed(() => {
  const today = new Date()
  return dateToX(today)
})

// 转换里程碑为甘特图任务
const ganttTasks = computed(() => {
  return props.milestones.map(milestone => {
    const startDate = new Date(milestone.targetDate)
    startDate.setDate(startDate.getDate() - 7) // 假设每个里程碑持续7天
    
    const endDate = new Date(milestone.targetDate)
    
    const barX = dateToX(startDate)
    const barWidth = dateToX(endDate) - barX

    return {
      id: milestone.id!,
      label: milestone.name,
      start: startDate,
      end: endDate,
      status: milestone.status,
      progress: milestone.progress,
      dependencies: milestone.dependencies || [],
      barX,
      barWidth
    }
  })
})

// 计算依赖关系连线
const dependencyLines = computed(() => {
  const lines: Array<{ key: string; path: string; isCircular: boolean }> = []
  
  ganttTasks.value.forEach((task, index) => {
    if (task.dependencies?.length) {
      task.dependencies.forEach(depId => {
        const depTask = ganttTasks.value.find(t => t.id === depId)
        if (depTask) {
          const depIndex = ganttTasks.value.indexOf(depTask)
          
          // 起点：依赖任务的末端
          const startX = depTask.barX + depTask.barWidth
          const startY = headerHeight + depIndex * rowHeight + rowHeight / 2
          
          // 终点：当前任务的起点
          const endX = task.barX
          const endY = headerHeight + index * rowHeight + rowHeight / 2
          
          // 检测循环依赖
          const isCircular = checkCircularDependency(task.id, depId, ganttTasks.value)
          
          // 绘制连线路径
          const midX = (startX + endX) / 2
          const path = `M ${startX} ${startY} 
                       C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
          
          lines.push({
            key: `${depId}-${task.id}`,
            path,
            isCircular
          })
        }
      })
    }
  })
  
  return lines
})

// 辅助函数：日期转X坐标
function dateToX(date: Date): number {
  const { start } = timeRange.value
  const daysDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (viewMode.value === 'day') {
    return daysDiff * dayWidth
  } else if (viewMode.value === 'week') {
    return daysDiff * dayWidth
  } else {
    return daysDiff * dayWidth / 2
  }
}

// 辅助函数:X坐标转日期
function xToDate(x: number): Date {
  const { start } = timeRange.value
  let days = 0
  
  if (viewMode.value === 'day') {
    days = x / dayWidth
  } else if (viewMode.value === 'week') {
    days = x / dayWidth
  } else {
    days = x / dayWidth * 2
  }
  
  const date = new Date(start)
  date.setDate(date.getDate() + days)
  return date
}

// 获取周数
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// 检测循环依赖
function checkCircularDependency(taskId: string, depId: string, tasks: any[]): boolean {
  const visited = new Set<string>()
  
  function hasPath(from: string, to: string): boolean {
    if (from === to) return true
    if (visited.has(from)) return false
    
    visited.add(from)
    
    const task = tasks.find(t => t.id === from)
    if (task?.dependencies) {
      for (const dep of task.dependencies) {
        if (hasPath(dep, to)) return true
      }
    }
    
    return false
  }
  
  return hasPath(depId, taskId)
}

// 格式化日期
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    delayed: '延期',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 获取状态标签类型
function getStatusTagType(status: string): string {
  const types: Record<string, string> = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success',
    delayed: 'warning',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取条形颜色
function getBarColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#909399',
    in_progress: '#409eff',
    completed: '#67c23a',
    delayed: '#e6a23c',
    cancelled: '#f56c6c'
  }
  return colors[status] || '#909399'
}

// 获取进度条颜色
function getProgressColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#606266',
    in_progress: '#0d84ff',
    completed: '#529b2e',
    delayed: '#c77c11',
    cancelled: '#c03639'
  }
  return colors[status] || '#606266'
}

// 切换视图模式
function changeViewMode(mode: 'day' | 'week' | 'month') {
  viewMode.value = mode
}

// 切换编辑模式
function toggleEditMode() {
  if (!props.canEdit) {
    ElMessage.warning('您没有编辑权限')
    return
  }
  editMode.value = !editMode.value
}

// 拖拽相关
let dragTask: any = null
let dragStartX = 0
let dragStartBarX = 0

function startDrag(task: any, event: MouseEvent) {
  dragTask = task
  dragStartX = event.clientX
  dragStartBarX = task.barX
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  
  event.preventDefault()
}

function onDrag(event: MouseEvent) {
  if (!dragTask) return
  
  const deltaX = event.clientX - dragStartX
  const newBarX = dragStartBarX + deltaX
  
  // 更新任务位置（视觉反馈）
  dragTask.barX = Math.max(0, Math.min(newBarX, timelineWidth.value - dragTask.barWidth))
}

function stopDrag() {
  if (!dragTask) return
  
  // 计算新的日期
  const newStartDate = xToDate(dragTask.barX)
  const newEndDate = xToDate(dragTask.barX + dragTask.barWidth)
  
  // 更新里程碑
  updateMilestoneDate(dragTask.id, newEndDate)
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  dragTask = null
}

// 更新里程碑日期
async function updateMilestoneDate(milestoneId: string, newDate: Date) {
  try {
    await updateMilestone(milestoneId, {
      targetDate: formatDate(newDate)
    })
    
    ElMessage.success('里程碑时间已更新')
    emit('refresh')
  } catch (error: any) {
    ElMessage.error('更新失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped lang="scss">
.milestone-gantt {
  .gantt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .gantt-container {
    padding: 16px;
    background: #fff;
  }

  .gantt-chart-wrapper {
    display: flex;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
  }

  .gantt-list {
    flex-shrink: 0;
    width: 400px;
    border-right: 2px solid #e4e7ed;
    background: #fafafa;

    .list-header {
      display: flex;
      height: 40px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 500;
      font-size: 13px;
      color: #606266;
    }

    .list-row {
      display: flex;
      border-bottom: 1px solid #e4e7ed;
      background: #fff;

      &:hover {
        background: #f5f7fa;
      }
    }

    .list-cell {
      display: flex;
      align-items: center;
      padding: 0 12px;
      border-right: 1px solid #e4e7ed;

      &:last-child {
        border-right: none;
      }

      &.name-cell {
        flex: 1;
        min-width: 0;
        font-weight: 500;
      }

      &.status-cell {
        width: 80px;
        justify-content: center;
      }

      &.progress-cell {
        width: 100px;
        gap: 8px;

        .el-progress {
          flex: 1;
        }

        .progress-text {
          font-size: 12px;
          color: #909399;
        }
      }

      &.date-cell {
        width: 100px;
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .gantt-timeline {
    flex: 1;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;

    .timeline-header {
      position: sticky;
      top: 0;
      height: 40px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      z-index: 10;

      .time-label {
        position: absolute;
        top: 0;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #606266;
        border-right: 1px solid #e4e7ed;
      }
    }

    .gantt-svg {
      display: block;

      .milestone-bar {
        cursor: default;

        &.editable {
          cursor: move;

          &:hover {
            opacity: 1 !important;
            filter: brightness(1.1);
          }
        }
      }
    }
  }

  .edit-tip {
    margin-top: 16px;
  }
}
</style>
