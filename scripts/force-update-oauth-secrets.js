#!/usr/bin/env node

console.log('🚀 强制更新 Cloudflare Workers OAuth Secrets');
console.log('================================================================================');

const { execSync } = require('child_process');

// 从环境变量获取OAuth配置以保证安全
const NEW_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '请设置环境变量GOOGLE_CLIENT_ID';
const NEW_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '请设置环境变量GOOGLE_CLIENT_SECRET';

console.log('📋 即将更新的OAuth配置:');
console.log(`✅ 新客户端ID: ${NEW_CLIENT_ID}`);
console.log(`✅ 新客户端密钥: ${NEW_CLIENT_SECRET}`);
console.log('');

try {
  console.log('🔄 步骤1: 更新 GOOGLE_CLIENT_ID...');
  
  // 使用 wrangler secret put 命令直接更新 secret
  const clientIdCommand = `echo "${NEW_CLIENT_ID}" | npx wrangler secret put GOOGLE_CLIENT_ID`;
  console.log(`执行命令: ${clientIdCommand}`);
  
  execSync(clientIdCommand, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ GOOGLE_CLIENT_ID 更新成功！');
  console.log('');
  
  console.log('🔄 步骤2: 更新 GOOGLE_CLIENT_SECRET...');
  
  const clientSecretCommand = `echo "${NEW_CLIENT_SECRET}" | npx wrangler secret put GOOGLE_CLIENT_SECRET`;
  console.log(`执行命令: ${clientSecretCommand}`);
  
  execSync(clientSecretCommand, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ GOOGLE_CLIENT_SECRET 更新成功！');
  console.log('');
  
  console.log('🚀 步骤3: 重新部署应用...');
  execSync('npm run cf:deploy', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('');
  console.log('🎉 所有步骤完成！');
  console.log('================================================================================');
  console.log('💡 现在可以测试Google登录了：');
  console.log('   🔗 访问: https://labubu.hot');
  console.log('   🔑 点击 "Continue with Google" 按钮');
  console.log('   ✅ 应该能正常跳转到Google登录页面了！');
  console.log('');
  
  // 延迟5秒后进行验证
  console.log('⏳ 等待5秒后进行验证...');
  setTimeout(() => {
    console.log('🔍 验证新配置...');
    try {
      const result = execSync('curl -s "https://labubu.hot/api/debug/oauth"', { encoding: 'utf8' });
      const data = JSON.parse(result);
             if (data.oauth?.googleClientId?.startsWith(NEW_CLIENT_ID.substring(0, 12))) {
        console.log('✅ 验证成功！新的客户端ID已生效！');
      } else {
        console.log('❌ 验证失败，仍然是旧的客户端ID');
        console.log('💡 可能需要等待更长时间让配置生效');
      }
    } catch (error) {
      console.log('⚠️ 验证过程出错，但不影响配置更新');
    }
  }, 5000);
  
} catch (error) {
  console.error('❌ 更新过程中出错:', error.message);
  console.log('');
  console.log('🛠️ 手动方案:');
  console.log('1. 在Cloudflare Dashboard中删除现有的 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET');
  console.log('2. 重新添加为 Secret 类型（不是 Plaintext）');
  console.log('3. 运行 npm run cf:deploy 重新部署');
} 