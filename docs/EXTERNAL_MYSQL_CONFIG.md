# 外部 MySQL 配置说明

## 📋 概述

项目已配置为使用外部 MySQL 服务器，不再在 Docker 中运行 MySQL 和 Redis 服务。

**更新日期**: 2024-12-11  
**版本**: 2.0.0

## 🔄 主要变更

### 已移除的服务

| 服务 | 说明 | 原因 |
|------|------|------|
| ❌ **MySQL** | Docker 内的 MySQL 容器 | 使用环境内已有的 MySQL 服务器 |
| ❌ **Redis** | Docker 内的 Redis 容器 | 项目不需要 Redis 缓存 |
| ❌ **Adminer** | 数据库管理工具 | 使用外部 MySQL，不需要容器内管理工具 |

### 保留的服务

| 服务 | 说明 | 网络模式 |
|------|------|----------|
| ✅ **Backend** | 后端 API 服务 | host 模式（访问外部 MySQL） |
| ✅ **Frontend** | 前端 Nginx 服务 | bridge 模式 |
| ✅ **Prometheus** | 监控服务（可选） | bridge 模式 |
| ✅ **Grafana** | 可视化仪表板（可选） | bridge 模式 |

## ⚙️ 配置变更详情

### 1. docker-compose.yml（开发/测试环境）

#### 移除的配置
```yaml
# ❌ 已移除
mysql:
  image: mysql:8.0
  ...

adminer:
  image: adminer:latest
  ...
```

#### 更新的配置
```yaml
backend:
  environment:
    DB_TYPE: ${DB_TYPE:-mysql}
    DB_HOST: ${DB_HOST:-localhost}  # ✅ 外部 MySQL 主机
    DB_PORT: ${DB_PORT:-3306}
    DB_NAME: ${DB_NAME:-bonus_system}
    DB_USER: ${DB_USER:-bonus_user}
    DB_PASSWORD: ${DB_PASSWORD:-bonus_pass}
    # ❌ 移除 Redis 配置
    # REDIS_HOST: ${REDIS_HOST:-redis}
    # REDIS_PORT: ${REDIS_INTERNAL_PORT:-6379}
  network_mode: "host"  # ✅ 使用主机网络访问外部 MySQL
```

### 2. docker-compose.dev.yml（开发环境）

同样的变更：
- ❌ 移除 MySQL 服务定义
- ✅ Backend 使用 `network_mode: "host"`
- ✅ 配置外部 MySQL 连接参数

### 3. docker-compose.production.yml（生产环境）

同样的变更：
- ❌ 移除 MySQL、Redis、Adminer 服务
- ✅ Backend 使用 `network_mode: "host"`
- ✅ 保留 Prometheus 和 Grafana（监控工具）

### 4. .env.template（环境变量模板）

#### 更新的配置项

```ini
# ========================================
# MySQL 数据库配置（外部 MySQL 服务器）
# ========================================
# MySQL 主机地址（外部 MySQL 服务器 IP 或域名）
DB_HOST=localhost

# MySQL 数据库端口
DB_PORT=3306

# MySQL 数据库名
DB_NAME=bonus_system

# MySQL 用户名
DB_USER=bonus_user

# MySQL 用户密码（生产环境必须修改！）
DB_PASSWORD=bonus_pass

# 注意：不再需要以下配置（使用外部 MySQL）
# MYSQL_ROOT_PASSWORD=root_password
# MYSQL_DATABASE=bonus_system
# MYSQL_USER=bonus_user
# MYSQL_PASSWORD=bonus_pass

# ========================================
# Redis 配置（已禁用）
# ========================================
# Redis 已禁用，不需要配置
# REDIS_PASSWORD=redis_pass
```

## 🚀 使用方法

### 第一步：准备外部 MySQL 数据库

#### 1. 创建数据库

```sql
-- 连接到 MySQL 服务器
mysql -u root -p

-- 创建数据库
CREATE DATABASE bonus_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'bonus_user'@'%' IDENTIFIED BY 'your_strong_password';

-- 授予权限
GRANT ALL PRIVILEGES ON bonus_system.* TO 'bonus_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

#### 2. 导入初始化脚本（如果有）

```bash
# 导入数据库结构和初始数据
mysql -u bonus_user -p bonus_system < database/init.sql
```

### 第二步：配置环境变量

#### 1. 复制模板

```bash
cp .env.template .env
```

#### 2. 修改配置

编辑 `.env` 文件：

```ini
# MySQL 主机地址
DB_HOST=192.168.1.100  # 修改为实际的 MySQL 服务器地址

# MySQL 端口
DB_PORT=3306

# MySQL 数据库名
DB_NAME=bonus_system

# MySQL 用户名
DB_USER=bonus_user

# MySQL 密码（使用强密码！）
DB_PASSWORD=your_strong_password

# JWT 配置（必须修改！）
JWT_SECRET=your-random-jwt-secret
JWT_REFRESH_SECRET=your-random-refresh-secret
```

### 第三步：启动服务

#### 开发环境

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 检查后端是否能连接到 MySQL
docker-compose exec backend node -e "console.log('DB_HOST:', process.env.DB_HOST)"
```

#### 生产环境

```bash
# 启动服务
docker-compose -f docker-compose.production.yml up -d

# 查看日志
docker-compose -f docker-compose.production.yml logs -f

# 启动监控（可选）
docker-compose -f docker-compose.production.yml --profile monitoring up -d
```

## 🔧 网络模式说明

### Host 模式（Backend）

Backend 服务使用 `network_mode: "host"`，这意味着：

**优势**:
- ✅ 可以直接访问主机上的服务（外部 MySQL）
- ✅ 无需端口映射，性能更好
- ✅ 使用 localhost 即可访问 MySQL

**注意事项**:
- ⚠️ 端口配置直接使用主机端口
- ⚠️ `BACKEND_PORT` 环境变量指定的端口会直接绑定到主机
- ⚠️ 确保主机端口未被占用

### Bridge 模式（Frontend）

Frontend 继续使用默认的 bridge 网络模式：

- ✅ 与其他服务隔离
- ✅ 通过端口映射访问
- ✅ 可以正常访问 Backend（通过主机网络）

## 📊 访问地址

### 开发环境

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:8080 | Web 界面 |
| 后端 API | http://localhost:3000/api | REST API |
| MySQL | localhost:3306 | 外部 MySQL（通过主机访问） |

### 生产环境

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost (端口 80) | Web 界面 |
| 后端 API | http://localhost:3002/api | REST API |
| Prometheus | http://localhost:9090 | 监控指标 |
| Grafana | http://localhost:3000 | 可视化仪表板 |
| MySQL | ${DB_HOST}:${DB_PORT} | 外部 MySQL |

## 🔍 故障排查

### 问题 1: Backend 无法连接到 MySQL

**症状**: 
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方法**:

1. **检查 MySQL 是否运行**
   ```bash
   # Linux/Mac
   ps aux | grep mysql
   
   # Windows
   sc query MySQL80
   ```

2. **检查 MySQL 绑定地址**
   ```bash
   # 查看 MySQL 配置
   cat /etc/mysql/my.cnf | grep bind-address
   
   # 应该是 0.0.0.0 或注释掉
   # bind-address = 0.0.0.0
   ```

3. **检查防火墙**
   ```bash
   # Linux
   sudo ufw allow 3306
   
   # Windows
   netsh advfirewall firewall add rule name="MySQL" dir=in action=allow protocol=TCP localport=3306
   ```

4. **测试连接**
   ```bash
   # 从容器内测试
   docker-compose exec backend sh
   nc -zv $DB_HOST $DB_PORT
   ```

### 问题 2: 端口冲突

**症状**:
```
Error: Port 3000 is already in use
```

**解决方法**:

修改 `.env` 文件中的端口：

```ini
BACKEND_PORT=3001  # 修改为未被占用的端口
```

### 问题 3: 权限拒绝

**症状**:
```
Access denied for user 'bonus_user'@'%'
```

**解决方法**:

1. **检查用户权限**
   ```sql
   -- 连接到 MySQL
   mysql -u root -p
   
   -- 查看用户权限
   SHOW GRANTS FOR 'bonus_user'@'%';
   
   -- 重新授权
   GRANT ALL PRIVILEGES ON bonus_system.* TO 'bonus_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **检查密码是否正确**
   ```bash
   # 测试登录
   mysql -h localhost -u bonus_user -p bonus_system
   ```

### 问题 4: 数据库不存在

**症状**:
```
Error: Unknown database 'bonus_system'
```

**解决方法**:

```sql
-- 创建数据库
CREATE DATABASE bonus_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 导入初始化脚本
-- 从主机执行
mysql -u bonus_user -p bonus_system < database/init.sql
```

## 📝 环境变量对比

### 修改前（使用 Docker MySQL）

```ini
# Docker 内的 MySQL
DB_HOST=mysql
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=bonus_system
MYSQL_USER=bonus_user
MYSQL_PASSWORD=bonus_pass
MYSQL_PORT=3306

# Docker 内的 Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_pass

# Adminer
ADMINER_PORT=8081
```

### 修改后（使用外部 MySQL）

```ini
# 外部 MySQL
DB_HOST=localhost  # 或实际的 MySQL 服务器地址
DB_PORT=3306
DB_NAME=bonus_system
DB_USER=bonus_user
DB_PASSWORD=bonus_pass

# Redis 已禁用
# REDIS_HOST=redis
# REDIS_PORT=6379
# REDIS_PASSWORD=redis_pass

# Adminer 已移除
# ADMINER_PORT=8081
```

## 💡 最佳实践

### 1. MySQL 配置优化

```ini
# my.cnf 或 my.ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=500
default-storage-engine=INNODB
innodb_buffer_pool_size=1G
```

### 2. 安全配置

```ini
# 使用强密码
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# 限制数据库访问
# 只允许特定 IP 访问
CREATE USER 'bonus_user'@'192.168.1.0/255.255.255.0' IDENTIFIED BY 'password';
```

### 3. 备份策略

```bash
# 定期备份数据库
mysqldump -u bonus_user -p bonus_system > backup_$(date +%Y%m%d).sql

# 自动备份脚本
0 2 * * * /path/to/backup_script.sh
```

## 📚 相关文档

- [DOCKER_QUICK_START.md](../DOCKER_QUICK_START.md) - Docker 快速启动指南
- [DOCKER_COMPOSE_GUIDE.md](../DOCKER_COMPOSE_GUIDE.md) - Docker Compose 使用指南
- [ENV_CONFIG_GUIDE.md](../ENV_CONFIG_GUIDE.md) - 环境变量配置指南

## ✅ 迁移检查清单

完成以下步骤确保配置正确：

- [ ] 外部 MySQL 服务器已安装并运行
- [ ] 创建了 bonus_system 数据库
- [ ] 创建了 bonus_user 用户并授权
- [ ] 导入了初始化脚本（如果有）
- [ ] 复制并配置了 .env 文件
- [ ] 修改了 DB_HOST 为实际的 MySQL 地址
- [ ] 修改了 DB_PASSWORD 为强密码
- [ ] 修改了 JWT_SECRET 和 JWT_REFRESH_SECRET
- [ ] 启动了 Docker 服务
- [ ] Backend 成功连接到 MySQL
- [ ] 前端可以正常访问
- [ ] API 接口正常响应

## 🎉 总结

### 主要改进

- ✅ **简化部署** - 减少了 Docker 容器数量
- ✅ **使用现有资源** - 利用环境内的 MySQL 服务器
- ✅ **提高性能** - Host 网络模式减少了网络开销
- ✅ **降低复杂度** - 移除了不需要的 Redis 和 Adminer

### 注意事项

- ⚠️ 确保外部 MySQL 配置正确
- ⚠️ 使用强密码保护数据库
- ⚠️ 定期备份数据库数据
- ⚠️ 监控 MySQL 服务器状态

---

**版本**: 2.0.0  
**更新日期**: 2024-12-11  
**维护**: Development Team
