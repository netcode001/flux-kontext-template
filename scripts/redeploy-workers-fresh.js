#!/usr/bin/env node

/**
 * 🚀 Cloudflare Workers 完全重新部署脚本
 * 安全地重新部署 Workers 以解决环境变量传播问题
 */

const { execSync } = require('child_process');
const fs = require('fs');

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

function execCommand(command, description) {
  try {
    log(colors.blue, '⚙️', `执行: ${description}`);
    console.log(`   命令: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    log(colors.green, '✅', `${description} - 成功`);
    return result;
  } catch (error) {
    log(colors.red, '❌', `${description} - 失败`);
    throw error;
  }
}

async function redeployWorkers() {
  console.log('\n🚀 Cloudflare Workers 重新部署');
  console.log('='.repeat(50));
  
  // 1. 备份当前配置
  log(colors.cyan, '💾', '第1步: 备份当前配置');
  try {
    const wranglerToml = fs.readFileSync('wrangler.toml', 'utf8');
    fs.writeFileSync('wrangler.toml.backup', wranglerToml);
    log(colors.green, '✅', 'wrangler.toml 已备份');
  } catch (error) {
    log(colors.yellow, '⚠️', 'wrangler.toml 备份失败，继续执行');
  }
  
  // 2. 确认所有环境变量
  log(colors.cyan, '🔑', '第2步: 确认环境变量配置');
  const requiredSecrets = [
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FAL_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  console.log('   需要的环境变量:');
  requiredSecrets.forEach(secret => {
    console.log(`   - ${secret}`);
  });
  
  // 3. 重新部署（这会自动使用最新的配置）
  log(colors.cyan, '🚀', '第3步: 重新部署 Workers');
  try {
    execCommand('npm run cf:deploy', '重新部署 Workers');
  } catch (error) {
    log(colors.red, '❌', '重新部署失败，尝试强制重新部署');
    
    // 如果普通部署失败，尝试强制重新部署
    try {
      execCommand('npx wrangler deploy --force', '强制重新部署');
    } catch (forceError) {
      log(colors.red, '❌', '强制重新部署也失败，请手动检查');
      throw forceError;
    }
  }
  
  // 4. 验证部署结果
  log(colors.cyan, '🔍', '第4步: 验证部署结果');
  
  // 等待几秒让部署完成
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 测试网站是否正常
  try {
    const testUrl = 'https://labubu.hot/api/debug/oauth';
    log(colors.blue, '🧪', `测试网站: ${testUrl}`);
    
    const response = await fetch(testUrl);
    if (response.ok) {
      log(colors.green, '✅', '网站正常运行');
      
      const data = await response.json();
      if (data.success) {
        log(colors.green, '✅', 'OAuth 配置正常');
        console.log('   环境变量状态:');
        console.log(`   - NEXTAUTH_URL: ${data.oauth.nextAuthUrl}`);
        console.log(`   - GOOGLE_CLIENT_ID: ${data.oauth.googleClientId ? 'SET' : 'NOT SET'}`);
        console.log(`   - GOOGLE_CLIENT_SECRET: ${data.oauth.googleClientSecret}`);
      } else {
        log(colors.yellow, '⚠️', 'OAuth 配置可能有问题');
      }
    } else {
      log(colors.red, '❌', `网站返回状态码: ${response.status}`);
    }
  } catch (error) {
    log(colors.red, '❌', `网站测试失败: ${error.message}`);
  }
  
  // 5. 测试 Google OAuth
  log(colors.cyan, '🔍', '第5步: 测试 Google OAuth');
  try {
    const oauthUrl = 'https://labubu.hot/api/auth/signin/google';
    const oauthResponse = await fetch(oauthUrl, { redirect: 'manual' });
    
    const location = oauthResponse.headers.get('location');
    if (location && location.includes('accounts.google.com')) {
      log(colors.green, '🎉', 'Google OAuth 配置成功！');
      console.log('   ✅ 可以正常跳转到 Google 授权页面');
      console.log('   ✅ 现在可以使用 Google 登录了！');
    } else if (location && location.includes('error=google')) {
      log(colors.yellow, '⚠️', 'Google OAuth 仍有问题，但配置已更新');
      console.log('   可能需要检查 Google Cloud Console 配置');
    } else {
      log(colors.yellow, '⚠️', '未预期的响应，需要进一步检查');
    }
  } catch (error) {
    log(colors.red, '❌', `Google OAuth 测试失败: ${error.message}`);
  }
  
  // 6. 提供测试指导
  log(colors.cyan, '📋', '第6步: 手动测试建议');
  console.log('');
  console.log('   请现在手动测试:');
  console.log('   1. 访问: https://labubu.hot/auth/signin');
  console.log('   2. 点击 "Continue with Google" 按钮');
  console.log('   3. 观察是否跳转到 Google 授权页面');
  console.log('');
  
  log(colors.green, '🎯', '重新部署完成！');
  console.log('   如果仍有问题，可能需要检查 Google Cloud Console 配置');
}

// 错误处理和恢复
async function handleError(error) {
  log(colors.red, '❌', `部署过程中出现错误: ${error.message}`);
  
  // 尝试恢复备份
  try {
    if (fs.existsSync('wrangler.toml.backup')) {
      fs.copyFileSync('wrangler.toml.backup', 'wrangler.toml');
      log(colors.green, '✅', '已恢复 wrangler.toml 备份');
    }
  } catch (restoreError) {
    log(colors.red, '❌', '恢复备份失败');
  }
  
  console.log('');
  log(colors.yellow, '🔧', '手动解决方案:');
  console.log('1. 检查 wrangler.toml 配置');
  console.log('2. 确认所有环境变量正确设置');
  console.log('3. 尝试手动运行: npm run cf:deploy');
  console.log('4. 如果还是有问题，联系 Cloudflare 支持');
}

async function main() {
  try {
    await redeployWorkers();
  } catch (error) {
    await handleError(error);
  } finally {
    // 清理备份文件
    try {
      if (fs.existsSync('wrangler.toml.backup')) {
        fs.unlinkSync('wrangler.toml.backup');
        log(colors.blue, '🧹', '已清理备份文件');
      }
    } catch (cleanupError) {
      // 忽略清理错误
    }
  }
}

main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
}); 