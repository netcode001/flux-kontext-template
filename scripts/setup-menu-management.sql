-- 菜单管理系统数据库表
-- 创建时间: 2025年01月22日
-- 用途: 动态管理网站header菜单配置

-- 主菜单配置表
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL, -- 菜单唯一标识符 (如: home, generate, labubu-news等)
    label VARCHAR(100) NOT NULL, -- 显示名称
    label_key VARCHAR(50), -- 多语言key (如果使用国际化)
    href VARCHAR(255) NOT NULL, -- 链接地址
    emoji VARCHAR(10), -- emoji图标
    icon VARCHAR(50), -- 图标名称 (如果使用图标库)
    sort_order INTEGER NOT NULL DEFAULT 0, -- 排序顺序
    is_visible BOOLEAN NOT NULL DEFAULT true, -- 是否可见
    is_dropdown BOOLEAN NOT NULL DEFAULT false, -- 是否有下拉菜单
    parent_id UUID REFERENCES menu_items(id), -- 父菜单ID (用于下拉菜单)
    target VARCHAR(20) DEFAULT '_self', -- 链接目标 (_self, _blank等)
    css_class VARCHAR(255), -- 自定义CSS类
    permission_required VARCHAR(100), -- 需要的权限 (如: admin, premium等)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_visible ON menu_items(is_visible);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_key ON menu_items(key);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_menu_items_updated_at();

-- 插入默认菜单数据
INSERT INTO menu_items (key, label, href, emoji, sort_order, is_visible, is_dropdown) VALUES
('home', 'Home', '/', '🏠', 1, true, false),
('generate', 'Generate', '/generate', '✨', 2, true, false),
('labubu-news', 'Labubu快报', '/labubu-news', '📰', 3, true, false),
('labubu-gallery', '创意秀场', '/labubu-gallery', '🎨', 4, true, false),
('pricing', 'Pricing', '/pricing', '💎', 5, true, false),
('resources', 'Resources', '/resources', '📚', 6, true, true)
ON CONFLICT (key) DO NOTHING;

-- 插入Resources下拉菜单项
INSERT INTO menu_items (key, label, href, emoji, sort_order, is_visible, is_dropdown, parent_id) VALUES
('resources-hub', 'Resources Hub', '/resources', '📚', 1, true, false, (SELECT id FROM menu_items WHERE key = 'resources')),
('api-docs', 'API Documentation', '/resources/api', '📖', 2, true, false, (SELECT id FROM menu_items WHERE key = 'resources'))
ON CONFLICT (key) DO NOTHING;

-- 设置行级安全策略 (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 管理员可以完全访问菜单配置
CREATE POLICY "Admins can do everything on menu_items" ON menu_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
        )
    );

-- 普通用户只能查看可见的菜单项
CREATE POLICY "Everyone can view visible menu_items" ON menu_items
    FOR SELECT
    TO authenticated, anon
    USING (is_visible = true);

-- 添加注释
COMMENT ON TABLE menu_items IS '网站导航菜单配置表';
COMMENT ON COLUMN menu_items.key IS '菜单唯一标识符';
COMMENT ON COLUMN menu_items.label IS '菜单显示名称';
COMMENT ON COLUMN menu_items.href IS '菜单链接地址';
COMMENT ON COLUMN menu_items.sort_order IS '菜单排序顺序，数字越小越靠前';
COMMENT ON COLUMN menu_items.is_visible IS '菜单是否可见';
COMMENT ON COLUMN menu_items.is_dropdown IS '是否有下拉子菜单';
COMMENT ON COLUMN menu_items.parent_id IS '父菜单ID，用于构建下拉菜单结构'; 