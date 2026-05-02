# LangGraph 工作流

本目录包含 3 个基于 LangGraph 的多 Agent 工作流，用于律师内容生成平台。

## 工作流概览

### 1. Profile Workflow (档案生成工作流)
**复杂度**: 简单  
**用途**: 验证架构可行性，生成客户内容定位档案

**流程**:
```
START → data → profile → riskReview → END
```

**节点说明**:
- `data`: 数据采集节点，加载行业模板和客户档案
- `profile`: 档案生成节点，生成内容定位档案
- `riskReview`: 风险审查节点，检查合规性

**使用示例**:
```typescript
import { executeProfileWorkflow } from '@/lib/workflows';

const result = await executeProfileWorkflow({
  clientId: 'uuid-here',
  industryId: 'uuid-here',
});
```

---

### 2. Topic Workflow (选题生成工作流)
**复杂度**: 中等  
**用途**: 基于档案生成内容选题

**流程**:
```
START → data → profile → topic → riskReview → END
```

**节点说明**:
- `data`: 数据采集节点
- `profile`: 档案生成节点
- `topic`: 选题生成节点，基于档案生成候选选题
- `riskReview`: 风险审查节点

**使用示例**:
```typescript
import { executeTopicWorkflow } from '@/lib/workflows';

const result = await executeTopicWorkflow({
  clientId: 'uuid-here',
  industryId: 'uuid-here',
});
```

---

### 3. Script Workflow (完整文案生成工作流)
**复杂度**: 复杂  
**用途**: 完整的文案生成流程，包含并行审查和重写循环

**流程**:
```
START → data → profile → topic → script → parallelReview → supervisor
                                              ↓                ↓
                                         [readability]    [决策]
                                         [risk]              ↓
                                              ↓          rewrite? → END
                                              └──────────────┘
```

**节点说明**:
- `data`: 数据采集节点
- `profile`: 档案生成节点
- `topic`: 选题生成节点
- `script`: 文案生成节点，生成文案草稿
- `parallelReview`: 并行审查节点，同时执行可读性和风险审查
- `supervisor`: 监督节点，决定是否需要重写
- `rewrite`: 重写节点，根据审查意见重写文案

**特性**:
- ✅ 并行审查 (Promise.all)
- ✅ 重写循环 (最多 2 次)
- ✅ 条件路由 (通过/重写)
- ✅ 完整的错误处理

**使用示例**:
```typescript
import { executeScriptWorkflow } from '@/lib/workflows';

const result = await executeScriptWorkflow({
  clientId: 'uuid-here',
  industryId: 'uuid-here',
  maxRewriteCount: 2, // 可选，默认 2
});
```

---

## 统一执行器

使用统一的执行器可以动态选择工作流类型：

```typescript
import { executeWorkflow, type WorkflowType } from '@/lib/workflows';

const type: WorkflowType = 'script'; // 'profile' | 'topic' | 'script'

const result = await executeWorkflow(type, {
  clientId: 'uuid-here',
  industryId: 'uuid-here',
});
```

---

## 架构设计

### GraphAnnotation 配置

所有工作流使用相同的 `GraphAnnotation` 定义，基于 `AgentState`：

```typescript
const GraphAnnotation = Annotation.Root({
  // 基础字段
  clientId: Annotation<string>({ value: (left, right) => right ?? left }),
  industryId: Annotation<string>({ value: (left, right) => right ?? left }),
  
  // 数据字段
  industryTemplate: Annotation<Record<string, unknown> | undefined>({ ... }),
  clientProfile: Annotation<Record<string, unknown> | undefined>({ ... }),
  contentPosition: Annotation<Record<string, unknown> | undefined>({ ... }),
  selectedTopic: Annotation<Record<string, unknown> | undefined>({ ... }),
  draftScript: Annotation<{...} | undefined>({ ... }),
  
  // 数组字段 - 使用 reducer 合并
  reviews: Annotation<Array<{...}>>({
    reducer: (left, right) => [...(left || []), ...(right || [])],
    default: () => [],
  }),
  logs: Annotation<string[]>({
    reducer: (left, right) => [...(left || []), ...(right || [])],
    default: () => [],
  }),
  
  // 控制字段
  rewriteCount: Annotation<number>({ value: ..., default: () => 0 }),
  maxRewriteCount: Annotation<number>({ value: ..., default: () => 3 }),
  status: Annotation<'pending' | 'running' | 'completed' | 'failed'>({ ... }),
  error: Annotation<string | undefined>({ ... }),
  startedAt: Annotation<string | undefined>({ ... }),
  completedAt: Annotation<string | undefined>({ ... }),
});
```

### 数组字段的 Reducer

对于 `reviews` 和 `logs` 数组字段，使用自定义 reducer 实现追加合并：

```typescript
reducer: (left, right) => {
  if (!left) return right || [];
  if (!right) return left;
  return [...left, ...right];
}
```

这确保了每个节点返回的审查结果和日志都会被正确追加到状态中。

---

## 并行审查实现

在 `scriptWorkflowGraph.ts` 中，`parallelReviewNode` 使用 `Promise.all` 实现并行审查：

```typescript
async function parallelReviewNode(state: typeof GraphAnnotation.State) {
  const readabilityAgent = createReadabilityReviewAgent();
  const riskAgent = createRiskReviewAgent();

  // 并行执行
  const [readabilityUpdate, riskUpdate] = await Promise.all([
    readabilityAgent.execute(state as AgentState),
    riskAgent.execute(state as AgentState),
  ]);

  // 合并结果
  return {
    reviews: [...(readabilityUpdate.reviews || []), ...(riskUpdate.reviews || [])],
    logs: [...logs, ...(readabilityUpdate.logs || []), ...(riskUpdate.logs || [])],
  };
}
```

---

## 重写循环实现

### 条件边

使用 `addConditionalEdges` 实现条件路由：

```typescript
.addConditionalEdges('supervisor', shouldRewrite, {
  rewrite: 'rewrite',
  end: '__end__',
})
```

### 决策函数

```typescript
function shouldRewrite(state: typeof GraphAnnotation.State): 'rewrite' | 'end' {
  // 检查错误
  if (state.error || state.status === 'failed') return 'end';
  
  // 检查完成状态
  if (state.status === 'completed') return 'end';
  
  // 检查审查结果
  const allPassed = state.reviews.every((r) => r.passed);
  if (allPassed) return 'end';
  
  // 检查重写次数
  if (state.rewriteCount >= state.maxRewriteCount) return 'end';
  
  // 需要重写
  return 'rewrite';
}
```

### 重写后重新审查

```typescript
.addEdge('rewrite', 'parallelReview'); // 重写后回到并行审查
```

---

## 错误处理

所有节点都包含完整的错误处理：

```typescript
async function someNode(state: typeof GraphAnnotation.State) {
  const logs: string[] = [...(state.logs || [])];
  
  try {
    // 节点逻辑
    const agent = createSomeAgent();
    const update = await agent.execute(state as AgentState);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    logs.push(`[NodeName] 执行失败: ${errorMessage}`);
    
    return {
      logs,
      error: `节点执行失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}
```

---

## 日志记录

每个节点都会记录详细的执行日志：

```typescript
logs.push('[NodeName] 开始执行');
logs.push('[NodeName] 前置条件验证通过');
logs.push('[NodeName] 执行完成');
```

查看日志：

```typescript
const result = await executeScriptWorkflow({ ... });
if (result.result) {
  console.log('执行日志:');
  result.result.logs.forEach(log => console.log(log));
}
```

---

## 文件结构

```
lib/workflows/
├── profileWorkflowGraph.ts   # 档案生成工作流
├── topicWorkflowGraph.ts     # 选题生成工作流
├── scriptWorkflowGraph.ts    # 完整文案生成工作流
├── index.ts                  # 统一导出
├── examples.ts               # 使用示例
└── README.md                 # 本文档
```

---

## 技术栈

- **LangGraph**: @langchain/langgraph ^1.2.9
- **TypeScript**: ^5
- **Zod**: ^4.4.1 (用于状态验证)

---

## 注意事项

1. **不修改 Agent 文件**: 工作流只调用现有的 Agent，不修改其实现
2. **不修改 agentStateSchema.ts**: 状态定义保持不变
3. **数组字段使用 reducer**: 确保正确合并审查结果和日志
4. **错误处理**: 所有节点都包含 try-catch 错误处理
5. **类型安全**: 使用 TypeScript 确保类型安全

---

## 测试

运行示例代码：

```bash
# 需要先编译 TypeScript
npm run build

# 然后运行示例
node dist/lib/workflows/examples.js
```

或者在代码中导入使用：

```typescript
import { runAllExamples } from '@/lib/workflows/examples';

await runAllExamples();
```

---

## 下一步

- [ ] 添加单元测试
- [ ] 添加集成测试
- [ ] 添加性能监控
- [ ] 添加工作流可视化
- [ ] 支持工作流暂停/恢复
- [ ] 支持工作流版本管理
