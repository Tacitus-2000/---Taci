# 项目状态文档

**最后更新时间**: 2026-05-07  
**当前版本**: V0.23  
**当前阶段**: 阶段 12 完成，customDirection 传递逻辑修复  
**项目状态**: 🟢 所有功能正常运行

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
- **AI SDK**: Anthropic SDK (@anthropic-ai/sdk)
- **AI 模型**: Claude Sonnet 4.6 (通过中转 API)

### 开发工具
- **包管理器**: npm
- **代码规范**: ESLint + TypeScript
- **版本控制**: Git

---

## 当前开发阶段

### 已完成阶段

#### ✅ 阶段 0-8: 核心功能实现
- 数据库 schema 设计（多行业架构）
- TypeScript 类型定义
- 8 个专业 Agent 实现
- LangGraph 工作流编排
- API 路由实现
- 前端页面开发

#### ✅ 阶段 9: 数据持久化 (V0.18)
- 实现 WorkflowService 和 WorkflowExecutorService
- 集成 agent_runs 和 agent_run_steps 日志记录
- 实现脚本保存到 scripts 表
- 修复 topic_id UUID 类型错误

#### ✅ 阶段 10: 前端集成 (V0.18)
- 创建 /client/generate 页面
- 实现 WorkflowProgress 实时进度组件
- 集成 SSE (Server-Sent Events) 流式更新
- 显示工作流各阶段状态和结果

#### ✅ 阶段 11: API 认证问题修复 (V0.21-V0.22)
- 诊断并彻底修复 API 认证失败问题（两轮调试）
- 第一轮（V0.21）：修复环境变量缓存问题
- 第二轮（V0.22）：移除 Anthropic SDK，使用原生 fetch API
- 根本原因：SDK 的 User-Agent header 与中转 API 不兼容
- 端到端测试通过（188 秒），脚本成功保存到数据库

#### ✅ 阶段 12: customDirection 传递逻辑修复 (V0.23)
- 修复环境变量缓存问题（第三轮）
  - 根本原因：PowerShell 会话环境变量覆盖 `.env.local` 配置
  - 解决方案：在 PowerShell 中设置正确的环境变量
- 修复 customDirection 未传递给 TopicAgent 的问题
  - 问题：用户自定义方向未传递给 TopicAgent，导致生成内容不符合需求
  - 修改文件：agentStateSchema.ts, workflow-executor.service.ts, topicPrompt.ts, topicAgent.ts
  - 验证：TypeScript 编译通过

### 当前状态 (V0.23)

**最新完成**:
- ✅ customDirection 传递逻辑修复（阶段 12）
- ✅ 环境变量优先级问题诊断和解决
- ✅ AgentState Schema 添加 customDirection 字段
- ✅ TopicPrompt 支持用户自定义方向
- ✅ TypeScript 编译验证通过
- ✅ 完整传递链路：API 输入 → WorkflowExecutor → TopicAgent → AI Prompt

**已知问题**:
- ⚠️ TopicAgent 间歇性 JSON 解析失败（已缓解但未根治）
- 📝 选题不持久化（待实现）
- ⚠️ 环境变量优先级：系统环境变量会覆盖 .env.local 配置

---

## 工作流架构

### 6 步端到端工作流

```
1. DataAgent (数据收集)
   ↓
2. ProfileAgent (档案生成)
   ↓
3. TopicAgent (选题生成)
   ↓
4. TopicAgent (选题筛选)
   ↓
5. ScriptAgent (脚本生成)
   ↓
6. RiskReviewAgent (风险审查)
```

### Agent 配置

| Agent | 模型 | 职责 | 输出格式 |
|-------|------|------|----------|
| **DataAgent** | Claude Sonnet 4.6 | 数据验证和收集 | JSON (clientProfile) |
| **ProfileAgent** | Claude Sonnet 4.6 | 客户档案生成 | JSON (profile) |
| **TopicAgent** | Claude Sonnet 4.6 | 选题生成和筛选 | JSON (topics/selectedTopic) |
| **ScriptAgent** | Claude Sonnet 4.6 | 脚本文案生成 | JSON (script) |
| **ReadabilityReviewAgent** | Claude Sonnet 4.6 | 可读性审查 | JSON (review) |
| **RiskReviewAgent** | Claude Sonnet 4.6 | 风险合规审查 | JSON (review) |
| **RewriteAgent** | Claude Sonnet 4.6 | 脚本重写优化 | JSON (rewrittenScript) |

---

## 数据库架构

### 核心表结构

1. **clients** - 客户基础信息
2. **industries** - 行业模板库
3. **client_profiles** - 客户档案 (JSON 存储)
4. **topics** - 选题库
5. **scripts** - 文案库
6. **agent_runs** - Agent 运行记录
7. **agent_run_steps** - Agent 步骤日志

### 数据持久化状态

| 数据类型 | 持久化状态 | 说明 |
|---------|-----------|------|
| 客户档案 | ✅ 已实现 | 保存到 client_profiles 表 |
| 选题 | ❌ 未实现 | 当前不保存到 topics 表 |
| 脚本 | ✅ 已实现 | 保存到 scripts 表 |
| Agent 运行日志 | ✅ 已实现 | 保存到 agent_runs 和 agent_run_steps |

---

## 环境变量配置

### 已配置环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI 模型（中转 API）
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_BASE_URL=https://www.vibecd.cc
LLM_MODEL=claude-sonnet-4-6
```

---

## 已知问题和技术债务

### 🟢 已解决问题

#### 1. API 认证不一致问题 ✅
**症状**:
- 测试脚本（test-api-universal.ts）成功调用 API
- 网页应用（npm run dev）返回 401 Invalid token

**根本原因**:
- 开发服务器启动时缓存了旧的环境变量
- `ANTHROPIC_BASE_URL` 指向了无效的中转 API (`https://www.fucheers.top`)
- 测试脚本硬编码使用了有效的 Base URL (`https://www.vibecd.cc`)

**解决方案**:
1. 确认 `.env.local` 配置正确
2. 重启开发服务器加载新环境变量
3. 验证 API 调用成功

**关键教训**:
- Next.js 开发服务器需要重启才能加载 `.env.local` 的更改
- 环境变量问题需要通过调试端点验证，而不是假设配置正确

### 🟡 非阻塞性问题

#### 2. TopicAgent 间歇性 JSON 解析失败
**症状**: Expected ',' or '}' after property value in JSON at position 3064

**缓解措施**:
- 增强了错误日志（显示响应长度和解析位置）
- 多次重试通常可以成功

**根因**: 未完全确定，可能是 Claude API 响应格式不稳定

#### 3. 选题不持久化
**现状**: TopicAgent 生成的选题不保存到 topics 表

**原因**: 临时 ID（"topic-1"）不是有效 UUID，会导致数据库错误

**解决方案**: 当前设置 topicId 为 undefined/null

---

## 验证命令

### TypeScript 编译验证
```bash
cd lawyer-content-platform && npx tsc --noEmit
```

### 端到端工作流测试
```bash
cd lawyer-content-platform && npx tsx scripts/test-e2e-workflow.ts
```

### 数据库持久化验证
```bash
cd lawyer-content-platform && npx tsx scripts/check-script-saved.ts
```

### API Key 验证（通用）
```bash
cd lawyer-content-platform && npx tsx scripts/test-api-universal.ts
```

---

## 项目文件结构

```
E:/Lawer-Contest/
├── lawyer-content-platform/
│   ├── app/
│   │   ├── api/
│   │   │   ├── client/
│   │   │   │   ├── generate/route.ts (SSE 工作流 API)
│   │   │   │   └── profile/route.ts
│   │   │   └── admin/
│   │   └── client/
│   │       └── generate/page.tsx (前端生成页面)
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── dataAgent.ts
│   │   │   ├── profileAgent.ts
│   │   │   ├── topicAgent.ts
│   │   │   ├── scriptAgent.ts
│   │   │   ├── readabilityReviewAgent.ts
│   │   │   ├── riskReviewAgent.ts
│   │   │   └── rewriteAgent.ts
│   │   ├── services/
│   │   │   ├── workflow.service.ts (工作流编排)
│   │   │   └── workflow-executor.service.ts (工作流执行)
│   │   ├── ai/
│   │   │   ├── anthropic.ts (Claude API 客户端)
│   │   │   └── client.ts (AI 客户端封装)
│   │   └── prompts/
│   ├── scripts/
│   │   ├── test-e2e-workflow.ts (端到端测试)
│   │   ├── check-script-saved.ts (数据库验证)
│   │   └── test-api-universal.ts (API Key 验证)
│   ├── types/
│   │   ├── agent.ts
│   │   ├── database.ts
│   │   └── workflow.ts
│   └── supabase/
│       └── schema.sql
├── docs/
│   ├── PROJECT_STATUS.md (本文件)
│   ├── TASK_BOARD.md
│   ├── STAGE_LOG.md
│   └── NEXT_CONTEXT.md
└── CLAUDE.md (用户维护的项目规则)
```

---

## 项目里程碑

- [x] 阶段 0: 后端骨架审查与修复
- [x] 阶段 1-3: 数据层和 Agent 实现
- [x] 阶段 4-6: LangGraph 工作流和 API 实现
- [x] 阶段 7-8: 前端开发和集成测试
- [x] 阶段 9: 数据持久化实现
- [x] 阶段 10: 前端集成完成
- [x] 阶段 11: API 认证问题修复
- [ ] 阶段 12: 生产环境部署准备
- [ ] 阶段 13: 上线发布

---

**文档维护**: 由 AI 在每次会话结束时更新
