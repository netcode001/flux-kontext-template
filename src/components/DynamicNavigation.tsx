"use client"

// 🚀 动态导航组件
// 支持从数据库加载菜单配置

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogoVariants } from "@/components/Logo"
import { ChevronDown, User, LogOut, BookOpen } from "lucide-react"
import { common } from "@/lib/content"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// 📋 动态菜单项类型
interface DynamicMenuItem {
  id: string
  key: string
  label: string
  href: string
  emoji?: string
  icon?: string
  sort_order: number
  is_dropdown: boolean
  parent_id?: string | null
  target?: string
  css_class?: string
  permission_required?: string
  children?: DynamicMenuItem[]
}

export function DynamicNavigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false)
  
  // 🔄 动态菜单状态
  const [dynamicMenuItems, setDynamicMenuItems] = useState<DynamicMenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  // 🔄 加载动态菜单
  const loadDynamicMenu = async () => {
    try {
      setMenuLoading(true)
      const response = await fetch('/api/menu-items')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取菜单失败')
      }

      setDynamicMenuItems(result.data || [])
      setMenuError(null)
    } catch (err: any) {
      console.error('❌ 加载动态菜单失败:', err)
      setMenuError(err.message)
      // 使用静态菜单作为fallback
      setDynamicMenuItems(getStaticFallbackMenu())
    } finally {
      setMenuLoading(false)
    }
  }

  // 🔄 静态菜单作为fallback
  const getStaticFallbackMenu = (): DynamicMenuItem[] => [
    { 
      id: 'static-home', 
      key: 'home', 
      label: common.navigation.home, 
      href: "/", 
      emoji: "🏠", 
      sort_order: 1, 
      is_dropdown: false 
    },
    { 
      id: 'static-generate', 
      key: 'generate', 
      label: common.navigation.generate, 
      href: "/generate", 
      emoji: "✨", 
      sort_order: 2, 
      is_dropdown: false 
    },
    { 
      id: 'static-labubu-news', 
      key: 'labubu-news', 
      label: "Labubu快报", 
      href: "/labubu-news", 
      emoji: "📰", 
      sort_order: 3, 
      is_dropdown: false 
    },
    { 
      id: 'static-labubu-gallery', 
      key: 'labubu-gallery', 
      label: "创意秀场", 
      href: "/labubu-gallery", 
      emoji: "🎨", 
      sort_order: 4, 
      is_dropdown: false 
    },
    { 
      id: 'static-pricing', 
      key: 'pricing', 
      label: common.navigation.pricing, 
      href: "/pricing", 
      emoji: "💎", 
      sort_order: 5, 
      is_dropdown: false 
    },
    { 
      id: 'static-resources', 
      key: 'resources', 
      label: common.navigation.resources,
      href: "/resources", 
      emoji: "📚", 
      sort_order: 6, 
      is_dropdown: true,
      children: [
        { 
          id: 'static-resources-hub', 
          key: 'resources-hub', 
          label: common.navigation.resourcesHub, 
          href: "/resources", 
          emoji: "📚", 
          sort_order: 1, 
          is_dropdown: false,
          parent_id: 'static-resources'
        },
        { 
          id: 'static-api-docs', 
          key: 'api-docs', 
          label: common.navigation.apiDocs, 
          href: "/resources/api", 
          emoji: "📖", 
          sort_order: 2, 
          is_dropdown: false,
          parent_id: 'static-resources'
        }
      ]
    }
  ]

  useEffect(() => {
    loadDynamicMenu()
  }, [])

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // 🔍 权限检查
  const hasPermission = (item: DynamicMenuItem): boolean => {
    if (!item.permission_required) return true
    
    // 检查用户权限
    if (item.permission_required === 'admin') {
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
      return session?.user?.email ? adminEmails.includes(session.user.email) : false
    }
    
    if (item.permission_required === 'premium') {
      // TODO: 检查用户是否是付费用户
      return true
    }
    
    return true
  }

  // 📱 渲染动态菜单项
  const renderDynamicMenuItem = (item: DynamicMenuItem) => {
    if (!hasPermission(item)) return null

    if (item.is_dropdown && item.children) {
      return (
        <div key={item.id} className="relative resources-dropdown">
          <button
            onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
            className={`flex items-center space-x-2 relative transition-all duration-200 hover:font-semibold active:scale-95 px-3 py-2 rounded-lg hover:bg-accent/50 ${
              pathname.startsWith(item.href) 
                ? 'text-primary font-semibold bg-accent/30' 
                : 'text-foreground hover:text-primary'
            }`}
          >
            {item.emoji && (
              <span className="text-base leading-none flex items-center justify-center w-5 h-5">
                {item.emoji}
              </span>
            )}
            <span className="leading-none">{item.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isResourcesMenuOpen ? 'rotate-180' : ''}`} />
            {pathname.startsWith(item.href) && (
              <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          
          {/* 下拉菜单内容 */}
          {isResourcesMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-[9999]">
              {item.children.map((subItem) => (
                hasPermission(subItem) && (
                  <Link
                    key={subItem.id}
                    href={subItem.href}
                    target={subItem.target || '_self'}
                    className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:bg-accent"
                    onClick={() => setIsResourcesMenuOpen(false)}
                  >
                    {subItem.emoji ? (
                      <span className="text-sm">{subItem.emoji}</span>
                    ) : (
                      <BookOpen className="w-4 h-4 text-primary" />
                    )}
                    <span>{subItem.label}</span>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      )
    }

    // 普通菜单项
    return (
      <Link 
        key={item.id}
        href={item.href} 
        target={item.target || '_self'}
        className={`relative transition-all duration-200 hover:font-semibold active:scale-95 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/50 ${
          pathname === item.href 
            ? 'text-primary font-semibold bg-accent/30' 
            : 'text-foreground hover:text-primary'
        } ${item.css_class || ''}`}
      >
        {item.emoji && (
          <span className="text-base leading-none flex items-center justify-center w-5 h-5">
            {item.emoji}
          </span>
        )}
        <span className="leading-none">{item.label}</span>
        {pathname === item.href && (
          <div className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
        )}
      </Link>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* 左侧：Logo */}
        <div className="flex-shrink-0">
          <LogoVariants.Navigation />
        </div>
        
        {/* 移动端：顶部语言选择器（国旗图标） */}
        <div className="md:hidden ml-auto mr-2">
          <LanguageSwitcher variant="mobile-icon" />
        </div>
        
        {/* 中间：桌面端导航菜单 - 居中显示 */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          {menuLoading ? (
            <div className="text-sm text-gray-500">菜单加载中...</div>
          ) : (
            dynamicMenuItems.map(renderDynamicMenuItem)
          )}
        </nav>

        {/* 右侧：桌面端语言选择器和用户状态 */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {/* 语言选择器 */}
          <LanguageSwitcher variant="dropdown" />
          
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
                  {/* 管理员菜单 */}
                  {session.user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(session.user.email) && (
                    <>
                      <hr className="my-2 border-border" />
                      <Link
                        href="/admin/menu-management"
                        className="block px-4 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        🎛️ 菜单管理
                      </Link>
                    </>
                  )}
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
            {menuLoading ? (
              <div className="text-center text-sm text-gray-500">菜单加载中...</div>
            ) : (
              dynamicMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-accent hover:font-semibold active:scale-95 ${
                    pathname === item.href 
                      ? 'text-primary font-semibold bg-accent' 
                      : 'text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.emoji && (
                    <span className="text-lg leading-none flex items-center justify-center w-6 h-6">
                      {item.emoji}
                    </span>
                  )}
                  <span className="leading-none">{item.label}</span>
                </Link>
              ))
            )}
            
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
                  {/* 移动端管理员菜单 */}
                  {session.user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(session.user.email) && (
                    <Link href="/admin/menu-management" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start hover:font-semibold active:scale-95 transition-all duration-200"
                      >
                        🎛️ 菜单管理
                      </Button>
                    </Link>
                  )}
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