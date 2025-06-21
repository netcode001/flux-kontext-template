-- 🕷️ 爬虫配置管理表
-- 用于存储各种爬虫的开关状态和配置

-- 创建爬虫配置表
CREATE TABLE IF NOT EXISTS crawler_config (
  id SERIAL PRIMARY KEY,
  crawler_name VARCHAR(50) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认爬虫配置
INSERT INTO crawler_config (crawler_name, is_enabled, config) VALUES
  ('x_api_crawler', false, '{"max_results": 100, "since_hours": 24, "lang": "en"}'),
  ('news_crawler', false, '{"sources": ["hypebeast", "toy_news"], "interval": 30}'),
  ('advanced_content_crawler', false, '{"platforms": ["weibo", "xiaohongshu"], "interval": 120}'),
  ('python_crawler', false, '{"platforms": ["reddit", "twitter"], "keywords": ["labubu"]}'),
  ('youtube_crawler', false, '{"max_results": 50, "region": "global"}')
ON CONFLICT (crawler_name) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_crawler_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crawler_config_updated_at
  BEFORE UPDATE ON crawler_config
  FOR EACH ROW
  EXECUTE FUNCTION update_crawler_config_updated_at();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_crawler_config_name ON crawler_config(crawler_name);
CREATE INDEX IF NOT EXISTS idx_crawler_config_enabled ON crawler_config(is_enabled);

-- 添加注释
COMMENT ON TABLE crawler_config IS '爬虫配置管理表，存储各种爬虫的开关状态';
COMMENT ON COLUMN crawler_config.crawler_name IS '爬虫名称，唯一标识';
COMMENT ON COLUMN crawler_config.is_enabled IS '是否启用爬虫';
COMMENT ON COLUMN crawler_config.config IS '爬虫配置参数，JSON格式'; 