# 📘 Facebook Graph API 启用指南

## 🚨 当前状态
- **开发者账号**: ❌ 需要创建Facebook开发者账号
- **应用创建**: ❌ 需要创建Facebook应用
- **权限申请**: ❌ 需要申请相关权限
- **商业验证**: ❌ 需要商业验证（高级功能）

---

## 📋 申请难度分析
- **申请难度**: ⭐⭐⭐ (中等)
- **审核时间**: 3-7个工作日
- **费用**: 免费（基础版）
- **限制**: 速率限制，部分功能需要商业验证

---

## 🔧 详细申请步骤

### 第1步：创建Facebook开发者账号
1. 访问 [Facebook for Developers](https://developers.facebook.com/)
2. 使用Facebook个人账号登录
3. 点击 "Get Started" 开始创建开发者账号
4. 完成身份验证：
   - 提供手机号码
   - 接受开发者政策和条款
   - 选择开发者角色（个人/企业）

### 第2步：创建新应用
1. 在开发者控制台点击 "Create App"
2. 选择应用类型：
   - **Consumer**: 面向消费者的应用
   - **Business**: 商业应用（推荐）
3. 填写应用基本信息：
   ```
   App Name: Labubu Content Aggregator
   App Contact Email: your-email@example.com
   App Purpose: 聚合和分析Labubu相关社交媒体内容
   ```

### 第3步：配置Graph API
1. 在应用控制台中，点击 "Add Product"
2. 找到 "Facebook Login" 并点击 "Set Up"
3. 配置Facebook Login设置：
   ```
   Valid OAuth Redirect URIs:
   - http://localhost:3000/auth/facebook/callback
   - https://your-domain.com/auth/facebook/callback
   
   Client OAuth Settings:
   ✅ Web OAuth Login
   ✅ Enforce HTTPS
   ```

### 第4步：获取应用凭据
1. 在 "Settings" > "Basic" 页面找到：
   ```
   App ID: [记录此ID]
   App Secret: [点击Show查看并记录]
   ```
2. 记录这些凭据用于API调用

### 第5步：申请所需权限
在 "App Review" 部分申请以下权限：

#### 基础权限（通常自动批准）
- `public_profile` - 获取用户基本信息
- `email` - 获取用户邮箱

#### 需要审核的权限
- `pages_read_engagement` - 读取页面互动数据
- `pages_show_list` - 获取用户管理的页面列表
- `pages_read_user_content` - 读取页面内容
- `instagram_basic` - Instagram基础访问权限

### 第6步：商业验证（可选，高级功能）
1. 在 "Settings" > "Business Verification" 
2. 提供商业信息：
   - 营业执照
   - 商业地址
   - 联系信息
   - 网站验证
3. 等待Facebook审核（5-10个工作日）

---

## 🔑 API权限详解

### 基础权限
| 权限名称 | 描述 | 审核要求 |
|---------|------|---------|
| `public_profile` | 用户基本信息 | 无需审核 |
| `email` | 用户邮箱地址 | 无需审核 |
| `user_posts` | 用户帖子 | 需要审核 |

### 页面权限
| 权限名称 | 描述 | 审核要求 |
|---------|------|---------|
| `pages_read_engagement` | 页面互动数据 | 需要审核 |
| `pages_show_list` | 页面列表 | 需要审核 |
| `pages_read_user_content` | 页面内容 | 需要审核 |

### Instagram权限
| 权限名称 | 描述 | 审核要求 |
|---------|------|---------|
| `instagram_basic` | Instagram基础访问 | 需要审核 |
| `instagram_content_publish` | 发布内容 | 需要审核 |

---

## 📊 API限制和配额

### 速率限制
- **应用级别**: 每小时200次调用/用户
- **用户级别**: 每用户每小时600次调用
- **页面级别**: 每页面每小时4800次调用

### 数据限制
- **批量请求**: 最多50个请求/批次
- **字段限制**: 每次请求最多获取指定字段
- **时间范围**: 大部分数据支持历史90天

### 商业API限制
- **需要商业验证**: 高级功能需要通过商业验证
- **更高配额**: 商业账号享有更高的API调用配额
- **高级洞察**: 访问详细的分析数据

---

## 🔒 安全配置

### 环境变量配置
```env
# Facebook Graph API
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback
FACEBOOK_API_VERSION=v18.0
```

### 配置文件更新
```typescript
// src/lib/services/media-api-config.ts
facebook: {
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
  apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
  baseUrl: 'https://graph.facebook.com',
  scopes: [
    'public_profile',
    'email',
    'pages_read_engagement',
    'pages_show_list'
  ],
},
```

---

## 🎯 Labubu内容获取策略

### 1. 公开页面内容
```javascript
// 获取Labubu相关Facebook页面
const pages = [
  'popmart.global',
  'labubu.official',
  'blindbox.community'
];

// 获取页面帖子
const posts = await fetch(`https://graph.facebook.com/v18.0/${pageId}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`);
```

### 2. 关键词搜索
```javascript
// 搜索包含Labubu的公开帖子
const searchQuery = 'Labubu OR 拉布布 OR "POP MART"';
const searchResults = await fetch(`https://graph.facebook.com/v18.0/search?q=${encodeURIComponent(searchQuery)}&type=post&access_token=${accessToken}`);
```

### 3. 用户授权内容
```javascript
// 获取用户授权后的帖子
const userPosts = await fetch(`https://graph.facebook.com/v18.0/me/posts?fields=message,created_time,place,tags&access_token=${userAccessToken}`);
```

---

## 🧪 测试和验证

### 第1步：获取应用访问令牌
```javascript
const appAccessToken = await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=client_credentials`);
```

### 第2步：测试基础API调用
```javascript
// 测试API是否正常工作
const testCall = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${ACCESS_TOKEN}`);
```

### 第3步：获取用户访问令牌
```javascript
// 用户授权流程
const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=public_profile,email,pages_read_engagement`;
```

---

## 📱 集成到项目

### Facebook服务类
```typescript
// src/lib/services/facebook-service.ts
export class FacebookService {
  private appId: string;
  private appSecret: string;
  private apiVersion: string;
  
  constructor() {
    const config = mediaAPIConfig.getFacebookConfig();
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.apiVersion = config.apiVersion;
  }
  
  async getPagePosts(pageId: string, accessToken: string) {
    const url = `https://graph.facebook.com/${this.apiVersion}/${pageId}/posts`;
    const params = new URLSearchParams({
      fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
      access_token: accessToken,
    });
    
    const response = await fetch(`${url}?${params}`);
    return response.json();
  }
  
  async searchPosts(query: string, accessToken: string) {
    const url = `https://graph.facebook.com/${this.apiVersion}/search`;
    const params = new URLSearchParams({
      q: query,
      type: 'post',
      fields: 'id,message,created_time,from',
      access_token: accessToken,
    });
    
    const response = await fetch(`${url}?${params}`);
    return response.json();
  }
  
  async filterLabubuContent(posts: any[]) {
    const labubuKeywords = [
      'labubu', '拉布布', 'popmart', '泡泡玛特',
      'blindbox', '盲盒', 'toy', '玩具', 'collectible'
    ];
    
    return posts.filter(post => {
      const message = (post.message || '').toLowerCase();
      return labubuKeywords.some(keyword => 
        message.includes(keyword.toLowerCase())
      );
    });
  }
}
```

### API接口
```typescript
// src/app/api/admin/facebook-crawler/route.ts
import { FacebookService } from '@/lib/services/facebook-service';

export async function GET(request: NextRequest) {
  const facebookService = new FacebookService();
  
  try {
    // 获取Labubu相关Facebook内容
    const labubuPosts = await facebookService.searchPosts('Labubu', accessToken);
    
    return NextResponse.json({
      success: true,
      data: labubuPosts,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

---

## 🚨 常见问题

### Q1: 为什么无法获取所有公开帖子？
**A**: Facebook Graph API对公开内容的访问有限制，需要相应的权限和商业验证。

### Q2: 如何提高API调用配额？
**A**: 
- 完成商业验证
- 申请更高级别的API访问权限
- 优化API调用效率

### Q3: 权限申请被拒绝怎么办？
**A**: 
- 详细说明应用用途
- 提供应用演示视频
- 确保遵守Facebook平台政策
- 提供隐私政策和用户条款

### Q4: 如何处理API版本更新？
**A**: 
- 定期检查API版本更新
- 测试新版本兼容性
- 更新代码以支持新版本

---

## 🔄 替代方案

### 方案1：Facebook Marketing API
- 适用于广告和营销数据
- 需要商业验证
- 提供更详细的分析数据

### 方案2：第三方社交媒体管理工具
- Hootsuite API
- Sprout Social API
- Buffer API

### 方案3：网页爬虫（需谨慎）
- 遵守Facebook的robots.txt
- 注意法律合规性
- 控制请求频率

---

## 📈 数据分析和处理

### 热度计算
```typescript
function calculateHotScore(post: any): number {
  const likes = post.likes?.summary?.total_count || 0;
  const comments = post.comments?.summary?.total_count || 0;
  const shares = post.shares?.count || 0;
  
  // Facebook平台权重: 1.2
  const platformWeight = 1.2;
  const hotScore = Math.min(100, 
    (Math.log10(likes + 1) * 8 + 
     Math.log10(comments + 1) * 6 + 
     Math.log10(shares + 1) * 4) * platformWeight
  );
  
  return Math.round(hotScore);
}
```

### 内容分类
```typescript
function categorizeContent(post: any): string {
  const message = (post.message || '').toLowerCase();
  
  if (message.includes('价格') || message.includes('price')) return 'price';
  if (message.includes('开箱') || message.includes('unbox')) return 'unboxing';
  if (message.includes('收藏') || message.includes('collection')) return 'collection';
  if (message.includes('穿搭') || message.includes('outfit')) return 'fashion';
  
  return 'general';
}
```

---

## ✅ 完成检查清单

- [ ] 创建Facebook开发者账号
- [ ] 创建Facebook应用
- [ ] 配置Facebook Login产品
- [ ] 获取App ID和App Secret
- [ ] 申请所需API权限
- [ ] 配置OAuth重定向URI
- [ ] 实现用户授权流程
- [ ] 测试基础API调用
- [ ] 实现内容搜索功能
- [ ] 提交权限审核
- [ ] 配置环境变量
- [ ] 集成到项目代码
- [ ] 完成商业验证（可选）

---

## 📞 需要帮助？

如果遇到问题，请参考：

1. **官方文档**: [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
2. **开发者社区**: [Facebook Developer Community](https://developers.facebook.com/community/)
3. **API参考**: [Graph API Reference](https://developers.facebook.com/docs/graph-api/reference)
4. **权限指南**: [Permissions Reference](https://developers.facebook.com/docs/permissions/reference)

---

**最后更新**: 2024年12月22日
**状态**: 待申请 - 需要创建应用和申请权限 