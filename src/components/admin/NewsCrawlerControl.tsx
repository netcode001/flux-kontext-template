"use client"

// 📰 新闻爬虫控制面板
// 管理员可以手动触发新闻获取和查看状态

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RefreshCw, Play, CheckCircle, AlertCircle, Clock, Trash2, Plus, Loader2 } from 'lucide-react'

interface CrawlerStatus {
  status: string
  lastRun: string | null
  sources: string[]
  message: string
}

interface CrawlerResult {
  articlesCount: number
  message: string
  timestamp: string
  logs?: string[]
}

// 关键字类型
interface KeywordItem {
  id: string
  keyword: string
  enabled: boolean
}
// 来源类型
interface SourceItem {
  id: string
  name: string
  url: string
  enabled: boolean
}

export function NewsCrawlerControl() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<CrawlerStatus | null>(null)
  const [lastResult, setLastResult] = useState<CrawlerResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 关键字和来源的本地状态
  const [keywords, setKeywords] = useState<KeywordItem[]>([])
  const [sources, setSources] = useState<SourceItem[]>([])
  const [kwLoading, setKwLoading] = useState(false)
  const [srcLoading, setSrcLoading] = useState(false)
  const [kwError, setKwError] = useState<string | null>(null)
  const [srcError, setSrcError] = useState<string | null>(null)

  // 新增关键字输入框状态
  const [newKeyword, setNewKeyword] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [delLoadingId, setDelLoadingId] = useState<string | null>(null)

  // 新增新闻来源输入框状态
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [addSourceLoading, setAddSourceLoading] = useState(false)
  const [addSourceError, setAddSourceError] = useState<string | null>(null)
  const [delSourceLoadingId, setDelSourceLoadingId] = useState<string | null>(null)

  // 新闻列表相关状态
  const [articles, setArticles] = useState<any[]>([])
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState<string | null>(null)
  const [articlePage, setArticlePage] = useState(1)
  const [articleTotalPages, setArticleTotalPages] = useState(1)
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null)

  // 🔍 获取爬虫状态
  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/news-crawler')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error || '获取状态失败')
      }
    } catch (error) {
      setError('网络请求失败')
      console.error('获取爬虫状态失败:', error)
    }
  }

  // 🚀 手动触发新闻获取
  const triggerCrawler = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/news-crawler', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLastResult(data.data)
        // 获取更新后的状态
        await fetchStatus()
      } else {
        setError(data.error || '获取新闻失败')
      }
    } catch (error) {
      setError('网络请求失败')
      console.error('触发爬虫失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 🎨 获取状态图标和颜色
  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    if (error) return <AlertCircle className="w-5 h-5 text-red-500" />
    if (lastResult) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <Clock className="w-5 h-5 text-gray-500" />
  }

  // 拉取关键字数据
  useEffect(() => {
    async function fetchKeywords() {
      setKwLoading(true)
      setKwError(null)
      try {
        const res = await fetch('/api/admin/news-crawler/keywords')
        const data = await res.json()
        if (data.success) setKeywords(data.data)
        else setKwError(data.error || 'Failed to load keywords')
      } catch (e) {
        setKwError('Network error')
      } finally {
        setKwLoading(false)
      }
    }
    fetchKeywords()
  }, [])

  // 拉取新闻来源数据
  useEffect(() => {
    async function fetchSources() {
      setSrcLoading(true)
      setSrcError(null)
      try {
        const res = await fetch('/api/admin/news-crawler/sources')
        const data = await res.json()
        if (data.success) setSources(data.data)
        else setSrcError(data.error || 'Failed to load sources')
      } catch (e) {
        setSrcError('Network error')
      } finally {
        setSrcLoading(false)
      }
    }
    fetchSources()
  }, [])

  // 新增关键字
  async function handleAddKeyword() {
    if (!newKeyword.trim()) {
      setAddError('Keyword cannot be empty')
      return
    }
    setAddLoading(true)
    setAddError(null)
    try {
      const res = await fetch('/api/admin/news-crawler/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setKeywords(prev => [...prev, data.data])
        setNewKeyword('')
      } else {
        setAddError(data.error || 'Add failed')
      }
    } catch (e) {
      setAddError('Network error')
    } finally {
      setAddLoading(false)
    }
  }

  // 删除关键字
  async function handleDeleteKeyword(id: string) {
    setDelLoadingId(id)
    try {
      const res = await fetch('/api/admin/news-crawler/keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setKeywords(prev => prev.filter(k => k.id !== id))
      } else {
        alert(data.error || 'Delete failed')
      }
    } catch (e) {
      alert('Network error')
    } finally {
      setDelLoadingId(null)
    }
  }

  // 新增新闻来源
  async function handleAddSource() {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      setAddSourceError('Name and URL cannot be empty')
      return
    }
    setAddSourceLoading(true)
    setAddSourceError(null)
    try {
      const res = await fetch('/api/admin/news-crawler/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSourceName.trim(), url: newSourceUrl.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setSources(prev => [...prev, data.data])
        setNewSourceName('')
        setNewSourceUrl('')
      } else {
        setAddSourceError(data.error || 'Add failed')
      }
    } catch (e) {
      setAddSourceError('Network error')
    } finally {
      setAddSourceLoading(false)
    }
  }

  // 删除新闻来源
  async function handleDeleteSource(id: string) {
    setDelSourceLoadingId(id)
    try {
      const res = await fetch('/api/admin/news-crawler/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setSources(prev => prev.filter(s => s.id !== id))
      } else {
        alert(data.error || 'Delete failed')
      }
    } catch (e) {
      alert('Network error')
    } finally {
      setDelSourceLoadingId(null)
    }
  }

  // 获取新闻列表
  const fetchArticles = useCallback(async (page = 1) => {
    setArticleLoading(true)
    setArticleError(null)
    try {
      const res = await fetch(`/api/admin/news-crawler/articles?page=${page}&pageSize=10`)
      const data = await res.json()
      if (data.success) {
        setArticles(data.data)
        setArticlePage(data.pagination.page)
        setArticleTotalPages(data.pagination.totalPages)
      } else {
        setArticleError(data.error || '获取新闻失败')
      }
    } catch (e) {
      setArticleError('网络错误')
    } finally {
      setArticleLoading(false)
    }
  }, [])

  // 删除新闻
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('确定要删除这条新闻吗？')) return
    setDeleteArticleId(id)
    try {
      const res = await fetch('/api/admin/news-crawler/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setArticles(prev => prev.filter(a => a.id !== id))
      } else {
        alert(data.error || '删除失败')
      }
    } catch (e) {
      alert('网络错误')
    } finally {
      setDeleteArticleId(null)
    }
  }

  // 页面加载时拉取新闻
  useEffect(() => { fetchArticles(articlePage) }, [fetchArticles, articlePage])

  return (
    <div className="space-y-6">
      
      {/* 📊 控制面板标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📰 新闻爬虫控制台
          </h2>
          <p className="text-gray-600 mt-1">
            管理热点新闻和社交媒体内容获取
          </p>
        </div>
        <Button
          onClick={fetchStatus}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          刷新状态
        </Button>
      </div>

      {/* 🚀 主要控制区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 🎮 操作控制卡片 */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🎮 操作控制
              {getStatusIcon()}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 触发按钮 */}
            <Button
              onClick={triggerCrawler}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  正在获取新闻...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  手动获取新闻
                </>
              )}
            </Button>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">操作失败</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* 成功结果 */}
            {lastResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">获取成功</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  新增 {lastResult.articlesCount} 篇文章
                </p>
                <p className="text-green-500 text-xs mt-1">
                  {lastResult.timestamp && new Date(lastResult.timestamp).toLocaleString()}
                </p>
              </div>
            )}

            {/* 新增：本次操作日志显示区域 */}
            {lastResult?.logs && lastResult.logs.length > 0 && (
              <div className="mt-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Operation Log</label>
                <textarea
                  className="w-full h-40 bg-gray-900 text-green-200 text-xs rounded p-2 font-mono resize-none border border-gray-300 overflow-auto"
                  value={lastResult.logs.join('\n')}
                  readOnly
                  style={{ minHeight: 120, maxHeight: 240 }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 📊 状态信息卡片 */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📊 系统状态
            </h3>
          </CardHeader>
          <CardContent>
            {status ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">服务状态</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {status.status === 'ready' ? '就绪' : status.status}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">数据源</span>
                  <div className="mt-2 space-y-1">
                    {Array.isArray(status.sources) && status.sources.map((source: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{source.name}</span>
                        <span className="ml-1 text-xs text-blue-600 font-mono">({source.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">{status.message}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">点击"刷新状态"获取系统信息</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 新增：关键字与来源管理区域 */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Keyword & Source Management</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 关键字列表 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-2">Search Keywords</h4>
            {/* 新增关键字输入框 */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1 text-sm"
                placeholder="Add new keyword..."
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword() }}
                disabled={addLoading}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm disabled:opacity-50"
                onClick={handleAddKeyword}
                disabled={addLoading}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {addError && <div className="text-red-500 text-xs mb-2">{addError}</div>}
            {kwLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : kwError ? (
              <div className="text-red-500">{kwError}</div>
            ) : (
              <ul className="space-y-1">
                {keywords.length === 0 ? (
                  <li className="text-gray-400 text-sm">No keywords configured.</li>
                ) : (
                  keywords.map((kw) => (
                    <li key={kw.id} className="flex items-center gap-2 text-sm group">
                      <span className={kw.enabled ? 'text-green-600' : 'text-gray-400 line-through'}>
                        #{kw.keyword}
                      </span>
                      {!kw.enabled && <span className="text-xs text-gray-400">(disabled)</span>}
                      <button
                        className="ml-auto text-gray-400 hover:text-red-500 p-1 rounded group-hover:bg-gray-100"
                        title="Delete"
                        onClick={() => handleDeleteKeyword(kw.id)}
                        disabled={delLoadingId === kw.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          {/* 新闻来源列表 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-2">News Sources</h4>
            {/* 新增新闻来源输入框 */}
            <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center">
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1 text-sm"
                placeholder="Source name..."
                value={newSourceName}
                onChange={e => setNewSourceName(e.target.value)}
                disabled={addSourceLoading}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1 text-sm"
                placeholder="Source URL..."
                value={newSourceUrl}
                onChange={e => setNewSourceUrl(e.target.value)}
                disabled={addSourceLoading}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm disabled:opacity-50"
                onClick={handleAddSource}
                disabled={addSourceLoading}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {addSourceError && <div className="text-red-500 text-xs mb-2">{addSourceError}</div>}
            {srcLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : srcError ? (
              <div className="text-red-500">{srcError}</div>
            ) : (
              <ul className="space-y-1">
                {sources.length === 0 ? (
                  <li className="text-gray-400 text-sm">No sources configured.</li>
                ) : (
                  sources.map((src) => (
                    <li key={src.id} className="flex items-center gap-2 text-sm group">
                      <span className={src.enabled ? 'text-blue-700' : 'text-gray-400 line-through'}>
                        {src.name}
                      </span>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline">{src.url}</a>
                      {!src.enabled && <span className="text-xs text-gray-400">(disabled)</span>}
                      <button
                        className="ml-auto text-gray-400 hover:text-red-500 p-1 rounded group-hover:bg-gray-100"
                        title="Delete"
                        onClick={() => handleDeleteSource(src.id)}
                        disabled={delSourceLoadingId === src.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 新增：新闻列表管理区域 */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">新闻内容管理</h3>
        <div className="bg-white rounded-lg shadow p-4">
          {articleLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> 加载新闻中...
            </div>
          ) : articleError ? (
            <div className="text-red-500">{articleError}</div>
          ) : articles.length === 0 ? (
            <div className="text-gray-400 text-sm">暂无新闻数据。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">标题</th>
                    <th className="px-4 py-2 text-left">来源</th>
                    <th className="px-4 py-2 text-left">发布时间</th>
                    <th className="px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(article => (
                    <tr key={article.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 max-w-xs truncate">{article.title}</td>
                      <td className="px-4 py-2">{article.source_id}</td>
                      <td className="px-4 py-2">{article.published_at ? new Date(article.published_at).toLocaleString() : ''}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          onClick={() => handleDeleteArticle(article.id)}
                          disabled={deleteArticleId === article.id}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteArticleId === article.id ? '删除中...' : '删除'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 分页控件 */}
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setArticlePage(p => Math.max(1, p - 1))}
                  disabled={articlePage <= 1 || articleLoading}
                >上一页</button>
                <span>第 {articlePage} / {articleTotalPages} 页</span>
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setArticlePage(p => Math.min(articleTotalPages, p + 1))}
                  disabled={articlePage >= articleTotalPages || articleLoading}
                >下一页</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明区域，已移到页面最底部 */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="note">📝</span> 使用说明
          </h4>
          <div className="mb-2">
            <span className="font-medium text-blue-700">🌐 数据源说明</span>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
              <li>RSS新闻源：BBC、CNN、Reuters等</li>
              <li>娱乐资讯：Entertainment Weekly、Hypebeast</li>
              <li>社交媒体：模拟热门Labubu相关内容</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="lightning">⚡</span> 功能特性
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
            <li>自动内容分类和标签提取</li>
            <li>智能去重和质量筛选</li>
            <li>热度分数计算和排序</li>
            <li>热搜关键词自动更新</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 