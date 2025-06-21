// 🐦 X API内容爬虫管理端点
// 集成X平台API数据到内容引擎

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { XApiService, getXApiUsage } from '@/lib/services/x-api-service'
import { createAdminClient } from '@/lib/supabase/server'
// import { isCrawlerEnabled, CRAWLER_NAMES } from '@/lib/services/crawler-config'

// 🛡️ 管理员权限验证
async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: '请先登录' },
      { status: 401 }
    )
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  const isAdmin = adminEmails.includes(session.user.email)
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: '需要管理员权限' },
      { status: 403 }
    )
  }

  return null
}

// 🔍 GET - 获取X API状态和统计信息
export async function GET(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    // 检查环境配置
    const hasTwitterToken = !!process.env.TWITTER_BEARER_TOKEN
    
    if (!hasTwitterToken) {
      return NextResponse.json({
        success: false,
        error: 'X API未配置',
        config: {
          twitter_bearer_token: hasTwitterToken,
          twitter_client_id: !!process.env.TWITTER_CLIENT_ID,
          twitter_client_secret: !!process.env.TWITTER_CLIENT_SECRET,
        }
      })
    }

    // 获取API使用情况
    const apiUsage = await getXApiUsage()
    
    // 获取数据库统计
    const supabase = createAdminClient()
    const { count: totalTweets } = await supabase
      .from('labubu_posts')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'twitter')

    const { count: todayTweets } = await supabase
      .from('labubu_posts')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'twitter')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      success: true,
      status: {
        api_configured: true,
        api_usage: apiUsage,
        database_stats: {
          total_tweets: totalTweets || 0,
          today_tweets: todayTweets || 0
        }
      }
    })

  } catch (error: any) {
    console.error('❌ X API状态检查失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'X API状态检查失败'
    }, { status: 500 })
  }
}

// 🚀 POST - 执行X API内容抓取
export async function POST(request: NextRequest) {
  try {
    const authError = await verifyAdminAccess(request)
    if (authError) return authError

    // 🎛️ 检查爬虫开关状态 (临时简化版本)
    // 注意：这里暂时跳过开关检查，因为前端已经处理了
    // 后续可以添加服务器端的状态验证

    const body = await request.json()
    const {
      maxResults = 100,
      sinceHours = 24,
      lang = 'en'
    } = body

    console.log('🐦 开始X API内容抓取...', { maxResults, sinceHours, lang })

    // 检查环境配置
    if (!process.env.TWITTER_BEARER_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Twitter Bearer Token未配置'
      }, { status: 400 })
    }

    // 执行抓取
    const xApi = new XApiService()
    const { tweets, users, media } = await xApi.searchLabubuTweets({
      maxResults,
      sinceHours,
      lang
    })

    console.log(`✅ 获取到 ${tweets.length} 条推文，${users.length} 个用户，${media.length} 个媒体`)

    // 保存到数据库
    const supabase = createAdminClient()
    let savedCount = 0
    let errorCount = 0

    for (const tweet of tweets) {
      try {
        // 查找对应的用户信息
        const user = users.find(u => u.id === tweet.author_id)
        
        // 计算热度分数
        const hotScore = xApi.calculateHotScore(tweet, user)

        // 转换为数据库格式
        const dbPost = {
          id: `twitter_${tweet.id}`,
          title: tweet.text.slice(0, 100) + (tweet.text.length > 100 ? '...' : ''),
          content: tweet.text,
          summary: tweet.text.slice(0, 200),
          author: user?.name || user?.username || 'Unknown',
          source_id: 'twitter_official',
          original_url: `https://twitter.com/${user?.username}/status/${tweet.id}`,
          published_at: new Date(tweet.created_at).toISOString(),
          image_urls: media
            .filter(m => tweet.attachments?.media_keys?.includes(m.media_key))
            .map(m => m.url || m.preview_image_url)
            .filter(Boolean),
          tags: tweet.entities?.hashtags?.map(h => h.tag) || [],
          category: 'social',
          language: 'en', // X API会自动检测
          country: 'global',
          platform: 'twitter',
          
          // 互动数据
          likes_count: tweet.public_metrics.like_count,
          shares_count: tweet.public_metrics.retweet_count,
          comments_count: tweet.public_metrics.reply_count,
          views_count: tweet.public_metrics.impression_count || 0,
          
          // 热度分数
          hot_score: hotScore,
          
          // 元数据
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          
          // X API来源标识
          source_type: 'x_api',
          raw_data: {
            tweet_id: tweet.id,
            author_id: tweet.author_id,
            public_metrics: tweet.public_metrics,
            user_info: user
          }
        }

        // 保存到数据库 (使用upsert避免重复)
        const { error } = await supabase
          .from('labubu_posts')
          .upsert(dbPost, { 
            onConflict: 'original_url',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error('❌ 推文保存失败:', error)
          errorCount++
        } else {
          savedCount++
        }

      } catch (error) {
        console.error('❌ 推文处理失败:', error)
        errorCount++
      }
    }

    // 更新热门关键词
    await updateTrendingKeywordsFromTweets(tweets)

    return NextResponse.json({
      success: true,
      stats: {
        tweets_found: tweets.length,
        tweets_saved: savedCount,
        tweets_errors: errorCount,
        users_found: users.length,
        media_found: media.length
      },
      message: `成功处理 ${tweets.length} 条推文，保存 ${savedCount} 条，出错 ${errorCount} 条`
    })

  } catch (error: any) {
    console.error('❌ X API抓取失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'X API抓取失败'
    }, { status: 500 })
  }
}

// 📈 更新热门关键词
async function updateTrendingKeywordsFromTweets(tweets: any[]) {
  try {
    const supabase = createAdminClient()
    
    // 统计关键词频率
    const keywordMap = new Map<string, { count: number, engagement: number }>()
    
    tweets.forEach(tweet => {
      const text = tweet.text.toLowerCase()
      const hashtags = tweet.entities?.hashtags || []
      const engagement = tweet.public_metrics.like_count + 
                        tweet.public_metrics.retweet_count +
                        tweet.public_metrics.reply_count

      // 处理话题标签
      hashtags.forEach((hashtag: any) => {
        const tag = hashtag.tag.toLowerCase()
        const current = keywordMap.get(tag) || { count: 0, engagement: 0 }
        keywordMap.set(tag, {
          count: current.count + 1,
          engagement: current.engagement + engagement
        })
      })

      // 处理关键词
      const keywords = ['labubu', 'lisa', 'blackpink', 'popmart', 'blindbox']
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const current = keywordMap.get(keyword) || { count: 0, engagement: 0 }
          keywordMap.set(keyword, {
            count: current.count + 1,
            engagement: current.engagement + engagement
          })
        }
      })
    })

    // 保存热门关键词到数据库
    const trendingKeywords = Array.from(keywordMap.entries())
      .map(([keyword, stats]) => ({
        keyword,
        count: stats.count,
        engagement: stats.engagement,
        platform: 'twitter',
        updated_at: new Date().toISOString()
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 20)

    // 批量插入/更新关键词数据
    if (trendingKeywords.length > 0) {
      await supabase
        .from('trending_keywords')
        .upsert(trendingKeywords, { 
          onConflict: 'keyword,platform' 
        })
      
      console.log(`✅ 更新了 ${trendingKeywords.length} 个热门关键词`)
    }

  } catch (error) {
    console.error('❌ 更新热门关键词失败:', error)
  }
} 