# RLS 策略问题报告

**日期**: 2026-05-05  
**状态**: 🔴 阻塞 - 需要数据库配置

---

## 问题描述

所有 Client API 返回错误：
- **内容日历、选题、风格参考**: `Client not found`
- **客户档案**: `Client profile not found or not visible`

## 根本原因

`clients` 表启用了 RLS（Row Level Security），但没有配置允许匿名用户查询的策略。

### 验证结果

1. **使用 SERVICE_ROLE_KEY 查询** ✅ 成功
   ```javascript
   // 返回数据
   {
     "id": "8db36fa1-98de-48c4-aaa2-01e7cea8d986",
     "name": "1",
     "user_id": "e1b6ca76-82cf-4001-bd5f-ba9434d6eade"
   }
   ```

2. **使用 ANON_KEY 查询** ❌ 失败
   ```
   Code: PGRST116
   Message: The result contains 0 rows
   ```

## 解决方案

### 方案 1：禁用 RLS（快速修复，不推荐用于生产）

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 禁用 clients 表的 RLS
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 禁用 client_profiles 表的 RLS
ALTER TABLE public.client_profiles DISABLE ROW LEVEL SECURITY;

-- 禁用 topics 表的 RLS
ALTER TABLE public.topics DISABLE ROW LEVEL SECURITY;

-- 禁用 scripts 表的 RLS
ALTER TABLE public.scripts DISABLE ROW LEVEL SECURITY;
```

### 方案 2：配置 RLS 策略（推荐，安全）

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- ============================================
-- RLS 策略配置
-- ============================================

-- 1. clients 表 RLS 策略
-- 允许所有人读取（因为 API 会在应用层做权限控制）
CREATE POLICY "Allow public read access to clients"
ON public.clients
FOR SELECT
TO public
USING (true);

-- 2. client_profiles 表 RLS 策略
-- 允许所有人读取 visible_to_client = true 的档案
CREATE POLICY "Allow public read access to visible profiles"
ON public.client_profiles
FOR SELECT
TO public
USING (visible_to_client = true);

-- 3. topics 表 RLS 策略
-- 允许所有人读取 visible_to_client = true 的选题
CREATE POLICY "Allow public read access to visible topics"
ON public.topics
FOR SELECT
TO public
USING (visible_to_client = true);

-- 4. scripts 表 RLS 策略
-- 允许所有人读取 visible_to_client = true 的文案
CREATE POLICY "Allow public read access to visible scripts"
ON public.scripts
FOR SELECT
TO public
USING (visible_to_client = true);
```

### 方案 3：使用 SERVICE_ROLE_KEY（中间方案）

修改 `lib/supabase/client.ts`，在 API Routes 中使用 SERVICE_ROLE_KEY：

```typescript
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // 在服务端使用 SERVICE_ROLE_KEY，绕过 RLS
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 配置未设置');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabaseInstance;
}
```

## 推荐方案

**短期（立即修复）**: 方案 3 - 使用 SERVICE_ROLE_KEY  
**长期（生产环境）**: 方案 2 - 配置 RLS 策略

## 影响范围

- ✅ Admin API：不受影响（已经可以正常工作）
- ❌ Client API：全部受影响
  - `/api/client/profile`
  - `/api/client/calendar`
  - `/api/client/topics`
  - `/api/client/scripts`
  - `/api/client/style-reference`
  - `/api/client/feedback`
  - `/api/client/generate`

## 下一步行动

请选择一个方案并确认执行：

1. **方案 1**：快速禁用 RLS（测试环境）
2. **方案 2**：配置 RLS 策略（生产环境）
3. **方案 3**：修改代码使用 SERVICE_ROLE_KEY（中间方案）

---

**报告人**: Claude  
**优先级**: P0 - 阻塞所有 Client 功能
