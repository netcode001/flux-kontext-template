#!/usr/bin/env node

/**
 * 🧪 UUID修复验证脚本
 * 验证新的UUID生成逻辑是否正常工作
 */

const { v4: uuidv4 } = require('uuid');

console.log('🧪 开始UUID修复验证测试...\n');

// 测试UUID生成函数
function getUuid() {
  return uuidv4();
}

// 模拟OAuth用户ID（Google返回的非UUID格式）
const mockOAuthIds = [
  '101271696046169705864', // Google用户ID
  '123456789012345678901', // 另一个长数字ID
  'github_user_12345',     // GitHub用户ID
  'facebook_10158123456'   // Facebook用户ID
];

console.log('📋 测试场景1: OAuth ID格式检查');
mockOAuthIds.forEach((oauthId, index) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidUuid = uuidRegex.test(oauthId);
  
  console.log(`${index + 1}. OAuth ID: ${oauthId}`);
  console.log(`   是否为有效UUID: ${isValidUuid ? '✅' : '❌'}`);
  
  if (!isValidUuid) {
    const generatedUuid = getUuid();
    console.log(`   生成的UUID: ${generatedUuid}`);
    console.log(`   新UUID验证: ${uuidRegex.test(generatedUuid) ? '✅' : '❌'}`);
  }
  console.log('');
});

console.log('📋 测试场景2: 用户创建数据结构');
const mockUser = {
  id: '101271696046169705864', // 模拟Google OAuth ID
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg'
};

console.log('原始用户数据:', mockUser);

// 修复后的逻辑
const fixedUserData = {
  id: getUuid(), // 🎯 强制使用生成的UUID
  email: mockUser.email,
  name: mockUser.name,
  image: mockUser.image,
  signin_openid: mockUser.id, // OAuth ID单独存储
  signin_provider: 'google',
  credits: 100
};

console.log('修复后用户数据:', fixedUserData);
console.log('');

console.log('📋 测试场景3: 批量UUID生成测试');
const generatedUuids = [];
for (let i = 0; i < 10; i++) {
  const uuid = getUuid();
  generatedUuids.push(uuid);
  console.log(`${i + 1}. ${uuid}`);
}

// 检查重复
const uniqueUuids = new Set(generatedUuids);
console.log(`\n生成UUID数量: ${generatedUuids.length}`);
console.log(`唯一UUID数量: ${uniqueUuids.size}`);
console.log(`重复检查: ${generatedUuids.length === uniqueUuids.size ? '✅ 无重复' : '❌ 有重复'}`);

console.log('\n🎉 UUID修复验证测试完成！');
console.log('✅ 修复要点:');
console.log('   1. 永远使用生成的UUID作为数据库主键');
console.log('   2. OAuth提供商ID存储在signin_openid字段');
console.log('   3. 避免UUID格式冲突错误');
console.log('   4. 确保数据库一致性和唯一性'); 