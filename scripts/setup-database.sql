-- 🗄️ FluxKontext 数据库初始化脚本
-- 在Supabase SQL编辑器中执行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  image VARCHAR,
  credits INTEGER DEFAULT 30,
  location VARCHAR,
  last_signin_at TIMESTAMP WITH TIME ZONE,
  signin_count INTEGER DEFAULT 0,
  signin_type VARCHAR,
  signin_provider VARCHAR,
  signin_openid VARCHAR,
  signin_ip VARCHAR,
  preferred_currency VARCHAR DEFAULT 'USD',
  preferred_payment_provider VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付订单表
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  order_number VARCHAR UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR NOT NULL,
  product_type VARCHAR NOT NULL,
  product_id VARCHAR NOT NULL,
  product_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  stripe_session_id VARCHAR,
  stripe_payment_intent_id VARCHAR,
  creem_checkout_id VARCHAR,
  creem_payment_id VARCHAR,
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  payment_order_id UUID REFERENCES public.payment_orders(id),
  reference_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  billing_cycle VARCHAR NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_provider VARCHAR NOT NULL,
  stripe_subscription_id VARCHAR,
  creem_subscription_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支付配置表
CREATE TABLE IF NOT EXISTS public.payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_enabled BOOLEAN DEFAULT false,
  creem_enabled BOOLEAN DEFAULT false,
  default_provider VARCHAR DEFAULT 'stripe',
  maintenance_mode BOOLEAN DEFAULT false,
  last_updated_by VARCHAR NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生成记录表（用于图像生成历史）
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model VARCHAR NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  image_urls TEXT[],
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_transactions_updated_at BEFORE UPDATE ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_configs_updated_at BEFORE UPDATE ON public.payment_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认支付配置
INSERT INTO public.payment_configs (
  stripe_enabled,
  creem_enabled,
  default_provider,
  maintenance_mode,
  last_updated_by,
  notes
) VALUES (
  true,
  false,
  'stripe',
  false,
  'system',
  'Initial payment configuration'
) ON CONFLICT DO NOTHING;

-- 创建测试用户（可选）
INSERT INTO public.users (
  email,
  name,
  credits,
  signin_provider,
  signin_type
) VALUES (
  'test@example.com',
  'Test User',
  1000,
  'credentials',
  'test'
) ON CONFLICT (email) DO NOTHING;

-- 设置行级安全策略（RLS）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- 支付订单策略
CREATE POLICY "Users can view own orders" ON public.payment_orders FOR SELECT USING (auth.uid()::text = user_id::text);

-- 积分交易策略
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

-- 订阅策略
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid()::text = user_id::text);

-- 生成记录策略
CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own generations" ON public.generations FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 完成提示
SELECT 'Database setup completed successfully!' as message; 