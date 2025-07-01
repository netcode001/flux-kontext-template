import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { YouTubeService } from '@/lib/services/youtube-service'

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
 * 获取所有关键词
 */
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const keywords = await prisma.youtube_search_keywords.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({
      success: true,
      keywords
    })
  } catch (error) {
    console.error('获取关键词失败:', error)
    return NextResponse.json(
      { error: '获取关键词失败' },
      { status: 500 }
    )
  }
}

/**
 * 添加新关键词并立即搜索
 */
export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { keyword, categoryName, maxResults = 10 } = body

    // 🔐 输入验证
    if (!keyword || !categoryName) {
      return NextResponse.json(
        { error: '关键词和分类名称不能为空' },
        { status: 400 }
      )
    }

    if (maxResults < 1 || maxResults > 50) {
      return NextResponse.json(
        { error: '获取数量必须在1-50之间' },
        { status: 400 }
      )
    }

    // 检查关键词是否已存在
    const existingKeyword = await prisma.youtube_search_keywords.findFirst({
      where: {
        keyword: keyword.trim(),
        is_active: true
      }
    })

    if (existingKeyword) {
      return NextResponse.json(
        { error: '该关键词已存在' },
        { status: 400 }
      )
    }

    // 🎥 使用YouTube服务搜索视频
    const youtubeService = new YouTubeService()
    const searchResults = await youtubeService.searchAndGetDetails(
      keyword.trim(),
      maxResults,
      'relevance'
    )

    // 💾 保存关键词到数据库
    const savedKeyword = await prisma.youtube_search_keywords.create({
      data: {
        keyword: keyword.trim(),
        category_name: categoryName.trim(),
        max_results: maxResults,
        last_search_at: new Date(),
        video_count: searchResults.length
      }
    })

    return NextResponse.json({
      success: true,
      keyword: savedKeyword,
      searchResults,
      message: `成功添加关键词并找到 ${searchResults.length} 个视频`
    })

  } catch (error) {
    console.error('添加关键词失败:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '添加关键词失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * 更新关键词
 */
export async function PUT(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { id, keyword, categoryName, maxResults, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: '关键词ID不能为空' },
        { status: 400 }
      )
    }

    const updatedKeyword = await prisma.youtube_search_keywords.update({
      where: { id },
      data: {
        keyword: keyword?.trim(),
        category_name: categoryName?.trim(),
        max_results: maxResults,
        is_active: isActive
      }
    })

    return NextResponse.json({
      success: true,
      keyword: updatedKeyword,
      message: '关键词更新成功'
    })

  } catch (error) {
    console.error('更新关键词失败:', error)
    return NextResponse.json(
      { error: '更新关键词失败' },
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
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '关键词ID不能为空' },
        { status: 400 }
      )
    }

    // 软删除：将is_active设为false
    await prisma.youtube_search_keywords.update({
      where: { id },
      data: { is_active: false }
    })

    return NextResponse.json({
      success: true,
      message: '关键词删除成功'
    })

  } catch (error) {
    console.error('删除关键词失败:', error)
    return NextResponse.json(
      { error: '删除关键词失败' },
      { status: 500 }
    )
  }
} 