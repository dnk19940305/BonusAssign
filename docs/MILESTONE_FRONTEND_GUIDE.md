# 里程碑管理前端组件使用指南

## 📦 已创建的组件

### 1. MilestoneTracker.vue - 里程碑跟踪器

**位置**: `frontend/src/views/project/components/MilestoneTracker.vue`

**功能特性**:
- ✅ 里程碑列表展示（时间线样式）
- ✅ 添加/编辑/删除里程碑
- ✅ 更新里程碑进度
- ✅ 里程碑状态管理（待开始、进行中、已完成、延期、已取消）
- ✅ 里程碑依赖关系设置
- ✅ 交付成果管理
- ✅ 自动排序和分组

**Props**:
```typescript
interface Props {
  projectId: string  // 项目ID（必填）
  canEdit?: boolean  // 是否可编辑（默认true）
}
```

**Events**:
```typescript
{
  refresh: () => void              // 数据刷新时触发
  progress-updated: (progress: number) => void  // 进度更新时触发
}
```

**暴露方法**:
```typescript
{
  loadMilestones: () => Promise<void>  // 重新加载里程碑列表
}
```

**使用示例**:
```vue
<template>
  <MilestoneTracker
    :project-id="projectId"
    :can-edit="true"
    @refresh="handleRefresh"
    @progress-updated="handleProgressUpdate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MilestoneTracker from './components/MilestoneTracker.vue'

const projectId = ref('project-123')

const handleRefresh = () => {
  console.log('里程碑数据已刷新')
}

const handleProgressUpdate = (progress: number) => {
  console.log('进度已更新:', progress)
}
</script>
```

---

### 2. ProjectExecutionPanel.vue - 项目执行跟踪面板

**位置**: `frontend/src/views/project/components/ProjectExecutionPanel.vue`

**功能特性**:
- ✅ 整体进度展示（卡片+进度条）
- ✅ 预算使用监控（包含超支提示）
- ✅ 质量评分展示（评分+星级）
- ✅ 风险等级警示
- ✅ 进度偏差显示（提前/延期天数）
- ✅ 团队表现数据可视化
- ✅ 进度日志时间线
- ✅ 执行状态更新

**Props**:
```typescript
interface Props {
  projectId: string  // 项目ID（必填）
  canEdit?: boolean  // 是否可编辑（默认true）
}
```

**Events**:
```typescript
{
  refresh: () => void  // 数据刷新时触发
}
```

**暴露方法**:
```typescript
{
  loadExecution: () => Promise<void>      // 重新加载执行信息
  loadProgressLogs: () => Promise<void>   // 重新加载进度日志
}
```

**使用示例**:
```vue
<template>
  <ProjectExecutionPanel
    :project-id="projectId"
    :can-edit="true"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProjectExecutionPanel from './components/ProjectExecutionPanel.vue'

const projectId = ref('project-123')

const handleRefresh = () => {
  console.log('执行数据已刷新')
}
</script>
```

---

## 🎨 组件设计特点

### 视觉设计
1. **时间线风格** - 里程碑展示使用时间线设计，直观展示项目进展
2. **卡片式布局** - 执行面板使用卡片分区，信息层次清晰
3. **渐变色彩** - 使用现代渐变色卡片，提升视觉效果
4. **状态标识** - 不同状态使用不同颜色标识，易于识别

### 交互设计
1. **内联编辑** - 支持快速更新进度，无需打开对话框
2. **下拉菜单** - 里程碑操作集中在下拉菜单，界面简洁
3. **实时反馈** - 所有操作都有即时的视觉反馈
4. **空状态处理** - 无数据时显示友好的空状态提示

### 数据处理
1. **自动转换** - 前端camelCase与后端snake_case自动转换
2. **错误处理** - 完善的错误捕获和用户提示
3. **加载状态** - loading状态提示用户数据加载中
4. **乐观更新** - 操作成功后立即刷新数据

---

## 🔌 API 接口文件

**位置**: `frontend/src/api/milestone.ts`

**导出接口**:
```typescript
// 类型定义
interface Milestone {
  id?: string
  projectId: string
  name: string
  description?: string
  targetDate: string
  completionDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  progress: number
  deliverables?: string
  dependencies?: string[]
  sortOrder?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

interface ProjectExecution {
  id?: string
  projectId: string
  overallProgress: number
  budgetUsage: number
  costOverrun: number
  scheduleVariance: number
  qualityScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  teamPerformance?: Record<string, any>
  lastUpdatedBy?: string
  createdAt?: string
  updatedAt?: string
}

interface ProgressLog {
  id?: string
  projectId: string
  milestoneId?: string
  progressType: 'milestone' | 'cost' | 'quality' | 'risk'
  description: string
  progressValue?: number
  oldValue?: number
  newValue?: number
  loggedBy?: string
  loggedAt?: string
}

// API 方法
getMilestones(projectId: string, params?: object)
getMilestoneById(id: string)
createMilestone(projectId: string, data: Partial<Milestone>)
updateMilestone(id: string, data: Partial<Milestone>)
deleteMilestone(id: string)
updateMilestoneProgress(id: string, progress: number)
getProjectExecution(projectId: string)
updateProjectExecution(projectId: string, data: Partial<ProjectExecution>)
getProgressLogs(projectId: string, params?: object)
calculateOverallProgress(projectId: string)
```

---

## 🚀 集成到现有页面

### 方式一：在项目详情页面添加标签页

在 `ProjectManagement.vue` 中添加里程碑和执行跟踪标签页：

```vue
<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane label="基本信息" name="basic">
      <!-- 现有的项目信息 -->
    </el-tab-pane>
    
    <el-tab-pane label="项目里程碑" name="milestones">
      <MilestoneTracker
        :project-id="currentProject.id"
        :can-edit="canEditProject"
        @refresh="loadProjectData"
      />
    </el-tab-pane>
    
    <el-tab-pane label="执行跟踪" name="execution">
      <ProjectExecutionPanel
        :project-id="currentProject.id"
        :can-edit="canEditProject"
        @refresh="loadProjectData"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import MilestoneTracker from './components/MilestoneTracker.vue'
import ProjectExecutionPanel from './components/ProjectExecutionPanel.vue'
// ... 其他代码
</script>
```

### 方式二：在项目详情对话框中集成

修改 `ProjectDetailDialog.vue` 或 `EnhancedProjectDetailDialog.vue`：

```vue
<template>
  <el-dialog title="项目详情" width="1200px">
    <el-tabs v-model="activeTab">
      <!-- 现有标签页 -->
      
      <el-tab-pane label="里程碑管理" name="milestones">
        <MilestoneTracker
          :project-id="project.id"
          :can-edit="canEdit"
        />
      </el-tab-pane>
      
      <el-tab-pane label="执行监控" name="execution">
        <ProjectExecutionPanel
          :project-id="project.id"
          :can-edit="canEdit"
        />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
```

### 方式三：创建独立的里程碑管理页面

创建新页面 `frontend/src/views/project/ProjectMilestones.vue`：

```vue
<template>
  <div class="project-milestones-page">
    <PageHeader title="项目里程碑管理" />
    
    <div class="page-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <MilestoneTracker
            :project-id="projectId"
            :can-edit="true"
            @refresh="handleRefresh"
          />
        </el-col>
        
        <el-col :span="8">
          <ProjectExecutionPanel
            :project-id="projectId"
            :can-edit="true"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MilestoneTracker from './components/MilestoneTracker.vue'
import ProjectExecutionPanel from './components/ProjectExecutionPanel.vue'

const route = useRoute()
const projectId = ref(route.params.id as string)

const handleRefresh = () => {
  // 刷新页面数据
}

onMounted(() => {
  // 初始化
})
</script>
```

---

## 📝 样式定制

组件使用了 scoped 样式，可以通过以下方式自定义：

### 修改主题色

在组件内修改渐变色：

```scss
.progress-card .card-icon {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### 调整布局

修改卡片间距：

```scss
.summary-cards {
  margin-bottom: 20px;  // 调整此值
}
```

### 自定义时间线样式

```scss
.timeline-dot {
  width: 32px;  // 调整圆点大小
  height: 32px;
}
```

---

## 🧪 测试建议

### 单元测试
```typescript
import { mount } from '@vue/test-utils'
import MilestoneTracker from '@/views/project/components/MilestoneTracker.vue'

describe('MilestoneTracker.vue', () => {
  it('renders milestones correctly', () => {
    const wrapper = mount(MilestoneTracker, {
      props: {
        projectId: 'test-project-123'
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
  
  it('can add milestone', async () => {
    // 测试添加里程碑功能
  })
})
```

### 集成测试
- 测试组件间通信
- 测试API调用
- 测试数据更新流程

---

## 📊 性能优化建议

1. **懒加载** - 里程碑列表较长时使用虚拟滚动
2. **防抖** - 进度滑块使用防抖处理
3. **缓存** - 考虑使用Vuex/Pinia缓存项目数据
4. **分页** - 进度日志使用分页加载

---

## 🐛 常见问题

### 1. 组件不显示数据
- 检查 `projectId` 是否正确传递
- 检查API请求是否成功
- 查看浏览器控制台错误信息

### 2. 进度更新失败
- 检查用户权限（`canEdit` prop）
- 验证进度值范围（0-100）
- 检查网络请求状态

### 3. 样式显示异常
- 确认 Element Plus 已正确安装
- 检查图标库是否导入
- 验证 SCSS 编译环境

---

## 📚 下一步开发

- [ ] 添加甘特图展示
- [ ] 实现里程碑拖拽排序
- [ ] 添加批量操作功能
- [ ] 实现数据导出功能
- [ ] 添加通知提醒功能

---

**创建日期**: 2025-10-16  
**版本**: v1.0  
**维护者**: 开发团队
