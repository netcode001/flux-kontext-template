import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 🔥 获取Labubu热搜关键词排行榜
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // 🔍 解析查询参数
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') // 分类筛选
    const timeRange = searchParams.get('timeRange') || '24h' // 时间范围
    
    console.log('🔥 获取热搜关键词:', { limit, category, timeRange })

    // 📊 根据时间范围构建查询
    let query = supabase
      .from('v_hot_keywords') // 使用视图
      .select('*')
      .gt('hot_score', 0)
      .order('hot_score', { ascending: false })
      .limit(limit)

    // 🏷️ 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // ⏰ 时间范围筛选 (基于first_seen_at)
    let timeFilter: string
    switch (timeRange) {
      case '1h':
        timeFilter = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        break
      case '6h':
        timeFilter = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        break
      case '24h':
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        break
      case '7d':
        timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }

    // 🔍 执行查询
    const { data: keywords, error } = await query

    if (error) {
      console.error('🚨 获取热搜关键词失败:', error)
      return NextResponse.json(
        { success: false, error: '获取热搜关键词失败', details: error.message },
        { status: 500 }
      )
    }

    // 📈 计算排名和趋势
    const rankedKeywords = keywords?.map((keyword, index) => ({
      ...keyword,
      rank: index + 1,
      // 🔥 热度等级判断
      heatLevel: keyword.hot_score > 100 ? 'extreme' : 
                 keyword.hot_score > 50 ? 'high' : 
                 keyword.hot_score > 20 ? 'medium' : 'low',
      // 📊 趋势图标
      trendIcon: keyword.trend_direction === 'up' ? '📈' : 
                 keyword.trend_direction === 'down' ? '📉' : '➡️'
    })) || []

    console.log('✅ 热搜关键词获取成功:', { count: rankedKeywords.length })

    return NextResponse.json({
      success: true,
      data: {
        keywords: rankedKeywords,
        summary: {
          total: rankedKeywords.length,
          timeRange,
          category,
          updatedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('🚨 获取热搜关键词异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 📈 更新关键词热度分数（内部API）
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { keyword, category, searchCount = 1, mentionCount = 0 } = body

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '关键词不能为空' },
        { status: 400 }
      )
    }

    console.log('📈 更新关键词热度:', { keyword, category, searchCount, mentionCount })

    // 🔍 查找现有关键词
    const { data: existingKeyword } = await supabase
      .from('trending_keywords')
      .select('*')
      .eq('keyword', keyword)
      .single()

    let result

    if (existingKeyword) {
      // 📊 更新现有关键词
      const newSearchCount = existingKeyword.search_count + searchCount
      const newMentionCount = existingKeyword.mention_count + mentionCount
      
      // 🔥 计算新的热度分数 (简单算法：搜索*2 + 提及*1 + 时间衰减)
      const hoursSinceFirstSeen = (Date.now() - new Date(existingKeyword.first_seen_at).getTime()) / (1000 * 60 * 60)
      const timeDecay = Math.max(0.1, 1 - (hoursSinceFirstSeen / 168)) // 7天衰减
      const hotScore = (newSearchCount * 2 + newMentionCount) * timeDecay

      // 📈 判断趋势方向
      let trendDirection = 'stable'
      if (hotScore > existingKeyword.hot_score * 1.2) {
        trendDirection = 'up'
      } else if (hotScore < existingKeyword.hot_score * 0.8) {
        trendDirection = 'down'
      }

      const { data, error } = await supabase
        .from('trending_keywords')
        .update({
          search_count: newSearchCount,
          mention_count: newMentionCount,
          hot_score: hotScore,
          trend_direction: trendDirection,
          last_updated_at: new Date().toISOString(),
          category: category || existingKeyword.category
        })
        .eq('id', existingKeyword.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // 🆕 创建新关键词
      const hotScore = searchCount * 2 + mentionCount
      
      const { data, error } = await supabase
        .from('trending_keywords')
        .insert({
          keyword,
          category: category || 'general',
          search_count: searchCount,
          mention_count: mentionCount,
          hot_score: hotScore,
          trend_direction: 'up' // 新关键词默认上升
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('🚨 更新关键词热度失败:', result.error)
      return NextResponse.json(
        { success: false, error: '更新关键词热度失败', details: result.error.message },
        { status: 500 }
      )
    }

    console.log('✅ 关键词热度更新成功:', result.data?.keyword)

    return NextResponse.json({
      success: true,
      data: result.data,
      message: '关键词热度更新成功'
    })

  } catch (error) {
    console.error('🚨 更新关键词热度异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 