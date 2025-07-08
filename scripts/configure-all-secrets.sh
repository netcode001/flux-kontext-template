#!/bin/bash

# 🔧 自动配置 Cloudflare Workers 所有环境变量
# 解决构建失败问题

echo "🚀 开始配置 Cloudflare Workers 环境变量..."
echo "=================================================="

# 检查是否有 .env.local 文件
if [ ! -f .env.local ]; then
    echo "❌ .env.local 文件不存在"
    echo "请先创建 .env.local 文件并配置必要的环境变量"
    exit 1
fi

# 读取环境变量
source .env.local

echo "📋 将配置以下环境变量到 Cloudflare Workers："

# 1. NEXTAUTH_SECRET
echo ""
echo "1️⃣ 配置 NEXTAUTH_SECRET..."
if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "$NEXTAUTH_SECRET" | npx wrangler secret put NEXTAUTH_SECRET
    echo "✅ NEXTAUTH_SECRET 配置完成"
else
    echo "❌ NEXTAUTH_SECRET 未在 .env.local 中配置"
fi

# 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
echo ""
echo "2️⃣ 配置 NEXT_PUBLIC_SUPABASE_ANON_KEY..."
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 配置完成"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未在 .env.local 中配置"
fi

# 3. SUPABASE_SERVICE_ROLE_KEY
echo ""
echo "3️⃣ 配置 SUPABASE_SERVICE_ROLE_KEY..."
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
    echo "✅ SUPABASE_SERVICE_ROLE_KEY 配置完成"
else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY 未在 .env.local 中配置"
fi

# 4. FAL_KEY
echo ""
echo "4️⃣ 配置 FAL_KEY..."
if [ -n "$FAL_KEY" ]; then
    echo "$FAL_KEY" | npx wrangler secret put FAL_KEY
    echo "✅ FAL_KEY 配置完成"
else
    echo "❌ FAL_KEY 未在 .env.local 中配置"
fi

echo ""
echo "=================================================="
echo "🎉 所有环境变量配置完成！"
echo ""
echo "🚀 现在重新部署应用："
echo "npm run cf:deploy"
echo ""
echo "🔍 验证配置结果："
echo "curl \"https://labubu.hot/api/debug/env\"" 