/**
 * 🔧 YouTube后端API测试脚本
 * 测试数据库连接和API端点
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI(endpoint, options = {}) {
  try {
    console.log(`\n🧪 测试: ${endpoint}`)
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    
    console.log(`📡 状态码: ${response.status} ${response.statusText}`)
    
    const contentType = response.headers.get('content-type')
    let data = null
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    if (response.ok) {
      console.log(`✅ 成功!`)
      console.log(`📊 响应数据:`, typeof data === 'string' ? data.substring(0, 200) + '...' : data)
    } else {
      console.log(`❌ 失败!`)
      console.log(`🔍 错误详情:`, data)
    }
    
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    console.log(`❌ 网络错误: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 YouTube后端API测试开始...')
  
  // 1. 测试获取YouTube关键词列表
  console.log('\n=== 测试1: 获取YouTube关键词 ===')
  const keywordsResult = await testAPI('/api/admin/youtube/keywords', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // 2. 测试添加新关键词（如果获取关键词成功）
  if (keywordsResult.success) {
    console.log('\n=== 测试2: 添加新关键词 ===')
    await testAPI('/api/admin/youtube/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: 'test labubu',
        categoryName: '测试分类',
        maxResults: 5
      })
    })
  }
  
  // 3. 测试数据库连接状态
  console.log('\n=== 测试3: 数据库连接状态 ===')
  await testAPI('/api/debug/database-status')
  
  // 4. 测试基础数据库查询
  console.log('\n=== 测试4: 数据库基础查询 ===')
  await testAPI('/api/debug/database')
  
  console.log('\n🎯 测试完成!')
}

// 等待开发服务器启动
console.log('⏳ 等待开发服务器启动...')
setTimeout(() => {
  runTests().catch(console.error)
}, 3000) 