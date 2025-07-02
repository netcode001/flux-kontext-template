import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from "@/components/Navigation"
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  // 🔐 验证管理员权限
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  // 简单的管理员验证
  const adminEmails = ['lylh0319@gmail.com', 'test@example.com']
  if (!adminEmails.includes(session.user.email || '')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 统一的导航栏 */}
      <Navigation />
      
      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">加载管理面板...</p>
            </div>
          </div>
        }>
          <AdminDashboard />
        </Suspense>
      </div>
    </div>
  )
} 