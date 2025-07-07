#!/usr/bin/env node

/**
 * 🔍 Google Analytics 环境变量检查工具
 */

const fs = require('fs');

function checkEnvFile() {
  console.log('🔍 检查 .env.local 中的 Google Analytics 配置...\n');
  
  if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local 文件不存在');
    return false;
  }
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  // 查找Google Analytics ID配置
  const gaLine = lines.find(line => line.includes('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'));
  
  if (!gaLine) {
    console.log('❌ 未找到 NEXT_PUBLIC_GOOGLE_ANALYTICS_ID 配置');
    return false;
  }
  
  console.log(`📋 当前配置：${gaLine}`);
  
  const match = gaLine.match(/NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="([^"]+)"/);
  if (!match) {
    console.log('❌ 配置格式错误');
    return false;
  }
  
  const currentId = match[1];
  
  if (currentId === 'G-CDFP2QCPB7') {
    console.log('✅ Google Analytics ID 配置正确！');
    console.log('\n🚀 现在可以重新部署：npm run cf:deploy');
    return true;
  } else if (currentId === 'G-XXXXXXXXXX') {
    console.log('❌ 仍然是占位符，需要手动更新');
    console.log('\n🔧 请按照以下步骤修改：');
    console.log('1. 打开 .env.local 文件');
    console.log('2. 找到这一行：NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"');
    console.log('3. 改为：NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-CDFP2QCPB7"');
    console.log('4. 保存文件后重新运行此脚本');
    return false;
  } else {
    console.log(`⚠️ 当前ID是 ${currentId}，应该是 G-CDFP2QCPB7`);
    return false;
  }
}

// 运行检查
checkEnvFile(); 