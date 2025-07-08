#!/usr/bin/env node

/**
 * 🔍 Google OAuth 配置诊断工具
 * 检查当前配置并提供具体的修复建议
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

async function checkGoogleOAuthConfig() {
  console.log('\n🔍 Google OAuth 配置诊断工具');
  console.log('='.repeat(50));

  try {
    // 1. 检查当前OAuth配置
    console.log('\n1️⃣ 检查当前OAuth配置...');
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const oauthData = await oauthResponse.json();
    
    if (oauthData.success) {
      const clientId = oauthData.oauth.googleClientId;
      log(colors.green, '✅', `当前Google客户端ID: ${clientId}`);
      
      // 分析客户端ID
      if (clientId.startsWith('444976776839-')) {
        log(colors.blue, 'ℹ️', '客户端ID格式正确，属于您的Google Cloud项目');
      }
    } else {
      log(colors.red, '❌', 'OAuth配置检查失败');
      return;
    }

    // 2. 测试Google登录端点
    console.log('\n2️⃣ 测试Google登录端点...');
    const loginResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      redirect: 'manual'  // 不自动跟随重定向
    });
    
    console.log(`   状态码: ${loginResponse.status}`);
    
    if (loginResponse.status === 302) {
      const location = loginResponse.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        log(colors.green, '✅', '成功重定向到Google OAuth');
        console.log(`   重定向到: ${location.substring(0, 80)}...`);
      } else {
        log(colors.red, '❌', '重定向目标不正确');
        console.log(`   重定向到: ${location}`);
      }
    } else if (loginResponse.status === 400) {
      log(colors.red, '❌', 'OAuth客户端配置错误');
    } else {
      log(colors.yellow, '⚠️', `意外的状态码: ${loginResponse.status}`);
    }

  } catch (error) {
    log(colors.red, '❌', `检查失败: ${error.message}`);
  }
}

async function provideSolutions() {
  console.log('\n🛠️ 解决方案建议');
  console.log('='.repeat(50));

  log(colors.cyan, '📋', '根据您的Google Cloud Console截图，您有多个OAuth客户端：');
  console.log('');
  console.log('   • labubuNew (444976776839-8cmj...)');
  console.log('   • 8N8 (444976776839-d5uu...)');
  console.log('   • LabubuHub (444976776839-oc93...)');
  console.log('   • LabubuHub (444976776839-4ick...)');
  console.log('');

  log(colors.yellow, '🔧', '解决方案1：检查现有客户端配置');
  console.log('   1. 在Google Cloud Console中点击其中一个客户端');
  console.log('   2. 检查"授权重定向URI"是否包含：');
  console.log('      https://labubu.hot/api/auth/callback/google');
  console.log('   3. 如果没有，请添加这个URI');
  console.log('');

  log(colors.yellow, '🔧', '解决方案2：创建新的OAuth客户端');
  console.log('   1. 点击 "Create credentials" → "OAuth client ID"');
  console.log('   2. 应用类型：Web application');
  console.log('   3. 名称：LabubuHub-Production');
  console.log('   4. 授权重定向URI：https://labubu.hot/api/auth/callback/google');
  console.log('');

  log(colors.blue, '📝', '配置完成后，运行以下命令更新Cloudflare Workers：');
  console.log('   ./scripts/update-google-oauth.sh');
}

async function main() {
  await checkGoogleOAuthConfig();
  await provideSolutions();
  
  console.log('\n' + '='.repeat(50));
  log(colors.cyan, '🎯', '诊断完成！请根据建议进行配置。');
}

main().catch(error => {
  console.error('诊断工具执行失败:', error);
}); 