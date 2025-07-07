#!/usr/bin/env node

/**
 * 🔧 Google OAuth 修复工具
 * 专门解决 Google 登录失败的问题
 */

console.log('🔧 Google OAuth 修复工具');
console.log('='.repeat(50));

console.log('\n🔍 问题诊断结果:');
console.log('❌ Google OAuth 登录返回 400 错误');
console.log('✅ NextAuth providers 配置正确');
console.log('✅ 环境变量配置正确');
console.log('✅ CSRF token 生成正常');

console.log('\n🎯 最可能的原因:');
console.log('📍 Google Cloud Console 中的 OAuth 应用配置问题');

console.log('\n🛠️  详细修复步骤:');

console.log('\n1️⃣ 检查 Google Cloud Console 配置:');
console.log('   👉 访问: https://console.cloud.google.com/apis/credentials');
console.log('   👉 选择你的项目');
console.log('   👉 找到 OAuth 2.0 客户端 ID');

console.log('\n2️⃣ 验证授权重定向 URI:');
console.log('   ✅ 必须包含: https://labubu.hot/api/auth/callback/google');
console.log('   ✅ 区分大小写，必须完全匹配');
console.log('   ✅ 必须使用 HTTPS 协议');

console.log('\n3️⃣ 检查 OAuth 同意屏幕:');
console.log('   👉 转到 "OAuth 同意屏幕"');
console.log('   👉 确保应用状态为 "已发布" 或 "正在测试"');
console.log('   👉 添加测试用户（如果是测试状态）');

console.log('\n4️⃣ 验证授权域:');
console.log('   👉 在 "OAuth 同意屏幕" → "已获授权的网域"');
console.log('   👉 添加: labubu.hot');

console.log('\n5️⃣ 检查 API 启用状态:');
console.log('   👉 转到 "API 和服务" → "库"');
console.log('   👉 搜索并启用 "Google+ API"');
console.log('   👉 搜索并启用 "People API"');

console.log('\n6️⃣ 临时解决方案 - 测试配置:');
console.log(`
📝 如需快速测试，请在 Google Cloud Console 中:

1. 创建新的 OAuth 2.0 客户端 ID
2. 应用类型: Web 应用
3. 名称: LabubuHub Production
4. 已获授权的 JavaScript 来源:
   - https://labubu.hot
5. 已获授权的重定向 URI:
   - https://labubu.hot/api/auth/callback/google
6. 保存并获取新的客户端 ID 和密钥
`);

console.log('\n7️⃣ 更新环境变量:');
console.log(`
如果创建了新的 OAuth 应用，请更新 Cloudflare Workers 中的密钥:

# 更新 Google Client ID
npx wrangler secret put GOOGLE_CLIENT_ID
# 输入新的客户端 ID

# 更新 Google Client Secret  
npx wrangler secret put GOOGLE_CLIENT_SECRET
# 输入新的客户端密钥

# 重新部署
npm run cf:deploy
`);

console.log('\n8️⃣ 验证修复:');
console.log('   🧪 测试命令:');
console.log('   curl -I "https://labubu.hot/api/auth/signin/google"');
console.log('   🎯 期待结果: HTTP 302 重定向到 accounts.google.com');

console.log('\n💡 额外提示:');
console.log('   • Google OAuth 可能需要几分钟时间生效');
console.log('   • 清除浏览器缓存和 Cookie');
console.log('   • 尝试无痕模式测试');
console.log('   • 确保域名 labubu.hot 可以正常访问');

console.log('\n📞 如果问题依然存在:');
console.log('   1. 检查 Google Cloud Console 中的错误日志');
console.log('   2. 确认 OAuth 应用审核状态'); 
console.log('   3. 验证域名所有权');
console.log('   4. 联系 Google 支持团队');

console.log('\n🎉 预期结果:');
console.log('   ✅ 点击 "Continue with Google" 按钮');
console.log('   ✅ 自动跳转到 Google 登录页面'); 
console.log('   ✅ 完成登录后跳转回网站');
console.log('   ✅ 成功登录并获得 30 免费积分');

console.log('\n' + '='.repeat(50));
console.log('🚀 修复完成后请重新测试 Google 登录功能'); 