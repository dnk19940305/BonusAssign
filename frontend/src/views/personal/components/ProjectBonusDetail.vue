<template>
  <el-card class="detail-card">
    <template #header>
      <span>项目奖金明细</span>
    </template>
    
    <div v-if="hasData" class="project-participation">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 按项目统计 -->
        <el-tab-pane label="按项目统计" name="byProject">
          <div class="project-summary">
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-value">¥{{ formatNumber(statistics.totalAmount) }}</div>
                  <div class="summary-label">项目奖金总计</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-value">{{ statistics.projectCount }}</div>
                  <div class="summary-label">参与项目数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-item">
                  <div class="summary-value">{{ statistics.allocationCount }}</div>
                  <div class="summary-label">发放次数</div>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <div class="project-list">
            <div 
              v-for="(projectGroup, projectId) in groupedByProject"
              :key="projectId"
              class="project-group"
            >
              <div class="project-group-header">
                <div class="project-group-name">
                  <el-icon><Folder /></el-icon>
                  {{ projectGroup.projectName }}
                </div>
                <div class="project-group-total">
                  总计: ¥{{ formatNumber(projectGroup.totalAmount) }}
                  <el-tag size="small" style="margin-left: 8px;">{{ projectGroup.allocations.length }}次发放</el-tag>
                </div>
              </div>
              <div class="project-allocations">
                <div 
                  v-for="(allocation, idx) in projectGroup.allocations"
                  :key="idx"
                  class="allocation-item"
                >
                  <div class="allocation-info">
                    <div class="allocation-period">📅 {{ allocation.period }}</div>
                    <div class="allocation-role">💼 {{ allocation.role }}</div>
                  </div>
                  <div class="allocation-amount">¥{{ formatNumber(allocation.amount) }}</div>
                  <div class="allocation-status">
                    <el-tag :type="getStatusType(allocation.status)" size="small">{{ allocation.status }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 按期间统计 -->
        <el-tab-pane label="按期间统计" name="byPeriod">
          <div class="period-list">
            <div 
              v-for="(periodGroup, period) in groupedByPeriod"
              :key="period"
              class="period-group"
            >
              <div class="period-group-header">
                <div class="period-group-name">
                  <el-icon><Calendar /></el-icon>
                  {{ period }}
                </div>
                <div class="period-group-total">
                  总计: ¥{{ formatNumber(periodGroup.totalAmount) }}
                  <el-tag size="small" style="margin-left: 8px;">{{ periodGroup.allocations.length }}个项目</el-tag>
                </div>
              </div>
              <div class="period-allocations">
                <div 
                  v-for="(allocation, idx) in periodGroup.allocations"
                  :key="idx"
                  class="allocation-item"
                >
                  <div class="allocation-info">
                    <div class="allocation-project">📋 {{ allocation.projectName }}</div>
                    <div class="allocation-role">💼 {{ allocation.role }}</div>
                  </div>
                  <div class="allocation-amount">¥{{ formatNumber(allocation.amount) }}</div>
                  <div class="allocation-status">
                    <el-tag :type="getStatusType(allocation.status)" size="small">{{ allocation.status }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-empty v-else description="暂无项目参与记录" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, Calendar } from '@element-plus/icons-vue'

interface ProjectAllocation {
  projectId: string
  projectName: string
  period: string
  role: string
  amount: number
  status: string
}

interface Props {
  projectData: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  tabChange: [tabName: string]
}>()

const activeTab = ref<'byProject' | 'byPeriod'>('byProject')

const hasData = computed(() => {
  return props.projectData?.projectBonus?.allocations && props.projectData.projectBonus.allocations.length > 0
})

const groupedByProject = computed(() => {
  if (!hasData.value) return {}
  
  const grouped: Record<string, any> = {}
  const allocations = props.projectData.projectBonus.allocations
  
  allocations.forEach((allocation: any) => {
    const projectId = allocation.projectId || 'unknown'
    const projectName = allocation.projectName || '未知项目'
    
    if (!grouped[projectId]) {
      grouped[projectId] = {
        projectName,
        totalAmount: 0,
        allocations: []
      }
    }
    
    grouped[projectId].totalAmount += allocation.amount || 0
    grouped[projectId].allocations.push({
      period: allocation.period || '-',
      role: allocation.role || '未知角色',
      amount: allocation.amount || 0,
      status: allocation.status || 'unknown'
    })
  })
  
  return grouped
})

const groupedByPeriod = computed(() => {
  if (!hasData.value) return {}
  
  const grouped: Record<string, any> = {}
  const allocations = props.projectData.projectBonus.allocations
  
  allocations.forEach((allocation: any) => {
    const period = allocation.period || '未知期间'
    
    if (!grouped[period]) {
      grouped[period] = {
        totalAmount: 0,
        allocations: []
      }
    }
    
    grouped[period].totalAmount += allocation.amount || 0
    grouped[period].allocations.push({
      projectName: allocation.projectName || '未知项目',
      role: allocation.role || '未知角色',
      amount: allocation.amount || 0,
      status: allocation.status || 'unknown'
    })
  })
  
  return grouped
})

const statistics = computed(() => {
  if (!hasData.value) {
    return {
      totalAmount: 0,
      projectCount: 0,
      allocationCount: 0
    }
  }
  
  const allocations = props.projectData.projectBonus.allocations
  const totalAmount = allocations.reduce((sum: number, allocation: any) => sum + (allocation.amount || 0), 0)
  const projectIds = new Set(allocations.map((allocation: any) => allocation.projectId))
  
  return {
    totalAmount,
    projectCount: projectIds.size,
    allocationCount: allocations.length
  }
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num || 0)
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'completed': 'info',
    'pending': 'warning',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName as 'byProject' | 'byPeriod'
  emit('tabChange', tabName)
}
</script>

<style scoped lang="scss">
.detail-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  height: 100%;
}

.project-participation {
  padding: 10px 0;
}

.project-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;

  .summary-value {
    font-size: 20px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 4px;
  }

  .summary-label {
    font-size: 12px;
    color: #909399;
  }
}

.project-list,
.period-list {
  max-height: 400px;
  overflow-y: auto;
}

.project-group,
.period-group {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.project-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .project-group-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
  }

  .project-group-total {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
}

.period-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;

  .period-group-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
  }

  .period-group-total {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
}

.project-allocations,
.period-allocations {
  background: white;
}

.allocation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }
}

.allocation-info {
  flex: 1;

  .allocation-period,
  .allocation-project {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .allocation-role {
    font-size: 12px;
    color: #909399;
  }
}

.allocation-amount {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
  margin-right: 16px;
  min-width: 120px;
  text-align: right;
}

.allocation-status {
  min-width: 80px;
}
</style>
