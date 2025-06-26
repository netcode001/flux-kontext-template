"use client"

import { DynamicNavigation } from "@/components/DynamicNavigation"
import { Footer } from "@/components/Footer"

export function HomeContent() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <DynamicNavigation />

      {/* Footer */}
      <Footer />
    </div>
  )
} 