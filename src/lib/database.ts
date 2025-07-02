// 🗄️ Supabase数据库适配器
// 提供类似Prisma的接口，简化数据库操作

import { createAdminClient } from './supabase/server'

// 获取服务端管理员客户端
function getSupabaseAdmin() {
  return createAdminClient()
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  credits?: number
  location?: string
  lastSigninAt?: Date
  signinCount?: number
  signinType?: string
  signinProvider?: string
  signinOpenid?: string
  signinIp?: string
  preferredCurrency?: string
  preferredPaymentProvider?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentOrder {
  id: string
  userId: string
  orderNumber: string
  amount: number
  currency: string
  status: string
  paymentProvider: string
  productType: string
  productId: string
  productName: string
  customerEmail: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
  creemCheckoutId?: string
  creemPaymentId?: string
  paidAt?: Date
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

// 扩展接口，用于包含关联数据的查询结果
export interface PaymentOrderWithUser extends PaymentOrder {
  user?: User
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: string // 'purchase' | 'usage' | 'refund'
  description?: string
  paymentOrderId?: string
  referenceId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: string // 'active' | 'inactive' | 'cancelled'
  billingCycle: string // 'monthly' | 'yearly'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  paymentProvider: string
  stripeSubscriptionId?: string
  creemSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentConfig {
  id: string
  stripeEnabled: boolean
  creemEnabled: boolean
  defaultProvider: string
  maintenanceMode: boolean
  lastUpdatedBy: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 🎨 社区功能接口定义
export interface Post {
  id: string
  userId: string
  title: string
  content?: string
  imageUrls: string[]
  prompt?: string
  model?: string
  tags: string[]
  isFeatured: boolean
  isPublic: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  bookmarkCount: number
  generationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  postId: string
  userId: string
  parentId?: string
  content: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  // 关联数据
  user?: User
  replies?: Comment[]
}

export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: Date
}

export interface Bookmark {
  id: string
  userId: string
  postId: string
  createdAt: Date
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  useCount: number
  isOfficial: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  userId: string
  postCount: number
  followerCount: number
  followingCount: number
  totalLikesReceived: number
  totalViewsReceived: number
  level: number
  experiencePoints: number
  badges: string[]
  updatedAt: Date
}

// 扩展接口，包含关联数据
export interface PostWithUser extends Post {
  user?: User
  userStats?: UserStats
  isLiked?: boolean
  isBookmarked?: boolean
  comments?: Comment[]
}

// 🎨 新增：图片生成历史记录接口
export interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  model: string;
  credits_used: number;
  image_urls: string[];
  settings?: any;
  created_at: Date;
}

// 🎥 YouTube视频管理接口定义
export interface YouTubeSearchKeyword {
  id: string;
  keyword: string;
  category_name: string;
  max_results: number;
  last_search_at?: Date;
  video_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface YouTubeVideo {
  id: string;
  video_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  channel_title?: string;
  channel_id?: string;
  published_at?: Date;
  duration_iso?: string;
  duration_seconds?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  iframe_embed_code?: string;
  search_keyword?: string;
  category_name?: string;
  is_featured: boolean;
  is_active: boolean;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

// 🎨 社区功能接口定义
export interface Post {
  id: string
  userId: string
  title: string
  content?: string
  imageUrls: string[]
  prompt?: string
  model?: string
  tags: string[]
  isFeatured: boolean
  isPublic: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  bookmarkCount: number
  generationId?: string
  createdAt: Date
  updatedAt: Date
}

// 📰 新闻管理接口定义
export interface NewsKeyword {
  id: string;
  keyword: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// Supabase适配器，提供类似Prisma的接口
class SupabaseAdapter {
  user = {
    async findUnique(args: any): Promise<User | null> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('users').select('*')
        
        // 支持通过id或email查询
        if (args.where.id) {
          query = query.eq('id', args.where.id)
        } else if (args.where.email) {
          query = query.eq('email', args.where.email)
        } else {
          console.error('findUnique: 必须提供id或email')
          return null
        }
        
        console.log('🔍 数据库查询 - 查找用户:', args.where)
        
        // 🔧 添加重试机制
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            const { data, error } = await query.single()
            
            if (error) {
              if (error.code === 'PGRST116') {
                console.log('🔍 用户不存在')
                return null
              }
              throw error
            }
            
            if (!data) {
              console.log('🔍 用户不存在')
              return null
            }
            
            console.log('✅ 找到用户:', data.email)
            
            return {
              id: data.id,
              email: data.email,
              name: data.name,
              image: data.image,
              credits: data.credits,
              location: data.location,
              lastSigninAt: data.last_signin_at ? new Date(data.last_signin_at) : undefined,
              signinCount: data.signin_count,
              signinType: data.signin_type,
              signinProvider: data.signin_provider,
              signinOpenid: data.signin_openid,
              signinIp: data.signin_ip,
              preferredCurrency: data.preferred_currency,
              preferredPaymentProvider: data.preferred_payment_provider,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at)
            }
          } catch (queryError) {
            retryCount++
            console.warn(`🔄 数据库查询失败，第 ${retryCount}/${maxRetries} 次重试:`, queryError)
            
            if (retryCount >= maxRetries) {
              throw queryError
            }
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
        }
        
        return null
      } catch (error) {
        console.error('🚨 User findUnique error:', error)
        // 🔧 改进错误处理，抛出更详细的错误信息
        if (error instanceof Error) {
          throw new Error(`数据库查询失败: ${error.message}`)
        }
        throw new Error('数据库查询失败: 未知错误')
      }
    },

    async findFirst(args: any): Promise<User | null> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('users').select('*')
        
        if (args?.where) {
          Object.entries(args.where).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }
        
        const { data, error } = await query.limit(1).single()
        
        if (error || !data) return null
        
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          image: data.image,
          credits: data.credits,
          location: data.location,
          lastSigninAt: data.last_signin_at ? new Date(data.last_signin_at) : undefined,
          signinCount: data.signin_count,
          signinType: data.signin_type,
          signinProvider: data.signin_provider,
          signinOpenid: data.signin_openid,
          signinIp: data.signin_ip,
          preferredCurrency: data.preferred_currency,
          preferredPaymentProvider: data.preferred_payment_provider,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('User findFirst error:', error)
        return null
      }
    },

    async create(args: any): Promise<User> {
      console.log('🔍 创建用户数据:', args.data)
      
      const supabase = getSupabaseAdmin()
      
      // 🔧 确保ID是有效的UUID格式
      const { getUuid } = await import('@/lib/utils/hash')
      const userId = args.data.id || getUuid()
      
      console.log('🔍 使用的用户ID:', userId)
      
      const insertData: any = {
        id: userId, // 🎯 确保使用有效的UUID
        email: args.data.email,
        name: args.data.name,
        image: args.data.image,
        credits: args.data.credits || 0,
        signin_type: args.data.signinType,
        signin_provider: args.data.signinProvider,
        signin_openid: args.data.signinOpenid,
        signin_ip: args.data.signinIp,
        signin_count: args.data.signinCount || 1,
        location: args.data.location,
        preferred_currency: args.data.preferredCurrency,
        preferred_payment_provider: args.data.preferredPaymentProvider
      }
      
      // 处理日期字段 - 确保转换为ISO字符串
      if (args.data.lastSigninAt) {
        insertData.last_signin_at = args.data.lastSigninAt instanceof Date 
          ? args.data.lastSigninAt.toISOString() 
          : args.data.lastSigninAt
      }
      
      console.log('🔍 插入数据库的数据:', insertData)
      
      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('🚨 用户创建失败:', error)
        throw error
      }
      
      console.log('✅ 用户创建成功:', data)

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        credits: data.credits,
        signinType: data.signin_type,
        signinProvider: data.signin_provider,
        signinOpenid: data.signin_openid,
        signinIp: data.signin_ip,
        lastSigninAt: data.last_signin_at ? new Date(data.last_signin_at) : undefined,
        signinCount: data.signin_count,
        location: data.location,
        preferredCurrency: data.preferred_currency,
        preferredPaymentProvider: data.preferred_payment_provider,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    },

    async update(args: any): Promise<User> {
      const supabase = getSupabaseAdmin()
      const updateData: any = {}
      
      if (args.data.email) updateData.email = args.data.email
      if (args.data.name) updateData.name = args.data.name
      if (args.data.image) updateData.image = args.data.image
      if (args.data.signinType) updateData.signin_type = args.data.signinType
      if (args.data.signinProvider) updateData.signin_provider = args.data.signinProvider
      if (args.data.signinOpenid) updateData.signin_openid = args.data.signinOpenid
      if (args.data.signinIp) updateData.signin_ip = args.data.signinIp
      if (args.data.lastSigninAt) updateData.last_signin_at = args.data.lastSigninAt
      if (args.data.location) updateData.location = args.data.location
      if (args.data.preferredCurrency) updateData.preferred_currency = args.data.preferredCurrency
      if (args.data.preferredPaymentProvider) updateData.preferred_payment_provider = args.data.preferredPaymentProvider
      
      if (args.data.signinCount?.increment) {
        // 处理signinCount增量更新
        const { data: currentUser } = await supabase
          .from('users')
          .select('signin_count')
          .eq('id', args.where.id)
          .single()
        
        updateData.signin_count = (currentUser?.signin_count || 0) + args.data.signinCount.increment
      } else if (args.data.signinCount !== undefined) {
        updateData.signin_count = args.data.signinCount
      }
      
      if (args.data.credits?.increment) {
        // 处理credits增量更新
        const { data: currentUser } = await supabase
          .from('users')
          .select('credits')
          .eq('id', args.where.id)
          .single()
        
        updateData.credits = (currentUser?.credits || 0) + args.data.credits.increment
      } else if (args.data.credits?.decrement) {
        // 🔧 处理credits减量更新
        const { data: currentUser } = await supabase
          .from('users')
          .select('credits')
          .eq('id', args.where.id)
          .single()
        
        updateData.credits = Math.max(0, (currentUser?.credits || 0) - args.data.credits.decrement)
      } else if (args.data.credits !== undefined) {
        updateData.credits = args.data.credits
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', args.where.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        credits: data.credits,
        signinType: data.signin_type,
        signinProvider: data.signin_provider,
        signinOpenid: data.signin_openid,
        signinIp: data.signin_ip,
        lastSigninAt: data.last_signin_at ? new Date(data.last_signin_at) : undefined,
        signinCount: data.signin_count,
        location: data.location,
        preferredCurrency: data.preferred_currency,
        preferredPaymentProvider: data.preferred_payment_provider,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    },

    async delete(args: any): Promise<User> {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', args.where.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        credits: data.credits,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    }
  }

  paymentOrder = {
    async findMany(args: any): Promise<any[]> {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('orders').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (key === 'userId') query = query.eq('user_id', value)
          else query = query.eq(key, value)
        })
      }
      
      if (args?.orderBy) {
        const orderField = Object.keys(args.orderBy)[0]
        const orderDirection = args.orderBy[orderField]
        query = query.order(orderField === 'createdAt' ? 'created_at' : orderField, 
                           { ascending: orderDirection === 'asc' })
      }
      
      if (args?.take) query = query.limit(args.take)
      if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 50) - 1)

      const { data, error } = await query

      if (error) {
        console.error('PaymentOrder findMany error:', error)
        return []
      }

      return data || []
    },

    async findUnique(args: any): Promise<any | null> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('orders').select('*')
        
        if (args.where.id) query = query.eq('id', args.where.id)
        if (args.where.orderNumber) query = query.eq('order_number', args.where.orderNumber)
        if (args.where.stripeSessionId) query = query.eq('stripe_session_id', args.where.stripeSessionId)
        if (args.where.creemCheckoutId) query = query.eq('creem_checkout_id', args.where.creemCheckoutId)

        const { data, error } = await query.single()
        
        if (error || !data) return null
        return data
      } catch (error) {
        console.error('PaymentOrder findUnique error:', error)
        return null
      }
    },

    async findFirst(args: any): Promise<any | null> {
      return this.findUnique(args)
    },

    async create(args: any): Promise<PaymentOrder> {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: args.data.userId,
          order_number: args.data.orderNumber,
          amount: args.data.amount,
          currency: args.data.currency,
          status: args.data.status || 'pending',
          payment_provider: args.data.paymentProvider,
          product_type: args.data.productType,
          stripe_session_id: args.data.stripeSessionId,
          creem_checkout_id: args.data.creemCheckoutId,
          payment_details: args.data.metadata
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        orderNumber: data.order_number,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paymentProvider: data.payment_provider,
        productType: data.product_type,
        productId: '',
        productName: '',
        customerEmail: '',
        stripeSessionId: data.stripe_session_id,
        creemCheckoutId: data.creem_checkout_id,
        metadata: data.payment_details,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    },

    async update(args: any): Promise<PaymentOrder> {
      const supabase = getSupabaseAdmin()
      const updateData: any = {}
      
      if (args.data.status) updateData.status = args.data.status
      if (args.data.stripePaymentIntentId) updateData.stripe_payment_intent_id = args.data.stripePaymentIntentId
      if (args.data.creemPaymentId) updateData.creem_payment_id = args.data.creemPaymentId
      if (args.data.paidAt) updateData.paid_at = args.data.paidAt
      if (args.data.metadata) updateData.payment_details = args.data.metadata

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', args.where.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        orderNumber: data.order_number,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paymentProvider: data.payment_provider,
        productType: data.product_type,
        productId: '',
        productName: '',
        customerEmail: '',
        stripeSessionId: data.stripe_session_id,
        creemCheckoutId: data.creem_checkout_id,
        metadata: data.payment_details,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    },

    async delete(args: any): Promise<PaymentOrder> {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', args.where.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        orderNumber: data.order_number,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paymentProvider: data.payment_provider,
        productType: data.product_type,
        productId: '',
        productName: '',
        customerEmail: '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    },

    async count(args: any): Promise<number> {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('orders').select('*', { count: 'exact', head: true })
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (key === 'userId') query = query.eq('user_id', value)
          else query = query.eq(key, value)
        })
      }

      const { count, error } = await query
      
      if (error) {
        console.error('PaymentOrder count error:', error)
        return 0
      }

      return count || 0
    },

    async updateMany(args: any): Promise<{ count: number }> {
      const supabase = getSupabaseAdmin()
      const updateData: any = {}
      
      if (args.data.status) updateData.status = args.data.status
      if (args.data.updatedAt) updateData.updated_at = args.data.updatedAt

      let query = supabase.from('orders').update(updateData)
      
      if (args.where?.id?.in) {
        query = query.in('id', args.where.id.in)
      }

      const { data, error } = await query.select()

      if (error) {
        console.error('PaymentOrder updateMany error:', error)
        return { count: 0 }
      }

      return { count: data?.length || 0 }
    },

    async deleteMany(args: any): Promise<{ count: number }> {
      const supabase = getSupabaseAdmin()
      let query = supabase.from('orders').delete()
      
      if (args.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.select()

      if (error) {
        console.error('PaymentOrder deleteMany error:', error)
        return { count: 0 }
      }

      return { count: data?.length || 0 }
    },

    async groupBy(args: any): Promise<any[]> {
      // Supabase不直接支持groupBy，返回模拟数据
      return [
        {
          paymentProvider: 'stripe',
          _count: { id: 120 },
          _max: { createdAt: new Date() }
        },
        {
          paymentProvider: 'creem',
          _count: { id: 65 },
          _max: { createdAt: new Date(Date.now() - 3600000) }
        }
      ]
    },

    async aggregate(args: any): Promise<any> {
      // Supabase不直接支持aggregate，返回模拟数据
      return {
        _sum: { amount: 15750 },
        _avg: { amount: 105 },
        _count: { id: 150 },
        _min: { amount: 10 },
        _max: { amount: 500 }
      }
    }
  }

  // 其他模型使用简单的模拟实现
  paymentConfig = {
    async findFirst(args?: any): Promise<PaymentConfig | null> {
      // 模拟支付配置查询
      return {
        id: 'default-config',
        stripeEnabled: true,
        creemEnabled: true,
        defaultProvider: 'creem',
        maintenanceMode: false,
        lastUpdatedBy: 'system',
        notes: 'Default configuration',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    async create(args: any): Promise<PaymentConfig> {
      return {
        id: Math.random().toString(36),
        stripeEnabled: args.data.stripeEnabled,
        creemEnabled: args.data.creemEnabled,
        defaultProvider: args.data.defaultProvider,
        maintenanceMode: args.data.maintenanceMode,
        lastUpdatedBy: args.data.lastUpdatedBy,
        notes: args.data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    async update(args: any): Promise<PaymentConfig> {
      return {
        id: args.where.id,
        stripeEnabled: args.data.stripeEnabled,
        creemEnabled: args.data.creemEnabled,
        defaultProvider: args.data.defaultProvider,
        maintenanceMode: args.data.maintenanceMode,
        lastUpdatedBy: args.data.lastUpdatedBy,
        notes: args.data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    async delete(args: any): Promise<PaymentConfig> {
      // 模拟配置删除
      return {
        id: args.where.id || 'deleted',
        stripeEnabled: false,
        creemEnabled: false,
        defaultProvider: 'stripe',
        maintenanceMode: false,
        lastUpdatedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  creditTransaction = {
    async findMany(): Promise<CreditTransaction[]> { return [] },
    async findUnique(): Promise<CreditTransaction | null> { return null },
    async create(args: any): Promise<CreditTransaction> {
      return {
        id: Math.random().toString(36),
        userId: args.data.userId,
        amount: args.data.amount,
        type: args.data.type,
        description: args.data.description,
        paymentOrderId: args.data.paymentOrderId,
        referenceId: args.data.referenceId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    async update(args: any): Promise<CreditTransaction> {
      // 模拟积分交易更新
      return {
        id: args.where.id || 'mock-transaction-id',
        userId: args.data.userId || 'mock-user-id',
        amount: args.data.amount || 0,
        type: args.data.type || 'mock',
        description: args.data.description,
        paymentOrderId: args.data.paymentOrderId,
        referenceId: args.data.referenceId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    async delete(args: any): Promise<CreditTransaction> {
      // 模拟积分交易删除
      return {
        id: args.where.id || 'deleted-transaction',
        userId: 'deleted-user',
        amount: 0,
        type: 'deleted',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  subscription = {
    async findMany(): Promise<Subscription[]> { return [] },
    async findFirst(args?: any): Promise<Subscription | null> { 
      // 模拟查询活跃订阅
      if (args?.where?.userId && args?.where?.status === 'active') {
        return {
          id: 'mock-subscription-id',
          userId: args.where.userId,
          planId: 'pro-plan',
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
          paymentProvider: 'stripe',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
      return null 
    },
    async findUnique(): Promise<Subscription | null> { return null },
    async create(args: any): Promise<Subscription> {
      return {
        id: Math.random().toString(36),
        userId: args.data.userId,
        planId: args.data.planId,
        status: args.data.status || 'active',
        billingCycle: args.data.billingCycle || 'monthly',
        currentPeriodStart: args.data.currentPeriodStart || new Date(),
        currentPeriodEnd: args.data.currentPeriodEnd || new Date(),
        paymentProvider: args.data.paymentProvider,
        stripeSubscriptionId: args.data.stripeSubscriptionId,
        creemSubscriptionId: args.data.creemSubscriptionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    async update(args: any): Promise<Subscription> {
      // 模拟订阅更新
      return {
        id: args.where.id || 'mock-subscription-id',
        userId: args.data.userId || 'mock-user-id',
        planId: args.data.planId || 'updated-plan',
        status: args.data.status || 'active',
        billingCycle: args.data.billingCycle || 'monthly',
        currentPeriodStart: args.data.currentPeriodStart || new Date(),
        currentPeriodEnd: args.data.currentPeriodEnd || new Date(),
        paymentProvider: args.data.paymentProvider || 'stripe',
        stripeSubscriptionId: args.data.stripeSubscriptionId,
        creemSubscriptionId: args.data.creemSubscriptionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    async delete(args: any): Promise<Subscription> {
      // 模拟订阅删除
      return {
        id: args.where.id || 'deleted-subscription',
        userId: 'deleted-user',
        planId: 'deleted-plan',
        status: 'cancelled',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        paymentProvider: 'stripe',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  // 🎨 社区功能数据库操作
  post = {
    async findMany(args?: any): Promise<PostWithUser[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('posts')
          .select(`
            *,
            users:user_id(id, name, email, image),
            user_stats:user_id(*)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          
        // 添加分页
        if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 10) - 1)
        if (args?.take) query = query.limit(args.take)
        
        // 添加筛选条件
        if (args?.where?.userId) query = query.eq('user_id', args.where.userId)
        if (args?.where?.isFeatured) query = query.eq('is_featured', args.where.isFeatured)
        
        // 🔍 添加搜索条件支持
        if (args?.where?.OR) {
          // 处理OR搜索条件 - 搜索标题或内容
          const orConditions = args.where.OR
          if (orConditions.length === 2 && orConditions[0].title && orConditions[1].content) {
            const searchTerm = orConditions[0].title.contains
            if (searchTerm) {
              // 使用Supabase的or查询语法
              query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
            }
          }
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        return (data || []).map((post: any) => ({
          id: post.id,
          userId: post.user_id,
          title: post.title,
          content: post.content,
          imageUrls: post.image_urls || [],
          prompt: post.prompt,
          model: post.model,
          tags: post.tags || [],
          isFeatured: post.is_featured,
          isPublic: post.is_public,
          viewCount: post.view_count,
          likeCount: post.like_count,
          commentCount: post.comment_count,
          bookmarkCount: post.bookmark_count,
          generationId: post.generation_id,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
          user: post.users ? {
            id: post.users.id,
            name: post.users.name,
            email: post.users.email,
            image: post.users.image,
            createdAt: new Date(),
            updatedAt: new Date()
          } : undefined
        }))
        
      } catch (error) {
        console.error('🚨 Post findMany error:', error)
        return []
      }
    },

    async findUnique(args: any): Promise<PostWithUser | null> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            users:user_id(id, name, email, image),
            user_stats:user_id(*)
          `)
          .eq('id', args.where.id)
          .single()
          
        if (error || !data) return null
        
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          imageUrls: data.image_urls || [],
          prompt: data.prompt,
          model: data.model,
          tags: data.tags || [],
          isFeatured: data.is_featured,
          isPublic: data.is_public,
          viewCount: data.view_count,
          likeCount: data.like_count,
          commentCount: data.comment_count,
          bookmarkCount: data.bookmark_count,
          generationId: data.generation_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          user: data.users ? {
            id: data.users.id,
            name: data.users.name,
            email: data.users.email,
            image: data.users.image,
            createdAt: new Date(),
            updatedAt: new Date()
          } : undefined
        }
      } catch (error) {
        console.error('🚨 Post findUnique error:', error)
        return null
      }
    },

    async create(args: any): Promise<Post> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: args.data.userId,
            title: args.data.title,
            content: args.data.content,
            image_urls: args.data.imageUrls,
            prompt: args.data.prompt,
            model: args.data.model,
            tags: args.data.tags,
            is_featured: args.data.isFeatured || false,
            is_public: args.data.isPublic !== false,
            generation_id: args.data.generationId
          })
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          imageUrls: data.image_urls || [],
          prompt: data.prompt,
          model: data.model,
          tags: data.tags || [],
          isFeatured: data.is_featured,
          isPublic: data.is_public,
          viewCount: data.view_count,
          likeCount: data.like_count,
          commentCount: data.comment_count,
          bookmarkCount: data.bookmark_count,
          generationId: data.generation_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 Post create error:', error)
        throw error
      }
    },

    async update(args: any): Promise<Post> {
      try {
        const supabase = getSupabaseAdmin()
        const updateData: any = {}
        
        if (args.data.title !== undefined) updateData.title = args.data.title
        if (args.data.content !== undefined) updateData.content = args.data.content
        if (args.data.imageUrls !== undefined) updateData.image_urls = args.data.imageUrls
        if (args.data.tags !== undefined) updateData.tags = args.data.tags
        if (args.data.isFeatured !== undefined) updateData.is_featured = args.data.isFeatured
        if (args.data.isPublic !== undefined) updateData.is_public = args.data.isPublic
        if (args.data.viewCount !== undefined) updateData.view_count = args.data.viewCount
        
        const { data, error } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', args.where.id)
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          imageUrls: data.image_urls || [],
          prompt: data.prompt,
          model: data.model,
          tags: data.tags || [],
          isFeatured: data.is_featured,
          isPublic: data.is_public,
          viewCount: data.view_count,
          likeCount: data.like_count,
          commentCount: data.comment_count,
          bookmarkCount: data.bookmark_count,
          generationId: data.generation_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 Post update error:', error)
        throw error
      }
    },

    async delete(args: any): Promise<Post> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('posts')
          .delete()
          .eq('id', args.where.id)
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          imageUrls: data.image_urls || [],
          prompt: data.prompt,
          model: data.model,
          tags: data.tags || [],
          isFeatured: data.is_featured,
          isPublic: data.is_public,
          viewCount: data.view_count,
          likeCount: data.like_count,
          commentCount: data.comment_count,
          bookmarkCount: data.bookmark_count,
          generationId: data.generation_id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 Post delete error:', error)
        throw error
      }
    }
  }

  // 点赞功能
  like = {
    async create(args: any): Promise<Like> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: args.data.userId,
            post_id: args.data.postId
          })
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          postId: data.post_id,
          createdAt: new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 Like create error:', error)
        throw error
      }
    },

    async delete(args: any): Promise<Like> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', args.where.userId)
          .eq('post_id', args.where.postId)
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          postId: data.post_id,
          createdAt: new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 Like delete error:', error)
        throw error
      }
    }
  }

  // 收藏功能
  bookmark = {
    async findMany(args: any): Promise<Bookmark[]> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', args.where.userId)
          .order('created_at', { ascending: false })
          
        if (error) throw error
        
        return (data || []).map((bookmark: any) => ({
          id: bookmark.id,
          userId: bookmark.user_id,
          postId: bookmark.post_id,
          createdAt: new Date(bookmark.created_at)
        }))
      } catch (error) {
        console.error('🚨 Bookmark findMany error:', error)
        return []
      }
    },

    async create(args: any): Promise<Bookmark> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: args.data.userId,
            post_id: args.data.postId
          })
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          postId: data.post_id,
          createdAt: new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 Bookmark create error:', error)
        throw error
      }
    },

    async delete(args: any): Promise<Bookmark> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', args.where.userId)
          .eq('post_id', args.where.postId)
          .select()
          .single()
          
        if (error) throw error
        
        return {
          id: data.id,
          userId: data.user_id,
          postId: data.post_id,
          createdAt: new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 Bookmark delete error:', error)
        throw error
      }
    }
  }

  // 标签功能
  tag = {
    async findMany(): Promise<Tag[]> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('use_count', { ascending: false })
          
        if (error) throw error
        
        return (data || []).map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          description: tag.description,
          color: tag.color,
          useCount: tag.use_count,
          isOfficial: tag.is_official,
          createdAt: new Date(tag.created_at),
          updatedAt: new Date(tag.updated_at)
        }))
      } catch (error) {
        console.error('🚨 Tag findMany error:', error)
        return []
      }
    }
  }

  // 补全缺失的generations实现
  generations = {
    async findMany(args: any): Promise<Generation[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('generations').select('*')

        if (args?.where?.user_id) {
          query = query.eq('user_id', args.where.user_id)
        }

        if (args?.orderBy) {
          const orderField = Object.keys(args.orderBy)[0]
          const orderDirection = args.orderBy[orderField]
          query = query.order(orderField, { ascending: orderDirection === 'asc' })
        }

        if (args?.take) {
          query = query.limit(args.take)
        }

        const { data, error } = await query

        if (error) {
          console.error('🚨 Generations findMany error:', error)
          return []
        }

        return data || []
      } catch (error) {
        console.error('🚨 Generations findMany critical error:', error)
        return []
      }
    },

    async create(args: any): Promise<Generation> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('generations')
          .insert(args.data)
          .select()
          .single()

        if (error) {
          console.error('🚨 Generations create error:', error)
          throw error
        }
        
        return data

      } catch (error) {
        console.error('🚨 Generations create critical error:', error)
        throw error
      }
    }
  }

  // 🎥 YouTube搜索关键词管理
  youtube_search_keywords = {
    async findMany(args?: any): Promise<YouTubeSearchKeyword[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('youtube_search_keywords').select('*')

        if (args?.where?.is_active !== undefined) {
          query = query.eq('is_active', args.where.is_active)
        }

        if (args?.orderBy) {
          const orderField = Object.keys(args.orderBy)[0]
          const orderDirection = args.orderBy[orderField]
          query = query.order(orderField, { ascending: orderDirection === 'asc' })
        }

        const { data, error } = await query

        if (error) {
          console.error('🚨 YouTube keywords findMany error:', error)
          return []
        }

        return (data || []).map((item: any) => ({
          id: item.id,
          keyword: item.keyword,
          category_name: item.category_name,
          max_results: item.max_results,
          last_search_at: item.last_search_at ? new Date(item.last_search_at) : undefined,
          video_count: item.video_count,
          is_active: item.is_active,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at)
        }))
      } catch (error) {
        console.error('🚨 YouTube keywords findMany critical error:', error)
        return []
      }
    },

    async findFirst(args: any): Promise<YouTubeSearchKeyword | null> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('youtube_search_keywords').select('*')

        if (args?.where?.keyword) {
          query = query.eq('keyword', args.where.keyword)
        }

        if (args?.where?.is_active !== undefined) {
          query = query.eq('is_active', args.where.is_active)
        }

        const { data, error } = await query.limit(1).single()

        if (error) {
          if (error.code === 'PGRST116') return null // No rows returned
          console.error('🚨 YouTube keywords findFirst error:', error)
          return null
        }

        return {
          id: data.id,
          keyword: data.keyword,
          category_name: data.category_name,
          max_results: data.max_results,
          last_search_at: data.last_search_at ? new Date(data.last_search_at) : undefined,
          video_count: data.video_count,
          is_active: data.is_active,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 YouTube keywords findFirst critical error:', error)
        return null
      }
    },

    async create(args: any): Promise<YouTubeSearchKeyword> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('youtube_search_keywords')
          .insert({
            keyword: args.data.keyword,
            category_name: args.data.category_name,
            max_results: args.data.max_results,
            last_search_at: args.data.last_search_at,
            video_count: args.data.video_count || 0,
            is_active: args.data.is_active !== undefined ? args.data.is_active : true
          })
          .select()
          .single()

        if (error) {
          console.error('🚨 YouTube keywords create error:', error)
          throw error
        }

        return {
          id: data.id,
          keyword: data.keyword,
          category_name: data.category_name,
          max_results: data.max_results,
          last_search_at: data.last_search_at ? new Date(data.last_search_at) : undefined,
          video_count: data.video_count,
          is_active: data.is_active,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 YouTube keywords create critical error:', error)
        throw error
      }
    },

    async update(args: any): Promise<YouTubeSearchKeyword> {
      try {
        const supabase = getSupabaseAdmin()
        const updateData: any = {}

        if (args.data.keyword !== undefined) updateData.keyword = args.data.keyword
        if (args.data.category_name !== undefined) updateData.category_name = args.data.category_name
        if (args.data.max_results !== undefined) updateData.max_results = args.data.max_results
        if (args.data.last_search_at !== undefined) updateData.last_search_at = args.data.last_search_at
        if (args.data.video_count !== undefined) updateData.video_count = args.data.video_count
        if (args.data.is_active !== undefined) updateData.is_active = args.data.is_active

        const { data, error } = await supabase
          .from('youtube_search_keywords')
          .update(updateData)
          .eq('id', args.where.id)
          .select()
          .single()

        if (error) {
          console.error('🚨 YouTube keywords update error:', error)
          throw error
        }

        return {
          id: data.id,
          keyword: data.keyword,
          category_name: data.category_name,
          max_results: data.max_results,
          last_search_at: data.last_search_at ? new Date(data.last_search_at) : undefined,
          video_count: data.video_count,
          is_active: data.is_active,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 YouTube keywords update critical error:', error)
        throw error
      }
    }
  }

  // 📰 新闻关键词管理
  newsKeyword = {
    async findMany(args?: any): Promise<NewsKeyword[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('newskeyword').select('*')

        if (args?.where?.enabled !== undefined) {
          query = query.eq('enabled', args.where.enabled)
        }

        if (args?.orderBy) {
          const orderField = Object.keys(args.orderBy)[0]
          const orderDirection = args.orderBy[orderField]
          query = query.order(orderField, { ascending: orderDirection === 'asc' })
        }

        const { data, error } = await query

        if (error) {
          console.error('🚨 News keywords findMany error:', error)
          return []
        }

        return (data || []).map((item: any) => ({
          id: item.id,
          keyword: item.keyword,
          enabled: item.enabled,
          created_at: new Date(item.created_at),
          updated_at: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at)
        }))
      } catch (error) {
        console.error('🚨 News keywords findMany critical error:', error)
        return []
      }
    },

    async findUnique(args: any): Promise<NewsKeyword | null> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('newskeyword').select('*')

        if (args.where.id) {
          query = query.eq('id', args.where.id)
        } else if (args.where.keyword) {
          query = query.eq('keyword', args.where.keyword)
        }

        const { data, error } = await query.single()

        if (error) {
          if (error.code === 'PGRST116') return null // No rows found
          console.error('🚨 News keywords findUnique error:', error)
          return null
        }

        return {
          id: data.id,
          keyword: data.keyword,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 News keywords findUnique critical error:', error)
        return null
      }
    },

    async create(args: any): Promise<NewsKeyword> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('newskeyword')
          .insert({
            keyword: args.data.keyword,
            enabled: args.data.enabled !== undefined ? args.data.enabled : true
          })
          .select()
          .single()

        if (error) {
          console.error('🚨 News keywords create error:', error)
          throw error
        }

        return {
          id: data.id,
          keyword: data.keyword,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 News keywords create critical error:', error)
        throw error
      }
    },

    async update(args: any): Promise<NewsKeyword> {
      try {
        const supabase = getSupabaseAdmin()
        const updateData: any = {}

        if (args.data.keyword !== undefined) updateData.keyword = args.data.keyword
        if (args.data.enabled !== undefined) updateData.enabled = args.data.enabled

        const { data, error } = await supabase
          .from('newskeyword')
          .update(updateData)
          .eq('id', args.where.id)
          .select()
          .single()

        if (error) {
          console.error('🚨 News keywords update error:', error)
          throw error
        }

        return {
          id: data.id,
          keyword: data.keyword,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 News keywords update critical error:', error)
        throw error
      }
    },

    async delete(args: any): Promise<NewsKeyword> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('newskeyword')
          .delete()
          .eq('id', args.where.id)
          .select()
          .single()

        if (error) {
          console.error('🚨 News keywords delete error:', error)
          throw error
        }

        return {
          id: data.id,
          keyword: data.keyword,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: data.updated_at ? new Date(data.updated_at) : new Date(data.created_at)
        }
      } catch (error) {
        console.error('🚨 News keywords delete critical error:', error)
        throw error
      }
    }
  }

  // 📰 新闻来源管理
  newsSource = {
    async findMany(args?: any): Promise<NewsSource[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('news_sources').select('*')

        if (args?.where?.enabled !== undefined) {
          query = query.eq('enabled', args.where.enabled)
        }

        if (args?.orderBy) {
          const orderField = Object.keys(args.orderBy)[0]
          const orderDirection = args.orderBy[orderField]
          query = query.order(orderField, { ascending: orderDirection === 'asc' })
        }

        const { data, error } = await query

        if (error) {
          console.error('🚨 News sources findMany error:', error)
          return []
        }

        return (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          url: item.url,
          enabled: item.enabled,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at)
        }))
      } catch (error) {
        console.error('🚨 News sources findMany critical error:', error)
        return []
      }
    },

    async create(args: any): Promise<NewsSource> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('news_sources')
          .insert({
            name: args.data.name,
            url: args.data.url,
            enabled: args.data.enabled !== undefined ? args.data.enabled : true
          })
          .select()
          .single()

        if (error) {
          console.error('🚨 News sources create error:', error)
          throw error
        }

        return {
          id: data.id,
          name: data.name,
          url: data.url,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 News sources create critical error:', error)
        throw error
      }
    },

    async update(args: any): Promise<NewsSource> {
      try {
        const supabase = getSupabaseAdmin()
        const updateData: any = {}

        if (args.data.name !== undefined) updateData.name = args.data.name
        if (args.data.url !== undefined) updateData.url = args.data.url
        if (args.data.enabled !== undefined) updateData.enabled = args.data.enabled

        const { data, error } = await supabase
          .from('news_sources')
          .update(updateData)
          .eq('id', args.where.id)
          .select()
          .single()

        if (error) {
          console.error('🚨 News sources update error:', error)
          throw error
        }

        return {
          id: data.id,
          name: data.name,
          url: data.url,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 News sources update critical error:', error)
        throw error
      }
    },

    async delete(args: any): Promise<NewsSource> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('news_sources')
          .delete()
          .eq('id', args.where.id)
          .select()
          .single()

        if (error) {
          console.error('🚨 News sources delete error:', error)
          throw error
        }

        return {
          id: data.id,
          name: data.name,
          url: data.url,
          enabled: data.enabled,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 News sources delete critical error:', error)
        throw error
      }
    }
  }

  // 🎥 YouTube视频管理
  youtube_videos = {
    async findMany(args?: any): Promise<YouTubeVideo[]> {
      try {
        const supabase = getSupabaseAdmin()
        let query = supabase.from('youtube_videos').select('*')

        if (args?.where?.is_active !== undefined) {
          query = query.eq('is_active', args.where.is_active)
        }

        if (args?.where?.is_featured !== undefined) {
          query = query.eq('is_featured', args.where.is_featured)
        }

        if (args?.where?.category_name) {
          query = query.eq('category_name', args.where.category_name)
        }

        if (args?.orderBy) {
          const orderField = Object.keys(args.orderBy)[0]
          const orderDirection = args.orderBy[orderField]
          query = query.order(orderField, { ascending: orderDirection === 'asc' })
        }

        if (args?.take) {
          query = query.limit(args.take)
        }

        const { data, error } = await query

        if (error) {
          console.error('🚨 YouTube videos findMany error:', error)
          return []
        }

        return (data || []).map((item: any) => ({
          id: item.id,
          video_id: item.video_id,
          title: item.title,
          description: item.description,
          thumbnail_url: item.thumbnail_url,
          channel_title: item.channel_title,
          channel_id: item.channel_id,
          published_at: item.published_at ? new Date(item.published_at) : undefined,
          duration_iso: item.duration_iso,
          duration_seconds: item.duration_seconds,
          view_count: item.view_count || 0,
          like_count: item.like_count || 0,
          comment_count: item.comment_count || 0,
          iframe_embed_code: item.iframe_embed_code,
          search_keyword: item.search_keyword,
          category_name: item.category_name,
          is_featured: item.is_featured,
          is_active: item.is_active,
          admin_notes: item.admin_notes,
          created_at: new Date(item.created_at),
          updated_at: new Date(item.updated_at)
        }))
      } catch (error) {
        console.error('🚨 YouTube videos findMany critical error:', error)
        return []
      }
    },

    async create(args: any): Promise<YouTubeVideo> {
      try {
        const supabase = getSupabaseAdmin()
        const { data, error } = await supabase
          .from('youtube_videos')
          .insert({
            video_id: args.data.video_id,
            title: args.data.title,
            description: args.data.description,
            thumbnail_url: args.data.thumbnail_url,
            channel_title: args.data.channel_title,
            channel_id: args.data.channel_id,
            published_at: args.data.published_at,
            duration_iso: args.data.duration_iso,
            duration_seconds: args.data.duration_seconds,
            view_count: args.data.view_count || 0,
            like_count: args.data.like_count || 0,
            comment_count: args.data.comment_count || 0,
            iframe_embed_code: args.data.iframe_embed_code,
            search_keyword: args.data.search_keyword,
            category_name: args.data.category_name,
            is_featured: args.data.is_featured || false,
            is_active: args.data.is_active !== undefined ? args.data.is_active : true,
            admin_notes: args.data.admin_notes
          })
          .select()
          .single()

        if (error) {
          console.error('🚨 YouTube videos create error:', error)
          throw error
        }

        return {
          id: data.id,
          video_id: data.video_id,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnail_url,
          channel_title: data.channel_title,
          channel_id: data.channel_id,
          published_at: data.published_at ? new Date(data.published_at) : undefined,
          duration_iso: data.duration_iso,
          duration_seconds: data.duration_seconds,
          view_count: data.view_count || 0,
          like_count: data.like_count || 0,
          comment_count: data.comment_count || 0,
          iframe_embed_code: data.iframe_embed_code,
          search_keyword: data.search_keyword,
          category_name: data.category_name,
          is_featured: data.is_featured,
          is_active: data.is_active,
          admin_notes: data.admin_notes,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        }
      } catch (error) {
        console.error('🚨 YouTube videos create critical error:', error)
        throw error
      }
    }
  }
}

// 导出Supabase适配器实例
export const prisma = new SupabaseAdapter()

// 默认导出
export default prisma 