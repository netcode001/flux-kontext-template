// 🕷️ 爬虫控制管理页面
// 统一管理所有爬虫的开关和状态

import { CrawlerMasterControl } from '@/components/admin/CrawlerMasterControl'
import { XApiCrawlerControl } from '@/components/admin/XApiCrawlerControl'

export default function CrawlerControlPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🕷️ 爬虫控制中心</h1>
          <p className="text-gray-600">
            统一管理所有数据爬虫的开关状态和运行情况
          </p>
        </div>

        {/* 爬虫总控制面板 */}
        <CrawlerMasterControl />

        {/* X API爬虫详细控制 */}
        <XApiCrawlerControl />
      </div>
    </div>
  )
} 