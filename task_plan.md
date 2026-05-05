# 任务计划：律师内容平台开发

## 目标
构建一个基于 Next.js + Supabase + LangGraph 的律师内容生成平台，支持 Admin 和 Client 双角色，实现内容生成、客户管理、风格参考等核心功能。

## 当前阶段
阶段 3（实现阶段 - 持续迭代）

## 各阶段

### 阶段 1：项目初始化与架构设计 ✅
- [x] 搭建 Next.js 16.2.4 + Turbopack 项目
- [x] 配置 Supabase 数据库连接
- [x] 设计数据库 Schema（13 个迁移文件）
- [x] 实现双角色认证系统（Admin/Client）
- [x] 配置 Middleware 路由保护
- **状态：** complete

### 阶段 2：Admin 前端开发 ✅
- [x] 实现 Admin 登录页面
- [x] 实现客户管理（CRUD）
- [x] 实现客户档案管理
- [x] 实现行业模板管理
- [x] 实现 Prompt 模板管理
- **状态：** complete

### 阶段 3：Client 前端开发 ✅
- [x] 实现 Client 登录页面
- [x] 实现 Dashboard（数据统计）
- [x] 实现个人资料页面
- [x] 实现日历页面
- [x] 实现话题管理
- [x] 实现脚本管理
- [x] 实现风格参考
- [x] 实现反馈管理
- [x] 实现内容生成页面
- **状态：** complete

### 阶段 4：认证系统修复 ✅
- [x] 修复 Client 登录 API 路径错误
- [x] 解决 httpOnly Cookie 导致的客户信息读取失败
- [x] 创建 /api/auth/me 端点
- [x] 重构 useClientId Hook（使用 API 调用）
- [x] 修复所有 Client 页面的类型错误
- [x] 通过 TypeScript 编译和构建验证
- **状态：** complete
- **完成时间：** 2026-05-05

### 阶段 5：后端 API 开发（进行中）
- [ ] 实现 LangGraph 工作流集成
- [ ] 实现内容生成 API
- [ ] 实现 Agent Run 管理 API
- [ ] 实现文件上传和存储
- [ ] 实现速率限制
- **状态：** pending

### 阶段 6：数据库优化
- [ ] 实现 RLS（Row Level Security）策略
- [ ] 优化数据库查询性能
- [ ] 添加数据库索引
- [ ] 实现数据备份策略
- **状态：** pending

### 阶段 7：测试与部署
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 性能测试
- [ ] 部署到生产环境
- **状态：** pending

## 关键问题
1. ✅ 如何安全地读取 httpOnly Cookie？→ 通过服务端 API /api/auth/me
2. ⏳ 如何实现 LangGraph 工作流？→ 待研究
3. ⏳ 如何优化大量客户数据的查询性能？→ 待实现 RLS + 索引

## 已做决策
| 决策 | 理由 |
|------|------|
| 使用 httpOnly Cookie 存储 JWT | 防止 XSS 攻击，提高安全性 |
| 创建 /api/auth/me 端点读取用户信息 | 保持 httpOnly 安全性的同时允许前端获取用户数据 |
| useClientId 使用 SWR 缓存 API 调用 | 减少重复请求，提高性能 |
| 客户档案表单使用下拉选择器而非手动输入 UUID | 避免 UUID 格式错误，提升用户体验 |
| Middleware matcher 排除静态资源和 API 路由 | 避免不必要的认证检查，提高性能 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| Client 登录返回 HTML 而非 JSON | 2 | 修正 API 路径为 /api/client/auth/login |
| 登录后显示"未找到客户信息" | 3 | 创建 /api/auth/me 端点从服务端读取 httpOnly Cookie |
| useClientId 返回 null 导致类型错误 | 1 | 在所有 Client 页面添加 null 检查和加载状态 |
| 客户档案创建时 UUID 验证失败 | 1 | 将 client_id 输入框改为下拉选择器 |

## 技术栈
- **前端**：Next.js 16.2.4 (Turbopack), React, TypeScript, Tailwind CSS, shadcn/ui
- **后端**：Next.js API Routes, Supabase (PostgreSQL)
- **认证**：JWT (httpOnly Cookie)
- **AI**：LangGraph, LangChain
- **部署**：待定

## 项目结构
```
E:\Lawer-Contest\
├── lawyer-content-platform/     # Next.js 应用主目录
│   ├── app/                     # App Router 页面
│   │   ├── admin/              # Admin 角色页面
│   │   ├── client/             # Client 角色页面
│   │   └── api/                # API 路由
│   ├── lib/                    # 工具库
│   │   ├── auth/              # 认证相关
│   │   ├── hooks/             # React Hooks
│   │   └── supabase/          # Supabase 客户端
│   └── components/            # UI 组件
├── supabase/                   # Supabase 配置
│   └── migrations/            # 数据库迁移文件（13个）
├── docs/                       # 项目文档
├── task_plan.md               # 任务计划（本文件）
├── findings.md                # 研究发现
└── progress.md                # 进度日志
```

## 备注
- 随着进度更新阶段状态：pending → in_progress → complete
- 做重大决策前重新读取此计划
- 记录所有错误，避免重复
- 每次 /clear 后自动读取此文件恢复上下文
