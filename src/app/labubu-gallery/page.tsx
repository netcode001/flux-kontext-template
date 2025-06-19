import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "创意秀场 | Labubu用户原创作品展示",
  description: "展示Labubu收藏爱好者的原创作品，包括AI生成图像、手工制作、摄影作品等精彩内容",
  keywords: ["Labubu", "创意", "秀场", "原创", "作品", "AI生成", "手工", "摄影"],
};

export default function LabubuGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* 页面头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              🎨 创意秀场
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              展示Labubu收藏爱好者的原创作品，发现无限创意可能
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
            placeholder="搜索创意作品..." 
            className="mb-8"
          />
        </Suspense>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* 开发中状态 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-12 text-center">
            <div className="space-y-6">
              {/* 创意图标 */}
              <div className="text-8xl animate-pulse">
                🎭
              </div>
              
              <h2 className="text-3xl font-bold text-purple-600">
                创意秀场即将开放...
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                我们正在打造一个专属的Labubu创意展示平台！<br/>
                这里将成为展示您才华的绝佳舞台：
              </p>

              {/* 功能预告网格 */}
              <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
                <div className="bg-pink-50 rounded-xl p-6 border border-pink-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">🖼️</div>
                    <h3 className="font-bold text-pink-700">AI生成作品</h3>
                    <p className="text-sm text-gray-600">
                      使用我们的AI工具生成的<br/>
                      Labubu主题图像作品
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">🎨</div>
                    <h3 className="font-bold text-purple-700">手工创作</h3>
                    <p className="text-sm text-gray-600">
                      原创手工制作、<br/>
                      DIY改造等实体作品
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">📸</div>
                    <h3 className="font-bold text-blue-700">摄影作品</h3>
                    <p className="text-sm text-gray-600">
                      Labubu收藏品摄影、<br/>
                      生活场景等精美照片
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">💫</div>
                    <h3 className="font-bold text-green-700">互动功能</h3>
                    <p className="text-sm text-gray-600">
                      点赞、评论、分享<br/>
                      与其他用户交流互动
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">🏆</div>
                    <h3 className="font-bold text-yellow-700">作品竞赛</h3>
                    <p className="text-sm text-gray-600">
                      定期举办创意比赛<br/>
                      赢取丰厚奖品
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 transform hover:scale-105 transition-transform">
                  <div className="space-y-3">
                    <div className="text-3xl">🎯</div>
                    <h3 className="font-bold text-indigo-700">智能推荐</h3>
                    <p className="text-sm text-gray-600">
                      AI推荐相似作品<br/>
                      发现更多灵感
                    </p>
                  </div>
                </div>
              </div>

              {/* 特色功能说明 */}
              <div className="mt-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🌟 特色功能预告</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">✨</span>
                    <span className="text-sm text-gray-700">无限上传空间</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎨</span>
                    <span className="text-sm text-gray-700">在线编辑工具</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm text-gray-700">智能标签系统</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📱</span>
                    <span className="text-sm text-gray-700">移动端优化</span>
                  </div>
                </div>
              </div>

              {/* 进度指示 */}
              <div className="mt-8">
                <p className="text-sm text-gray-500 mb-2">开发进度</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full w-[10%] transition-all duration-300"></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">10% 完成 - 预计v2.1版本上线</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 