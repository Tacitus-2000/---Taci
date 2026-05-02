# 架构决策记录 (ADR)

**文档目的**: 记录项目中的重要技术决策、架构选型、设计原则和禁止事项

---

## 核心架构决策

### ADR-001: 采用受控型多 Agent 架构

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: 用户 + project-agent

**背景**:
- 需要构建 AI 驱动的内容生成工作台
- 需要支持复杂的多步骤工作流 (账号定位 → 选题 → 文案 → 审查 → 改写)
- 需要可追踪、可调试、可扩展的 AI 系统

**决策**:
采用受控型多 Agent 架构，使用 LangGraph.js 编排工作流

**理由**:
- ✅ 每个 Agent 职责单一，易于维护
- ✅ 工作流可视化、可追踪
- ✅ 支持复杂的条件分支和循环
- ✅ 易于扩展新的 Agent 和工作流
- ✅ 所有 Agent 输出结构化 JSON，便于存储和展示

**替代方案**:
- ❌ 单一大模型 Prompt: 难以控制、难以调试
- ❌ 自主型 Agent (AutoGPT): 不可控、成本高

**影响**:
- 需要定义 8 个专业 Agent
- 需要实现 3 个 LangGraph 工作流
- 需要设计 AgentState 状态管理
- 需要实现 Agent 日志和运行记录

---

### ADR-002: 前后台分离架构

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: 用户

**背景**:
- Admin 后台需要展示 Agent 工作细节
- Client 前台只需要展示最终结果

**决策**:
- **Admin 后台**: 展示 Agent 日志、工作流状态、中间结果
- **Client 前台**: 只展示最终生成的内容，不展示 Agent 细节

**理由**:
- ✅ 用户体验更好 (Client 不需要理解 Agent 概念)
- ✅ 安全性更高 (不暴露内部实现)
- ✅ 灵活性更高 (可以独立调整前后台)

**影响**:
- API 需要返回两种格式的数据
- 前端需要实现两套页面

---

### ADR-003: 多行业架构设计

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: 用户 + project-agent

**背景**:
- 第一阶段服务刑事律师
- 未来需要扩展到医生、教师等行业

**决策**:
采用 `clients + industries + client_profiles + industry_templates` 四表架构

**数据库设计**:
```sql
clients (id, name, industry_id)
industries (id, name, description)
client_profiles (id, client_id, profile_data JSONB)
industry_templates (id, industry_id, template_data JSONB)
```

**理由**:
- ✅ 支持多行业扩展
- ✅ 行业模板与客户档案分离
- ✅ 客户可选择行业模板或自定义档案
- ✅ 易于维护和更新行业模板

**影响**:
- 数据库 schema 已调整
- API 需要支持行业模板查询
- 前端需要支持行业选择

---

### ADR-004: 使用 LangGraph.js 而非 LangChain.js

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: project-agent

**背景**:
- 需要编排复杂的多 Agent 工作流
- 需要支持条件分支、循环、状态管理

**决策**:
使用 LangGraph.js 而非 LangChain.js

**理由**:
- ✅ LangGraph 专为多 Agent 工作流设计
- ✅ 支持有向图编排，更灵活
- ✅ 内置状态管理 (channels)
- ✅ 支持条件路由和循环
- ✅ 可视化工作流

**替代方案**:
- ❌ LangChain.js: 更适合单一 Agent 场景
- ❌ 自研编排引擎: 开发成本高

**影响**:
- 需要学习 LangGraph.js API
- 需要定义 StateGraph 和 channels
- 需要实现 node 和 edge 函数

---

### ADR-005: 使用 Zod 进行结构化输出验证

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: project-agent

**背景**:
- 所有 Agent 输出需要结构化 JSON
- 需要确保 AI 输出符合预期格式

**决策**:
使用 Zod Schema 定义所有 Agent 输出格式，并使用 Vercel AI SDK 的 `generateObject` 进行验证

**理由**:
- ✅ 类型安全 (TypeScript)
- ✅ 运行时验证
- ✅ 自动生成 JSON Schema
- ✅ 易于维护和扩展

**影响**:
- 需要为每个 Agent 定义 Zod Schema
- 需要在 Agent 函数中使用 `generateObject`

---

### ADR-006: 三人 Agent Team 协作模式

**日期**: 2026-01-XX  
**状态**: ✅ 已采纳  
**决策者**: 用户

**背景**:
- 需要高效的开发协作流程
- 需要确保代码质量和安全性

**决策**:
采用三人 Agent Team 协作模式:
- **project-agent** (Opus): 规划、设计、任务拆解
- **program-agent** (Sonnet): 代码实现
- **review-agent** (Opus): 审查、验收

**协作流程**:
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

**理由**:
- ✅ 职责分离，避免混乱
- ✅ Opus 负责高价值任务 (规划、审查)
- ✅ Sonnet 负责高频任务 (编码)，成本更低
- ✅ 双重审查机制，确保质量

**影响**:
- 需要定义 3 个 Agent 的职责边界
- 需要定义自动推进范围和必须暂停的情况
- 需要维护 6 个项目管理文档

---

## 技术选型

### 前端技术栈

| 技术 | 选型 | 理由 |
|------|------|------|
| 框架 | Next.js 15 | App Router、Server Actions、性能优化 |
| 语言 | TypeScript | 类型安全、开发体验 |
| 样式 | Tailwind CSS | 快速开发、一致性 |
| UI 组件 | Shadcn/ui | 高质量、可定制 |

### 后端技术栈

| 技术 | 选型 | 理由 |
|------|------|------|
| 运行时 | Next.js API Routes | 与前端集成、部署简单 |
| 数据库 | Supabase (PostgreSQL) | 开源、实时订阅、Auth |
| AI 编排 | LangGraph.js | 多 Agent 工作流 |
| AI SDK | Vercel AI SDK | 结构化输出、流式响应 |
| AI 模型 | OpenAI / Anthropic | 高质量、稳定 |

### 开发工具

| 工具 | 选型 | 理由 |
|------|------|------|
| 包管理器 | npm | 标准、稳定 |
| 代码规范 | ESLint + TypeScript | 代码质量 |
| 版本控制 | Git | 标准 |

---

## 设计原则

### 1. 职责单一原则
- 每个 Agent 只负责一个明确的任务
- 每个 API 路由只负责一个工作流
- 每个 Schema 只定义一个数据结构

### 2. 可追踪原则
- 所有 Agent 运行记录存储到 `agent_runs` 表
- 所有 Agent 日志存储到 `agent_logs` 表
- 所有工作流状态可查询

### 3. 结构化输出原则
- 所有 Agent 输出必须是结构化 JSON
- 所有 Schema 使用 Zod 定义
- 所有 AI 调用使用 `generateObject`

### 4. 安全优先原则
- 不在代码中硬编码密钥
- 使用 `.env.local` 存储敏感信息
- `.gitignore` 必须包含 `.env.local`
- 所有用户输入必须验证

### 5. 渐进式开发原则
- 先骨架后实现
- 先 mock 后真实
- 先单元后集成
- 先本地后部署

---

## 禁止事项

### 开发阶段禁止事项

#### 阶段 0 (当前) 禁止:
- ❌ 不实现第二版风格蒸馏功能
- ❌ 不接入真实 AI API 密钥
- ❌ 不执行数据库迁移
- ❌ 不自动执行 git commit
- ❌ 不进行大规模重构
- ❌ 不创建前端页面

#### 永久禁止:
- ❌ 不在代码中硬编码密钥
- ❌ 不提交 `.env.local` 到 Git
- ❌ 不使用 `any` 类型 (除非必要)
- ❌ 不跳过 TypeScript 类型检查
- ❌ 不跳过 ESLint 检查

### Agent 权限边界

#### project-agent 禁止:
- ❌ 不能创建或修改文件
- ❌ 不能执行 Bash 命令 (除非只读)
- ❌ 只能使用 Read, Grep, Glob 工具

#### program-agent 禁止:
- ❌ 不能修改 Agent 定义文件 (.claude/agents/)
- ❌ 不能修改项目管理文档 (docs/)
- ❌ 不能执行破坏性命令 (rm -rf, git reset --hard)

#### review-agent 禁止:
- ❌ 不能创建或修改业务代码
- ❌ 只能执行只读命令和构建命令
- ❌ 只能使用 Read, Grep, Glob, Bash (只读+构建)

---

## 自动推进范围

### 允许自动修复的错误:
- ✅ TypeScript 类型错误
- ✅ ESLint 警告
- ✅ Import 路径错误
- ✅ 缺少依赖
- ✅ 构建错误

### 必须暂停的情况:
1. ❌ 连续失败 2 次
2. ❌ 需要修改数据库 schema
3. ❌ 需要修改 Agent 定义
4. ❌ 需要修改项目管理文档
5. ❌ 需要安装新的 npm 包
6. ❌ 需要修改 package.json
7. ❌ 需要修改 .gitignore
8. ❌ 需要修改 CLAUDE.md
9. ❌ 需要执行破坏性命令
10. ❌ 需要接入真实 API 密钥
11. ❌ 发现安全漏洞
12. ❌ 发现架构设计问题

---

## 决策变更流程

1. **提出变更**: 在本文档中记录变更提案
2. **评估影响**: 分析对现有代码和架构的影响
3. **用户确认**: 等待用户批准
4. **更新文档**: 更新本文档和相关文档
5. **执行变更**: program-agent 实施变更
6. **验证变更**: review-agent 验证变更

---

**文档维护**: 每次重大决策后更新本文档
