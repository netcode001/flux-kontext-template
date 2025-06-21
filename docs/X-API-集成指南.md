# 🐦 X (Twitter) API 集成指南
完整的X平台API集成到内容引擎的指南

## 📋 概述

本指南将帮助您将X (Twitter) API v2集成到Labubu垂直社区项目中，实现自动化的X平台内容抓取功能。

## 🎯 功能特性

### ✅ 已实现功能
- ✅ **X API v2集成**: 使用官方API v2获取高质量数据
- ✅ **智能内容过滤**: 自动识别Labubu相关内容
- ✅ **多语言支持**: 英文、中文、日文、韩文内容
- ✅ **热度计算**: 基于互动数据的智能热度算法
- ✅ **去重机制**: 自动避免重复内容
- ✅ **速率限制管理**: 遵守API限制，避免被封
- ✅ **管理界面**: 可视化控制面板
- ✅ **实时统计**: API使用情况和数据库统计

### 📊 数据获取范围
- 🔍 **关键词匹配**: labubu, 拉布布, popmart, lisa labubu, blackpink labubu等
- 📸 **媒体内容优先**: 优先抓取包含图片/视频的推文
- 💯 **质量过滤**: 自动过滤低互动和垃圾内容
- 🌐 **多语言**: 支持英文、中文、日文、韩文内容
- ⏰ **实时性**: 获取最近7天内的推文

## 🚀 快速开始

### 1. 获取X API凭据

您已经获得了X API凭据：
- **Client ID**: `SURPQWhwVHp0ZHhhU2FUMnMzQVc6MTpjaQ`
- **Client Secret**: `8uEwsdH08xSWyOYZaLBFU2Rco0qEewC4Y4pcybDEB4wVZRUbt0`

但还需要获取Bearer Token:

#### 步骤1: 获取Bearer Token
1. 访问 [X Developer Portal](https://developer.x.com/)
2. 进入您的项目设置
3. 在"Keys and Tokens"页面找到"Bearer Token"
4. 点击"Generate"生成Bearer Token
5. 复制保存这个Bearer Token（只会显示一次）

### 2. 配置环境变量

在`.env.local`文件中添加X API配置：

```bash
# X (Twitter) API v2 配置
TWITTER_CLIENT_ID="SURPQWhwVHp0ZHhhU2FUMnMzQVc6MTpjaQ"
TWITTER_CLIENT_SECRET="8uEwsdH08xSWyOYZaLBFU2Rco0qEewC4Y4pcybDEB4wVZRUbt0"
TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAACKb2gEAAAAAY7%2BGvZv4lD5hfQ3tvewtIKjymCw%3DntgMvWGUUqW557JyLFZASjlv4xV834nu3RcXhygn8iwAIMKlgH"

# 可选：其他X API凭据（如需要）
TWITTER_API_KEY="your_twitter_api_key_here"
TWITTER_API_SECRET="your_twitter_api_secret_here"
TWITTER_ACCESS_TOKEN="your_twitter_access_token_here"
TWITTER_ACCESS_TOKEN_SECRET="your_twitter_access_token_secret_here"

# 社交媒体内容抓取开关
NEXT_PUBLIC_ENABLE_SOCIAL_CRAWLER="true"
```

### 3. 测试API连接

```bash
# 测试X API连接
curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=labubu&max_results=10" \
  -H "Authorization: Bearer AAAAAAAAAAAAAAAAAAAAACKb2gEAAAAAY7%2BGvZv4lD5hfQ3tvewtIKjymCw%3DntgMvWGUUqW557JyLFZASjlv4xV834nu3RcXhygn8iwAIMKlgH"
```

### 4. 访问管理界面

1. 启动开发服务器: `npm run dev`
2. 访问管理界面: `http://localhost:3000/admin/x-api-crawler`
3. 使用管理员账户登录
4. 检查API状态和配置
5. 执行第一次数据抓取

## 🛠️ 详细配置

### API限制和配额

X API v2有以下限制：
- **Essential Plan (免费)**:
  - 每月50万推文查看
  - 每15分钟300次请求
  - 每次最多100条结果

- **Basic Plan ($100/月)**:
  - 每月1000万推文查看  
  - 每15分钟300次请求
  - 每次最多100条结果

### 搜索查询优化

系统使用以下优化的搜索查询：

```
(("labubu" OR "lаbubu" OR "拉布布" OR "popmart" OR "lisa labubu" OR "blackpink labubu" OR "labubu collectible")) 
-is:retweet -is:reply has:images OR has:videos 
lang:en OR lang:zh OR lang:ja OR lang:ko
```

**查询说明**:
- 使用OR逻辑匹配多个Labubu关键词
- 排除转推和回复，获取原创内容
- 优先获取有媒体内容的推文
- 支持多语言内容

### 内容过滤机制

#### 相关性过滤
- ✅ 包含Labubu关键词
- ✅ 包含相关品牌词(PopMart、Lisa、BlackPink等)
- ❌ 排除不相关内容

#### 质量过滤
- ✅ 最低互动量要求(点赞+转发+评论 ≥ 5)
- ✅ 有媒体内容优先
- ❌ 排除垃圾/营销内容

#### 垃圾内容过滤
- ❌ 包含"buy now"、"discount"、"sale"等营销词汇
- ❌ 疑似机器人账户
- ❌ 重复或抄袭内容

### 热度计算算法

```typescript
热度分数 = (
  点赞数 × 1.0 +
  转发数 × 2.0 +
  评论数 × 1.5 +
  引用推文数 × 2.5 +
  收藏数 × 1.8 +
  印象数 × 0.01
) × 时间衰减因子 × 媒体加分 × 用户权重
```

**计算因子**:
- **时间衰减**: 一周内线性衰减
- **媒体加分**: 有图片/视频 +30%
- **用户权重**: 基于粉丝数和认证状态

## 📱 使用管理界面

### 访问管理后台

1. **URL**: `/admin/x-api-crawler`
2. **权限**: 需要管理员权限（ADMIN_EMAILS环境变量）
3. **功能**: 完整的可视化管理界面

### 管理界面功能

#### 📊 API状态监控
- API配置状态检查
- 实时使用配额显示
- 速率限制监控
- 重置时间提醒

#### ⚙️ 爬取参数设置
- **最大结果数**: 10-100条
- **时间范围**: 1-168小时
- **语言设置**: 英文/中文/日文/韩文/全部

#### 🚀 一键执行爬取
- 实时进度显示
- 详细统计信息
- 错误处理和提示

#### 📈 数据统计展示
- 发现推文数量
- 成功保存数量
- 错误处理统计
- 用户和媒体数据

## 🤖 自动化集成

### Python脚本集成

系统同时支持Python脚本自动化：

```bash
# 执行Python爬虫
python3 scripts/python-social-crawler.py

# 查看输出日志
tail -f python_crawler.log
```

### 定时任务设置

可以设置定时任务自动执行：

```bash
# 每小时执行一次
0 * * * * cd /path/to/project && python3 scripts/python-social-crawler.py

# 每天早上8点执行
0 8 * * * cd /path/to/project && python3 scripts/python-social-crawler.py
```

## 🔧 故障排查

### 常见问题

#### 1. API认证失败 (401错误)
```
❌ 错误: X API认证失败，请检查Bearer Token
```

**解决方案**:
- 检查Bearer Token是否正确
- 确认环境变量配置
- 验证API密钥是否激活

#### 2. 速率限制超出 (429错误)
```
⚠️ 警告: X API速率限制超出，跳过本次抓取
```

**解决方案**:
- 等待速率限制重置
- 减少请求频率
- 考虑升级API计划

#### 3. 无推文返回
```
🔍 获取到 0 条原始推文
```

**解决方案**:
- 检查搜索关键词
- 调整时间范围
- 确认语言设置

### 调试工具

#### 1. API测试脚本
```bash
# 测试API连接
node scripts/test-x-api.js
```

#### 2. 日志查看
```bash
# Python爬虫日志
tail -f python_crawler.log

# Next.js应用日志
npm run dev
```

#### 3. 数据库检查
```bash
# 检查数据库连接
node scripts/check-database.js

# 查看推文数据
psql $DATABASE_URL -c "SELECT COUNT(*) FROM labubu_posts WHERE platform='twitter';"
```

## 📊 性能优化

### API使用优化

1. **批量处理**: 每次请求最大数量
2. **智能缓存**: 避免重复请求
3. **错误重试**: 网络错误自动重试
4. **速率控制**: 自动遵守API限制

### 内容质量优化

1. **关键词优化**: 精确匹配Labubu相关内容
2. **过滤算法**: 多层过滤确保内容质量
3. **去重机制**: URL和内容双重去重
4. **热度算法**: 智能计算内容热度

### 数据库优化

1. **索引优化**: 关键字段建立索引
2. **批量插入**: 提高写入效率
3. **定期清理**: 清理过期无效数据
4. **备份策略**: 定期备份重要数据

## 🚀 扩展功能

### 计划中的功能

- [ ] **实时流API**: 实时获取推文流
- [ ] **情感分析**: AI情感分析集成
- [ ] **图像识别**: 自动识别Labubu相关图片
- [ ] **用户画像**: 分析粉丝用户特征
- [ ] **趋势预测**: 基于数据的趋势预测
- [ ] **多账户管理**: 支持多个X账户

### 集成其他平台

- [ ] **Instagram API**: 集成Instagram内容
- [ ] **YouTube API**: 集成YouTube视频
- [ ] **Reddit API**: 扩展Reddit数据源
- [ ] **TikTok API**: 集成TikTok短视频

## 📈 监控和分析

### 关键指标

1. **API使用率**: 监控配额使用情况
2. **内容质量**: 过滤率和相关性
3. **抓取效率**: 成功率和错误率
4. **热度分布**: 内容热度分析

### 报告功能

- 📊 **日报**: 每日抓取统计
- 📈 **周报**: 趋势和热点分析
- 📋 **月报**: 全面数据报告
- 🎯 **实时监控**: 关键指标监控

## 🔒 安全和合规

### 数据安全

1. **API密钥安全**: 环境变量存储
2. **访问控制**: 管理员权限验证
3. **数据加密**: 敏感数据加密存储
4. **审计日志**: 完整操作记录

### 合规性

1. **X API服务条款**: 严格遵守官方条款
2. **速率限制**: 自动遵守API限制
3. **用户隐私**: 保护用户隐私信息
4. **数据使用**: 仅用于社区内容展示

## 🆘 技术支持

### 联系方式

- 📧 **邮箱**: admin@fluxkontext.space
- 📚 **文档**: 项目docs目录
- 🐛 **问题反馈**: GitHub Issues
- 💬 **技术交流**: 项目讨论区

### 更新日志

#### v2.5.0 (2024-01-XX)
- ✅ 集成X API v2官方接口
- ✅ 完整的管理界面
- ✅ 智能内容过滤
- ✅ 热度计算算法
- ✅ 多语言支持

---

## 📚 相关文档

- [API接口设计文档](./API接口设计文档.md)
- [数据库设计指南](./v2.0-database-setup-guide.md)
- [Python内容引擎集成指南](./Python内容引擎集成指南.md)
- [安全审查报告](./安全审查报告.md)

---

**🎉 恭喜！您已成功集成X API到内容引擎中。现在可以开始自动化获取高质量的Labubu相关内容了！** 