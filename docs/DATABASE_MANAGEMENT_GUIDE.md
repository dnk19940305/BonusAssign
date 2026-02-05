# 数据库管理配置指南

## 📋 当前配置

**数据库管理方式**: 使用 **Navicat** 等外部工具管理 MySQL 数据库

**配置原则**:
- ✅ 使用外部 MySQL 服务器（不在 Docker 中运行 MySQL）
- ✅ 使用 Navicat 管理数据库（无需 Docker 数据库管理工具）
- ✅ 禁用 Redis 服务（项目不需要）
- ✅ 禁用 Adminer/phpMyAdmin 等 Docker 管理工具

## 🔍 已清理的配置

### 1. 根目录 Docker Compose 配置

#### ✅ docker-compose.yml（开发/测试环境）

**状态**: 已清理
- ❌ 无 MySQL 服务（使用外部 MySQL）
- ❌ 无 Redis 服务（已禁用）
- ❌ 无 Adminer 服务（使用 Navicat）
- ✅ Backend 使用 `network_mode: "host"` 访问外部 MySQL

**配置要点**:
```yaml
backend:
  environment:
    DB_HOST: ${DB_HOST:-localhost}  # 外部 MySQL 地址
    DB_PORT: ${DB_PORT:-3306}
    # Redis 已禁用
  network_mode: "host"  # 访问外部 MySQL
```

#### ✅ docker-compose.dev.yml（开发环境）

**状态**: 已清理
- ❌ 无 MySQL 服务
- ❌ 无 Redis 服务
- ❌ 无 Adminer 服务
- ✅ Backend 使用 `network_mode: "host"`

#### ✅ docker-compose.production.yml（生产环境）

**状态**: 已清理
- ❌ 无 MySQL 服务
- ❌ 无 Redis 服务
- ❌ 无 Adminer 服务
- ✅ 保留 Prometheus 和 Grafana（可选监控）

**配置要点**:
```yaml
backend:
  environment:
    DB_HOST: ${DB_HOST:-localhost}
    # Redis 已禁用
  network_mode: "host"

# 可选监控服务
prometheus:
  profiles: [monitoring]  # 需要时启用
grafana:
  profiles: [monitoring]
```

### 2. Deploy 目录配置

#### ✅ deploy/docker-compose.export.yml（镜像导出配置）

**状态**: 已更新（2024-12-11）
- ✅ MySQL 服务已注释（可选，如需独立部署可启用）
- ✅ Redis 服务已注释（已禁用）
- ✅ Adminer 服务已注释（使用 Navicat）
- ✅ Backend 使用外部 MySQL 配置

**配置说明**:
```yaml
# MySQL 服务（可选）
# 如果使用外部 MySQL（如 Navicat 管理的数据库），可以注释掉此服务
# mysql:
#   image: mysql:8.0
#   ...（已注释）

# Redis 服务已禁用（项目不需要 Redis）
# redis:
#   ...（已注释）

backend:
  environment:
    # 使用外部 MySQL 服务器（如 Navicat 管理的数据库）
    DB_HOST: ${DB_HOST:-localhost}
    # Redis 已禁用
  network_mode: "host"

# 数据库管理工具已移除
# 使用 Navicat 等外部工具管理 MySQL 数据库
# adminer:
#   ...（已注释）
```

## 🗂️ 配置文件对比

### 根目录配置（主要使用）

| 文件 | MySQL | Redis | Adminer | 用途 | 状态 |
|------|-------|-------|---------|------|------|
| **docker-compose.yml** | ❌ 外部 | ❌ 禁用 | ❌ 移除 | 开发/测试 | ✅ 已清理 |
| **docker-compose.dev.yml** | ❌ 外部 | ❌ 禁用 | ❌ 移除 | 开发环境 | ✅ 已清理 |
| **docker-compose.production.yml** | ❌ 外部 | ❌ 禁用 | ❌ 移除 | 生产环境 | ✅ 已清理 |

### Deploy 目录配置（镜像导出）

| 文件 | MySQL | Redis | Adminer | 用途 | 状态 |
|------|-------|-------|---------|------|------|
| **deploy/docker-compose.export.yml** | 💡 可选 | ❌ 禁用 | ❌ 移除 | 镜像导出 | ✅ 已更新 |

**说明**:
- ❌ 外部 = 使用外部 MySQL 服务器
- ❌ 禁用 = 完全不使用
- ❌ 移除 = 已删除配置
- 💡 可选 = 已注释，需要时可启用

## 🚀 使用 Navicat 管理数据库

### 第一步：准备 MySQL 数据库

使用 Navicat 创建数据库和用户：

```sql
-- 创建数据库
CREATE DATABASE bonus_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'bonus_user'@'%' IDENTIFIED BY 'your_password';

-- 授予权限
GRANT ALL PRIVILEGES ON bonus_system.* TO 'bonus_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 第二步：配置环境变量

编辑 `.env` 文件（从 `.env.template` 复制）：

```ini
# MySQL 数据库配置（外部 MySQL 服务器）
DB_HOST=localhost           # 或您的 MySQL 服务器 IP
DB_PORT=3306
DB_NAME=bonus_system
DB_USER=bonus_user
DB_PASSWORD=your_password   # 修改为实际密码

# Redis 已禁用（无需配置）
# REDIS_HOST=...
# REDIS_PORT=...

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 第三步：启动服务

```bash
# 使用主配置文件
docker-compose up -d

# 或使用开发配置
docker-compose -f docker-compose.dev.yml up -d

# 或使用生产配置
docker-compose -f docker-compose.production.yml up -d
```

### 第四步：在 Navicat 中管理

1. **连接数据库**
   - 主机: `localhost` 或您的 MySQL 服务器 IP
   - 端口: `3306`
   - 用户名: `bonus_user`
   - 密码: 您设置的密码
   - 数据库: `bonus_system`

2. **查看表结构**
   - 展开 `bonus_system` 数据库
   - 查看所有表和数据

3. **执行 SQL 查询**
   - 可以直接执行 SQL 语句
   - 查看和修改数据

4. **备份数据库**
   - 使用 Navicat 的备份功能
   - 定期备份重要数据

## 📊 数据库表说明

### 核心业务表

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `roles` | 角色表 |
| `permissions` | 权限表 |
| `user_roles` | 用户角色关联表 |
| `role_permissions` | 角色权限关联表 |
| `departments` | 部门表 |
| `projects` | 项目表 |
| `bonus_pools` | 奖金池表 |
| `bonus_records` | 奖金记录表 |
| `allocation_rules` | 分配规则表 |

### 其他表

查看完整表结构，请使用 Navicat 连接数据库后查看。

## 🔧 常见问题

### Q1: 为什么不在 Docker 中运行 MySQL？

**A**: 因为：
1. ✅ 您已经有外部 MySQL 服务器
2. ✅ 使用 Navicat 管理更方便
3. ✅ 数据独立于 Docker，更安全
4. ✅ 可以多个项目共享同一个 MySQL
5. ✅ 备份和恢复更灵活

### Q2: 为什么移除 Adminer？

**A**: 因为：
1. ✅ 您使用 Navicat 管理数据库
2. ✅ Navicat 功能更强大
3. ✅ 无需在 Docker 中运行额外的管理工具
4. ✅ 减少 Docker 服务数量
5. ✅ 节省资源

### Q3: 如果需要在 Docker 中运行 MySQL 怎么办？

**A**: 可以启用 `deploy/docker-compose.export.yml` 中注释的 MySQL 服务：

```bash
# 编辑 deploy/docker-compose.export.yml
# 取消注释 mysql 服务

# 启动服务
cd deploy
docker-compose -f docker-compose.export.yml up -d mysql
```

### Q4: Backend 能连接到外部 MySQL 吗？

**A**: 能，通过以下配置：

```yaml
backend:
  environment:
    DB_HOST: ${DB_HOST:-localhost}  # 外部 MySQL 地址
  network_mode: "host"  # 使用主机网络
```

使用 `network_mode: "host"` 后，Backend 容器可以直接访问宿主机的 `localhost:3306`。

### Q5: 如何验证数据库连接？

**A**: 

```bash
# 查看后端日志
docker logs bonus-system-backend

# 或进入容器测试
docker exec -it bonus-system-backend sh
# 在容器内
node -e "const mysql = require('mysql2'); const conn = mysql.createConnection({host: 'localhost', user: 'bonus_user', password: 'your_password', database: 'bonus_system'}); conn.connect(err => { if(err) console.log('Error:', err); else console.log('Connected!'); conn.end(); });"
```

## 📝 最佳实践

### 1. 数据库安全

```sql
-- 使用强密码
ALTER USER 'bonus_user'@'%' IDENTIFIED BY 'Strong_P@ssw0rd_2024';

-- 限制访问来源（推荐）
CREATE USER 'bonus_user'@'localhost' IDENTIFIED BY 'Strong_P@ssw0rd_2024';
GRANT ALL PRIVILEGES ON bonus_system.* TO 'bonus_user'@'localhost';
```

### 2. 定期备份

使用 Navicat 的备份功能：
1. 右键数据库 -> 转储 SQL 文件
2. 选择备份位置
3. 设置定时任务自动备份

### 3. 监控数据库性能

使用 Navicat 的监控功能：
1. 查看慢查询日志
2. 分析查询性能
3. 优化索引

### 4. 环境变量管理

```bash
# 开发环境
cp .env.template .env
# 编辑 .env，使用开发数据库

# 生产环境
cp .env.template .env.production
# 编辑 .env.production，使用生产数据库
```

## 🎯 配置检查清单

使用 Navicat 管理数据库前，确认以下内容：

- [ ] MySQL 服务器已安装并运行
- [ ] 已创建 `bonus_system` 数据库
- [ ] 已创建 `bonus_user` 用户并授权
- [ ] Navicat 可以成功连接数据库
- [ ] `.env` 文件已正确配置 DB_HOST、DB_USER、DB_PASSWORD
- [ ] 所有 docker-compose 文件中 MySQL 服务已移除或注释
- [ ] 所有 docker-compose 文件中 Adminer 服务已移除或注释
- [ ] Backend 配置使用 `network_mode: "host"`
- [ ] 后端服务可以正常启动并连接数据库

## 📚 相关文档

- [.env.template](../.env.template) - 环境变量模板
- [docker-compose.yml](../docker-compose.yml) - 主配置文件
- [docker-compose.production.yml](../docker-compose.production.yml) - 生产配置
- [deploy/docker-compose.export.yml](../deploy/docker-compose.export.yml) - 导出配置
- [EXTERNAL_MYSQL_CONFIG.md](EXTERNAL_MYSQL_CONFIG.md) - 外部 MySQL 详细配置
- [EXTERNAL_MYSQL_QUICK_START.md](../EXTERNAL_MYSQL_QUICK_START.md) - 快速启动指南

## 🎉 总结

### 当前配置优势

1. ✅ **统一管理** - 使用 Navicat 统一管理所有数据库
2. ✅ **简化部署** - Docker 只运行应用服务，不运行数据库
3. ✅ **数据安全** - 数据独立于 Docker，不会因容器删除而丢失
4. ✅ **性能优化** - 外部 MySQL 可以单独优化配置
5. ✅ **资源节省** - 减少 Docker 容器数量
6. ✅ **便于维护** - Navicat 提供友好的图形界面

### 配置变更历史

- **2024-12-11**: 移除所有 docker-compose 配置中的 Adminer 服务
- **2024-12-11**: 更新 deploy/docker-compose.export.yml，注释 MySQL 和 Adminer
- **2024-12-11**: 确认使用 Navicat 作为主要数据库管理工具

---

**文档版本**: 1.0.0  
**最后更新**: 2024-12-11  
**维护人员**: Development Team
