<template>
  <el-card v-if="coefficients" class="coefficients-card">
    <template #header>
      <div class="card-header">
        <span>📊 奖金计算系数</span>
        <el-tag size="small" type="info">影响奖金的调节因素</el-tag>
      </div>
    </template>
    
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="coefficient-item">
          <div class="coefficient-label">🏢 岗位基准值</div>
          <div class="coefficient-value">{{ coefficients.benchmark.toFixed(2) }}</div>
          <div class="coefficient-range">范围: 0.1 - 3.0</div>
          <el-progress 
            :percentage="(coefficients.benchmark / 3.0 * 100)"
            :color="getProgressColor(coefficients.benchmark / 3.0)"
            :show-text="false"
          />
        </div>
      </el-col>
      <el-col :span="6">
        <div class="coefficient-item">
          <div class="coefficient-label">💼 业务线系数</div>
          <div class="coefficient-value">{{ coefficients.businessLine.toFixed(2) }}</div>
          <div class="coefficient-range">范围: 0.8 - 1.5</div>
          <el-progress 
            :percentage="((coefficients.businessLine - 0.8) / 0.7 * 100)"
            :color="getProgressColor((coefficients.businessLine - 0.8) / 0.7)"
            :show-text="false"
          />
        </div>
      </el-col>
      <el-col :span="6">
        <div class="coefficient-item">
          <div class="coefficient-label">🌆 城市系数</div>
          <div class="coefficient-value">{{ coefficients.city.toFixed(2) }}</div>
          <div class="coefficient-range">范围: 0.8 - 1.3</div>
          <el-progress 
            :percentage="((coefficients.city - 0.8) / 0.5 * 100)"
            :color="getProgressColor((coefficients.city - 0.8) / 0.5)"
            :show-text="false"
          />
        </div>
      </el-col>
      <!-- ✅ 时间系数已移除，不再展示 -->
    </el-row>
    
    <div class="coefficient-formula">
      <div class="formula-label">📝 奖金计算公式：</div>
      <div class="formula-content">
        最终奖金 = 基础奖金 × 
        <span class="formula-value primary">{{ coefficients.benchmark.toFixed(2) }}</span> (岗位) × 
        <span class="formula-value success">{{ coefficients.businessLine.toFixed(2) }}</span> (业务线) × 
        <span class="formula-value warning">{{ coefficients.city.toFixed(2) }}</span> (城市)
        <!-- ✅ 移除时间系数 -->
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Coefficients {
  businessLine: number
  city: number
  // time: number  // ✅ 已移除，保留注释以便记录
  benchmark: number
}

defineProps<{
  coefficients: Coefficients | null
}>()

const getProgressColor = (ratio: number) => {
  if (ratio < 0.3) return '#f56c6c'
  if (ratio < 0.6) return '#e6a23c'
  return '#67c23a'
}
</script>

<style scoped lang="scss">
.coefficients-card {
  margin-bottom: 20px;
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

.coefficient-item {
  text-align: center;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;

  .coefficient-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .coefficient-value {
    font-size: 28px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 4px;
    font-family: 'Arial', sans-serif;
  }

  .coefficient-range {
    font-size: 12px;
    color: #909399;
    margin-bottom: 12px;
  }
}

.coefficient-formula {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.8;

  .formula-label {
    color: #606266;
    margin-bottom: 8px;
  }

  .formula-content {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #303133;
  }

  .formula-value {
    font-weight: bold;
    
    &.primary { color: #409eff; }
    &.success { color: #67c23a; }
    &.warning { color: #e6a23c; }
    &.danger { color: #f56c6c; }
  }
}
</style>
