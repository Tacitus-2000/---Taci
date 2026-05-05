# 律师内容平台 - Claude 开发指南

## 项目概述

这是一个基于 Next.js 16.2.4 的律师内容平台，用于法律案例分析、文书生成和知识管理。

**技术栈：**
- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- Supabase

**当前状态：** 认证系统和前端页面已完成，正在验证功能

---

## 🎯 开发模式选择

本项目支持两种开发模式，根据任务规模和重要性选择：

### 模式 1：Superpowers（默认模式）

**适用场景**：
- ✅ 小型修复（< 5 个文件，< 2 小时）
- ✅ 中等功能开发（5-20 个文件，2-8 小时）
- ✅ 探索性编程（需求不明确）
- ✅ 快速迭代和原型开发
- ✅ 文档更新和配置调整

**特点**：
- 快速灵活
- 自动触发相关 skill
- 单个 AI 完成所有工作
- 适合大多数日常开发任务

**使用方式**：
- 直接提出需求，无需特别说明
- 系统会自动使用 Superpowers Skills

---

### 模式 2：Team Skill（严格模式）

**适用场景**：
- ✅ 大型功能开发（> 20 个文件，> 8 小时）
- ✅ 安全敏感功能（认证、授权、支付、加密）
- ✅ 数据库架构变更（表结构、迁移、RLS）
- ✅ 核心架构重构（影响多个模块）
- ✅ 用户明确要求严格质量控制

**特点**：
- 严格的三人 Agent Team 协作
- 独立的代码审查
- 完整的文档记录
- 质量保证最强

**使用方式**：
- 明确说明"使用 team 模式"或"启用 agent team"
- 系统会启动三人 Agent Team 协作流程

**详细文档**：参见 `team-skill` (C:\Users\56834\.claude\skills\team-skill\skill.md)

---

## 🔍 代码审查

### Code Review Excellence (官方 Skill)

**何时使用**：
- ✅ 代码实现完成后
- ✅ 准备提交 PR 前
- ✅ 发现 bug 需要排查
- ✅ 性能问题需要诊断
- ✅ 安全功能需要验证
- ✅ 架构审查
- ✅ 指导初级开发者

**触发方式**：
- 说"审查代码"或"code review"
- 系统会自动启动专业代码审查

**支持的语言/框架**：
- React 19, Vue 3, TypeScript
- Rust, Go, Java, Python, C/C++
- CSS/Less/Sass, Qt

**审查维度**：
- 代码质量（规范、复杂度、可维护性）
- 安全性（SQL 注入、XSS、认证授权）
- 架构（模块职责、依赖关系、SOLID 原则）
- 性能（算法复杂度、N+1 查询、内存泄漏）
- 测试（覆盖率、边界条件）
- 验证（lint、type-check、build）

**特色功能**：
- 📚 建设性反馈（不是指责，而是教育）
- 🎯 优先级标签（blocking/important/nit/suggestion）
- 📖 语言特定指南（详细的最佳实践）
- ✅ 审查清单（系统化的审查流程）

**详细文档**：参见 `code-review-excellence` (C:\Users\56834\.claude\skills\code-review-skill\skill.md)

---

## 🧪 前端测试

### gstack Skill

**何时使用**：
- ✅ 测试前端页面
- ✅ 验证用户流程
- ✅ UI/UX 验证
- ✅ 截图和 bug 报告
- ✅ 部署后验证

**触发方式**：
- 说"测试页面"或"打开网站"
- 系统会启动无头浏览器进行测试

**功能**：
- 自动导航和交互
- 截图和状态验证
- 表单提交测试
- 响应式布局测试

---

## 📋 开发规范

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
└── AGENTS.md              # Agent 配置（如果使用 Team Skill）
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

## 🚫 禁止事项

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

## ⚙️ 环境配置

### 必需环境变量
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# API（重要：服务器默认运行在 3001）
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Node 环境
NODE_ENV=development
```

### 本地开发
```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器（默认端口 3001）
npm run build        # 构建生产版本
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 类型检查
```

**重要提示**：
- 开发服务器默认运行在 `http://localhost:3001`
- 如果端口被占用，Next.js 会自动使用下一个可用端口
- 确保 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 与实际端口一致

---

## 📚 文档维护

### 必须更新的文档（使用 Team Skill 时）
- **PROJECT_STATUS.md** - 每次重大进展后更新
- **TASK_BOARD.md** - 任务状态变更时更新
- **DECISIONS.md** - 做出技术决策时记录
- **ERROR_LOG.md** - 遇到错误时记录
- **NEXT_ACTIONS.md** - 每个开发会话结束时更新

### 文档更新责任（Team Skill 模式）
- Project Agent：负责所有文档的整体协调
- Program Agent：更新 ERROR_LOG.md 中的技术错误
- Review Agent：更新 ERROR_LOG.md 中的代码质量问题

---

## 🔗 参考资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 19 文档](https://react.dev)
- [Tailwind CSS 4 文档](https://tailwindcss.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

---

## 📝 项目特定信息

### 当前项目状态
- ✅ 数据库架构（14 个表）
- ✅ 认证系统（JWT + 双角色）
- ✅ Admin 前端（5 个管理页面）
- ✅ Client 前端（8 个客户页面）
- ✅ 后端 API（42 个端点）
- ⏳ AI 工作流集成（待实现）
- ⏳ RLS 策略配置（待实现）

### 测试账号
- **Admin**: admin@example.com / admin123
- **Client**: client@example.com / client123

### 本地网站
- **地址**: http://localhost:3001
- **Admin 登录**: http://localhost:3001/admin/login
- **Client 登录**: http://localhost:3001/client/login

---

## 💡 使用建议

### 日常开发（推荐 Superpowers）
```
# 示例 1：修复一个 bug
"修复登录页面的表单验证问题"

# 示例 2：添加一个小功能
"在用户档案页面添加编辑按钮"

# 示例 3：优化代码
"优化 API 客户端的错误处理"
```

### 大型功能开发（推荐 Team Skill）
```
# 示例 1：新功能开发
"使用 team 模式开发用户注册功能"

# 示例 2：安全功能
"使用 team 模式实现 RLS 策略"

# 示例 3：架构重构
"使用 team 模式重构 AI 工作流系统"
```

### 代码审查（推荐 Code Review Skill）
```
# 示例 1：审查单个文件
"审查 lib/api/client.ts 文件"

# 示例 2：审查整个功能
"审查用户认证功能的所有代码"

# 示例 3：安全审查
"对认证系统进行安全审查"
```

### 前端测试（推荐 gstack）
```
# 示例 1：测试页面
"测试 http://localhost:3001/admin/login 页面"

# 示例 2：测试用户流程
"测试完整的登录到查看文案的流程"

# 示例 3：截图
"打开客户首页并截图"
```

---

## 🎓 Skills 优先级

根据 Superpowers 的 **Instruction Priority** 规则：

1. **用户明确指令**（最高优先级）
   - 本 CLAUDE.md 的规则
   - 用户在对话中的直接要求

2. **Skills**（中等优先级）
   - team-skill
   - code-review-skill
   - superpowers skills
   - gstack

3. **系统默认**（最低优先级）

**重要**：本 CLAUDE.md 的规则始终优先于任何 skill。

---

## 📞 获取帮助

如有疑问，请：
1. 阅读本文档
2. 查看 `docs/` 目录下的项目文档
3. 查看 `CURRENT_CONTEXT.md` 了解项目最新状态
4. 询问用户

---

**最后更新：** 2026-05-05  
**维护者：** 项目团队  
**版本：** 2.0（新增 Skills 集成）
