#!/usr/bin/env node

/**
 * 🔧 Google OAuth 客户端重新配置指南
 * 解决 "invalid_client" 错误
 */

console.log('🔧 Google OAuth 客户端重新配置指南');
console.log('='.repeat(70));

console.log('\n🎯 问题确认:');
console.log('❌ 错误: "The OAuth client was not found"');
console.log('❌ 错误代码: Error 401: invalid_client');
console.log('✅ 根本原因: Google Cloud Console 中的 OAuth 客户端配置问题');

console.log('\n🔧 立即修复步骤:');

console.log('\n1️⃣ 访问 Google Cloud Console:');
console.log('   🔗 https://console.cloud.google.com/apis/credentials');
console.log('   📝 使用你的 Google 账户登录');

console.log('\n2️⃣ 检查现有项目:');
console.log('   🔍 查看当前项目是否正确');
console.log('   🔍 查找现有的 OAuth 2.0 客户端 ID');
console.log('   🔍 检查客户端 ID 是否匹配:');
console.log('       当前: 4449767768-4kfj8uq3vngvdtj6hgcn90o1vng0r9s2.apps.googleusercontent.com');

console.log('\n3️⃣ 创建新的 OAuth 2.0 客户端 ID:');
console.log('   ➕ 点击 "创建凭据" → "OAuth 2.0 客户端 ID"');
console.log('   🔧 应用类型: Web 应用');
console.log('   📝 名称: LabubuHub Production');

console.log('\n4️⃣ 配置授权来源:');
console.log('   📍 已获授权的 JavaScript 来源:');
console.log('       ✅ https://labubu.hot');
console.log('       ✅ http://localhost:3000 (开发环境，可选)');

console.log('\n5️⃣ 配置重定向 URI:');
console.log('   📍 已获授权的重定向 URI:');
console.log('       ✅ https://labubu.hot/api/auth/callback/google');
console.log('       ✅ http://localhost:3000/api/auth/callback/google (开发环境，可选)');

console.log('\n6️⃣ 完成创建并获取凭据:');
console.log('   📋 复制新的客户端 ID');
console.log('   🔐 复制新的客户端密钥');

console.log('\n7️⃣ 更新 Cloudflare Workers 环境变量:');
console.log('   🔧 运行以下命令更新密钥:');
console.log('');
console.log('   # 更新 Google Client ID');
console.log('   npx wrangler secret put GOOGLE_CLIENT_ID');
console.log('   # 粘贴新的客户端 ID');
console.log('');
console.log('   # 更新 Google Client Secret');
console.log('   npx wrangler secret put GOOGLE_CLIENT_SECRET');
console.log('   # 粘贴新的客户端密钥');

console.log('\n8️⃣ 配置 OAuth 同意屏幕:');
console.log('   🏠 转到 "OAuth 同意屏幕"');
console.log('   📝 应用类型: 外部');
console.log('   📝 应用状态: 已发布 (或测试中)');
console.log('   🌐 已获授权的网域: labubu.hot');

console.log('\n9️⃣ 启用必要的 API:');
console.log('   📚 转到 "API 和服务" → "库"');
console.log('   ✅ 启用 "Google+ API" (如果可用)');
console.log('   ✅ 启用 "People API"');
console.log('   ✅ 启用 "Gmail API" (可选)');

console.log('\n🔟 重新部署和测试:');
console.log('   🚀 运行: npm run cf:deploy');
console.log('   🧪 测试新的 OAuth URL (将在下面生成)');

console.log('\n' + '='.repeat(70));
console.log('🚨 重要提醒:');
console.log('1. 确保域名 labubu.hot 已添加到授权域名');
console.log('2. 重定向 URI 必须完全匹配 (包括 https://)');
console.log('3. OAuth 同意屏幕必须配置完整');
console.log('4. 新的凭据可能需要几分钟生效');

console.log('\n📋 检查清单:');
console.log('□ 创建新的 OAuth 2.0 客户端 ID');
console.log('□ 配置正确的重定向 URI');
console.log('□ 添加授权域名 labubu.hot');
console.log('□ 更新 Cloudflare Workers 环境变量');
console.log('□ 配置 OAuth 同意屏幕');
console.log('□ 启用必要的 Google API');
console.log('□ 重新部署应用');
console.log('□ 测试 Google 登录功能');

console.log('\n💡 如果仍有问题:');
console.log('1. 检查 Google Cloud Console 中的错误日志');
console.log('2. 确认项目配额和计费状态');
console.log('3. 尝试使用不同的 Google 账户测试');
console.log('4. 确保网站域名可以正常访问');

console.log('\n🎯 完成后，将生成新的测试 URL 验证配置');
console.log('='.repeat(70)); 