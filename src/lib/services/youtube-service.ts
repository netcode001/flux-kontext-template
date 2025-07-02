/**
 * 🎥 YouTube API服务类
 * 处理YouTube视频搜索、获取详情和数据转换
 */

import { MediaAPIConfigManager } from './media-api-config'

// YouTube API接口定义
interface YouTubeSearchResult {
  id: {
    videoId: string
  }
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: { url: string, width: number, height: number }
      medium: { url: string, width: number, height: number }
      high: { url: string, width: number, height: number }
      standard?: { url: string, width: number, height: number }
      maxres?: { url: string, width: number, height: number }
    }
    channelTitle: string
  }
}

interface YouTubeVideoDetails {
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: any
    channelTitle: string
  }
  contentDetails: {
    duration: string  // ISO 8601格式，如"PT5M30S"
  }
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  player?: {
    embedHtml: string
  }
}

interface ProcessedVideo {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  channelId: string
  publishedAt: string
  durationIso: string
  durationSeconds: number
  viewCount: number
  likeCount: number
  commentCount: number
  iframeEmbedCode: string
}

export class YouTubeService {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  constructor() {
    const config = MediaAPIConfigManager.getInstance()
    this.apiKey = config.getYouTubeConfig().apiKey
  }

  /**
   * 搜索YouTube视频
   */
  async searchVideos(
    keyword: string, 
    maxResults: number = 10,
    order: 'relevance' | 'date' | 'viewCount' = 'relevance'
  ): Promise<YouTubeSearchResult[]> {
    try {
      // 🔧 简化参数，移除可能导致问题的regionCode和relevanceLanguage
      const params = new URLSearchParams({
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: maxResults.toString(),
        order: order,
        key: this.apiKey
      })

      console.log(`🎥 YouTube搜索请求: ${keyword}, 最大结果: ${maxResults}`)
      const response = await fetch(`${this.baseUrl}/search?${params}`)
      
      console.log(`📡 YouTube API响应状态: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ YouTube API错误响应:`, errorText)
        throw new Error(`YouTube搜索API错误: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ YouTube搜索成功，找到 ${data.items?.length || 0} 个视频`)
      
      if (data.error) {
        throw new Error(`YouTube API错误: ${data.error.message}`)
      }

      return data.items || []
    } catch (error) {
      console.error('YouTube搜索失败:', error)
      throw error
    }
  }

  /**
   * 获取视频详细信息
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    if (videoIds.length === 0) return []

    try {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails,statistics,player',
        id: videoIds.join(','),
        key: this.apiKey
      })

      const response = await fetch(`${this.baseUrl}/videos?${params}`)
      
      if (!response.ok) {
        throw new Error(`YouTube视频API错误: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`YouTube API错误: ${data.error.message}`)
      }

      return data.items || []
    } catch (error) {
      console.error('获取YouTube视频详情失败:', error)
      throw error
    }
  }

  /**
   * 搜索并获取完整视频信息
   */
  async searchAndGetDetails(
    keyword: string, 
    maxResults: number = 10,
    order: 'relevance' | 'date' | 'viewCount' = 'relevance'
  ): Promise<ProcessedVideo[]> {
    try {
      // 第一步：搜索视频
      const searchResults = await this.searchVideos(keyword, maxResults, order)
      
      if (searchResults.length === 0) {
        return []
      }

      // 第二步：获取视频详情
      const videoIds = searchResults.map(item => item.id.videoId)
      const videoDetails = await this.getVideoDetails(videoIds)

      // 第三步：处理和合并数据
      const processedVideos: ProcessedVideo[] = []

      for (const detail of videoDetails) {
        try {
          const processed = this.processVideoData(detail)
          processedVideos.push(processed)
        } catch (error) {
          console.warn(`处理视频 ${detail.id} 时出错:`, error)
          // 继续处理其他视频，不因单个视频错误而中断
        }
      }

      return processedVideos
    } catch (error) {
      console.error('搜索并获取YouTube视频详情失败:', error)
      throw error
    }
  }

  /**
   * 处理单个视频数据
   */
  private processVideoData(video: YouTubeVideoDetails): ProcessedVideo {
    // 转换持续时间：PT5M30S -> 330秒
    const durationSeconds = this.parseDuration(video.contentDetails.duration)
    
    // 获取最高质量的缩略图
    const thumbnailUrl = this.getBestThumbnail(video.snippet.thumbnails)
    
    // 生成iframe嵌入代码
    const iframeEmbedCode = this.generateIframeCode(video.id)

    // 安全转换数字字段
    const viewCount = parseInt(video.statistics.viewCount || '0', 10)
    const likeCount = parseInt(video.statistics.likeCount || '0', 10)
    const commentCount = parseInt(video.statistics.commentCount || '0', 10)

    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description || '',
      thumbnailUrl,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      durationIso: video.contentDetails.duration,
      durationSeconds,
      viewCount,
      likeCount,
      commentCount,
      iframeEmbedCode
    }
  }

  /**
   * 解析ISO 8601持续时间格式
   * PT5M30S -> 330秒
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    return hours * 3600 + minutes * 60 + seconds
  }

  /**
   * 获取最高质量的缩略图URL
   */
  private getBestThumbnail(thumbnails: any): string {
    // 优先级：maxres > standard > high > medium > default
    if (thumbnails.maxres) return thumbnails.maxres.url
    if (thumbnails.standard) return thumbnails.standard.url
    if (thumbnails.high) return thumbnails.high.url
    if (thumbnails.medium) return thumbnails.medium.url
    if (thumbnails.default) return thumbnails.default.url
    return ''
  }

  /**
   * 生成iframe嵌入代码
   */
  private generateIframeCode(videoId: string): string {
    // 只保留宽高100%，去掉绝对定位
    return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:16px;"></iframe>`
  }

  /**
   * 格式化视频持续时间为用户友好格式
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  /**
   * 格式化观看数为用户友好格式
   */
  formatViewCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    } else {
      return count.toString()
    }
  }

  /**
   * 验证API配额使用情况
   */
  async checkQuota(): Promise<{ remainingQuota: number, dailyLimit: number }> {
    // 这里可以实现配额监控逻辑
    // 暂时返回模拟数据
    return {
      remainingQuota: 9000,
      dailyLimit: 10000
    }
  }
}

// 导出单例实例
export const youtubeService = new YouTubeService(); 