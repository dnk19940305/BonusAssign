<template>
  <el-row :gutter="20" class="overview-cards">
    <el-col :span="6">
      <el-card class="metric-card total-bonus">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">¥{{ formatNumber(bonusData.totalBonus) }}</div>
            <div class="metric-label">本期总奖金</div>
            <div class="metric-description">包含基础奖金和项目奖金</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="metric-card profit-contribution">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">¥{{ formatNumber(bonusData.bonusBreakdown.profitContribution) }}</div>
            <div class="metric-label">利润贡献奖金</div>
            <div class="metric-description">基于公司整体利润分配</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="metric-card position-value">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">¥{{ formatNumber(bonusData.bonusBreakdown.positionValue) }}</div>
            <div class="metric-label">岗位价值奖金</div>
            <div class="metric-description">基于岗位基准价值</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :span="6">
      <el-card class="metric-card performance-bonus">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">¥{{ formatNumber(bonusData.bonusBreakdown.performance) }}</div>
            <div class="metric-label">绩效奖金</div>
            <div class="metric-description">基于个人绩效表现</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Money, TrendCharts, Trophy, Medal } from '@element-plus/icons-vue'
import type { BonusBreakdown } from '@/api/personalBonus'

interface BonusData {
  totalBonus: number
  bonusBreakdown: BonusBreakdown
}

defineProps<{
  bonusData: BonusData
}>()

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num || 0)
}
</script>

<style scoped lang="scss">
.overview-cards {
  margin-bottom: 20px;
}

.metric-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
  }

  &.total-bonus {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.profit-contribution {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  &.position-value {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
  }

  &.performance-bonus {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
  }
}

.metric-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.metric-icon {
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

.metric-info {
  flex: 1;

  .metric-value {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }

  .metric-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 4px;
  }

  .metric-description {
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>
