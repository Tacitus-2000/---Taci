-- ============================================
-- RLS 策略配置
-- ============================================
--
-- 目标：为 Client API 配置安全的 RLS 策略
-- 原则：只允许读取 visible_to_client = true 的数据
--
-- 执行方式：
-- 1. 访问 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下 SQL
-- ============================================

BEGIN;

-- ============================================
-- 1. clients 表 RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;

-- 创建新策略：允许所有人读取 clients 表
-- 注意：应用层会通过 user_id 进行权限控制
CREATE POLICY "Allow public read access to clients"
ON public.clients
FOR SELECT
TO public
USING (true);

RAISE NOTICE '✅ clients 表 RLS 策略已配置';

-- ============================================
-- 2. client_profiles 表 RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access to visible profiles" ON public.client_profiles;

-- 创建新策略：只允许读取 visible_to_client = true 的档案
CREATE POLICY "Allow public read access to visible profiles"
ON public.client_profiles
FOR SELECT
TO public
USING (visible_to_client = true);

RAISE NOTICE '✅ client_profiles 表 RLS 策略已配置';

-- ============================================
-- 3. topics 表 RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access to visible topics" ON public.topics;

-- 创建新策略：只允许读取 visible_to_client = true 的选题
CREATE POLICY "Allow public read access to visible topics"
ON public.topics
FOR SELECT
TO public
USING (visible_to_client = true);

RAISE NOTICE '✅ topics 表 RLS 策略已配置';

-- ============================================
-- 4. scripts 表 RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access to visible scripts" ON public.scripts;

-- 创建新策略：只允许读取 visible_to_client = true 的文案
CREATE POLICY "Allow public read access to visible scripts"
ON public.scripts
FOR SELECT
TO public
USING (visible_to_client = true);

RAISE NOTICE '✅ scripts 表 RLS 策略已配置';

-- ============================================
-- 5. 验证 RLS 策略
-- ============================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS 策略配置完成 - 验证结果';
  RAISE NOTICE '========================================';

  FOR policy_record IN
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles::text,
      cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('clients', 'client_profiles', 'topics', 'scripts')
    ORDER BY tablename, policyname
  LOOP
    RAISE NOTICE 'Table: % | Policy: % | Command: % | Roles: %',
      policy_record.tablename,
      policy_record.policyname,
      policy_record.cmd,
      policy_record.roles;
  END LOOP;

  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================
-- 测试 SQL（可选，单独执行）
-- ============================================

-- 测试 1: 验证 clients 表策略
-- 应该返回数据
SELECT id, name, user_id
FROM public.clients
LIMIT 1;

-- 测试 2: 验证 client_profiles 表策略
-- 应该只返回 visible_to_client = true 的数据
SELECT id, client_id, client_name, visible_to_client
FROM public.client_profiles
WHERE visible_to_client = true
LIMIT 1;

-- 测试 3: 验证 topics 表策略
-- 应该只返回 visible_to_client = true 的数据
SELECT id, client_id, title, visible_to_client
FROM public.topics
WHERE visible_to_client = true
LIMIT 1;

-- 测试 4: 验证 scripts 表策略
-- 应该只返回 visible_to_client = true 的数据
SELECT id, client_id, title, visible_to_client
FROM public.scripts
WHERE visible_to_client = true
LIMIT 1;
