import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// 📰 获取Labubu资讯列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // 🔍 解析查询参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') // 分类筛选
    const source = searchParams.get('source') // 来源筛选
    const sortBy = searchParams.get('sortBy') || 'hot_score' // 排序方式
    const search = searchParams.get('search') // 搜索关键词
    const trending = searchParams.get('trending') === 'true' // 仅热门
    
    

    // 📊 构建查询条件
    let query = supabase
      .from('v_trending_articles') // 使用视图获取聚合数据
      .select(`
        id,
        title,
        content,
        summary,
        author,
        source_name,
        source_type,
        original_url,
        published_at,
        image_urls,
        tags,
        category,
        view_count,
        like_count,
        share_count,
        comment_count,
        sentiment_score,
        quality_score,
        relevance_score,
        hot_score,
        trending_rank,
        status,
        is_featured,
        is_trending,
        total_views,
        total_likes,
        created_at,
        updated_at
      `)
      .eq('status', 'approved') // 只返回已审核的内容

    // 🏷️ 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 🔍 搜索功能
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // 🔥 热门筛选
    if (trending) {
      query = query.eq('is_trending', true)
    }

    // 📈 排序逻辑
    switch (sortBy) {
      case 'hot_score':
        query = query.order('hot_score', { ascending: false })
        break
      case 'published_at':
        query = query.order('published_at', { ascending: false })
        break
      case 'view_count':
        query = query.order('view_count', { ascending: false })
        break
      case 'like_count':
        query = query.order('like_count', { ascending: false })
        break
      default:
        query = query.order('hot_score', { ascending: false })
    }

    // 📄 分页
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // 🔍 执行查询
    const { data: articles, error, count } = await query

    if (error) {
      console.error('🚨 获取资讯列表失败:', error)
      return NextResponse.json(
        { success: false, error: '获取资讯列表失败', details: error.message },
        { status: 500 }
      )
    }

    // 🎯 获取用户交互状态（如果已登录）
    const session = await getServerSession(authOptions)
    let articlesWithUserData = articles

    if (session?.user?.id) {
      // 📊 获取用户的点赞和收藏状态
      const articleIds = articles?.map(article => article.id) || []
      
      if (articleIds.length > 0) {
        const { data: userInteractions } = await supabase
          .from('user_news_interactions')
          .select('article_id, interaction_type')
          .eq('user_id', session.user.id)
          .in('article_id', articleIds)

        // 🔗 合并用户交互数据
        articlesWithUserData = articles?.map(article => {
          const userLike = userInteractions?.find(
            i => i.article_id === article.id && i.interaction_type === 'like'
          )
          const userBookmark = userInteractions?.find(
            i => i.article_id === article.id && i.interaction_type === 'bookmark'
          )

          return {
            ...article,
            isLiked: !!userLike,
            isBookmarked: !!userBookmark
          }
        })
      }
    }

    // 📊 获取统计信息
    const { count: totalCount } = await supabase
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')



    return NextResponse.json({
      success: true,
      data: {
        articles: articlesWithUserData || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasMore: (page * limit) < (totalCount || 0)
        },
        filters: {
          category,
          source,
          sortBy,
          search,
          trending
        }
      }
    })

  } catch (error) {
    console.error('🚨 获取资讯列表异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 📝 创建新的资讯文章（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession(authOptions)
    
    // 🔐 权限检查（后续可以添加管理员角色检查）
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 📝 验证必需字段
    const {
      title,
      content,
      summary,
      author,
      sourceId,
      originalUrl,
      publishedAt,
      imageUrls = [],
      tags = [],
      category = 'general'
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '标题和内容不能为空' },
        { status: 400 }
      )
    }

    console.log('📝 创建新资讯:', { title, category, tags })

    // 💾 保存到数据库
    const { data: article, error } = await supabase
      .from('news_articles')
      .insert({
        title,
        content,
        summary,
        author,
        source_id: sourceId,
        original_url: originalUrl,
        published_at: publishedAt || new Date().toISOString(),
        image_urls: imageUrls,
        tags,
        category,
        status: 'approved', // 手动创建默认审核通过
        hot_score: 1.0 // 初始热度分数
      })
      .select()
      .single()

    if (error) {
      console.error('🚨 创建资讯失败:', error)
      return NextResponse.json(
        { success: false, error: '创建资讯失败', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ 资讯创建成功:', article.id)

    return NextResponse.json({
      success: true,
      data: article,
      message: '资讯创建成功'
    })

  } catch (error) {
    console.error('🚨 创建资讯异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 