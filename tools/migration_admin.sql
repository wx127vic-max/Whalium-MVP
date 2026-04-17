-- =====================================================
-- Whalium 管理员权限迁移
-- 在 Supabase SQL Editor 中运行
-- ⚠️ 把下面的 admin@whalium.com 换成你的真实邮箱
-- =====================================================

-- 1. reviews 表：管理员可读取所有评价（含 pending/rejected）
DROP POLICY IF EXISTS "Admin full access reviews" ON public.reviews;
CREATE POLICY "Admin full access reviews"
  ON public.reviews FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  );

-- 2. inquiries 表：管理员可读取所有询盘
DROP POLICY IF EXISTS "Admin full access inquiries" ON public.inquiries;
CREATE POLICY "Admin full access inquiries"
  ON public.inquiries FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  );

-- 3. firms 表：管理员可更新律所资料
DROP POLICY IF EXISTS "Admin full access firms" ON public.firms;
CREATE POLICY "Admin full access firms"
  ON public.firms FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@whalium.com'   -- ← 改成你的邮箱
    )
  );

-- 4. 验证现有策略
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('reviews', 'inquiries', 'firms')
ORDER BY tablename, policyname;
