# Agent Team 使用指南

## 快速开始

### 调用单个 Agent

在 Claude Code 中，你可以通过 `@agent-name` 来调用特定的 Agent：

```
@project-manager 请分析这个需求：实现用户登录功能
```

```
@developer 请实现用户登录的前端表单
```

```
@reviewer 请审查 app/login/page.tsx 的代码
```

## 标准工作流程

### 1. 功能开发流程

**场景**: 开发新功能

**步骤**:
```
1. 用户: @project-manager 我需要实现 [功能描述]
   → PM 输出: 需求分析、任务分解、技术方案

2. 用户: @developer 请实现 [具体任务]
   → Developer 输出: 代码实现、测试结果

3. 用户: @reviewer 请审查刚才的代码
   → Reviewer 输出: 审查报告、问题清单

4. 用户: @developer 请根据审查意见修改
   → Developer 输出: 改进后的代码

5. 用户: @project-manager 请验收功能
   → PM 输出: 验收结果、后续建议
```

**示例**:
```
用户: @project-manager 我需要实现律师案例搜索功能

PM: 
## 需求分析
用户需要能够搜索和筛选律师案例...

## 任务分解
1. 设计搜索 UI 组件 - 优先级: 高
2. 实现搜索 API - 优先级: 高
3. 集成 Supabase 全文搜索 - 优先级: 高
...

用户: @developer 请实现任务1：设计搜索 UI 组件

Developer:
## 实现概述
创建了 SearchBar 组件，支持关键词搜索和高级筛选...

用户: @reviewer 请审查 app/components/SearchBar.tsx

Reviewer:
## 审查概述
- 审查结论: ⚠️ 需修改
## 发现的问题
### 🔴 严重问题
1. 缺少输入防抖处理...
```

### 2. Bug 修复流程

**场景**: 修复已知问题

**步骤**:
```
1. 用户: @project-manager 发现了一个 bug: [问题描述]
   → PM 输出: 问题分析、影响评估、修复方案

2. 用户: @developer 请修复这个问题
   → Developer 输出: 问题定位、修复代码

3. 用户: @reviewer 请验证修复效果
   → Reviewer 输出: 验证结果、测试建议
```

### 3. 代码审查流程

**场景**: 审查已有代码

**步骤**:
```
1. 用户: @reviewer 请审查 [文件路径]
   → Reviewer 输出: 详细审查报告

2. 用户: @developer 请根据审查意见改进
   → Developer 输出: 改进后的代码

3. 用户: @project-manager 请确认改进完成
   → PM 输出: 确认结果
```

## 高级用法

### 多 Agent 协作

你可以在一次对话中调用多个 Agent：

```
用户: 
@project-manager 请分析这个需求
@developer 请准备技术方案
@reviewer 请评估技术风险
```

### Agent 之间的对话

让 Agent 之间互相协作：

```
用户: @project-manager 请制定计划

PM: [输出计划]

用户: @developer 请根据 PM 的计划实现第一个任务

Developer: [实现代码]

用户: @reviewer 请审查 Developer 的代码

Reviewer: [审查报告]

用户: @project-manager 请根据 Reviewer 的反馈决定下一步
```

### 自定义工作流

根据项目需要，你可以创建自己的工作流：

```
# 快速原型流程
1. @project-manager 快速评估可行性
2. @developer 实现 MVP
3. @project-manager 验收并规划下一步

# 重构流程
1. @reviewer 审查现有代码，识别问题
2. @project-manager 制定重构计划
3. @developer 执行重构
4. @reviewer 验证重构效果
```

## 最佳实践

### 1. 明确任务边界
- 给每个 Agent 清晰的任务描述
- 提供必要的上下文信息
- 明确验收标准

### 2. 保持沟通顺畅
- 及时反馈 Agent 的输出
- 在 Agent 之间传递关键信息
- 记录重要决策

### 3. 合理分配任务
- 让 PM 负责规划和决策
- 让 Developer 专注于实现
- 让 Reviewer 把控质量

### 4. 迭代改进
- 根据审查意见及时调整
- 不断优化工作流程
- 积累团队协作经验

## 常见场景

### 场景 1: 新功能开发
```
@project-manager 我需要添加用户评论功能
→ 获取需求分析和任务清单

@developer 请实现评论表单组件
→ 获取实现代码

@reviewer 请审查代码
→ 获取审查报告

@developer 请修复审查中的问题
→ 获取改进代码

@project-manager 请验收
→ 获取验收结果
```

### 场景 2: 性能优化
```
@project-manager 页面加载很慢，需要优化
→ 获取性能分析和优化方案

@developer 请实现优化方案
→ 获取优化代码

@reviewer 请验证性能改进
→ 获取验证结果
```

### 场景 3: 安全审查
```
@reviewer 请对整个认证系统进行安全审查
→ 获取安全审查报告

@developer 请修复发现的安全问题
→ 获取修复代码

@reviewer 请重新审查
→ 获取确认结果
```

## 配置说明

### Agent 配置文件位置
- 项目经理: `.claude/agents/project-manager.md`
- 程序员: `.claude/agents/developer.md`
- 审核员: `.claude/agents/reviewer.md`
- 团队配置: `.claude/agents/team-config.json`

### 修改 Agent 行为
编辑对应的 `.md` 文件来自定义 Agent 的行为和规则。

### 添加新 Agent
1. 在 `.claude/agents/` 创建新的配置文件
2. 在 `team-config.json` 中注册新 Agent
3. 更新 `AGENTS.md` 文档

## 故障排除

### Agent 没有按预期工作
- 检查配置文件是否正确
- 确认任务描述是否清晰
- 查看 Agent 的职责范围

### Agent 之间协作不顺畅
- 明确每个 Agent 的输入和输出
- 在 Agent 之间传递完整的上下文
- 使用 PM 协调冲突

### 需要调整工作流程
- 根据项目特点定制流程
- 记录有效的协作模式
- 持续优化团队配置

## 技巧和窍门

1. **使用 PM 作为入口**: 对于复杂任务，先让 PM 分析和规划
2. **让 Reviewer 早介入**: 在设计阶段就可以让 Reviewer 评估方案
3. **保存重要对话**: 记录 Agent 的关键输出，便于后续参考
4. **定期总结**: 让 PM 定期总结项目进展和问题
5. **灵活调整**: 根据实际情况调整 Agent 的使用方式

## 示例项目

查看 `examples/` 目录中的完整示例：
- `feature-development-example.md` - 功能开发完整流程
- `bug-fix-example.md` - Bug 修复示例
- `code-review-example.md` - 代码审查示例

## 获取帮助

- 查看 `AGENTS.md` 了解团队配置
- 阅读各个 Agent 的配置文件了解详细职责
- 参考 `team-config.json` 了解标准工作流程
