# 06_CLAUDE_CODE_TOTAL_EXECUTION_PLAN｜Claude Code 总执行路径

## 1. Claude Code 的职责

Claude Code 主要负责：

```text
项目依赖
数据库 schema
TypeScript 类型
Supabase API
Admin / Client API 分层
多 Agent 文件结构
LangGraph 工作流
AgentState
提示词读取
构建与部署检查
```

Claude Code 不主要负责：

```text
页面美化
大面积 UI 重构
客户前台视觉细节
```

## 2. Claude Code 总步骤

### CC1：更新项目原则

先把当前项目原则写入 README 或 SETUP_SUMMARY：

```text
第一阶段服务刑事律师。
底层支持多行业。
系统分 Admin 后台和 Client 前台。
Client 不展示 Agent、提示词、内部审查细节。
商业模式为 4W 深度启动包 + 后续维护包。
```

### CC2：调整数据库 schema

创建或更新：

```text
supabase/schema.sql
```

核心表：

```text
profiles
clients
industries
client_profiles
industry_templates
content_positions
topics
scripts
script_reviews
prompt_templates
agent_runs
agent_run_steps
```

核心字段：

```text
client_id
industry_id
visible_to_client
internal_only
role
```

### CC3：更新 TypeScript 类型

创建或更新：

```text
types/database.ts
types/client.ts
types/industry.ts
types/content.ts
types/agent.ts
types/review.ts
```

重点：

```text
不要只使用 LawyerProfile。
使用 ClientProfile / IndustryTemplate。
```

### CC4：创建 AgentState

创建：

```text
lib/schemas/agentStateSchema.ts
types/agent.ts
```

AgentState 必须支持：

```text
clientId
industryId
industryTemplate
clientProfile
contentPosition
selectedTopic
draftScript
reviews
rewriteCount
logs
status
```

### CC5：创建 Agent 文件

创建：

```text
lib/agents/supervisorAgent.ts
lib/agents/dataAgent.ts
lib/agents/profileAgent.ts
lib/agents/topicAgent.ts
lib/agents/scriptAgent.ts
lib/agents/readabilityReviewAgent.ts
lib/agents/riskReviewAgent.ts
lib/agents/rewriteAgent.ts
```

每个 Agent：

```text
输入 AgentState
输出更新后的 AgentState
结构化 JSON
记录日志
```

### CC6：创建 LangGraph 工作流

创建：

```text
lib/graphs/profileWorkflowGraph.ts
lib/graphs/topicWorkflowGraph.ts
lib/graphs/scriptWorkflowGraph.ts
```

工作流：

```text
Profile: Data → Profile → Risk Review → Supervisor
Topic: Data → Topic → Risk Review → Supervisor
Script: Data → Script → Readability Review + Risk Review → Supervisor → Rewrite if needed
```

最多改写 2 次。

### CC7：Admin API

创建：

```text
/api/admin/clients
/api/admin/client-profiles
/api/admin/topics
/api/admin/scripts
/api/admin/reviews
/api/admin/agent-runs
/api/admin/prompts
```

Admin API 可以返回完整数据。

### CC8：Client API

创建：

```text
/api/client/profile
/api/client/scripts
/api/client/generate
/api/client/topics
/api/client/calendar
/api/client/feedback
/api/client/style-reference
```

Client API 只能返回：

```text
visible_to_client = true
非 internal_only
当前 client_id 的数据
```

不能返回：

```text
prompt
agent steps
internal review detail
system notes
other client data
```

### CC9：行业模板 seed

创建默认行业：

```text
legal
```

创建默认模板：

```text
legal_criminal_lawyer_template
```

包含：

```text
默认内容栏目
默认审查规则
默认提示词类型
默认选题结构
默认风险规则
```

### CC10：提示词模板系统

实现：

```text
根据 industry_id + agent_type 读取 active prompt
没有数据库模板时使用本地默认模板
记录 prompt version
```

### CC11：Agent 日志

确保每次工作流都写入：

```text
agent_runs
agent_run_steps
```

保存：

```text
agent_name
input_payload
output_payload
status
error_message
```

### CC12：构建和安全检查

运行：

```bash
npm run lint
npm run build
```

检查：

```text
.env.local 没有进 Git
SERVICE_ROLE_KEY 不暴露给前端
Client API 不返回 internal 字段
```

## 3. Claude Code 每步通用要求

每次给 Claude Code 的任务都加：

```text
当前只执行本步骤。
不要一次性实现全部内容。
不要大改 UI 页面。
不要删除现有页面。
修改后运行 lint；能 build 则 build。
完成后说明修改文件、验证结果和下一步建议。
```

## 4. Claude Code 第一条推荐提示词

```text
请阅读项目文档。当前只执行 CC1 和 CC2：更新项目原则，并将数据库 schema 调整为 clients + industries + client_profiles + industry_templates 的多行业结构，同时保留刑事律师作为第一阶段模板。不要实现完整 Agent，不要改 UI。完成后运行 lint，并汇报修改文件。
```
