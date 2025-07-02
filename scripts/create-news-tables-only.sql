-- 📰 新闻管理数据库表结构
-- 创建新闻关键词表
CREATE TABLE IF NOT EXISTS news_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建新闻来源表
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建新闻文章表（可选，用于存储抓取的新闻）
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  url TEXT UNIQUE,
  source_name VARCHAR(255),
  source_url TEXT,
  author VARCHAR(255),
  published_at TIMESTAMPTZ,
  image_url TEXT,
  keywords TEXT[], -- 关联的关键词数组
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认的新闻来源数据
INSERT INTO news_sources (name, url, enabled) VALUES
  ('BBC News', 'https://www.bbc.com/news', true),
  ('CNN', 'https://www.cnn.com', true),
  ('Reuters', 'https://www.reuters.com', true),
  ('Entertainment Weekly', 'https://ew.com', true),
  ('Hypebeast', 'https://hypebeast.com', true)
ON CONFLICT (name) DO NOTHING;

-- 插入默认的关键词数据
INSERT INTO news_keywords (keyword, enabled) VALUES
  ('labubu', true),
  ('technology', true),
  ('entertainment', true),
  ('fashion', true),
  ('lifestyle', true)
ON CONFLICT (keyword) DO NOTHING;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_news_keywords_keyword ON news_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_news_keywords_enabled ON news_keywords(enabled);
CREATE INDEX IF NOT EXISTS idx_news_sources_enabled ON news_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_active ON news_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_news_articles_keywords ON news_articles USING GIN(keywords);

-- 添加更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_keywords_updated_at 
  BEFORE UPDATE ON news_keywords 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_sources_updated_at 
  BEFORE UPDATE ON news_sources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at 
  BEFORE UPDATE ON news_articles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 