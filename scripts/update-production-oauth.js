#!/usr/bin/env node

/**
 * 🚀 更新生产环境 Google OAuth 配置
 * 将本地测试成功的OAuth配置部署到生产环境
 */

console.log('🚀 更新生产环境 Google OAuth 配置');
console.log('='.repeat(60));

console.log('\n🎉 恭喜！本地开发环境OAuth配置已成功！');
console.log('现在需要将相同的配置部署到生产环境。');

console.log('\n📋 步骤1: 确认Google Cloud Console配置');
console.log('访问: https://console.cloud.google.com/apis/credentials');
console.log('确保你的OAuth 2.0客户端ID包含以下两个重定向URI:');
console.log('✅ http://localhost:3000/api/auth/callback/google');
console.log('✅ https://labubu.hot/api/auth/callback/google');

console.log('\n📋 步骤2: 更新Cloudflare Workers环境变量');
console.log('运行以下命令更新生产环境的OAuth凭据:');
console.log('');
console.log('npx wrangler secret put GOOGLE_CLIENT_ID');
console.log('# 输入你的新客户端ID: 444976776839-8cmjcm1fdmh7ca67r50jrhpc3d5n8oct.apps.googleusercontent.com');
console.log('');
console.log('npx wrangler secret put GOOGLE_CLIENT_SECRET');
console.log('# 输入你的新客户端密钥');

console.log('\n📋 步骤3: 重新部署应用');
console.log('npm run cf:deploy');

console.log('\n📋 步骤4: 测试生产环境');
console.log('1. 访问: https://labubu.hot/auth/signin');
console.log('2. 点击"Continue with Google"');
console.log('3. 应该看到与本地测试相同的Google登录页面');

console.log('\n📋 步骤5: 验证配置');
console.log('node scripts/test-new-google-oauth.js');

console.log('\n🔧 如果遇到问题：');
console.log('1. 确保两个重定向URI都在Google Cloud Console中正确配置');
console.log('2. 等待几分钟让配置生效');
console.log('3. 清除浏览器缓存重新测试');
console.log('4. 检查Cloudflare Workers环境变量是否正确更新');

console.log('\n📊 预期结果：');
console.log('✅ 本地开发环境 (localhost:3000) - 正常工作');
console.log('✅ 生产环境 (labubu.hot) - 正常工作');
console.log('✅ 同一个OAuth应用支持两个环境');

console.log('\n🎯 完成后你将拥有：');
console.log('- 统一的OAuth配置管理');
console.log('- 本地开发环境的完整测试能力');
console.log('- 生产环境的稳定Google登录功能');
console.log('- 完整的OAuth配置文档和工具');

console.log('\n' + '='.repeat(60));
console.log('💪 你已经成功解决了OAuth配置问题！继续完成生产环境部署吧！'); 