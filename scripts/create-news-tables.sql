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

-- 📰 插入测试资讯文章 (包含明星、价格、穿搭等热门内容)
INSERT INTO public.news_articles (title, content, summary, author, category, hot_score, is_featured, tags, published_at) VALUES
('Lisa同款Labubu价格暴涨！限量版拍卖破万元', 
'自从Lisa在社交媒体晒出Labubu收藏后，相关产品价格一路飙升。据统计，Lisa同款限量版Labubu在二手市场的拍卖价格已突破万元大关，成为潮玩收藏界的新宠。专家提醒收藏者理性消费，警惕价格泡沫。', 
'Lisa效应带动Labubu价格暴涨，限量版拍卖破万引关注', 
'财经记者小张', 
'新品发布', 
98.5, 
true, 
ARRAY['明星同款', '价格', '拍卖', 'Lisa'], 
NOW() - INTERVAL '1 hour'),

('Labubu穿搭指南：如何为你的玩偶定制专属造型', 
'Labubu不仅是收藏品，更是时尚单品！本期为大家带来详细的Labubu穿搭指南，从基础配饰到高级定制，教你打造独一无二的玩偶造型。包含春夏秋冬四季穿搭方案，以及节日主题造型设计。', 
'Labubu穿搭指南大全，定制专属造型展现个性魅力', 
'时尚博主小雅', 
'潮流趋势', 
92.8, 
true, 
ARRAY['穿搭', '定制', '造型', '配饰'], 
NOW() - INTERVAL '3 hours'),

('独家！Labubu改款升级内幕曝光，新版本即将发售', 
'据内部消息透露，Labubu品牌正在进行重大改款升级，新版本将在材质、工艺和设计上全面提升。改款后的Labubu将采用更环保的材料，增加可动关节，并推出更多个性化定制选项。预计下月正式发售。', 
'Labubu改款升级内幕曝光，新版本功能大幅提升', 
'行业内幕君', 
'新品发布', 
89.7, 
false, 
ARRAY['改款', '升级', '新版本', '定制'], 
NOW() - INTERVAL '6 hours'),

('明星收藏Labubu成风潮，网红带货效应显著', 
'继Lisa之后，越来越多明星开始收藏和展示Labubu。从杨幂到迪丽热巴，从欧阳娜娜到宋茜，明星们的Labubu收藏引发粉丝跟风购买。网红带货效应让Labubu销量暴增300%，成为2024年最火潮玩。', 
'明星收藏Labubu引发跟风潮，网红带货效应推动销量暴增', 
'娱乐记者小王', 
'潮流趋势', 
94.2, 
true, 
ARRAY['明星', '网红', '收藏', '带货'], 
NOW() - INTERVAL '4 hours'),

('Labubu拍卖市场火热，稀有款式价格创新高', 
'在刚刚结束的潮玩拍卖会上，一只稀有的Labubu隐藏款以15万元的天价成交，创下单只Labubu拍卖价格新纪录。拍卖师表示，Labubu已成为继潮鞋之后的新兴投资收藏品类，未来升值空间巨大。', 
'Labubu拍卖价格创新高，稀有款式成投资新宠', 
'拍卖行专家', 
'收藏攻略', 
87.6, 
false, 
ARRAY['拍卖', '价格', '投资', '稀有款'], 
NOW() - INTERVAL '8 hours'),

('Labubu定制服务上线，个性化需求引爆市场', 
'Labubu官方正式推出定制服务，用户可以根据个人喜好定制独特的造型、颜色和配饰。定制服务一经推出就引发抢购热潮，首批1000个定制名额在30分钟内售罄。定制价格从899元到3999元不等。', 
'Labubu定制服务火爆上线，个性化定制引发抢购潮', 
'Labubu官方', 
'新品发布', 
91.4, 
true, 
ARRAY['定制', '个性化', '官方', '服务'], 
NOW() - INTERVAL '12 hours'),

('Labubu摄影大赛开启，创意场景拍摄技巧分享', 
'首届Labubu摄影大赛正式启动，主题为"我的Labubu世界"。专业摄影师分享独家拍摄技巧，从布景搭建到光影控制，教你拍出ins风格的Labubu大片。获奖作品将有机会成为官方宣传素材。', 
'Labubu摄影大赛启动，专业技巧助你拍出完美大片', 
'摄影大师老李', 
'艺术创作', 
83.9, 
false, 
ARRAY['摄影', '大赛', '创意', '技巧'], 
NOW() - INTERVAL '10 hours'),

('Labubu联名合作不断，品牌价值持续攀升', 
'Labubu与多个知名品牌达成联名合作，从奢侈品牌到快消品牌，从时尚界到科技界，Labubu的跨界合作版图不断扩大。业内专家认为，频繁的联名合作正在推动Labubu品牌价值的持续攀升。', 
'Labubu联名合作版图扩大，品牌价值持续攀升', 
'品牌分析师', 
'潮流趋势', 
86.3, 
false, 
ARRAY['联名', '合作', '品牌', '价值'], 
NOW() - INTERVAL '14 hours');

-- 🔥 插入热搜关键词 (参考小红书和谷歌热搜)
INSERT INTO public.trending_keywords (keyword, category, search_count, mention_count, hot_score, trend_direction) VALUES
-- 🎯 产品相关热搜
('Labubu盲盒', 'product', 2100, 1456, 95.2, 'up'),
('Labubu粉色系列', 'product', 1250, 890, 89.5, 'up'),
('Labubu限量版', 'product', 980, 723, 78.3, 'stable'),
('Labubu隐藏款', 'product', 1180, 834, 85.7, 'up'),
('Labubu改款', 'product', 756, 523, 68.9, 'up'),
('Labubu定制', 'product', 645, 478, 62.3, 'up'),
('Labubu联名', 'product', 892, 634, 74.5, 'up'),

-- 💰 价格相关热搜
('Labubu价格', 'price', 1890, 1234, 92.8, 'up'),
('Labubu多少钱', 'price', 1567, 1098, 87.6, 'up'),
('Labubu拍卖', 'price', 734, 521, 65.8, 'up'),
('Labubu二手', 'price', 623, 445, 58.9, 'stable'),
('Labubu涨价', 'price', 456, 312, 52.3, 'up'),

-- 🌟 明星相关热搜
('Lisa Labubu', 'celebrity', 2890, 2134, 98.7, 'up'),
('明星同款Labubu', 'celebrity', 1456, 1023, 84.2, 'up'),
('Labubu代言人', 'celebrity', 789, 567, 69.4, 'stable'),
('网红Labubu', 'celebrity', 634, 445, 58.9, 'up'),

-- 👗 穿搭相关热搜
('Labubu穿搭', 'fashion', 1234, 867, 81.5, 'up'),
('Labubu配饰', 'fashion', 756, 523, 68.9, 'up'),
('Labubu造型', 'fashion', 645, 478, 62.3, 'stable'),
('Labubu服装', 'fashion', 567, 398, 56.7, 'up'),

-- 📸 拍摄创作热搜
('Labubu摄影', 'art', 892, 634, 74.5, 'up'),
('Labubu拍照', 'art', 734, 521, 65.8, 'stable'),
('Labubu场景', 'art', 623, 445, 58.9, 'up'),
('Labubu布景', 'art', 456, 312, 52.3, 'stable'),

-- 🎨 收藏攻略热搜
('Labubu收藏', 'guide', 856, 634, 72.1, 'up'),
('Labubu正品', 'guide', 734, 521, 65.8, 'stable'),
('Labubu鉴定', 'guide', 645, 478, 62.3, 'up'),
('Labubu保养', 'guide', 456, 312, 52.3, 'stable'),

-- 🎪 活动事件热搜
('Labubu展览', 'event', 623, 445, 58.9, 'up'),
('Labubu发售', 'event', 789, 567, 69.4, 'up'),
('Labubu抽签', 'event', 567, 398, 56.7, 'up'),
('Labubu快闪店', 'event', 456, 312, 52.3, 'stable'),

-- 🔥 潮流趋势热搜
('Labubu潮流', 'trend', 567, 398, 61.7, 'up'),
('Labubu文化', 'trend', 445, 312, 52.3, 'stable'),
('Labubu社区', 'trend', 389, 267, 48.6, 'up'),
('Labubu周边', 'trend', 456, 312, 52.3, 'stable');

-- 🎉 数据库设置完成提示
SELECT '🎉 Labubu资讯聚合数据库设置完成！' as message;
SELECT '📊 表统计:' as info, 
       (SELECT COUNT(*) FROM news_articles) as articles_count,
       (SELECT COUNT(*) FROM trending_keywords) as keywords_count,
       (SELECT COUNT(*) FROM news_sources) as sources_count,
       (SELECT COUNT(*) FROM news_tags) as tags_count;

-- 📈 热搜关键词分类统计
SELECT '🔥 热搜关键词分类统计:' as category_stats;
SELECT 
  category,
  COUNT(*) as keyword_count,
  AVG(hot_score) as avg_hot_score
FROM trending_keywords 
GROUP BY category 
ORDER BY avg_hot_score DESC; 