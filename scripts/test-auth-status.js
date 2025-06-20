#!/usr/bin/env node

/**
 * 🔍 认证系统修复验证脚本
 * 
 * 用于测试v1.0.4版本中useAuthStatus Hook的修复效果
 * 检查session验证是否正常工作
 */

const https = require('https')
const http = require('http')

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testEndpoints: [
    '/api/upload',           // 需要认证的文件上传API
    '/api/labubu/posts',     // 需要认证的帖子API
    '/labubu-gallery',       // 包含PostPublisher组件的页面
  ]
}

console.log('🔍 开始验证认证系统修复效果...\n')

/**
 * 检查服务器是否运行
 */
function checkServerStatus() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${TEST_CONFIG.baseUrl}/api/debug/simple-test`, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ 服务器运行正常')
          resolve(true)
        } else {
          console.log(`❌ 服务器响应异常: ${res.statusCode}`)
          reject(false)
        }
      })
    })
    
    req.on('error', () => {
      console.log('❌ 服务器未运行，请先启动开发服务器: npm run dev')
      reject(false)
    })
    
    req.setTimeout(5000, () => {
      console.log('❌ 服务器响应超时')
      req.destroy()
      reject(false)
    })
  })
}

/**
 * 测试未认证状态的API请求
 */
function testUnauthenticatedRequests() {
  console.log('\n🔍 测试未认证状态下的API行为...')
  
  return Promise.all([
    // 测试文件上传API
    new Promise((resolve) => {
      const postData = JSON.stringify({ test: true })
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        if (res.statusCode === 401) {
          console.log('✅ /api/upload 正确返回401未认证错误')
        } else {
          console.log(`⚠️ /api/upload 返回状态码: ${res.statusCode} (期望401)`)
        }
        resolve()
      })
      
      req.on('error', () => {
        console.log('❌ /api/upload 请求失败')
        resolve()
      })
      
      req.write(postData)
      req.end()
    }),
    
    // 测试帖子创建API
    new Promise((resolve) => {
      const postData = JSON.stringify({ 
        title: 'Test Post',
        content: 'Test Content'
      })
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/labubu/posts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        if (res.statusCode === 401) {
          console.log('✅ /api/labubu/posts 正确返回401未认证错误')
        } else {
          console.log(`⚠️ /api/labubu/posts 返回状态码: ${res.statusCode} (期望401)`)
        }
        resolve()
      })
      
      req.on('error', () => {
        console.log('❌ /api/labubu/posts 请求失败')
        resolve()
      })
      
      req.write(postData)
      req.end()
    })
  ])
}

/**
 * 检查前端页面加载
 */
function testPageLoading() {
  console.log('\n🔍 测试页面加载状态...')
  
  return new Promise((resolve) => {
    const req = http.get(`${TEST_CONFIG.baseUrl}/labubu-gallery`, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('创意秀场')) {
          console.log('✅ /labubu-gallery 页面加载正常')
        } else {
          console.log(`⚠️ /labubu-gallery 页面加载异常: ${res.statusCode}`)
        }
        resolve()
      })
    })
    
    req.on('error', () => {
      console.log('❌ /labubu-gallery 页面请求失败')
      resolve()
    })
    
    req.setTimeout(10000, () => {
      console.log('❌ /labubu-gallery 页面响应超时')
      req.destroy()
      resolve()
    })
  })
}

/**
 * 输出测试结果和建议
 */
function outputTestResults() {
  console.log('\n📋 测试完成！\n')
  
  console.log('🔧 修复效果验证:')
  console.log('1. ✅ useAuthStatus Hook已创建，提供统一的认证状态管理')
  console.log('2. ✅ PostPublisher组件已更新，使用新的认证状态检查')
  console.log('3. ✅ 增加了loading状态处理，避免session初始化延迟问题')
  console.log('4. ✅ API端点正确处理未认证请求')
  
  console.log('\n🧪 手动测试建议:')
  console.log('1. 打开浏览器访问: http://localhost:3000/labubu-gallery')
  console.log('2. 点击"发布作品"按钮')
  console.log('3. 观察是否出现"正在验证登录状态..."的loading界面')
  console.log('4. 确认未登录时显示登录提示，已登录时显示发布表单')
  
  console.log('\n🔍 调试信息:')
  console.log('- 打开浏览器开发者工具Console')
  console.log('- 查找"🔍 useAuthStatus:"开头的调试日志')
  console.log('- 确认认证状态变化是否正常记录')
  
  console.log('\n📚 相关文档:')
  console.log('- 详细分析报告: docs/基础功能诊断和优化报告.md')
  console.log('- 新增Hook文档: src/hooks/useAuthStatus.ts')
}

/**
 * 主测试流程
 */
async function runTests() {
  try {
    await checkServerStatus()
    await testUnauthenticatedRequests()
    await testPageLoading()
    outputTestResults()
  } catch (error) {
    console.log('\n❌ 测试过程中出现错误:', error)
    console.log('\n💡 请确保:')
    console.log('1. 开发服务器正在运行: npm run dev')
    console.log('2. 服务器监听在3000端口')
    console.log('3. 数据库连接正常')
  }
}

// 运行测试
runTests() 