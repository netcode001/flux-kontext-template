import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: '我的创作 | Flux Kontext',
  description: '查看您使用 AI 生成的图像画廊。',
  robots: {
    index: false,
    follow: false,
  },
};

// 定义generation的类型，以便在组件中使用
interface Generation {
  id: string;
  prompt: string;
  model: string;
  image_urls: string[];
  created_at: Date;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  const userGenerations = await prisma.generations.findMany({
    where: {
      user_id: session.user.id,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 100, // 最多获取最近100条记录
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 页面标题区域 - 采用Labubu设计风格 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
          我的创作
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          这里是您所有 AI 生成的杰作。随时回顾、分享或继续您的创作之旅。
        </p>
      </div>

      {userGenerations.length === 0 ? (
        // 空状态 - 采用Labubu设计风格的卡片
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center max-w-lg mx-auto">
          <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-5xl">🖼️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">尚未开始创作</h3>
          <p className="text-gray-600 text-sm mb-6">
            您的画廊还是空的。立即开始，将您的想法变为现实！
          </p>
          <Link href="/generate">
            <Button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
              前往生成器
            </Button>
          </Link>
        </div>
      ) : (
        // 画廊网格 - 采用Labubu设计风格
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userGenerations.map((generation: Generation) =>
            generation.image_urls.map(url => (
              <div key={url} className="relative group cursor-pointer">
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
                        <Search className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-800 truncate" title={generation.prompt}>
                    {generation.prompt}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(generation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
