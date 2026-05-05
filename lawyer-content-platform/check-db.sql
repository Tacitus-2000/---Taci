-- 检查 users 表
SELECT id, email, role FROM public.users WHERE email = 'client@example.com';

-- 检查 clients 表
SELECT id, user_id, client_name FROM public.clients;

-- 检查数据链路
SELECT 
  u.id AS user_id,
  u.email,
  u.role,
  c.id AS client_id,
  c.client_name,
  c.user_id AS client_user_id
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE u.email = 'client@example.com';
