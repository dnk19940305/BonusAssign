# 项目协作模块完整开发规划

## 📋 文档信息

- **文档版本**: v2.0
- **制定日期**: 2025-10-17
- **项目名称**: 奖金模拟系统 - 项目协作模块
- **规划目标**: 实现项目发布 → 团队申请 → 审批决策的三阶段完整业务流程
- **预计工期**: 3周（基于已有70%完成度）
- **适用人员**: 全栈开发团队

---

## 🎯 执行摘要

### 当前状态分析

**已完成功能 (70%)**:
- ✅ 数据库表结构完整（7张表）
- ✅ 后端API框架（10个核心接口）
- ✅ 前端页面组件（7个Vue组件）
- ✅ 权限控制基础设施
- ✅ 审批流程基础逻辑

**待完成核心功能 (30%)**:
- ⏳ 三阶段业务流程打通
- ⏳ 状态流转自动化
- ⏳ 通知机制完善
- ⏳ 数据一致性保障
- ⏳ E2E测试覆盖

### 开发策略

采用**渐进式交付**策略,分3个迭代周期完成:
1. **Week 1**: 核心流程打通 (MVP)
2. **Week 2**: 功能完善和优化
3. **Week 3**: 测试、优化和上线

---

## 📊 第一部分: 现状评估

### 1.1 技术架构现状

#### 后端架构
```
backend/src/
├── controllers/
│   ├── projectCollaborationController.js  ✅ 已完成 (832行)
│   ├── projectMemberController.js         ✅ 已完成
│   ├── milestoneController.js             ✅ 已完成
│   └── executionController.js             ✅ 已完成
├── services/
│   ├── projectCollaborationService.js     ⚠️ 需要增强
│   ├── projectMemberService.js            ✅ 已完成
│   ├── notificationService.js             ⚠️ 需要完善
│   └── databaseService.js                 ✅ 已完成
├── middlewares/
│   ├── auth.js                            ✅ JWT认证完成
│   └── projectCollaborationAuth.js        ✅ 权限控制完成
└── routes/
    └── projectCollaboration.js            ✅ 路由配置完成
```

#### 前端架构
```
frontend/src/views/project/
├── ProjectCollaboration.vue           ✅ 协作中心主页 (已完成)
├── ProjectPublish.vue                 ✅ 项目发布页 (已完成)
├── ProjectMemberApproval.vue          ✅ 审批页面 (已修复字段映射)
├── ProjectManagement.vue              ✅ 项目管理页 (已完成)
├── MilestoneTracker.vue               ✅ 里程碑跟踪 (待集成)
└── ProjectExecutionPanel.vue          ✅ 执行面板 (待集成)
```

#### 数据库现状
```sql
-- 已完成的表结构
✅ projects (项目表)
✅ project_team_applications (团队申请表)
✅ project_members (成员表) - 字段映射已修复
✅ project_requirements (需求表)
✅ project_roles (角色表)
✅ project_milestones (里程碑表)
✅ project_executions (执行跟踪表)
✅ project_notifications (通知表)
```

### 1.2 功能缺口分析

| 功能模块 | 完成度 | 缺口描述 | 优先级 |
|---------|--------|---------|--------|
| 项目发布流程 | 80% | 缺少需求模板、技能标签化 | P1 |
| 团队申请流程 | 85% | 成本校验、成员工作量分配UI待完善 | P0 |
| 审批决策流程 | 90% | 多级审批未启用、审批流程引擎待集成 | P1 |
| 状态流转机制 | 60% | 自动状态更新缺失、事务保障不足 | P0 |
| 通知系统 | 70% | 实时推送缺失、分类筛选待完善 | P1 |
| 数据一致性 | 65% | 并发锁未实现、事务边界不清晰 | P0 |

---

## 🔄 第二部分: 三阶段业务流程设计

### 2.1 阶段一: 项目发布流程

#### 业务目标
管理层发布项目需求,系统自动通知潜在项目经理,启动团队申请流程。

#### 核心业务规则
```javascript
// BR-001: 项目代码唯一性
IF EXISTS(SELECT 1 FROM projects WHERE code = :code) THEN
  THROW ERROR "项目代码已存在"
END IF

// BR-002: 预算合理性验证
IF bonusScale > budget * 0.5 THEN
  THROW WARNING "奖金规模超过预算50%,请确认"
END IF

// BR-003: 时间范围验证
IF endDate <= startDate THEN
  THROW ERROR "结束日期必须晚于开始日期"
END IF

// BR-004: 发布后状态初始化
UPDATE projects
SET cooperationStatus = 'published',
    publishedAt = NOW(),
    publishedBy = :userId
WHERE id = :projectId
```

#### 业务流程图
```
[管理层]
    ↓
填写项目基本信息 (必填: 名称、代码、描述)
    ↓
设置预算和奖金规模 (自动验证合理性)
    ↓
定义技能要求 (从标签库选择/新增)
    ↓
添加项目需求 (至少1个需求)
    ↓
[系统验证] → 验证失败 → 提示错误并返回修改
    ↓ 验证通过
设置项目状态为 'published'
    ↓
[自动通知] → 通知符合技能要求的项目经理
    ↓
[日志记录] → 记录发布操作到审计日志
    ↓
[完成] 项目进入可申请状态
```

#### 待实现功能清单

**P0 - 核心功能**:
- [x] 项目基本信息表单 (ProjectPublish.vue已完成)
- [ ] 预算合理性实时验证
- [ ] 项目代码唯一性实时检查
- [ ] 发布成功后自动跳转到项目列表

**P1 - 增强功能**:
- [ ] 需求模板库管理
- [ ] 技能标签自动匹配推荐
- [ ] 项目发布预览功能
- [ ] 草稿保存机制

### 2.2 阶段二: 团队申请流程

#### 业务目标
项目经理查看已发布项目,组建团队并提交申请,等待管理层审批。

#### 核心业务规则
```javascript
// BR-101: 项目状态检查
IF project.cooperationStatus NOT IN ('published', 'rejected') THEN
  THROW ERROR "项目当前不接受申请"
END IF

// BR-102: 重复申请检查
IF EXISTS(SELECT 1 FROM project_team_applications
          WHERE projectId = :projectId
          AND applicantId = :userId
          AND status = 'pending') THEN
  THROW ERROR "您已有待审批的申请,请等待审批完成"
END IF

// BR-103: 成员分配比例验证
totalAllocation = SUM(member.allocationPercentage)
IF totalAllocation != 100 THEN
  THROW ERROR "成员分配比例总和必须为100%,当前${totalAllocation}%"
END IF

// BR-104: 成本上限验证
IF estimatedCost > project.budget * 1.2 THEN
  THROW ERROR "预估成本超过项目预算的120%"
END IF

// BR-105: 申请提交后状态更新
BEGIN TRANSACTION
  -- 创建申请记录
  INSERT INTO project_team_applications(...)
  -- 更新项目状态
  UPDATE projects
  SET cooperationStatus = 'team_building'
  WHERE id = :projectId
  -- 创建成员记录(status='pending')
  INSERT INTO project_members(...)
COMMIT
```

#### 业务流程图
```
[项目经理]
    ↓
查看可申请项目列表 (过滤: cooperationStatus='published')
    ↓
选择项目并查看详情 (预算、需求、技能要求)
    ↓
点击"申请团队" → 打开TeamApplicationDialog
    ↓
填写团队基本信息 (团队名称、描述)
    ↓
[成员选择器] 选择团队成员
    ↓
配置成员角色和权重
    ├─ 项目角色 (从角色库选择)
    ├─ 贡献权重 (0.1-5.0)
    ├─ 工作量占比 (百分比)
    └─ 分配比例 (百分比,总和=100%)
    ↓
填写预估成本 (自动验证不超预算120%)
    ↓
填写申请理由 (≥50字)
    ↓
[系统验证] → 验证失败 → 提示错误
    ↓ 验证通过
[事务提交]
    ├─ 创建application记录
    ├─ 更新project.cooperationStatus='team_building'
    ├─ 创建member记录(status='pending')
    └─ 记录操作日志
    ↓
[自动通知] → 通知管理层待审批
    ↓
[完成] 显示申请成功,跳转到"我的申请"
```

#### 待实现功能清单

**P0 - 核心功能**:
- [x] 团队申请表单 (TeamApplicationDialog.vue已完成)
- [ ] 成员分配比例实时验证
- [ ] 预估成本自动计算 (基于成员工资+权重)
- [ ] 申请提交事务保障

**P1 - 增强功能**:
- [ ] 成员技能匹配度评分
- [ ] 成员当前工作负荷查询
- [ ] 团队配置智能推荐
- [ ] 申请草稿自动保存

### 2.3 阶段三: 审批决策流程

#### 业务目标
管理层审阅团队申请,评估合理性后做出批准/拒绝/修改决策。

#### 核心业务规则
```javascript
// BR-201: 审批权限验证
IF NOT checkPermission(user, 'project:approve') THEN
  THROW ERROR "您没有审批权限"
END IF

// BR-202: 申请状态检查
IF application.status != 'pending' THEN
  THROW ERROR "该申请已处理,无法重复审批"
END IF

// BR-203: 审批操作执行
CASE action
  WHEN 'approve' THEN
    BEGIN TRANSACTION
      -- 更新申请状态
      UPDATE project_team_applications
      SET status = 'approved',
          approvedBy = :userId,
          approvedAt = NOW(),
          approvalComments = :comments
      WHERE id = :applicationId

      -- 激活团队成员
      UPDATE project_members
      SET status = 'active',
          joinDate = NOW(),
          approvedBy = :userId,
          approvedAt = NOW()
      WHERE applicationId = :applicationId

      -- 更新项目状态
      UPDATE projects
      SET cooperationStatus = 'approved'
      WHERE id = :projectId

    COMMIT

  WHEN 'reject' THEN
    BEGIN TRANSACTION
      -- 更新申请状态
      UPDATE project_team_applications
      SET status = 'rejected',
          approvedBy = :userId,
          approvedAt = NOW(),
          rejectionReason = :comments
      WHERE id = :applicationId

      -- 删除待审批成员
      DELETE FROM project_members
      WHERE applicationId = :applicationId
      AND status = 'pending'

      -- 项目状态回退
      UPDATE projects
      SET cooperationStatus = 'published'
      WHERE id = :projectId

    COMMIT

  WHEN 'modify' THEN
    -- 要求修改,状态保持pending
    UPDATE project_team_applications
    SET modificationRequired = TRUE,
        modificationComments = :comments,
        updatedAt = NOW()
    WHERE id = :applicationId
END CASE

// BR-204: 通知发送
notifyApplicant(application.applicantId, {
  action: action,
  comments: comments,
  projectName: project.name
})
```

#### 业务流程图
```
[管理层]
    ↓
查看待审批申请列表
    ↓
选择申请并查看详情
    ├─ 申请信息 (团队名称、描述、理由)
    ├─ 团队成员配置 (角色、权重、分配比例)
    ├─ 预估成本vs项目预算
    └─ 项目需求匹配度
    ↓
做出审批决策
    ├─ [批准]
    │   ↓
    │   填写审批意见
    │   ↓
    │   确认批准 → 弹窗二次确认
    │   ↓
    │   [事务执行]
    │   ├─ 更新application.status='approved'
    │   ├─ 激活members状态='active'
    │   ├─ 更新project.cooperationStatus='approved'
    │   └─ 记录审计日志
    │   ↓
    │   [通知申请人] → 申请已批准
    │   ↓
    │   [完成] 项目进入执行阶段
    │
    ├─ [拒绝]
    │   ↓
    │   填写拒绝理由 (必填)
    │   ↓
    │   确认拒绝 → 弹窗二次确认
    │   ↓
    │   [事务执行]
    │   ├─ 更新application.status='rejected'
    │   ├─ 删除pending状态的members
    │   ├─ 更新project.cooperationStatus='published'
    │   └─ 记录审计日志
    │   ↓
    │   [通知申请人] → 申请已拒绝
    │   ↓
    │   [完成] 项目重新开放申请
    │
    └─ [要求修改]
        ↓
        填写修改建议 (必填)
        ↓
        提交修改要求
        ↓
        [通知申请人] → 需要修改团队配置
        ↓
        [完成] 等待申请人重新提交
```

#### 待实现功能清单

**P0 - 核心功能**:
- [x] 审批对话框 (ProjectApprovalDialog.vue已完成)
- [ ] 审批操作事务完整性保障
- [ ] 状态流转自动化
- [ ] 二次确认弹窗

**P1 - 增强功能**:
- [ ] 审批历史查询
- [ ] 批量审批功能
- [ ] 审批流程可视化
- [ ] 审批时效监控

---

## 💻 第三部分: 技术实现方案

### 3.1 后端服务层增强

#### 3.1.1 事务管理强化

**文件**: `backend/src/services/projectCollaborationService.js`

```javascript
const { DB_TYPE } = require('../config/database')
const logger = require('../utils/logger')

class ProjectCollaborationService {

  /**
   * 提交团队申请 - 带事务保障
   */
  async submitTeamApplication(applicationData, members) {
    // MySQL事务
    if (DB_TYPE === 'mysql') {
      const connection = await databaseService.pool.getConnection()
      await connection.beginTransaction()

      try {
        // 1. 创建申请记录
        const applicationId = await this._createApplication(connection, applicationData)

        // 2. 批量创建成员记录
        await this._createMembers(connection, applicationId, members)

        // 3. 更新项目状态
        await this._updateProjectStatus(connection, applicationData.projectId, 'team_building')

        // 4. 记录操作日志
        await this._logAction(connection, {
          action: 'team_application_submitted',
          projectId: applicationData.projectId,
          applicationId
        })

        await connection.commit()
        logger.info('✅ 团队申请提交成功', { applicationId })

        return { applicationId, status: 'success' }

      } catch (error) {
        await connection.rollback()
        logger.error('❌ 团队申请提交失败', error)
        throw error
      } finally {
        connection.release()
      }
    }

    // NeDB非事务(开发环境)
    else {
      try {
        const applicationId = await nedbService.insert('teamApplications', applicationData)
        await nedbService.insertMany('projectMembers', members.map(m => ({
          ...m,
          applicationId,
          status: 'pending'
        })))
        await nedbService.update('projects',
          { _id: applicationData.projectId },
          { $set: { cooperationStatus: 'team_building' } }
        )
        return { applicationId, status: 'success' }
      } catch (error) {
        logger.error('❌ NeDB申请提交失败', error)
        throw error
      }
    }
  }

  /**
   * 审批团队申请 - 带事务保障
   */
  async approveTeamApplication(applicationId, approverId, action, comments) {
    if (DB_TYPE === 'mysql') {
      const connection = await databaseService.pool.getConnection()
      await connection.beginTransaction()

      try {
        // 获取申请信息
        const application = await this._getApplication(connection, applicationId)

        if (action === 'approve') {
          // 批准流程
          await connection.execute(
            `UPDATE project_team_applications
             SET status = 'approved', approved_by = ?, approved_at = NOW(),
                 approval_comments = ?
             WHERE id = ?`,
            [approverId, comments, applicationId]
          )

          await connection.execute(
            `UPDATE project_members
             SET status = 'active', approved_by = ?, approved_at = NOW(),
                 join_date = NOW()
             WHERE application_id = ? AND status = 'pending'`,
            [approverId, applicationId]
          )

          await connection.execute(
            `UPDATE projects
             SET cooperation_status = 'approved', updated_at = NOW()
             WHERE id = ?`,
            [application.projectId]
          )

        } else if (action === 'reject') {
          // 拒绝流程
          await connection.execute(
            `UPDATE project_team_applications
             SET status = 'rejected', approved_by = ?, approved_at = NOW(),
                 rejection_reason = ?
             WHERE id = ?`,
            [approverId, comments, applicationId]
          )

          await connection.execute(
            `DELETE FROM project_members
             WHERE application_id = ? AND status = 'pending'`,
            [applicationId]
          )

          await connection.execute(
            `UPDATE projects
             SET cooperation_status = 'published', updated_at = NOW()
             WHERE id = ?`,
            [application.projectId]
          )
        }

        await connection.commit()
        logger.info('✅ 审批操作成功', { applicationId, action })

        return { status: 'success', action }

      } catch (error) {
        await connection.rollback()
        logger.error('❌ 审批操作失败', error)
        throw error
      } finally {
        connection.release()
      }
    }
  }
}

module.exports = new ProjectCollaborationService()
```

#### 3.1.2 通知服务完善

**文件**: `backend/src/services/notificationService.js`

```javascript
class NotificationService {

  /**
   * 发送项目发布通知
   */
  async notifyProjectPublished(projectId, projectName, recipientIds) {
    const notifications = recipientIds.map(recipientId => ({
      projectId,
      recipientId,
      type: 'project_published',
      title: '新项目发布通知',
      content: `项目"${projectName}"已发布,欢迎申请团队组建`,
      relatedId: projectId,
      isRead: false,
      createdAt: new Date()
    }))

    await databaseService.insertMany('project_notifications', notifications)

    // TODO: 集成实时推送 (WebSocket / SSE)
    this._pushRealtime(recipientIds, {
      type: 'project_published',
      projectId,
      projectName
    })
  }

  /**
   * 发送团队申请通知
   */
  async notifyTeamApplicationSubmitted(applicationId, projectName, applicantName, reviewerIds) {
    const notifications = reviewerIds.map(recipientId => ({
      projectId: applicationId,
      recipientId,
      type: 'team_application_submitted',
      title: '团队申请待审批',
      content: `${applicantName}提交了项目"${projectName}"的团队申请,请及时审批`,
      relatedId: applicationId,
      isRead: false,
      createdAt: new Date()
    }))

    await databaseService.insertMany('project_notifications', notifications)
  }

  /**
   * 发送审批结果通知
   */
  async notifyApprovalResult(applicationId, projectName, action, comments, applicantId) {
    const title = action === 'approve' ? '团队申请已批准' : '团队申请被拒绝'
    const content = action === 'approve'
      ? `恭喜!您的项目"${projectName}"团队申请已获批准`
      : `抱歉,您的项目"${projectName}"团队申请被拒绝: ${comments}`

    await databaseService.insert('project_notifications', {
      projectId: applicationId,
      recipientId: applicantId,
      type: `team_application_${action}`,
      title,
      content,
      relatedId: applicationId,
      isRead: false,
      createdAt: new Date()
    })
  }

  /**
   * 实时推送 (预留接口)
   */
  _pushRealtime(recipientIds, payload) {
    // TODO: 集成WebSocket或SSE实现实时推送
    logger.info('📡 实时推送通知', { recipientIds, payload })
  }
}

module.exports = new NotificationService()
```

### 3.2 前端组件优化

#### 3.2.1 团队申请表单增强

**文件**: `frontend/src/views/project/components/TeamApplicationDialog.vue`

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { projectMemberApi } from '@/api/projectMember'

// ===== 实时验证逻辑 =====

// 成员分配比例实时验证
const totalAllocation = computed(() => {
  return formData.value.members.reduce((sum, m) => sum + (m.allocationPercentage || 0), 0)
})

const allocationValid = computed(() => Math.abs(totalAllocation.value - 100) < 0.01)

// 监听分配比例变化
watch(totalAllocation, (newVal) => {
  if (!allocationValid.value) {
    validationMessage.value = `成员分配比例总和应为100%,当前为${newVal.toFixed(2)}%`
    validationType.value = 'error'
  } else {
    validationMessage.value = '分配比例正确'
    validationType.value = 'success'
  }
})

// 成本预估自动计算
const calculateEstimatedCost = () => {
  let totalCost = 0
  for (const member of formData.value.members) {
    // 基于员工工资 * 贡献权重 * 工作量占比
    const memberCost = (member.salary || 0) * member.contributionWeight * member.estimatedWorkload
    totalCost += memberCost
  }
  formData.value.estimatedCost = Math.round(totalCost)
}

// 监听成员变化自动计算成本
watch(() => formData.value.members, calculateEstimatedCost, { deep: true })

// 成本预算检查
const costCheck = computed(() => {
  const cost = formData.value.estimatedCost
  const budget = props.project.budget
  const percentage = (cost / budget * 100).toFixed(2)

  if (cost > budget * 1.2) {
    return { valid: false, type: 'danger', message: `成本超出预算120%` }
  } else if (cost > budget) {
    return { valid: true, type: 'warning', message: `成本超出预算${percentage}%` }
  } else {
    return { valid: true, type: 'success', message: `成本合理,占预算${percentage}%` }
  }
})

// ===== 提交前验证 =====
const validateBeforeSubmit = async () => {
  // 1. 表单验证
  const valid = await formRef.value.validate()
  if (!valid) return false

  // 2. 分配比例验证
  if (!allocationValid.value) {
    ElMessage.error('成员分配比例总和必须为100%')
    return false
  }

  // 3. 成本预算验证
  if (!costCheck.value.valid) {
    ElMessage.error(costCheck.value.message)
    return false
  }

  // 4. 成员数量验证
  if (formData.value.members.length < 2) {
    ElMessage.error('团队至少需要2名成员')
    return false
  }

  return true
}

// ===== 提交申请 =====
const submitApplication = async () => {
  if (!await validateBeforeSubmit()) return

  try {
    submitting.value = true

    await projectMemberApi.applyForTeam({
      projectId: props.project.id,
      teamName: formData.value.teamName,
      teamDescription: formData.value.teamDescription,
      applicationReason: formData.value.applicationReason,
      estimatedCost: formData.value.estimatedCost,
      members: formData.value.members
    })

    ElMessage.success('团队申请提交成功,请等待审批')
    emit('success')
    visible.value = false

  } catch (error) {
    ElMessage.error(`提交失败: ${error.message}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="团队申请" width="900px">
    <!-- ... 表单内容 ... -->

    <!-- 实时验证反馈 -->
    <el-alert
      v-if="!allocationValid"
      type="error"
      :title="validationMessage"
      :closable="false"
      style="margin-top: 16px"
    />

    <el-alert
      v-if="!costCheck.valid"
      type="danger"
      :title="costCheck.message"
      :closable="false"
      style="margin-top: 8px"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        @click="submitApplication"
        :loading="submitting"
        :disabled="!allocationValid || !costCheck.valid"
      >
        提交申请
      </el-button>
    </template>
  </el-dialog>
</template>
```

#### 3.2.2 审批对话框增强

**文件**: `frontend/src/views/project/components/ProjectApprovalDialog.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectMemberApi } from '@/api/projectMember'

// ===== 二次确认逻辑 =====
const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批准"${currentApplication.value.teamName}"的团队申请吗?批准后将立即生效。`,
      '确认批准',
      {
        confirmButtonText: '确定批准',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )

    await submitApproval('approve')

  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(`操作失败: ${error.message}`)
    }
  }
}

const handleReject = async () => {
  // 验证拒绝理由
  if (!approvalForm.value.comments || approvalForm.value.comments.length < 10) {
    ElMessage.error('拒绝理由不能少于10个字')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要拒绝"${currentApplication.value.teamName}"的团队申请吗?拒绝后项目将重新开放申请。`,
      '确认拒绝',
      {
        confirmButtonText: '确定拒绝',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
    )

    await submitApproval('reject')

  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(`操作失败: ${error.message}`)
    }
  }
}

// ===== 审批提交 =====
const submitApproval = async (action: 'approve' | 'reject' | 'modify') => {
  try {
    submitting.value = true

    await projectMemberApi.approveApplication(currentApplication.value.id, {
      action,
      comments: approvalForm.value.comments,
      modifications: approvalForm.value.modifications
    })

    const message = action === 'approve' ? '申请已批准' :
                    action === 'reject' ? '申请已拒绝' : '修改要求已发送'

    ElMessage.success(message)
    emit('success')
    visible.value = false

  } catch (error) {
    throw error
  } finally {
    submitting.value = false
  }
}
</script>
```

---

## 🧪 第四部分: 测试验证计划

### 4.1 单元测试

#### 后端单元测试
```bash
# 运行服务层测试
npm run test -- projectCollaborationService.test.js

# 测试用例覆盖:
✓ 提交团队申请 - 正常流程
✓ 提交团队申请 - 重复申请检查
✓ 提交团队申请 - 成本超限验证
✓ 提交团队申请 - 分配比例验证
✓ 审批团队申请 - 批准流程
✓ 审批团队申请 - 拒绝流程
✓ 审批团队申请 - 状态流转验证
✓ 审批团队申请 - 事务回滚测试
```

#### 前端单元测试
```bash
# 运行组件测试
npm run test:unit -- TeamApplicationDialog.spec.ts

# 测试用例覆盖:
✓ 表单验证 - 必填字段
✓ 分配比例计算 - 实时验证
✓ 成本预估 - 自动计算
✓ 成员添加 - UI交互
✓ 提交申请 - 成功场景
✓ 提交申请 - 失败场景
```

### 4.2 集成测试

#### E2E流程测试

**文件**: `frontend/tests/project-collaboration-e2e.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('项目协作完整流程', () => {

  test('完整三阶段流程测试', async ({ page, browser }) => {
    // ===== 阶段1: 项目发布 =====
    test.step('管理员发布项目', async () => {
      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()

      // 登录管理员账号
      await adminPage.goto('/login')
      await adminPage.fill('input[name="username"]', 'admin')
      await adminPage.fill('input[name="password"]', 'admin123')
      await adminPage.click('button[type="submit"]')

      // 进入项目发布页面
      await adminPage.goto('/project/publish')

      // 填写项目基本信息
      await adminPage.fill('input[name="name"]', 'E2E测试项目')
      await adminPage.fill('input[name="code"]', `E2E_${Date.now()}`)
      await adminPage.fill('textarea[name="description"]', '这是一个端到端测试项目描述内容超过20字符')
      await adminPage.fill('textarea[name="workContent"]', '项目工作内容详细说明')

      // 设置预算
      await adminPage.fill('input[name="budget"]', '100000')
      await adminPage.fill('input[name="bonusScale"]', '50000')

      // 提交发布
      await adminPage.click('button:has-text("发布项目")')
      await adminPage.waitForSelector('.el-message--success')

      // 验证项目状态
      await adminPage.goto('/project/management')
      await expect(adminPage.locator('.project-status:first-child')).toContainText('已发布')

      await adminContext.close()
    })

    // ===== 阶段2: 团队申请 =====
    test.step('项目经理申请团队', async () => {
      const managerContext = await browser.newContext()
      const managerPage = await managerContext.newPage()

      // 登录项目经理账号
      await managerPage.goto('/login')
      await managerPage.fill('input[name="username"]', 'project_manager')
      await managerPage.fill('input[name="password"]', 'password123')
      await managerPage.click('button[type="submit"]')

      // 查看可申请项目
      await managerPage.goto('/project/collaboration')
      await managerPage.click('.el-tabs__item:has-text("可申请项目")')

      // 选择项目并申请
      await managerPage.click('.project-card:first-child')
      await managerPage.click('button:has-text("申请团队")')

      // 填写团队信息
      await managerPage.fill('input[name="teamName"]', 'E2E测试团队')
      await managerPage.fill('textarea[name="teamDescription"]', '这是一个端到端测试团队描述')

      // 添加成员
      await managerPage.click('button:has-text("添加成员")')
      await managerPage.check('.member-selector tbody tr:first-child input[type="checkbox"]')
      await managerPage.check('.member-selector tbody tr:nth-child(2) input[type="checkbox"]')
      await managerPage.click('.member-selector button:has-text("确定")')

      // 配置成员权重和分配比例
      await managerPage.fill('.member-config:first-child input[name="contributionWeight"]', '1.5')
      await managerPage.fill('.member-config:first-child input[name="allocationPercentage"]', '60')
      await managerPage.fill('.member-config:nth-child(2) input[name="contributionWeight"]', '1.0')
      await managerPage.fill('.member-config:nth-child(2) input[name="allocationPercentage"]', '40')

      // 填写申请理由
      await managerPage.fill('textarea[name="applicationReason"]',
        '这是一个详细的申请理由,说明团队如何满足项目需求以及预期成果,字数需要超过50字符')

      // 验证分配比例正确
      await expect(managerPage.locator('.allocation-total')).toContainText('100%')

      // 提交申请
      await managerPage.click('button:has-text("提交申请")')
      await managerPage.waitForSelector('.el-message--success')

      // 验证申请状态
      await managerPage.click('.el-tabs__item:has-text("我的申请")')
      await expect(managerPage.locator('.application-status:first-child')).toContainText('待审批')

      await managerContext.close()
    })

    // ===== 阶段3: 审批决策 =====
    test.step('管理员审批申请', async () => {
      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()

      // 登录管理员账号
      await adminPage.goto('/login')
      await adminPage.fill('input[name="username"]', 'admin')
      await adminPage.fill('input[name="password"]', 'admin123')
      await adminPage.click('button[type="submit"]')

      // 查看待审批申请
      await adminPage.goto('/project/member-approval')

      // 点击第一个申请的审批按钮
      await adminPage.click('.application-item:first-child button:has-text("审批")')

      // 查看申请详情
      await expect(adminPage.locator('.approval-dialog .team-name')).toContainText('E2E测试团队')
      await expect(adminPage.locator('.approval-dialog .member-count')).toContainText('2')

      // 选择批准
      await adminPage.check('input[value="approve"]')
      await adminPage.fill('textarea[name="comments"]', '团队配置合理,批准组建申请')

      // 提交审批
      await adminPage.click('.approval-dialog button:has-text("提交审批")')

      // 确认批准
      await adminPage.click('.el-message-box button:has-text("确定批准")')
      await adminPage.waitForSelector('.el-message--success')

      // 验证项目状态已更新
      await adminPage.goto('/project/management')
      await expect(adminPage.locator('.project-card:first-child .cooperation-status'))
        .toContainText('已批准')

      await adminContext.close()
    })

    // ===== 验证最终状态 =====
    test.step('验证流程完成', async () => {
      const managerContext = await browser.newContext()
      const managerPage = await managerContext.newPage()

      await managerPage.goto('/login')
      await managerPage.fill('input[name="username"]', 'project_manager')
      await managerPage.fill('input[name="password"]', 'password123')
      await managerPage.click('button[type="submit"]')

      // 查看我的申请
      await managerPage.goto('/project/collaboration')
      await managerPage.click('.el-tabs__item:has-text("我的申请")')

      // 验证申请状态为"已批准"
      await expect(managerPage.locator('.application-status:first-child'))
        .toContainText('已批准')

      // 验证团队成员已激活
      await managerPage.click('.application-item:first-child')
      await expect(managerPage.locator('.member-status')).toContainText('active')

      await managerContext.close()
    })
  })
})
```

### 4.3 性能测试

#### 负载测试脚本

```javascript
// tests/load/project-collaboration.load.test.js

const loadtest = require('loadtest')

const options = {
  url: 'http://localhost:3000/api/project-collaboration/applications',
  maxRequests: 1000,
  concurrency: 50,
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <test-token>',
    'Content-Type': 'application/json'
  }
}

loadtest.loadTest(options, (error, result) => {
  if (error) {
    console.error('Load test failed:', error)
  } else {
    console.log('Load test results:')
    console.log(`  Total requests: ${result.totalRequests}`)
    console.log(`  Total errors: ${result.totalErrors}`)
    console.log(`  Mean latency: ${result.meanLatencyMs} ms`)
    console.log(`  Max latency: ${result.maxLatencyMs} ms`)
    console.log(`  Requests per second: ${result.rps}`)
  }
})
```

---

## 📅 第五部分: 实施时间表

### Week 1: 核心流程打通 (MVP)

#### Day 1-2: 后端服务增强
- [ ] **Task 1.1**: 实现事务管理服务层方法
  - 文件: `projectCollaborationService.js`
  - 工时: 1.5天
  - 交付物: 带事务的提交/审批方法

- [ ] **Task 1.2**: 完善通知服务
  - 文件: `notificationService.js`
  - 工时: 0.5天
  - 交付物: 三阶段通知方法

#### Day 3-4: 前端组件优化
- [ ] **Task 1.3**: 团队申请表单实时验证
  - 文件: `TeamApplicationDialog.vue`
  - 工时: 1天
  - 交付物: 完整表单验证逻辑

- [ ] **Task 1.4**: 审批对话框二次确认
  - 文件: `ProjectApprovalDialog.vue`
  - 工时: 0.5天
  - 交付物: 确认弹窗和错误处理

- [ ] **Task 1.5**: 状态流转自动化
  - 文件: `ProjectCollaboration.vue`
  - 工时: 0.5天
  - 交付物: 状态变更自动刷新

#### Day 5: 集成测试
- [ ] **Task 1.6**: 手动测试完整流程
  - 测试场景: 发布→申请→批准
  - 工时: 0.5天
  - 交付物: 测试报告

- [ ] **Task 1.7**: Bug修复
  - 工时: 0.5天
  - 交付物: 修复清单

**Week 1 里程碑**: 核心三阶段流程可完整走通

### Week 2: 功能完善和优化

#### Day 6-7: 增强功能开发
- [ ] **Task 2.1**: 成本自动计算
  - 文件: `TeamApplicationDialog.vue`
  - 工时: 0.5天

- [ ] **Task 2.2**: 批量审批功能
  - 文件: `ProjectMemberApproval.vue`
  - 工时: 1天

- [ ] **Task 2.3**: 审批历史查询
  - 文件: 新建 `ApprovalHistory.vue`
  - 工时: 0.5天

#### Day 8-9: 用户体验优化
- [ ] **Task 2.4**: 加载状态优化
  - 工时: 0.5天
  - 交付物: Skeleton屏和Loading指示器

- [ ] **Task 2.5**: 错误提示优化
  - 工时: 0.5天
  - 交付物: 友好的错误提示文案

- [ ] **Task 2.6**: 响应式布局适配
  - 工时: 0.5天
  - 交付物: 移动端适配样式

#### Day 10: 性能优化
- [ ] **Task 2.7**: 数据库查询优化
  - 工时: 0.5天
  - 交付物: 索引优化方案

- [ ] **Task 2.8**: 前端懒加载
  - 工时: 0.5天
  - 交付物: 组件懒加载配置

**Week 2 里程碑**: 功能完善,用户体验良好

### Week 3: 测试、文档和上线

#### Day 11-12: E2E测试
- [ ] **Task 3.1**: 编写Playwright测试
  - 文件: `project-collaboration-e2e.spec.ts`
  - 工时: 1.5天
  - 交付物: 完整E2E测试套件

#### Day 13-14: 文档编写
- [ ] **Task 3.2**: API文档更新
  - 工时: 0.5天
  - 交付物: Swagger文档

- [ ] **Task 3.3**: 用户操作手册
  - 工时: 1天
  - 交付物: 用户手册PDF

#### Day 15: 上线准备
- [ ] **Task 3.4**: 生产环境部署
  - 工时: 0.5天
  - 交付物: 部署检查清单

- [ ] **Task 3.5**: 用户培训
  - 工时: 0.5天
  - 交付物: 培训PPT

**Week 3 里程碑**: 系统正式上线

---

## ✅ 第六部分: 验收标准

### 6.1 功能验收

| 验收项 | 验收标准 | 验收方法 |
|--------|---------|---------|
| 项目发布 | 管理层可成功发布项目,系统自动通知相关人员 | 手动测试 + E2E测试 |
| 团队申请 | 项目经理可提交申请,分配比例验证正确,成本计算准确 | 手动测试 + 单元测试 |
| 审批决策 | 管理层可批准/拒绝申请,状态流转正确,通知及时发送 | 手动测试 + E2E测试 |
| 数据一致性 | 并发场景下数据不丢失,事务完整性保障 | 集成测试 + 负载测试 |
| 权限控制 | 不同角色权限隔离正确,非授权操作被拦截 | 权限矩阵测试 |

### 6.2 性能验收

| 性能指标 | 目标值 | 测试方法 |
|---------|--------|---------|
| 页面加载时间 | ≤ 2秒 | Lighthouse测试 |
| API响应时间 | ≤ 500ms (95%请求) | 负载测试 |
| 并发用户 | 支持100+ | 压力测试 |
| 事务成功率 | ≥ 99.9% | 集成测试 |

### 6.3 质量验收

| 质量指标 | 目标值 | 验证方法 |
|---------|--------|---------|
| 代码覆盖率 | ≥ 80% | Jest + Nyc |
| E2E测试覆盖 | 核心流程100% | Playwright报告 |
| Bug密度 | ≤ 5个/KLOC | SonarQube扫描 |
| 用户满意度 | ≥ 4.0/5.0 | 用户调查问卷 |

---

## 🚨 第七部分: 风险管理

### 7.1 技术风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 数据库事务死锁 | 中 | 高 | 实施死锁检测和重试机制 |
| 并发冲突导致数据不一致 | 中 | 高 | 乐观锁 + 版本号控制 |
| API性能瓶颈 | 低 | 中 | 查询优化 + Redis缓存 |

### 7.2 进度风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 需求变更频繁 | 高 | 中 | 版本冻结机制,变更需评审 |
| 技术难点阻塞 | 中 | 高 | 提前技术预研,外部专家支持 |
| 测试不充分 | 中 | 高 | 增加测试时间,引入自动化测试 |

### 7.3 业务风险

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| 用户接受度低 | 低 | 中 | 分阶段试点推广,收集反馈 |
| 权限配置错误 | 中 | 高 | 权限矩阵评审 + 自动化测试 |
| 数据迁移失败 | 低 | 高 | 完整备份 + 灰度迁移 |

---

## 📚 第八部分: 参考资源

### 8.1 技术文档
- [Vue 3官方文档](https://cn.vuejs.org/)
- [Element Plus组件库](https://element-plus.org/zh-CN/)
- [MySQL 8.0参考手册](https://dev.mysql.com/doc/refman/8.0/en/)
- [Playwright E2E测试](https://playwright.dev/)

### 8.2 项目文档
- `docs/项目协作模块-系统需求分析文档.md` - 需求分析
- `docs/项目协作模块开发规划.md` - 详细开发规划
- `docs/TODO.md` - 任务清单
- `README.md` - 项目说明

### 8.3 代码参考
- `backend/src/controllers/projectCollaborationController.js` - 控制器示例
- `frontend/src/views/project/ProjectCollaboration.vue` - 页面组件示例
- `frontend/tests/project-collaboration-e2e.spec.ts` - E2E测试示例

---

## 📝 附录: 快速启动指南

### 开发环境启动
```bash
# 1. 启动后端服务
cd backend
npm run dev              # 端口: 3000

# 2. 启动前端服务
cd frontend
npm run dev              # 端口: 8080

# 3. 访问系统
浏览器打开: http://localhost:8080
默认账号: admin / admin123
```

### 测试执行
```bash
# 后端测试
cd backend
npm test

# 前端E2E测试
cd frontend
npx playwright test
npx playwright show-report

# 代码覆盖率
npm run test:coverage
```

### 数据库初始化
```bash
# MySQL生产环境
mysql -u root -p < database/init.sql

# 导入测试数据
node scripts/import-test-data.js
```

---

**文档制定**: 2025-10-17
**预计完成**: 2025-11-07
**负责人**: 全栈开发团队
**当前状态**: 📋 规划完成,等待执行

**下一步行动**:
1. ✅ 召开项目启动会,讲解开发规划
2. ⏳ 分配Week 1任务给开发人员
3. ⏳ 建立每日站会机制跟踪进度
4. ⏳ 启动开发工作,按时间表推进

---

*本规划基于项目当前70%完成度制定,旨在用最短时间完成剩余30%核心功能,确保三阶段业务流程完整可用。*
