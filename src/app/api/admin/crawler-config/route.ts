// 🕷️ 爬虫配置管理API
// 统一管理所有爬虫的开关状态和配置

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CrawlerConfigService } from '@/lib/services/crawler-config'

// 🛡️ 管理员权限验证
async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: '请先登录' },
      { status: 401 }
    )
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isAdmin = adminEmails.includes(session.user.email)
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: '需要管理员权限' },
      { status: 403 }
    )
  }

  return null
}

// 🔍 GET - 获取所有爬虫配置
export async function GET(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const configService = new CrawlerConfigService()
    const configs = await configService.getAllConfigs()
    const enabledCount = await configService.getEnabledCrawlersCount()

    return NextResponse.json({
      success: true,
      data: {
        configs,
        enabled_count: enabledCount,
        total_count: configs.length
      }
    })

  } catch (error: any) {
    console.error('❌ 获取爬虫配置失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取爬虫配置失败'
    }, { status: 500 })
  }
}

// 🔧 PUT - 更新爬虫配置
export async function PUT(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const body = await request.json()
    const { crawler_name, updates } = body

    if (!crawler_name) {
      return NextResponse.json({
        success: false,
        error: '缺少爬虫名称'
      }, { status: 400 })
    }

    const configService = new CrawlerConfigService()
    const success = await configService.updateConfig(crawler_name, updates)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `爬虫配置更新成功: ${crawler_name}`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: '更新爬虫配置失败'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ 更新爬虫配置失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '更新爬虫配置失败'
    }, { status: 500 })
  }
}

// 🎛️ POST - 切换爬虫开关
export async function POST(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const body = await request.json()
    const { action, crawler_name, batch_updates } = body

    const configService = new CrawlerConfigService()

    if (action === 'toggle' && crawler_name) {
      // 单个爬虫开关切换
      const success = await configService.toggleCrawler(crawler_name)
      
      if (success) {
        const config = await configService.getConfig(crawler_name)
        return NextResponse.json({
          success: true,
          message: `爬虫开关切换成功: ${crawler_name}`,
          data: {
            crawler_name,
            is_enabled: config?.is_enabled
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: '切换爬虫开关失败'
        }, { status: 500 })
      }

    } else if (action === 'batch_update' && batch_updates) {
      // 批量更新爬虫状态
      const success = await configService.batchUpdateStatus(batch_updates)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: '批量更新爬虫状态成功',
          data: { updated_count: batch_updates.length }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: '批量更新爬虫状态失败'
        }, { status: 500 })
      }

    } else {
      return NextResponse.json({
        success: false,
        error: '无效的操作参数'
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ 爬虫配置操作失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '爬虫配置操作失败'
    }, { status: 500 })
  }
} 