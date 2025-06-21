"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DynamicNavigation } from "@/components/DynamicNavigation"
import { Footer } from "@/components/Footer"
import { ProductSchema } from "@/components/StructuredData"
import { 
  Check, 
  Zap, 
  Crown, 
  Building2, 
  Star,
  AlertTriangle,
  CreditCard,
  Package,
  Loader2
} from "lucide-react"
import { pricing, common } from "@/lib/content"

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  creemProductIds?: {
    monthly: string
    yearly: string
  }
  features: string[]
  isPopular?: boolean
  buttonText?: string
}

interface CreditPack {
  id: string
  name: string
  description: string
  credits: number
  price: number
  creemProductId?: string
  features: string[]
  isPopular?: boolean
  buttonText?: string
}

// 使用pricing模块的数据
const pricingPlans: PricingPlan[] = pricing.plans
const creditPacks: CreditPack[] = pricing.creditPacks
const pricingFAQs = pricing.faq

// 分离出使用useSearchParams的组件
function PricingTabHandler({ 
  setActiveTab 
}: { 
  setActiveTab: (tab: string) => void 
}) {
  const searchParams = useSearchParams()

  // 根据URL参数设置初始标签
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'credits') {
      setActiveTab('credits')
    } else if (tab === 'subscription') {
      setActiveTab('subscription')
    }
  }, [searchParams, setActiveTab])

  return null // 这个组件只处理逻辑，不渲染任何内容
}

// 主要的定价内容组件
function PricingMainContent() {
  const [isYearly, setIsYearly] = useState(true)
  const [activeTab, setActiveTab] = useState("subscription")
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null)

  // 🔥 处理支付按钮点击
  const handlePayment = async (
    productType: 'subscription' | 'creditPack',
    productId: string,
    amount: number,
    billingCycle?: 'monthly' | 'yearly'
  ) => {
    try {
      setLoadingPayment(productId)

      // 调用支付API
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          productId,
          billingCycle,
          amount: amount * 100, // 转换为分
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // 用户未登录，跳转到登录页面
          window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(data.error || 'Payment creation failed')
      }

      if (data.success && data.checkoutUrl) {
        // 跳转到CREEM支付页面
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('Payment link creation failed')
      }

    } catch (error) {
      console.error('Payment processing failed:', error)
      alert(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingPayment(null)
    }
  }

  return (
    <>
      <DynamicNavigation />
      
      {/* 添加产品结构化数据 */}
      <ProductSchema />

      {/* Main Content - 优化后的紧凑布局 */}
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section - 统一的标题区域 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              {pricing.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {pricing.description}
            </p>
          </div>

          {/* Plan Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-muted/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("subscription")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  activeTab === "subscription"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pricing.tabs.subscriptionPlans}
              </button>
              <button
                onClick={() => setActiveTab("credits")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  activeTab === "credits"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pricing.tabs.creditPacks}
              </button>
            </div>
          </div>

          {/* Billing Toggle - 只在订阅计划时显示 */}
          {activeTab === "subscription" && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium transition-all duration-300 ${!isYearly ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                  {pricing.billing.monthly}
                </span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ${
                    isYearly 
                      ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 focus:ring-indigo-300 dark:focus:ring-indigo-500' 
                      : 'bg-gradient-to-r from-slate-300 via-slate-350 to-slate-400 dark:from-slate-600 dark:via-slate-650 dark:to-slate-700 focus:ring-slate-300 dark:focus:ring-slate-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                      isYearly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium transition-all duration-300 ${isYearly ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                  {pricing.billing.yearly}
                </span>
                {isYearly && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ml-2 animate-pulse">
                    {pricing.billing.savePercent}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Subscription Plans */}
          {activeTab === "subscription" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-card border rounded-lg p-6 ${
                    plan.isPopular
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  } transition-all duration-300`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {common.buttons.mostPopular}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={`${plan.id}-feature-${index}`} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                    disabled={loadingPayment === plan.id}
                    onClick={() => {
                      // 🔧 修复：Basic计划（免费计划）直接跳转到generate页面
                      if (plan.id === 'basic' || plan.monthlyPrice === 0 || plan.yearlyPrice === 0) {
                        window.location.href = '/generate'
                        return
                      }
                      
                      // 付费计划处理支付
                      if (plan.creemProductIds) {
                        const productId = isYearly ? plan.creemProductIds.yearly : plan.creemProductIds.monthly
                        const amount = isYearly ? plan.yearlyPrice : plan.monthlyPrice
                        const billingCycle = isYearly ? 'yearly' : 'monthly'
                        handlePayment('subscription', productId, amount, billingCycle)
                      }
                    }}
                  >
                    {loadingPayment === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.buttonText || "Get Started"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Credit Packs */}
          {activeTab === "credits" && (
            <div id="credits" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative bg-card border rounded-lg p-6 ${
                    pack.isPopular
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  } transition-all duration-300`}
                >
                  {pack.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {common.buttons.mostPopular}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{pack.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{pack.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">${pack.price}</span>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pack.credits} credits
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pack.features.map((feature, index) => (
                      <div key={`${pack.id}-feature-${index}`} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={pack.isPopular ? "default" : "outline"}
                    disabled={loadingPayment === pack.id}
                    onClick={() => {
                      if (pack.creemProductId) {
                        handlePayment('creditPack', pack.creemProductId, pack.price)
                      }
                    }}
                  >
                    {loadingPayment === pack.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      pack.buttonText || "Purchase"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {pricingFAQs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Suspense包装的URL参数处理器 */}
      <Suspense fallback={null}>
        <PricingTabHandler setActiveTab={setActiveTab} />
      </Suspense>
    </>
  )
}

// 主导出组件，包含Suspense边界
export function PricingContent() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pricing...</p>
          </div>
        </div>
      }>
        <PricingMainContent />
      </Suspense>
    </div>
  )
} 