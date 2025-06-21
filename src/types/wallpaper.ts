// 壁纸功能相关类型定义
export interface WallpaperCategory {
  id: string
  name: string
  name_en: string
  description?: string
  cover_image?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WallpaperDimensions {
  width: number
  height: number
}

export interface Wallpaper {
  id: string
  title: string
  title_en?: string
  description?: string
  category_id?: string
  category?: WallpaperCategory
  image_url: string
  thumbnail_url?: string
  original_filename?: string
  file_size?: number
  dimensions?: WallpaperDimensions
  tags: string[]
  is_premium: boolean
  is_featured: boolean
  is_active: boolean
  download_count: number
  view_count: number
  like_count: number
  uploaded_by?: string
  created_at: string
  updated_at: string
  // 用户相关状态
  is_liked?: boolean
  can_download?: boolean
}

export interface WallpaperDownload {
  id: string
  wallpaper_id: string
  user_id?: string
  user_email?: string
  ip_address?: string
  user_agent?: string
  download_at: string
}

export interface WallpaperLike {
  id: string
  wallpaper_id: string
  user_id: string
  user_email?: string
  created_at: string
}

// API请求和响应类型
export interface WallpaperListParams {
  page?: number
  limit?: number
  category_id?: string
  featured?: boolean
  premium?: boolean
  search?: string
  tags?: string[]
  sort?: 'latest' | 'popular' | 'downloads' | 'likes'
}

export interface WallpaperListResponse {
  wallpapers: Wallpaper[]
  categories: WallpaperCategory[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface WallpaperUploadData {
  title: string
  title_en?: string
  description?: string
  category_id?: string
  tags: string[]
  is_premium?: boolean
  is_featured?: boolean
}

export interface WallpaperStats {
  total_wallpapers: number
  total_downloads: number
  total_categories: number
  popular_tags: { tag: string; count: number }[]
  recent_uploads: number
  featured_count: number
}

// 前端组件Props类型
export interface WallpaperCardProps {
  wallpaper: Wallpaper
  onLike?: (wallpaper: Wallpaper) => void
  onDownload?: (wallpaper: Wallpaper) => void
  onView?: (wallpaper: Wallpaper) => void
  showActions?: boolean
  size?: 'small' | 'medium' | 'large'
}

export interface WallpaperGalleryProps {
  wallpapers: Wallpaper[]
  categories: WallpaperCategory[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export interface WallpaperFilterProps {
  categories: WallpaperCategory[]
  selectedCategory?: string
  selectedTags?: string[]
  sortBy?: string
  onCategoryChange: (categoryId: string) => void
  onTagsChange: (tags: string[]) => void
  onSortChange: (sort: string) => void
  onSearch: (query: string) => void
}

// 管理后台相关类型
export interface AdminWallpaperListParams extends WallpaperListParams {
  status?: 'all' | 'active' | 'inactive'
  uploader?: string
}

export interface WallpaperUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  wallpaper?: Wallpaper
}

export interface WallpaperBatchOperation {
  action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature' | 'move_category'
  wallpaper_ids: string[]
  params?: {
    category_id?: string
    [key: string]: any
  }
}

// 错误类型
export interface WallpaperError {
  code: string
  message: string
  details?: any
}

// 安全相关类型
export interface DownloadSecurityCheck {
  allowed: boolean
  reason?: string
  rate_limit?: {
    remaining: number
    reset_at: string
  }
  user_status?: 'anonymous' | 'authenticated' | 'premium'
} 