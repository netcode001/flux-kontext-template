import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// R2存储配置接口
interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

// 并发控制队列 - 增强版本
class ConcurrencyQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0
  private maxConcurrency = 1 // R2限制每个对象名每秒1次写入

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return
    }

    this.running++
    const task = this.queue.shift()!
    
    try {
      await task()
    } catch (error) {
      console.error('Task failed:', error)
    } finally {
      this.running--
      // 增加延迟以避免R2的并发限制
      setTimeout(() => {
        this.process()
      }, 1500) // 增加到1.5秒
    }
  }
}

// 全局并发控制队列
const uploadQueue = new ConcurrencyQueue()

// 增强的重试机制
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 2000 // 增加基础延迟
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message)
      
      // 如果是429错误（Too Many Requests），增加延迟
      if (error.name === 'TooManyRequestsException' || error.$metadata?.httpStatusCode === 429) {
        const delay = baseDelay * Math.pow(2, attempt) // 指数退避
        console.warn(`R2 rate limit hit, retrying in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // 其他错误也重试，但延迟较短
      if (attempt < maxRetries) {
        const delay = baseDelay + (1000 * attempt)
        console.warn(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  throw lastError!
}

// 图片Content-Type检测函数
function detectImageContentType(buffer: Uint8Array): string {
  // 检查文件头来确定图片类型
  if (buffer.length < 4) return 'image/jpeg' // 默认值
  
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png'
  }
  
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg'
  }
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length > 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp'
  }
  
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return 'image/gif'
  }
  
  return 'image/jpeg' // 默认值
}

// 验证图片完整性
function validateImageBuffer(buffer: Uint8Array, contentType: string): boolean {
  if (buffer.length === 0) {
    console.error('Image buffer is empty')
    return false
  }
  
  // 检查最小文件大小（至少1KB）
  if (buffer.length < 1024) {
    console.warn('Image buffer is suspiciously small:', buffer.length, 'bytes')
    return false
  }
  
  // 根据类型检查文件完整性
  if (contentType === 'image/jpeg') {
    // JPEG应该以FF D8开头，FF D9结尾
    if (!(buffer[0] === 0xFF && buffer[1] === 0xD8)) {
      console.error('Invalid JPEG header')
      return false
    }
    if (buffer.length > 2 && !(buffer[buffer.length - 2] === 0xFF && buffer[buffer.length - 1] === 0xD9)) {
      console.warn('JPEG may be incomplete (missing end marker)')
      // 不返回false，因为有些JPEG可能没有标准结尾
    }
  }
  
  return true
}

class R2StorageService {
  private client: S3Client | null = null
  private config: R2Config | null = null

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      const accountId = process.env.R2_ACCOUNT_ID
      const accessKeyId = process.env.R2_ACCESS_KEY_ID
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
      const bucketName = process.env.R2_BUCKET_NAME

      if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        console.warn('R2 storage not configured - missing environment variables')
        return
      }

      this.config = {
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName
      }

      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey
        },
        // 增加超时配置
        requestHandler: {
          requestTimeout: 30000, // 30秒超时
          connectionTimeout: 10000 // 10秒连接超时
        }
      })

      console.log('R2 storage client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize R2 storage client:', error)
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.config !== null
  }

  async uploadFile(file: File): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('R2 storage not configured')
    }

    console.log(`📤 Starting R2 upload for file: ${file.name} (${file.size} bytes)`);
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `flux-kontext-${timestamp}-${randomString}.${extension}`;
    
    console.log(`📋 Generated R2 filename: ${fileName}`);

    try {
      // 🔧 修复：将File转换为ArrayBuffer，避免hash计算错误
      console.log('📄 Converting file to buffer...');
      const fileBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);
      
      console.log(`📋 File buffer info:`, {
        originalSize: file.size,
        bufferSize: fileBytes.length,
        contentType: file.type
      });

      // 验证文件内容
      if (fileBytes.length === 0) {
        throw new Error('File is empty');
      }

      // 🔧 使用队列控制上传，避免并发问题
      const uploadResult = await uploadQueue.add(async () => {
        console.log(`📤 Uploading to R2: ${fileName}`);
        return await this.client!.send(
          new PutObjectCommand({
            Bucket: this.config!.bucketName,
            Key: fileName,
            Body: fileBytes, // 使用Uint8Array而不是File对象
            ContentType: file.type || 'image/jpeg',
            CacheControl: 'public, max-age=31536000', // 1年缓存
            Metadata: {
              'original-name': file.name,
              'upload-timestamp': timestamp.toString(),
              'source': 'user-upload',
              'file-size': file.size.toString()
            }
          })
        );
      });

      // 构建公开访问URL - 使用Public Development URL
      const publicUrl = process.env.R2_PUBLIC_URL 
        ? `${process.env.R2_PUBLIC_URL}/${fileName}`
        : `https://${this.config!.bucketName}.${this.config!.accountId}.r2.cloudflarestorage.com/${fileName}`;
      
      console.log(`✅ R2 upload successful:`, {
        fileName,
        publicUrl,
        uploadResult: uploadResult.$metadata
      });

      // 🔍 验证R2 URL可访问性（简化版本）
      try {
        await this.verifyR2UrlAccessibility(publicUrl);
      } catch (verifyError) {
        console.warn(`⚠️ R2 URL verification failed, but upload was successful:`, verifyError);
        // 不抛出错误，因为上传本身是成功的
      }

      return publicUrl;

    } catch (error: any) {
      console.error(`❌ R2 upload failed:`, error);
      
      // 详细的错误处理
      if (error.code === 'EPROTO' || error.code === 'ECONNRESET') {
        throw new Error(`R2 connection error: ${error.message}`);
      } else if (error.name === 'TooManyRequestsException') {
        throw new Error(`Upload limit exceeded. Please try again later.`);
      } else if (error.$metadata?.httpStatusCode === 403) {
        throw new Error(`R2 access denied. Please check configuration.`);
      } else if (error.$metadata?.httpStatusCode === 404) {
        throw new Error(`R2 bucket not found.`);
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async uploadFromUrl(imageUrl: string, originalPrompt?: string): Promise<string> {
    if (!this.isConfigured()) {
      console.warn("R2 not configured, returning original URL");
      return imageUrl;
    }

    const maxRetries = 4; // 增加重试次数
    
    return await withRetry(async () => {
      let uploadError: Error | null = null;
      try {
        console.log(`📤 Saving AI generated image to R2: ${imageUrl}`);
        
        console.log(`📤 Starting R2 upload from URL: ${imageUrl.substring(0, 50)}...`);
        const sourceUrlType = imageUrl.includes("fal.media") ? "fal" : "other";
        console.log(`🔍 Source URL type: ${sourceUrlType}`);
        
        console.log(`⬇️ Downloading image from: ${imageUrl}`);
        const response = await fetch(imageUrl, {
          headers: { 'Accept': 'image/*' }
        });

        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        const fileBuffer = await response.arrayBuffer();
        const downloadedBytes = new Uint8Array(fileBuffer);
        
        console.log(`📋 Downloaded image info:`, {
          size: downloadedBytes.length,
          contentType: response.headers.get('content-type'),
          responseStatus: response.status
        });

        if (downloadedBytes.length === 0) {
          throw new Error('Downloaded image is empty');
        }

        const originalContentType = response.headers.get('content-type') || 'application/octet-stream';
        const detectedContentType = detectImageContentType(downloadedBytes);
        const finalContentType = detectedContentType;
        
        console.log(`🔍 Image format detection:`, {
          originalContentType,
          detectedType: detectedContentType,
          finalContentType
        });
        
        // 生成唯一文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 12);
        const extension = this.getExtensionFromContentType(finalContentType);
        const fileName = `ai-generated-${timestamp}-${randomString}.${extension}`;
        
        console.log(`📋 Generated R2 filename: ${fileName}`);
        
        console.log(`📤 Saving AI generated image to R2: ${imageUrl}`);

        // 构建元数据
        const metadata: Record<string, string> = {
          'original-url': imageUrl,
          'upload-timestamp': timestamp.toString(),
          'source': 'ai-generated',
          'file-size': downloadedBytes.length.toString()
        };

        if (originalPrompt) {
          // 关键修复：对prompt进行编码
          metadata['prompt'] = encodeURIComponent(originalPrompt);
        }

        // 上传到R2 - 使用队列控制并发
        const uploadResult = await uploadQueue.add(async () => {
          return await this.client!.send(
            new PutObjectCommand({
              Bucket: this.config!.bucketName,
              Key: fileName,
              Body: downloadedBytes,
              ContentType: finalContentType,
              CacheControl: 'public, max-age=31536000',
              Metadata: metadata // 使用构建好的元数据
            })
          );
        });

        if (uploadResult.$metadata.httpStatusCode === 200) {
          const r2Url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
          console.log(`✅ Image uploaded successfully to R2: ${r2Url}`);
          
          try {
            await this.verifyR2UrlAccessibility(r2Url);
            return r2Url;
          } catch (verificationError: any) {
            console.warn(`⚠️ R2 URL verification failed, but upload succeeded. Returning original URL as fallback. Reason: ${verificationError.message}`);
            return imageUrl;
          }
          
        } else {
          uploadError = new Error(`R2 upload failed with status: ${uploadResult.$metadata.httpStatusCode}`);
          throw uploadError;
        }
      } catch (error: any) {
        uploadError = error;
        console.error(`❌ Failed to save AI generated image to R2:`, error);
        throw error;
      }
    }, maxRetries, 3000);
  }

  async getFileUrl(fileName: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('R2 storage not configured')
    }

    // 使用配置的Public Development URL
    return process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${fileName}`
      : `https://${this.config!.bucketName}.${this.config!.accountId}.r2.cloudflarestorage.com/${fileName}`;
  }

  // 批量上传（用于多图处理）
  async uploadMultipleFromUrls(imageUrls: string[], originalPrompt?: string): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('R2 storage not configured')
    }

    console.log(`🔄 Starting batch upload of ${imageUrls.length} images to R2`)

    // 串行处理以避免并发问题
    const results: string[] = []
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.log(`📤 Uploading image ${i + 1}/${imageUrls.length}`)
        const result = await this.uploadFromUrl(
          imageUrls[i], 
          `${originalPrompt} (Image ${i + 1})`
        )
        results.push(result)
        
        // 在批量上传之间添加延迟
        if (i < imageUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`❌ Failed to upload image ${i + 1}:`, error)
        // 失败时返回原始URL
        results.push(imageUrls[i])
      }
    }

    console.log(`🎉 Batch upload completed: ${results.length}/${imageUrls.length} images processed`)
    return results
  }

  /**
   * 🔍 验证R2 URL可访问性
   */
  private async verifyR2UrlAccessibility(r2Url: string): Promise<void> {
    try {
      console.log(`🔍 Verifying R2 URL accessibility: ${r2Url}`);
      
      const verifyResponse = await fetch(r2Url, {
        method: 'HEAD', // 只获取头部信息，不下载内容
        headers: {
          'User-Agent': 'FluxKontext/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      console.log(`📋 R2 URL verification result:`, {
        url: r2Url,
        status: verifyResponse.status,
        statusText: verifyResponse.statusText,
        contentType: verifyResponse.headers.get('content-type'),
        contentLength: verifyResponse.headers.get('content-length'),
        lastModified: verifyResponse.headers.get('last-modified'),
        accessible: verifyResponse.ok
      });

      if (!verifyResponse.ok) {
        console.warn(`⚠️ R2 URL not accessible: ${verifyResponse.status} ${verifyResponse.statusText}`);
      } else {
        console.log(`✅ R2 URL is accessible and ready for use`);
      }
    } catch (error) {
      console.error(`❌ R2 URL verification failed:`, {
        url: r2Url,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  private getExtensionFromContentType(contentType: string): string {
    const parts = contentType.split('/')
    if (parts.length > 1) {
      return parts[1]
    }
    return 'jpg'
  }
}

// 导出单例实例
export const r2Storage = new R2StorageService() 