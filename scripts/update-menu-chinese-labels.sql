-- 更新菜单项中文标签
-- 执行时间: 2025年01月22日

-- 更新现有菜单项的中文标签
UPDATE menu_items SET label = '首页' WHERE key = 'home';
UPDATE menu_items SET label = 'AI生成' WHERE key = 'generate';
UPDATE menu_items SET label = 'Labubu快报' WHERE key = 'labubu-news';
UPDATE menu_items SET label = '创意秀场' WHERE key = 'labubu-gallery';
UPDATE menu_items SET label = '价格套餐' WHERE key = 'pricing';
UPDATE menu_items SET label = '资源中心' WHERE key = 'resources';

-- 更新子菜单项的中文标签
UPDATE menu_items SET label = '资源中心' WHERE key = 'resources-hub';
UPDATE menu_items SET label = 'API文档' WHERE key = 'api-docs';

-- 显示更新结果
SELECT key, label, href, emoji, sort_order, is_visible 
FROM menu_items 
ORDER BY sort_order; 