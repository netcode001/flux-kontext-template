#!/usr/bin/env node

/**
 * 🚨 OAuth 错误深度诊断工具
 * 专门分析 OAuthSignin 错误和 JavaScript 冲突
 */

console.log('🚨 OAuth 错误深度诊断工具');
console.log('='.repeat(60));

console.log('\n🔍 从截图分析到的关键错误信息:');
console.log('1️⃣ NextAuth 错误: OAuthSignin');
console.log('2️⃣ JavaScript 错误: Lockdown failed - Symbol dispose 属性删除失败');
console.log('3️⃣ 连接错误: Could not establish connection');
console.log('4️⃣ 最终跳转: /api/auth/error 页面');

console.log('\n📊 错误分析:');
console.log('✅ OAuth 流程已启动 (不是配置问题)');
console.log('❌ 在 Google 回调过程中失败');
console.log('❌ JavaScript 运行时冲突');
console.log('❌ 可能的浏览器扩展干扰');

console.log('\n🎯 问题根源分析:');

console.log('\n1️⃣ Google One Tap 冲突问题:');
console.log('   🔍 可能原因: Google One Tap 和标准 OAuth 流程冲突');
console.log('   💡 解决方案: 临时禁用 Google One Tap 组件');

console.log('\n2️⃣ JavaScript Symbol 冲突:');
console.log('   🔍 可能原因: 浏览器扩展或安全策略冲突');
console.log('   💡 解决方案: 调整 NextAuth 配置和 Cookie 设置');

console.log('\n3️⃣ OAuth 回调 URL 问题:');
console.log('   🔍 可能原因: Google 回调时的参数处理失败');
console.log('   💡 解决方案: 检查回调处理逻辑');

console.log('\n🛠️ 立即修复步骤:');

console.log('\n第一步: 禁用 Google One Tap (临时解决)');
console.log(`
在 src/app/layout.tsx 中临时注释掉 Google One Tap:

// import { GoogleOneTap } from "@/components/GoogleOneTap";
// import { GoogleOneTapTrigger } from "@/components/GoogleOneTapTrigger";

// 在组件中注释掉:
// <GoogleOneTap enabled={true} autoPrompt={false} />
// <GoogleOneTapTrigger />
`);

console.log('\n第二步: 清理浏览器环境');
console.log(`
1. 清除所有 labubu.hot 的 Cookie 和存储
2. 禁用所有浏览器扩展
3. 使用无痕模式测试
4. 或者使用不同浏览器测试
`);

console.log('\n第三步: 修改 NextAuth 配置');
console.log(`
在 src/lib/auth.ts 中添加调试模式:

export const authOptions: NextAuthOptions = {
  // ... 现有配置
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    }
  }
}
`);

console.log('\n第四步: 测试简化的 OAuth 流程');
console.log(`
1. 部署修改后的代码
2. 清除浏览器缓存
3. 直接访问: https://labubu.hot/api/auth/signin/google
4. 观察是否还有 JavaScript 错误
`);

console.log('\n📋 快速诊断命令:');
console.log(`
# 检查 NextAuth 错误页面
curl -s "https://labubu.hot/api/auth/error" | head -20

# 测试 Google OAuth 回调
curl -s "https://labubu.hot/api/auth/callback/google" | head -20

# 检查 session 状态
curl -s "https://labubu.hot/api/auth/session" | jq .
`);

console.log('\n🚨 紧急解决方案:');
console.log(`
如果问题持续，建议创建最小化测试:

1. 创建新的测试页面，只包含基本的 signIn 调用
2. 移除所有 Google One Tap 相关代码
3. 简化 NextAuth 配置
4. 使用最基本的 Google Provider 配置
`);

console.log('\n💡 根据错误特征判断:');
console.log('🎯 这很可能是 JavaScript 冲突问题，而不是 Google Cloud Console 配置问题');
console.log('🎯 建议优先解决前端冲突，再检查后端配置');

console.log('\n📞 如需进一步诊断:');
console.log('1. 提供完整的浏览器 Console 错误日志');
console.log('2. 测试禁用 Google One Tap 后的效果');
console.log('3. 尝试不同浏览器和设备');

console.log('\n' + '='.repeat(60));
console.log('🚀 建议从禁用 Google One Tap 开始修复'); 