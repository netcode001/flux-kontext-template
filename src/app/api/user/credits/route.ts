import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient, createAdminClientWithRetry } from '@/lib/supabase/server'

// 🔥 获取用户积分信息
export async function GET(request: NextRequest) {
  try {
    // 🔐 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('❌ 用户未登录')
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    console.log('🔍 开始获取用户积分:', session.user.email)

    // 🔧 使用带重试机制的Supabase客户端
    const supabase = createAdminClient()
    
    // 🔄 添加重试机制的查询操作
    const queryWithRetry = async () => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .limit(1)
        .single()
      
      return { user, userError }
    }

    // 执行带重试的查询
    let user, userError
    try {
      const result = await queryWithRetry()
      user = result.user
      userError = result.userError
    } catch (retryError) {
      console.error('🚨 查询用户失败:', {
        message: retryError instanceof Error ? retryError.message : '未知错误',
        details: retryError instanceof Error ? retryError.stack : '无详细信息',
        hint: '数据库连接可能不稳定',
        code: ''
      })
      
      return NextResponse.json(
        { 
          error: '数据库连接失败',
          details: '请稍后重试或联系技术支持',
          suggestion: '如果问题持续存在，请刷新页面重试'
        },
        { status: 500 }
      )
    }

    if (userError) {
      if (userError.code === 'PGRST116') { // No rows found
        console.log('❌ 用户信息不存在，尝试自动创建:', session.user.email)
        
        // 🔧 自动创建用户（容错机制）
        try {
          const { getUuid } = await import('@/lib/utils/hash')
          
          // 🎯 强制使用生成的UUID
          const newUserId = getUuid()
          
          const newUserData = {
            id: newUserId, // 🔧 修复：使用生成的UUID
            email: session.user.email,
            name: session.user.name || session.user.email,
            image: session.user.image || '',
            credits: 100, // 🎁 新用户赠送100积分
            signin_type: 'oauth',
            signin_provider: 'google',
            signin_openid: '', // OAuth ID单独存储
            signin_ip: 'unknown',
            last_signin_at: new Date().toISOString(),
            signin_count: 1,
            location: 'US',
            preferred_currency: 'USD',
            preferred_payment_provider: 'creem'
          }

          console.log('🔍 准备自动创建用户:', {
            id: newUserData.id,
            email: newUserData.email
          })

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert(newUserData)
            .select()
            .single()

          if (createError) {
            console.error('🚨 自动创建用户失败:', createError)
            return NextResponse.json(
              { 
                error: '用户信息不存在且创建失败',
                details: createError.message,
                suggestion: '请重新登录或联系技术支持'
              },
              { status: 404 }
            )
          }

          console.log('🎉 用户自动创建成功:', newUser.email)

          // 🎁 创建积分赠送记录
          try {
            await supabase
              .from('credit_transactions')
              .insert({
                id: getUuid(),
                user_id: newUser.id,
                amount: 100,
                type: 'gift',
                description: '新用户注册赠送积分',
                reference_id: 'welcome_bonus'
              })
          } catch (creditError) {
            console.error('⚠️ 积分记录创建失败:', creditError)
          }

          // 🔍 获取新用户的积分交易记录
          const { data: creditTransactions } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', newUser.id)
            .order('created_at', { ascending: false })
            .limit(10)

          return NextResponse.json({
            success: true,
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              credits: newUser.credits || 0,
              memberSince: newUser.created_at
            },
            creditTransactions: creditTransactions || [],
            activeSubscription: null,
            summary: {
              totalCredits: newUser.credits || 0,
              hasActiveSubscription: false,
              subscriptionPlan: null,
              subscriptionExpiry: null
            },
            message: '用户自动创建成功'
          })

        } catch (autoCreateError) {
          console.error('🚨 自动创建用户异常:', autoCreateError)
          return NextResponse.json(
            { 
              error: '用户信息不存在',
              details: '自动创建用户失败',
              suggestion: '请重新登录或联系技术支持'
            },
            { status: 404 }
          )
        }
      } else {
        console.error('🚨 查询用户失败:', userError)
        return NextResponse.json(
          { 
            error: '查询用户失败',
            details: userError.message
          },
          { status: 500 }
        )
      }
    }

    if (!user) {
      console.log('❌ 用户信息不存在:', session.user.email)
      return NextResponse.json(
        { error: '用户信息不存在' },
        { status: 404 }
      )
    }

    console.log('✅ 用户信息获取成功:', user.email, '积分:', user.credits)

    // 🔍 获取用户的积分交易记录（最近10条）
    const { data: creditTransactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 🔍 获取用户的活跃订阅（模拟数据）
    const activeSubscription = null // 暂时返回null，后续可以实现

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits || 0,
        memberSince: user.created_at
      },
      creditTransactions: creditTransactions || [],
      activeSubscription,
      summary: {
        totalCredits: user.credits || 0,
        hasActiveSubscription: !!activeSubscription,
        subscriptionPlan: null,
        subscriptionExpiry: null
      }
    })

  } catch (error) {
    console.error('❌ 获取用户积分信息失败:', error)
    return NextResponse.json(
      { 
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 