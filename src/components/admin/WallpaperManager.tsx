"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Wallpaper, WallpaperCategory } from '@/types/wallpaper'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlusCircle, RefreshCw, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { WallpaperUploadDialog } from './WallpaperUploadDialog'
import { cn } from '@/lib/utils'

interface ApiResponse {
  success: boolean
  data?: {
    wallpapers: Wallpaper[]
    pagination: any
    categories?: WallpaperCategory[]
  }
  error?: string
}

export function WallpaperManager() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string[]>([])

  const fetchWallpapers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/wallpapers?limit=100&sort=latest')
      const result: ApiResponse = await response.json()

      if (result.success && result.data) {
        setWallpapers(result.data.wallpapers)
        setSelectedIds([]) // 刷新后清空选项
      } else {
        setError(result.error || '获取壁纸数据失败')
      }
    } catch (err) {
      console.error(err)
      setError('发生网络错误，请检查您的网络连接或联系管理员。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallpapers()
  }, [fetchWallpapers])

  const handleUploadSuccess = useCallback(() => {
    fetchWallpapers()
  }, [fetchWallpapers])
  
  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = async () => {
    if (itemToDelete.length === 0) return
    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/admin/wallpapers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: itemToDelete }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || '删除失败')
      }
      
      // 从UI中移除已删除的壁纸
      setWallpapers(prev => prev.filter(wp => !itemToDelete.includes(wp.id)))
      setSelectedIds(prev => prev.filter(id => !itemToDelete.includes(id)))

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
      setDialogOpen(false)
      setItemToDelete([])
    }
  }

  const openDeleteDialog = (ids: string[]) => {
    setItemToDelete(ids)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">壁纸列表 ({wallpapers.length})</h2>
          <div className="flex gap-2">
             {selectedIds.length > 0 && (
              <Button variant="destructive" onClick={() => openDeleteDialog(selectedIds)} disabled={isDeleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={fetchWallpapers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              上传新壁纸
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">出错啦</p>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {wallpapers.map(wp => {
              const isSelected = selectedIds.includes(wp.id)
              return (
                <div 
                  key={wp.id} 
                  className={cn(
                    "relative group aspect-[9/16] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer",
                    isSelected && "ring-2 ring-blue-500 ring-inset"
                  )}
                  onClick={() => handleSelectionChange(wp.id)}
                >
                  <Image
                    src={wp.thumbnail_url || wp.image_url || '/placeholder.svg'}
                    alt={wp.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                  />
                  <div 
                     className={cn(
                       "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent",
                       isSelected && "bg-blue-500/20"
                     )}
                  />
                  {/* 复选框 */}
                  <div className="absolute top-2 left-2 z-10">
                     <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectionChange(wp.id)}
                        className="bg-white/80 data-[state=checked]:bg-blue-600 border-white/80"
                     />
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="w-8 h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog([wp.id]);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-3 w-full">
                     <p className="text-white font-bold text-sm truncate drop-shadow-lg">{wp.title}</p>
                     <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${wp.is_active ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {wp.is_active ? '已激活' : '未激活'}
                     </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && wallpapers.length === 0 && !error && (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">数据库中暂无壁纸</h3>
              <p className="text-gray-500 mt-2">点击右上角"上传新壁纸"按钮，开始添加内容吧！</p>
           </div>
        )}
      </div>
      
      {/* 上传对话框 */}
      <WallpaperUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除操作</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这 {itemToDelete.length} 个壁纸吗？此操作会从数据库和云存储中永久删除文件，无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 