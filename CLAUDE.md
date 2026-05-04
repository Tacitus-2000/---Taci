@AGENTS.md

# 项目持续开发规则

本项目由三人 Agent Team 协作开发：

1. project-agent：负责阶段规划、任务拆解、文件范围控制。
2. program-agent：负责代码实现和最小必要修复。
3. review-agent：负责安全、架构、lint、build、越界审查。

## 工作方式

每一阶段必须按以下顺序执行：

project-agent 制定阶段计划
→ program-agent 实现
→ review-agent 审查
→ program-agent 根据审查报告最小修复
→ review-agent 复审
→ 输出阶段报告

## 自动推进范围

允许 Agent Team 在同一阶段内自动完成：

- 类型错误修复
- import 路径修复
- lint 错误修复
- build 错误修复
- mock 字段不一致修复
- API response 格式修复
- 小范围代码整理

## 必须暂停并等待用户确认的情况

出现以下情况必须停止：

1. 需要删除大量文件。
2. 需要重构整体架构。
3. 需要更换技术栈。
4. 需要修改数据库核心结构。
5. 需要接入真实密钥。
6. 需要实现第二版功能。
7. 需要修改前端主流程。
8. npm run build 连续失败 2 次。
9. 同一个问题修复 2 次仍失败。
10. 需要安装新依赖。
11. 需要执行数据库迁移。
12. 需要 git commit 或 push。

## 上下文管理

每完成一个阶段，必须更新：

- docs/PROJECT_STATUS.md
- docs/TASK_BOARD.md
- docs/DECISIONS.md
- docs/ERROR_LOG.md
- docs/NEXT_ACTIONS.md

## 验收规则

每个阶段结束必须输出：

1. 本阶段目标
2. 新建文件
3. 修改文件
4. 自动修复的问题
5. 未解决的问题
6. lint 结果
7. build 结果
8. 安全审查结果
9. 是否建议进入下一阶段