import { NextRequest, NextResponse } from 'next/server'
import { fetchAllNews } from '@/lib/services/news-aggregator'

// GET /api/news/search?keyword=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') || ''
  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Missing keyword' }, { status: 400 })
  }
  try {
    const articles = await fetchAllNews(keyword)
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
} 