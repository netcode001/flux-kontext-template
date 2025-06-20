import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

// 🎨 切换收藏状态
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }
    
    // 🔧 Next.js 15 要求await params
    const { id: postId } = await params
    
    // 🔧 关键修复：OAuth ID不是UUID，必须从数据库获取正确的用户UUID
    let userId: string | null = null
    
    try {
      console.log('🔍 收藏API从数据库获取用户UUID:', session.user.email)
      
      const user = await prisma.user.findFirst({
        where: { email: session.user.email }
      })
      
      if (user) {
        userId = user.id
        console.log('✅ 收藏API获取数据库UUID成功:', userId)
      } else {
        console.error('❌ 数据库中未找到用户:', session.user.email)
        return NextResponse.json(
          { success: false, error: '用户不存在，请重新登录' },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('❌ 收藏API数据库查询失败:', error)
      return NextResponse.json(
        { success: false, error: '数据库查询失败' },
        { status: 500 }
      )
    }
    
    if (!userId) {
      console.log('❌ 收藏API认证失败: 无法获取用户ID')
      return NextResponse.json(
        { success: false, error: '用户身份验证失败' },
        { status: 401 }
      )
    }
    
    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: '帖子不存在' },
        { status: 404 }
      )
    }
    
    // 检查是否已收藏
    try {
      // 尝试删除收藏（如果存在）
      await prisma.bookmark.delete({
        where: {
          userId,
          postId
        }
      })
      
      console.log('✅ 取消收藏成功:', { userId, postId })
      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: '取消收藏'
      })
      
    } catch (deleteError: any) {
      // 如果删除失败，说明还没收藏，创建新的收藏
      if (deleteError.code === 'PGRST116') {
        console.log('🔍 用户尚未收藏，创建新收藏:', { userId, postId })
      } else {
        console.error('🚨 删除收藏时发生意外错误:', deleteError)
      }
      
      try {
        await prisma.bookmark.create({
          data: {
            userId,
            postId
          }
        })
        
        console.log('✅ 创建收藏成功:', { userId, postId })
        return NextResponse.json({
          success: true,
          bookmarked: true,
          message: '收藏成功！'
        })
        
      } catch (createError) {
        console.error('🚨 创建收藏失败:', createError)
        return NextResponse.json(
          { success: false, error: '收藏操作失败' },
          { status: 500 }
        )
      }
    }
    
  } catch (error) {
    console.error('🚨 收藏操作失败:', error)
    return NextResponse.json(
      { success: false, error: '操作失败，请重试' },
      { status: 500 }
    )
  }
} 