"use client"

import { ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function AIGenerationCard() {
  return (
    <Link href="/generate" className="block">
      <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 内容 */}
        <div className="relative z-10 flex items-center justify-between h-full">
          {/* 左侧内容 */}
          <div className="flex items-center space-x-4">
            {/* 图标 */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8" />
            </div>
            
            {/* 文字内容 */}
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">AI图像生成</h3>
              <p className="text-white/90 text-sm">创造独特的Labubu风格图像</p>
            </div>
          </div>
          
          {/* 右侧箭头 */}
          <div className="text-white group-hover:translate-x-2 transition-transform duration-300">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
        
        {/* 悬停效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>
    </Link>
  )
} 