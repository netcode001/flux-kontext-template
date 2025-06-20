"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"

export interface AuthStatus {
  isLoading: boolean
  isAuthenticated: boolean
  isUnauthenticated: boolean
  user: any
  session: any
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

/**
 * 统一的认证状态管理Hook
 * 解决不同组件间session验证不一致的问题
 */
export function useAuthStatus(): AuthStatus {
  const { data: session, status } = useSession()
  
  return useMemo(() => {
    const authStatus: AuthStatus = {
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated' && !!session,
      isUnauthenticated: status === 'unauthenticated' || !session,
      user: session?.user,
      session,
      status
    }
    
    // 🔍 调试日志 - 帮助排查session问题
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useAuthStatus:', {
        status,
        hasSession: !!session,
        userEmail: session?.user?.email,
        isAuthenticated: authStatus.isAuthenticated,
        isUnauthenticated: authStatus.isUnauthenticated
      })
    }
    
    return authStatus
  }, [session, status])
}

/**
 * 权限检查Hook
 * 基于用户角色和权限进行访问控制
 */
export function usePermission(permission: string) {
  const { user, isAuthenticated } = useAuthStatus()
  
  return useMemo(() => {
    if (!isAuthenticated || !user) return false
    
    // 🔧 基础权限检查逻辑
    // 后续可以扩展为基于角色的权限系统
    switch (permission) {
      case 'post:create':
        return true // 所有登录用户都可以创建帖子
      case 'post:edit':
        return true // 所有登录用户都可以编辑自己的帖子
      case 'post:delete':
        return true // 所有登录用户都可以删除自己的帖子
      case 'admin:access':
        return user.role === 'admin' // 只有管理员可以访问管理功能
      default:
        return false
    }
  }, [user, permission, isAuthenticated])
} 