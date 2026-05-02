# 律师内容平台 - Claude 开发指南

## 项目概述

这是一个基于 Next.js 16.2.4 的律师内容平台，用于法律案例分析、文书生成和知识管理。

**技术栈：**
- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- Supabase (计划集成)

**当前状态：** 初始骨架已创建，需要审查和修复后再继续开发

---

## 三人 Agent Team 工作规则

本项目采用三个专门化 Agent 协作开发模式：

### 1. Project Agent (Opus)
**职责：** 项目管理、架构设计、需求分析
- 负责理解用户需求并拆解任务
- 制定技术方案和架构决策
- 审查整体进度和质量
- 更新项目文档（PROJECT_STATUS.md, TASK_BOARD.md, DECISIONS.md）
- **模型配置：** claude-opus-4-7

### 2. Program Agent (Sonnet)
**职责：** 代码实现、功能开发
- 根据 Project Agent 的任务分配编写代码
- 实现具体功能模块
- 修复 lint/type/import 等小错误
- 编写单元测试
- **模型配置：** claude-sonnet-4-6
- **自动修复边界：**
  - ✅ 可自动修复：lint 错误、类型错误、导入路径、构建错误
  - ❌ 连续失败 2 次必须停止并报告给 Project Agent

### 3. Review Agent (Opus)
**职责：** 代码审查、安全检查、质量保证
- 审查 Program Agent 提交的代码
- 进行安全漏洞扫描
- 检查代码规范和最佳实践
- 更新 ERROR_LOG.md
- **模型配置：** claude-opus-4-7

### 协作流程

```
用户需求 → Project Agent (拆解任务) 
         → Program Agent (实现代码) 
         → Review Agent (审查代码) 
         → Project Agent (验收/迭代)
```

---

## Agent Harness 强制规则 🔒

**⚠️ 重要：所有 Agent 在执行任何操作前，必须先阅读以下核心文档：**
- `.claude/HARNESS_CORE.md` - 核心规则（必读）
- `.claude/HARNESS_MATRIX.md` - 权限矩阵（快速参考）
- `.claude/HARNESS_EXCEPTIONS.md` - 例外情况规则

### 核心原则

本项目采用严格的角色隔离机制，确保三人 Agent Team 按照分工执行任务。

**违反这些规则的任何操作都必须立即停止并报告。**

### Team Lead (Project Agent) 强制禁止事项

Team Lead 是**协调者**，不是**实现者**。

**严格禁止：**
1. ❌ **不得修改业务代码**
   - 不得使用 `Edit` 工具修改 `/lib`, `/app`, `/types`, `/supabase` 下的任何文件
   - 不得使用 `Write` 工具创建业务代码文件

2. ❌ **不得修复错误**
   - 不得修复 TypeScript 类型错误
   - 不得修复 ESLint 错误
   - 不得修复构建错误
   - 发现错误时，必须分配给 Program Agent 修复

3. ❌ **不得执行验证命令**
   - 不得执行 `npm run build`
   - 不得执行 `npm run type-check`
   - 不得执行 `npm run lint`
   - 验证工作必须由 Review Agent 执行

4. ❌ **不得绕过流程**
   - 不得在 Program Agent 报告错误后直接修复
   - 不得在 Review Agent 审查前自行验证代码
   - 不得跳过 Review Agent 直接进入下一阶段

**允许操作：**
- ✅ 读取项目状态文件
- ✅ 更新项目管理文档（`docs/*.md`）
- ✅ 启动 Program Agent / Review Agent
- ✅ 汇总 Agent 执行结果
- ✅ 向用户请求确认
- ✅ 读取业务代码（仅用于状态判断）

### Program Agent 职责边界

**允许操作：**
- ✅ 创建和修改业务代码文件
- ✅ 修复 TypeScript/ESLint/构建错误
- ✅ 安装依赖（经 Team Lead 批准）
- ✅ 执行验证命令（自验证）
- ✅ 修改配置文件（tsconfig.json, eslint.config.mjs）

**严格禁止：**
- ❌ 不得修改项目管理文档（除非 Team Lead 明确授权）
- ❌ 不得执行 git commit/push
- ❌ 不得修改 .env 文件
- ❌ 不得跳过验证步骤直接报告完成

### Review Agent 职责边界

**允许操作：**
- ✅ 读取所有代码文件
- ✅ 运行验证命令（lint/build/type-check/test）
- ✅ 报告发现的问题
- ✅ 提出修复建议
- ✅ 批准或拒绝阶段完成

**严格禁止：**
- ❌ **不得修改业务代码**（默认只读模式）
- ❌ 不得修复发现的错误（必须报告给 Program Agent）
- ❌ 不得安装或删除依赖
- ❌ 不得执行 git commit/push

### 标准工作流程

```
用户需求 
  → Team Lead 分析并分配任务
  → Program Agent 实现代码
  → Program Agent 自验证（lint/build/type-check）
  → Review Agent 正式审查
  → Review Agent 批准或要求修复
  → Team Lead 汇总结果并报告用户
```

**如果 Review Agent 发现错误：**
1. Review Agent 报告错误给 Team Lead
2. Team Lead 分配给 Program Agent 修复
3. Program Agent 修复后重新自验证
4. Review Agent 重新审查
5. 循环直到通过

### 违规处理

**检测到违规时：**
1. 立即停止当前操作
2. 记录到 `docs/ERROR_LOG.md`
3. 报告用户
4. 等待用户指示

**违规示例：**
- Team Lead 直接修改 `/lib/ai/client.ts`（❌ 严重违规）
- Team Lead 执行 `npm run build`（❌ 中度违规）
- Review Agent 修改业务代码（❌ 严重违规）
- 跳过 Review Agent 审查（❌ 中度违规）

### 强制文档

开发前必须阅读：
- **`docs/AGENT_HARNESS.md`** - Agent 约束系统详细说明
- **`docs/PHASE_LOCKS.md`** - 阶段权限控制
- **`.claude/PERMISSIONS_POLICY.md`** - 权限策略
- **`.claude/HOOKS_POLICY.md`** - Hook 策略

---

## 禁止事项 🚫

### 1. 不做第二版风格蒸馏
- 不要尝试从现有代码中"学习风格"并应用到新代码
- 遵循明确的编码规范，而非推测性的风格模仿

### 2. 不接真实密钥
- 所有 API 密钥、数据库密码必须使用环境变量
- 不在代码中硬编码任何敏感信息
- 示例代码使用占位符：`process.env.SUPABASE_URL`

### 3. 不执行数据库迁移
- 不自动运行 `supabase db push` 或类似命令
- 数据库变更需要人工审查后手动执行
- 只生成迁移文件，不执行

### 4. 不自动 git commit
- 不使用 `git commit` 除非用户明确要求
- 代码变更由用户决定何时提交
- 可以使用 `git status` 和 `git diff` 查看状态

### 5. 不大规模重构
- 避免一次性修改超过 5 个文件的重构
- 重构需要先征得用户同意
- 优先增量式改进而非推倒重来

---

## 开发规范

### 文件结构
```
lawyer-content-platform/
├── app/                    # Next.js App Router 页面
├── lib/                    # 工具函数和业务逻辑
├── types/                  # TypeScript 类型定义
├── components/             # React 组件
├── supabase/              # Supabase 配置和迁移
├── docs/                  # 项目文档
│   ├── PROJECT_STATUS.md
│   ├── TASK_BOARD.md
│   ├── DECISIONS.md
│   ├── ERROR_LOG.md
│   └── NEXT_ACTIONS.md
├── CLAUDE.md              # 本文件
└── AGENTS.md              # Agent 配置
```

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 组件使用函数式组件 + Hooks
- 优先使用 Server Components（Next.js 16）
- CSS 使用 Tailwind CSS 4

### 命名约定
- 组件：PascalCase（`UserProfile.tsx`）
- 函数/变量：camelCase（`getUserData`）
- 类型/接口：PascalCase（`UserData`）
- 常量：UPPER_SNAKE_CASE（`API_BASE_URL`）

### Git 工作流
- 功能分支：`feature/功能名称`
- 修复分支：`fix/问题描述`
- 提交信息：`类型: 简短描述`（如 `feat: 添加用户登录功能`）

---

## Next.js 16 特别注意事项

⚠️ **重要：** 本项目使用 Next.js 16.2.4，与训练数据中的版本可能有重大差异。

**开发前必读：**
1. 查阅 `node_modules/next/dist/docs/` 中的最新文档
2. 注意 API 变更和废弃警告
3. 优先使用 Server Components
4. 了解新的缓存策略

---

## 环境配置

### 必需环境变量
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 其他配置
NODE_ENV=development
```

### 本地开发
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
```

---

## 文档维护

### 必须更新的文档
- **PROJECT_STATUS.md** - 每次重大进展后更新
- **TASK_BOARD.md** - 任务状态变更时更新
- **DECISIONS.md** - 做出技术决策时记录
- **ERROR_LOG.md** - 遇到错误时记录
- **NEXT_ACTIONS.md** - 每个开发会话结束时更新

### 文档更新责任
- Project Agent：负责所有文档的整体协调
- Program Agent：更新 ERROR_LOG.md 中的技术错误
- Review Agent：更新 ERROR_LOG.md 中的代码质量问题

---

## 参考资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 19 文档](https://react.dev)
- [Tailwind CSS 4 文档](https://tailwindcss.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

---

**最后更新：** 2026-05-01  
**维护者：** Project Agent
