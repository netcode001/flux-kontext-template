-- 🎨 Labubu社区功能数据库扩展脚本
-- 在基础数据库脚本执行完成后运行此脚本

-- 作品/帖子表
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  image_urls TEXT[] NOT NULL, -- 作品图片URL数组
  prompt TEXT, -- 生成图片时使用的提示词
  model VARCHAR, -- 使用的AI模型
  tags TEXT[], -- 标签数组
  is_featured BOOLEAN DEFAULT false, -- 是否精选
  is_public BOOLEAN DEFAULT true, -- 是否公开
  view_count INTEGER DEFAULT 0, -- 浏览次数
  like_count INTEGER DEFAULT 0, -- 点赞数
  comment_count INTEGER DEFAULT 0, -- 评论数
  bookmark_count INTEGER DEFAULT 0, -- 收藏数
  generation_id UUID REFERENCES public.generations(id), -- 关联的生成记录
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- 支持回复评论
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- 防止重复点赞
);

-- 收藏表
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- 防止重复收藏
);

-- 关注表
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- 关注者
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- 被关注者
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id), -- 防止重复关注
  CHECK(follower_id != following_id) -- 不能关注自己
);

-- 标签表
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- 十六进制颜色代码
  use_count INTEGER DEFAULT 0, -- 使用次数
  is_official BOOLEAN DEFAULT false, -- 是否官方标签
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 帖子标签关联表
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

-- 举报表
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL, -- 举报原因
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户统计表（扩展用户信息）
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  post_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_views_received INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1, -- 用户等级
  experience_points INTEGER DEFAULT 0, -- 经验值
  badges TEXT[], -- 徽章数组
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON public.posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_is_public ON public.posts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_use_count ON public.tags(use_count DESC);

-- 添加更新时间触发器
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建更新统计数据的函数
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 更新作品数量
    INSERT INTO public.user_stats (user_id, post_count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET post_count = user_stats.post_count + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 减少作品数量
    UPDATE public.user_stats 
    SET post_count = GREATEST(0, post_count - 1)
    WHERE user_id = OLD.user_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建更新点赞统计的函数
CREATE OR REPLACE FUNCTION update_like_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 增加帖子点赞数
    UPDATE public.posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
    
    -- 增加用户获得的点赞数
    UPDATE public.user_stats 
    SET total_likes_received = total_likes_received + 1
    WHERE user_id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 减少帖子点赞数
    UPDATE public.posts 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.post_id;
    
    -- 减少用户获得的点赞数
    UPDATE public.user_stats 
    SET total_likes_received = GREATEST(0, total_likes_received - 1)
    WHERE user_id = (SELECT user_id FROM public.posts WHERE id = OLD.post_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建更新关注统计的函数
CREATE OR REPLACE FUNCTION update_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 增加关注者的关注数
    INSERT INTO public.user_stats (user_id, following_count)
    VALUES (NEW.follower_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET following_count = user_stats.following_count + 1;
    
    -- 增加被关注者的粉丝数
    INSERT INTO public.user_stats (user_id, follower_count)
    VALUES (NEW.following_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET follower_count = user_stats.follower_count + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 减少关注者的关注数
    UPDATE public.user_stats 
    SET following_count = GREATEST(0, following_count - 1)
    WHERE user_id = OLD.follower_id;
    
    -- 减少被关注者的粉丝数
    UPDATE public.user_stats 
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER posts_stats_trigger AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_post_stats();
CREATE TRIGGER likes_stats_trigger AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION update_like_stats();
CREATE TRIGGER follows_stats_trigger AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION update_follow_stats();

-- 启用行级安全策略
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
-- 帖子策略：公开帖子所有人可见，私有帖子只有作者可见
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid()::text = user_id::text);

-- 评论策略：可以查看公开帖子的评论
CREATE POLICY "Comments are viewable for public posts" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND is_public = true)
);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid()::text = user_id::text);

-- 点赞策略
CREATE POLICY "Users can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.likes FOR ALL USING (auth.uid()::text = user_id::text);

-- 收藏策略
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid()::text = user_id::text);

-- 关注策略
CREATE POLICY "Users can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid()::text = follower_id::text);

-- 用户统计策略
CREATE POLICY "User stats are viewable by everyone" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 插入默认标签
INSERT INTO public.tags (name, description, color, is_official, use_count) VALUES
('labubu', 'Official Labubu character', '#FF6B9D', true, 0),
('cute', 'Cute and adorable', '#FFB6C1', true, 0),
('colorful', 'Bright and colorful', '#FF69B4', true, 0),
('fantasy', 'Fantasy themed', '#9370DB', true, 0),
('portrait', 'Character portrait', '#87CEEB', true, 0),
('scene', 'Scene or environment', '#98FB98', true, 0),
('minimalist', 'Simple and clean', '#F0F8FF', true, 0),
('detailed', 'Highly detailed', '#FFE4B5', true, 0)
ON CONFLICT (name) DO NOTHING;

-- 完成提示
SELECT 'Community database setup completed successfully!' as message;
SELECT 'Total tables created: ' || COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'; 