"use client"

import Link from "next/link"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { DynamicNavigation } from "@/components/DynamicNavigation"
import { TwitterShowcase } from "@/components/TwitterShowcase"
import { KeyFeatures } from "@/components/KeyFeatures"
import { HowToSteps } from "@/components/HowToSteps"
import { FAQ } from "@/components/FAQ"
import { Footer } from "@/components/Footer"
import { OrganizationSchema, WebSiteSchema, SoftwareApplicationSchema } from "@/components/StructuredData"
import { home, common, seo } from "@/lib/content"

export function HomeContent() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <DynamicNavigation />

      {/* 结构化数据 - Structured Data */}
      <OrganizationSchema />
      <WebSiteSchema />
      <SoftwareApplicationSchema />

      {/* JSON-LD 应用程序数据 */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Flux Kontext AI",
            "description": seo.meta.description,
            "url": "https://fluxkontext.space",
            "applicationCategory": "ImageEditingApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Professional AI image generation and editing"
            },
            "creator": {
              "@type": "Organization",
              "name": "Flux Kontext AI"
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="relative z-10">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-labubu-100 to-warm-100 border border-labubu-300/30 rounded-full text-labubu-600 text-sm font-medium mb-6 transition-all duration-300 hover:scale-105">
              {home.hero.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-labubu-600 via-labubu-500 to-warm-500 bg-clip-text text-transparent">
              {home.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-soft-600 mb-8 max-w-3xl mx-auto px-4 md:px-0 leading-relaxed">
              {home.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/generate">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-labubu-500 to-labubu-600 text-white hover:from-labubu-600 hover:to-labubu-700 hover:scale-105 active:scale-95 transition-all duration-300 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg  hover: rounded-2xl"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="currentColor"/>
                  </svg>
                  {common.buttons.startCreating}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-labubu-300 text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 hover:scale-105 active:scale-95 transition-all duration-300 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-2xl hover:border-labubu-400 hover:"
                >
                  {common.buttons.viewPricing}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Twitter展示区域 */}
      <TwitterShowcase />

      {/* Key Features Section */}
      <KeyFeatures />

      {/* How-to Steps Section */}
      <HowToSteps />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <Footer />

      {/* 推特脚本 - 确保推特内容正常加载 */}
      <Script 
        src="https://platform.twitter.com/widgets.js" 
        strategy="lazyOnload"
      />
    </div>
  )
} 