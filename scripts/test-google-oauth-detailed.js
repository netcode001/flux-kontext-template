#!/usr/bin/env node

/**
 * 🔍 详细的 Google OAuth 测试工具
 * 用于验证重定向URI和配置问题
 */

const https = require('https');
const querystring = require('querystring');

console.log('🔍 详细的 Google OAuth 测试工具');
console.log('='.repeat(60));

// 模拟 Google OAuth 授权流程
async function testGoogleOAuth() {
  console.log('\n🎯 测试 Google OAuth 授权流程...');
  
  // 1. 测试 NextAuth Google 登录端点
  console.log('\n1️⃣ 测试 NextAuth Google 登录端点:');
  console.log('   URL: https://labubu.hot/api/auth/signin/google');
  
  try {
    const response = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-OAuth-Client/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'manual' // 不自动跟随重定向
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log(`   重定向到: ${location}`);
      
      if (location && location.includes('accounts.google.com')) {
        console.log('   ✅ 正常重定向到 Google 登录页面');
        
        // 解析重定向 URL 中的参数
        const url = new URL(location);
        console.log(`   客户端ID: ${url.searchParams.get('client_id')}`);
        console.log(`   重定向URI: ${url.searchParams.get('redirect_uri')}`);
        console.log(`   响应类型: ${url.searchParams.get('response_type')}`);
        console.log(`   范围: ${url.searchParams.get('scope')}`);
        
        // 检查关键参数
        const redirectUri = url.searchParams.get('redirect_uri');
        console.log(`\n🔍 重定向URI分析:`);
        console.log(`   实际URI: ${redirectUri}`);
        console.log(`   期望URI: https://labubu.hot/api/auth/callback/google`);
        console.log(`   匹配: ${redirectUri === 'https://labubu.hot/api/auth/callback/google' ? '✅' : '❌'}`);
        
      } else {
        console.log('   ❌ 重定向到非 Google 页面');
      }
    } else if (response.status === 400) {
      console.log('   ❌ 400 错误 - 可能是配置问题');
      const text = await response.text();
      console.log(`   错误内容: ${text.substring(0, 200)}...`);
    } else {
      console.log(`   ❌ 异常状态码: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
  
  // 2. 测试 NextAuth 回调端点
  console.log('\n2️⃣ 测试 NextAuth 回调端点:');
  console.log('   URL: https://labubu.hot/api/auth/callback/google');
  
  try {
    const response = await fetch('https://labubu.hot/api/auth/callback/google', {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-OAuth-Client/1.0',
      },
      redirect: 'manual'
    });
    
    console.log(`   状态码: ${response.status}`);
    console.log(`   状态文本: ${response.statusText}`);
    
    if (response.status === 400) {
      console.log('   ❌ 400 错误 - 缺少必要参数 (这是正常的)');
    } else if (response.status === 200) {
      console.log('   ✅ 端点可访问');
    } else {
      console.log(`   ⚠️ 异常状态码: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ 网络错误: ${error.message}`);
  }
  
  // 3. 生成正确的 Google Cloud Console 配置
  console.log('\n3️⃣ Google Cloud Console 配置验证:');
  console.log('   请在 Google Cloud Console 中验证以下配置:');
  console.log('   🔗 https://console.cloud.google.com/apis/credentials');
  console.log('');
  console.log('   必需的重定向 URI:');
  console.log('   ✅ https://labubu.hot/api/auth/callback/google');
  console.log('');
  console.log('   授权域名:');
  console.log('   ✅ labubu.hot');
  console.log('');
  console.log('   OAuth 同意屏幕:');
  console.log('   ✅ 应用类型: 外部');
  console.log('   ✅ 应用状态: 已发布 或 正在测试');
  console.log('   ✅ 范围: email, profile, openid');
  
  // 4. 生成测试用的 Google OAuth URL
  console.log('\n4️⃣ 手动 Google OAuth URL 生成:');
  
  const clientId = '4449767768-4kfj8uq3vngvdtj6hgcn90o1vng0r9s2.apps.googleusercontent.com'; // 从调试信息中获取
  const redirectUri = 'https://labubu.hot/api/auth/callback/google';
  const scope = 'openid email profile';
  const responseType = 'code';
  const state = 'test-state-' + Date.now();
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${encodeURIComponent(responseType)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}`;
  
  console.log('   手动测试 URL:');
  console.log(`   ${authUrl}`);
  console.log('');
  console.log('   🧪 测试步骤:');
  console.log('   1. 复制上面的 URL');
  console.log('   2. 在浏览器中打开');
  console.log('   3. 如果显示 Google 登录页面 = 配置正确');
  console.log('   4. 如果显示错误 = Google Console 配置问题');
}

// 5. 诊断建议
function showDiagnosisRecommendations() {
  console.log('\n5️⃣ 诊断建议:');
  console.log('');
  console.log('   如果手动 URL 测试失败，请检查:');
  console.log('   🔧 Google Cloud Console → APIs & Services → Credentials');
  console.log('   🔧 确保 OAuth 2.0 客户端 ID 配置正确');
  console.log('   🔧 重定向 URI 必须完全匹配 (包括 https://)');
  console.log('   🔧 授权域名必须包含 labubu.hot');
  console.log('   🔧 OAuth 同意屏幕必须配置完整');
  console.log('');
  console.log('   如果手动 URL 测试成功，NextAuth 仍然失败:');
  console.log('   🔧 检查 NextAuth 配置');
  console.log('   🔧 检查 Cookie 域名设置');
  console.log('   🔧 检查 CSRF 保护设置');
  console.log('   🔧 检查 Session 配置');
  console.log('');
  console.log('   临时解决方案:');
  console.log('   🚀 在 Google Cloud Console 中创建新的 OAuth 客户端 ID');
  console.log('   🚀 使用新的客户端 ID 和密钥');
  console.log('   🚀 确保所有配置从零开始正确设置');
}

// 执行测试
testGoogleOAuth().then(() => {
  showDiagnosisRecommendations();
  console.log('\n' + '='.repeat(60));
  console.log('🎯 测试完成！请根据结果调整 Google Cloud Console 配置');
}).catch(error => {
  console.error('❌ 测试失败:', error);
}); 