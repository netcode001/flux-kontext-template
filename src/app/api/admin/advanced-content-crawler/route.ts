// 🚀 高级内容爬虫管理API
// 管理员触发多语言社交媒体内容获取

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runAdvancedContentCrawler } from '@/lib/services/advanced-content-engine'

// 🚀 POST - 手动触发高级内容获取
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 管理员触发高级内容爬虫任务...')

    // 🔐 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' }, 
        { status: 401 }
      )
    }

    // 管理员验证
    const adminEmails = ['lylh0319@gmail.com']
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 🚀 执行高级内容获取任务
    const result = await runAdvancedContentCrawler()

    console.log('✅ 高级内容爬虫任务完成:', result)

    return NextResponse.json({
      success: true,
      data: {
        articlesCount: result.count,
        message: result.message,
        timestamp: new Date().toISOString(),
        type: 'advanced_crawler'
      }
    })

  } catch (error) {
    console.error('🚨 高级内容爬虫API异常:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '高级内容获取失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
} 