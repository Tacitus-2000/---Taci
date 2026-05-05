-- ============================================
-- 最终修复方案：添加 user_id 到 clients 表
-- ============================================
--
-- 目标：建立 public.users 和 public.clients 的关联
-- 引用：public.users(id) → public.clients.user_id
--
-- 执行方式：
-- 1. 访问 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下 SQL
-- ============================================

BEGIN;

-- Step 1: 添加 user_id 列
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'clients'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clients
    ADD COLUMN user_id UUID;

    RAISE NOTICE '✅ Step 1: user_id 列已添加';
  ELSE
    RAISE NOTICE 'ℹ️ Step 1: user_id 列已存在，跳过';
  END IF;
END $$;

-- Step 2: 添加外键约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'clients'
      AND constraint_name = 'fk_clients_user_id'
  ) THEN
    ALTER TABLE public.clients
    ADD CONSTRAINT fk_clients_user_id
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

    RAISE NOTICE '✅ Step 2: 外键约束已添加';
  ELSE
    RAISE NOTICE 'ℹ️ Step 2: 外键约束已存在，跳过';
  END IF;
END $$;

-- Step 3: 创建索引
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'clients'
      AND indexname = 'idx_clients_user_id'
  ) THEN
    CREATE INDEX idx_clients_user_id
    ON public.clients(user_id);

    RAISE NOTICE '✅ Step 3: 索引已创建';
  ELSE
    RAISE NOTICE 'ℹ️ Step 3: 索引已存在，跳过';
  END IF;
END $$;

-- Step 4: 添加唯一约束（先检查重复数据）
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- 检查是否有重复的 user_id
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id
    FROM public.clients
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) AS duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING '⚠️ Step 4: 存在 % 个重复的 user_id，跳过唯一约束', duplicate_count;
    RAISE WARNING '请先解决重复数据问题';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'clients'
      AND constraint_name = 'unique_clients_user_id'
  ) THEN
    RAISE NOTICE 'ℹ️ Step 4: 唯一约束已存在，跳过';
  ELSE
    ALTER TABLE public.clients
    ADD CONSTRAINT unique_clients_user_id UNIQUE (user_id);

    RAISE NOTICE '✅ Step 4: 唯一约束已添加';
  END IF;
END $$;

-- Step 5: 关联测试用户到测试客户
-- 精准匹配：client@example.com (e1b6ca76...) → 客户 ID (8db36fa1...)
DO $$
DECLARE
  test_user_id UUID := 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade';
  test_client_id UUID := '8db36fa1-98de-48c4-aaa2-01e7cea8d986';
  user_exists BOOLEAN;
  client_exists BOOLEAN;
  already_linked BOOLEAN;
BEGIN
  -- 检查用户是否存在
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = test_user_id
  ) INTO user_exists;

  -- 检查客户是否存在
  SELECT EXISTS (
    SELECT 1 FROM public.clients WHERE id = test_client_id
  ) INTO client_exists;

  -- 检查是否已关联
  SELECT EXISTS (
    SELECT 1 FROM public.clients WHERE id = test_client_id AND user_id = test_user_id
  ) INTO already_linked;

  IF NOT user_exists THEN
    RAISE WARNING '⚠️ Step 5: 测试用户不存在 (ID: %)', test_user_id;
  ELSIF NOT client_exists THEN
    RAISE WARNING '⚠️ Step 5: 测试客户不存在 (ID: %)', test_client_id;
  ELSIF already_linked THEN
    RAISE NOTICE 'ℹ️ Step 5: 测试用户已关联，跳过';
  ELSE
    UPDATE public.clients
    SET user_id = test_user_id
    WHERE id = test_client_id;

    RAISE NOTICE '✅ Step 5: 测试用户已关联到测试客户';
  END IF;
END $$;

-- Step 6: 添加列注释
COMMENT ON COLUMN public.clients.user_id IS '关联到 public.users 表的用户 ID（认证层）';

RAISE NOTICE '✅ Step 6: 列注释已添加';

-- Step 7: 显示最终结果
DO $$
DECLARE
  result_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '迁移完成 - 验证结果';
  RAISE NOTICE '========================================';

  FOR result_record IN
    SELECT
      c.id AS client_id,
      c.name AS client_name,
      c.user_id,
      u.email AS user_email,
      u.role AS user_role,
      CASE
        WHEN c.user_id IS NOT NULL THEN '✅ 已关联'
        ELSE '❌ 未关联'
      END AS link_status
    FROM public.clients c
    LEFT JOIN public.users u ON c.user_id = u.id
  LOOP
    RAISE NOTICE 'Client: % | User: % | Status: %',
      result_record.client_name,
      COALESCE(result_record.user_email, 'N/A'),
      result_record.link_status;
  END LOOP;

  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================
-- 验证 SQL（可选，单独执行）
-- ============================================

-- 验证 1: 检查表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
  AND column_name = 'user_id';

-- 验证 2: 检查外键约束
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'clients'
  AND kcu.column_name = 'user_id';

-- 验证 3: 检查测试用户完整链路
SELECT
  u.id AS user_id,
  u.email AS user_email,
  u.role AS user_role,
  c.id AS client_id,
  c.name AS client_name,
  cp.id AS profile_id,
  cp.client_name AS profile_client_name,
  cp.visible_to_client
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.client_profiles cp ON cp.client_id = c.id
WHERE u.email = 'client@example.com';

-- 预期结果：
-- user_id: e1b6ca76-82cf-4001-bd5f-ba9434d6eade
-- client_id: 8db36fa1-98de-48c4-aaa2-01e7cea8d986
-- profile_id: e024acc6-3703-4f39-9181-32586c51664a
-- visible_to_client: true
