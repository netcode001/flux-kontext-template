import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Labubu主题色彩系统
  			'labubu': {
  				50: '#fdf4ff',
  				100: '#fae8ff', 
  				200: '#f5d0fe',
  				300: '#f0abfc',
  				400: '#e879f9',
  				500: '#d946ef', // 主色
  				600: '#c026d3',
  				700: '#a21caf',
  				800: '#86198f',
  				900: '#701a75'
  			},
  			// 辅助温暖色系
  			'warm': {
  				50: '#fffbeb',
  				100: '#fef3c7',
  				200: '#fde68a',
  				300: '#fcd34d',
  				400: '#fbbf24',
  				500: '#f59e0b',
  				600: '#d97706',
  				700: '#b45309',
  				800: '#92400e',
  				900: '#78350f'
  			},
  			// 柔和中性色
  			'soft': {
  				50: '#fafafa',
  				100: '#f5f5f5',
  				200: '#e5e5e5',
  				300: '#d4d4d4',
  				400: '#a3a3a3',
  				500: '#737373',
  				600: '#525252',
  				700: '#404040',
  				800: '#262626',
  				900: '#171717'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: {
  			'labubu-gradient': 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 25%, #f5d0fe 50%, #f0abfc 75%, #e879f9 100%)',
  			'warm-gradient': 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
  			'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
  			'hero-gradient': 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 20%, #f5d0fe 40%, #fffbeb 60%, #fef3c7 80%, #fde68a 100%)',
  		},
  		boxShadow: {
  			'labubu': '0 4px 20px rgba(217, 70, 239, 0.15)',
  			'warm': '0 4px 20px rgba(245, 158, 11, 0.15)',
  			'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
  			'card': '0 2px 15px rgba(0, 0, 0, 0.08)',
  			'hover': '0 8px 30px rgba(217, 70, 239, 0.2)',
  		},
  		container: {
  			center: true,
  			padding: {
  				DEFAULT: '1rem',
  				sm: '2rem',
  				lg: '4rem',
  				xl: '5rem',
  				'2xl': '6rem'
  			},
  			screens: {
  				sm: '640px',
  				md: '768px',
  				lg: '1024px',
  				xl: '1280px',
  				'2xl': '1536px'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		fontFamily: {
  			sans: ["var(--font-sans)", ...fontFamily.sans],
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/aspect-ratio'),
  ],
} satisfies Config;
