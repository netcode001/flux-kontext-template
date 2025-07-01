"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Newspaper, 
  Bug, 
  Menu, 
  Image, 
  Settings, 
  Database, 
  BarChart3, 
  Users,
  Shield,
  Zap,
  Globe,
  FileText,
  Video,
  TrendingUp,
  Palette,
  Bot
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// 管理模块配置
const adminModules = [
  {
    id: 'news-crawler',
    title: '新闻爬虫管理',
    description: '管理新闻内容抓取和发布',
    icon: Newspaper,
    path: '/admin/news-crawler',
    status: 'active',
    features: ['RSS源管理', '内容审核', '自动发布', '关键词过滤']
  },
  {
    id: 'crawler-control',
    title: '爬虫控制中心',
    description: '统一管理所有数据爬虫',
    icon: Bug,
    path: '/admin/crawler-control',
    status: 'active',
    features: ['总开关控制', 'X API爬虫', '状态监控', '配额管理']
  },
  {
    id: 'menu-management',
    title: '菜单管理系统',
    description: '管理网站导航菜单结构',
    icon: Menu,
    path: '/admin/menu-management',
    status: 'active',
    features: ['菜单编辑', '多语言支持', '权限控制', '实时预览']
  },
  {
    id: 'wallpapers',
    title: '壁纸内容管理',
    description: '上传和管理壁纸资源',
    icon: Image,
    path: '/admin/wallpapers',
    status: 'active',
    features: ['批量上传', '分类管理', '质量审核', '下载统计']
  },
  {
    id: 'advanced-content',
    title: '高级内容引擎',
    description: '多语言社交媒体内容管理',
    icon: Bot,
    path: '/admin/advanced-content',
    status: 'active',
    features: ['多平台抓取', 'AI内容生成', '语言检测', '趋势分析']
  },
  {
    id: 'x-api-crawler',
    title: 'X API爬虫',
    description: '专门管理X平台数据抓取',
    icon: TrendingUp,
    path: '/admin/x-api-crawler',
    status: 'active',
    features: ['API监控', '速率限制', '内容过滤', '实时同步']
  },
  {
    id: 'youtube-management',
    title: 'YouTube视频管理',
    description: 'YouTube视频搜索、导入和管理',
    icon: Video,
    path: '/admin/youtube-management',
    status: 'active',
    features: ['关键词搜索', '视频导入', '分类管理', '首页展示']
  }
]

// 系统状态模块
const systemModules = [
  {
    id: 'database',
    title: '数据库管理',
    description: '数据库连接和状态监控',
    icon: Database,
    path: '/api/debug/database-status',
    status: 'monitoring',
    features: ['连接状态', '性能监控', '备份管理', '数据清理']
  },
  {
    id: 'analytics',
    title: '数据分析',
    description: '用户行为和内容分析',
    icon: BarChart3,
    path: '/admin/analytics',
    status: 'development',
    features: ['用户统计', '内容分析', '趋势报告', '转化追踪']
  },
  {
    id: 'users',
    title: '用户管理',
    description: '用户账户和权限管理',
    icon: Users,
    path: '/admin/users',
    status: 'development',
    features: ['用户列表', '权限分配', '账户状态', '行为日志']
  },
  {
    id: 'security',
    title: '安全中心',
    description: '系统安全和访问控制',
    icon: Shield,
    path: '/admin/security',
    status: 'development',
    features: ['访问日志', '异常检测', '权限审计', '安全配置']
  }
]

// 快速操作模块
const quickActions = [
  {
    id: 'content-sync',
    title: '内容同步',
    description: '立即同步所有内容源',
    icon: Zap,
    action: () => console.log('内容同步')
  },
  {
    id: 'cache-clear',
    title: '缓存清理',
    description: '清理系统缓存',
    icon: Palette,
    action: () => console.log('缓存清理')
  },
  {
    id: 'backup',
    title: '数据备份',
    description: '创建系统备份',
    icon: FileText,
    action: () => console.log('数据备份')
  },
  {
    id: 'health-check',
    title: '健康检查',
    description: '系统状态检查',
    icon: Globe,
    action: () => console.log('健康检查')
  }
]

export function AdminDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<'content' | 'system' | 'quick'>('content')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'monitoring': return 'bg-blue-100 text-blue-800'
      case 'development': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '运行中'
      case 'monitoring': return '监控中'
      case 'development': return '开发中'
      case 'maintenance': return '维护中'
      default: return '未知'
    }
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎛️ 管理控制台
        </h1>
        <p className="text-gray-600 text-lg">
          统一管理所有系统功能和内容
        </p>
      </div>

      {/* 分类导航 */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={selectedCategory === 'content' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('content')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          内容管理
        </Button>
        <Button
          variant={selectedCategory === 'system' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('system')}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          系统管理
        </Button>
        <Button
          variant={selectedCategory === 'quick' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('quick')}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          快速操作
        </Button>
      </div>

      {/* 内容管理模块 */}
      {selectedCategory === 'content' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <module.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <Badge className={getStatusColor(module.status)}>
                        {getStatusText(module.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link href={module.path}>
                    <Button className="w-full" size="sm">
                      进入管理
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 系统管理模块 */}
      {selectedCategory === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemModules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <module.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <Badge className={getStatusColor(module.status)}>
                        {getStatusText(module.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  {module.path.startsWith('/api/') ? (
                    <Button 
                      className="w-full" 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(module.path, '_blank')}
                    >
                      查看状态
                    </Button>
                  ) : (
                    <Link href={module.path}>
                      <Button className="w-full" size="sm">
                        进入管理
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 快速操作模块 */}
      {selectedCategory === 'quick' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                  <action.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 系统状态概览 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            系统状态概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-600">活跃模块</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">监控模块</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-600">开发模块</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-sm text-gray-600">快速操作</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 