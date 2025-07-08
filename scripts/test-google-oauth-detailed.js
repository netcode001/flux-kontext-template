#!/usr/bin/env node

/**
 * 🔍 详细的 Google OAuth 测试工具
 * 深度诊断 OAuth 配置问题
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

async function testGoogleOAuthDetailed() {
  console.log('\n🔍 详细的 Google OAuth 诊断');
  console.log('='.repeat(50));

  try {
    // 1. 检查环境变量
    console.log('\n1️⃣ 检查当前环境变量...');
    const envResponse = await fetch('https://labubu.hot/api/debug/env');
    const envData = await envResponse.json();
    
    if (envData.success) {
      log(colors.green, '✅', 'NEXTAUTH_URL: ' + envData.environment.NEXTAUTH_URL);
      log(colors.green, '✅', 'NEXTAUTH_SECRET: ' + envData.environment.NEXTAUTH_SECRET);
      log(colors.green, '✅', 'GOOGLE_CLIENT_ID: ' + envData.environment.GOOGLE_CLIENT_ID);
      log(colors.green, '✅', 'GOOGLE_CLIENT_SECRET: ' + envData.environment.GOOGLE_CLIENT_SECRET);
    }

    // 2. 检查 NextAuth 配置
    console.log('\n2️⃣ 检查 NextAuth 配置...');
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const oauthData = await oauthResponse.json();
    
    if (oauthData.success) {
      console.log('OAuth 配置详情:', JSON.stringify(oauthData.oauth, null, 2));
    }

    // 3. 测试认证提供商
    console.log('\n3️⃣ 测试认证提供商...');
    const providersResponse = await fetch('https://labubu.hot/api/auth/providers');
    const providersData = await providersResponse.json();
    
    console.log('可用的认证提供商:', JSON.stringify(providersData, null, 2));
    
    if (providersData.google) {
      log(colors.green, '✅', 'Google 提供商已配置');
      console.log(`   回调URL: ${providersData.google.callbackUrl}`);
      console.log(`   登录URL: ${providersData.google.signinUrl}`);
    } else {
      log(colors.red, '❌', 'Google 提供商未配置');
    }

    // 4. 直接测试登录端点
    console.log('\n4️⃣ 直接测试登录端点...');
    try {
      const loginResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`   状态码: ${loginResponse.status}`);
      console.log(`   状态文本: ${loginResponse.statusText}`);
      
      const location = loginResponse.headers.get('location');
      if (location) {
        console.log(`   重定向到: ${location}`);
        
        if (location.includes('accounts.google.com')) {
          log(colors.green, '✅', '成功重定向到 Google OAuth');
        } else if (location.includes('error=google')) {
          log(colors.red, '❌', 'Google OAuth 配置错误');
        } else {
          log(colors.yellow, '⚠️', '未预期的重定向目标');
        }
      }
      
      // 读取响应体以获取更多错误信息
      if (loginResponse.status === 400) {
        const responseText = await loginResponse.text();
        console.log(`   错误详情: ${responseText}`);
      }
      
    } catch (loginError) {
      log(colors.red, '❌', `登录端点测试失败: ${loginError.message}`);
    }

    // 5. 验证回调 URL
    console.log('\n5️⃣ 验证回调 URL...');
    try {
      const callbackResponse = await fetch('https://labubu.hot/api/auth/callback/google', {
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log(`   回调端点状态码: ${callbackResponse.status}`);
      
      if (callbackResponse.status === 400) {
        const callbackText = await callbackResponse.text();
        console.log(`   回调端点错误: ${callbackText}`);
      }
      
    } catch (callbackError) {
      console.log(`   回调端点错误: ${callbackError.message}`);
    }

  } catch (error) {
    log(colors.red, '❌', `诊断失败: ${error.message}`);
  }
}

async function provideTroubleshootingSteps() {
  console.log('\n🛠️ 问题排查步骤');
  console.log('='.repeat(50));

     log(colors.cyan, '🔧', '基于您提供的凭据：');
   console.log('   Client ID: 444976776839-8cmjcm1fdmh7ca67r50jrhpc3d5n******.apps.googleusercontent.com');
   console.log('   Client Secret: GOCSPX-rPH6mqAbIZBM9sqxm2euZnzl****');
  console.log('');

  log(colors.yellow, '📋', '可能的问题和解决方案：');
  console.log('');
  console.log('1. 🕐 配置传播延迟');
  console.log('   - Cloudflare Workers 环境变量可能需要5-10分钟传播');
  console.log('   - 等待几分钟后重新测试');
  console.log('');
  
  console.log('2. 🔑 Google Cloud Console 配置');
  console.log('   - 确认客户端状态为 "Enabled"');
  console.log('   - 确认重定向 URI 完全匹配：https://labubu.hot/api/auth/callback/google');
  console.log('   - 检查客户端密钥是否激活');
  console.log('');
  
  console.log('3. 🌐 域名验证');
  console.log('   - 在 Google Cloud Console 中验证域名 labubu.hot');
  console.log('   - 确保域名在授权域名列表中');
  console.log('');
  
  console.log('4. 🔄 缓存清理');
  console.log('   - 浏览器清除缓存和 Cookie');
  console.log('   - Cloudflare 边缘缓存清理');
  console.log('');

  log(colors.blue, '🧪', '手动测试步骤：');
  console.log('1. 访问：https://labubu.hot/auth/signin');
  console.log('2. 点击 Google 登录按钮');
  console.log('3. 观察是否跳转到 Google 授权页面');
  console.log('4. 如果失败，检查浏览器开发者工具的网络面板');
}

async function main() {
  await testGoogleOAuthDetailed();
  await provideTroubleshootingSteps();
  
  console.log('\n' + '='.repeat(50));
  log(colors.cyan, '🎯', '详细诊断完成！');
  console.log('');
  log(colors.yellow, '💡', '如果问题仍然存在，请：');
  console.log('1. 等待10分钟让配置完全传播');
  console.log('2. 在浏览器中手动测试登录流程');
  console.log('3. 检查 Google Cloud Console 中的客户端状态');
}

main().catch(error => {
  console.error('详细诊断工具执行失败:', error);
}); 