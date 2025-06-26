"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// 轮播图数据类型
interface CarouselItem {
  id: string
  image: string
  title: string
  description: string
  link?: string
}

// 轮播图数据
const carouselData: CarouselItem[] = [
  {
    id: '1',
    image: '/images/carousel/labubu-hero-1.jpg',
    title: 'Labubu 梦幻世界',
    description: '探索可爱的Labubu收藏品世界',
    link: '/labubu-gallery'
  },
  {
    id: '2', 
    image: '/images/carousel/labubu-hero-2.jpg',
    title: 'AI 创意生成',
    description: '使用AI创造独特的Labubu风格图像',
    link: '/generate'
  },
  {
    id: '3',
    image: '/images/carousel/labubu-hero-3.jpg', 
    title: '精美壁纸下载',
    description: '获取高质量Labubu主题壁纸',
    link: '/wallpapers'
  },
  {
    id: '4',
    image: '/images/carousel/labubu-hero-4.jpg',
    title: '精彩视频内容',
    description: '观看Labubu相关视频和开箱评测',
    link: '/videos'
  }
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // 自动播放逻辑
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselData.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // 手动控制
  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? carouselData.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselData.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // 鼠标悬停暂停
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-3xl mx-auto max-w-7xl">
      {/* 轮播图容器 */}
      <div 
        className="relative w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 轮播图片 */}
        {carouselData.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 背景图片 */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
              
              {/* 内容区域 */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-6">
                      {item.description}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105"
                      >
                        了解更多
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 左右箭头控制 */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
          aria-label="上一张"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
          aria-label="下一张"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 底部圆点指示器 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`跳转到第${index + 1}张图片`}
            />
          ))}
        </div>

        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / carouselData.length) * 100}%`
            }}
          />
        </div>
      </div>
    </section>
  )
} 