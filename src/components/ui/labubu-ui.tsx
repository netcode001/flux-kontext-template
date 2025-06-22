import React from 'react'
import { cn } from '@/lib/utils'
import { labubuStyles } from '@/lib/styles/labubu-theme'

// 🎨 Labubu主题按钮组件
interface LabubuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'warm'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function LabubuButton({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: LabubuButtonProps) {
  const baseStyles = labubuStyles.transitions.default + ' font-medium'
  
  const variantStyles = {
    primary: labubuStyles.components.button.primary,
    secondary: labubuStyles.components.button.secondary,
    ghost: labubuStyles.components.button.ghost,
    warm: labubuStyles.components.button.warm,
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// 🎨 Labubu主题卡片组件
interface LabubuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'interactive'
  children: React.ReactNode
}

export function LabubuCard({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: LabubuCardProps) {
  const variantStyles = {
    default: labubuStyles.components.card.default,
    gradient: labubuStyles.components.card.gradient,
    interactive: labubuStyles.components.card.interactive,
  }
  
  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎨 Labubu主题输入框组件
interface LabubuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search'
}

export function LabubuInput({ 
  variant = 'default', 
  className, 
  ...props 
}: LabubuInputProps) {
  const baseStyles = 'w-full px-4 py-3'
  
  const variantStyles = {
    default: labubuStyles.components.input.default,
    search: labubuStyles.components.input.search,
  }
  
  return (
    <input
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

// 🎨 Labubu主题标签组件
interface LabubuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'warm'
  children: React.ReactNode
}

export function LabubuBadge({ 
  variant = 'primary', 
  className, 
  children, 
  ...props 
}: LabubuBadgeProps) {
  const variantStyles = {
    primary: labubuStyles.components.badge.primary,
    secondary: labubuStyles.components.badge.secondary,
    warm: labubuStyles.components.badge.warm,
  }
  
  return (
    <span
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}

// 🎨 Labubu主题容器组件
interface LabubuContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'centered' | 'section'
  children: React.ReactNode
}

export function LabubuContainer({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}: LabubuContainerProps) {
  const variantStyles = {
    default: labubuStyles.components.container.default,
    centered: labubuStyles.components.container.centered,
    section: labubuStyles.components.container.section,
  }
  
  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎨 Labubu主题标题组件
interface LabubuHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4
  children: React.ReactNode
}

export function LabubuHeading({ 
  level = 1, 
  className, 
  children, 
  ...props 
}: LabubuHeadingProps) {
  const styles = {
    1: labubuStyles.text.heading.h1,
    2: labubuStyles.text.heading.h2,
    3: labubuStyles.text.heading.h3,
    4: labubuStyles.text.heading.h4,
  }
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  return React.createElement(
    Tag,
    {
      className: cn(styles[level], className),
      ...props,
    },
    children
  )
}

// 🎨 Labubu主题文本组件
interface LabubuTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'large' | 'default' | 'small'
  accent?: boolean
  children: React.ReactNode
}

export function LabubuText({ 
  variant = 'default', 
  accent = false,
  className, 
  children, 
  ...props 
}: LabubuTextProps) {
  const variantStyles = {
    large: labubuStyles.text.body.large,
    default: labubuStyles.text.body.default,
    small: labubuStyles.text.body.small,
  }
  
  const accentStyle = accent ? labubuStyles.text.accent.primary : ''
  
  return (
    <p
      className={cn(variantStyles[variant], accentStyle, className)}
      {...props}
    >
      {children}
    </p>
  )
}

// 🎨 Labubu主题页面包装器
interface LabubuPageProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: 'hero' | 'card' | 'labubu' | 'warm'
  children: React.ReactNode
}

export function LabubuPage({ 
  background = 'hero', 
  className, 
  children, 
  ...props 
}: LabubuPageProps) {
  const backgroundStyles = {
    hero: labubuStyles.backgrounds.hero,
    card: labubuStyles.backgrounds.card,
    labubu: labubuStyles.backgrounds.labubu,
    warm: labubuStyles.backgrounds.warm,
  }
  
  return (
    <div
      className={cn(
        'min-h-screen',
        backgroundStyles[background],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎨 Labubu主题网格布局
interface LabubuGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'responsive' | 'gallery' | 'auto'
  children: React.ReactNode
}

export function LabubuGrid({ 
  variant = 'responsive', 
  className, 
  children, 
  ...props 
}: LabubuGridProps) {
  const variantStyles = {
    responsive: labubuStyles.layout.grid.responsive,
    gallery: labubuStyles.layout.grid.gallery,
    auto: labubuStyles.layout.grid.auto,
  }
  
  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// 🎨 Labubu主题加载器
interface LabubuLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'warm'
}

export function LabubuLoader({ 
  size = 'md', 
  color = 'primary' 
}: LabubuLoaderProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }
  
  const colorStyles = {
    primary: 'border-labubu-400 border-t-transparent',
    warm: 'border-warm-400 border-t-transparent',
  }
  
  return (
    <div
      className={cn(
        'animate-spin rounded-full mx-auto',
        sizeStyles[size],
        colorStyles[color]
      )}
    />
  )
}

// 🎨 Labubu主题搜索框组件
interface LabubuSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void
  onClear?: () => void
  showClearButton?: boolean
}

export function LabubuSearch({ 
  onSearch, 
  onClear, 
  showClearButton = true,
  className, 
  ...props 
}: LabubuSearchProps) {
  return (
    <div className="relative group">
      <svg 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-labubu-400 w-5 h-5 cursor-pointer hover:text-labubu-600 transition-all duration-300 group-hover:scale-110" 
        onClick={onSearch}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <LabubuInput
        variant="search"
        className={cn("pl-12 pr-12 h-12 text-lg", className)}
        {...props}
      />
      {showClearButton && props.value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-labubu-400 hover:text-labubu-600 transition-all duration-300 hover:scale-110 hover:rotate-90"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// 🎨 导出所有组件
export {
  labubuStyles as styles,
}

// 🎨 样式工具函数
export const LabubuUtils = {
  // 创建样式类名
  createClass: (...classes: string[]) => classes.filter(Boolean).join(' '),
  
  // 条件样式
  conditional: (condition: boolean, trueClass: string, falseClass: string = '') => 
    condition ? trueClass : falseClass,
  
  // 组合Labubu主题样式
  combineStyles: (base: string, ...additional: string[]) => 
    [base, ...additional].filter(Boolean).join(' '),
} 