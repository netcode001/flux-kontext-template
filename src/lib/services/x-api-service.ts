// 🐦 X (Twitter) API v2 服务
// 集成X平台官方API，获取Labubu相关内容

import axios, { AxiosInstance } from 'axios'

// 🔗 X API v2 数据接口
interface XTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
    bookmark_count: number
    impression_count: number
  }
  attachments?: {
    media_keys?: string[]
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description: string
    }
  }>
  entities?: {
    hashtags?: Array<{
      start: number
      end: number
      tag: string
    }>
    mentions?: Array<{
      start: number
      end: number
      username: string
      id: string
    }>
    urls?: Array<{
      start: number
      end: number
      url: string
      expanded_url: string
      display_url: string
    }>
  }
  referenced_tweets?: Array<{
    type: string
    id: string
  }>
}

interface XUser {
  id: string
  name: string
  username: string
  verified: boolean
  verified_type?: string
  profile_image_url: string
  public_metrics: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

interface XMedia {
  media_key: string
  type: string
  url?: string
  preview_image_url?: string
  duration_ms?: number
  height?: number
  width?: number
  alt_text?: string
}

interface XApiResponse {
  data: XTweet[]
  includes?: {
    users?: XUser[]
    media?: XMedia[]
  }
  meta: {
    newest_id: string
    oldest_id: string
    result_count: number
    next_token?: string
  }
}

// 🚀 X API服务类
export class XApiService {
  private client: AxiosInstance
  private bearerToken: string
  private readonly baseURL = 'https://api.twitter.com/2'
  
  // 速率限制状态
  private rateLimitStatus = {
    remaining: 100,
    reset: Date.now() + 15 * 60 * 1000, // 15分钟后重置
    limit: 100
  }
  
  // Labubu相关搜索关键词
  private readonly labubuKeywords = [
    'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
    'lisa labubu', 'blackpink labubu', 'labubu lisa', 'labubu blackpink',
    'labubu 盲盒', 'labubu blind box', 'labubu collectible',
    'labubu figure', 'labubu toy', 'labubu limited',
    'popmart labubu', '泡泡玛特 labubu'
  ]

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || ''
    
    if (!this.bearerToken) {
      throw new Error('❌ Twitter Bearer Token未配置')
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    console.log('✅ X API服务初始化成功')
  }

  // 🔄 智能重试机制
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error

        // 如果是429错误，等待速率限制重置
        if (error.response?.status === 429) {
          const resetTime = this.rateLimitStatus.reset
          const waitTime = Math.max(resetTime - Date.now(), 0)
          
          if (waitTime > 0 && attempt < maxRetries) {
            console.log(`⏳ 速率限制触发，等待 ${Math.ceil(waitTime / 1000)} 秒后重试...`)
            await this.sleep(waitTime)
            continue
          }
        }

        // 其他错误使用指数退避
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt)
          console.log(`🔄 第 ${attempt + 1} 次重试失败，${delay}ms 后重试...`)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  // 💤 延迟函数
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 📊 更新速率限制状态
  private updateRateLimitStatus(headers: any) {
    if (headers['x-rate-limit-remaining']) {
      this.rateLimitStatus.remaining = parseInt(headers['x-rate-limit-remaining'])
    }
    if (headers['x-rate-limit-reset']) {
      this.rateLimitStatus.reset = parseInt(headers['x-rate-limit-reset']) * 1000
    }
    if (headers['x-rate-limit-limit']) {
      this.rateLimitStatus.limit = parseInt(headers['x-rate-limit-limit'])
    }
  }

  // 🔍 搜索Labubu相关推文
  async searchLabubuTweets(options: {
    maxResults?: number
    sinceHours?: number
    lang?: string
  } = {}): Promise<{ tweets: XTweet[], users: XUser[], media: XMedia[] }> {
    return await this.retryWithBackoff(async () => {
      const {
        maxResults = 100,
        sinceHours = 24,
        lang = 'en'
      } = options

      // 检查速率限制
      if (this.rateLimitStatus.remaining <= 1 && Date.now() < this.rateLimitStatus.reset) {
        const waitTime = this.rateLimitStatus.reset - Date.now()
        throw new Error(`速率限制中，请等待 ${Math.ceil(waitTime / 1000)} 秒`)
      }

      // 构建搜索查询
      const query = this.buildSearchQuery(sinceHours)
      
      const params = {
        query,
        max_results: Math.min(maxResults, 100), // API限制每次最多100条
        'tweet.fields': [
          'id', 'text', 'author_id', 'created_at', 'public_metrics',
          'context_annotations', 'entities', 'attachments', 'referenced_tweets'
        ].join(','),
        'user.fields': [
          'id', 'name', 'username', 'verified', 'verified_type',
          'profile_image_url', 'public_metrics'
        ].join(','),
        'media.fields': [
          'media_key', 'type', 'url', 'preview_image_url',
          'duration_ms', 'height', 'width', 'alt_text'
        ].join(','),
        expansions: [
          'author_id', 'attachments.media_keys', 'referenced_tweets.id'
        ].join(','),
        sort_order: 'recency'
      }

      console.log('🔍 搜索X平台Labubu内容...', { query, maxResults })

      const response = await this.client.get<XApiResponse>('/tweets/search/recent', {
        params
      })

      // 更新速率限制状态
      this.updateRateLimitStatus(response.headers)

      const { data: tweets = [], includes = {} } = response.data
      const { users = [], media = [] } = includes

      console.log(`✅ 获取到 ${tweets.length} 条Labubu相关推文`)

      return {
        tweets: this.filterLabubuTweets(tweets),
        users,
        media
      }
    })
  }

  // 🏗️ 构建搜索查询字符串
  private buildSearchQuery(sinceHours: number): string {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString()
    
    // 构建关键词查询 (使用OR逻辑)
    const keywordQuery = this.labubuKeywords
      .map(keyword => `"${keyword}"`)
      .join(' OR ')
    
    // 组合查询条件
    const query = [
      `(${keywordQuery})`,
      '-is:retweet',           // 排除转推
      '-is:reply',             // 排除回复
      'has:images OR has:videos', // 优先有媒体内容的推文
      `since:${since}`,        // 时间限制
      'lang:en OR lang:zh OR lang:ja OR lang:ko', // 多语言支持
    ].join(' ')

    return query
  }

  // 🎯 过滤高质量Labubu推文
  private filterLabubuTweets(tweets: XTweet[]): XTweet[] {
    return tweets.filter(tweet => {
      // 文本相关性检查
      const text = tweet.text.toLowerCase()
      const isLabubuRelated = this.labubuKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      )

      if (!isLabubuRelated) return false

      // 质量过滤
      const metrics = tweet.public_metrics
      const totalEngagement = metrics.like_count + metrics.retweet_count + 
                              metrics.reply_count + metrics.quote_count

      // 过滤低质量内容
      if (totalEngagement < 5) return false

      // 过滤垃圾内容
      const spamIndicators = ['buy now', 'click here', 'discount', 'sale']
      const hasSpam = spamIndicators.some(indicator => 
        text.includes(indicator.toLowerCase())
      )

      return !hasSpam
    })
  }

  // 📊 获取用户信息
  async getUserInfo(userIds: string[]): Promise<XUser[]> {
    try {
      if (userIds.length === 0) return []

      const params = {
        ids: userIds.join(','),
        'user.fields': [
          'id', 'name', 'username', 'verified', 'verified_type',
          'profile_image_url', 'public_metrics', 'description'
        ].join(',')
      }

      const response = await this.client.get<{ data: XUser[] }>('/users', {
        params
      })

      return response.data.data || []

    } catch (error: any) {
      console.error('❌ 获取用户信息失败:', error.response?.data || error.message)
      return []
    }
  }

  // 📈 获取热门Labubu话题
  async getTrendingLabubuTopics(): Promise<Array<{
    hashtag: string
    count: number
    engagement: number
  }>> {
    try {
      const { tweets } = await this.searchLabubuTweets({
        maxResults: 100,
        sinceHours: 24
      })

      // 统计话题标签
      const hashtagMap = new Map<string, { count: number, engagement: number }>()

      tweets.forEach(tweet => {
        const hashtags = tweet.entities?.hashtags || []
        const engagement = tweet.public_metrics.like_count + 
                          tweet.public_metrics.retweet_count +
                          tweet.public_metrics.reply_count

        hashtags.forEach(hashtag => {
          const tag = hashtag.tag.toLowerCase()
          if (this.isLabubuRelatedHashtag(tag)) {
            const current = hashtagMap.get(tag) || { count: 0, engagement: 0 }
            hashtagMap.set(tag, {
              count: current.count + 1,
              engagement: current.engagement + engagement
            })
          }
        })
      })

      // 转换为数组并排序
      return Array.from(hashtagMap.entries())
        .map(([hashtag, stats]) => ({
          hashtag: `#${hashtag}`,
          count: stats.count,
          engagement: stats.engagement
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 10)

    } catch (error) {
      console.error('❌ 获取热门话题失败:', error)
      return []
    }
  }

  // 🏷️ 检查话题标签是否与Labubu相关
  private isLabubuRelatedHashtag(hashtag: string): boolean {
    const relatedTags = [
      'labubu', 'popmart', 'blindbox', 'lisa', 'blackpink',
      'collectible', 'figure', 'toy', 'kaws', 'molly'
    ]
    
    return relatedTags.some(tag => hashtag.includes(tag))
  }

  // 🔢 计算推文热度分数
  calculateHotScore(tweet: XTweet, user?: XUser): number {
    const metrics = tweet.public_metrics
    
    // 基础互动分数
    let score = 0
    score += metrics.like_count * 1.0
    score += metrics.retweet_count * 2.0
    score += metrics.reply_count * 1.5
    score += metrics.quote_count * 2.5
    score += metrics.bookmark_count * 1.8
    score += (metrics.impression_count || 0) * 0.01

    // 发布者权重
    if (user) {
      const followerBonus = Math.log10(user.public_metrics.followers_count + 1) * 0.1
      score *= (1 + followerBonus)
      
      // 验证用户加分
      if (user.verified) {
        score *= 1.2
      }
    }

    // 时间衰减
    const hoursOld = (Date.now() - new Date(tweet.created_at).getTime()) / (1000 * 60 * 60)
    const timeFactor = Math.max(0.1, 1 - (hoursOld / 168)) // 一周内线性衰减

    // 内容质量加分
    const hasMedia = tweet.attachments?.media_keys && tweet.attachments.media_keys.length > 0
    const mediaBonus = hasMedia ? 1.3 : 1.0

    const finalScore = score * timeFactor * mediaBonus
    return Math.round(finalScore * 100) / 100
  }

  // 📊 获取API使用情况
  async getApiUsage(): Promise<{
    remaining: number
    reset: number
    limit: number
    status: 'healthy' | 'limited' | 'error'
    resetTime?: string
  }> {
    try {
      // 优先返回缓存的速率限制状态
      if (this.rateLimitStatus.remaining > 0) {
        return {
          remaining: this.rateLimitStatus.remaining,
          reset: this.rateLimitStatus.reset,
          limit: this.rateLimitStatus.limit,
          status: this.rateLimitStatus.remaining > 10 ? 'healthy' : 'limited',
          resetTime: new Date(this.rateLimitStatus.reset).toLocaleString()
        }
      }

      // 如果没有缓存数据，发送轻量级请求获取
      const response = await this.client.get('/tweets/search/recent', {
        params: {
          query: 'labubu',
          max_results: 10
        }
      })

      // 更新速率限制状态
      this.updateRateLimitStatus(response.headers)

      return {
        remaining: this.rateLimitStatus.remaining,
        reset: this.rateLimitStatus.reset,
        limit: this.rateLimitStatus.limit,
        status: this.rateLimitStatus.remaining > 10 ? 'healthy' : 'limited',
        resetTime: new Date(this.rateLimitStatus.reset).toLocaleString()
      }

    } catch (error: any) {
      console.error('❌ 获取API使用情况失败:', error.response?.data || error.message)
      
      // 如果是429错误，说明速率限制触发
      if (error.response?.status === 429) {
        return {
          remaining: 0,
          reset: this.rateLimitStatus.reset,
          limit: this.rateLimitStatus.limit,
          status: 'limited',
          resetTime: new Date(this.rateLimitStatus.reset).toLocaleString()
        }
      }

      return {
        remaining: 0,
        reset: 0,
        limit: 0,
        status: 'error'
      }
    }
  }
}

// 🎯 便捷导出函数
export async function fetchLabubuTweets(options?: {
  maxResults?: number
  sinceHours?: number
  lang?: string
}) {
  const xApi = new XApiService()
  return await xApi.searchLabubuTweets(options)
}

export async function getTrendingLabubuTopics() {
  const xApi = new XApiService()
  return await xApi.getTrendingLabubuTopics()
}

export async function getXApiUsage() {
  const xApi = new XApiService()
  return await xApi.getApiUsage()
} 