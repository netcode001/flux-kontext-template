#!/usr/bin/env node

/**
 * 🔑 NextAuth密钥生成器
 * 自动生成安全的NextAuth密钥并提供配置指导
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔑 NextAuth密钥生成器');
console.log('=====================================\n');

// 生成32字节的随机密钥
const secret = crypto.randomBytes(32).toString('base64');

console.log('✅ 已生成安全的NextAuth密钥:');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('\n📋 配置步骤:');
console.log('1. 复制上面的密钥');
console.log('2. 打开 .env.local 文件');
console.log('3. 找到 NEXTAUTH_SECRET 行');
console.log('4. 替换为生成的密钥');

// 检查是否存在 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\n🔧 自动更新选项:');
  console.log('是否要自动更新 .env.local 文件? (y/n)');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const answer = chunk.trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        updateEnvFile(envPath, secret);
      } else {
        console.log('\n✋ 请手动更新 .env.local 文件');
        process.exit(0);
      }
    }
  });
} else {
  console.log('\n⚠️  未找到 .env.local 文件');
  console.log('请先创建 .env.local 文件，然后手动添加密钥');
}

/**
 * 更新环境变量文件
 */
function updateEnvFile(filePath, newSecret) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 查找并替换 NEXTAUTH_SECRET
    const secretRegex = /NEXTAUTH_SECRET=.*/;
    const newSecretLine = `NEXTAUTH_SECRET="${newSecret}"`;
    
    if (secretRegex.test(content)) {
      content = content.replace(secretRegex, newSecretLine);
      console.log('\n✅ 已更新现有的 NEXTAUTH_SECRET');
    } else {
      content += `\n${newSecretLine}\n`;
      console.log('\n✅ 已添加新的 NEXTAUTH_SECRET');
    }
    
    fs.writeFileSync(filePath, content);
    console.log('🎉 .env.local 文件已成功更新!');
    console.log('\n🚀 下一步:');
    console.log('1. 配置 Supabase 数据库密钥');
    console.log('2. 配置 Google OAuth 密钥');
    console.log('3. 重启开发服务器: npm run dev');
    
  } catch (error) {
    console.error('\n❌ 更新文件时出错:', error.message);
    console.log('请手动更新 .env.local 文件');
  }
  
  process.exit(0);
} 