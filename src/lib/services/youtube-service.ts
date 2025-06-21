/**
 * 🎥 YouTube数据集成服务
 * 获取Labubu相关视频数据并集成到现有数据库
 */

import { mediaAPIConfig } from './media-api-config';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails?: {
    duration: string;
  };
  tags?: string[];
}

interface YouTubeSearchResult {
  items: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
  resultsPerPage: number;
}

/**
 * YouTube服务类
 */
export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = mediaAPIConfig.getYouTubeConfig().apiKey;
  }

  /**
   * 搜索Labubu相关视频
   */
  async searchLabubuVideos(options: {
    maxResults?: number;
    order?: 'relevance' | 'date' | 'rating' | 'viewCount';
    publishedAfter?: string;
    pageToken?: string;
  } = {}): Promise<YouTubeSearchResult> {
    const {
      maxResults = 10,
      order = 'relevance',
      publishedAfter,
      pageToken
    } = options;

    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: 'Labubu 拉布布 泡泡玛特 POP MART',
      maxResults: maxResults.toString(),
      order,
      type: 'video',
      key: this.apiKey,
    });

    if (publishedAfter) {
      searchParams.append('publishedAfter', publishedAfter);
    }

    if (pageToken) {
      searchParams.append('pageToken', pageToken);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`YouTube API错误: ${data.error.message}`);
      }

      // 获取视频详细信息
      const videoIds = data.items.map((item: any) => item.id.videoId);
      const detailedVideos = await this.getVideoDetails(videoIds);

      return {
        items: detailedVideos,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo.totalResults,
        resultsPerPage: data.pageInfo.resultsPerPage,
      };

    } catch (error) {
      console.error('YouTube搜索失败:', error);
      throw error;
    }
  }

  /**
   * 获取视频详细信息
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (videoIds.length === 0) return [];

    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}/videos?${params}`);
      
      if (!response.ok) {
        throw new Error(`YouTube API错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`YouTube API错误: ${data.error.message}`);
      }

      return data.items.map((item: any) => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnails: item.snippet.thumbnails,
        statistics: item.statistics,
        contentDetails: item.contentDetails,
        tags: item.snippet.tags,
      }));

    } catch (error) {
      console.error('获取视频详情失败:', error);
      throw error;
    }
  }

  /**
   * 将YouTube视频转换为数据库格式
   */
  convertToNewsArticle(video: YouTubeVideo) {
    // 计算热度分数
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    const likeCount = parseInt(video.statistics?.likeCount || '0');
    const commentCount = parseInt(video.statistics?.commentCount || '0');
    
    // YouTube平台权重: 1.3 (高于普通平台)
    const platformWeight = 1.3;
    const hotScore = Math.min(100, 
      (Math.log10(viewCount + 1) * 10 + 
       Math.log10(likeCount + 1) * 5 + 
       Math.log10(commentCount + 1) * 3) * platformWeight
    );

    return {
      title: video.title,
      content: video.description || `来自频道 ${video.channelTitle} 的Labubu相关视频`,
      summary: video.description ? 
        video.description.substring(0, 200) + '...' : 
        `${video.channelTitle}分享的Labubu视频，观看量${viewCount.toLocaleString()}次`,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      image_url: video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url,
      published_at: new Date(video.publishedAt),
      source_name: 'YouTube',
      source_url: 'https://www.youtube.com',
      author: video.channelTitle,
      category: 'video',
      tags: video.tags || ['Labubu', '视频', 'YouTube'],
      language: 'zh',
      hot_score: Math.round(hotScore),
      view_count: viewCount,
      like_count: likeCount,
      comment_count: commentCount,
      duration: video.contentDetails?.duration,
      platform_data: {
        platform: 'youtube',
        video_id: video.videoId,
        channel: video.channelTitle,
        thumbnails: video.thumbnails,
      }
    };
  }

  /**
   * 获取并保存Labubu视频到数据库
   */
  async fetchAndSaveLabubuVideos(maxResults: number = 20) {
    try {
      console.log('🎥 开始获取YouTube Labubu视频...');
      
      // 获取最新视频 (最近30天)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const searchResult = await this.searchLabubuVideos({
        maxResults,
        order: 'date',
        publishedAfter: thirtyDaysAgo.toISOString(),
      });

      console.log(`✅ 找到 ${searchResult.items.length} 个相关视频`);

      // 转换为数据库格式
      const articles = searchResult.items.map(video => this.convertToNewsArticle(video));

      // 这里可以调用现有的数据库保存逻辑
      // 例如使用现有的 news-crawler.ts 中的保存方法
      
      return {
        success: true,
        count: articles.length,
        articles,
        quota_used: maxResults * 100 + searchResult.items.length, // 搜索 + 视频详情
        message: `成功获取 ${articles.length} 个YouTube Labubu视频`
      };

    } catch (error) {
      console.error('YouTube数据获取失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        quota_used: 0,
      };
    }
  }

  /**
   * 获取配额使用情况
   */
  getQuotaInfo() {
    const config = mediaAPIConfig.getYouTubeConfig();
    return {
      daily_limit: config.quota.daily,
      search_cost: config.quota.searchCost,
      video_cost: config.quota.videoCost,
      estimated_remaining: config.quota.daily - 101, // 减去测试时使用的配额
    };
  }

  /**
   * 检查API状态
   */
  async checkAPIStatus() {
    try {
      // 简单测试请求
      const params = new URLSearchParams({
        part: 'snippet',
        q: 'test',
        maxResults: '1',
        key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      const data = await response.json();

      return {
        status: response.ok ? 'healthy' : 'error',
        quota_remaining: data.pageInfo ? 'available' : 'unknown',
        last_check: new Date().toISOString(),
      };

    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误',
        last_check: new Date().toISOString(),
      };
    }
  }
}

// 导出单例实例
export const youtubeService = new YouTubeService(); 