<template>
  <div class="position-detail">
    <div class="page-header flex gap-16 mb-20">
      <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
      <h2 class="flex-1">{{ position?.name || '岗位详情' }}</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="position" class="detail-content">
      <!-- 页面操作栏 -->
      <div class="page-actions flex gap-16" v-if="hasEditPermission">
        <el-button type="primary" @click="showEditDialog">
          <el-icon><Edit /></el-icon>
          编辑岗位信息
        </el-button>
        <!-- 模板功能暂时隐藏 -->
        <!-- <el-button type="success" @click="showTemplateDialog">
          <el-icon><CopyDocument /></el-icon>
          保存为模板
        </el-button>
        <el-button type="warning" @click="applyTemplate">
          <el-icon><Document /></el-icon>
          应用模板
        </el-button> -->
      </div>

      <!-- 基本信息 -->
      <el-card class="basic-info-card">
        <template #header>
          <div class="card-header flex-between">
            <span>基本信息</span>
            <div class="header-actions flex gap-12">
              <el-tag v-if="position.status === 1" type="success">启用</el-tag>
              <el-tag v-else type="danger">禁用</el-tag>
              <el-button 
                v-if="hasEditPermission" 
                type="text" 
                size="small" 
                @click="editBasicInfo"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>岗位名称：</label>
              <span>{{ position.name }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>岗位代码：</label>
              <span>{{ position.code }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>职级：</label>
              <el-tag :type="getLevelTagType(position.level)">
                {{ position.level }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>业务线：</label>
              <span>{{ position.businessLine?.name || '无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>基准值：</label>
              <span>{{ position.benchmarkValue }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDate(position.createdAt) }}</span>
            </div>
          </el-col>
        </el-row>
        
        <div v-if="position.description" class="description-section">
          <label>岗位描述：</label>
          <p>{{ position.description }}</p>
        </div>
      </el-card>

      <!-- 能力要求 -->
      <el-card class="requirements-card" v-if="positionRequirements">
        <template #header>
          <div class="card-header flex-between">
            <span>能力要求</span>
            <el-button 
              v-if="hasEditPermission" 
              type="text" 
              size="small" 
              @click="editRequirements"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </template>
        
        <el-row :gutter="20">
          <!-- 基础要求 -->
          <el-col :span="12">
            <div class="requirement-section">
              <h4>基础要求</h4>
              <div v-if="Array.isArray(positionRequirements.basicRequirements) && positionRequirements.basicRequirements.length > 0">
                <div 
                  class="requirement-item flex gap-8" 
                  v-for="(req, index) in positionRequirements.basicRequirements" 
                  :key="index"
                >
                  <el-tag size="small" type="info">
                    {{ req }}
                  </el-tag>
                </div>
              </div>
              <div v-else class="requirement-item">
                <span style="color: #909399;">暂无基础要求信息</span>
              </div>
            </div>
          </el-col>
          
          <!-- 专业技能 -->
          <el-col :span="12">
            <div class="requirement-section">
              <h4>核心技能</h4>
              <div v-if="Array.isArray(positionRequirements.professionalSkills) && positionRequirements.professionalSkills.length > 0">
                <div class="skill-tags flex gap-8">
                  <el-tag
                    v-for="(skill, index) in positionRequirements.professionalSkills"
                    :key="index"
                    size="small"
                    type="primary"
                    style="margin-right: 8px; margin-bottom: 8px;"
                  >
                    {{ skill }}
                  </el-tag>
                </div>
              </div>
              <div v-else class="requirement-item">
                <span style="color: #909399;">暂无核心技能信息</span>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <!-- 软技能要求 - 暂无数据源，隐藏 -->
        <!-- <div class="soft-skills-section" v-if="positionRequirements.softSkills">
          <h4>软技能要求</h4>
          <el-row :gutter="20">
            <el-col :span="6" v-for="(level, skill) in positionRequirements.softSkills" :key="skill">
              <div class="soft-skill-item">
                <label>{{ getSoftSkillLabel(String(skill)) }}：</label>
                <el-tag :type="getSoftSkillTagType(String(level))">
                  {{ level }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div> -->
      </el-card>

      <!-- 晋升条件 -->
      <el-card class="promotion-card" v-if="positionRequirements?.promotionRequirements">
        <template #header>
          <div class="card-header flex-between">
            <span>晋升条件</span>
            <el-button 
              v-if="hasEditPermission" 
              type="text" 
              size="small" 
              @click="editPromotionRequirements"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="promotion-item">
              <label>最低工作经验：</label>
              <span>{{ positionRequirements.promotionRequirements.minExperience }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="promotion-item">
              <label>绩效等级要求：</label>
              <el-tag :type="getPerformanceTagType(positionRequirements.promotionRequirements.performanceLevel)">
                {{ positionRequirements.promotionRequirements.performanceLevel }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="promotion-item">
              <label>技能评估要求：</label>
              <span>{{ positionRequirements.promotionRequirements.skillAssessment }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="promotion-item">
              <label>项目贡献要求：</label>
              <span>{{ positionRequirements.promotionRequirements.projectContribution }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="promotion-item">
              <label>业务影响要求：</label>
              <span>{{ positionRequirements.promotionRequirements.businessImpact || '无要求' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 发展路径 -->
      <el-card class="career-path-card" v-if="positionRequirements?.careerPath">
        <template #header>
          <div class="card-header flex-between">
            <span>发展路径</span>
          </div>
        </template>
        
        <div class="career-path-content flex-column gap-16">
          <div class="path-item">
            <label>下一职级：</label>
            <span class="next-level">{{ positionRequirements.careerPath.nextLevel }}</span>
          </div>
          
          <div class="path-item" v-if="positionRequirements.careerPath.lateralMoves?.length">
            <label>横向发展：</label>
            <div class="lateral-moves flex gap-8">
              <el-tag
                v-for="move in positionRequirements.careerPath.lateralMoves"
                :key="move"
                type="info"
                class="move-tag"
              >
                {{ move }}
              </el-tag>
            </div>
          </div>
          
          <div class="path-item" v-if="positionRequirements.careerPath.specializations?.length">
            <label>专业方向：</label>
            <div class="specializations flex gap-8">
              <el-tag
                v-for="spec in positionRequirements.careerPath.specializations"
                :key="spec"
                type="warning"
                class="spec-tag"
              >
                {{ spec }}
              </el-tag>
            </div>
          </div>
          
          <div class="path-item">
            <label>预计晋升时间：</label>
            <span class="estimated-time">{{ positionRequirements.careerPath.estimatedTime }}</span>
          </div>
          
          <div class="path-item" v-if="positionRequirements.careerPath.growthAreas?.length">
            <label>重点发展领域：</label>
            <div class="growth-areas flex gap-8">
              <el-tag
                v-for="area in positionRequirements.careerPath.growthAreas"
                :key="area"
                type="success"
                class="area-tag"
              >
                {{ area }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 工作职责 -->
      <el-card class="responsibilities-card" v-if="positionRequirements?.responsibilities?.length">
        <template #header>
          <div class="card-header flex-between">
            <span>工作职责</span>
          </div>
        </template>
        
        <div class="responsibilities-list flex-column gap-12">
          <el-tag
            v-for="(responsibility, index) in positionRequirements.responsibilities"
            :key="index"
            type="primary"
            class="responsibility-tag"
          >
            {{ (index as number) + 1 }}. {{ responsibility }}
          </el-tag>
        </div>
      </el-card>

      <!-- 薪资信息（仅业务线内可见） -->
      <el-card class="salary-card" v-if="showSalary && positionRequirements?.salaryRange">
        <template #header>
          <div class="card-header flex-between">
            <span>薪资信息</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="salary-item">
              <label>最低薪资：</label>
              <span class="salary-value">{{ positionRequirements.salaryRange.min }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="salary-item">
              <label>最高薪资：</label>
              <span class="salary-value">{{ positionRequirements.salaryRange.max }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="salary-item">
              <label>市场水平：</label>
              <span>{{ positionRequirements.salaryRange.marketLevel }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="salary-item">
              <label>绩效奖金：</label>
              <span>{{ positionRequirements.salaryRange.performanceBonus }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 工作环境 -->
      <el-card class="work-environment-card" v-if="positionRequirements?.workEnvironment">
        <template #header>
          <div class="card-header flex-between">
            <span>工作环境</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12" v-if="positionRequirements.workEnvironment.workType">
            <div class="env-item">
              <label>工作类型：</label>
              <el-tag :type="getWorkTypeTagType(positionRequirements.workEnvironment.workType)">
                {{ positionRequirements.workEnvironment.workType }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12" v-if="positionRequirements.workEnvironment.travel">
            <div class="env-item">
              <label>出差频率：</label>
              <el-tag :type="getTravelTagType(positionRequirements.workEnvironment.travel)">
                {{ positionRequirements.workEnvironment.travel }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作按钮 - 暂无实际功能，已隐藏 -->
      <!-- <div class="action-buttons">
        <el-button @click="addToFavorites">
          收藏岗位
        </el-button>
        <el-button @click="sharePosition">
          分享岗位
        </el-button>
      </div> -->
    </div>

    <div v-else class="no-data">
      <el-empty description="岗位信息不存在" />
    </div>

    <!-- 编辑岗位信息对话框 -->
    <PositionFormDialog
      v-model:visible="editDialogVisible"
      :position="position"
      :is-edit="true"
      @success="handleEditSuccess"
    />

    <!-- 岗位模板对话框 - 暂时隐藏 -->
    <!-- <el-dialog
      v-model="templateDialogVisible"
      title="岗位模板管理"
      width="70%"
      :before-close="handleCloseTemplateDialog"
    >
      <el-tabs v-model="templateActiveTab">
        <el-tab-pane label="保存为模板" name="save">
          <el-form :model="saveTemplateForm" label-width="120px">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="saveTemplateForm.name" placeholder="请输入模板名称" />
            </el-form-item>
            <el-form-item label="模板描述">
              <el-input v-model="saveTemplateForm.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
            </el-form-item>
            <el-form-item label="适用岗位">
              <el-select v-model="saveTemplateForm.applicablePositions" multiple style="width: 100%">
                <el-option label="技术岗位" value="技术岗位" />
                <el-option label="管理岗位" value="管理岗位" />
                <el-option label="销售岗位" value="销售岗位" />
                <el-option label="支持岗位" value="支持岗位" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="应用模板" name="apply">
          <div class="template-list">
            <el-card v-for="template in availableTemplates" :key="template.id" class="template-card">
              <div class="template-header flex-between mb-10">
                <h4>{{ template.name }}</h4>
                <el-tag :type="template.type === '技术岗位' ? 'primary' : 'success'">
                  {{ template.type }}
                </el-tag>
              </div>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-actions flex gap-12">
                <el-button type="primary" size="small" @click="applyTemplateToPosition(template)">
                  应用此模板
                </el-button>
                <el-button type="text" size="small" @click="previewTemplate(template)">
                  预览
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">关闭</el-button>
          <el-button v-if="templateActiveTab === 'save'" type="primary" @click="saveAsTemplate">
            保存模板
          </el-button>
        </span>
      </template>
    </el-dialog> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, CopyDocument, Document } from '@element-plus/icons-vue'
import { positionApi } from '@/api/position'
import type { Position } from '@/api/position'
import { useUserStore } from '@/store/modules/user'
import PositionFormDialog from './components/PositionFormDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const position = ref<Position | null>(null)
const positionRequirements = ref<any>(null)
const showSalary = ref(false) // 控制薪资信息显示

// 编辑功能相关数据 - 添加权限检查
const hasEditPermission = computed(() => {
  return userStore.hasAnyPermission(['position:update', 'position_encyclopedia:update', 'admin', 'hr', '*'])
})
const editDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const templateActiveTab = ref('save')

// 模板相关数据
const saveTemplateForm = ref({
  name: '',
  description: '',
  applicablePositions: [] as string[]
})

const availableTemplates = ref([
  {
    id: '1',
    name: '技术岗位标准模板',
    type: '技术岗位',
    description: '适用于软件工程师、算法工程师等技术岗位的标准要求模板'
  },
  {
    id: '2',
    name: '管理岗位标准模板',
    type: '管理岗位',
    description: '适用于项目经理、产品经理等管理岗位的标准要求模板'
  },
  {
    id: '3',
    name: '销售岗位标准模板',
    type: '销售岗位',
    description: '适用于销售经理、客户经理等销售岗位的标准要求模板'
  }
])

// 获取岗位ID
const positionId = computed(() => route.params.id as string)

// 方法
const goBack = () => {
  router.back()
}

const loadPositionDetail = async () => {
  if (!positionId.value) return
  
  loading.value = true
  try {
    // 获取岗位基本信息
    const positionResponse = await positionApi.getPosition(positionId.value)
    position.value = positionResponse.data
    
    // 构建显示数据
    // 数据库字段使用下划线格式：core_skills, career_path, work_environment
    if (position.value) {
      const pos = position.value as any
      
      // requirements 是数组格式，需要处理为对象格式
      const requirements = pos.requirements || []
      
      positionRequirements.value = {
        // 基础要求：从 requirements 数组中提取或使用默认值
        basicRequirements: requirements.length > 0 ? requirements : [],
        // 专业技能：使用 core_skills 字段
        professionalSkills: pos.core_skills || [],
        // 职责列表
        responsibilities: pos.responsibilities || [],
        // 职业发展路径：使用 career_path 字段
        careerPath: pos.career_path || null,
        // 工作环境：使用 work_environment 字段
        workEnvironment: pos.work_environment || null,
        // 软技能和晋升条件暂无数据源，保留为null
        softSkills: null,
        promotionRequirements: null
      }
      
      // 打印调试信息
      console.log('📋 岗位详情数据加载:', {
        positionName: pos.name,
        requirements: requirements,
        coreSkills: pos.core_skills,
        careerPath: pos.career_path,
        workEnvironment: pos.work_environment
      })
    }
    
    // 判断是否显示薪资信息（仅业务线内可见）
    showSalary.value = true // 这里需要根据用户权限判断
    
  } catch (error) {
    console.error('获取岗位详情失败:', error)
    ElMessage.error('获取岗位详情失败')
  } finally {
    loading.value = false
  }
}

const getLevelTagType = (level: string) => {
  const levelMap: Record<string, string> = {
    '初级': 'info',
    '中级': 'success',
    '高级': 'warning',
    '专家': 'danger',
    '总监': 'danger',
    '经理': 'warning',
    '主管': 'success',
    '专员': 'info'
  }
  return levelMap[level] || 'info'
}

const getSoftSkillLabel = (skill: string) => {
  const labelMap: Record<string, string> = {
    'communication': '沟通能力',
    'teamwork': '团队协作',
    'problemSolving': '问题解决',
    'innovation': '创新能力',
    'learning': '学习能力'
  }
  return labelMap[skill] || skill
}

const getSoftSkillTagType = (level: string) => {
  const typeMap: Record<string, string> = {
    '优秀': 'success',
    '良好': 'warning',
    '一般': 'info'
  }
  return typeMap[level] || 'info'
}

const getPerformanceTagType = (level: string) => {
  const typeMap: Record<string, string> = {
    'A级': 'success',
    'B级': 'warning',
    'C级': 'danger'
  }
  return typeMap[level] || 'info'
}

const getWorkTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    '全职': 'success',
    '兼职': 'warning',
    '远程': 'info'
  }
  return typeMap[type] || 'info'
}

const getTravelTagType = (travel: string) => {
  const typeMap: Record<string, string> = {
    '经常出差': 'danger',
    '偶尔出差': 'warning',
    '不出差': 'success'
  }
  return typeMap[travel] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 方法已删除：viewSimilarPositions, addToFavorites, sharePosition
// 这些功能不必要，相关按钮已隐藏

// ==================== 编辑功能方法 ====================

// 显示编辑对话框
const showEditDialog = () => {
  editDialogVisible.value = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  ElMessage.success('岗位信息更新成功')
  editDialogVisible.value = false
  // 重新加载数据
  loadPositionDetail()
}

// 快速编辑方法（保留接口兼容性）
const editBasicInfo = () => {
  showEditDialog()
}

const editRequirements = () => {
  showEditDialog()
}

const editPromotionRequirements = () => {
  showEditDialog()
}

// ==================== 模板功能方法 ====================

// 显示模板对话框
const showTemplateDialog = () => {
  templateActiveTab.value = 'save'
  templateDialogVisible.value = true
}

// 应用模板
const applyTemplate = () => {
  templateActiveTab.value = 'apply'
  templateDialogVisible.value = true
}

// 关闭模板对话框
const handleCloseTemplateDialog = () => {
  templateDialogVisible.value = false
}

// 保存为模板
const saveAsTemplate = async () => {
  try {
    // 这里需要调用后端API保存模板
    ElMessage.success('模板保存成功')
    templateDialogVisible.value = false
  } catch (error) {
    ElMessage.error('模板保存失败')
  }
}

// 应用模板到岗位
const applyTemplateToPosition = (template: any) => {
  ElMessage.info(`应用模板：${template.name}`)
  // 这里需要实现模板应用逻辑
}

// 预览模板
const previewTemplate = (template: any) => {
  ElMessage.info(`预览模板：${template.name}`)
  // 这里需要实现模板预览逻辑
}

// 生命周期
onMounted(() => {
  loadPositionDetail()
})
</script>

<style scoped>
/* 岗位详情页面样式 - 最小化，复用全局类 */

/* 页面容器 */
.position-detail {
  padding: 20px;
}

/* 详情内容区域 - 使用 .flex-column .gap-20 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片间距 */
.basic-info-card,
.requirements-card,
.promotion-card,
.career-path-card,
.responsibilities-card,
.salary-card,
.work-environment-card {
  margin-bottom: 20px;
}

/* 信息项 - 使用 .flex */
.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: bold;
  min-width: 100px;
  margin-right: 10px;
  color: var(--text-regular);
}

/* 描述区域 */
.description-section {
  margin-top: 15px;
}

.description-section label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: var(--text-regular);
}

.description-section p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
}

/* 要求区域 */
.requirement-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 5px;
}

.requirement-item {
  margin-bottom: 12px;
}

.requirement-item label {
  font-weight: bold;
  min-width: 100px;
  margin-right: 10px;
  color: var(--text-regular);
}

/* 软技能区域 */
.soft-skills-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.soft-skills-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.soft-skill-item label {
  font-weight: bold;
  min-width: 100px;
  margin-right: 10px;
  color: var(--text-regular);
}

/* 晋升项 - 使用 .flex */
.promotion-item {
  margin-bottom: 15px;
}

.promotion-item label {
  font-weight: bold;
  min-width: 120px;
  margin-right: 10px;
  color: var(--text-regular);
}

/* 职业路径 - 使用 .flex-column .gap-16 */
.path-item label {
  font-weight: bold;
  min-width: 120px;
  margin-right: 10px;
  color: var(--text-regular);
}

.next-level {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 16px;
}

.estimated-time {
  color: var(--success-color);
  font-weight: bold;
}

/* 职责列表 - 使用 .flex-column .gap-12 */
.responsibility-tag {
  padding: 8px 12px;
  font-size: 14px;
}

/* 薪资和环境项 - 使用 .flex */
.salary-item,
.env-item {
  margin-bottom: 15px;
}

.salary-item label,
.env-item label {
  font-weight: bold;
  min-width: 100px;
  margin-right: 10px;
  color: var(--text-regular);
}

.salary-value {
  color: var(--danger-color);
  font-weight: bold;
  font-size: 16px;
}

/* 空数据 */
.no-data {
  padding: 60px;
  text-align: center;
}

/* 编辑功能 - 使用 .flex .gap-16 */
.page-actions {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--background-color);
  border-radius: 8px;
  justify-content: flex-end;
}

/* 模板管理样式 */
.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-card {
  margin-bottom: 15px;
}

.template-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.template-description {
  margin: 10px 0;
  color: var(--text-regular);
  line-height: 1.5;
}
</style>
