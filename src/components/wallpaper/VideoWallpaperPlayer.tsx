'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Download, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Wallpaper, MediaPlayerProps } from '@/types/wallpaper'

interface VideoWallpaperPlayerProps extends MediaPlayerProps {
  className?: string
  showControls?: boolean
  showDownloadButton?: boolean
  onDownload?: () => void
}

export function VideoWallpaperPlayer({
  wallpaper,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = false,
  preload = 'metadata',
  className = '',
  showControls = true,
  showDownloadButton = false,
  onLoadStart,
  onLoadedData,
  onError,
  onEnded,
  onDownload
}: VideoWallpaperPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // 🎬 播放/暂停控制
  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 🔊 静音控制
  const toggleMute = () => {
    if (!videoRef.current) return
    
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // 🖥️ 全屏控制
  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // 📊 进度条控制
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // 🎯 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 📱 视频事件处理
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => {
      setIsLoading(true)
      onLoadStart?.()
    }

    const handleLoadedData = () => {
      setIsLoading(false)
      setDuration(video.duration)
      onLoadedData?.()
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleError = (e: any) => {
      setHasError(true)
      setIsLoading(false)
      onError?.(e)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // 📝 添加事件监听器
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // 🧹 清理事件监听器
    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onLoadStart, onLoadedData, onError, onEnded])

  // 🚨 错误状态显示
  if (hasError) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">❌</div>
          <p className="text-gray-600 dark:text-gray-400">视频加载失败</p>
          <p className="text-sm text-gray-500 mt-1">{wallpaper.title}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {/* 🎬 视频元素 */}
      <video
        ref={videoRef}
        src={wallpaper.video_url}
        poster={wallpaper.thumbnail_url}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        preload={preload}
        className="w-full h-full object-cover rounded-lg"
        playsInline
      />

      {/* 🔄 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      )}

      {/* 🎮 自定义控制栏 */}
      {showControls && !controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 📊 进度条 */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* 🎮 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* 播放/暂停 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              {/* 音量控制 */}
              {wallpaper.has_audio && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              )}

              {/* 时间显示 */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* 下载按钮 */}
              {showDownloadButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}

              {/* 全屏按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 移动端点击播放覆盖层 */}
      {!isPlaying && !isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer md:hidden"
          onClick={togglePlay}
        >
          <div className="bg-black/50 rounded-full p-4">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      )}

      {/* 🏷️ 视频信息标签 */}
      <div className="absolute top-2 left-2 flex space-x-1">
        {wallpaper.is_premium && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Premium
          </span>
        )}
        {wallpaper.is_featured && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            精选
          </span>
        )}
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {wallpaper.duration}s
        </span>
        {wallpaper.has_audio && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
            🔊
          </span>
        )}
      </div>
    </div>
  )
} 