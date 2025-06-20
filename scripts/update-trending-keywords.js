// 🔥 更新热搜关键词脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateTrendingKeywords() {
  try {
    console.log('🔥 更新热搜关键词...')

    // 清除旧的热搜关键词
    await supabase
      .from('trending_keywords')
      .delete()
      .neq('id', 0) // 删除所有记录

    console.log('🧹 清除旧关键词完成')

    // 新的Labubu相关热搜关键词
    const trendingKeywords = [
      { 
        keyword: 'Lisa同款Labubu', 
        hot_score: 98.5, 
        category: '明星同款',
        search_count: 15420,
        mention_count: 3890,
        trend_direction: 'up'
      },
      { 
        keyword: 'Labubu限量版', 
        hot_score: 95.7, 
        category: '新品发布',
        search_count: 12350,
        mention_count: 2890,
        trend_direction: 'up'
      },
      { 
        keyword: 'Pop Mart新品', 
        hot_score: 91.4, 
        category: '新品发布',
        search_count: 10890,
        mention_count: 2340,
        trend_direction: 'up'
      },
      { 
        keyword: 'Labubu穿搭', 
        hot_score: 87.3, 
        category: '穿搭分享',
        search_count: 8760,
        mention_count: 1890,
        trend_direction: 'stable'
      },
      { 
        keyword: 'Labubu收藏', 
        hot_score: 82.1, 
        category: '收藏攻略',
        search_count: 7430,
        mention_count: 1560,
        trend_direction: 'up'
      },
      { 
        keyword: 'BLACKPINK周边', 
        hot_score: 79.8, 
        category: '明星同款',
        search_count: 6890,
        mention_count: 1340,
        trend_direction: 'stable'
      },
      { 
        keyword: 'Labubu拍卖', 
        hot_score: 76.2, 
        category: '收藏攻略',
        search_count: 5670,
        mention_count: 1120,
        trend_direction: 'up'
      },
      { 
        keyword: '设计师联名', 
        hot_score: 73.5, 
        category: '艺术创作',
        search_count: 4890,
        mention_count: 980,
        trend_direction: 'stable'
      },
      { 
        keyword: 'Labubu投资', 
        hot_score: 69.1, 
        category: '收藏攻略',
        search_count: 4230,
        mention_count: 760,
        trend_direction: 'up'
      },
      { 
        keyword: '可爱手办', 
        hot_score: 65.7, 
        category: '收藏攻略',
        search_count: 3890,
        mention_count: 650,
        trend_direction: 'stable'
      }
    ]

    let addedCount = 0

    // 添加每个关键词
    for (const [index, keyword] of trendingKeywords.entries()) {
      const { error } = await supabase
        .from('trending_keywords')
        .insert({
          ...keyword,
          first_seen_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error(`❌ 添加关键词失败: ${keyword.keyword}`, error)
      } else {
        console.log(`✅ 添加关键词成功: #${index + 1} ${keyword.keyword} (🔥${keyword.hot_score})`)
        addedCount++
      }
    }

    console.log(`\n✅ 热搜关键词更新完成!`)
    console.log(`📊 统计结果:`)
    console.log(`   - 成功添加: ${addedCount} 个关键词`)
    console.log(`   - 全部为Labubu相关热搜`)

  } catch (error) {
    console.error('🚨 更新热搜关键词失败:', error)
    process.exit(1)
  }
}

// 执行更新
updateTrendingKeywords() 