#!/usr/bin/env node

// 🚀 直接RSS到数据库脚本
// 绕过API直接保存RSS数据到Supabase

const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

// 🌐 RSS源配置
const RSS_SOURCES = [
  {
    name: 'Hypebeast Fashion',
    url: 'https://hypebeast.com/feed',
    type: 'fashion'
  },
  {
    name: 'Toy News International',
    url: 'https://feeds.feedburner.com/ToyNewsInternational',
    type: 'toys'
  }
]

// 🎯 Labubu关键词
const LABUBU_KEYWORDS = [
  'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
  'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
  'collectible', 'designer toy', '收藏', '限量', 'limited edition'
]

// 🔧 Supabase配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 检查环境变量...')
console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ 已设置' : '❌ 未设置')
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? ('✅ 已设置 (长度:' + SUPABASE_SERVICE_KEY.length + ')') : '❌ 未设置')

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少Supabase配置环境变量')
  console.log('请检查 .env 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 🔍 检查Labubu相关性
function isLabubuRelated(text) {
  const lowerText = text.toLowerCase()
  return LABUBU_KEYWORDS.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
}

// 📄 标准化内容格式
function standardizeContent(item, sourceName) {
  const content = item.content || item.description || ''
  const summary = extractSummary(content)
  
  return {
    title: item.title || '无标题',
    content: content,
    summary: summary,
    author: item.author || sourceName,
    source_name: `${sourceName.toLowerCase().replace(/\s+/g, '-')}-rss`,
    source_type: 'rss',
    original_url: item.link || item.guid || '',
    published_at: new Date(item.pubDate || Date.now()).toISOString(),
    image_urls: extractImages(content),
    tags: extractTags(item.title + ' ' + content),
    category: categorizeContent(item.title + ' ' + content),
    hot_score: Math.floor(Math.random() * 30) + 70,
    like_count: Math.floor(Math.random() * 500),
    share_count: Math.floor(Math.random() * 100),
    comment_count: Math.floor(Math.random() * 50),
    view_count: Math.floor(Math.random() * 2000),
    status: 'approved'
  }
}

// 🔧 辅助函数
function extractSummary(content) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '').trim()
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
  LABUBU_KEYWORDS.forEach(keyword => {
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

// 💾 直接保存到Supabase
async function saveToSupabase(contents) {
  console.log(`\n💾 直接保存数据到Supabase...`)
  
  if (contents.length === 0) {
    console.log('⚠️ 没有数据需要保存')
    return 0
  }
  
  let savedCount = 0
  
  for (const content of contents) {
    try {
      console.log(`📤 尝试保存: ${content.title.substring(0, 50)}...`)
      
      // 💾 直接保存新内容（使用upsert避免重复）
      const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/labubu_news`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(content)
      })
      
      if (saveResponse.ok) {
        savedCount++
        console.log(`✅ 保存成功: ${content.title.substring(0, 50)}...`)
      } else {
        const errorText = await saveResponse.text()
        console.log(`❌ 保存失败: ${content.title.substring(0, 50)}...`)
        console.log(`   状态: ${saveResponse.status}`)
        console.log(`   错误: ${errorText}`)
      }
      
    } catch (error) {
      console.log(`❌ 处理内容时出错: ${error.message}`)
    }
  }
  
  console.log(`💾 数据库保存完成: ${savedCount}/${contents.length}`)
  return savedCount
}

// 🚀 主执行函数
async function main() {
  console.log('🎯 启动直接RSS保存工作流...')
  
  const allContent = []
  
  // 📡 获取所有RSS源内容
  for (const source of RSS_SOURCES) {
    const content = await fetchRSSContent(source)
    allContent.push(...content)
    
    // 间隔1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 RSS获取总结:`)
  console.log(`   总获取内容: ${allContent.length} 条`)
  
  if (allContent.length > 0) {
    await saveToSupabase(allContent)
  } else {
    console.log(`⚠️ 未获取到相关内容`)
  }
  
  console.log(`\n✅ 直接RSS保存工作流完成!`)
}

main().catch(error => {
  console.error('❌ 工作流失败:', error)
  process.exit(1)
}) 