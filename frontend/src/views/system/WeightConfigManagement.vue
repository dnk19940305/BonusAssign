<template>
  <div class="page-container">
       <!-- 页面头部 -->
    <div class="page-header flex flex-between">
      <h2>三维权重配置管理</h2>
     <PermissionButton :permissions="['admin','*']" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增配置方案
          </PermissionButton>
    </div>
    <el-card>
      <!-- 配置列表 -->
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="name" label="配置名称" width="200" />
        <el-table-column prop="code" label="配置代码" width="150" />
        <el-table-column label="三维权重" width="300">
          <template #default="{ row }">
            <div class="weight-display">
              <el-tag type="danger">利润 {{ (row.profitContributionWeight * 100).toFixed(0) }}%</el-tag>
              <el-tag type="warning">岗位 {{ (row.positionValueWeight * 100).toFixed(0) }}%</el-tag>
              <el-tag type="success">绩效 {{ (row.performanceWeight * 100).toFixed(0) }}%</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '生效中' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="120">
          <template #default="{ row }">
            {{ row.effectiveDate ? new Date(row.effectiveDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <PermissionButton :permissions="['admin','*']" link type="primary" size="small" @click="handleView(row)">查看</PermissionButton>
            <PermissionButton :permissions="['admin','*']" link type="primary" size="small" @click="handleEdit(row)">编辑</PermissionButton>
            <PermissionButton :permissions="['admin','*']" link type="warning" size="small" @click="handleCopy(row)">复制</PermissionButton>
            <PermissionButton :permissions="['admin','*']" link type="danger" size="small" @click="handleDelete(row)">删除</PermissionButton>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="limit"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 配置详情/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="160px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配置名称" />
        </el-form-item>

        <el-form-item label="配置代码" prop="code">
          <el-input v-model="formData.code" placeholder="如: CONFIG_2025Q1" :disabled="!!formData.id" />
        </el-form-item>

        <el-form-item label="配置描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker
            v-model="formData.effectiveDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="active">生效</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 三维主权重 -->
        <el-divider content-position="left">三维主权重配置</el-divider>
        
        <el-alert
          title="权重总和必须等于1.0 (100%)"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            当前总和: <strong>{{ mainWeightSum.toFixed(2) }}</strong>
            <el-tag v-if="mainWeightSum === 1" type="success" size="small" style="margin-left: 10px">✓ 正确</el-tag>
            <el-tag v-else type="danger" size="small" style="margin-left: 10px">✗ 需调整</el-tag>
          </template>
        </el-alert>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="利润贡献度权重" prop="profitContributionWeight">
              <el-slider v-model="formData.profitContributionWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.profitContributionWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="岗位价值权重" prop="positionValueWeight">
              <el-slider v-model="formData.positionValueWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionValueWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="绩效表现权重" prop="performanceWeight">
              <el-slider v-model="formData.performanceWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>

        <PermissionButton :permissions="['admin','*']" type="primary" size="small" @click="autoAdjustMainWeights">自动平衡权重</PermissionButton>

        <!-- 利润贡献子权重 -->
        <el-divider content-position="left">利润贡献子权重</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="直接贡献">
              <el-slider v-model="formData.profitDirectContributionWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.profitDirectContributionWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工作量">
              <el-slider v-model="formData.profitWorkloadWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.profitWorkloadWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="质量">
              <el-slider v-model="formData.profitQualityWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.profitQualityWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="岗位价值">
              <el-slider v-model="formData.profitPositionValueWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.profitPositionValueWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 岗位价值子权重 -->
        <el-divider content-position="left">岗位价值子权重</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="技能复杂度">
              <el-slider v-model="formData.positionSkillComplexityWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionSkillComplexityWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="责任范围">
              <el-slider v-model="formData.positionResponsibilityWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionResponsibilityWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="决策影响">
              <el-slider v-model="formData.positionDecisionImpactWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionDecisionImpactWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="经验要求">
              <el-slider v-model="formData.positionExperienceWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionExperienceWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="市场价值">
              <el-slider v-model="formData.positionMarketValueWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.positionMarketValueWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 绩效表现子权重 -->
        <el-divider content-position="left">绩效表现子权重</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="工作产出">
              <el-slider v-model="formData.performanceWorkOutputWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceWorkOutputWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工作质量">
              <el-slider v-model="formData.performanceWorkQualityWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceWorkQualityWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工作效率">
              <el-slider v-model="formData.performanceWorkEfficiencyWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceWorkEfficiencyWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="协作能力">
              <el-slider v-model="formData.performanceCollaborationWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceCollaborationWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="创新能力">
              <el-slider v-model="formData.performanceInnovationWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceInnovationWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="领导力">
              <el-slider v-model="formData.performanceLeadershipWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceLeadershipWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学习能力">
              <el-slider v-model="formData.performanceLearningWeight" :min="0" :max="1" :step="0.01" />
              <div class="weight-value">{{ (formData.performanceLearningWeight * 100).toFixed(0) }}%</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PermissionButton from '@/components/PermissionButton.vue'
import {
  getWeightConfigs,
  createWeightConfig,
  updateWeightConfig,
  deleteWeightConfig,
  copyWeightConfig
} from '@/api/weightConfig'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const tableData = ref<any[]>([])
const viewMode = ref(false)

const formData = reactive({
  id: null as string | null,
  name: '',
  code: '',
  description: '',
  profitContributionWeight: 0.4,
  positionValueWeight: 0.3,
  performanceWeight: 0.3,
  profitDirectContributionWeight: 0.4,
  profitWorkloadWeight: 0.3,
  profitQualityWeight: 0.2,
  profitPositionValueWeight: 0.1,
  positionSkillComplexityWeight: 0.25,
  positionResponsibilityWeight: 0.3,
  positionDecisionImpactWeight: 0.2,
  positionExperienceWeight: 0.15,
  positionMarketValueWeight: 0.1,
  performanceWorkOutputWeight: 0.25,
  performanceWorkQualityWeight: 0.2,
  performanceWorkEfficiencyWeight: 0.15,
  performanceCollaborationWeight: 0.15,
  performanceInnovationWeight: 0.1,
  performanceLeadershipWeight: 0.1,
  performanceLearningWeight: 0.05,
  effectiveDate: new Date(),
  status: 'draft'
})

const formRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入配置代码', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  if (viewMode.value) return '查看权重配置'
  return formData.id ? '编辑权重配置' : '新增权重配置'
})

const mainWeightSum = computed(() => {
  return formData.profitContributionWeight + formData.positionValueWeight + formData.performanceWeight
})

const fetchList = async () => {
  try {
    loading.value = true
    const response = await getWeightConfigs({ page: page.value, limit: limit.value })
    
    // 添加调试日志
    console.log('权重配置接口响应:', response)
    console.log('响应数据:', response.data)
    console.log('列表数据:', response.data.list)
    console.log('第一条数据:', response.data.list?.[0])
    
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取配置列表失败')
  } finally {
    loading.value = false
  }
}

const autoAdjustMainWeights = () => {
  const total = mainWeightSum.value
  if (total === 0) return
  
  formData.profitContributionWeight = Number((formData.profitContributionWeight / total).toFixed(3))
  formData.positionValueWeight = Number((formData.positionValueWeight / total).toFixed(3))
  formData.performanceWeight = Number((1 - formData.profitContributionWeight - formData.positionValueWeight).toFixed(3))
}

const handleCreate = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    code: '',
    description: '',
    profitContributionWeight: 0.4,
    positionValueWeight: 0.3,
    performanceWeight: 0.3,
    effectiveDate: new Date(),
    status: 'draft'
  })
  viewMode.value = false
  dialogVisible.value = true
}

const handleView = (row: any) => {
  Object.assign(formData, row)
  viewMode.value = true
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(formData, row)
  viewMode.value = false
  dialogVisible.value = true
}

const handleCopy = async (row: any) => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入新配置的名称', '复制权重配置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '配置名称不能为空'
    })

    await copyWeightConfig(row.id, {
      name,
      code: `${row.code}_COPY_${Date.now()}`
    })

    ElMessage.success('复制成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '复制失败')
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个权重配置吗?', '确认删除', { type: 'warning' })
    
    await deleteWeightConfig(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (viewMode.value) {
    dialogVisible.value = false
    return
  }

  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (Math.abs(mainWeightSum.value - 1) > 0.001) {
      ElMessage.warning('三维主权重总和必须等于1.0')
      return
    }

    try {
      submitting.value = true
      const { id, ...data } = formData
      if (id) {
        await updateWeightConfig(id, data)
        ElMessage.success('更新成功')
      } else {
        await createWeightConfig(data as any)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  viewMode.value = false
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.weight-config-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .weight-display {
    display: flex;
    gap: 8px;
  }

  .weight-value {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: var(--el-color-primary);
    margin-top: 4px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
