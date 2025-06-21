"use client"

import { useState } from "react"
import { DynamicNavigation } from "@/components/DynamicNavigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Zap, 
  Shield, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Book,
  Terminal,
  Key,
  Globe
} from "lucide-react"

const apiEndpoints = [
  {
    id: "text-to-image-pro",
    name: "Text to Image (Pro)",
    method: "POST",
    endpoint: "/api/v1/flux/text-to-image/pro",
    description: "Generate high-quality images from text prompts using Flux Pro model",
    pricing: "$0.05 per request",
    category: "Generation"
  },
  {
    id: "text-to-image-max",
    name: "Text to Image (Max)",
    method: "POST", 
    endpoint: "/api/v1/flux/text-to-image/max",
    description: "Generate ultra-high quality images using Flux Max model",
    pricing: "$0.08 per request",
    category: "Generation"
  },
  {
    id: "image-edit-pro",
    name: "Image Edit (Pro)",
    method: "POST",
    endpoint: "/api/v1/flux/image-edit/pro", 
    description: "Edit existing images with text instructions using Flux Pro",
    pricing: "$0.05 per request",
    category: "Editing"
  },
  {
    id: "image-edit-max",
    name: "Image Edit (Max)",
    method: "POST",
    endpoint: "/api/v1/flux/image-edit/max",
    description: "Edit existing images with highest quality using Flux Max",
    pricing: "$0.08 per request", 
    category: "Editing"
  }
]

const codeExamples = {
  curl: `curl -X POST "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "aspect_ratio": "16:9",
    "guidance_scale": 3.5,
    "num_images": 1,
    "safety_tolerance": 3
  }'`,
  
  javascript: `const response = await fetch('https://api.fluxkontext.space/api/v1/flux/text-to-image/pro', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over mountains',
    aspect_ratio: '16:9',
    guidance_scale: 3.5,
    num_images: 1,
    safety_tolerance: 3
  })
});

const result = await response.json();
console.log(result);`,

  python: `import requests

url = "https://api.fluxkontext.space/api/v1/flux/text-to-image/pro"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "prompt": "A beautiful sunset over mountains",
    "aspect_ratio": "16:9", 
    "guidance_scale": 3.5,
    "num_images": 1,
    "safety_tolerance": 3
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`,

  nodejs: `const axios = require('axios');

const config = {
  method: 'post',
  url: 'https://api.fluxkontext.space/api/v1/flux/text-to-image/pro',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  data: {
    prompt: 'A beautiful sunset over mountains',
    aspect_ratio: '16:9',
    guidance_scale: 3.5,
    num_images: 1,
    safety_tolerance: 3
  }
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.log(error));`
}

export function ApiDocumentation() {
  const [activeCode, setActiveCode] = useState("curl")
  const [copiedCode, setCopiedCode] = useState("")

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(type)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DynamicNavigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Badge variant="secondary" className="mr-3">
                <Terminal className="w-3 h-3 mr-1" />
                Developer API
              </Badge>
              <Badge variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                v1.0
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Flux Kontext Developer API
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Powerful REST API for AI image generation. Easy integration, transparent pricing, and reliable service for professional developers.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-sm font-medium">$0.05</div>
                <div className="text-xs text-muted-foreground">Starting Price</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-sm font-medium">~10s</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm font-medium">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-sm font-medium">Global</div>
                <div className="text-xs text-muted-foreground">CDN</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-2 bg-muted/20 rounded-lg p-2">
              <button
                onClick={() => scrollToSection('overview')}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                📖 Overview
              </button>
              <button
                onClick={() => scrollToSection('endpoints')}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                🔗 Endpoints
              </button>
              <button
                onClick={() => scrollToSection('code-examples')}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                💻 Code Examples
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                💰 Pricing
              </button>
              <button
                onClick={() => scrollToSection('authentication')}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                🔐 Authentication
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Overview Tab */}
          <div id="overview" className="space-y-8 mb-16">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-muted-foreground">
                The Flux Kontext API provides a simple REST interface to our AI image generation models. 
                Our API offers reliable service with transparent pricing and professional-grade infrastructure.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Why Choose Our API?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Transparent and competitive pricing</li>
                    <li>• Reliable service with 99.9% uptime</li>
                    <li>• Simple account management</li>
                    <li>• Streamlined authentication</li>
                    <li>• Comprehensive documentation</li>
                    <li>• Developer-friendly error handling</li>
                  </ul>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                    Quick Start
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Get your API key from dashboard</li>
                    <li>2. Make your first request</li>
                    <li>3. Handle the response</li>
                    <li>4. Integrate into your application</li>
                  </ol>
                  <Button className="mt-4 w-full" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Get API Key
                  </Button>
                </div>
              </div>

              <div className="bg-muted/20 border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Base URL</h3>
                <code className="bg-muted px-3 py-1 rounded text-sm">
                  https://api.fluxkontext.space
                </code>
              </div>
            </div>
          </div>

          {/* Endpoints Tab */}
          <div id="endpoints" className="space-y-6 mb-16">
            <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>
            
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="mr-3">
                        {endpoint.method}
                      </Badge>
                      <Badge variant="secondary">
                        {endpoint.category}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {endpoint.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {endpoint.pricing}
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-4">
                  <code className="text-sm">
                    {endpoint.method} {endpoint.endpoint}
                  </code>
                </div>
              </div>
            ))}
          </div>

          {/* Code Examples Tab */}
          <div id="code-examples" className="space-y-6 mb-16">
            <h2 className="text-2xl font-bold mb-6">Code Examples</h2>
            
            {/* Language Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCode(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeCode === lang
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">
                    {activeCode.charAt(0).toUpperCase() + activeCode.slice(1)} Example
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(codeExamples[activeCode as keyof typeof codeExamples], activeCode)}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode === activeCode ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-gray-300 text-sm overflow-x-auto">
                  <code>{codeExamples[activeCode as keyof typeof codeExamples]}</code>
                </pre>
              </div>
            </div>

            {/* Response Example */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Response Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-300 text-sm">
                  <code>{`{
  "status": "success",
  "request_id": "req_123456789",
  "data": {
    "images": [
      {
        "url": "https://cdn.fluxkontext.space/generated/image_123.jpg",
        "width": 1024,
        "height": 576,
        "seed": 42,
        "content_type": "image/jpeg"
      }
    ]
  },
  "usage": {
    "credits_used": 1,
    "processing_time": 8.5
  },
  "billing": {
    "total_cost": 0.05
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Pricing Tab */}
          <div id="pricing" className="space-y-6 mb-16">
            <h2 className="text-2xl font-bold mb-6">API Pricing</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">Simple & Transparent Pricing</h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Our API offers straightforward pricing with no hidden fees. Pay only for what you use with competitive rates for professional AI image generation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-gray-800/70 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">Model Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Flux Kontext Pro</span>
                      <span className="font-mono font-medium">$0.05</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Flux Kontext Max</span>
                      <span className="font-mono font-medium">$0.08</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">What You Get</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Professional API service</li>
                    <li>• Simple account management</li>
                    <li>• Streamlined authentication</li>
                    <li>• 99.9% uptime guarantee</li>
                    <li>• Developer support</li>
                    <li>• Usage analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold">Model Pricing</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="text-left p-4 font-medium">Model</th>
                      <th className="text-left p-4 font-medium">Price per Request</th>
                      <th className="text-left p-4 font-medium">Quality</th>
                      <th className="text-left p-4 font-medium">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">Flux Kontext Pro</td>
                      <td className="p-4 font-mono font-medium text-green-600">$0.05</td>
                      <td className="p-4">High Quality</td>
                      <td className="p-4 text-muted-foreground">General purpose, fast generation</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">Flux Kontext Max</td>
                      <td className="p-4 font-mono font-medium text-green-600">$0.08</td>
                      <td className="p-4">Ultra High Quality</td>
                      <td className="p-4 text-muted-foreground">Professional, detailed images</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Authentication Tab */}
          <div id="authentication" className="space-y-6 mb-16">
            <h2 className="text-2xl font-bold mb-6">Authentication</h2>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">API Key Authentication</h3>
              <p className="text-muted-foreground mb-4">
                All API requests require authentication using your API key. Include your API key in the Authorization header.
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <code className="text-gray-300 text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Getting Your API Key</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Sign up for a Flux Kontext account</li>
                    <li>2. Go to your dashboard</li>
                    <li>3. Navigate to API section</li>
                    <li>4. Generate a new API key</li>
                    <li>5. Copy and store it securely</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Security Best Practices</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Never expose API keys in client-side code</li>
                    <li>• Use environment variables</li>
                    <li>• Rotate keys regularly</li>
                    <li>• Monitor usage for anomalies</li>
                    <li>• Use HTTPS for all requests</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Keep Your API Key Secure
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Your API key provides access to your account and will be charged for usage. 
                    Never share it publicly or include it in client-side code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of developers using our reliable API for AI image generation. 
              Start building amazing applications today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="min-w-[200px]">
                <Key className="w-4 h-4 mr-2" />
                Get API Key
              </Button>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 