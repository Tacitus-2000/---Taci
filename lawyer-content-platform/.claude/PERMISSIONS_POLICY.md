# 权限策略配置建议

## 1. 概述

本文档定义了 Claude Code 在本项目中的权限策略，用于防止意外的破坏性操作和越权行为。

**目标：**
- 保护关键文件和配置不被意外修改
- 防止危险的 Git 操作
- 确保三人 Agent Team 角色隔离
- 要求用户确认高风险操作

**注意：** 本文档是**建议性配置**，需要用户在 Claude Code 设置中手动配置。

---

## 2. 推荐禁止的 Bash 命令

### Git 操作（高风险）

```bash
# 完全禁止（除非用户明确授权）
git push --force
git push -f
git reset --hard
git clean -f
git clean -fd
git clean -fdx
git branch -D
git rebase --skip
git rebase --abort

# 需要用户确认
git add .
git add -A
git commit
git push
git reset
git checkout -- .
git restore .
```

**原因：**
- `git push --force` 可能覆盖远程仓库历史
- `git reset --hard` 会丢失未提交的更改
- `git clean -f` 会删除未跟踪的文件
- `git add .` 可能意外添加敏感文件

### 文件删除（高风险）

```bash
# 完全禁止
rm -rf /
rm -rf ~
rm -rf *

# 需要用户确认
rm -rf node_modules
rm -rf .next
rm -rf dist
rm -rf build
```

**原因：**
- 递归删除可能导致数据丢失
- 删除系统目录可能导致系统崩溃

### 依赖管理（需要确认）

```bash
# 需要用户确认
npm install <package>
npm uninstall <package>
npm update
npm audit fix --force
```

**原因：**
- 安装依赖可能引入安全漏洞
- 删除依赖可能破坏项目
- 强制修复可能引入破坏性更改

---

## 3. 推荐禁止的 PowerShell 命令

### 文件删除（高风险）

```powershell
# 完全禁止
Remove-Item -Recurse -Force C:\
Remove-Item -Recurse -Force ~
Remove-Item -Recurse -Force *

# 需要用户确认
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
del /s /q *
rmdir /s /q *
```

### Git 操作（同 Bash）

```powershell
# 完全禁止
git push --force
git reset --hard
git clean -f

# 需要用户确认
git add .
git commit
git push
```

---

## 4. 推荐保护的文件路径

### 环境变量文件（完全禁止修改）

```
.env
.env.local
.env.production
.env.development
.env.test
.env.*
```

**原因：** 包含敏感信息（API 密钥、数据库密码）

### 配置文件（需要用户确认）

```
package.json
package-lock.json
tsconfig.json
eslint.config.mjs
next.config.ts
tailwind.config.ts
.gitignore
.npmrc
```

**原因：** 修改可能导致项目无法构建或运行

### 核心业务文件（需要 Program Agent 权限）

```
app/page.tsx
app/layout.tsx
app/globals.css
lib/**/*
types/**/*
components/**/*
```

**原因：** 只有 Program Agent 可以修改业务代码

### Git 配置（完全禁止修改）

```
.git/config
.git/HEAD
.git/refs/**/*
```

**原因：** 修改可能破坏 Git 仓库

---

## 5. 推荐允许自动执行的命令

### 只读操作（无风险）

```bash
# 文件读取
cat <file>
head <file>
tail <file>
less <file>
more <file>

# 目录浏览
ls
ls -la
tree
find <path> -name <pattern>

# Git 查询
git status
git log
git diff
git branch
git remote -v
git show

# 项目信息
npm list
npm outdated
node --version
npm --version
```

### 验证命令（允许自动执行）

```bash
# 代码检查
npm run lint
npm run type-check
npm run build
npm test

# 格式化（只读模式）
npm run format:check
```

**原因：** 这些命令不会修改文件，只会输出信息

---

## 6. 推荐需要用户确认的命令

### 代码修改

```bash
# 格式化（写入模式）
npm run format
npm run format:write
prettier --write .

# 自动修复
npm run lint:fix
eslint --fix .
```

**原因：** 会修改源代码文件

### 依赖操作

```bash
# 安装/删除
npm install
npm install <package>
npm uninstall <package>
npm update
npm ci

# 清理
npm cache clean --force
rm -rf node_modules
```

**原因：** 会修改 `node_modules` 和 `package-lock.json`

### Git 操作

```bash
# 提交相关
git add
git commit
git push
git pull
git merge
git rebase

# 分支操作
git checkout -b <branch>
git branch -d <branch>
```

**原因：** 会修改 Git 历史或远程仓库

### 数据库操作

```bash
# Supabase
supabase db push
supabase db reset
supabase migration up
supabase migration down
```

**原因：** 会修改数据库结构或数据

---

## 7. 角色权限矩阵

### Team Lead (Project Agent)

| 操作类型 | 权限 | 说明 |
|---------|------|------|
| 读取业务代码 | ✅ 允许 | 用于状态判断 |
| 修改业务代码 | ❌ 禁止 | 必须由 Program Agent 执行 |
| 修改项目文档 | ✅ 允许 | `docs/*.md` |
| 执行验证命令 | ❌ 禁止 | 必须由 Review Agent 执行 |
| 启动 Agent | ✅ 允许 | 协调工作 |
| Git 操作 | ❌ 禁止 | 除非用户明确授权 |

### Program Agent

| 操作类型 | 权限 | 说明 |
|---------|------|------|
| 读取业务代码 | ✅ 允许 | - |
| 修改业务代码 | ✅ 允许 | `/lib`, `/app`, `/types`, `/supabase` |
| 修改项目文档 | ⚠️ 需授权 | 除非 Team Lead 明确授权 |
| 执行验证命令 | ✅ 允许 | 自验证 |
| 安装依赖 | ⚠️ 需授权 | 需 Team Lead 批准 |
| Git 操作 | ❌ 禁止 | 除非用户明确授权 |

### Review Agent

| 操作类型 | 权限 | 说明 |
|---------|------|------|
| 读取业务代码 | ✅ 允许 | - |
| 修改业务代码 | ❌ 禁止 | 只读模式 |
| 修改项目文档 | ❌ 禁止 | 只能报告问题 |
| 执行验证命令 | ✅ 允许 | 正式审查 |
| 安装依赖 | ❌ 禁止 | - |
| Git 操作 | ❌ 禁止 | - |

---

## 8. 实施建议

### 方式一：Claude Code 设置（推荐）

在 Claude Code 的设置中配置：

1. **Permission Mode**: 设置为 "Ask" 或 "Restricted"
2. **Blocked Commands**: 添加上述禁止命令
3. **Protected Paths**: 添加上述保护路径
4. **Auto-approve Patterns**: 添加只读命令

### 方式二：Pre-Tool-Use Hook（高级）

创建 `.claude/hooks/pre-tool-use.sh`：

```bash
#!/bin/bash
# 在每次工具调用前执行

TOOL_NAME=$1
TOOL_ARGS=$2

# 检查是否是危险命令
if [[ "$TOOL_ARGS" =~ "git push --force" ]]; then
  echo "❌ 禁止执行 git push --force"
  exit 1
fi

# 检查是否修改受保护文件
if [[ "$TOOL_ARGS" =~ ".env" ]]; then
  echo "❌ 禁止修改 .env 文件"
  exit 1
fi

# 允许执行
exit 0
```

**注意：** Hook 方案需要在 `.claude/HOOKS_POLICY.md` 中详细设计。

### 方式三：Git Hooks（补充）

创建 `.git/hooks/pre-commit`：

```bash
#!/bin/bash
# 防止提交敏感文件

if git diff --cached --name-only | grep -q "^.env"; then
  echo "❌ 不允许提交 .env 文件"
  exit 1
fi

exit 0
```

---

## 9. 配置优先级

当多个策略冲突时，按以下优先级执行：

1. **用户明确指示**（最高优先级）
2. **Claude Code 设置中的 Blocked Commands**
3. **Pre-Tool-Use Hook**
4. **本文档的建议**
5. **AGENT_HARNESS.md 的规则**

---

## 10. 监控和审计

### 建议记录的操作

所有以下操作应记录到 `docs/ERROR_LOG.md`：

- 被拦截的命令
- 需要用户确认的操作
- 修改受保护文件的尝试
- 角色越权行为

### 记录格式

```markdown
## 权限拦截 - [日期时间]

**操作类型**: [命令执行 / 文件修改 / Git 操作]
**执行者**: [Team Lead / Program Agent / Review Agent]
**尝试操作**: [具体命令或文件路径]
**拦截原因**: [违反权限策略 / 受保护文件 / 危险操作]
**处理结果**: [已拦截 / 用户批准 / 用户拒绝]
```

---

## 11. 常见问题

### Q: 如果 Program Agent 需要修改 package.json 怎么办？

A: Program Agent 应先向 Team Lead 请求批准，Team Lead 确认后，用户在 Claude Code 中批准该操作。

### Q: 如果需要紧急修复生产环境怎么办？

A: 用户可以临时禁用权限策略，但必须在 `ERROR_LOG.md` 中记录原因和操作。

### Q: Review Agent 发现错误但无法修改代码怎么办？

A: Review Agent 报告错误给 Team Lead，Team Lead 分配给 Program Agent 修复。这是正常流程。

### Q: 如何处理 Hook 拦截的操作？

A: 
1. Hook 拦截后，Agent 应停止操作
2. Agent 向用户报告被拦截的原因
3. 用户决定是否临时允许该操作
4. 记录到 `ERROR_LOG.md`

---

## 12. 后续改进

### 短期（1-2 周）
- [ ] 在 Claude Code 设置中配置基本权限
- [ ] 测试权限策略是否有效
- [ ] 收集被拦截的操作日志

### 中期（1 个月）
- [ ] 实现 Pre-Tool-Use Hook
- [ ] 完善权限矩阵
- [ ] 添加自动化测试

### 长期（3 个月）
- [ ] 开发权限管理 UI
- [ ] 集成到 CI/CD 流程
- [ ] 建立权限审计报告

---

## 总结

权限策略的核心目标是**防止意外破坏**和**确保角色隔离**。

**关键原则：**
1. 默认拒绝，显式允许
2. 高风险操作必须用户确认
3. 角色权限严格隔离
4. 所有操作可追溯

**实施步骤：**
1. 在 Claude Code 设置中配置基本权限
2. 测试并调整策略
3. 逐步实现 Hook 方案
4. 持续监控和改进

---

**最后更新：** 2026-05-01  
**维护者：** Project Agent
