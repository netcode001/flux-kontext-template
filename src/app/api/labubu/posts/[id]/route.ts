import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database'

// 🎨 获取帖子详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: '帖子不存在' },
        { status: 404 }
      )
    }
    
    // 增加浏览次数
    await prisma.post.update({
      where: { id: params.id },
      data: { viewCount: post.viewCount + 1 }
    })
    
    // 返回更新后的数据
    const updatedPost = await prisma.post.findUnique({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedPost
    })
    
  } catch (error) {
    console.error('🚨 获取帖子详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取帖子详情失败' },
      { status: 500 }
    )
  }
}

// 🎨 更新帖子
export async function PUT(
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
    
    // 检查帖子是否存在以及用户权限
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: '帖子不存在' },
        { status: 404 }
      )
    }
    
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '没有权限修改此帖子' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { title, content, tags, isPublic } = body
    
    // 更新帖子
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: title || existingPost.title,
        content: content !== undefined ? content : existingPost.content,
        tags: tags || existingPost.tags,
        isPublic: isPublic !== undefined ? isPublic : existingPost.isPublic
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: '更新成功！'
    })
    
  } catch (error) {
    console.error('🚨 更新帖子失败:', error)
    return NextResponse.json(
      { success: false, error: '更新失败，请重试' },
      { status: 500 }
    )
  }
}

// 🎨 删除帖子
export async function DELETE(
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
    
    // 检查帖子是否存在以及用户权限
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: '帖子不存在' },
        { status: 404 }
      )
    }
    
    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '没有权限删除此帖子' },
        { status: 403 }
      )
    }
    
    // 删除帖子
    await prisma.post.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      success: true,
      message: '删除成功！'
    })
    
  } catch (error) {
    console.error('🚨 删除帖子失败:', error)
    return NextResponse.json(
      { success: false, error: '删除失败，请重试' },
      { status: 500 }
    )
  }
} 