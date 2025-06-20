"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, X, Plus, Tag, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface PostPublisherProps {
  onPublish?: (post: any) => void
  onCancel?: () => void
  generationData?: {
    imageUrls: string[]
    prompt: string
    model: string
  }
}

export function PostPublisher({ onPublish, onCancel, generationData }: PostPublisherProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  
  // 表单状态
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>(generationData?.imageUrls || [])
  const [tags, setTags] = useState<string[]>(['labubu'])
  const [newTag, setNewTag] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  
  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setImageUrls(prev => [...prev, data.url])
      } else {
        alert('图片上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      alert('图片上传失败')
    }
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
    if (!session) {
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
        onPublish?.(data.data)
        // 重置表单
        setTitle('')
        setContent('')
        setImageUrls([])
        setTags(['labubu'])
        alert('作品发布成功！')
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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-pink-600">
          <Upload className="w-5 h-5" />
          <span>发布Labubu作品</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 作品标题 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-700 font-medium">
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
        <div className="space-y-2">
          <Label htmlFor="content" className="text-gray-700 font-medium">
            作品描述
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的创作灵感和故事..."
            className="border-pink-200 focus:border-pink-400 min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 text-right">
            {content.length}/500
          </div>
        </div>

        {/* 图片上传区域 */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">
            作品图片 * {imageUrls.length > 0 && `(${imageUrls.length}/9)`}
          </Label>
          
          <div className="grid grid-cols-3 gap-4">
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
                  className="absolute top-2 right-2 w-6 h-6 p-0"
                  onClick={() => handleImageRemove(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {/* 上传按钮 */}
            {imageUrls.length < 9 && (
              <label className="aspect-square bg-pink-50 border-2 border-dashed border-pink-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors">
                <Plus className="w-6 h-6 text-pink-400 mb-2" />
                <span className="text-sm text-pink-600">添加图片</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* 标签管理 */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">
            作品标签
          </Label>
          
          {/* 已添加的标签 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                #{tag}
                {tag !== 'labubu' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 w-4 h-4 p-0 hover:bg-pink-300"
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
              className="flex-1 border-pink-200 focus:border-pink-400"
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
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Tag className="w-4 h-4 mr-1" />
              添加
            </Button>
          </div>
        </div>

        {/* 可见性设置 */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">
            可见性设置
          </Label>
          
          <div className="flex space-x-4">
            <Button
              variant={isPublic ? "default" : "outline"}
              onClick={() => setIsPublic(true)}
              className={`flex items-center space-x-2 ${
                isPublic ? 'bg-pink-500 hover:bg-pink-600' : 'border-pink-200 text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>公开</span>
            </Button>
            
            <Button
              variant={!isPublic ? "default" : "outline"}
              onClick={() => setIsPublic(false)}
              className={`flex items-center space-x-2 ${
                !isPublic ? 'bg-gray-500 hover:bg-gray-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>私密</span>
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            {isPublic ? '所有人都可以看到这个作品' : '只有你自己可以看到这个作品'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handlePublish}
            disabled={isLoading || !title.trim() || imageUrls.length === 0}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? '发布中...' : '发布作品'}
          </Button>
          
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              取消
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 