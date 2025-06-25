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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-2xl transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                      <Button size="icon" className="w-10 h-10 bg-white/80 rounded-full text-pink-600 hover:bg-white backdrop-blur-sm">
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button size="icon" className="w-10 h-10 bg-white/80 rounded-full text-purple-600 hover:bg-white backdrop-blur-sm">
                        <Maximize className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate" title={generation.prompt}>
                    {generation.prompt}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(generation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-gray-800" onClick={() => handleDownload(url)}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DialogContent className="max-w-4xl h-auto bg-transparent border-none shadow-none p-0">
        <div className="relative">
          <Image
            src={selectedImage || ''}
            alt="Selected creation"
            width={1024}
            height={1024}
            className="rounded-lg object-contain w-full h-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 