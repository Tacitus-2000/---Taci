# Supabase Migration 执行指南

**生成时间**: 2026-05-05  
**状态**: ✅ 已通过 Agent Team 审查  
**总文件数**: 14 个 SQL 文件

---

## 📋 执行摘要

本指南提供了完整的 Supabase 数据库 migration 执行步骤，解决了 `clients` 表缺失问题，并建立了正确的表依赖关系。

**关键修复**：
- ✅ 创建了 11 个业务表的 migration 文件
- ✅ 修复了 `client_feedback` 表对 `clients` 表的依赖
- ✅ 建立了正确的触发器函数依赖
- ✅ 启用了所有业务表的 RLS（Row Level Security）

---

## 🗂️ Migration 文件清单

所有文件位于：`E:\Lawer-Contest\supabase\migrations\`

| 序号 | 文件名 | 表名 | 依赖 | 大小 |
|------|--------|------|------|------|
| 1 | `20260504000000_create_users.sql` | users | 无 | 1.3K |
| 2 | `20260504000001_create_trigger_functions.sql` | - | 无 | 610B |
| 3 | `20260504000002_create_industries.sql` | industries | 触发器函数 | 1.2K |
| 4 | `20260504000003_create_clients.sql` | clients | industries | 1.6K |
| 5 | `20260504000004_create_industry_templates.sql` | industry_templates | industries | 2.1K |
| 6 | `20260504000005_create_prompt_templates.sql` | prompt_templates | industries | 1.9K |
| 7 | `20260504000006_create_client_profiles.sql` | client_profiles | clients, industries | 2.3K |
| 8 | `20260504000007_create_agent_runs.sql` | agent_runs | clients, industries | 2.0K |
| 9 | `20260504000008_create_topics.sql` | topics | clients, industries | 1.8K |
| 10 | `20260504000009_create_scripts.sql` | scripts | clients, topics | 1.9K |
| 11 | `20260504000010_create_agent_run_steps.sql` | agent_run_steps | agent_runs | 1.9K |
| 12 | `20260504000011_create_client_feedback_v2.sql` | client_feedback | clients | 2.3K |
| 13 | `20260504000012_enable_rls.sql` | - | 所有表 | 1.5K |
| 14 | `20260504000013_seed_test_users.sql` | - | users | 930B |

**总大小**: ~24KB

---

## 📊 表依赖关系图

```
第 0 层（基础设施）:
  └─ update_updated_at_column() 函数
  └─ pgcrypto 扩展

第 1 层（认证 + 基础表）:
  ├─ users（认证表）
  └─ industries（行业表）

第 2 层（依赖 industries）:
  ├─ clients
  ├─ industry_templates
  └─ prompt_templates

第 3 层（依赖 clients）:
  ├─ client_profiles
  ├─ agent_runs
  └─ topics

第 4 层（依赖第 3 层）:
  ├─ scripts（依赖 topics）
  ├─ agent_run_steps（依赖 agent_runs）
  └─ client_feedback（依赖 clients）

第 5 层（安全策略）:
  └─ RLS 启用
```

---

## 🚀 执行步骤

### 方式 1：Supabase SQL Editor（推荐）

**步骤**：

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **按顺序执行以下 SQL 文件**

   **重要**：必须严格按照以下顺序执行，不可跳过或调换顺序。

   ```sql
   -- 第 1 步：创建 users 表
   -- 复制 20260504000000_create_users.sql 的内容，粘贴并执行

   -- 第 2 步：创建触发器函数
   -- 复制 20260504000001_create_trigger_functions.sql 的内容，粘贴并执行

   -- 第 3 步：创建 industries 表
   -- 复制 20260504000002_create_industries.sql 的内容，粘贴并执行

   -- 第 4 步：创建 clients 表
   -- 复制 20260504000003_create_clients.sql 的内容，粘贴并执行

   -- 第 5 步：创建 industry_templates 表
   -- 复制 20260504000004_create_industry_templates.sql 的内容，粘贴并执行

   -- 第 6 步：创建 prompt_templates 表
   -- 复制 20260504000005_create_prompt_templates.sql 的内容，粘贴并执行

   -- 第 7 步：创建 client_profiles 表
   -- 复制 20260504000006_create_client_profiles.sql 的内容，粘贴并执行

   -- 第 8 步：创建 agent_runs 表
   -- 复制 20260504000007_create_agent_runs.sql 的内容，粘贴并执行

   -- 第 9 步：创建 topics 表
   -- 复制 20260504000008_create_topics.sql 的内容，粘贴并执行

   -- 第 10 步：创建 scripts 表
   -- 复制 20260504000009_create_scripts.sql 的内容，粘贴并执行

   -- 第 11 步：创建 agent_run_steps 表
   -- 复制 20260504000010_create_agent_run_steps.sql 的内容，粘贴并执行

   -- 第 12 步：创建 client_feedback 表
   -- 复制 20260504000011_create_client_feedback_v2.sql 的内容，粘贴并执行

   -- 第 13 步：启用 RLS
   -- 复制 20260504000012_enable_rls.sql 的内容，粘贴并执行

   -- 第 14 步：插入测试用户（可选）
   -- 复制 20260504000013_seed_test_users.sql 的内容，粘贴并执行
   ```

4. **验证执行结果**
   - 每执行一个文件后，检查是否有错误
   - 如果出现错误，停止执行，检查错误信息
   - 确认所有表都已创建

---

### 方式 2：Supabase CLI（高级用户）

**前提条件**：
- 已安装 Supabase CLI
- 已配置 `supabase/config.toml`

**步骤**：

```bash
# 1. 进入项目根目录
cd E:/Lawer-Contest

# 2. 链接到远程项目
supabase link --project-ref <your-project-ref>

# 3. 推送 migrations
supabase db push

# 4. 验证
supabase db diff
```

---

## ✅ 验证步骤

执行完所有 migration 后，运行以下 SQL 验证：

```sql
-- 1. 检查所有表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 预期结果：14 个表
-- agent_run_steps, agent_runs, client_feedback, client_profiles, 
-- clients, industries, industry_templates, prompt_templates, 
-- scripts, topics, users

-- 2. 检查触发器函数是否存在
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name = 'update_updated_at_column';

-- 预期结果：1 行

-- 3. 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 预期结果：所有业务表的 rowsecurity = true

-- 4. 检查测试用户是否插入
SELECT email, role, name 
FROM users;

-- 预期结果：2 行
-- admin@example.com, admin, 管理员
-- client@example.com, client, 测试客户
```

---

## 🔍 常见问题排查

### 问题 1：`relation "clients" does not exist`

**原因**：未按顺序执行，跳过了 `20260504000003_create_clients.sql`

**解决**：
1. 检查 `clients` 表是否存在：`SELECT * FROM clients LIMIT 1;`
2. 如果不存在，执行 `20260504000003_create_clients.sql`

---

### 问题 2：`function update_updated_at_column() does not exist`

**原因**：未执行 `20260504000001_create_trigger_functions.sql`

**解决**：
1. 先执行 `20260504000001_create_trigger_functions.sql`
2. 再重新执行失败的 migration

---

### 问题 3：`duplicate key value violates unique constraint`

**原因**：重复执行了 seed 文件

**解决**：
- 这是正常的，seed 文件使用了 `ON CONFLICT DO NOTHING`
- 可以忽略此错误

---

### 问题 4：外键约束错误

**原因**：父表不存在或未按顺序执行

**解决**：
1. 检查依赖关系图
2. 确保父表已创建
3. 按正确顺序重新执行

---

## 📝 重要说明

### 1. 关于旧的 client_feedback migration

**文件位置**：`E:\Lawer-Contest\lawyer-content-platform\supabase\migrations\20260501000000_create_client_feedback.sql`

**状态**：⚠️ **不要执行此文件**

**原因**：
- 时间戳早于 `clients` 表创建时间
- 会导致外键约束错误
- 已被 `20260504000011_create_client_feedback_v2.sql` 替代

**处理建议**：
- 保留文件作为历史记录
- 在执行 migration 时跳过此文件
- 或者删除此文件（可选）

---

### 2. 关于 RLS 策略

**当前状态**：
- ✅ 所有业务表已启用 RLS
- ⚠️ 尚未配置具体的 RLS 策略

**影响**：
- 启用 RLS 后，默认拒绝所有访问
- 需要使用 Service Role Key 才能访问数据
- 或者配置 RLS 策略允许特定访问

**后续工作**：
- 需要为每个表配置 RLS 策略
- 区分 Admin 和 Client 的访问权限
- 参考：https://supabase.com/docs/guides/auth/row-level-security

---

### 3. 关于测试用户

**测试账号**：
- **Admin**: admin@example.com / admin123
- **Client**: client@example.com / client123

**密码哈希**：
- 使用 bcrypt 加密（10 轮 salt）
- 密码哈希已预先生成

**安全提示**：
- ⚠️ 这些是测试账号，不要在生产环境使用
- 生产环境请使用强密码并重新生成哈希

---

## 📚 相关文档

- **项目上下文**：`E:\Lawer-Contest\CURRENT_CONTEXT.md`
- **数据库设计**：`E:\Lawer-Contest\docs\DATABASE_DESIGN.md`（如果存在）
- **API 文档**：`E:\Lawer-Contest\docs\API_DOCUMENTATION.md`（如果存在）
- **Supabase 官方文档**：https://supabase.com/docs

---

## 🎯 下一步工作

执行完 migration 后，建议进行以下工作：

1. **配置 RLS 策略**
   - 为每个表定义访问规则
   - 区分 Admin 和 Client 权限

2. **测试 API 连接**
   - 验证 Next.js 应用能否连接数据库
   - 测试 Admin API 和 Client API

3. **插入初始数据**
   - 创建测试行业（industries）
   - 创建测试客户（clients）
   - 创建测试档案（client_profiles）

4. **配置环境变量**
   - 确保 `.env.local` 包含正确的 Supabase 连接信息
   - 验证 Service Role Key 配置正确

---

## 📞 支持

如果遇到问题：
1. 检查本文档的"常见问题排查"部分
2. 查看 Supabase Dashboard 的日志
3. 检查 SQL 语法错误
4. 联系项目维护者

---

**文档版本**: V1  
**最后更新**: 2026-05-05  
**维护者**: Agent Team (project-agent + program-agent + review-agent)  
**审查状态**: ✅ 已通过 review-agent 审查
