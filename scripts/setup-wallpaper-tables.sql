-- 壁纸功能数据库表设计
-- 执行时间: 2025年01月22日

-- 1. 壁纸分类表
CREATE TABLE wallpaper_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- 分类名称
  name_en VARCHAR(100) NOT NULL, -- 英文名称
  description TEXT, -- 分类描述
  cover_image TEXT, -- 分类封面图
  sort_order INTEGER DEFAULT 0, -- 排序
  is_active BOOLEAN DEFAULT true, -- 是否启用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 壁纸主表（扩展支持视频）
CREATE TABLE wallpapers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL, -- 壁纸标题
  title_en VARCHAR(200), -- 英文标题
  description TEXT, -- 壁纸描述
  category_id UUID REFERENCES wallpaper_categories(id) ON DELETE SET NULL, -- 分类ID
  
  -- 媒体类型和URL字段
  media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')), -- 媒体类型
  image_url TEXT, -- 图片URL（静态壁纸）
  video_url TEXT, -- 视频URL（动态壁纸）
  thumbnail_url TEXT, -- 缩略图URL
  preview_gif_url TEXT, -- 预览GIF URL（用于视频预览）
  
  -- 文件信息
  original_filename VARCHAR(255), -- 原始文件名
  file_size BIGINT, -- 文件大小(字节)
  dimensions JSONB, -- 尺寸信息 {"width": 1920, "height": 1080}
  
  -- 视频特有属性
  duration INTEGER, -- 视频时长(秒)
  frame_rate DECIMAL(5,2), -- 帧率
  video_codec VARCHAR(50), -- 视频编码格式
  audio_codec VARCHAR(50), -- 音频编码格式（如果有）
  has_audio BOOLEAN DEFAULT false, -- 是否包含音频
  
  -- 通用属性
  tags TEXT[], -- 标签数组
  is_premium BOOLEAN DEFAULT false, -- 是否需要会员
  is_featured BOOLEAN DEFAULT false, -- 是否精选
  is_active BOOLEAN DEFAULT true, -- 是否启用
  download_count INTEGER DEFAULT 0, -- 下载次数
  view_count INTEGER DEFAULT 0, -- 浏览次数
  like_count INTEGER DEFAULT 0, -- 点赞次数
  uploaded_by VARCHAR(255), -- 上传者ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束检查
  CONSTRAINT wallpapers_title_check CHECK (length(title) > 0),
  CONSTRAINT wallpapers_media_url_check CHECK (
    (media_type = 'image' AND image_url IS NOT NULL) OR 
    (media_type = 'video' AND video_url IS NOT NULL)
  ),
  CONSTRAINT wallpapers_video_duration_check CHECK (
    (media_type = 'video' AND duration > 0) OR media_type = 'image'
  )
);

-- 3. 壁纸下载记录表
CREATE TABLE wallpaper_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  user_id VARCHAR(255), -- 用户ID
  user_email VARCHAR(255), -- 用户邮箱
  ip_address INET, -- 用户IP
  user_agent TEXT, -- 用户代理
  download_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 防止重复下载记录（同一用户同一壁纸每天只记录一次）
  UNIQUE(wallpaper_id, user_id, DATE(download_at))
);

-- 4. 壁纸点赞表
CREATE TABLE wallpaper_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallpaper_id UUID REFERENCES wallpapers(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- 用户ID
  user_email VARCHAR(255), -- 用户邮箱
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 防止重复点赞
  UNIQUE(wallpaper_id, user_id)
);

-- 创建索引
CREATE INDEX idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX idx_wallpapers_active ON wallpapers(is_active);
CREATE INDEX idx_wallpapers_featured ON wallpapers(is_featured);
CREATE INDEX idx_wallpapers_premium ON wallpapers(is_premium);
CREATE INDEX idx_wallpapers_media_type ON wallpapers(media_type); -- 新增：媒体类型索引
CREATE INDEX idx_wallpapers_created_at ON wallpapers(created_at DESC);
CREATE INDEX idx_wallpapers_download_count ON wallpapers(download_count DESC);
CREATE INDEX idx_wallpapers_tags ON wallpapers USING GIN(tags);

CREATE INDEX idx_wallpaper_downloads_user ON wallpaper_downloads(user_id);
CREATE INDEX idx_wallpaper_downloads_wallpaper ON wallpaper_downloads(wallpaper_id);
CREATE INDEX idx_wallpaper_downloads_date ON wallpaper_downloads(download_at DESC);

CREATE INDEX idx_wallpaper_likes_user ON wallpaper_likes(user_id);
CREATE INDEX idx_wallpaper_likes_wallpaper ON wallpaper_likes(wallpaper_id);

-- 插入默认分类数据（包含动态壁纸分类）
INSERT INTO wallpaper_categories (name, name_en, description, sort_order) VALUES
('抽象艺术', 'Abstract', '抽象风格的艺术壁纸', 1),
('自然风景', 'Nature', '美丽的自然风景壁纸', 2),
('城市建筑', 'Architecture', '现代城市和建筑壁纸', 3),
('动漫卡通', 'Anime', '动漫和卡通风格壁纸', 4),
('简约设计', 'Minimalist', '简约风格设计壁纸', 5),
('科技未来', 'Technology', '科技和未来主题壁纸', 6),
('动态壁纸', 'Live Wallpapers', '动态视频壁纸合集', 7); -- 新增动态壁纸分类

-- 插入示例壁纸数据（静态）
INSERT INTO wallpapers (title, title_en, description, category_id, media_type, image_url, thumbnail_url, dimensions, tags, is_featured) 
SELECT 
  '梦幻抽象', 'Dream Abstract', '色彩丰富的梦幻抽象艺术', 
  (SELECT id FROM wallpaper_categories WHERE name_en = 'Abstract' LIMIT 1),
  'image',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop',
  '{"width": 1920, "height": 1080}',
  ARRAY['抽象', '艺术', '色彩'],
  true;

-- 插入示例视频壁纸数据
INSERT INTO wallpapers (title, title_en, description, category_id, media_type, video_url, thumbnail_url, preview_gif_url, dimensions, duration, frame_rate, has_audio, tags, is_featured, is_premium) 
SELECT 
  '流动星空', 'Flowing Stars', '梦幻的流动星空动态壁纸', 
  (SELECT id FROM wallpaper_categories WHERE name_en = 'Live Wallpapers' LIMIT 1),
  'video',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', -- 示例视频URL
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', -- 示例GIF预览
  '{"width": 1280, "height": 720}',
  30, -- 30秒
  30.0, -- 30fps
  false, -- 无音频
  ARRAY['星空', '动态', '梦幻', '流动'],
  true,
  true; -- 设为Premium内容

-- 更新菜单表，添加壁纸菜单项
DO $$
BEGIN
  -- 检查是否已存在壁纸菜单项
  IF NOT EXISTS (SELECT 1 FROM menu_items WHERE key = 'wallpapers') THEN
    INSERT INTO menu_items (key, label, href, emoji, icon, sort_order, is_visible, is_dropdown, target)
    VALUES ('wallpapers', '壁纸', '/wallpapers', '🖼️', 'image', 60, true, false, '_self');
  END IF;
END $$;

-- 创建RLS策略
ALTER TABLE wallpaper_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpaper_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallpaper_likes ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "wallpaper_categories_public_read" ON wallpaper_categories FOR SELECT USING (is_active = true);
CREATE POLICY "wallpapers_public_read" ON wallpapers FOR SELECT USING (is_active = true);

-- 管理员写入策略（需要根据实际认证系统调整）
CREATE POLICY "wallpaper_categories_admin_write" ON wallpaper_categories FOR ALL USING (true);
CREATE POLICY "wallpapers_admin_write" ON wallpapers FOR ALL USING (true);

-- 用户下载记录策略
CREATE POLICY "wallpaper_downloads_user_insert" ON wallpaper_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "wallpaper_downloads_user_read" ON wallpaper_downloads FOR SELECT USING (true);

-- 用户点赞策略
CREATE POLICY "wallpaper_likes_user_all" ON wallpaper_likes FOR ALL USING (true);

-- 创建触发器更新updated_at
CREATE OR REPLACE FUNCTION update_wallpaper_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallpaper_categories_updated_at
  BEFORE UPDATE ON wallpaper_categories
  FOR EACH ROW EXECUTE FUNCTION update_wallpaper_updated_at();

CREATE TRIGGER update_wallpapers_updated_at
  BEFORE UPDATE ON wallpapers
  FOR EACH ROW EXECUTE FUNCTION update_wallpaper_updated_at();

-- 显示创建结果
SELECT 'Wallpaper tables with video support created successfully!' as status;
SELECT COUNT(*) as category_count FROM wallpaper_categories;
SELECT COUNT(*) as wallpaper_count FROM wallpapers;
SELECT COUNT(*) as video_wallpaper_count FROM wallpapers WHERE media_type = 'video'; 