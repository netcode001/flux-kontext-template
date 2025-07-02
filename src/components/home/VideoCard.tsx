"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, ThumbsUp, PlayCircle } from 'lucide-react'

// 视频类型定义
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

// 数字格式化
function formatNumber(num?: number) {
  if (num === undefined) return ''
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function VideoCard() {
  // 视频数据和标签状态
  const [videos, setVideos] = useState<Video[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string>("全部")
  const [loading, setLoading] = useState(false)

  // 获取视频和标签
  async function fetchVideos(tag: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "6" })
      if (tag && tag !== "全部") params.append("category", tag)
      const res = await fetch(`/api/youtube/videos?${params}`)
      const data = await res.json()
      setVideos(data.videos || [])
      setTags(["全部", ...(data.tags || [])])
    } catch (e) {
      setVideos([])
      // 保留错误日志用于调试
      console.error("【前端】拉取视频出错：", e)
    } finally {
      setLoading(false)
    }
  }

  // 首次加载和切换标签时获取数据
  useEffect(() => {
    fetchVideos(activeTag)
  }, [activeTag])

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 外层大卡片包裹视频区 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative">
          {/* 顶部播放器logo和标题 */}
          <div className="flex items-center mb-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-7 h-7 text-red-500" fill="#ef4444" />
              <span className="text-xl font-bold text-gray-800">热门视频</span>
            </div>
            {/* 查看更多按钮右上角 */}
            <div className="ml-auto">
              <Link
                href="/videos"
                className="inline-block px-6 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition shadow"
              >
                查看更多
              </Link>
            </div>
          </div>

          {/* 标签栏放到大卡片内部 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`px-4 py-1 rounded-full border text-sm font-medium transition-colors ${
                  tag === activeTag
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-red-500 border-red-200 hover:bg-red-50"
                }`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 视频列表区，3列布局，区域放大 */}
          <div className="grid grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center py-8 text-gray-400">加载中...</div>
            ) : videos.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-400">暂无视频</div>
            ) : (
              videos.slice(0, 3).map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col rounded-xl border border-gray-100 shadow hover:shadow-md transition overflow-hidden bg-gray-50"
                >
                  {/* 视频区域高度加大，aspect-[16/7] */}
                  <div className="w-full aspect-[16/7] bg-black flex items-center justify-center">
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: video.iframe_embed_code }}
                    />
                  </div>
                  {/* 视频信息 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="font-semibold text-base mb-1 line-clamp-2">{video.title}</div>
                    {/* 频道、观看量、点赞数同一行，不换行 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{video.channel_title}</span>
                      <span className="flex items-center gap-1"><Eye size={16} />{formatNumber(video.view_count)}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={16} />{formatNumber(video.like_count)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 