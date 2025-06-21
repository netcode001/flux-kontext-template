'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import { WallpaperCard } from './WallpaperCard'
import { WallpaperFilter } from './WallpaperFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Filter, Grid, List } from 'lucide-react'
import type { 
  Wallpaper, 
  WallpaperCategory, 
  WallpaperListResponse,
  WallpaperListParams 
} from '@/types/wallpaper'

export function WallpaperGalleryContent() {
  // 🔐 用户状态
  const { data: session, status } = useSession()
  
  // 📊 数据状态
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [categories, setCategories] = useState<WallpaperCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // 🔍 筛选状态
  const [filters, setFilters] = useState<WallpaperListParams>({
    page: 1,
    limit: 20,
    sort: 'latest'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // 🎨 UI状态
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // 📱 响应式网格列数
  const getGridCols = () => {
    if (viewMode === 'list') return 'grid-cols-1'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }

  // 🔍 获取壁纸数据
  const fetchWallpapers = async (params: WallpaperListParams, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','))
          } else {
            searchParams.set(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/wallpapers?${searchParams}`)
      const result = await response.json()

      if (result.success) {
        const data: WallpaperListResponse = result.data
        
        if (append) {
          setWallpapers(prev => [...prev, ...data.wallpapers])
        } else {
          setWallpapers(data.wallpapers)
          setCategories(data.categories)
        }
        
        setHasMore(data.pagination.has_next)
      } else {
        console.error('获取壁纸失败:', result.error)
      }
    } catch (error) {
      console.error('获取壁纸错误:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 🔄 初始加载
  useEffect(() => {
    fetchWallpapers(filters)
  }, [])

  // 🔍 应用筛选
  const applyFilters = (newFilters: Partial<WallpaperListParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)
    fetchWallpapers(updatedFilters)
  }

  // 📄 加载更多
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = (filters.page || 1) + 1
      const updatedFilters = { ...filters, page: nextPage }
      setFilters(updatedFilters)
      fetchWallpapers(updatedFilters, true)
    }
  }

  // 🔍 搜索处理
  const handleSearch = () => {
    applyFilters({ search: searchQuery || undefined })
  }

  // 🏷️ 标签处理
  const handleTagClick = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    applyFilters({ tags: newTags.length > 0 ? newTags : undefined })
  }

  // 💝 点赞处理
  const handleLike = async (wallpaper: Wallpaper) => {
    if (!session) {
      alert('请先登录才能点赞')
      return
    }

    try {
      const method = wallpaper.is_liked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/like`, {
        method
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 更新本地状态
        setWallpapers(prev => prev.map(w => 
          w.id === wallpaper.id 
            ? { 
                ...w, 
                is_liked: result.data.is_liked,
                like_count: result.data.like_count 
              }
            : w
        ))
      } else {
        console.error('点赞失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('点赞错误:', error)
      alert('点赞失败，请重试')
    }
  }

  // 📥 下载处理
  const handleDownload = async (wallpaper: Wallpaper) => {
    if (!session) {
      alert('请先登录才能下载壁纸')
      return
    }

    try {
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 直接下载图片
        const link = document.createElement('a')
        link.href = result.data.download_url
        link.download = result.data.wallpaper.original_filename || `wallpaper-${wallpaper.id}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 更新下载计数
        setWallpapers(prev => prev.map(w => 
          w.id === wallpaper.id 
            ? { ...w, download_count: w.download_count + 1 }
            : w
        ))
      } else {
        console.error('下载失败:', result.error)
        alert(result.error)
      }
    } catch (error) {
      console.error('下载错误:', error)
      alert('下载失败，请重试')
    }
  }

  // 👁️ 查看处理
  const handleView = (wallpaper: Wallpaper) => {
    // 更新浏览计数
    setWallpapers(prev => prev.map(w => 
      w.id === wallpaper.id 
        ? { ...w, view_count: w.view_count + 1 }
        : w
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      {/* 导航栏 */}
      <DynamicNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🖼️ 壁纸画廊
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            精美的AI生成壁纸集合，支持多种分类和高清下载
            {!session && (
              <span className="block mt-2 text-sm text-orange-600 dark:text-orange-400">
                💡 登录后可以下载高清壁纸和点赞收藏
              </span>
            )}
          </p>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* 搜索框 */}
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="搜索壁纸标题或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* 工具按钮 */}
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                onClick={() => setViewMode('grid')}
                size="sm"
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                onClick={() => setViewMode('list')}
                size="sm"
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 筛选组件 */}
        {showFilters && (
          <div className="mb-6">
                         <WallpaperFilter
               categories={categories}
               selectedCategory={filters.category_id}
               selectedTags={selectedTags}
               sortBy={filters.sort || 'latest'}
               onCategoryChange={(categoryId: string) => applyFilters({ category_id: categoryId || undefined })}
               onTagsChange={(tags: string[]) => {
                 setSelectedTags(tags)
                 applyFilters({ tags: tags.length > 0 ? tags : undefined })
               }}
               onSortChange={(sort: string) => applyFilters({ sort: sort as any })}
               onSearch={handleSearch}
             />
          </div>
        )}

        {/* 活跃标签显示 */}
        {selectedTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">活跃标签:</span>
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 壁纸网格 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              没有找到壁纸
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              尝试调整搜索条件或筛选选项
            </p>
          </div>
        ) : (
          <>
            {/* 壁纸展示区域 */}
            <div className={`grid ${getGridCols()} gap-6`}>
              {wallpapers.map((wallpaper) => (
                <WallpaperCard
                  key={wallpaper.id}
                  wallpaper={wallpaper}
                  onLike={handleLike}
                  onDownload={handleDownload}
                  onView={handleView}
                  showActions={true}
                  size={viewMode === 'list' ? 'large' : 'medium'}
                />
              ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 