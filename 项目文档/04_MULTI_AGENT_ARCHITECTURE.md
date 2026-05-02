# 04_MULTI_AGENT_ARCHITECTURE｜受控型多 Agent 架构

## 1. 第一版采用真多 Agent

第一版不是“几个函数模拟 Agent”，而是采用：

```text
受控型多 Agent 工作流
```

定义：

```text
Supervisor Agent
+
多个专业 Agent
+
共享 AgentState
+
LangGraph 工作流
+
条件分支
+
审查回路
+
最多 2 次改写
+
Agent 日志
```

## 2. 不做完全自由智能体

允许：

```text
独立 Agent 文件
共享状态
工作流编排
并行审查
条件改写
日志记录
结构化输出
```

不允许：

```text
Agent 无限循环
Agent 自己改数据库结构
Agent 自己创建未知任务
Agent 随意访问客户数据
Agent 把内部流程暴露给 client
```

## 3. Agent 清单

| Agent | 作用 |
|---|---|
| Supervisor Agent | 总控，判断流程和是否改写 |
| Data Agent | 整理输入和上下文 |
| Profile Agent | 生成客户定位 |
| Topic Agent | 生成选题 |
| Script Agent | 生成文案 |
| Readability Review Agent | 可读性审查 |
| Risk / Compliance Review Agent | 行业风险审查 |
| Rewrite Agent | 根据审查意见改写 |
| Style Distillation Agent | 第二版风格蒸馏 |
| Originality Review Agent | 第二版原创性审查 |

## 4. AgentState

建议包含：

```ts
type AgentState = {
  taskId: string;
  userId?: string;
  clientId: string;
  industryId: string;

  taskType:
    | "generate_profile"
    | "generate_topics"
    | "generate_script"
    | "style_distillation";

  industryTemplate?: IndustryTemplate;
  clientProfile?: ClientProfile;
  contentPosition?: ContentPosition;
  selectedTopic?: Topic;

  draftScript?: ScriptDraft;
  readabilityReview?: ReviewResult;
  riskReview?: ReviewResult;

  rewriteCount: number;
  maxRewriteCount: number;

  finalScript?: ScriptDraft;
  status: "running" | "needs_rewrite" | "passed" | "failed";

  currentNode?: string;
  logs: AgentLog[];
  errors?: string[];
};
```

## 5. 文案工作流

```text
START
↓
Data Agent
↓
Script Agent
↓
并行：
  Readability Review Agent
  Risk / Compliance Review Agent
↓
Supervisor Agent 判断
  ├─ 通过 → 保存最终稿
  └─ 不通过且 rewriteCount < 2 → Rewrite Agent
          ↓
          再次进入两个 Review Agent
          ↓
          Supervisor Agent 再判断
```

## 6. 选题工作流

```text
START
↓
Data Agent
↓
Topic Agent
↓
Risk Review Agent
↓
Supervisor Agent 排序和过滤
↓
保存 topics
```

## 7. 定位工作流

```text
START
↓
Data Agent
↓
Profile Agent
↓
Risk Review Agent
↓
Supervisor Agent 汇总
↓
保存 content_positions
```

## 8. 行业模板如何参与 Agent

Agent 输入不应只包含律师信息，而应包含：

```text
industry_template
client_profile
content_position
topic_request
review_rules
style_rules
forbidden_expressions
```

这样未来从律师迁移到制造业时，不需要重写 Agent，只需要换行业模板。

## 9. 审查 Agent 行业化

律师行业审查：

```text
不能承诺结果
不能暗示胜诉率
不能制造恐慌
不能对具体案件下绝对结论
```

制造业审查：

```text
不能夸大参数
不能虚假承诺交期
不能误导认证能力
不能夸大性能
```

服装业审查：

```text
不能虚假宣传
不能夸大材质效果
不能与品牌调性冲突
```

## 10. 日志必须保存

必须保存：

```text
agent_runs
agent_run_steps
每个 Agent 的输入摘要
每个 Agent 的输出摘要
错误信息
状态
耗时
```

原因：

```text
用来调试质量不稳定的问题。
```
