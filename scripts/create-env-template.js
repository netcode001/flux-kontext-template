#!/usr/bin/env node

/**
 * 🔧 环境变量配置模板生成器
 * 帮助用户正确配置所有必要的环境变量
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

const envTemplate = `# =============================================================================
# 🌐 LabubuHub 环境变量配置模板
# =============================================================================

# 📝 说明：请根据你的实际配置替换以下占位符
# 🔒 重要：请勿将此文件提交到 Git 仓库

# -----------------------------------------------------------------------------
# 🔐 NextAuth.js 认证配置
# -----------------------------------------------------------------------------
NEXTAUTH_URL="https://labubu.hot"
NEXTAUTH_SECRET="[请生成一个随机密钥，至少32字符]"

# Google OAuth 配置
GOOGLE_CLIENT_ID="[从 Google Cloud Console 获取]"
GOOGLE_CLIENT_SECRET="[从 Google Cloud Console 获取]"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# -----------------------------------------------------------------------------
# 🗄️ Supabase 数据库配置
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://jgiegbhhkfjsqgjdstfe.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[从 Supabase 项目设置获取]"
SUPABASE_SERVICE_ROLE_KEY="[从 Supabase 项目设置获取，服务角色密钥]"

# 数据库连接字符串 (可选，用于直接连接)
DATABASE_URL="postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]"

# -----------------------------------------------------------------------------
# 🎨 FAL AI 图像生成配置
# -----------------------------------------------------------------------------
FAL_KEY="[从 fal.ai 获取 API 密钥]"

# -----------------------------------------------------------------------------
# 🎥 媒体 API 配置
# -----------------------------------------------------------------------------

# YouTube Data API v3
YOUTUBE_API_KEY="[从 Google Cloud Console 获取，启用 YouTube Data API v3]"

# Facebook/Meta API (可选)
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_ACCESS_TOKEN=""

# Instagram API (可选)
INSTAGRAM_ACCESS_TOKEN=""

# Twitter/X API (可选)
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_BEARER_TOKEN=""
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_TOKEN_SECRET=""

# TikTok API (可选)
TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""

# -----------------------------------------------------------------------------
# 🇨🇳 国内平台 API 配置 (可选)
# -----------------------------------------------------------------------------

# 微博 API
WEIBO_APP_KEY=""
WEIBO_APP_SECRET=""
WEIBO_ACCESS_TOKEN=""
WEIBO_REDIRECT_URI=""

# 抖音 API
DOUYIN_CLIENT_KEY=""
DOUYIN_CLIENT_SECRET=""
DOUYIN_ACCESS_TOKEN=""

# 哔哩哔哩 API
BILIBILI_ACCESS_KEY=""
BILIBILI_SECRET_KEY=""
BILIBILI_SESSDATA=""

# 百度 API
BAIDU_API_KEY=""
BAIDU_SECRET_KEY=""

# -----------------------------------------------------------------------------
# 🌏 地区特色平台 API 配置 (可选)
# -----------------------------------------------------------------------------

# Naver API (韩国)
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""

# LINE API (日本)
LINE_CHANNEL_ACCESS_TOKEN=""
LINE_CHANNEL_SECRET=""

# -----------------------------------------------------------------------------
# 💳 支付系统配置 (可选)
# -----------------------------------------------------------------------------

# Stripe 配置
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# 其他支付配置
PAYMENT_SUCCESS_URL="https://labubu.hot/payment/success"
PAYMENT_CANCEL_URL="https://labubu.hot/payment/cancel"

# -----------------------------------------------------------------------------
# 🔧 系统配置
# -----------------------------------------------------------------------------

# 环境设置
NODE_ENV="production"
ENVIRONMENT="production"
DEBUG_MODE="false"
LOG_LEVEL="INFO"

# 安全设置
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# 网络设置 (可选)
REQUEST_DELAY="2"
MAX_RETRIES="3"
TIMEOUT="30"

# 代理设置 (可选)
# HTTP_PROXY=""
# HTTPS_PROXY=""
# SOCKS_PROXY=""

# -----------------------------------------------------------------------------
# 📊 分析和监控配置 (可选)
# -----------------------------------------------------------------------------

# Google Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# 其他分析服务
PLAUSIBLE_DOMAIN="labubu.hot"

# -----------------------------------------------------------------------------
# 🛡️ 安全验证配置 (可选)
# -----------------------------------------------------------------------------

# Google Site Verification
GOOGLE_SITE_VERIFICATION="[从 Google Search Console 获取]"

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# =============================================================================
# 📋 配置获取指南
# =============================================================================

# 🔗 Google Cloud Console: https://console.cloud.google.com/
#   - 创建项目
#   - 启用 YouTube Data API v3
#   - 创建 OAuth 2.0 客户端 ID (Google 登录)
#   - 创建 API 密钥 (YouTube API)

# 🔗 Supabase: https://app.supabase.com/
#   - 创建项目
#   - 获取项目 URL 和匿名密钥
#   - 获取服务角色密钥 (Settings → API)

# 🔗 FAL AI: https://fal.ai/
#   - 注册账户
#   - 获取 API 密钥

# 🔗 Meta for Developers: https://developers.facebook.com/
#   - 创建应用
#   - 获取应用 ID 和密钥

# 🔗 Twitter Developer Portal: https://developer.twitter.com/
#   - 创建项目和应用
#   - 获取 API 密钥和令牌

# =============================================================================
# 🚀 使用说明
# =============================================================================

# 1. 复制此模板到 .env.local 文件
# 2. 根据你的需求填写相应的 API 密钥
# 3. 运行检查脚本验证配置：node scripts/check-env-config.js
# 4. 部署到 Cloudflare Workers 时，需要在 wrangler.toml 中配置环境变量

# =============================================================================
# ⚠️ 安全提醒
# =============================================================================

# - 请勿将包含真实密钥的 .env.local 文件提交到 Git 仓库
# - 定期轮换 API 密钥以提高安全性
# - 为不同环境使用不同的密钥（开发/测试/生产）
# - 启用 API 密钥的使用限制和监控
`;

function createEnvTemplate() {
  console.log('\n🔧 LabubuHub 环境变量配置模板生成器');
  console.log('='.repeat(60));

  const templatePath = path.join(__dirname, '../.env.template');
  const examplePath = path.join(__dirname, '../.env.example');
  const localPath = path.join(__dirname, '../.env.local');

  try {
    // 生成模板文件
    fs.writeFileSync(templatePath, envTemplate);
    log(colors.green, '✅', `环境变量模板已生成: .env.template`);

    // 同时更新 .env.example
    fs.writeFileSync(examplePath, envTemplate);
    log(colors.green, '✅', `示例文件已更新: .env.example`);

    // 检查是否存在 .env.local
    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(localPath, envTemplate);
      log(colors.yellow, '⚠️', `.env.local 文件不存在，已创建模板`);
      log(colors.cyan, 'ℹ️', '请编辑 .env.local 文件，填写你的实际配置');
    } else {
      log(colors.blue, 'ℹ️', `.env.local 文件已存在，不会覆盖`);
    }

    console.log('\n📋 下一步操作:');
    console.log('1. 编辑 .env.local 文件，填写你的 API 密钥');
    console.log('2. 运行检查脚本: node scripts/check-env-config.js');
    console.log('3. 测试 YouTube API: node scripts/check-youtube-api.js');
    console.log('4. 重新部署: ./scripts/deploy-and-secure.sh');

    console.log('\n🔗 重要链接:');
    console.log('- Google Cloud Console: https://console.cloud.google.com/');
    console.log('- Supabase Dashboard: https://app.supabase.com/');
    console.log('- FAL AI Dashboard: https://fal.ai/');
    console.log('- YouTube API 配置指南: 请查看 docs/ 目录');

  } catch (error) {
    log(colors.red, '❌', `生成模板失败: ${error.message}`);
    process.exit(1);
  }
}

// 主函数
if (require.main === module) {
  createEnvTemplate();
}

module.exports = { createEnvTemplate }; 