"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StandardTurnstile, verifyStandardTurnstileToken } from "@/components/StandardTurnstile"
import { UpgradePrompt, FeatureLocked } from "@/components/UpgradePrompt"
import { CreditDisplay } from "@/components/CreditDisplay"
import { SmartImagePreview } from "@/components/SmartImagePreview"
import { 
  Upload, 
  Wand2, 
  Image as ImageIcon, 
  Loader2,
  Download,
  Settings,
  Zap,
  Layers,
  Edit,
  Plus,
  X,
  AlertCircle,
  Shield,
  RefreshCw,
  Lock,
  Crown,
  Copy,
  Sparkles,
  Info,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
// 内容配置
import { generator, common } from "@/lib/content"
// Labubu风格组件
import { LabubuCard, LabubuButton, LabubuInput, LabubuBadge, LabubuHeading, LabubuText, LabubuLoader } from "@/components/ui/labubu-ui"
// Labubu主题样式
import { labubuStyles, lb } from "@/lib/styles/labubu-theme"

// 用户权限系统
import { 
  UserType, 
  getCurrentUserType, 
  getUserLimits, 
  getImageCountOptions, 
  getAvailableModels, 
  getAvailableAspectRatios,
  hasFeature,
  needsUpgrade
} from "@/lib/user-tiers"

// Flux Kontext模型类型
type FluxKontextAction = 
  | 'text-to-image-pro'
  | 'text-to-image-max'
  | 'text-to-image-schnell'
  | 'text-to-image-dev'
  | 'text-to-image-realism'
  | 'text-to-image-anime'
  | 'edit-image-pro'
  | 'edit-image-max'
  | 'edit-multi-image-pro'
  | 'edit-multi-image-max'

interface GeneratedImage {
  url: string
  width?: number
  height?: number
  prompt: string
  action: FluxKontextAction
  timestamp: number
}

interface GenerationRequest {
  action: FluxKontextAction
  prompt: string
  image_url?: string
  image_urls?: string[]
  aspect_ratio?: string
  guidance_scale?: number
  num_images?: number
  safety_tolerance?: string
  output_format?: string
  seed?: number
  turnstile_token?: string
}

export function FluxKontextGenerator() {
  const router = useRouter()
  const { data: session } = useSession()
  
  // 用户状态
  const [userType, setUserType] = useState<UserType>(UserType.ANONYMOUS)
  const [userLimits, setUserLimits] = useState(getUserLimits(UserType.ANONYMOUS))
  
  // 文本生成图像状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState("")
  
  // Turnstile验证状态
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false)
  const [turnstileError, setTurnstileError] = useState("")
  const [isTurnstileEnabled, setIsTurnstileEnabled] = useState(false)
  
  // 生成参数状态
  const [textPrompt, setTextPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<'pro' | 'max' | 'schnell' | 'dev' | 'realism' | 'anime'>('pro')
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numImages, setNumImages] = useState(1)
  const [safetyTolerance, setSafetyTolerance] = useState("2")
  const [outputFormat, setOutputFormat] = useState("jpeg")
  const [seed, setSeed] = useState<number | undefined>(undefined)
  
  // 图像编辑状态
  const [editPrompt, setEditPrompt] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  // UI状态
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null)
  const [copySuccess, setCopySuccess] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(6)
  
  // 新增：高级设置面板显示状态
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)
  
  // 文件输入引用
  const multiFileInputRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)

  // 自动检测用户类型
  const detectUserType = useCallback((): UserType => {
    if (session?.user?.email) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 User logged in:', session.user.email)
      }
      if ((session.user as any)?.isPremium || (session.user as any)?.subscription?.status === 'active') {
        if (process.env.NODE_ENV === 'development') {
          console.log('👑 Detected as PREMIUM user')
        }
        return UserType.PREMIUM
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Detected as REGISTERED user')
      }
      return UserType.REGISTERED
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 Detected as ANONYMOUS user')
    }
    return UserType.ANONYMOUS
  }, [session])

  // 初始化用户类型
  useEffect(() => {
    const currentUserType = detectUserType()
    setUserType(currentUserType)
    setUserLimits(getUserLimits(currentUserType))
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 User status detection:', {
        session: !!session,
        email: session?.user?.email,
        userType: currentUserType,
        maxImages: getUserLimits(currentUserType).maxImages,
        requiresTurnstile: getUserLimits(currentUserType).requiresTurnstile
      })
    }
    
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === "true"
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    setIsTurnstileEnabled(isEnabled && !!siteKey)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🛡️ Turnstile config:', {
        enabled: isEnabled,
        siteKey: !!siteKey,
        requiresForUser: getUserLimits(currentUserType).requiresTurnstile
      })
    }
  }, [session, detectUserType])

  // 获取可用模型 - 提供完整的模型信息
  const getAvailableModelsForContext = useCallback(() => {
    const hasUploadedImages = uploadedImages.length > 0
    const allowedModels = getAvailableModels(userType)
    
    // 定义所有可用模型的详细信息
    const allModels = [
      {
        value: 'pro',
        label: '⚡ Kontext [pro]',
        description: 'Fast generation with good quality',
        credits: 16,
        speed: 'Fast (6-10s)',
        quality: 'Good Quality',
        available: allowedModels.includes('pro'),
        recommended: true,
        features: ['Fast generation speed', 'Character consistency', 'Style reference support', 'Cost effective']
      },
      {
        value: 'max',
        label: '🚀 Kontext [max]',
        description: 'Best quality with enhanced features',
        credits: 32,
        speed: 'Slower (10-15s)',
        quality: 'Excellent Quality',
        available: allowedModels.includes('max'),
        recommended: false,
        features: ['Best quality output', 'Advanced AI processing', 'Enhanced detail generation', 'Premium features']
      }
    ]
    
    // 如果有上传图片且是多图片，为max模型创建multi-edit版本
    const isMultiImage = uploadedImages.length > 1
    if (hasUploadedImages && isMultiImage) {
      const maxModel = allModels.find(m => m.value === 'max')
      if (maxModel && maxModel.available) {
        allModels.push({
          ...maxModel,
          value: 'max-multi' as any,
          label: '🚀 Kontext [max-multi]',
          description: 'Multi-image editing with best quality',
          credits: maxModel.credits + 8
        })
      }
    }
    
    return allModels.filter(model => model.available)
  }, [userType, uploadedImages.length])

  // 获取当前模型信息
  const getCurrentModelInfo = useCallback(() => {
    const models = getAvailableModelsForContext()
    const isMultiImage = uploadedImages.length > 1
    let currentValue = selectedModel
    
    if (uploadedImages.length > 0 && isMultiImage && selectedModel === 'max') {
      currentValue = 'max-multi' as any
    }
    
    return models.find(m => m.value === currentValue) || models[0]
  }, [selectedModel, getAvailableModelsForContext])

  // 文件上传处理
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB
      
      if (!isValidType) {
        setError("Please upload only image files")
        return false
      }
      if (!isValidSize) {
        setError("File size must be less than 50MB")
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        const data = await response.json()
        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...urls])
      setUploadedFiles(prev => [...prev, ...validFiles])
      setError("")
    } catch (error) {
      console.error('Upload error:', error)
      setError("Upload failed. Please try again.")
    }
  }

  // 清除上传的图片
  const clearUpload = () => {
    setUploadedImages([])
    setUploadedFiles([])
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = ''
    }
  }

  // 生成图像
  const handleGenerate = async () => {
    if (!textPrompt.trim()) {
      setError("Please enter a description for the image you want to create.")
      return
    }

    if (userLimits.requiresTurnstile && isTurnstileEnabled && !isTurnstileVerified) {
      setError("Please complete the security verification.")
      return
    }

    const currentModelInfo = getCurrentModelInfo()
    if (!currentModelInfo?.available) {
      if (userType === UserType.ANONYMOUS) {
        setError("Please sign up to use this feature.")
        return
      } else {
        setError("This model requires an upgrade. Please upgrade your plan.")
            return
          }
    }

      setIsGenerating(true)
      setError("")
    
    try {
      let action: FluxKontextAction
      const hasImages = uploadedImages.length > 0
      const isMultiImage = uploadedImages.length > 1
      
      if (hasImages) {
        action = isMultiImage 
          ? `edit-multi-image-${selectedModel}` as FluxKontextAction
          : `edit-image-${selectedModel}` as FluxKontextAction
      } else {
        action = `text-to-image-${selectedModel}` as FluxKontextAction
      }

      const requestData: GenerationRequest = {
        action,
        prompt: textPrompt,
        aspect_ratio: aspectRatio,
        guidance_scale: guidanceScale,
        num_images: numImages,
        safety_tolerance: safetyTolerance,
        output_format: outputFormat,
        seed: seed,
        turnstile_token: turnstileToken
      }

      if (hasImages) {
        if (isMultiImage) {
          requestData.image_urls = uploadedImages
        } else {
          requestData.image_url = uploadedImages[0]
        }
      }

      setLastRequest(requestData)
      
        const response = await fetch('/api/flux-kontext', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

        if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      if (data.images && data.images.length > 0) {
        const newImages: GeneratedImage[] = data.images.map((imageData: any) => ({
          url: imageData.url,
          width: imageData.width,
          height: imageData.height,
          prompt: textPrompt,
          action,
            timestamp: Date.now()
        }))
        
        setGeneratedImages(prev => [...newImages, ...prev])
        setRetryCount(0)
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      setError(error.message || 'Failed to generate image')
        setRetryCount(prev => prev + 1)
    } finally {
      setIsGenerating(false)
      }
    }

  // 重试生成
  const handleRetry = () => {
    if (lastRequest) {
      handleGenerate()
    }
  }

  // 随机种子
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000)
    setSeed(randomSeed)
  }

  // AI增强提示词
  const handleEnhancePrompt = async () => {
    if (!textPrompt.trim()) return
    
    try {
      const response = await fetch('/api/parse-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: textPrompt,
          action: 'enhance_prompt'
        })
        })
        
        if (response.ok) {
        const data = await response.json()
        if (data.enhanced_prompt) {
          setTextPrompt(data.enhanced_prompt)
        }
      }
    } catch (error) {
      console.error('Enhance prompt error:', error)
    }
  }

  const currentModelInfo = getCurrentModelInfo()

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 flex-1">{error}</span>
          <div className="flex gap-2">
            {error.includes("Upgrade required") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/pricing')}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade Now
              </Button>
            )}
            {lastRequest && retryCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 主要生成界面卡片 */}
      <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6 mb-6">
        
        {/* 顶部：只保留标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            LabubuHub AI Generator
          </h1>
        </div>

        {/* 第一行: Image Description 输入框 */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Image Description</Label>
          <div className="relative">
            <Textarea 
              placeholder="A pink fluffy Labubu dancing on a rainbow..."
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              className="w-full h-20 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-labubu-500 focus:border-labubu-500 text-sm bg-white text-gray-900 placeholder:text-gray-500"
            />
            <Button 
              size="sm"
              variant="ghost"
              onClick={handleEnhancePrompt}
              disabled={!textPrompt.trim()}
              className="absolute top-2 right-2 text-xs bg-labubu-100 text-labubu-700 hover:bg-labubu-200 transition-colors pointer-events-auto z-10"
            >
              ✨ AI Enhance
            </Button>
          </div>
        </div>

        {/* 第二行: 设置和操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
          {/* Reference Image */}
          <div className="lg:col-span-1">
            <Label className="block text-sm font-medium text-gray-700 mb-2 text-center">Reference Image</Label>
            <div 
              onClick={() => multiFileInputRef.current?.click()}
              className="w-2/3 mx-auto aspect-square border-2 border-dashed border-gray-300 rounded-xl p-2 cursor-pointer hover:border-labubu-400 transition-colors bg-gray-50 hover:bg-labubu-50 flex flex-col items-center justify-center"
            >
              {uploadedImages.length > 0 ? (
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="w-10 h-10 bg-labubu-100 rounded-lg flex items-center justify-center">📸</div>
                  <span className="text-xs text-gray-700">{uploadedImages.length} image(s)</span>
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearUpload()
                    }}
                    className="text-red-500 hover:text-red-700 text-xs p-1 h-auto"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500 text-center">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload</span>
                  <span className="text-xs text-gray-400">Click to add</span>
                </div>
              )}
            </div>
            <input 
              ref={multiFileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {/* Generation Settings */}
          <div className="lg:col-span-2">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Generation Settings</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-xs text-gray-600 mb-1">Images Count</Label>
                <select
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                  className="w-full py-1.5 px-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-labubu-500 focus:border-labubu-500 text-gray-800"
                >
                  {getImageCountOptions(userType).map(option => (
                    <option key={option.value} value={option.value} disabled={option.premium && userType !== UserType.PREMIUM} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="block text-xs text-gray-600 mb-1">Aspect Ratio</Label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full py-1.5 px-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-labubu-500 focus:border-labubu-500 text-gray-800"
                >
                  {getAvailableAspectRatios(userType).map(ratio => (
                    <option key={ratio.value} value={ratio.value} disabled={ratio.premium && userType !== UserType.PREMIUM} className="text-gray-800">
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Settings 按钮 */}
          <div className="lg:col-span-1">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Advanced</Label>
            <Button 
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              variant="outline"
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 border border-gray-300"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>{showAdvancedPanel ? 'Hide' : 'Show'}</span>
              </div>
              {showAdvancedPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* 生成按钮 */}
          <div className="lg:col-span-1">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !textPrompt.trim()}
              className="w-full bg-gradient-to-r from-labubu-500 to-labubu-600 text-white px-4 py-3 rounded-xl font-medium hover:from-labubu-600 hover:to-labubu-700 transition-all hover:scale-105 shadow-lg text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  ⚡ Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 左下角固定位置：用户状态信息 */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-3 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-lg">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{session ? 'Registered User' : 'Guest User'}</span>
                                    </div>
          {session && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center text-xs">
                🛡️
                            </div>
              <span>Verified</span>
                      </div>
                    )}
                  </div>
                            </div>

      {/* 右下角固定位置：积分显示和刷新按钮 */}
      <div className="fixed bottom-4 right-4 z-50 group">
        <div className="flex items-center gap-3">
          {/* 刷新按钮 - 默认隐藏，hover显示 */}
                            <Button 
                              size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-gray-50"
                            >
            <RefreshCw className="w-4 h-4" />
                            </Button>
          
          {/* 积分显示和购买按钮 */}
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-lg">
            <CreditDisplay showBuyButton={true} />
                          </div>
                      </div>
                    </div>

      {/* 高级设置面板（可展开/收缩） */}
      {showAdvancedPanel && (
        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* 模型选择 */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🤖 AI Model Selection
              </h3>
              <div className="space-y-3">
                {getAvailableModelsForContext()?.map((model) => (
                  <div 
                    key={model.value}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedModel === model.value || (model.value === 'max-multi' && selectedModel === 'max')
                        ? 'border-labubu-200 bg-labubu-50' 
                        : 'border-gray-200 hover:border-labubu-300'
                    } ${!model.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => {
                      if (model.available) {
                        if (model.value === 'max-multi') {
                          setSelectedModel('max')
                              } else {
                          setSelectedModel(model.value as any)
                        }
                      }
                    }}
                  >

                    <div className="mb-2">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="model" 
                          value={model.value}
                          checked={selectedModel === model.value || (model.value === 'max-multi' && selectedModel === 'max')}
                          onChange={() => {}}
                          className="mr-2"
                          disabled={!model.available}
                        />
                        <span className="font-medium text-gray-800">{model.label}</span>
                      </label>
                          </div>
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>💎 {model.credits} Credits</span>
                      <span>⚡ {model.speed}</span>
                      <span>⭐ {model.quality}</span>
                        </div>
                  </div>
                  ))}
                </div>
              </div>

            {/* 模型介绍 */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📋 Model Features
              </h3>
              {currentModelInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-800 mb-3">{currentModelInfo.label} Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    {currentModelInfo.features?.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    )) || (
                      <li>✓ High-quality image generation</li>
                    )}
                  </ul>
              </div>
              )}
            </div>

            {/* 高级参数设置 */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                ⚙️ Advanced Parameters
              </h3>
              <div className="grid grid-cols-2 gap-4">
                
                {/* 左列 */}
                <div className="space-y-4">
                  {/* 强度设置 */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Strength: <span className="text-labubu-600">{guidanceScale}</span>
                    </Label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="0.5" 
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Creative</span>
                      <span>Strict</span>
              </div>
            </div>

                  {/* 安全等级 */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Safety: <span className="text-labubu-600">{safetyTolerance}</span>
                    </Label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="1" 
                      value={safetyTolerance}
                      onChange={(e) => setSafetyTolerance(e.target.value)}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Strict</span>
                      <span>Permissive</span>
              </div>
            </div>
          </div>

                {/* 右列 */}
                <div className="space-y-4">
                  {/* 随机种子 */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Seed</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Random" 
                        value={seed || ''}
                        onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                        className="flex-1 text-sm border-gray-300 focus:ring-2 focus:ring-labubu-500 focus:border-labubu-500 text-gray-800 bg-white"
                      />
                      <Button 
                        size="sm"
                        onClick={generateRandomSeed}
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                      >
                        🎲
                      </Button>
        </div>
                  </div>

                  {/* 输出格式 */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Format</Label>
                    <select 
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-labubu-500 focus:border-labubu-500 text-gray-800"
                    >
                                              <option value="jpeg" className="text-gray-800">JPEG</option>
                        <option value="png" className="text-gray-800">PNG</option>
                    </select>
              </div>
              </div>
              </div>
              </div>
          </div>
        </div>
      )}

      {/* Turnstile验证 */}
      {userLimits.requiresTurnstile && isTurnstileEnabled && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🛡️ Security Verification
          </h3>
          <StandardTurnstile
            onVerify={(token) => {
              setTurnstileToken(token)
              setIsTurnstileVerified(true)
            }}
            onError={setTurnstileError}
            onExpire={() => {
              setIsTurnstileVerified(false)
              setTurnstileToken("")
            }}
          />
          {turnstileError && (
            <p className="text-red-600 text-sm mt-2">{turnstileError}</p>
          )}
        </div>
      )}

      {/* 生成结果展示区域 */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              🖼️ Generated Images
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm relative group">
                <div className="aspect-square">
                  <SmartImagePreview
                    url={image.url}
                    alt={`Generated: ${image.prompt}`}
                    index={index}
                    onRemove={() => setGeneratedImages(prev => prev.filter((_, i) => i !== index))}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {image.action.replace('text-to-image-', '').replace('edit-image-', 'edit-').toUpperCase()}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
        </div>
              </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
