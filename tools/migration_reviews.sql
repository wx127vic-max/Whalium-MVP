-- =====================================================
-- Whalium 评价系统迁移脚本
-- 在 Supabase SQL Editor 中运行
-- https://supabase.com/dashboard/project/cenmhxewrmjpibkokuls/sql/new
-- =====================================================

-- 1. 添加评分维度细项字段（存储 5 个维度的原始评分）
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS rating_breakdown jsonb DEFAULT '{}';

-- 2. 确保 RLS 已开启
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. 公开可读已审核评价
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

-- 4. 已登录用户可提交评价
DROP POLICY IF EXISTS "Auth users can insert reviews" ON public.reviews;
CREATE POLICY "Auth users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. 验证结构
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
