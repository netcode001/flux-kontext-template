#!/usr/bin/env node

/**
 * 🎥 YouTube数据集成测试脚本
 * 测试YouTube API集成和数据转换功能
 */

const fs = require('fs');
const path = require('path');

// 测试YouTube API集成
async function testYouTubeIntegration() {
  console.log('🎥 开始测试YouTube数据集成...\n');

  try {
    // 1. 测试API配置
    console.log('1️⃣ 测试API配置...');
    const response = await fetch('http://localhost:3000/api/debug/media-api-status');
    const apiStatus = await response.json();
    
    if (apiStatus.success && apiStatus.youtube?.configured) {
      console.log('✅ YouTube API配置正常');
      console.log(`   密钥状态: ${apiStatus.youtube.key_status}`);
    } else {
      console.log('❌ YouTube API配置异常');
      return;
    }

    // 2. 测试数据获取
    console.log('\n2️⃣ 测试YouTube数据获取...');
    const crawlerResponse = await fetch('http://localhost:3000/api/admin/youtube-crawler?maxResults=5&days=7');
    const crawlerData = await crawlerResponse.json();

    if (crawlerData.success) {
      console.log('✅ 数据获取成功');
      console.log(`   获取视频数量: ${crawlerData.data.count}`);
      console.log(`   配额使用: ${crawlerData.data.quota.used}`);
      console.log(`   剩余配额: ${crawlerData.data.quota.remaining}`);
      
      // 显示前3个视频信息
      console.log('\n📹 获取到的视频样例:');
      crawlerData.data.videos.slice(0, 3).forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title}`);
        console.log(`      频道: ${video.author}`);
        console.log(`      观看量: ${video.view_count?.toLocaleString() || 'N/A'}`);
        console.log(`      热度分数: ${video.hot_score}`);
        console.log(`      发布时间: ${new Date(video.published_at).toLocaleDateString('zh-CN')}`);
        console.log(`      链接: ${video.url}\n`);
      });

    } else {
      console.log('❌ 数据获取失败:', crawlerData.error);
      return;
    }

    // 3. 测试手动触发
    console.log('3️⃣ 测试手动数据获取...');
    const manualResponse = await fetch('http://localhost:3000/api/admin/youtube-crawler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxResults: 3,
        order: 'viewCount',
        days: 30,
        saveToDatabase: false,
      }),
    });

    const manualData = await manualResponse.json();

    if (manualData.success) {
      console.log('✅ 手动获取成功');
      console.log(`   获取数量: ${manualData.data.fetched}`);
      console.log(`   配额使用: ${manualData.data.quota_used}`);
      
      // 显示统计信息
      const summary = manualData.data.summary;
      console.log('\n📊 数据统计:');
      console.log(`   总观看量: ${summary.total_views.toLocaleString()}`);
      console.log(`   总点赞数: ${summary.total_likes.toLocaleString()}`);
      console.log(`   总评论数: ${summary.total_comments.toLocaleString()}`);
      console.log(`   平均热度: ${summary.avg_hot_score}`);
      
      console.log('\n🏆 热门频道:');
      summary.top_channels.forEach((channel, index) => {
        console.log(`   ${index + 1}. ${channel.name}`);
        console.log(`      视频数: ${channel.videos}`);
        console.log(`      总观看量: ${channel.total_views.toLocaleString()}`);
      });

    } else {
      console.log('❌ 手动获取失败:', manualData.error);
    }

    console.log('\n🎉 YouTube数据集成测试完成!');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testYouTubeIntegration().catch(console.error);
}

module.exports = { testYouTubeIntegration }; 