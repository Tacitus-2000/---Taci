# Client API 认证修复指南

## 📋 问题总结

### 根本原因（双重问题）

1. **认证层问题**：Client API 使用 `getSupabaseClient()` (ANON_KEY) → RLS 阻止查询
2. **数据层问题**：`clients` 表和相关表没有测试数据

### 修复方案

✅ **已完成**：
- 修改所有 Client API 使用 `getSupabaseAdmin()` (SERVICE_ROLE_KEY)
- 创建种子数据迁移文件

⏳ **待执行**：
- 在 Supabase 中执行种子数据迁移
- 测试 Client API 功能

---

## 🔧 已修改的文件

### 1. Client API 路由（8个文件）

所有文件已从 `getSupabaseClient()` 改为 `getSupabaseAdmin()`：

```
✅ app/api/client/profile/route.ts
✅ app/api/client/topics/route.ts
✅ app/api/client/calendar/route.ts
✅ app/api/client/scripts/route.ts
✅ app/api/client/style-reference/route.ts
✅ app/api/client/feedback/route.ts
✅ app/api/client/generate/route.ts
```

**注意**：`app/api/client/auth/` 下的文件（login, logout, me）已经在使用正确的认证方式，无需修改。

### 2. 新增迁移文件

```
✅ supabase/migrations/20260505000004_seed_test_data.sql
```

---

## 🚀 执行步骤

### Step 1: 执行种子数据迁移

**方式 A：通过 Supabase Dashboard（推荐）**

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 打开文件：`supabase/migrations/20260505000004_seed_test_data.sql`
5. 复制全部内容
6. 粘贴到 SQL Editor
7. 点击 **Run** 执行

**方式 B：通过 Supabase CLI**

```bash
cd E:/Lawer-Contest
supabase db push
```

### Step 2: 验证数据已插入

在 Supabase SQL Editor 中执行：

```sql
-- 验证完整链路
SELECT
  u.id AS user_id,
  u.email AS user_email,
  u.role AS user_role,
  c.id AS client_id,
  c.name AS client_name,
  cp.id AS profile_id,
  cp.client_name AS profile_client_name,
  (SELECT COUNT(*) FROM public.topics WHERE client_id = c.id) AS topic_count,
  (SELECT COUNT(*) FROM public.scripts WHERE client_id = c.id) AS script_count
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.client_profiles cp ON cp.client_id = c.id
WHERE u.email = 'client@example.com';
```

**预期结果**：
```
user_id: e1b6ca76-82cf-4001-bd5f-ba9434d6eade (或其他UUID)
client_id: 8db36fa1-98de-48c4-aaa2-01e7cea8d986
profile_id: e024acc6-3703-4f39-9181-32586c51664a
topic_count: 3
script_count: 2
```

### Step 3: 启动开发服务器

```bash
cd E:/Lawer-Contest/lawyer-content-platform
npm run dev
```

服务器将运行在：`http://localhost:3001`

### Step 4: 测试 Client API

**4.1 登录**

```bash
curl -X POST http://localhost:3001/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "client123"
  }' \
  -c cookies.txt
```

**预期响应**：
```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": "e1b6ca76-82cf-4001-bd5f-ba9434d6eade",
    "email": "client@example.com",
    "role": "client",
    "name": "测试客户"
  }
}
```

**4.2 获取用户信息**

```bash
curl http://localhost:3001/api/client/auth/me \
  -b cookies.txt
```

**预期响应**：
```json
{
  "success": true,
  "user": {
    "userId": "e1b6ca76-82cf-4001-bd5f-ba9434d6eade",
    "email": "client@example.com",
    "role": "client"
  }
}
```

**4.3 获取客户档案**

```bash
curl "http://localhost:3001/api/client/profile?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade" \
  -b cookies.txt
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "id": "e024acc6-3703-4f39-9181-32586c51664a",
    "client_id": "8db36fa1-98de-48c4-aaa2-01e7cea8d986",
    "client_name": "张律师事务所",
    "industry_name": "法律服务",
    "niche_direction": "专注于企业法律顾问和合同纠纷",
    ...
  }
}
```

**4.4 获取选题列表**

```bash
curl "http://localhost:3001/api/client/topics?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade" \
  -b cookies.txt
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "title": "企业合同审查的5个关键要点",
        "status": "approved",
        ...
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

**4.5 获取文案列表**

```bash
curl "http://localhost:3001/api/client/scripts?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade" \
  -b cookies.txt
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
        "title": "企业合同审查的5个关键要点",
        "status": "published",
        ...
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

### Step 5: 测试前端页面

1. 访问 `http://localhost:3001/client/login`
2. 使用测试账号登录：
   - 邮箱：`client@example.com`
   - 密码：`client123`
3. 登录成功后，依次测试以下页面：
   - ✅ Dashboard：`http://localhost:3001/client/dashboard`
   - ✅ 客户档案：`http://localhost:3001/client/profile`
   - ✅ 选题列表：`http://localhost:3001/client/topics`
   - ✅ 文案列表：`http://localhost:3001/client/scripts`
   - ✅ 内容日历：`http://localhost:3001/client/calendar`
   - ✅ 风格参考：`http://localhost:3001/client/style-reference`
   - ✅ 生成文案：`http://localhost:3001/client/generate`
   - ✅ 反馈提交：`http://localhost:3001/client/feedback`

---

## 🔍 故障排查

### 问题 1：仍然返回 CLIENT_NOT_FOUND

**可能原因**：种子数据未执行或执行失败

**解决方案**：
1. 检查 Supabase SQL Editor 的执行日志
2. 手动执行验证 SQL（见 Step 2）
3. 确认 `clients` 表中有数据

### 问题 2：RLS 错误

**可能原因**：RLS 策略配置问题

**解决方案**：
使用 SERVICE_ROLE_KEY 应该绕过 RLS，如果仍有问题，检查：
```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_profiles', 'topics', 'scripts');
```

### 问题 3：环境变量未配置

**检查 `.env.local`**：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← 必须配置
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📊 测试数据概览

### 测试用户
- **邮箱**：`client@example.com`
- **密码**：`client123`
- **角色**：`client`
- **User ID**：`e1b6ca76-82cf-4001-bd5f-ba9434d6eade`（可能不同）

### 测试客户
- **Client ID**：`8db36fa1-98de-48c4-aaa2-01e7cea8d986`
- **名称**：张律师事务所
- **行业**：法律服务
- **状态**：active

### 测试档案
- **Profile ID**：`e024acc6-3703-4f39-9181-32586c51664a`
- **客户名称**：张律师事务所
- **细分方向**：专注于企业法律顾问和合同纠纷
- **目标客户**：中小企业主、创业者

### 测试选题（3条）
1. 企业合同审查的5个关键要点
2. 劳动合同纠纷如何维权
3. 知识产权保护实用指南

### 测试文案（2条）
1. 企业合同审查的5个关键要点（published）
2. 劳动合同纠纷如何维权（approved）

---

## ✅ 验证清单

完成以下检查后，Client API 修复即完成：

- [ ] 种子数据迁移已执行
- [ ] 数据验证 SQL 返回正确结果
- [ ] 开发服务器正常启动
- [ ] Client 登录 API 正常
- [ ] Client 档案 API 返回数据
- [ ] Client 选题 API 返回数据
- [ ] Client 文案 API 返回数据
- [ ] 所有前端页面正常显示
- [ ] 无 RLS 错误
- [ ] 无 CLIENT_NOT_FOUND 错误

---

## 📝 技术说明

### 为什么使用 SERVICE_ROLE_KEY？

1. **与 Admin API 保持一致**：Admin API 已经使用 SERVICE_ROLE_KEY
2. **绕过 RLS 限制**：避免复杂的 RLS 策略配置
3. **应用层权限控制**：通过 `user_id → client_id` 转换在应用层控制权限
4. **简化实现**：减少认证复杂度，提高开发效率

### 安全性考虑

- ✅ SERVICE_ROLE_KEY 仅在服务端使用，不暴露给前端
- ✅ 所有 Client API 都验证 `user_id` 并转换为 `client_id`
- ✅ 数据过滤在应用层实现（`visible_to_client`, `internal_only`）
- ✅ JWT token 存储在 httpOnly Cookie 中，防止 XSS 攻击

---

**最后更新**：2026-05-05  
**修复版本**：V9 - 认证层 + 数据层双重修复
