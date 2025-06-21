// 🎛️ 菜单批量操作API
// 批量更新排序、可见性等操作

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 🛡️ 批量操作数据验证
const BatchUpdateSchema = z.object({
  action: z.enum(['reorder', 'toggle_visibility', 'bulk_update']),
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int().min(0).optional(),
    is_visible: z.boolean().optional()
  }))
})

// 🛡️ 管理员权限验证
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { error: '请先登录', status: 401 }
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isAdmin = adminEmails.includes(session.user.email)
  
  if (!isAdmin) {
    return { error: '需要管理员权限', status: 403 }
  }

  return null
}

// 🔄 POST - 批量操作菜单项
export async function POST(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess()
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const body = await request.json()
    const { action, items } = BatchUpdateSchema.parse(body)

    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)

    console.log(`🔄 执行批量操作: ${action}, 影响${items.length}个菜单项`)

    switch (action) {
      case 'reorder': {
        // 📊 批量更新排序
        const updatePromises = items.map(item => 
          supabase
            .from('menu_items')
            .update({
              sort_order: item.sort_order,
              updated_by: session?.user?.id
            })
            .eq('id', item.id)
        )

        const results = await Promise.all(updatePromises)
        const failedUpdates = results.filter(result => result.error)

        if (failedUpdates.length > 0) {
          console.error('❌ 批量排序更新失败:', failedUpdates)
          return NextResponse.json(
            { 
              error: '部分菜单项排序更新失败',
              failedCount: failedUpdates.length,
              totalCount: items.length
            },
            { status: 500 }
          )
        }

        console.log('✅ 菜单排序更新成功')
        return NextResponse.json({
          success: true,
          message: `成功重新排序 ${items.length} 个菜单项`,
          updatedCount: items.length
        })
      }

      case 'toggle_visibility': {
        // 👁️ 批量切换可见性
        const updatePromises = items.map(item => 
          supabase
            .from('menu_items')
            .update({
              is_visible: item.is_visible,
              updated_by: session?.user?.id
            })
            .eq('id', item.id)
        )

        const results = await Promise.all(updatePromises)
        const failedUpdates = results.filter(result => result.error)

        if (failedUpdates.length > 0) {
          console.error('❌ 批量可见性更新失败:', failedUpdates)
          return NextResponse.json(
            { 
              error: '部分菜单项可见性更新失败',
              failedCount: failedUpdates.length,
              totalCount: items.length
            },
            { status: 500 }
          )
        }

        console.log('✅ 菜单可见性更新成功')
        return NextResponse.json({
          success: true,
          message: `成功更新 ${items.length} 个菜单项的可见性`,
          updatedCount: items.length
        })
      }

      case 'bulk_update': {
        // 🔄 批量综合更新
        const updatePromises = items.map(item => {
          const updateData: any = { updated_by: session?.user?.id }
          
          if (item.sort_order !== undefined) {
            updateData.sort_order = item.sort_order
          }
          if (item.is_visible !== undefined) {
            updateData.is_visible = item.is_visible
          }

          return supabase
            .from('menu_items')
            .update(updateData)
            .eq('id', item.id)
        })

        const results = await Promise.all(updatePromises)
        const failedUpdates = results.filter(result => result.error)

        if (failedUpdates.length > 0) {
          console.error('❌ 批量综合更新失败:', failedUpdates)
          return NextResponse.json(
            { 
              error: '部分菜单项更新失败',
              failedCount: failedUpdates.length,
              totalCount: items.length
            },
            { status: 500 }
          )
        }

        console.log('✅ 菜单批量更新成功')
        return NextResponse.json({
          success: true,
          message: `成功批量更新 ${items.length} 个菜单项`,
          updatedCount: items.length
        })
      }

      default:
        return NextResponse.json(
          { error: `不支持的操作类型: ${action}` },
          { status: 400 }
        )
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ 批量操作失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '批量操作失败'
    }, { status: 500 })
  }
} 