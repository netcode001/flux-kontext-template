const { createClient } = require('@supabase/supabase-js')

// 🔧 Supabase客户端配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 📝 测试资讯数据
const testArticles = [
  {
    title: "Labubu x POP MART 2024年度限量版系列即将发布！",
    content: "备受期待的Labubu 2024年度限量版系列即将在本月底正式发布！这次的系列包含了6个全新造型，每个都有独特的服装和配件。据内部消息透露，本次限量版将采用全新的制作工艺，细节更加精致。",
    summary: "Labubu携手POP MART推出2024年度限量版系列，包含6个全新造型，制作工艺全面升级。",
    author: "潮玩快报",
    originalUrl: "https://example.com/labubu-2024-limited",
    publishedAt: "2024-01-20T10:00:00Z",
    imageUrls: ["https://example.com/images/labubu-2024-1.jpg"],
    tags: ["限量版", "POP MART", "新品发布"],
    category: "product",
    viewCount: 12580,
    likeCount: 892,
    shareCount: 156,
    hotScore: 95.5,
    isFeaturedt: true,
    isTrending: true
  },
  {
    title: "小红书爆火！Labubu收纳盒DIY教程大合集",
    content: "最近在小红书上，Labubu收纳盒DIY教程火了！从简单的纸盒改造到精美的亚克力展示柜，各种创意无穷。这些教程不仅实用，还能让你的Labubu收藏更有个性。",
    summary: "小红书上Labubu收纳盒DIY教程走红，从纸盒改造到亚克力展示柜，创意无穷。",
    author: "手工达人小莉",
    originalUrl: "https://example.com/labubu-diy-storage",
    publishedAt: "2024-01-19T15:30:00Z",
    imageUrls: ["https://example.com/images/labubu-diy-1.jpg", "https://example.com/images/labubu-diy-2.jpg"],
    tags: ["DIY", "收纳", "教程", "小红书"],
    category: "guide",
    viewCount: 8750,
    likeCount: 567,
    shareCount: 89,
    hotScore: 78.2,
    isFeaturedt: false,
    isTrending: true
  },
  {
    title: "微博话题 #Labubu今日穿搭# 突破100万讨论量",
    content: "微博上的#Labubu今日穿搭#话题持续火爆，讨论量已突破100万！网友们纷纷晒出自己Labubu的各种搭配，从经典款到改装版，创意层出不穷。这个话题已经成为Labubu爱好者的聚集地。",
    summary: "微博#Labubu今日穿搭#话题讨论量破百万，成为爱好者聚集地。",
    author: "微博热点",
    originalUrl: "https://weibo.com/k/labubu今日穿搭",
    publishedAt: "2024-01-18T12:45:00Z",
    imageUrls: ["https://example.com/images/weibo-trend.jpg"],
    tags: ["微博", "穿搭", "话题", "社交"],
    category: "trend",
    viewCount: 15200,
    likeCount: 1023,
    shareCount: 234,
    hotScore: 88.7,
    isFeaturedt: true,
    isTrending: true
  },
  {
    title: "Labubu艺术家合作款曝光：与知名插画师联名作品即将面世",
    content: "据可靠消息，Labubu即将与多位知名插画师推出联名合作款。这些艺术家包括日本的山田花子、韩国的李美娜等。每个合作款都融入了艺术家的独特风格，预计将在春季发布。",
    summary: "Labubu与知名插画师合作款曝光，融入艺术家独特风格，春季发布。",
    author: "艺术潮流",
    originalUrl: "https://example.com/labubu-artist-collab",
    publishedAt: "2024-01-17T09:15:00Z",
    imageUrls: ["https://example.com/images/artist-collab.jpg"],
    tags: ["艺术家", "合作款", "插画", "联名"],
    category: "art",
    viewCount: 6890,
    likeCount: 445,
    shareCount: 67,
    hotScore: 72.1,
    isFeaturedt: false,
    isTrending: false
  },
  {
    title: "YouTube开箱视频：Labubu隐藏款开箱成功率分析",
    content: "YouTube博主通过对100个Labubu盲盒的开箱统计，发现隐藏款的真实概率约为1:144，比官方公布的1:192要高。视频详细分析了不同系列的中奖概率，对收藏者很有参考价值。",
    summary: "YouTube博主统计分析Labubu隐藏款真实概率约1:144，高于官方数据。",
    author: "开箱大神",
    originalUrl: "https://youtube.com/watch?v=labubu-hidden",
    publishedAt: "2024-01-16T20:00:00Z",
    imageUrls: ["https://example.com/images/youtube-unbox.jpg"],
    tags: ["YouTube", "开箱", "隐藏款", "概率"],
    category: "review",
    viewCount: 25600,
    likeCount: 1567,
    shareCount: 312,
    hotScore: 92.3,
    isFeaturedt: true,
    isTrending: true
  },
  {
    title: "Labubu主题咖啡厅在上海开业，现场排队超过3小时",
    content: "位于上海淮海路的Labubu主题咖啡厅正式开业，现场人气爆棚，排队时间超过3小时。咖啡厅内部装饰完全按照Labubu的世界观设计，还有限定周边商品销售。",
    summary: "上海Labubu主题咖啡厅开业火爆，排队超3小时，限定周边热销。",
    author: "上海潮流",
    originalUrl: "https://example.com/shanghai-labubu-cafe",
    publishedAt: "2024-01-15T14:20:00Z",
    imageUrls: ["https://example.com/images/cafe-1.jpg", "https://example.com/images/cafe-2.jpg"],
    tags: ["主题咖啡厅", "上海", "排队", "周边"],
    category: "event",
    viewCount: 18900,
    likeCount: 1205,
    shareCount: 189,
    hotScore: 85.6,
    isFeaturedt: false,
    isTrending: true
  }
]

// 🔥 热搜关键词数据
const testKeywords = [
  {
    keyword: "Labubu限量版",
    category: "product",
    searchCount: 12500,
    mentionCount: 8900,
    hotScore: 95.5,
    trendDirection: "up"
  },
  {
    keyword: "Labubu今日穿搭",
    category: "trend",
    searchCount: 8760,
    mentionCount: 15600,
    hotScore: 88.7,
    trendDirection: "up"
  },
  {
    keyword: "Labubu开箱",
    category: "review",
    searchCount: 6580,
    mentionCount: 4320,
    hotScore: 78.9,
    trendDirection: "stable"
  },
  {
    keyword: "Labubu收纳",
    category: "guide",
    searchCount: 4560,
    mentionCount: 2890,
    hotScore: 67.8,
    trendDirection: "up"
  },
  {
    keyword: "Labubu咖啡厅",
    category: "event",
    searchCount: 3890,
    mentionCount: 1560,
    hotScore: 58.4,
    trendDirection: "down"
  },
  {
    keyword: "Labubu艺术家",
    category: "art",
    searchCount: 2340,
    mentionCount: 1890,
    hotScore: 45.2,
    trendDirection: "stable"
  },
  {
    keyword: "Labubu DIY",
    category: "guide",
    searchCount: 1980,
    mentionCount: 890,
    hotScore: 38.7,
    trendDirection: "up"
  },
  {
    keyword: "Labubu隐藏款",
    category: "product",
    searchCount: 5670,
    mentionCount: 3450,
    hotScore: 72.1,
    trendDirection: "stable"
  }
]

// 🌐 新闻来源数据
const testSources = [
  {
    name: "微博Labubu话题",
    type: "social_media",
    url: "https://weibo.com/k/labubu",
    isActive: true
  },
  {
    name: "小红书Labubu",
    type: "social_media", 
    url: "https://www.xiaohongshu.com/search_result?keyword=labubu",
    isActive: true
  },
  {
    name: "YouTube Labubu",
    type: "social_media",
    url: "https://www.youtube.com/results?search_query=labubu",
    isActive: true
  },
  {
    name: "潮玩快报",
    type: "news_site",
    url: "https://example.com/toy-news",
    isActive: true
  }
]

// 💾 执行数据插入
async function seedNewsData() {
  try {
    console.log('🚀 开始插入测试数据...')

    // 1. 插入新闻来源
    console.log('📡 插入新闻来源数据...')
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .upsert(testSources, { onConflict: 'name' })
      .select()

    if (sourcesError) {
      console.error('❌ 新闻来源插入失败:', sourcesError)
      return
    }

    console.log('✅ 新闻来源插入成功:', sources.length)

    // 2. 插入资讯文章
    console.log('📰 插入资讯文章数据...')
    const articlesWithSourceId = testArticles.map(article => ({
      ...article,
      sourceId: sources.find(s => s.name === "潮玩快报")?.id || sources[0]?.id,
      status: 'approved'
    }))

    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .upsert(articlesWithSourceId, { onConflict: 'title' })
      .select()

    if (articlesError) {
      console.error('❌ 资讯文章插入失败:', articlesError)
      return
    }

    console.log('✅ 资讯文章插入成功:', articles.length)

    // 3. 插入热搜关键词
    console.log('🔥 插入热搜关键词数据...')
    const { data: keywords, error: keywordsError } = await supabase
      .from('trending_keywords')
      .upsert(testKeywords, { onConflict: 'keyword' })
      .select()

    if (keywordsError) {
      console.error('❌ 热搜关键词插入失败:', keywordsError)
      return
    }

    console.log('✅ 热搜关键词插入成功:', keywords.length)

    console.log('🎉 所有测试数据插入完成！')
    console.log('📊 数据统计:')
    console.log(`  - 新闻来源: ${sources.length} 个`)
    console.log(`  - 资讯文章: ${articles.length} 篇`)
    console.log(`  - 热搜关键词: ${keywords.length} 个`)

  } catch (error) {
    console.error('🚨 数据插入过程出错:', error)
  }
}

// 🎯 运行脚本
if (require.main === module) {
  seedNewsData()
}

module.exports = { seedNewsData } 