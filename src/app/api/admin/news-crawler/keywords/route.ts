import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// 用于模拟存储关键字的内存数组
let keywords = [
  { id: uuidv4(), keyword: 'Labubu', enabled: true },
  { id: uuidv4(), keyword: '潮玩', enabled: true },
  { id: uuidv4(), keyword: '艺术玩具', enabled: true },
  { id: uuidv4(), keyword: '潮流', enabled: true }
]

// 获取所有关键字
export async function GET() {
  return NextResponse.json({ success: true, data: keywords })
}

// 新增关键字
export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()
    if (!keyword) {
      return NextResponse.json({ success: false, error: '关键字不能为空' }, { status: 400 })
    }
    const newKeyword = { id: uuidv4(), keyword, enabled: true }
    keywords.push(newKeyword)
    return NextResponse.json({ success: true, data: newKeyword })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
}

// 修改关键字（启用/禁用/重命名）
export async function PUT(request: NextRequest) {
  try {
    const { id, keyword, enabled } = await request.json()
    const idx = keywords.findIndex(k => k.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: '未找到关键字' }, { status: 404 })
    }
    if (typeof keyword === 'string') keywords[idx].keyword = keyword
    if (typeof enabled === 'boolean') keywords[idx].enabled = enabled
    return NextResponse.json({ success: true, data: keywords[idx] })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
}

// 删除关键字
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    const idx = keywords.findIndex(k => k.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: '未找到关键字' }, { status: 404 })
    }
    const removed = keywords.splice(idx, 1)
    return NextResponse.json({ success: true, data: removed[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
} 