# 后端 Agent Team 开发计划

## 📋 总体目标

使用三人 Agent Team 创建律师短视频内容生成平台的**后端骨架**，采用受控型多 Agent 架构。

## 🎯 第一版范围

### ✅ 必须实现
- 后端目录结构
- TypeScript 类型定义
- Zod schema 定义
- Agent 骨架（mock 实现）
- LangGraph 工作流骨架
- API 路由骨架
- Supabase schema 文件（不执行）
- 统一响应格式和错误处理

### ❌ 明确不做
- 风格蒸馏（第二版）
- 用户登录和认证
- 复杂 RLS 策略
- 抖音数据采集
- 自动发布视频
- 前端 UI 页面
- 真实 AI API 调用
- 真实数据库连接

---

## 📅 开发阶段

### 阶段 1: 架构设计和任务拆解

**负责人**: project-agent

**任务**:
1. 理解项目需求
2. 设计后端目录结构
3. 设计 AgentState 数据结构
4. 拆解开发任务
5. 定义文件修改范围
6. 分配任务给 program-agent

**交付物**:
- 架构设计文档
- 目录结构设计
- AgentState 设计
- 任务清单
- 文件修改范围说明

**审查点**:
- ✅ 用户确认架构设计
- ✅ 用户确认任务拆解

**预计时间**: 30 分钟

---

### 阶段 2: 类型和 Schema 定义

**负责人**: program-agent

**任务**:
1. 创建 `/types` 目录
2. 编写 `types/database.ts` - 数据库表类型
3. 编写 `types/agent.ts` - Agent 相关类型
4. 编写 `types/script.ts` - 文案相关类型
5. 编写 `types/review.ts` - 审查相关类型
6. 创建 `/lib/schemas` 目录
7. 编写 `lib/schemas/agentStateSchema.ts`
8. 编写 `lib/schemas/profileSchema.ts`
9. 编写 `lib/schemas/topicSchema.ts`
10. 编写 `lib/schemas/scriptSchema.ts`
11. 编写 `lib/schemas/reviewSchema.ts`

**交付物**:
- 完整的 TypeScript 类型定义
- 完整的 Zod schema 定义
- 类型和 schema 一致

**审查点**:
- ✅ review-agent 审查类型定义完整性
- ✅ review-agent 检查是否通过 lint

**预计时间**: 1 小时

---

### 阶段 3: 数据库 Schema 设计

**负责人**: program-agent

**任务**:
1. 创建 `/supabase` 目录
2. 编写 `supabase/schema.sql`
3. 定义所有表结构：
   - profiles
   - clients
   - industries
   - client_profiles
   - industry_templates
   - content_positions
   - topics
   - scripts
   - script_reviews
   - prompt_templates
   - agent_runs
   - agent_run_steps
4. 创建索引
5. 创建 updated_at 触发器
6. 添加注释说明

**交付物**:
- `supabase/schema.sql` 文件
- 数据库设计说明

**审查点**:
- ✅ review-agent 审查表结构设计
- ✅ review-agent 检查是否有 SQL 注入风险
- ⚠️ 不执行 SQL，只生成文件

**预计时间**: 1 小时

---

### 阶段 4: Agent 骨架实现

**负责人**: program-agent

**任务**:
1. 创建 `/lib/agents` 目录
2. 实现以下 Agent（使用 mock）：
   - `supervisorAgent.ts` - 总控 Agent
   - `dataAgent.ts` - 数据准备 Agent
   - `profileAgent.ts` - 客户定位 Agent
   - `topicAgent.ts` - 选题生成 Agent
   - `scriptAgent.ts` - 文案生成 Agent
   - `readabilityReviewAgent.ts` - 可读性审查 Agent
   - `complianceReviewAgent.ts` - 合规审查 Agent
   - `rewriteAgent.ts` - 改写 Agent
3. 每个 Agent 必须：
   - 接收 AgentState
   - 返回 Partial<AgentState>
   - 记录日志
   - 使用 mock 数据

**交付物**:
- 8 个 Agent 文件
- 每个 Agent 都有 mock 实现
- 日志记录完整

**审查点**:
- ✅ review-agent 审查 Agent 实现
- ✅ review-agent 检查是否使用 mock
- ✅ review-agent 检查日志记录

**预计时间**: 2 小时

---

### 阶段 5: LangGraph 工作流实现

**负责人**: program-agent

**任务**:
1. 创建 `/lib/graphs` 目录
2. 实现 `profileWorkflowGraph.ts`：
   - Data Agent → Profile Agent → Compliance Review → Supervisor
3. 实现 `topicWorkflowGraph.ts`：
   - Data Agent → Topic Agent → Compliance Review → Supervisor
4. 实现 `scriptWorkflowGraph.ts`：
   - Data Agent → Script Agent → Readability + Compliance Review → Supervisor
   - 条件分支：通过/改写/失败
   - 最多改写 2 次
5. 确保工作流可编译通过

**交付物**:
- 3 个工作流文件
- 条件分支逻辑清晰
- 改写次数控制正确

**审查点**:
- ✅ review-agent 审查工作流逻辑
- ✅ review-agent 检查是否有无限循环风险
- ✅ review-agent 检查 maxRewriteCount = 2

**预计时间**: 2 小时

---

### 阶段 6: Prompt 模板实现

**负责人**: program-agent

**任务**:
1. 创建 `/lib/prompts` 目录
2. 编写以下 prompt 模板：
   - `supervisorPrompt.ts`
   - `dataPrompt.ts`
   - `profilePrompt.ts`
   - `topicPrompt.ts`
   - `scriptPrompt.ts`
   - `readabilityReviewPrompt.ts`
   - `complianceReviewPrompt.ts`
   - `rewritePrompt.ts`
3. 每个 prompt 必须：
   - 明确 Agent 角色
   - 定义输出 JSON 结构
   - 说明质量标准
   - 列出禁止事项

**交付物**:
- 8 个 prompt 文件
- 每个 prompt 结构清晰

**审查点**:
- ✅ review-agent 审查 prompt 质量

**预计时间**: 1 小时

---

### 阶段 7: AI 模型提供者实现

**负责人**: program-agent

**任务**:
1. 创建 `/lib/ai` 目录
2. 实现 `modelProvider.ts`：
   - 定义 ModelConfig
   - 默认使用 mock provider
   - 支持后续接入真实 API
3. 实现 `structuredOutput.ts`：
   - 定义结构化输出接口
   - 使用 Zod 验证
   - 当前返回 mock 数据

**交付物**:
- `lib/ai/modelProvider.ts`
- `lib/ai/structuredOutput.ts`

**审查点**:
- ✅ review-agent 审查是否使用 mock

**预计时间**: 30 分钟

---

### 阶段 8: API 工具函数实现

**负责人**: program-agent

**任务**:
1. 创建 `/lib/api` 目录
2. 实现 `response.ts`：
   - successResponse()
   - errorResponse()
   - ApiErrors 常量
3. 实现 `errors.ts`：
   - withErrorHandling() 中间件
   - 统一错误处理

**交付物**:
- `lib/api/response.ts`
- `lib/api/errors.ts`

**审查点**:
- ✅ review-agent 审查响应格式统一性

**预计时间**: 30 分钟

---

### 阶段 9: API 路由实现

**负责人**: program-agent

**任务**:
1. 创建 `/app/api` 目录结构
2. 实现以下 API 路由：
   - `app/api/agent-runs/route.ts` - 获取 Agent 运行记录
   - `app/api/profile/generate/route.ts` - 生成客户定位
   - `app/api/topics/generate/route.ts` - 生成选题
   - `app/api/scripts/generate/route.ts` - 生成文案
   - `app/api/scripts/review/route.ts` - 审查文案
   - `app/api/scripts/rewrite/route.ts` - 改写文案
3. 每个路由必须：
   - 使用 Zod 验证输入
   - 使用统一响应格式
   - 使用统一错误处理
   - 调用对应的工作流

**交付物**:
- 6 个 API 路由文件
- 统一响应格式
- 输入验证完整

**审查点**:
- ✅ review-agent 审查 API 安全性
- ✅ review-agent 检查是否暴露敏感信息
- ✅ review-agent 检查输入验证

**预计时间**: 2 小时

---

### 阶段 10: 最终审查和验证

**负责人**: review-agent

**任务**:
1. 全面安全审查
2. 代码质量审查
3. 运行 `npm run lint`
4. 运行 `npm run build`（如果支持）
5. 检查文件修改范围
6. 生成最终审查报告

**交付物**:
- 完整的审查报告
- Lint 结果
- Build 结果
- 问题清单
- 修改建议

**审查点**:
- ✅ 用户确认审查结果
- ✅ 决定是否需要修改

**预计时间**: 1 小时

---

## 📊 总体时间估算

| 阶段 | 负责人 | 预计时间 |
|------|--------|----------|
| 1. 架构设计 | project-agent | 30 分钟 |
| 2. 类型和 Schema | program-agent | 1 小时 |
| 3. 数据库 Schema | program-agent | 1 小时 |
| 4. Agent 骨架 | program-agent | 2 小时 |
| 5. LangGraph 工作流 | program-agent | 2 小时 |
| 6. Prompt 模板 | program-agent | 1 小时 |
| 7. AI 模型提供者 | program-agent | 30 分钟 |
| 8. API 工具函数 | program-agent | 30 分钟 |
| 9. API 路由 | program-agent | 2 小时 |
| 10. 最终审查 | review-agent | 1 小时 |
| **总计** | | **约 11.5 小时** |

---

## ✅ 用户确认检查点

### 检查点 1: 架构设计确认
**时机**: 阶段 1 完成后

**确认内容**:
- 目录结构是否合理？
- AgentState 设计是否完整？
- 任务拆解是否清晰？

**用户操作**:
- ✅ 批准 → 进入阶段 2
- ❌ 修改 → project-agent 调整设计

---

### 检查点 2: 数据库设计确认
**时机**: 阶段 3 完成后

**确认内容**:
- 表结构是否完整？
- 索引是否合理？
- agent_runs 和 agent_run_steps 是否满足需求？

**用户操作**:
- ✅ 批准 → 进入阶段 4
- ❌ 修改 → program-agent 调整设计

---

### 检查点 3: 阶段性审查
**时机**: 阶段 5 完成后

**确认内容**:
- Agent 实现是否正确？
- 工作流逻辑是否清晰？
- 是否有无限循环风险？

**用户操作**:
- ✅ 通过 → 进入阶段 6
- ❌ 不通过 → program-agent 修改

---

### 检查点 4: 最终验收
**时机**: 阶段 10 完成后

**确认内容**:
- 安全审查是否通过？
- 代码质量是否达标？
- Lint 和 Build 是否通过？
- 是否满足所有要求？

**用户操作**:
- ✅ 通过 → 后端骨架完成
- ❌ 不通过 → program-agent 修复问题

---

## 🚫 禁止事项清单

### 全局禁止
- ❌ 不实现第二版功能（风格蒸馏）
- ❌ 不实现用户登录和认证
- ❌ 不实现复杂 RLS 策略
- ❌ 不连接真实数据库执行 SQL
- ❌ 不调用真实 AI API
- ❌ 不做前端 UI 页面
- ❌ 不修改前端组件
- ❌ 不使用真实密钥

### project-agent 禁止
- ❌ 不直接写大量代码
- ❌ 不直接修改密钥文件
- ❌ 不跳过审查直接推进
- ❌ 不擅自加入第二版功能

### program-agent 禁止
- ❌ 不自行改变产品范围
- ❌ 不写真实密钥
- ❌ 不连接真实数据库执行 SQL
- ❌ 不删除无关文件
- ❌ 不改前端页面
- ❌ 不做第二版风格蒸馏
- ❌ 不做用户登录和复杂 RLS

### review-agent 禁止
- ❌ 默认不写业务代码
- ❌ 不做大规模重构
- ❌ 不删除文件
- ❌ 不改变产品方向
- ❌ 不扩大功能范围

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
- 审查报告
- 实现报告

---

## 🎯 成功标准

### 功能完整性
- ✅ 所有目录和文件创建完成
- ✅ 所有 Agent 有 mock 实现
- ✅ 所有工作流可以运行
- ✅ 所有 API 路由可以调用

### 代码质量
- ✅ Lint 无错误
- ✅ Build 成功（如果支持）
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
   - 配置 API Key
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

**更新时间**: 2026/05/01  
**版本**: v1.0
