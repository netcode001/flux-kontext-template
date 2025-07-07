#!/usr/bin/env node

/**
 * 🔍 Google 登录问题调试工具
 * 专门用于诊断 Google OAuth 登录失败的问题
 */

const https = require('https');
const querystring = require('querystring');
const zlib = require('zlib');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      let stream = res;
      
      // 处理gzip压缩响应
      if (res.headers['content-encoding'] === 'gzip') {
        stream = zlib.createGunzip();
        res.pipe(stream);
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = zlib.createInflate();
        res.pipe(stream);
      }
      
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data,
          redirectLocation: res.headers.location
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function debugGoogleSignin() {
  console.log('\n🔍 Google 登录问题调试工具');
  console.log('='.repeat(50));

  try {
    // 1. 检查NextAuth providers
    log(colors.blue, '1️⃣', '检查NextAuth providers配置...');
    const providersResponse = await makeRequest('https://labubu.hot/api/auth/providers');
    
    if (providersResponse.status === 200) {
      const providers = JSON.parse(providersResponse.data);
      if (providers.google) {
        log(colors.green, '✅', 'Google Provider 配置正确');
        console.log(`   📍 登录URL: ${providers.google.signinUrl}`);
        console.log(`   📍 回调URL: ${providers.google.callbackUrl}`);
      } else {
        log(colors.red, '❌', 'Google Provider 未找到');
        console.log('   可用的providers:', Object.keys(providers));
        return;
      }
    } else {
      log(colors.red, '❌', `NextAuth providers端点返回错误: ${providersResponse.status}`);
      return;
    }

    // 2. 检查OAuth配置
    log(colors.blue, '2️⃣', '检查OAuth环境变量配置...');
    const oauthResponse = await makeRequest('https://labubu.hot/api/debug/oauth');
    
    if (oauthResponse.status === 200) {
      const oauthData = JSON.parse(oauthResponse.data);
      if (oauthData.success) {
        log(colors.green, '✅', 'OAuth基础配置正确');
        console.log(`   🔑 Client ID: ${oauthData.oauth.googleClientId}`);
        console.log(`   🔒 Client Secret: ${oauthData.oauth.googleClientSecret}`);
        console.log(`   🌐 NextAuth URL: ${oauthData.oauth.nextAuthUrl}`);
        console.log(`   🔐 NextAuth Secret: ${oauthData.oauth.nextAuthSecret}`);
      } else {
        log(colors.red, '❌', 'OAuth配置有问题');
        console.log('   推荐修复:', oauthData.recommendations);
      }
    } else {
      log(colors.yellow, '⚠️', `OAuth调试端点无法访问: ${oauthResponse.status}`);
    }

    // 3. 测试Google OAuth登录端点
    log(colors.blue, '3️⃣', '测试Google OAuth登录端点...');
    const signinResponse = await makeRequest('https://labubu.hot/api/auth/signin/google', {
      headers: {
        'Referer': 'https://labubu.hot/auth/signin'
      }
    });
    
    console.log(`   📊 状态码: ${signinResponse.status} ${signinResponse.statusText}`);
    
    if (signinResponse.status === 302 || signinResponse.status === 307) {
      log(colors.green, '✅', 'OAuth登录端点正常重定向');
      console.log(`   🔄 重定向到: ${signinResponse.redirectLocation}`);
      
      // 检查重定向URL是否指向Google
      if (signinResponse.redirectLocation && signinResponse.redirectLocation.includes('accounts.google.com')) {
        log(colors.green, '✅', '重定向到Google OAuth正常');
      } else {
        log(colors.red, '❌', '重定向目标不是Google OAuth');
      }
    } else if (signinResponse.status === 400) {
      log(colors.red, '❌', 'OAuth登录端点返回400错误');
      console.log(`   🚨 错误详情: ${signinResponse.data.substring(0, 500)}`);
    } else {
      log(colors.yellow, '⚠️', `意外的状态码: ${signinResponse.status}`);
      console.log(`   📄 响应内容: ${signinResponse.data.substring(0, 200)}...`);
    }

    // 4. 检查CSRF token生成
    log(colors.blue, '4️⃣', '检查CSRF token端点...');
    const csrfResponse = await makeRequest('https://labubu.hot/api/auth/csrf');
    
    if (csrfResponse.status === 200) {
      const csrfData = JSON.parse(csrfResponse.data);
      if (csrfData.csrfToken) {
        log(colors.green, '✅', 'CSRF token生成正常');
        console.log(`   🎫 Token长度: ${csrfData.csrfToken.length} 字符`);
      } else {
        log(colors.red, '❌', 'CSRF token生成失败');
      }
    } else {
      log(colors.red, '❌', `CSRF端点错误: ${csrfResponse.status}`);
    }

    // 5. 检查session状态
    log(colors.blue, '5️⃣', '检查当前session状态...');
    const sessionResponse = await makeRequest('https://labubu.hot/api/auth/session');
    
    if (sessionResponse.status === 200) {
      const sessionData = JSON.parse(sessionResponse.data);
      if (sessionData.user) {
        log(colors.green, '✅', '已有活跃session');
        console.log(`   👤 用户: ${sessionData.user.email}`);
      } else {
        log(colors.yellow, '⚠️', '当前无活跃session (这是正常的)');
      }
    } else {
      log(colors.red, '❌', `Session端点错误: ${sessionResponse.status}`);
    }

    // 6. 诊断建议
    log(colors.magenta, '💡', '诊断建议:');
    console.log('\n📋 可能的解决方案:');
    console.log('   1. 检查Google Cloud Console中的OAuth应用配置');
    console.log('   2. 确认授权重定向URI包含: https://labubu.hot/api/auth/callback/google');
    console.log('   3. 检查Google OAuth应用的域名验证');
    console.log('   4. 确认Client ID和Client Secret正确配置');
    console.log('   5. 检查NextAuth配置中的回调URL设置');

  } catch (error) {
    log(colors.red, '🚨', `调试过程中发生错误: ${error.message}`);
    console.error(error);
  }
}

// 运行诊断
debugGoogleSignin(); 