# 数据持久化与迁移指南

## 📋 目录

1. [核心概念](#核心概念)
2. [数据 vs 代码](#数据-vs-代码)
3. [数据备份](#数据备份)
4. [数据恢复](#数据恢复)
5. [完整迁移方案](#完整迁移方案)
6. [Docker Volumes 说明](#docker-volumes-说明)

---

## 🎯 核心概念

### ❓ 什么是数据持久化？

**数据持久化** = 将运行过程中产生的数据保存下来，即使容器删除也不会丢失。

### 📊 数据 vs 代码

| 类型 | 内容 | 是否需要持久化 | 迁移时是否必需 |
|------|------|--------------|--------------|
| **数据** | 数据库记录、用户上传文件 | ✅ 是 | ✅ 是 |
| **代码** | 后端源码、前端构建文件 | ❌ 否 | ❌ 否（可重新部署） |
| **配置** | .env、密钥 | ✅ 是 | ✅ 是 |
| **日志** | 运行日志 | 🔧 可选 | ❌ 否 |

**重点**：
- ✅ **数据是唯一的**，必须备份
- ❌ **代码可重新部署**，不需要备份迁移
- ✅ **配置（.env）包含密钥**，需要备份

---

## 💾 当前系统的数据存储

### 1. MySQL 数据库（最重要！）

**位置**：外部 MySQL 服务器（不在 Docker 容器中）

**包含的数据**：
- 用户信息
- 部门、职位、项目数据
- 奖金计算结果
- 所有业务数据

**特点**：
- ✅ 已持久化（在宿主机 MySQL 中）
- ✅ 不会因 Docker 容器重启而丢失

### 2. 上传文件（如果有）

**可能的位置**：
```
backend/
├── uploads/          # 用户上传的文件
└── exports/          # 导出的报表
```

**特点**：
- ⚠️ 如果在容器内，需要使用 volume 挂载
- ✅ 如果挂载到宿主机，已持久化

### 3. Docker Volumes

**当前配置的 volumes**：
```yaml
volumes:
  backend_logs:      # 后端日志
  frontend_logs:     # 前端日志
  nginx_cache:       # Nginx 缓存
  prometheus_data:   # 监控数据
  grafana_data:      # Grafana 配置
```

**特点**：
- 📝 **日志**：可选备份
- 📊 **监控数据**：可选备份
- ⚠️ **不包含业务数据**

---

## 📦 数据备份清单

### ✅ 必须备份的数据

#### 1. MySQL 数据库（最重要！）

```bash
# 备份整个数据库
mysqldump -u root -p bonus_system > bonus_system_$(date +%Y%m%d).sql

# 或者备份所有数据库
mysqldump -u root -p --all-databases > all_databases_$(date +%Y%m%d).sql
```

**文件大小**：根据数据量，通常 1-100MB

#### 2. 环境配置文件

```bash
# 备份 .env 文件
cp .env env_backup_$(date +%Y%m%d)
```

**包含内容**：
- 数据库连接信息
- JWT 密钥
- 其他敏感配置

#### 3. 用户上传文件（如果有）

```bash
# 备份上传文件
tar -czf uploads_$(date +%Y%m%d).tar.gz backend/uploads/ backend/exports/
```

### 🔧 可选备份的数据

#### 4. 日志文件

```bash
# 备份日志（用于问题排查）
docker cp bonus-backend-prod:/app/logs ./logs_backup/
```

#### 5. Grafana 配置

```bash
# 备份 Grafana 数据
docker run --rm \
  -v grafana_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/grafana_$(date +%Y%m%d).tar.gz /data
```

---

## 📤 数据备份脚本

### 一键备份脚本（Linux）

创建 `backup.sh`：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "开始备份..."

# 1. 备份 MySQL 数据库
echo "备份数据库..."
mysqldump -u root -prootpassword bonus_system > "$BACKUP_DIR/database.sql"

# 2. 备份环境配置
echo "备份环境配置..."
cp .env "$BACKUP_DIR/env_backup"

# 3. 备份上传文件（如果存在）
if [ -d "backend/uploads" ]; then
    echo "备份上传文件..."
    tar -czf "$BACKUP_DIR/uploads.tar.gz" backend/uploads/ backend/exports/
fi

# 4. 备份 Docker volumes（可选）
echo "备份日志..."
docker cp bonus-backend-prod:/app/logs "$BACKUP_DIR/backend_logs" 2>/dev/null || true

# 5. 创建备份清单
echo "创建备份清单..."
cat > "$BACKUP_DIR/README.txt" << EOF
备份时间: $(date)
备份内容:
- database.sql: MySQL 数据库
- env_backup: 环境配置
- uploads.tar.gz: 用户上传文件
- backend_logs/: 后端日志

恢复说明:
1. 恢复数据库: mysql -u root -p bonus_system < database.sql
2. 恢复配置: cp env_backup .env
3. 恢复文件: tar -xzf uploads.tar.gz
EOF

echo "✅ 备份完成！备份位置: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

### Windows 备份脚本

创建 `backup.bat`：

```batch
@echo off
setlocal

REM 配置
set BACKUP_DIR=backups\%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%"

echo 开始备份...

REM 1. 备份数据库
echo 备份数据库...
mysqldump -u root -prootpassword bonus_system > "%BACKUP_DIR%\database.sql"

REM 2. 备份环境配置
echo 备份环境配置...
copy .env "%BACKUP_DIR%\env_backup"

REM 3. 备份上传文件
echo 备份上传文件...
if exist "backend\uploads" (
    tar -czf "%BACKUP_DIR%\uploads.tar.gz" backend\uploads backend\exports
)

REM 4. 备份日志
echo 备份日志...
docker cp bonus-backend-prod:/app/logs "%BACKUP_DIR%\backend_logs" 2>nul

echo ✅ 备份完成！备份位置: %BACKUP_DIR%
dir "%BACKUP_DIR%"

pause
```

---

## 📥 数据恢复

### 场景 1: 在新服务器上恢复

#### 第一步：部署代码（如果新服务器没有代码）

```bash
# 上传代码部署包（见 DEPLOYMENT_CHECKLIST.md）
tar -xzf bonus-deploy.tar.gz
cd bonus-system

# 启动服务（先不恢复数据）
docker-compose -f docker-compose.production.yml up -d --build
```

#### 第二步：恢复数据

```bash
# 1. 停止服务
docker-compose -f docker-compose.production.yml down

# 2. 恢复环境配置
cp backups/20241212_120000/env_backup .env

# 3. 恢复数据库
mysql -u root -p bonus_system < backups/20241212_120000/database.sql

# 4. 恢复上传文件
tar -xzf backups/20241212_120000/uploads.tar.gz

# 5. 重新启动服务
docker-compose -f docker-compose.production.yml up -d
```

### 场景 2: 同服务器恢复（回滚）

```bash
# 1. 停止服务
docker-compose -f docker-compose.production.yml down

# 2. 恢复数据库到某个时间点
mysql -u root -p bonus_system < backups/20241212_120000/database.sql

# 3. 重启服务
docker-compose -f docker-compose.production.yml up -d
```

---

## 🚚 完整迁移方案

### 方案对比

| 迁移内容 | 文件大小 | 是否必需 | 说明 |
|---------|---------|---------|------|
| **数据库** | 1-100MB | ✅ 必需 | 所有业务数据 |
| **.env** | < 1KB | ✅ 必需 | 包含密钥和配置 |
| **上传文件** | 变化 | ✅ 必需（如有） | 用户上传的内容 |
| **代码** | 20-30MB | ❌ 不必需 | 可重新部署 |
| **日志** | 变化 | ❌ 不必需 | 可选，用于排查问题 |

### 推荐方案：分离迁移

#### 数据迁移包（小，必需）

```
data_backup/
├── database.sql              # 数据库
├── env_backup                # 环境配置
├── uploads.tar.gz            # 上传文件
└── README.txt                # 说明文档
```

**大小**：通常 < 100MB

#### 代码部署包（可选）

```
code_deploy/
├── backend/
├── frontend/
├── docker-compose.production.yml
└── .env.template
```

**说明**：如果新服务器可以访问 Git，直接 `git clone` 即可，不需要打包。

### 迁移步骤

#### 步骤 1: 在旧服务器备份数据

```bash
# 执行备份脚本
./backup.sh
# 或
backup.bat

# 打包数据
tar -czf data_migration.tar.gz backups/20241212_120000/
```

#### 步骤 2: 传输到新服务器

```bash
# 只传输数据包（小）
scp data_migration.tar.gz user@new-server:/opt/
```

#### 步骤 3: 在新服务器部署代码

```bash
# 方式 1: 从 Git 拉取（推荐）
git clone <repository-url> /opt/bonus-system
cd /opt/bonus-system

# 方式 2: 使用代码部署包
scp code_deploy.tar.gz user@new-server:/opt/
ssh user@new-server
tar -xzf code_deploy.tar.gz
cd bonus-system

# 构建前端
cd frontend && npm install && npm run build && cd ..
```

#### 步骤 4: 恢复数据

```bash
# 解压数据包
tar -xzf data_migration.tar.gz

# 恢复
mysql -u root -p bonus_system < backups/20241212_120000/database.sql
cp backups/20241212_120000/env_backup .env
tar -xzf backups/20241212_120000/uploads.tar.gz
```

#### 步骤 5: 启动服务

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

---

## 🐳 Docker Volumes 说明

### 当前 Volumes 的作用

```yaml
volumes:
  backend_logs:      # 后端日志（可重新生成）
  frontend_logs:     # 前端日志（可重新生成）
  nginx_cache:       # Nginx 缓存（可重新生成）
  prometheus_data:   # 监控数据（可选）
  grafana_data:      # Grafana 配置（可选）
```

### 是否需要备份？

| Volume | 内容 | 是否重要 | 建议 |
|--------|------|---------|------|
| `backend_logs` | 后端日志 | 🔧 排查问题用 | 可选备份 |
| `frontend_logs` | 前端日志 | 🔧 排查问题用 | 可选备份 |
| `nginx_cache` | 缓存 | ❌ 可重新生成 | 不需要 |
| `prometheus_data` | 监控历史 | 📊 统计用 | 可选 |
| `grafana_data` | 仪表盘配置 | 📊 配置用 | 可选 |

**结论**：
- ✅ **业务数据在 MySQL 中**，不在这些 volumes 里
- ❌ **这些 volumes 都可以重新生成**，不影响业务
- 🔧 **只有排查问题时**，才需要备份日志

### 备份 Docker Volumes（可选）

```bash
# 备份某个 volume
docker run --rm \
  -v backend_logs:/source \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/backend_logs.tar.gz -C /source .

# 恢复 volume
docker run --rm \
  -v backend_logs:/target \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/backend_logs.tar.gz -C /target
```

---

## ✅ 总结

### 数据持久化核心要点

1. ✅ **MySQL 数据库是最重要的数据**
   - 不在 Docker 容器中
   - 已经持久化在宿主机 MySQL
   - 必须定期备份

2. ✅ **环境配置（.env）包含密钥**
   - 必须备份
   - 不要加入版本控制

3. ✅ **上传文件（如果有）**
   - 需要备份
   - 建议挂载到宿主机目录

4. ❌ **代码不是数据**
   - 不需要备份迁移
   - 可以重新部署或从 Git 拉取

5. ❌ **Docker Volumes 中没有业务数据**
   - 只有日志和缓存
   - 可选备份

### 迁移时只需要带走

```
✅ 必需：
- database.sql        （数据库备份）
- .env                （环境配置）
- uploads/            （上传文件，如有）

❌ 不必需：
- backend/src/        （代码，可重新部署）
- frontend/dist/      （代码，可重新构建）
- node_modules/       （依赖，可重新安装）
```

### 定期备份建议

```bash
# 每天自动备份（crontab）
0 2 * * * /opt/bonus-system/backup.sh

# 每周保留一次完整备份
# 每月保留一次归档备份
```

---

**相关文档**：
- [部署清单](../DEPLOYMENT_CHECKLIST.md)
- [服务器部署指南](SERVER_DEPLOYMENT_GUIDE.md)

**最后更新**: 2024-12-12
