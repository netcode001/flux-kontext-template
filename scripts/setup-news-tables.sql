-- 📰 Labubu资讯聚合数据库表结构
-- v2.0 资讯聚合版功能支持

-- 🏷️ 新闻来源表
CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 来源名称 (微博、小红书、Twitter等)
  type VARCHAR(50) NOT NULL, -- 来源类型 (social_media, news_site, rss等)
  url TEXT, -- 来源URL
  api_config JSONB, -- API配置信息
  is_active BOOLEAN DEFAULT true, -- 是否激活
  last_crawled_at TIMESTAMP WITH TIME ZONE, -- 最后爬取时间
  crawl_interval INTEGER DEFAULT 1800, -- 爬取间隔(秒)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔗 新闻文章表
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, -- 文章标题
  content TEXT, -- 文章内容
  summary TEXT, -- AI生成的摘要
  author VARCHAR(100), -- 作者
  source_id UUID REFERENCES public.news_sources(id), -- 来源ID
  original_url TEXT, -- 原文链接
  published_at TIMESTAMP WITH TIME ZONE, -- 发布时间
  image_urls TEXT[], -- 图片URLs
  tags TEXT[], -- 标签数组
  category VARCHAR(50), -- 分类 (新品、活动、教程等)
  
  -- 📊 统计数据
  view_count INTEGER DEFAULT 0, -- 查看次数
  like_count INTEGER DEFAULT 0, -- 点赞次数
  share_count INTEGER DEFAULT 0, -- 分享次数
  comment_count INTEGER DEFAULT 0, -- 评论次数
  
  -- 🤖 AI分析数据
  sentiment_score DECIMAL(3,2), -- 情感分数 (-1到1)
  quality_score DECIMAL(3,2), -- 内容质量分数 (0到1)
  relevance_score DECIMAL(3,2), -- 相关性分数 (0到1)
  
  -- 🔥 热度数据
  hot_score DECIMAL(10,2) DEFAULT 0, -- 热度分数
  trending_rank INTEGER, -- 热搜排名
  
  -- 📝 状态管理
  status VARCHAR(20) DEFAULT 'pending', -- 状态 (pending, approved, rejected)
  is_featured BOOLEAN DEFAULT false, -- 是否精选
  is_trending BOOLEAN DEFAULT false, -- 是否热门
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引优化
  UNIQUE(original_url, source_id) -- 防止重复抓取
);

-- 🔥 热搜关键词表
CREATE TABLE IF NOT EXISTS public.trending_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL, -- 关键词
  category VARCHAR(50), -- 分类
  search_count INTEGER DEFAULT 0, -- 搜索次数
  mention_count INTEGER DEFAULT 0, -- 提及次数
  hot_score DECIMAL(10,2) DEFAULT 0, -- 热度分数
  trend_direction VARCHAR(20) DEFAULT 'stable', -- 趋势方向 (up, down, stable)
  
  -- 📈 趋势数据
  hourly_data JSONB, -- 每小时数据
  daily_data JSONB, -- 每日数据
  
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 首次出现时间
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 最后更新时间
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 用户与新闻的交互表
CREATE TABLE IF NOT EXISTS public.user_news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL, -- 交互类型 (view, like, share, bookmark)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, article_id, interaction_type) -- 防止重复交互
);

-- 📊 新闻统计表
CREATE TABLE IF NOT EXISTS public.news_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  
  -- 📈 统计数据
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date, article_id) -- 每日统计唯一
);

-- 🏷️ 新闻标签表
CREATE TABLE IF NOT EXISTS public.news_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 标签名称
  category VARCHAR(30), -- 标签分类
  usage_count INTEGER DEFAULT 0, -- 使用次数
  is_trending BOOLEAN DEFAULT false, -- 是否热门标签
  color VARCHAR(7) DEFAULT '#6B7280', -- 标签颜色
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔗 新闻文章与标签关联表
CREATE TABLE IF NOT EXISTS public.news_article_tags (
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.news_tags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (article_id, tag_id)
);

-- 📱 社交媒体账号表
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 平台名称 (weibo, xiaohongshu, twitter等)
  username VARCHAR(100) NOT NULL, -- 用户名
  display_name VARCHAR(100), -- 显示名称
  avatar_url TEXT, -- 头像URL
  follower_count INTEGER DEFAULT 0, -- 粉丝数
  following_count INTEGER DEFAULT 0, -- 关注数
  
  -- 📊 账号统计
  post_count INTEGER DEFAULT 0, -- 发帖数
  engagement_rate DECIMAL(5,2), -- 互动率
  
  -- 🔧 配置信息
  is_monitored BOOLEAN DEFAULT true, -- 是否监控
  monitor_keywords TEXT[], -- 监控关键词
  last_crawled_at TIMESTAMP WITH TIME ZONE, -- 最后爬取时间
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(platform, username) -- 平台用户名唯一
);

-- 📰 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_hot_score ON public.news_articles(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON public.news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_trending ON public.news_articles(is_trending);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_hot_score ON public.trending_keywords(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_news_interactions_user_id ON public.user_news_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_news_analytics_date ON public.news_analytics(date DESC);

-- 🔧 创建触发器自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON public.news_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trending_keywords_updated_at BEFORE UPDATE ON public.trending_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_tags_updated_at BEFORE UPDATE ON public.news_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📝 插入初始数据
INSERT INTO public.news_sources (name, type, url, is_active) VALUES
('微博Labubu话题', 'social_media', 'https://weibo.com/k/labubu', true),
('小红书Labubu', 'social_media', 'https://www.xiaohongshu.com/search_result?keyword=labubu', true),
('Twitter Labubu', 'social_media', 'https://twitter.com/search?q=labubu', true),
('Instagram Labubu', 'social_media', 'https://www.instagram.com/explore/tags/labubu/', true),
('YouTube Labubu', 'social_media', 'https://www.youtube.com/results?search_query=labubu', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.news_tags (name, category, color) VALUES
('新品发布', 'product', '#FF6B6B'),
('活动预告', 'event', '#4ECDC4'),
('开箱评测', 'review', '#45B7D1'),
('收藏攻略', 'guide', '#96CEB4'),
('周边产品', 'merchandise', '#FFEAA7'),
('艺术创作', 'art', '#DDA0DD'),
('潮流趋势', 'trend', '#FFB6C1'),
('限量版', 'limited', '#FF7F50')
ON CONFLICT (name) DO NOTHING;

-- 📊 创建视图方便查询
CREATE OR REPLACE VIEW v_trending_articles AS
SELECT 
  a.*,
  s.name as source_name,
  s.type as source_type,
  COALESCE(stats.total_views, 0) as total_views,
  COALESCE(stats.total_likes, 0) as total_likes
FROM public.news_articles a
LEFT JOIN public.news_sources s ON a.source_id = s.id
LEFT JOIN (
  SELECT 
    article_id,
    SUM(views) as total_views,
    SUM(likes) as total_likes
  FROM public.news_analytics
  WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY article_id
) stats ON a.id = stats.article_id
WHERE a.status = 'approved' AND a.is_trending = true
ORDER BY a.hot_score DESC;

-- 📈 创建热搜关键词视图
CREATE OR REPLACE VIEW v_hot_keywords AS
SELECT 
  keyword,
  category,
  hot_score,
  trend_direction,
  search_count,
  mention_count,
  EXTRACT(EPOCH FROM (NOW() - first_seen_at))/3600 as hours_since_first_seen
FROM public.trending_keywords
WHERE hot_score > 0
ORDER BY hot_score DESC
LIMIT 50;

-- 💡 添加注释说明
COMMENT ON TABLE public.news_sources IS 'Labubu资讯来源配置表';
COMMENT ON TABLE public.news_articles IS 'Labubu资讯文章主表';
COMMENT ON TABLE public.trending_keywords IS 'Labubu热搜关键词表';
COMMENT ON TABLE public.user_news_interactions IS '用户与资讯交互记录表';
COMMENT ON TABLE public.news_analytics IS '资讯统计分析表';
COMMENT ON TABLE public.news_tags IS '资讯标签表';
COMMENT ON TABLE public.social_accounts IS '社交媒体账号监控表';

-- ✅ 数据库结构创建完成
-- 支持功能：资讯聚合、热搜统计、用户交互、内容分析、标签管理 