// 🕷️ 爬虫配置管理服务
// 统一管理各种爬虫的开关状态和配置参数

import { createAdminClient } from '@/lib/supabase/server'

export interface CrawlerConfig {
  id: number
  crawler_name: string
  is_enabled: boolean
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CrawlerConfigUpdate {
  is_enabled?: boolean
  config?: Record<string, any>
}

export class CrawlerConfigService {
  private _supabase: any = null

  // 🔧 懒加载Supabase客户端，避免构建时错误
  private get supabase() {
    if (!this._supabase) {
      // 在构建时跳过Supabase客户端创建
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log('⚠️ 构建时跳过Supabase客户端创建')
        return null
      }
      this._supabase = createAdminClient()
    }
    return this._supabase
  }

  // 🔍 获取所有爬虫配置
  async getAllConfigs(): Promise<CrawlerConfig[]> {
    try {
      // 🔧 检查Supabase客户端是否可用
      if (!this.supabase) {
        console.log('⚠️ Supabase客户端不可用，返回空配置')
        return []
      }

      const { data, error } = await this.supabase
        .from('crawler_config')
        .select('*')
        .order('crawler_name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ 获取爬虫配置失败:', error)
      return []
    }
  }

  // 🔍 获取单个爬虫配置
  async getConfig(crawlerName: string): Promise<CrawlerConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawler_config')
        .select('*')
        .eq('crawler_name', crawlerName)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`❌ 获取爬虫配置失败 [${crawlerName}]:`, error)
      return null
    }
  }

  // 🔧 更新爬虫配置
  async updateConfig(crawlerName: string, updates: CrawlerConfigUpdate): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('crawler_config')
        .update(updates)
        .eq('crawler_name', crawlerName)

      if (error) throw error
      
      console.log(`✅ 爬虫配置更新成功 [${crawlerName}]:`, updates)
      return true
    } catch (error) {
      console.error(`❌ 更新爬虫配置失败 [${crawlerName}]:`, error)
      return false
    }
  }

  // 🎛️ 切换爬虫开关
  async toggleCrawler(crawlerName: string): Promise<boolean> {
    try {
      const config = await this.getConfig(crawlerName)
      if (!config) {
        console.error(`❌ 爬虫配置不存在: ${crawlerName}`)
        return false
      }

      const newStatus = !config.is_enabled
      const success = await this.updateConfig(crawlerName, { is_enabled: newStatus })
      
      if (success) {
        console.log(`🎛️ 爬虫开关切换 [${crawlerName}]: ${config.is_enabled} → ${newStatus}`)
      }
      
      return success
    } catch (error) {
      console.error(`❌ 切换爬虫开关失败 [${crawlerName}]:`, error)
      return false
    }
  }

  // ✅ 检查爬虫是否启用
  async isCrawlerEnabled(crawlerName: string): Promise<boolean> {
    const config = await this.getConfig(crawlerName)
    return config?.is_enabled || false
  }

  // 📊 获取启用的爬虫统计
  async getEnabledCrawlersCount(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('crawler_config')
        .select('*', { count: 'exact', head: true })
        .eq('is_enabled', true)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('❌ 获取启用爬虫数量失败:', error)
      return 0
    }
  }

  // 🔄 批量更新爬虫状态
  async batchUpdateStatus(updates: Array<{ crawler_name: string; is_enabled: boolean }>): Promise<boolean> {
    try {
      const promises = updates.map(({ crawler_name, is_enabled }) =>
        this.updateConfig(crawler_name, { is_enabled })
      )

      const results = await Promise.all(promises)
      const success = results.every(result => result)
      
      if (success) {
        console.log('✅ 批量更新爬虫状态成功:', updates)
      }
      
      return success
    } catch (error) {
      console.error('❌ 批量更新爬虫状态失败:', error)
      return false
    }
  }
}

// 🎯 便捷导出函数
export async function getCrawlerConfig(crawlerName: string) {
  const service = new CrawlerConfigService()
  return await service.getConfig(crawlerName)
}

export async function isCrawlerEnabled(crawlerName: string) {
  const service = new CrawlerConfigService()
  return await service.isCrawlerEnabled(crawlerName)
}

export async function toggleCrawler(crawlerName: string) {
  const service = new CrawlerConfigService()
  return await service.toggleCrawler(crawlerName)
}

export async function updateCrawlerConfig(crawlerName: string, updates: CrawlerConfigUpdate) {
  const service = new CrawlerConfigService()
  return await service.updateConfig(crawlerName, updates)
}

// 🕷️ 爬虫名称常量
export const CRAWLER_NAMES = {
  X_API: 'x_api_crawler',
  NEWS: 'news_crawler', 
  ADVANCED_CONTENT: 'advanced_content_crawler',
  YOUTUBE: 'youtube_crawler'
} as const 