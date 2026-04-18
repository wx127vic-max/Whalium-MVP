-- =====================================================
-- Whalium 订阅表迁移
-- 在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. 创建订阅记录表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan              text NOT NULL DEFAULT 'consumer',
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','expired','cancelled','pending')),
  payment_method    text,                  -- 'stripe' | 'alipay_manual' | 'wechat_manual'
  amount            numeric(10,2),
  currency          text DEFAULT 'CNY',
  stripe_session_id text,                  -- Stripe checkout session id
  order_no          text,                  -- 内部订单号
  starts_at         timestamptz DEFAULT now(),
  expires_at        timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx  ON public.subscriptions(status);

-- 3. RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的订阅
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的订阅（付款成功后前端写入）
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理员全权访问
DROP POLICY IF EXISTS "Admin full access subscriptions" ON public.subscriptions;
CREATE POLICY "Admin full access subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt() ->> 'email' IN ('admin@whalium.com'))  -- ← 改成你的邮箱
  WITH CHECK (auth.jwt() ->> 'email' IN ('admin@whalium.com'));

-- 4. 验证
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
