import type { Metadata } from 'next'
import { AdvancedContentDashboard } from '@/components/admin/AdvancedContentDashboard'

export const metadata: Metadata = {
  title: '高级内容引擎 - Labubu社区管理',
  description: '多语言社交媒体内容抓取和管理系统',
}

export default function AdvancedContentPage() {
  return <AdvancedContentDashboard />
} 