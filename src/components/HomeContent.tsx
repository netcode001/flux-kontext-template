"use client"

import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { HeroCarousel } from "./home/HeroCarousel"
import { NewsSection } from "./home/NewsSection"
import { FeatureCards } from "./home/FeatureCards"
import { VideoCard } from "./home/VideoCard"

export function HomeContent() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <Navigation />

      {/* 主要内容区域 */}
      <main className="pt-16">
        {/* 轮播图区域已删除，原为 HeroCarousel 主页 banner */}
        {/* <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HeroCarousel />
          </div>
        </section> */}

        {/* 视频区 */}
        <VideoCard />

        {/* 功能卡片区域 */}
        <FeatureCards />

        {/* 新闻区域 */}
        <NewsSection />
      </main>
    </div>
  )
} 