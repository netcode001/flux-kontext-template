import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "Labubu快报 | 最新资讯和活动信息",
  description: "获取最新的Labubu资讯、活动信息和社区动态，第一时间了解Labubu世界的精彩内容",
  keywords: ["Labubu", "快报", "资讯", "活动", "新闻", "潮玩"],
};

export default function LabubuNewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              📰 Labubu快报
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              第一时间获取Labubu世界的最新资讯、活动信息和社区动态
            </p>
          </div>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="max-w-2xl mx-auto">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        }>
          <SearchBar 
            placeholder="搜索Labubu资讯..." 
            className="mb-8"
          />
        </Suspense>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          
          {/* 开发中状态 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-12 text-center">
            <div className="space-y-6">
              {/* 可爱的Labubu表情 */}
              <div className="text-8xl animate-bounce">
                🎀
              </div>
              
              <h2 className="text-3xl font-bold text-pink-600">
                功能开发中...
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                我们正在为您精心打造Labubu快报功能！<br/>
                很快您就可以在这里看到：
              </p>

              {/* 功能预告 */}
              <div className="grid md:grid-cols-2 gap-4 mt-8 text-left">
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h3 className="font-semibold text-pink-700">全网热搜</h3>
                      <p className="text-sm text-gray-600">实时Labubu相关热门话题</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h3 className="font-semibold text-purple-700">社交聚合</h3>
                      <p className="text-sm text-gray-600">微博、小红书等社交媒体内容</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold text-blue-700">精准推荐</h3>
                      <p className="text-sm text-gray-600">AI智能推荐相关内容</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-semibold text-green-700">实时更新</h3>
                      <p className="text-sm text-gray-600">24小时不间断内容更新</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 进度指示 */}
              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-2">开发进度</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full w-[15%] transition-all duration-300"></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">15% 完成 - 预计v2.0版本上线</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 