#!/usr/bin/env node

console.log('🔍 Google OAuth 配置诊断工具\n')

// 检查环境变量
console.log('📋 环境变量检查:')
console.log(`✅ GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '已设置' : '❌ 未设置'}`)
console.log(`✅ GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '❌ 未设置'}`)
console.log(`✅ NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ 未设置'}`)
console.log(`✅ NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '已设置' : '❌ 未设置'}`)
console.log(`✅ NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: ${process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED || '❌ 未设置'}`)

console.log('\n🌐 需要检查的 Google Developer Console 配置:')
console.log('---------------------------------------------------')
console.log('1. 打开 Google Developer Console:')
console.log('   https://console.developers.google.com/')
console.log('')
console.log('2. 选择你的项目，进入"凭据"页面')
console.log('')
console.log('3. 找到你的 OAuth 2.0 客户端 ID，检查以下配置:')
console.log('')
console.log('📍 授权的重定向 URI (必须完全匹配):')
console.log('   ✅ https://labubu.hot/api/auth/callback/google')
console.log('')
console.log('📍 授权的 JavaScript 来源:')
console.log('   ✅ https://labubu.hot')
console.log('')
console.log('🔧 如果配置不正确，请按以下步骤修复:')
console.log('---------------------------------------------------')
console.log('1. 在 Google Developer Console 中点击你的 OAuth 客户端 ID')
console.log('2. 在"授权的重定向 URI"部分，添加:')
console.log('   https://labubu.hot/api/auth/callback/google')
console.log('3. 在"授权的 JavaScript 来源"部分，添加:')
console.log('   https://labubu.hot')
console.log('4. 点击"保存"')
console.log('5. 等待几分钟让配置生效')
console.log('')

// 测试API端点
console.log('🧪 API 端点测试:')
console.log('---------------------------------------------------')

async function testEndpoints() {
  try {
    // 测试 providers 端点
    const providersResponse = await fetch('https://labubu.hot/api/auth/providers')
    const providers = await providersResponse.json()
    
    if (providers.google) {
      console.log('✅ NextAuth Google Provider 配置正确')
      console.log(`   - 登录URL: ${providers.google.signinUrl}`)
      console.log(`   - 回调URL: ${providers.google.callbackUrl}`)
    } else {
      console.log('❌ NextAuth Google Provider 未配置')
    }
    
    // 测试 OAuth 配置
    const oauthResponse = await fetch('https://labubu.hot/api/debug/oauth')
    const oauthData = await oauthResponse.json()
    
    if (oauthData.success) {
      console.log('✅ OAuth 配置检查通过')
      console.log(`   - Google Client ID: ${oauthData.oauth.googleClientId}`)
      console.log(`   - NextAuth URL: ${oauthData.oauth.nextAuthUrl}`)
    } else {
      console.log('❌ OAuth 配置检查失败')
    }
    
  } catch (error) {
    console.error('❌ API 测试失败:', error.message)
  }
}

testEndpoints()

console.log('\n💡 常见问题解决方案:')
console.log('---------------------------------------------------')
console.log('1. 如果点击登录按钮没有反应:')
console.log('   - 检查浏览器控制台是否有错误')
console.log('   - 确认 Google OAuth 重定向 URI 配置正确')
console.log('')
console.log('2. 如果显示"Signing in..."但没有跳转:')
console.log('   - 检查 Google Developer Console 中的 JavaScript 来源')
console.log('   - 确认域名配置为 https://labubu.hot')
console.log('')
console.log('3. 如果出现"redirect_uri_mismatch"错误:')
console.log('   - 重定向 URI 必须完全匹配')
console.log('   - 确保使用 https://labubu.hot/api/auth/callback/google')
console.log('')
console.log('4. 如果配置正确但仍然无法登录:')
console.log('   - 清除浏览器 Cookie 和缓存')
console.log('   - 等待 5-10 分钟让 Google 配置生效')
console.log('   - 尝试无痕模式')
console.log('')
console.log('🆘 如果问题仍然存在，请提供以下信息:')
console.log('   - Google Developer Console 的截图')
console.log('   - 浏览器控制台的错误信息')
console.log('   - 网络面板中的请求详情') 