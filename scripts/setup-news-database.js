const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 🔧 加载环境变量
require('dotenv').config({ path: '.env.local' })

// 🔧 Supabase客户端配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 📝 数据库表创建SQL
const createTablesSQL = `
-- 📰 Labubu资讯聚合数据库表结构
-- v2.0 资讯聚合版功能支持

-- 🏷️ 新闻来源表
CREATE TABLE IF NOT EXISTS public.news_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
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
  published_at TIMESTAMP WITH TIME ZONE,
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
  
  status VARCHAR(20) DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(original_url, source_id)
);

-- 🔥 热搜关键词表
CREATE TABLE IF NOT EXISTS public.trending_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL,
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
`

// 📊 创建索引和触发器
const createIndexesSQL = `
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
`

// 📊 创建视图
const createViewsSQL = `
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
`

// 📝 插入初始数据
const insertInitialDataSQL = `
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
`

// 🚀 执行数据库设置
async function setupNewsDatabase() {
  try {
    console.log('🚀 开始创建资讯聚合数据库表...')

    // 1. 创建新闻来源表
    console.log('📊 创建新闻来源表...')
    const { error: sourcesError } = await supabase
      .from('news_sources')
      .select('id')
      .limit(1)
    
    if (sourcesError && sourcesError.code === 'PGRST116') {
      console.log('❌ 表不存在，需要手动创建数据库表')
      console.log('📝 请在Supabase后台SQL编辑器中执行以下SQL:')
      console.log('=' * 80)
      console.log(createTablesSQL)
      console.log('=' * 80)
      console.log(createIndexesSQL)
      console.log('=' * 80)
      console.log(createViewsSQL)
      console.log('=' * 80)
      return
    }

    // 2. 插入初始数据源
    console.log('📝 插入初始数据源...')
    const sources = [
      { name: '微博Labubu话题', type: 'social_media', url: 'https://weibo.com/k/labubu', is_active: true },
      { name: '小红书Labubu', type: 'social_media', url: 'https://www.xiaohongshu.com/search_result?keyword=labubu', is_active: true },
      { name: 'Twitter Labubu', type: 'social_media', url: 'https://twitter.com/search?q=labubu', is_active: true },
      { name: 'Instagram Labubu', type: 'social_media', url: 'https://www.instagram.com/explore/tags/labubu/', is_active: true },
      { name: 'YouTube Labubu', type: 'social_media', url: 'https://www.youtube.com/results?search_query=labubu', is_active: true }
    ]

    for (const source of sources) {
      const { error } = await supabase
        .from('news_sources')
        .upsert(source, { onConflict: 'name' })
      
      if (error) {
        console.log('数据源插入错误:', source.name, error.message)
      }
    }

    // 3. 插入初始标签
    console.log('🏷️ 插入初始标签...')
    const tags = [
      { name: '新品发布', category: 'product', color: '#FF6B6B' },
      { name: '活动预告', category: 'event', color: '#4ECDC4' },
      { name: '开箱评测', category: 'review', color: '#45B7D1' },
      { name: '收藏攻略', category: 'guide', color: '#96CEB4' },
      { name: '周边产品', category: 'merchandise', color: '#FFEAA7' },
      { name: '艺术创作', category: 'art', color: '#DDA0DD' },
      { name: '潮流趋势', category: 'trend', color: '#FFB6C1' },
      { name: '限量版', category: 'limited', color: '#FF7F50' }
    ]

    for (const tag of tags) {
      const { error } = await supabase
        .from('news_tags')
        .upsert(tag, { onConflict: 'name' })
      
      if (error) {
        console.log('标签插入错误:', tag.name, error.message)
      }
    }

    console.log('🎉 资讯聚合数据库设置完成！')
    console.log('📊 可以访问 http://localhost:3000/labubu-news 查看资讯页面')

  } catch (error) {
    console.error('🚨 数据库设置过程出错:', error)
  }
}

// 🎯 运行脚本
if (require.main === module) {
  setupNewsDatabase()
}

module.exports = { setupNewsDatabase } 