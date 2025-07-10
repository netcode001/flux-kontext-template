'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from "@/components/Navigation"
import { WallpaperCard } from './WallpaperCard'
import { WallpaperFilter } from './WallpaperFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Labubu风格组件
import { LabubuCard, LabubuButton, LabubuInput, LabubuBadge, LabubuHeading, LabubuText, LabubuContainer } from '@/components/ui/labubu-ui'
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
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'image' | 'video'>('all')
  
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

  // 🎬 媒体类型处理
  const handleMediaTypeChange = (mediaType: 'all' | 'image' | 'video') => {
    setSelectedMediaType(mediaType)
    // 根据媒体类型构建筛选参数
    const mediaFilters: any = {}
    if (mediaType !== 'all') {
      mediaFilters.media_type = mediaType
    }
    applyFilters(mediaFilters)
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
    // 移除登录验证，允许所有用户下载
    try {
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '下载失败')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = wallpaper.original_filename || `wallpaper-${wallpaper.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      // 更新下载计数
      setWallpapers(prev => prev.map(w => 
        w.id === wallpaper.id 
          ? { ...w, download_count: w.download_count + 1 }
          : w
      ))
    } catch (error) {
      console.error('❌ 下载失败:', error)
      alert(error instanceof Error ? error.message : '下载失败，请重试')
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
    <LabubuContainer className="min-h-screen">
      {/* 导航栏 */}
      <Navigation />

      {/* 页面头部 - 这个div被用户要求删除 */}
      {/* 
      <div className="bg-white/80 backdrop-blur-sm border-b border-labubu-200 pt-16">
      </div>
      */}

      <div className="container mx-auto px-4 py-8 pt-24">

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* 搜索框 */}
          <div className="flex-1 flex gap-2">
            <LabubuInput
              variant="search"
              placeholder="Search wallpaper title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <LabubuButton variant="secondary" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </LabubuButton>
          </div>

          {/* 工具按钮 */}
          <div className="flex gap-2">
            <LabubuButton
              variant={showFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
            >
              <Filter className="w-4 h-4" />
            </LabubuButton>
            
            <div className="flex border border-labubu-200 rounded-2xl overflow-hidden">
              <LabubuButton
                variant={viewMode === 'grid' ? "primary" : "ghost"}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </LabubuButton>
              <LabubuButton
                variant={viewMode === 'list' ? "primary" : "ghost"}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <List className="w-4 h-4" />
              </LabubuButton>
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
              selectedMediaType={selectedMediaType}
              sortBy={filters.sort || 'latest'}
              onCategoryChange={(categoryId: string) => applyFilters({ category_id: categoryId || undefined })}
              onTagsChange={(tags: string[]) => {
                setSelectedTags(tags)
                applyFilters({ tags: tags.length > 0 ? tags : undefined })
              }}
              onMediaTypeChange={handleMediaTypeChange}
              onSortChange={(sort: string) => applyFilters({ sort: sort as any })}
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* 活跃标签显示 */}
        {selectedTags.length > 0 && (
          <LabubuCard variant="interactive" className="mb-6 p-4">
            <div className="flex flex-wrap gap-2 items-center">
              <LabubuText variant="small" className="text-soft-600">Active tags:</LabubuText>
              {selectedTags.map(tag => (
                <LabubuBadge
                  key={tag}
                  variant="warm"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag} ×
                </LabubuBadge>
              ))}
            </div>
          </LabubuCard>
        )}

        {/* 壁纸展示区域 - 应用网格布局 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-labubu-600" />
            <LabubuText className="ml-2 text-soft-600">Loading...</LabubuText>
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <LabubuHeading level={3} className="text-xl font-semibold text-soft-900 mb-2">
              No wallpapers found
            </LabubuHeading>
            <LabubuText className="text-soft-600">
              Try adjusting search or filter options
            </LabubuText>
          </div>
        ) : (
          <>
            {/* 壁纸展示区域 - 应用网格布局 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wallpapers.map((wallpaper) => (
                <div key={wallpaper.id}>
                  <WallpaperCard
                    wallpaper={wallpaper}
                    onLike={handleLike}
                    onDownload={handleDownload}
                    onView={handleView}
                    showActions={true}
                    size={'medium'}
                  />
                </div>
              ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="text-center mt-8">
                <LabubuButton
                  variant="secondary"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </LabubuButton>
              </div>
            )}
          </>
        )}
      </div>
    </LabubuContainer>
  )
} 