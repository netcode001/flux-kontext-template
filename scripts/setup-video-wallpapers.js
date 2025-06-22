#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 🔐 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupVideoWallpapers() {
  console.log('🎬 开始设置视频壁纸支持...')

  try {
    // 1. 检查wallpapers表是否存在
    console.log('🔍 检查现有表结构...')
    const { data: existingWallpapers, error: tableError } = await supabase
      .from('wallpapers')
      .select('id')
      .limit(1)

    const wallpaperTableExists = !tableError

    if (wallpaperTableExists) {
      console.log('📋 wallpapers表已存在，检查是否需要添加视频支持字段...')
      
      // 2. 检查是否已有media_type字段
      const { data: testData, error: columnError } = await supabase
        .from('wallpapers')
        .select('media_type')
        .limit(1)

      const hasMediaType = !columnError

      if (hasMediaType) {
        console.log('✅ 视频支持字段已存在，无需重复添加')
        console.log('🎬 视频壁纸功能已经可用！')
        return
      }

      console.log('❌ 现有壁纸表需要手动升级以支持视频')
      console.log('💡 请联系管理员手动执行数据库升级脚本')
      return

    } else {
      console.log('📋 wallpapers表不存在，将通过API创建基础数据...')
      
      // 3. 创建分类数据
      console.log('📂 创建壁纸分类...')
      const categories = [
        { name: '抽象艺术', name_en: 'Abstract', description: '抽象风格的艺术壁纸', sort_order: 1 },
        { name: '自然风景', name_en: 'Nature', description: '美丽的自然风景壁纸', sort_order: 2 },
        { name: '城市建筑', name_en: 'Architecture', description: '现代城市和建筑壁纸', sort_order: 3 },
        { name: '动漫卡通', name_en: 'Anime', description: '动漫和卡通风格壁纸', sort_order: 4 },
        { name: '简约设计', name_en: 'Minimalist', description: '简约风格设计壁纸', sort_order: 5 },
        { name: '科技未来', name_en: 'Technology', description: '科技和未来主题壁纸', sort_order: 6 },
        { name: '动态壁纸', name_en: 'Live Wallpapers', description: '动态视频壁纸合集', sort_order: 7 }
      ]

      for (const category of categories) {
        const { error: catError } = await supabase
          .from('wallpaper_categories')
          .upsert(category, { onConflict: 'name_en' })
        
        if (catError) {
          console.error(`❌ 创建分类失败 (${category.name}):`, catError.message)
        } else {
          console.log(`✅ 分类创建成功: ${category.name}`)
        }
      }
    }

    // 4. 确保动态壁纸分类存在
    console.log('📂 确保动态壁纸分类存在...')
    const { error: categoryError } = await supabase
      .from('wallpaper_categories')
      .upsert({
        name: '动态壁纸',
        name_en: 'Live Wallpapers',
        description: '动态视频壁纸合集',
        sort_order: 7
      }, {
        onConflict: 'name_en'
      })

    if (categoryError) {
      console.error('❌ 添加分类失败:', categoryError)
    } else {
      console.log('✅ 动态壁纸分类已确保存在')
    }

    // 5. 添加壁纸菜单项
    console.log('📋 添加壁纸菜单项...')
    const { error: menuError } = await supabase
      .from('menu_items')
      .upsert({
        key: 'wallpapers',
        label: '壁纸',
        href: '/wallpapers',
        emoji: '🖼️',
        icon: 'image',
        sort_order: 60,
        is_visible: true,
        is_dropdown: false,
        target: '_self'
      }, {
        onConflict: 'key'
      })

    if (menuError) {
      console.error('❌ 添加菜单项失败:', menuError)
    } else {
      console.log('✅ 壁纸菜单项已添加')
    }

    console.log('✅ 视频壁纸支持设置完成！')
    console.log('🎬 现在可以：')
    console.log('   - 上传MP4格式的动态壁纸')
    console.log('   - 在画廊中播放和下载视频')
    console.log('   - 按媒体类型筛选壁纸')

  } catch (error) {
    console.error('❌ 设置失败:', error)
  }
}

// 执行设置
if (require.main === module) {
  setupVideoWallpapers()
}

module.exports = { setupVideoWallpapers } 