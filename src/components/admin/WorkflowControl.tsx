'use client'

// 🌊 工作流控制面板 - n8n/Coze集成管理
// 管理多种工作流平台的内容收集和解析

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  FileSpreadsheet,
  BookOpen,
  Grid3x3,
  Webhook,
  Eye,
  BarChart3
} from 'lucide-react'

// 🔧 工作流配置接口
interface WorkflowConfig {
  id: string
  name: string
  platform: 'n8n' | 'coze' | 'zapier' | 'make'
  type: 'google_sheets' | 'notion' | 'airtable' | 'webhook'
  status: 'running' | 'paused' | 'error' | 'idle'
  lastRun: string | null
  nextRun: string | null
  interval: number // 分钟
  totalCollected: number
  successRate: number
  config: {
    endpoint?: string
    apiKey?: string
    source: string
    filters: string[]
  }
}

// 📊 解析统计接口
interface ParseStats {
  total_articles: number
  source_breakdown: Record<string, { count: number; latest: string }>
  last_updated: string
  supported_sources: string[]
}

export function WorkflowControl() {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([])
  const [parseStats, setParseStats] = useState<ParseStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  // 🔄 初始化工作流配置
  useEffect(() => {
    initializeWorkflows()
    fetchParseStats()
  }, [])

  // 🚀 初始设置工作流
  const initializeWorkflows = () => {
    const defaultWorkflows: WorkflowConfig[] = [
      {
        id: 'n8n-sheets-labubu',
        name: 'n8n → Google Sheets',
        platform: 'n8n',
        type: 'google_sheets',
        status: 'running',
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        interval: 120, // 2小时
        totalCollected: 234,
        successRate: 94.2,
        config: {
          endpoint: 'https://n8n.yourhost.com/webhook/labubu-collector',
          source: 'RSS + 社交媒体',
          filters: ['labubu', '拉布布', 'lisa', 'popmart']
        }
      },
      {
        id: 'coze-notion-social',
        name: 'Coze → Notion数据库',
        platform: 'coze',
        type: 'notion',
        status: 'running',
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        interval: 180, // 3小时
        totalCollected: 156,
        successRate: 89.7,
        config: {
          endpoint: 'https://www.coze.com/api/workflow/trigger',
          apiKey: 'coze_***',
          source: '微博 + 小红书',
          filters: ['#labubu#', '#拉布布#', 'Lisa同款']
        }
      },
      {
        id: 'zapier-airtable-global',
        name: 'Zapier → Airtable',
        platform: 'zapier',
        type: 'airtable',
        status: 'paused',
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        nextRun: null,
        interval: 240, // 4小时
        totalCollected: 89,
        successRate: 76.3,
        config: {
          endpoint: 'https://hooks.zapier.com/hooks/catch/xxx',
          source: 'Instagram + TikTok',
          filters: ['#labubu', '#popmart', '#blindbox']
        }
      },
      {
        id: 'make-webhook-direct',
        name: 'Make → 直接Webhook',
        platform: 'make',
        type: 'webhook',
        status: 'idle',
        lastRun: null,
        nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        interval: 60, // 1小时
        totalCollected: 0,
        successRate: 0,
        config: {
          endpoint: `${window.location.origin}/api/parse-content`,
          source: 'YouTube + Twitter',
          filters: ['labubu', 'popmart', 'collectible']
        }
      }
    ]
    setWorkflows(defaultWorkflows)
  }

  // 📊 获取解析统计
  const fetchParseStats = async () => {
    try {
      const response = await fetch('/api/parse-content')
      const data = await response.json()
      
      if (data.success) {
        setParseStats(data.data)
      }
    } catch (error) {
      console.error('获取统计失败:', error)
    }
  }

  // 🎮 手动触发工作流测试
  const triggerWorkflowTest = async (workflowId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // 模拟工作流数据发送到解析API
      const testData = {
        source: {
          type: workflows.find(w => w.id === workflowId)?.type || 'webhook',
          data: generateTestData(workflowId),
          metadata: {
            workflow_id: workflowId,
            source_platform: 'test',
            collected_at: new Date().toISOString()
          }
        }
      }

      const response = await fetch('/api/parse-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()

      if (result.success) {
        // 更新工作流状态
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId 
            ? { ...w, lastRun: new Date().toISOString(), status: 'running' as const }
            : w
        ))
        
        // 刷新统计
        await fetchParseStats()
        
        alert(`✅ 工作流测试成功！\n解析: ${result.data.total_parsed} 条\n保存: ${result.data.successfully_saved} 条`)
      } else {
        setError(result.error || '测试失败')
      }

    } catch (error) {
      setError('网络请求失败')
      console.error('工作流测试失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔧 生成测试数据
  const generateTestData = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    const platform = workflow?.platform || 'unknown'

    if (workflow?.type === 'google_sheets') {
      return [
        {
          title: '测试：Lisa新款Labubu开箱分享',
          content: '今天收到了Lisa同款的限量版Labubu，开箱过程太治愈了！这款的细节处理特别用心...',
          author: '测试用户',
          url: 'https://example.com/test-1',
          published_at: new Date().toISOString(),
          platform: platform,
          tags: 'labubu,lisa,开箱,限量版',
          category: '明星动态',
          likes: '1250',
          shares: '340',
          comments: '89'
        }
      ]
    } else if (workflow?.type === 'notion') {
      return [
        {
          properties: {
            Title: { title: [{ plain_text: '测试：Labubu收纳整理小技巧' }] },
            Content: { rich_text: [{ plain_text: '分享几个Labubu收纳的实用技巧，让你的收藏井井有条...' }] },
            Author: { rich_text: [{ plain_text: '收纳达人' }] },
            URL: { url: 'https://example.com/test-2' },
            Published: { date: { start: new Date().toISOString() } },
            Platform: { select: { name: platform } },
            Category: { select: { name: '收藏攻略' } },
            Tags: { multi_select: [{ name: 'labubu' }, { name: '收纳' }, { name: '整理' }] },
            Likes: { number: 890 },
            Comments: { number: 45 }
          }
        }
      ]
    } else {
      // webhook直接格式
      return [
        {
          title: '测试：Labubu价格走势分析',
          content: '最近Labubu在二手市场的价格出现了有趣的变化，让我们来分析一下...',
          summary: 'Labubu二手市场价格分析报告',
          author: '市场分析师',
          originalUrl: 'https://example.com/test-3',
          publishedAt: new Date(),
          imageUrls: ['https://picsum.photos/600/400?random=test'],
          tags: ['labubu', '价格', '市场分析'],
          category: '市场动态',
          platform: platform,
          engagement: {
            likes: 567,
            shares: 123,
            comments: 78,
            views: 2340
          }
        }
      ]
    }
  }

  // 🎨 获取平台图标和颜色
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'n8n': return <Settings className="w-5 h-5 text-blue-600" />
      case 'coze': return <RefreshCw className="w-5 h-5 text-purple-600" />
      case 'zapier': return <Play className="w-5 h-5 text-orange-600" />
      case 'make': return <Grid3x3 className="w-5 h-5 text-green-600" />
      default: return <Webhook className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'google_sheets': return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case 'notion': return <BookOpen className="w-4 h-4 text-gray-800" />
      case 'airtable': return <Database className="w-4 h-4 text-yellow-600" />
      case 'webhook': return <Webhook className="w-4 h-4 text-blue-600" />
      default: return <Grid3x3 className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      case 'idle': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 🎨 标题区域 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          🌊 工作流控制中心
        </h2>
        <p className="text-gray-600 mt-2">
          管理 n8n、Coze、Zapier 等工作流平台的内容收集和解析
        </p>
      </div>

      {/* 📊 统计面板 */}
      {parseStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">总文章数</p>
                  <p className="text-2xl font-bold text-blue-800">{parseStats.total_articles}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">活跃工作流</p>
                  <p className="text-2xl font-bold text-green-800">
                    {workflows.filter(w => w.status === 'running').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">数据源</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {Object.keys(parseStats.source_breakdown).length}
                  </p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">最后更新</p>
                  <p className="text-sm font-medium text-orange-800">
                    {new Date(parseStats.last_updated).toLocaleString()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🔧 工作流列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="bg-white/70 backdrop-blur-xl border border-gray-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(workflow.platform)}
                  <div>
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeIcon(workflow.type)}
                      <span className="text-sm text-gray-600">{workflow.config.source}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                  <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 📊 统计信息 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">收集总数:</span>
                  <span className="font-medium ml-2">{workflow.totalCollected}</span>
                </div>
                <div>
                  <span className="text-gray-600">成功率:</span>
                  <span className="font-medium ml-2">{workflow.successRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600">间隔:</span>
                  <span className="font-medium ml-2">{workflow.interval}分钟</span>
                </div>
                <div>
                  <span className="text-gray-600">过滤器:</span>
                  <span className="font-medium ml-2">{workflow.config.filters.length}个</span>
                </div>
              </div>

              {/* ⏰ 时间信息 */}
              <div className="space-y-2 text-sm">
                {workflow.lastRun && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">最后运行:</span>
                    <span>{new Date(workflow.lastRun).toLocaleString()}</span>
                  </div>
                )}
                {workflow.nextRun && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">下次运行:</span>
                    <span>{new Date(workflow.nextRun).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* 🏷️ 过滤标签 */}
              <div>
                <span className="text-sm text-gray-600 mb-2 block">关键词过滤:</span>
                <div className="flex flex-wrap gap-1">
                  {workflow.config.filters.map((filter, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 🎮 操作按钮 */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => triggerWorkflowTest(workflow.id)}
                  disabled={isLoading}
                  size="sm"
                  className="flex-1"
                >
                  {isLoading && selectedWorkflow === workflow.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  测试工作流
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWorkflow(
                    selectedWorkflow === workflow.id ? null : workflow.id
                  )}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* 🔍 详细配置 */}
              {selectedWorkflow === workflow.id && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">工作流配置</h4>
                  <div className="space-y-1">
                    <div><strong>端点:</strong> {workflow.config.endpoint}</div>
                    {workflow.config.apiKey && (
                      <div><strong>API密钥:</strong> {workflow.config.apiKey}</div>
                    )}
                    <div><strong>数据源:</strong> {workflow.config.source}</div>
                    <div><strong>过滤器:</strong> {workflow.config.filters.join(', ')}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ❌ 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">操作失败</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  )
} 