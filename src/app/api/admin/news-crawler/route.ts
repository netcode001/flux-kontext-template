// 📰 新闻爬虫管理API
// 管理员手动触发新闻内容获取

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runNewsCrawlerTask, getNewsSourceStats } from '@/lib/services/news-crawler'

// 🚀 POST - 手动触发新闻获取
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 管理员触发新闻爬虫任务...')

    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' }, 
        { status: 401 }
      )
    }

    // 简单的管理员验证（实际项目中需要更严格的权限控制）
    const adminEmails = ['lylh0319@gmail.com'] // 管理员邮箱列表
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 解析days参数，默认1天，最大7天
    let days = 1
    try {
      const body = await request.json()
      if (body.days && Number.isInteger(body.days) && body.days >= 1 && body.days <= 7) {
        days = body.days
      }
    } catch {}

    // 🚀 执行新闻获取任务，返回详细日志
    const result = await runNewsCrawlerTask({ withLogs: true, days })

    console.log('✅ 新闻爬虫任务完成:', result)

    return NextResponse.json({
      success: true,
      data: {
        articlesCount: result.count,
        message: result.message,
        timestamp: new Date().toISOString(),
        logs: result.logs || []
      }
    })

  } catch (error) {
    console.error('🚨 新闻爬虫API异常:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '新闻获取失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
}

// 📊 GET - 获取爬虫状态信息
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取新闻爬虫状态...')

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

    // 获取每个数据源的累计抓取数量
    const sourcesStats = await getNewsSourceStats()

    // 📊 返回爬虫状态信息
    return NextResponse.json({
      success: true,
      data: {
        status: 'ready',
        lastRun: null, // 实际项目中可以从数据库获取
        sources: sourcesStats, // [{ name, count }]
        message: '新闻爬虫服务就绪，可手动触发获取任务'
      }
    })

  } catch (error) {
    console.error('🚨 获取爬虫状态异常:', error)
    
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