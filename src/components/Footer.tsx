// 导入文案系统
import { footer } from "@/lib/content"

export function Footer() {

  const legalLinks = [
    { label: footer.legal.terms, href: "/terms" },
    { label: footer.legal.privacy, href: "/privacy" },
    { label: footer.legal.refund, href: "/refund" }
  ]

  return (
    <footer className="w-full text-center mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="max-w-4xl mx-auto">
            {/* 品牌Logo和标题 */}
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">L</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {footer.brand.name}
              </span>
            </div>
            
            {/* 品牌描述 */}
            <p className="text-gray-600 mb-6">
              {footer.brand.description}
            </p>
            
            {/* 导航链接 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-6">
              <a href="/about" className="hover:text-purple-500 transition-colors">
                About Us
              </a>
              {legalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-purple-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`mailto:${footer.contact.email}`}
                className="hover:text-purple-500 transition-colors"
              >
                Contact Us
              </a>
            </div>
            
            {/* 社交媒体图标 */}
            <div className="flex justify-center space-x-6 mb-6">
              <a 
                href="https://x.com/fluxkontext" 
                className="text-gray-400 hover:text-purple-500 hover:scale-110 transition-all duration-200" 
                aria-label="Follow us on X (Twitter)"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/fluxkontext" 
                className="text-gray-400 hover:text-purple-500 hover:scale-110 transition-all duration-200" 
                aria-label="Follow us on Twitter"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="https://pinterest.com/fluxkontext" 
                className="text-gray-400 hover:text-purple-500 hover:scale-110 transition-all duration-200" 
                aria-label="Follow us on Pinterest"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.223.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.878-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017 0z"/>
                </svg>
              </a>
            </div>
            
            {/* 版权信息 */}
            <div className="text-sm text-gray-400">
              {footer.brand.copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
