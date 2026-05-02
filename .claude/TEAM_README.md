# 三人 Agent Team 使用说明

## 📋 团队概述

本项目采用**精简版三人 Agent Team**，分工明确、协作高效。

## 👥 团队成员

### 1. project-agent（项目负责人）
**模型**: Claude Opus 4.7  
**工具**: Read, Grep, Glob（只读）

**职责**:
- 项目规划和架构设计
- 任务拆解和分配
- 开发顺序决策
- 边界控制和范围管理

**何时使用**:
- 开始新阶段前
- 需要决定开发顺序时
- 需要定义文件修改范围时
- 需要拆解复杂任务时

---

### 2. program-agent（程序实现负责人）
**模型**: Claude Sonnet  
**工具**: Read, Write, Edit, Bash, Grep, Glob

**职责**:
- 代码实现和文件创建
- TypeScript 类型和 Zod schema
- LangGraph 工作流实现
- API route 实现
- Supabase schema 生成
- Mock 实现

**何时使用**:
- 方案确认后执行开发
- 需要创建新文件时
- 需要实现具体功能时
- 需要编写代码时

---

### 3. review-agent（审查负责人）
**模型**: Claude Opus 4.7  
**工具**: Read, Grep, Glob, Bash

**职责**:
- 安全审查（密钥泄露、权限隔离）
- 代码质量审查
- 构建检查（lint、build）
- 越界检查（文件修改范围）
- 最终验收

**何时使用**:
- 代码实现完成后
- 准备提交代码前
- 发现可疑问题时
- 需要质量把关时

---

## 🔄 开发流程

### 标准三步流程

```
第一步: project-agent 拆任务
  ↓
  - 理解需求
  - 设计架构
  - 拆解任务
  - 定义范围
  - 分配给 program-agent

第二步: program-agent 实现
  ↓
  - 理解任务
  - 编写代码
  - 自测验证
  - 提交交付物
  - 标注审查点

第三步: review-agent 审查
  ↓
  - 安全审查
  - 质量审查
  - 构建检查
  - 给出报告
  - 决定通过/不通过
```

### 迭代流程

```
project-agent: 拆任务
  ↓
program-agent: 实现
  ↓
review-agent: 审查
  ↓
  ├─ 通过 → 进入下一阶段
  └─ 不通过 → program-agent 修改 → review-agent 再审查
```

---

## ✅ 必须经过审查的任务

### 1. 核心功能实现后
- AgentState 设计完成
- LangGraph 工作流实现完成
- API 路由实现完成
- 数据库 schema 生成完成

### 2. 安全相关变更
- 涉及密钥管理
- 涉及权限控制
- 涉及数据隔离
- 涉及环境变量

### 3. 架构相关变更
- 目录结构调整
- 模块边界变更
- 数据流转变更
- 技术选型变更

### 4. 准备提交代码前
- 确保代码安全
- 确保代码质量
- 确保构建通过
- 确保符合规范

---

## 🚫 第一版不做的内容

### 明确排除的功能

#### ❌ 第二版功能
- 风格蒸馏
- 风格参考库
- 风格学习
- 原创性审查

#### ❌ 用户系统
- 用户注册登录
- JWT 验证
- Session 管理
- 复杂权限系统

#### ❌ 数据库高级功能
- 复杂 RLS 策略
- 数据库触发器（除 updated_at）
- 存储过程
- 数据库函数

#### ❌ 外部集成
- 抖音数据采集
- 自动发布视频
- 第三方 API 集成
- Webhook 集成

#### ❌ 前端 UI
- 页面组件
- UI 交互
- 样式美化
- 前端路由

#### ❌ 真实 API 调用
- 真实 AI API（OpenAI/Anthropic/DeepSeek）
- 真实数据库连接
- 真实密钥配置
- 生产环境部署

### 第一版只做

#### ✅ 后端骨架
- 目录结构
- 类型定义
- Zod schema
- Agent 骨架（mock）
- LangGraph 工作流骨架
- API 路由骨架
- Supabase schema 文件（不执行）

#### ✅ Mock 实现
- Mock AI 响应
- Mock 数据
- Mock 用户 ID
- Mock 客户 ID

#### ✅ 基础验证
- Lint 通过
- Build 通过
- 类型检查通过
- 安全审查通过

---

## 📐 协作原则

### 1. 明确分工
- project-agent: 规划和决策
- program-agent: 实现和交付
- review-agent: 审查和把关

### 2. 顺序执行
- 先规划后实现
- 先实现后审查
- 不跳过步骤

### 3. 质量优先
- 安全第一
- 质量第二
- 速度第三

### 4. 透明沟通
- 任务说明清晰
- 实现报告完整
- 审查报告详细

### 5. 持续改进
- 根据审查意见改进
- 总结经验教训
- 优化协作流程

---

## 🎯 使用示例

### 示例 1: 开始后端骨架开发

```
第一步：调用 project-agent
"请作为 project-agent，拆解后端骨架开发任务，定义文件修改范围，分配给 program-agent。"

第二步：调用 program-agent
"请作为 program-agent，按照 project-agent 的任务说明实现后端骨架。"

第三步：调用 review-agent
"请作为 review-agent，审查 program-agent 的实现，重点检查安全性和代码质量。"
```

### 示例 2: 实现 LangGraph 工作流

```
第一步：project-agent 拆任务
"请拆解 scriptWorkflowGraph 的实现任务，定义节点、边、条件分支。"

第二步：program-agent 实现
"请实现 scriptWorkflowGraph，包括所有节点和条件分支，使用 mock 实现。"

第三步：review-agent 审查
"请审查 scriptWorkflowGraph，重点检查是否有无限循环风险。"
```

---

## ⚠️ 注意事项

### 1. 不要跳过 project-agent
- 不要直接让 program-agent 实现复杂功能
- 先让 project-agent 拆解任务
- 确保任务清晰明确

### 2. 不要跳过 review-agent
- 不要实现完就直接进入下一阶段
- 必须经过审查
- 安全和质量不能妥协

### 3. 不要扩大范围
- 严格遵守第一版范围
- 不添加第二版功能
- 不做非必要功能

### 4. 不要使用真实密钥
- 使用 mock 实现
- 不连接真实数据库
- 不调用真实 AI API

### 5. 保持沟通
- 有疑问及时询问
- 发现问题及时反馈
- 不要自行做重大决策

---

## 📚 相关文档

- `.claude/agents/project-agent.md` - 项目负责人详细说明
- `.claude/agents/program-agent.md` - 程序实现负责人详细说明
- `.claude/agents/review-agent.md` - 审查负责人详细说明
- `.claude/BACKEND_TEAM_PLAN.md` - 后端开发计划

---

## 🚀 快速开始

### 启动后端骨架开发

```
请使用三人 Agent Team 开始后端骨架开发：

1. project-agent: 拆解任务，定义范围
2. program-agent: 实现代码，使用 mock
3. review-agent: 审查安全和质量

要求：
- 第一版只做后端骨架
- 使用 mock 实现
- 不连接真实数据库
- 不做前端 UI
- 每个阶段等待确认
```

---

**更新时间**: 2026/05/01  
**版本**: v1.0
