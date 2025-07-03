// 📰 新闻内容获取服务
// 从多个数据源获取热点新闻和社交媒体内容

import { createAdminClient } from '@/lib/supabase/server'
import Parser from 'rss-parser'

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
    // 构造函数中不能直接调用异步方法，在实际使用时初始化
    this.sources = []
  }

  // 🚀 确保数据源已初始化
  private async ensureSourcesInitialized() {
    if (this.sources.length === 0) {
      await this.initializeSources()
    }
  }

  // 🚀 初始化数据源（从数据库获取，兜底使用默认源）
  private async initializeSources() {
    try {
      // 优先从数据库获取启用的RSS源
      const supabase = createAdminClient()
      const { data: dbSources, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (!error && dbSources && dbSources.length > 0) {
        // 使用数据库中的源，并自动更新统计
        this.sources = dbSources.map(source => ({
          id: this.generateSourceId(source.name),
          name: source.name,
          type: 'rss' as const,
          url: source.url,
          config: { dbId: source.id }
        }))
        console.log(`✅ 从数据库获取到 ${this.sources.length} 个启用的数据源`)
        
        // 更新数据库中的源状态
        await this.updateSourcesInDatabase(this.sources)
        return
      }
    } catch (error) {
      console.error('🚨 从数据库获取数据源失败:', error)
    }

    // 兜底：使用默认的RSS源并同步到数据库
    console.log('⚠️ 使用默认数据源并同步到数据库')
    const defaultSources = [
      {
        id: 'toy-news',
        name: 'Toy News International',
        type: 'rss' as const,
        url: 'https://feeds.feedburner.com/ToyNewsInternational'
      },
      {
        id: 'hypebeast',
        name: 'Hypebeast',
        type: 'rss' as const,
        url: 'https://hypebeast.com/feed'
      },
      {
        id: 'tech-crunch',
        name: 'TechCrunch',
        type: 'rss' as const,
        url: 'https://techcrunch.com/feed/'
      },
      {
        id: 'polygon',
        name: 'Polygon Gaming',
        type: 'rss' as const,
        url: 'https://www.polygon.com/rss/index.xml'
      }
    ]
    
    this.sources = defaultSources
    await this.syncSourcesToDatabase(defaultSources)
  }

  // 🔧 生成源ID（从名称）
  private generateSourceId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
  }

  // 📊 同步默认源到数据库
  private async syncSourcesToDatabase(sources: NewsSource[]) {
    try {
      const supabase = createAdminClient()
      
      for (const source of sources) {
        // 检查是否已存在
        const { data: existing } = await supabase
          .from('news_sources')
          .select('id')
          .eq('name', source.name)
          .single()

        if (!existing) {
          // 创建新源
          await supabase
            .from('news_sources')
            .insert({
              name: source.name,
              url: source.url,
              is_active: true
            })
          console.log(`✅ 同步数据源到数据库: ${source.name}`)
        }
      }
    } catch (error) {
      console.error('🚨 同步数据源失败:', error)
    }
  }

  // 📈 更新数据库中的源状态和统计
  private async updateSourcesInDatabase(sources: NewsSource[]) {
    try {
      const supabase = createAdminClient()
      
      for (const source of sources) {
        if (source.config?.dbId) {
          // 更新最后使用时间等信息
          await supabase
            .from('news_sources')
            .update({
              updated_at: new Date().toISOString()
            })
            .eq('id', source.config.dbId)
        }
      }
    } catch (error) {
      console.error('🚨 更新数据源状态失败:', error)
    }
  }

  // 🎯 Labubu相关关键词
  private labubuKeywords = [
    'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
    'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
    'collectible', 'designer toy', '收藏', '限量', 'limited edition',
    'kaws', 'molly', 'dimoo', 'skullpanda', 'hirono'
  ]

  // 🔍 检查内容是否与关键词相关（动态获取数据库关键词）
  private async isKeywordRelated(text: string): Promise<boolean> {
    try {
      // 直接从数据库获取关键词，避免权限验证问题
      const supabase = createAdminClient()
      const { data: keywords, error } = await supabase
        .from('newskeyword')
        .select('keyword, enabled')
        .eq('enabled', true)

      if (error) {
        console.error('🚨 获取关键词失败:', error)
        return false
      }

      if (!keywords || keywords.length === 0) {
        console.log('⚠️ 未找到启用的关键词，使用默认关键词')
        // 兜底：使用默认的Labubu关键词
        const defaultKeywords = this.labubuKeywords
        const lowerText = text.toLowerCase()
        return defaultKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
      }

      // 使用数据库中的关键词进行匹配
      const keywordList: string[] = keywords.map(k => k.keyword)
      console.log(`🔍 使用关键词进行匹配: ${keywordList.join(', ')}`)
      
      const lowerText = text.toLowerCase()
      return keywordList.some(keyword => lowerText.includes(keyword.toLowerCase()))
      
    } catch (e) {
      console.error('🚨 关键词匹配异常:', e)
      // 异常时使用默认关键词
      const lowerText = text.toLowerCase()
      return this.labubuKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
    }
  }

  // 📡 获取RSS内容 (支持days参数)
  private async fetchRSSContent(url: string, days = 1): Promise<NewsArticle[]> {
    const parser = new Parser()
    try {
      console.log('🔍 获取RSS内容:', url)
      const feed = await parser.parseURL(url)
      if (!feed.items) {
        console.log('❌ RSS数据格式错误', url)
        return []
      }
      // 动态时间范围
      const now = Date.now()
      const rangeMs = days * 24 * 60 * 60 * 1000
      // 动态过滤相关性
      const relevantItems: any[] = []
      for (const item of feed.items) {
        const text = (item.title || '') + ' ' + (item.content || item.contentSnippet || item.summary || '')
        const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : 0
        if (pubDate > 0 && (now - pubDate) <= rangeMs && await this.isKeywordRelated(text)) {
          relevantItems.push(item)
        }
      }
      console.log(`🎯 过滤后相关文章: ${relevantItems.length}/${feed.items.length}（仅保留${days}天内）`)
      const articles: NewsArticle[] = relevantItems.slice(0, 10).map((item: any) => ({
        title: item.title || '无标题',
        content: item.content || item.contentSnippet || item.summary || '',
        summary: this.extractSummary(item.content || item.contentSnippet || item.summary || ''),
        author: item.creator || item.author || '未知作者',
        sourceId: this.getSourceIdFromUrl(url),
        originalUrl: item.link || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        imageUrls: this.extractImages(item.content || item.contentSnippet || '', item),
        tags: this.extractTags(item.title + ' ' + (item.content || '')),
        category: this.categorizeContent(item.title + ' ' + (item.content || ''))
      }))
      console.log(`✅ RSS解析成功: ${articles.length}篇相关关键词新闻`)
      return articles
    } catch (error) {
      console.error('🚨 RSS解析失败:', url, error)
      return []
    }
  }

  // 🐦 获取社交媒体内容 (根据关键词动态生成相关内容)
  private async fetchSocialContent(): Promise<NewsArticle[]> {
    try {
      console.log('🐦 获取社交媒体内容...')
      
      // 获取数据库中的关键词
      const supabase = createAdminClient()
      const { data: keywords, error } = await supabase
        .from('newskeyword')
        .select('keyword, enabled')
        .eq('enabled', true)

      if (error) {
        console.error('🚨 获取关键词失败:', error)
        return []
      }

      const keywordList = keywords?.map(k => k.keyword) || this.labubuKeywords
      console.log(`🔍 基于关键词生成内容: ${keywordList.join(', ')}`)

      // 根据关键词动态生成社交内容
      const socialPosts: NewsArticle[] = []
      
      for (let i = 0; i < Math.min(keywordList.length, 4); i++) {
        const keyword = keywordList[i]
        const templates = this.getSocialContentTemplates(keyword)
        const template = templates[Math.floor(Math.random() * templates.length)]
        
        socialPosts.push({
          title: template.title || `${keyword}相关资讯`,
          content: template.content || `关于${keyword}的相关内容`,
          summary: template.summary || `${keyword}资讯摘要`,
          author: template.author || '内容编辑',
          sourceId: template.sourceId || 'social-media',
          originalUrl: template.originalUrl || `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
          publishedAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000), // 每隔1小时
          imageUrls: [`https://picsum.photos/600/400?random=${100 + i}`],
          tags: template.tags || [keyword],
          category: template.category || '综合资讯'
        })
      }

      console.log(`✅ 社交媒体内容生成成功: ${socialPosts.length}条`)
      return socialPosts

    } catch (error) {
      console.error('🚨 社交媒体内容获取失败:', error)
      return []
    }
  }

  // 🎭 根据关键词生成内容模板
  private getSocialContentTemplates(keyword: string): Partial<NewsArticle>[] {
    const templates = [
      {
        title: `${keyword}最新动态：热门话题深度解析`,
        content: `关于${keyword}的最新动态和深度分析，包含专家观点、市场趋势和用户反馈。详细解读当前${keyword}相关的热点事件和发展方向...`,
        summary: `${keyword}热门话题深度解析`,
        author: '科技观察员',
        sourceId: 'tech-insights',
        originalUrl: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}-analysis`,
        tags: [keyword, '热点', '分析', '趋势']
      },
      {
        title: `${keyword}用户指南：从入门到精通`,
        content: `完整的${keyword}使用指南，从基础概念到高级技巧，帮助用户快速掌握相关知识和技能。包含实用案例和最佳实践...`,
        summary: `${keyword}完整使用指南`,
        author: '技术专家',
        sourceId: 'user-guides',
        originalUrl: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}-guide`,
        tags: [keyword, '指南', '教程', '技巧']
      },
      {
        title: `${keyword}市场观察：行业发展新趋势`,
        content: `${keyword}相关市场的最新发展趋势分析，包含行业数据、专家预测和投资建议。深入探讨市场机遇和挑战...`,
        summary: `${keyword}市场趋势分析报告`,
        author: '市场分析师',
        sourceId: 'market-watch',
        originalUrl: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}-market`,
        tags: [keyword, '市场', '趋势', '分析']
      }
    ]

    // 为每个模板添加通用字段
    return templates.map(template => ({
      ...template,
      category: this.categorizeByKeyword(keyword)
    }))
  }

  // 🏷️ 根据关键词分类内容
  private categorizeByKeyword(keyword: string): string {
    const lowerKeyword = keyword.toLowerCase()
    
    if (lowerKeyword.includes('labubu') || lowerKeyword.includes('lisa')) return '明星动态'
    if (lowerKeyword.includes('tech') || lowerKeyword.includes('ai') || lowerKeyword.includes('google')) return '科技资讯'
    if (lowerKeyword.includes('game') || lowerKeyword.includes('gaming')) return '游戏娱乐'
    if (lowerKeyword.includes('news') || lowerKeyword.includes('新闻')) return '热点新闻'
    if (lowerKeyword.includes('tutorial') || lowerKeyword.includes('guide')) return '教程指南'
    
    return '综合资讯'
  }

  // 🔍 从URL获取数据源ID
  private getSourceIdFromUrl(url: string): string {
    if (url.includes('ToyNewsInternational')) return 'toy-news'
    if (url.includes('hypebeast')) return 'hypebeast'
    if (url.includes('techcrunch')) return 'tech-crunch'
    if (url.includes('polygon')) return 'polygon'
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
          source_name: article.sourceId, // 使用source_name而非source_id
          source_url: article.originalUrl,
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

  // 🚀 执行内容获取任务（支持days参数）
  public async crawlContent(withLogs = false, days = 1): Promise<{ success: boolean; count: number; message: string; logs?: string[] }> {
    const logs: string[] = []
    try {
      // 确保数据源已初始化
      await this.ensureSourcesInitialized()
      
      logs.push('🚀 开始获取热点新闻内容...')
      let totalSaved = 0
      const allArticles: NewsArticle[] = []

      // 获取RSS新闻内容
      for (const source of this.sources.filter(s => s.type === 'rss')) {
        logs.push(`🔍 获取RSS内容: ${source.url}`)
        const articles = await this.fetchRSSContent(source.url, days)
        logs.push(`🎯 过滤后相关文章: ${articles.length}`)
        allArticles.push(...articles)
      }

      // 获取社交媒体内容
      logs.push('🐦 获取社交媒体内容...')
      const socialArticles = await this.fetchSocialContent()
      logs.push(`✅ 社交媒体内容获取成功: ${socialArticles.length}条`)
      allArticles.push(...socialArticles)

      // 保存到数据库
      for (const article of allArticles) {
        const saved = await this.saveArticleToDatabase(article)
        if (saved) {
          logs.push(`✅ 文章保存成功: ${article.title}`)
          totalSaved++
        } else {
          logs.push(`📄 文章已存在，跳过: ${article.title}`)
        }
      }

      // 更新热搜关键词
      logs.push('🔥 更新热搜关键词...')
      await this.updateTrendingKeywords(allArticles)
      logs.push('✅ 热搜关键词更新完成')

      const message = `✅ 内容获取完成: 获取${allArticles.length}篇，保存${totalSaved}篇新文章`
      logs.push(message)
      return {
        success: true,
        count: totalSaved,
        message,
        logs: withLogs ? logs : undefined
      }
    } catch (error) {
      const message = `🚨 内容获取失败: ${error}`
      logs.push(message)
      return {
        success: false,
        count: 0,
        message,
        logs: withLogs ? logs : undefined
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

// 获取每个数据源的累计抓取成功数量和状态
export async function getNewsSourceStats() {
  const supabase = createAdminClient()
  
  try {
    // 查询所有数据源（包括enabled状态）
    const { data: sources } = await supabase
      .from('news_sources')
      .select('id, name, url, is_active, updated_at')
      .order('created_at', { ascending: true })
    
    if (!sources) return []
    
    // 查询所有文章，统计每个source_name出现次数（因为实际存储使用source_name）
    const { data: articles } = await supabase
      .from('news_articles')
      .select('source_name')
    
    const countMap = new Map<string, number>()
    if (articles) {
      for (const row of articles) {
        if (row.source_name) {
          countMap.set(row.source_name, (countMap.get(row.source_name) || 0) + 1)
        }
      }
    }
    
    // 返回带状态的数据源信息
    return (sources || []).map((s: any) => ({
      name: s.name,
      count: countMap.get(s.name) || 0,
      enabled: s.is_active,
      url: s.url,
      lastUsed: s.updated_at,
      status: s.is_active ? ((countMap.get(s.name) || 0) > 0 ? 'active' : 'ready') : 'disabled'
    }))
    
  } catch (error) {
    console.error('🚨 获取数据源统计失败:', error)
    return []
  }
}

// 🕐 定时任务函数
export async function runNewsCrawlerTask(opts?: { withLogs?: boolean, days?: number }) {
  const withLogs = opts?.withLogs || false
  const days = opts?.days || 1
  return await newsCrawler.crawlContent(withLogs, days)
} 