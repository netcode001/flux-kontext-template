import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session: {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userName: session?.user?.name,
        userImage: session?.user?.image,
        full: session
      },
      message: '当前Session信息'
    })
  } catch (error) {
    console.error('Session检查错误:', error)
    return NextResponse.json(
      { error: 'Session检查失败' },
      { status: 500 }
    )
  }
} 