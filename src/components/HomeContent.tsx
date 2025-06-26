"use client"

import { DynamicNavigation } from "@/components/DynamicNavigation"
import { Footer } from "@/components/Footer"
import { HeroCarousel } from "./home/HeroCarousel"
import { NewsSection } from "./home/NewsSection"
import { FeatureCards } from "./home/FeatureCards"

export function HomeContent() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <DynamicNavigation />

      {/* 主要内容区域 */}
      <main className="pt-16">
        {/* 轮播图区域 */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HeroCarousel />
          </div>
        </section>

        {/* 新闻区域 */}
        <NewsSection />

        {/* 功能卡片区域 */}
        <FeatureCards />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
} 