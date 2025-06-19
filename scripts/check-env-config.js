#!/usr/bin/env node

/**
 * 🔍 环境变量配置检查器
 * 检查项目所需的环境变量配置状态
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 环境变量配置检查器');
console.log('=====================================\n');

// 环境变量配置定义
const requiredConfigs = {
  '🔴 必需配置': {
    'NEXTAUTH_SECRET': {
      description: 'NextAuth.js 身份验证密钥',
      placeholder: 'your_nextauth_secret_here_minimum_32_characters',
      required: true
    },
    'NEXT_PUBLIC_SUPABASE_URL': {
      description: 'Supabase 项目URL',
      placeholder: 'https://your-project-id.supabase.co',
      required: true
    },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
      description: 'Supabase 匿名密钥',
      placeholder: 'your_supabase_anon_key',
      required: true
    },
    'SUPABASE_SERVICE_ROLE_KEY': {
      description: 'Supabase 服务角色密钥',
      placeholder: 'your_supabase_service_role_key',
      required: true
    },
    'GOOGLE_ID': {
      description: 'Google OAuth 客户端ID',
      placeholder: 'your_google_client_id',
      required: true
    },
    'GOOGLE_SECRET': {
      description: 'Google OAuth 客户端密钥',
      placeholder: 'your_google_client_secret',
      required: true
    }
  },
  '🟡 重要配置': {
    'FAL_KEY': {
      description: 'FAL AI 图像生成密钥',
      placeholder: null,
      required: false
    },
    'STRIPE_PUBLIC_KEY': {
      description: 'Stripe 公开密钥',
      placeholder: 'your_stripe_public_key',
      required: false
    },
    'STRIPE_PRIVATE_KEY': {
      description: 'Stripe 私有密钥',
      placeholder: 'your_stripe_private_key',
      required: false
    }
  },
  '🟢 可选配置': {
    'ANTHROPIC_API_KEY': {
      description: 'Anthropic Claude API密钥',
      placeholder: 'your_anthropic_api_key',
      required: false
    },
    'EXA_API_KEY': {
      description: 'Exa Search API密钥',
      placeholder: 'your_exa_api_key',
      required: false
    },
    'LOOPS_API_KEY': {
      description: 'Loops 邮件API密钥',
      placeholder: 'your_loops_api_key',
      required: false
    }
  }
};

// 读取环境变量文件
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/"/g, '');
      }
    }
  });
} else {
  console.log('❌ 未找到 .env.local 文件');
  console.log('请先创建 .env.local 文件\n');
  process.exit(1);
}

// 检查配置状态
let totalConfigs = 0;
let configuredCount = 0;
let requiredMissing = 0;

Object.entries(requiredConfigs).forEach(([category, configs]) => {
  console.log(`${category}:`);
  console.log('─'.repeat(40));
  
  Object.entries(configs).forEach(([key, config]) => {
    totalConfigs++;
    const value = envVars[key];
    const isConfigured = value && value !== config.placeholder && value.length > 0;
    
    if (isConfigured) {
      configuredCount++;
      console.log(`✅ ${key}: 已配置`);
    } else {
      if (config.required) {
        requiredMissing++;
        console.log(`❌ ${key}: 未配置 (必需)`);
      } else {
        console.log(`⚪ ${key}: 未配置 (可选)`);
      }
    }
    
    console.log(`   📝 ${config.description}`);
    if (config.placeholder) {
      console.log(`   🔗 当前值: ${value || '未设置'}`);
    }
    console.log('');
  });
  
  console.log('');
});

// 显示配置统计
console.log('📊 配置统计:');
console.log('─'.repeat(40));
console.log(`总配置项: ${totalConfigs}`);
console.log(`已配置: ${configuredCount}`);
console.log(`未配置: ${totalConfigs - configuredCount}`);
console.log(`必需未配置: ${requiredMissing}`);

const configPercentage = Math.round((configuredCount / totalConfigs) * 100);
console.log(`配置完成度: ${configPercentage}%`);

// 显示状态和建议
console.log('\n🎯 配置状态:');
console.log('─'.repeat(40));

if (requiredMissing === 0) {
  console.log('✅ 所有必需配置已完成，项目可以正常运行！');
  console.log('🚀 建议: 配置可选项以启用更多功能');
} else {
  console.log(`❌ 还有 ${requiredMissing} 个必需配置未完成`);
  console.log('⚠️  项目可能无法正常运行');
  console.log('\n🔧 下一步操作:');
  console.log('1. 运行: node scripts/generate-auth-secret.js (生成NextAuth密钥)');
  console.log('2. 参考: setup-guide.md (完整配置指南)');
  console.log('3. 配置: Supabase 和 Google OAuth');
}

console.log('\n📚 配置帮助:');
console.log('─'.repeat(40));
console.log('• 查看完整配置指南: setup-guide.md');
console.log('• 生成NextAuth密钥: node scripts/generate-auth-secret.js');
console.log('• 项目文档: README.md');
console.log('• 如需帮助，请提供具体错误信息'); 