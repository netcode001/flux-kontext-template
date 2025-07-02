# 🚀 Cloudflare Pages 部署完整指南

## 📋 部署概览

Cloudflare Pages 是一个静态网站托管平台，支持 Next.js 全栈应用部署，具有以下优势：
- ✅ **免费额度充足**：每月 100GB 带宽，无限静态请求
- ✅ **全球 CDN**：超过 300 个数据中心，访问速度快
- ✅ **自动 HTTPS**：免费 SSL 证书
- ✅ **Git 集成**：自动部署，支持预览分支
- ✅ **无服务器函数**：支持 API 路由
- ✅ **自定义域名**：免费绑定自己的域名

---

## 🎯 部署步骤

### 1. 准备 GitHub 仓库

确保你的项目已推送到 GitHub：

```bash
# 检查 git 状态
git status

# 提交所有改动
git add .
git commit -m "准备部署到 Cloudflare Pages"
git push origin master
```

### 2. 登录 Cloudflare Pages

1. 访问 [pages.cloudflare.com](https://pages.cloudflare.com)
2. 使用 Cloudflare 账号登录（没有账号先注册）
3. 点击 **"Create a project"**

### 3. 连接 GitHub 仓库

1. 选择 **"Connect to Git"**
2. 选择 **GitHub** 作为 Git 提供商
3. 授权 Cloudflare 访问你的 GitHub
4. 选择仓库：`netcode001/flux-kontext-template`

### 4. 配置构建设置

在项目配置页面设置：

```
项目名称: labubuhub (或你喜欢的名称)
生产分支: master
Framework preset: Next.js
Build command: npm run build
Output directory: .next
Root directory: / (保持默认)
Node.js version: 18
```

### 5. 环境变量配置

在 **"Environment variables"** 部分添加以下变量：

#### 🔑 必需环境变量

```bash
# Node.js 版本
NODE_VERSION=18

# Next.js 配置
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-project.pages.dev

# 数据库连接
DATABASE_URL=your-database-connection-string

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-project.pages.dev
NEXT_PUBLIC_APP_NAME=LabubuHub
```

#### 🔐 OAuth 认证变量

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### 💾 存储服务变量

```bash
# Cloudflare R2 存储
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

#### 🤖 AI 服务变量

```bash
# FAL.ai API
FAL_KEY=your-fal-api-key

# OpenAI API (如果使用)
OPENAI_API_KEY=your-openai-api-key
```

#### 💳 支付服务变量

```bash
# Stripe 支付
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# 或者 Creem 支付
CREEM_API_KEY=your-creem-api-key
CREEM_WEBHOOK_SECRET=your-creem-webhook-secret
```

### 6. 开始部署

1. 点击 **"Save and Deploy"**
2. 等待构建完成（通常 3-5 分钟）
3. 查看构建日志，确保没有错误

---

## 🔧 构建优化配置

### package.json 脚本优化

确保你的 `package.json` 包含正确的构建脚本：

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "npm run build && npx @next/bundle-analyzer"
  }
}
```

### next.config.js 优化

项目已配置 Cloudflare Pages 优化：

```javascript
const nextConfig = {
  // Cloudflare Pages 部署配置
  output: process.env.NODE_ENV === 'production' && process.env.CF_PAGES ? 'export' : undefined,
  trailingSlash: false,
  compress: true,
  
  // 图片优化配置
  images: {
    remotePatterns: [
      // 配置所有需要的图片域名
    ],
    minimumCacheTTL: 60,
  },
};
```

---

## 🌐 自定义域名配置

### 1. 添加自定义域名

1. 在 Cloudflare Pages 项目中点击 **"Custom domains"**
2. 点击 **"Set up a custom domain"**
3. 输入你的域名（如：`labubuhub.com`）

### 2. DNS 配置

如果域名在 Cloudflare 管理：
- 系统会自动添加 CNAME 记录

如果域名在其他服务商：
- 添加 CNAME 记录：`your-domain.com` → `your-project.pages.dev`
- 或添加 A 记录指向 Cloudflare IP

### 3. SSL 证书

- Cloudflare 会自动为自定义域名签发 SSL 证书
- 通常在 15 分钟内生效

---

## 📊 监控和分析

### 1. 访问分析

在 Cloudflare Pages 控制台查看：
- 访问量统计
- 带宽使用情况
- 错误率监控
- 地理分布

### 2. 性能监控

```bash
# 本地性能测试
npm run lighthouse

# 构建分析
npm run build:analyze
```

### 3. 错误日志

- 在 **"Functions"** 页面查看 API 路由日志
- 使用 `console.log` 输出调试信息

---

## 🚨 常见问题解决

### 构建失败

**问题**：`Build failed with exit code 1`

**解决方案**：
1. 检查 Node.js 版本是否设置为 18
2. 确保所有环境变量都已配置
3. 检查构建日志中的具体错误信息

```bash
# 本地测试构建
npm run build
```

### 环境变量问题

**问题**：环境变量未生效

**解决方案**：
1. 确保变量名拼写正确
2. 客户端变量必须以 `NEXT_PUBLIC_` 开头
3. 重新部署项目以应用新的环境变量

### 图片加载失败

**问题**：远程图片无法显示

**解决方案**：
1. 检查 `next.config.js` 中的 `images.remotePatterns` 配置
2. 确保图片域名已添加到白名单

```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-image-domain.com",
      pathname: "/**",
    },
  ],
}
```

### API 路由问题

**问题**：API 接口返回 500 错误

**解决方案**：
1. 检查数据库连接是否正常
2. 确认所有必需的环境变量已配置
3. 查看 Functions 日志获取详细错误信息

---

## 💰 费用说明

### 免费额度

Cloudflare Pages 免费计划包括：
- ✅ **带宽**：每月 100GB
- ✅ **构建次数**：每月 500 次
- ✅ **并发构建**：1 个
- ✅ **自定义域名**：无限制
- ✅ **SSL 证书**：免费
- ✅ **Functions 调用**：每月 100,000 次

### 付费计划

Pro 计划（$20/月）包括：
- ✅ **带宽**：无限制
- ✅ **构建次数**：每月 5,000 次
- ✅ **并发构建**：5 个
- ✅ **Functions 调用**：每月 10,000,000 次

---

## 🎯 部署后检查清单

### ✅ 功能测试

- [ ] 网站首页正常访问
- [ ] 用户注册/登录功能
- [ ] 图片生成功能
- [ ] 支付流程测试
- [ ] 数据库连接正常
- [ ] API 接口响应正常

### ✅ 性能检查

- [ ] 页面加载速度 < 3秒
- [ ] 图片懒加载生效
- [ ] CDN 缓存命中率 > 90%
- [ ] Core Web Vitals 达标

### ✅ SEO 优化

- [ ] 所有页面有正确的 meta 标签
- [ ] sitemap.xml 可访问
- [ ] robots.txt 配置正确
- [ ] 结构化数据标记

---

## 🔄 持续部署

### 自动部署

每次推送到 `master` 分支时，Cloudflare Pages 会自动：
1. 拉取最新代码
2. 安装依赖
3. 执行构建
4. 部署到生产环境

### 预览部署

推送到其他分支时，会创建预览部署：
- 获得独立的预览 URL
- 可以测试新功能
- 不影响生产环境

### 回滚部署

如果新版本有问题，可以快速回滚：
1. 在 **"Deployments"** 页面选择之前的版本
2. 点击 **"Rollback to this deployment"**
3. 几秒钟内完成回滚

---

## 📞 技术支持

如果遇到部署问题，可以：

1. **检查官方文档**：[developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
2. **社区支持**：[community.cloudflare.com](https://community.cloudflare.com)
3. **GitHub Issues**：在项目仓库提交问题
4. **联系开发者**：通过项目联系方式获取帮助

---

## 🎉 部署完成

恭喜！你的 LabubuHub 项目已成功部署到 Cloudflare Pages。

**下一步建议**：
1. 绑定自定义域名
2. 配置 Google Analytics
3. 设置监控告警
4. 优化 SEO 设置
5. 测试所有功能

---

*最后更新：2024年12月* 