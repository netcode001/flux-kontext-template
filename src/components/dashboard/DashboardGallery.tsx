"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Download, Info, Zap, Ratio, X } from 'lucide-react'

// 定义从页面传入的图片类型 - 确保与页面接口一致
interface Generation {
  id: string;
  user_id: string; // 添加缺失的user_id字段
  prompt: string;
  model: string;
  image_urls: string[];
  created_at: Date;
  credits_used: number; // 添加缺失的credits_used字段
  settings: {
    aspect_ratio?: string;
    guidance_scale?: number;
    num_images?: number;
    seed?: number;
    output_format?: string;
    safety_tolerance?: string;
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
                <div className="relative w-full h-0 pb-[100%] bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <Image
                    src={url}
                    alt={generation.prompt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="absolute inset-0 object-cover object-center transition-all duration-500 group-hover:scale-105"
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
        <DialogContent className="max-w-7xl w-full h-auto max-h-[90vh] bg-transparent border-none shadow-none p-0">
          <div className="flex flex-col md:flex-row h-full max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* 左侧：图片 */}
            <div className="relative md:h-full flex-shrink-0 flex items-center justify-center bg-black/50 md:w-auto w-full aspect-square md:aspect-auto">
              <Image
                src={selectedItem.url}
                alt={selectedItem.generation.prompt}
                width={1920}
                height={1080}
                className="object-contain h-full w-auto"
                priority
              />
            </div>

            {/* 右侧：信息面板 */}
            <div className="relative w-full md:w-[360px] flex-shrink-0 text-white p-6 flex flex-col">
               <DialogClose asChild>
                 <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full z-10">
                   <X className="h-5 w-5" />
                 </Button>
              </DialogClose>
              
              <h3 className="text-lg font-semibold mb-3">图片提示词</h3>

              <div className="flex-1 overflow-y-auto pr-3 -mr-3 space-y-3"> {/* Scrollable content */}
                <div className="bg-gray-800 p-3 rounded-lg min-h-[120px]">
                  <p className="text-sm text-gray-300 leading-normal break-words">
                    {selectedItem.generation.prompt}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2"><Info size={14} /> 生成日期</span>
                    <span className="text-sm text-gray-200">{new Date(selectedItem.generation.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2"><Zap size={14} /> 模型</span>
                    <span className="font-mono text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">{selectedItem.generation.model.replace('text-to-image-', '')}</span>
                  </div>
                  {selectedItem.generation.settings?.aspect_ratio && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2"><Ratio size={14} /> 比例</span>
                      <span className="font-mono text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">{selectedItem.generation.settings.aspect_ratio}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-gray-800">
                 <Button 
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-base" 
                   onClick={() => handleDownload(selectedItem.url)}>
                   <Download className="w-5 h-5 mr-2" />
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