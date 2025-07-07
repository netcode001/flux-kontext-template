#!/usr/bin/env node

/**
 * 🔧 Google Analytics 配置修复脚本
 * 用于验证和修复 Google Analytics 配置问题
 */

const fs = require('fs');
const { execSync } = require('child_process');

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

function checkEnvFile() {
  console.log('\n🔍 检查环境变量配置...');
  
  if (!fs.existsSync('.env.local')) {
    log(colors.red, '❌', '.env.local 文件不存在');
    return false;
  }
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const gaIdMatch = envContent.match(/NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="([^"]+)"/);
  
  if (!gaIdMatch) {
    log(colors.red, '❌', '未找到 NEXT_PUBLIC_GOOGLE_ANALYTICS_ID 配置');
    return false;
  }
  
  const currentId = gaIdMatch[1];
  log(colors.blue, '📋', `当前 Google Analytics ID: ${currentId}`);
  
  if (currentId === 'G-CDFP2QCPB7') {
    log(colors.green, '✅', 'Google Analytics ID 已正确配置');
    return true;
  } else if (currentId === 'G-XXXXXXXXXX') {
    log(colors.red, '❌', 'Google Analytics ID 仍为占位符，需要手动更新');
    return false;
  } else {
    log(colors.yellow, '⚠️', `Google Analytics ID 为 ${currentId}，不是期望的 G-CDFP2QCPB7`);
    return false;
  }
}

async function deployAndVerify() {
  console.log('\n🚀 开始重新部署...');
  
  try {
    // 清理构建缓存
    log(colors.yellow, '🧹', '清理构建缓存...');
    execSync('rm -rf .next .open-next', { stdio: 'inherit' });
    
    // 重新构建和部署
    log(colors.blue, '🔨', '重新构建和部署...');
    execSync('npm run cf:deploy', { stdio: 'inherit' });
    
    log(colors.green, '✅', '部署完成！');
    
    // 验证部署结果
    console.log('\n🔍 验证部署结果...');
    
    // 等待几秒让部署生效
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查网站是否包含正确的 Google Analytics ID
    const { execSync: execSyncQuiet } = require('child_process');
    try {
      const result = execSyncQuiet('curl -s "https://labubu.hot/" | grep -o "G-CDFP2QCPB7"', { encoding: 'utf8' });
      if (result.trim() === 'G-CDFP2QCPB7') {
        log(colors.green, '✅', '网站已正确加载 Google Analytics ID: G-CDFP2QCPB7');
        log(colors.green, '🎉', 'Google Analytics 配置修复完成！');
        
        console.log('\n📊 现在可以返回 Google Analytics 控制台，数据应该开始收集了。');
        console.log('🔗 网站地址: https://labubu.hot');
        console.log('📈 Google Analytics ID: G-CDFP2QCPB7');
        
        return true;
      } else {
        log(colors.red, '❌', '网站仍未加载正确的 Google Analytics ID');
        return false;
      }
    } catch (error) {
      log(colors.red, '❌', '验证失败：' + error.message);
      return false;
    }
    
  } catch (error) {
    log(colors.red, '❌', '部署失败：' + error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Google Analytics 配置修复工具');
  console.log('=' * 50);
  
  // 检查环境变量配置
  if (!checkEnvFile()) {
    console.log('\n❌ 环境变量配置有问题，请按照以下步骤手动修复：');
    console.log('1. 打开 .env.local 文件');
    console.log('2. 找到 NEXT_PUBLIC_GOOGLE_ANALYTICS_ID 这一行');
    console.log('3. 改为：NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-CDFP2QCPB7"');
    console.log('4. 保存文件后重新运行此脚本');
    process.exit(1);
  }
  
  // 环境变量正确，开始部署
  const success = await deployAndVerify();
  
  if (success) {
    console.log('\n🎉 修复完成！Google Analytics 已正确配置。');
    process.exit(0);
  } else {
    console.log('\n❌ 修复失败，请检查错误信息。');
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败：', error);
  process.exit(1);
}); 