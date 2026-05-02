# Agent Team 快速参考

## 调用 Agent

```
@project-manager [任务描述]  # 规划和决策
@developer [任务描述]        # 代码实现
@reviewer [任务描述]         # 代码审查
```

## 标准流程

### 功能开发
```
@project-manager 分析需求
  ↓
@developer 实现代码
  ↓
@reviewer 审查代码
  ↓
@developer 改进代码
  ↓
@project-manager 验收
```

### Bug 修复
```
@project-manager 分析问题
  ↓
@developer 修复问题
  ↓
@reviewer 验证修复
```

### 代码审查
```
@reviewer 审查代码
  ↓
@developer 改进代码
  ↓
@project-manager 确认完成
```

## Agent 职责

| Agent | 职责 | 模型 |
|-------|------|------|
| project-manager | 需求分析、任务规划、团队协调 | Claude Opus 4.7 |
| developer | 代码实现、Bug修复、测试编写 | DeepSeek V4 |
| reviewer | 代码审查、质量把控、安全检查 | Claude Opus 4.7 |

## 配置文件

- `.claude/agents/project-manager.md` - PM 配置
- `.claude/agents/developer.md` - Developer 配置
- `.claude/agents/reviewer.md` - Reviewer 配置
- `.claude/agents/team-config.json` - 团队配置
- `.claude/agents/USAGE.md` - 详细使用指南

## 示例

查看 `.claude/agents/examples/` 目录获取完整示例。
