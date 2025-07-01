/**
 * 🎥 YouTube API测试脚本
 * 测试API密钥有效性和服务状态
 */

const API_KEY = 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo'

async function testYouTubeAPI() {
  console.log('🎥 开始测试YouTube API...')
  console.log(`📋 使用API密钥: ${API_KEY.substring(0, 20)}...`)

  try {
    // 测试简单的搜索请求
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: 'test',
      type: 'video',
      maxResults: '1',
      key: API_KEY
    })

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
    
    console.log(`📡 HTTP状态码: ${response.status} ${response.statusText}`)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API密钥有效!')
      console.log(`📊 搜索结果: 找到 ${data.items?.length || 0} 个视频`)
      if (data.items && data.items.length > 0) {
        console.log(`📝 示例视频: ${data.items[0].snippet.title}`)
      }
    } else {
      console.log('❌ API请求失败!')
      console.log('🔍 错误详情:', JSON.stringify(data, null, 2))
      
      // 分析具体错误
      if (data.error) {
        const error = data.error
        console.log(`\n🚨 错误分析:`)
        console.log(`   - 错误代码: ${error.code}`)
        console.log(`   - 错误信息: ${error.message}`)
        
        if (error.code === 403) {
          console.log(`   📋 可能原因: API密钥无效或YouTube Data API v3未启用`)
        } else if (error.code === 400) {
          console.log(`   📋 可能原因: 请求参数错误`)
        } else if (error.code === 429) {
          console.log(`   📋 可能原因: API配额已用完`)
        }
      }
    }

  } catch (error) {
    console.log('❌ 网络请求失败:', error.message)
  }
}

// 执行测试
testYouTubeAPI().then(() => {
  console.log('\n🎯 测试完成!')
}).catch(error => {
  console.error('❌ 测试脚本出错:', error)
}) 