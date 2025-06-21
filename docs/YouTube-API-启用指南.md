# 🎥 YouTube Data API v3 启用指南

## ✅ 当前状态
- **API密钥**: `AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo` ✅ 已提供
- **API服务**: ✅ YouTube Data API v3 已启用并正常工作
- **测试结果**: ✅ 成功获取5个Labubu相关视频
- **配额状态**: ✅ 剩余9899配额 (已使用101配额)

---

## 🔧 解决步骤

### 第1步：访问Google Cloud Console
1. 打开浏览器，访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 使用与API密钥关联的Google账号登录
3. 确保选择了正确的项目 (Project ID: `444976776839`)

### 第2步：启用YouTube Data API v3
1. 点击错误信息中的链接：
   ```
   https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=444976776839
   ```
   
2. 或者手动导航：
   - 在左侧菜单中选择 "APIs & Services" > "Library"
   - 搜索 "YouTube Data API v3"
   - 点击搜索结果中的 "YouTube Data API v3"
   - 点击 "ENABLE" 按钮

### 第3步：等待服务生效
- ⏰ **等待时间**: 启用后需要等待2-5分钟让服务生效
- 🔄 **传播延迟**: Google系统需要时间传播更改

### 第4步：验证API权限
1. 确保API密钥有正确的权限：
   - 在 Google Cloud Console 中
   - 转到 "APIs & Services" > "Credentials"
   - 找到你的API密钥
   - 点击编辑（铅笔图标）
   - 在 "API restrictions" 部分
   - 确保 "YouTube Data API v3" 被选中

---

## 🧪 测试验证

### 方法1：使用我们的测试脚本
```bash
# 等待5分钟后运行
node scripts/test-youtube-api.js
```

### 方法2：直接浏览器测试
访问以下URL（替换YOUR_API_KEY为实际密钥）：
```
https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=YOUR_API_KEY
```

### 方法3：使用curl命令
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=Labubu&maxResults=1&key=AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo"
```

---

## 📊 配额管理

### 默认配额限制
- **每日配额**: 10,000 单位
- **搜索操作**: 100 单位/次
- **视频详情**: 1 单位/次
- **频道信息**: 1 单位/次

### 配额使用计算
```
每日可执行操作：
- 搜索: 10,000 ÷ 100 = 100次搜索
- 视频详情: 10,000次获取
- 混合使用: 50次搜索 + 5,000次视频详情
```

### 配额监控
1. 在 Google Cloud Console 中
2. 转到 "APIs & Services" > "Quotas"
3. 搜索 "YouTube Data API v3"
4. 监控使用情况

---

## 🔒 安全配置

### API密钥限制建议
1. **应用程序限制**:
   - HTTP referrers: 添加你的域名
   - IP addresses: 限制服务器IP（可选）

2. **API限制**:
   - 只启用 YouTube Data API v3
   - 不要启用不必要的其他API

### 环境变量配置
将API密钥添加到环境变量中：

#### .env 文件
```env
# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo
```

#### Next.js 配置
```typescript
// 在 src/lib/services/media-api-config.ts 中已配置
const youtubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY || 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo',
  quota: {
    daily: 10000,
    searchCost: 100,
    videoCost: 1,
  },
};
```

---

## 🎯 Labubu内容获取示例

### 搜索Labubu视频
```javascript
const searchParams = {
  part: 'snippet',
  q: 'Labubu 拉布布 泡泡玛特',
  maxResults: 10,
  order: 'relevance',
  type: 'video',
  publishedAfter: '2024-01-01T00:00:00Z',
  key: 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo'
};
```

### 获取视频统计
```javascript
const videoParams = {
  part: 'snippet,statistics,contentDetails',
  id: 'VIDEO_ID',
  key: 'AIzaSyBJoYM69KK0l4f2agtuEn_Pt9958jxC6Zo'
};
```

---

## 🚨 常见问题

### Q1: 启用后仍然报错怎么办？
**A**: 等待5-10分钟，Google系统需要时间传播更改。

### Q2: 配额用完了怎么办？
**A**: 
- 等到第二天重置（太平洋时间午夜）
- 或者申请配额增加
- 或者付费使用超出部分

### Q3: API密钥不工作怎么办？
**A**: 
- 检查API密钥是否正确复制
- 确认API限制设置
- 验证项目权限

### Q4: 如何申请更高配额？
**A**: 
- 在 Google Cloud Console 中
- 转到 "APIs & Services" > "Quotas"
- 找到 YouTube Data API v3
- 点击 "EDIT QUOTAS" 申请增加

---

## 📈 集成到项目

### 第1步：安装依赖
```bash
npm install google-api-python-client
# 或者使用Python
pip install google-api-python-client
```

### 第2步：创建YouTube服务类
```typescript
// src/lib/services/youtube-service.ts
import { mediaAPIConfig } from './media-api-config';

export class YouTubeService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = mediaAPIConfig.getYouTubeConfig().apiKey;
  }
  
  async searchVideos(query: string, maxResults: number = 10) {
    // 实现搜索逻辑
  }
  
  async getVideoDetails(videoId: string) {
    // 实现视频详情获取
  }
}
```

### 第3步：集成到内容引擎
```typescript
// 在现有的内容引擎中添加YouTube数据源
const youtubeService = new YouTubeService();
const labubuVideos = await youtubeService.searchVideos('Labubu 拉布布');
```

---

## ✅ 完成检查清单

- [ ] 访问Google Cloud Console
- [ ] 启用YouTube Data API v3服务
- [ ] 等待5分钟让服务生效
- [ ] 运行测试脚本验证
- [ ] 配置API密钥限制
- [ ] 添加到环境变量
- [ ] 集成到项目代码
- [ ] 设置配额监控

---

## 📞 需要帮助？

如果按照以上步骤仍然遇到问题，请：

1. **检查错误日志**: 运行测试脚本查看详细错误信息
2. **验证账号权限**: 确保Google账号有项目管理权限
3. **联系支持**: [Google Cloud Support](https://cloud.google.com/support)

---

**最后更新**: 2024年12月22日
**状态**: 等待用户启用YouTube Data API v3服务 