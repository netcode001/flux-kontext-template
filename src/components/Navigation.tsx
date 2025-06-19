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

  const navLinks = [
    { href: "/", label: common.navigation.home, emoji: "🏠" },
    { href: "/generate", label: common.navigation.generate, emoji: "✨" },
    { 
      href: "/labubu-news", 
      label: "Labubu快报",
      emoji: "📰"
    },
    { 
      href: "/labubu-gallery", 
      label: "创意秀场",
      emoji: "🎨"
    },
    { href: "/pricing", label: common.navigation.pricing, emoji: "💎" },
    { 
      href: "/resources", 
      label: common.navigation.resources,
      emoji: "📚",
      hasDropdown: true,
      subItems: [
        { href: "/resources", label: common.navigation.resourcesHub, icon: BookOpen },
        { href: "/resources/api", label: common.navigation.apiDocs, icon: Code }
      ]
    }
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* 左侧：Logo */}
        <div className="flex-shrink-0">
          <LogoVariants.Navigation />
        </div>
        
        {/* 中间：桌面端导航菜单 - 居中显示 */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          {navLinks.map((link) => (
            <div key={link.href} className="relative">
              {link.hasDropdown ? (
                // Resources下拉菜单
                <div className="relative resources-dropdown">
                  <button
                    onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                    className={`flex items-center space-x-2 relative transition-all duration-200 hover:font-semibold active:scale-95 px-3 py-2 rounded-lg hover:bg-accent/50 ${
                      pathname.startsWith('/resources') 
                        ? 'text-primary font-semibold bg-accent/30' 
                        : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {link.emoji && (
                      <span className="text-base leading-none flex items-center justify-center w-5 h-5">
                        {link.emoji}
                      </span>
                    )}
                    <span className="leading-none">{link.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} />
                    {pathname.startsWith('/resources') && (
                      <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                  
                  {/* Resources下拉菜单内容 */}
                  {isResourcesMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-[9999]">
                      {link.subItems?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:bg-accent"
                          onClick={() => setIsResourcesMenuOpen(false)}
                        >
                          <subItem.icon className="w-4 h-4 text-primary" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // 普通导航链接
                <Link 
                  href={link.href} 
                  className={`relative transition-all duration-200 hover:font-semibold active:scale-95 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/50 ${
                    pathname === link.href 
                      ? 'text-primary font-semibold bg-accent/30' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.emoji && (
                    <span className="text-base leading-none flex items-center justify-center w-5 h-5">
                      {link.emoji}
                    </span>
                  )}
                  <span className="leading-none">{link.label}</span>
                  {pathname === link.href && (
                    <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* 右侧：桌面端用户状态和按钮 */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {status === "loading" ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : session ? (
            // 已登录状态
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* 用户下拉菜单 */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-[9999]">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm transition-colors hover:bg-accent"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {common.navigation.dashboard}
                  </Link>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{common.buttons.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 未登录状态
            <>
              <Link href="/auth/signin">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:font-semibold active:scale-95 transition-all duration-200"
                >
                  {common.navigation.login}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  size="sm" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
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
              <div key={link.href}>
                {link.hasDropdown ? (
                  // 移动端Resources下拉菜单
                  <div>
                    <button
                      onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                      className={`flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all duration-200 hover:bg-accent hover:font-semibold active:scale-95 ${
                        pathname.startsWith('/resources') 
                          ? 'text-primary font-semibold bg-accent' 
                          : 'text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {link.emoji && (
                          <span className="text-lg leading-none flex items-center justify-center w-6 h-6">
                            {link.emoji}
                          </span>
                        )}
                        <span className="leading-none">{link.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* 移动端Resources子菜单 */}
                    {isResourcesMenuOpen && (
                      <div className="ml-4 mt-2 space-y-1">
                        {link.subItems?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="flex items-center space-x-3 py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent"
                            onClick={() => {
                              setIsResourcesMenuOpen(false)
                              setIsMobileMenuOpen(false)
                            }}
                          >
                            <subItem.icon className="w-4 h-4 text-primary" />
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // 普通移动端导航链接
                  <Link
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
                )}
              </div>
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