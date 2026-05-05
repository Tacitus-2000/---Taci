# 认证架构核查报告与最终修复方案

**日期**: 2026-05-05  
**核查方法**: Systematic Debugging + 架构分析  
**状态**: ✅ 核查完成，提供最终方案

---

## 一、认证来源核查结果

### 1.1 当前项目使用的认证系统

**✅ 结论：使用 public.users 表 + 自定义 JWT 认证**

**证据**：

1. **登录逻辑** (`app/api/client/auth/login/route.ts`):
   ```typescript
   // Line 35-40: 查询 public.users 表
   const { data: user, error } = await supabase
     .from('users')  // ← public.users
     .select('*')
     .eq('email', email)
     .eq('role', 'client')
     .single<User>();
   
   // Line 53: 验证密码（bcrypt）
   const isPasswordValid = await verifyPassword(password, user.password_hash);
   
   // Line 66-70: 生成自定义 JWT
   const token = await generateToken({
     userId: user.id,
     email: user.email,
     role: user.role,
   });
   ```

2. **认证验证** (`middleware.ts` + `lib/auth/jwt.ts`):
   - 使用自定义 JWT (jose 库)
   - 不使用 Supabase Auth API
   - Cookie 名称: `client_token` / `admin_token`

3. **数据库查询结果**:
   - ✅ `public.users` 表存在，有 2 条记录
   - ✅ `client@example.com` 在 `public.users` 中，ID = `e1b6ca76-82cf-4001-bd5f-ba9434d6eade`
   - ❌ `client@example.com` 不在 `auth.users` 中
   - ❌ `auth.users` 表为空（未使用 Supabase Auth）

### 1.2 是否存在混用

**✅ 结论：不存在混用，完全使用自定义认证**

- 代码中没有使用 `supabase.auth.signInWithPassword()`
- 代码中没有使用 `supabase.auth.getUser()`
- 代码中没有使用 `supabase.auth.getSession()`
- 没有 `sb-xxx` 格式的 Cookie

### 1.3 前端登录后拿到的 user.id

**✅ 结论：来自 public.users.id**

- 登录返回: `user.id = e1b6ca76-82cf-4001-bd5f-ba9434d6eade`
- JWT payload: `userId = e1b6ca76-82cf-4001-bd5f-ba9434d6eade`
- 来源: `public.users` 表

---

## 二、数据库架构问题

### 2.1 当前架构

```
public.users (认证)          public.clients (业务)         public.client_profiles (档案)
    ↓                              ↓                               ↓
user.id                        client.id                    profile.client_id
e1b6ca76...                    8db36fa1...                  8db36fa1...
(登录用户)                      (业务客户)                    (有档案)

❌ 问题：user.id ≠ client.id，没有关联字段！
```

### 2.2 目标架构

```
public.users (认证)
    ↓
user.id = e1b6ca76...
    ↓
public.clients.user_id (新增字段) ← 外键引用 public.users(id)
    ↓
public.clients.id = 8db36fa1...
    ↓
public.client_profiles.client_id ← 外键引用 public.clients(id)
```

### 2.3 数据流

```
1. 用户登录 → 获取 public.users.id (e1b6ca76...)
2. 查询 public.clients WHERE user_id = e1b6ca76...
3. 获取 client.id (8db36fa1...)
4. 查询 public.client_profiles WHERE client_id = 8db36fa1...
5. 返回档案数据
```

---

## 三、最终修复方案

### 3.1 数据库迁移 SQL

**文件**: `supabase/migrations/20260505000002_add_user_id_to_clients_final.sql`

```sql
-- ============================================
-- 添加 user_id 到 clients 表
-- 引用: public.users(id)
-- ============================================

-- Step 1: 添加 user_id 列
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: 添加外键约束
ALTER TABLE public.clients
ADD CONSTRAINT fk_clients_user_id
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Step 3: 创建索引
CREATE INDEX IF NOT EXISTS idx_clients_user_id
ON public.clients(user_id);

-- Step 4: 添加唯一约束（一个用户只能有一个客户）
-- 注意：先检查是否已有重复数据
DO $$
BEGIN
  -- 检查是否有重复的 user_id
  IF NOT EXISTS (
    SELECT 1
    FROM public.clients
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) THEN
    -- 没有重复，添加唯一约束
    ALTER TABLE public.clients
    ADD CONSTRAINT unique_clients_user_id UNIQUE (user_id);
    
    RAISE NOTICE '✅ 添加唯一约束成功';
  ELSE
    RAISE WARNING '⚠️ 存在重复的 user_id，跳过唯一约束';
  END IF;
END $$;

-- Step 5: 关联测试用户到测试客户
-- 精准匹配：client@example.com → 客户 ID 8db36fa1...
UPDATE public.clients
SET user_id = 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade'
WHERE id = '8db36fa1-98de-48c4-aaa2-01e7cea8d986';

-- Step 6: 验证关联
DO $$
DECLARE
  linked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO linked_count
  FROM public.clients c
  JOIN public.users u ON c.user_id = u.id
  WHERE u.email = 'client@example.com';
  
  IF linked_count > 0 THEN
    RAISE NOTICE '✅ 测试用户关联成功: % 条记录', linked_count;
  ELSE
    RAISE WARNING '⚠️ 测试用户未关联';
  END IF;
END $$;

-- Step 7: 添加注释
COMMENT ON COLUMN public.clients.user_id IS '关联到 public.users 表的用户 ID（认证层）';

-- Step 8: 显示最终结果
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
LEFT JOIN public.users u ON c.user_id = u.id;
```

### 3.2 验证 SQL

```sql
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
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'clients'
  AND kcu.column_name = 'user_id';

-- 验证 3: 检查测试用户关联
SELECT
  u.id AS user_id,
  u.email,
  u.role,
  c.id AS client_id,
  c.name AS client_name,
  cp.id AS profile_id,
  cp.client_name AS profile_client_name
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.client_profiles cp ON cp.client_id = c.id
WHERE u.email = 'client@example.com';

-- 预期结果：
-- user_id: e1b6ca76-82cf-4001-bd5f-ba9434d6eade
-- client_id: 8db36fa1-98de-48c4-aaa2-01e7cea8d986
-- profile_id: e024acc6-3703-4f39-9181-32586c51664a
```

---

## 四、需要修改的 API

### 4.1 API 列表

需要修改以下 7 个 Client API：

1. ✅ `/api/client/profile` - 已修改
2. ⏳ `/api/client/calendar` - 待修改
3. ⏳ `/api/client/style-reference` - 待修改
4. ⏳ `/api/client/topics` - 待修改
5. ⏳ `/api/client/scripts` - 待修改
6. ⏳ `/api/client/feedback` - 待修改
7. ⏳ `/api/client/generate` - 待修改

### 4.2 统一修改模式

**修改前**（错误）:
```typescript
export async function GET(request: NextRequest) {
  const userId = searchParams.get('client_id'); // 实际是 user_id
  
  // 直接用 user_id 查询业务表 ❌
  const { data } = await supabase
    .from('client_profiles')
    .eq('client_id', userId)  // ❌ 错误：userId ≠ clientId
    .single();
}
```

**修改后**（正确）:
```typescript
export async function GET(request: NextRequest) {
  const userId = searchParams.get('client_id'); // 实际是 user_id
  
  // Step 1: 通过 user_id 查找 client_id
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  if (clientError || !client) {
    return apiError('CLIENT_NOT_LINKED', '当前登录用户未绑定客户信息', 404);
  }
  
  const clientId = client.id;
  
  // Step 2: 用 client_id 查询业务表
  const { data } = await supabase
    .from('client_profiles')
    .eq('client_id', clientId)  // ✅ 正确：使用真实的 clientId
    .single();
}
```

### 4.3 错误处理规范

```typescript
// 错误 1: 用户未关联客户
if (!client) {
  return apiError('CLIENT_NOT_LINKED', '当前登录用户未绑定客户信息', 404);
}

// 错误 2: 客户档案不存在
if (!profile) {
  return apiError('PROFILE_NOT_FOUND', 'Client profile not found or not visible', 404);
}

// 错误 3: 数据库查询失败
if (error) {
  return apiError('DATABASE_ERROR', 'Failed to fetch data', 500, error);
}
```

---

## 五、执行步骤

### 步骤 1: 执行数据库迁移

**通过 Supabase Dashboard**:

1. 访问: https://supabase.com/dashboard
2. 选择项目: `nnjznjlfnrqazenjtqza`
3. 进入 **SQL Editor**
4. 复制 `20260505000002_add_user_id_to_clients_final.sql` 的内容
5. 执行 SQL
6. 检查输出，确认：
   - ✅ user_id 列已添加
   - ✅ 外键约束已创建
   - ✅ 索引已创建
   - ✅ 唯一约束已创建
   - ✅ 测试用户已关联

### 步骤 2: 修改所有 Client API

我将创建一个辅助函数，统一处理 user_id → client_id 的转换。

### 步骤 3: 重启开发服务器

```bash
npm run dev
```

### 步骤 4: 测试所有页面

- ✅ 我的档案: http://localhost:3000/client/profile
- ✅ 内容日历: http://localhost:3000/client/calendar
- ✅ 风格参考: http://localhost:3000/client/style-reference
- ✅ 选题列表: http://localhost:3000/client/topics
- ✅ 文案列表: http://localhost:3000/client/scripts
- ✅ 反馈提交: http://localhost:3000/client/feedback
- ✅ 生成文案: http://localhost:3000/client/generate

---

## 六、架构决策

### 6.1 认证系统

**✅ 采用：public.users + 自定义 JWT**

**理由**：
1. 项目已完全实现自定义认证
2. 不依赖 Supabase Auth
3. 更灵活的用户管理
4. 支持双角色（Admin/Client）

**不采用 Supabase Auth 的原因**：
1. 当前代码完全不使用 `supabase.auth.*` API
2. 迁移到 Supabase Auth 需要重写所有认证逻辑
3. 自定义认证已经稳定工作

### 6.2 数据关联

**✅ 采用：public.users.id → public.clients.user_id → public.clients.id → public.client_profiles.client_id**

**理由**：
1. 清晰的层次结构
2. 认证层和业务层分离
3. 一个用户可以有一个客户
4. 一个客户可以有一个档案

### 6.3 API 设计

**✅ 采用：统一的 user_id → client_id 转换**

**理由**：
1. 前端只需要知道 user_id
2. 后端负责转换逻辑
3. 统一的错误处理
4. 清晰的错误信息

---

## 七、风险评估

### 7.1 迁移风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| 外键约束冲突 | 低 | 中 | 先检查数据完整性 |
| 唯一约束冲突 | 低 | 中 | 先检查重复数据 |
| API 修改遗漏 | 中 | 高 | 系统化修改所有 API |
| 前端缓存问题 | 低 | 低 | 重启服务器 + 硬刷新 |

### 7.2 回滚方案

如果迁移失败，可以回滚：

```sql
-- 删除外键约束
ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS fk_clients_user_id;

-- 删除唯一约束
ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS unique_clients_user_id;

-- 删除索引
DROP INDEX IF EXISTS idx_clients_user_id;

-- 删除列
ALTER TABLE public.clients
DROP COLUMN IF EXISTS user_id;
```

---

## 八、后续优化建议

### 8.1 短期（本次修复）

1. ✅ 添加 user_id 到 clients 表
2. ✅ 修改所有 Client API
3. ✅ 测试所有功能

### 8.2 中期（下个迭代）

1. 创建辅助函数 `getUserClient(userId)` 统一转换逻辑
2. 添加数据库触发器，自动创建 client 记录
3. 实现 RLS 策略，基于 user_id 过滤数据

### 8.3 长期（架构优化）

1. 考虑是否需要支持一个用户多个客户
2. 考虑是否需要迁移到 Supabase Auth
3. 实现完整的审计日志

---

## 九、总结

### 9.1 核心发现

1. **认证系统**: 使用 `public.users` + 自定义 JWT，不使用 Supabase Auth
2. **架构问题**: `users` 和 `clients` 表没有关联
3. **修复方案**: 添加 `clients.user_id` 引用 `public.users(id)`
4. **影响范围**: 7 个 Client API 需要修改

### 9.2 修复优先级

| 优先级 | 任务 | 状态 |
|--------|------|------|
| P0 | 执行数据库迁移 | ⏳ 待执行 |
| P0 | 修改所有 Client API | ⏳ 待执行 |
| P0 | 测试所有页面 | ⏳ 待执行 |
| P1 | 创建辅助函数 | 📋 计划中 |
| P2 | 实现 RLS 策略 | 📋 计划中 |

---

**报告完成时间**: 2026-05-05  
**核查方法**: Superpowers Systematic Debugging  
**核查人员**: Claude (Sonnet 4.6)  
**下一步**: 等待用户确认后执行迁移
