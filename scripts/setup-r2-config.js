#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🗄️ Cloudflare R2 配置设置向导\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupR2Config() {
  console.log('📋 我将帮你配置R2存储。请准备好以下信息：');
  console.log('   1. Cloudflare Account ID');
  console.log('   2. R2 Access Key ID');
  console.log('   3. R2 Secret Access Key');
  console.log('   4. 存储桶名称 (默认: labubuhub)\n');

  try {
    // 获取配置信息
    const accountId = await askQuestion('🔑 请输入你的 Cloudflare Account ID: ');
    if (!accountId) {
      console.log('❌ Account ID 不能为空');
      process.exit(1);
    }

    const accessKeyId = await askQuestion('🔑 请输入 R2 Access Key ID: ');
    if (!accessKeyId) {
      console.log('❌ Access Key ID 不能为空');
      process.exit(1);
    }

    const secretAccessKey = await askQuestion('🔑 请输入 R2 Secret Access Key: ');
    if (!secretAccessKey) {
      console.log('❌ Secret Access Key 不能为空');
      process.exit(1);
    }

    const bucketName = await askQuestion('📦 请输入存储桶名称 (默认: labubuhub): ') || 'labubuhub';

    // 生成配置
    const r2Config = `
# =============================================================================
# ☁️ R2文件存储配置 (自动生成于 ${new Date().toLocaleString()})
# =============================================================================

# 启用R2存储
NEXT_PUBLIC_ENABLE_R2="true"

# Cloudflare R2 配置
R2_ACCOUNT_ID="${accountId}"
R2_ACCESS_KEY_ID="${accessKeyId}"
R2_SECRET_ACCESS_KEY="${secretAccessKey}"
R2_BUCKET_NAME="${bucketName}"
R2_PUBLIC_URL="https://${bucketName}.${accountId}.r2.cloudflarestorage.com"
R2_CUSTOM_DOMAIN=""
`;

    // 检查是否存在 .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);

    if (envExists) {
      console.log('\n📝 发现现有的 .env.local 文件');
      const updateExisting = await askQuestion('是否要更新现有配置？(y/n): ');
      
      if (updateExisting.toLowerCase() === 'y' || updateExisting.toLowerCase() === 'yes') {
        // 读取现有配置
        let existingConfig = fs.readFileSync(envPath, 'utf8');
        
        // 移除旧的R2配置
        existingConfig = existingConfig.replace(/# R2.*?\n(.*?R2.*?\n)*/gms, '');
        existingConfig = existingConfig.replace(/NEXT_PUBLIC_ENABLE_R2.*?\n/g, '');
        existingConfig = existingConfig.replace(/R2_.*?\n/g, '');
        
        // 添加新的R2配置
        const updatedConfig = existingConfig.trim() + '\n' + r2Config;
        
        fs.writeFileSync(envPath, updatedConfig);
        console.log('✅ R2配置已更新到现有的 .env.local 文件');
      } else {
        console.log('📋 R2配置已生成，请手动添加到 .env.local 文件：');
        console.log(r2Config);
      }
    } else {
      // 创建新的 .env.local 文件
      const baseConfig = `# =============================================================================
# 🎨 FLUX KONTEXT AI - 环境配置
# =============================================================================

# 核心AI服务
FAL_KEY=c1d3c407-5037-4bbb-b513-285bbd270814:8b1840dee9554a62811e6899f4579e1f

# 数据库配置 (请填入真实值)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# 身份认证
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here_minimum_32_characters"
GOOGLE_ID="your_google_client_id"
GOOGLE_SECRET="your_google_client_secret"
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED="true"

# 站点配置
NEXT_PUBLIC_SITE_URL="https://fluxkontext.space"
NEXT_PUBLIC_WEB_URL="https://fluxkontext.space"
NEXT_PUBLIC_PROJECT_NAME="Flux Kontext"
NODE_ENV="development"
`;

      const fullConfig = baseConfig + r2Config;
      fs.writeFileSync(envPath, fullConfig);
      console.log('✅ .env.local 文件已创建，包含R2配置');
    }

    console.log('\n🧪 正在验证R2配置...');
    
    // 验证配置
    try {
      require('./check-r2-config.js');
    } catch (error) {
      console.log('⚠️ 配置验证脚本未找到，请手动运行: node scripts/check-r2-config.js');
    }

    console.log('\n🎉 R2配置完成！');
    console.log('\n📋 下一步：');
    console.log('   1. 确保其他必要的环境变量也已配置 (Supabase, Google OAuth等)');
    console.log('   2. 重启开发服务器: npm run dev');
    console.log('   3. 测试图片生成功能');
    console.log('\n💡 如果遇到问题，请查看: docs/R2配置获取指南.md');

  } catch (error) {
    console.error('❌ 配置过程中出现错误:', error.message);
  } finally {
    rl.close();
  }
}

// 检查是否有命令行参数
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🗄️ R2配置设置向导

用法:
  node scripts/setup-r2-config.js

这个脚本将引导你完成Cloudflare R2存储的配置。

需要准备的信息:
  - Cloudflare Account ID
  - R2 Access Key ID  
  - R2 Secret Access Key
  - 存储桶名称 (默认: labubuhub)

获取这些信息的详细步骤请查看: docs/R2配置获取指南.md
`);
  process.exit(0);
}

setupR2Config(); 