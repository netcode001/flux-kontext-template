// 🔍 检查和清理模拟数据脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMockData() {
  try {
    console.log('🔍 检查数据库中的文章...')
    
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, title, original_url, image_urls, source_id')
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('❌ 查询失败:', error)
      return
    }
    
    console.log(`📊 总共 ${articles.length} 篇文章`)
    console.log('')
    
    const mockUrls = [
      'example.com',
      'instagram.com/p/example',
      'xiaohongshu.com/explore/example',
      'weibo.com/example'
    ]
    
    let mockCount = 0
    let validCount = 0
    const mockArticles = []
    
    articles.forEach((article, index) => {
      const isMockUrl = mockUrls.some(mockUrl => 
        article.original_url && article.original_url.includes(mockUrl)
      )
      
      const hasValidUrl = article.original_url && 
                         article.original_url.startsWith('http') && 
                         !isMockUrl
      
      const hasImages = article.image_urls && article.image_urls.length > 0
      
      console.log(`${index + 1}. ${article.title}`)
      console.log(`   URL: ${article.original_url}`)
      console.log(`   有效链接: ${hasValidUrl ? '✅' : '❌'}`)
      console.log(`   有图片: ${hasImages ? '✅' : '❌'}`)
      
      if (!hasValidUrl || isMockUrl) {
        mockCount++
        mockArticles.push(article)
        console.log(`   🗑️ 标记为模拟数据`)
      } else {
        validCount++
      }
      console.log('')
    })
    
    console.log(`📈 统计结果:`)
    console.log(`   - 有效文章: ${validCount} 篇`)
    console.log(`   - 模拟数据: ${mockCount} 篇`)
    console.log('')
    
    if (mockCount > 0) {
      console.log('🗑️ 发现模拟数据，将被清理:')
      mockArticles.forEach(article => {
        console.log(`   - ${article.title}`)
      })
    }
    
    return { mockArticles, validCount, mockCount }
    
  } catch (error) {
    console.error('🚨 检查失败:', error)
  }
}

// 执行检查
checkMockData() 