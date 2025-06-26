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