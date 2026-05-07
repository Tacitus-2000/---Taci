# AI 工作流集成项目 - 上下文总结文档

**生成时间**: 2026-05-07  
**项目版本**: V0.2  
**当前阶段**: 终端测试与调试

---

## 1. 项目概述

### 1.1 项目目标
为律师内容平台集成 AI 工作流，实现从用户输入到最终脚本生成的完整自动化流程。

### 1.2 技术栈
- **前端**: Next.js 16.2.4, React, TypeScript
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API (Sonnet 4.6)
- **工作流**: LangGraph
- **测试**: Playwright

### 1.3 核心架构
```
用户输入 → API Route → WorkflowExecutor → 8个Agent协同 → 数据持久化 → 前端展示
```

---

## 2. 已完成的开发阶段

### 阶段 0: 环境准备 ✅
- 安装 `@anthropic-ai/sdk`
- 安装 `langchain` 和 `@langchain/anthropic`
- 配置环境变量 `ANTHROPIC_API_KEY`

### 阶段 1-8: Agent 实现 ✅
实现了 8 个 AI Agent，全部接入 Claude API：

1. **ProfileAgent** - 生成内容定位档案
2. **HookAgent** - 生成开场钩子
3. **CTAAgent** - 生成行动号召
4. **ScriptAgent** - 生成完整脚本
5. **ReadabilityReviewAgent** - 可读性审查
6. **RiskReviewAgent** - 风险审查
7. **RewriteAgent** - 内容重写
8. **DataAgent** - 数据采集（支持角色）

### 阶段 9: 数据持久化 ✅
**文件**: `lib/services/workflow.service.ts` (296行新增)

实现了 Agent Run 数据持久化：
```typescript
// 核心方法
createAgentRun(data: Partial<AgentRun>): Promise<AgentRun>
updateAgentRun(id: string, updates: Partial<AgentRun>): Promise<AgentRun>
getAgentRun(id: string): Promise<AgentRun | null>
listAgentRuns(filters?: AgentRunFilters): Promise<AgentRun[]>
```

**数据库表**: `agent_runs`
```sql
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL,
  progress JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 阶段 10: 前端集成 ✅
**核心文件**:
- `lib/services/workflow-executor.service.ts` (350行) - 工作流编排
- `app/api/client/agent-runs/[id]/route.ts` (80行) - 状态查询 API
- `components/WorkflowProgress.tsx` (230行) - 进度显示组件
- `components/ui/progress.tsx` (30行) - 进度条 UI

**API 端点**:
- `POST /api/client/generate` - 触发工作流，返回 `agent_run_id`
- `GET /api/client/agent-runs/[id]` - 查询执行状态

---

## 3. 当前测试阶段的问题与修复

### 3.1 测试环境搭建
**创建的测试脚本**:
- `scripts/create-test-user.ts` - 创建 Supabase Auth 用户
- `scripts/create-user-record.ts` - 创建 users 表记录
- `scripts/setup-test-data.ts` - 创建完整测试数据
- `scripts/fix-client-record.ts` - 修复 clients 表数据

**测试账号**:
- 邮箱: `test@example.com`
- 密码: `test123456`
- User ID: `4ff3cf3d-4e9f-4f8a-85f4-c79c88f6ec5b`
- Client ID: `4ff3cf3d-4e9f-4f8a-85f4-c79c88f6ec5b`

### 3.2 已修复的问题

#### 问题 1: 登录 401 错误
**原因**: users 表缺少记录  
**修复**: 运行 `create-user-record.ts` 创建用户记录

#### 问题 2: Client not found 错误
**原因**: clients 表缺少 `user_id` 字段  
**修复**: 运行 `fix-client-record.ts` 添加 user_id

#### 问题 3: industry_id UUID 类型错误
**原因**: DataAgent 将空字符串传递给 UUID 类型字段  
**修复**: 在 `lib/agents/dataAgent.ts` 中添加空值检查
```typescript
if (!industryId || industryId.trim() === '') {
  return null;
}
```

#### 问题 4: RLS 策略导致查询失败
**原因**: DataAgent 使用 `getSupabaseClient()` 受 RLS 限制  
**修复**: 改为使用 `getSupabaseAdminClient()` 绕过 RLS
```typescript
// 修改前
const supabase = getSupabaseClient();

// 修改后
import { getSupabaseAdminClient } from '../supabase/admin';
const supabase = getSupabaseAdminClient();
```

#### 问题 5: ProfilePrompt 字段名不匹配
**原因**: ProfilePrompt 期望的字段名与数据库实际字段名不一致  
**修复**: 修改 `lib/ai/prompts/profilePrompt.ts`，使用正确的字段名

**字段映射**:
| ProfilePrompt 期望 | 数据库实际字段 |
|-------------------|---------------|
| `name` | `clientName` |
| `expertise` | `nicheDirection` |
| `targetAudience` | `targetCustomer` |
| `experience` | `advantages` |
| `contentPreferences` | `toneStyle` |
| `previousContent` | `tabooExpressions` |

---

## 4. 工作流执行流程

### 4.1 完整流程图
```
用户提交主题
    ↓
POST /api/client/generate
    ↓
WorkflowExecutor.execute()
    ↓
┌─────────────────────────────────────┐
│ 1. data_collection (DataAgent)      │
│    - loadClientProfile()             │
│    - loadIndustryTemplate()          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. profile_generation (ProfileAgent)│
│    - 生成内容定位档案                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. hook_generation (HookAgent)      │
│    - 生成开场钩子                     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. cta_generation (CTAAgent)        │
│    - 生成行动号召                     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. script_generation (ScriptAgent)  │
│    - 生成完整脚本                     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 6. readability_review               │
│    - 可读性审查                       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 7. risk_review                      │
│    - 风险审查                         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 8. rewrite (如需要)                  │
│    - 内容重写                         │
└─────────────────────────────────────┘
    ↓
保存到 scripts 表
    ↓
返回结果给前端
```

### 4.2 状态更新机制
```typescript
// WorkflowExecutor 在每个步骤更新状态
await this.workflowService.updateAgentRun(agentRunId, {
  status: 'running',
  progress: {
    currentStep: stepName,
    completedSteps: [...],
    totalSteps: 8
  }
});
```

### 4.3 前端轮询机制
```typescript
// WorkflowProgress 组件每 2 秒轮询一次
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/client/agent-runs/${agentRunId}`);
    const data = await response.json();
    setProgress(data.progress);
  }, 2000);
}, [agentRunId]);
```

---

## 5. 数据库架构

### 5.1 核心表结构

#### users 表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### clients 表
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),  -- 新增字段
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### client_profiles 表
```sql
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_name TEXT,
  niche_direction TEXT,
  target_customer TEXT,
  advantages TEXT,
  customer_pain_points TEXT,
  tone_style TEXT,
  taboo_expressions TEXT,
  conversion_goal TEXT,
  industry_id UUID REFERENCES industries(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### agent_runs 表
```sql
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL,  -- 'pending' | 'running' | 'completed' | 'failed'
  progress JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### scripts 表
```sql
CREATE TABLE scripts (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  agent_run_id UUID REFERENCES agent_runs(id),  -- 待添加
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  hook TEXT,
  cta TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 已知的数据库问题
- ❌ **scripts 表缺少 `agent_run_id` 字段** - 需要添加迁移
- ⚠️ **RLS 策略过于严格** - DataAgent 需要使用 admin 客户端

---

## 6. 关键代码位置

### 6.1 Agent 实现
- `lib/agents/profileAgent.ts` - ProfileAgent
- `lib/agents/hookAgent.ts` - HookAgent
- `lib/agents/ctaAgent.ts` - CTAAgent
- `lib/agents/scriptAgent.ts` - ScriptAgent
- `lib/agents/readabilityReviewAgent.ts` - ReadabilityReviewAgent
- `lib/agents/riskReviewAgent.ts` - RiskReviewAgent
- `lib/agents/rewriteAgent.ts` - RewriteAgent
- `lib/agents/dataAgent.ts` - DataAgent

### 6.2 Prompt 模板
- `lib/ai/prompts/profilePrompt.ts` - 内容定位档案 prompt
- `lib/ai/prompts/hookPrompt.ts` - 开场钩子 prompt
- `lib/ai/prompts/ctaPrompt.ts` - 行动号召 prompt
- `lib/ai/prompts/scriptPrompt.ts` - 脚本生成 prompt
- `lib/ai/prompts/readabilityReviewPrompt.ts` - 可读性审查 prompt
- `lib/ai/prompts/riskReviewPrompt.ts` - 风险审查 prompt
- `lib/ai/prompts/rewritePrompt.ts` - 内容重写 prompt

### 6.3 工作流编排
- `lib/services/workflow-executor.service.ts` - 工作流执行器
- `lib/services/workflow.service.ts` - 数据持久化服务

### 6.4 API 路由
- `app/api/client/generate/route.ts` - 触发工作流
- `app/api/client/agent-runs/[id]/route.ts` - 查询状态

### 6.5 前端组件
- `app/client/generate/page.tsx` - 内容生成页面
- `components/WorkflowProgress.tsx` - 进度显示组件
- `components/ui/progress.tsx` - 进度条组件

---

## 7. 环境配置

### 7.1 必需的环境变量
```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 开发服务器
```bash
npm run dev
# 运行在 http://localhost:3000
# 当前 PID: 13916
```

---

## 8. 测试流程

### 8.1 手动测试步骤
1. 访问 `http://localhost:3000/auth/login`
2. 使用测试账号登录: `test@example.com` / `test123456`
3. 导航到 `/client/generate`
4. 输入主题: "员工拒绝加班被辞退的法律风险分析"
5. 点击"生成内容"按钮
6. 观察进度条和状态更新
7. 等待工作流完成（约 2-3 分钟）
8. 查看生成的脚本内容

### 8.2 自动化测试
使用 Playwright 进行浏览器自动化测试：
```bash
# 安装浏览器
npx playwright install chromium

# 运行测试
npm run test:e2e
```

---

## 9. 下一步工作

### 9.1 待验证的功能
- [ ] ProfileAgent 是否能成功生成内容定位档案
- [ ] 后续 7 个 Agent 是否能正常执行
- [ ] 最终脚本是否保存到数据库
- [ ] 前端是否正确显示生成结果

### 9.2 待修复的问题
- [ ] 添加 `scripts.agent_run_id` 字段
- [ ] 优化 RLS 策略，避免使用 admin 客户端
- [ ] 添加错误重试机制
- [ ] 添加工作流超时处理

### 9.3 待开发的功能
- [ ] 阶段 11: 风格参考页面
- [ ] 阶段 12: 批量生成功能
- [ ] 阶段 13: 内容审核流程
- [ ] 阶段 14: 性能优化

---

## 10. 重要提醒

### 10.1 开发规范
- 遵循 `CLAUDE.md` 中的项目规范
- 使用 `planning-with-files-zh` 技能管理进度
- 所有 Agent 优先使用 Sonnet 4.6 模型
- 强制验证所有 AI 输出的 JSON 格式

### 10.2 调试技巧
- 查看服务器日志: `tail -f dev.log`
- 检查数据库数据: 使用 Supabase Dashboard
- 测试单个 Agent: 运行 `scripts/test-*.ts`
- 查看 API 响应: 使用浏览器开发者工具

### 10.3 常见错误
1. **"Client not found"** - 检查 clients 表的 user_id 字段
2. **"未找到客户档案"** - 检查 client_profiles 表的 client_id 字段
3. **"UUID 类型错误"** - 检查是否传递了空字符串给 UUID 字段
4. **"RLS 策略拒绝"** - 使用 admin 客户端或调整 RLS 策略

---

## 11. 项目文件结构

```
lawyer-content-platform/
├── app/
│   ├── api/
│   │   └── client/
│   │       ├── generate/route.ts          # 触发工作流
│   │       └── agent-runs/[id]/route.ts   # 查询状态
│   └── client/
│       └── generate/page.tsx              # 内容生成页面
├── components/
│   ├── WorkflowProgress.tsx               # 进度显示组件
│   └── ui/progress.tsx                    # 进度条组件
├── lib/
│   ├── agents/                            # 8 个 Agent 实现
│   ├── ai/prompts/                        # Prompt 模板
│   ├── services/
│   │   ├── workflow.service.ts            # 数据持久化
│   │   └── workflow-executor.service.ts   # 工作流编排
│   └── supabase/
│       └── admin-client.ts                # Admin 客户端
├── scripts/
│   ├── create-test-user.ts                # 创建测试用户
│   ├── setup-test-data.ts                 # 创建测试数据
│   └── test-persistence.ts                # 测试持久化
├── types/
│   └── client.ts                          # TypeScript 类型定义
├── CLAUDE.md                              # 项目开发规范
├── task_plan.md                           # 任务计划
├── progress.md                            # 进度记录
└── CONTEXT_SUMMARY.md                     # 本文档
```

---

**文档版本**: 1.0  
**最后更新**: 2026-05-07 02:30  
**维护者**: Claude Sonnet 4.6
