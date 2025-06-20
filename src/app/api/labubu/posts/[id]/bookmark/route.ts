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
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }
    
    const postId = params.id
    const userId = session.user.id
    
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
      
      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: '取消收藏'
      })
      
    } catch (deleteError) {
      // 如果删除失败，说明还没收藏，创建新的收藏
      try {
        await prisma.bookmark.create({
          data: {
            userId,
            postId
          }
        })
        
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