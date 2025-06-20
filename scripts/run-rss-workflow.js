#!/usr/bin/env node

// 🚀 自动化RSS工作流脚本
// 完整模拟RSS获取→过滤→保存流程

const fetch = require('node-fetch')

// 🎯 配置参数
const CONFIG = {
  base_url: 'http://localhost:3000',
  rss_sources: [
    {
      name: 'Hypebeast Fashion',
      url: 'https://hypebeast.com/feed',
      keywords: ['labubu', 'pop mart', 'collectible', 'lisa', 'blackpink']
    },
    {
      name: 'Toy News International',
      url: 'https://feeds.feedburner.com/ToyNewsInternational', 
      keywords: ['collectible', 'figure', 'toy', 'blind box']
    }
  ],
  labubu_keywords: [
    'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
    'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
    'collectible', 'designer toy', '收藏', '限量', 'limited edition'
  ]
}

// 🔍 检查Labubu相关性
function isLabubuRelated(text) {
  const lowerText = text.toLowerCase()
  return CONFIG.labubu_keywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
}

// 📄 标准化内容格式
function standardizeContent(item, sourceName) {
  return {
    title: item.title || '无标题',
    content: item.content || item.description || '',
    summary: extractSummary(item.description || item.content || ''),
    author: item.author || sourceName,
    originalUrl: item.link || item.guid || '',
    publishedAt: new Date(item.pubDate || Date.now()),
    imageUrls: extractImages(item.content || item.description || ''),
    tags: extractTags(item.title + ' ' + (item.description || '')),
    category: categorizeContent(item.title + ' ' + (item.description || '')),
    platform: sourceName,
    engagement: {
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 2000)
    }
  }
}

// 🔧 辅助函数
function extractSummary(content) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > 200 ? text.substring(0, 200) + '...' : text
}

function extractImages(content) {
  if (!content) return []
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const matches = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push(match[1])
  }
  return matches.slice(0, 3)
}

function extractTags(text) {
  const tags = []
  CONFIG.labubu_keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  })
  return [...new Set(tags)]
}

function categorizeContent(text) {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('lisa') || lowerText.includes('blackpink')) return '明星动态'
  if (lowerText.includes('穿搭') || lowerText.includes('outfit')) return '穿搭分享'
  if (lowerText.includes('新品') || lowerText.includes('new')) return '新品发布'
  if (lowerText.includes('收藏') || lowerText.includes('collection')) return '收藏攻略'
  if (lowerText.includes('价格') || lowerText.includes('price')) return '市场动态'
  return '其他资讯'
}

// 📡 获取RSS内容
async function fetchRSSContent(source) {
  console.log(`\n📡 获取RSS内容: ${source.name}`)
  
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    
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
    
    return relevantItems.map(item => standardizeContent(item, source.name))
    
  } catch (error) {
    console.log(`❌ ${source.name}: 获取失败 - ${error.message}`)
    return []
  }
}

// 🚀 发送到工作流解析API
async function sendToWorkflowAPI(allContent) {
  console.log(`\n🚀 发送数据到工作流解析API...`)
  
  const workflowData = {
    source: {
      type: 'webhook',
      metadata: {
        workflow_id: 'rss-auto-workflow',
        source_platform: 'rss',
        collected_at: new Date().toISOString()
      }
    },
    batch_data: allContent
  }
  
  try {
    const response = await fetch(`${CONFIG.base_url}/api/test-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ 工作流解析成功!`)
      console.log(`   📊 解析数量: ${result.data.total_parsed}`)
      console.log(`   💾 保存数量: ${result.data.successfully_saved}`)
      console.log(`   🕐 处理时间: ${result.data.processed_at}`)
      console.log(`   🧪 测试模式: ${result.data.test_mode}`)
    } else {
      console.log(`❌ 工作流解析失败: ${result.error}`)
    }
    
    return result
    
  } catch (error) {
    console.log(`❌ API调用失败: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// 📊 检查结果状态
async function checkResults() {
  console.log(`\n📊 检查处理结果...`)
  
  try {
    const response = await fetch(`${CONFIG.base_url}/api/test-workflow`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ 状态检查成功!`)
      console.log(`   📈 总文章数: ${result.data.total_articles}`)
      console.log(`   🕐 最后更新: ${result.data.last_updated}`)
      
      if (result.data.recent_articles.length > 0) {
        console.log(`   📄 最近文章:`)
        result.data.recent_articles.forEach((article, index) => {
          console.log(`      ${index + 1}. ${article.title}`)
          console.log(`         平台: ${article.platform}`)
          console.log(`         标签: ${article.tags?.join(', ') || '无'}`)
        })
      }
    } else {
      console.log(`❌ 状态检查失败: ${result.error}`)
    }
    
    return result
    
  } catch (error) {
    console.log(`❌ 状态检查调用失败: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// 🎯 主执行函数
async function main() {
  console.log('🎯 启动自动化RSS工作流...')
  console.log(`🌐 目标服务器: ${CONFIG.base_url}`)
  console.log(`📡 RSS源数量: ${CONFIG.rss_sources.length}`)
  
  const allContent = []
  
  // 📡 获取所有RSS源内容
  for (const source of CONFIG.rss_sources) {
    const content = await fetchRSSContent(source)
    allContent.push(...content)
    
    // 间隔1秒，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 RSS获取总结:`)
  console.log(`   总获取内容: ${allContent.length} 条`)
  
  if (allContent.length === 0) {
    console.log(`⚠️ 未获取到相关内容，可能需要调整关键词或RSS源`)
    return
  }
  
  // 🚀 发送到工作流API
  const apiResult = await sendToWorkflowAPI(allContent)
  
  if (apiResult.success) {
    // 📊 等待2秒后检查结果
    await new Promise(resolve => setTimeout(resolve, 2000))
    await checkResults()
  }
  
  console.log(`\n✅ 自动化RSS工作流完成!`)
  console.log(`\n📋 下一步操作:`)
  console.log(`   1. 访问 http://localhost:3000/labubu-news 查看新内容`)
  console.log(`   2. 配置 Google Sheets 或 Notion 工作流`)
  console.log(`   3. 设置定时任务自动执行此脚本`)
}

// 🎯 错误处理
main().catch(error => {
  console.error('❌ 自动化工作流失败:', error)
  process.exit(1)
}) 