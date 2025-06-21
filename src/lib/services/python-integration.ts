// 🐍 Python爬虫与Next.js项目集成服务
// 桥接Python数据获取能力与现有TypeScript内容引擎

import { createAdminClient } from '@/lib/supabase/server'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

// 🔄 Python爬虫数据接口
interface PythonCrawlerData {
  metadata: {
    export_time: string
    total_count: number
    source: string
    version: string
  }
  articles: PythonCrawlerArticle[]
}

interface PythonCrawlerArticle {
  id: string
  title: string
  content: string
  summary: string
  author: string
  sourceId: string
  originalUrl: string
  publishedAt: string
  imageUrls: string[]
  tags: string[]
  category: string
  language: string
  country: string
  platform: string
  engagementData: {
    likes: number
    shares: number
    comments: number
    views: number
  }
  hotScore: number
  createdAt: string
}

// 🚀 Python集成服务类
export class PythonIntegrationService {
  private supabase = createAdminClient()
  private pythonScriptPath = path.join(process.cwd(), 'scripts', 'python-social-crawler.py')
  private outputDir = path.join(process.cwd(), 'temp', 'python-output')

  constructor() {
    this.ensureOutputDir()
  }

  // 📁 确保输出目录存在
  private async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true })
    } catch (error) {
      console.error('❌ 创建输出目录失败:', error)
    }
  }

  // 🐍 执行Python爬虫脚本
  async executePythonCrawler(): Promise<{ success: boolean; data?: PythonCrawlerData; error?: string }> {
    return new Promise((resolve) => {
      console.log('🚀 启动Python社交媒体爬虫...')
      
      const pythonProcess = spawn('python3', [this.pythonScriptPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          // 传递环境变量给Python脚本
          TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
          REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
          REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
        }
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString()
        stdout += output
        console.log('🐍 Python输出:', output.trim())
      })

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString()
        stderr += error
        console.error('🐍 Python错误:', error.trim())
      })

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('✅ Python爬虫执行成功')
          
          try {
            // 查找最新的JSON输出文件
            const files = await fs.readdir(process.cwd())
            const jsonFiles = files.filter(f => f.startsWith('labubu_social_data_') && f.endsWith('.json'))
            
            if (jsonFiles.length === 0) {
              resolve({ success: false, error: '未找到输出文件' })
              return
            }

            // 获取最新的文件
            const latestFile = jsonFiles.sort().pop()!
            const filePath = path.join(process.cwd(), latestFile)
            
            // 读取数据
            const jsonData = await fs.readFile(filePath, 'utf-8')
            const parsedData: PythonCrawlerData = JSON.parse(jsonData)
            
            resolve({ success: true, data: parsedData })
            
            // 清理临时文件
            await fs.unlink(filePath).catch(() => {})
            
          } catch (error) {
            console.error('❌ 读取Python输出失败:', error)
            resolve({ success: false, error: '读取输出文件失败' })
          }
        } else {
          console.error('❌ Python爬虫执行失败，退出码:', code)
          resolve({ success: false, error: `Python脚本退出码: ${code}, 错误: ${stderr}` })
        }
      })

      // 设置超时 (30分钟)
      setTimeout(() => {
        pythonProcess.kill()
        resolve({ success: false, error: '执行超时' })
      }, 30 * 60 * 1000)
    })
  }

  // 📝 将Python数据转换为现有格式并保存
  async integratePythonData(pythonData: PythonCrawlerData): Promise<{ 
    success: boolean; 
    count: number; 
    message: string 
  }> {
    try {
      console.log('🔄 开始集成Python爬虫数据...')
      
      let successCount = 0
      let errorCount = 0

      for (const article of pythonData.articles) {
        try {
          // 转换为现有数据库格式
          const dbArticle = {
            id: article.id,
            title: article.title,
            content: article.content,
            summary: article.summary,
            author: article.author,
            source_id: await this.ensureSource(article.platform, article.sourceId),
            original_url: article.originalUrl,
            published_at: new Date(article.publishedAt).toISOString(),
            image_urls: article.imageUrls,
            tags: article.tags,
            category: article.category,
            language: article.language,
            country: article.country,
            platform: article.platform,
            
            // 互动数据
            likes_count: article.engagementData.likes,
            shares_count: article.engagementData.shares,
            comments_count: article.engagementData.comments,
            views_count: article.engagementData.views,
            
            // 热度分数 (使用Python计算的结果)
            hot_score: article.hotScore,
            
            // 元数据
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // Python来源标识
            source_type: 'python_crawler',
            raw_data: {
              python_id: article.id,
              original_platform: article.platform,
              crawl_time: pythonData.metadata.export_time
            }
          }

          // 保存到数据库 (使用upsert避免重复)
          const { error } = await this.supabase
            .from('labubu_posts')
            .upsert(dbArticle, { 
              onConflict: 'original_url',
              ignoreDuplicates: false 
            })

          if (error) {
            console.error('❌ 保存文章失败:', error)
            errorCount++
          } else {
            successCount++
          }

        } catch (articleError) {
          console.error('❌ 处理文章失败:', articleError)
          errorCount++
        }
      }

      // 更新趋势关键词
      await this.updateTrendingKeywords(pythonData.articles)

      const message = `Python数据集成完成: 成功 ${successCount} 条，失败 ${errorCount} 条`
      console.log('✅', message)

      return {
        success: true,
        count: successCount,
        message
      }

    } catch (error) {
      console.error('❌ Python数据集成失败:', error)
      return {
        success: false,
        count: 0,
        message: `集成失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  // 🏷️ 确保数据源存在
  private async ensureSource(platform: string, sourceId: string): Promise<string> {
    try {
      // 先查找是否存在
      const { data: existing } = await this.supabase
        .from('news_sources')
        .select('id')
        .eq('platform', platform)
        .eq('source_identifier', sourceId)
        .single()

      if (existing) {
        return existing.id
      }

      // 创建新的数据源
      const { data: newSource, error } = await this.supabase
        .from('news_sources')
        .insert({
          name: `${platform} - ${sourceId}`,
          platform: platform,
          source_identifier: sourceId,
          url: this.getPlatformUrl(platform, sourceId),
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('❌ 创建数据源失败:', error)
        return 'default_source_id' // 使用默认源
      }

      return newSource.id

    } catch (error) {
      console.error('❌ 确保数据源失败:', error)
      return 'default_source_id'
    }
  }

  // 🔗 获取平台URL
  private getPlatformUrl(platform: string, sourceId: string): string {
    const urlMap: Record<string, string> = {
      'twitter': `https://twitter.com/${sourceId}`,
      'twitter_scrape': `https://twitter.com/search?q=${encodeURIComponent(sourceId)}`,
      'reddit': `https://reddit.com/r/${sourceId}`,
      'news_rss': sourceId, // RSS URL本身
      'instagram': `https://instagram.com/${sourceId}`,
      'tiktok': `https://tiktok.com/@${sourceId}`,
    }

    return urlMap[platform] || `https://${platform}.com/${sourceId}`
  }

  // 📈 更新趋势关键词
  private async updateTrendingKeywords(articles: PythonCrawlerArticle[]) {
    try {
      // 收集所有标签
      const allTags = articles.flatMap(article => article.tags)
      const tagCounts = new Map<string, number>()

      allTags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })

      // 获取热门标签 (出现3次以上)
      const trendingTags = Array.from(tagCounts.entries())
        .filter(([_, count]) => count >= 3)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ keyword: tag, count, source: 'python_crawler' }))

      if (trendingTags.length > 0) {
        // 保存或更新趋势关键词
        for (const { keyword, count } of trendingTags) {
          await this.supabase
            .from('trending_keywords')
            .upsert({
              keyword,
              count,
              source: 'python_crawler',
              date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'keyword,date',
              ignoreDuplicates: false
            })
        }

        console.log(`✅ 更新了 ${trendingTags.length} 个趋势关键词`)
      }

    } catch (error) {
      console.error('❌ 更新趋势关键词失败:', error)
    }
  }

  // 🔄 完整的集成流程
  async runPythonIntegration(): Promise<{
    success: boolean
    stats: {
      crawl_duration?: number
      articles_found?: number
      articles_saved?: number
      trending_keywords?: number
    }
    message: string
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      console.log('🚀 开始Python社交媒体数据集成流程...')

      // 1. 执行Python爬虫
      const crawlResult = await this.executePythonCrawler()
      
      if (!crawlResult.success || !crawlResult.data) {
        return {
          success: false,
          stats: {},
          message: 'Python爬虫执行失败',
          error: crawlResult.error
        }
      }

      // 2. 集成数据到现有系统
      const integrationResult = await this.integratePythonData(crawlResult.data)
      
      const stats = {
        crawl_duration: Math.round((Date.now() - startTime) / 1000),
        articles_found: crawlResult.data.articles.length,
        articles_saved: integrationResult.count,
        trending_keywords: 0 // 这里可以加上实际数量
      }

      return {
        success: integrationResult.success,
        stats,
        message: `Python集成完成: 发现 ${stats.articles_found} 条，保存 ${stats.articles_saved} 条，耗时 ${stats.crawl_duration} 秒`
      }

    } catch (error) {
      return {
        success: false,
        stats: { crawl_duration: Math.round((Date.now() - startTime) / 1000) },
        message: 'Python集成流程执行失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}

// 🎯 导出单例实例
export const pythonIntegration = new PythonIntegrationService()

// 🔧 辅助函数: 检查Python环境
export async function checkPythonEnvironment(): Promise<{
  python_available: boolean
  packages_status: Record<string, boolean>
  recommendations: string[]
}> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['-c', `
import sys
import importlib

packages = [
    'newspaper', 'feedparser', 'tweepy', 'praw', 
    'requests', 'beautifulsoup4', 'pandas'
]

results = {}
for pkg in packages:
    try:
        importlib.import_module(pkg)
        results[pkg] = True
    except ImportError:
        results[pkg] = False

print('PYTHON_CHECK_RESULT:', results)
    `])

    let output = ''
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          python_available: false,
          packages_status: {},
          recommendations: ['请确保已安装Python 3.8+', '运行: pip install -r scripts/python-requirements.txt']
        })
        return
      }

      try {
        const resultLine = output.split('\n').find(line => line.includes('PYTHON_CHECK_RESULT:'))
        if (resultLine) {
          const packages_status = eval(resultLine.split('PYTHON_CHECK_RESULT:')[1].trim())
          const missing = Object.entries(packages_status).filter(([_, installed]) => !installed).map(([pkg]) => pkg)
          
          resolve({
            python_available: true,
            packages_status,
            recommendations: missing.length > 0 ? [
              `缺少包: ${missing.join(', ')}`,
              '运行: pip install -r scripts/python-requirements.txt'
            ] : []
          })
        } else {
          resolve({
            python_available: true,
            packages_status: {},
            recommendations: ['无法检测包状态']
          })
        }
      } catch (error) {
        resolve({
          python_available: true,
          packages_status: {},
          recommendations: ['包状态检测失败']
        })
      }
    })
  })
} 