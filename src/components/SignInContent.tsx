"use client"

import { useState, useEffect } from "react"
import { signIn, getProviders } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
// 导入认证文案模块
import { auth, common } from "@/lib/content"

export function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [providers, setProviders] = useState<any>(null)
  const [providersLoading, setProvidersLoading] = useState(true)
  const [providersError, setProvidersError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let isMounted = true;
    const maxRetries = 2;
    let attempt = 0;

    const fetchProviders = async () => {
      if (!isMounted) return;

      try {
        console.log(`🔍 [尝试 ${attempt + 1}/${maxRetries}] 开始获取认证提供商...`);
        setProvidersLoading(true);
        setProvidersError("");
        
        const res = await getProviders();
        
        if (!isMounted) return;

        console.log('✅ 获取到的提供商:', res);
        
        if (res && Object.keys(res).length > 0) {
          setProviders(res);
          console.log('✅ 提供商设置成功:', Object.keys(res));
          setProvidersLoading(false);
        } else {
          throw new Error('getProviders() 返回了空对象');
        }
      } catch (error) {
        console.error(`❌ [尝试 ${attempt + 1}/${maxRetries}] 获取提供商失败:`, error);
        
        if (isMounted && attempt < maxRetries - 1) {
          attempt++;
          // 指数退避重试
          setTimeout(fetchProviders, 1000 * Math.pow(2, attempt)); 
        } else if (isMounted) {
          setProvidersError(auth.errors.unknown);
          setProvidersLoading(false);
          console.log('❌ 所有重试均失败，显示错误信息。');
        }
      }
    };
    
    fetchProviders();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      switch (error) {
        case 'OAuthSignin':
          setError(auth.errors.oauthSignin)
          break
        case 'OAuthCallback':
          setError(auth.errors.oauthCallback)
          break
        case 'OAuthCreateAccount':
          setError(auth.errors.oauthCreateAccount)
          break
        case 'EmailCreateAccount':
          setError(auth.errors.emailCreateAccount)
          break
        case 'Callback':
          setError(auth.errors.callback)
          break
        case 'OAuthAccountNotLinked':
          setError(auth.errors.oauthAccountNotLinked)
          break
        case 'EmailSignin':
          setError(auth.errors.emailSignin)
          break
        case 'CredentialsSignin':
          setError(auth.errors.credentialsSignin)
          break
        case 'SessionRequired':
          setError(auth.errors.sessionRequired)
          break
        default:
          setError(auth.errors.unknown)
      }
    }
  }, [searchParams])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(auth.errors.credentialsSignin)
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/generate'
        router.push(callbackUrl)
      }
    } catch (error) {
      setError(common.messages.loginFailed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError("")
    
    try {
      console.log(`🚀 启动${provider}登录...`)
      
      // 清除URL中的错误参数
      if (searchParams.get('error')) {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('error')
        window.history.replaceState({}, '', newUrl.toString())
      }
      
      const callbackUrl = searchParams.get('callbackUrl') || '/generate'
      await signIn(provider, { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      console.error(`❌ ${provider}登录失败:`, error)
      setError(common.messages.loginFailed)
      setIsLoading(false)
    }
  }

  // 🔧 清除错误状态的辅助函数
  const clearError = () => {
    setError("")
    setProvidersError("")
    
    // 清除URL中的错误参数
    if (searchParams.get('error')) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }

  // 只在首次加载且没有错误时显示加载状态
  if (providersLoading && !error && !providersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading authentication providers...</p>
            <p className="mt-2 text-sm text-gray-500">If this takes too long, we'll show you the login options anyway.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {auth.signIn.title}
          </h2>
          
          <div className="mt-4 mx-auto max-w-sm">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-primary">
                  Sign up and get 30 free credits!
                </span>
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
          
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {auth.signIn.noAccount}{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {auth.signIn.createNewAccount}
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {(error || providersError) && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {error || providersError}
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Please try signing in again. If the issue persists, contact support.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={clearError}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Clear Error
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* 🔧 始终显示Google登录按钮 - 修复渲染条件 */}
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? common.buttons.signingIn : common.buttons.continueWithGoogle}
            </button>

            {/* 📊 调试信息显示 (仅开发环境) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground text-center space-y-1 p-2 bg-gray-50 rounded">
                <p>🔍 调试信息:</p>
                <p>Providers: {providers ? Object.keys(providers).join(', ') : 'None'}</p>
                <p>Loading: {providersLoading ? 'Yes' : 'No'}</p>
                <p>Error: {error || providersError || 'None'}</p>
                <p>URL Error: {searchParams.get('error') || 'None'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 