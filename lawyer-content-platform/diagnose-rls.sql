-- 诊断 RLS 配置

-- 1. 检查 RLS 是否启用
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'client_profiles', 'topics', 'scripts')
ORDER BY tablename;

-- 2. 检查现有策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles::text,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'client_profiles', 'topics', 'scripts')
ORDER BY tablename, policyname;

-- 3. 测试查询（使用 anon 角色）
SET ROLE anon;
SELECT id, name, user_id FROM public.clients LIMIT 1;
RESET ROLE;
