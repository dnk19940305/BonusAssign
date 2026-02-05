# 数据清理脚本使用指南

本目录包含多个数据清理和管理脚本，用于维护奖金系统的数据。

## 📋 脚本列表

### 数据清理脚本

#### 1. clean-bonus-allocations.js - 清理项目奖金分配数据
**用途**: 清理项目级奖金池和分配记录

**清理范围**:
- ✅ `project_bonus_allocations` - 项目奖金分配记录
- ✅ `project_bonus_pools` - 项目奖金池
- ❌ 不删除项目本身和其他项目数据

**使用场景**:
- 重新计算项目奖金
- 清理错误的项目奖金分配
- 保留项目基础数据

**操作模式**:
- `DELETE_ALL` - 删除所有项目奖金池和分配记录
- `DELETE_CALCULATED` - 仅删除状态为"calculated"的奖金池
- `DELETE_ALLOCATIONS_ONLY` - 仅删除分配记录，保留奖金池并重置状态
- `DELETE_BY_IDS` - 按指定ID删除奖金池
- `SHOW_ONLY` - 仅查看，不删除（默认）

**使用方法**:
```bash
# 1. 查看当前数据
node backend/scripts/clean-bonus-allocations.js

# 2. 编辑脚本，修改 ACTION 变量
# const ACTION = 'DELETE_ALLOCATIONS_ONLY'

# 3. 执行删除
node backend/scripts/clean-bonus-allocations.js
```

---

#### 2. clean-all-project-data.js - 清理所有项目数据
**用途**: 完全清理项目及所有相关数据

**清理范围**:
- ✅ `projects` - 项目基本信息
- ✅ `project_members` - 项目成员
- ✅ `project_bonus_pools` - 项目奖金池
- ✅ `project_bonus_allocations` - 项目奖金分配
- ✅ `project_costs` - 项目成本
- ✅ `project_milestones` - 项目里程碑
- ✅ `project_role_weights` - 项目角色权重

**使用场景**:
- 完全清空测试数据
- 重新开始项目管理
- 删除所有项目相关数据

**操作模式**:
- `DELETE_ALL` - 删除所有项目及相关数据
- `DELETE_BY_IDS` - 按指定ID删除项目
- `SHOW_ONLY` - 仅查看，不删除（默认）

**使用方法**:
```bash
# 1. 查看当前数据
node backend/scripts/clean-all-project-data.js

# 2. 编辑脚本，修改 ACTION 变量
# const ACTION = 'DELETE_ALL'

# 3. 执行删除
node backend/scripts/clean-all-project-data.js
```

---

#### 3. clean-all-bonus-calculation-data.js - 清理所有奖金计算数据 ⭐ 推荐
**用途**: 清理所有奖金计算相关数据（公司级+项目级）

**清理范围**:
- ✅ `bonus_pools` - 公司级奖金池
- ✅ `three_dimensional_calculation_results` - 三维计算结果
- ✅ `bonus_allocation_results` - 奖金分配结果
- ✅ `line_bonus_allocations` - 业务线奖金分配
- ✅ `employee_bonus_records` - 员工奖金记录
- ✅ `project_bonus_pools` - 项目级奖金池
- ✅ `project_bonus_allocations` - 项目奖金分配
- ✅ `project_bonus_calculation_history` - 计算历史记录

**使用场景**:
- 清空所有奖金计算数据
- 重新开始奖金计算
- 清理测试环境的奖金数据
- 按期间清理历史数据

**操作模式**:
- `DELETE_ALL` - 删除所有奖金计算数据
- `DELETE_COMPANY_BONUS` - 仅删除公司级奖金池和三维计算结果
- `DELETE_PROJECT_BONUS` - 仅删除项目级奖金池和分配记录
- `DELETE_BY_PERIOD` - 删除指定期间的数据（如：2025-Q1）
- `SHOW_ONLY` - 仅查看，不删除（默认）

**使用方法**:
```bash
# 1. 查看当前数据
node backend/scripts/clean-all-bonus-calculation-data.js

# 2. 编辑脚本，修改 ACTION 变量
# const ACTION = 'DELETE_ALL'
# 或按期间删除
# const ACTION = 'DELETE_BY_PERIOD'
# const PERIOD_TO_DELETE = '2025-Q1'

# 3. 执行删除
node backend/scripts/clean-all-bonus-calculation-data.js
```

---

### 数据检查脚本

#### 4. check-current-allocations.js - 检查分配记录
**用途**: 查看当前奖金分配数据状态

**功能**:
- 查看最近的奖金分配记录
- 查看角色权重配置
- 查看项目角色定义
- 检查权重异常的分配记录

**使用方法**:
```bash
node backend/scripts/check-current-allocations.js
```

---

### 重新计算脚本

#### 5. recalculate-bonus-pool.js - 重新计算项目奖金池
**用途**: 重新计算指定项目奖金池的分配

**功能**:
- 清理旧的分配记录
- 重新计算项目奖金分配
- 显示详细的计算结果

**使用方法**:
```bash
# 使用默认奖金池ID
node backend/scripts/recalculate-bonus-pool.js

# 指定奖金池ID
node backend/scripts/recalculate-bonus-pool.js <poolId>
```

---

#### 6. recalculate-company-bonus-pool.js - 重新计算公司级奖金池
**用途**: 使用三维模型重新计算公司级奖金分配

**功能**:
- 清理旧的三维计算结果
- 批量计算员工三维评分
- 分配奖金并保存结果
- 更新奖金池状态

**使用方法**:
```bash
# 使用默认奖金池ID
node backend/scripts/recalculate-company-bonus-pool.js

# 指定奖金池ID
node backend/scripts/recalculate-company-bonus-pool.js <poolId>
```

---

## 🎯 使用场景对照表

| 场景 | 推荐脚本 | 操作模式 |
|------|---------|---------|
| 重新计算项目奖金 | clean-bonus-allocations.js | DELETE_ALLOCATIONS_ONLY |
| 清空所有奖金计算数据 | clean-all-bonus-calculation-data.js | DELETE_ALL |
| 清空公司级奖金 | clean-all-bonus-calculation-data.js | DELETE_COMPANY_BONUS |
| 清空项目级奖金 | clean-all-bonus-calculation-data.js | DELETE_PROJECT_BONUS |
| 清理某个期间的数据 | clean-all-bonus-calculation-data.js | DELETE_BY_PERIOD |
| 完全清空项目数据 | clean-all-project-data.js | DELETE_ALL |
| 删除特定项目 | clean-all-project-data.js | DELETE_BY_IDS |
| 查看分配状态 | check-current-allocations.js | - |
| 重算项目奖金 | recalculate-bonus-pool.js | - |
| 重算公司奖金 | recalculate-company-bonus-pool.js | - |

---

## ⚠️ 安全提醒

### 使用前必读

1. **备份数据库**: 执行任何删除操作前，务必先备份数据库
   ```bash
   # MySQL 备份命令示例
   mysqldump -u root -p bonus_system > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **先查看模式**: 始终先用 `SHOW_ONLY` 模式查看数据
   - 所有脚本默认都是 `SHOW_ONLY` 模式
   - 确认数据无误后再修改为删除模式

3. **测试环境验证**: 建议先在测试环境验证脚本效果

4. **不可恢复**: 删除操作直接从数据库删除，无法撤销

5. **生产环境**: 在生产环境使用时要格外小心，建议：
   - 在维护窗口期执行
   - 通知相关人员
   - 准备回滚方案

### 操作流程建议

```bash
# 标准操作流程
# 1. 备份数据库
mysqldump -u root -p bonus_system > backup.sql

# 2. 查看当前数据（SHOW_ONLY 模式）
node backend/scripts/clean-all-bonus-calculation-data.js

# 3. 确认无误后，编辑脚本修改 ACTION
# vim backend/scripts/clean-all-bonus-calculation-data.js
# 修改: const ACTION = 'DELETE_ALL'

# 4. 执行删除
node backend/scripts/clean-all-bonus-calculation-data.js

# 5. 验证结果
node backend/scripts/clean-all-bonus-calculation-data.js
```

---

## 🔍 数据关系说明

### 公司级奖金计算体系
```
bonus_pools (公司级奖金池)
  ├── three_dimensional_calculation_results (三维计算结果)
  ├── bonus_allocation_results (奖金分配结果)
  ├── line_bonus_allocations (业务线奖金分配)
  └── employee_bonus_records (员工奖金记录)
```

### 项目级奖金计算体系
```
projects (项目)
  └── project_bonus_pools (项目奖金池)
      ├── project_bonus_allocations (项目奖金分配)
      └── project_bonus_calculation_history (计算历史)
```

### 删除顺序（外键依赖）
1. 先删除子表（分配记录、计算结果）
2. 再删除父表（奖金池）
3. 最后删除主表（项目）

---

## 📝 常见问题

### Q1: 执行脚本后项目列表还在？
**A**: 这是正常的。`clean-bonus-allocations.js` 只清理奖金数据，不删除项目本身。如需删除项目，请使用 `clean-all-project-data.js`。

### Q2: 如何只清理某个期间的奖金数据？
**A**: 使用 `clean-all-bonus-calculation-data.js`，设置：
```javascript
const ACTION = 'DELETE_BY_PERIOD'
const PERIOD_TO_DELETE = '2025-Q1'
```

### Q3: 删除后如何恢复？
**A**: 删除操作不可恢复，只能从备份恢复。请务必在删除前备份数据库。

### Q4: 脚本执行失败怎么办？
**A**:
1. 检查数据库连接是否正常
2. 查看错误日志
3. 确认是否有外键约束冲突
4. 如果是外键问题，脚本已按正确顺序删除，可能是数据库结构变化导致

### Q5: 如何查看脚本会删除哪些数据？
**A**: 所有脚本默认都是 `SHOW_ONLY` 模式，直接运行即可查看数据统计，不会执行删除。

### Q6: 三个清理脚本有什么区别？
**A**:
- `clean-bonus-allocations.js`: 只清理**项目级**奖金数据
- `clean-all-project-data.js`: 清理**项目本身**及所有相关数据
- `clean-all-bonus-calculation-data.js`: 清理**所有奖金计算**数据（公司级+项目级）⭐ 最全面

---

## 🛠️ 开发者说明

### 添加新的清理脚本

如果需要添加新的清理脚本，请遵循以下规范：

1. **命名规范**: `clean-<scope>-<target>.js`
2. **必须包含**:
   - 查看模式（SHOW_ONLY）
   - 详细的数据统计
   - 清晰的操作提示
   - 错误处理
3. **默认模式**: 必须默认为 `SHOW_ONLY`
4. **文档更新**: 在本 README 中添加说明

### 脚本模板

```javascript
const path = require('path')
const databaseService = require(path.join(__dirname, '../src/services/databaseService'))

async function cleanData() {
  try {
    await databaseService.initialize()

    // 1. 查看数据
    console.log('=== 查看当前数据 ===')
    // ... 查询和显示数据

    // 2. 配置区域
    const ACTION = 'SHOW_ONLY'

    if (ACTION === 'SHOW_ONLY') {
      console.log('当前为查看模式')
      process.exit(0)
    }

    // 3. 执行删除
    if (ACTION === 'DELETE_ALL') {
      // ... 删除逻辑
    }

    console.log('✅ 操作完成')
    process.exit(0)

  } catch (error) {
    console.error('❌ 操作失败:', error)
    process.exit(1)
  }
}

cleanData()
```

---

## 📞 支持

如有问题或建议，请联系开发团队或提交 Issue。

**最后更新**: 2026-01-13
