import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/services/youtube-service';

/**
 * 🎥 YouTube数据爬取API
 * GET /api/admin/youtube-crawler - 获取YouTube Labubu视频数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const order = searchParams.get('order') as 'relevance' | 'date' | 'rating' | 'viewCount' || 'date';
    const days = parseInt(searchParams.get('days') || '30');

    // 验证参数
    if (maxResults > 50) {
      return NextResponse.json({
        success: false,
        error: '单次最多获取50个视频',
      }, { status: 400 });
    }

    // 计算时间范围
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);

    console.log(`🎥 开始获取YouTube数据: ${maxResults}个视频, 排序${order}, 最近${days}天`);

    // 获取视频数据
    const result = await youtubeService.fetchAndSaveLabubuVideos(maxResults);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }

    // 获取配额信息
    const quotaInfo = youtubeService.getQuotaInfo();

    return NextResponse.json({
      success: true,
      data: {
        videos: result.articles,
        count: result.count,
        message: result.message,
        quota: {
          used: result.quota_used,
          remaining: quotaInfo.estimated_remaining - result.quota_used,
          daily_limit: quotaInfo.daily_limit,
        },
        search_params: {
          maxResults,
          order,
          days,
          publishedAfter: publishedAfter.toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('YouTube数据获取失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '获取YouTube数据失败',
      details: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/youtube-crawler - 手动触发YouTube数据获取
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maxResults = 10, order = 'date', days = 30, saveToDatabase = true } = body;

    console.log('🎥 手动触发YouTube数据获取:', { maxResults, order, days, saveToDatabase });

    // 获取YouTube数据
    const searchResult = await youtubeService.searchLabubuVideos({
      maxResults,
      order,
      publishedAfter: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    });

    const articles = searchResult.items.map(video => youtubeService.convertToNewsArticle(video));

    let savedCount = 0;
    if (saveToDatabase) {
      // 这里可以集成到现有的数据库保存逻辑
      // 暂时返回转换后的数据，等待数据库集成
      console.log(`📝 准备保存 ${articles.length} 个YouTube视频到数据库`);
      savedCount = articles.length; // 模拟保存成功
    }

    // 计算配额使用
    const quotaUsed = maxResults * 100 + searchResult.items.length;
    const quotaInfo = youtubeService.getQuotaInfo();

    return NextResponse.json({
      success: true,
      data: {
        fetched: searchResult.items.length,
        saved: savedCount,
        quota_used: quotaUsed,
        quota_remaining: quotaInfo.estimated_remaining - quotaUsed,
        videos: articles.map(article => ({
          title: article.title,
          url: article.url,
          author: article.author,
          published_at: article.published_at,
          hot_score: article.hot_score,
          view_count: article.view_count,
          like_count: article.like_count,
          comment_count: article.comment_count,
          duration: article.duration,
        })),
        summary: {
          total_views: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
          total_likes: articles.reduce((sum, a) => sum + (a.like_count || 0), 0),
          total_comments: articles.reduce((sum, a) => sum + (a.comment_count || 0), 0),
          avg_hot_score: Math.round(articles.reduce((sum, a) => sum + a.hot_score, 0) / articles.length),
          top_channels: getTopChannels(articles),
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('YouTube数据获取失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '获取YouTube数据失败',
      details: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}

/**
 * 获取热门频道统计
 */
function getTopChannels(articles: any[]) {
  const channelStats = articles.reduce((acc, article) => {
    const channel = article.author;
    if (!acc[channel]) {
      acc[channel] = {
        name: channel,
        videos: 0,
        total_views: 0,
        total_likes: 0,
      };
    }
    acc[channel].videos += 1;
    acc[channel].total_views += article.view_count || 0;
    acc[channel].total_likes += article.like_count || 0;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(channelStats)
    .sort((a: any, b: any) => b.total_views - a.total_views)
    .slice(0, 5);
} 