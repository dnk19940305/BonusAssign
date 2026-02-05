# BonusAssign - 奖金分配管理系统

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

一个基于三维模型（利润贡献度 + 岗位价值 + 绩效表现）的企业奖金分配管理系统，支持多项目协作、灵活的权重配置和智能的奖金计算引擎。

## 📋 目录

- [系统简介](#系统简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [部署指南](#部署指南)
- [项目结构](#项目结构)
- [文档](#文档)
- [许可证](#许可证)

## 系统简介

BonusAssign 是一套完整的企业奖金分配解决方案，采用三维奖金计算模型：

```
员工最终奖金 = (员工综合得分 / 所有员工总得分) × 奖金池可分配金额
```

**三维得分构成：**
- **利润贡献度**：基于员工在项目中的工作量、质量、直接贡献
- **岗位价值**：基于岗位的市场基准价值（benchmark_value）
- **绩效表现**：基于季度/年度绩效评估结果

## 核心功能

### 📊 基础数据管理
- 组织架构管理（部门、岗位、员工）
- 业务线配置与权重管理
- 岗位价值评估与基准配置
- 城市系数与地域调整

### 🎯 项目协作管理
- 项目创建与发布
- 团队成员申请与审批
- 项目里程碑跟踪
- 项目成本核算（预算、成本、利润）
- 项目角色与权重配置

### 📈 绩效管理
- 多维度绩效指标配置
- 绩效数据录入与评估
- 绩效记录历史追踪

### 💰 奖金计算引擎
- 公司级/项目级/部门级奖金池管理
- 三维奖金计算（支持标准化与归一化）
- 灵活的权重配置（业务线、项目、岗位）
- 奖金模拟与调整

### 📱 个人中心
- 个人奖金明细查看
- 历史奖金趋势分析
- 三维得分详细拆解
- 改进建议推送

### 🔐 权限管理
- 基于角色的访问控制（RBAC）
- 细粒度权限配置
- 权限委托功能
- 操作日志审计

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
- **测试**: Playwright (E2E)

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL 8.0
- **ORM**: Sequelize
- **认证**: JWT
- **日志**: Winston
- **API文档**: Swagger

### DevOps
- **容器化**: Docker + Docker Compose
- **监控**: Prometheus + Grafana
- **反向代理**: Nginx
- **进程管理**: PM2

## 快速开始

### 前置要求

- Node.js 16+ 
- MySQL 8.0+
- npm 或 yarn

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/dnk19940305/BonusAssign.git
cd BonusAssign
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.template .env

# 编辑 .env 文件，配置数据库连接等信息
# 主要配置项：
# - DB_HOST: 数据库主机
# - DB_USER: 数据库用户名
# - DB_PASSWORD: 数据库密码
# - DB_NAME: 数据库名称
# - JWT_SECRET: JWT密钥
```

3. **初始化数据库**
```bash
# Windows
scripts\import-to-database.bat

# Linux/Mac
bash scripts/import-to-database.sh
```

4. **安装依赖**
```bash
# Windows
scripts\clean-install-deps.bat

# Linux/Mac
bash scripts/clean-install-deps.sh
```

5. **启动开发服务器**
```bash
# Windows
scripts\dev-start.bat

# Linux/Mac
bash scripts/dev-start.sh
```

6. **访问应用**
- 前端: http://localhost:5173
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api-docs

**默认管理员账号：**
- 用户名: `admin`
- 密码: `admin123`

### Docker 部署

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.production.yml up -d
```

## 部署指南

### 生产环境部署

1. **配置生产环境变量**
```bash
cp .env.production.template .env.production
# 编辑 .env.production 配置生产环境参数
```

2. **构建前端静态资源**
```bash
cd frontend
npm install
npm run build
```

3. **启动生产服务**
```bash
# 使用 PM2
npm run prod:start

# 或使用 Docker
docker-compose -f docker-compose.production.yml up -d
```

4. **配置 Nginx 反向代理**
```nginx
# 参考 deploy/nginx/nginx.prod.conf
```

详细部署文档请参考：[部署脚本说明](./scripts/)

## 项目结构

```
BonusAssign/
├── backend/                # 后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── middlewares/   # 中间件
│   │   └── utils/         # 工具函数
│   ├── scripts/           # 后端脚本
│   └── package.json
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── api/           # API接口
│   │   ├── store/         # 状态管理
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   ├── tests/             # 测试文件
│   └── package.json
├── database/              # 数据库文件
│   ├── migrations/        # 数据库迁移
│   ├── scripts/           # 数据库脚本
│   └── *.sql              # SQL文件
├── deploy/                # 部署配置
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   └── nginx/
├── docs/                  # 项目文档
├── scripts/               # 项目脚本
├── monitoring/            # 监控配置
├── docker-compose*.yml    # Docker编排文件
└── README.md
```

## 文档

- [系统需求分析文档](./docs/系统需求分析文档.md)
- [详细设计文档](./docs/详细设计文档.md)
- [奖金系统完整操作流程](./docs/奖金系统完整操作流程.md)
- [用户操作指南](./docs/USER_OPERATION_GUIDE.md)
- [项目全流程操作手册](./docs/项目全流程操作手册.md)
- [奖金计算方法说明](./docs/奖金计算方法说明.md)
- [数据库管理指南](./docs/DATABASE_MANAGEMENT_GUIDE.md)
- [API接口文档](http://localhost:3000/api-docs) (需启动后端服务)

### 功能模块文档

- [项目协作模块](./docs/PROJECT_COLLABORATION_IMPLEMENTATION_PLAN.md)
- [项目成本管理](./docs/PROJECT_COST_MANAGEMENT_GUIDE.md)
- [里程碑管理](./docs/MILESTONE_API_GUIDE.md)
- [权限按钮控制](./docs/PERMISSION_BUTTON_GUIDE.md)

## 主要特性

### 🎨 灵活的权重配置
- 支持业务线级别权重配置
- 支持项目级别权重配置
- 支持岗位角色权重模板
- 三维得分权重动态调整

### 🔄 智能计算引擎
- 支持标准化（Z-Score）和归一化处理
- 自动处理异常值和缺失值
- 支持多种归一化方法（Min-Max、Sigmoid等）
- 实时计算预览和模拟

### 📊 可视化分析
- 奖金分布图表
- 历史趋势分析
- 三维得分雷达图
- 部门/项目对比分析

### 🔒 安全可靠
- JWT身份认证
- 细粒度权限控制
- 操作日志审计
- 数据加密存储

### 🚀 高性能
- 数据库查询优化
- 批量计算优化
- 结果缓存机制
- 异步任务处理

## 开发指南

### 运行测试

```bash
# 后端单元测试
cd backend
npm test

# 前端单元测试
cd frontend
npm run test:unit

# E2E测试
cd frontend
npm run test:e2e
```

### 代码规范

- 后端遵循 ESLint + Airbnb 规范
- 前端遵循 Vue 3 官方风格指南
- 提交信息遵循 Conventional Commits

### 脚本说明

```bash
# 开发环境快速启动
scripts/dev-quick.sh

# 数据库备份
scripts/backup-data.sh

# 健康检查
scripts/health-check.sh

# 初始化基础数据
scripts/init-basic-data.js

# 生产环境管理
scripts/prod-manage.sh
```

## 常见问题

### 数据库连接失败
- 检查 `.env` 中数据库配置是否正确
- 确认 MySQL 服务已启动
- 检查防火墙设置

### 前端无法访问后端API
- 确认后端服务已启动（默认端口3000）
- 检查 CORS 配置
- 查看浏览器控制台错误信息

### Docker 容器启动失败
- 检查端口占用情况
- 查看容器日志：`docker-compose logs -f`
- 确认环境变量配置正确

更多问题请查看 [Issues](https://github.com/dnk19940305/BonusAssign/issues)

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新历史。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

## 联系方式

- 项目主页: https://github.com/dnk19940305/BonusAssign
- 问题反馈: https://github.com/dnk19940305/BonusAssign/issues

---

**注意**: 本系统仅供学习和研究使用，生产环境使用前请进行充分测试和安全评估。
