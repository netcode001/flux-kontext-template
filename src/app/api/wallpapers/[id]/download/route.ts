import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { headers } from 'next/headers'

// 🔐 修复：延迟Supabase客户端初始化
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL 或 Service Role Key 未配置')
  }

  return createClient(supabaseUrl, supabaseKey)
}

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
    
    const supabase = getSupabaseClient() // ✨ 使用函数获取客户端

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
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const supabase = getSupabaseClient() // ✨ 使用函数获取客户端
    
    // 🛡️ 验证路径参数
    const validatedParams = downloadParamsSchema.parse(params)
    const { id: wallpaperId } = validatedParams

    // 🔐 检查用户认证（可选，不再强制要求）
    const session = await getServerSession(authOptions)
    const isAuthenticated = !!session?.user

    // 🌐 获取请求信息
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'

    console.log('📥 壁纸下载请求:', {
      wallpaperId,
      userId: session?.user?.id || 'anonymous',
      userAgent,
      ipAddress,
      isAuthenticated
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

    // 🛡️ 检查速率限制（对登录用户和匿名用户分别处理）
    if (isAuthenticated) {
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
    } else {
      // 🔍 对匿名用户的IP限制检查
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      const { count: ipHourlyCount, error: ipHourlyError } = await supabase
        .from('wallpaper_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .is('user_id', null) // 只检查匿名用户
        .gte('download_at', oneHourAgo.toISOString())

      if (ipHourlyError) {
        console.error('❌ 检查匿名用户IP限制失败:', ipHourlyError)
        return NextResponse.json(
          { success: false, error: '系统错误' },
          { status: 500 }
        )
      }

      if ((ipHourlyCount || 0) >= RATE_LIMITS.PER_IP_HOURLY) {
        return NextResponse.json(
          { 
            success: false, 
            error: `IP地址下载频率过高，请稍后再试`,
            code: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        )
      }
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

    // 🎯 检查Premium权限（暂时允许所有用户下载）
    if (wallpaper.is_premium) {
      // TODO: 这里需要检查用户是否为Premium用户
      // 暂时允许所有用户下载
    }

    // 📊 记录下载（支持匿名用户）
    const downloadRecord = {
      wallpaper_id: wallpaperId,
      user_id: session?.user?.id || null, // 匿名用户为null
      user_email: session?.user?.email || null, // 匿名用户为null
      ip_address: ipAddress,
      user_agent: userAgent
    }

    const { error: downloadError } = await supabase
      .from('wallpaper_downloads')
      .insert(downloadRecord)

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
      userId: session?.user?.id || 'anonymous',
      title: wallpaper.title,
      download_count: wallpaper.download_count + 1
    })

    // 🖼️ 代理R2图片流 - 解决CORS问题
    try {
      console.log('📡 开始代理图片流:', wallpaper.image_url)
      
      // 🔍 从R2获取图片流
      const imageResponse = await fetch(wallpaper.image_url)
      
      if (!imageResponse.ok) {
        console.error('❌ R2图片获取失败:', imageResponse.status, imageResponse.statusText)
        return NextResponse.json(
          { 
            success: false, 
            error: '图片资源暂时不可用，请稍后重试',
            code: 'IMAGE_FETCH_FAILED'
          },
          { status: 503 }
        )
      }

      // 📦 获取图片二进制数据
      const imageBuffer = await imageResponse.arrayBuffer()
      
      // 🏷️ 只用R2原始文件名
      const downloadFilename = wallpaper.original_filename || `wallpaper-${wallpaper.id}.jpg`

      console.log('📥 准备返回图片流:', {
        filename: downloadFilename,
        size: imageBuffer.byteLength,
        contentType: imageResponse.headers.get('content-type')
      })

      // 🎯 返回图片流，设置下载响应头（只用原始文件名）
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Content-Length': imageBuffer.byteLength.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

    } catch (imageError) {
      console.error('❌ 图片流代理失败:', imageError)
      return NextResponse.json(
        { 
          success: false, 
          error: '图片下载失败，请稍后重试',
          code: 'IMAGE_PROXY_FAILED'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ 壁纸下载API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '系统错误，请稍后重试',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
} 