import type { Metadata } from "next";
import { Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { LabubuNewsContent } from "@/components/labubu/LabubuNewsContent";

export const metadata: Metadata = {
  title: "LabubuHub - News | Latest News, Events and Community Updates",
  description: "Get the latest Labubu news, event information, and community updates. Stay tuned for exciting content from the world of Labubu.",
  keywords: ["Labubu", "news", "events", "community", "updates", "toys"],
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