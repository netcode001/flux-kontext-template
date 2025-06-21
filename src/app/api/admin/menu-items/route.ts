// 🎛️ 菜单管理API端点
// 管理网站header菜单的显示、隐藏、排序和配置

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 🛡️ 数据验证Schema
const MenuItemSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  href: z.string().min(1).max(255),
  emoji: z.string().max(10).optional(),
  icon: z.string().max(50).optional(),
  sort_order: z.number().int().min(0),
  is_visible: z.boolean(),
  is_dropdown: z.boolean(),
  parent_id: z.string().uuid().optional().nullable(),
  target: z.string().max(20).optional(),
  css_class: z.string().max(255).optional(),
  permission_required: z.string().max(100).optional()
})

const UpdateMenuItemSchema = MenuItemSchema.partial().extend({
  id: z.string().uuid()
})

// 🛡️ 管理员权限验证
async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: '请先登录' },
      { status: 401 }
    )
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isAdmin = adminEmails.includes(session.user.email)
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: '需要管理员权限' },
      { status: 403 }
    )
  }

  return null
}

// 📊 GET - 获取所有菜单项
export async function GET(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const supabase = createAdminClient()
    
    // 获取所有菜单项，按sort_order排序
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
        is_visible,
        is_dropdown,
        parent_id,
        target,
        css_class,
        permission_required,
        created_at,
        updated_at,
        parent:parent_id(id, key, label)
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ 获取菜单项失败:', error)
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
    }))

    return NextResponse.json({
      success: true,
      data: {
        menuItems: menuTree,
        totalCount: menuItems?.length || 0
      }
    })

  } catch (error: any) {
    console.error('❌ 菜单管理API错误:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取菜单项失败'
    }, { status: 500 })
  }
}

// ➕ POST - 创建新菜单项
export async function POST(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const body = await request.json()
    const validatedData = MenuItemSchema.parse(body)

    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)

    // 检查key是否已存在
    const { data: existingItem } = await supabase
      .from('menu_items')
      .select('id')
      .eq('key', validatedData.key)
      .single()

    if (existingItem) {
      return NextResponse.json(
        { error: `菜单key "${validatedData.key}" 已存在` },
        { status: 400 }
      )
    }

    // 🔍 如果是子菜单，验证父菜单存在
    if (validatedData.parent_id) {
      const { data: parentItem } = await supabase
        .from('menu_items')
        .select('id, is_dropdown')
        .eq('id', validatedData.parent_id)
        .single()

      if (!parentItem) {
        return NextResponse.json(
          { error: '父菜单不存在' },
          { status: 400 }
        )
      }

      // 确保父菜单设置为dropdown
      if (!parentItem.is_dropdown) {
        await supabase
          .from('menu_items')
          .update({ is_dropdown: true })
          .eq('id', validatedData.parent_id)
      }
    }

    // 创建菜单项
    const { data: newMenuItem, error } = await supabase
      .from('menu_items')
      .insert({
        ...validatedData,
        created_by: session?.user?.id,
        updated_by: session?.user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 创建菜单项失败:', error)
      return NextResponse.json(
        { error: '创建菜单项失败' },
        { status: 500 }
      )
    }

    console.log('✅ 菜单项创建成功:', newMenuItem.key)
    
    return NextResponse.json({
      success: true,
      data: newMenuItem,
      message: `菜单项 "${newMenuItem.label}" 创建成功`
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ 创建菜单项失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '创建菜单项失败'
    }, { status: 500 })
  }
}

// ✏️ PUT - 更新菜单项
export async function PUT(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const body = await request.json()
    const validatedData = UpdateMenuItemSchema.parse(body)

    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)

    const { id, ...updateData } = validatedData

    // 🔍 验证菜单项存在
    const { data: existingItem } = await supabase
      .from('menu_items')
      .select('id, key')
      .eq('id', id)
      .single()

    if (!existingItem) {
      return NextResponse.json(
        { error: '菜单项不存在' },
        { status: 404 }
      )
    }

    // 🔍 如果更新key，检查新key是否已被使用
    if (updateData.key && updateData.key !== existingItem.key) {
      const { data: duplicateItem } = await supabase
        .from('menu_items')
        .select('id')
        .eq('key', updateData.key)
        .neq('id', id)
        .single()

      if (duplicateItem) {
        return NextResponse.json(
          { error: `菜单key "${updateData.key}" 已被其他菜单使用` },
          { status: 400 }
        )
      }
    }

    // 🔍 如果是子菜单，验证父菜单存在
    if (updateData.parent_id) {
      const { data: parentItem } = await supabase
        .from('menu_items')
        .select('id, is_dropdown')
        .eq('id', updateData.parent_id)
        .single()

      if (!parentItem) {
        return NextResponse.json(
          { error: '父菜单不存在' },
          { status: 400 }
        )
      }

      // 确保父菜单设置为dropdown
      if (!parentItem.is_dropdown) {
        await supabase
          .from('menu_items')
          .update({ is_dropdown: true })
          .eq('id', updateData.parent_id)
      }
    }

    // 更新菜单项
    const { data: updatedMenuItem, error } = await supabase
      .from('menu_items')
      .update({
        ...updateData,
        updated_by: session?.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 更新菜单项失败:', error)
      return NextResponse.json(
        { error: '更新菜单项失败' },
        { status: 500 }
      )
    }

    console.log('✅ 菜单项更新成功:', updatedMenuItem.key)
    
    return NextResponse.json({
      success: true,
      data: updatedMenuItem,
      message: `菜单项 "${updatedMenuItem.label}" 更新成功`
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ 更新菜单项失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '更新菜单项失败'
    }, { status: 500 })
  }
}

// 🗑️ DELETE - 删除菜单项
export async function DELETE(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少菜单项ID' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 🔍 检查是否有子菜单
    const { data: childItems } = await supabase
      .from('menu_items')
      .select('id, label')
      .eq('parent_id', id)

    if (childItems && childItems.length > 0) {
      return NextResponse.json(
        { 
          error: '无法删除有子菜单的菜单项',
          details: `请先删除以下子菜单: ${childItems.map(item => item.label).join(', ')}`
        },
        { status: 400 }
      )
    }

    // 删除菜单项
    const { data: deletedMenuItem, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 删除菜单项失败:', error)
      return NextResponse.json(
        { error: '删除菜单项失败' },
        { status: 500 }
      )
    }

    if (!deletedMenuItem) {
      return NextResponse.json(
        { error: '菜单项不存在' },
        { status: 404 }
      )
    }

    console.log('✅ 菜单项删除成功:', deletedMenuItem.key)
    
    return NextResponse.json({
      success: true,
      data: deletedMenuItem,
      message: `菜单项 "${deletedMenuItem.label}" 删除成功`
    })

  } catch (error: any) {
    console.error('❌ 删除菜单项失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '删除菜单项失败'
    }, { status: 500 })
  }
} 