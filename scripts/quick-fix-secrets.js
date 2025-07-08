#!/usr/bin/env node

/**
 * 🚀 快速修复 Cloudflare Workers 环境变量
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 快速修复 Cloudflare Workers 环境变量');
console.log('='.repeat(50));

// 读取本地环境变量
const envLocalPath = path.join(process.cwd(), '.env.local');
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

// 需要配置的环境变量
const secretsToSet = [
  { key: 'NEXTAUTH_SECRET', value: envVars.NEXTAUTH_SECRET },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', value: envVars.SUPABASE_SERVICE_ROLE_KEY },
  { key: 'FAL_KEY', value: envVars.FAL_KEY }
];

console.log('以下环境变量将被配置到 Cloudflare Workers：');
secretsToSet.forEach(({ key, value }) => {
  if (value && !value.includes('your') && !value.includes('[')) {
    console.log(`✅ ${key}: 已准备`);
  } else {
    console.log(`❌ ${key}: 未配置或无效`);
  }
});

console.log('\n📋 请手动运行以下命令：');
console.log('='.repeat(50));

secretsToSet.forEach(({ key, value }, index) => {
  if (value && !value.includes('your') && !value.includes('[')) {
    console.log(`\n${index + 1}. npx wrangler secret put ${key}`);
    console.log(`   # 输入值: ${key.includes('SECRET') || key.includes('KEY') ? value.substring(0, 20) + '...' : value}`);
  } else {
    console.log(`\n${index + 1}. npx wrangler secret put ${key}`);
    console.log(`   # ❌ 需要先在 .env.local 中配置此变量`);
  }
});

console.log('\n🚀 配置完成后运行：');
console.log('npm run cf:deploy');
console.log('\n🔍 验证结果：');
console.log('curl "https://labubu.hot/api/debug/env"'); 