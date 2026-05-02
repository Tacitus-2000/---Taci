# 下一步行动计划

**最后更新**: 2026-05-01  
**当前阶段**: 阶段 0 完成，准备进入 CC3

---

## 当前状态总结

### ✅ 已完成
- CC1: 更新项目原则到 README
- CC2: 调整数据库 schema 为多行业架构
- 阶段 0: 后端骨架审查与修复
  - 修复 Google Fonts 构建问题
  - 增强 LangGraph 循环控制
  - 通过 lint 和 build 验证
- CC3: 更新 TypeScript 类型定义
  - 创建 6 个类型定义文件
  - 所有类型包含 visible_to_client 和 internal_notes 字段
  - 使用 ClientProfile 而非 LawyerProfile
  - 与数据库 schema 保持一致

### 📊 验证结果
- `npm run lint`: ✅ 通过（0 错误，3 警告）
- `npm run build`: ✅ 成功
- 安全审查: ✅ 通过
- 代码质量: ✅ 良好

---

## 立即行动项

### 🎯 优先级 1: CC4 - 创建 AgentState

**目标**: 创建统一的 Agent 状态管理

**为什么现在做**:
- AgentState 是 Agent 工作流的核心
- 必须在实现 Agent 之前定义
- 阻塞后续的 CC5（创建 Agent 文件）

**具体任务**:

1. **创建 `lib/schemas/agentStateSchema.ts`**
   - 使用 Zod 定义 AgentState Schema
   - 包含所有必需字段

2. **更新 `types/agent.ts`**
   - 添加 AgentState 类型定义
   - 从 Zod Schema 推导类型

**AgentState 必须支持的字段**:
- clientId: string
- industryId: string
- industryTemplate?: Record<string, unknown>
- clientProfile?: Record<string, unknown>
- contentPosition?: Record<string, unknown>
- selectedTopic?: Record<string, unknown>
- draftScript?: Record<string, unknown>
- reviews?: Array<Record<string, unknown>>
- rewriteCount: number
- maxRewriteCount: number
- logs: Array<string>
- status: 'pending' | 'running' | 'completed' | 'failed'

**验收标准**:
- [ ] agentStateSchema.ts 创建完成
- [ ] AgentState 类型定义完成
- [ ] 所有必需字段都包含
- [ ] `npm run lint` 通过
- [ ] `npm run build` 成功

**预计时间**: 30-60 分钟

**推荐提示词**:
```
继续项目开发。请执行 CC4：创建 AgentState。

工作目录：E:\Lawer-Contest\lawyer-content-platform

创建文件：
- lib/schemas/agentStateSchema.ts - AgentState Zod Schema
- 更新 types/agent.ts - 添加 AgentState 类型

AgentState 必须支持的字段：
- clientId, industryId
- industryTemplate, clientProfile, contentPosition
- selectedTopic, draftScript, reviews
- rewriteCount, maxRewriteCount, logs, status

要求：
1. 使用 Zod 进行运行时验证
2. 从 Zod Schema 推导 TypeScript 类型
3. 完成后运行 npm run lint 和 npm run build

不要实现 Agent 逻辑，不要改 UI。
```

---

## 后续行动项

### 🎯 优先级 2: CC4 - 创建 AgentState

**依赖**: CC3 完成

**目标**: 创建统一的 Agent 状态管理

**具体任务**:
1. 创建 `lib/schemas/agentStateSchema.ts` - Zod Schema
2. 更新 `types/agent.ts` - 添加 AgentState 类型
3. 确保 AgentState 支持所有必需字段

**预计时间**: 1 小时

---

### 🎯 优先级 3: CC5 - 创建 Agent 文件

**依赖**: CC4 完成

**目标**: 实现 8 个专业 Agent

**具体任务**:
1. 创建 8 个 Agent 文件
2. 每个 Agent 输入/输出 AgentState
3. 结构化 JSON 输出
4. 记录日志

**预计时间**: 4-6 小时

---

### 🎯 优先级 4: CC6 - 创建 LangGraph 工作流

**依赖**: CC5 完成

**目标**: 实现 3 个 LangGraph 工作流

**具体任务**:
1. 创建 profileWorkflowGraph.ts
2. 创建 topicWorkflowGraph.ts
3. 创建 scriptWorkflowGraph.ts

**预计时间**: 3-4 小时

---

### 🎯 优先级 5: CC7 + CC8 - 创建 API 路由

**依赖**: CC6 完成

**目标**: 实现 Admin 和 Client API

**具体任务**:
1. 创建 Admin API（7 个路由）
2. 创建 Client API（7 个路由）
3. 实现权限控制和数据过滤

**预计时间**: 6-8 小时

---

## 可选优化项

### 🔧 优化 1: 清理 Lint 警告

**优先级**: 低  
**预计时间**: 15 分钟

**任务**:
- 移除或保留未使用的变量
- 决定是否需要这些预留参数

---

### 🔧 优化 2: 配置 Turbopack Root

**优先级**: 低  
**预计时间**: 5 分钟

**任务**:
- 在 `next.config.ts` 中配置 `turbopack.root`
- 消除 Next.js 多 lockfile 警告

---

### 🔧 优化 3: 创建 lib/supabase/server.ts

**优先级**: 中  
**预计时间**: 30 分钟

**任务**:
- 创建使用 SERVICE_ROLE_KEY 的服务端客户端
- 在需要管理员权限的操作中使用
- 确保前端不引用

---

### 🔧 优化 4: 添加生产环境日志配置

**优先级**: 低  
**预计时间**: 30 分钟

**任务**:
- 配置生产环境移除或条件化 console.log
- 使用专业的日志库（如 winston, pino）

---

## 阻塞问题

**当前无阻塞问题** ✅

---

## 风险提示

### ⚠️ 风险 1: 类型定义与 Schema 不一致

**风险描述**: 如果 CC3 创建的类型与数据库 schema 不一致，会导致后续开发出现大量类型错误

**缓解措施**:
- 仔细对照 `supabase/schema.sql` 创建类型
- 使用 Supabase CLI 自动生成类型（可选）
- 在 CC3 完成后进行彻底的类型检查

---

### ⚠️ 风险 2: Agent 实现复杂度

**风险描述**: 8 个 Agent 的实现可能比预期复杂，特别是 AI 调用和结构化输出部分

**缓解措施**:
- 先实现 mock 版本，验证工作流
- 再逐步接入真实 AI API
- 使用 Vercel AI SDK 的 `generateObject` 简化结构化输出

---

### ⚠️ 风险 3: LangGraph 学习曲线

**风险描述**: LangGraph.js 是相对较新的技术，可能需要时间学习

**缓解措施**:
- 参考官方文档和示例
- 先实现简单的工作流，再逐步复杂化
- 使用 LangGraph Studio 可视化调试（如果可用）

---

## 成功标准

### 阶段 1 完成标准

完成 CC3-CC8 后，项目应该达到：

- [ ] 所有类型定义完整且与 schema 一致
- [ ] AgentState 设计清晰且支持所有工作流
- [ ] 8 个 Agent 实现完整（至少 mock 版本）
- [ ] 3 个 LangGraph 工作流可以运行
- [ ] Admin API 和 Client API 实现完整
- [ ] 权限控制和数据过滤正确实现
- [ ] `npm run lint` 通过
- [ ] `npm run build` 成功
- [ ] 安全审查通过

---

## 时间估算

### 总体时间估算

| 任务 | 预计时间 | 累计时间 |
|------|---------|---------|
| CC3 | 1-2 小时 | 1-2 小时 |
| CC4 | 1 小时 | 2-3 小时 |
| CC5 | 4-6 小时 | 6-9 小时 |
| CC6 | 3-4 小时 | 9-13 小时 |
| CC7+CC8 | 6-8 小时 | 15-21 小时 |

**总计**: 15-21 小时（约 2-3 个工作日）

---

## 下次会话建议

**推荐开始任务**: CC3 - 更新 TypeScript 类型定义

**推荐提示词**:
```
继续项目开发。请执行 CC3：根据数据库 schema 创建 TypeScript 类型定义。创建 types/database.ts、types/client.ts、types/industry.ts、types/content.ts、types/agent.ts、types/review.ts。确保所有类型都包含 visible_to_client 和 internal_notes 字段。不要实现 Agent 逻辑，不要改 UI。完成后运行 lint 和 build。
```

---

**文档维护**: 每完成一个阶段后更新本文档
