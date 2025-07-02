/**
 * 🔐 带登录的YouTube API测试脚本
 * 模拟用户登录后测试YouTube功能
 */

const BASE_URL = 'http://localhost:3000'

async function simulateLogin() {
  console.log('🔐 模拟管理员登录...')
  
  // 这个脚本只能测试API端点，实际登录需要在浏览器中进行
  // 因为NextAuth使用了cookie和session机制
  console.log('⚠️ 注意: 实际登录需要在浏览器中完成')
  console.log('📋 请在浏览器中访问: http://localhost:3000/admin/youtube-management')
  console.log('📧 使用账户: test@example.com')
  console.log('🔑 使用密码: password')
  
  return null
}

async function testYouTubeFeatures() {
  console.log('\n🎥 YouTube功能测试指南:')
  
  console.log('\n📋 测试步骤:')
  console.log('1. 在浏览器中打开: http://localhost:3000/admin/youtube-management')
  console.log('2. 使用 test@example.com / password 登录')
  console.log('3. 在"添加搜索关键词"表单中输入:')
  console.log('   - 搜索关键词: labubu test')
  console.log('   - 分类名称: 测试分类')
  console.log('   - 获取数量: 5')
  console.log('4. 点击"搜索并添加"按钮')
  console.log('5. 观察是否出现搜索结果')
  
  console.log('\n🔍 预期结果:')
  console.log('✅ 页面应显示"已配置的关键词"列表（包含3个示例关键词）')
  console.log('✅ 添加新关键词后应显示YouTube搜索结果')
  console.log('✅ 应该看到视频标题、缩略图、频道等信息')
  console.log('✅ 应该提供批量导入选项')
  
  console.log('\n🐛 如果出现错误:')
  console.log('❌ 检查开发者控制台的错误信息')
  console.log('❌ 确认已使用管理员邮箱登录')
  console.log('❌ 检查网络连接和YouTube API配额')
  
  console.log('\n📊 数据库状态检查:')
  
  // 检查数据库中的YouTube表
  try {
    const response = await fetch(`${BASE_URL}/api/debug/database-status`)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 数据库连接正常')
      console.log(`📈 数据库健康状态: ${data.data.summary.databaseHealth}`)
      console.log(`📊 现有表数量: ${data.data.summary.existingTables}/${data.data.summary.totalTables}`)
    }
  } catch (error) {
    console.log('❌ 数据库状态检查失败:', error.message)
  }
  
  // 验证YouTube表是否存在
  console.log('\n🎯 YouTube表验证:')
  try {
    const response = await fetch(`${BASE_URL}/api/debug/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'SELECT COUNT(*) as count FROM youtube_search_keywords'
      })
    })
    
    if (response.ok) {
      console.log('✅ youtube_search_keywords 表存在且可访问')
    } else {
      console.log('❌ youtube_search_keywords 表访问失败')
    }
  } catch (error) {
    console.log('⚠️ 表验证跳过 (需要特殊权限)')
  }
}

async function main() {
  console.log('🚀 YouTube功能完整测试')
  console.log('=' .repeat(50))
  
  await simulateLogin()
  await testYouTubeFeatures()
  
  console.log('\n' + '='.repeat(50))
  console.log('🎯 测试说明完成!')
  console.log('📱 请在浏览器中按照上述步骤进行实际测试')
}

main().catch(console.error) 