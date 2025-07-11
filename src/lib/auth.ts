import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import { getClientIp } from "@/lib/utils/ip"
import { getIsoTimestr } from "@/lib/utils/time"
import { getUuid } from "@/lib/utils/hash"
import { saveUser } from "@/lib/services/user"
import { User } from "@/lib/types/user"
import { createClient } from '@supabase/supabase-js'

const providers: any[] = []

// Google Auth (如果配置了)
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Github Auth (如果配置了)
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  )
}

// 🔥 简化的邮箱登录 - 只使用Supabase认证
if (process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === "true") {
  providers.push(
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 🎯 开发环境测试账户（无需数据库）
        if (process.env.NODE_ENV === 'development' && 
            credentials.email === "test@example.com" && 
            credentials.password === "password") {
          return {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          }
        }

        // 🚀 生产环境：使用Supabase认证（自带邮箱验证）
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // 🔐 Supabase登录验证（自动检查邮箱验证状态）
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            console.log('登录失败:', error.message)
            return null
          }

          if (!data.user) {
            console.log('用户不存在')
            return null
          }

          // ✅ 检查邮箱验证状态
          if (!data.user.email_confirmed_at) {
            console.log('邮箱未验证')
            return null
          }

          // 🎉 登录成功
          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!,
          }

        } catch (error) {
          console.error('Supabase认证错误:', error)
          return null
        }
      },
    })
  )
}

export const providerMap = providers
  .map((provider: any) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  // 🔧 添加调试模式以诊断 OAuth 错误
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    }
  },
  // 🍪 Cookie安全配置 - 优化以支持Google One Tap
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',        // 🔧 设置为lax而非strict，支持第三方登录
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // domain: process.env.NODE_ENV === 'production' ? 'labubu.hot' : undefined, // 🌐 明确指定域名
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',        // 🔧 支持跨站点回调
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // domain: process.env.NODE_ENV === 'production' ? 'labubu.hot' : undefined,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',        // 🔧 支持CSRF保护但允许第三方登录
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // domain: process.env.NODE_ENV === 'production' ? 'labubu.hot' : undefined,
      },
    },
    // 🔧 添加状态Cookie配置以支持Google One Tap
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900, // 15分钟
        // domain: process.env.NODE_ENV === 'production' ? 'labubu.hot' : undefined,
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900, // 15分钟
        // domain: process.env.NODE_ENV === 'production' ? 'labubu.hot' : undefined,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // 🎯 处理用户登录和首次注册赠送积分
      console.log('🔍 signIn回调触发:', { 
        user: user, 
        account: account?.provider, 
        profile: profile?.email 
      })
      
      try {
        if (user?.email) {
          console.log('🔍 开始处理用户:', user.email)
          
          // 🔧 使用Supabase替代Prisma，确保数据库访问一致性
          const { createAdminClient } = await import('@/lib/supabase/server')
          const { getUuid } = await import('@/lib/utils/hash')
          
          console.log('🔍 Supabase模块导入成功')
          
          const supabase = createAdminClient()
          
          // 检查用户是否已存在
          console.log('🔍 [signIn] 查询现有用户...')
          const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .limit(1)
            .single()
          
          console.log('🔍 [signIn] 查询结果:', existingUser ? '用户已存在' : '用户不存在')

          if (findError && findError.code === 'PGRST116') {
            // 🚀 终极修复：不再直接创建用户，而是调用我们已验证可行的内部API来绕过环境问题
            console.log('🚀 [signIn] 用户不存在，调用内部API创建用户...')
            const ensureUserResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/user/ensure`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // 内部调用，可以添加一个密钥来增加安全性
                'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account?.provider || 'google'
              })
            })

            if (!ensureUserResponse.ok) {
              let errorBody = '调用ensure-user API返回了非200状态码'
              try {
                // 尝试解析JSON格式的错误信息
                const jsonError = await ensureUserResponse.json()
                errorBody = JSON.stringify(jsonError)
              } catch {
                // 如果不是JSON，则获取文本内容
                errorBody = await ensureUserResponse.text()
              }
              console.error('❌ [signIn] 调用内部ensure-user API失败，详情:', errorBody)
              return false // 调用失败，终止登录
            }
            
            console.log('✅ [signIn] 内部API调用成功，用户已创建或确认存在')

          } else if (findError) {
            console.error('🚨 [signIn] 数据库查询用户失败，登录终止:', findError)
            return false // 修复：数据库查询异常，终止
          } else if (!findError && existingUser) {
            console.log('🔄 更新现有用户登录信息...')
            
            // 🔄 现有用户：更新登录信息
            const updateData = {
              last_signin_at: new Date().toISOString(),
              signin_count: (existingUser.signin_count || 0) + 1,
              // 更新头像和昵称（如果有变化）
              ...(user.image && { image: user.image }),
              ...(user.name && { name: user.name }),
            }

            await supabase
              .from('users')
              .update(updateData)
              .eq('id', existingUser.id)
            
            console.log('✅ 现有用户登录信息更新完成')
          } else {
            console.error('🚨 [signIn] 数据库查询用户失败，登录终止:', findError)
            return false // 修复：数据库查询异常，终止
          }
        } else {
          console.log('⚠️ 用户邮箱为空，跳过数据库操作')
        }
      } catch (error) {
        console.error('❌ [signIn] 回调发生未知异常，登录终止:', error)
        // 修复：任何未知异常都应终止登录
        return false
      }

      console.log('✅ [signIn] 回调成功完成，允许登录')
      return true
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async session({ session, token }) {
      if (token && session.user) {
        // 从token中获取用户ID (现在应该是正确的UUID了)
        session.user.id = token.sub as string;

        // 异步操作：从数据库获取最新的用户信息
        try {
          const { createAdminClient } = await import('@/lib/supabase/server');
          const supabase = createAdminClient();
          
          const { data: userData, error } = await supabase
            .from('users')
            .select('credits, image') // 移除了不存在的 'tier' 字段
            .eq('id', token.sub)
            .single();

          if (error) {
            console.error('Error fetching user data for session:', error.message);
          } else if (userData) {
            // 将数据库中的信息挂载到session.user上
            session.user.credits = userData.credits;
            session.user.image = userData.image; // 确保头像是最新的
          }
        } catch (e) {
          console.error('Failed to fetch user data for session:', e);
        }
      }
      return session;
    },
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // 首次登录时，user对象可用
      if (user && user.email) {
        try {
          // 关键修复：从我们的数据库中获取用户，以确保我们使用的是内部UUID
          const { createAdminClient } = await import('@/lib/supabase/server');
          const supabase = createAdminClient();
          
          const { data: dbUser, error } = await supabase
            .from('users')
            .select('id') // 我们只需要UUID
            .eq('email', user.email)
            .single();

          if (dbUser) {
            // 用我们数据库的UUID覆盖token的subject
            token.sub = dbUser.id;
          } else {
            // 这个情况不应该发生，因为signIn回调会创建用户
            console.error(`JWT回调错误: 在数据库中找不到邮箱为 ${user.email} 的用户。`);
            token.sub = user.id; // 作为后备，但这会导致错误
          }
        } catch (e) {
          console.error('JWT回调错误: 从数据库获取用户时出错', e);
        }
      }
      return token;
    },
  },
}

// 检测用户地理位置的函数
async function detectUserLocation(): Promise<string> {
  try {
    // 这里可以使用IP地理位置检测服务
    // 暂时返回默认值，实际项目中可以集成 ipapi.co 等服务
    return "US" // 默认为美国
  } catch (error) {
    console.error("地理位置检测失败:", error)
    return "US"
  }
} 