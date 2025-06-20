// 🧪 工作流测试API - 无需登录验证
// 专门用于测试RSS数据解析功能

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// 📄 标准化内容格式
interface StandardizedContent {
  title: string
  content: string
  summary: string
  author: string
  originalUrl: string
  publishedAt: Date
  imageUrls: string[]
  tags: string[]
  category: string
  platform: string
  engagement?: {
    likes: number
    shares: number
    comments: number
    views: number
  }
}

// 🚀 POST - 测试工作流数据解析（无需登录）
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 工作流测试API - 接收数据解析请求...')

    // 📄 解析请求数据
    const requestData = await request.json()
    const { source, batch_data } = requestData as {
      source: { type: string; metadata?: any }
      batch_data?: StandardizedContent[]
    }

    console.log('🔍 测试数据源类型:', source.type)
    console.log('🔍 测试数据数量:', batch_data?.length || 0)

    if (!batch_data || batch_data.length === 0) {
      return NextResponse.json({
        success: false,
        error: '无有效数据进行测试'
      }, { status: 400 })
    }

    // 💾 保存到数据库（测试模式）
    const savedCount = await saveContentToDatabase(batch_data, true)

    return NextResponse.json({
      success: true,
      data: {
        total_parsed: batch_data.length,
        successfully_saved: savedCount,
        source_type: source.type,
        processed_at: new Date().toISOString(),
        test_mode: true
      }
    })

  } catch (error) {
    console.error('🚨 工作流测试失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 📊 GET - 获取测试状态
export async function GET(request: NextRequest) {
  try {
    console.log('📊 获取工作流测试状态...')

    const supabase = createAdminClient()

    // 📈 获取最近测试的数据
    const { data: recentData } = await supabase
      .from('labubu_news')
      .select('id, title, source_name, created_at, tags')
      .order('created_at', { ascending: false })
      .limit(20)

    const testStats = {
      total_articles: recentData?.length || 0,
      recent_articles: recentData?.slice(0, 5).map(item => ({
        title: item.title,
        source_name: item.source_name,
        created_at: item.created_at,
        tags: item.tags
      })) || [],
      last_updated: new Date().toISOString(),
      test_mode: true
    }

    return NextResponse.json({
      success: true,
      data: testStats
    })

  } catch (error) {
    console.error('🚨 获取测试状态失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '获取测试状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 💾 保存内容到数据库（测试模式）
async function saveContentToDatabase(contents: StandardizedContent[], testMode = false): Promise<number> {
  console.log('💾 测试模式保存内容到数据库...')
  
  const supabase = createAdminClient()
  let savedCount = 0

  for (const content of contents) {
    try {
      // 🔍 检查重复内容
      const { data: existing } = await supabase
        .from('labubu_news')
        .select('id')
        .eq('original_url', content.originalUrl)
        .single()

      if (existing) {
        console.log('⚠️ 跳过重复内容:', content.title.substring(0, 50))
        continue
      }

      // 💾 保存新内容 (修正字段映射)
      const { error } = await supabase
        .from('labubu_news')
        .insert({
          title: content.title,
          content: content.content,
          summary: content.summary,
          author: content.author,
          source_name: testMode ? 'test-rss-workflow' : getSourceId(content.platform),
          source_type: 'rss',
          original_url: content.originalUrl,
          published_at: content.publishedAt.toISOString(),
          image_urls: content.imageUrls,
          tags: content.tags,
          category: content.category,
          hot_score: calculateHotScore(content),
          like_count: content.engagement?.likes || 0,
          share_count: content.engagement?.shares || 0,
          comment_count: content.engagement?.comments || 0,
          view_count: content.engagement?.views || 0,
          status: 'approved'
        })

      if (!error) {
        savedCount++
        console.log('✅ 测试保存成功:', content.title.substring(0, 50))
      } else {
        console.error('❌ 测试保存失败:', error)
      }

    } catch (error) {
      console.error('❌ 处理测试内容时出错:', error)
    }
  }

  console.log(`💾 测试数据库保存完成: ${savedCount}/${contents.length}`)
  return savedCount
}

// 🔧 计算热度分数
function calculateHotScore(content: StandardizedContent): number {
  const engagement = content.engagement || { likes: 0, shares: 0, comments: 0, views: 0 }
  const timeScore = Math.max(0, 100 - Math.floor((Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60 * 24)))
  const engagementScore = (engagement.likes * 1) + (engagement.shares * 2) + (engagement.comments * 1.5) + (engagement.views * 0.01)
  return Math.min(100, timeScore * 0.3 + Math.min(70, engagementScore * 0.1))
}

// 🔧 获取数据源ID
function getSourceId(platform: string): string {
  const sourceMap: Record<string, string> = {
    'Hypebeast': 'hypebeast-rss',
    'Toy News International': 'toy-news-rss',
    'RSS2JSON API (测试)': 'rss2json-test'
  }
  return sourceMap[platform] || 'unknown-rss'
} 