// 导入文案系统
import { footer } from "@/lib/content"

export function Footer() {

  const legalLinks = [
    { label: footer.legal.terms, href: "/terms" },
    { label: footer.legal.privacy, href: "/privacy" },
    { label: footer.legal.refund, href: "/refund" }
  ]

  return (
    <footer className="bg-gradient-to-br from-labubu-900 to-warm-900 border-t border-labubu-700/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-labubu-300 to-warm-300 bg-clip-text text-transparent">
              {footer.brand.name}
            </div>
            <p className="text-labubu-100 text-sm leading-relaxed">
              {footer.brand.description}
            </p>
            <div className="text-sm text-labubu-200">
              {footer.brand.copyright}
            </div>
          </div>

          {/* Contact & Legal - 右侧栏目 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-labubu-200">{footer.contact.title}</h3>
            <a
              href={`mailto:${footer.contact.email}`}
              className="block text-labubu-300 hover:text-labubu-100 hover:font-semibold active:scale-95 transition-all duration-200 text-sm"
            >
              {footer.contact.email}
            </a>

            <div className="pt-4">
              <h3 className="font-semibold text-labubu-200 mb-3">{footer.legal.title}</h3>
              <div className="space-y-2">
                {legalLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-labubu-300 hover:text-labubu-100 hover:font-semibold active:scale-95 transition-all duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-12 pt-8 border-t border-labubu-700/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-labubu-200">
              {footer.social.builtWith}
            </div>
            <div className="flex space-x-6">
              <a 
                href="https://x.com/fluxkontext" 
                className="text-labubu-300 hover:text-labubu-100 hover:scale-110 active:scale-95 transition-all duration-200" 
                aria-label="Follow us on X (Twitter)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/fluxkontext" 
                className="text-labubu-300 hover:text-labubu-100 hover:scale-110 active:scale-95 transition-all duration-200" 
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="https://pinterest.com/fluxkontext" 
                className="text-labubu-300 hover:text-labubu-100 hover:scale-110 active:scale-95 transition-all duration-200" 
                aria-label="Follow us on Pinterest"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.223.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
