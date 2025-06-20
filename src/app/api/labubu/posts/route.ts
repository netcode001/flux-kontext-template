import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

// 🎨 获取帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const userId = searchParams.get('userId')
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const where: any = {}
    if (userId) where.userId = userId
    if (featured) where.isFeatured = true
    
    console.log('🔍 获取帖子列表:', { page, limit, where })
    
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit
    })
    
    console.log('✅ 帖子列表获取成功:', { count: posts.length })
    
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    })
    
  } catch (error) {
    console.error('🚨 获取帖子列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取帖子列表失败' },
      { status: 500 }
    )
  }
}

// 🎨 创建新帖子
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    console.log('🔍 API认证检查:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasId: !!session?.user?.id,
      userEmail: session?.user?.email 
    })
    
    if (!session?.user) {
      console.log('❌ API认证失败: 无session或user')
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 🔧 关键修复：OAuth ID不是UUID，必须从数据库获取正确的用户UUID
    let userId: string | null = null
    
    console.log('🔍 Session用户ID检查:', { 
      sessionId: session.user.id, 
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id || ''),
      email: session.user.email 
    })
    
    try {
      console.log('🔍 API从数据库获取用户UUID:', session.user.email)
      
      const user = await prisma.user.findFirst({
        where: { email: session.user.email }
      })
      
      if (user) {
        userId = user.id
        console.log('✅ API获取数据库UUID成功:', userId)
      } else {
        console.error('❌ 数据库中未找到用户:', session.user.email)
        return NextResponse.json(
          { success: false, error: '用户不存在，请重新登录' },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('❌ API数据库查询失败:', error)
      return NextResponse.json(
        { success: false, error: '数据库查询失败' },
        { status: 500 }
      )
    }
    
    if (!userId) {
      console.log('❌ API认证失败: 无法获取用户ID')
      return NextResponse.json(
        { success: false, error: '用户身份验证失败' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { title, content, imageUrls, prompt, model, tags, isPublic } = body
    
    // 验证必填字段
    if (!title || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: '标题和图片不能为空' },
        { status: 400 }
      )
    }
    
    console.log('🔍 准备创建帖子:', { 
      userId, 
      title, 
      imageUrlsCount: imageUrls.length,
      tagsCount: tags?.length || 0 
    })
    
    // 创建帖子
    const post = await prisma.post.create({
      data: {
        userId: userId,
        title,
        content,
        imageUrls,
        prompt,
        model,
        tags: tags || [],
        isPublic: isPublic !== false
      }
    })
    
    console.log('✅ 帖子创建成功:', post.id)
    
    return NextResponse.json({
      success: true,
      data: post,
      message: '作品发布成功！'
    })
    
  } catch (error) {
    console.error('🚨 Post create error:', error)
    console.error('🚨 创建帖子失败:', error)
    return NextResponse.json(
      { success: false, error: '发布失败，请重试' },
      { status: 500 }
    )
  }
} 