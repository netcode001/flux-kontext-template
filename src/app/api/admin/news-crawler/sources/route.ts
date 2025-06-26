import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// 用于模拟存储新闻来源的内存数组
let sources = [
  { id: uuidv4(), name: 'BBC News', url: 'https://www.bbc.com/news', enabled: true },
  { id: uuidv4(), name: 'CNN', url: 'https://www.cnn.com', enabled: true },
  { id: uuidv4(), name: 'Reuters', url: 'https://www.reuters.com', enabled: true },
  { id: uuidv4(), name: 'Entertainment Weekly', url: 'https://ew.com', enabled: true },
  { id: uuidv4(), name: 'Hypebeast', url: 'https://hypebeast.com', enabled: true }
]

// 获取所有新闻来源
export async function GET() {
  return NextResponse.json({ success: true, data: sources })
}

// 新增新闻来源
export async function POST(request: NextRequest) {
  try {
    const { name, url } = await request.json()
    if (!name || !url) {
      return NextResponse.json({ success: false, error: '来源名称和URL不能为空' }, { status: 400 })
    }
    const newSource = { id: uuidv4(), name, url, enabled: true }
    sources.push(newSource)
    return NextResponse.json({ success: true, data: newSource })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
}

// 修改新闻来源（启用/禁用/重命名/改URL）
export async function PUT(request: NextRequest) {
  try {
    const { id, name, url, enabled } = await request.json()
    const idx = sources.findIndex(s => s.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: '未找到来源' }, { status: 404 })
    }
    if (typeof name === 'string') sources[idx].name = name
    if (typeof url === 'string') sources[idx].url = url
    if (typeof enabled === 'boolean') sources[idx].enabled = enabled
    return NextResponse.json({ success: true, data: sources[idx] })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
}

// 删除新闻来源
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const idx = sources.findIndex(s => s.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: '未找到来源' }, { status: 404 })
    }
    const removed = sources.splice(idx, 1)
    return NextResponse.json({ success: true, data: removed[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
} 