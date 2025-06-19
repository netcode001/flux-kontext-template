import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 🔧 添加重试机制的包装函数
async function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`🔄 操作失败，第 ${attempt}/${maxRetries} 次重试:`, error)
      
      if (attempt < maxRetries) {
        // 指数退避策略
        const waitTime = delay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  throw lastError
}

export async function createClient() {
  const cookieStore = await cookies()

  // 创建服务器端的Supabase客户端
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在中间件中调用时可能会失败，这是正常的
          }
        },
      },
    }
  )
}

// 管理员客户端（使用service_role密钥）
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // 管理员客户端不需要设置cookies
        },
      },
    }
  )
}

// 🔧 带重试机制的管理员客户端操作
export function createAdminClientWithRetry() {
  const client = createAdminClient()
  
  return {
    ...client,
    // 包装常用的查询方法添加重试机制
    async query<T>(operation: () => Promise<T>): Promise<T> {
      return withRetry(operation, 3, 1000)
    }
  }
} 