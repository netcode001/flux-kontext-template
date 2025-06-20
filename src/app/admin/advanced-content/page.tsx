import type { Metadata } from 'next'
import { AdvancedContentControl } from '@/components/admin/AdvancedContentControl'

export const metadata: Metadata = {
  title: '高级内容引擎 - Labubu社区管理',
  description: '多语言社交媒体内容抓取和管理系统',
}

export default function AdvancedContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <AdvancedContentControl />
      </div>
    </div>
  )
} 