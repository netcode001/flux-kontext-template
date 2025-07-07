# OAuth Secrets 更新脚本使用说明

## 📖 使用 `force-update-oauth-secrets.js` 脚本

### 🔐 安全使用方法

为了保护敏感信息，该脚本通过环境变量获取OAuth配置。

### 🚀 使用步骤

1. **设置环境变量**
```bash
export GOOGLE_CLIENT_ID="你的Google客户端ID"
export GOOGLE_CLIENT_SECRET="你的Google客户端密钥"
```

2. **运行脚本**
```bash
node scripts/force-update-oauth-secrets.js
```

### 📋 示例配置

```bash
# 设置环境变量（请替换为你的实际值）
export GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 运行脚本
node scripts/force-update-oauth-secrets.js
```

### 🛡️ 安全注意事项

1. **永远不要在代码中硬编码敏感信息**
2. **使用环境变量存储OAuth配置**
3. **确保 `.env` 文件在 `.gitignore` 中**
4. **定期轮换OAuth密钥**

### 🔧 如果脚本运行失败

检查环境变量是否正确设置：
```bash
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

如果变量未设置，脚本会显示错误信息并退出。

### 🎯 预期结果

脚本成功运行后：
- ✅ 更新Cloudflare Workers的OAuth secrets
- ✅ 自动重新部署应用
- ✅ 验证新配置是否生效

### 📞 获取帮助

如果遇到问题，请检查：
1. Google Cloud Console中的OAuth客户端配置
2. Cloudflare Workers环境变量设置
3. 网络连接和权限设置 