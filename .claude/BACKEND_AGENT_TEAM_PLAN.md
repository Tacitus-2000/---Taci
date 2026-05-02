# 后端 Agent Team 开发计划

## 📋 总体目标

创建律师短视频内容生成平台的**后端 Agent Team 骨架**，采用受控型多 Agent 架构。

## 🎯 核心原则

### ✅ 允许做的事情
- 创建目录结构
- 定义类型和接口
- 实现 Agent 骨架（使用 mock 数据）
- 创建 LangGraph 工作流
- 创建 API 路由骨架
- 生成 SQL schema 文件（不执行）
- 运行 lint 和 build 验证

### ❌ 禁止做的事情
- 不实现完整业务逻辑
- 不接入真实 AI API
- 不连接真实数据库
- 不执行 SQL 迁移
- 不做前端 UI
- 不提交 Git commit（除非用户明确要求）
- 不修改无关文件
- 不使用真实密钥

---

## 🔄 开发阶段和分工

### 阶段 1：架构设计（Plan Mode）

**负责 Agent**: `backend-architect`

**任务**：
1. 设计后端目录结构
2. 设计 AgentState 数据结构
3. 设计模块边界和接口
4. 规划数据流转

**交付物**：
- 目录结构设计文档
- AgentState 接口定义
- 模块边界说明
- 数据流转图

**检查点**：
- ✅ 用户批准架构设计

---

### 阶段 2：数据库设计

**负责 Agent**: `database-engineer`

**任务**：
1. 设计数据库表结构
2. 创建 `supabase/schema.sql`
3. 设计索引和触发器
4. 设计 `agent_tasks` 和 `agent_logs` 表

**交付物**：
- `supabase/schema.sql`
- 数据库设计文档
- ER 图（可选）

**检查点**：
- ✅ 用户批准数据库设计
- ⚠️ 不执行 SQL，只生成文件

---

### 阶段 3：类型和 Schema 定义

**负责 Agent**: `prompt-schema-engineer`

**任务**：
1. 创建 TypeScript 类型定义
   - `types/database.ts`
   - `types/agent.ts`
   - `types/script.ts`
   - `types/review.ts`
2. 创建 Zod schemas
   - `lib/schemas/agentStateSchema.ts`
   - `lib/schemas/profileSchema.ts`
   - `lib/schemas/topicSchema.ts`
   - `lib/schemas/scriptSchema.ts`
   - `lib/schemas/reviewSchema.ts`
3. 创建 Prompt 模板
   - `lib/prompts/supervisorPrompt.ts`
   - `lib/prompts/dataPrompt.ts`
   - `lib/prompts/profilePrompt.ts`
   - `lib/prompts/topicPrompt.ts`
   - `lib/prompts/scriptPrompt.ts`
   - `lib/prompts/readabilityReviewPrompt.ts`
   - `lib/prompts/complianceReviewPrompt.ts`
   - `lib/prompts/rewritePrompt.ts`

**交付物**：
- 完整的类型定义文件
- 完整的 Zod schema 文件
- 完整的 Prompt 模板文件

**检查点**：
- ✅ 类型定义完整
- ✅ Schema 验证通过
- ✅ Prompt 模板清晰

---

### 阶段 4：Agent 实现

**负责 Agent**: `agent-graph-engineer`

**任务**：
1. 创建 Agent 文件（使用 mock 实现）
   - `lib/agents/supervisorAgent.ts`
   - `lib/agents/dataAgent.ts`
   - `lib/agents/profileAgent.ts`
   - `lib/agents/topicAgent.ts`
   - `lib/agents/scriptAgent.ts`
   - `lib/agents/readabilityReviewAgent.ts`
   - `lib/agents/complianceReviewAgent.ts`
   - `lib/agents/rewriteAgent.ts`
2. 每个 Agent 必须：
   - 接收 `AgentState`
   - 返回更新后的 `Partial<AgentState>`
   - 记录日志到 `state.logs`
   - 使用 mock 数据（不调用真实 AI）

**交付物**：
- 8 个 Agent 文件
- 每个 Agent 都有 mock 实现
- 日志记录完整

**检查点**：
- ✅ 所有 Agent 文件创建
- ✅ 类型检查通过
- ⚠️ 使用 mock 数据，不调用真实 AI

---

### 阶段 5：LangGraph 工作流

**负责 Agent**: `agent-graph-engineer`

**任务**：
1. 创建工作流文件
   - `lib/graphs/profileWorkflowGraph.ts`
   - `lib/graphs/topicWorkflowGraph.ts`
   - `lib/graphs/scriptWorkflowGraph.ts`
2. 实现条件分支
3. 实现审查回路
4. 限制最多改写 2 次

**工作流设计**：

#### Profile Workflow
```
START → Data Agent → Profile Agent → Compliance Review → Supervisor → END
```

#### Topic Workflow
```
START → Data Agent → Topic Agent → Compliance Review → Supervisor → END
```

#### Script Workflow
```
START
↓
Data Agent
↓
Script Agent
↓
Readability Review + Compliance Review (并行)
↓
Supervisor (判断)
├─ 通过 → END
├─ 不通过 且 rewriteCount < 2 → Rewrite Agent → 重新审查
└─ 不通过 且 rewriteCount >= 2 → status = needs_manual_review → END
```

**交付物**：
- 3 个工作流文件
- 条件分支逻辑清晰
- 改写次数控制正确

**检查点**：
- ✅ 工作流编译通过
- ✅ 条件分支正确
- ✅ 最多改写 2 次

---

### 阶段 6：API 路由

**负责 Agent**: `api-route-engineer`

**任务**：
1. 创建 API 路由
   - `app/api/agent-runs/route.ts`
   - `app/api/profile/generate/route.ts`
   - `app/api/topics/generate/route.ts`
   - `app/api/scripts/generate/route.ts`
   - `app/api/scripts/review/route.ts`
   - `app/api/scripts/rewrite/route.ts`
2. 实现统一响应格式
   - `lib/api/response.ts`
   - `lib/api/errors.ts`
3. 实现输入校验（使用 Zod）
4. 实现错误处理

**API 响应格式**：

成功：
```json
{
  "success": true,
  "data": {}
}
```

失败：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

**交付物**：
- 6 个 API 路由文件
- 统一响应格式
- 输入校验完整
- 错误处理统一

**检查点**：
- ✅ 所有 API 路由创建
- ✅ 响应格式统一
- ✅ 输入校验通过
- ⚠️ 不暴露服务端密钥

---

### 阶段 7：安全审查

**负责 Agent**: `security-reviewer`

**任务**：
1. 检查密钥泄露
2. 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否只在服务端使用
3. 检查前端是否引用 `server.ts`
4. 检查是否有危险命令
5. 检查 `.env.local` 是否被 `.gitignore`

**交付物**：
- 安全审查报告
- 问题清单
- 修复建议

**检查点**：
- ✅ 无密钥泄露
- ✅ Service Role Key 隔离正确
- ✅ 前端不引用服务端代码
- ✅ 无危险命令

---

### 阶段 8：测试和验证

**负责 Agent**: `test-debugger`

**任务**：
1. 运行 `npm run lint`
2. 运行 `npm run build`
3. 修复编译错误
4. 修复类型错误
5. 总结问题和修改

**交付物**：
- Lint 通过
- Build 通过
- 问题修复报告
- 修改文件清单

**检查点**：
- ✅ Lint 无错误
- ✅ Build 成功
- ✅ 类型检查通过

---

## 📦 最终交付物清单

### 目录结构
```
/types
  database.ts
  agent.ts
  script.ts
  review.ts

/lib/agents
  supervisorAgent.ts
  dataAgent.ts
  profileAgent.ts
  topicAgent.ts
  scriptAgent.ts
  readabilityReviewAgent.ts
  complianceReviewAgent.ts
  rewriteAgent.ts

/lib/graphs
  profileWorkflowGraph.ts
  topicWorkflowGraph.ts
  scriptWorkflowGraph.ts

/lib/prompts
  supervisorPrompt.ts
  dataPrompt.ts
  profilePrompt.ts
  topicPrompt.ts
  scriptPrompt.ts
  readabilityReviewPrompt.ts
  complianceReviewPrompt.ts
  rewritePrompt.ts

/lib/schemas
  agentStateSchema.ts
  profileSchema.ts
  topicSchema.ts
  scriptSchema.ts
  reviewSchema.ts

/lib/ai
  modelProvider.ts
  structuredOutput.ts

/lib/api
  errors.ts
  response.ts

/app/api
  agent-runs/route.ts
  profile/generate/route.ts
  topics/generate/route.ts
  scripts/generate/route.ts
  scripts/review/route.ts
  scripts/rewrite/route.ts

/supabase
  schema.sql
```

### 文档
- 架构设计文档
- 数据库设计文档
- 安全审查报告
- 测试验证报告

---

## ✅ 用户确认检查点

### 检查点 1：架构设计
**时机**：阶段 1 完成后

**确认内容**：
- 目录结构是否合理？
- AgentState 设计是否完整？
- 模块边界是否清晰？

**用户操作**：
- 批准 → 进入阶段 2
- 修改 → backend-architect 调整设计

---

### 检查点 2：数据库设计
**时机**：阶段 2 完成后

**确认内容**：
- 表结构是否完整？
- 索引是否合理？
- agent_tasks 和 agent_logs 是否满足需求？

**用户操作**：
- 批准 → 进入阶段 3
- 修改 → database-engineer 调整设计

---

### 检查点 3：安全审查
**时机**：阶段 7 完成后

**确认内容**：
- 是否有安全问题？
- 是否需要修复？

**用户操作**：
- 通过 → 进入阶段 8
- 不通过 → 修复问题后重新审查

---

### 检查点 4：最终验证
**时机**：阶段 8 完成后

**确认内容**：
- Lint 是否通过？
- Build 是否成功？
- 是否满足所有要求？

**用户操作**：
- 通过 → 后端骨架完成
- 不通过 → test-debugger 修复问题

---

## 🚫 禁止事项清单

### 全局禁止
- ❌ 不实现完整业务逻辑
- ❌ 不接入真实 AI API
- ❌ 不连接真实数据库
- ❌ 不执行 SQL 迁移
- ❌ 不做前端 UI
- ❌ 不自动提交 Git commit
- ❌ 不修改无关文件
- ❌ 不使用真实密钥

### Agent 特定禁止
- ❌ backend-architect: 不直接写大量业务代码
- ❌ database-engineer: 不连接真实数据库执行 SQL
- ❌ agent-graph-engineer: 不写前端 UI，不绕过 AgentState
- ❌ api-route-engineer: 不把大段 prompt 写进 route，不暴露服务端密钥
- ❌ prompt-schema-engineer: 不写数据库逻辑，不写 UI
- ❌ security-reviewer: 不修改文件，只输出审查报告
- ❌ test-debugger: 不删除大量文件，不重构无关模块

---

## 📝 推荐执行顺序

### 方式 1：顺序执行（推荐新手）
```
1. backend-architect → 设计架构 → 等待用户批准
2. database-engineer → 设计数据库 → 等待用户批准
3. prompt-schema-engineer → 定义类型和 schemas
4. agent-graph-engineer → 实现 Agents 和工作流
5. api-route-engineer → 实现 API 路由
6. security-reviewer → 安全审查
7. test-debugger → 运行验证
```

### 方式 2：并行执行（推荐熟练用户）
```
阶段 1: backend-architect + database-engineer (并行设计)
↓
阶段 2: prompt-schema-engineer (定义接口)
↓
阶段 3: agent-graph-engineer + api-route-engineer (并行实现)
↓
阶段 4: security-reviewer (审查)
↓
阶段 5: test-debugger (验证)
```

---

## 🎯 成功标准

### 功能完整性
- ✅ 所有目录和文件创建完成
- ✅ 所有 Agent 有 mock 实现
- ✅ 所有工作流可以运行
- ✅ 所有 API 路由可以调用

### 代码质量
- ✅ Lint 无错误
- ✅ Build 成功
- ✅ 类型检查通过
- ✅ 无 TypeScript 错误

### 安全性
- ✅ 无密钥泄露
- ✅ Service Role Key 隔离正确
- ✅ 前端不引用服务端代码
- ✅ 无危险命令

### 可维护性
- ✅ 目录结构清晰
- ✅ 代码组织合理
- ✅ 接口定义清晰
- ✅ 文档完善

---

## 📞 下一步行动

完成后端骨架后，可以：

1. **接入真实 AI API**
   - 配置 OpenAI / Anthropic / DeepSeek API Key
   - 实现真实的 AI 调用
   - 替换 mock 实现

2. **连接真实数据库**
   - 在 Supabase 中执行 schema.sql
   - 配置 RLS 策略
   - 实现数据库操作

3. **开发前端 UI**
   - 使用 Cursor 开发前端页面
   - 调用后端 API
   - 实现用户交互

4. **测试和优化**
   - 端到端测试
   - 性能优化
   - 用户体验优化

---

## 📚 参考文档

- `.claude/TEAM_README.md` - Agent Team 说明
- `项目计划/` - 项目规划文档
- `README.md` - 项目说明
