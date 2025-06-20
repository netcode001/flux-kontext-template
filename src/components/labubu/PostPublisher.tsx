"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, X, Plus, Tag, Globe, Lock, Loader2, XIcon } from 'lucide-react'
// 🔧 使用统一的认证状态管理Hook
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface PostPublisherProps {
  onPublish?: (post: any) => void
  onCancel?: () => void
  generationData?: {
    imageUrls: string[]
    prompt: string
    model: string
  }
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function PostPublisher({ onPublish, onCancel, generationData }: PostPublisherProps) {
  // 🔧 使用统一的认证状态管理，提供更准确的session状态
  const { isLoading: authLoading, isAuthenticated, isUnauthenticated, session } = useAuthStatus()
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // 表单状态
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>(generationData?.imageUrls || [])
  const [tags, setTags] = useState<string[]>(['labubu'])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  
  // 上传进度状态
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>([])

  // 🔧 点击弹窗外部区域关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel?.()
      }
    }

    // 🔧 ESC键关闭
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onCancel])

  // 🔧 多文件上传处理
  const handleMultipleImagesUpload = async (files: FileList) => {
    // 🔐 首先检查登录状态，防止未登录用户上传到R2存储
    if (!isAuthenticated) {
      alert('请先登录后再上传图片')
      return
    }

    const validFiles = Array.from(files).filter(file => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} 不是有效的图片文件`)
        return false
      }
      // 检查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} 文件过大，请选择小于10MB的图片`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // 检查总数量限制
    if (imageUrls.length + validFiles.length > 9) {
      alert(`最多只能上传9张图片，当前已有${imageUrls.length}张`)
      return
    }

    // 初始化上传进度
    const initialProgresses: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))
    
    setUploadProgresses(prev => [...prev, ...initialProgresses])

    // 并发上传所有文件
    const uploadPromises = validFiles.map(async (file, index) => {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 更新进度为成功
          setUploadProgresses(prev => prev.map(item => 
            item.file === file 
              ? { ...item, progress: 100, status: 'success', url: data.data.url }
              : item
          ))
          
          // 添加到图片列表
          setImageUrls(prev => [...prev, data.data.url])
          
        } else {
          // 更新进度为失败
          setUploadProgresses(prev => prev.map(item => 
            item.file === file 
              ? { ...item, status: 'error', error: data.error || '上传失败' }
              : item
          ))
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        setUploadProgresses(prev => prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error', error: '网络错误' }
            : item
        ))
      }
    })

    // 等待所有上传完成后清理进度状态
    await Promise.all(uploadPromises)
    setTimeout(() => {
      setUploadProgresses(prev => prev.filter(item => item.status === 'uploading'))
    }, 2000)
  }
  
  // 处理图片删除
  const handleImageRemove = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }
  
  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }
  
  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    if (tagToRemove !== 'labubu') { // 保留 labubu 标签
      setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }
  }
  
  // 发布作品
  const handlePublish = async () => {
    if (!isAuthenticated) {
      alert('请先登录')
      return
    }
    
    if (!title.trim()) {
      alert('请输入作品标题')
      return
    }
    
    if (imageUrls.length === 0) {
      alert('请至少上传一张图片')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/labubu/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || undefined,
          imageUrls,
          prompt: generationData?.prompt,
          model: generationData?.model,
          tags,
          isPublic
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重置表单
        setTitle('')
        setContent('')
        setImageUrls([])
        setTags(['labubu'])
        
        // 通知父组件发布成功，传递新帖子数据
        onPublish?.(data.data)
        
        // 自动关闭发布窗口
        onCancel?.()
      } else {
        alert(data.error || '发布失败')
      }
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔧 优化认证状态处理
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">正在验证登录状态...</h3>
            <p className="text-gray-600">请稍候，正在确认您的登录状态</p>
          </div>
        </div>
      </div>
    )
  }

  // 🔐 如果用户未登录，显示登录提示
  if (isUnauthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl">
          {/* 关闭按钮 */}
          <div className="flex justify-end p-4 pb-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="px-6 pb-6 text-center">
            <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
            <p className="text-gray-600 mb-6">登录后即可发布你的Labubu作品，与社区成员分享创意</p>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-pink-500 hover:bg-pink-600 w-full"
              >
                立即登录
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/auth/signup'}
                className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full"
              >
                注册账号
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div ref={modalRef} className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl my-8">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-pink-600">
            <Upload className="w-5 h-5" />
            <h2 className="text-lg font-semibold">发布Labubu作品</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 作品标题 */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-gray-700 font-medium text-sm">
              作品标题 *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的Labubu作品起个名字..."
              className="border-pink-200 focus:border-pink-400"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 text-right">
              {title.length}/100
            </div>
          </div>

          {/* 作品描述 */}
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-gray-700 font-medium text-sm">
              作品描述
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的创作灵感和故事..."
              className="border-pink-200 focus:border-pink-400 h-20 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {content.length}/500
            </div>
          </div>

          {/* 图片上传区域 */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-medium text-sm">
              作品图片 * {imageUrls.length > 0 && `(${imageUrls.length}/9)`}
            </Label>
            
            {/* 上传进度显示 */}
            {uploadProgresses.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">上传进度</h4>
                {uploadProgresses.map((progress, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-48">{progress.file.name}</span>
                      <span className={`font-medium ${
                        progress.status === 'success' ? 'text-green-600' : 
                        progress.status === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {progress.status === 'success' ? '完成' : 
                         progress.status === 'error' ? '失败' : '上传中...'}
                      </span>
                    </div>
                    {progress.status === 'uploading' && (
                      <Progress value={progress.progress} className="h-1" />
                    )}
                    {progress.status === 'error' && progress.error && (
                      <p className="text-xs text-red-500">{progress.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              {/* 已上传的图片 */}
              {imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`作品图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-5 h-5 p-0 rounded-full"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {/* 上传按钮 */}
              {imageUrls.length < 9 && (
                <label className="aspect-square bg-pink-50 border-2 border-dashed border-pink-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors">
                  <Plus className="w-5 h-5 text-pink-400 mb-1" />
                  <span className="text-xs text-pink-600">添加图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleImagesUpload(e.target.files)
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 标签管理 */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-medium text-sm">
              作品标签
            </Label>
            
            {/* 已添加的标签 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs">
                  #{tag}
                  {tag !== 'labubu' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 w-3 h-3 p-0 hover:bg-pink-300"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            
            {/* 添加新标签 */}
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签..."
                className="flex-1 border-pink-200 focus:border-pink-400 h-8 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={20}
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                className="border-pink-200 text-pink-600 hover:bg-pink-50 h-8 px-3 text-sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                添加
              </Button>
            </div>
          </div>

          {/* 可见性设置 */}
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-medium text-sm">
              可见性设置
            </Label>
            
            <div className="flex space-x-3">
              <Button
                variant={isPublic ? "default" : "outline"}
                onClick={() => setIsPublic(true)}
                className={`flex items-center space-x-1.5 h-8 px-3 text-sm ${
                  isPublic ? 'bg-pink-500 hover:bg-pink-600' : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>公开</span>
              </Button>
              
              <Button
                variant={!isPublic ? "default" : "outline"}
                onClick={() => setIsPublic(false)}
                className={`flex items-center space-x-1.5 h-8 px-3 text-sm ${
                  !isPublic ? 'bg-gray-500 hover:bg-gray-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>私密</span>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              {isPublic ? '所有人都可以看到这个作品' : '只有你自己可以看到这个作品'}
            </p>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex space-x-3 p-6 pt-4 border-t border-gray-100">
          <Button
            onClick={handlePublish}
            disabled={isLoading || !title.trim() || imageUrls.length === 0 || uploadProgresses.some(p => p.status === 'uploading')}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                发布中...
              </>
            ) : (
              '发布作品'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 h-10 px-6"
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  )
} 