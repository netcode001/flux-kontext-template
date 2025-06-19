# 🚀 快速配置指南 - 必需账号设置

## 📋 配置优先级

### 🔴 **必需配置 (项目无法运行)**
1. Supabase数据库
2. Google OAuth
3. NextAuth密钥

### 🟡 **重要配置 (核心功能)**
4. Stripe支付 (如需支付功能)
5. Cloudflare R2 (如需图片存储)

### 🟢 **可选配置 (增强功能)**
6. Anthropic Claude (v2.0功能)
7. Exa Search (v1.1功能)
8. 其他服务

---

## 🗄️ **1. Supabase数据库配置**

### 步骤1: 创建Supabase项目
1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 选择组织和数据库密码
4. 等待项目创建完成

### 步骤2: 获取API密钥
1. 进入项目 → Settings → API
2. 复制以下信息:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 步骤3: 更新环境变量
```bash
# 替换 .env.local 中的值
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔐 **2. Google OAuth配置**

### 步骤1: 创建Google项目
1. 访问 https://console.developers.google.com/
2. 创建新项目或选择现有项目
3. 启用 "Google+ API"

### 步骤2: 创建OAuth客户端
1. 转到 "凭据" → "创建凭据" → "OAuth 2.0 客户端ID"
2. 选择应用类型: "Web应用"
3. 设置授权回调URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### 步骤3: 获取密钥
```bash
# 更新 .env.local
GOOGLE_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

---

## 🔑 **3. NextAuth密钥生成**

### 快速生成方法
```bash
# 方法1: 使用OpenSSL
openssl rand -base64 32

# 方法2: 使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3: 在线生成
# 访问 https://generate-secret.vercel.app/32
```

### 更新环境变量
```bash
# 使用生成的密钥
NEXTAUTH_SECRET="生成的32字符密钥"
```

---

## 💳 **4. Stripe支付配置 (可选)**

### 获取测试密钥
1. 访问 https://dashboard.stripe.com/
2. 注册账号并验证
3. 在 "开发者" → "API密钥" 获取:
   - 可发布密钥 (pk_test_...)
   - 密钥 (sk_test_...)

```bash
# 更新 .env.local
STRIPE_PUBLIC_KEY="pk_test_51..."
STRIPE_PRIVATE_KEY="sk_test_51..."
```

---

## ☁️ **5. Cloudflare R2存储配置 (可选)**

### 创建R2存储桶
1. 访问 https://dash.cloudflare.com/
2. 转到 "R2 Object Storage"
3. 创建存储桶
4. 获取访问密钥

```bash
# 更新 .env.local
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="your_bucket_name"
```

---

## 🧪 **配置验证**

### 验证步骤
1. 重启开发服务器: `npm run dev`
2. 访问 http://localhost:3000
3. 测试Google登录
4. 检查数据库连接
5. 测试AI图像生成

### 常见问题
- **登录失败**: 检查Google OAuth回调URL
- **数据库错误**: 验证Supabase密钥正确性
- **图像生成失败**: FAL_KEY已配置，应该正常工作

---

## 📞 **需要帮助？**

如果遇到配置问题，请提供具体的错误信息，我会帮您解决！

**优先配置顺序**: Supabase → Google OAuth → NextAuth → 其他服务 