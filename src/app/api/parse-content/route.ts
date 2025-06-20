// 📄 内容解析API - 处理工作流收集的内容
// 支持Google Sheets、Notion、Airtable等多种数据源

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

// 🔧 支持的数据源类型
interface ContentSource {
  type: 'google_sheets' | 'notion' | 'airtable' | 'webhook'
  data: any
  metadata?: {
    workflow_id?: string
    source_platform?: string
    collected_at?: string
  }
}

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

// 🔐 验证管理员权限
async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: '请先登录', status: 401 }
  }

  const adminEmails = ['lylh0319@gmail.com']
  if (!adminEmails.includes(session.user.email || '')) {
    return { error: '权限不足', status: 403 }
  }

  return { success: true }
}

// 📊 POST - 接收并解析工作流内容
export async function POST(request: NextRequest) {
  try {
    console.log('📥 接收工作流内容解析请求...')

    // 🔐 权限验证
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    // 📄 解析请求数据
    const requestData = await request.json()
    const { source, batch_data } = requestData as {
      source: ContentSource
      batch_data?: StandardizedContent[]
    }

    console.log('🔍 解析数据源类型:', source.type)

    let parsedContent: StandardizedContent[] = []

    // 🔄 根据数据源类型解析内容
    switch (source.type) {
      case 'google_sheets':
        parsedContent = await parseGoogleSheetsData(source.data)
        break
      
      case 'notion':
        parsedContent = await parseNotionData(source.data)
        break
      
      case 'airtable':
        parsedContent = await parseAirtableData(source.data)
        break
      
      case 'webhook':
        parsedContent = batch_data || []
        break
      
      default:
        return NextResponse.json(
          { success: false, error: '不支持的数据源类型' },
          { status: 400 }
        )
    }

    console.log(`✅ 解析完成，共 ${parsedContent.length} 条内容`)

    // 💾 保存到数据库
    const savedCount = await saveContentToDatabase(parsedContent)

    return NextResponse.json({
      success: true,
      data: {
        total_parsed: parsedContent.length,
        successfully_saved: savedCount,
        source_type: source.type,
        processed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 内容解析失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '内容解析失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 📊 GET - 获取解析状态和统计信息
export async function GET(request: NextRequest) {
  try {
    console.log('📊 获取内容解析状态...')

    // 🔐 权限验证
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const supabase = createAdminClient()

    // 📈 获取统计信息
    const { data: stats } = await supabase
      .from('labubu_news')
      .select('id, source_id, created_at, platform')
      .order('created_at', { ascending: false })
      .limit(100)

    const sourceStats = stats?.reduce((acc, item) => {
      const platform = item.platform || 'unknown'
      if (!acc[platform]) {
        acc[platform] = { count: 0, latest: item.created_at }
      }
      acc[platform].count++
      return acc
    }, {} as Record<string, { count: number; latest: string }>)

    return NextResponse.json({
      success: true,
      data: {
        total_articles: stats?.length || 0,
        source_breakdown: sourceStats,
        last_updated: new Date().toISOString(),
        supported_sources: ['google_sheets', 'notion', 'airtable', 'webhook']
      }
    })

  } catch (error) {
    console.error('🚨 获取状态失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '获取状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 📊 Google Sheets数据解析器
async function parseGoogleSheetsData(sheetsData: any[]): Promise<StandardizedContent[]> {
  console.log('📊 解析Google Sheets数据...')
  
  return sheetsData.map(row => ({
    title: row.title || row.标题 || '无标题',
    content: row.content || row.内容 || '',
    summary: row.summary || row.摘要 || extractSummary(row.content || ''),
    author: row.author || row.作者 || '未知作者',
    originalUrl: row.url || row.链接 || '',
    publishedAt: new Date(row.published_at || row.发布时间 || Date.now()),
    imageUrls: parseImageUrls(row.images || row.图片 || ''),
    tags: parseTags(row.tags || row.标签 || ''),
    category: row.category || row.分类 || categorizeByTitle(row.title || ''),
    platform: row.platform || row.平台 || 'unknown',
    engagement: {
      likes: parseInt(row.likes || row.点赞 || '0'),
      shares: parseInt(row.shares || row.分享 || '0'),
      comments: parseInt(row.comments || row.评论 || '0'),
      views: parseInt(row.views || row.播放量 || '0')
    }
  }))
}

// 📝 Notion数据解析器
async function parseNotionData(notionData: any[]): Promise<StandardizedContent[]> {
  console.log('📝 解析Notion数据...')
  
  return notionData.map(page => ({
    title: page.properties?.Title?.title?.[0]?.plain_text || '无标题',
    content: page.properties?.Content?.rich_text?.[0]?.plain_text || '',
    summary: page.properties?.Summary?.rich_text?.[0]?.plain_text || '',
    author: page.properties?.Author?.rich_text?.[0]?.plain_text || '未知作者',
    originalUrl: page.properties?.URL?.url || '',
    publishedAt: new Date(page.properties?.Published?.date?.start || Date.now()),
    imageUrls: parseImageUrls(page.properties?.Images?.rich_text?.[0]?.plain_text || ''),
    tags: page.properties?.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    category: page.properties?.Category?.select?.name || '未分类',
    platform: page.properties?.Platform?.select?.name || 'notion',
    engagement: {
      likes: page.properties?.Likes?.number || 0,
      shares: page.properties?.Shares?.number || 0,
      comments: page.properties?.Comments?.number || 0,
      views: page.properties?.Views?.number || 0
    }
  }))
}

// 🗂️ Airtable数据解析器
async function parseAirtableData(airtableData: any[]): Promise<StandardizedContent[]> {
  console.log('🗂️ 解析Airtable数据...')
  
  return airtableData.map(record => ({
    title: record.fields.Title || '无标题',
    content: record.fields.Content || '',
    summary: record.fields.Summary || extractSummary(record.fields.Content || ''),
    author: record.fields.Author || '未知作者',
    originalUrl: record.fields.URL || '',
    publishedAt: new Date(record.fields['Published At'] || Date.now()),
    imageUrls: parseImageUrls(record.fields.Images || ''),
    tags: record.fields.Tags || [],
    category: record.fields.Category || '未分类',
    platform: record.fields.Platform || 'airtable',
    engagement: {
      likes: record.fields.Likes || 0,
      shares: record.fields.Shares || 0,
      comments: record.fields.Comments || 0,
      views: record.fields.Views || 0
    }
  }))
}

// 💾 保存内容到数据库
async function saveContentToDatabase(contents: StandardizedContent[]): Promise<number> {
  console.log('💾 保存内容到数据库...')
  
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
        console.log('⚠️ 跳过重复内容:', content.title)
        continue
      }

      // 💾 保存新内容
      const { error } = await supabase
        .from('labubu_news')
        .insert({
          title: content.title,
          content: content.content,
          summary: content.summary,
          author: content.author,
          original_url: content.originalUrl,
          published_at: content.publishedAt.toISOString(),
          image_urls: content.imageUrls,
          tags: content.tags,
          category: content.category,
          platform: content.platform,
          hot_score: calculateHotScore(content),
          likes_count: content.engagement?.likes || 0,
          shares_count: content.engagement?.shares || 0,
          comments_count: content.engagement?.comments || 0,
          views_count: content.engagement?.views || 0,
          source_id: getSourceId(content.platform),
          created_at: new Date().toISOString()
        })

      if (!error) {
        savedCount++
        console.log('✅ 保存成功:', content.title)
      } else {
        console.error('❌ 保存失败:', error)
      }

    } catch (error) {
      console.error('❌ 处理内容时出错:', error)
    }
  }

  console.log(`💾 数据库保存完成: ${savedCount}/${contents.length}`)
  return savedCount
}

// 🔧 辅助函数
function extractSummary(content: string): string {
  return content.length > 200 ? content.substring(0, 200) + '...' : content
}

function parseImageUrls(imageString: string): string[] {
  if (!imageString) return []
  return imageString.split(',').map(url => url.trim()).filter(url => url.length > 0)
}

function parseTags(tagString: string): string[] {
  if (!tagString) return []
  return tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
}

function categorizeByTitle(title: string): string {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('lisa') || titleLower.includes('blackpink')) return '明星动态'
  if (titleLower.includes('穿搭') || titleLower.includes('outfit')) return '穿搭分享'
  if (titleLower.includes('新品') || titleLower.includes('new')) return '新品发布'
  if (titleLower.includes('收藏') || titleLower.includes('collection')) return '收藏攻略'
  if (titleLower.includes('价格') || titleLower.includes('price')) return '市场动态'
  return '其他资讯'
}

function calculateHotScore(content: StandardizedContent): number {
  const engagement = content.engagement || { likes: 0, shares: 0, comments: 0, views: 0 }
  const timeScore = Math.max(0, 100 - Math.floor((Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60 * 24)))
  const engagementScore = (engagement.likes * 1) + (engagement.shares * 2) + (engagement.comments * 1.5) + (engagement.views * 0.01)
  return Math.min(100, timeScore * 0.3 + Math.min(70, engagementScore * 0.1))
}

function getSourceId(platform: string): string {
  const sourceMap: Record<string, string> = {
    weibo: 'weibo-labubu',
    xiaohongshu: 'xiaohongshu-labubu',
    instagram: 'instagram-labubu',
    tiktok: 'tiktok-labubu',
    notion: 'notion-workflow',
    google_sheets: 'sheets-workflow',
    airtable: 'airtable-workflow'
  }
  return sourceMap[platform] || 'unknown-source'
} 