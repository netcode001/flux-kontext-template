// 🗑️ 清理模拟数据脚本
// 删除没有真实链接的测试内容

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanMockData() {
  try {
    console.log('🗑️ 开始清理模拟数据...')
    
    // 🔍 查询所有文章
    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, original_url, image_urls')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 找到 ${articles.length} 篇文章`)

    // 🎯 定义模拟数据的特征
    const mockUrlPatterns = [
      'example.com',
      'instagram.com/p/example',
      'xiaohongshu.com/explore/example',
      'weibo.com/example'
    ]

    let deletedCount = 0
    let keptCount = 0

    // 🔍 检查每篇文章是否为模拟数据
    for (const article of articles) {
      const isMockUrl = mockUrlPatterns.some(pattern => 
        article.original_url && article.original_url.includes(pattern)
      )
      
      const hasValidUrl = article.original_url && 
                         article.original_url.startsWith('http') && 
                         !isMockUrl

      if (!hasValidUrl || isMockUrl || !article.original_url) {
        // 删除模拟数据
        const { error: deleteError } = await supabase
          .from('news_articles')
          .delete()
          .eq('id', article.id)

        if (deleteError) {
          console.error(`❌ 删除文章失败: ${article.title}`, deleteError)
        } else {
          console.log(`🗑️ 删除模拟数据: ${article.title}`)
          deletedCount++
        }
      } else {
        console.log(`✅ 保留有效文章: ${article.title}`)
        keptCount++
      }
    }

    // 🧹 清理无用的新闻来源
    console.log('🧹 清理无用的新闻来源...')
    
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, name')

    if (!sourcesError && sources) {
      for (const source of sources) {
        // 检查是否还有文章使用这个来源
        const { data: articlesCount } = await supabase
          .from('news_articles')
          .select('id', { count: 'exact' })
          .eq('source_id', source.id)

        if (!articlesCount || articlesCount.length === 0) {
          // 删除无用的来源
          await supabase
            .from('news_sources')
            .delete()
            .eq('id', source.id)
          
          console.log(`🗑️ 删除无用来源: ${source.name}`)
        }
      }
    }

    console.log('\n✅ 清理完成!')
    console.log(`📊 统计结果:`)
    console.log(`   - 删除模拟数据: ${deletedCount} 篇`)
    console.log(`   - 保留有效文章: ${keptCount} 篇`)
    console.log(`   - 清理比例: ${((deletedCount / (deletedCount + keptCount)) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('🚨 清理失败:', error)
    process.exit(1)
  }
}

// 执行清理
cleanMockData() 