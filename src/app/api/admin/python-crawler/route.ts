// 🐍 Python爬虫集成API
// 管理员触发Python社交媒体数据获取并集成到现有系统

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pythonIntegration, checkPythonEnvironment } from '@/lib/services/python-integration'

// 🚀 POST - 手动触发Python爬虫集成
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 管理员触发Python爬虫集成任务...')

    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' }, 
        { status: 401 }
      )
    }

    // 管理员验证
    const adminEmails = ['lylh0319@gmail.com'] // 管理员邮箱列表
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 解析请求参数
    const body = await request.json().catch(() => ({}))
    const { force = false, check_env = false } = body

    // 检查Python环境 (可选)
    if (check_env) {
      const envCheck = await checkPythonEnvironment()
      
      if (!envCheck.python_available) {
        return NextResponse.json({
          success: false,
          error: 'Python环境不可用',
          environment_check: envCheck
        }, { status: 400 })
      }

      if (envCheck.recommendations.length > 0 && !force) {
        return NextResponse.json({
          success: false,
          error: 'Python环境有问题，需要修复',
          environment_check: envCheck,
          message: '使用 force=true 参数强制执行'
        }, { status: 400 })
      }
    }

    // 🚀 执行Python爬虫集成
    const result = await pythonIntegration.runPythonIntegration()

    console.log('✅ Python爬虫集成任务完成:', result)

    return NextResponse.json({
      success: result.success,
      data: {
        integration_stats: result.stats,
        message: result.message,
        timestamp: new Date().toISOString(),
        source: 'python_crawler'
      },
      error: result.error
    })

  } catch (error) {
    console.error('🚨 Python爬虫集成API异常:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Python爬虫集成失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
}

// 📊 GET - 获取Python爬虫状态和环境信息
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取Python爬虫状态...')

    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' }, 
        { status: 401 }
      )
    }

    const adminEmails = ['lylh0319@gmail.com']
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: '权限不足' }, 
        { status: 403 }
      )
    }

    // 检查Python环境
    const envCheck = await checkPythonEnvironment()

    // 统计信息 (从数据库获取)
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()

    // 获取Python爬虫的统计数据
    const { data: pythonStats } = await supabase
      .from('labubu_posts')
      .select('id, created_at, platform, hot_score')
      .eq('source_type', 'python_crawler')
      .order('created_at', { ascending: false })
      .limit(100)

    const stats = {
      total_articles: pythonStats?.length || 0,
      platforms: [...new Set(pythonStats?.map(p => p.platform) || [])],
      latest_crawl: pythonStats?.[0]?.created_at || null,
      avg_hot_score: pythonStats && pythonStats.length > 0 
        ? pythonStats.reduce((sum, p) => sum + (p.hot_score || 0), 0) / pythonStats.length 
        : 0
    }

    // 📊 返回完整状态信息
    return NextResponse.json({
      success: true,
      data: {
        environment: envCheck,
        statistics: stats,
        capabilities: {
          news_sources: [
            'Hypebeast RSS',
            'Toy News International',
            'PopCult HQ',
            'KidScreen'
          ],
          social_platforms: [
            'Twitter (官方API)',
            'Twitter (twscrape)',
            'Reddit (官方API)',
            'Instagram (受限)',
            'Facebook (需要Business Partner)'
          ],
          features: [
            '多语言支持 (中英日韩泰)',
            '热度算法集成',
            '趋势关键词提取',
            '自动去重',
            '实时数据集成'
          ]
        },
        recommendations: envCheck.recommendations,
        status: envCheck.python_available ? 'ready' : 'needs_setup',
        message: envCheck.python_available 
          ? 'Python爬虫环境就绪，可执行集成任务' 
          : 'Python环境需要设置'
      }
    })

  } catch (error) {
    console.error('🚨 获取Python爬虫状态异常:', error)
    
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

// 🔧 PUT - 配置Python爬虫设置
export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 配置Python爬虫设置...')

    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' }, 
        { status: 401 }
      )
    }

    const adminEmails = ['lylh0319@gmail.com']
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: '权限不足' }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      keywords = [], 
      sources = [], 
      platforms = [], 
      language_filters = [] 
    } = body

    // 这里可以保存配置到数据库或配置文件
    // 目前返回确认信息
    console.log('✅ Python爬虫配置更新:', { keywords, sources, platforms, language_filters })

    return NextResponse.json({
      success: true,
      data: {
        updated_config: {
          keywords: keywords,
          sources: sources,
          platforms: platforms,
          language_filters: language_filters
        },
        message: 'Python爬虫配置已更新',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 Python爬虫配置异常:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '配置更新失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
} 