// 🕐 内容调度系统
// 自动化内容获取和管理任务

import { runNewsCrawlerTask } from './news-crawler'
import { runAdvancedContentCrawler } from './advanced-content-engine'
import { createAdminClient } from '@/lib/supabase/server'

// 📊 任务统计接口
interface TaskStats {
  taskName: string
  lastRun: Date
  nextRun: Date
  successCount: number
  failureCount: number
  lastResult?: any
}

// ⏰ 内容调度器类
export class ContentScheduler {
  private _supabase: any = null
  private isRunning = false
  private intervals: NodeJS.Timeout[] = []

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

  // 🚀 启动调度器
  public start() {
    if (this.isRunning) {
      console.log('⚠️ 调度器已在运行中')
      return
    }

    console.log('🚀 启动内容调度器...')
    this.isRunning = true

    // 🕐 设置定时任务
    this.scheduleBasicCrawler()
    this.scheduleAdvancedCrawler()
    this.scheduleCleanupTasks()
    
    console.log('✅ 内容调度器启动成功')
  }

  // 🛑 停止调度器
  public stop() {
    console.log('🛑 停止内容调度器...')
    
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    this.isRunning = false
    
    console.log('✅ 内容调度器已停止')
  }

  // 📰 基础新闻爬虫调度 (每30分钟)
  private scheduleBasicCrawler() {
    const interval = setInterval(async () => {
      try {
        console.log('⏰ 执行定时基础新闻爬虫任务...')
        const result = await runNewsCrawlerTask()
        
        await this.logTaskExecution('basic_crawler', result.success, result)
        
        if (result.success) {
          console.log(`✅ 基础爬虫完成: ${result.message}`)
        } else {
          console.error(`❌ 基础爬虫失败: ${result.message}`)
        }
      } catch (error) {
        console.error('🚨 基础爬虫调度异常:', error)
        await this.logTaskExecution('basic_crawler', false, { error: error instanceof Error ? error.message : String(error) })
      }
    }, 30 * 60 * 1000) // 30分钟

    this.intervals.push(interval)
    console.log('📰 基础新闻爬虫调度已设置 (每30分钟)')
  }

  // 🚀 高级内容爬虫调度 (每2小时)
  private scheduleAdvancedCrawler() {
    const interval = setInterval(async () => {
      try {
        console.log('⏰ 执行定时高级内容爬虫任务...')
        const result = await runAdvancedContentCrawler()
        
        await this.logTaskExecution('advanced_crawler', result.success, result)
        
        if (result.success) {
          console.log(`✅ 高级爬虫完成: ${result.message}`)
        } else {
          console.error(`❌ 高级爬虫失败: ${result.message}`)
        }
      } catch (error) {
        console.error('🚨 高级爬虫调度异常:', error)
        await this.logTaskExecution('advanced_crawler', false, { error: error instanceof Error ? error.message : String(error) })
      }
    }, 2 * 60 * 60 * 1000) // 2小时

    this.intervals.push(interval)
    console.log('🚀 高级内容爬虫调度已设置 (每2小时)')
  }

  // 🧹 清理任务调度 (每天凌晨2点)
  private scheduleCleanupTasks() {
    const scheduleNextCleanup = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(2, 0, 0, 0) // 凌晨2点

      const timeUntilCleanup = tomorrow.getTime() - now.getTime()

      const timeout = setTimeout(async () => {
        try {
          console.log('⏰ 执行每日清理任务...')
          await this.performCleanupTasks()
          
          // 安排下一次清理
          scheduleNextCleanup()
        } catch (error) {
          console.error('🚨 清理任务异常:', error)
          await this.logTaskExecution('cleanup_tasks', false, { error: error instanceof Error ? error.message : String(error) })
        }
      }, timeUntilCleanup)

      console.log(`🧹 下次清理任务安排在: ${tomorrow.toLocaleString()}`)
    }

    scheduleNextCleanup()
  }

  // 🧹 执行清理任务
  private async performCleanupTasks() {
    try {
      // 🔧 检查Supabase客户端是否可用
      if (!this.supabase) {
        console.log('⚠️ Supabase客户端不可用，跳过清理任务')
        return
      }

      // 清理30天前的旧文章
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error: deleteError } = await this.supabase
        .from('news_articles')
        .delete()
        .lt('published_at', thirtyDaysAgo.toISOString())
        .eq('status', 'rejected')

      if (deleteError) {
        console.error('❌ 清理旧文章失败:', deleteError)
      } else {
        console.log('✅ 清理旧文章完成')
      }

      // 更新热搜关键词排名
      await this.updateTrendingRankings()

      await this.logTaskExecution('cleanup_tasks', true, { 
        message: '每日清理任务完成',
        cleanupDate: thirtyDaysAgo.toISOString()
      })

    } catch (error) {
      console.error('🚨 清理任务执行失败:', error)
      throw error
    }
  }

  // 📈 更新热搜排名
  private async updateTrendingRankings() {
    try {
      // 获取最近24小时的热门关键词
      const { data: keywords, error } = await this.supabase
        .from('trending_keywords')
        .select('*')
        .order('hot_score', { ascending: false })

      if (error) {
        console.error('❌ 获取热搜关键词失败:', error)
        return
      }

      // 更新排名
      for (let i = 0; i < keywords.length; i++) {
        const { error: updateError } = await this.supabase
          .from('trending_keywords')
          .update({ trending_rank: i + 1 })
          .eq('id', keywords[i].id)

        if (updateError) {
          console.error('❌ 更新关键词排名失败:', updateError)
        }
      }

      console.log(`✅ 更新了 ${keywords.length} 个关键词的排名`)

    } catch (error) {
      console.error('🚨 更新热搜排名异常:', error)
    }
  }

  // 📝 记录任务执行日志
  private async logTaskExecution(taskName: string, success: boolean, result: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('task_logs')
        .insert({
          task_name: taskName,
          success,
          result,
          executed_at: new Date().toISOString()
        })

      if (error && error.code !== 'PGRST116') { // 忽略表不存在的错误
        console.error('❌ 记录任务日志失败:', error)
      }
    } catch (error) {
      // 静默处理日志记录错误，不影响主要任务
      console.warn('⚠️ 任务日志记录异常:', error)
    }
  }

  // 📊 获取任务统计
  public async getTaskStats(): Promise<TaskStats[]> {
    try {
      const { data: logs, error } = await this.supabase
        .from('task_logs')
        .select('*')
        .order('executed_at', { ascending: false })

      if (error) {
        console.error('❌ 获取任务统计失败:', error)
        return []
      }

      // 按任务名称分组统计
      const statsMap = new Map<string, TaskStats>()

      logs?.forEach((log: any) => {
        const taskName = log.task_name
        if (!statsMap.has(taskName)) {
          statsMap.set(taskName, {
            taskName,
            lastRun: new Date(log.executed_at),
            nextRun: this.calculateNextRun(taskName),
            successCount: 0,
            failureCount: 0
          })
        }

        const stats = statsMap.get(taskName)!
        if (log.success) {
          stats.successCount++
        } else {
          stats.failureCount++
        }

        // 更新最新结果
        if (new Date(log.executed_at) > stats.lastRun) {
          stats.lastRun = new Date(log.executed_at)
          stats.lastResult = log.result
        }
      })

      return Array.from(statsMap.values())

    } catch (error) {
      console.error('🚨 获取任务统计异常:', error)
      return []
    }
  }

  // 📅 计算下次运行时间
  private calculateNextRun(taskName: string): Date {
    const now = new Date()
    
    switch (taskName) {
      case 'basic_crawler':
        return new Date(now.getTime() + 30 * 60 * 1000) // 30分钟后
      case 'advanced_crawler':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
      case 'cleanup_tasks':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(2, 0, 0, 0)
        return tomorrow
      default:
        return new Date(now.getTime() + 60 * 60 * 1000) // 默认1小时后
    }
  }

  // 🔍 获取调度器状态
  public getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.length,
      startTime: this.isRunning ? new Date() : null
    }
  }
}

// 🚀 懒加载调度器实例
let contentSchedulerInstance: ContentScheduler | null = null

function getContentScheduler(): ContentScheduler {
  if (!contentSchedulerInstance) {
    contentSchedulerInstance = new ContentScheduler()
  }
  return contentSchedulerInstance
}

// 🎯 便捷函数：启动内容调度器
export function startContentScheduler() {
  const scheduler = getContentScheduler()
  return scheduler.start()
}

// 🛑 便捷函数：停止内容调度器
export function stopContentScheduler() {
  const scheduler = getContentScheduler()
  return scheduler.stop()
}

// 📊 便捷函数：获取任务统计
export function getSchedulerStats() {
  const scheduler = getContentScheduler()
  return scheduler.getTaskStats()
} 