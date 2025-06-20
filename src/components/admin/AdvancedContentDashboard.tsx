'use client'

import { useState, useEffect } from 'react'
import { AdvancedContentControl } from './AdvancedContentControl'

// 📊 数据接口定义
interface NewsArticleData {
  id: string
  title: string
  source: string
  imageUrl: string
  originalUrl: string
  tags: string[]
  viewCount: number
  likeCount: number
  shareCount: number
  publishedAt: string
  createdAt: string
  hotScore: number
  status: 'approved' | 'pending' | 'rejected'
}

interface DataSourceConfig {
  id: string
  name: string
  type: string
  url: string
  isActive: boolean
  crawlInterval: number
  lastCrawled: string
  successRate: number
  totalArticles: number
  status: 'running' | 'idle' | 'error'
  config: any
}

interface CrawlerStats {
  timeStats: { time?: string; date?: string; week?: string; month?: string; count: number }[]
  sourceStats: { name: string; count: number; percentage: number }[]
  keyMetrics: {
    totalArticles: number
    todayArticles: number
    avgHotScore: number
  }
}

// 🎛️ 高级内容管理仪表板
export function AdvancedContentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'sources' | 'crawler'>('overview')
  const [articles, setArticles] = useState<NewsArticleData[]>([])
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([])
  const [stats, setStats] = useState<CrawlerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  
  // 📊 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSources, setSelectedSources] = useState<string[]>([])

  // 🔄 加载数据
  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats()
    } else if (activeTab === 'articles') {
      loadArticles()
    } else if (activeTab === 'sources') {
      loadDataSources()
    }
  }, [activeTab, currentPage, selectedTimeRange])

  // 📊 加载统计数据
  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?timeRange=${selectedTimeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setStats({
          timeStats: result.data.timeStats,
          sourceStats: result.data.sourceStats,
          keyMetrics: result.data.keyMetrics
        })
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 📰 加载文章数据
  const loadArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/admin/articles?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setArticles(result.data.articles)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('加载文章数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🔗 加载数据源配置
  const loadDataSources = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/data-sources')
      const result = await response.json()
      
      if (result.success) {
        setDataSources(result.data)
      }
    } catch (error) {
      console.error('加载数据源失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🗑️ 删除文章
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    
    try {
      const response = await fetch(`/api/admin/articles?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      if (result.success) {
        setArticles(prev => prev.filter(article => article.id !== id))
        alert('文章删除成功')
      } else {
        alert('删除失败: ' + result.error)
      }
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败')
    }
  }

  // ✏️ 更新文章状态
  const handleUpdateArticleStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      
      const result = await response.json()
      if (result.success) {
        setArticles(prev => prev.map(article => 
          article.id === id ? { ...article, status: status as any } : article
        ))
        alert('状态更新成功')
      } else {
        alert('更新失败: ' + result.error)
      }
    } catch (error) {
      console.error('更新文章状态失败:', error)
      alert('更新失败')
    }
  }

  // 🔄 切换数据源状态
  const toggleDataSource = async (id: string) => {
    const source = dataSources.find(s => s.id === id)
    if (!source) return

    try {
      const response = await fetch('/api/admin/data-sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !source.isActive })
      })
      
      const result = await response.json()
      if (result.success) {
        setDataSources(prev => prev.map(source => 
          source.id === id 
            ? { ...source, isActive: !source.isActive, status: source.isActive ? 'idle' : 'running' }
            : source
        ))
        alert(result.message)
      } else {
        alert('操作失败: ' + result.error)
      }
    } catch (error) {
      console.error('切换数据源状态失败:', error)
      alert('操作失败')
    }
  }

  // 🔄 批量操作数据源
  const handleBatchDataSourceAction = async (action: 'enable' | 'disable' | 'reset') => {
    if (selectedSources.length === 0) {
      alert('请先选择要操作的数据源')
      return
    }

    const actionText = action === 'enable' ? '启用' : action === 'disable' ? '禁用' : '重置'
    if (!confirm(`确定要${actionText}选中的${selectedSources.length}个数据源吗？`)) return

    try {
      const response = await fetch('/api/admin/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sourceIds: selectedSources })
      })
      
      const result = await response.json()
      if (result.success) {
        await loadDataSources() // 重新加载数据
        setSelectedSources([]) // 清空选择
        alert(result.message)
      } else {
        alert('操作失败: ' + result.error)
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      alert('操作失败')
    }
  }

  // 📊 渲染统计图表
  const renderChart = () => {
    if (!stats?.timeStats) return null
    
    const data = stats.timeStats
    const maxCount = Math.max(...data.map(item => item.count))
    
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          {(['hourly', 'daily', 'weekly', 'monthly'] as const).map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'hourly' ? '小时' : range === 'daily' ? '天' : range === 'weekly' ? '周' : '月'}
            </button>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">抓取数量统计</h3>
          <div className="flex items-end space-x-2 h-40">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg w-full transition-all hover:from-blue-600 hover:to-blue-400"
                  style={{ height: `${maxCount > 0 ? (item.count / maxCount) * 120 : 0}px` }}
                  title={`${item.count} 篇`}
                />
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {item.time || item.date || item.week || item.month}
                </div>
                <div className="text-sm font-medium text-gray-800">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 🥧 渲染饼图
  const renderPieChart = () => {
    if (!stats?.sourceStats) return null
    
    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']
    
    return (
      <div className="bg-white p-4 rounded-xl border">
        <h3 className="text-lg font-semibold mb-4">内容来源分布</h3>
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 rounded-full border-8 border-gray-100 relative overflow-hidden">
            {stats.sourceStats.map((source, index) => (
              <div
                key={source.name}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(${colors[index % colors.length]} 0deg ${source.percentage * 3.6}deg, transparent ${source.percentage * 3.6}deg 360deg)`,
                  transform: `rotate(${stats.sourceStats.slice(0, index).reduce((sum, s) => sum + s.percentage, 0) * 3.6}deg)`
                }}
              />
            ))}
          </div>
          <div className="space-y-2">
            {stats.sourceStats.map((source, index) => (
              <div key={source.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{source.name}</span>
                <span className="text-sm font-medium">{source.count}</span>
                <span className="text-xs text-gray-500">({source.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* 🎨 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🚀 高级内容管理仪表板
          </h1>
          <p className="text-gray-600 mt-2">
            多语言社交媒体内容抓取和智能分析系统
          </p>
        </div>

        {/* 📊 标签导航 */}
        <div className="flex space-x-1 bg-white/70 backdrop-blur-xl p-1 rounded-2xl border border-gray-200/50 mb-8">
          {[
            { key: 'overview', label: '📊 总览', icon: '📊' },
            { key: 'articles', label: '📰 文章管理', icon: '📰' },
            { key: 'sources', label: '🔗 数据源', icon: '🔗' },
            { key: 'crawler', label: '🤖 爬虫控制', icon: '🤖' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 📊 总览页面 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl p-6 rounded-2xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">总文章数</p>
                    <p className="text-2xl font-bold text-blue-800">{stats?.keyMetrics?.totalArticles || 0}</p>
                  </div>
                  <div className="text-3xl">📰</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">今日新增 +{stats?.keyMetrics?.todayArticles || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl p-6 rounded-2xl border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">活跃数据源</p>
                    <p className="text-2xl font-bold text-green-800">{dataSources.filter(s => s.isActive).length}</p>
                  </div>
                  <div className="text-3xl">🔗</div>
                </div>
                <p className="text-xs text-green-600 mt-2">运行中 {dataSources.filter(s => s.status === 'running').length}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl p-6 rounded-2xl border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">平均热度</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {stats?.keyMetrics?.avgHotScore || 0}
                    </p>
                  </div>
                  <div className="text-3xl">🔥</div>
                </div>
                <p className="text-xs text-purple-600 mt-2">较昨日 +2.3</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl p-6 rounded-2xl border border-orange-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">成功率</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {dataSources.length > 0 ? (dataSources.reduce((sum, s) => sum + s.successRate, 0) / dataSources.length).toFixed(1) : '0'}%
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
                <p className="text-xs text-orange-600 mt-2">稳定运行</p>
              </div>
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>{renderChart()}</div>
              <div>{renderPieChart()}</div>
            </div>
          </div>
        )}

        {/* 📰 文章管理页面 */}
        {activeTab === 'articles' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">文章管理</h2>
                  <p className="text-gray-600 text-sm mt-1">管理所有抓取的文章内容</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={loadArticles}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    🔄 刷新
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文章</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">来源</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">热度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={article.imageUrl || 'https://picsum.photos/100/80?random=' + article.id}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {article.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{article.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>👁️ {article.viewCount.toLocaleString()}</div>
                          <div>❤️ {article.likeCount.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full"
                              style={{ width: `${Math.min(article.hotScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{article.hotScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={article.status}
                          onChange={(e) => handleUpdateArticleStatus(article.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${
                            article.status === 'approved' ? 'bg-green-100 text-green-800' :
                            article.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="approved">已发布</option>
                          <option value="pending">待审核</option>
                          <option value="rejected">已拒绝</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <a
                            href={article.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            查看
                          </a>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200/50">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-1 text-gray-600">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🔗 数据源管理页面 */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* 批量操作工具栏 */}
            <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedSources.length} 个数据源
                  </span>
                  {selectedSources.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBatchDataSourceAction('enable')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        批量启用
                      </button>
                      <button
                        onClick={() => handleBatchDataSourceAction('disable')}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        批量禁用
                      </button>
                      <button
                        onClick={() => handleBatchDataSourceAction('reset')}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        批量重置
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={loadDataSources}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔄 刷新
                </button>
              </div>
            </div>

            {/* 数据源卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSources([...selectedSources, source.id])
                          } else {
                            setSelectedSources(selectedSources.filter(id => id !== source.id))
                          }
                        }}
                        className="rounded"
                      />
                      <h3 className="text-lg font-semibold text-gray-800">{source.name}</h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      source.status === 'running' ? 'bg-green-500 animate-pulse' :
                      source.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">类型</span>
                      <span className="text-sm font-medium">{source.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">抓取间隔</span>
                      <span className="text-sm font-medium">{source.crawlInterval}分钟</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">成功率</span>
                      <span className="text-sm font-medium text-green-600">{source.successRate}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">总文章数</span>
                      <span className="text-sm font-medium">{source.totalArticles}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">最后抓取</span>
                      <span className="text-sm text-gray-500">
                        {new Date(source.lastCrawled).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-600">启用状态</span>
                      <button
                        onClick={() => toggleDataSource(source.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          source.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            source.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🤖 爬虫控制页面 */}
        {activeTab === 'crawler' && (
          <AdvancedContentControl />
        )}

        {/* 🔄 加载状态 */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-700">加载中...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 