#!/usr/bin/env bash
# G005 放射RIS系统 v3.0.2.2 - GitCode Pages 部署脚本
# 详细文档:https://docs.gitcode.com/docs/pages/

set -e

echo "==========================================="
echo "  G005 放射RIS v3.0.2.2 - GitCode Pages"
echo "==========================================="

# 1. 安装依赖
echo ""
echo "📦 [1/4] 安装依赖..."
npm install --legacy-peer-deps --no-audit --no-fund

# 2. 运行测试(快速冒烟)
echo ""
echo "🧪 [2/4] 快速单测..."
npx vitest run --pool=threads --poolOptions.threads.singleThread src/test/v3/ --reporter=dot 2>&1 | tail -10

# 3. 构建生产
echo ""
echo "🏗️  [3/4] 构建生产..."
npm run build

# 4. 验证 dist
echo ""
echo "✅ [4/4] 验证 dist..."
if [ -d "dist" ]; then
  SIZE=$(du -sh dist | cut -f1)
  FILES=$(find dist -type f | wc -l)
  echo "   dist 大小: $SIZE"
  echo "   文件数: $FILES"
  echo "   index.html: $(test -f dist/index.html && echo '✓' || echo '✗')"
  echo "   sw.js: $(test -f dist/sw.js && echo '✓' || echo '✗')"
  echo "   404.html: $(test -f dist/404.html && echo '✓' || echo '✗')"
  echo "   assets/: $(test -d dist/assets && echo '✓' || echo '✗')"
else
  echo "❌ dist/ 未生成"
  exit 1
fi

echo ""
echo "==========================================="
echo "  部署准备完成"
echo "==========================================="
echo "下一步:"
echo "  1. git add dist/ public/404.html .gitcode-pages.yml"
echo "  2. git commit -m 'deploy: GitCode Pages build'"
echo "  3. git push origin main"
echo "  4. 在 GitCode 仓库页面 → Pages 启用部署"
echo "==========================================="
