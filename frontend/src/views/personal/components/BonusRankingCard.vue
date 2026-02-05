<template>
  <el-row v-if="ranking?.scoreRank" :gutter="20" class="ranking-section">
    <el-col :span="24">
      <el-card class="ranking-card">
        <template #header>
          <div class="card-header">
            <span>🏆 排名与百分位</span>
            <el-tag v-if="ranking.percentileRank > 0" :type="getPercentileType(ranking.percentileRank)" size="large">
              前 {{ ranking.percentileRank.toFixed(1) }}%
            </el-tag>
          </div>
        </template>
        
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="ranking-item">
              <div class="ranking-icon">🌐</div>
              <div class="ranking-value">第 {{ ranking.scoreRank }} 名</div>
              <div class="ranking-label">全公司排名</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="ranking-item">
              <div class="ranking-icon">🏛️</div>
              <div class="ranking-value">
                {{ ranking.departmentRank ? `第 ${ranking.departmentRank} 名` : '暂无数据' }}
              </div>
              <div class="ranking-label">部门内排名</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="ranking-item">
              <div class="ranking-icon">📊</div>
              <div class="ranking-value">
                {{ ranking.levelRank ? `第 ${ranking.levelRank} 名` : '暂无数据' }}
              </div>
              <div class="ranking-label">同级别排名</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="ranking-item">
              <div class="ranking-icon">🎯</div>
              <div class="ranking-value">
                {{ ranking.percentileRank > 0 ? `前 ${ranking.percentileRank.toFixed(1)}%` : '暂无数据' }}
              </div>
              <div class="ranking-label">百分位排名</div>
            </div>
          </el-col>
        </el-row>

        <div v-if="trend?.trendDirection" class="trend-info">
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="trend-item">
                <el-tag :type="getTrendType(trend.trendDirection)" size="large">
                  {{ getTrendLabel(trend.trendDirection) }}
                </el-tag>
                <div class="trend-label">趋势方向</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="trend-item">
                <div class="trend-value primary">
                  {{ trend.previousPeriodScore > 0 ? trend.previousPeriodScore.toFixed(2) : '暂无' }}
                </div>
                <div class="trend-label">上期评分</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="trend-item">
                <div class="trend-value" :class="trend.scoreChangeRate >= 0 ? 'success' : 'danger'">
                  {{ trend.scoreChangeRate >= 0 ? '+' : '' }}{{ trend.scoreChangeRate.toFixed(2) }}%
                </div>
                <div class="trend-label">较上期变化</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
interface Ranking {
  scoreRank: number | null
  percentileRank: number
  departmentRank: number | null
  levelRank: number | null
}

interface Trend {
  previousPeriodScore: number
  scoreChangeRate: number
  trendDirection: string | null
}

defineProps<{
  ranking: Ranking | null
  trend?: Trend | null
}>()

const getPercentileType = (percentile: number) => {
  if (percentile <= 10) return 'success'
  if (percentile <= 30) return 'primary'
  if (percentile <= 50) return 'info'
  return 'warning'
}

const getTrendType = (direction: string | null) => {
  if (direction === 'up') return 'success'
  if (direction === 'down') return 'danger'
  return 'info'
}

const getTrendLabel = (direction: string | null) => {
  if (direction === 'up') return '↑ 上升趋势'
  if (direction === 'down') return '↓ 下降趋势'
  return '→ 持平'
}
</script>

<style scoped lang="scss">
.ranking-section {
  margin-bottom: 20px;
}

.ranking-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.ranking-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    border-color: #409eff;
  }

  .ranking-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .ranking-value {
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 8px;
    font-family: 'Arial', sans-serif;
  }

  .ranking-label {
    font-size: 13px;
    color: #909399;
    font-weight: 500;
  }
}

.trend-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.trend-item {
  text-align: center;
}

.trend-value {
  font-size: 20px;
  font-weight: bold;
  
  &.primary { color: #409eff; }
  &.success { color: #67c23a; }
  &.danger { color: #f56c6c; }
}

.trend-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
