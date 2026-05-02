# 律师内容工作台 - 多行业 AI 内容生成平台

## 项目定位

这是一个基于 AI 多 Agent 协作的**专业内容生成平台**，为不同行业的专业人士提供定制化的内容创作服务。

### 第一阶段：服务刑事律师

当前版本专注于为**刑事律师**提供短视频内容生成服务，帮助律师快速产出符合专业规范、具有转化价值的短视频文案。

### 底层架构：支持多行业扩展

系统底层设计支持多行业扩展，未来可快速复制到：
- 民事律师
- 企业法务
- 医疗健康
- 金融理财
- 教育培训
- 其他专业服务行业

## 系统架构

### 双端分离设计

**Admin 后台（运营端）**
- 客户管理
- 行业模板配置
- 内容审查与质量控制
- Agent 运行监控
- 提示词模板管理

**Client 前台（客户端）**
- 客户档案管理
- 内容生成与编辑
- 发布日历
- 风格参考库
- 反馈与优化

### 核心原则

1. **Client 前台不展示内部细节**
   - 不显示 Agent 工作流程
   - 不显示提示词模板
   - 不显示内部审查细节
   - 只展示最终结果和必要的用户操作

2. **数据隔离与权限控制**
   - 每个客户只能访问自己的数据
   - Admin 可以查看所有数据
   - 使用 `visible_to_client` 和 `internal_only` 字段控制可见性

3. **多行业模板化**
   - 每个行业有独立的模板配置
   - 包括：内容栏目、审查规则、提示词、选题结构、风险规则
   - 新行业通过复制模板快速启动

## 商业模式

### 4W 深度启动包

为每个新客户提供深度定制服务：
- 客户档案深度调研
- 账号定位策略制定
- 内容栏目规划
- 风格参考库建立
- 初始内容生成

### 后续维护包

持续服务包括：
- 定期内容生成
- 选题策划
- 内容优化迭代
- 数据分析与调整

## 技术栈

- **框架**: Next.js 16.2.4 (App Router)
- **语言**: TypeScript
- **数据库**: Supabase (PostgreSQL)
- **AI 编排**: LangGraph + LangChain
- **样式**: Tailwind CSS v4
- **AI SDK**: Vercel AI SDK

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填入实际值：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/schema.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── app/                      # Next.js App Router
│   ├── admin/               # Admin 后台页面
│   ├── client/              # Client 前台页面
│   └── api/                 # API 路由
│       ├── admin/           # Admin API（完整数据访问）
│       └── client/          # Client API（受限数据访问）
├── lib/                     # 业务逻辑
│   ├── agents/              # AI Agent 实现
│   ├── graphs/              # LangGraph 工作流
│   ├── schemas/             # Zod Schema 定义
│   └── supabase/            # Supabase 客户端
├── types/                   # TypeScript 类型定义
├── supabase/                # 数据库 Schema
└── 项目计划/                # 项目文档

```

## 开发规范

详见项目文档：
- `项目计划/07_DEVELOPMENT_ORDER_AND_RULES.md` - 开发顺序与规则
- `CLAUDE.md` - Claude Code 工作指南
- `AGENTS.md` - Agent 架构说明

## 许可证

私有项目