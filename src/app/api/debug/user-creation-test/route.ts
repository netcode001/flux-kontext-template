// src/app/api/debug/user-creation-test/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUuid } from '@/lib/utils/hash'
import { z } from 'zod'

// 模拟的用户信息Schema
const UserTestSchema = z.object({
  email: z.string().email('无效的邮箱地址'),
  name: z.string().optional(),
  image: z.string().url().optional()
})

export async function POST(request: NextRequest) {
  const log: string[] = []
  try {
    const body = await request.json()
    log.push(`[${new Date().toISOString()}] 收到请求: ${JSON.stringify(body)}`)

    const validation = UserTestSchema.safeParse(body)
    if (!validation.success) {
      log.push(`[${new Date().toISOString()}] ❌ 数据验证失败`)
      return NextResponse.json(
        { success: false, log, error: '请求数据格式不正确', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { email, name, image } = validation.data
    log.push(`[${new Date().toISOString()}] ✅ 数据验证成功: ${email}`)

    const supabase = createAdminClient()
    log.push(`[${new Date().toISOString()}] 🔧 Supabase 客户端创建成功`)

    // 1. 检查用户是否已存在
    log.push(`[${new Date().toISOString()}] 🔍 开始查询用户: ${email}`)
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      log.push(`[${new Date().toISOString()}] ❌ 数据库查询失败`)
      return NextResponse.json(
        { success: false, log, error: '数据库查询失败', details: findError },
        { status: 500 }
      )
    }

    if (existingUser) {
      log.push(`[${new Date().toISOString()}] ✅ 用户已存在: ${existingUser.id}`)
      return NextResponse.json({
        success: true,
        log,
        message: '用户已存在，无需创建',
        user: existingUser
      })
    }

    log.push(`[${new Date().toISOString()}] ℹ️ 用户不存在 (PGRST116)，准备创建...`)

    // 2. 创建新用户
    const newUserId = getUuid()
    const newUserData = {
      id: newUserId,
      email,
      name: name || email,
      image: image || '',
      credits: 100,
      signin_provider: 'debug-test'
    }

    log.push(`[${new Date().toISOString()}] ➕ 准备插入新用户数据: ${JSON.stringify(newUserData)}`)

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(newUserData)
      .select()
      .single()

    if (createError) {
      log.push(`[${new Date().toISOString()}] ❌❌❌ 新用户创建失败！这是根本原因！`)
      return NextResponse.json(
        { success: false, log, error: '创建新用户失败', details: createError },
        { status: 500 }
      )
    }

    log.push(`[${new Date().toISOString()}] 🎉 新用户创建成功！`)
    return NextResponse.json({
      success: true,
      log,
      message: '新用户创建成功',
      user: newUser
    })

  } catch (e: any) {
    log.push(`[${new Date().toISOString()}] 💥 API出现未知异常`)
    return NextResponse.json(
      { success: false, log, error: '服务器内部出现未知异常', details: e.message },
      { status: 500 }
    )
  }
} 