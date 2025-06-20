// 🗑️ 彻底清理所有模拟数据脚本
// 删除所有包含假链接、测试数据的内容

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanAllMockData() {
  try {
    console.log('🗑️ 开始彻底清理所有模拟数据...')
    
    // 🔍 查询所有文章
    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, original_url, image_urls, author')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 找到 ${articles.length} 篇文章`)

    // 🎯 定义模拟数据的特征（更严格的检查）
    const mockPatterns = [
      'example.com',
      'example123',
      'example456',
      'M_example',
      'collectiblesdaily.com',
      'designboom.com',
      'picsum.photos',
      'toynewsi.com',
      'discovery/item/65', // 小红书假链接
      'weibo.com/7654321', // 微博假链接
      'weibo.com/1234567', // 微博假链接
    ]

    // 🎯 只保留真正的官方和知名网站
    const trustedDomains = [
      'popmart.com',
      'hypebeast.com',
      'sothebys.com',
      'weibo.com/u/', // 真实微博用户链接格式
      'xiaohongshu.com/user/', // 真实小红书用户链接格式
    ]

    let deletedCount = 0
    let keptCount = 0
    const deletedArticles = []

    // 🔍 检查每篇文章
    for (const article of articles) {
      let shouldDelete = false
      let reason = ''

      // 检查是否包含模拟数据特征
      const containsMockPattern = mockPatterns.some(pattern => {
        if (article.original_url && article.original_url.includes(pattern)) {
          reason = `包含模拟链接特征: ${pattern}`
          return true
        }
        if (article.title && article.title.includes(pattern)) {
          reason = `标题包含测试内容: ${pattern}`
          return true
        }
        return false
      })

      // 检查是否为可信域名
      const isTrustedDomain = trustedDomains.some(domain => 
        article.original_url && article.original_url.includes(domain)
      )

      // 检查是否为非Labubu相关内容
      const isLabubuRelated = article.title && (
        article.title.toLowerCase().includes('labubu') ||
        article.title.toLowerCase().includes('拉布布') ||
        article.title.toLowerCase().includes('lisa')
      )

      if (containsMockPattern) {
        shouldDelete = true
      } else if (!isTrustedDomain && !isLabubuRelated) {
        shouldDelete = true
        reason = '非Labubu相关或非可信域名'
      } else if (!article.original_url || !article.original_url.startsWith('http')) {
        shouldDelete = true
        reason = '无效链接'
      }

      if (shouldDelete) {
        // 删除文章
        const { error: deleteError } = await supabase
          .from('news_articles')
          .delete()
          .eq('id', article.id)

        if (deleteError) {
          console.error(`❌ 删除文章失败: ${article.title}`, deleteError)
        } else {
          console.log(`🗑️ 删除: ${article.title}`)
          console.log(`   原因: ${reason}`)
          console.log(`   链接: ${article.original_url}`)
          deletedCount++
          deletedArticles.push({ title: article.title, reason, url: article.original_url })
        }
      } else {
        console.log(`✅ 保留: ${article.title}`)
        console.log(`   链接: ${article.original_url}`)
        keptCount++
      }
      console.log('')
    }

    // 🧹 清理热搜关键词中的测试数据
    console.log('🧹 清理热搜关键词中的测试数据...')
    
    const { data: keywords, error: keywordsError } = await supabase
      .from('trending_keywords')
      .select('id, keyword')

    if (!keywordsError && keywords) {
      for (const keyword of keywords) {
        // 删除明显的测试关键词
        const isTestKeyword = [
          '测试',
          'test',
          'example',
          '样例'
        ].some(test => keyword.keyword.toLowerCase().includes(test))

        if (isTestKeyword) {
          await supabase
            .from('trending_keywords')
            .delete()
            .eq('id', keyword.id)
          
          console.log(`🗑️ 删除测试关键词: ${keyword.keyword}`)
        }
      }
    }

    // 🧹 清理无用的新闻来源
    console.log('🧹 清理无用的新闻来源...')
    
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, name, url')

    if (!sourcesError && sources) {
      for (const source of sources) {
        // 检查是否包含测试域名
        const isTestSource = mockPatterns.some(pattern => 
          (source.url && source.url.includes(pattern)) ||
          (source.name && source.name.includes('测试'))
        )

        if (isTestSource) {
          await supabase
            .from('news_sources')
            .delete()
            .eq('id', source.id)
          
          console.log(`🗑️ 删除测试来源: ${source.name}`)
        } else {
          // 检查是否还有文章使用这个来源
          const { data: articlesCount } = await supabase
            .from('news_articles')
            .select('id', { count: 'exact' })
            .eq('source_id', source.id)

                      if (!articlesCount || articlesCount.length === 0) {
              await supabase
                .from('news_sources')
                .delete()
                .eq('id', source.id)
            
            console.log(`🗑️ 删除无用来源: ${source.name}`)
          }
        }
      }
    }

    console.log('\n🎉 彻底清理完成!')
    console.log(`📊 统计结果:`)
    console.log(`   - 删除模拟数据: ${deletedCount} 篇`)
    console.log(`   - 保留有效文章: ${keptCount} 篇`)
    console.log(`   - 清理比例: ${((deletedCount / (deletedCount + keptCount)) * 100).toFixed(1)}%`)

    if (deletedArticles.length > 0) {
      console.log('\n🗑️ 已删除的文章列表:')
      deletedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`)
        console.log(`   原因: ${article.reason}`)
        console.log(`   链接: ${article.url}`)
      })
    }

    console.log('\n✅ 现在数据库中只包含真实有效的Labubu相关内容！')

  } catch (error) {
    console.error('🚨 清理失败:', error)
    process.exit(1)
  }
}

// 执行清理
cleanAllMockData() 