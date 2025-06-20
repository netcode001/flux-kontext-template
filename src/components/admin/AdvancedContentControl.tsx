'use client'

import { useState } from 'react'

// 🎛️ 高级内容管理控制组件
export function AdvancedContentControl() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  // 🚀 触发高级内容获取
  const handleAdvancedCrawl = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/advanced-content-crawler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || '获取失败')
      }

    } catch (err) {
      setError('网络请求失败')
      console.error('高级内容获取失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 🎨 标题区域 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          🚀 高级内容引擎
        </h2>
        <p className="text-gray-600 mt-2">
          多语言社交媒体内容抓取 (微博、小红书、Instagram等)
        </p>
      </div>

      {/* 📊 功能介绍卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl p-4 rounded-2xl border border-blue-200/50">
          <div className="text-2xl mb-2">🇨🇳</div>
          <h3 className="font-semibold text-blue-800">中文社交媒体</h3>
          <p className="text-sm text-blue-600">微博、小红书热门内容</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl p-4 rounded-2xl border border-purple-200/50">
          <div className="text-2xl mb-2">🌍</div>
          <h3 className="font-semibold text-purple-800">多语言支持</h3>
          <p className="text-sm text-purple-600">中英日韩泰多语言内容</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl p-4 rounded-2xl border border-green-200/50">
          <div className="text-2xl mb-2">🤖</div>
          <h3 className="font-semibold text-green-800">智能分析</h3>
          <p className="text-sm text-green-600">热度计算、情感分析</p>
        </div>
      </div>

      {/* 🎛️ 控制按钮 */}
      <div className="flex justify-center">
        <button
          onClick={handleAdvancedCrawl}
          disabled={isLoading}
          className={`
            px-8 py-4 rounded-2xl font-semibold text-white shadow-xl
            transition-all duration-300 transform hover:scale-105
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:shadow-2xl'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>正在获取内容...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🚀</span>
              <span>启动高级内容引擎</span>
            </div>
          )}
        </button>
      </div>

      {/* 📊 结果显示 */}
      {result && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl p-6 rounded-2xl border border-green-200/50">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <span className="mr-2">✅</span>
            获取成功
          </h3>
          <div className="space-y-2 text-green-700">
            <p><strong>新增文章：</strong>{result.articlesCount} 篇</p>
            <p><strong>获取时间：</strong>{new Date(result.timestamp).toLocaleString()}</p>
            <p><strong>详细信息：</strong>{result.message}</p>
          </div>
        </div>
      )}

      {/* ❌ 错误显示 */}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-xl p-6 rounded-2xl border border-red-200/50">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <span className="mr-2">❌</span>
            获取失败
          </h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 📋 数据源说明 */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 支持的数据源</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">🇨🇳 中文平台</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 微博Labubu话题 - 价格动态、黄牛分析</li>
              <li>• 小红书内容 - 穿搭、收纳、鉴别指南</li>
              <li>• 知乎讨论 - 深度分析、投资建议</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">🌍 国际平台</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Instagram - 明星同款、博主开箱</li>
              <li>• TikTok - 创意改造、病毒传播</li>
              <li>• YouTube - 深度评测、收藏指南</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🎯 内容特色 */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-xl p-6 rounded-2xl border border-yellow-200/50">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">🎯 内容特色</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium text-yellow-700">价格分析</div>
          </div>
          <div>
            <div className="text-2xl mb-2">👗</div>
            <div className="text-sm font-medium text-yellow-700">穿搭指南</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm font-medium text-yellow-700">真假鉴别</div>
          </div>
          <div>
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-sm font-medium text-yellow-700">明星同款</div>
          </div>
        </div>
      </div>
    </div>
  )
} 