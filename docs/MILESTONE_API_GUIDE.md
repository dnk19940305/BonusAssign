# 里程碑管理系统 API 使用指南

## 📋 概述

里程碑管理系统提供了完整的项目里程碑跟踪和执行监控功能，包括：
- 项目里程碑管理（创建、更新、删除、查询）
- 项目执行跟踪（进度、预算、质量、风险）
- 进度日志记录（自动记录所有变更）

## 🔗 API 接口清单

### 1. 里程碑管理

#### 1.1 获取项目的所有里程碑
```http
GET /api/projects/:projectId/milestones
```

**查询参数：**
- `status` - 按状态筛选（可选）：pending, in_progress, completed, delayed, cancelled
- `sortBy` - 排序字段（可选）：sort_order, target_date, created_at, progress

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "milestone-uuid",
      "projectId": "project-uuid",
      "name": "需求分析阶段",
      "description": "完成项目需求分析和设计文档",
      "targetDate": "2025-11-01",
      "completionDate": null,
      "status": "in_progress",
      "progress": 50,
      "deliverables": "需求文档、原型设计",
      "dependencies": null,
      "sortOrder": 1,
      "createdBy": "user-id",
      "createdAt": "2025-10-16T10:00:00.000Z",
      "updatedAt": "2025-10-16T10:00:00.000Z"
    }
  ]
}
```

#### 1.2 创建里程碑
```http
POST /api/projects/:projectId/milestones
```

**请求体：**
```json
{
  "name": "需求分析阶段",
  "description": "完成项目需求分析和设计文档",
  "targetDate": "2025-11-01",
  "status": "pending",
  "deliverables": "需求文档、原型设计",
  "dependencies": ["milestone-id-1", "milestone-id-2"],
  "sortOrder": 1
}
```

**必填字段：**
- `name` - 里程碑名称
- `targetDate` - 目标完成日期

#### 1.3 获取里程碑详情
```http
GET /api/milestones/:id
```

#### 1.4 更新里程碑
```http
PUT /api/milestones/:id
```

**请求体：**（所有字段可选，只更新提供的字段）
```json
{
  "name": "需求分析阶段（更新）",
  "status": "in_progress",
  "progress": 75,
  "completionDate": "2025-10-30"
}
```

#### 1.5 删除里程碑
```http
DELETE /api/milestones/:id
```

#### 1.6 更新里程碑进度
```http
PATCH /api/milestones/:id/progress
```

**请求体：**
```json
{
  "progress": 80
}
```

**特性：**
- 进度值自动验证（0-100）
- 达到100%自动设置完成状态和日期
- 自动记录进度变化日志

### 2. 项目执行跟踪

#### 2.1 获取项目执行跟踪信息
```http
GET /api/projects/:projectId/execution
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "execution-uuid",
    "projectId": "project-uuid",
    "overallProgress": 50,
    "budgetUsage": 50000.00,
    "costOverrun": 0,
    "scheduleVariance": -2,
    "qualityScore": 85,
    "riskLevel": "medium",
    "teamPerformance": {
      "efficiency": 0.85,
      "collaboration": 0.90
    },
    "lastUpdatedBy": "user-id",
    "createdAt": "2025-10-16T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  }
}
```

#### 2.2 更新项目执行跟踪
```http
POST /api/projects/:projectId/execution
```

**请求体：**（所有字段可选）
```json
{
  "overallProgress": 60,
  "budgetUsage": 60000,
  "costOverrun": 5000,
  "scheduleVariance": -3,
  "qualityScore": 88,
  "riskLevel": "high",
  "teamPerformance": {
    "efficiency": 0.82,
    "collaboration": 0.88
  }
}
```

**字段说明：**
- `overallProgress` - 整体进度（0-100）
- `budgetUsage` - 预算使用金额
- `costOverrun` - 成本超支金额
- `scheduleVariance` - 进度偏差（天数，负数表示延期）
- `qualityScore` - 质量评分（0-100）
- `riskLevel` - 风险等级：low, medium, high, critical
- `teamPerformance` - 团队表现数据（JSON格式）

#### 2.3 获取项目进度日志
```http
GET /api/projects/:projectId/progress-logs
```

**查询参数：**
- `progressType` - 按类型筛选（可选）：milestone, cost, quality, risk
- `limit` - 每页数量（默认50）
- `offset` - 偏移量（默认0）

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-uuid",
      "projectId": "project-uuid",
      "milestoneId": "milestone-uuid",
      "progressType": "milestone",
      "description": "里程碑进度更新",
      "progressValue": 75,
      "oldValue": 50,
      "newValue": 75,
      "loggedBy": "user-id",
      "loggedAt": "2025-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### 2.4 计算项目整体进度
```http
GET /api/projects/:projectId/calculate-progress
```

**功能：**
- 基于所有里程碑的平均进度计算
- 自动更新执行跟踪表
- 排除已取消的里程碑

**响应示例：**
```json
{
  "success": true,
  "message": "整体进度计算完成",
  "data": {
    "overallProgress": 62,
    "milestoneCount": 5
  }
}
```

## 📊 数据模型

### 里程碑状态
- `pending` - 待开始
- `in_progress` - 进行中
- `completed` - 已完成
- `delayed` - 延期
- `cancelled` - 已取消

### 风险等级
- `low` - 低风险
- `medium` - 中等风险
- `high` - 高风险
- `critical` - 紧急风险

### 进度类型
- `milestone` - 里程碑进度
- `cost` - 成本变化
- `quality` - 质量变化
- `risk` - 风险变化

## 🔐 认证要求

所有API接口都需要认证。请在请求头中包含JWT令牌：

```http
Authorization: Bearer <your-jwt-token>
```

## 💡 使用示例

### 创建里程碑并跟踪进度

```javascript
// 1. 创建里程碑
const milestone = await axios.post('/api/projects/project-123/milestones', {
  name: '系统设计',
  targetDate: '2025-12-01',
  deliverables: '系统架构图、数据库设计'
});

// 2. 更新进度
await axios.patch(`/api/milestones/${milestone.data.data.id}/progress`, {
  progress: 30
});

// 3. 查看执行跟踪
const execution = await axios.get('/api/projects/project-123/execution');

// 4. 计算整体进度
const overall = await axios.get('/api/projects/project-123/calculate-progress');
```

## 📈 自动化功能

### 1. 进度日志自动记录
所有关键操作都会自动记录日志：
- 里程碑创建
- 进度更新
- 状态变更
- 执行跟踪更新

### 2. 自动完成状态
当里程碑进度达到100%时：
- 自动设置状态为 `completed`
- 自动设置完成日期为当前日期

### 3. 整体进度自动计算
调用计算接口时：
- 计算所有里程碑的平均进度
- 更新项目执行跟踪表
- 排除已取消的里程碑

## 🧪 测试脚本

运行数据库测试：
```bash
node scripts/test-milestone-db.js
```

测试覆盖：
- ✅ 数据库连接
- ✅ 里程碑创建、查询、更新
- ✅ 执行跟踪
- ✅ 进度日志
- ✅ 进度计算
- ✅ 数据清理

## 📚 相关文档

- [开发总结](./MILESTONE_DEVELOPMENT_SUMMARY.md)
- [TODO列表](./TODO.md)
- [数据库表创建脚本](../backend/src/scripts/create-milestone-tables.js)

---

**最后更新**: 2025-10-16  
**API版本**: v1.0  
**状态**: 已发布 ✅
