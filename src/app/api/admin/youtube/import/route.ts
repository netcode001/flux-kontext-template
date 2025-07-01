import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// 批量导入YouTube视频
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videos } = body

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: '无效的视频数据' }, { status: 400 })
    }

    let importCount = 0
    let skipCount = 0
    // 批量插入视频，避免重复，校验video_id
    const created = await Promise.all(
      videos.map(async (video: any) => {
        // 校验video_id
        if (!video.video_id) {
          skipCount++
          return null
        }
        // 检查是否已存在（用findMany+limit）
        const existsArr = await prisma.youtube_videos.findMany({
          where: { video_id: video.video_id },
          take: 1
        })
        if (existsArr && existsArr.length > 0) {
          skipCount++
          return null
        }
        importCount++
        return prisma.youtube_videos.create({
          data: {
            video_id: video.video_id,
            title: video.title,
            description: video.description,
            thumbnail_url: video.thumbnail_url,
            channel_title: video.channel_title,
            channel_id: video.channel_id,
            published_at: video.published_at ? new Date(video.published_at) : undefined,
            duration_iso: video.duration_iso,
            duration_seconds: video.duration_seconds,
            view_count: video.view_count,
            like_count: video.like_count,
            comment_count: video.comment_count,
            iframe_embed_code: video.iframe_embed_code,
            search_keyword: video.search_keyword,
            category_name: video.category_name,
            is_featured: false,
            is_active: true
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      count: importCount,
      skipped: skipCount
    })
  } catch (error) {
    console.error('导入YouTube视频失败:', error)
    return NextResponse.json({ error: '导入YouTube视频失败' }, { status: 500 })
  }
} 