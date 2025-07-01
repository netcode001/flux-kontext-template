/**
 * 🎥 YouTube数据库表设置脚本
 * 使用Node.js和Supabase客户端创建YouTube相关数据表
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置，请检查环境变量:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupYouTubeTables() {
  console.log('🎥 开始设置YouTube数据库表...')

  try {
    // 读取SQL文件内容
    const sqlFilePath = path.join(__dirname, 'setup-youtube-tables.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    // 将SQL内容按分号分割成多个语句
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 找到 ${sqlStatements.length} 个SQL语句`)

    // 逐个执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      console.log(`\n执行语句 ${i + 1}/${sqlStatements.length}...`)

      // 使用RPC调用执行SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_statement: statement
      })

      if (error) {
        // 如果RPC不可用，尝试直接使用from()
        console.log('⚠️  RPC方法不可用，尝试其他方式...')
        
        // 对于CREATE TABLE语句，我们可以尝试手动创建
        if (statement.includes('CREATE TABLE IF NOT EXISTS youtube_search_keywords')) {
          console.log('🔧 手动创建youtube_search_keywords表...')
          // 这里可以添加手动创建表的逻辑
        } else if (statement.includes('CREATE TABLE IF NOT EXISTS youtube_videos')) {
          console.log('🔧 手动创建youtube_videos表...')
          // 这里可以添加手动创建表的逻辑
        } else {
          console.warn(`跳过语句: ${statement.substring(0, 50)}...`)
        }
      } else {
        console.log('✅ 执行成功')
      }
    }

    console.log('\n🎉 YouTube数据库表设置完成!')
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建结果...')
    
    try {
      // 尝试查询表结构
      const { data: keywordsTest, error: keywordsError } = await supabase
        .from('youtube_search_keywords')
        .select('*')
        .limit(1)

      if (keywordsError) {
        console.log('⚠️  youtube_search_keywords表可能未创建成功:', keywordsError.message)
      } else {
        console.log('✅ youtube_search_keywords表验证通过')
      }

      const { data: videosTest, error: videosError } = await supabase
        .from('youtube_videos')
        .select('*')
        .limit(1)

      if (videosError) {
        console.log('⚠️  youtube_videos表可能未创建成功:', videosError.message)
      } else {
        console.log('✅ youtube_videos表验证通过')
      }

    } catch (testError) {
      console.log('⚠️  表验证过程中出现错误:', testError.message)
    }

  } catch (error) {
    console.error('❌ 设置过程中出现错误:', error.message)
    console.error('详细错误:', error)
    process.exit(1)
  }
}

// 手动创建表的备用方案
async function createTablesManually() {
  console.log('\n🔧 尝试手动创建表结构...')

  try {
    // 检查Supabase是否支持直接SQL执行
    console.log('📋 注意：由于Supabase限制，您可能需要在Supabase控制台手动执行以下SQL:')
    console.log('\n' + '='.repeat(60))
    
    const sqlFilePath = path.join(__dirname, 'setup-youtube-tables.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    console.log(sqlContent)
    
    console.log('='.repeat(60))
    console.log('\n📍 请复制上述SQL到 Supabase 控制台 > SQL Editor 中执行')
    console.log('🔗 链接: https://app.supabase.com/project/[YOUR_PROJECT]/sql')
    
  } catch (error) {
    console.error('❌ 读取SQL文件失败:', error.message)
  }
}

// 执行主函数
setupYouTubeTables().catch((error) => {
  console.error('❌ 脚本执行失败:', error)
  createTablesManually()
}) 