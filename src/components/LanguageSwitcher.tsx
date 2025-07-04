"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  SUPPORTED_LOCALES, 
  LOCALE_NAMES, 
  LOCALE_FLAGS, 
  getLocaleFromPathname,
  getLocalizedPath,
  removeLocaleFromPathname,
  type SupportedLocale 
} from "@/lib/content/locale"

interface LanguageSwitcherProps {
  variant?: "dropdown" | "grid" | "mobile-icon" | "icon-only"
  className?: string
}

// 浏览器语言检测逻辑 - 获取最优匹配语言
function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') return 'en' // 服务端渲染fallback
  
  // 获取浏览器语言列表
  const browserLanguages = navigator.languages || [navigator.language]
  
  // 遍历浏览器语言偏好，找到第一个支持的语言
  for (const browserLang of browserLanguages) {
    // 提取语言代码（前两位）
    const langCode = browserLang.split('-')[0].toLowerCase()
    
    // 检查是否在支持列表中
    if (SUPPORTED_LOCALES.includes(langCode as SupportedLocale)) {
      return langCode as SupportedLocale
    }
  }
  
  // 如果没有匹配的语言，返回英语
  return 'en'
}

export function LanguageSwitcher({ variant = "dropdown", className = "" }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 获取当前语言
  const currentLocale = getLocaleFromPathname(pathname)
  
  // 仅在菜单中展示英文
  const MENU_LOCALES = SUPPORTED_LOCALES.filter((l) => l !== 'zh')
  
  // 客户端挂载后设置mounted状态，避免服务端渲染不一致
  useEffect(() => {
    setMounted(true)
    
    // 如果当前是默认语言且浏览器语言不是英语，考虑自动切换
    const browserLang = detectBrowserLanguage()
    if (currentLocale === 'en' && browserLang !== 'en' && pathname === '/') {
      // 可选：自动跳转到浏览器语言（暂时注释，避免过于激进的自动跳转）
      // switchLanguage(browserLang)
    }
  }, [])
  
  // 切换语言
  const switchLanguage = (newLocale: SupportedLocale) => {
    // 移除当前路径中的语言前缀
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    
    // 生成新的本地化路径
    const newPath = getLocalizedPath(pathWithoutLocale, newLocale)
    
    // 导航到新路径
    router.push(newPath)
    setIsOpen(false)
  }

  // 只显示图标版本（地球图标和国旗）
  if (variant === "icon-only") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md transition-colors"
          aria-label="Select language"
        >
          <Globe className="w-4 h-4 text-gray-700" />
          <span className="text-base">{LOCALE_FLAGS[currentLocale]}</span>
        </button>
        
        {/* 下拉菜单 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-purple-100 rounded-xl  py-2 z-[9999] max-h-60 overflow-y-auto">
            {MENU_LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                  locale === currentLocale ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-800'
                }`}
              >
                <span>{LOCALE_FLAGS[locale]}</span>
                <span className={locale === currentLocale ? "" : "text-gray-800"}>{LOCALE_NAMES[locale]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 移动端图标版本
  if (variant === "mobile-icon") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-purple-50 rounded-md transition-colors"
          aria-label="Select language"
        >
          <span className="text-lg">{LOCALE_FLAGS[currentLocale]}</span>
        </button>
        
        {/* 移动端下拉菜单 */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-purple-100 rounded-xl  py-2 z-[9999] max-h-60 overflow-y-auto">
            {MENU_LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                  locale === currentLocale ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-800'
                }`}
              >
                <span>{LOCALE_FLAGS[locale]}</span>
                <span className={locale === currentLocale ? "" : "text-gray-800"}>{LOCALE_NAMES[locale]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === "grid") {
    // 网格布局 - 适用于页脚（已移除，保留兼容性）
    return (
      <div className={`grid grid-cols-2 gap-1 ${className}`}>
        {MENU_LOCALES.map((locale) => (
          <button
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`flex items-center space-x-2 transition-all duration-200 text-sm py-1 hover:font-semibold active:scale-95 ${
              locale === currentLocale 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <span>{LOCALE_FLAGS[locale]}</span>
            <span>{LOCALE_NAMES[locale]}</span>
          </button>
        ))}
      </div>
    )
  }

  // 下拉菜单布局 - 适用于导航栏
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:font-semibold active:scale-95 transition-all duration-200"
      >
        <Globe className="w-4 h-4" />
        <span>{LOCALE_FLAGS[currentLocale]}</span>
        <span className="hidden sm:inline">{LOCALE_NAMES[currentLocale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-lg  py-2 z-[9999] max-h-60 overflow-y-auto">
          {MENU_LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:bg-accent ${
                locale === currentLocale ? 'bg-accent text-primary font-medium' : ''
              }`}
            >
              <span>{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_NAMES[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 简化版本 - 只显示当前语言，点击切换
export function SimpleLanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = getLocaleFromPathname(pathname)
  
  const switchToNextLanguage = () => {
    const currentIndex = SUPPORTED_LOCALES.indexOf(currentLocale)
    const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length
    const nextLocale = SUPPORTED_LOCALES[nextIndex]
    
    const pathWithoutLocale = removeLocaleFromPathname(pathname)
    const newPath = getLocalizedPath(pathWithoutLocale, nextLocale)
    
    router.push(newPath)
  }
  
  return (
    <button
      onClick={switchToNextLanguage}
      className={`flex items-center space-x-2 transition-all duration-200 hover:font-semibold active:scale-95 ${className}`}
      title={`Switch to ${LOCALE_NAMES[SUPPORTED_LOCALES[(SUPPORTED_LOCALES.indexOf(currentLocale) + 1) % SUPPORTED_LOCALES.length]]}`}
    >
      <span>{LOCALE_FLAGS[currentLocale]}</span>
      <span>{LOCALE_NAMES[currentLocale]}</span>
    </button>
  )
} 