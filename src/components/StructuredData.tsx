import Script from 'next/script'

// 组织信息Schema
export function OrganizationSchema() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LabubuHub",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/logo.png`,
      "width": 256,
      "height": 256
    },
    "description": "Professional AI image generation platform powered by LabubuHub. Create stunning images from text descriptions with advanced AI technology.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@fluxkontext.space",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://twitter.com/fluxkontext",
      "https://github.com/fluxkontext/fluxkontext.space"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
}

// 网站信息Schema
export function WebSiteSchema() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LabubuHub",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space",
    "description": "Professional AI image generation platform powered by LabubuHub. Create stunning images from text descriptions with advanced AI technology.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LabubuHub"
    }
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
    />
  )
}

// 软件应用Schema
export function SoftwareApplicationSchema() {
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LabubuHub AI Image Generator",
    "description": "Professional AI image generation platform. Create stunning images from text descriptions with advanced LabubuHub AI technology.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space",
    "applicationCategory": "ImageEditingApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free AI image generation with LabubuHub",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "LabubuHub"
    },
    "featureList": [
      "Text to image AI generation",
      "Image editing with AI",
      "Multiple image processing",
      "Professional image output",
      "LabubuHub Pro and Max models",
      "AI-powered image creation"
    ],
    "screenshot": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/screenshot.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "850",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
    />
  )
}

// 产品Schema (用于定价页面)
export function ProductSchema() {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "LabubuHub AI Image Generation Service",
    "description": "Professional AI image generation service with multiple pricing plans powered by LabubuHub technology",
    "brand": {
      "@type": "Brand",
      "name": "LabubuHub"
    },
    "category": "Software",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Free AI image generation with basic features"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "19.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Enhanced AI image generation with LabubuHub Pro"
      },
      {
        "@type": "Offer",
        "name": "Max Plan",
        "price": "39.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Premium AI image generation with LabubuHub Max"
      },
      {
        "@type": "Offer",
        "name": "Enterprise Plan",
        "price": "99.99",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "description": "Enterprise-grade AI image generation with priority support"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "850",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }}
    />
  )
}

// FAQ Schema
export function FAQSchema({ faqs }: { faqs: Array<{question: string, answer: string}> }) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  )
}

// 面包屑导航Schema
export function BreadcrumbSchema({ items }: { 
  items: Array<{name: string, url: string}> 
}) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
    />
  )
}

// 视频对象Schema (用于展示视频内容)
export function VideoObjectSchema({ 
  name, 
  description, 
  thumbnailUrl, 
  uploadDate, 
  duration 
}: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration: string
}) {
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "duration": duration,
    "contentUrl": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/videos/sample.mp4`,
    "embedUrl": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/embed/sample`,
    "publisher": {
      "@type": "Organization",
      "name": "LabubuHub",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://fluxkontext.space"}/logo.png`
      }
    }
  }

  return (
    <Script
      id="video-object-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(videoData) }}
    />
  )
}

// 如何做Schema (用于教程页面)
export function HowToSchema({ 
  name, 
  description, 
  steps 
}: {
  name: string
  description: string
  steps: Array<{name: string, text: string}>
}) {
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  }

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToData) }}
    />
  )
}

// 结构化数据组件 - 实现Schema.org标记
export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LabubuHub",
    "url": "https://fluxkontext.space",
    "logo": "https://fluxkontext.space/logo.png",
    "description": "Professional AI image generation platform powered by LabubuHub. Create stunning images from text descriptions with advanced AI technology.",
    "sameAs": [
      "https://twitter.com/fluxkontext",
      "https://github.com/fluxkontext"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@fluxkontext.space",
      "contactType": "customer service"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LabubuHub",
    "url": "https://fluxkontext.space",
    "description": "Professional AI image generation platform",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fluxkontext.space/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LabubuHub AI Image Generator",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "description": "AI-powered image generation platform for creating professional images from text descriptions",
    "url": "https://fluxkontext.space",
    "author": {
      "@type": "Organization",
      "name": "LabubuHub"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier available"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema)
        }}
      />
    </>
  )
} 