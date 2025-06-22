const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量加载配置
require('dotenv').config({ path: '.env.local' })

async function createWallpaperTables() {
  console.log('🗄️ 开始创建壁纸数据库表...')
  
  // 创建Supabase客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少Supabase配置，请检查环境变量:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'setup-wallpaper-tables.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // 分割SQL语句（按分号分割，但忽略函数体内的分号）
    const statements = sqlContent
      .split(/;\s*(?=\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '')
    
    console.log(`📋 找到 ${statements.length} 条SQL语句`)
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      console.log(`🔄 执行SQL ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // 如果是表已存在的错误，忽略它
          if (error.message.includes('already exists')) {
            console.log(`⚠️  表或对象已存在，跳过: ${error.message}`)
            continue
          }
          throw error
        }
        
        console.log(`✅ SQL ${i + 1} 执行成功`)
      } catch (sqlError) {
        console.error(`❌ SQL ${i + 1} 执行失败:`, sqlError.message)
        console.log('SQL内容:', statement.substring(0, 100) + '...')
        
        // 如果是关键表创建失败，停止执行
        if (statement.includes('CREATE TABLE')) {
          throw sqlError
        }
      }
    }
    
    // 验证表是否创建成功
    console.log('🔍 验证表创建结果...')
    
    const { data: categories, error: catError } = await supabase
      .from('wallpaper_categories')
      .select('count', { count: 'exact', head: true })
    
    const { data: wallpapers, error: wallError } = await supabase
      .from('wallpapers')
      .select('count', { count: 'exact', head: true })
    
    if (catError || wallError) {
      console.error('❌ 表验证失败:', catError || wallError)
      return
    }
    
    console.log('✅ 壁纸数据库表创建成功！')
    console.log(`📊 分类表记录数: ${categories?.count || 0}`)
    console.log(`🖼️  壁纸表记录数: ${wallpapers?.count || 0}`)
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message)
    console.error('详细错误:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createWallpaperTables()
}

module.exports = { createWallpaperTables } 