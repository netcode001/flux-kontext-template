import type { Metadata } from "next";
import { LabubuGalleryContent } from "@/components/labubu/LabubuGalleryContent";

export const metadata: Metadata = {
  title: "创意秀场 | Labubu用户原创作品展示",
  description: "展示Labubu收藏爱好者的原创作品，包括AI生成图像、手工制作、摄影作品等精彩内容",
  keywords: ["Labubu", "创意", "秀场", "原创", "作品", "AI生成", "手工", "摄影"],
};

export default function LabubuGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <LabubuGalleryContent />
    </div>
  )
} 