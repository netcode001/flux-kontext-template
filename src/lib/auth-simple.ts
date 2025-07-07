import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

// 🚨 临时简化配置 - 专门用于测试 Google OAuth 流程
export const authOptionsSimple: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    })
  ],
  
  pages: {
    signIn: "/auth/signin",
  },
  
  // 🔧 强制启用调试模式
  debug: true,
  
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
  
  // 🍪 移除复杂的Cookie配置，使用默认设置
  // cookies: {
  //   // 使用 NextAuth 默认 Cookie 配置
  // },
  
  // 🚨 移除复杂的回调逻辑
  callbacks: {
    async signIn({ user, account, profile }) {
      // 🎯 最简化的登录逻辑，只打印日志
      console.log('🔍 简化signIn回调:', { 
        user: user?.email, 
        account: account?.provider, 
        profile: profile?.email 
      })
      
      // 直接返回true，允许登录
      return true
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔍 redirect回调:', { url, baseUrl })
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    
    async session({ session, token }) {
      console.log('🔍 session回调:', { 
        sessionUser: session.user?.email, 
        tokenSub: token.sub 
      })
      
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    
    async jwt({ token, user, account }) {
      console.log('🔍 jwt回调:', { 
        tokenSub: token.sub, 
        userEmail: user?.email, 
        accountProvider: account?.provider 
      })
      
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
} 