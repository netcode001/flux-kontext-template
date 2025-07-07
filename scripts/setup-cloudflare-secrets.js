#!/usr/bin/env node

/**
 * 🔐 Cloudflare Workers Secrets 自动配置脚本
 * 自动读取.env.local文件并配置所有secret环境变量到Cloudflare Workers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// 需要配置为secret的环境变量列表
const SECRET_VARS = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FAL_KEY',
  'YOUTUBE_API_KEY',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_ACCESS_TOKEN',
  'INSTAGRAM_ACCESS_TOKEN',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_BEARER_TOKEN',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

// 解析.env.local文件
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(colors.red, '❌', `环境变量文件不存在: ${filePath}`);
    return {};
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    // 跳过注释和空行
    if (line.trim() === '' || line.trim().startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 跳过占位符和空值
      if (value && !value.startsWith('[') && value !== '') {
        envVars[key] = value;
      }
    }
  });

  return envVars;
}

// 检查wrangler是否已安装
function checkWrangler() {
  try {
    execSync('npx wrangler --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    log(colors.red, '❌', 'Wrangler CLI 未安装或不可用');
    return false;
  }
}

// 配置单个secret
function setSecret(key, value) {
  try {
    log(colors.blue, '🔄', `正在配置: ${key}`);
    
    // 使用echo传递值，避免交互式输入
    execSync(`echo "${value}" | npx wrangler secret put ${key}`, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    
    log(colors.green, '✅', `${key} 配置成功`);
    return true;
  } catch (error) {
    log(colors.red, '❌', `${key} 配置失败: ${error.message}`);
    return false;
  }
}

// 列出当前已配置的secrets
function listSecrets() {
  try {
    const output = execSync('npx wrangler secret list', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    log(colors.cyan, 'ℹ️', '当前已配置的secrets:');
    console.log(output);
    return output;
  } catch (error) {
    log(colors.yellow, '⚠️', `无法列出secrets: ${error.message}`);
    return '';
  }
}

// 主函数
async function setupCloudflareSecrets() {
  console.log('\n🔐 Cloudflare Workers Secrets 自动配置工具');
  console.log('='.repeat(60));

  // 检查wrangler
  if (!checkWrangler()) {
    log(colors.red, '❌', '请先安装wrangler CLI: npm install -g wrangler');
    process.exit(1);
  }

  // 解析环境变量文件
  const envFilePath = path.join(__dirname, '../.env.local');
  const envVars = parseEnvFile(envFilePath);

  log(colors.blue, 'ℹ️', `从 .env.local 读取到 ${Object.keys(envVars).length} 个环境变量`);

  // 检查哪些secret变量可以配置
  const availableSecrets = SECRET_VARS.filter(key => key in envVars);
  const missingSecrets = SECRET_VARS.filter(key => !(key in envVars));

  if (availableSecrets.length === 0) {
    log(colors.yellow, '⚠️', '没有找到可配置的secret变量');
    log(colors.cyan, 'ℹ️', '请先在.env.local文件中配置以下变量:');
    SECRET_VARS.forEach(key => {
      console.log(`  - ${key}`);
    });
    process.exit(1);
  }

  console.log(`\n📋 准备配置 ${availableSecrets.length} 个secrets:`);
  availableSecrets.forEach(key => {
    console.log(`  ✓ ${key}`);
  });

  if (missingSecrets.length > 0) {
    console.log(`\n⚠️  缺失的secrets (将跳过):`);
    missingSecrets.forEach(key => {
      console.log(`  - ${key}`);
    });
  }

  // 询问用户确认
  console.log('\n🚀 准备开始配置...');
  
  let successCount = 0;
  let failCount = 0;

  // 配置每个secret
  for (const key of availableSecrets) {
    const value = envVars[key];
    if (setSecret(key, value)) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 添加短暂延迟，避免API限制
    if (availableSecrets.indexOf(key) < availableSecrets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 配置结果:');
  log(colors.green, '✅', `成功配置: ${successCount} 个`);
  log(colors.red, '❌', `配置失败: ${failCount} 个`);

  // 列出当前配置
  console.log('\n🔍 当前配置状态:');
  listSecrets();

  if (successCount > 0) {
    console.log('\n🚀 下一步:');
    console.log('1. 重新部署: npm run cf:deploy');
    console.log('2. 测试API: curl https://labubu.hot/api/debug/env');
    console.log('3. 检查网站功能是否正常');
  }
}

// 异步包装器
async function main() {
  try {
    await setupCloudflareSecrets();
  } catch (error) {
    log(colors.red, '❌', `脚本执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { setupCloudflareSecrets }; 