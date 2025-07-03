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
    const errors: string[] = []

    // 🔧 先批量检查已存在的video_id，避免重复查询
    const videoIds = videos
      .map(video => getField(video, 'video_id', 'videoId'))
      .filter(id => id) // 过滤掉空值

    const existingVideos = await prisma.youtube_videos.findMany({
      where: { video_id: { in: videoIds } },
      select: { video_id: true }
    })
    const existingVideoIds = new Set(existingVideos.map(v => v.video_id))

    console.log(`📊 批量检查结果: 总数 ${videoIds.length}，已存在 ${existingVideoIds.size}`)

    // 🔄 逐个处理视频，避免并发冲突
    for (const video of videos) {
      try {
        const video_id = getField(video, 'video_id', 'videoId')
        if (!video_id) {
          skipCount++
          console.log(`[跳过] 缺少 video_id，原始数据:`, video)
          continue
        }

        // ✅ 检查是否已存在（只检查video_id，匹配数据库约束）
        if (existingVideoIds.has(video_id)) {
          skipCount++
          console.log(`[跳过重复] video_id: ${video_id} 已存在`)
          continue
        }

        // 💾 尝试插入新视频
        await prisma.youtube_videos.create({
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

        importCount++
        console.log(`✅ 成功导入: video_id: ${video_id}`)

      } catch (singleError: any) {
        // 🔍 处理单个视频插入错误
        const video_id = getField(video, 'video_id', 'videoId')
        
        if (singleError?.code === '23505' && singleError?.details?.includes('video_id')) {
          // 重复键冲突，算作跳过
          skipCount++
          console.log(`[跳过重复] video_id: ${video_id} 数据库约束冲突`)
        } else {
          // 其他错误
          const errorMsg = `video_id: ${video_id} - ${singleError?.message || '未知错误'}`
          errors.push(errorMsg)
          console.error(`❌ 单个视频插入失败:`, errorMsg)
        }
      }
    }

    console.log(`[导入结果] 成功导入: ${importCount}，跳过: ${skipCount}，错误: ${errors.length}`)

    // 📊 返回详细结果
    const isSuccess = importCount > 0 || (skipCount > 0 && errors.length === 0)
    
    return NextResponse.json({
      success: isSuccess,
      count: importCount,
      skipped: skipCount,
      errors: errors.length > 0 ? errors : undefined,
      message: importCount > 0 
        ? `成功导入 ${importCount} 个视频` + (skipCount > 0 ? `，跳过 ${skipCount} 个重复视频` : '')
        : skipCount > 0 
          ? `所有 ${skipCount} 个视频都已存在，无需重复导入`
          : '没有有效的视频数据'
    })

  } catch (error) {
    console.error('🚨 YouTube videos create critical error:', error)
    return NextResponse.json({ 
      success: false,
      error: '导入YouTube视频失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 