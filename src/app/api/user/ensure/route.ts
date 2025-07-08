import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUuid } from '@/lib/utils/hash'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// 终极修复：改造ensure-user API的安全机制
// 移除 getServerSession 检查，改用内部密钥验证
export async function POST(request: NextRequest) {
  try {
    // 🔐 验证内部API密钥
    const internalSecret = request.headers.get('X-Internal-Secret')
    if (process.env.INTERNAL_API_SECRET && internalSecret !== process.env.INTERNAL_API_SECRET) {
      console.log('❌ [ensure-user] 无效的内部API密钥')
      return NextResponse.json(
        { error: '无权访问' },
        { status: 403 }
      )
    }

    // 从请求体中获取用户信息，因为不再有session
    const body = await request.json()
    const { email, name, image, provider } = body

    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 })
    }

    console.log('🔍 [ensure-user] 收到请求:', email)

    const supabase = createAdminClient()
    
    // 首先尝试查找用户
    try {
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single()

      if (!findError && existingUser) {
        console.log('✅ [ensure-user] 用户已存在:', existingUser.email)
        return NextResponse.json({
          success: true,
          message: '用户已存在',
          user: {
            id: existingUser.id,
            email: existingUser.email,
          },
          action: 'found'
        })
      }
      
      // 用户不存在 (PGRST116)，创建新用户
      console.log('🔧 [ensure-user] 创建新用户:', email)
      
      const newUserData = {
        email: email,
        name: name || null,
        image: image || null,
        credits: 30, // 默认积分
        signin_provider: provider || 'unknown',
        signin_type: 'oauth',
        signin_count: 1,
        last_signin_at: new Date().toISOString()
      }

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select('id, email')
        .single()

      if (createError) {
        console.error('🚨 [ensure-user] 创建用户失败:', createError)
        return NextResponse.json({
          success: false,
          error: '创建用户失败',
          details: createError.message
        }, { status: 500 })
      }

      console.log('✅ [ensure-user] 用户创建成功:', newUser.email)
      
      return NextResponse.json({
        success: true,
        message: '用户创建成功',
        user: newUser,
        action: 'created'
      })

    } catch (error) {
      console.error('🚨 [ensure-user] 数据库操作失败:', error)
      return NextResponse.json({
        success: false,
        error: '数据库操作失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [ensure-user] API 发生未知错误:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 🔍 GET - 检查用户状态 (恢复被误删的GET方法)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({
            success: false,
            exists: false,
            error: '用户不存在'
          })
        }
        
        return NextResponse.json({
          success: false,
          exists: false,
          error: '数据库查询错误',
          details: error
        })
      }

      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          credits: user.credits || 0
        }
      })

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: '数据库查询失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 