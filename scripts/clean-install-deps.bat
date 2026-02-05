@echo off
REM 前后端依赖清理脚本（Windows）

setlocal enabledelayedexpansion

echo ==========================================
echo   前后端依赖清理和重新安装
echo ==========================================
echo.

REM 第一步：清理根目录
echo [1/4] 清理根目录 node_modules...
if exist node_modules (
    echo   删除 node_modules/
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo   删除 package-lock.json
    del /f /q package-lock.json
)

echo   [SUCCESS] 根目录清理完成
echo.

REM 第二步：清理并重新安装后端依赖
echo [2/4] 清理并重新安装后端依赖...
cd backend

if exist node_modules (
    echo   删除 backend/node_modules/
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo   删除 backend/package-lock.json
    del /f /q package-lock.json
)

echo   安装后端依赖...
call npm install

if %errorlevel% equ 0 (
    echo   [SUCCESS] 后端依赖安装成功
) else (
    echo   [ERROR] 后端依赖安装失败
    cd ..
    pause
    exit /b 1
)

cd ..
echo.

REM 第三步：清理并重新安装前端依赖
echo [3/4] 清理并重新安装前端依赖...
cd frontend

if exist node_modules (
    echo   删除 frontend/node_modules/
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo   删除 frontend/package-lock.json
    del /f /q package-lock.json
)

echo   安装前端依赖...
call npm install

if %errorlevel% equ 0 (
    echo   [SUCCESS] 前端依赖安装成功
) else (
    echo   [ERROR] 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)

cd ..
echo.

REM 第四步：验证安装
echo [4/4] 验证安装...
echo.

echo 后端依赖（前 10 个）：
cd backend
call npm list --depth=0 | findstr /v "npm"
cd ..
echo.

echo 前端依赖（前 10 个）：
cd frontend
call npm list --depth=0 | findstr /v "npm"
cd ..
echo.

echo ==========================================
echo   [SUCCESS] 依赖清理和重新安装完成！
echo ==========================================
echo.
echo 下一步：
echo   - 启动后端: npm run backend:dev
echo   - 启动前端: npm run frontend:dev
echo   - 运行测试: npm test
echo.

pause
