# 🚀 Cloudflare Workers 环境变量配置指南

## 🔍 问题分析
根据检查结果，生产环境缺少以下关键环境变量：
- `GOOGLE_CLIENT_ID` - Google OAuth客户端ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth客户端密钥  
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务角色密钥

这导致了：
1. **主页没有数据** - 数据库API调用失败
2. **登录不成功** - Google OAuth配置缺失

## 📋 必需环境变量清单

### 🔐 认证相关
```bash
# NextAuth配置
NEXTAUTH_SECRET="your_nextauth_secret_minimum_32_characters"

# Google OAuth配置
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 🗄️ 数据库相关
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

### 🎨 AI服务相关
```bash
# FAL AI API密钥
FAL_KEY="your_fal_ai_api_key"
```

## 🛠️ 配置步骤

### 1️⃣ 使用wrangler secret命令配置环境变量

```bash
# 1. NextAuth密钥
npx wrangler secret put NEXTAUTH_SECRET
# 输入：your_nextauth_secret_minimum_32_characters

# 2. Google OAuth配置
npx wrangler secret put GOOGLE_CLIENT_ID
# 输入：your_google_client_id

npx wrangler secret put GOOGLE_CLIENT_SECRET
# 输入：your_google_client_secret

# 3. Supabase配置
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# 输入：your_supabase_anon_key

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# 输入：your_supabase_service_role_key

# 4. FAL AI API密钥
npx wrangler secret put FAL_KEY
# 输入：your_fal_ai_api_key
```

### 2️⃣ 验证配置
```bash
# 查看已配置的环境变量
npx wrangler secret list
```

### 3️⃣ 重新部署
```bash
# 重新部署到Cloudflare Workers
npm run cf:deploy
```

### 4️⃣ 测试验证
```bash
# 检查环境变量配置
curl -s https://labubu.hot/api/debug/env | jq .

# 检查数据库连接
curl -s https://labubu.hot/api/debug/database-connection | jq .

# 检查API是否正常
curl -s "https://labubu.hot/api/wallpapers?limit=4" | jq .
```

## 🔧 获取缺失的环境变量值

### Google OAuth配置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择项目或创建新项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端ID
5. 设置授权重定向URI：`https://labubu.hot/api/auth/callback/google`

### Supabase配置
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`jgiegbhhkfjsqgjdstfe`
3. 在 Settings → API 中找到：
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### FAL AI API密钥
1. 访问 [FAL AI Dashboard](https://fal.ai/dashboard)
2. 创建或获取API密钥

## 📋 配置完成检查清单
- [ ] ✅ NEXTAUTH_SECRET 已设置
- [ ] ✅ GOOGLE_CLIENT_ID 已设置
- [ ] ✅ GOOGLE_CLIENT_SECRET 已设置
- [ ] ✅ SUPABASE_SERVICE_ROLE_KEY 已设置
- [ ] ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置
- [ ] ✅ FAL_KEY 已设置
- [ ] ✅ 重新部署完成
- [ ] ✅ API测试通过
- [ ] ✅ 登录功能正常
- [ ] ✅ 主页数据显示正常

## 🚨 注意事项
1. **安全性**：使用 `wrangler secret` 命令确保密钥安全存储
2. **域名配置**：确保Google OAuth配置中包含正确的回调URL
3. **权限设置**：确保Supabase服务角色密钥有足够权限
4. **部署后测试**：每次配置更改后都要重新部署并测试

## ✅ 修复结果
配置完成后，以下问题将得到解决：
1. **主页数据正常显示** - 壁纸、新闻等内容可以正常加载
2. **Google登录功能正常** - 用户可以通过Google账号登录
3. **数据库连接正常** - 所有API调用都能正常访问数据库 