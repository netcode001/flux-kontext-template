#!/usr/bin/env node

/**
 * 🔍 生产环境OAuth调试脚本
 * 检查登录问题的根本原因
 */

const https = require('https');
const url = require('url');

// 🎯 测试目标
const PRODUCTION_URL = 'https://labubu.hot';

// 🔧 调试函数
async function debugOAuthProduction() {
  console.log('🚀 开始生产环境OAuth调试...\n');
  
  // 1. 检查登录页面是否正常响应
  console.log('📄 检查登录页面状态...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/auth/signin`);
    console.log(`   状态码: ${response.status}`);
    console.log(`   内容类型: ${response.headers.get('content-type')}`);
    
    if (response.status === 200) {
      const html = await response.text();
      console.log(`   页面内容长度: ${html.length} 字符`);
      
      // 检查是否包含预期的内容
      if (html.includes('Loading sign in page')) {
        console.log('   ⚠️  页面显示加载中状态');
      }
      if (html.includes('SignInContent')) {
        console.log('   ✅ 找到SignInContent组件引用');
      }
    }
  } catch (error) {
    console.log(`   ❌ 请求失败: ${error.message}`);
  }
  
  // 2. 检查NextAuth API端点
  console.log('\n🔑 检查NextAuth API端点...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth/providers`);
    console.log(`   状态码: ${response.status}`);
    
    if (response.status === 200) {
      const providers = await response.json();
      console.log('   可用的认证提供商:', Object.keys(providers));
      
      if (providers.google) {
        console.log('   ✅ Google OAuth已配置');
        console.log(`   Google Client ID: ${providers.google.signinUrl ? '已设置' : '未设置'}`);
      } else {
        console.log('   ❌ Google OAuth未配置');
      }
    }
  } catch (error) {
    console.log(`   ❌ API请求失败: ${error.message}`);
  }
  
  // 3. 检查环境变量调试端点
  console.log('\n🔍 检查环境变量调试端点...');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/debug/oauth`);
    console.log(`   状态码: ${response.status}`);
    
    if (response.status === 200) {
      const debug = await response.json();
      console.log('   调试信息:', debug);
    }
  } catch (error) {
    console.log(`   ❌ 调试端点请求失败: ${error.message}`);
  }
  
  // 4. 检查Google OAuth配置
  console.log('\n🔧 检查Google OAuth配置建议...');
  console.log('   确保以下配置正确:');
  console.log('   - Google Console中的授权重定向URI包含:');
  console.log(`     ${PRODUCTION_URL}/api/auth/callback/google`);
  console.log('   - 授权的JavaScript源包含:');
  console.log(`     ${PRODUCTION_URL}`);
  console.log('   - Cloudflare Pages环境变量包含:');
  console.log('     GOOGLE_CLIENT_ID');
  console.log('     GOOGLE_CLIENT_SECRET');
  console.log('     NEXTAUTH_URL (应该是 https://labubu.hot)');
  console.log('     NEXTAUTH_SECRET');
  console.log('     NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true');
  
  // 5. 检查可能的错误
  console.log('\n🚨 常见问题检查清单:');
  console.log('   □ Cloudflare Pages环境变量是否正确设置');
  console.log('   □ NEXTAUTH_URL是否设置为生产域名');
  console.log('   □ Google OAuth应用域名是否正确配置');
  console.log('   □ 是否有Cookie SameSite策略问题');
  console.log('   □ 是否有CORS问题');
  console.log('   □ 是否有缓存问题需要清理');
  
  console.log('\n🎯 建议的解决步骤:');
  console.log('   1. 检查Cloudflare Pages环境变量设置');
  console.log('   2. 确认Google OAuth应用配置');
  console.log('   3. 清理浏览器缓存和Cookie');
  console.log('   4. 检查NextAuth日志输出');
  console.log('   5. 使用浏览器开发者工具查看网络请求');
  
  console.log('\n✅ 调试完成!');
}

// 执行调试
debugOAuthProduction().catch(console.error); 