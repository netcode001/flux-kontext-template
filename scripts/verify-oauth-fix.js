#!/usr/bin/env node

/**
 * 🔍 Google OAuth 修复验证工具
 */

async function verifyOAuthFix() {
  console.log('\n🔍 验证 Google OAuth 修复结果');
  console.log('='.repeat(50));

  try {
    // 1. 检查OAuth配置
    console.log('1️⃣ 检查OAuth配置...');
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const oauthData = await oauthResponse.json();
    
    if (oauthData.success) {
      console.log('✅ OAuth配置正确');
      console.log(`   Google Client ID: ${oauthData.oauth.googleClientId}`);
    } else {
      console.log('❌ OAuth配置仍有问题');
      return false;
    }

    // 2. 检查登录端点
    console.log('\n2️⃣ 检查Google登录端点...');
    const signinResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log(`   状态码: ${signinResponse.status}`);
    
    if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location');
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ 登录端点正常');
        console.log(`   重定向到: ${location.substring(0, 50)}...`);
        
        // 3. 生成测试URL
        console.log('\n3️⃣ 生成测试URL...');
        console.log('在浏览器中访问以下URL测试登录：');
        console.log('🔗 https://labubu.hot/auth/signin');
        
        console.log('\n🎉 修复验证成功！');
        console.log('Google OAuth登录现在应该可以正常工作了。');
        return true;
      } else {
        console.log(`❌ 登录端点重定向错误: ${location}`);
        return false;
      }
    } else {
      console.log(`❌ 登录端点仍然返回错误: ${signinResponse.status}`);
      return false;
    }

  } catch (error) {
    console.log(`❌ 验证过程出错: ${error.message}`);
    return false;
  }
}

// 执行验证
verifyOAuthFix().then((success) => {
  if (success) {
    console.log('\n🎯 所有测试通过！');
  } else {
    console.log('\n🚨 仍有问题需要解决');
    console.log('请检查：');
    console.log('1. Google Cloud Console中的OAuth客户端配置');
    console.log('2. Cloudflare Workers环境变量');
    console.log('3. 应用部署状态');
  }
}).catch(error => {
  console.error('验证执行失败:', error);
});
