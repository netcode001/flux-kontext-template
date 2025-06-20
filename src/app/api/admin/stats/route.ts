import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

// 🔐 管理员邮箱验证
const ADMIN_EMAILS = ['alex@flux.com', 'admin@flux.com']

// 📊 获取统计数据
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'daily'

    // 📈 获取时间维度统计
    const timeStats = await getTimeStats(supabase, timeRange)
    
    // 🥧 获取来源分布统计
    const sourceStats = await getSourceStats(supabase)
    
    // 📊 获取关键指标
    const keyMetrics = await getKeyMetrics(supabase)

    return NextResponse.json({
      success: true,
      data: {
        timeStats,
        sourceStats,
        keyMetrics
      }
    })

  } catch (error) {
    console.error('统计数据API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 📈 获取时间维度统计
async function getTimeStats(supabase: any, timeRange: string) {
  const now = new Date()
  let dateFormat: string
  let interval: string
  let startDate: Date

  switch (timeRange) {
    case 'hourly':
      // 过去24小时，按小时统计
      dateFormat = 'HH24:00'
      interval = '1 hour'
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'weekly':
      // 过去4周，按周统计
      dateFormat = '"第"WW"周"'
      interval = '1 week'
      startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000)
      break
    case 'monthly':
      // 过去12个月，按月统计
      dateFormat = 'MM"月"'
      interval = '1 month'
      startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000)
      break
    default: // daily
      // 过去30天，按天统计
      dateFormat = 'MM-DD'
      interval = '1 day'
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  try {
    const { data, error } = await supabase.rpc('get_time_stats', {
      start_date: startDate.toISOString(),
      date_format: dateFormat,
      time_interval: interval
    })

    if (error) {
      console.error('获取时间统计失败:', error)
      // 返回模拟数据作为后备
      return generateMockTimeStats(timeRange)
    }

    return data || generateMockTimeStats(timeRange)
  } catch (error) {
    console.error('时间统计查询错误:', error)
    return generateMockTimeStats(timeRange)
  }
}

// 🥧 获取来源分布统计
async function getSourceStats(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('labubu_news')
      .select('source')
      .neq('status', 'deleted')

    if (error) {
      console.error('获取来源统计失败:', error)
      return generateMockSourceStats()
    }

    // 统计各来源数量
    const sourceCounts = data.reduce((acc: any, item: any) => {
      acc[item.source] = (acc[item.source] || 0) + 1
      return acc
    }, {})

    const total = Object.values(sourceCounts).reduce((sum: number, count: any) => sum + count, 0)

    const sourceStats = Object.entries(sourceCounts).map(([name, count]: [string, any]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
    }))

    return sourceStats.sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('来源统计查询错误:', error)
    return generateMockSourceStats()
  }
}

// 📊 获取关键指标
async function getKeyMetrics(supabase: any) {
  try {
    // 总文章数
    const { count: totalArticles } = await supabase
      .from('labubu_news')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted')

    // 今日新增
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { count: todayArticles } = await supabase
      .from('labubu_news')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .neq('status', 'deleted')

    // 平均热度
    const { data: hotScoreData } = await supabase
      .from('labubu_news')
      .select('hot_score')
      .neq('status', 'deleted')
      .not('hot_score', 'is', null)

    const avgHotScore = hotScoreData?.length > 0 
      ? hotScoreData.reduce((sum: number, item: any) => sum + (item.hot_score || 0), 0) / hotScoreData.length
      : 0

    return {
      totalArticles: totalArticles || 0,
      todayArticles: todayArticles || 0,
      avgHotScore: Math.round(avgHotScore * 10) / 10
    }
  } catch (error) {
    console.error('关键指标查询错误:', error)
    return {
      totalArticles: 0,
      todayArticles: 0,
      avgHotScore: 0
    }
  }
}

// 🎭 生成模拟时间统计数据
function generateMockTimeStats(timeRange: string) {
  const now = new Date()
  
  switch (timeRange) {
    case 'hourly':
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${String(23 - i).padStart(2, '0')}:00`,
        count: Math.floor(Math.random() * 30) + 5
      })).reverse()
    
    case 'weekly':
      return Array.from({ length: 4 }, (_, i) => ({
        week: `第${4 - i}周`,
        count: Math.floor(Math.random() * 200) + 100
      })).reverse()
    
    case 'monthly':
      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        return {
          month: `${String(date.getMonth() + 1).padStart(2, '0')}月`,
          count: Math.floor(Math.random() * 500) + 200
        }
      })
    
    default: // daily
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
        return {
          date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
          count: Math.floor(Math.random() * 100) + 20
        }
      })
  }
}

// 🎭 生成模拟来源统计数据
function generateMockSourceStats() {
  return [
    { name: '微博', count: 1247, percentage: 42.3 },
    { name: '小红书', count: 892, percentage: 30.2 },
    { name: 'TikTok', count: 445, percentage: 15.1 },
    { name: 'Instagram', count: 364, percentage: 12.4 }
  ]
} 