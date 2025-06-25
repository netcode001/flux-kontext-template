"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Download, Heart, Maximize, X } from 'lucide-react'

// 定义从页面传入的图片类型
interface Generation {
  id: string;
  prompt: string;
  model: string;
  image_urls: string[];
  created_at: Date;
  settings: {
    aspect_ratio?: string;
  } | null;
}

interface DashboardGalleryProps {
  generations: Generation[];
}

export function DashboardGallery({ generations }: DashboardGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 安全下载函数
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(imageUrl)}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // 从URL中提取文件名或生成一个
      const fileName = imageUrl.split('/').pop() || `labubuhub-${Date.now()}.png`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // 这里可以添加用户提示，例如使用 react-hot-toast
    }
  };
  
  return (
    <Dialog open={!!selectedImage} onOpenChange={(isOpen: boolean) => !isOpen && setSelectedImage(null)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {generations.map((generation) =>
          generation.image_urls.map(url => (
            <div key={url} className="relative group cursor-pointer">
              <DialogTrigger asChild onClick={() => setSelectedImage(url)}>
                <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <Image
                    src={url}
                    alt={generation.prompt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-all duration-500 group-hover:scale-105"
                  />
                </div>
              </DialogTrigger>
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-800 truncate" title={generation.prompt}>
                  {generation.prompt}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>🗓️ {new Date(generation.created_at).toLocaleDateString()}</span>
                  <span>﹒</span>
                  <span>🤖 {generation.model.replace('text-to-image-', '')}</span>
                  {generation.settings?.aspect_ratio && (
                    <>
                      <span>﹒</span>
                      <span>📏 {generation.settings.aspect_ratio}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-gray-800 h-8 w-8" onClick={() => handleDownload(url)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DialogContent className="w-auto max-w-[90vw] h-auto max-h-[90vh] bg-transparent border-none shadow-none p-0 flex items-center justify-center">
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Selected creation"
            width={1920}
            height={1080}
            className="rounded-lg object-contain w-auto h-auto max-w-full max-h-[90vh]"
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 