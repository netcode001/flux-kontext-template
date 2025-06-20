import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { r2Storage } from '@/lib/services/r2-storage'

// 支持的文件类型配置
const SUPPORTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  document: ['application/pdf', 'text/plain', 'application/json']
}

// 文件大小限制 (MB)
const SIZE_LIMITS = {
  image: 10,
  video: 100,
  audio: 50,
  document: 5
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 验证用户登录状态 - 防止未登录用户滥用存储
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: '请先登录后再上传文件'
      }, { status: 401 })
    }

    // 检查R2是否启用
    if (process.env.NEXT_PUBLIC_ENABLE_R2 !== 'true') {
      return NextResponse.json({
        success: false,
        error: 'R2存储服务未启用'
      }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const mediaType = formData.get('mediaType') as string || 'image'
    const purpose = formData.get('purpose') as string || 'general' // 用途：character, music, video, general

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '未选择文件'
      }, { status: 400 })
    }

    // 验证文件类型
    const supportedTypes = SUPPORTED_TYPES[mediaType as keyof typeof SUPPORTED_TYPES]
    if (!supportedTypes || !supportedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `不支持的${mediaType}文件类型: ${file.type}`
      }, { status: 400 })
    }

    // 验证文件大小
    const maxSize = SIZE_LIMITS[mediaType as keyof typeof SIZE_LIMITS] * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: `文件大小超过限制 (最大 ${SIZE_LIMITS[mediaType as keyof typeof SIZE_LIMITS]}MB)`
      }, { status: 400 })
    }

    // 生成文件路径
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `${purpose}_${timestamp}_${randomId}.${extension}`
    
    // 根据用途和媒体类型生成路径
    const filePath = `${mediaType}s/${purpose}/${fileName}`

    // 上传到R2
    console.log(`📤 Processing file upload: ${file.name} (${file.size} bytes, ${file.type})`);
    const uploadResult = await r2Storage.uploadFile(file);
    
    console.log(`✅ Upload completed successfully: ${uploadResult}`);

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult,
        key: filePath,
        filename: fileName,
        size: file.size,
        contentType: file.type,
        mediaType: mediaType,
        purpose: purpose
      }
    })

  } catch (error: unknown) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    )
  }
}

// 支持的HTTP方法
export async function GET() {
  return NextResponse.json({
    message: 'Upload API - 使用POST方法上传文件',
    supportedTypes: SUPPORTED_TYPES,
    sizeLimits: SIZE_LIMITS
  })
} 