#!/usr/bin/env node

// 🧪 RSS工作流测试脚本
// 测试RSS源获取、过滤、解析功能

const fetch = require('node-fetch')

// 🌐 测试RSS源配置
const RSS_SOURCES = [
  {
    name: 'Hypebeast',
    url: 'https://hypebeast.com/feed',
    type: 'fashion'
  },
  {
    name: 'Toy News International', 
    url: 'https://feeds.feedburner.com/ToyNewsInternational',
    type: 'toys'
  },
  {
    name: 'RSS2JSON API (测试)',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://hypebeast.com/feed',
    type: 'api'
  }
]

// 🎯 Labubu相关关键词
const LABUBU_KEYWORDS = [
  'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
  'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
  'collectible', 'designer toy', '收藏', '限量', 'limited edition'
]

// 🔍 检查内容是否与Labubu相关
function isLabubuRelated(text) {
  const lowerText = text.toLowerCase()
  return LABUBU_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
}

// 📊 测试RSS源获取
async function testRSSSource(source) {
  console.log(`\n🔍 测试RSS源: ${source.name}`)
  console.log(`📡 URL: ${source.url}`)
  
  try {
    let response, data
    
    if (source.type === 'api') {
      // 直接调用RSS2JSON API
      response = await fetch(source.url)
      data = await response.json()
    } else {
      // 通过RSS2JSON服务解析
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
      response = await fetch(apiUrl)
      data = await response.json()
    }
    
    if (!data.items || data.items.length === 0) {
      console.log(`❌ ${source.name}: 无数据返回`)
      return []
    }
    
    console.log(`✅ ${source.name}: 获取到 ${data.items.length} 条数据`)
    
    // 🎯 过滤Labubu相关内容
    const relevantItems = data.items.filter(item => {
      const text = (item.title || '') + ' ' + (item.description || item.content || '')
      return isLabubuRelated(text)
    })
    
    console.log(`🎯 ${source.name}: 过滤后相关内容 ${relevantItems.length} 条`)
    
    // 📄 显示相关内容示例
    if (relevantItems.length > 0) {
      console.log(`📄 示例内容:`)
      relevantItems.slice(0, 2).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title}`)
        console.log(`      🔗 ${item.link}`)
        console.log(`      📅 ${item.pubDate}`)
      })
    }
    
    return relevantItems.map(item => ({
      title: item.title || '无标题',
      content: item.content || item.description || '',
      summary: extractSummary(item.description || item.content || ''),
      author: item.author || source.name,
      originalUrl: item.link || item.guid || '',
      publishedAt: new Date(item.pubDate || Date.now()),
      imageUrls: extractImages(item.content || item.description || ''),
      tags: extractTags(item.title + ' ' + (item.description || '')),
      category: categorizeContent(item.title + ' ' + (item.description || '')),
      platform: source.name,
      source: source.name
    }))
    
  } catch (error) {
    console.log(`❌ ${source.name}: 获取失败 - ${error.message}`)
    return []
  }
}

// 🔧 提取摘要
function extractSummary(content) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '') // 移除HTML标签
  return text.length > 200 ? text.substring(0, 200) + '...' : text
}

// 🖼️ 提取图片URL
function extractImages(content) {
  if (!content) return []
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const matches = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push(match[1])
  }
  return matches.slice(0, 3) // 最多3张图片
}

// 🏷️ 提取标签
function extractTags(text) {
  const tags = []
  LABUBU_KEYWORDS.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  })
  return [...new Set(tags)] // 去重
}

// 📂 内容分类
function categorizeContent(text) {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('lisa') || lowerText.includes('blackpink')) return '明星动态'
  if (lowerText.includes('穿搭') || lowerText.includes('outfit') || lowerText.includes('style')) return '穿搭分享'
  if (lowerText.includes('新品') || lowerText.includes('new') || lowerText.includes('release')) return '新品发布'
  if (lowerText.includes('收藏') || lowerText.includes('collection') || lowerText.includes('collectible')) return '收藏攻略'
  if (lowerText.includes('价格') || lowerText.includes('price') || lowerText.includes('cost')) return '市场动态'
  return '其他资讯'
}

// 📊 生成测试数据供API解析
function generateTestData(allContent) {
  const testData = {
    source: {
      type: 'webhook',
      metadata: {
        workflow_id: 'rss-test-workflow',
        source_platform: 'rss',
        collected_at: new Date().toISOString()
      }
    },
    batch_data: allContent.map(item => ({
      title: item.title,
      content: item.content,
      summary: item.summary,
      author: item.author,
      originalUrl: item.originalUrl,
      publishedAt: item.publishedAt,
      imageUrls: item.imageUrls,
      tags: item.tags,
      category: item.category,
      platform: item.platform,
      engagement: {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 5000)
      }
    }))
  }
  
  return testData
}

// 🚀 主测试函数
async function main() {
  console.log('🧪 开始RSS工作流测试...\n')
  
  const allContent = []
  
  // 📡 测试所有RSS源
  for (const source of RSS_SOURCES) {
    const content = await testRSSSource(source)
    allContent.push(...content)
    
    // 间隔1秒，避免频率过高
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 测试总结:`)
  console.log(`   总共获取: ${allContent.length} 条Labubu相关内容`)
  
  if (allContent.length > 0) {
    console.log(`   分类统计:`)
    const categories = {}
    allContent.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1
    })
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} 条`)
    })
    
    // 📊 生成测试数据
    const testData = generateTestData(allContent)
    
    console.log(`\n📄 生成的测试数据预览:`)
    console.log(`   数据格式: ${testData.source.type}`)
    console.log(`   内容数量: ${testData.batch_data.length} 条`)
    console.log(`   工作流ID: ${testData.source.metadata.workflow_id}`)
    
    // 保存测试数据到文件
    const fs = require('fs')
    fs.writeFileSync('rss-test-data.json', JSON.stringify(testData, null, 2))
    console.log(`   📁 测试数据已保存到: rss-test-data.json`)
    
    console.log(`\n🚀 可以使用以下命令测试解析API:`)
    console.log(`   curl -X POST http://localhost:3000/api/parse-content \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \\`)
    console.log(`     -d @rss-test-data.json`)
  }
  
  console.log(`\n✅ RSS工作流测试完成!`)
}

// 🎯 错误处理
main().catch(error => {
  console.error('❌ 测试失败:', error)
  process.exit(1)
}) 