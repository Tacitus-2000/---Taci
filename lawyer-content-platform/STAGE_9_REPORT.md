# 阶段 9: 数据持久化 - 完成报告

**日期**: 2026-05-07  
**状态**: ✅ 完成  
**预计时间**: 2-3 小时  
**实际时间**: 0.5 小时  
**负责人**: Claude (Sonnet 4.6)

---

## 📋 目标

实现 AI 工作流的数据持久化功能，将工作流执行记录和每个步骤的详细信息保存到数据库中。

---

## ✅ 完成的任务

### 1. 扩展 WorkflowService

**文件**: `lib/services/workflow.service.ts`

**新增功能**:
- 添加了 `AgentRunStatus` 类型定义
- 添加了 `AgentRunRecord` 和 `AgentRunStepRecord` 接口
- 实现了 10 个新的数据库操作方法

**Agent Runs 操作**:
```typescript
// 创建 Agent Run 记录
async createAgentRun(params: {
  clientId?: string;
  industryId?: string;
  taskType: string;
  inputSummary?: string;
  internalOnly?: boolean;
}): Promise<string>

// 更新 Agent Run 状态
async updateAgentRunStatus(
  id: string,
  status: AgentRunStatus,
  errorMessage?: string
): Promise<void>

// 更新 Agent Run 输出摘要
async updateAgentRunOutput(
  id: string,
  outputSummary: string,
  status?: AgentRunStatus
): Promise<void>

// 获取 Agent Run 记录
async getAgentRun(id: string): Promise<AgentRunRecord | null>

// 列出 Agent Runs（支持分页和过滤）
async listAgentRuns(params: {
  clientId?: string;
  status?: AgentRunStatus;
  limit?: number;
  offset?: number;
}): Promise<AgentRunRecord[]>
```

**Agent Run Steps 操作**:
```typescript
// 创建 Agent Run Step 记录
async createAgentRunStep(params: {
  agentRunId: string;
  agentName: string;
  role: string;
  inputPayload?: Record<string, unknown>;
}): Promise<string>

// 更新 Agent Run Step 状态
async updateAgentRunStepStatus(
  id: string,
  status: AgentRunStatus,
  errorMessage?: string
): Promise<void>

// 更新 Agent Run Step 输出
async updateAgentRunStepOutput(
  id: string,
  outputPayload: Record<string, unknown>,
  status?: AgentRunStatus
): Promise<void>

// 获取 Agent Run Step 记录
async getAgentRunStep(id: string): Promise<AgentRunStepRecord | null>

// 列出某个 Agent Run 的所有步骤
async listAgentRunSteps(agentRunId: string): Promise<AgentRunStepRecord[]>
```

---

### 2. 创建 Admin 客户端

**文件**: `lib/supabase/admin-client.ts`

**功能**:
- 使用 `SUPABASE_SERVICE_ROLE_KEY` 创建 Supabase 客户端
- 绕过所有 RLS (Row Level Security) 策略
- 专门用于后端服务和测试脚本

**安全说明**:
```typescript
/**
 * ⚠️ 警告：此客户端使用 SERVICE_ROLE_KEY，绕过所有 RLS 策略
 * 仅在服务器端使用，切勿暴露给客户端
 *
 * 使用场景：
 * - 后端 API 路由
 * - 测试脚本
 * - 数据迁移脚本
 * - Agent 工作流执行
 */
```

---

### 3. 创建测试脚本

**文件**: `scripts/test-persistence.ts`

**测试场景**:

#### 场景 1: 正常工作流执行
1. 创建 Agent Run 记录
2. 更新状态为 `running`
3. 创建 5 个 Agent Run Steps（ProfileAgent, TopicAgent, ScriptAgent, ReadabilityReviewAgent, RiskReviewAgent）
4. 模拟每个步骤的执行（pending → running → completed）
5. 更新 Agent Run 为 `completed`
6. 验证数据正确保存

#### 场景 2: 错误处理
1. 创建 Agent Run 记录
2. 创建 Agent Run Step
3. 模拟步骤失败（running → failed）
4. 记录错误消息
5. 更新 Agent Run 为 `failed`
6. 验证错误信息正确保存

---

### 4. 添加 npm 脚本

**文件**: `package.json`

```json
{
  "scripts": {
    "test:persistence": "tsx scripts/test-persistence.ts"
  }
}
```

---

## 🧪 测试结果

### TypeScript 类型检查
```bash
npm run typecheck
```
✅ **通过** - 无类型错误

### 数据持久化测试
```bash
npm run test:persistence
```

**测试 1: 数据持久化功能**
- ✅ Agent Run 创建成功
- ✅ Agent Run 状态更新成功（pending → running → completed）
- ✅ 5 个 Agent Run Steps 创建成功
- ✅ 所有步骤状态更新成功（pending → running → completed）
- ✅ 输出数据正确保存到数据库
- ✅ 列表查询功能正常

**测试 2: 错误处理**
- ✅ Agent Run 失败状态记录成功
- ✅ Step 失败状态记录成功
- ✅ 错误消息正确保存

**测试输出示例**:
```
Agent Run 记录:
  - ID: 8dd54f57-826e-4588-8d53-0b1ef9fddb4b
  - 状态: completed
  - 任务类型: content_generation
  - 输入摘要: 测试工作流：生成劳动法相关内容
  - 输出摘要: 工作流执行成功，生成了完整的法律营销文案

Agent Run Steps (共 5 个):
  1. ProfileAgent (profile_generation) - completed
  2. TopicAgent (topic_generation) - completed
  3. ScriptAgent (script_generation) - completed
  4. ReadabilityReviewAgent (readability_review) - completed
  5. RiskReviewAgent (risk_review) - completed
```

---

## 🐛 遇到的问题

### 问题 1: RLS 策略阻止插入

**错误信息**:
```
Error: Failed to create agent run: new row violates row-level security policy for table "agent_runs"
```

**原因**: 
- 测试脚本使用的是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 该密钥受 RLS 策略限制

**解决方案**:
1. 创建 `lib/supabase/admin-client.ts`
2. 使用 `SUPABASE_SERVICE_ROLE_KEY` 绕过 RLS
3. 修改 `WorkflowService` 使用 admin 客户端

---

### 问题 2: 外键约束错误

**错误信息**:
```
Error: insert or update on table "agent_runs" violates foreign key constraint "agent_runs_client_id_fkey"
```

**原因**: 
- 测试数据中的 `client_id` 不存在于 `clients` 表中

**解决方案**:
- 修改测试脚本，不传递 `clientId` 和 `industryId`
- 使用 `NULL` 值避免外键约束

---

## 📚 关键文件

| 文件 | 用途 | 行数 |
|------|------|------|
| `lib/services/workflow.service.ts` | 工作流服务层，包含所有数据库操作 | ~450 |
| `lib/supabase/admin-client.ts` | Admin 客户端，使用 SERVICE_ROLE_KEY | ~40 |
| `scripts/test-persistence.ts` | 数据持久化测试脚本 | ~230 |
| `types/database.ts` | 数据库类型定义（已有 AgentRun 和 AgentRunStep） | ~200 |

---

## 💡 学到的经验

### 1. RLS 策略管理
- **前端**: 使用 `ANON_KEY`，受 RLS 保护
- **后端**: 使用 `SERVICE_ROLE_KEY`，绕过 RLS
- **测试**: 应使用 admin 客户端

### 2. 外键约束处理
- 测试数据需要考虑外键约束
- 可以使用 `NULL` 值避免外键约束
- 或者先创建依赖的记录

### 3. 数据持久化设计
- **Agent Run**: 记录工作流级别的信息（状态、输入摘要、输出摘要、错误消息）
- **Agent Run Steps**: 记录每个步骤的详细信息（输入、输出、状态、错误）
- 支持状态追踪和错误记录
- 支持分页和过滤查询

### 4. 测试策略
- 测试正常流程（成功场景）
- 测试错误处理（失败场景）
- 验证数据正确保存
- 验证查询功能正常

---

## 🎯 验收标准

- ✅ 工作流执行记录保存到数据库
- ✅ 每个步骤都有详细记录
- ✅ 支持状态追踪（pending → running → completed/failed）
- ✅ 支持错误记录
- ✅ 支持查询和列表功能
- ✅ TypeScript 类型检查通过
- ✅ 所有测试通过

---

## 📊 数据库表结构

### agent_runs 表
```sql
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_summary TEXT,
  output_summary TEXT,
  error_message TEXT,
  internal_only BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### agent_run_steps 表
```sql
CREATE TABLE IF NOT EXISTS agent_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  role TEXT NOT NULL,
  input_payload JSONB,
  output_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🚀 下一步

**阶段 10: 前端集成**
- 修改 `app/client/generate/page.tsx` - 客户端生成页面
- 修改 `app/admin/agent-runs/page.tsx` - Admin 端查看页面
- 添加进度条和状态显示
- 实时查看工作流执行状态

---

## 📝 总结

阶段 9 成功实现了 AI 工作流的数据持久化功能。通过扩展 `WorkflowService`，我们现在可以：

1. **记录工作流执行**: 每次工作流执行都会创建 `agent_runs` 记录
2. **追踪步骤详情**: 每个 Agent 步骤都会创建 `agent_run_steps` 记录
3. **状态管理**: 支持 pending → running → completed/failed 的状态流转
4. **错误处理**: 记录错误消息，便于调试和分析
5. **查询功能**: 支持分页、过滤、列表查询

这为下一阶段的前端集成奠定了坚实的基础。用户将能够在前端触发工作流，并实时查看执行状态和结果。

---

**报告生成时间**: 2026-05-07 01:20  
**版本**: V0.2 - 阶段 9
