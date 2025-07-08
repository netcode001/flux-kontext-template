#!/bin/bash

# 🔧 更新 Google OAuth 配置到 Cloudflare Workers
# 在 Google Cloud Console 创建新的 OAuth 客户端后运行此脚本

echo "🔐 更新 Google OAuth 配置到 Cloudflare Workers"
echo "================================================"

echo "请确保您已经在 Google Cloud Console 中："
echo "1. 创建了新的 OAuth 2.0 客户端 ID"
echo "2. 配置了重定向 URI: https://labubu.hot/api/auth/callback/google"
echo ""

echo "现在将更新 Cloudflare Workers 的 Google OAuth 配置..."
echo ""

echo "1️⃣ 更新 GOOGLE_CLIENT_ID..."
npx wrangler secret put GOOGLE_CLIENT_ID

echo ""
echo "2️⃣ 更新 GOOGLE_CLIENT_SECRET..."
npx wrangler secret put GOOGLE_CLIENT_SECRET

echo ""
echo "3️⃣ 重新部署应用..."
npm run cf:deploy

echo ""
echo "4️⃣ 验证配置结果..."
echo "等待5分钟后运行验证："
echo "node scripts/verify-oauth-fix.js"

echo ""
echo "✅ Google OAuth 配置更新完成！"
echo "现在您的用户应该能够通过 Google 登录了。" 