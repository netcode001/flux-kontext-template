#!/bin/bash

# 🚀 Cloudflare Workers 安全部署脚本
echo "🚀 开始 Cloudflare Workers 安全部署..."

# 检查必要的环境变量
if [ -z "$YOUTUBE_API_KEY" ]; then
    echo "⚠️  警告：YOUTUBE_API_KEY 环境变量未设置，YouTube功能可能无法正常工作"
fi

# 部署到 Cloudflare Workers
npm run cf:deploy

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    
    # 验证部署结果
    echo "🔍 验证部署结果..."
    sleep 3
    
    # 测试数据库连接
    DB_STATUS=$(curl -s "https://labubu.hot/api/debug/database-connection" | jq -r '.success')
    if [ "$DB_STATUS" = "true" ]; then
        echo "✅ 数据库连接正常"
    else
        echo "❌ 数据库连接失败"
    fi
    
    # 测试YouTube API
    echo "🔍 测试YouTube API..."
    YOUTUBE_STATUS=$(curl -s "https://labubu.hot/api/admin/youtube-crawler?maxResults=1" | jq -r '.success')
    if [ "$YOUTUBE_STATUS" = "true" ]; then
        echo "✅ YouTube API连接正常"
    else
        echo "❌ YouTube API连接失败，请检查API密钥配置"
    fi
    
    echo "🎉 部署完成！网站地址: https://labubu.hot"
else
    echo "❌ 部署失败！"
    exit 1
fi
