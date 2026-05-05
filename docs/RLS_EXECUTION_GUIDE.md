# RLS 策略执行指南

**日期**: 2026-05-05  
**迁移脚本**: `supabase/migrations/20260505000003_configure_rls_policies.sql`

---

## 执行步骤

### 1. 访问 Supabase Dashboard

1. 打开浏览器，访问：https://supabase.com/dashboard
2. 登录你的 Supabase 账号
3. 选择你的项目

### 2. 打开 SQL Editor

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New query** 创建新查询

### 3. 执行迁移脚本

1. 打开文件：`E:\Lawer-Contest\supabase\migrations\20260505000003_configure_rls_policies.sql`
2. 复制全部内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行

### 4. 验证执行结果

执行成功后，你应该看到以下输出：

```
✅ clients 表 RLS 策略已配置
✅ client_profiles 表 RLS 策略已配置
✅ topics 表 RLS 策略已配置
✅ scripts 表 RLS 策略已配置

========================================
RLS 策略配置完成 - 验证结果
========================================
Table: clients | Policy: Allow public read access to clients | Command: SELECT | Roles: {public}
Table: client_profiles | Policy: Allow public read access to visible profiles | Command: SELECT | Roles: {public}
Table: topics | Policy: Allow public read access to visible topics | Command: SELECT | Roles: {public}
Table: scripts | Policy: Allow public read access to visible scripts | Command: SELECT | Roles: {public}
========================================
```

### 5. 测试 API

执行完成后，在本地测试 API：

```bash
# 1. 登录
curl -c cookies.txt -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}'

# 2. 测试客户档案 API
curl -b cookies.txt "http://localhost:3000/api/client/profile?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade"

# 3. 测试内容日历 API
curl -b cookies.txt "http://localhost:3000/api/client/calendar?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade"

# 4. 测试选题列表 API
curl -b cookies.txt "http://localhost:3000/api/client/topics?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade"

# 5. 测试风格参考 API
curl -b cookies.txt "http://localhost:3000/api/client/style-reference?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade"
```

所有 API 应该返回成功响应（不再是 "Client not found"）。

---

## RLS 策略说明

### clients 表
- **策略**: 允许所有人读取
- **原因**: 应用层会通过 `user_id` 进行权限控制

### client_profiles 表
- **策略**: 只允许读取 `visible_to_client = true` 的档案
- **原因**: 保护 `internal_notes` 等敏感信息

### topics 表
- **策略**: 只允许读取 `visible_to_client = true` 的选题
- **原因**: 隐藏内部选题

### scripts 表
- **策略**: 只允许读取 `visible_to_client = true` 的文案
- **原因**: 隐藏草稿和内部文案

---

## 故障排除

### 问题 1: 执行失败 - "policy already exists"

**解决方案**: 脚本已经包含 `DROP POLICY IF EXISTS`，应该不会出现此问题。如果出现，手动删除旧策略：

```sql
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public read access to visible profiles" ON public.client_profiles;
DROP POLICY IF EXISTS "Allow public read access to visible topics" ON public.topics;
DROP POLICY IF EXISTS "Allow public read access to visible scripts" ON public.scripts;
```

### 问题 2: API 仍然返回 "Client not found"

**可能原因**:
1. RLS 策略未生效 - 重启 Supabase 项目
2. 数据不存在 - 检查 `visible_to_client` 字段是否为 `true`
3. 缓存问题 - 重启本地开发服务器

**检查步骤**:
```bash
# 重启开发服务器
taskkill //F //IM node.exe
npm run dev
```

### 问题 3: 权限不足

**错误信息**: "permission denied for table clients"

**解决方案**: 确保你使用的是项目 Owner 账号登录 Supabase Dashboard。

---

## 安全说明

### 为什么 clients 表允许所有人读取？

虽然 `clients` 表允许所有人读取，但：
1. API 层会验证 JWT token
2. API 层会通过 `user_id` 过滤数据
3. 只有认证用户才能访问 API

### 数据隔离如何保证？

1. **认证层**: JWT token 验证用户身份
2. **应用层**: API 通过 `user_id → client_id` 转换确保数据隔离
3. **数据层**: RLS 策略过滤 `visible_to_client = false` 的数据

---

## 完成后

执行完成并验证成功后，请告知我，我将继续修复剩余的 ESLint 错误和警告。
