#!/usr/bin/env node

/**
 * 🔄 R2 URL迁移脚本
 * 将数据库中的旧R2 URL格式迁移到新的公共开发URL格式
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// 配置
const OLD_R2_BASE = 'https://139b76588d6ec74c89c4c753cbbf4dc0.r2.cloudflarestorage.com';
const NEW_R2_BASE = process.env.R2_PUBLIC_URL || 'https://pub-82d6d1ca25d849b9b1a7fc2de2e83d06.r2.dev';

console.log('🔄 开始R2 URL迁移...');
console.log(`📋 旧URL格式: ${OLD_R2_BASE}`);
console.log(`📋 新URL格式: ${NEW_R2_BASE}`);

async function migrateR2Urls() {
  try {
    // 初始化Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. 查询所有帖子
    console.log('\n🔍 查询所有帖子...');
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, image_urls');

    if (fetchError) {
      throw new Error(`查询帖子失败: ${fetchError.message}`);
    }

    // 2. 在JavaScript中筛选需要迁移的帖子
    const posts = allPosts.filter(post => {
      return post.image_urls && post.image_urls.some(url => 
        typeof url === 'string' && url.startsWith(OLD_R2_BASE)
      );
    });

    console.log(`📊 总共 ${allPosts.length} 个帖子，找到 ${posts.length} 个需要迁移的帖子`);

    if (posts.length === 0) {
      console.log('✅ 没有需要迁移的帖子，任务完成！');
      return;
    }

    // 2. 批量更新URL
    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        console.log(`🔄 迁移帖子 ${post.id}...`);
        
        // 更新图片URL
        const updatedUrls = post.image_urls.map(url => {
          if (url.startsWith(OLD_R2_BASE)) {
            const fileName = url.replace(OLD_R2_BASE + '/', '');
            const newUrl = `${NEW_R2_BASE}/${fileName}`;
            console.log(`  📋 ${fileName}: ${url} -> ${newUrl}`);
            return newUrl;
          }
          return url;
        });

        // 更新数据库
        const { error: updateError } = await supabase
          .from('posts')
          .update({ image_urls: updatedUrls })
          .eq('id', post.id);

        if (updateError) {
          throw new Error(`更新帖子失败: ${updateError.message}`);
        }

        successCount++;
        console.log(`  ✅ 帖子 ${post.id} 迁移成功`);

        // 添加延迟避免过快请求
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`  ❌ 帖子 ${post.id} 迁移失败:`, error.message);
      }
    }

    console.log('\n📊 迁移完成统计:');
    console.log(`✅ 成功: ${successCount} 个帖子`);
    console.log(`❌ 失败: ${errorCount} 个帖子`);
    console.log(`📋 总计: ${posts.length} 个帖子`);

    if (successCount > 0) {
      console.log('\n🎉 R2 URL迁移完成！现有图片将使用新的公共URL访问。');
    }

  } catch (error) {
    console.error('❌ R2 URL迁移失败:', error);
    process.exit(1);
  }
}

// 验证环境变量
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 缺少必要的环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!process.env.R2_PUBLIC_URL) {
  console.error('❌ 缺少 R2_PUBLIC_URL 环境变量');
  process.exit(1);
}

// 执行迁移
migrateR2Urls(); 