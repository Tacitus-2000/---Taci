-- 检查数据库中的实际数据状态

-- 1. 检查 clients 表
SELECT 
  'clients' as table_name,
  COUNT(*) as total_count
FROM public.clients;

-- 2. 检查 client_profiles 表
SELECT 
  'client_profiles' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE visible_to_client = true) as visible_count,
  COUNT(*) FILTER (WHERE visible_to_client = false) as hidden_count
FROM public.client_profiles;

-- 3. 检查 topics 表
SELECT 
  'topics' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE visible_to_client = true) as visible_count,
  COUNT(*) FILTER (WHERE visible_to_client = false) as hidden_count
FROM public.topics;

-- 4. 检查 scripts 表
SELECT 
  'scripts' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE visible_to_client = true) as visible_count,
  COUNT(*) FILTER (WHERE visible_to_client = false) as hidden_count
FROM public.scripts;

-- 5. 查看 clients 表的实际数据（前 3 条）
SELECT id, name, user_id, created_at
FROM public.clients
ORDER BY created_at DESC
LIMIT 3;

-- 6. 查看 client_profiles 表的实际数据（前 3 条）
SELECT id, client_id, client_name, visible_to_client, created_at
FROM public.client_profiles
ORDER BY created_at DESC
LIMIT 3;
