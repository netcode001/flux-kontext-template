#!/usr/bin/env node

/**
 * 🔍 终极OAuth调试工具
 * 全面排查登录问题的根本原因
 */

const https = require('https');
const http = require('http');

// 🎯 测试目标
const PRODUCTION_URL = 'https://labubu.hot';
const LOCAL_URL = 'http://localhost:3000';

// 🔧 调试函数集合
class UltimateOAuthDebugger {
  constructor() {
    this.results = {};
  }

  // 🚀 执行完整的OAuth诊断
  async runFullDiagnosis() {
    console.log('🔍 开始终极OAuth诊断...\n');
    
    try {
      // 1. 检查各个关键端点
      await this.checkKeyEndpoints();
      
      // 2. 检查NextAuth配置
      await this.checkNextAuthConfig();
      
      // 3. 检查OAuth流程
      await this.checkOAuthFlow();
      
      // 4. 检查环境变量
      await this.checkEnvironmentVariables();
      
      // 5. 检查SignInContent组件状态
      await this.checkSignInContentState();
      
      // 6. 生成诊断报告
      this.generateDiagnosisReport();
      
    } catch (error) {
      console.error('🚨 诊断过程中出现错误:', error);
    }
  }

  // 📡 检查关键端点
  async checkKeyEndpoints() {
    console.log('📡 检查关键端点...');
    
    const endpoints = [
      { name: '登录页面', url: `${PRODUCTION_URL}/auth/signin` },
      { name: 'NextAuth配置', url: `${PRODUCTION_URL}/api/auth/providers` },
      { name: 'NextAuth会话', url: `${PRODUCTION_URL}/api/auth/session` },
      { name: 'OAuth调试', url: `${PRODUCTION_URL}/api/debug/oauth` },
      { name: '环境变量调试', url: `${PRODUCTION_URL}/api/debug/env` }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        const contentType = response.headers.get('content-type');
        
        console.log(`   ${endpoint.name}:`);
        console.log(`     状态码: ${response.status}`);
        console.log(`     内容类型: ${contentType}`);
        
        if (response.status === 200) {
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`     响应数据: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
            this.results[endpoint.name] = { status: 'success', data };
          } else {
            const text = await response.text();
            console.log(`     响应长度: ${text.length} 字符`);
            this.results[endpoint.name] = { status: 'success', length: text.length };
          }
        } else {
          console.log(`     ❌ 请求失败`);
          this.results[endpoint.name] = { status: 'error', code: response.status };
        }
      } catch (error) {
        console.log(`     ❌ 请求异常: ${error.message}`);
        this.results[endpoint.name] = { status: 'error', error: error.message };
      }
      
      console.log('');
    }
  }

  // 🔧 检查NextAuth配置
  async checkNextAuthConfig() {
    console.log('🔧 检查NextAuth配置...');
    
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/auth/providers`);
      
      if (response.status === 200) {
        const providers = await response.json();
        console.log('   提供商数量:', Object.keys(providers).length);
        
        Object.entries(providers).forEach(([key, provider]) => {
          console.log(`   ${key}:`, {
            id: provider.id,
            name: provider.name,
            type: provider.type,
            signinUrl: provider.signinUrl,
            callbackUrl: provider.callbackUrl
          });
        });
        
        // 检查Google提供商
        if (providers.google) {
          console.log('   ✅ Google提供商配置正确');
          this.results.googleProvider = { status: 'success', config: providers.google };
        } else {
          console.log('   ❌ Google提供商未找到');
          this.results.googleProvider = { status: 'error', message: 'Google provider not found' };
        }
      } else {
        console.log('   ❌ 无法获取提供商配置');
        this.results.googleProvider = { status: 'error', message: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log('   ❌ NextAuth配置检查失败:', error.message);
      this.results.googleProvider = { status: 'error', error: error.message };
    }
    
    console.log('');
  }

  // 🔐 检查OAuth流程
  async checkOAuthFlow() {
    console.log('🔐 检查OAuth流程...');
    
    try {
      // 模拟OAuth流程的各个步骤
      const steps = [
        { name: '授权URL生成', url: `${PRODUCTION_URL}/api/auth/signin/google` },
        { name: 'CSRF检查', url: `${PRODUCTION_URL}/api/auth/csrf` },
        { name: '会话状态', url: `${PRODUCTION_URL}/api/auth/session` }
      ];

      for (const step of steps) {
        try {
          const response = await fetch(step.url);
          console.log(`   ${step.name}: ${response.status}`);
          
          if (response.status === 200) {
            const data = await response.json();
            console.log(`     数据: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`   ${step.name}: ❌ ${error.message}`);
        }
      }
    } catch (error) {
      console.log('   ❌ OAuth流程检查失败:', error.message);
    }
    
    console.log('');
  }

  // 🌐 检查环境变量
  async checkEnvironmentVariables() {
    console.log('🌐 检查环境变量...');
    
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/debug/env`);
      
      if (response.status === 200) {
        const envData = await response.json();
        console.log('   环境变量状态:', envData);
        this.results.environmentVariables = { status: 'success', data: envData };
      } else {
        console.log('   ❌ 无法获取环境变量信息');
        this.results.environmentVariables = { status: 'error', code: response.status };
      }
    } catch (error) {
      console.log('   ❌ 环境变量检查失败:', error.message);
      this.results.environmentVariables = { status: 'error', error: error.message };
    }
    
    console.log('');
  }

  // 🎨 检查SignInContent组件状态
  async checkSignInContentState() {
    console.log('🎨 检查SignInContent组件状态...');
    
    try {
      const response = await fetch(`${PRODUCTION_URL}/auth/signin`);
      const html = await response.text();
      
      // 检查页面内容
      const checks = [
        { name: '包含Loading文本', test: html.includes('Loading sign in page') },
        { name: '包含Google按钮', test: html.includes('Continue with Google') },
        { name: '包含SignInContent', test: html.includes('SignInContent') },
        { name: '包含错误信息', test: html.includes('error') || html.includes('Error') },
        { name: '包含JavaScript', test: html.includes('<script') }
      ];
      
      checks.forEach(check => {
        console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`);
      });
      
      // 检查是否有JavaScript错误
      if (html.includes('error') || html.includes('Error')) {
        console.log('   ⚠️  页面中检测到错误信息');
        const errorMatch = html.match(/error[^"]*"([^"]+)"/i);
        if (errorMatch) {
          console.log(`   错误详情: ${errorMatch[1]}`);
        }
      }
      
      this.results.signInContent = { status: 'checked', checks };
    } catch (error) {
      console.log('   ❌ SignInContent检查失败:', error.message);
      this.results.signInContent = { status: 'error', error: error.message };
    }
    
    console.log('');
  }

  // 📊 生成诊断报告
  generateDiagnosisReport() {
    console.log('📊 诊断报告生成...\n');
    
    console.log('='.repeat(60));
    console.log('              🔍 OAuth诊断报告');
    console.log('='.repeat(60));
    
    // 总结问题
    const issues = [];
    const solutions = [];
    
    if (this.results.googleProvider?.status === 'error') {
      issues.push('❌ Google OAuth提供商配置错误');
      solutions.push('🔧 检查GOOGLE_CLIENT_ID和GOOGLE_CLIENT_SECRET环境变量');
    }
    
    if (this.results.environmentVariables?.status === 'error') {
      issues.push('❌ 环境变量获取失败');
      solutions.push('🔧 检查生产环境的环境变量配置');
    }
    
    if (this.results.signInContent?.checks?.find(c => c.name === '包含Loading文本' && c.test)) {
      issues.push('❌ 登录页面卡在加载状态');
      solutions.push('🔧 检查SignInContent组件的providers获取逻辑');
    }
    
    // 输出问题和解决方案
    if (issues.length > 0) {
      console.log('\n🚨 发现的问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log('\n💡 建议的解决方案:');
      solutions.forEach(solution => console.log(`   ${solution}`));
    } else {
      console.log('\n✅ 未发现明显问题，OAuth配置看起来正常');
    }
    
    console.log('\n📋 详细检查结果:');
    console.log(JSON.stringify(this.results, null, 2));
    
    console.log('\n🎯 下一步行动建议:');
    console.log('   1. 检查Cloudflare Pages的环境变量配置');
    console.log('   2. 检查Google Cloud Console的OAuth配置');
    console.log('   3. 查看浏览器开发者工具的Network和Console面板');
    console.log('   4. 检查NextAuth的详细错误日志');
    
    console.log('\n='.repeat(60));
  }
}

// 🚀 执行诊断
async function runDiagnosis() {
  const oauthDebugger = new UltimateOAuthDebugger();
  await oauthDebugger.runFullDiagnosis();
}

// 如果直接运行此脚本
if (require.main === module) {
  runDiagnosis().catch(console.error);
}

module.exports = { UltimateOAuthDebugger }; 