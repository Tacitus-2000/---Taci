# 律师内容平台 - 当前上下文文档 V10

**文档版本**: V10  
**更新时间**: 2026-05-05  
**项目状态**: 🔧 修复中 - Client Profile API 架构重构完成

---

## 📋 目录

1. [项目概览](#项目概览)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [认证架构](#认证架构)
5. [数据库架构](#数据库架构)
6. [API 路由架构](#api-路由架构)
7. [最近完成的工作](#最近完成的工作)
8. [当前问题与修复](#当前问题与修复)
9. [待办事项](#待办事项)
10. [重要文档索引](#重要文档索引)

---

## 项目概览

### 基本信息
- **项目名称**: 律师内容平台 (Lawyer Content Platform)
- **主要目录**: `E:\Lawer-Contest\lawyer-content-platform`
- **框架**: Next.js 16.2.4 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel

### 核心功能
1. **Admin 端**: 客户管理、行业模板、Prompt 模板、Agent 运行监控
2. **Client 端**: 内容生成、话题管理、脚本管理、内容日历、风格参考、反馈提交

### 双角色系统
- **Admin**: 管理员，管理所有客户和模板
- **Client**: 客户，查看自己的内容和档案

---

## 技术栈

### 前端
- **框架**: Next.js 16.2.4 (App Router)
- **UI 库**: 
  - Radix UI (无样式组件)
  - Tailwind CSS (样式)
  - Lucide React (图标)
- **状态管理**: 
  - React Query (TanStack Query v5)
  - Zustand (全局状态)
- **表单**: React Hook Form + Zod
- **日期**: date-fns

### 后端
- **API**: Next.js API Routes (App Router)
- **数据库**: Supabase (PostgreSQL)
- **认证**: 自定义 JWT (不使用 Supabase Auth)
- **密码加密**: bcrypt

### 开发工具
- **TypeScript**: 5.x
- **ESLint**: Next.js 配置
- **包管理器**: npm

---

## 项目结构

```
lawyer-content-platform/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin 端页面
│   │   ├── client-profiles/      # 客户档案管理
│   │   ├── clients/              # 客户列表
│   │   ├── dashboard/            # 仪表盘
│   │   ├── industry-templates/   # 行业模板
│   │   ├── login/                # 登录页
│   │   └── prompt-templates/     # Prompt 模板
│   ├── client/                   # Client 端页面
│   │   ├── calendar/             # 内容日历
│   │   ├── dashboard/            # 仪表盘
│   │   ├── feedback/             # 反馈提交
│   │   ├── generate/             # 内容生成
│   │   ├── login/                # 登录页
│   │   ├── profile/              # 客户档案查看
│   │   ├── scripts/              # 脚本管理
│   │   ├── style-reference/      # 风格参考
│   │   └── topics/               # 话题管理
│   └── api/                      # API Routes
│       ├── admin/                # Admin API
│       │   ├── auth/             # 认证 API
│       │   ├── client-profiles/  # 客户档案 CRUD
│       │   ├── clients/          # 客户 CRUD
│       │   ├── industry-templates/ # 行业模板 CRUD
│       │   └── prompt-templates/ # Prompt 模板 CRUD
│       └── client/               # Client API
│           ├── auth/             # 认证 API
│           ├── calendar/         # 内容日历
│           ├── feedback/         # 反馈提交
│           ├── generate/         # 内容生成
│           ├── profile/          # 客户档案查看
│           ├── scripts/          # 脚本管理
│           ├── style-reference/  # 风格参考
│           └── topics/           # 话题管理
├── components/                   # React 组件
│   ├── admin/                    # Admin 端组件
│   ├── client/                   # Client 端组件
│   └── ui/                       # 通用 UI 组件 (Radix UI)
├── lib/                          # 工具库
│   ├── api/                      # API 工具
│   │   ├── admin-api.ts          # Admin API 客户端
│   │   ├── client-api.ts         # Client API 客户端
│   │   ├── client.ts             # HTTP 客户端 (fetch wrapper)
│   │   ├── response.ts           # API 响应格式化
│   │   └── validation.ts         # 参数验证
│   ├── auth/                     # 认证工具
│   │   ├── constants.ts          # 认证常量
│   │   ├── jwt.ts                # JWT 工具
│   │   └── password.ts           # 密码加密
│   ├── hooks/                    # React Hooks
│   │   ├── useAdminData.ts       # Admin 数据 hooks
│   │   ├── useClientData.ts      # Client 数据 hooks
│   │   └── useClientId.ts        # Client ID hook
│   ├── store/                    # Zustand 状态管理
│   │   └── auth.ts               # 认证状态
│   └── supabase/                 # Supabase 客户端
│       └── client.ts             # Supabase 客户端配置
├── types/                        # TypeScript 类型定义
│   ├── admin.ts                  # Admin 类型
│   ├── client.ts                 # Client 类型
│   └── database.ts               # 数据库类型
├── supabase/                     # Supabase 配置
│   └── migrations/               # 数据库迁移脚本
└── docs/                         # 项目文档
```

---

## 认证架构

### 认证方式
**自定义 JWT 认证**（不使用 Supabase Auth）

### 认证流程

#### 1. 登录流程
```
用户输入 email + password
    ↓
POST /api/admin/auth/login 或 /api/client/auth/login
    ↓
查询 public.users 表（email + role）
    ↓
bcrypt 验证密码
    ↓
生成 JWT token（包含 user.id, email, role）
    ↓
设置 HttpOnly Cookie（auth_token）
    ↓
返回用户信息
```

#### 2. 认证验证
```
前端请求 API
    ↓
携带 Cookie（auth_token）
    ↓
API 验证 JWT token
    ↓
从 token 中提取 user.id, email, role
    ↓
执行业务逻辑
```

### 关键文件
- **JWT 工具**: `lib/auth/jwt.ts`
- **密码加密**: `lib/auth/password.ts`
- **认证常量**: `lib/auth/constants.ts`
- **Admin 登录 API**: `app/api/admin/auth/login/route.ts`
- **Client 登录 API**: `app/api/client/auth/login/route.ts`

### 测试账号
```typescript
// Admin 账号
{
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  user_id: '550e8400-e29b-41d4-a716-446655440000'
}

// Client 账号
{
  email: 'client@example.com',
  password: 'client123',
  role: 'client',
  user_id: 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade'
}
```

---

## 数据库架构

### 核心表结构

#### 1. users 表（认证表）
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. clients 表（客户表）
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,  -- V10 新增
  client_name TEXT NOT NULL,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);  -- V10 新增
```

**重要变更 (V10)**:
- 添加了 `user_id` 字段，关联 `public.users(id)`
- 建立了 `users → clients` 的一对一关系
- 迁移脚本: `supabase/migrations/20260505000002_add_user_id_to_clients_final.sql`

#### 3. client_profiles 表（客户档案表）
```sql
CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES public.industries(id),
  client_name TEXT NOT NULL,
  industry_name TEXT NOT NULL,
  niche_direction TEXT,
  target_customer TEXT,
  advantages TEXT,
  customer_pain_points TEXT,
  tone_style TEXT,
  taboo_expressions TEXT,
  conversion_goal TEXT,
  internal_notes TEXT,  -- 仅 Admin 可见
  visible_to_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. topics 表（话题表）
```sql
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  target_audience TEXT,
  content_angle TEXT,
  reference_links TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  visible_to_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. scripts 表（脚本表）
```sql
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  script_type TEXT CHECK (script_type IN ('video', 'audio', 'article', 'social_media')),
  duration_seconds INTEGER,
  word_count INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  visible_to_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 数据关系链路

#### V10 架构（当前）
```
public.users (认证表)
    ↓ user_id
public.clients (客户表)
    ↓ client_id
public.client_profiles (客户档案)
public.topics (话题)
public.scripts (脚本)
```

**关键点**:
- `users.id` → `clients.user_id` (一对一)
- `clients.id` → `client_profiles.client_id` (一对一)
- `clients.id` → `topics.client_id` (一对多)
- `clients.id` → `scripts.client_id` (一对多)

---

## API 路由架构

### API 设计原则

#### 1. RESTful 风格
- **列表查询**: `GET /api/admin/clients?page=1&limit=10`
- **单条查询**: `GET /api/admin/clients/{id}`
- **创建**: `POST /api/admin/clients`
- **更新**: `PUT /api/admin/clients/{id}`
- **删除**: `DELETE /api/admin/clients/{id}`

#### 2. 响应格式
```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 错误响应
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}

// 分页响应
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Admin API

#### 认证 API
- `POST /api/admin/auth/login` - 管理员登录
- `POST /api/admin/auth/logout` - 管理员登出
- `GET /api/admin/auth/me` - 获取当前用户信息

#### 客户管理 API
- `GET /api/admin/clients` - 获取客户列表（分页）
- `GET /api/admin/clients/{id}` - 获取单个客户
- `POST /api/admin/clients` - 创建客户
- `PUT /api/admin/clients/{id}` - 更新客户
- `DELETE /api/admin/clients/{id}` - 删除客户

#### 客户档案 API
- `GET /api/admin/client-profiles` - 获取档案列表（分页）
- `GET /api/admin/client-profiles/{id}` - 获取单个档案
- `POST /api/admin/client-profiles` - 创建档案
- `PUT /api/admin/client-profiles/{id}` - 更新档案
- `DELETE /api/admin/client-profiles/{id}` - 删除档案

### Client API

#### 认证 API
- `POST /api/client/auth/login` - 客户登录
- `POST /api/client/auth/logout` - 客户登出
- `GET /api/client/auth/me` - 获取当前用户信息

#### 客户档案 API（只读）
- `GET /api/client/profile?client_id={user_id}` - 获取客户档案
  - **V10 修复**: 使用 `user_id` → `client_id` 转换
  - 排除 `internal_notes` 字段
  - 只返回 `visible_to_client = true` 的档案

#### 话题管理 API
- `GET /api/client/topics?client_id={user_id}` - 获取话题列表
- `GET /api/client/topics/{id}?client_id={user_id}` - 获取单个话题
- `POST /api/client/topics` - 创建话题
- `PUT /api/client/topics/{id}` - 更新话题
- `DELETE /api/client/topics/{id}` - 删除话题

#### 脚本管理 API
- `GET /api/client/scripts?client_id={user_id}` - 获取脚本列表
- `GET /api/client/scripts/{id}?client_id={user_id}` - 获取单个脚本
- `POST /api/client/scripts` - 创建脚本
- `PUT /api/client/scripts/{id}` - 更新脚本
- `DELETE /api/client/scripts/{id}` - 删除脚本

#### 内容日历 API
- `GET /api/client/calendar?client_id={user_id}&start_date={date}&end_date={date}` - 获取内容日历

#### 风格参考 API
- `GET /api/client/style-reference?client_id={user_id}` - 获取风格参考

#### 反馈 API
- `GET /api/client/feedback?client_id={user_id}` - 获取反馈列表
- `POST /api/client/feedback` - 提交反馈

#### 内容生成 API
- `POST /api/client/generate` - 生成内容

### API 认证流程

#### Admin API
```typescript
// 1. 验证 JWT token
const user = await verifyAdminAuth(request);

// 2. 检查角色
if (user.role !== 'admin') {
  return apiError('FORBIDDEN', 'Admin access required', 403);
}

// 3. 执行业务逻辑
```

#### Client API (V10 修复)
```typescript
// 1. 验证 JWT token
const user = await verifyClientAuth(request);

// 2. 获取 user_id（从 JWT token）
const userId = user.id;

// 3. 通过 user_id 查找 client_id
const { data: client } = await supabase
  .from('clients')
  .select('id')
  .eq('user_id', userId)
  .single();

const clientId = client.id;

// 4. 使用 client_id 查询数据
const { data } = await supabase
  .from('client_profiles')
  .select('*')
  .eq('client_id', clientId)
  .eq('visible_to_client', true)
  .single();
```

---

## 最近完成的工作

### V10 修复（2026-05-05）

#### 1. 认证架构核查
- ✅ 确认项目使用 `public.users` 自定义认证
- ✅ 确认不使用 Supabase Auth（`auth.users` 表为空）
- ✅ 确认登录流程：查询 `public.users` + bcrypt + 自定义 JWT
- ✅ 确认 JWT token 包含 `user.id`, `email`, `role`

#### 2. 数据库架构修复
- ✅ 添加 `user_id` 字段到 `clients` 表
- ✅ 创建外键约束 `clients.user_id → users.id`
- ✅ 创建索引 `idx_clients_user_id`
- ✅ 迁移现有数据（从 `auth.users` 迁移到 `public.users`）
- ✅ 添加 `NOT NULL` 约束
- ✅ 验证数据链路：`users.id → clients.user_id → clients.id → client_profiles.client_id`

**迁移脚本**: `supabase/migrations/20260505000002_add_user_id_to_clients_final.sql`

#### 3. Client Profile API 修复
- ✅ 修复 `app/api/client/profile/route.ts`
  - 使用 `user_id` 而不是 `user.user_metadata.client_id`
  - 通过 `user_id` 查找 `client_id`
  - 使用 `client_id` 查询 `client_profiles`
  - 修复变量名错误：`validClientId` → `clientId`

#### 4. 双重解包问题修复（V7）
- ✅ 修复 `lib/api/client-api.ts`
  - `getCalendar()`: 移除双重解包 `data.data`
  - `getStyleReferences()`: 移除双重解包 `data.data`
  - 直接返回 `data`

### 验证数据
```typescript
// 测试账号数据
{
  user_id: 'e1b6ca76-82cf-4001-bd5f-ba9434d6eade',
  user_email: 'client@example.com',
  user_role: 'client',
  client_id: '8db36fa1-98de-48c4-aaa2-01e7cea8d986',
  profile_id: 'e024acc6-3703-4f39-9181-32586c51664a',
  visible_to_client: true
}
```

---

## 当前问题与修复

### 已修复问题

#### ✅ 问题 1: Client Profile 404 错误
**错误信息**: "Client profile not found or not visible"

**根本原因**:
1. 数据库架构问题：`users` 表和 `clients` 表之间缺少关联
2. API 逻辑错误：使用 `user.user_metadata.client_id`（不存在）
3. 变量名错误：`validClientId` 未定义

**修复方案**:
1. 添加 `user_id` 字段到 `clients` 表
2. 修改 API 逻辑：`user_id → client_id → client_profiles`
3. 修复变量名错误

**状态**: ✅ 已修复（V10）

#### ✅ 问题 2: 双重解包错误
**错误信息**: "Query data cannot be undefined"

**根本原因**:
- `getCalendar()` 和 `getStyleReferences()` 错误地对非分页 API 使用了双重解包模式

**修复方案**:
- 移除双重解包，直接返回 `data`

**状态**: ✅ 已修复（V7）

### 待修复问题

#### ⏳ 问题 3: 其他 Client API 需要统一修复
**影响范围**:
- `app/api/client/calendar/route.ts`
- `app/api/client/style-reference/route.ts`
- `app/api/client/topics/route.ts`
- `app/api/client/scripts/route.ts`
- `app/api/client/feedback/route.ts`
- `app/api/client/generate/route.ts`

**修复方案**:
统一使用 `user_id → client_id` 转换逻辑

**状态**: ⏳ 待修复

---

## 待办事项

### 高优先级

#### 1. 修复其他 Client API
- [ ] 修复 `app/api/client/calendar/route.ts`
- [ ] 修复 `app/api/client/style-reference/route.ts`
- [ ] 修复 `app/api/client/topics/route.ts`
- [ ] 修复 `app/api/client/scripts/route.ts`
- [ ] 修复 `app/api/client/feedback/route.ts`
- [ ] 修复 `app/api/client/generate/route.ts`

**修复模式**:
```typescript
// 1. 获取 user_id（从 JWT token）
const userId = user.id;

// 2. 通过 user_id 查找 client_id
const { data: client } = await supabase
  .from('clients')
  .select('id')
  .eq('user_id', userId)
  .single();

if (!client) {
  return apiError('CLIENT_NOT_FOUND', 'Client not found', 404);
}

const clientId = client.id;

// 3. 使用 client_id 查询数据
```

#### 2. 前端验证
- [ ] 测试 Client Profile 页面
- [ ] 测试内容日历页面
- [ ] 测试风格参考页面
- [ ] 测试话题管理页面
- [ ] 测试脚本管理页面
- [ ] 测试反馈提交页面
- [ ] 测试内容生成页面

#### 3. 代码质量修复
- [ ] 修复 ESLint errors（8 个）
- [ ] 修复 ESLint warnings（16 个）
- [ ] 移除 `test-supabase.js`（使用 require() 导致 ESLint 错误）
- [ ] 修复 `lib/hooks/useClientData.ts` 中的 `any` 类型（7 处）

### 中优先级

#### 4. 文档完善
- [x] 创建认证架构报告
- [x] 创建执行指南
- [x] 更新 CURRENT_CONTEXT.md
- [ ] 创建 API 文档
- [ ] 创建数据库 Schema 文档

#### 5. 测试覆盖
- [ ] 添加 Admin API 单元测试
- [ ] 添加 Client API 单元测试
- [ ] 添加认证流程集成测试
- [ ] 添加数据库迁移测试

### 低优先级

#### 6. 性能优化
- [ ] 添加 API 响应缓存
- [ ] 优化数据库查询（添加索引）
- [ ] 添加前端数据预加载

#### 7. 功能增强
- [ ] 添加密码重置功能
- [ ] 添加邮箱验证功能
- [ ] 添加用户头像上传
- [ ] 添加操作日志记录

---

## 重要文档索引

### 架构文档
- **认证架构报告**: `docs/AUTH_ARCHITECTURE_REPORT.md`
- **执行指南**: `docs/EXECUTION_GUIDE.md`
- **Supabase 迁移指南**: `docs/SUPABASE_MIGRATION_GUIDE.md`

### BUG 修复报告
- **V10 Profile API 修复**: `docs/BUG_FIX_REPORT_V10_PROFILE_API.md`（本次修复）
- **V8 Profile 404 修复**: `docs/BUG_FIX_REPORT_V8_PROFILE_404.md`
- **V7 双重解包修复**: `docs/BUG_FIX_REPORT_V7_DOUBLE_UNWRAP.md`
- **V3 Credentials Include 修复**: `docs/BUG_FIX_REPORT_V3_CREDENTIALS_INCLUDE.md`
- **V2 HttpOnly Cookie 修复**: `docs/BUG_FIX_REPORT_V2_HTTPONLY_COOKIE.md`
- **V1 初始修复**: `docs/BUG_FIX_REPORT_2026-05-05.md`

### 数据库迁移脚本
- **添加 user_id 到 clients**: `supabase/migrations/20260505000002_add_user_id_to_clients_final.sql`
- **其他迁移脚本**: `supabase/migrations/202605040000*.sql`

### 项目管理
- **任务计划**: `task_plan.md`
- **进度记录**: `progress.md`
- **调试状态**: `CURRENT_DEBUG_STATUS.md`

---

## 快速参考

### 启动项目
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 运行 ESLint
npm run lint
```

### 数据库操作
```bash
# 连接 Supabase
# 在 Supabase Dashboard 执行 SQL

# 查看 users 表
SELECT * FROM public.users;

# 查看 clients 表
SELECT * FROM public.clients;

# 查看 client_profiles 表
SELECT * FROM public.client_profiles;

# 验证数据链路
SELECT 
  u.id AS user_id,
  u.email,
  u.role,
  c.id AS client_id,
  c.client_name,
  cp.id AS profile_id,
  cp.visible_to_client
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.client_profiles cp ON cp.client_id = c.id
WHERE u.email = 'client@example.com';
```

### 测试 API
```bash
# 测试 Admin 登录
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 测试 Client 登录
curl -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}'

# 测试 Client Profile API
curl http://localhost:3000/api/client/profile?client_id=e1b6ca76-82cf-4001-bd5f-ba9434d6eade \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

---

## 联系信息

- **项目负责人**: Tacitus-2000
- **Git 用户**: Tacitus-2000
- **当前分支**: main
- **主分支**: main

---

**文档结束**
