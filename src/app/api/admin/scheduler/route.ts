// 🕐 内容调度器管理API
// 管理员控制自动化任务调度

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  contentScheduler, 
  startContentScheduler, 
  stopContentScheduler, 
  getSchedulerStats 
} from '@/lib/services/content-scheduler'

// 🚀 POST - 启动调度器
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 管理员启动内容调度器...')

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
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 🚀 启动调度器
    startContentScheduler()
    const status = contentScheduler.getStatus()

    return NextResponse.json({
      success: true,
      data: {
        message: '内容调度器启动成功',
        status,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 启动调度器失败:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '启动调度器失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
}

// 🛑 DELETE - 停止调度器
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 管理员停止内容调度器...')

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
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 🛑 停止调度器
    stopContentScheduler()
    const status = contentScheduler.getStatus()

    return NextResponse.json({
      success: true,
      data: {
        message: '内容调度器已停止',
        status,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 停止调度器失败:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '停止调度器失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
}

// 📊 GET - 获取调度器状态和统计
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 获取调度器状态...')

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
        { success: false, error: '权限不足，仅管理员可操作' }, 
        { status: 403 }
      )
    }

    // 📊 获取状态和统计
    const status = contentScheduler.getStatus()
    const stats = await getSchedulerStats()

    return NextResponse.json({
      success: true,
      data: {
        status,
        stats,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 获取调度器状态失败:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '获取调度器状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    )
  }
} 