"use client"

import React, { useEffect, useState } from "react"
import { Eye, ThumbsUp } from 'lucide-react'

interface Video {
  id: string
  video_id: string
  title: string
  thumbnail_url?: string
  iframe_embed_code: string
  channel_title?: string
  category_name?: string
  duration_seconds?: number
  view_count?: number
  like_count?: number
}

// 数字格式化（英文单位，保留一位小数）
function formatNumber(num?: number) {
  // 如果未定义直接返回空字符串
  if (num === undefined) return ''
  // 大于等于100万显示M
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  // 大于等于1000显示K
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  // 其余直接显示数字
  return num.toString()
}

export function VideoTabs() {
  const [tags, setTags] = useState<string[]>([])
  const [videosByTag, setVideosByTag] = useState<Record<string, Video[]>>({})
  const [loading, setLoading] = useState(false)

  // 获取所有标签
  async function fetchTags() {
    try {
      const res = await fetch(`/api/youtube/videos?limit=1`)
      const data = await res.json()
      setTags(['全部', ...(data.tags || [])])
    } catch (e) {
      setTags(['全部'])
      console.error('【前端】拉取标签出错：', e)
    }
  }

  // 获取某个标签下所有视频
  async function fetchVideosForTag(tag: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (tag && tag !== '全部') params.append('category', tag)
      const res = await fetch(`/api/youtube/videos?${params}`)
      const data = await res.json()
      setVideosByTag(prev => ({ ...prev, [tag]: data.videos || [] }))
    } catch (e) {
      setVideosByTag(prev => ({ ...prev, [tag]: [] }))
      console.error('【前端】拉取视频出错：', e)
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载所有标签和每个标签下的视频
  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    if (tags.length > 0) {
      tags.forEach(tag => {
        fetchVideosForTag(tag)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags])

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {tags.map((tag) => (
            <div key={tag} className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-gray-800">{tag}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading && (!videosByTag[tag] || videosByTag[tag].length === 0) ? (
                  <div className="col-span-4 text-center py-8 text-gray-400">加载中...</div>
                ) : (videosByTag[tag]?.length === 0 ? (
                  <div className="col-span-4 text-center py-8 text-gray-400">暂无视频</div>
                ) : (
                  videosByTag[tag]?.map((video) => (
                    <div
                      key={video.id}
                      className="flex flex-col rounded-xl border border-gray-100 shadow hover:shadow-md transition overflow-hidden bg-gray-50"
                    >
                      <div className="w-full aspect-[9/16] bg-black flex items-center justify-center">
                        <div
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{
                            __html: video.iframe_embed_code.replace('?', '?showinfo=0&modestbranding=1&rel=0&')
                          }}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="font-semibold text-base mb-1 line-clamp-2">{video.title}</div>
                        <div className="text-xs text-gray-500 mb-1">{video.channel_title}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye size={16} />{formatNumber(video.view_count)}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={16} />{formatNumber(video.like_count)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 