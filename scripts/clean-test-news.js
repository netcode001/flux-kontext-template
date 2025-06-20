// 🧹 清理测试新闻数据脚本
// 删除无关的测试内容，只保留Labubu相关内容

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanTestNews() {
  try {
    console.log('🧹 开始清理测试新闻数据...')

    // 🔍 查询所有新闻文章
    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, content, tags')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 找到 ${articles.length} 篇文章`)

    // 🎯 Labubu相关关键词
    const labubuKeywords = [
      'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
      'lisa', 'blackpink', '盲盒', '手办', '收藏', '限量'
    ]

    let deletedCount = 0
    let keptCount = 0

    // 🔍 检查每篇文章是否与Labubu相关
    for (const article of articles) {
      const text = (article.title + ' ' + (article.content || '') + ' ' + (article.tags || []).join(' ')).toLowerCase()
      
      // 检查是否包含Labubu相关关键词
      const isLabubuRelated = labubuKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      )

      if (!isLabubuRelated) {
        // 删除无关文章
        const { error: deleteError } = await supabase
          .from('news_articles')
          .delete()
          .eq('id', article.id)

        if (deleteError) {
          console.error(`❌ 删除文章失败: ${article.title}`, deleteError)
        } else {
          console.log(`🗑️ 删除无关文章: ${article.title}`)
          deletedCount++
        }
      } else {
        console.log(`✅ 保留相关文章: ${article.title}`)
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

    // 🔥 清理无关的热搜关键词
    console.log('🔥 清理无关的热搜关键词...')
    
    const { data: keywords, error: keywordsError } = await supabase
      .from('trending_keywords')
      .select('id, keyword')

    if (!keywordsError && keywords) {
      for (const keyword of keywords) {
        const isLabubuRelated = labubuKeywords.some(labubuKeyword => 
          keyword.keyword.toLowerCase().includes(labubuKeyword.toLowerCase()) ||
          labubuKeyword.toLowerCase().includes(keyword.keyword.toLowerCase())
        )

        if (!isLabubuRelated) {
          await supabase
            .from('trending_keywords')
            .delete()
            .eq('id', keyword.id)
          
          console.log(`🗑️ 删除无关关键词: ${keyword.keyword}`)
        }
      }
    }

    console.log('\n✅ 清理完成!')
    console.log(`📊 统计结果:`)
    console.log(`   - 删除文章: ${deletedCount} 篇`)
    console.log(`   - 保留文章: ${keptCount} 篇`)
    console.log(`   - 清理比例: ${((deletedCount / (deletedCount + keptCount)) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('🚨 清理失败:', error)
    process.exit(1)
  }
}

// 执行清理
cleanTestNews() 