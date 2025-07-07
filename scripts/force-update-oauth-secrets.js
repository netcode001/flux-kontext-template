#!/usr/bin/env node

console.log('🔧 强制更新 Cloudflare Workers OAuth Secrets');
console.log('解决环境变量不更新的问题\n');

// 颜色函数
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 检查必要的环境变量
function checkRequiredSecrets() {
  console.log(colors.cyan('📋 检查必要的OAuth配置...\n'));
  
  const requiredSecrets = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  const missing = [];
  
  for (const secret of requiredSecrets) {
    const value = process.env[secret];
    if (!value || value.includes('your-') || value.includes('XXXXXXXXX')) {
      missing.push(secret);
    }
  }
  
  if (missing.length > 0) {
    console.log(colors.red('❌ 缺少以下必要的环境变量:'));
    missing.forEach(secret => {
      console.log(`   ${colors.yellow(secret)}`);
    });
    console.log('\n请在 .env.local 文件中配置这些变量\n');
    return false;
  }
  
  console.log(colors.green('✅ 所有必要的环境变量都已配置\n'));
  return true;
}

// 显示Cloudflare Workers环境变量不更新的原因
function explainIssue() {
  console.log(colors.yellow('🤔 为什么 Cloudflare Workers 环境变量不会更新？\n'));
  
  console.log('根据Cloudflare官方文档和社区经验，主要原因包括：\n');
  
  console.log(colors.blue('1. Secret变量类型不同'));
  console.log('   • Plaintext变量：在Dashboard界面可见');
  console.log('   • Secret变量：通过wrangler secret put上传，界面隐藏\n');
  
  console.log(colors.blue('2. 全球边缘节点传播延迟'));
  console.log('   • Secret更新需要时间传播到所有边缘节点');
  console.log('   • 可能需要5-10分钟才能完全生效\n');
  
  console.log(colors.blue('3. Worker实例缓存'));
  console.log('   • 现有Worker实例可能仍使用旧的环境变量');
  console.log('   • 需要强制重新部署来刷新缓存\n');
  
  console.log(colors.blue('4. 版本管理问题'));
  console.log('   • 多个Worker版本可能同时运行');
  console.log('   • 新的secret可能只在新版本中生效\n');
}

// 提供解决方案
function provideSolutions() {
  console.log(colors.green('💡 解决方案步骤：\n'));
  
  console.log(colors.cyan('步骤 1: 强制删除并重新上传所有secrets'));
  console.log(`
${colors.yellow('# 删除现有的secrets（如果存在）')}
npx wrangler secret delete GOOGLE_CLIENT_ID
npx wrangler secret delete GOOGLE_CLIENT_SECRET  
npx wrangler secret delete NEXTAUTH_SECRET

${colors.yellow('# 重新上传新的secrets')}
echo "${process.env.GOOGLE_CLIENT_ID || 'YOUR_NEW_GOOGLE_CLIENT_ID'}" | npx wrangler secret put GOOGLE_CLIENT_ID
echo "${process.env.GOOGLE_CLIENT_SECRET || 'YOUR_NEW_GOOGLE_CLIENT_SECRET'}" | npx wrangler secret put GOOGLE_CLIENT_SECRET
echo "${process.env.NEXTAUTH_SECRET || 'YOUR_NEXTAUTH_SECRET'}" | npx wrangler secret put NEXTAUTH_SECRET
`);

  console.log(colors.cyan('步骤 2: 强制重新部署'));
  console.log(`
${colors.yellow('# 强制重新构建和部署')}
npm run cf:deploy

${colors.yellow('# 或者使用版本控制强制部署')}
npx wrangler deploy --force
`);

  console.log(colors.cyan('步骤 3: 清除所有缓存'));
  console.log(`
${colors.yellow('# 清除Cloudflare边缘缓存')}
npx wrangler kv:namespace purge --namespace-id YOUR_NAMESPACE_ID

${colors.yellow('# 重启Worker实例（通过重新部署）')}
npx wrangler deploy --compatibility-date $(date +%Y-%m-%d)
`);

  console.log(colors.cyan('步骤 4: 验证更新'));
  console.log(`
${colors.yellow('# 等待5-10分钟后测试')}
curl https://labubu.hot/api/debug/oauth

${colors.yellow('# 检查生产环境的environment variables')}
npx wrangler tail
`);
}

// 显示高级故障排除
function advancedTroubleshooting() {
  console.log(colors.magenta('🔧 高级故障排除方法：\n'));
  
  console.log(colors.yellow('1. 创建全新的Worker进行测试'));
  console.log(`
# 创建测试Worker验证环境变量
npx wrangler create oauth-test
cd oauth-test
echo 'export default { async fetch() { return new Response(JSON.stringify({googleId: env.GOOGLE_CLIENT_ID})); } }' > src/index.js
npx wrangler deploy
`);

  console.log(colors.yellow('\n2. 使用不同的secret名称'));
  console.log(`
# 有时候旧的secret名称会有缓存问题
npx wrangler secret put GOOGLE_CLIENT_ID_NEW
npx wrangler secret put GOOGLE_CLIENT_SECRET_NEW
`);

  console.log(colors.yellow('\n3. 检查Account ID和Worker名称匹配'));
  console.log(`
# 确保wrangler.toml中的配置正确
grep -E "(name|account_id)" wrangler.toml
`);

  console.log(colors.yellow('\n4. 使用Cloudflare API直接检查'));
  console.log(`
# 直接通过API检查Worker配置
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
     "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/workers/scripts/YOUR_WORKER_NAME"
`);
}

// 提供官方资源链接
function showOfficialResources() {
  console.log(colors.green('📚 官方资源和文档：\n'));
  
  console.log('• Cloudflare Workers环境变量文档:');
  console.log('  https://developers.cloudflare.com/workers/platform/environment-variables/\n');
  
  console.log('• Workers Secrets配置指南:');
  console.log('  https://developers.cloudflare.com/workers/configuration/secrets/\n');
  
  console.log('• Wrangler命令行工具文档:');
  console.log('  https://developers.cloudflare.com/workers/wrangler/\n');
  
  console.log('• Workers故障排除指南:');
  console.log('  https://developers.cloudflare.com/workers/platform/known-issues/\n');
  
  console.log('• Cloudflare开发者Discord社区:');
  console.log('  https://discord.gg/cloudflaredev\n');
}

// 显示时间线建议
function showTimeline() {
  console.log(colors.cyan('⏰ 推荐的修复时间线：\n'));
  
  console.log(colors.green('立即执行 (0-5分钟):'));
  console.log('• 删除并重新上传所有secrets');
  console.log('• 强制重新部署Worker\n');
  
  console.log(colors.yellow('等待传播 (5-10分钟):'));
  console.log('• 等待secrets传播到全球边缘节点');
  console.log('• 这期间避免多次重新部署\n');
  
  console.log(colors.blue('验证阶段 (10-15分钟):'));
  console.log('• 测试OAuth登录功能');
  console.log('• 检查debug端点输出');
  console.log('• 如果仍有问题，等待更长时间\n');
  
  console.log(colors.magenta('最终确认 (15-30分钟):'));
  console.log('• 如果30分钟后仍有问题，考虑创建新的Worker');
  console.log('• 联系Cloudflare支持团队\n');
}

// 主函数
function main() {
  console.log(colors.green('=' .repeat(80)));
  console.log(colors.green('  Cloudflare Workers 环境变量不更新问题解决指南'));
  console.log(colors.green('=' .repeat(80)) + '\n');
  
  // 检查环境变量
  if (!checkRequiredSecrets()) {
    process.exit(1);
  }
  
  // 解释问题
  explainIssue();
  
  // 提供解决方案
  provideSolutions();
  
  // 高级故障排除
  advancedTroubleshooting();
  
  // 时间线建议
  showTimeline();
  
  // 官方资源
  showOfficialResources();
  
  console.log(colors.green('🎯 总结:'));
  console.log('Cloudflare Workers的环境变量不更新主要是由于边缘缓存和传播延迟造成的。');
  console.log('通过强制删除重新上传secrets + 重新部署 + 等待传播时间，通常可以解决问题。');
  console.log('如果问题持续存在，考虑创建新的Worker或联系Cloudflare支持。\n');
  
  console.log(colors.yellow('下一步: 请执行上述步骤1和步骤2，然后等待5-10分钟再测试OAuth登录功能。\n'));
}

// 运行主函数
main(); 