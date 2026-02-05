# 环境变量文件总结

## 📋 当前环境变量文件状态

### 已修复的问题

**问题**: 根目录的 `.env.production.template` 文件仍使用 NeDB 配置（`DATABASE_TYPE=nedb`），与项目已全面迁移到 MySQL 不一致。

**修复**: 已更新 `.env.production.template`，将数据库配置改为 MySQL。

## 📁 环境变量文件清单

| 文件 | 位置 | 用途 | 数据库 | 状态 | 推荐度 |
|------|------|------|--------|------|--------|
| `.env.template` | 根目录 | 开发/测试/生产统一配置 | MySQL | ✅ 已更新 | ⭐⭐⭐⭐⭐ **强烈推荐** |
| `.env.production.template` | 根目录 | 生产环境专用配置 | MySQL | ✅ 已修复 | ⭐⭐⭐ 可选 |
| `deploy/.env.export.template` | deploy 目录 | 镜像打包部署专用 | MySQL | ✅ 已更新 | ⭐⭐⭐⭐ 部署专用 |
| `.env` | 根目录 | 实际使用的配置文件 | - | ⚠️ 需手动创建 | - |

## ✅ 推荐使用方案

### 🏆 方案 1：使用 .env.template（强烈推荐）

**适用场景**: 开发、测试、生产环境

**优势**:
- ✅ 一个文件适用所有场景
- ✅ 配置完整，包含所有必需变量
- ✅ 维护简单，不易混淆
- ✅ 已正确配置 MySQL

**使用方法**:
```bash
# 1. 复制模板
cp .env.template .env

# 2. 根据环境修改（开发环境可使用默认值）
vim .env

# 3. 启动服务
docker-compose up -d                                    # 开发环境
docker-compose -f docker-compose.production.yml up -d  # 生产环境
```

**配置要点**:
```bash
# 开发环境：使用默认值即可
NODE_ENV=development

# 生产环境：必须修改密码
MYSQL_ROOT_PASSWORD=your-strong-password
MYSQL_PASSWORD=your-strong-password
JWT_SECRET=your-random-secret
JWT_REFRESH_SECRET=your-random-secret
REDIS_PASSWORD=your-strong-password
```

---

### 方案 2：使用 .env.production.template（可选）

**适用场景**: 生产环境，需要高级功能（SSL、备份、邮件通知）

**优势**:
- ✅ 包含高级配置选项
- ✅ 专注生产环境部署
- ✅ 已修复为 MySQL 配置

**使用方法**:
```bash
# 1. 复制模板
cp .env.production.template .env

# 2. 配置所有必需参数
vim .env

# 3. 启动生产环境
docker-compose -f docker-compose.production.yml up -d
```

**额外配置项**:
- SSL 证书配置
- 备份策略（S3、定时任务）
- SMTP 邮件通知
- 加密密钥

---

### 方案 3：使用 deploy/.env.export.template（镜像打包）

**适用场景**: Docker 镜像打包和离线部署

**使用方法**:
```bash
cd deploy
cp .env.export.template .env.export
vim .env.export
./docker-export.sh
./docker-start.sh
```

## 📊 配置文件对比

### 1. .env.template（推荐）

**包含配置**:
```ini
# 基础配置
NODE_ENV, FRONTEND_PORT, BACKEND_PORT

# MySQL 配置（完整）
MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT

# Redis 配置
REDIS_PASSWORD, REDIS_PORT

# JWT 配置
JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN

# 安全配置
CORS_ORIGIN, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX

# 监控配置
GRAFANA_PASSWORD

# 其他
LOG_LEVEL, VOLUME_MODE, BACKEND_URL, ADMINER_PORT
```

**特点**:
- ✅ 96 行，配置完整
- ✅ 注释清晰
- ✅ 默认值合理
- ✅ 适用所有 docker-compose 文件

---

### 2. .env.production.template（已修复）

**修复前**:
```ini
❌ DATABASE_TYPE=nedb
❌ DATABASE_PATH=/app/database
```

**修复后**:
```ini
✅ DB_TYPE=mysql
✅ DB_HOST=mysql
✅ DB_PORT=3306
✅ DB_NAME=bonus_system
✅ DB_USER=bonus_user
✅ DB_PASSWORD=your-secure-mysql-password
✅ MYSQL_ROOT_PASSWORD=your-secure-root-password
```

**额外配置**:
```ini
# SSL 配置
SSL_CERT_PATH, SSL_KEY_PATH

# 备份配置
BACKUP_SCHEDULE, BACKUP_RETENTION_DAYS
BACKUP_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

# 邮件配置
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

# 安全配置
SESSION_SECRET, ENCRYPTION_KEY
```

**特点**:
- ✅ 58 行，专注生产
- ✅ 包含高级功能
- ⚠️ 配置项较多

---

### 3. deploy/.env.export.template

**专用配置**:
```ini
# 镜像配置
IMAGE_TAG=latest

# 路径映射（本地目录）
MYSQL_DATA_PATH=../data/mysql
MYSQL_INIT_PATH=../database
OUTPUT_DIR=../docker-images

# 端口配置
FRONTEND_PORT, BACKEND_PORT, MYSQL_PORT, REDIS_PORT
```

**特点**:
- ✅ 专为镜像打包设计
- ✅ 支持本地路径映射
- ✅ 适用 deploy/docker-compose.export.yml

## 🎯 决策指南

### 我应该使用哪个文件？

```
┌─────────────────────────────────┐
│   您的使用场景是什么？           │
└─────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  日常开发/测试？ │
    └─────────────────┘
         │ 是
         ▼
    使用 .env.template  ⭐⭐⭐⭐⭐
    (推荐：简单统一)
    
    
    ┌─────────────────┐
    │  生产环境部署？  │
    └─────────────────┘
         │ 是
         ▼
    ┌───────────────────────┐
    │ 需要高级功能？         │
    │ (SSL/备份/邮件)       │
    └───────────────────────┘
         │                │
         │ 需要           │ 不需要
         ▼                ▼
    .env.production   .env.template
    .template         (推荐)
    ⭐⭐⭐             ⭐⭐⭐⭐⭐
    
    
    ┌─────────────────┐
    │  镜像打包部署？  │
    └─────────────────┘
         │ 是
         ▼
    deploy/.env.export.template
    ⭐⭐⭐⭐
```

## 💡 最佳实践

### 1. 开发环境（日常开发）

```bash
# 使用 .env.template（推荐）
cp .env.template .env

# 使用默认配置即可
docker-compose up -d
```

### 2. 生产环境（基础部署）

```bash
# 使用 .env.template（推荐）
cp .env.template .env

# 修改密码和密钥
vim .env  # 修改所有 *_PASSWORD 和 *_SECRET

# 启动生产环境
docker-compose -f docker-compose.production.yml up -d
```

### 3. 生产环境（高级功能）

```bash
# 使用 .env.production.template
cp .env.production.template .env

# 配置所有参数（包括 SSL、备份、邮件）
vim .env

# 启动生产环境
docker-compose -f docker-compose.production.yml up -d
```

### 4. 镜像打包部署

```bash
cd deploy
cp .env.export.template .env.export
vim .env.export
./docker-export.sh
./docker-start.sh
```

## ⚠️ 安全提醒

### 必须修改的配置（生产环境）

```bash
# 这些必须使用强随机密码！
MYSQL_ROOT_PASSWORD=xxx    # ❌ 不要使用默认值
MYSQL_PASSWORD=xxx         # ❌ 不要使用默认值
JWT_SECRET=xxx             # ❌ 不要使用默认值
JWT_REFRESH_SECRET=xxx     # ❌ 不要使用默认值
REDIS_PASSWORD=xxx         # ❌ 不要使用默认值
```

### 生成安全密码

```bash
# OpenSSL（推荐）
openssl rand -base64 32

# PowerShell（Windows）
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 保护配置文件

```bash
# 添加到 .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.template" >> .gitignore
echo "!.env.*.template" >> .gitignore

# 设置文件权限（Linux/Mac）
chmod 600 .env
```

## 📚 相关文档

- [ENV_CONFIG_GUIDE.md](../ENV_CONFIG_GUIDE.md) - 环境变量配置详细指南
- [DOCKER_QUICK_START.md](../DOCKER_QUICK_START.md) - Docker 快速启动指南
- [DOCKER_COMPOSE_GUIDE.md](../DOCKER_COMPOSE_GUIDE.md) - Docker Compose 使用指南
- [DOCKER_COMPOSE_MYSQL_FIX.md](DOCKER_COMPOSE_MYSQL_FIX.md) - MySQL 配置修复报告

## 📝 总结

### ✅ 已完成的工作

1. ✅ 修复 `.env.production.template`，改为 MySQL 配置
2. ✅ 创建 `ENV_CONFIG_GUIDE.md` 详细配置指南
3. ✅ 更新 `DOCKER_QUICK_START.md`，添加配置说明链接
4. ✅ 创建本文档，总结所有环境变量文件

### 🎯 推荐方案

**对于大多数用户**：
- ✅ 使用 `.env.template` 创建 `.env`
- ✅ 开发环境使用默认值
- ✅ 生产环境修改密码和密钥
- ✅ 一个配置文件适用所有场景

**快速开始**:
```bash
cp .env.template .env
docker-compose up -d
```

### 📊 文件状态

| 文件 | 状态 | 说明 |
|------|------|------|
| `.env.template` | ✅ 正常 | 推荐使用，配置完整 |
| `.env.production.template` | ✅ 已修复 | 从 NeDB 改为 MySQL |
| `deploy/.env.export.template` | ✅ 正常 | 镜像打包专用 |
| `.env` | ⚠️ 需创建 | 从模板复制创建 |

---

**最后更新**: 2024-12-11  
**修复人员**: Development Team  
**版本**: 1.0.0
