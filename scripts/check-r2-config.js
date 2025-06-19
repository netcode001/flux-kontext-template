#!/usr/bin/env node

/**
 * 🔍 R2配置检查脚本
 * 诊断R2存储连接问题
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 开始R2配置检查...\n');

// 检查环境变量
function checkR2Environment() {
  console.log('📋 R2环境变量检查:');
  
  const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID', 
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'NEXT_PUBLIC_ENABLE_R2'
  ];
  
  let allPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    const isPresent = !!value;
    const displayValue = value ? (envVar.includes('SECRET') ? '***' + value.slice(-4) : value) : 'undefined';
    
    console.log(`   ${envVar}: ${isPresent ? '✅' : '❌'} ${displayValue}`);
    if (!isPresent) allPresent = false;
  });
  
  console.log(`   总体状态: ${allPresent ? '✅ 所有R2环境变量已配置' : '❌ 缺少R2环境变量'}\n`);
  return allPresent;
}

// 检查R2连接
async function checkR2Connection() {
  console.log('📋 R2连接测试:');
  
  try {
    const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
    
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      console.log('   ❌ R2配置不完整，无法测试连接\n');
      return false;
    }
    
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      requestHandler: {
        requestTimeout: 10000,
        connectionTimeout: 5000
      }
    });
    
    console.log(`   端点: https://${accountId}.r2.cloudflarestorage.com`);
    console.log(`   存储桶: ${bucketName}`);
    console.log(`   访问密钥: ${accessKeyId.substring(0, 8)}...`);
    
    // 尝试列出对象（测试连接和权限）
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    });
    
    const response = await client.send(command);
    
    console.log(`   ✅ R2连接成功`);
    console.log(`   📋 存储桶信息:`, {
      name: response.Name,
      keyCount: response.KeyCount || 0,
      maxKeys: response.MaxKeys,
      isTruncated: response.IsTruncated
    });
    console.log('');
    
    return true;
  } catch (error) {
    console.log(`   ❌ R2连接失败:`, {
      error: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode
    });
    
    // 提供具体的错误建议
    if (error.code === 'EPROTO') {
      console.log('   💡 建议: SSL握手失败，可能是网络问题或证书问题');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   💡 建议: DNS解析失败，检查账户ID是否正确');
    } else if (error.$metadata?.httpStatusCode === 403) {
      console.log('   💡 建议: 访问被拒绝，检查访问密钥和权限');
    } else if (error.$metadata?.httpStatusCode === 404) {
      console.log('   💡 建议: 存储桶不存在，检查存储桶名称');
    }
    
    console.log('');
    return false;
  }
}

// 检查网络连接
async function checkNetworkConnectivity() {
  console.log('📋 网络连接检查:');
  
  const testUrls = [
    'https://www.cloudflare.com',
    'https://fal.media',
    'https://api.openai.com'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      console.log(`   ${url}: ✅ ${response.status}`);
    } catch (error) {
      console.log(`   ${url}: ❌ ${error.message}`);
    }
  }
  
  console.log('');
}

// 生成诊断报告
function generateDiagnosticReport(envCheck, connectionCheck) {
  console.log('📊 R2诊断报告:');
  console.log('=' .repeat(50));
  
  const issues = [];
  
  if (!envCheck) {
    issues.push('环境变量配置不完整');
  }
  
  if (!connectionCheck) {
    issues.push('R2连接失败');
  }
  
  if (issues.length === 0) {
    console.log('🎉 R2配置状态: 良好');
    console.log('✅ 所有检查项都通过');
  } else {
    console.log('🚨 R2配置状态: 需要修复');
    console.log('❌ 发现问题:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('=' .repeat(50));
  
  console.log('\n💡 修复建议:');
  if (!envCheck) {
    console.log('   1. 检查 .env.local 文件中的R2配置');
    console.log('   2. 确保所有R2环境变量都已设置');
    console.log('   3. 验证R2访问密钥的有效性');
  }
  if (!connectionCheck) {
    console.log('   4. 检查网络连接和防火墙设置');
    console.log('   5. 验证R2账户ID和存储桶名称');
    console.log('   6. 确认R2访问密钥有正确的权限');
    console.log('   7. 尝试重新生成R2访问密钥');
  }
  
  console.log('\n🔧 临时解决方案:');
  console.log('   - 设置 NEXT_PUBLIC_ENABLE_R2=false 禁用R2存储');
  console.log('   - 图片将继续使用FAL.ai的临时链接');
}

// 主函数
async function main() {
  try {
    const envCheck = checkR2Environment();
    await checkNetworkConnectivity();
    const connectionCheck = await checkR2Connection();
    
    generateDiagnosticReport(envCheck, connectionCheck);
    
  } catch (error) {
    console.error('🚨 诊断过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
} 