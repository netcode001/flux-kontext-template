import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'

// 管理员邮箱验证
const adminEmails = ['lylh0319@gmail.com', 'test@example.com']

async function verifyAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  if (!adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  }

  return null
}

/**
 * 获取所有新闻关键词
 */
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const keywords = await prisma.newsKeyword.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json({ success: true, data: keywords })
  } catch (error) {
    console.error('关键词API数据库查询失败:', error)
    return NextResponse.json(
      { error: '数据库查询失败' }, 
      { status: 500 }
    )
  }
}

/**
 * 新增新闻关键词
 */
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { keyword } = await request.json()
    
    // 🔐 输入验证
    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: '关键词不能为空' }, 
        { status: 400 }
      )
    }

    // 检查是否已存在
    const exists = await prisma.newsKeyword.findUnique({ 
      where: { keyword: keyword.trim() } 
    })
    
    if (exists) {
      return NextResponse.json(
        { error: '关键词已存在' }, 
        { status: 409 }
      )
    }

    // 💾 创建新关键词
    const newKeyword = await prisma.newsKeyword.create({
      data: { 
        keyword: keyword.trim(), 
        enabled: true 
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: newKeyword,
      message: '关键词添加成功'
    })
  } catch (error) {
    console.error('关键词API数据库写入失败:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '数据库写入失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    )
  }
}

/**
 * 修改关键词（启用/禁用/重命名）
 */
export async function PUT(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id, keyword, enabled } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: '关键词ID不能为空' }, 
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (typeof keyword === 'string') updateData.keyword = keyword.trim()
    if (typeof enabled === 'boolean') updateData.enabled = enabled

    const updated = await prisma.newsKeyword.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: '关键词更新成功'
    })
  } catch (error) {
    console.error('关键词API数据库更新失败:', error)
    return NextResponse.json(
      { error: '数据库更新失败' }, 
      { status: 500 }
    )
  }
}

/**
 * 删除关键词
 */
export async function DELETE(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: '关键词ID不能为空' }, 
        { status: 400 }
      )
    }

    const deleted = await prisma.newsKeyword.delete({ 
      where: { id } 
    })

    return NextResponse.json({ 
      success: true, 
      data: deleted,
      message: '关键词删除成功'
    })
  } catch (error) {
    console.error('关键词API数据库删除失败:', error)
    return NextResponse.json(
      { error: '数据库删除失败' }, 
      { status: 500 }
    )
  }
} 