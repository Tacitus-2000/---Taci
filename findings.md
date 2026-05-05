# 发现与决策

## 需求
- 双角色系统：Admin（管理员）和 Client（客户）
- Admin 功能：客户管理、客户档案、行业模板、Prompt 模板
- Client 功能：Dashboard、个人资料、日历、话题、脚本、风格参考、反馈、内容生成
- 安全认证：JWT + httpOnly Cookie
- 数据隔离：每个 Client 只能访问自己的数据

## 研究发现

### httpOnly Cookie 安全机制
- **发现时间**：2026-05-05
- **问题**：JavaScript 的 `document.cookie` 无法读取 httpOnly Cookie
- **原因**：浏览器安全机制，防止 XSS 攻击窃取 token
- **解决方案**：创建服务端 API `/api/auth/me` 读取 Cookie 并返回用户信息
- **参考**：MDN Web Docs - HttpOnly Cookie

### Next.js Middleware 路由匹配
- **发现时间**：2026-05-05
- **问题**：Middleware matcher 正则表达式会拦截 API 路由
- **原因**：`/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)` 匹配了 `/api/*`
- **解决方案**：在 PUBLIC_ROUTES 中添加需要公开访问的 API 路径
- **最佳实践**：Middleware 应该排除静态资源和公共 API

### Supabase 数据库设计
- **发现时间**：项目初期
- **Schema 结构**：
  - `users` - 用户表（Admin/Client）
  - `clients` - 客户信息表
  - `client_profiles` - 客户档案表
  - `industries` - 行业表
  - `industry_templates` - 行业模板表
  - `prompt_templates` - Prompt 模板表
  - `topics` - 话题表
  - `scripts` - 脚本表
  - `agent_runs` - Agent 运行记录表
  - `agent_run_steps` - Agent 运行步骤表
  - `client_feedback_v2` - 客户反馈表
- **迁移文件数量**：13 个
- **RLS 状态**：已启用但策略未完全实现

## 技术决策
| 决策 | 理由 |
|------|------|
| 使用 httpOnly Cookie 存储 JWT | 防止 XSS 攻击，比 localStorage 更安全 |
| 创建 /api/auth/me 端点 | 在不降低安全性的前提下允许前端获取用户信息 |
| useClientId 使用 SWR 缓存 | 减少重复 API 调用，提高性能，支持自动重试 |
| 客户档案表单使用下拉选择器 | 避免手动输入 UUID 格式错误，提升 UX |
| Next.js 16.2.4 + Turbopack | 更快的开发体验和构建速度 |
| shadcn/ui 组件库 | 高质量、可定制的 UI 组件 |
| App Router 而非 Pages Router | Next.js 最新推荐架构，更好的性能和 DX |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| Client 登录成功但不跳转 | 修正 API 路径：`/api/client/auth/login` |
| 登录后显示"未找到客户信息" | 创建 `/api/auth/me` 端点从服务端读取 Cookie |
| useClientId 返回 null 导致类型错误 | 在所有使用该 Hook 的页面添加 null 检查 |
| 客户档案创建 UUID 验证失败 | 改为从客户列表下拉选择，自动填充 UUID |
| TypeScript 编译错误（8 个 Client 页面） | 统一添加 `clientId` null 检查和错误提示 |
| Client 登录请求缺少 credentials: 'include' | 在 login/page.tsx 的 fetch 中添加 `credentials: 'include'` |
| **添加 credentials 后仍显示"未找到客户信息"** | **待解决 - Admin 登录正常但也没有 credentials: 'include'** |

## 资源
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [SWR 文档](https://swr.vercel.app/)

## 当前调试状态（2026-05-05 下午）

### 问题现状
- **症状**：Client 登录后仍然显示"未找到客户信息，请重新登录"
- **已尝试的修复**：
  1. ✅ 创建 `/api/auth/me` 端点
  2. ✅ 重构 `useClientId` Hook 使用 API 调用
  3. ✅ 在 `useClientId` 中添加 `credentials: 'include'`
  4. ✅ 在 `login/page.tsx` 中添加 `credentials: 'include'`
  5. ✅ 添加 100ms 延迟等待 Cookie 处理
- **结果**：问题仍然存在

### 关键发现
- **Admin 登录正常工作**，但 Admin 登录页面**也没有** `credentials: 'include'`
- Admin dashboard 不使用 `useClientId` Hook
- Admin dashboard 是静态页面，不需要获取用户 ID

### 差异分析
| 项目 | Admin | Client |
|------|-------|--------|
| 登录 API | `/api/admin/auth/login` | `/api/client/auth/login` |
| 登录页面 credentials | ❌ 无 | ✅ 有（刚添加） |
| Dashboard 需要用户 ID | ❌ 否 | ✅ 是（useClientId） |
| Dashboard 类型 | 静态 | 动态（需要 API 调用） |

### 下一步调试方向
1. **验证 Cookie 是否真的被设置**：
   - 在浏览器开发者工具中检查 Application > Cookies
   - 查看是否有 `client_token` Cookie
   
2. **验证 `/api/auth/me` 是否被正确调用**：
   - 检查 Network 面板
   - 查看请求是否发送了 Cookie
   
3. **对比 Admin 和 Client 的完整流程**：
   - Admin 为什么不需要 `credentials: 'include'` 也能工作？
   - 是否有其他配置差异？

4. **检查 Middleware**：
   - 是否拦截了 `/api/auth/me` 请求？
   - 是否影响了 Cookie 的传递？

5. **检查浏览器控制台**：
   - 是否有 CORS 错误？
   - 是否有其他 JavaScript 错误？

### 需要用户提供的信息
1. 浏览器开发者工具截图：
   - Application > Cookies（查看是否有 client_token）
   - Network > /api/auth/me（查看请求详情）
   - Console（查看是否有错误）

2. 服务器日志：
   - 登录时的日志输出
   - `/api/auth/me` 调用时的日志输出

---
*最后更新：2026-05-05 下午*
*调试方法：Systematic Debugging*
*状态：待用户提供浏览器调试信息*

## 视觉/浏览器发现
<!-- 关键：每执行2次查看/浏览器操作后必须更新此部分 -->
<!-- 多模态内容必须立即以文本形式记录 -->
- **2026-05-05**：Client 登录页面 UI 正常，但登录后跳转失败
- **2026-05-05**：Admin 登录页面和客户管理页面 UI 正常工作
- **2026-05-05**：客户档案表单需要手动输入 UUID，用户体验差

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
