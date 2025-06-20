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
    
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit
    })
    
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
    
    // 🔧 临时修复：如果没有用户ID，从数据库获取
    let userId = session.user.id
    if (!userId && session.user.email) {
      try {
        console.log('🔍 API尝试从数据库获取用户ID:', session.user.email)
        
        const user = await prisma.user.findFirst({
          where: { email: session.user.email },
          select: { id: true }
        })
        
        if (user) {
          userId = user.id
          console.log('✅ API从数据库获取用户ID成功:', userId)
        } else {
          console.error('❌ API从数据库获取用户ID失败: 用户不存在')
          return NextResponse.json(
            { success: false, error: '用户身份验证失败' },
            { status: 401 }
          )
        }
      } catch (error) {
        console.error('❌ API数据库查询失败:', error)
        return NextResponse.json(
          { success: false, error: '用户身份验证失败' },
          { status: 401 }
        )
      }
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
    
    return NextResponse.json({
      success: true,
      data: post,
      message: '作品发布成功！'
    })
    
  } catch (error) {
    console.error('🚨 创建帖子失败:', error)
    return NextResponse.json(
      { success: false, error: '发布失败，请重试' },
      { status: 500 }
    )
  }
} 