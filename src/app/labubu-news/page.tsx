import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { LabubuNewsContent } from "@/components/labubu/LabubuNewsContent";

export const metadata: Metadata = {
  title: "Labubu快报 | 最新资讯和活动信息",
  description: "获取最新的Labubu资讯、活动信息和社区动态，第一时间了解Labubu世界的精彩内容",
  keywords: ["Labubu", "快报", "资讯", "活动", "新闻", "潮玩"],
};

export default function LabubuNewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 统一的导航栏 */}
      <Navigation />
      
      {/* 📰 Labubu资讯内容 */}
      <div className="pt-16">
        <Suspense fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">加载Labubu快报中...</p>
            </div>
          </div>
        }>
          <LabubuNewsContent />
        </Suspense>
      </div>
    </div>
  );
} 