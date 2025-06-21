// 🐦 X API内容爬虫管理页面
// 管理员专用 - 控制X平台数据抓取

import type { Metadata } from 'next'
import { XApiCrawlerControl } from '@/components/admin/XApiCrawlerControl'

export const metadata: Metadata = {
  title: 'X API 内容爬虫 - 管理后台',
  description: '管理X平台Labubu相关内容抓取，监控API使用情况',
  robots: 'noindex, nofollow'
}

export default function XApiCrawlerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <XApiCrawlerControl />
    </div>
  )
} 