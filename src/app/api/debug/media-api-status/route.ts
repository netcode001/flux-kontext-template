import { NextRequest, NextResponse } from 'next/server';
import { mediaAPIConfig } from '@/lib/services/media-api-config';

/**
 * 🎥 媒体API状态检查接口
 * GET /api/debug/media-api-status
 */
export async function GET(request: NextRequest) {
  try {
    // 获取API配置状态
    const apiStatus = mediaAPIConfig.checkAPIStatus();
    
    // 获取各平台配置详情
    const configs = {
      youtube: {
        ...mediaAPIConfig.getYouTubeConfig(),
        // 隐藏完整密钥，只显示前几位和后几位
        apiKey: maskApiKey(mediaAPIConfig.getYouTubeConfig().apiKey),
      },
      facebook: {
        ...mediaAPIConfig.getFacebookConfig(),
        appSecret: maskApiKey(mediaAPIConfig.getFacebookConfig().appSecret),
        accessToken: maskApiKey(mediaAPIConfig.getFacebookConfig().accessToken),
      },
      instagram: {
        accessToken: maskApiKey(mediaAPIConfig.getInstagramConfig().accessToken),
      },
      twitter: {
        ...mediaAPIConfig.getTwitterConfig(),
        apiSecret: maskApiKey(mediaAPIConfig.getTwitterConfig().apiSecret),
        bearerToken: maskApiKey(mediaAPIConfig.getTwitterConfig().bearerToken),
        accessToken: maskApiKey(mediaAPIConfig.getTwitterConfig().accessToken),
        accessTokenSecret: maskApiKey(mediaAPIConfig.getTwitterConfig().accessTokenSecret),
      },
      tiktok: {
        clientKey: maskApiKey(mediaAPIConfig.getTikTokConfig().clientKey),
        clientSecret: maskApiKey(mediaAPIConfig.getTikTokConfig().clientSecret),
      },
      weibo: {
        ...mediaAPIConfig.getWeiboConfig(),
        appSecret: maskApiKey(mediaAPIConfig.getWeiboConfig().appSecret),
        accessToken: maskApiKey(mediaAPIConfig.getWeiboConfig().accessToken),
      },
      douyin: {
        clientKey: maskApiKey(mediaAPIConfig.getDouyinConfig().clientKey),
        clientSecret: maskApiKey(mediaAPIConfig.getDouyinConfig().clientSecret),
        accessToken: maskApiKey(mediaAPIConfig.getDouyinConfig().accessToken),
      },
      bilibili: {
        accessKey: maskApiKey(mediaAPIConfig.getBilibiliConfig().accessKey),
        secretKey: maskApiKey(mediaAPIConfig.getBilibiliConfig().secretKey),
        sessData: maskApiKey(mediaAPIConfig.getBilibiliConfig().sessData),
      },
      baidu: {
        apiKey: maskApiKey(mediaAPIConfig.getBaiduConfig().apiKey),
        secretKey: maskApiKey(mediaAPIConfig.getBaiduConfig().secretKey),
      },
      naver: {
        clientId: maskApiKey(mediaAPIConfig.getNaverConfig().clientId),
        clientSecret: maskApiKey(mediaAPIConfig.getNaverConfig().clientSecret),
      },
      line: {
        channelAccessToken: maskApiKey(mediaAPIConfig.getLineConfig().channelAccessToken),
        channelSecret: maskApiKey(mediaAPIConfig.getLineConfig().channelSecret),
      },
    };

    // 安全配置
    const securityConfig = mediaAPIConfig.getSecurityConfig();
    
    // 调试配置
    const debugConfig = mediaAPIConfig.getDebugConfig();

    // 生成详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: apiStatus.total,
        configured: apiStatus.configured,
        percentage: apiStatus.percentage,
        status: apiStatus.percentage > 50 ? 'good' : apiStatus.percentage > 20 ? 'warning' : 'critical',
      },
      platforms: {
        international: {
          youtube: {
            configured: apiStatus.status.youtube,
            priority: 'high',
            difficulty: '⭐⭐',
            cost: '$50-200/month',
            config: configs.youtube,
            validation: validateYouTubeKey(mediaAPIConfig.getYouTubeConfig().apiKey),
          },
          facebook: {
            configured: apiStatus.status.facebook,
            priority: 'high',
            difficulty: '⭐⭐⭐',
            cost: 'free',
            config: configs.facebook,
          },
          instagram: {
            configured: apiStatus.status.instagram,
            priority: 'high',
            difficulty: '⭐⭐⭐',
            cost: 'free',
            config: configs.instagram,
          },
          twitter: {
            configured: apiStatus.status.twitter,
            priority: 'medium',
            difficulty: '⭐⭐⭐⭐',
            cost: '$100/month',
            config: configs.twitter,
          },
          tiktok: {
            configured: apiStatus.status.tiktok,
            priority: 'medium',
            difficulty: '⭐⭐⭐⭐',
            cost: 'free (审核严格)',
            config: configs.tiktok,
          },
        },
        domestic: {
          weibo: {
            configured: apiStatus.status.weibo,
            priority: 'high',
            difficulty: '⭐⭐⭐⭐⭐',
            cost: 'free (极难申请)',
            config: configs.weibo,
          },
          douyin: {
            configured: apiStatus.status.douyin,
            priority: 'high',
            difficulty: '⭐⭐⭐⭐',
            cost: 'free (需企业资质)',
            config: configs.douyin,
          },
          bilibili: {
            configured: apiStatus.status.bilibili,
            priority: 'medium',
            difficulty: '⭐⭐⭐',
            cost: 'free',
            config: configs.bilibili,
          },
          baidu: {
            configured: apiStatus.status.baidu,
            priority: 'low',
            difficulty: '⭐⭐⭐⭐',
            cost: 'free',
            config: configs.baidu,
          },
        },
        regional: {
          naver: {
            configured: apiStatus.status.naver,
            priority: 'low',
            difficulty: '⭐⭐⭐',
            cost: 'free',
            config: configs.naver,
          },
          line: {
            configured: apiStatus.status.line,
            priority: 'low',
            difficulty: '⭐⭐⭐⭐',
            cost: '$0-50/month',
            config: configs.line,
          },
        },
      },
      settings: {
        security: {
          userAgent: securityConfig.userAgent,
          proxyConfigured: !!(securityConfig.proxy.http || securityConfig.proxy.https),
          limits: securityConfig.limits,
        },
        debug: debugConfig,
      },
      recommendations: generateRecommendations(apiStatus),
      nextSteps: [
        '1. 优先申请YouTube、Instagram、Facebook API',
        '2. 配置B站API作为国内平台入口',
        '3. 考虑第三方数据服务作为补充',
        '4. 建立API监控和配额管理机制',
      ],
    };

    return NextResponse.json({
      success: true,
      data: report,
    });

  } catch (error) {
    console.error('媒体API状态检查失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '媒体API状态检查失败',
      details: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}

/**
 * 隐藏API密钥的敏感部分
 */
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length === 0) {
    return '未配置';
  }
  
  if (apiKey.length < 8) {
    return '***';
  }
  
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.min(apiKey.length - 8, 20));
  
  return `${start}${middle}${end}`;
}

/**
 * 验证YouTube API密钥格式
 */
function validateYouTubeKey(apiKey: string): { valid: boolean; message: string } {
  if (!apiKey) {
    return { valid: false, message: '未配置API密钥' };
  }
  
  // YouTube API密钥格式验证
  const pattern = /^AIza[0-9A-Za-z-_]{35}$/;
  if (!pattern.test(apiKey)) {
    return { valid: false, message: 'API密钥格式不正确' };
  }
  
  return { valid: true, message: 'API密钥格式正确' };
}

/**
 * 生成配置建议
 */
function generateRecommendations(apiStatus: any): string[] {
  const recommendations = [];
  
  if (apiStatus.percentage < 30) {
    recommendations.push('🚨 API配置率过低，建议优先配置高优先级平台');
  }
  
  if (!apiStatus.status.youtube) {
    recommendations.push('🎥 建议优先配置YouTube API，申请简单且数据丰富');
  }
  
  if (!apiStatus.status.bilibili) {
    recommendations.push('📺 建议配置B站API，国内平台中相对容易申请');
  }
  
  if (!apiStatus.status.facebook && !apiStatus.status.instagram) {
    recommendations.push('📱 建议配置Facebook/Instagram API，可同时获得两个平台数据');
  }
  
  if (apiStatus.configured < 3) {
    recommendations.push('💡 考虑使用第三方数据服务作为补充方案');
  }
  
  if (apiStatus.percentage > 70) {
    recommendations.push('✅ API配置良好，可以开始集成到内容引擎');
  }
  
  return recommendations;
} 