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
  const router = useRouter()
  const searchParams = useSearchParams()

  // 获取可用的认证提供商
  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  // 检查URL中的错误参数 - 使用auth模块的错误文案
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
        // 获取回调URL或默认跳转到generate页面
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
      const callbackUrl = searchParams.get('callbackUrl') || '/generate'
      await signIn(provider, { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      setError(common.messages.loginFailed)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {auth.signIn.title}
          </h2>
          
          {/* 🎁 登录赠送积分提示 */}
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
          {/* OAuth 登录按钮 */}
          {providers && (
            <div className="space-y-3">
              {/* Google 登录 - 只有在启用时才显示 */}
              {providers.google && process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
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
              )}
            </div>
          )}

          {/* 分隔线 - 只有在有OAuth提供商时才显示 */}
          {/* {providers && ((providers.google && process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true") || (providers.github && process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true")) && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">{auth.signIn.orContinueWith}</span>
              </div>
            </div>
          )} */}

          {/* 邮箱/密码登录表单 - 已注释掉，仅保留Google登录 */}
          {/*
          <form className="mt-8 space-y-6" onSubmit={handleEmailSignIn} autoComplete="off">
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/auth/forgot" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? common.buttons.signingIn : common.buttons.signIn}
            </button>
          </form>
          */}
        </div>
      </div>
    </div>
  )
} 