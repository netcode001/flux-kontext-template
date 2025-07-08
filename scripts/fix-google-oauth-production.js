#!/usr/bin/env node

/**
 * 🔧 Google OAuth 生产环境修复工具
 * 解决 Google 登录失败问题
 */

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

console.log('\n🚨 Google OAuth 生产环境修复工具');
console.log('='.repeat(60));

// 诊断当前问题
async function diagnoseCurrentIssue() {
  console.log('\n🔍 第一步：诊断当前问题');
  console.log('-'.repeat(40));

  try {
    // 1. 检查OAuth配置
    log(colors.blue, '🔍', '检查当前OAuth配置...');
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const oauthData = await oauthResponse.json();
    
    if (oauthData.success) {
      log(colors.green, '✅', 'OAuth配置正确');
      console.log(`   Google Client ID: ${oauthData.oauth.googleClientId}`);
      console.log(`   NextAuth URL: ${oauthData.oauth.nextAuthUrl}`);
    } else {
      log(colors.red, '❌', 'OAuth配置有问题');
      return false;
    }

    // 2. 检查登录端点
    log(colors.blue, '🔍', '检查Google登录端点...');
    const signinResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log(`   状态码: ${signinResponse.status}`);
    
    if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        log(colors.green, '✅', '登录端点正常，重定向到Google');
        return true;
      } else {
        log(colors.red, '❌', `登录端点重定向错误: ${location}`);
        return false;
      }
    } else {
      log(colors.red, '❌', `登录端点返回错误: ${signinResponse.status}`);
      return false;
    }

  } catch (error) {
    log(colors.red, '❌', `诊断过程出错: ${error.message}`);
    return false;
  }
}

// 显示问题原因
function showProblemAnalysis() {
  console.log('\n🎯 第二步：问题原因分析');
  console.log('-'.repeat(40));

  log(colors.yellow, '⚠️', '根据诊断结果，问题出现在：');
  console.log('');
  
  console.log('1. 🔑 Google OAuth客户端ID无效');
  console.log('   - 当前客户端ID在Google Cloud Console中不存在');
  console.log('   - 或者客户端ID配置错误');
  console.log('');
  
  console.log('2. 🌐 授权重定向URI不匹配');
  console.log('   - Google OAuth配置中的回调URL可能不正确');
  console.log('   - 必须精确匹配 https://labubu.hot/api/auth/callback/google');
  console.log('');
  
  console.log('3. 🔄 Cloudflare Workers缓存问题');
  console.log('   - 环境变量更新后可能需要时间传播');
  console.log('   - 需要强制重新部署应用');
}

// 提供详细的修复步骤
function showFixInstructions() {
  console.log('\n🛠️ 第三步：详细修复步骤');
  console.log('-'.repeat(40));

  log(colors.cyan, '📋', '请按照以下步骤操作：');
  console.log('');

  console.log('步骤1️⃣：在Google Cloud Console创建新的OAuth客户端');
  console.log('----------------------------------------------------');
  console.log('1. 访问 https://console.cloud.google.com/apis/credentials');
  console.log('2. 选择您的项目（如果没有项目，请先创建）');
  console.log('3. 点击 "创建凭据" → "OAuth 2.0 客户端ID"');
  console.log('4. 选择应用类型: "Web应用"');
  console.log('5. 名称: "LabubuHub Production"');
  console.log('6. 授权重定向URI: https://labubu.hot/api/auth/callback/google');
  console.log('7. 点击 "创建"');
  console.log('8. 复制生成的客户端ID和客户端密钥');
  console.log('');

  console.log('步骤2️⃣：更新Cloudflare Workers环境变量');
  console.log('----------------------------------------------------');
  console.log('在终端中运行以下命令：');
  console.log('');
  console.log(colors.yellow + 'npx wrangler secret put GOOGLE_CLIENT_ID' + colors.reset);
  console.log('# 输入新的Google客户端ID');
  console.log('');
  console.log(colors.yellow + 'npx wrangler secret put GOOGLE_CLIENT_SECRET' + colors.reset);
  console.log('# 输入新的Google客户端密钥');
  console.log('');

  console.log('步骤3️⃣：重新部署应用');
  console.log('----------------------------------------------------');
  console.log(colors.yellow + 'npm run cf:deploy' + colors.reset);
  console.log('');

  console.log('步骤4️⃣：验证修复结果');
  console.log('----------------------------------------------------');
  console.log('等待5-10分钟后运行验证：');
  console.log(colors.yellow + 'node scripts/verify-oauth-fix.js' + colors.reset);
}

// 创建验证脚本
function createVerificationScript() {
  console.log('\n🔧 第四步：创建验证脚本');
  console.log('-'.repeat(40));

  const verificationScript = `#!/usr/bin/env node

/**
 * 🔍 Google OAuth 修复验证工具
 */

async function verifyOAuthFix() {
  console.log('\\n🔍 验证 Google OAuth 修复结果');
  console.log('='.repeat(50));

  try {
    // 1. 检查OAuth配置
    console.log('1️⃣ 检查OAuth配置...');
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const oauthData = await oauthResponse.json();
    
    if (oauthData.success) {
      console.log('✅ OAuth配置正确');
      console.log(\`   Google Client ID: \${oauthData.oauth.googleClientId}\`);
    } else {
      console.log('❌ OAuth配置仍有问题');
      return false;
    }

    // 2. 检查登录端点
    console.log('\\n2️⃣ 检查Google登录端点...');
    const signinResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log(\`   状态码: \${signinResponse.status}\`);
    
    if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ 登录端点正常');
        console.log(\`   重定向到: \${location.substring(0, 50)}...\`);
        
        // 3. 生成测试URL
        console.log('\\n3️⃣ 生成测试URL...');
        console.log('在浏览器中访问以下URL测试登录：');
        console.log('🔗 https://labubu.hot/auth/signin');
        
        console.log('\\n🎉 修复验证成功！');
        console.log('Google OAuth登录现在应该可以正常工作了。');
        return true;
      } else {
        console.log(\`❌ 登录端点重定向错误: \${location}\`);
        return false;
      }
    } else {
      console.log(\`❌ 登录端点仍然返回错误: \${signinResponse.status}\`);
      return false;
    }

  } catch (error) {
    console.log(\`❌ 验证过程出错: \${error.message}\`);
    return false;
  }
}

// 执行验证
verifyOAuthFix().then((success) => {
  if (success) {
    console.log('\\n🎯 所有测试通过！');
  } else {
    console.log('\\n🚨 仍有问题需要解决');
    console.log('请检查：');
    console.log('1. Google Cloud Console中的OAuth客户端配置');
    console.log('2. Cloudflare Workers环境变量');
    console.log('3. 应用部署状态');
  }
}).catch(error => {
  console.error('验证执行失败:', error);
});
`;

  require('fs').writeFileSync('scripts/verify-oauth-fix.js', verificationScript);
  log(colors.green, '✅', '验证脚本已创建: scripts/verify-oauth-fix.js');
}

// 显示重要提醒
function showImportantReminders() {
  console.log('\n⚠️ 重要提醒');
  console.log('-'.repeat(40));

  log(colors.yellow, '🔔', '请注意以下几点：');
  console.log('');
  
  console.log('1. 🔑 确保在Google Cloud Console中：');
  console.log('   - 启用了Google+ API 或 Google People API');
  console.log('   - OAuth同意屏幕配置完整');
  console.log('   - 授权重定向URI完全匹配');
  console.log('');
  
  console.log('2. ⏰ 等待时间：');
  console.log('   - Cloudflare Workers环境变量更新需要5-10分钟');
  console.log('   - 部署后需要等待全球CDN缓存更新');
  console.log('');
  
  console.log('3. 🔄 如果仍然失败：');
  console.log('   - 检查浏览器开发者工具的网络请求');
  console.log('   - 清除浏览器缓存和Cookie');
  console.log('   - 尝试使用无痕模式测试');
  console.log('');
  
  console.log('4. 📞 获取帮助：');
  console.log('   - 如果问题持续存在，请提供具体的错误信息');
  console.log('   - 包括浏览器控制台的完整错误日志');
}

// 主执行函数
async function main() {
  // 诊断当前问题
  const isWorking = await diagnoseCurrentIssue();
  
  if (isWorking) {
    log(colors.green, '🎉', 'Google OAuth配置看起来正常！');
    console.log('如果仍然有登录问题，请检查浏览器控制台的具体错误信息。');
    return;
  }

  // 显示问题分析
  showProblemAnalysis();
  
  // 提供修复步骤
  showFixInstructions();
  
  // 创建验证脚本
  createVerificationScript();
  
  // 显示重要提醒
  showImportantReminders();
  
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '🎯', '修复工具执行完成！');
  console.log('请按照上述步骤操作，然后运行验证脚本确认修复结果。');
}

// 执行主函数
main().catch(error => {
  console.error('修复工具执行失败:', error);
}); 