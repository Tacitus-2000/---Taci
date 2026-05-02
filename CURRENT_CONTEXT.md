# 项目当前上下文 - 供新对话窗口使用 (V2)

**生成时间**: 2026-05-01  
**版本**: V2（增量更新）  
**项目路径**: E:\Lawer-Contest  
**工作目录**: E:\Lawer-Contest\lawyer-content-platform

---

## 目录结构说明

### 根目录 (E:\Lawer-Contest\)
```
E:\Lawer-Contest\
├── .gitignore              # Git 忽略规则
├── CLAUDE.md               # 项目主文档
├── CURRENT_CONTEXT.md      # 本文档（供新对话窗口使用）
├── README.md               # 项目说明
├── docs/                   # 项目文档目录
├── supabase/               # Supabase 配置和迁移
├── .claude/                # Claude 配置（agents 定义）
└── lawyer-content-platform/ # 实际工作目录（Next.js 项目）
```

**重要**: 
- ✅ **根目录的旧 Next.js 项目文件已清理**（2026-05-01）
- ✅ 所有开发工作都在 `lawyer-content-platform/` 子目录中进行
- ✅ 前端文件（Cursor 做的）都在 `lawyer-content-platform/app/` 中，完好无损

### 实际工作目录 (E:\Lawer-Contest\lawyer-content-platform\)
```
lawyer-content-platform/
├── app/                    # Next.js 应用（前端页面）
├── lib/
│   ├── agents/            # Agent 实现（CC5 产出）
│   ├── workflows/         # LangGraph 工作流（CC6 产出）
│   ├── schemas/           # Schema 定义（CC4 产出）
│   └── graph/             # 旧工作流（待重构）
├── types/                 # TypeScript 类型定义（CC3 产出）
├── components/            # React 组件
├── public/                # 静态资源
├── package.json           # 依赖配置
└── next.config.ts         # Next.js 配置
```

---

## 项目概述

这是一个律师内容生成平台，使用 Next.js + Supabase + LangGraph 构建。项目正在进行**数据库架构重构**（从单一律师档案改为多行业多客户架构）和**Agent 系统重构**（从 LangGraph 工作流改为独立 Agent 架构）。

### 核心技术栈
- **前端**: Next.js 15.1.6, React 19, TypeScript
- **后端**: Supabase (PostgreSQL)
- **AI**: LangChain, LangGraph, OpenAI API
- **样式**: Tailwind CSS, shadcn/ui

---

## 项目协作模式：Agent Team

**重要**: 本项目要求使用**三人 Agent Team 协作模式**完成所有开发任务。

### Agent Team 结构

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

### Agent 定义文件位置
- `E:\Lawer-Contest\.claude\agents\project-agent.md` - 负责任务规划和拆解
- `E:\Lawer-Contest\.claude\agents\program-agent.md` - 负责代码实现
- `E:\Lawer-Contest\.claude\agents\review-agent.md` - 负责代码审查

### 重要说明
- **所有 CC 任务都必须使用 Agent Team 协作模式**
- 不要一个人完成所有工作（规划、实现、审查）
- 必须显式调用 Agent 并输出各阶段的文档

### 如何调用项目定义的 Agent
- 使用 `general-purpose` agent + 明确的角色 prompt
- 在 prompt 中指定按照对应 agent 的规则工作
- 已验证可行（CC3-CC6 均使用此方式）

---

## 当前项目状态

### ✅ 已完成的工作

#### ✅ 阶段 0：代码审查与修复（已完成）
- 修复了 Google Fonts 网络超时问题
- 修复了 LangGraph 无限循环风险
- 创建了项目管理文档（TASK_BOARD.md, ERROR_LOG.md, NEXT_ACTIONS.md 等）
- 构建验证通过（lint: 0 错误 3 警告，build: 成功）

#### ✅ CC1：数据库 Schema 设计（已完成）
- 设计了多行业多客户架构
- 创建了 11 个数据库表
- 关键字段：`visible_to_client`, `internal_notes`
- 使用 `ClientProfile` 替代 `LawyerProfile`

#### ✅ CC2：数据库 Schema 实施（已完成）
- 执行了数据库迁移
- 所有表创建成功
- 验证通过

#### ✅ CC3：TypeScript 类型定义（已完成）
- 创建了 6 个类型定义文件，共 1,346 行代码
- 文件列表：
  - `types/database.ts` (340 行) - 14 个数据库表类型
  - `types/client.ts` (95 行) - Client 和 ClientProfile 类型
  - `types/industry.ts` (130 行) - Industry 和 IndustryTemplate 类型
  - `types/content.ts` (195 行) - Content, Script 类型
  - `types/agent.ts` (220 行) - Agent 运行类型
  - `types/review.ts` (130 行) - 审查类型
- 构建验证通过

#### ✅ CC4：AgentState Schema（已完成）
- 创建了 `lib/schemas/agentStateSchema.ts` (135 行)
- 支持 15 个字段（clientId, industryId, status, industryTemplate, clientProfile, contentPosition, selectedTopic, draftScript, reviews, rewriteCount, maxRewriteCount, logs, error, startedAt, completedAt）
- 包含 Zod 验证和工具函数
- 构建验证通过

#### ✅ CC3 和 CC4 审查（已完成 - 2026-05-01）

**审查方式**: 使用 Agent Team 协作模式

**审查流程**:
1. ✅ project-agent 规划审查任务
2. ✅ review-agent 审查 CC3（6个类型定义文件）
3. ✅ review-agent 审查 CC4（AgentState Schema）

**审查结论**: ✅ **两个阶段均通过审查**

**审查报告**: `E:\Lawer-Contest\docs\CC3_CC4_REVIEW_REPORT.md`

**关键发现**:
- ✅ 代码质量优秀，类型定义完整
- ✅ 符合项目约定（visible_to_client, internal_notes, ClientProfile）
- ✅ 构建验证通过（TypeScript 编译、Next.js 构建）
- ⚠️ 发现 AgentType 在 database.ts 和 agent.ts 中定义不一致（建议在下一个迭代中修复）
- ⚠️ 3 个 ESLint 警告（非类型文件，不影响功能）

#### ✅ CC5：创建 8 个 Agent 文件（已完成 - 2026-05-01）

**执行方式**: Agent Team 协作模式

**执行流程**:
1. ✅ project-agent 规划（30+ 页详细文档）
2. ✅ program-agent 实现（8 个 Agent + 1 个索引文件）
3. ✅ review-agent 审查（通过）

**创建的 Agent**:
1. `lib/agents/supervisorAgent.ts` (210 行) - 工作流协调
2. `lib/agents/dataAgent.ts` (150 行) - 数据采集
3. `lib/agents/profileAgent.ts` (200 行) - 档案生成
4. `lib/agents/topicAgent.ts` (150 行) - 选题生成
5. `lib/agents/scriptAgent.ts` (200 行) - 文案生成
6. `lib/agents/readabilityReviewAgent.ts` (180 行) - 可读性审查
7. `lib/agents/riskReviewAgent.ts` (220 行) - 风险审查
8. `lib/agents/rewriteAgent.ts` (230 行) - 文案重写
9. `lib/agents/index.ts` (30 行) - 统一导出

**总代码量**: 约 1,200 行代码，46.5KB

**完成报告**: `E:\Lawer-Contest\docs\CC5_COMPLETION_REPORT.md`

**关键特性**:
- ✅ 统一的接口设计（execute 方法）
- ✅ 完整的日志记录和错误处理
- ✅ Mock 数据真实可信
- ✅ 所有 Agent 使用 AgentState 进行状态传递

#### ✅ CC6：创建 3 个 LangGraph 工作流（已完成 - 2026-05-01）

**执行方式**: Agent Team 协作模式

**执行流程**:
1. ✅ project-agent 规划（40+ 页详细文档）
2. ✅ program-agent 实现（3 个工作流 + 共享 GraphAnnotation）
3. ⚠️ review-agent 审查（发现 4 个问题）
4. ✅ program-agent 修复（所有问题已修复）
5. ✅ review-agent 复审（通过）

**创建的工作流**:
1. `lib/workflows/graphAnnotation.ts` (100 行) - 共享的 GraphAnnotation 定义
2. `lib/workflows/profileWorkflowGraph.ts` (180 行) - 档案生成工作流
3. `lib/workflows/topicWorkflowGraph.ts` (190 行) - 选题生成工作流
4. `lib/workflows/scriptWorkflowGraph.ts` (350 行) - 完整文案生成工作流
5. `lib/workflows/index.ts` (110 行) - 统一导出
6. `lib/workflows/examples.ts` (100 行) - 使用示例

**总代码量**: 约 1,000 行代码，30KB

**完成报告**: `E:\Lawer-Contest\docs\CC6_COMPLETION_REPORT_V2.md`（修订版）

**关键特性**:
- ✅ 使用 LangGraph Annotation API
- ✅ 实现并行审查（Promise.all）
- ✅ 实现重写循环（最多 2 次）
- ✅ 多重保护机制防止无限循环
- ✅ 完整的错误处理

**修复的问题**:
1. ✅ rewriteCount 未递增 - 已在 rewriteNode 中显式递增
2. ✅ 并行审查结果合并逻辑错误 - 已修复为只返回新增结果
3. ✅ 节点级错误处理不完整 - 已为所有节点添加 try-catch
4. ✅ GraphAnnotation 定义重复 - 已提取到共享文件

---

## ⚠️ 当前存在的问题

### 🔴 严重问题：旧工作流构建错误

**错误位置**: `lib/graph/workflow.ts:78`

**错误信息**:
```
Type error: Argument of type '"positioning"' is not assignable to parameter of type '"__start__" | "__end__"'.
```

**原因**: 
- 旧工作流使用 LangGraph 的 channels API（旧版本）
- 新工作流使用 Annotation API（新版本）
- 两者不兼容

**影响**: 
- ❌ 阻塞完整构建（`npm run build` 失败）
- ❌ 无法部署到生产环境
- ✅ 不影响 CC6 新工作流的功能

**来源**: 预先存在（不是 CC6 引入）

**修复建议**:
- **选项 1**: 将旧工作流迁移到 Annotation API（预计 2-3 小时）
- **选项 2**: 删除旧工作流（如果不再使用）
- **选项 3**: 暂时保留，标记为 deprecated

**优先级**: P0（必须在部署前修复）

### 🟢 次要问题：ESLint 警告

**位置**: 
- `app/api/health/route.ts:9` - 未使用的变量 `_request`
- `lib/ai/mock.ts:23` - 未使用的变量 `_options`
- `lib/ai/mock.ts:28` - 未使用的变量 `_userMessage`

**来源**: 预先存在

**影响**: 非阻塞

**优先级**: P2（建议修复）

---

## 🆕 新增约束规则（V2 新增）

### 错误报告强制约束规则

**创建日期**: 2026-05-01  
**优先级**: P0（最高）

**核心原则**: **所有错误都必须被记录和报告，无论其来源、严重程度或是否在当前任务范围内。**

**强制要求**:
1. 运行完整的构建验证（lint + type-check + build）
2. 记录所有错误和警告（包括旧代码的）
3. 区分新错误和旧错误
4. 评估严重程度和影响
5. 提供修复建议
6. 报告中必须包含"错误状态"部分

**禁止行为**:
- ❌ 隐藏错误
- ❌ 忽略错误
- ❌ 模糊表述（如"基本通过"）
- ❌ 选择性报告
- ❌ 延迟报告

**详细文档**: 
- `E:\Lawer-Contest\docs\ERROR_REPORTING_CONSTRAINT.md`
- 记忆位置: `C:\Users\56834\.claude\projects\C--Users-56834\memory\feedback_error_reporting_mandatory.md`

**背景**: 
- 在 CC6 初版报告中，未明确报告旧工作流的构建错误
- 报告中写"✅ Build 检查通过"，但实际上构建失败
- 这是严重的疏忽，违反了透明原则

---

## 下一步工作：CC7-CC8

### CC7：创建 Admin API（下一个任务）

**目标**: 创建后台管理 API

**待创建路由**（7 个）:
- `/api/admin/clients` - 客户管理
- `/api/admin/client-profiles` - 客户档案管理
- `/api/admin/topics` - 选题管理
- `/api/admin/scripts` - 文案管理
- `/api/admin/reviews` - 审查管理
- `/api/admin/agent-runs` - Agent 运行记录
- `/api/admin/prompts` - Prompt 管理

**要求**:
- Admin API 可以返回完整数据
- 包含 internal_notes 和所有字段
- 使用 Agent Team 协作模式完成

**预计工作量**: 2-3 小时

### CC8：创建 Client API

**目标**: 创建客户端 API

**待创建路由**（7 个）:
- `/api/client/profile` - 客户档案
- `/api/client/scripts` - 文案列表
- `/api/client/generate` - 生成文案
- `/api/client/topics` - 选题列表
- `/api/client/calendar` - 内容日历
- `/api/client/feedback` - 反馈提交
- `/api/client/style-reference` - 风格参考

**要求**:
- 只返回 `visible_to_client = true` 的数据
- 不返回 prompt、agent steps、internal review detail
- 只返回当前 client_id 的数据

**预计工作量**: 2-3 小时

---

## 关键文件路径

### 项目文档
- `E:\Lawer-Contest\CLAUDE.md` - 项目主文档
- `E:\Lawer-Contest\CURRENT_CONTEXT.md` - 本文档（V2）
- `E:\Lawer-Contest\docs\AGENTS.md` - Agent Team 工作规则
- `E:\Lawer-Contest\docs\ERROR_REPORTING_CONSTRAINT.md` - 错误报告约束规则（新增）
- `E:\Lawer-Contest\docs\PROJECT_STATUS.md` - 项目状态
- `E:\Lawer-Contest\docs\TASK_BOARD.md` - 任务看板

### 完成报告
- `E:\Lawer-Contest\docs\CC3_CC4_REVIEW_REPORT.md` - CC3 和 CC4 审查报告
- `E:\Lawer-Contest\docs\CC5_COMPLETION_REPORT.md` - CC5 完成报告
- `E:\Lawer-Contest\docs\CC6_COMPLETION_REPORT_V2.md` - CC6 完成报告（修订版）
- `E:\Lawer-Contest\docs\PROJECT_PROGRESS_SUMMARY.md` - 项目进度总结

### 数据库相关
- `E:\Lawer-Contest\supabase\migrations\20250101000000_multi_industry_schema.sql` - 数据库迁移文件

### 类型定义（CC3 产出）
- `E:\Lawer-Contest\lawyer-content-platform\types\database.ts`
- `E:\Lawer-Contest\lawyer-content-platform\types\client.ts`
- `E:\Lawer-Contest\lawyer-content-platform\types\industry.ts`
- `E:\Lawer-Contest\lawyer-content-platform\types\content.ts`
- `E:\Lawer-Contest\lawyer-content-platform\types\agent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\types\review.ts`

### AgentState Schema（CC4 产出）
- `E:\Lawer-Contest\lawyer-content-platform\lib\schemas\agentStateSchema.ts`

### Agent 实现（CC5 产出）
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\supervisorAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\dataAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\profileAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\topicAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\scriptAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\readabilityReviewAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\riskReviewAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\rewriteAgent.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\agents\index.ts`

### LangGraph 工作流（CC6 产出）
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\graphAnnotation.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\profileWorkflowGraph.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\topicWorkflowGraph.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\scriptWorkflowGraph.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\index.ts`
- `E:\Lawer-Contest\lawyer-content-platform\lib\workflows\examples.ts`

### Agent 定义
- `E:\Lawer-Contest\.claude\agents\project-agent.md`
- `E:\Lawer-Contest\.claude\agents\program-agent.md`
- `E:\Lawer-Contest\.claude\agents\review-agent.md`

---

## 重要规则和约定

### 1. Agent Team 协作模式（必须遵守）
- **所有开发任务都必须使用 Agent Team**
- 规划 → 实现 → 审查 → 修复 → 复审
- 每个阶段都要输出文档

### 2. 错误报告强制约束（V2 新增，必须遵守）
- **所有错误都必须被记录和报告**
- 区分新错误和旧错误
- 评估严重程度和影响
- 提供修复建议
- 不得隐藏、忽略或模糊表述

### 3. 数据库字段约定
- 所有表都必须包含 `visible_to_client: boolean` 字段
- 所有表都必须包含 `internal_notes: text` 字段
- 使用 `ClientProfile` 而非 `LawyerProfile`

### 4. 代码质量要求
- 使用 `unknown` 而非 `any`
- 所有代码必须通过 `npm run lint`（0 错误）
- 所有代码必须通过 `npm run build`

### 5. 安全性要求
- 不得泄露密钥
- 防止 SQL 注入
- 防止 XSS 攻击

### 6. 文档要求
- 每个 CC 任务完成后创建完成报告
- 更新 PROJECT_STATUS.md 和 TASK_BOARD.md
- 创建任务总结文档

---

## 构建和验证命令

```bash
# 切换到工作目录
cd E:\Lawer-Contest\lawyer-content-platform

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 构建验证
npm run build

# 开发服务器
npm run dev
```

---

## 当前构建状态

### 新代码（CC3-CC6）
- ✅ Lint: 通过（0 错误，0 警告）
- ✅ Type Check: 通过
- ✅ Build: 通过

### 旧代码
- ⚠️ Lint: 3 个警告
- ❌ Type Check: 1 个错误（lib/graph/workflow.ts:78）
- ❌ Build: 失败

### 总体状态
- ⚠️ Lint: 通过（0 错误，3 个警告）
- ❌ Type Check: 失败
- ❌ Build: 失败

**关键结论**: 
- ✅ 所有新代码都是正确的
- ❌ 项目整体构建失败（由于旧代码问题）
- ⚠️ 需要修复旧工作流才能部署

---

## 项目统计（V2 更新）

### 代码统计
- **新建文件**: 22 个
- **代码行数**: ~3,681 行
- **代码量**: ~121KB
- **代码质量**: 9.3/10

### 文件分布
- CC3: 6 个类型定义文件（1,346 行）
- CC4: 1 个 Schema 文件（135 行）
- CC5: 9 个 Agent 文件（1,200 行）
- CC6: 6 个工作流文件（1,000 行）

---

## 给新对话窗口的建议

### 1. 首先阅读的文档
- 本文档（CURRENT_CONTEXT.md V2）
- `E:\Lawer-Contest\CLAUDE.md` - 了解项目整体
- `E:\Lawer-Contest\docs\ERROR_REPORTING_CONSTRAINT.md` - 了解错误报告规则（重要！）
- `E:\Lawer-Contest\docs\PROJECT_PROGRESS_SUMMARY.md` - 了解项目进度

### 2. 当前任务选项
- **选项 1**: 修复旧工作流的构建错误（推荐先做）
- **选项 2**: 继续 CC7（创建 Admin API）
- **选项 3**: 继续 CC8（创建 Client API）

### 3. 工作方式
- **必须使用 Agent Team 协作模式**
- **必须遵守错误报告强制约束规则**
- 不要一个人完成所有工作
- 每个阶段都要输出文档
- 所有错误都必须被记录和报告

### 4. 注意事项
- 项目定义的 agent 使用 `general-purpose` agent + 角色 prompt 调用
- 所有修改都要经过 lint 和 build 验证
- 必须区分新错误和旧错误
- 不得隐藏或忽略任何错误
- 保持与用户的沟通，不要自作主张

### 5. 构建验证要求
- 运行 `npm run lint` 并记录所有输出
- 运行 `npm run type-check` 并记录所有输出
- 运行 `npm run build` 并记录所有输出
- 在报告中明确列出所有错误（包括旧代码的）

---

## 联系信息

如有疑问，请：
1. 阅读 `E:\Lawer-Contest\CLAUDE.md`
2. 查看 `E:\Lawer-Contest\docs\` 目录下的文档
3. 询问用户

---

**文档版本**: V2  
**最后更新**: 2026-05-01  
**更新内容**: 
- 新增 CC5 和 CC6 完成信息
- 新增错误报告强制约束规则
- 新增当前存在的问题说明
- 更新项目统计和构建状态
- 明确区分新代码和旧代码的构建状态

**文档结束**
