#!/usr/bin/env node

/**
 * 🧪 测试新 Google OAuth 配置
 * 验证更新后的凭据是否正常工作
 */

console.log('🧪 测试新 Google OAuth 配置');
console.log('='.repeat(60));

async function testNewGoogleOAuth() {
  console.log('\n🔍 1️⃣ 检查环境变量更新状态...');
  
  try {
    // 检查调试端点
    const debugResponse = await fetch('https://labubu.hot/api/debug/oauth');
    const debugData = await debugResponse.json();
    
    console.log(`✅ 调试端点响应: ${debugResponse.status}`);
    console.log(`✅ Google Client ID: ${debugData.oauth?.googleClientId?.substring(0, 12)}...`);
    console.log(`✅ NextAuth URL: ${debugData.oauth?.nextAuthUrl}`);
    
  } catch (error) {
    console.log(`❌ 调试端点错误: ${error.message}`);
  }
  
  console.log('\n🔍 2️⃣ 测试 NextAuth Google 登录端点...');
  
  try {
    const response = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      headers: {
        'User-Agent': 'OAuth-Test-Client/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual'
    });
    
    console.log(`📊 状态码: ${response.status}`);
    console.log(`📊 状态文本: ${response.statusText}`);
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log(`🔄 重定向到: ${location}`);
      
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ 成功重定向到 Google 登录页面！');
        
        // 解析重定向参数
        const url = new URL(location);
        const clientId = url.searchParams.get('client_id');
        const redirectUri = url.searchParams.get('redirect_uri');
        const scope = url.searchParams.get('scope');
        
        console.log(`🔑 客户端ID: ${clientId}`);
        console.log(`🔄 重定向URI: ${redirectUri}`);
        console.log(`📝 权限范围: ${scope}`);
        
        return { success: true, clientId, redirectUri };
      } else if (location && location.includes('error=')) {
        console.log('❌ 重定向到错误页面');
        console.log(`❌ 错误URL: ${location}`);
        return { success: false, error: 'redirect_to_error' };
      }
    } else {
      console.log(`❌ 异常状态码: ${response.status}`);
      return { success: false, error: 'unexpected_status' };
    }
    
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`);
    return { success: false, error: 'network_error' };
  }
  
  console.log('\n🔍 3️⃣ 测试 NextAuth 回调端点...');
  
  try {
    const callbackResponse = await fetch('https://labubu.hot/api/auth/callback/google', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log(`📊 回调端点状态: ${callbackResponse.status}`);
    
    if (callbackResponse.status === 400) {
      console.log('✅ 回调端点正常 (400是预期的，因为缺少参数)');
    } else {
      console.log(`⚠️ 回调端点状态异常: ${callbackResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ 回调端点错误: ${error.message}`);
  }
  
  console.log('\n🔍 4️⃣ 检查 session 状态...');
  
  try {
    const sessionResponse = await fetch('https://labubu.hot/api/auth/session');
    const sessionData = await sessionResponse.json();
    
    console.log(`📊 Session 端点状态: ${sessionResponse.status}`);
    console.log(`📊 Session 数据: ${JSON.stringify(sessionData, null, 2)}`);
  } catch (error) {
    console.log(`❌ Session 端点错误: ${error.message}`);
  }
}

// 生成新的测试URL
function generateTestURL(clientId) {
  if (!clientId) {
    console.log('\n⚠️ 无法生成测试URL，客户端ID未知');
    return;
  }
  
  console.log('\n🧪 5️⃣ 手动测试URL (使用新的客户端ID):');
  
  const redirectUri = 'https://labubu.hot/api/auth/callback/google';
  const scope = 'openid email profile';
  const responseType = 'code';
  const state = 'test-state-' + Date.now();
  
  const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${encodeURIComponent(responseType)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}`;
  
  console.log(`🔗 ${testUrl}`);
  console.log('\n📋 如果上面的URL仍然显示错误，请检查:');
  console.log('1. Google Cloud Console 中的 OAuth 客户端配置');
  console.log('2. 重定向URI是否完全匹配');
  console.log('3. 授权域名是否已添加');
  console.log('4. OAuth 同意屏幕是否配置完整');
}

// 执行测试
testNewGoogleOAuth().then((result) => {
  if (result) {
    if (result.success) {
      console.log('\n🎉 测试结果: OAuth 配置成功！');
      generateTestURL(result.clientId);
    } else {
      console.log(`\n❌ 测试结果: OAuth 配置失败 - ${result.error}`);
      console.log('\n🔧 建议检查:');
      console.log('1. Cloudflare Workers 环境变量是否正确更新');
      console.log('2. 部署是否成功完成');
      console.log('3. Google Cloud Console 配置是否正确');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 测试完成！');
}).catch(error => {
  console.error('❌ 测试执行失败:', error);
}); 