#!/usr/bin/env node

/**
 * 🔧 Cloudflare Workers 环境变量修复工具
 * 解决构建失败问题：缺少必要的环境变量
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

console.log('\n🚨 Cloudflare Workers 环境变量修复工具');
console.log('='.repeat(60));

// 分析构建错误
function analyzeBuildError() {
  console.log('\n🔍 第一步：分析构建错误');
  console.log('-'.repeat(40));

  log(colors.red, '❌', 'Cloudflare 构建失败的原因：');
  console.log('');
  
  console.log('1. 🗄️ Supabase 环境变量缺失');
  console.log('   - Error: supabaseUrl is required');
  console.log('   - 缺少: NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - 缺少: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('');
  
  console.log('2. 📦 R2 存储配置缺失');
  console.log('   - R2 storage not configured - missing environment variables');
  console.log('   - 但这不是致命错误');
  console.log('');
  
  console.log('3. 🔑 可能还缺少其他关键环境变量');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - NEXTAUTH_SECRET');
  console.log('   - FAL_KEY');
}

// 检查本地环境变量
function checkLocalEnvironment() {
  console.log('\n🔍 第二步：检查本地环境变量');
  console.log('-'.repeat(40));

  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    log(colors.red, '❌', '.env.local 文件不存在');
    return {};
  }

  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    }
  });

  // 检查关键环境变量
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FAL_KEY'
  ];

  console.log('本地环境变量状态：');
  requiredVars.forEach(varName => {
    if (envVars[varName] && !envVars[varName].includes('your') && !envVars[varName].includes('[')) {
      console.log(`   ✅ ${varName}: 已配置`);
    } else {
      console.log(`   ❌ ${varName}: 未配置或使用占位符`);
    }
  });

  return envVars;
}

// 生成修复命令
function generateFixCommands(envVars) {
  console.log('\n🛠️ 第三步：修复命令');
  console.log('-'.repeat(40));

  const requiredSecrets = [
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FAL_KEY'
  ];

  log(colors.cyan, '📋', '请按顺序运行以下命令：');
  console.log('');

  requiredSecrets.forEach((secret, index) => {
    if (envVars[secret] && !envVars[secret].includes('your') && !envVars[secret].includes('[')) {
      console.log(`${colors.yellow}${index + 1}. npx wrangler secret put ${secret}${colors.reset}`);
      console.log(`   # 输入: ${secret === 'NEXTAUTH_SECRET' ? envVars[secret] : secret.includes('GOOGLE') ? envVars[secret].substring(0, 20) + '...' : '已配置的值'}`);
      console.log('');
    } else {
      console.log(`${colors.red}${index + 1}. npx wrangler secret put ${secret}${colors.reset}`);
      console.log(`   # ❌ 需要先在 .env.local 中配置此变量`);
      console.log('');
    }
  });
}

// 检查 wrangler.toml 配置
function checkWranglerConfig() {
  console.log('\n🔍 第四步：检查 wrangler.toml 配置');
  console.log('-'.repeat(40));

  const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
  
  if (!fs.existsSync(wranglerPath)) {
    log(colors.red, '❌', 'wrangler.toml 文件不存在');
    return;
  }

  const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
  
  // 检查关键配置
  const requiredPublicVars = [
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_AUTH_GOOGLE_ENABLED'
  ];

  console.log('wrangler.toml 中的公开环境变量：');
  requiredPublicVars.forEach(varName => {
    if (wranglerContent.includes(varName)) {
      console.log(`   ✅ ${varName}: 已配置`);
    } else {
      console.log(`   ❌ ${varName}: 未配置`);
    }
  });

  // 检查是否有硬编码的敏感信息
  if (wranglerContent.includes('GOOGLE_CLIENT_ID =') || 
      wranglerContent.includes('GOOGLE_CLIENT_SECRET =') ||
      wranglerContent.includes('SUPABASE_SERVICE_ROLE_KEY =')) {
    log(colors.yellow, '⚠️', '警告：wrangler.toml 中包含敏感信息，应该使用 secrets');
  }
}

// 提供修复步骤
function showFixSteps() {
  console.log('\n🚀 第五步：完整修复步骤');
  console.log('-'.repeat(40));

  log(colors.green, '📝', '修复步骤：');
  console.log('');

  console.log('1️⃣ 配置缺失的环境变量到 Cloudflare Workers：');
  console.log('   - 运行上面生成的 wrangler secret put 命令');
  console.log('   - 确保所有必要的 secrets 都已配置');
  console.log('');

  console.log('2️⃣ 重新部署应用：');
  console.log(`   ${colors.yellow}npm run cf:deploy${colors.reset}`);
  console.log('');

  console.log('3️⃣ 验证部署结果：');
  console.log(`   ${colors.yellow}curl "https://labubu.hot/api/debug/env"${colors.reset}`);
  console.log(`   ${colors.yellow}curl "https://labubu.hot/api/debug/database-connection"${colors.reset}`);
  console.log('');

  console.log('4️⃣ 测试 Google OAuth：');
  console.log(`   ${colors.yellow}node scripts/verify-oauth-fix.js${colors.reset}`);
}

// 自动配置脚本
function generateAutoConfigScript() {
  console.log('\n🔧 第六步：创建自动配置脚本');
  console.log('-'.repeat(40));

  const autoScript = `#!/bin/bash

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
`;

  fs.writeFileSync('scripts/auto-config-secrets.sh', autoScript);
  log(colors.green, '✅', '自动配置脚本已创建: scripts/auto-config-secrets.sh');
  console.log('   运行: chmod +x scripts/auto-config-secrets.sh && ./scripts/auto-config-secrets.sh');
}

// 主函数
async function main() {
  analyzeBuildError();
  const envVars = checkLocalEnvironment();
  generateFixCommands(envVars);
  checkWranglerConfig();
  showFixSteps();
  generateAutoConfigScript();
  
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '🎯', '修复工具执行完成！');
  console.log('');
  log(colors.yellow, '⚠️', '关键提醒：');
  console.log('1. 本地构建成功是因为有 .env.local 文件');
  console.log('2. Cloudflare 构建失败是因为缺少 secrets 配置');
  console.log('3. 必须逐一配置所有必要的环境变量才能解决问题');
}

main().catch(error => {
  console.error('修复工具执行失败:', error);
}); 