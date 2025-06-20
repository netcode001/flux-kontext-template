-- 📰 Labubu资讯聚合数据库表结构
-- v2.0 资讯聚合版功能支持
-- 请在Supabase SQL编辑器中执行此文件

-- 🏷️ 新闻来源表
CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  url TEXT,
  api_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  crawl_interval INTEGER DEFAULT 1800,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔗 新闻文章表
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author VARCHAR(100),
  source_id UUID REFERENCES public.news_sources(id),
  original_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_urls TEXT[],
  tags TEXT[],
  category VARCHAR(50),
  
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  sentiment_score DECIMAL(3,2),
  quality_score DECIMAL(3,2),
  relevance_score DECIMAL(3,2),
  
  hot_score DECIMAL(10,2) DEFAULT 0,
  trending_rank INTEGER,
  
  status VARCHAR(20) DEFAULT 'approved',
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(original_url, source_id)
);

-- 🔥 热搜关键词表
CREATE TABLE IF NOT EXISTS public.trending_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  search_count INTEGER DEFAULT 0,
  mention_count INTEGER DEFAULT 0,
  hot_score DECIMAL(10,2) DEFAULT 0,
  trend_direction VARCHAR(20) DEFAULT 'stable',
  
  hourly_data JSONB,
  daily_data JSONB,
  
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 用户与新闻的交互表
CREATE TABLE IF NOT EXISTS public.user_news_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, article_id, interaction_type)
);

-- 📊 新闻统计表
CREATE TABLE IF NOT EXISTS public.news_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date, article_id)
);

-- 🏷️ 新闻标签表
CREATE TABLE IF NOT EXISTS public.news_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(30),
  usage_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#6B7280',
  
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
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  post_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  is_monitored BOOLEAN DEFAULT true,
  monitor_keywords TEXT[],
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(platform, username)
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
DROP TRIGGER IF EXISTS update_news_sources_updated_at ON public.news_sources;
CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON public.news_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trending_keywords_updated_at ON public.trending_keywords;
CREATE TRIGGER update_trending_keywords_updated_at BEFORE UPDATE ON public.trending_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_tags_updated_at ON public.news_tags;
CREATE TRIGGER update_news_tags_updated_at BEFORE UPDATE ON public.news_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON public.social_accounts;
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
WHERE a.status = 'approved'
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

-- 📰 插入测试资讯文章
INSERT INTO public.news_articles (title, content, summary, author, category, hot_score, is_featured, tags, published_at) VALUES
('Labubu限量版新品发布！粉色系列惊艳亮相', 
'Labubu品牌今日正式发布了全新的粉色系列限量版产品，包含多款不同造型的玩偶和周边产品。这次发布的粉色系列以温柔的色调和精致的工艺赢得了众多粉丝的喜爱。', 
'Labubu粉色系列限量版正式发布，精致工艺获粉丝好评', 
'Labubu官方', 
'新品发布', 
95.5, 
true, 
ARRAY['新品发布', '限量版', '粉色系列'], 
NOW() - INTERVAL '2 hours'),

('开箱评测：Labubu盲盒第三弹完整体验', 
'最新一期的Labubu盲盒开箱来了！这次为大家带来第三弹盲盒的完整开箱体验，包含隐藏款的惊喜发现。从包装设计到产品质量，每一个细节都值得收藏。', 
'Labubu盲盒第三弹开箱评测，隐藏款惊喜曝光', 
'潮玩达人小李', 
'开箱评测', 
88.2, 
false, 
ARRAY['开箱评测', '盲盒', '隐藏款'], 
NOW() - INTERVAL '5 hours'),

('Labubu收藏攻略：如何辨别正品与获取限量版', 
'随着Labubu的火爆，市面上出现了不少仿品。本文详细介绍如何辨别正品Labubu的方法，以及获取限量版产品的渠道和技巧，帮助收藏爱好者避免踩坑。', 
'Labubu正品辨别方法和限量版获取攻略分享', 
'收藏专家王老师', 
'收藏攻略', 
76.8, 
false, 
ARRAY['收藏攻略', '正品辨别', '限量版'], 
NOW() - INTERVAL '1 day'),

('艺术创作：用Labubu打造梦幻拍摄场景', 
'摄影师小美分享了她用Labubu玩偶创作的一系列梦幻拍摄作品。通过精心的场景布置和光影运用，让每一个Labubu都仿佛有了生命力，展现出独特的艺术魅力。', 
'摄影师用Labubu创作梦幻艺术作品，展现独特魅力', 
'摄影师小美', 
'艺术创作', 
82.1, 
true, 
ARRAY['艺术创作', '摄影', '梦幻场景'], 
NOW() - INTERVAL '8 hours'),

('潮流趋势：Labubu引领2024年潮玩新风向', 
'2024年潮玩市场分析报告显示，Labubu已成为最受欢迎的潮玩品牌之一。其独特的设计风格和品牌文化正在引领整个行业的发展方向，成为年轻人的新宠。', 
'Labubu成2024年潮玩市场新宠，引领行业发展趋势', 
'潮流观察员', 
'潮流趋势', 
91.3, 
true, 
ARRAY['潮流趋势', '市场分析', '品牌文化'], 
NOW() - INTERVAL '12 hours'),

('活动预告：Labubu主题展览即将开幕', 
'Labubu品牌官方宣布，将于下月在上海举办大型主题展览。展览将展示品牌历史、设计理念以及最新产品，还有机会获得限量版纪念品。粉丝们不要错过这个难得的机会！', 
'Labubu上海主题展览下月开幕，限量纪念品等你来', 
'展览组委会', 
'活动预告', 
85.7, 
false, 
ARRAY['活动预告', '主题展览', '限量纪念品'], 
NOW() - INTERVAL '6 hours');

-- 🔥 插入热搜关键词
INSERT INTO public.trending_keywords (keyword, category, search_count, mention_count, hot_score, trend_direction) VALUES
('Labubu粉色系列', 'product', 1250, 890, 89.5, 'up'),
('Labubu盲盒', 'product', 2100, 1456, 95.2, 'up'),
('Labubu限量版', 'product', 980, 723, 78.3, 'stable'),
('Labubu收藏', 'guide', 856, 634, 72.1, 'up'),
('Labubu正品', 'guide', 734, 521, 65.8, 'stable'),
('Labubu展览', 'event', 623, 445, 58.9, 'up'),
('Labubu摄影', 'art', 445, 312, 52.3, 'stable'),
('Labubu潮流', 'trend', 567, 398, 61.7, 'up');

-- 🎉 数据库设置完成提示
SELECT '🎉 Labubu资讯聚合数据库设置完成！' as message;
SELECT '📊 表统计:' as info, 
       (SELECT COUNT(*) FROM news_articles) as articles_count,
       (SELECT COUNT(*) FROM trending_keywords) as keywords_count,
       (SELECT COUNT(*) FROM news_sources) as sources_count,
       (SELECT COUNT(*) FROM news_tags) as tags_count; 