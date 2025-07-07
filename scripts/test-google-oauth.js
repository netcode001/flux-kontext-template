#!/usr/bin/env node

console.log('🧪 Google OAuth 完整测试\n')

async function testGoogleOAuth() {
  try {
    console.log('1. 测试 NextAuth Providers...')
    const providersResponse = await fetch('https://labubu.hot/api/auth/providers')
    const providers = await providersResponse.json()
    
    if (providers.google) {
      console.log('✅ Google Provider 配置正确')
      console.log(`   登录URL: ${providers.google.signinUrl}`)
      console.log(`   回调URL: ${providers.google.callbackUrl}`)
    } else {
      console.log('❌ Google Provider 未找到')
      return
    }
    
    console.log('\n2. 测试 OAuth 配置状态...')
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth')
    const oauthData = await oauthResponse.json()
    
    if (oauthData.success) {
      console.log('✅ OAuth 基础配置正确')
      console.log(`   Client ID: ${oauthData.oauth.googleClientId}`)
      console.log(`   NextAuth URL: ${oauthData.oauth.nextAuthUrl}`)
    } else {
      console.log('❌ OAuth 配置有问题')
    }
    
    console.log('\n3. 模拟浏览器访问登录页面...')
    const signinResponse = await fetch('https://labubu.hot/api/auth/signin/google', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://labubu.hot/auth/signin',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'manual' // 不自动跟随重定向
    })
    
    console.log(`   状态码: ${signinResponse.status}`)
    console.log(`   状态文本: ${signinResponse.statusText}`)
    
    if (signinResponse.status === 302 || signinResponse.status === 307) {
      const location = signinResponse.headers.get('location')
      console.log('✅ 正常重定向到 Google OAuth')
      console.log(`   重定向地址: ${location}`)
      
      // 检查重定向URL是否包含Google OAuth域名
      if (location && location.includes('accounts.google.com')) {
        console.log('🎉 Google OAuth 配置完全正确！')
        console.log('   用户现在应该可以正常登录了')
      } else {
        console.log('⚠️ 重定向地址不是Google OAuth，可能有配置问题')
      }
    } else if (signinResponse.status === 400) {
      console.log('❌ 400错误 - 可能的原因：')
      console.log('   1. Google Developer Console 配置还未生效（等待5-10分钟）')
      console.log('   2. Client ID 或 Secret 不正确')
      console.log('   3. 重定向URI配置不匹配')
      
      const errorText = await signinResponse.text()
      if (errorText) {
        console.log(`   错误详情: ${errorText}`)
      }
    } else {
      console.log(`❌ 未预期的状态码: ${signinResponse.status}`)
      const responseText = await signinResponse.text()
      console.log(`   响应内容: ${responseText}`)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
testGoogleOAuth()

console.log('\n📋 Google Developer Console 配置检查清单:')
console.log('---------------------------------------------------')
console.log('✅ 授权的JavaScript来源: https://labubu.hot')
console.log('✅ 授权的重定向URI: https://labubu.hot/api/auth/callback/google')
console.log('⚠️ 确保点击了"保存"按钮')
console.log('⚠️ 等待5-10分钟让配置生效')
console.log('⚠️ 清除浏览器缓存和Cookie')

console.log('\n🔄 如果仍然有问题，请尝试:')
console.log('1. 等待更长时间（最多1小时）让Google配置生效')
console.log('2. 使用无痕模式测试')
console.log('3. 检查浏览器控制台的错误信息')
console.log('4. 确认Google Developer Console中没有其他冲突的URI') 