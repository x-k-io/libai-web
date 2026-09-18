#!/bin/bash

# 项目启动检查脚本

echo "=========================================="
echo "  LibAI Admin Web - 启动前检查"
echo "=========================================="
echo ""

# 1. 检查 Node.js
echo "1. 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js 已安装: $NODE_VERSION"
else
    echo "   ❌ Node.js 未安装"
    echo "   请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 2. 检查 npm
echo "2. 检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm 已安装: $NPM_VERSION"
else
    echo "   ❌ npm 未安装"
    exit 1
fi

# 3. 检查 node_modules
echo "3. 检查依赖..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules 存在"
else
    echo "   ⚠️  node_modules 不存在"
    echo "   建议运行: npm install"
fi

# 4. 检查后端服务
echo "4. 检查后端服务..."
if curl -s http://localhost:11010/api/admin/v1/security/auth > /dev/null 2>&1; then
    echo "   ✅ 后端服务正常运行 (端口 11010)"
else
    echo "   ⚠️  后端服务未响应 (端口 11010)"
    echo "   请确保后端服务已启动:"
    echo "   cd /Users/kite/code/java/kite/libai"
    echo "   ./gradlew :libai-admin:bootRun"
fi

# 5. 检查配置文件
echo "5. 检查配置文件..."
if [ -f "vite.config.js" ]; then
    echo "   ✅ vite.config.js 存在"
else
    echo "   ❌ vite.config.js 不存在"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json 存在"
else
    echo "   ❌ package.json 不存在"
    exit 1
fi

echo ""
echo "=========================================="
echo "  检查完成!"
echo "=========================================="
echo ""
echo "启动前端开发服务器:"
echo "  npm run dev"
echo ""
echo "访问地址:"
echo "  http://localhost:3000"
echo ""
