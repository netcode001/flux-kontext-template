import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// 支持GET请求，参数：limit, offset, category_name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const category = searchParams.get('category')

    // 构建查询条件
    const where: any = { is_active: true }
    if (category && category !== '全部') {
      where.category_name = category
    }

    // 查询视频
    const videos = await prisma.youtube_videos.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    })

    // 查询所有分类标签
    const categories = await prisma.youtube_videos.findMany({
      where: { is_active: true },
      select: { category_name: true },
      distinct: ['category_name']
    })
    const tags = Array.from(new Set(categories.map(c => c.category_name).filter(Boolean)))

    // 返回数据
    const result = {
      success: true,
      videos,
      tags
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('获取YouTube视频失败:', error)
    return NextResponse.json({ error: '获取YouTube视频失败' }, { status: 500 })
  }
} 