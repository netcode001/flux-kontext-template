import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

// 🎨 切换点赞状态
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
    
    // 检查是否已点赞
    try {
      // 尝试删除点赞（如果存在）
      await prisma.like.delete({
        where: {
          userId,
          postId
        }
      })
      
      return NextResponse.json({
        success: true,
        liked: false,
        message: '取消点赞'
      })
      
    } catch (deleteError) {
      // 如果删除失败，说明还没点赞，创建新的点赞
      try {
        await prisma.like.create({
          data: {
            userId,
            postId
          }
        })
        
        return NextResponse.json({
          success: true,
          liked: true,
          message: '点赞成功！'
        })
        
      } catch (createError) {
        console.error('🚨 创建点赞失败:', createError)
        return NextResponse.json(
          { success: false, error: '点赞操作失败' },
          { status: 500 }
        )
      }
    }
    
  } catch (error) {
    console.error('🚨 点赞操作失败:', error)
    return NextResponse.json(
      { success: false, error: '操作失败，请重试' },
      { status: 500 }
    )
  }
} 