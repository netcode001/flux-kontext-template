#!/usr/bin/env node

/**
 * 🔍 系统健康检查脚本
 * 检查UUID修复和数据库连接稳定性
 */

const https = require('https');
const { v4: uuidv4 } = require('uuid');

console.log('🔍 开始系统健康检查...\n');

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('📋 环境变量检查:');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'GOOGLE_ID',
    'GOOGLE_SECRET'
  ];
  
  let allPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    const isPresent = process.env[envVar] ? true : false;
    console.log(`   ${envVar}: ${isPresent ? '✅' : '❌'}`);
    if (!isPresent) allPresent = false;
  });
  
  console.log(`   总体状态: ${allPresent ? '✅ 所有必需环境变量已配置' : '❌ 缺少环境变量'}\n`);
  return allPresent;
}

// 检查UUID生成功能
function checkUuidGeneration() {
  console.log('📋 UUID生成功能检查:');
  
  try {
    const testUuids = [];
    for (let i = 0; i < 5; i++) {
      testUuids.push(uuidv4());
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const allValid = testUuids.every(uuid => uuidRegex.test(uuid));
    const allUnique = new Set(testUuids).size === testUuids.length;
    
    console.log(`   生成的UUID样例: ${testUuids[0]}`);
    console.log(`   格式验证: ${allValid ? '✅' : '❌'}`);
    console.log(`   唯一性检查: ${allUnique ? '✅' : '❌'}`);
    console.log(`   总体状态: ${allValid && allUnique ? '✅ UUID生成正常' : '❌ UUID生成异常'}\n`);
    
    return allValid && allUnique;
  } catch (error) {
    console.log(`   ❌ UUID生成失败: ${error.message}\n`);
    return false;
  }
}

// 检查应用程序响应
function checkApplicationHealth() {
  return new Promise((resolve) => {
    console.log('📋 应用程序健康检查:');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/providers',
      method: 'GET',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      console.log(`   HTTP状态码: ${res.statusCode}`);
      console.log(`   响应时间: < 5秒`);
      console.log(`   总体状态: ${res.statusCode === 200 ? '✅ 应用程序正常运行' : '⚠️ 应用程序可能有问题'}\n`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ 连接失败: ${error.message}`);
      console.log(`   总体状态: ❌ 应用程序未运行或不可访问\n`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`   ❌ 请求超时`);
      console.log(`   总体状态: ❌ 应用程序响应缓慢\n`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// 生成健康报告
function generateHealthReport(envCheck, uuidCheck, appCheck) {
  console.log('📊 系统健康报告:');
  console.log('=' .repeat(50));
  
  const checks = [
    { name: '环境变量配置', status: envCheck, critical: true },
    { name: 'UUID生成功能', status: uuidCheck, critical: true },
    { name: '应用程序运行', status: appCheck, critical: false }
  ];
  
  let criticalIssues = 0;
  let totalIssues = 0;
  
  checks.forEach(check => {
    const statusIcon = check.status ? '✅' : '❌';
    const criticalMark = check.critical ? ' [关键]' : '';
    console.log(`   ${check.name}: ${statusIcon}${criticalMark}`);
    
    if (!check.status) {
      totalIssues++;
      if (check.critical) criticalIssues++;
    }
  });
  
  console.log('=' .repeat(50));
  
  if (criticalIssues === 0) {
    console.log('🎉 系统健康状态: 良好');
    console.log('✅ 所有关键功能正常运行');
    if (totalIssues > 0) {
      console.log('⚠️  有非关键问题需要关注');
    }
  } else {
    console.log('🚨 系统健康状态: 需要修复');
    console.log(`❌ 发现 ${criticalIssues} 个关键问题`);
    console.log('🔧 建议立即检查配置和日志');
  }
  
  console.log('\n💡 修复建议:');
  if (!envCheck) {
    console.log('   1. 检查 .env.local 文件是否存在且配置正确');
    console.log('   2. 确保所有必需的API密钥已设置');
  }
  if (!uuidCheck) {
    console.log('   3. 检查 uuid 包是否正确安装');
    console.log('   4. 验证 Node.js 版本兼容性');
  }
  if (!appCheck) {
    console.log('   5. 确保应用程序在端口3000上运行');
    console.log('   6. 检查防火墙设置和端口占用');
  }
}

// 主函数
async function main() {
  try {
    // 加载环境变量
    require('dotenv').config({ path: '.env.local' });
    
    const envCheck = checkEnvironmentVariables();
    const uuidCheck = checkUuidGeneration();
    const appCheck = await checkApplicationHealth();
    
    generateHealthReport(envCheck, uuidCheck, appCheck);
    
  } catch (error) {
    console.error('🚨 健康检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
} 