import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { headers } from 'next/headers'

// 🔐 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📝 路径参数验证Schema
const downloadParamsSchema = z.object({
  id: z.string().uuid('无效的壁纸ID')
})

// 🛡️ 速率限制配置
const RATE_LIMITS = {
  // 每个用户每小时最多下载次数
  PER_USER_HOURLY: 50,
  // 每个IP每小时最多下载次数（防止未登录用户绕过）
  PER_IP_HOURLY: 20,
  // 每个用户每天最多下载次数
  PER_USER_DAILY: 200
}

// 🔍 检查用户下载速率限制
async function checkUserRateLimit(userId: string, ipAddress: string): Promise<{
  allowed: boolean
  reason?: string
  remaining?: number
}> {
  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 🔍 检查用户小时限制
    const { count: userHourlyCount, error: userHourlyError } = await supabase
      .from('wallpaper_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('download_at', oneHourAgo.toISOString())

    if (userHourlyError) {
      console.error('❌ 检查用户小时限制失败:', userHourlyError)
      return { allowed: false, reason: '系统错误' }
    }

    if ((userHourlyCount || 0) >= RATE_LIMITS.PER_USER_HOURLY) {
      return { 
        allowed: false, 
        reason: `每小时下载限制已达上限 (${RATE_LIMITS.PER_USER_HOURLY}次)`,
        remaining: 0
      }
    }

    // 🔍 检查用户每日限制
    const { count: userDailyCount, error: userDailyError } = await supabase
      .from('wallpaper_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('download_at', oneDayAgo.toISOString())

    if (userDailyError) {
      console.error('❌ 检查用户每日限制失败:', userDailyError)
      return { allowed: false, reason: '系统错误' }
    }

    if ((userDailyCount || 0) >= RATE_LIMITS.PER_USER_DAILY) {
      return { 
        allowed: false, 
        reason: `每日下载限制已达上限 (${RATE_LIMITS.PER_USER_DAILY}次)`,
        remaining: 0
      }
    }

    // 🔍 检查IP限制（防止恶意用户）
    const { count: ipHourlyCount, error: ipHourlyError } = await supabase
      .from('wallpaper_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('download_at', oneHourAgo.toISOString())

    if (ipHourlyError) {
      console.error('❌ 检查IP限制失败:', ipHourlyError)
      return { allowed: false, reason: '系统错误' }
    }

    if ((ipHourlyCount || 0) >= RATE_LIMITS.PER_IP_HOURLY) {
      return { 
        allowed: false, 
        reason: `IP地址下载频率过高，请稍后再试`,
        remaining: 0
      }
    }

    return { 
      allowed: true, 
      remaining: RATE_LIMITS.PER_USER_HOURLY - (userHourlyCount || 0)
    }

  } catch (error) {
    console.error('❌ 速率限制检查失败:', error)
    return { allowed: false, reason: '系统错误' }
  }
}

// 🤖 检测爬虫和可疑行为
function detectBot(userAgent: string, headers: Headers): {
  isBot: boolean
  reason?: string
} {
  const userAgentLower = userAgent.toLowerCase()
  
  // 🕷️ 常见爬虫标识
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'wget', 'curl', 
    'python', 'java', 'go-http', 'node', 'axios', 'fetch',
    'headless', 'phantom', 'selenium'
  ]
  
  for (const pattern of botPatterns) {
    if (userAgentLower.includes(pattern)) {
      return { isBot: true, reason: `检测到爬虫特征: ${pattern}` }
    }
  }
  
  // 🔍 检查必要的浏览器头
  const acceptHeader = headers.get('accept')
  const acceptLanguageHeader = headers.get('accept-language')
  
  if (!acceptHeader || !acceptLanguageHeader) {
    return { isBot: true, reason: '缺少必要的浏览器请求头' }
  }
  
  // 🔍 检查Referer（应该来自我们的网站）
  const referer = headers.get('referer')
  const host = headers.get('host')
  
  if (referer && host && !referer.includes(host)) {
    return { isBot: true, reason: '可疑的Referer来源' }
  }
  
  return { isBot: false }
}

// 📥 POST /api/wallpapers/[id]/download - 下载壁纸
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🛡️ 验证路径参数
    const validatedParams = downloadParamsSchema.parse(params)
    const { id: wallpaperId } = validatedParams

    // 🔐 检查用户认证
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请先登录才能下载壁纸',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      )
    }

    // 🌐 获取请求信息
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'

    console.log('📥 壁纸下载请求:', {
      wallpaperId,
      userId: session.user.id,
      userAgent,
      ipAddress
    })

    // 🤖 检测爬虫
    const botCheck = detectBot(userAgent, headersList)
    if (botCheck.isBot) {
      console.warn('🚫 检测到爬虫行为:', botCheck.reason)
      return NextResponse.json(
        { 
          success: false, 
          error: '检测到自动化访问，请使用浏览器正常访问',
          code: 'BOT_DETECTED'
        },
        { status: 403 }
      )
    }

    // 🛡️ 检查速率限制
    const rateLimitCheck = await checkUserRateLimit(session.user.id, ipAddress)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateLimitCheck.reason,
          code: 'RATE_LIMIT_EXCEEDED',
          remaining: rateLimitCheck.remaining || 0
        },
        { status: 429 }
      )
    }

    // 🖼️ 获取壁纸信息
    const { data: wallpaper, error: wallpaperError } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('id', wallpaperId)
      .eq('is_active', true)
      .single()

    if (wallpaperError || !wallpaper) {
      console.error('❌ 获取壁纸失败:', wallpaperError)
      return NextResponse.json(
        { 
          success: false, 
          error: '壁纸不存在或已下架',
          code: 'WALLPAPER_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // 🎯 检查Premium权限
    if (wallpaper.is_premium) {
      // TODO: 这里需要检查用户是否为Premium用户
      // 暂时允许所有登录用户下载
    }

    // 📊 记录下载
    const { error: downloadError } = await supabase
      .from('wallpaper_downloads')
      .insert({
        wallpaper_id: wallpaperId,
        user_id: session.user.id,
        user_email: session.user.email,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (downloadError) {
      console.error('❌ 记录下载失败:', downloadError)
      // 不影响下载流程，继续执行
    }

    // 📈 更新下载计数
    const { error: updateError } = await supabase
      .from('wallpapers')
      .update({ 
        download_count: wallpaper.download_count + 1 
      })
      .eq('id', wallpaperId)

    if (updateError) {
      console.error('❌ 更新下载计数失败:', updateError)
      // 不影响下载流程，继续执行
    }

    console.log('✅ 壁纸下载成功:', {
      wallpaperId,
      userId: session.user.id,
      title: wallpaper.title,
      download_count: wallpaper.download_count + 1
    })

    // 🎯 返回下载信息
    return NextResponse.json({
      success: true,
      data: {
        wallpaper: {
          id: wallpaper.id,
          title: wallpaper.title,
          image_url: wallpaper.image_url,
          file_size: wallpaper.file_size,
          dimensions: wallpaper.dimensions,
          original_filename: wallpaper.original_filename
        },
        download_url: wallpaper.image_url, // 直接返回图片URL
        rate_limit: {
          remaining: rateLimitCheck.remaining || 0,
          reset_in_hours: 1
        }
      }
    })

  } catch (error) {
    console.error('❌ 壁纸下载API错误:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '请求参数无效', 
          details: error.errors,
          code: 'INVALID_PARAMS'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
} 