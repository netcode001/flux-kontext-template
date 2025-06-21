# 📸 Instagram Basic Display API 启用指南

## 🚨 当前状态
- **API应用**: ❌ 需要创建Facebook开发者应用
- **API审核**: ❌ 需要提交应用审核
- **测试用户**: ❌ 需要添加测试用户
- **访问令牌**: ❌ 需要获取用户访问令牌

---

## 📋 申请难度分析
- **申请难度**: ⭐⭐⭐ (中等)
- **审核时间**: 1-3个工作日
- **费用**: 免费
- **限制**: 需要Facebook开发者账号，需要应用审核

---

## 🔧 详细申请步骤

### 第1步：创建Facebook开发者账号
1. 访问 [Facebook for Developers](https://developers.facebook.com/)
2. 点击右上角 "Get Started" 或 "开始使用"
3. 使用Facebook个人账号登录
4. 完成开发者账号验证：
   - 提供手机号码验证
   - 接受开发者条款
   - 选择开发者类型（个人/企业）

### 第2步：创建新应用
1. 在开发者控制台中点击 "Create App" 或 "创建应用"
2. 选择应用类型：**"Consumer"** 或 **"Business"**
3. 填写应用信息：
   ```
   应用名称: Labubu Content Engine
   应用联系邮箱: your-email@example.com
   应用用途: 获取Labubu相关Instagram内容用于内容聚合
   ```
4. 点击 "Create App ID" 创建应用

### 第3步：添加Instagram Basic Display产品
1. 在应用控制台中，找到 "Add a Product" 部分
2. 找到 "Instagram Basic Display" 产品
3. 点击 "Set Up" 按钮
4. 系统会自动配置基本设置

### 第4步：配置Instagram Basic Display
1. 在左侧菜单中选择 "Instagram Basic Display"
2. 点击 "Create New App" 按钮
3. 填写Instagram应用信息：
   ```
   Display Name: Labubu Content Engine
   Valid OAuth Redirect URIs: 
     - http://localhost:3000/auth/instagram/callback
     - https://your-domain.com/auth/instagram/callback
   Website URL: https://your-domain.com
   ```

### 第5步：获取应用凭据
1. 在 "Basic Display" 页面中找到：
   ```
   Instagram App ID: [记录这个ID]
   Instagram App Secret: [记录这个密钥]
   ```
2. 保存这些凭据到安全的地方

### 第6步：添加测试用户
1. 在 "Roles" 部分点击 "Add Instagram Testers"
2. 输入要测试的Instagram用户名
3. 被添加的用户需要接受测试邀请
4. 只有测试用户的内容可以被访问

### 第7步：应用审核（生产环境）
1. 在 "App Review" 部分
2. 申请以下权限：
   - `instagram_graph_user_profile` - 获取用户基本信息
   - `instagram_graph_user_media` - 获取用户媒体内容
3. 提供应用使用说明和隐私政策
4. 等待Facebook审核（1-7个工作日）

---

## 🔑 API权限说明

### 基础权限（无需审核）
- **用户基本信息**: 用户名、账号类型
- **媒体基本信息**: 图片、视频的基本元数据
- **测试用户数据**: 仅限添加的测试用户

### 需要审核的权限
- **instagram_graph_user_profile**: 获取用户详细资料
- **instagram_graph_user_media**: 获取用户所有媒体内容
- **instagram_graph_user_insights**: 获取媒体洞察数据（仅商业账号）

---

## 📊 API限制和配额

### 速率限制
- **基础调用**: 200次/小时/用户
- **媒体获取**: 每个用户每小时200次
- **长期令牌**: 60天有效期

### 数据限制
- **媒体数量**: 每次最多25个
- **历史数据**: 最多获取最近的媒体内容
- **内容类型**: 图片、视频、轮播

---

## 🔒 安全配置

### 环境变量配置
```env
# Instagram Basic Display API
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

### 配置文件更新
```typescript
// src/lib/services/media-api-config.ts
instagram: {
  appId: process.env.INSTAGRAM_APP_ID || '',
  appSecret: process.env.INSTAGRAM_APP_SECRET || '',
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI || '',
  scopes: ['user_profile', 'user_media'],
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.instagram.com',
},
```

---

## 🎯 Labubu内容获取策略

### 搜索策略
由于Instagram Basic Display API不支持公开内容搜索，需要采用以下策略：

1. **关注Labubu相关账号**:
   - @popmart_global
   - @labubu_official
   - Labubu收藏家账号
   - 潮玩博主账号

2. **用户授权获取**:
   - 用户主动授权访问其Instagram内容
   - 从授权用户的内容中筛选Labubu相关内容
   - 分析用户标签和描述

3. **内容识别**:
   ```javascript
   const labubuKeywords = [
     'labubu', '拉布布', 'popmart', '泡泡玛特',
     'blindbox', '盲盒', 'toy', '玩具'
   ];
   ```

---

## 🧪 测试和验证

### 第1步：获取授权URL
```javascript
const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
```

### 第2步：处理回调获取访问令牌
```javascript
const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: APP_ID,
    client_secret: APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code: authCode,
  }),
});
```

### 第3步：获取用户媒体
```javascript
const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${ACCESS_TOKEN}`);
```

---

## 📱 集成到项目

### Instagram服务类
```typescript
// src/lib/services/instagram-service.ts
export class InstagramService {
  private appId: string;
  private appSecret: string;
  
  constructor() {
    const config = mediaAPIConfig.getInstagramConfig();
    this.appId = config.appId;
    this.appSecret = config.appSecret;
  }
  
  async getUserMedia(accessToken: string) {
    // 获取用户媒体内容
  }
  
  async filterLabubuContent(media: any[]) {
    // 过滤Labubu相关内容
  }
}
```

### API接口
```typescript
// src/app/api/admin/instagram-crawler/route.ts
export async function GET(request: NextRequest) {
  // 获取Instagram数据的API接口
}
```

---

## 🚨 常见问题

### Q1: 为什么不能搜索公开内容？
**A**: Instagram Basic Display API只能访问授权用户的内容，不支持公开内容搜索。如需搜索功能，需要使用Instagram Graph API（需要商业验证）。

### Q2: 如何获取更多用户的内容？
**A**: 
- 每个用户都需要单独授权
- 可以实现用户授权流程让用户主动授权
- 或者使用Instagram Graph API的商业功能

### Q3: 访问令牌多久过期？
**A**: 
- 短期令牌：1小时
- 长期令牌：60天
- 需要实现令牌刷新机制

### Q4: 如何通过应用审核？
**A**: 
- 提供详细的应用说明
- 说明数据使用目的和方式
- 提供隐私政策和用户条款
- 展示应用的实际功能

---

## 🔄 替代方案

### 方案1：Instagram Graph API
- 需要商业验证
- 支持更多功能
- 可以访问商业账号的公开内容

### 方案2：第三方数据服务
- Sprout Social API
- Hootsuite Insights
- Brand24 API

### 方案3：网页爬虫（需谨慎）
- 遵守robots.txt
- 控制请求频率
- 注意法律合规性

---

## ✅ 完成检查清单

- [ ] 创建Facebook开发者账号
- [ ] 创建新的Facebook应用
- [ ] 添加Instagram Basic Display产品
- [ ] 配置OAuth重定向URI
- [ ] 获取App ID和App Secret
- [ ] 添加Instagram测试用户
- [ ] 测试用户接受邀请
- [ ] 实现用户授权流程
- [ ] 测试API调用
- [ ] 提交应用审核（可选）
- [ ] 配置环境变量
- [ ] 集成到项目代码

---

## 📞 需要帮助？

如果遇到问题，请参考：

1. **官方文档**: [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
2. **开发者支持**: [Facebook Developer Community](https://developers.facebook.com/community/)
3. **API参考**: [Instagram Basic Display API Reference](https://developers.facebook.com/docs/instagram-basic-display-api/reference)

---

**最后更新**: 2024年12月22日
**状态**: 待申请 - 需要创建Facebook开发者应用 