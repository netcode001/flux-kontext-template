import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// 工具函数：兼容驼峰和下划线字段
function getField(obj: any, snake: string, camel: string) {
  return obj[snake] ?? obj[camel]
}

// 批量导入YouTube视频
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videos } = body

    // 日志：输出收到的videos数组长度和每个对象的字段
    console.log('收到导入视频数据，数量:', Array.isArray(videos) ? videos.length : '非数组')
    if (Array.isArray(videos)) {
      videos.forEach((v, i) => {
        console.log(`视频${i + 1}字段:`, Object.keys(v), 'video_id:', v.video_id, 'videoId:', v.videoId)
      })
    }

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: '无效的视频数据' }, { status: 400 })
    }

    let importCount = 0
    let skipCount = 0
    // 批量插入视频，兼容字段
    const created = await Promise.all(
      videos.map(async (video: any) => {
        // 兼容video_id和videoId
        const video_id = getField(video, 'video_id', 'videoId')
        if (!video_id) {
          skipCount++
          return null
        }
        // 检查是否已存在
        const existsArr = await prisma.youtube_videos.findMany({
          where: { video_id },
          take: 1
        })
        if (existsArr && existsArr.length > 0) {
          skipCount++
          return null
        }
        importCount++
        return prisma.youtube_videos.create({
          data: {
            video_id,
            title: getField(video, 'title', 'title'),
            description: getField(video, 'description', 'description'),
            thumbnail_url: getField(video, 'thumbnail_url', 'thumbnailUrl'),
            channel_title: getField(video, 'channel_title', 'channelTitle'),
            channel_id: getField(video, 'channel_id', 'channelId'),
            published_at: getField(video, 'published_at', 'publishedAt'),
            duration_iso: getField(video, 'duration_iso', 'durationIso'),
            duration_seconds: getField(video, 'duration_seconds', 'durationSeconds'),
            view_count: getField(video, 'view_count', 'viewCount'),
            like_count: getField(video, 'like_count', 'likeCount'),
            comment_count: getField(video, 'comment_count', 'commentCount'),
            iframe_embed_code: getField(video, 'iframe_embed_code', 'iframeEmbedCode'),
            search_keyword: getField(video, 'search_keyword', 'searchKeyword'),
            category_name: getField(video, 'category_name', 'categoryName'),
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