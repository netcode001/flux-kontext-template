import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET: 分页获取新闻列表
export async function GET(request: NextRequest) {
  // 权限校验
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  }
  const adminEmails = ['lylh0319@gmail.com']
  if (!adminEmails.includes(session.user.email || '')) {
    return NextResponse.json({ success: false, error: '权限不足' }, { status: 403 })
  }

  // 解析分页参数
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 查询新闻
  const supabase = createAdminClient()
  const { data, error, count } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  })
}

// DELETE: 根据ID删除新闻
export async function DELETE(request: NextRequest) {
  // 权限校验
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
  }
  const adminEmails = ['lylh0319@gmail.com']
  if (!adminEmails.includes(session.user.email || '')) {
    return NextResponse.json({ success: false, error: '权限不足' }, { status: 403 })
  }

  // 获取ID
  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ success: false, error: '缺少新闻ID' }, { status: 400 })
  }

  // 删除新闻
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 