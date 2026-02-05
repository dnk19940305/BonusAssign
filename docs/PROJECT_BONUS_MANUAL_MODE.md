# 项目奖金手动录入模式 - 功能说明

## 功能变更概述

### 1. 一个项目一个奖金池
- **变更前**：一个项目可创建多个奖金池（按期间区分）
- **变更后**：一个项目只能创建一个奖金池，支持多次重复计算
- **优势**：简化管理，项目全生命周期统一奖金池

### 2. 手动录入三维数据
- **变更前**：自动从系统计算三维指标（利润贡献、岗位价值、绩效表现）
- **变更后**：手动录入三维指标数据
- **录入方式**：
  - Excel模板批量导入
  - 界面单条录入

### 3. 多次计算支持
- 项目过程中可多次计算奖金
- 每次计算生成最新分配结果
- 成员可查看历史计算记录
- 最终结项时确定最终奖金

## 使用流程

### Step 1: 创建奖金池
```
项目管理员 → 创建奖金池
- 选择项目
- 设置奖金总额
- 选择绩效期间
```

### Step 2: 导出模板
```
奖金池详情页 → 下载Excel模板
模板包含：
- 员工ID
- 员工姓名  
- 绩效期间
- 奖金池创建时间
- 利润贡献（待填）
- 岗位价值（待填）
- 绩效表现（待填）
```

### Step 3: 填写数据
```
在Excel中填写三维数据：
- 利润贡献：员工对项目利润的贡献值
- 岗位价值：岗位在项目中的价值权重
- 绩效表现：员工绩效考核得分
```

### Step 4: 导入数据
```
上传填好的Excel文件
系统自动验证并保存数据
```

### Step 5: 计算奖金
```
点击"计算奖金"按钮
系统根据三维数据计算分配结果
计算公式：
奖金 = 总额 × (利润贡献 + 岗位价值 + 绩效表现) / 总权重
```

### Step 6: 查看结果
```
成员可查看：
- 当前奖金分配
- 历史计算记录
- 三维数据明细
```

## API接口

### 下载模板
```
GET /api/project-performance/pools/:poolId/template
```

### 上传Excel
```
POST /api/project-performance/pools/:poolId/import
Content-Type: multipart/form-data
Body: file (Excel文件)
```

### 获取绩效数据
```
GET /api/project-performance/pools/:poolId/data
```

### 手动录入
```
POST /api/project-performance/records
Body: {
  poolId: string
  employeeId: string
  profitContribution: number
  positionValue: number
  performanceScore: number
}
```

### 计算奖金
```
POST /api/project-performance/pools/:poolId/calculate
```

## 数据库变更

### 新增表：project_performance_manual
```sql
CREATE TABLE `project_performance_manual` (
  `id` varchar(50) NOT NULL,
  `pool_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `employee_name` varchar(100) NOT NULL,
  `period` varchar(20) NOT NULL,
  `profit_contribution` decimal(15,2) DEFAULT 0.00,
  `position_value` decimal(10,4) DEFAULT 0.0000,
  `performance_score` decimal(10,4) DEFAULT 0.0000,
  `status` varchar(20) DEFAULT 'draft',
  `created_by` varchar(50) NOT NULL,
  `updated_by` varchar(50),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pool_employee` (`pool_id`, `employee_id`)
)
```

## 前端组件

### 新增文件
- `frontend/src/api/projectPerformance.ts` - API接口
- 待实现：`frontend/src/views/project/ProjectBonusManual.vue` - 手动录入页面

### 修改文件
- `frontend/src/views/project/ProjectBonusManagement.vue` - 增加手动模式入口

## 部署步骤

### 1. 执行数据库迁移
```bash
# 连接MySQL
mysql -u root -p bonus_system

# 执行迁移脚本
source database/migrations/create-project-performance-manual.sql
```

### 2. 安装依赖
```bash
cd backend
npm install
```

### 3. 重启服务
```bash
# 开发环境
npm run dev

# 生产环境
npm run prod
```

## 注意事项

1. **一个项目一个奖金池限制**
   - 创建前检查是否已存在
   - 删除奖金池需谨慎

2. **数据验证**
   - Excel格式必须正确
   - 员工ID必须存在
   - 数值必须为正数

3. **权限控制**
   - 只有项目管理员可创建奖金池
   - 只有HR/管理员可录入数据
   - 所有成员可查看结果

4. **历史记录**
   - 每次计算会覆盖之前的分配结果
   - 建议保留计算快照功能（后续优化）

## 后续优化建议

1. **版本管理**
   - 保存每次计算的历史版本
   - 支持版本对比和回滚

2. **数据校验**
   - 增加数据合理性检查
   - 提供数据修正建议

3. **批量操作**
   - 支持批量导入多个项目
   - 提供数据批量修改功能

4. **可视化报表**
   - 三维数据分布图
   - 奖金分配趋势图
