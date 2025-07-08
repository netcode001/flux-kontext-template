#!/usr/bin/env node

/**
 * 🕐 等待和循环测试 Google OAuth
 * 每分钟测试一次，直到成功或超时
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

async function testGoogleOAuth() {
  try {
    const response = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    const location = response.headers.get('location');
    
    if (location && location.includes('accounts.google.com')) {
      return { success: true, message: '成功重定向到 Google OAuth' };
    } else if (location && location.includes('error=google')) {
      return { success: false, message: 'Google OAuth 配置错误' };
    } else {
      return { success: false, message: `未预期的重定向: ${location}` };
    }
  } catch (error) {
    return { success: false, message: `网络错误: ${error.message}` };
  }
}

async function waitAndTest() {
  console.log('\n🕐 等待和循环测试 Google OAuth');
  console.log('='.repeat(50));
  
  const maxAttempts = 15; // 15 分钟
  let attempt = 1;
  
  log(colors.blue, '🔄', '开始循环测试，每分钟测试一次...');
  console.log('');
  
  while (attempt <= maxAttempts) {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    log(colors.cyan, '🧪', `第 ${attempt}/${maxAttempts} 次测试 (${timestamp})`);
    
    const result = await testGoogleOAuth();
    
    if (result.success) {
      log(colors.green, '🎉', '测试成功！Google OAuth 现在正常工作');
      console.log('');
      log(colors.green, '✅', '您现在可以使用 Google 登录了！');
      console.log('   1. 访问：https://labubu.hot/auth/signin');
      console.log('   2. 点击 Google 登录按钮');
      console.log('   3. 完成 Google 授权');
      break;
    } else {
      log(colors.yellow, '⏳', `测试失败: ${result.message}`);
      
      if (attempt < maxAttempts) {
        console.log(`   等待 60 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 60000)); // 等待 1 分钟
      }
    }
    
    attempt++;
  }
  
  if (attempt > maxAttempts) {
    log(colors.red, '❌', '测试超时。可能需要手动检查配置。');
    console.log('');
    log(colors.yellow, '🔧', '请检查：');
    console.log('1. Google Cloud Console 中的 OAuth 客户端状态');
    console.log('2. OAuth 同意屏幕配置');
    console.log('3. 授权域名设置');
  }
}

// 同时提供手动测试指导
function showManualTesting() {
  console.log('\n🧪 手动测试指导');
  console.log('='.repeat(50));
  
  log(colors.cyan, '📋', '在等待期间，您可以手动测试：');
  console.log('');
  console.log('1. 🌐 访问登录页面：');
  console.log('   https://labubu.hot/auth/signin');
  console.log('');
  console.log('2. 🔍 观察 Google 登录按钮的行为：');
  console.log('   - 点击后应该跳转到 Google 授权页面');
  console.log('   - 如果跳转到错误页面，说明配置还需要时间');
  console.log('');
  console.log('3. 🛠️ 如果仍然失败，检查浏览器开发者工具：');
  console.log('   - F12 → Network 面板');
  console.log('   - 点击 Google 登录按钮');
  console.log('   - 查看网络请求的响应');
  console.log('');
  
  log(colors.blue, '💡', '小贴士：');
  console.log('- Cloudflare Workers 环境变量传播可能需要 5-15 分钟');
  console.log('- 如果 15 分钟后还是失败，可能需要检查 Google Cloud Console 配置');
}

async function main() {
  showManualTesting();
  await waitAndTest();
  
  console.log('\n' + '='.repeat(50));
  log(colors.cyan, '🎯', '测试完成！');
}

main().catch(error => {
  console.error('测试工具执行失败:', error);
}); 