# 项目状态文档

**最后更新时间**: 2026-05-01  
**当前阶段**: CC3 完成，准备进入 CC4  
**项目状态**: 🟢 正常

---

## 项目概述

**项目名称**: 律师短视频内容策划与文案生成工作台  
**项目类型**: AI Agent 驱动的多行业内容生成平台  
**架构模式**: 受控型多 Agent 架构 (LangGraph.js 编排)

---

## 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Shadcn/ui

### 后端
- **运行时**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI 编排**: LangGraph.js
- **AI SDK**: Vercel AI SDK
- **AI 模型**: OpenAI / Anthropic Claude

### 开发工具
- **包管理器**: npm
- **代码规范**: ESLint + TypeScript
- **版本控制**: Git

---

## Agent Team 配置

### 三人核心团队

| Agent | 模型 | 职责 | 工具权限 |
|-------|------|------|----------|
| **project-agent** | Opus | 项目规划、架构设计、任务拆解、边界控制 | Read, Grep, Glob (只读) |
| **program-agent** | Sonnet | 代码实现、文件创建、API/工作流/Schema 编写 | Read, Write, Edit, Bash, Grep, Glob (完整权限) |
| **review-agent** | Opus | 安全审查、代码质量审查、构建检查、最终验收 | Read, Grep, Glob, Bash (只读+构建) |

### 协作流程
```
project-agent (规划) 
    ↓
program-agent (实现) 
    ↓
review-agent (审查) 
    ↓
program-agent (修复) 
    ↓
review-agent (复审) 
    ↓
输出报告
```

---

## 当前开发阶段

### 阶段 0: 后端骨架审查与修复 (当前)

**目标**: 
- 审查现有后端代码结构
- 修复 TypeScript 类型错误
- 修复 lint 警告
- 确保 `npm run build` 成功
- 确保安全性检查通过

**已完成工作**:
- ✅ 数据库 schema 设计 (多行业架构)
- ✅ CC1: 更新项目原则到 README
- ✅ CC2: 调整数据库 schema 为多行业架构
- ✅ 阶段 0: 后端骨架审查与修复
  - ✅ 修复 Google Fonts 构建问题
  - ✅ 增强 LangGraph 循环控制
  - ✅ 通过 lint 验证 (0 错误, 3 警告)
  - ✅ 通过 build 验证
  - ✅ 通过安全审查

**当前状态**:
- ✅ `npm run lint` 通过
- ✅ `npm run build` 成功
- ✅ 安全审查通过
- ✅ 代码质量良好

---

## 项目文件结构

```
E:/Lawer-Contest/
├── .claude/
│   ├── agents/
│   │   ├── project-agent.md
│   │   ├── program-agent.md
│   │   └── review-agent.md
│   ├── TEAM_README.md
│   └── BACKEND_TEAM_PLAN.md
├── docs/
│   ├── PROJECT_STATUS.md (本文件)
│   ├── TASK_BOARD.md
│   ├── DECISIONS.md
│   ├── ERROR_LOG.md
│   └── NEXT_ACTIONS.md
├── app/
│   └── api/
│       ├── profile/generate/route.ts
│       ├── topics/generate/route.ts
│       ├── scripts/generate/route.ts
│       ├── scripts/review/route.ts
│       └── scripts/rewrite/route.ts
├── lib/
│   ├── agents/
│   │   ├── supervisorAgent.ts
│   │   ├── dataAgent.ts
│   │   ├── profileAgent.ts
│   │   ├── topicAgent.ts
│   │   ├── scriptAgent.ts
│   │   ├── readabilityReviewAgent.ts
│   │   ├── complianceReviewAgent.ts
│   │   └── rewriteAgent.ts
│   ├── graphs/
│   │   ├── profileWorkflowGraph.ts
│   │   ├── topicWorkflowGraph.ts
│   │   └── scriptWorkflowGraph.ts
│   ├── prompts/
│   │   ├── supervisorPrompt.ts
│   │   ├── dataPrompt.ts
│   │   ├── profilePrompt.ts
│   │   ├── topicPrompt.ts
│   │   ├── scriptPrompt.ts
│   │   ├── readabilityReviewPrompt.ts
│   │   ├── complianceReviewPrompt.ts
│   │   └── rewritePrompt.ts
│   ├── schemas/
│   │   ├── agentStateSchema.ts
│   │   ├── profileSchema.ts
│   │   ├── topicSchema.ts
│   │   ├── scriptSchema.ts
│   │   └── reviewSchema.ts
│   └── ai/
│       ├── modelProvider.ts
│       └── structuredOutput.ts
├── types/
│   ├── agent.ts
│   ├── database.ts
│   ├── review.ts
│   └── script.ts
├── supabase/
│   └── schema.sql
├── CLAUDE.md
├── .gitignore
└── package.json
```

---

## 数据库架构

### 核心表结构

1. **clients** - 客户基础信息
2. **industries** - 行业模板库
3. **client_profiles** - 客户档案 (JSON 存储)
4. **industry_templates** - 行业模板 (JSON 存储)
5. **topics** - 选题库
6. **scripts** - 文案库
7. **agent_runs** - Agent 运行记录
8. **agent_logs** - Agent 日志

### 多行业架构特点
- 支持律师、医生、教师等多行业
- 行业模板与客户档案分离
- 客户可选择行业模板或自定义档案

---

## 环境变量配置

### 必需环境变量 (未配置)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI 模型
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**注意**: 当前阶段不接入真实密钥，使用 mock 数据进行开发和测试。

---

## 已知限制

### 当前阶段限制
- ❌ 不实现第二版风格蒸馏功能
- ❌ 不接入真实 AI API 密钥
- ❌ 不执行数据库迁移
- ❌ 不自动执行 git commit
- ❌ 不进行大规模重构

### 自动修复边界
- ✅ 允许自动修复: lint 错误、类型错误、import 路径错误、build 错误
- ⚠️ 连续失败 2 次必须停止，报告给用户

---

## 下一步计划

1. **CC3**: 更新 TypeScript 类型定义
   - 创建 types/database.ts, types/client.ts, types/industry.ts
   - 创建 types/content.ts, types/agent.ts, types/review.ts
   - 确保与数据库 schema 一致

2. **CC4**: 创建 AgentState
3. **CC5**: 创建 Agent 文件
4. **CC6**: 创建 LangGraph 工作流
5. **CC7 + CC8**: 创建 Admin 和 Client API

---

## 项目里程碑

- [x] CC1: 数据库 schema 设计
- [x] CC2: 多行业架构调整
- [x] 阶段 0: 后端骨架审查与修复
- [x] CC3: 更新 TypeScript 类型定义
- [ ] CC4: 创建 AgentState (下一步)
- [ ] 阶段 1: 数据层实现
- [ ] 阶段 2: Agent 实现
- [ ] 阶段 3: LangGraph 工作流实现
- [ ] 阶段 4: API 路由实现
- [ ] 阶段 5: 集成测试
- [ ] 阶段 6: 前端开发
- [ ] 阶段 7: 端到端测试
- [ ] 阶段 8: 部署准备
- [ ] 阶段 9: 上线发布

---

**文档维护**: 每完成一个阶段后更新本文档
