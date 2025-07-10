"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogoVariants } from "@/components/Logo"
import { ChevronDown, User, LogOut, Code, BookOpen } from "lucide-react"
// 导入文案系统
import { common } from "@/lib/content"
// 导入语言选择器
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false)
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.resources-dropdown') && !target.closest('.user-dropdown')) {
        setIsResourcesMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 统一菜单title，全部英文，风格与主页一致
  const navLinks = [
    { href: "/", label: common.navigation.home, emoji: "🏠" },
    { href: "/generate", label: common.navigation.generate, emoji: "✨" },
    { href: "/labubu-news", label: "News", emoji: "📰" },
    { href: "/labubu-gallery", label: "Gallery", emoji: "🎨" },
    { href: "/wallpapers", label: "Wallpapers", emoji: "🖼️" },
    { href: "/videos", label: "Videos", emoji: "🎬" },
    // { href: "/pricing", label: common.navigation.pricing, emoji: "💎" },
    // { href: "/resources", label: common.navigation.resources, emoji: "📚" },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md  border-b border-labubu-200/30">
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* 左侧：Logo */}
        <div className="flex-shrink-0 flex items-center">
          <LogoVariants.Navigation />
        </div>
        
        {/* 移动端：顶部语言选择器（国旗图标） */}
        <div className="md:hidden ml-auto mr-2">
          <LanguageSwitcher variant="mobile-icon" />
        </div>
        
        {/* 中间：桌面端导航菜单 - 居中显示 */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`relative transition-all duration-300 hover:font-semibold active:scale-95 flex items-center space-x-2 px-4 py-2 rounded-2xl hover: hover:-translate-y-0.5 ${
                pathname === link.href 
                  ? 'text-labubu-600 font-semibold bg-gradient-to-r from-labubu-50 to-labubu-100 ' 
                  : 'text-gray-800 hover:text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50'
              }`}
            >
              {link.emoji && (
                <span className="text-base leading-none flex items-center justify-center w-5 h-5">
                  {link.emoji}
                </span>
              )}
              <span className="leading-none">{link.label}</span>
              {pathname === link.href && (
                <div className="absolute -bottom-1 left-4 right-4 h-1 bg-gradient-to-r from-labubu-400 to-warm-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* 右侧：桌面端语言选择器和用户状态 */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {/* 语言选择器 */}
          <LanguageSwitcher variant="icon-only" />
          
          {status === "loading" ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-labubu-400 border-t-transparent" />
          ) : session ? (
            // 已登录状态
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-2xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 transition-all duration-300 hover: hover:-translate-y-0.5 active:scale-95"
              >
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-labubu-100 to-warm-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-labubu-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800">{session.user?.name || session.user?.email}</span>
                <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* 用户下拉菜单 */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border border-labubu-200/30 rounded-2xl  py-3 z-[9999]">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 rounded-xl mx-2 hover:scale-105 active:scale-95 text-gray-800 hover:text-labubu-600"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {common.navigation.dashboard}
                  </Link>
                  <hr className="my-2 border-labubu-200/30" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 rounded-xl mx-2 hover:scale-105 active:scale-95 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4 text-labubu-500" />
                    <span className="text-gray-800 hover:text-labubu-600">{common.buttons.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 未登录状态 - 语言选择器已在上方显示，这里只显示登录/注册按钮
            <>
              {/* 登录按钮跳转到 Clerk 新登录页 /sign-in */}
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:font-semibold active:scale-95 transition-all duration-300 text-gray-800 hover:text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 rounded-2xl px-6"
                >
                  {common.navigation.login}
                </Button>
              </Link>
              {/* 注册按钮跳转到 Clerk 新注册页 /sign-up（如需自定义注册页可后续补充）*/}
              <Link href="/sign-up">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-labubu-500 to-labubu-600 text-white hover:from-labubu-600 hover:to-labubu-700 hover:scale-105 active:scale-95 transition-all duration-300  hover: rounded-2xl px-6"
                >
                  {common.buttons.signUp}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <div className="md:hidden flex-shrink-0">
          <button
            className="p-2 hover:bg-accent rounded-md active:scale-95 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 mt-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 mt-1 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* 移动端导航链接 */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-accent hover:font-semibold active:scale-95 ${
                  pathname === link.href 
                    ? 'text-primary font-semibold bg-accent' 
                    : 'text-foreground'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.emoji && (
                  <span className="text-lg leading-none flex items-center justify-center w-6 h-6">
                    {link.emoji}
                  </span>
                )}
                <span className="leading-none">{link.label}</span>
              </Link>
            ))}
            
            {/* 移动端用户状态和按钮 */}
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {status === "loading" ? (
                <div className="flex justify-center">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : session ? (
                // 移动端已登录状态
                <>
                  <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:font-semibold active:scale-95 transition-all duration-200"
                    >
                      {common.navigation.dashboard}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="w-full justify-start hover:font-semibold active:scale-95 transition-all duration-200 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {common.buttons.signOut}
                  </Button>
                </>
              ) : (
                // 移动端未登录状态
                <>
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:font-semibold active:scale-95 transition-all duration-200"
                    >
                      {common.navigation.login}
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      size="sm" 
                      className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {common.buttons.signUp}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 