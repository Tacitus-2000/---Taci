# 任务看板

**最后更新**: 2026-05-01  
**当前阶段**: 阶段 0 - 后端骨架审查与修复

---

## 任务状态说明

- 🟢 **已完成** - 任务已完成并通过验收
- 🟡 **进行中** - 任务正在执行
- ⚪ **待开始** - 任务尚未开始
- 🔴 **已阻塞** - 任务被其他问题阻塞

---

## 阶段 0: 后端骨架审查与修复

### 🟢 已完成任务

#### CC1: 更新项目原则到 README
- **负责人**: 用户
- **完成时间**: 2026-04-30
- **产出**: README.md 更新
- **状态**: ✅ 已完成

#### CC2: 调整数据库 schema 为多行业架构
- **负责人**: 用户
- **完成时间**: 2026-04-30
- **产出**: supabase/schema.sql 更新
- **状态**: ✅ 已完成

#### 阶段 0 审查与修复
- **负责人**: Agent Team (review-agent + program-agent)
- **完成时间**: 2026-05-01
- **产出**: 
  - 修复 Google Fonts 构建问题
  - 增强 LangGraph 循环控制
  - 通过 lint 和 build 验证
- **状态**: ✅ 已完成

---

## 下一阶段任务 (待规划)

### ⚪ CC3: 更新 TypeScript 类型定义

**目标**: 根据新的数据库 schema 创建完整的 TypeScript 类型定义

**待创建文件**:
- `types/database.ts` - 数据库表类型
- `types/client.ts` - 客户相关类型
- `types/industry.ts` - 行业相关类型
- `types/content.ts` - 内容相关类型
- `types/agent.ts` - Agent 相关类型
- `types/review.ts` - 审查相关类型

**要求**:
- 所有类型都要包含 `visible_to_client` 和 `internal_notes` 字段
- 使用 `ClientProfile` / `IndustryTemplate` 而非 `LawyerProfile`
- 与数据库 schema 保持一致

**状态**: ⚪ 待开始

---

### ⚪ CC4: 创建 AgentState

**目标**: 创建统一的 Agent 状态管理

**待创建文件**:
- `lib/schemas/agentStateSchema.ts` - AgentState Zod Schema
- `types/agent.ts` - Agent 类型定义

**AgentState 必须支持**:
- clientId
- industryId
- industryTemplate
- clientProfile
- contentPosition
- selectedTopic
- draftScript
- reviews
- rewriteCount
- logs
- status

**状态**: ⚪ 待开始

---

### ⚪ CC5: 创建 Agent 文件

**目标**: 实现 8 个专业 Agent

**待创建文件**:
- `lib/agents/supervisorAgent.ts`
- `lib/agents/dataAgent.ts`
- `lib/agents/profileAgent.ts`
- `lib/agents/topicAgent.ts`
- `lib/agents/scriptAgent.ts`
- `lib/agents/readabilityReviewAgent.ts`
- `lib/agents/riskReviewAgent.ts`
- `lib/agents/rewriteAgent.ts`

**要求**:
- 每个 Agent 输入/输出 AgentState
- 结构化 JSON 输出
- 记录日志到 agent_runs 和 agent_run_steps

**状态**: ⚪ 待开始

---

### ⚪ CC6: 创建 LangGraph 工作流

**目标**: 实现 3 个 LangGraph 工作流

**待创建文件**:
- `lib/graphs/profileWorkflowGraph.ts`
- `lib/graphs/topicWorkflowGraph.ts`
- `lib/graphs/scriptWorkflowGraph.ts`

**工作流**:
- Profile: Data → Profile → Risk Review → Supervisor
- Topic: Data → Topic → Risk Review → Supervisor
- Script: Data → Script → Readability Review + Risk Review → Supervisor → Rewrite (最多 2 次)

**状态**: ⚪ 待开始

---

### ⚪ CC7: Admin API

**目标**: 创建 Admin 后台 API

**待创建路由**:
- `/api/admin/clients`
- `/api/admin/client-profiles`
- `/api/admin/topics`
- `/api/admin/scripts`
- `/api/admin/reviews`
- `/api/admin/agent-runs`
- `/api/admin/prompts`

**要求**:
- Admin API 可以返回完整数据
- 包含 internal_notes 和所有字段

**状态**: ⚪ 待开始

---

### ⚪ CC8: Client API

**目标**: 创建 Client 前台 API

**待创建路由**:
- `/api/client/profile`
- `/api/client/scripts`
- `/api/client/generate`
- `/api/client/topics`
- `/api/client/calendar`
- `/api/client/feedback`
- `/api/client/style-reference`

**要求**:
- 只返回 `visible_to_client = true` 的数据
- 不返回 prompt、agent steps、internal review detail
- 只返回当前 client_id 的数据

**状态**: ⚪ 待开始

---

## 任务依赖关系

```
CC1 (完成) → CC2 (完成) → 阶段 0 审查 (完成)
                              ↓
                            CC3 (待开始)
                              ↓
                            CC4 (待开始)
                              ↓
                            CC5 (待开始)
                              ↓
                            CC6 (待开始)
                              ↓
                         CC7 + CC8 (待开始)
```

---

## 已知问题

### 🟡 非阻塞性问题

1. **Lint 警告** (3 个)
   - 未使用的变量（已用下划线前缀标记）
   - 不影响功能
   - 可选修复

2. **Next.js 多 lockfile 警告**
   - 建议配置 `turbopack.root`
   - 不影响构建
   - 可选修复

---

## 里程碑

- [x] **2026-04-30**: CC1 + CC2 完成
- [x] **2026-05-01**: 阶段 0 审查与修复完成
- [ ] **待定**: CC3-CC8 完成
- [ ] **待定**: 阶段 1 开始

---

**文档维护**: 每完成一个任务后更新本文档
