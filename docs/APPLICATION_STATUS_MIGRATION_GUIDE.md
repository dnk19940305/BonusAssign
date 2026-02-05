# 团队申请状态字段优化迁移指南

## 📋 概述

将 `project_team_applications.status` 字段从 `varchar(20)` 字符串类型优化为 `tinyint` 整数类型。

## 🎯 优化目标

### 为什么要改？

**当前问题**（varchar 字符串）：
- ❌ 拼写错误不易发现（`'approve'` vs `'approved'`）
- ❌ 状态扩展需要修改多处代码
- ❌ 性能较差（字符串比较慢）
- ❌ 占用空间大（varchar(20) vs tinyint）
- ❌ 类型不安全（可能插入任意值）

**优化后优势**（tinyint 整数）：
- ✅ 类型安全，编译时检查
- ✅ 性能更好（整数比较快）
- ✅ 占用空间小（1 byte vs 最多 20 bytes）
- ✅ 易于扩展（只需添加常量）
- ✅ 统一管理（常量文件集中维护）

---

## 📊 状态码定义

| 状态码 | 英文名称 | 中文名称 | 说明 |
|--------|----------|----------|------|
| 0 | pending | 待审批 | 申请已提交，等待审批 |
| 1 | approved | 已批准 | 申请已通过审批 |
| 2 | rejected | 已拒绝 | 申请被拒绝 |
| 3 | needs_modification | 需修改 | 申请需要修改后重新提交 |
| 4 | cancelled | 已取消 | 申请被申请人主动取消 |

---

## 🔄 迁移步骤

### 第一阶段：准备阶段（不影响现有功能）

#### 1. 创建常量文件

**后端常量**（已创建）：
```bash
backend/src/constants/applicationStatus.js
```

**前端常量**（已创建）：
```bash
frontend/src/constants/applicationStatus.ts
```

#### 2. 执行数据库迁移脚本（第1-3步）

```bash
mysql -u root -p bonus_system < database/migrations/update-team-application-status-to-int.sql
```

这将：
- ✅ 添加新字段 `status_code` (tinyint)
- ✅ 迁移现有数据（字符串 → 整数）
- ✅ 验证数据迁移正确性

⚠️ **注意**：此时数据库同时存在 `status` (varchar) 和 `status_code` (tinyint) 两个字段

---

### 第二阶段：代码迁移（逐步替换）

#### 后端代码修改示例

**修改前**（字符串）：
```javascript
// ❌ 旧代码
if (application.status === 'pending') {
  // ...
}

await connection.execute(
  `UPDATE project_team_applications SET status = 'approved' WHERE id = ?`,
  [id]
)
```

**修改后**（整数 + 常量）：
```javascript
// ✅ 新代码
const { APPLICATION_STATUS } = require('../constants/applicationStatus')

if (application.status === APPLICATION_STATUS.PENDING) {
  // ...
}

await connection.execute(
  `UPDATE project_team_applications SET status = ? WHERE id = ?`,
  [APPLICATION_STATUS.APPROVED, id]
)
```

#### 需要修改的后端文件清单

1. **backend/src/services/projectCollaborationService.js**
   - ✏️ L310: `status = 'rejected'` → `status = ${APPLICATION_STATUS.REJECTED}`
   - ✏️ L503: `status !== 'needs_modification' && status !== 'rejected'`
   - ✏️ L535: `status = 'pending'`
   - ✏️ L613-615: 状态过滤逻辑
   - ✏️ L818-826: 查询条件

2. **backend/src/controllers/projectCollaborationController.js**
   - ✏️ L690: 验证 action 参数逻辑

3. **backend/scripts/check-projects.js**
   - ✏️ L39-48: 查询和显示逻辑

4. **backend/scripts/fix-batch-approve-inconsistency.js**
   - ✏️ L33: `WHERE pta.status = 'pending'`
   - ✏️ L60: `SET status = 'approved'`

---

#### 前端代码修改示例

**修改前**（字符串）：
```typescript
// ❌ 旧代码
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝'
  }
  return labelMap[status] || status
}
```

**修改后**（整数 + 常量）：
```typescript
// ✅ 新代码
import { ApplicationStatus, getStatusLabel } from '@/constants/applicationStatus'

// 直接使用工具函数
const label = getStatusLabel(application.status)

// 或者使用枚举进行比较
if (application.status === ApplicationStatus.PENDING) {
  // ...
}
```

#### 需要修改的前端文件清单

1. **frontend/src/views/project/components/ProjectApplicationManager.vue**
   - ✏️ L478-487: `getStatusLabel` 函数

2. **frontend/src/views/project/ProjectCollaborationDetail.vue**
   - ✏️ L514-522: `getApplicationStatusType` 函数
   - ✏️ L525-533: `getApplicationStatusLabel` 函数

---

### 第三阶段：完成迁移

#### 1. 测试验证

**测试项目**：
- ✅ 创建团队申请
- ✅ 审批团队申请（批准/拒绝/需修改）
- ✅ 查询申请列表（按状态过滤）
- ✅ 申请状态统计
- ✅ 前端状态显示

#### 2. 执行字段替换（数据库迁移脚本第4步）

⚠️ **重要**：确保所有代码已更新并测试通过后，再执行此步骤！

```sql
USE bonus_system;

-- 删除旧的 status 字段
ALTER TABLE `project_team_applications` DROP COLUMN `status`;

-- 重命名 status_code 为 status
ALTER TABLE `project_team_applications` 
CHANGE COLUMN `status_code` `status` 
tinyint NOT NULL DEFAULT 0 
COMMENT '申请状态码（0-待审批 1-已批准 2-已拒绝 3-需修改 4-已取消）';

-- 添加索引（可选，提升查询性能）
CREATE INDEX `idx_status` ON `project_team_applications`(`status`);
```

#### 3. 更新表结构文件

修改以下文件中的表结构定义：
- `database/bonus_system.sql`
- `database/bonus_system_empty.sql`

将 `status varchar(20)` 改为 `status tinyint NOT NULL DEFAULT 0`

---

## 📝 代码使用示例

### 后端使用

```javascript
const { APPLICATION_STATUS, getStatusLabel } = require('../constants/applicationStatus')

// 1. 创建申请（默认为待审批）
await connection.execute(
  `INSERT INTO project_team_applications (project_id, applicant_id, status) 
   VALUES (?, ?, ?)`,
  [projectId, applicantId, APPLICATION_STATUS.PENDING]
)

// 2. 更新状态
await connection.execute(
  `UPDATE project_team_applications SET status = ? WHERE id = ?`,
  [APPLICATION_STATUS.APPROVED, applicationId]
)

// 3. 查询过滤
const [applications] = await connection.execute(
  `SELECT * FROM project_team_applications WHERE status = ?`,
  [APPLICATION_STATUS.PENDING]
)

// 4. 状态判断
if (application.status === APPLICATION_STATUS.PENDING) {
  // 只有待审批的申请才能审批
}

// 5. 获取中文标签
const label = getStatusLabel(application.status)  // "待审批"
```

### 前端使用

```typescript
import { 
  ApplicationStatus, 
  getStatusLabel, 
  getStatusType,
  getAllStatusOptions 
} from '@/constants/applicationStatus'

// 1. 状态判断
if (application.status === ApplicationStatus.PENDING) {
  // 显示审批按钮
}

// 2. 显示标签
<el-tag :type="getStatusType(application.status)">
  {{ getStatusLabel(application.status) }}
</el-tag>

// 3. 下拉框选项
<el-select v-model="statusFilter">
  <el-option
    v-for="option in getAllStatusOptions()"
    :key="option.value"
    :label="option.label"
    :value="option.value"
  />
</el-select>
```

---

## ⚠️ 注意事项

### 向后兼容

常量文件提供了向后兼容的工具函数：

```javascript
// 后端
const { getStatusCode } = require('../constants/applicationStatus')
const code = getStatusCode('pending')  // 返回 0

// 前端
import { getStatusCode } from '@/constants/applicationStatus'
const code = getStatusCode('pending')  // 返回 ApplicationStatus.PENDING (0)
```

### 数据库查询

```javascript
// ❌ 错误：不要直接使用数字
WHERE status = 0

// ✅ 正确：使用常量
WHERE status = ${APPLICATION_STATUS.PENDING}
```

### TypeScript 类型

前端使用枚举提供类型安全：

```typescript
function handleApplication(status: ApplicationStatus) {
  // status 只能是 ApplicationStatus 枚举值
  // 编译时会检查类型错误
}
```

---

## 🎉 迁移完成后的好处

1. ✅ **类型安全**：编译时检查，避免拼写错误
2. ✅ **性能提升**：整数比较比字符串快
3. ✅ **节省空间**：tinyint(1 byte) vs varchar(20 bytes)
4. ✅ **易于维护**：状态集中管理，修改方便
5. ✅ **易于扩展**：新增状态只需添加常量
6. ✅ **统一规范**：前后端使用相同的状态码

---

## 📚 相关文件

- 数据库迁移脚本：`database/migrations/update-team-application-status-to-int.sql`
- 后端常量文件：`backend/src/constants/applicationStatus.js`
- 前端常量文件：`frontend/src/constants/applicationStatus.ts`
- 本指南文档：`docs/APPLICATION_STATUS_MIGRATION_GUIDE.md`

---

## 🤝 总结

这个优化方案：
- ✅ 向后兼容（提供转换函数）
- ✅ 渐进式迁移（不影响现有功能）
- ✅ 完整的文档和示例
- ✅ 前后端统一（相同的状态码定义）
- ✅ 类型安全（TypeScript 枚举 + 常量）

**建议在开发环境充分测试后，再部署到生产环境！**
