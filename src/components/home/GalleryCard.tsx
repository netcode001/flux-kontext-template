"use client"

import { ChevronRight, Palette } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function GalleryCard() {
  // 用于存储随机选取的5张图片
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  useEffect(() => {
    // 异步获取Labubu作品数据
    async function fetchGalleryImages() {
      try {
        const res = await fetch('/api/labubu/posts?limit=20')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          // 收集所有作品的首图
          const allImages = data.data
            .map((post: any) => Array.isArray(post.imageUrls) ? post.imageUrls[0] : null)
            .filter((url: string | null) => !!url)
          // 随机打乱并取前5个
          const shuffled = allImages.sort(() => 0.5 - Math.random())
          setGalleryImages(shuffled.slice(0, 5))
        }
      } catch (e) {
        // 错误处理：不显示图片
        setGalleryImages([])
      }
    }
    fetchGalleryImages()
  }, [])

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 group cursor-pointer">
      {/* 右上角查看更多按钮 */}
      <Link href="/labubu-gallery">
        <button
          className="absolute top-4 right-6 z-20 bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold px-5 py-1.5 rounded-full shadow transition-colors duration-200"
          onClick={e => e.stopPropagation()}
        >
          View More
        </button>
      </Link>
      {/* 背景装饰（已移除渐变，保留结构防止后续扩展） */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" /> */}
      {/* 内容区域：flex-col 垂直排列，标题/文案在上，图片在下 */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* 上方：标题和文案 */}
        <div className="flex items-center space-x-4 mb-4">
          {/* 图标 */}
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-3xl group-hover:scale-110 transition-transform duration-300">
            <Palette className="w-8 h-8" />
          </div>
          {/* 文字内容 */}
          <div className="text-pink-700">
            <h3 className="text-xl font-bold mb-1">Creative Gallery</h3>
            <p className="text-pink-500 text-sm">Share your Labubu collection and creative works</p>
          </div>
        </div>
        {/* 下方：图片区域，单独一行，横向排列，每张图片为300x300白色卡片 */}
        {galleryImages.length > 0 && (
          <div className="flex flex-row items-center space-x-6 w-full overflow-x-auto pb-2">
            {/* 遍历展示5张大图，风格与PostCard一致 */}
            {galleryImages.map((url, idx) => (
              <div
                key={idx}
                className="w-[300px] h-[300px] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg flex items-center justify-center flex-shrink-0"
              >
                <Image
                  src={url}
                  alt={`Labubu作品${idx + 1}`}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full rounded-2xl"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 悬停效果（已移除渐变，保留结构防止后续扩展） */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" /> */}
    </div>
  )
} 