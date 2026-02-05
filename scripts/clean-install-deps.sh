#!/bin/bash
# 前后端依赖清理脚本

set -e

echo "=========================================="
echo "  前后端依赖清理和重新安装"
echo "=========================================="
echo ""

# 第一步：清理根目录
echo "[1/4] 清理根目录 node_modules..."
if [ -d "node_modules" ]; then
    echo "  删除 node_modules/"
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "  删除 package-lock.json"
    rm -f package-lock.json
fi

echo "  ✅ 根目录清理完成"
echo ""

# 第二步：清理并重新安装后端依赖
echo "[2/4] 清理并重新安装后端依赖..."
cd backend

if [ -d "node_modules" ]; then
    echo "  删除 backend/node_modules/"
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "  删除 backend/package-lock.json"
    rm -f package-lock.json
fi

echo "  安装后端依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "  ✅ 后端依赖安装成功"
else
    echo "  ❌ 后端依赖安装失败"
    exit 1
fi

cd ..
echo ""

# 第三步：清理并重新安装前端依赖
echo "[3/4] 清理并重新安装前端依赖..."
cd frontend

if [ -d "node_modules" ]; then
    echo "  删除 frontend/node_modules/"
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "  删除 frontend/package-lock.json"
    rm -f package-lock.json
fi

echo "  安装前端依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "  ✅ 前端依赖安装成功"
else
    echo "  ❌ 前端依赖安装失败"
    exit 1
fi

cd ..
echo ""

# 第四步：验证安装
echo "[4/4] 验证安装..."
echo ""

echo "后端依赖（前 10 个）："
cd backend
npm list --depth=0 | head -n 12
cd ..
echo ""

echo "前端依赖（前 10 个）："
cd frontend
npm list --depth=0 | head -n 12
cd ..
echo ""

echo "=========================================="
echo "  ✅ 依赖清理和重新安装完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "  - 启动后端: npm run backend:dev"
echo "  - 启动前端: npm run frontend:dev"
echo "  - 运行测试: npm test"
echo ""
