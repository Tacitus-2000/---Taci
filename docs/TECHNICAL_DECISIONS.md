# 技术决策文档

**项目名称**: 律师内容生成平台  
**文档版本**: V1.0  
**创建日期**: 2026-05-04  
**最后更新**: 2026-05-04

---

## 📋 目录

1. [认证系统](#认证系统)
2. [速率限制](#速率限制)
3. [数据库访问](#数据库访问)
4. [前端架构](#前端架构)
5. [AI 工作流](#ai-工作流)
6. [部署方案](#部署方案)

---

## 1. 认证系统

### 决策：自定义 JWT 认证

**选择理由**：
- ✅ 简单可控，不依赖第三方服务
- ✅ 完全自定义用户模型和权限
- ✅ 适合 Admin/Client 双角色系统
- ✅ 易于与现有 API 集成

**技术栈**：
- `jose` - JWT 生成和验证
- HTTP-only Cookie - Token 存储
- Next.js Middleware - 路由保护

**实现方案**：

```typescript
// JWT Payload 结构
interface JWTPayload {
  userId: string;
  role: 'admin' | 'client';
  clientId?: string; // Client 角色必需
  exp: number;
  iat: number;
}

// Token 存储
// - Admin: HTTP-only Cookie, 名称 'admin_token'
// - Client: HTTP-only Cookie, 名称 'client_token'
```

**路由保护**：
- `/admin/*` - 需要 Admin 角色
- `/client/*` - 需要 Client 角色
- `/api/admin/*` - 需要 Admin 角色
- `/api/client/*` - 需要 Client 角色

**预留接口**：

```typescript
// 用户注册（暂不实现）
POST /api/auth/register
Body: { email, password, role }

// 邮箱验证（暂不实现）
POST /api/auth/verify-email
Body: { token }

// 密码重置（暂不实现）
POST /api/auth/reset-password
Body: { email }
POST /api/auth/reset-password/confirm
Body: { token, newPassword }
```

---

## 2. 速率限制

### 决策：Upstash Rate Limit

**选择理由**：
- ✅ 无需自建 Redis 服务器
- ✅ 免费额度充足（10,000 请求/天）
- ✅ 全球边缘网络，低延迟
- ✅ 易于集成到 Next.js Middleware
- ✅ 适合 Vercel 部署

**技术栈**：
- `@upstash/ratelimit` - 速率限制库
- `@upstash/redis` - Redis 客户端

**限制策略**：

| 端点类型 | 限制 | 窗口 | 说明 |
|---------|------|------|------|
| 登录 API | 5 次 | 15 分钟 | 防止暴力破解 |
| Admin API (读) | 100 次 | 1 分钟 | 管理后台查询 |
| Admin API (写) | 30 次 | 1 分钟 | 管理后台修改 |
| Client API (读) | 60 次 | 1 分钟 | 客户端查询 |
| Client API (写) | 10 次 | 1 分钟 | 客户端提交 |
| AI 生成 API | 5 次 | 1 小时 | 防止滥用 AI |

**实现方案**：

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 创建不同的限制器
const loginLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});

const adminReadLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

// 在 Middleware 中使用
const identifier = req.ip || 'anonymous';
const { success } = await limiter.limit(identifier);
if (!success) {
  return new Response('Too Many Requests', { status: 429 });
}
```

**环境变量**：
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## 3. 数据库访问

### 决策：双层权限控制（API + RLS）

**API 层权限**：
- Admin API: 使用 Service Role Key，返回完整数据
- Client API: 使用 Service Role Key，但手动过滤数据

**RLS 层权限**（阶段 3 实施）：
- 数据库层面的二次保护
- 基于 JWT token 中的 user_id 和 role
- 防止 API 层权限绕过

**数据过滤规则**：

| 角色 | 可见数据 | 字段过滤 |
|------|---------|---------|
| Admin | 所有数据 | 包含 `internal_notes` |
| Client | 仅自己的数据 | 排除 `internal_notes` |
| Client | 仅 `visible_to_client = true` | 排除 `admin_notes` |

---

## 4. 前端架构

### 技术栈

**核心框架**：
- Next.js 16.2.4 (App Router)
- React 19
- TypeScript 5.x

**状态管理**：
- React Query (TanStack Query) - 服务端状态
- React Hook Form - 表单状态
- Zod - 表单验证

**UI 组件**：
- shadcn/ui - 组件库
- Tailwind CSS - 样式
- Radix UI - 无障碍组件

**工具库**：
- date-fns - 日期处理
- sonner - Toast 通知

### 目录结构

```
lawyer-content-platform/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin 页面
│   ├── client/            # Client 页面
│   ├── api/               # API 路由
│   └── _components/       # 全局组件
├── components/            # 可复用组件
├── lib/
│   ├── api/              # API 客户端
│   ├── hooks/            # React Query Hooks
│   ├── utils/            # 工具函数
│   ├── agents/           # Agent 实现
│   ├── workflows/        # LangGraph 工作流
│   └── schemas/          # Zod Schema
└── types/                # TypeScript 类型
```

### 代码规范

**命名约定**：
- 组件：PascalCase (e.g., `ClientList.tsx`)
- Hooks：camelCase with `use` prefix (e.g., `useClientData.ts`)
- 工具函数：camelCase (e.g., `formatDate.ts`)
- 类型：PascalCase (e.g., `Client`, `ClientProfile`)

**文件组织**：
- 每个页面一个文件
- 复杂组件拆分为子组件
- 共享逻辑提取为 Hooks
- 类型定义集中管理

---

## 5. AI 工作流

### 技术栈

**核心框架**：
- LangGraph - 工作流编排
- LangChain - AI 工具链
- OpenAI/Anthropic API - LLM 服务

**Agent 架构**：
- 8 个独立 Agent（Supervisor, Data, Profile, Topic, Script, ReadabilityReview, RiskReview, Rewrite）
- 3 个 LangGraph 工作流（Profile, Topic, Script）
- 统一的 AgentState 状态管理

**工作流特性**：
- ✅ 并行审查（Promise.all）
- ✅ 重写循环（最多 2 次）
- ✅ 多重保护机制防止无限循环
- ✅ 完整的错误处理和日志记录

**API 选择**：
- 优先使用 DeepSeek API（成本低）
- 备选 OpenAI GPT-4（质量高）
- 备选 Anthropic Claude（平衡）

---

## 6. 部署方案

### 平台：Vercel

**选择理由**：
- ✅ 原生支持 Next.js
- ✅ 自动 CI/CD
- ✅ 全球 CDN
- ✅ 免费额度充足
- ✅ 易于配置环境变量

### 数据库：Supabase

**选择理由**：
- ✅ 托管 PostgreSQL
- ✅ 自动备份
- ✅ RLS 支持
- ✅ 实时订阅（可选）
- ✅ 免费额度充足

### 环境变量

**必需变量**：
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# JWT
JWT_SECRET=xxx (生产环境必须使用强密钥)

# AI API
DEEPSEEK_API_KEY=xxx
OPENAI_API_KEY=xxx (可选)
ANTHROPIC_API_KEY=xxx (可选)

# Upstash Rate Limit
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**可选变量**：
```bash
# 邮件服务（未来）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASSWORD=xxx

# 监控（未来）
SENTRY_DSN=xxx
```

---

## 📊 技术栈总览

### 后端
- Next.js API Routes
- Supabase (PostgreSQL)
- LangGraph + LangChain
- JWT (jose)
- Upstash Rate Limit

### 前端
- Next.js 16 (App Router)
- React 19
- TypeScript
- React Query
- React Hook Form + Zod
- shadcn/ui + Tailwind CSS

### 开发工具
- ESLint
- Prettier
- TypeScript
- Git

### 部署
- Vercel (前端 + API)
- Supabase (数据库)
- Upstash (Redis)

---

## 🔄 未来可能的技术升级

### 短期（1-3 个月）
- [ ] 添加 Sentry 错误监控
- [ ] 添加 Vercel Analytics
- [ ] 实现邮件服务（SendGrid/Resend）
- [ ] 添加单元测试（Vitest）
- [ ] 添加 E2E 测试（Playwright）

### 中期（3-6 个月）
- [ ] 迁移到 Supabase Auth（如果需要更多认证功能）
- [ ] 添加实时协作功能（Supabase Realtime）
- [ ] 优化 AI 工作流（缓存、流式输出）
- [ ] 添加文件上传功能（Supabase Storage）

### 长期（6-12 个月）
- [ ] 微服务拆分（如果规模扩大）
- [ ] 添加移动端应用
- [ ] 国际化支持（i18n）
- [ ] 高级分析和报表

---

## 📝 决策记录

### 2026-05-04 - 初始技术选型

**决策人**: 开发团队  
**决策内容**:
1. 使用自定义 JWT 认证（不使用 Supabase Auth）
2. 暂不实现用户注册和邮箱验证，但预留接口
3. 使用 Upstash Rate Limit（不自建 Redis）
4. 使用 Vercel + Supabase 部署方案

**理由**:
- 项目初期，优先快速开发和部署
- 自定义认证更灵活，适合双角色系统
- Upstash 免费额度充足，无需运维
- Vercel + Supabase 是 Next.js 项目的最佳实践

**影响**:
- 认证系统开发时间缩短
- 部署成本降低
- 未来可以平滑升级到 Supabase Auth

---

## 🔗 相关文档

- [项目上下文文档](./CURRENT_CONTEXT.md)
- [开发计划](../.claude/plans/swift-leaping-snowglobe.md)
- [项目状态](./PROJECT_STATUS.md)
- [任务看板](./TASK_BOARD.md)

---

**文档结束**
