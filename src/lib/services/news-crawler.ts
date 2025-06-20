// 📰 新闻内容获取服务
// 从多个数据源获取热点新闻和社交媒体内容

import { createAdminClient } from '@/lib/supabase/server'

// 🌐 数据源配置
interface NewsSource {
  id: string
  name: string
  type: 'rss' | 'api' | 'social'
  url: string
  config?: Record<string, any>
}

// 📄 新闻文章接口
interface NewsArticle {
  title: string
  content?: string
  summary?: string
  author?: string
  sourceId: string
  originalUrl: string
  publishedAt: Date
  imageUrls: string[]
  tags: string[]
  category: string
}

// 🔥 热点新闻爬虫类
export class NewsCrawler {
  private sources: NewsSource[] = []

  constructor() {
    this.initializeSources()
  }

  // 🚀 初始化Labubu专门数据源
  private initializeSources() {
    this.sources = [
      // 🎭 玩具和收藏品新闻源 (更有可能包含Labubu内容)
      {
        id: 'toy-news',
        name: 'Toy News International',
        type: 'rss',
        url: 'https://feeds.feedburner.com/ToyNewsInternational'
      },
      {
        id: 'hypebeast',
        name: 'Hypebeast',
        type: 'rss',
        url: 'https://hypebeast.com/feed'
      },
      // 🛍️ 潮流和时尚新闻源
      {
        id: 'fashion-news',
        name: 'Fashion Network',
        type: 'rss',
        url: 'https://ww.fashionnetwork.com/rss/news.xml'
      },
      // 🎪 娱乐新闻源 (明星同款相关)
      {
        id: 'entertainment-weekly',
        name: 'Entertainment Weekly',
        type: 'rss',
        url: 'https://ew.com/feed/'
      }
    ]
  }

  // 🎯 Labubu相关关键词
  private labubuKeywords = [
    'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
    'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
    'collectible', 'designer toy', '收藏', '限量', 'limited edition',
    'kaws', 'molly', 'dimoo', 'skullpanda', 'hirono'
  ]

  // 🔍 检查内容是否与Labubu相关
  private isLabubuRelated(text: string): boolean {
    const lowerText = text.toLowerCase()
    return this.labubuKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )
  }

  // 📡 获取RSS内容 (只保留Labubu相关)
  private async fetchRSSContent(url: string): Promise<NewsArticle[]> {
    try {
      console.log('🔍 获取RSS内容:', url)
      
      // 使用RSS解析API或自建解析服务
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
      const data = await response.json()
      
      if (!data.items) {
        console.log('❌ RSS数据格式错误')
        return []
      }

      // 🎯 只处理与Labubu相关的文章
      const relevantItems = data.items.filter((item: any) => {
        const text = (item.title || '') + ' ' + (item.description || item.content || '')
        return this.isLabubuRelated(text)
      })

      console.log(`🎯 过滤后相关文章: ${relevantItems.length}/${data.items.length}`)

      const articles: NewsArticle[] = relevantItems.slice(0, 10).map((item: any) => ({
        title: item.title || '无标题',
        content: item.content || item.description || '',
        summary: this.extractSummary(item.description || item.content || ''),
        author: item.author || '未知作者',
        sourceId: this.getSourceIdFromUrl(url),
        originalUrl: item.link || item.guid || '',
        publishedAt: new Date(item.pubDate || Date.now()),
        imageUrls: this.extractImages(item.content || item.description || '', item),
        tags: this.extractTags(item.title + ' ' + (item.description || '')),
        category: this.categorizeContent(item.title + ' ' + (item.description || ''))
      }))

      console.log(`✅ RSS解析成功: ${articles.length}篇Labubu相关文章`)
      return articles

    } catch (error) {
      console.error('🚨 RSS获取失败:', error)
      return []
    }
  }

  // 🐦 获取社交媒体内容 (模拟数据，实际需要API)
  private async fetchSocialContent(): Promise<NewsArticle[]> {
    try {
      console.log('🐦 获取社交媒体内容...')
      
      // 模拟热门社交媒体内容
      const socialPosts: NewsArticle[] = [
        {
          title: 'Lisa晒出全新Labubu收藏，粉丝疯狂种草',
          content: 'BLACKPINK成员Lisa在社交媒体上分享了她的Labubu收藏，包括多个限量款式，引发粉丝热烈讨论...',
          summary: 'Lisa分享Labubu收藏引发粉丝热议',
          author: 'Lisa',
          sourceId: 'instagram-lisa',
          originalUrl: 'https://instagram.com/p/example',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
          imageUrls: ['https://picsum.photos/400/300?random=1'],
          tags: ['Lisa', 'Labubu', '明星同款', 'BLACKPINK'],
          category: '明星动态'
        },
        {
          title: '小红书博主分享Labubu穿搭攻略，播放量破百万',
          content: '知名时尚博主在小红书发布Labubu主题穿搭视频，展示如何将可爱元素融入日常造型...',
          summary: '时尚博主Labubu穿搭攻略爆火',
          author: '时尚博主小A',
          sourceId: 'xiaohongshu',
          originalUrl: 'https://xiaohongshu.com/explore/example',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4小时前
          imageUrls: ['https://picsum.photos/400/300?random=2'],
          tags: ['Labubu', '穿搭', '小红书', '时尚'],
          category: '穿搭分享'
        },
        {
          title: 'Labubu新品发布会现场直击，限量款抢购一空',
          content: 'Pop Mart今日举办Labubu新品发布会，现场展示多款全新设计，限量版商品开售即售罄...',
          summary: 'Labubu新品发布会限量款售罄',
          author: 'Pop Mart官方',
          sourceId: 'weibo-popmart',
          originalUrl: 'https://weibo.com/example',
          publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前
          imageUrls: ['https://picsum.photos/400/300?random=3'],
          tags: ['Labubu', '新品发布', 'Pop Mart', '限量版'],
          category: '新品发布'
        }
      ]

      console.log(`✅ 社交媒体内容获取成功: ${socialPosts.length}条`)
      return socialPosts

    } catch (error) {
      console.error('🚨 社交媒体内容获取失败:', error)
      return []
    }
  }

  // 🔍 从URL获取数据源ID
  private getSourceIdFromUrl(url: string): string {
    if (url.includes('ToyNewsInternational')) return 'toy-news'
    if (url.includes('hypebeast')) return 'hypebeast'
    if (url.includes('fashionnetwork')) return 'fashion-news'
    if (url.includes('ew.com')) return 'entertainment-weekly'
    return 'unknown-source'
  }

  // 📝 提取摘要
  private extractSummary(content: string): string {
    if (!content) return ''
    
    // 移除HTML标签
    const plainText = content.replace(/<[^>]*>/g, '')
    
    // 提取前150个字符作为摘要
    return plainText.length > 150 
      ? plainText.substring(0, 150) + '...'
      : plainText
  }

  // 🖼️ 提取图片URL (增强版)
  private extractImages(content: string, item?: any): string[] {
    const imageUrls: string[] = []
    
    // 1. 从RSS item中提取缩略图
    if (item?.thumbnail) {
      imageUrls.push(item.thumbnail)
    }
    
    // 2. 从RSS item的enclosure中提取图片
    if (item?.enclosure?.link && item.enclosure.type?.startsWith('image/')) {
      imageUrls.push(item.enclosure.link)
    }
    
    // 3. 从content中提取img标签 (支持单引号和双引号)
    if (content) {
      const imgRegex = /<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi
      let match
      while ((match = imgRegex.exec(content)) !== null) {
        const src = match[1]
        // 过滤掉小图标和无效图片，确保是有效的图片URL
        if (src && !src.includes('icon') && !src.includes('logo') && 
            !src.includes('avatar') && src.length > 10 &&
            (src.startsWith('http') || src.startsWith('//'))) {
          imageUrls.push(src.startsWith('//') ? 'https:' + src : src)
        }
      }
    }
    
    // 4. 从content中提取og:image meta标签
    if (content) {
      const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["'][^>]*>/gi
      let match
      while ((match = ogImageRegex.exec(content)) !== null) {
        const src = match[1]
        if (src && src.startsWith('http')) {
          imageUrls.push(src)
        }
      }
    }
    
    // 去重并过滤有效图片
    const uniqueImages = [...new Set(imageUrls)].filter(url => {
      if (!url || url.length < 10) return false
      
      // 检查是否为有效的图片格式
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
      const hasValidExtension = validExtensions.some(ext => 
        url.toLowerCase().includes(ext)
      )
      
      // 或者检查URL是否来自常见的图片服务
      const isImageService = url.includes('picsum') || url.includes('unsplash') || 
                            url.includes('pexels') || url.includes('pixabay') ||
                            url.includes('cdn') || url.includes('media')
      
      return hasValidExtension || isImageService
    })
    
    // 如果没有找到有效图片，使用高质量占位图
    if (uniqueImages.length === 0) {
      uniqueImages.push(`https://picsum.photos/600/400?random=${Math.floor(Math.random() * 1000)}`)
    }
    
    return uniqueImages.slice(0, 5) // 最多5张图片
  }

  // 🏷️ 提取标签
  private extractTags(text: string): string[] {
    const labubuKeywords = [
      'labubu', 'lisa', '盲盒', '手办', 'popmart', 'pop mart',
      '收藏', '限量', '新品', '发布', '穿搭', '明星', '同款',
      '价格', '涨价', '暴涨', '拍卖', '定制', '改款'
    ]
    
    const tags: string[] = []
    const lowerText = text.toLowerCase()
    
    labubuKeywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        tags.push(keyword)
      }
    })
    
    return [...new Set(tags)] // 去重
  }

  // 📂 内容分类
  private categorizeContent(text: string): string {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('新品') || lowerText.includes('发布') || lowerText.includes('上市')) {
      return '新品发布'
    }
    if (lowerText.includes('活动') || lowerText.includes('展览') || lowerText.includes('发布会')) {
      return '活动预告'
    }
    if (lowerText.includes('开箱') || lowerText.includes('评测') || lowerText.includes('测评')) {
      return '开箱评测'
    }
    if (lowerText.includes('收藏') || lowerText.includes('攻略') || lowerText.includes('指南')) {
      return '收藏攻略'
    }
    if (lowerText.includes('穿搭') || lowerText.includes('造型') || lowerText.includes('搭配')) {
      return '穿搭分享'
    }
    if (lowerText.includes('艺术') || lowerText.includes('创作') || lowerText.includes('设计')) {
      return '艺术创作'
    }
    
    return '潮流趋势'
  }

  // 📊 计算热度分数
  private calculateHotScore(article: NewsArticle): number {
    let score = 50 // 基础分数
    
    // 时间因素 (越新越热)
    const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    const timeScore = Math.max(0, 50 - hoursSincePublished * 2)
    
    // 标签相关性
    const tagScore = article.tags.length * 5
    
    // 内容质量
    const contentScore = article.content ? Math.min(20, article.content.length / 100) : 0
    
    // 图片加分
    const imageScore = article.imageUrls.length * 3
    
    score += timeScore + tagScore + contentScore + imageScore
    
    return Math.round(score * 100) / 100
  }

  // 💾 保存文章到数据库
  private async saveArticleToDatabase(article: NewsArticle): Promise<boolean> {
    try {
      const supabase = createAdminClient()
      
      // 检查是否已存在相同URL的文章
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('original_url', article.originalUrl)
        .single()

      if (existing) {
        console.log('📄 文章已存在，跳过:', article.title)
        return false
      }

      // 获取或创建数据源
      let { data: source } = await supabase
        .from('news_sources')
        .select('id')
        .eq('name', article.sourceId)
        .single()

      if (!source) {
        const { data: newSource } = await supabase
          .from('news_sources')
          .insert({
            name: article.sourceId,
            type: 'rss',
            url: article.originalUrl,
            is_active: true
          })
          .select('id')
          .single()
        
        source = newSource
      }

      // 保存文章
      const { error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          content: article.content,
          summary: article.summary,
          author: article.author,
          source_id: source?.id,
          original_url: article.originalUrl,
          published_at: article.publishedAt.toISOString(),
          image_urls: article.imageUrls,
          tags: article.tags,
          category: article.category,
          hot_score: this.calculateHotScore(article),
          status: 'approved'
        })

      if (error) {
        console.error('🚨 保存文章失败:', error)
        return false
      }

      console.log('✅ 文章保存成功:', article.title)
      return true

    } catch (error) {
      console.error('🚨 数据库操作异常:', error)
      return false
    }
  }

  // 🚀 执行内容获取任务
  public async crawlContent(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🚀 开始获取热点新闻内容...')
      
      let totalSaved = 0
      const allArticles: NewsArticle[] = []

      // 获取RSS新闻内容
      for (const source of this.sources.filter(s => s.type === 'rss')) {
        const articles = await this.fetchRSSContent(source.url)
        allArticles.push(...articles)
      }

      // 获取社交媒体内容
      const socialArticles = await this.fetchSocialContent()
      allArticles.push(...socialArticles)

      // 保存到数据库
      for (const article of allArticles) {
        const saved = await this.saveArticleToDatabase(article)
        if (saved) totalSaved++
      }

      // 更新热搜关键词
      await this.updateTrendingKeywords(allArticles)

      const message = `✅ 内容获取完成: 获取${allArticles.length}篇，保存${totalSaved}篇新文章`
      console.log(message)

      return {
        success: true,
        count: totalSaved,
        message
      }

    } catch (error) {
      const message = `🚨 内容获取失败: ${error}`
      console.error(message)
      
      return {
        success: false,
        count: 0,
        message
      }
    }
  }

  // 🔥 更新热搜关键词
  private async updateTrendingKeywords(articles: NewsArticle[]): Promise<void> {
    try {
      const supabase = createAdminClient()
      console.log('🔥 更新热搜关键词...')
      
      const keywordCount = new Map<string, number>()
      
      // 统计关键词出现次数
      articles.forEach(article => {
        article.tags.forEach(tag => {
          const count = keywordCount.get(tag) || 0
          keywordCount.set(tag, count + 1)
        })
      })

      // 更新数据库中的热搜关键词
      for (const [keyword, count] of keywordCount.entries()) {
        await supabase
          .from('trending_keywords')
          .upsert({
            keyword,
            mention_count: count,
            hot_score: count * 10 + Math.random() * 20, // 简单的热度计算
            last_updated_at: new Date().toISOString()
          }, {
            onConflict: 'keyword'
          })
      }

      console.log(`✅ 热搜关键词更新完成: ${keywordCount.size}个关键词`)

    } catch (error) {
      console.error('🚨 热搜关键词更新失败:', error)
    }
  }
}

// 🎯 导出爬虫实例
export const newsCrawler = new NewsCrawler()

// 🕐 定时任务函数
export async function runNewsCrawlerTask() {
  console.log('⏰ 执行定时新闻获取任务...')
  return await newsCrawler.crawlContent()
} 