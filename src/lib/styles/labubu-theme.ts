// Labubu主题样式配置
export const labubuStyles = {
  // 基础色彩类名
  colors: {
    primary: 'text-labubu-600',
    primaryBg: 'bg-labubu-500',
    primaryGradient: 'bg-gradient-to-r from-labubu-500 to-labubu-600',
    secondary: 'text-soft-700',
    accent: 'text-warm-500',
    accentGradient: 'bg-gradient-to-r from-warm-400 to-warm-500',
  },

  // 背景渐变
  backgrounds: {
    hero: 'bg-hero-gradient',
    card: 'bg-card-gradient',
    labubu: 'bg-labubu-gradient',
    warm: 'bg-warm-gradient',
    white: 'bg-white/95',
  },

  // 阴影效果
  shadows: {
    soft: 'shadow-soft',
    card: 'shadow-card',
    labubu: 'shadow-labubu',
    hover: 'shadow-hover',
    warm: 'shadow-warm',
  },

  // 边框圆角
  rounded: {
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-3xl',
    full: 'rounded-full',
  },

  // 过渡动画
  transitions: {
    default: 'transition-all duration-300',
    fast: 'transition-all duration-200',
    slow: 'transition-all duration-500',
  },

  // 悬停效果
  hover: {
    scale: 'hover:scale-105',
    scaleSmall: 'hover:scale-102',
    lift: 'hover:-translate-y-0.5',
    shadow: 'hover:shadow-labubu',
  },

  // 激活效果
  active: {
    scale: 'active:scale-95',
    scaleSmall: 'active:scale-98',
  },

  // 文本样式
  text: {
    // 标题样式
    heading: {
      h1: 'text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-labubu-600 to-warm-500 bg-clip-text text-transparent',
      h2: 'text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-labubu-600 to-warm-500 bg-clip-text text-transparent',
      h3: 'text-xl md:text-2xl lg:text-3xl font-semibold text-labubu-700',
      h4: 'text-lg md:text-xl lg:text-2xl font-semibold text-labubu-600',
    },

    // 正文样式
    body: {
      large: 'text-lg text-soft-700 leading-relaxed',
      default: 'text-base text-soft-600 leading-relaxed',
      small: 'text-sm text-soft-500 leading-relaxed',
    },

    // 强调样式
    accent: {
      primary: 'text-labubu-600 font-medium',
      secondary: 'text-warm-500 font-medium',
    },
  },

  // 布局样式
  layout: {
    // 网格布局
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      gallery: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
      auto: 'grid grid-cols-auto-fit gap-6',
    },

    // 弹性布局
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      column: 'flex flex-col items-center',
    },
  },

  // 常用组件样式
  components: {
    // 按钮样式
    button: {
      primary: 'bg-gradient-to-r from-labubu-500 to-labubu-600 text-white hover:from-labubu-600 hover:to-labubu-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-labubu hover:shadow-hover rounded-2xl',
      secondary: 'border-labubu-300 text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl hover:border-labubu-400 hover:shadow-soft',
      ghost: 'text-soft-700 hover:text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl',
      warm: 'bg-gradient-to-r from-warm-400 to-warm-500 text-white hover:from-warm-500 hover:to-warm-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-warm hover:shadow-hover rounded-2xl',
    },

    // 卡片样式
    card: {
      default: 'bg-white/95 backdrop-blur-lg border border-labubu-200/30 rounded-2xl shadow-card hover:shadow-hover transition-all duration-300',
      gradient: 'bg-gradient-to-br from-white to-labubu-50/30 border border-labubu-200/30 rounded-2xl shadow-card hover:shadow-hover transition-all duration-300',
      interactive: 'bg-white/95 backdrop-blur-lg border border-labubu-200/30 rounded-2xl shadow-card hover:shadow-hover hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer',
    },

    // 输入框样式
    input: {
      default: 'border-labubu-200/50 rounded-2xl focus:border-labubu-400 focus:ring-labubu-400/20 transition-all duration-300',
      search: 'border-labubu-200/50 rounded-full focus:border-labubu-400 focus:ring-labubu-400/20 transition-all duration-300 pl-10',
    },

    // 标签样式
    badge: {
      primary: 'bg-gradient-to-r from-labubu-100 to-labubu-200 text-labubu-600 border border-labubu-300/30 rounded-full px-3 py-1 text-xs font-medium',
      secondary: 'bg-gradient-to-r from-soft-100 to-soft-200 text-soft-600 border border-soft-300/30 rounded-full px-3 py-1 text-xs font-medium',
      warm: 'bg-gradient-to-r from-warm-100 to-warm-200 text-warm-600 border border-warm-300/30 rounded-full px-3 py-1 text-xs font-medium',
    },

    // 导航样式
    nav: {
      link: 'relative transition-all duration-300 hover:font-semibold active:scale-95 flex items-center space-x-2 px-4 py-2 rounded-2xl hover:shadow-labubu hover:-translate-y-0.5',
      activeLink: 'text-labubu-600 font-semibold bg-gradient-to-r from-labubu-50 to-labubu-100 shadow-labubu',
      inactiveLink: 'text-soft-700 hover:text-labubu-600 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50',
      dropdown: 'bg-white/95 backdrop-blur-lg border border-labubu-200/30 rounded-2xl shadow-card py-3',
      dropdownItem: 'flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-labubu-50 hover:to-warm-50 rounded-xl mx-2 hover:scale-105 active:scale-95',
    },

    // 页眉样式
    header: {
      default: 'bg-white/70 backdrop-blur-md shadow-soft border-b border-labubu-200/30',
      transparent: 'bg-transparent',
    },

    // 容器样式
    container: {
      default: 'container mx-auto px-4',
      centered: 'container mx-auto px-4 text-center',
      section: 'py-16 px-4',
    },
  },
}

// 快捷方法
export const lb = labubuStyles

// 组合样式生成器
export const createLabubuClass = (...classes: string[]) => {
  return classes.join(' ')
}

// 条件样式生成器
export const conditionalLabubuClass = (condition: boolean, trueClass: string, falseClass: string = '') => {
  return condition ? trueClass : falseClass
} 