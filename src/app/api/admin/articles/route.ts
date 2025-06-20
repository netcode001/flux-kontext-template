import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

// 🔐 管理员邮箱验证
const ADMIN_EMAILS = ['alex@flux.com', 'admin@flux.com']

// 📰 获取文章列表
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    // 筛选参数
    const source = searchParams.get('source')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询
    let query = supabase
      .from('labubu_news')
      .select(`
        id,
        title,
        content,
        source,
        image_urls,
        original_url,
        tags,
        view_count,
        like_count,
        share_count,
        published_at,
        created_at,
        hot_score,
        status
      `)

    // 应用筛选条件
    if (source) {
      query = query.eq('source', source)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // 应用排序和分页
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: articles, error, count } = await query

    if (error) {
      console.error('获取文章列表失败:', error)
      return NextResponse.json({ error: '获取文章失败' }, { status: 500 })
    }

    // 格式化数据
    const formattedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title,
      source: article.source,
      imageUrl: article.image_urls?.[0] || '',
      originalUrl: article.original_url,
      tags: article.tags || [],
      viewCount: article.view_count || 0,
      likeCount: article.like_count || 0,
      shareCount: article.share_count || 0,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      hotScore: article.hot_score || 0,
      status: article.status || 'pending'
    }))

    return NextResponse.json({
      success: true,
      data: {
        articles: formattedArticles,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('文章管理API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 🗑️ 删除文章
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('id')

    if (!articleId) {
      return NextResponse.json({ error: '文章ID不能为空' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // 软删除：更新状态为 deleted
    const { error } = await supabase
      .from('labubu_news')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', articleId)

    if (error) {
      console.error('删除文章失败:', error)
      return NextResponse.json({ error: '删除文章失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '文章删除成功'
    })

  } catch (error) {
    console.error('删除文章API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// ✏️ 更新文章状态
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, tags } = body

    if (!id) {
      return NextResponse.json({ error: '文章ID不能为空' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // 构建更新数据
    const updateData: any = {}
    if (status) updateData.status = status
    if (tags) updateData.tags = tags
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('labubu_news')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('更新文章失败:', error)
      return NextResponse.json({ error: '更新文章失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '文章更新成功'
    })

  } catch (error) {
    console.error('更新文章API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 