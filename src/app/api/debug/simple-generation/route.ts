import { NextRequest, NextResponse } from 'next/server';
import { FluxKontextService } from '@/lib/flux-kontext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple generation test starting...');
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log('✅ User authenticated:', session.user.email);
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    // 简单调用FAL API
    console.log('🎨 Calling FluxKontextService.textToImagePro...');
    const result = await FluxKontextService.textToImagePro({
      prompt: body.prompt || 'a cute cat',
      num_images: 1,
      guidance_scale: 7.5,
      output_format: 'jpeg'
    });
    
    console.log('✅ FAL API call successful:', {
      hasResult: !!result,
      hasImages: !!result?.images,
      imageCount: result?.images?.length || 0
    });
    
    if (!result || !result.images || result.images.length === 0) {
      console.error('❌ No images generated');
      return NextResponse.json({
        success: false,
        error: 'No images generated'
      }, { status: 500 });
    }
    
    console.log('🎉 Returning successful response');
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Simple generation test successful'
    });
    
  } catch (error) {
    console.error('❌ Simple generation test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 