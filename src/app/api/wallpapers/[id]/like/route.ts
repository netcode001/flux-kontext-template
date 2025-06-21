import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// 🔐 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📝 路径参数验证Schema
const likeParamsSchema = z.object({
  id: z.string().uuid('无效的壁纸ID')
})

// 💝 POST /api/wallpapers/[id]/like - 点赞壁纸
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🛡️ 验证路径参数
    const validatedParams = likeParamsSchema.parse(params)
    const { id: wallpaperId } = validatedParams

    // 🔐 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请先登录才能点赞',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      )
    }

    console.log('💝 壁纸点赞请求:', {
      wallpaperId,
      userId: session.user.id
    })

    // 🖼️ 检查壁纸是否存在
    const { data: wallpaper, error: wallpaperError } = await supabase
      .from('wallpapers')
      .select('id, title, like_count')
      .eq('id', wallpaperId)
      .eq('is_active', true)
      .single()

    if (wallpaperError || !wallpaper) {
      return NextResponse.json(
        { 
          success: false, 
          error: '壁纸不存在或已下架',
          code: 'WALLPAPER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // 🔍 检查是否已经点赞
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('wallpaper_likes')
      .select('id')
      .eq('wallpaper_id', wallpaperId)
      .eq('user_id', session.user.id)
      .single()

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('❌ 检查点赞状态失败:', likeCheckError)
      return NextResponse.json(
        { success: false, error: '系统错误' },
        { status: 500 }
      )
    }

    if (existingLike) {
      return NextResponse.json(
        { 
          success: false, 
          error: '您已经点赞过这张壁纸了',
          code: 'ALREADY_LIKED'
        },
        { status: 400 }
      )
    }

    // 💝 添加点赞记录
    const { error: insertError } = await supabase
      .from('wallpaper_likes')
      .insert({
        wallpaper_id: wallpaperId,
        user_id: session.user.id,
        user_email: session.user.email
      })

    if (insertError) {
      console.error('❌ 添加点赞记录失败:', insertError)
      return NextResponse.json(
        { success: false, error: '点赞失败' },
        { status: 500 }
      )
    }

    // 📈 更新点赞计数
    const { error: updateError } = await supabase
      .from('wallpapers')
      .update({ 
        like_count: wallpaper.like_count + 1 
      })
      .eq('id', wallpaperId)

    if (updateError) {
      console.error('❌ 更新点赞计数失败:', updateError)
      // 不影响主流程
    }

    console.log('✅ 壁纸点赞成功:', {
      wallpaperId,
      userId: session.user.id,
      title: wallpaper.title,
      new_like_count: wallpaper.like_count + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        wallpaper_id: wallpaperId,
        like_count: wallpaper.like_count + 1,
        is_liked: true
      }
    })

  } catch (error) {
    console.error('❌ 壁纸点赞API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求参数无效', 
          details: error.errors,
          code: 'INVALID_PARAMS'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// 💔 DELETE /api/wallpapers/[id]/like - 取消点赞
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🛡️ 验证路径参数
    const validatedParams = likeParamsSchema.parse(params)
    const { id: wallpaperId } = validatedParams

    // 🔐 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请先登录才能取消点赞',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      )
    }

    console.log('💔 取消壁纸点赞请求:', {
      wallpaperId,
      userId: session.user.id
    })

    // 🖼️ 检查壁纸是否存在
    const { data: wallpaper, error: wallpaperError } = await supabase
      .from('wallpapers')
      .select('id, title, like_count')
      .eq('id', wallpaperId)
      .eq('is_active', true)
      .single()

    if (wallpaperError || !wallpaper) {
      return NextResponse.json(
        { 
          success: false, 
          error: '壁纸不存在或已下架',
          code: 'WALLPAPER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // 🔍 查找点赞记录
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('wallpaper_likes')
      .select('id')
      .eq('wallpaper_id', wallpaperId)
      .eq('user_id', session.user.id)
      .single()

    if (likeCheckError || !existingLike) {
      return NextResponse.json(
        { 
          success: false, 
          error: '您还没有点赞过这张壁纸',
          code: 'NOT_LIKED'
        },
        { status: 400 }
      )
    }

    // 💔 删除点赞记录
    const { error: deleteError } = await supabase
      .from('wallpaper_likes')
      .delete()
      .eq('wallpaper_id', wallpaperId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('❌ 删除点赞记录失败:', deleteError)
      return NextResponse.json(
        { success: false, error: '取消点赞失败' },
        { status: 500 }
      )
    }

    // 📉 更新点赞计数
    const { error: updateError } = await supabase
      .from('wallpapers')
      .update({ 
        like_count: Math.max(0, wallpaper.like_count - 1) // 确保不会变成负数
      })
      .eq('id', wallpaperId)

    if (updateError) {
      console.error('❌ 更新点赞计数失败:', updateError)
      // 不影响主流程
    }

    console.log('✅ 取消壁纸点赞成功:', {
      wallpaperId,
      userId: session.user.id,
      title: wallpaper.title,
      new_like_count: Math.max(0, wallpaper.like_count - 1)
    })

    return NextResponse.json({
      success: true,
      data: {
        wallpaper_id: wallpaperId,
        like_count: Math.max(0, wallpaper.like_count - 1),
        is_liked: false
      }
    })

  } catch (error) {
    console.error('❌ 取消壁纸点赞API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求参数无效', 
          details: error.errors,
          code: 'INVALID_PARAMS'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
} 