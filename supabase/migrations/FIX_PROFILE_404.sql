-- ============================================
-- 修复 Profile 404 问题 - 数据库迁移脚本
-- ============================================
--
-- 问题：users 表和 clients 表没有关联
-- 解决：添加 user_id 字段到 clients 表
--
-- 执行方式：
-- 1. 访问 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下 SQL
-- ============================================

-- Step 1: 添加 user_id 列到 clients 表
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Step 3: 添加唯一约束（一个用户只能有一个客户）
ALTER TABLE clients
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Step 4: 将现有的测试客户关联到测试用户
UPDATE clients
SET user_id = (
  SELECT id FROM users
  WHERE email = 'client@example.com'
  LIMIT 1
)
WHERE id = (
  SELECT id FROM clients
  LIMIT 1
);

-- Step 5: 验证关联是否成功
SELECT
  c.id as client_id,
  c.name as client_name,
  c.user_id,
  u.email as user_email,
  u.role as user_role
FROM clients c
LEFT JOIN users u ON c.user_id = u.id;

-- Step 6: 检查 client_profiles 是否存在
SELECT
  cp.id as profile_id,
  cp.client_id,
  cp.client_name,
  cp.visible_to_client,
  c.user_id,
  u.email as user_email
FROM client_profiles cp
JOIN clients c ON cp.client_id = c.id
LEFT JOIN users u ON c.user_id = u.id;

-- 预期结果：
-- 1. clients 表应该有 user_id 列
-- 2. 测试客户应该关联到 client@example.com 用户
-- 3. 可以通过 user_id 找到对应的 client_id
-- 4. 可以通过 client_id 找到对应的 profile
