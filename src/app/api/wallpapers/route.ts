import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { UserType, getUserLimits } from '@/lib/user-tiers'
import type { WallpaperListParams, WallpaperListResponse } from '@/types/wallpaper'

// 🔐 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📝 请求参数验证Schema
const wallpaperParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  category_id: z.string().uuid().optional(),
  featured: z.coerce.boolean().optional(),
  premium: z.coerce.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  tags: z.string().optional().transform(val => val ? val.split(',').map(t => t.trim()) : undefined),
  sort: z.enum(['latest', 'popular', 'downloads', 'likes']).default('latest')
})

// 🔍 GET /api/wallpapers - 获取壁纸列表
export async function GET(request: NextRequest) {
  try {
    // 📊 解析查询参数
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // 🛡️ 验证参数
    const validatedParams = wallpaperParamsSchema.parse(params)
    const { page, limit, category_id, featured, premium, search, tags, sort } = validatedParams
    
    // 🔐 检查用户认证状态
    const session = await getServerSession(authOptions)
    const isAuthenticated = !!session?.user
    
    // 🎯 获取用户类型（暂时将所有登录用户设为注册用户，后续可根据支付状态确定Premium）
    const userType = session?.user ? UserType.REGISTERED : UserType.ANONYMOUS
    const isPremium = false // 暂时设为false，后续可根据支付状态确定
    
    console.log('🖼️ 获取壁纸列表:', { 
      page, 
      limit, 
      category_id, 
      featured, 
      premium, 
      search, 
      tags, 
      sort,
      isAuthenticated,
      isPremium
    })

    // 📊 构建壁纸查询
    let wallpaperQuery = supabase
      .from('wallpapers')
      .select(`
        *,
        category:wallpaper_categories(*)
      `)
      .eq('is_active', true)
    
    // 🔍 应用筛选条件
    if (category_id) {
      wallpaperQuery = wallpaperQuery.eq('category_id', category_id)
    }
    
    if (featured !== undefined) {
      wallpaperQuery = wallpaperQuery.eq('is_featured', featured)
    }
    
    // 🎯 Premium内容权限控制
    if (!isPremium) {
      // 非会员用户只能看到免费内容
      wallpaperQuery = wallpaperQuery.eq('is_premium', false)
    } else if (premium !== undefined) {
      // 会员用户可以筛选Premium内容
      wallpaperQuery = wallpaperQuery.eq('is_premium', premium)
    }
    
    // 🔍 搜索功能
    if (search) {
      wallpaperQuery = wallpaperQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // 🏷️ 标签筛选
    if (tags && tags.length > 0) {
      wallpaperQuery = wallpaperQuery.overlaps('tags', tags)
    }
    
    // 📈 排序
    switch (sort) {
      case 'popular':
        wallpaperQuery = wallpaperQuery.order('view_count', { ascending: false })
        break
      case 'downloads':
        wallpaperQuery = wallpaperQuery.order('download_count', { ascending: false })
        break
      case 'likes':
        wallpaperQuery = wallpaperQuery.order('like_count', { ascending: false })
        break
      case 'latest':
      default:
        wallpaperQuery = wallpaperQuery.order('created_at', { ascending: false })
        break
    }
    
    // 📄 分页
    const offset = (page - 1) * limit
    wallpaperQuery = wallpaperQuery.range(offset, offset + limit - 1)
    
    // 🎯 执行查询
    const { data: wallpapers, error: wallpaperError, count } = await wallpaperQuery
    
    if (wallpaperError) {
      console.error('❌ 获取壁纸列表失败:', wallpaperError)
      return NextResponse.json(
        { success: false, error: '获取壁纸列表失败' },
        { status: 500 }
      )
    }

    // 📂 获取所有分类
    const { data: categories, error: categoryError } = await supabase
      .from('wallpaper_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (categoryError) {
      console.error('❌ 获取分类失败:', categoryError)
      return NextResponse.json(
        { success: false, error: '获取分类失败' },
        { status: 500 }
      )
    }

    // 💝 如果用户已登录，获取用户的点赞状态
    let userLikes: string[] = []
    if (isAuthenticated && wallpapers.length > 0) {
      const wallpaperIds = wallpapers.map(w => w.id)
      const { data: likes } = await supabase
        .from('wallpaper_likes')
        .select('wallpaper_id')
        .eq('user_id', session.user.id)
        .in('wallpaper_id', wallpaperIds)
      
      userLikes = likes?.map(like => like.wallpaper_id) || []
    }

    // 🎨 处理壁纸数据，添加用户状态
    const processedWallpapers = wallpapers.map(wallpaper => ({
      ...wallpaper,
      is_liked: userLikes.includes(wallpaper.id),
      can_download: isAuthenticated, // 只有登录用户可以下载
      // 🔒 对于未登录用户，不显示高分辨率URL（防止盗链）
      image_url: isAuthenticated ? wallpaper.image_url : wallpaper.thumbnail_url || wallpaper.image_url,
      video_url: isAuthenticated ? wallpaper.video_url : undefined, // 未登录用户不能获取视频URL
      // 🎬 视频预览：未登录用户可以看到GIF预览，但不能获取完整视频
      preview_gif_url: wallpaper.preview_gif_url // GIF预览对所有用户开放
    }))

    // 📊 构建分页信息
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)
    
    const response: WallpaperListResponse = {
      wallpapers: processedWallpapers,
      categories: categories || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    }

    console.log('✅ 壁纸列表获取成功:', {
      wallpaper_count: wallpapers.length,
      category_count: categories?.length || 0,
      total_count: totalCount,
      user_authenticated: isAuthenticated,
      user_premium: isPremium
    })

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('❌ 壁纸API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求参数无效', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 