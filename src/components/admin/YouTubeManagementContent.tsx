'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Plus, Trash2, Play, Download, Eye, EyeOff, Settings, RefreshCw } from 'lucide-react'

interface YouTubeKeyword {
  id: string
  keyword: string
  category_name: string
  max_results: number
  last_search_at?: string
  video_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  channelId: string
  publishedAt: string
  durationIso: string
  durationSeconds: number
  viewCount: number
  likeCount: number
  commentCount: number
  iframeEmbedCode: string
}

interface SearchResult {
  keyword: YouTubeKeyword
  searchResults: YouTubeVideo[]
  message: string
}

export default function YouTubeManagementContent() {
  const { data: session } = useSession()
  
  // 状态管理
  const [keywords, setKeywords] = useState<YouTubeKeyword[]>([])
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([])
  const [currentKeyword, setCurrentKeyword] = useState<YouTubeKeyword | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 表单状态
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [maxResults, setMaxResults] = useState(10)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  
  // 对话框状态
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, keyword: YouTubeKeyword | null }>({ open: false, keyword: null })
  const [importDialog, setImportDialog] = useState({ open: false, count: 0 })

  // 检查管理员权限
  const isAdmin = session?.user?.email === 'lylh0319@gmail.com' || session?.user?.email === 'test@example.com'

  // 获取关键词列表
  const fetchKeywords = async () => {
    try {
      const response = await fetch('/api/admin/youtube/keywords')
      const data = await response.json()
      
      if (data.success) {
        setKeywords(data.keywords)
      } else {
        setError(data.error || '获取关键词失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    }
  }

  // 添加新关键词并搜索
  const addKeywordAndSearch = async () => {
    if (!newKeyword.trim() || !newCategoryName.trim()) {
      setError('关键词和分类名称不能为空')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/youtube/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          categoryName: newCategoryName.trim(),
          maxResults
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setSearchResults(data.searchResults || [])
        setCurrentKeyword(data.keyword)
        setNewKeyword('')
        setNewCategoryName('')
        setMaxResults(10)
        await fetchKeywords()
      } else {
        setError(data.error || '添加关键词失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 删除关键词
  const deleteKeyword = async (keyword: YouTubeKeyword) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/youtube/keywords?id=${keyword.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('关键词删除成功')
        await fetchKeywords()
      } else {
        setError(data.error || '删除关键词失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
      setDeleteDialog({ open: false, keyword: null })
    }
  }

  // 批量导入视频
  const importSelectedVideos = async () => {
    if (selectedVideos.size === 0) {
      setError('请选择要导入的视频')
      return
    }

    if (!currentKeyword) {
      setError('没有选择的关键词')
      return
    }

    setLoading(true)
    setError('')

    try {
      const videosToImport = searchResults.filter(video => selectedVideos.has(video.videoId))
        .map(video => ({
          video_id: video.videoId,
          title: video.title,
          description: video.description,
          thumbnail_url: video.thumbnailUrl,
          channel_title: video.channelTitle,
          channel_id: video.channelId,
          published_at: video.publishedAt,
          duration_iso: video.durationIso,
          duration_seconds: video.durationSeconds,
          view_count: video.viewCount,
          like_count: video.likeCount,
          comment_count: video.commentCount,
          iframe_embed_code: video.iframeEmbedCode,
          search_keyword: currentKeyword.keyword,
          category_name: currentKeyword.category_name
        }))

      const response = await fetch('/api/admin/youtube/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos: videosToImport,
          categoryName: currentKeyword.category_name,
          searchKeyword: currentKeyword.keyword,
          setFeatured: false
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`成功导入 ${data.count ?? 0} 个视频，跳过 ${data.skipped ?? 0} 个重复视频`)
        setSelectedVideos(new Set())
        setImportDialog({ open: false, count: 0 })
        await fetchKeywords()
      } else {
        setError(data.error || '导入视频失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // 初始化
  useEffect(() => {
    if (isAdmin) {
      fetchKeywords()
    }
  }, [isAdmin])

  // 权限检查
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">请先登录</h2>
            <p className="text-gray-600">您需要登录才能访问YouTube管理功能</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">权限不足</h2>
            <p className="text-gray-600">您没有权限访问YouTube管理功能</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎥 YouTube视频管理</h1>
        <Button 
          onClick={fetchKeywords} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 错误和成功提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* 添加关键词表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加搜索关键词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">搜索关键词</label>
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="如：Labubu 明星 Lisa"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">分类名称</label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="如：明星联名"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">获取数量</label>
              <Input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 10)}
                min="1"
                max="50"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addKeywordAndSearch}
                disabled={loading || !newKeyword.trim() || !newCategoryName.trim()}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? '搜索中...' : '搜索并添加'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关键词列表 */}
      <Card>
        <CardHeader>
          <CardTitle>已配置的关键词 ({keywords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无关键词，请添加第一个关键词</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keywords.map((keyword) => (
                <div key={keyword.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{keyword.keyword}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {keyword.category_name}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, keyword })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>视频数量: {keyword.video_count}</p>
                    <p>获取上限: {keyword.max_results}</p>
                    {keyword.last_search_at && (
                      <p>最后搜索: {new Date(keyword.last_search_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>搜索结果 ({searchResults.length} 个视频)</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedVideos.size === searchResults.length) {
                      setSelectedVideos(new Set())
                    } else {
                      setSelectedVideos(new Set(searchResults.map(v => v.videoId)))
                    }
                  }}
                >
                  {selectedVideos.size === searchResults.length ? '取消全选' : '全选'}
                </Button>
                <Button
                  onClick={() => setImportDialog({ open: true, count: selectedVideos.size })}
                  disabled={selectedVideos.size === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  导入选中 ({selectedVideos.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((video) => (
                <div 
                  key={video.videoId} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedVideos.has(video.videoId) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    const newSelected = new Set(selectedVideos)
                    if (newSelected.has(video.videoId)) {
                      newSelected.delete(video.videoId)
                    } else {
                      newSelected.add(video.videoId)
                    }
                    setSelectedVideos(newSelected)
                  }}
                >
                  <div className="aspect-video mb-3 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>频道: {video.channelTitle}</p>
                    <p>时长: {formatDuration(video.durationSeconds)}</p>
                    <div className="flex items-center justify-between">
                      <span>观看: {formatNumber(video.viewCount)}</span>
                      <span>点赞: {formatNumber(video.likeCount)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    {selectedVideos.has(video.videoId) ? (
                      <Badge variant="default">已选择</Badge>
                    ) : (
                      <Badge variant="outline">点击选择</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, keyword: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除关键词 "{deleteDialog.keyword?.keyword}" 吗？这个操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.keyword && deleteKeyword(deleteDialog.keyword)}
              className="bg-red-500 hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 导入确认对话框 */}
      <AlertDialog open={importDialog.open} onOpenChange={(open) => setImportDialog({ ...importDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入</AlertDialogTitle>
            <AlertDialogDescription>
              确定要导入选中的 {importDialog.count} 个视频吗？这些视频将被保存到数据库中。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={importSelectedVideos}>
              确认导入
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 