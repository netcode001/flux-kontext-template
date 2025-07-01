-- YouTube视频管理系统数据库表结构
-- 创建时间: 2024-12-22

-- 搜索关键词配置表
CREATE TABLE IF NOT EXISTS youtube_search_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,                    -- 搜索关键词，如"Labubu 明星 Lisa"
  category_name VARCHAR(100) NOT NULL,      -- 分类显示名称，如"明星联名"  
  max_results INTEGER DEFAULT 10,
  last_search_at TIMESTAMPTZ,              -- 最后搜索时间
  video_count INTEGER DEFAULT 0,           -- 该关键词下的视频数量
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube视频表
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id VARCHAR(50) UNIQUE NOT NULL,     -- YouTube视频ID
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_title VARCHAR(255),
  channel_id VARCHAR(50),
  published_at TIMESTAMPTZ,
  duration_iso VARCHAR(20),                 -- ISO 8601格式，如"PT5M30S"
  duration_seconds INTEGER,                 -- 转换后的秒数
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  iframe_embed_code TEXT,                   -- 完整的iframe代码
  search_keyword TEXT,                      -- 搜索时使用的关键词
  category_name VARCHAR(100),               -- 动态分类名称
  is_featured BOOLEAN DEFAULT FALSE,        -- 是否在首页展示
  is_active BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,                         -- 管理员备注
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON youtube_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_category ON youtube_videos(category_name);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_featured ON youtube_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_active ON youtube_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_youtube_search_keywords_category ON youtube_search_keywords(category_name);

-- 插入示例关键词
INSERT INTO youtube_search_keywords (keyword, category_name, max_results) VALUES
('Labubu 明星 Lisa', '明星联名', 10),
('Labubu 开箱 评测', '开箱评测', 10),
('Labubu 价格 多少钱', '价格分析', 10)
ON CONFLICT DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为两个表添加更新时间触发器
DROP TRIGGER IF EXISTS update_youtube_videos_updated_at ON youtube_videos;
CREATE TRIGGER update_youtube_videos_updated_at 
    BEFORE UPDATE ON youtube_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_youtube_search_keywords_updated_at ON youtube_search_keywords;
CREATE TRIGGER update_youtube_search_keywords_updated_at 
    BEFORE UPDATE ON youtube_search_keywords 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 