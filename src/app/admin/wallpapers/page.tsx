"use client"

import { WallpaperManager } from '@/components/admin/WallpaperManager'
import { Suspense } from 'react'

export default function AdminWallpaperPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          壁纸管理
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          在这里上传、管理和编辑所有壁纸内容。
        </p>
      </div>
      <Suspense fallback={<div className="text-center py-10">加载中...</div>}>
        <WallpaperManager />
      </Suspense>
    </div>
  )
} 