import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1. 验证用户是否登录
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. 从URL参数中获取图片URL
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    // 3. 在服务器端获取图片
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const headers = new Headers();
    
    // 4. 设置正确的响应头，触发下载
    headers.set('Content-Type', imageBlob.type);
    const fileName = imageUrl.split('/').pop() || 'download.png';
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(imageBlob, { status: 200, headers });

  } catch (error) {
    console.error('[DOWNLOAD_API_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 