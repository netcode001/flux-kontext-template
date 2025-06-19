import { NextRequest, NextResponse } from 'next/server';
import { FluxKontextService } from '@/lib/flux-kontext';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting FAL API test...');
    
    // 检查FAL配置
    console.log('🔍 Checking FAL configuration...');
    console.log('FAL_KEY exists:', !!process.env.FAL_KEY);
    console.log('FAL_KEY length:', process.env.FAL_KEY?.length || 0);
    console.log('FAL_KEY prefix:', process.env.FAL_KEY?.substring(0, 10) + '...');
    
    // 测试简单的文生图
    console.log('🎨 Testing text-to-image generation...');
    const testResult = await FluxKontextService.textToImagePro({
      prompt: 'a cute cat',
      num_images: 1,
      guidance_scale: 7.5,
      output_format: 'jpeg'
    });
    
    console.log('✅ FAL API test successful:', {
      hasResult: !!testResult,
      hasImages: !!testResult?.images,
      imageCount: testResult?.images?.length || 0,
      firstImageUrl: testResult?.images?.[0]?.url?.substring(0, 50) + '...'
    });
    
    return NextResponse.json({
      success: true,
      message: 'FAL API test successful',
      result: {
        hasImages: !!testResult?.images,
        imageCount: testResult?.images?.length || 0,
        images: testResult?.images?.map(img => ({
          url: img.url?.substring(0, 100) + '...',
          width: img.width,
          height: img.height
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ FAL API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 