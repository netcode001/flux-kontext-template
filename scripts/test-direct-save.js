#!/usr/bin/env node

// 🧪 直接数据库保存测试
// 验证RSS数据能否正确保存到labubu_news表

const fetch = require('node-fetch')

// 🎯 测试数据
const testContent = {
  title: "RSS工作流测试：Labubu收藏新趋势",
  content: "这是一条测试RSS工作流的内容，包含了Labubu相关的收藏和趋势信息。",
  summary: "RSS工作流测试内容摘要",
  author: "RSS测试系统",
  source_name: "rss-test-system",
  source_type: "rss",
  original_url: `https://test.example.com/rss-${Date.now()}`,
  published_at: new Date().toISOString(),
  image_urls: ["https://picsum.photos/600/400?random=999"],
  tags: ["labubu", "rss", "test"],
  category: "其他资讯",
  hot_score: 85.5,
  like_count: 50,
  share_count: 20,
  comment_count: 10,
  view_count: 500,
  status: "approved"
}

// 🔧 直接调用Supabase API测试
async function testDirectSave() {
  console.log('🧪 开始直接数据库保存测试...')
  
  const workflowData = {
    source: {
      type: 'webhook',
      metadata: {
        workflow_id: 'direct-test-workflow',
        source_platform: 'rss',
        collected_at: new Date().toISOString()
      }
    },
    batch_data: [testContent]
  }
  
  try {
    console.log('📤 发送测试数据到API...')
    console.log('📄 测试数据:', JSON.stringify(testContent, null, 2))
    
    const response = await fetch('http://localhost:3000/api/test-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API调用成功!')
      console.log('📊 解析数量:', result.data.total_parsed)
      console.log('💾 保存数量:', result.data.successfully_saved)
      
      if (result.data.successfully_saved > 0) {
        console.log('🎉 数据保存成功!')
        
        // 🔍 验证数据是否真的保存了
        await new Promise(resolve => setTimeout(resolve, 2000))
        await verifyDataSaved()
      } else {
        console.log('❌ 数据保存失败，保存数量为0')
      }
    } else {
      console.log('❌ API调用失败:', result.error)
      if (result.details) {
        console.log('📄 错误详情:', result.details)
      }
    }
    
  } catch (error) {
    console.error('🚨 测试失败:', error.message)
  }
}

// 🔍 验证数据是否保存成功
async function verifyDataSaved() {
  console.log('\n🔍 验证数据是否保存到数据库...')
  
  try {
    const response = await fetch('http://localhost:3000/api/test-workflow')
    const result = await response.json()
    
    if (result.success) {
      console.log('📈 数据库中总文章数:', result.data.total_articles)
      
      if (result.data.recent_articles.length > 0) {
        console.log('📄 最新文章列表:')
        result.data.recent_articles.forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.title}`)
          console.log(`      来源: ${article.source_name}`)
          console.log(`      创建时间: ${article.created_at}`)
        })
        
        // 检查是否包含我们的测试数据
        const hasTestData = result.data.recent_articles.some(article => 
          article.title.includes('RSS工作流测试')
        )
        
        if (hasTestData) {
          console.log('🎉 找到测试数据，保存验证成功!')
        } else {
          console.log('⚠️ 未找到测试数据，可能保存失败')
        }
      } else {
        console.log('❌ 数据库中没有找到任何文章')
      }
    } else {
      console.log('❌ 验证请求失败:', result.error)
    }
    
  } catch (error) {
    console.error('🚨 验证失败:', error.message)
  }
}

// 🚀 主执行函数
async function main() {
  console.log('🎯 开始RSS数据库保存测试')
  console.log('🌐 目标API: http://localhost:3000/api/test-workflow')
  console.log('')
  
  await testDirectSave()
  
  console.log('\n✅ 测试完成!')
}

main().catch(error => {
  console.error('❌ 主程序执行失败:', error)
  process.exit(1)
}) 