// 🕷️ 爬虫配置表设置脚本
// 创建爬虫配置管理表和初始数据

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupCrawlerConfig() {
  try {
    console.log('🕷️ 开始设置爬虫配置...')

    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 插入默认爬虫配置
    const defaultConfigs = [
      {
        crawler_name: 'x_api_crawler',
        is_enabled: false,
        config: { max_results: 100, since_hours: 24, lang: 'en' }
      },
      {
        crawler_name: 'news_crawler',
        is_enabled: false,
        config: { sources: ['hypebeast', 'toy_news'], interval: 30 }
      },
      {
        crawler_name: 'advanced_content_crawler',
        is_enabled: false,
        config: { platforms: ['weibo', 'xiaohongshu'], interval: 120 }
      },
      {
        crawler_name: 'python_crawler',
        is_enabled: false,
        config: { platforms: ['reddit', 'twitter'], keywords: ['labubu'] }
      },
      {
        crawler_name: 'youtube_crawler',
        is_enabled: false,
        config: { max_results: 50, region: 'global' }
      }
    ]

    console.log('📝 插入默认爬虫配置...')

    for (const config of defaultConfigs) {
      const { data, error } = await supabase
        .from('crawler_config')
        .upsert(config, { 
          onConflict: 'crawler_name',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        console.error(`❌ 插入配置失败 [${config.crawler_name}]:`, error)
        
        // 如果表不存在，提示手动创建
        if (error.message && error.message.includes('relation "crawler_config" does not exist')) {
          console.log('\n🔧 需要手动创建表，SQL如下:')
          console.log(`
CREATE TABLE crawler_config (
  id SERIAL PRIMARY KEY,
  crawler_name VARCHAR(50) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
          `)
          return
        }
      } else {
        console.log(`✅ 配置已设置 [${config.crawler_name}]: ${config.is_enabled ? '启用' : '关闭'}`)
      }
    }

    // 验证配置
    console.log('\n🔍 验证爬虫配置...')
    const { data: configs, error: fetchError } = await supabase
      .from('crawler_config')
      .select('*')
      .order('crawler_name')

    if (fetchError) {
      console.error('❌ 获取配置失败:', fetchError.message)
    } else {
      console.log('\n📋 当前爬虫配置:')
      configs.forEach(config => {
        console.log(`  ${config.is_enabled ? '🟢' : '🔴'} ${config.crawler_name}: ${config.is_enabled ? '启用' : '关闭'}`)
      })
      console.log(`\n📊 总计: ${configs.length} 个爬虫，${configs.filter(c => c.is_enabled).length} 个启用`)
    }

    console.log('\n🎉 爬虫配置设置完成！')
    console.log('\n💡 使用说明:')
    console.log('  1. 访问管理页面可以看到爬虫总开关')
    console.log('  2. 点击启用/关闭按钮切换爬虫状态')
    console.log('  3. 关闭的爬虫无法执行数据抓取')
    console.log('  4. 所有爬虫默认为关闭状态，需要手动启用')

  } catch (error) {
    console.error('❌ 设置爬虫配置失败:', error)
    process.exit(1)
  }
}

// 执行设置
setupCrawlerConfig() 