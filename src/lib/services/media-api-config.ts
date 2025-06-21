/**
 * 🎥 媒体API配置管理器
 * 统一管理所有社交媒体平台的API密钥和配置
 */

// 国际平台API配置接口
interface InternationalAPIs {
  youtube: {
    apiKey: string;
    quota: {
      daily: number;
      searchCost: number;
      videoCost: number;
    };
  };
  facebook: {
    appId: string;
    appSecret: string;
    accessToken: string;
  };
  instagram: {
    accessToken: string;
  };
  twitter: {
    apiKey: string;
    apiSecret: string;
    bearerToken: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  tiktok: {
    clientKey: string;
    clientSecret: string;
  };
}

// 国内平台API配置接口
interface DomesticAPIs {
  weibo: {
    appKey: string;
    appSecret: string;
    accessToken: string;
    redirectUri: string;
  };
  douyin: {
    clientKey: string;
    clientSecret: string;
    accessToken: string;
  };
  bilibili: {
    accessKey: string;
    secretKey: string;
    sessData: string;
  };
  baidu: {
    apiKey: string;
    secretKey: string;
  };
}

// 地区特色平台API配置接口
interface RegionalAPIs {
  naver: {
    clientId: string;
    clientSecret: string;
  };
  line: {
    channelAccessToken: string;
    channelSecret: string;
  };
}

// 安全和代理配置接口
interface SecurityConfig {
  userAgent: string;
  proxy: {
    http?: string;
    https?: string;
    socks?: string;
  };
  limits: {
    requestDelay: number;
    maxRetries: number;
    timeout: number;
  };
}

// 主配置接口
interface MediaAPIConfig {
  international: InternationalAPIs;
  domestic: DomesticAPIs;
  regional: RegionalAPIs;
  security: SecurityConfig;
  debug: {
    mode: boolean;
    logLevel: string;
    environment: string;
  };
}

/**
 * 媒体API配置管理类
 */
export class MediaAPIConfigManager {
  private static instance: MediaAPIConfigManager;
  private config: MediaAPIConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): MediaAPIConfigManager {
    if (!MediaAPIConfigManager.instance) {
      MediaAPIConfigManager.instance = new MediaAPIConfigManager();
    }
    return MediaAPIConfigManager.instance;
  }

  /**
   * 加载配置信息
   */
  private loadConfig(): MediaAPIConfig {
    return {
      international: {
        youtube: {
          // ✅ YouTube API密钥已配置
          apiKey: process.env.YOUTUBE_API_KEY || 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo',
          quota: {
            daily: 10000, // 每日配额
            searchCost: 100, // 搜索操作成本
            videoCost: 1, // 视频详情成本
          },
        },
        facebook: {
          appId: process.env.FACEBOOK_APP_ID || '',
          appSecret: process.env.FACEBOOK_APP_SECRET || '',
          accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
        },
        instagram: {
          accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        },
        twitter: {
          apiKey: process.env.TWITTER_API_KEY || '',
          apiSecret: process.env.TWITTER_API_SECRET || '',
          bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
          accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
          accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
        },
        tiktok: {
          clientKey: process.env.TIKTOK_CLIENT_KEY || '',
          clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
        },
      },
      domestic: {
        weibo: {
          appKey: process.env.WEIBO_APP_KEY || '',
          appSecret: process.env.WEIBO_APP_SECRET || '',
          accessToken: process.env.WEIBO_ACCESS_TOKEN || '',
          redirectUri: process.env.WEIBO_REDIRECT_URI || '',
        },
        douyin: {
          clientKey: process.env.DOUYIN_CLIENT_KEY || '',
          clientSecret: process.env.DOUYIN_CLIENT_SECRET || '',
          accessToken: process.env.DOUYIN_ACCESS_TOKEN || '',
        },
        bilibili: {
          accessKey: process.env.BILIBILI_ACCESS_KEY || '',
          secretKey: process.env.BILIBILI_SECRET_KEY || '',
          sessData: process.env.BILIBILI_SESSDATA || '',
        },
        baidu: {
          apiKey: process.env.BAIDU_API_KEY || '',
          secretKey: process.env.BAIDU_SECRET_KEY || '',
        },
      },
      regional: {
        naver: {
          clientId: process.env.NAVER_CLIENT_ID || '',
          clientSecret: process.env.NAVER_CLIENT_SECRET || '',
        },
        line: {
          channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
          channelSecret: process.env.LINE_CHANNEL_SECRET || '',
        },
      },
      security: {
        userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        proxy: {
          http: process.env.HTTP_PROXY,
          https: process.env.HTTPS_PROXY,
          socks: process.env.SOCKS_PROXY,
        },
        limits: {
          requestDelay: parseInt(process.env.REQUEST_DELAY || '2'),
          maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
          timeout: parseInt(process.env.TIMEOUT || '30') * 1000, // 转换为毫秒
        },
      },
      debug: {
        mode: process.env.DEBUG_MODE === 'true',
        logLevel: process.env.LOG_LEVEL || 'INFO',
        environment: process.env.ENVIRONMENT || 'production',
      },
    };
  }

  /**
   * 获取YouTube API配置
   */
  public getYouTubeConfig() {
    return this.config.international.youtube;
  }

  /**
   * 获取Facebook API配置
   */
  public getFacebookConfig() {
    return this.config.international.facebook;
  }

  /**
   * 获取Instagram API配置
   */
  public getInstagramConfig() {
    return this.config.international.instagram;
  }

  /**
   * 获取Twitter API配置
   */
  public getTwitterConfig() {
    return this.config.international.twitter;
  }

  /**
   * 获取TikTok API配置
   */
  public getTikTokConfig() {
    return this.config.international.tiktok;
  }

  /**
   * 获取微博API配置
   */
  public getWeiboConfig() {
    return this.config.domestic.weibo;
  }

  /**
   * 获取抖音API配置
   */
  public getDouyinConfig() {
    return this.config.domestic.douyin;
  }

  /**
   * 获取B站API配置
   */
  public getBilibiliConfig() {
    return this.config.domestic.bilibili;
  }

  /**
   * 获取百度API配置
   */
  public getBaiduConfig() {
    return this.config.domestic.baidu;
  }

  /**
   * 获取Naver API配置
   */
  public getNaverConfig() {
    return this.config.regional.naver;
  }

  /**
   * 获取LINE API配置
   */
  public getLineConfig() {
    return this.config.regional.line;
  }

  /**
   * 获取安全配置
   */
  public getSecurityConfig() {
    return this.config.security;
  }

  /**
   * 获取调试配置
   */
  public getDebugConfig() {
    return this.config.debug;
  }

  /**
   * 检查API密钥是否已配置
   */
  public checkAPIStatus() {
    const status = {
      youtube: !!this.config.international.youtube.apiKey && this.config.international.youtube.apiKey !== '',
      facebook: !!this.config.international.facebook.appId && !!this.config.international.facebook.appSecret,
      instagram: !!this.config.international.instagram.accessToken,
      twitter: !!this.config.international.twitter.bearerToken,
      tiktok: !!this.config.international.tiktok.clientKey,
      weibo: !!this.config.domestic.weibo.appKey,
      douyin: !!this.config.domestic.douyin.clientKey,
      bilibili: !!this.config.domestic.bilibili.accessKey,
      baidu: !!this.config.domestic.baidu.apiKey,
      naver: !!this.config.regional.naver.clientId,
      line: !!this.config.regional.line.channelAccessToken,
    };

    const configured = Object.values(status).filter(Boolean).length;
    const total = Object.keys(status).length;

    return {
      status,
      configured,
      total,
      percentage: Math.round((configured / total) * 100),
    };
  }

  /**
   * 获取完整配置 (调试用)
   */
  public getFullConfig(): MediaAPIConfig {
    return this.config;
  }

  /**
   * 更新特定平台的配置
   */
  public updateConfig(platform: string, config: any) {
    // 这里可以添加动态更新配置的逻辑
    console.log(`更新 ${platform} 配置:`, config);
  }

  /**
   * 验证API密钥格式
   */
  public validateAPIKey(platform: string, apiKey: string): boolean {
    const patterns = {
      youtube: /^AIza[0-9A-Za-z-_]{35}$/,
      facebook: /^[0-9]{15,17}$/,
      twitter: /^[a-zA-Z0-9]{25}$/,
    };

    if (patterns[platform as keyof typeof patterns]) {
      return patterns[platform as keyof typeof patterns].test(apiKey);
    }

    return apiKey.length > 0;
  }
}

// 导出单例实例
export const mediaAPIConfig = MediaAPIConfigManager.getInstance();

// 导出配置类型
export type { MediaAPIConfig, InternationalAPIs, DomesticAPIs, RegionalAPIs, SecurityConfig }; 