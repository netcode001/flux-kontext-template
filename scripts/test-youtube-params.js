/**
 * 🔍 YouTube API参数测试
 * 测试不同参数组合以找出400错误的原因
 */

const API_KEY = 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo'

async function testWithParams(testName, params) {
  console.log(`\n🧪 测试: ${testName}`)
  console.log(`📋 参数: ${JSON.stringify(params, null, 2)}`)
  
  try {
    const searchParams = new URLSearchParams(params)
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
    
    console.log(`📡 HTTP状态码: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ 成功! 找到 ${data.items?.length || 0} 个视频`)
      return true
    } else {
      const data = await response.json()
      console.log(`❌ 失败!`)
      console.log(`🔍 错误详情: ${JSON.stringify(data.error, null, 2)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 YouTube API参数测试开始...')
  
  // 基础测试（和之前成功的测试一样）
  await testWithParams('基础测试', {
    part: 'snippet',
    q: 'test',
    type: 'video',
    maxResults: '1',
    key: API_KEY
  })
  
  // 添加order参数
  await testWithParams('添加order参数', {
    part: 'snippet',
    q: 'test',
    type: 'video',
    maxResults: '1',
    order: 'relevance',
    key: API_KEY
  })
  
  // 添加regionCode参数
  await testWithParams('添加regionCode参数', {
    part: 'snippet',
    q: 'test',
    type: 'video',
    maxResults: '1',
    order: 'relevance',
    regionCode: 'US',
    key: API_KEY
  })
  
  // 添加relevanceLanguage参数
  await testWithParams('添加relevanceLanguage参数', {
    part: 'snippet',
    q: 'test',
    type: 'video',
    maxResults: '1',
    order: 'relevance',
    relevanceLanguage: 'zh',
    key: API_KEY
  })
  
  // 完整参数（和实际代码一样）
  await testWithParams('完整参数（实际代码）', {
    part: 'snippet',
    q: 'labubu',
    type: 'video',
    maxResults: '10',
    order: 'relevance',
    regionCode: 'US',
    relevanceLanguage: 'zh',
    key: API_KEY
  })
  
  // 尝试修复版本1：移除regionCode
  await testWithParams('修复版本1：移除regionCode', {
    part: 'snippet',
    q: 'labubu',
    type: 'video',
    maxResults: '10',
    order: 'relevance',
    relevanceLanguage: 'zh',
    key: API_KEY
  })
  
  // 尝试修复版本2：移除relevanceLanguage
  await testWithParams('修复版本2：移除relevanceLanguage', {
    part: 'snippet',
    q: 'labubu',
    type: 'video',
    maxResults: '10',
    order: 'relevance',
    regionCode: 'US',
    key: API_KEY
  })
  
  // 尝试修复版本3：只保留基础参数
  await testWithParams('修复版本3：只保留基础参数', {
    part: 'snippet',
    q: 'labubu',
    type: 'video',
    maxResults: '10',
    order: 'relevance',
    key: API_KEY
  })
  
  console.log('\n🎯 测试完成!')
}

runTests().catch(console.error) 