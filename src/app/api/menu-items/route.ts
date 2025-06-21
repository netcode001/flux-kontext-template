// 📱 公开菜单获取API
// 供前端Navigation组件获取菜单配置

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// 📊 GET - 获取可见的菜单项
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // 获取所有可见的菜单项，按sort_order排序
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        key,
        label,
        href,
        emoji,
        icon,
        sort_order,
        is_dropdown,
        parent_id,
        target,
        css_class,
        permission_required
      `)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ 获取公开菜单项失败:', error)
      return NextResponse.json(
        { error: '获取菜单项失败' },
        { status: 500 }
      )
    }

    // 🔄 构建层级结构
    const rootItems = menuItems?.filter(item => !item.parent_id) || []
    const childItems = menuItems?.filter(item => item.parent_id) || []
    
    const menuTree = rootItems.map(item => ({
      ...item,
      children: childItems.filter(child => child.parent_id === item.id)
        .sort((a, b) => a.sort_order - b.sort_order)
    }))

    return NextResponse.json({
      success: true,
      data: menuTree
    })

  } catch (error: any) {
    console.error('❌ 公开菜单API错误:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取菜单项失败'
    }, { status: 500 })
  }
} 