#!/bin/bash

# 🔧 Cloudflare Workers 环境变量自动配置脚本
# 注意：这个脚本需要手动输入环境变量值

echo "🚀 开始配置 Cloudflare Workers 环境变量..."

# 检查 .env.local 文件
if [ ! -f .env.local ]; then
    echo "❌ .env.local 文件不存在，请先创建并配置环境变量"
    exit 1
fi

# 配置必要的 secrets
echo "1️⃣ 配置 NEXTAUTH_SECRET..."
npx wrangler secret put NEXTAUTH_SECRET

echo "2️⃣ 配置 NEXT_PUBLIC_SUPABASE_ANON_KEY..."
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY

echo "3️⃣ 配置 SUPABASE_SERVICE_ROLE_KEY..."
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

echo "4️⃣ 配置 GOOGLE_CLIENT_ID..."
npx wrangler secret put GOOGLE_CLIENT_ID

echo "5️⃣ 配置 GOOGLE_CLIENT_SECRET..."
npx wrangler secret put GOOGLE_CLIENT_SECRET

echo "6️⃣ 配置 FAL_KEY..."
npx wrangler secret put FAL_KEY

echo "✅ 所有环境变量配置完成！"
echo "🚀 现在运行部署命令：npm run cf:deploy"
