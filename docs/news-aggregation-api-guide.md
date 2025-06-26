# 新闻API聚合接入与使用说明（GNews + Mediastack）

## 1. 方案简介
本方案通过集成 GNews 和 Mediastack 两大新闻聚合API，实现按关键字聚合新闻内容，丰富新闻页面展示。适用于内容聚合、热点追踪、主题检索等场景。

---

## 2. API Key 配置
- **GNews API Key**：`dddd37ee49e8bbf0f16d4adba11bf849`
- **Mediastack API Key**：`1df96ab10056038c89e92b8958ad46de`

> 建议生产环境将API Key存放在`.env`环境变量中，避免泄露。

---

## 3. 后端实现

### 3.1 新建聚合服务
路径：`src/lib/services/news-aggregator.ts`

```typescript
const GNEWS_API_KEY = 'dddd37ee49e8bbf0f16d4adba11bf849'
const MEDIASTACK_API_KEY = '1df96ab10056038c89e92b8958ad46de'

// GNews 按关键字搜索
export async function fetchGNews(keyword: string) {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&lang=zh,en&token=${GNEWS_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  return data.articles || []
}

// Mediastack 按关键字搜索
export async function fetchMediastack(keyword: string) {
  const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&keywords=${encodeURIComponent(keyword)}&languages=zh,en`
  const res = await fetch(url)
  const data = await res.json()
  return data.data || []
}

// 聚合所有API结果
export async function fetchAllNews(keyword: string) {
  const [gnews, mediastack] = await Promise.all([
    fetchGNews(keyword),
    fetchMediastack(keyword)
  ])
  // 可做去重、合并、排序
  return [...gnews, ...mediastack]
}
```

### 3.2 新建后端API路由
路径：`src/app/api/news/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { fetchAllNews } from '@/lib/services/news-aggregator'

// GET /api/news/search?keyword=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') || ''
  if (!keyword) {
    return NextResponse.json({ success: false, error: 'Missing keyword' }, { status: 400 })
  }
  try {
    const articles = await fetchAllNews(keyword)
    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
```

---

## 4. 前端调用示例

```typescript
// 直接请求 /api/news/search?keyword=xxx
const res = await fetch(`/api/news/search?keyword=labubu`)
const data = await res.json()
if (data.success) {
  // data.data 为新闻数组
}
```

---

## 5. 注意事项
- 免费版API有请求频率和条数限制，建议做缓存或限流。
- 建议将API Key放入环境变量，避免泄露。
- 可根据实际需求对返回结果做去重、排序、标签化等处理。
- 如需扩展更多API，可在`news-aggregator.ts`中继续添加。

---

## 6. 参考链接
- [GNews官方文档](https://gnews.io/docs/)
- [Mediastack官方文档](https://mediastack.com/documentation) 