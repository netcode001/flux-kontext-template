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
 * 获取所有新闻来源
 */
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const sources = await prisma.newsSource.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json({ success: true, data: sources })
  } catch (error) {
    console.error('新闻来源API数据库查询失败:', error)
    return NextResponse.json(
      { error: '数据库查询失败' }, 
      { status: 500 }
    )
  }
}

/**
 * 新增新闻来源
 */
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { name, url } = await request.json()
    
    // 🔐 输入验证
    if (!name || !name.trim() || !url || !url.trim()) {
      return NextResponse.json(
        { error: '来源名称和URL不能为空' }, 
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(url.trim())
    } catch {
      return NextResponse.json(
        { error: 'URL格式无效' }, 
        { status: 400 }
      )
    }

    // 💾 创建新来源
    const newSource = await prisma.newsSource.create({
      data: { 
        name: name.trim(), 
        url: url.trim(),
        is_active: true,
        type: 'rss'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: newSource,
      message: '新闻来源添加成功'
    })
  } catch (error) {
    console.error('新闻来源API数据库写入失败:', error)
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
 * 修改新闻来源（启用/禁用/重命名/改URL）
 */
export async function PUT(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id, name, url, is_active } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: '来源ID不能为空' }, 
        { status: 400 }
      )
    }

    // URL验证（如果提供了URL）
    if (url && url.trim()) {
      try {
        new URL(url.trim())
      } catch {
        return NextResponse.json(
          { error: 'URL格式无效' }, 
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (typeof name === 'string') updateData.name = name.trim()
    if (typeof url === 'string') updateData.url = url.trim()
    if (typeof is_active === 'boolean') updateData.is_active = is_active

    const updated = await prisma.newsSource.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: '新闻来源更新成功'
    })
  } catch (error) {
    console.error('新闻来源API数据库更新失败:', error)
    return NextResponse.json(
      { error: '数据库更新失败' }, 
      { status: 500 }
    )
  }
}

/**
 * 删除新闻来源
 */
export async function DELETE(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: '来源ID不能为空' }, 
        { status: 400 }
      )
    }

    const deleted = await prisma.newsSource.delete({ 
      where: { id } 
    })

    return NextResponse.json({ 
      success: true, 
      data: deleted,
      message: '新闻来源删除成功'
    })
  } catch (error) {
    console.error('新闻来源API数据库删除失败:', error)
    return NextResponse.json(
      { error: '数据库删除失败' }, 
      { status: 500 }
    )
  }
} 