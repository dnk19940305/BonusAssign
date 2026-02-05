<template>
  <div class="project-based-view">
    <!-- 项目统计概览卡片 -->
    <el-row :gutter="20" class="project-overview">
      <el-col :span="6">
        <el-card class="stat-card projects">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ projectStats.totalProjects }}</div>
              <div class="stat-label">参与项目数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card total-bonus">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatNumber(projectStats.totalBonus) }}</div>
              <div class="stat-label">项目总奖金</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card average">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatNumber(projectStats.averagePerProject) }}</div>
              <div class="stat-label">平均项目奖金</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card max">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatNumber(projectStats.maxProjectBonus) }}</div>
              <div class="stat-label">最高项目奖金</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 项目奖金分布图表 -->
    <el-card class="distribution-card" header="项目奖金分布">
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>

    <!-- 项目列表 -->
    <el-card class="project-list-card" header="项目明细">
      <div v-if="projectList.length === 0" class="empty-state">
        <el-empty description="暂无项目奖金数据" />
      </div>
      <div v-else class="project-cards">
        <div 
          v-for="project in projectList" 
          :key="project.projectId"
          class="project-item-card"
        >
          <div class="project-header">
            <div class="project-name">
              <el-icon class="project-icon"><Folder /></el-icon>
              {{ project.projectName }}
            </div>
            <div class="project-amount">¥{{ formatNumber(project.totalAmount) }}</div>
          </div>
          <div class="project-details">
            <div class="detail-row">
              <span class="detail-label">涉及期间：</span>
              <el-tag 
                v-for="period in project.periods" 
                :key="period" 
                size="small" 
                class="period-tag"
              >
                {{ period }}
              </el-tag>
            </div>
            <div class="detail-row">
              <span class="detail-label">担任角色：</span>
              <el-tag 
                v-for="role in project.roles" 
                :key="role" 
                type="success" 
                size="small"
                class="role-tag"
              >
                {{ role }}
              </el-tag>
            </div>
            <div class="detail-row">
              <span class="detail-label">分配次数：</span>
              <span>{{ project.allocations.length }} 次</span>
            </div>
          </div>
          <div class="project-actions">
            <el-button size="small" @click="showProjectDetail(project)">
              查看明细
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 项目明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`${currentProject?.projectName || ''} - 奖金明细`"
      width="70%"
    >
      <el-table :data="currentProject?.allocations || []" stripe>
        <el-table-column prop="period" label="期间" width="120" />
        <el-table-column prop="role" label="角色" width="150" />
        <el-table-column prop="amount" label="奖金金额" width="150">
          <template #default="{ row }">
            ¥{{ formatNumber(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { FolderOpened, Money, TrendCharts, Trophy, Folder } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

interface ProjectAllocation {
  period: string
  role: string
  amount: number
  status: string
}

interface ProjectItem {
  projectId: string
  projectName: string
  totalAmount: number
  periods: string[]
  roles: string[]
  allocations: ProjectAllocation[]
}

interface ProjectData {
  projectBonus: {
    totalAmount: number
    projectCount: number
    allocations: any[]
  }
}

const props = defineProps<{
  projectData: ProjectData | null
}>()

// 响应式数据
const chartContainer = ref<HTMLElement>()
const detailDialogVisible = ref(false)
const currentProject = ref<ProjectItem | null>(null)

// 计算项目统计数据
const projectStats = computed(() => {
  if (!props.projectData?.projectBonus) {
    return {
      totalProjects: 0,
      totalBonus: 0,
      averagePerProject: 0,
      maxProjectBonus: 0
    }
  }

  const pb = props.projectData.projectBonus
  const projects = groupByProject.value

  return {
    totalProjects: pb.projectCount || 0,
    totalBonus: pb.totalAmount || 0,
    averagePerProject: pb.projectCount > 0 ? pb.totalAmount / pb.projectCount : 0,
    maxProjectBonus: Math.max(...projects.map(p => p.totalAmount), 0)
  }
})

// 按项目分组
const groupByProject = computed(() => {
  if (!props.projectData?.projectBonus?.allocations) return []

  const projectMap = new Map<string, ProjectItem>()

  props.projectData.projectBonus.allocations.forEach((allocation: any) => {
    const projectId = allocation.projectId || 'unknown'
    const projectName = allocation.projectName || '未知项目'

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        projectId,
        projectName,
        totalAmount: 0,
        periods: [],
        roles: [],
        allocations: []
      })
    }

    const project = projectMap.get(projectId)!
    project.totalAmount += allocation.amount || 0
    
    if (allocation.period && !project.periods.includes(allocation.period)) {
      project.periods.push(allocation.period)
    }
    
    if (allocation.role && !project.roles.includes(allocation.role)) {
      project.roles.push(allocation.role)
    }
    
    project.allocations.push({
      period: allocation.period || '-',
      role: allocation.role || '未知',
      amount: allocation.amount || 0,
      status: allocation.status || 'unknown'
    })
  })

  return Array.from(projectMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)
})

const projectList = computed(() => groupByProject.value)

// 工具方法
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num || 0)
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'approved': 'success',
    'pending': 'warning',
    'paid': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    'approved': '已批准',
    'pending': '待审批',
    'paid': '已发放',
    'rejected': '已拒绝'
  }
  return labelMap[status] || status
}

const showProjectDetail = (project: ProjectItem) => {
  currentProject.value = project
  detailDialogVisible.value = true
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || projectList.value.length === 0) return

  const chart = echarts.init(chartContainer.value)
  
  const data = projectList.value.map(p => ({
    name: p.projectName,
    value: p.totalAmount
  }))

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: 'center'
    },
    series: [
      {
        name: '项目奖金',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  })

  window.addEventListener('resize', () => chart.resize())
}

// 监听数据变化重新渲染图表
watch(() => props.projectData, () => {
  nextTick(() => initChart())
}, { deep: true })

onMounted(() => {
  nextTick(() => initChart())
})
</script>

<style scoped lang="scss">
.project-based-view {
  padding: 20px 0;
}

.project-overview {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &.projects {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.total-bonus {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  &.average {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
  }

  &.max {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-info {
  flex: 1;

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    opacity: 0.9;
  }
}

.distribution-card,
.project-list-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.chart-container {
  height: 400px;
  width: 100%;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.project-item-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
  }
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  .project-name {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    .project-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }

  .project-amount {
    font-size: 20px;
    font-weight: bold;
    color: #67c23a;
  }
}

.project-details {
  margin-bottom: 12px;

  .detail-row {
    margin-bottom: 8px;
    font-size: 13px;
    color: #606266;

    .detail-label {
      color: #909399;
      margin-right: 8px;
    }

    .period-tag,
    .role-tag {
      margin-right: 6px;
    }
  }
}

.project-actions {
  text-align: right;
}

.empty-state {
  padding: 40px 0;
}
</style>
