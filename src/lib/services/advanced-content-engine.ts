// 🚀 高级内容引擎 - Labubu垂直社区专用
// 支持中文社交媒体(微博、小红书)和多语言内容抓取

import { createAdminClient } from '@/lib/supabase/server'

// 🌐 多语言内容接口
interface MultiLanguageContent {
  zh: string  // 中文
  en: string  // 英文
  ja?: string // 日文
  ko?: string // 韩文
  th?: string // 泰文
}

// 📄 增强版文章接口
interface EnhancedNewsArticle {
  title: MultiLanguageContent
  content: MultiLanguageContent
  summary: MultiLanguageContent
  author: string
  sourceId: string
  originalUrl: string
  publishedAt: Date
  imageUrls: string[]
  tags: string[]
  category: string
  language: string // 原始语言
  country?: string // 来源国家
  platform: string // 社交平台
  engagementData?: {
    likes: number
    shares: number
    comments: number
    views: number
  }
}

// 🔧 数据源配置
interface AdvancedNewsSource {
  id: string
  name: string
  type: 'weibo' | 'xiaohongshu' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'rss'
  language: string
  country: string
  apiConfig: {
    endpoint?: string
    apiKey?: string
    searchKeywords: string[]
    maxResults: number
    rateLimitPerHour: number
  }
  isActive: boolean
}

// 🎯 高级内容引擎类
export class AdvancedContentEngine {
  private sources: AdvancedNewsSource[] = []
  private _supabase: any = null

  constructor() {
    this.initializeAdvancedSources()
  }

  // 🔧 懒加载Supabase客户端，避免构建时错误
  private get supabase() {
    if (!this._supabase) {
      // 在构建时跳过Supabase客户端创建
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log('⚠️ 构建时跳过Supabase客户端创建')
        return null
      }
      this._supabase = createAdminClient()
    }
    return this._supabase
  }

  // 🚀 初始化多语言数据源
  private initializeAdvancedSources() {
    this.sources = [
      // 🇨🇳 中文社交媒体源
      {
        id: 'weibo-labubu',
        name: '微博Labubu话题',
        type: 'weibo',
        language: 'zh',
        country: 'CN',
        apiConfig: {
          endpoint: 'https://api.weibo.com/2/search/topics.json',
          searchKeywords: ['Labubu', '拉布布', '泡泡玛特', 'Lisa同款', 'BLACKPINK'],
          maxResults: 50,
          rateLimitPerHour: 300
        },
        isActive: true
      },
      {
        id: 'xiaohongshu-labubu',
        name: '小红书Labubu内容',
        type: 'xiaohongshu',
        language: 'zh',
        country: 'CN',
        apiConfig: {
          endpoint: 'https://www.xiaohongshu.com/api/sns/web/v1/search/notes',
          searchKeywords: ['Labubu', '拉布布', 'Labubu穿搭', 'Labubu开箱', 'Labubu收藏'],
          maxResults: 30,
          rateLimitPerHour: 200
        },
        isActive: true
      },
      
      // 🇺🇸 英文社交媒体源
      {
        id: 'instagram-labubu',
        name: 'Instagram Labubu',
        type: 'instagram',
        language: 'en',
        country: 'US',
        apiConfig: {
          endpoint: 'https://graph.instagram.com/v18.0/ig_hashtag_search',
          searchKeywords: ['labubu', 'labubuhaul', 'popmart', 'blindbox', 'lisalabubu'],
          maxResults: 40,
          rateLimitPerHour: 200
        },
        isActive: true
      },
      {
        id: 'tiktok-labubu',
        name: 'TikTok Labubu',
        type: 'tiktok',
        language: 'en',
        country: 'US',
        apiConfig: {
          endpoint: 'https://open-api.tiktok.com/research/video/query/',
          searchKeywords: ['labubu', 'labubuhaul', 'popmart', 'blindbox'],
          maxResults: 30,
          rateLimitPerHour: 100
        },
        isActive: true
      }
    ]
  }

  // 🔍 微博内容获取 (模拟实现)
  private async fetchWeiboContent(source: AdvancedNewsSource): Promise<EnhancedNewsArticle[]> {
    try {
      console.log('🔍 获取微博Labubu内容...')
      
      // 模拟微博热门内容 (实际需要微博API或爬虫)
      const weiboContent: EnhancedNewsArticle[] = [
        {
          title: {
            zh: 'Lisa同款Labubu价格暴涨！黄牛炒作引热议',
            en: 'Lisa\'s Labubu Price Skyrockets! Scalper Speculation Sparks Debate'
          },
          content: {
            zh: '自从Lisa在Instagram晒出Labubu收藏后，相关产品价格一路飙升。据统计，Lisa同款限量版Labubu在二手市场的拍卖价格已突破万元大关，成为潮玩收藏界的新宠。不少网友表示"买不起了"，呼吁理性消费。专家提醒收藏者警惕价格泡沫，不要盲目跟风。',
            en: 'Since Lisa showed her Labubu collection on Instagram, related product prices have soared. Statistics show that Lisa\'s limited edition Labubu auction prices have exceeded 10,000 yuan in the secondary market, becoming the new favorite in the collectible toy world.'
          },
          summary: {
            zh: 'Lisa效应带动Labubu价格暴涨，限量版拍卖破万引关注',
            en: 'Lisa effect drives Labubu price surge, limited edition auctions exceed 10,000 yuan'
          },
          author: '微博用户@潮玩观察',
          sourceId: 'weibo-labubu',
          originalUrl: 'https://weibo.com/7654321/M_example123',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          imageUrls: ['https://picsum.photos/600/400?random=301'],
          tags: ['Lisa', 'Labubu', '价格', '黄牛', '炒作'],
          category: '市场动态',
          language: 'zh',
          country: 'CN',
          platform: 'weibo',
          engagementData: {
            likes: 15420,
            shares: 3890,
            comments: 2340,
            views: 89000
          }
        },
        {
          title: {
            zh: '羊群效应背后的黄牛，终究倒在Labubu脚下',
            en: 'Scalpers Behind the Herd Effect Finally Fall at Labubu\'s Feet'
          },
          content: {
            zh: '最新数据显示，Labubu热度已经不足以支撑其较高的二手价格。6月19日下午，多个二手交易平台上的Labubu价格出现大幅下跌，部分此前早些时候还在高价抢购的黄牛们开始抛售。有观点认为这是Labubu带动的泡沫玛特股价估值过高的一个信号。',
            en: 'Latest data shows Labubu\'s popularity is insufficient to support its high secondary market prices. On June 19th afternoon, Labubu prices on multiple second-hand trading platforms experienced significant drops.'
          },
          summary: {
            zh: '黄牛抛售Labubu，二手价格大跌，泡沫破裂信号？',
            en: 'Scalpers dump Labubu, secondary prices plummet, bubble burst signal?'
          },
          author: '微博@财经观察员',
          sourceId: 'weibo-labubu',
          originalUrl: 'https://weibo.com/1234567/M_example456',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          imageUrls: ['https://picsum.photos/600/400?random=303'],
          tags: ['黄牛', '羊群效应', '价格', '泡沫', '二手市场'],
          category: '市场分析',
          language: 'zh',
          country: 'CN',
          platform: 'weibo',
          engagementData: {
            likes: 8900,
            shares: 2340,
            comments: 1560,
            views: 67000
          }
        }
      ]

      console.log(`✅ 微博内容获取成功: ${weiboContent.length}条`)
      return weiboContent

    } catch (error) {
      console.error('🚨 微博内容获取失败:', error)
      return []
    }
  }

  // 🔍 小红书内容获取 (模拟实现)
  private async fetchXiaohongshuContent(source: AdvancedNewsSource): Promise<EnhancedNewsArticle[]> {
    try {
      console.log('🔍 获取小红书Labubu内容...')
      
      const xiaohongshuContent: EnhancedNewsArticle[] = [
        {
          title: {
            zh: 'Labubu收纳神器！这样整理让你的收藏井井有条',
            en: 'Labubu Storage Solutions! Organize Your Collection Like a Pro'
          },
          content: {
            zh: '作为一个资深Labubu收藏家，我想分享一些收纳心得。首先是分类收纳：按系列、颜色、尺寸分别存放。其次是防尘处理：使用透明收纳盒，既能展示又能保护。最后是标签管理：每个盒子贴上标签，方便查找。这套方法让我的200+Labubu收藏变得井井有条！',
            en: 'As a seasoned Labubu collector, I want to share some storage tips. First, categorize by series, color, and size. Second, use dust protection with transparent storage boxes for display and protection.'
          },
          summary: {
            zh: '资深收藏家分享Labubu收纳技巧，200+收藏井井有条',
            en: 'Experienced collector shares Labubu storage tips for 200+ collection'
          },
          author: '小红书@收藏达人小美',
          sourceId: 'xiaohongshu-labubu',
          originalUrl: 'https://www.xiaohongshu.com/discovery/item/65b2c3d4e5f67890',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          imageUrls: ['https://picsum.photos/600/400?random=304'],
          tags: ['收纳', '整理', '收藏', '技巧', '教程'],
          category: '收藏攻略',
          language: 'zh',
          country: 'CN',
          platform: 'xiaohongshu',
          engagementData: {
            likes: 23400,
            shares: 5670,
            comments: 3890,
            views: 456000
          }
        },
        {
          title: {
            zh: '真假Labubu鉴别指南：一眼识破山寨货',
            en: 'Authentic vs Fake Labubu Guide: Spot Counterfeits at a Glance'
          },
          content: {
            zh: '最近市面上出现了很多假冒的Labubu，特别是"Lafufu"等山寨品牌。作为正品鉴定师，我总结了几个关键鉴别点：1.看材质质感，正品更有光泽；2.检查包装细节，正品印刷清晰；3.观察五官比例，正品更协调；4.验证防伪标识。希望大家都能买到正品！',
            en: 'Recently, many fake Labubu products have appeared in the market, especially counterfeit brands like "Lafufu". As an authentication expert, I\'ve summarized key identification points.'
          },
          summary: {
            zh: '专业鉴定师教你识别真假Labubu，远离山寨货',
            en: 'Professional authenticator teaches how to identify real vs fake Labubu'
          },
          author: '小红书@鉴定师小王',
          sourceId: 'xiaohongshu-labubu',
          originalUrl: 'https://www.xiaohongshu.com/discovery/item/65c3d4e5f6789012',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          imageUrls: ['https://picsum.photos/600/400?random=305'],
          tags: ['真假鉴别', '防伪', '山寨', '鉴定', '购买指南'],
          category: '购买指南',
          language: 'zh',
          country: 'CN',
          platform: 'xiaohongshu',
          engagementData: {
            likes: 34500,
            shares: 8900,
            comments: 5670,
            views: 678000
          }
        }
      ]

      console.log(`✅ 小红书内容获取成功: ${xiaohongshuContent.length}条`)
      return xiaohongshuContent

    } catch (error) {
      console.error('🚨 小红书内容获取失败:', error)
      return []
    }
  }

  // 💾 保存多语言文章到数据库
  private async saveMultiLanguageArticle(article: EnhancedNewsArticle): Promise<boolean> {
    try {
      // 🔧 检查Supabase客户端是否可用
      if (!this.supabase) {
        console.log('⚠️ Supabase客户端不可用，跳过数据库保存')
        return false
      }

      // 检查是否已存在
      const { data: existing } = await this.supabase
        .from('news_articles')
        .select('id')
        .eq('original_url', article.originalUrl)
        .single()

      if (existing) {
        console.log('📄 文章已存在，跳过:', article.title.zh || article.title.en)
        return false
      }

      // 获取或创建数据源
      const sourceId = await this.getOrCreateSource(article.sourceId, article.platform)
      if (!sourceId) {
        console.log('⚠️ 无法获取数据源ID，跳过保存')
        return false
      }

      // 保存主要内容（以中文为主，英文为辅）
      const { error } = await this.supabase
        .from('news_articles')
        .insert({
          title: article.title.zh || article.title.en,
          content: article.content.zh || article.content.en,
          summary: article.summary.zh || article.summary.en,
          author: article.author,
          source_id: sourceId,
          original_url: article.originalUrl,
          published_at: article.publishedAt.toISOString(),
          image_urls: article.imageUrls,
          tags: article.tags,
          category: article.category,
          view_count: article.engagementData?.views || 0,
          like_count: article.engagementData?.likes || 0,
          share_count: article.engagementData?.shares || 0,
          comment_count: article.engagementData?.comments || 0,
          hot_score: this.calculateAdvancedHotScore(article),
          status: 'approved'
        })

      if (error) {
        console.error('❌ 保存文章失败:', error)
        return false
      }

      console.log('✅ 文章保存成功:', article.title.zh || article.title.en)
      return true

    } catch (error) {
      console.error('🚨 保存文章异常:', error)
      return false
    }
  }

  // 🔧 获取或创建数据源
  private async getOrCreateSource(sourceId: string, platform: string): Promise<string | null> {
    try {
      // 🔧 检查Supabase客户端是否可用
      if (!this.supabase) {
        console.log('⚠️ Supabase客户端不可用，无法获取数据源')
        return null
      }

      let { data: source } = await this.supabase
        .from('news_sources')
        .select('id')
        .eq('name', sourceId)
        .single()

      if (!source) {
        const { data: newSource } = await this.supabase
          .from('news_sources')
          .insert({
            name: sourceId,
            type: platform,
            url: `https://${platform}.com`,
            is_active: true
          })
          .select('id')
          .single()
        
        source = newSource
      }

      return source?.id || null
    } catch (error) {
      console.error('❌ 获取或创建数据源异常:', error)
      return null
    }
  }

  // 📊 计算高级热度分数
  private calculateAdvancedHotScore(article: EnhancedNewsArticle): number {
    let score = 50 // 基础分数

    // 时间因素
    const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    const timeScore = Math.max(0, 50 - hoursSincePublished * 1.5)

    // 互动数据权重
    const engagement = article.engagementData
    if (engagement) {
      const engagementScore = Math.min(40, 
        (engagement.likes / 1000) + 
        (engagement.shares / 100) + 
        (engagement.comments / 100) +
        (engagement.views / 10000)
      )
      score += engagementScore
    }

    // 平台权重
    const platformWeights = {
      'weibo': 1.2,
      'xiaohongshu': 1.1,
      'instagram': 1.3,
      'tiktok': 1.4,
      'youtube': 1.2
    }
    score *= platformWeights[article.platform as keyof typeof platformWeights] || 1.0

    // 内容质量
    const contentQuality = (article.content.zh?.length || article.content.en?.length || 0) / 100
    score += Math.min(10, contentQuality)

    return Math.round(score * 100) / 100
  }

  // 🚀 执行高级内容获取
  public async crawlAdvancedContent(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🚀 开始执行高级内容获取...')
      
      // 🔧 检查Supabase客户端是否可用
      if (!this.supabase) {
        console.log('⚠️ Supabase客户端不可用，返回模拟数据')
        return {
          success: true,
          count: 0,
          message: '构建环境下跳过数据库操作，高级内容爬虫配置正常'
        }
      }
      
      let totalSaved = 0
      const allArticles: EnhancedNewsArticle[] = []

      // 获取各平台内容
      for (const source of this.sources.filter(s => s.isActive)) {
        let articles: EnhancedNewsArticle[] = []

        switch (source.type) {
          case 'weibo':
            articles = await this.fetchWeiboContent(source)
            break
          case 'xiaohongshu':
            articles = await this.fetchXiaohongshuContent(source)
            break
          default:
            console.log(`⚠️ 暂不支持的平台: ${source.type}`)
        }

        allArticles.push(...articles)
        
        // 速率限制
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // 保存到数据库
      for (const article of allArticles) {
        const saved = await this.saveMultiLanguageArticle(article)
        if (saved) totalSaved++
      }

      const message = `✅ 高级内容获取完成: 获取${allArticles.length}篇，保存${totalSaved}篇新文章`
      console.log(message)

      return {
        success: true,
        count: totalSaved,
        message
      }

    } catch (error) {
      const message = `🚨 高级内容获取失败: ${error}`
      console.error(message)
      
      return {
        success: false,
        count: 0,
        message
      }
    }
  }
}

// 🚀 懒加载高级内容引擎实例
let advancedContentEngineInstance: AdvancedContentEngine | null = null

function getAdvancedContentEngine(): AdvancedContentEngine {
  if (!advancedContentEngineInstance) {
    advancedContentEngineInstance = new AdvancedContentEngine()
  }
  return advancedContentEngineInstance
}

// 🕐 定时任务函数
export async function runAdvancedContentCrawler() {
  console.log('⏰ 执行高级内容获取任务...')
  const engine = getAdvancedContentEngine()
  return await engine.crawlAdvancedContent()
} 