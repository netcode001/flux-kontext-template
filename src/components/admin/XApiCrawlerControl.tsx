'use client'

// 🐦 X API内容爬虫控制面板
// 管理员用于控制X平台数据抓取的界面

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface XApiStatus {
  api_configured: boolean
  api_usage: {
    remaining: number
    reset: number
    limit: number
    status: 'healthy' | 'limited' | 'error'
    resetTime?: string
  }
  database_stats: {
    total_tweets: number
    today_tweets: number
  }
}

interface CrawlerConfig {
  crawler_name: string
  is_enabled: boolean
  config: Record<string, any>
}

interface CrawlStats {
  tweets_found: number
  tweets_saved: number
  tweets_errors: number
  users_found: number
  media_found: number
}

export function XApiCrawlerControl() {
  const [status, setStatus] = useState<XApiStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlStats, setCrawlStats] = useState<CrawlStats | null>(null)
  const [message, setMessage] = useState('')
  
  // 爬虫配置状态 (临时使用localStorage)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  
  // 爬取参数
  const [maxResults, setMaxResults] = useState(100)
  const [sinceHours, setSinceHours] = useState(24)
  const [lang, setLang] = useState('en')

  // 获取爬虫配置 (从localStorage)
  const fetchCrawlerConfig = () => {
    try {
      const savedStates = localStorage.getItem('crawler_states')
      if (savedStates) {
        const states = JSON.parse(savedStates)
        setIsEnabled(states['x_api_crawler'] || false)
      }
    } catch (error) {
      console.error('获取爬虫配置失败:', error)
    }
  }

  // 获取API状态
  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/x-api-crawler')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.status)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ 获取状态失败: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 切换爬虫开关 (使用localStorage)
  const toggleCrawler = () => {
    setIsToggling(true)
    try {
      const newStatus = !isEnabled
      setIsEnabled(newStatus)
      
      // 保存到localStorage
      const savedStates = localStorage.getItem('crawler_states')
      const states = savedStates ? JSON.parse(savedStates) : {}
      states['x_api_crawler'] = newStatus
      localStorage.setItem('crawler_states', JSON.stringify(states))
      
      setMessage(`✅ X API爬虫 ${newStatus ? '已启用' : '已关闭'}`)
      
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ 切换开关失败: ${error}`)
    } finally {
      setIsToggling(false)
    }
  }

  // 执行爬取
  const startCrawl = async () => {
    setIsCrawling(true)
    setMessage('🐦 正在获取X平台数据...')
    setCrawlStats(null)
    
    try {
      const response = await fetch('/api/admin/x-api-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxResults,
          sinceHours,
          lang
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCrawlStats(data.stats)
        setMessage(`✅ ${data.message}`)
        // 更新状态
        await fetchStatus()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ 爬取失败: ${error}`)
    } finally {
      setIsCrawling(false)
    }
  }

  // 格式化时间戳
  const formatResetTime = (timestamp: number) => {
    if (!timestamp) return '未知'
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  // 获取API状态颜色
  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'limited': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // 获取API状态文本
  const getApiStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '✅ 正常'
      case 'limited': return '⚠️ 限制中'
      case 'error': return '❌ 错误'
      default: return '❓ 未知'
    }
  }

  // 计算使用率
  const getUsagePercentage = () => {
    if (!status?.api_usage?.limit || !status?.api_usage?.remaining) return 0
    return ((status.api_usage.limit - status.api_usage.remaining) / status.api_usage.limit) * 100
  }

  useEffect(() => {
    fetchStatus()
    fetchCrawlerConfig()
  }, [])

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🐦 X API内容爬虫</h2>
          <p className="text-gray-600">管理X平台Labubu相关内容抓取</p>
        </div>
        <div className="flex gap-2">
          {/* 爬虫总开关 */}
                      <Button
              onClick={toggleCrawler}
              disabled={isToggling}
              variant={isEnabled ? "destructive" : "default"}
              className="min-w-24"
            >
              {isToggling ? '🔄' : isEnabled ? '🔴 关闭' : '🟢 启用'}
            </Button>
          
          <Button
            onClick={() => {
              fetchStatus()
              fetchCrawlerConfig()
            }}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? '🔄 刷新中...' : '🔄 刷新状态'}
          </Button>
        </div>
      </div>

      {/* API状态卡片 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 API状态</h3>
        
        {status ? (
          <div className="space-y-4">
            {/* 爬虫开关状态 */}
            <div className="flex items-center justify-between">
              <span>爬虫开关状态:</span>
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? '🟢 已启用' : '🔴 已关闭'}
              </Badge>
            </div>

            {/* 配置状态 */}
            <div className="flex items-center justify-between">
              <span>API配置状态:</span>
              <Badge variant={status.api_configured ? "default" : "destructive"}>
                {status.api_configured ? '✅ 已配置' : '❌ 未配置'}
              </Badge>
            </div>

            {/* API使用情况 */}
            {status.api_configured && (
              <>
                <div className="flex items-center justify-between">
                  <span>API运行状态:</span>
                  <Badge 
                    variant={status.api_usage.status === 'healthy' ? 'default' : 
                            status.api_usage.status === 'limited' ? 'secondary' : 'destructive'}
                    className={getApiStatusColor(status.api_usage.status)}
                  >
                    {getApiStatusText(status.api_usage.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>请求配额:</span>
                    <span>
                      {status.api_usage.remaining}/{status.api_usage.limit} 次剩余
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage()} 
                    className={`h-2 ${status.api_usage.status === 'limited' ? 'bg-yellow-100' : ''}`}
                  />
                </div>
                
                <div className="text-sm text-gray-600">
                  重置时间: {status.api_usage.resetTime || formatResetTime(status.api_usage.reset)}
                </div>

                {status.api_usage.status === 'limited' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600">⚠️</span>
                      <span className="text-sm text-yellow-700">
                        API配额不足，建议等待重置后再进行大量抓取
                      </span>
                    </div>
                  </div>
                )}

                {status.api_usage.status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">❌</span>
                      <span className="text-sm text-red-700">
                        API访问异常，请检查配置或稍后重试
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 数据库统计 */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {status.database_stats.total_tweets}
                </div>
                <div className="text-sm text-gray-600">总推文数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {status.database_stats.today_tweets}
                </div>
                <div className="text-sm text-gray-600">今日新增</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">正在获取状态...</p>
          </div>
        )}
      </Card>

      {/* 爬取参数设置 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">⚙️ 爬取参数</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="maxResults">最大结果数</Label>
            <Input
              id="maxResults"
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              min="10"
              max="100"
              disabled={isCrawling}
            />
            <p className="text-xs text-gray-500 mt-1">
              每次最多获取的推文数量 (10-100)
            </p>
          </div>
          
          <div>
            <Label htmlFor="sinceHours">时间范围 (小时)</Label>
            <Input
              id="sinceHours"
              type="number"
              value={sinceHours}
              onChange={(e) => setSinceHours(parseInt(e.target.value))}
              min="1"
              max="168"
              disabled={isCrawling}
            />
            <p className="text-xs text-gray-500 mt-1">
              获取多少小时内的推文 (1-168)
            </p>
          </div>
          
          <div>
            <Label htmlFor="lang">语言</Label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={isCrawling}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="en">英文</option>
              <option value="zh">中文</option>
              <option value="ja">日文</option>
              <option value="ko">韩文</option>
              <option value="all">全部语言</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 爬取控制 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🚀 执行爬取</h3>
        
        <div className="space-y-4">
          <Button
            onClick={startCrawl}
            disabled={isCrawling || !status?.api_configured || !isEnabled}
            className="w-full"
            size="lg"
          >
            {isCrawling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                正在获取数据...
              </>
            ) : !isEnabled ? (
              '🔴 爬虫已关闭'
            ) : (
              '🐦 开始获取X平台数据'
            )}
          </Button>
          
          {!isEnabled && (
            <p className="text-sm text-red-600">
              🔴 请先启用爬虫开关才能执行数据抓取
            </p>
          )}
          
          {!status?.api_configured && isEnabled && (
            <p className="text-sm text-amber-600">
              ⚠️ 请先配置X API凭据才能开始爬取
            </p>
          )}
        </div>
      </Card>

      {/* 爬取统计 */}
      {crawlStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📈 爬取统计</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {crawlStats.tweets_found}
              </div>
              <div className="text-sm text-gray-600">发现推文</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {crawlStats.tweets_saved}
              </div>
              <div className="text-sm text-gray-600">保存成功</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {crawlStats.tweets_errors}
              </div>
              <div className="text-sm text-gray-600">保存失败</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {crawlStats.users_found}
              </div>
              <div className="text-sm text-gray-600">用户数据</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {crawlStats.media_found}
              </div>
              <div className="text-sm text-gray-600">媒体文件</div>
            </div>
          </div>
        </Card>
      )}

      {/* 消息显示 */}
      {message && (
        <Card className="p-4">
          <p className="text-sm font-mono whitespace-pre-wrap">
            {message}
          </p>
        </Card>
      )}
      
      {/* 使用说明 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📖 使用说明</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>API配置:</strong> 需要在环境变量中配置 TWITTER_BEARER_TOKEN</p>
          <p>• <strong>搜索范围:</strong> 自动搜索Labubu相关关键词的推文</p>
          <p>• <strong>内容过滤:</strong> 自动过滤低质量和垃圾内容</p>
          <p>• <strong>速率限制:</strong> 遵守X API的速率限制，避免被封</p>
          <p>• <strong>数据去重:</strong> 自动避免重复保存相同的推文</p>
          <p>• <strong>多语言支持:</strong> 支持英文、中文、日文、韩文内容</p>
        </div>
      </Card>
    </div>
  )
} 