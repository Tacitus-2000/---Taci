# 07_DEVELOPMENT_ORDER_AND_RULES｜总开发顺序与协作规则

## 1. 当前阶段优先级

你现在不要继续直接做律师档案表单。

应该先完成：

```text
1. Cursor：Admin / Client 双端路由结构
2. Claude Code：多行业数据库结构
```

否则后面会按错误的“单端律师工具”继续开发，后续需要推倒重来。

## 2. 推荐总顺序

```text
阶段 1：结构调整
  Cursor：迁移 /admin，新增 /client
  Claude Code：调整 schema 为 client + industry 架构

阶段 2：客户和档案
  Cursor：Admin 客户管理、客户档案页面
  Claude Code：Admin 客户 API、client_profiles API

阶段 3：行业模板
  Claude Code：legal_criminal 模板 seed
  Cursor：Admin 行业模板展示页面，先静态后接 API

阶段 4：多 Agent 核心
  Claude Code：AgentState、Agent 文件、LangGraph 工作流
  Cursor：Agent 运行记录展示

阶段 5：文案闭环
  Claude Code：生成、审查、改写 API
  Cursor：Admin 和 Client 文案页面接 API

阶段 6：客户前台
  Cursor：Client 文案、生成、反馈、内容日历
  Claude Code：Client API 权限过滤

阶段 7：提示词和资产库
  Claude Code：prompt_templates API
  Cursor：Admin prompts 页面
  Cursor：Admin assets 页面

阶段 8：联调验收
  Claude Code：lint/build/安全检查
  Cursor：UI 细节和交互修复
```

## 3. Cursor 与 Claude Code 禁止互相抢活

### Cursor 不要改

```text
supabase/schema.sql
lib/agents
lib/graphs
lib/schemas
lib/supabase/server.ts
app/api 的复杂后端逻辑
```

### Claude Code 不要大改

```text
页面视觉风格
已完成的前端布局
Client 前台文案风格
```

## 4. 每次任务必须小

错误任务：

```text
请完成整个系统。
```

正确任务：

```text
请只完成 /admin/clients 页面静态布局，不接 API。
```

## 5. 每次汇报格式

要求 Cursor / Claude Code 都按这个格式汇报：

```text
已完成：
1.
2.
3.

修改文件：
1.
2.

验证结果：
- lint 是否通过
- build 是否通过
- 页面或 API 如何测试

未完成 / 风险：
1.
2.

下一步建议：
1.
```

## 6. 安全规则

```text
1. .env.local 不能进 Git。
2. SERVICE_ROLE_KEY 不能出现在前端。
3. Client API 不能返回 prompt。
4. Client API 不能返回 agent_run_steps。
5. Client API 不能返回 internal_only=true 的内容。
6. Client 只能访问自己的 client_id。
```

## 7. 产品规则

```text
1. 第一阶段页面文案可以聚焦刑事律师。
2. 底层命名尽量使用 client / industry / content。
3. 不要把系统做成低价 AI 工具。
4. Client 前台要体现高端定制服务。
5. Admin 后台才展示完整生产能力。
```
