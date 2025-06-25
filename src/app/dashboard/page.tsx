import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'My Creations | Flux Kontext',
  description: 'View your gallery of AI-generated images.',
  robots: {
    index: false, // 用户个人页面不希望被索引
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            My Creations
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Here are the images you have generated.
          </p>
        </div>
        <Link href="/generate">
          <Button>Create More</Button>
        </Link>
      </div>

      {userGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <div className="mb-4 text-2xl">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            No creations yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't generated any images. Start creating now!
          </p>
          <Link href="/generate" className="mt-6">
            <Button>Go to Generator</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {userGenerations.map((generation: Generation) =>
            generation.image_urls.map(url => (
              <div key={url} className="group relative">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                  <Image
                    src={url}
                    alt={generation.prompt}
                    fill
                    className="object-cover object-center transition-opacity duration-300 group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20" />
                </div>
                <p className="mt-2 block truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {generation.prompt}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(generation.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
