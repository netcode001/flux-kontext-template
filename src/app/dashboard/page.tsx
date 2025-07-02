import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Search } from 'lucide-react';
import { Navigation } from "@/components/Navigation";
import { Footer } from '@/components/Footer';
import { DashboardGallery } from '@/components/dashboard/DashboardGallery';

export const metadata: Metadata = {
  title: 'My Creations | Flux Kontext',
  description: 'View your gallery of AI-generated images.',
  robots: {
    index: false,
    follow: false,
  },
};

// 定义generation的类型，以便在组件中使用
interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  model: string;
  image_urls: string[];
  created_at: Date;
  credits_used: number;
  settings: {
    aspect_ratio?: string;
    guidance_scale?: number;
    num_images?: number;
    seed?: number;
    output_format?: string;
    safety_tolerance?: string;
  } | null;
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
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-page="dashboard">
        {/* 页面标题区域 - 采用Labubu设计风格 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
            My Creations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here are all your AI-generated masterpieces. Revisit, share, or continue your creative journey anytime.
          </p>
        </div>

        {userGenerations.length === 0 ? (
          // 空状态 - 采用Labubu设计风格的卡片
          <div className="bg-white rounded-3xl p-8  border border-gray-100 text-center max-w-lg mx-auto">
            <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-5xl">🖼️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Creations Yet</h3>
            <p className="text-gray-600 text-sm mb-6">
              Your gallery is empty. Start now and turn your ideas into reality!
            </p>
            <Link href="/generate">
              <Button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                Go to Generator
              </Button>
            </Link>
          </div>
        ) : (
          // 画廊网格 - 使用新的客户端组件
          <DashboardGallery generations={userGenerations as Generation[]} />
        )}
      </main>
      <Footer />
    </>
  );
}
