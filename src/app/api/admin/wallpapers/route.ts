import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Wallpaper, WallpaperUploadData } from '@/types/wallpaper'
import { r2Storage } from '@/lib/services/r2-storage'

// 🔐 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🛡️ 管理员权限检查
async function checkAdminPermission(session: any): Promise<boolean> {
  if (!session?.user?.email) return false
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
  return adminEmails.includes(session.user.email)
}

// 📝 基础壁纸字段Schema
const baseWallpaperSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题太长'),
  title_en: z.string().max(200, '英文标题太长').optional(),
  description: z.string().max(1000, '描述太长').optional(),
  category_id: z.string().uuid('无效的分类ID').optional(),
  
  // 媒体类型和URL
  media_type: z.enum(['image', 'video'], { required_error: '必须指定媒体类型' }),
  image_url: z.string().url('无效的图片URL').optional(),
  video_url: z.string().url('无效的视频URL').optional(),
  thumbnail_url: z.string().url('无效的缩略图URL').optional(),
  preview_gif_url: z.string().url('无效的预览GIF URL').optional(),
  
  // 文件信息
  original_filename: z.string().max(255).optional(),
  file_size: z.number().positive().optional(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  
  // 视频特有字段
  duration: z.number().positive().optional(),
  frame_rate: z.number().positive().optional(),
  video_codec: z.string().max(50).optional(),
  audio_codec: z.string().max(50).optional(),
  has_audio: z.boolean().default(false),
  
  // 通用字段
  tags: z.array(z.string().min(1).max(50)).max(20, '标签数量不能超过20个'),
  is_premium: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true)
})

// 📝 壁纸创建验证Schema（带完整性检查）
const wallpaperCreateSchema = baseWallpaperSchema.refine(
  (data) => {
    // 确保图片类型有image_url，视频类型有video_url
    if (data.media_type === 'image' && !data.image_url) {
      return false
    }
    if (data.media_type === 'video' && !data.video_url) {
      return false
    }
    return true
  },
  {
    message: '图片类型必须提供image_url，视频类型必须提供video_url'
  }
).refine(
  (data) => {
    // 视频类型必须有时长
    if (data.media_type === 'video' && !data.duration) {
      return false
    }
    return true
  },
  {
    message: '视频类型必须提供duration（时长）'
  }
)

// 📝 壁纸更新验证Schema（部分字段可选）
const wallpaperUpdateSchema = baseWallpaperSchema.partial()

// 📝 查询参数验证Schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category_id: z.string().uuid().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  featured: z.coerce.boolean().optional(),
  premium: z.coerce.boolean().optional(),
  search: z.string().min(1).max(100).optional(),
  sort: z.enum(['latest', 'oldest', 'popular', 'downloads', 'likes']).default('latest')
})

// 🔍 GET /api/admin/wallpapers - 获取壁纸管理列表
export async function GET(request: NextRequest) {
  try {
    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    const isAdmin = await checkAdminPermission(session)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    // 📊 解析查询参数
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const validatedParams = querySchema.parse(params)
    const { page, limit, category_id, status, featured, premium, search, sort } = validatedParams

    console.log('🖼️ 管理员获取壁纸列表:', validatedParams)

    // 📊 构建查询
    let query = supabase
      .from('wallpapers')
      .select(`
        *,
        category:wallpaper_categories(*)
      `, { count: 'exact' })

    // 🔍 应用筛选条件
    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (status !== 'all') {
      query = query.eq('is_active', status === 'active')
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    if (premium !== undefined) {
      query = query.eq('is_premium', premium)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 📈 排序
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('view_count', { ascending: false })
        break
      case 'downloads':
        query = query.order('download_count', { ascending: false })
        break
      case 'likes':
        query = query.order('like_count', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // 📄 分页
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: wallpapers, error, count } = await query

    if (error) {
      console.error('❌ 获取壁纸列表失败:', error)
      return NextResponse.json(
        { success: false, error: '获取壁纸列表失败' },
        { status: 500 }
      )
    }

    // 📂 获取分类列表
    const { data: categories } = await supabase
      .from('wallpaper_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    // 📊 构建分页信息
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    console.log('✅ 管理员壁纸列表获取成功:', {
      count: wallpapers?.length || 0,
      total: totalCount,
      page,
      pages: totalPages
    })

    return NextResponse.json({
      success: true,
      data: {
        wallpapers: wallpapers || [],
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
    })

  } catch (error) {
    console.error('❌ 管理员壁纸API错误:', error)
    
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

// 📝 POST /api/admin/wallpapers - 创建壁纸
export async function POST(request: NextRequest) {
  try {
    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    const isAdmin = await checkAdminPermission(session)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    // 📝 解析请求体
    const body = await request.json()
    const validatedData = wallpaperCreateSchema.parse(body)

    console.log('📝 创建壁纸:', validatedData)

    // 🖼️ 创建壁纸记录
    const { data: newWallpaper, error } = await supabase
      .from('wallpapers')
      .insert({
        ...validatedData,
        uploaded_by: session?.user?.id
      })
      .select(`
        *,
        category:wallpaper_categories(*)
      `)
      .single()

    if (error) {
      console.error('❌ 创建壁纸失败:', error)
      return NextResponse.json(
        { success: false, error: '创建壁纸失败' },
        { status: 500 }
      )
    }

    console.log('✅ 壁纸创建成功:', newWallpaper.id)

    return NextResponse.json({
      success: true,
      data: { wallpaper: newWallpaper }
    })

  } catch (error) {
    console.error('❌ 创建壁纸API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求数据无效', 
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

// ✏️ PUT /api/admin/wallpapers - 更新壁纸
export async function PUT(request: NextRequest) {
  try {
    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    const isAdmin = await checkAdminPermission(session)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    // 📝 解析请求体
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少壁纸ID' },
        { status: 400 }
      )
    }

    const validatedData = wallpaperUpdateSchema.parse(updateData)

    console.log('✏️ 更新壁纸:', { id, ...validatedData })

    // 🖼️ 更新壁纸记录
    const { data: updatedWallpaper, error } = await supabase
      .from('wallpapers')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        category:wallpaper_categories(*)
      `)
      .single()

    if (error) {
      console.error('❌ 更新壁纸失败:', error)
      return NextResponse.json(
        { success: false, error: '更新壁纸失败' },
        { status: 500 }
      )
    }

    console.log('✅ 壁纸更新成功:', updatedWallpaper.id)

    return NextResponse.json({
      success: true,
      data: { wallpaper: updatedWallpaper }
    })

  } catch (error) {
    console.error('❌ 更新壁纸API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求数据无效', 
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

// 🗑️ DELETE /api/admin/wallpapers - 删除壁纸（支持批量）
export async function DELETE(request: NextRequest) {
  try {
    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    const isAdmin = await checkAdminPermission(session)
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供要删除的壁纸ID' },
        { status: 400 }
      )
    }
    
    console.log(`🗑️ 管理员请求删除壁纸:`, ids);

    // 1. 从数据库中查询要删除的壁纸，获取文件URL
    const { data: wallpapersToDelete, error: fetchError } = await supabase
      .from('wallpapers')
      .select('image_url, video_url')
      .in('id', ids)

    if (fetchError) {
      console.error('❌ 查询待删除壁纸失败:', fetchError)
      return NextResponse.json(
        { success: false, error: '查询待删除壁纸失败' },
        { status: 500 }
      )
    }

    // 2. 从URL中提取R2文件Key
    const fileKeysToDelete = wallpapersToDelete.map(wp => {
      const url = wp.image_url || wp.video_url
      if (!url) return null
      try {
        const urlObject = new URL(url)
        return urlObject.pathname.substring(1) // 移除开头的'/'
      } catch {
        return null // 无效的URL
      }
    }).filter((key): key is string => key !== null)
    
    // 3. 从R2中删除文件
    if (fileKeysToDelete.length > 0) {
      console.log(`🗑️ 从R2删除文件:`, fileKeysToDelete)
      // 注意：这里我们不等待r2Storage的完成，让它在后台运行
      // 即使文件删除失败，数据库记录也应该被删除
      r2Storage.deleteMultipleFiles(fileKeysToDelete)
    }

    // 4. 从数据库中删除记录
    const { error: deleteError } = await supabase
      .from('wallpapers')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('❌ 删除数据库记录失败:', deleteError)
      return NextResponse.json(
        { success: false, error: '删除数据库记录失败' },
        { status: 500 }
      )
    }

    console.log(`✅ 成功删除 ${ids.length} 个壁纸`);

    return NextResponse.json({
      success: true,
      message: `成功删除了 ${ids.length} 个壁纸`
    })

  } catch (error) {
    console.error('❌ 删除壁纸API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 