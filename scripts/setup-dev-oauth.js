#!/usr/bin/env node

/**
 * 🛠️ 开发环境 Google OAuth 配置指南
 * 解决 redirect_uri_mismatch 错误
 */

console.log('🛠️ 开发环境 Google OAuth 配置指南');
console.log('='.repeat(60));

console.log('\n🚨 问题分析:');
console.log('- 错误类型: redirect_uri_mismatch');
console.log('- 原因: 本地开发环境 (localhost:3000) 与生产环境 (labubu.hot) 重定向URI不匹配');

console.log('\n📋 解决方案 1: 更新现有OAuth应用');
console.log('1. 访问 Google Cloud Console:');
console.log('   https://console.cloud.google.com/apis/credentials');
console.log('');
console.log('2. 找到你的OAuth 2.0客户端ID并点击编辑');
console.log('');
console.log('3. 在"授权重定向URI"部分添加:');
console.log('   ✅ 生产环境: https://labubu.hot/api/auth/callback/google');
console.log('   ✅ 开发环境: http://localhost:3000/api/auth/callback/google');
console.log('');
console.log('4. 保存配置');

console.log('\n📋 解决方案 2: 创建专门的开发环境OAuth应用');
console.log('1. 在Google Cloud Console中创建新的OAuth 2.0客户端ID');
console.log('2. 应用类型: Web应用');
console.log('3. 名称: LabubuHub Development');
console.log('4. 授权重定向URI: http://localhost:3000/api/auth/callback/google');
console.log('5. 将开发环境的凭据配置到 .env.local');

console.log('\n🔧 .env.local 配置示例:');
console.log('```');
console.log('# 开发环境 Google OAuth 凭据');
console.log('GOOGLE_CLIENT_ID="你的开发环境客户端ID"');
console.log('GOOGLE_CLIENT_SECRET="你的开发环境客户端密钥"');
console.log('');
console.log('# NextAuth 配置');
console.log('NEXTAUTH_URL="http://localhost:3000"');
console.log('NEXTAUTH_SECRET="你的开发环境密钥"');
console.log('```');

console.log('\n🧪 测试步骤:');
console.log('1. 更新Google OAuth配置');
console.log('2. 重启开发服务器: npm run dev');
console.log('3. 访问: http://localhost:3000/auth/signin');
console.log('4. 点击"Continue with Google"测试');

console.log('\n⚠️ 重要提醒:');
console.log('- 生产环境和开发环境应该使用不同的OAuth应用');
console.log('- 开发环境使用 http://localhost:3000');
console.log('- 生产环境使用 https://labubu.hot');
console.log('- 确保 .env.local 文件不要提交到Git');

console.log('\n🔍 故障排除:');
console.log('如果仍然出现错误，请检查:');
console.log('1. 重定向URI是否完全匹配（包括协议、域名、端口、路径）');
console.log('2. OAuth应用状态是否为"已发布"');
console.log('3. 是否需要等待几分钟让配置生效');
console.log('4. 浏览器缓存是否需要清除');

console.log('\n' + '='.repeat(60));
console.log('🎯 配置完成后，本地开发环境的Google登录就会正常工作！'); 