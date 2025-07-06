#!/bin/bash

# 🚀 Cloudflare Workers 安全部署脚本
echo "🚀 开始 Cloudflare Workers 安全部署..."

# 简化版本：直接使用现有的环境变量配置
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
    
    echo "🎉 部署完成！网站地址: https://labubu.hot"
else
    echo "❌ 部署失败！"
    exit 1
fi
