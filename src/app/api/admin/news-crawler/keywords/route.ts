import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取所有关键字（按创建时间倒序）
export async function GET() {
  try {
    const keywords = await prisma.newsKeyword.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json({ success: true, data: keywords })
  } catch (error) {
    return NextResponse.json({ success: false, error: '数据库查询失败' }, { status: 500 })
  }
}

// 新增关键字
export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()
    if (!keyword) {
      return NextResponse.json({ success: false, error: '关键字不能为空' }, { status: 400 })
    }
    // 检查是否已存在
    const exists = await prisma.newsKeyword.findUnique({ where: { keyword } })
    if (exists) {
      return NextResponse.json({ success: false, error: '关键字已存在' }, { status: 409 })
    }
    const newKeyword = await prisma.newsKeyword.create({
      data: { keyword, enabled: true }
    })
    return NextResponse.json({ success: true, data: newKeyword })
  } catch (error) {
    return NextResponse.json({ success: false, error: '数据库写入失败' }, { status: 500 })
  }
}

// 修改关键字（启用/禁用/重命名）
export async function PUT(request: NextRequest) {
  try {
    const { id, keyword, enabled } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })
    }
    const updateData: any = {}
    if (typeof keyword === 'string') updateData.keyword = keyword
    if (typeof enabled === 'boolean') updateData.enabled = enabled
    const updated = await prisma.newsKeyword.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: '数据库更新失败' }, { status: 500 })
  }
}

// 删除关键字（物理删除）
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 })
    }
    const deleted = await prisma.newsKeyword.delete({ where: { id } })
    return NextResponse.json({ success: true, data: deleted })
  } catch (error) {
    return NextResponse.json({ success: false, error: '数据库删除失败' }, { status: 500 })
  }
} 