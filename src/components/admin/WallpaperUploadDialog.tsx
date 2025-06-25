"use client"

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UploadCloud } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

interface WallpaperUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
}

export function WallpaperUploadDialog({ open, onOpenChange, onUploadSuccess }: WallpaperUploadDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const currentFile = acceptedFiles[0]
      setFile(currentFile)
      if (preview) URL.revokeObjectURL(preview)
      if (currentFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(currentFile))
      } else {
        setPreview(null)
      }
      setError(null)
    }
  }, [preview])

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'], 'video/*': ['.mp4', '.webm'] },
    multiple: false,
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTags('')
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setUploading(false)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file || !title) {
      setError('必须提供文件和标题。')
      return
    }
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const mediaType = file.type.startsWith('video') ? 'video' : 'image'
      formData.append('mediaType', mediaType)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadResult = await uploadResponse.json()
      
      if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data?.url) {
        throw new Error(uploadResult.error || uploadResult.message || '文件上传到存储时失败')
      }
      
      const fileUrl = uploadResult.data.url

      const wallpaperData = {
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        media_type: mediaType,
        image_url: mediaType === 'image' ? fileUrl : undefined,
        video_url: mediaType === 'video' ? fileUrl : undefined,
        thumbnail_url: mediaType === 'image' ? fileUrl : undefined, // 视频缩略图需要后端生成
        original_filename: file.name,
        file_size: file.size,
      }

      const apiResponse = await fetch('/api/admin/wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallpaperData),
      })
      const apiResult = await apiResponse.json()

      if (!apiResponse.ok || !apiResult.success) {
        throw new Error(apiResult.error || '壁纸信息保存到数据库失败')
      }

      resetForm()
      onUploadSuccess()
      onOpenChange(false)
      
    } catch (err: any) {
      console.error('上传完整流程出错:', err)
      setError(err.message || '上传过程中发生未知错误。')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>上传新壁纸</DialogTitle>
          <DialogDescription>
            拖拽或选择一个图片/视频文件，并填写相关信息。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div {...getRootProps()} className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>
            <input {...getInputProps()} />
            {preview && file?.type.startsWith('image/') ? (
                <Image src={preview} alt={`预览 ${file.name}`} fill className="object-contain rounded-lg p-2" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                <UploadCloud className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400"/>
                {file ? (
                  <p className="font-semibold text-gray-700 dark:text-gray-200">已选择视频: {file.name}</p>
                ) : isDragActive ? (
                  <p className="text-blue-600 font-semibold">松开即可上传!</p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">点击上传</span> 或拖拽文件</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">支持图片和短视频</p>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-right">标题 (必填)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：林间的小兔子" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="关于这张壁纸的简短说明" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">标签 (用逗号分隔)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例如: 动物, 可爱, 森林" />
          </div>
          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>取消</Button>
          <Button type="submit" onClick={handleSubmit} disabled={uploading || !file}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? '上传中...' : '确认并上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 