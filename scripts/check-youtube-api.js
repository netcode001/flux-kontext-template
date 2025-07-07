#!/usr/bin/env node

/**
 * 🎥 YouTube API 配置检查工具
 * 用于诊断 YouTube API 配置问题
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function getYouTubeAPIKey() {
  // 从环境变量获取
  if (process.env.YOUTUBE_API_KEY) {
    return process.env.YOUTUBE_API_KEY;
  }
  
  // 从 .env.local 文件获取
  try {
    const envFile = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const match = envContent.match(/YOUTUBE_API_KEY=(.+)/);
      if (match) {
        return match[1].replace(/"/g, '').trim();
      }
    }
  } catch (error) {
    console.warn('无法读取 .env.local 文件');
  }
  
  return null;
}

async function checkYouTubeAPI() {
  console.log('\n🎥 YouTube API 配置检查工具');
  console.log('='.repeat(50));

  // 检查配置
  const apiKey = getYouTubeAPIKey();
  
  console.log('\n📋 配置信息:');
  console.log(`API密钥: ${apiKey ? '✅ 已配置 (长度: ' + apiKey.length + ')' : '❌ 未配置'}`);
  console.log(`每日配额: 10000 (标准免费配额)`);
  console.log(`搜索成本: 100 units per request`);
  console.log(`视频成本: 1 unit per request`);

  if (!apiKey) {
    log(colors.red, '❌', '错误：YouTube API密钥未配置');
    console.log('\n🔧 解决方案:');
    console.log('1. 获取 YouTube Data API v3 密钥：https://console.cloud.google.com/');
    console.log('2. 设置环境变量：export YOUTUBE_API_KEY="your_api_key"');
    console.log('3. 或在 .env.local 文件中添加：YOUTUBE_API_KEY=your_api_key');
    console.log('4. 或在 Cloudflare Workers 中配置环境变量');
    return false;
  }

  // 测试 API 连接
  console.log('\n🔍 测试API连接...');
  
  try {
    const testResult = await testYouTubeAPI(apiKey);
    
    if (testResult.success) {
      log(colors.green, '✅', `API连接成功！配额状态: ${testResult.quotaStatus}`);
      console.log(`   找到 ${testResult.itemsFound} 个测试视频`);
      return true;
    } else {
      log(colors.red, '❌', `API连接失败: ${testResult.error}`);
      
      // 提供具体的错误解决建议
      if (testResult.error.includes('API_KEY_INVALID') || testResult.error.includes('invalid')) {
        console.log('\n🔧 解决方案:');
        console.log('1. 检查API密钥是否正确');
        console.log('2. 确保已启用 YouTube Data API v3');
        console.log('3. 检查API密钥的使用限制');
      } else if (testResult.error.includes('quotaExceeded')) {
        console.log('\n🔧 解决方案:');
        console.log('1. 当前API配额已用完');
        console.log('2. 等待配额重置（UTC时间每日重置）');
        console.log('3. 考虑升级到付费计划');
      }
      
      return false;
    }
  } catch (error) {
    log(colors.red, '❌', `测试失败: ${error.message}`);
    return false;
  }
}

async function testYouTubeAPI(apiKey) {
  return new Promise((resolve) => {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&type=video&key=${apiKey}`;
    
    https.get(testUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            resolve({
              success: false,
              error: response.error.message
            });
          } else {
            resolve({
              success: true,
              quotaStatus: '正常',
              itemsFound: response.items?.length || 0
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: '解析响应失败'
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
}

// 主函数
async function main() {
  try {
    const success = await checkYouTubeAPI();
    
    console.log('\n' + '=' * 50);
    if (success) {
      log(colors.green, '🎉', 'YouTube API 配置检查完成 - 一切正常！');
    } else {
      log(colors.red, '💥', 'YouTube API 配置检查完成 - 存在问题需要修复');
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(colors.red, '💥', `检查过程出错: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkYouTubeAPI, testYouTubeAPI }; 