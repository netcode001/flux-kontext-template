#!/usr/bin/env node

console.log('🚨 终极Google OAuth调试 - 打印所有日志');
console.log('================================================================================');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 辅助函数：安全执行命令
function safeExec(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`📝 命令: ${command}`);
  try {
    const result = execSync(command, { encoding: 'utf8', timeout: 30000 });
    console.log(`✅ 结果: ${result.trim()}`);
    return result.trim();
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    return null;
  }
}

// 辅助函数：读取文件内容
function safeReadFile(filePath, description) {
  console.log(`\n📁 ${description}`);
  console.log(`📝 文件路径: ${filePath}`);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ 文件存在，内容长度: ${content.length} 字符`);
      return content;
    } else {
      console.log(`❌ 文件不存在`);
      return null;
    }
  } catch (error) {
    console.log(`❌ 读取错误: ${error.message}`);
    return null;
  }
}

async function ultimateDebug() {
  console.log('🚀 开始终极调试...\n');

  // ================================
  // 1. 环境检查
  // ================================
  console.log('\n🌍 === 环境变量检查 ===');
  
  // 检查本地环境变量
  const envFile = safeReadFile('.env.local', '检查 .env.local 文件');
  if (envFile) {
    console.log('📋 .env.local 内容摘要:');
    envFile.split('\n').forEach((line, index) => {
      if (line.includes('GOOGLE_CLIENT')) {
        console.log(`   第${index + 1}行: ${line.replace(/=.+/, '=***隐藏***')}`);
      } else if (line.includes('NEXTAUTH')) {
        console.log(`   第${index + 1}行: ${line.replace(/=.+/, '=***隐藏***')}`);
      } else if (line.trim() && !line.startsWith('#')) {
        console.log(`   第${index + 1}行: ${line.replace(/=.+/, '=***隐藏***')}`);
      }
    });
  }

  // 检查环境变量
  console.log('\n🔍 运行时环境变量:');
  console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '已设置' : '❌ 未设置'}`);
  console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '❌ 未设置'}`);
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ 未设置'}`);
  console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '已设置' : '❌ 未设置'}`);

  // ================================
  // 2. NextAuth配置检查
  // ================================
  console.log('\n🔐 === NextAuth配置检查 ===');
  
  const authConfig = safeReadFile('src/lib/auth.ts', '检查 NextAuth 配置文件');
  if (authConfig) {
    console.log('📋 NextAuth配置分析:');
    if (authConfig.includes('GoogleProvider')) {
      console.log('  ✅ 包含 GoogleProvider');
    } else {
      console.log('  ❌ 未找到 GoogleProvider');
    }
    
    if (authConfig.includes('clientId')) {
      console.log('  ✅ 包含 clientId 配置');
    } else {
      console.log('  ❌ 未找到 clientId 配置');
    }
    
    if (authConfig.includes('clientSecret')) {
      console.log('  ✅ 包含 clientSecret 配置');
    } else {
      console.log('  ❌ 未找到 clientSecret 配置');
    }

    // 查找具体的配置行
    const lines = authConfig.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('GoogleProvider') || line.includes('clientId') || line.includes('clientSecret')) {
        console.log(`    第${index + 1}行: ${line.trim()}`);
      }
    });
  }

  // ================================
  // 3. 生产环境API测试
  // ================================
  console.log('\n🌐 === 生产环境API测试 ===');

  // 测试OAuth调试端点
  safeExec('curl -s "https://labubu.hot/api/debug/oauth" | jq .', '测试OAuth调试端点');

  // 测试NextAuth providers端点
  safeExec('curl -s "https://labubu.hot/api/auth/providers" | jq .', '测试NextAuth providers端点');

  // 测试NextAuth signin页面
  safeExec('curl -s -I "https://labubu.hot/api/auth/signin"', '测试NextAuth signin页面');

  // 测试Google OAuth端点
  safeExec('curl -s -I "https://labubu.hot/api/auth/signin/google"', '测试Google OAuth端点');

  // 测试CSRF token
  safeExec('curl -s "https://labubu.hot/api/auth/csrf" | jq .', '测试CSRF token');

  // ================================
  // 4. 本地环境测试
  // ================================
  console.log('\n🏠 === 本地环境测试 ===');

  // 检查本地服务器状态
  safeExec('curl -s -I "http://localhost:3000" || echo "本地服务器未运行"', '检查本地服务器状态');
  
  if (safeExec('curl -s "http://localhost:3000/api/auth/providers" 2>/dev/null || echo "null"', '测试本地NextAuth providers')) {
    safeExec('curl -s "http://localhost:3000/api/debug/oauth" | jq . 2>/dev/null || echo "本地调试端点不可用"', '测试本地OAuth调试端点');
  }

  // ================================
  // 5. Google Cloud Console验证
  // ================================
  console.log('\n☁️ === Google Cloud Console验证 ===');

  // 手动构建Google OAuth URL进行测试
  const clientId = process.env.GOOGLE_CLIENT_ID || '444976776839-8cmjcm1fdmh7ca67r50jrhpc3d5n8oct.apps.googleusercontent.com';
  const redirectUri = 'https://labubu.hot/api/auth/callback/google';
  const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=test-manual`;
  
  console.log(`\n🧪 手动测试Google OAuth URL:`);
  console.log(`${testUrl}\n`);

  // 测试Google OAuth URL的可访问性
  safeExec(`curl -s -I "${testUrl.substring(0, 100)}..." || echo "无法访问Google OAuth"`, '测试Google OAuth URL可访问性');

  // ================================
  // 6. Cloudflare Workers状态
  // ================================
  console.log('\n☁️ === Cloudflare Workers状态 ===');

  // 检查wrangler配置
  const wranglerConfig = safeReadFile('wrangler.toml', '检查 wrangler.toml 配置');
  if (wranglerConfig) {
    console.log('📋 Cloudflare Workers配置摘要:');
    wranglerConfig.split('\n').forEach((line, index) => {
      if (line.includes('name') || line.includes('compatibility_date') || line.includes('NEXTAUTH') || line.includes('GOOGLE')) {
        console.log(`   第${index + 1}行: ${line}`);
      }
    });
  }

  // 检查部署状态
  safeExec('npx wrangler deployments list --limit 3 2>/dev/null || echo "无法获取部署历史"', '检查最近的部署');

  // ================================
  // 7. 网络和DNS检查
  // ================================
  console.log('\n🌐 === 网络和DNS检查 ===');

  safeExec('nslookup labubu.hot', '检查域名DNS解析');
  safeExec('ping -c 3 labubu.hot', '检查域名连通性');

  // ================================
  // 8. 详细错误模拟
  // ================================
  console.log('\n🚨 === 详细错误模拟 ===');

  // 模拟完整的OAuth流程
  console.log('\n🔄 模拟完整OAuth流程:');
  
  // 步骤1: 获取CSRF token
  const csrfResult = safeExec('curl -s "https://labubu.hot/api/auth/csrf"', '步骤1: 获取CSRF token');
  
  // 步骤2: 尝试Google登录
  if (csrfResult) {
    try {
      const csrfData = JSON.parse(csrfResult);
      if (csrfData.csrfToken) {
        console.log(`✅ CSRF Token获取成功: ${csrfData.csrfToken.substring(0, 20)}...`);
        
        // 模拟POST请求到Google登录端点
        const postData = `csrfToken=${csrfData.csrfToken}&callbackUrl=https://labubu.hot`;
        safeExec(`curl -s -X POST -d "${postData}" -H "Content-Type: application/x-www-form-urlencoded" "https://labubu.hot/api/auth/signin/google" | head -10`, '步骤2: 尝试Google登录POST请求');
      }
    } catch (error) {
      console.log(`❌ CSRF数据解析失败: ${error.message}`);
    }
  }

  // ================================
  // 9. 浏览器Console模拟
  // ================================
  console.log('\n🌐 === 浏览器Console模拟 ===');
  
  console.log('💡 浏览器调试建议:');
  console.log('   1. 打开 https://labubu.hot');
  console.log('   2. 按F12打开开发者工具');
  console.log('   3. 转到Network标签页');
  console.log('   4. 点击"Continue with Google"按钮');
  console.log('   5. 查看Network请求的详细信息:');
  console.log('      - 请求URL');
  console.log('      - 响应状态码');
  console.log('      - 响应Headers');
  console.log('      - 请求Payload');
  console.log('   6. 查看Console标签页的错误信息');

  // ================================
  // 10. 完整日志输出
  // ================================
  console.log('\n📊 === 完整诊断总结 ===');
  
  console.log('\n✅ 检查项目清单:');
  console.log('   □ .env.local 文件存在且包含GOOGLE_CLIENT_ID');
  console.log('   □ NextAuth配置包含GoogleProvider');
  console.log('   □ 生产环境API端点响应正常');
  console.log('   □ Google OAuth URL可以手动访问');
  console.log('   □ Cloudflare Workers部署成功');
  console.log('   □ DNS解析正常');

  console.log('\n🔧 下一步调试建议:');
  console.log('   1. 检查上述所有输出中的❌错误项');
  console.log('   2. 手动访问Google OAuth URL测试');
  console.log('   3. 在浏览器中查看Network请求详情');
  console.log('   4. 检查浏览器Console错误信息');
  console.log('   5. 如果所有配置都正确，可能是Google OAuth应用设置问题');

  console.log('\n🆘 紧急修复步骤:');
  console.log('   如果仍然无法登录，请尝试:');
  console.log('   1. 清除浏览器缓存和Cookie');
  console.log('   2. 尝试无痕/隐身模式');
  console.log('   3. 检查Google Cloud Console中的OAuth应用状态');
  console.log('   4. 确认授权重定向URI完全匹配');
  console.log('   5. 检查OAuth应用是否处于"已发布"状态');

  console.log('\n================================================================================');
  console.log('🎯 终极调试完成！请检查上述所有输出中的错误信息！');
  console.log('================================================================================');
}

// 运行调试
ultimateDebug().catch(error => {
  console.error('❌ 调试脚本执行失败:', error);
}); 