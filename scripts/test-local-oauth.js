#!/usr/bin/env node

/**
 * 🧪 本地开发环境 OAuth 测试工具
 * 检查和测试本地的Google OAuth配置
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 本地开发环境 OAuth 测试工具');
console.log('='.repeat(60));

async function testLocalOAuth() {
  console.log('\n🔍 1️⃣ 检查 .env.local 文件...');
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ .env.local 文件不存在');
    console.log('🔧 创建 .env.local 文件模板...');
    
    const envTemplate = `# 🔐 本地开发环境配置
# Google OAuth 凭据
GOOGLE_CLIENT_ID="你的开发环境客户端ID"
GOOGLE_CLIENT_SECRET="你的开发环境客户端密钥"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-$(date +%s)"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="你的Supabase URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的Supabase匿名密钥"
SUPABASE_SERVICE_ROLE_KEY="你的Supabase服务角色密钥"

# 其他配置
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"
FAL_KEY="你的FAL密钥"
`;
    
    fs.writeFileSync(envLocalPath, envTemplate);
    console.log('✅ .env.local 模板已创建');
    console.log('📝 请编辑 .env.local 文件，填入正确的凭据');
    return;
  }
  
  console.log('✅ .env.local 文件存在');
  
  // 读取环境变量
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envLines = envContent.split('\n');
  
  console.log('\n🔍 2️⃣ 检查关键环境变量...');
  
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];
  
  const envVars = {};
  envLines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      envVars[key] = value ? value.replace(/"/g, '') : '';
    }
  });
  
  requiredVars.forEach(varName => {
    if (envVars[varName] && !envVars[varName].includes('你的')) {
      console.log(`✅ ${varName}: ${envVars[varName].substring(0, 12)}...`);
    } else {
      console.log(`❌ ${varName}: 未配置或使用模板值`);
    }
  });
  
  console.log('\n🔍 3️⃣ 检查 NEXTAUTH_URL 配置...');
  
  if (envVars.NEXTAUTH_URL === 'http://localhost:3000') {
    console.log('✅ NEXTAUTH_URL 配置正确');
  } else {
    console.log(`❌ NEXTAUTH_URL 配置错误: ${envVars.NEXTAUTH_URL}`);
    console.log('🔧 应该设置为: http://localhost:3000');
  }
  
  console.log('\n🔍 4️⃣ 测试本地 NextAuth 端点...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/providers');
    
    if (response.ok) {
      const providers = await response.json();
      console.log('✅ NextAuth 端点正常');
      console.log(`📊 可用的Provider: ${Object.keys(providers).join(', ')}`);
      
      if (providers.google) {
        console.log('✅ Google Provider 已配置');
      } else {
        console.log('❌ Google Provider 未配置');
      }
    } else {
      console.log(`❌ NextAuth 端点错误: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 无法连接到本地服务器: ${error.message}`);
    console.log('🔧 请确保开发服务器正在运行: npm run dev');
  }
  
  console.log('\n🔍 5️⃣ 生成测试 Google OAuth URL...');
  
  if (envVars.GOOGLE_CLIENT_ID && !envVars.GOOGLE_CLIENT_ID.includes('你的')) {
    const redirectUri = 'http://localhost:3000/api/auth/callback/google';
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = 'test-local-' + Date.now();
    
    const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(envVars.GOOGLE_CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${encodeURIComponent(state)}`;
    
    console.log('🔗 测试URL:');
    console.log(testUrl);
    console.log('\n📋 如果这个URL还是显示错误，请检查:');
    console.log('1. Google Cloud Console中是否添加了本地重定向URI');
    console.log('2. 重定向URI: http://localhost:3000/api/auth/callback/google');
  } else {
    console.log('❌ GOOGLE_CLIENT_ID 未配置，无法生成测试URL');
  }
}

console.log('\n📋 Google Cloud Console 配置检查清单:');
console.log('1. 访问: https://console.cloud.google.com/apis/credentials');
console.log('2. 找到你的OAuth 2.0客户端ID');
console.log('3. 确保"授权重定向URI"包含:');
console.log('   - http://localhost:3000/api/auth/callback/google');
console.log('   - https://labubu.hot/api/auth/callback/google');
console.log('4. 保存配置');

console.log('\n🔧 完成配置后的测试步骤:');
console.log('1. 重启开发服务器: npm run dev');
console.log('2. 访问: http://localhost:3000/auth/signin');
console.log('3. 点击"Continue with Google"');
console.log('4. 应该成功跳转到Google登录页面');

// 执行测试
testLocalOAuth().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 测试完成！');
}).catch(error => {
  console.error('❌ 测试执行失败:', error);
}); 