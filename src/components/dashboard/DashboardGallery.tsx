"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Download, Info, Zap, Ratio } from 'lucide-react'

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
  // 状态现在保存整个生成对象和被点击的URL
  const [selectedItem, setSelectedItem] = useState<{ generation: Generation; url: string } | null>(null);

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
      const fileName = imageUrl.split('/').pop() || `labubuhub-${Date.now()}.png`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  return (
    <Dialog open={!!selectedItem} onOpenChange={(isOpen: boolean) => !isOpen && setSelectedItem(null)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {generations.map((generation) =>
          generation.image_urls.map(url => (
            <div key={url} className="relative group">
              <DialogTrigger asChild onClick={() => setSelectedItem({ generation, url })}>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <Image
                    src={url}
                    alt={generation.prompt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button size="icon" variant="ghost" className="text-white bg-black/20 hover:bg-black/40 hover:text-white h-8 w-8 backdrop-blur-sm rounded-full" onClick={(e) => {e.stopPropagation(); handleDownload(url)}}>
                       <Download className="w-4 h-4" />
                     </Button>
                  </div>
                </div>
              </DialogTrigger>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 gap-0 bg-background border-border flex items-start">
          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* 左侧：图片 */}
            <div className="relative w-full md:w-auto md:h-full flex-shrink-0 flex items-center justify-center bg-black/90">
              <Image
                src={selectedItem.url}
                alt={selectedItem.generation.prompt}
                width={1920}
                height={1080}
                className="object-contain w-auto h-auto max-w-full max-h-[90vh]"
              />
            </div>

            {/* 右侧：信息 */}
            <div className="w-full md:w-[320px] flex-shrink-0 p-6 space-y-4 overflow-y-auto">
              <h3 className="text-lg font-semibold">图片提示词</h3>
              <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                {selectedItem.generation.prompt}
              </p>
              
              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Info size={14} /> 生成日期</span>
                  <span>{new Date(selectedItem.generation.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Zap size={14} /> 模型</span>
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{selectedItem.generation.model.replace('text-to-image-', '')}</span>
                </div>
                {selectedItem.generation.settings?.aspect_ratio && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Ratio size={14} /> 比例</span>
                    <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{selectedItem.generation.settings.aspect_ratio}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-3">
                 <Button className="w-full" onClick={() => handleDownload(selectedItem.url)}>
                   <Download className="w-4 h-4 mr-2" />
                   下载图片
                 </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
} 