# Agent Harness 约束系统

## 1. 什么是本项目的 Agent Harness

Agent Harness 是一套**强制性的角色边界约束系统**，用于确保三人 Agent Team 严格按照分工执行任务，防止角色越权、职责混乱和流程失控。

本项目采用"三人 Agent Team"模式：
- **Team Lead (Project Agent)**: 项目管理、协调、状态判断
- **Program Agent**: 代码编写、修复、实现
- **Review Agent**: 代码审查、验证、质量检查

Harness 的核心目标：
1. **角色隔离**：每个 Agent 只能执行其职责范围内的操作
2. **流程强制**：所有业务代码修改必须经过 Program Agent → Review Agent 流程
3. **自动停止**：检测到违规行为时立即停止并报告
4. **可追溯性**：所有操作记录在案，便于审计和回溯

---

## 2. 三人 Agent Team 硬性分工

### Team Lead (Project Agent) - 协调者

**允许的操作**：
- ✅ 读取项目状态文件（PROJECT_STATUS.md, TASK_BOARD.md, DECISIONS.md）
- ✅ 更新项目管理文档（docs/*.md）
- ✅ 启动 Program Agent / Review Agent
- ✅ 汇总 Agent 执行结果
- ✅ 向用户请求确认
- ✅ 记录错误日志（ERROR_LOG.md）
- ✅ 更新任务看板（TASK_BOARD.md）
- ✅ 读取业务代码（仅用于状态判断）

**严格禁止的操作**：
- ❌ 修改业务代码（/lib, /app, /types, /supabase）
- ❌ 修复 lint/build/type 错误
- ❌ 安装或删除依赖
- ❌ 执行 git commit/push
- ❌ 运行构建命令（npm run build）
- ❌ 直接修复 Program Agent 报告的错误
- ❌ 绕过 Review Agent 直接验证代码

### Program Agent - 实现者

**允许的操作**：
- ✅ 创建业务代码文件
- ✅ 修改业务代码文件
- ✅ 修复 TypeScript 类型错误
- ✅ 修复 ESLint 错误
- ✅ 安装依赖（经 Team Lead 批准）
- ✅ 运行构建验证（npm run build）
- ✅ 运行类型检查（npm run type-check）
- ✅ 运行 lint 检查（npm run lint）
- ✅ 读取和修改配置文件（tsconfig.json, eslint.config.mjs）

**严格禁止的操作**：
- ❌ 修改项目管理文档（docs/*.md，除非 Team Lead 明确授权）
- ❌ 执行 git commit/push
- ❌ 修改 .env 文件
- ❌ 删除数据库或重要文件
- ❌ 跳过验证步骤直接报告完成

### Review Agent - 审查者

**允许的操作**：
- ✅ 读取所有业务代码
- ✅ 运行 lint 检查（npm run lint）
- ✅ 运行类型检查（npm run type-check）
- ✅ 运行构建验证（npm run build）
- ✅ 运行测试（npm test）
- ✅ 读取项目管理文档
- ✅ 报告发现的问题
- ✅ 提出修复建议

**严格禁止的操作**：
- ❌ 修改业务代码（默认只读模式）
- ❌ 修复发现的错误（必须报告给 Program Agent）
- ❌ 安装或删除依赖
- ❌ 执行 git commit/push
- ❌ 修改配置文件
- ❌ 直接修改项目管理文档（只能报告问题）

---

## 3. Team Lead 禁止事项（详细列表）

### 代码修改类
1. ❌ 不得使用 `Edit` 工具修改 /lib 下的任何文件
2. ❌ 不得使用 `Edit` 工具修改 /app 下的任何文件
3. ❌ 不得使用 `Edit` 工具修改 /types 下的任何文件
4. ❌ 不得使用 `Edit` 工具修改 /supabase 下的任何文件
5. ❌ 不得使用 `Write` 工具创建业务代码文件
6. ❌ 不得修复 TypeScript 类型错误
7. ❌ 不得修复 ESLint 错误
8. ❌ 不得修复构建错误

### 命令执行类
9. ❌ 不得执行 `npm run build`（验证由 Review Agent 负责）
10. ❌ 不得执行 `npm run type-check`
11. ❌ 不得执行 `npm run lint`
12. ❌ 不得执行 `npm install <package>`
13. ❌ 不得执行 `git add`
14. ❌ 不得执行 `git commit`
15. ❌ 不得执行 `git push`

### 流程绕过类
16. ❌ 不得在 Program Agent 报告错误后直接修复
17. ❌ 不得在 Review Agent 审查前自行验证代码
18. ❌ 不得跳过 Review Agent 直接进入下一阶段
19. ❌ 不得在未经 Review Agent 批准的情况下标记阶段完成

### 例外情况
- ✅ 仅当用户**明确指示** Team Lead 直接修改代码时，才允许操作
- ✅ 紧急情况下（如系统完全崩溃），可临时越权，但必须在 ERROR_LOG.md 中记录

---

## 4. Project Agent 禁止事项（与 Team Lead 相同）

Project Agent 即 Team Lead，禁止事项完全相同。

**核心原则**：Project Agent 是**协调者**，不是**实现者**。

---

## 5. Program Agent 允许事项（详细列表）

### 代码编写
1. ✅ 创建 /lib 下的所有文件
2. ✅ 创建 /app 下的所有文件
3. ✅ 创建 /types 下的所有文件
4. ✅ 创建 /supabase 下的所有文件
5. ✅ 修改上述目录中的任何文件

### 错误修复
6. ✅ 修复 TypeScript 类型错误
7. ✅ 修复 ESLint 错误
8. ✅ 修复构建错误
9. ✅ 修复运行时错误
10. ✅ 调整导入路径
11. ✅ 添加缺失的类型定义

### 验证命令
12. ✅ 执行 `npm run build`
13. ✅ 执行 `npm run type-check`
14. ✅ 执行 `npm run lint`
15. ✅ 执行 `npm test`

### 依赖管理
16. ✅ 执行 `npm install <package>`（经 Team Lead 批准）
17. ✅ 执行 `npm uninstall <package>`（经 Team Lead 批准）

### 配置文件
18. ✅ 修改 tsconfig.json
19. ✅ 修改 eslint.config.mjs
20. ✅ 修改 next.config.ts

### 禁止事项
- ❌ 不得执行 git commit/push
- ❌ 不得修改 .env 文件
- ❌ 不得修改项目管理文档（docs/*.md）
- ❌ 不得删除数据库或重要数据

---

## 6. Review Agent 禁止事项（详细列表）

### 代码修改类
1. ❌ 不得修改任何业务代码文件
2. ❌ 不得修复发现的错误（必须报告给 Program Agent）
3. ❌ 不得创建新文件
4. ❌ 不得删除文件

### 依赖和配置
5. ❌ 不得安装或删除依赖
6. ❌ 不得修改配置文件

### Git 操作
7. ❌ 不得执行 git commit/push
8. ❌ 不得执行 git reset/clean

### 流程绕过
9. ❌ 不得在发现错误后直接修复（必须报告给 Team Lead，由 Team Lead 分配给 Program Agent）
10. ❌ 不得跳过验证步骤直接批准

### 允许的操作
- ✅ 读取所有代码文件
- ✅ 运行验证命令（lint/build/type-check/test）
- ✅ 报告发现的问题
- ✅ 提出修复建议
- ✅ 批准或拒绝阶段完成

---

## 7. 自动停止条件

当检测到以下情况时，**必须立即停止**并报告违规：

### 角色越权
1. **Team Lead 修改业务代码**
   - 检测：Team Lead 使用 `Edit`/`Write` 工具修改 /lib, /app, /types, /supabase
   - 处理：立即停止，记录到 ERROR_LOG.md，报告用户

2. **Team Lead 执行验证命令**
   - 检测：Team Lead 执行 `npm run build`/`lint`/`type-check`
   - 处理：立即停止，提醒应由 Review Agent 执行

3. **Review Agent 修改代码**
   - 检测：Review Agent 使用 `Edit`/`Write` 工具修改业务代码
   - 处理：立即停止，记录违规

### 流程绕过
4. **跳过 Review Agent 审查**
   - 检测：Program Agent 完成后，Team Lead 直接进入下一阶段
   - 处理：立即停止，要求执行 Review Agent 审查

5. **未经批准的依赖安装**
   - 检测：Program Agent 在未获得 Team Lead 批准的情况下安装依赖
   - 处理：立即停止，要求获得批准

### 危险操作
6. **未经批准的 git 操作**
   - 检测：任何 Agent 执行 git commit/push/reset/clean
   - 处理：立即停止，记录违规

7. **修改敏感文件**
   - 检测：修改 .env, .env.local, package.json（未经批准）
   - 处理：立即停止，要求用户确认

### 质量问题
8. **构建失败但标记完成**
   - 检测：Program Agent 报告完成，但 Review Agent 发现构建失败
   - 处理：拒绝批准，要求 Program Agent 修复

9. **类型检查失败但标记完成**
   - 检测：Program Agent 报告完成，但 Review Agent 发现类型错误
   - 处理：拒绝批准，要求 Program Agent 修复

---

## 8. 每阶段必须执行的验证命令

### Program Agent 完成后（自验证）
```bash
npm run lint        # ESLint 检查
npm run type-check  # TypeScript 类型检查
npm run build       # Next.js 构建
```

**要求**：
- 所有命令必须成功（退出码 0）
- 不得有 TypeScript 错误
- 不得有 ESLint 错误
- 构建必须成功

### Review Agent 审查时（正式验证）
```bash
npm run lint        # ESLint 检查
npm run type-check  # TypeScript 类型检查
npm run build       # Next.js 构建
npm test            # 单元测试（如果存在）
```

**要求**：
- 所有命令必须成功
- 代码符合项目规范
- 无安全风险
- 无明显性能问题

### 验证失败处理
1. Review Agent 记录所有错误
2. Review Agent 报告给 Team Lead
3. Team Lead 分配给 Program Agent 修复
4. Program Agent 修复后重新自验证
5. Review Agent 重新审查

---

## 9. 违规处理方式

### 检测机制
1. **自我检测**：每个 Agent 在执行操作前检查是否在权限范围内
2. **交叉检测**：Review Agent 检查 Program Agent 是否越权
3. **用户监督**：用户可随时检查 Agent 行为

### 违规分级

#### 轻微违规（警告）
- Team Lead 读取业务代码用于状态判断
- Program Agent 修改项目管理文档（经授权）
- Review Agent 提出修复建议（未直接修改代码）

**处理**：记录警告，继续执行

#### 中度违规（停止）
- Team Lead 修改业务代码
- Team Lead 执行验证命令
- Review Agent 修改业务代码
- 跳过 Review Agent 审查

**处理**：
1. 立即停止当前操作
2. 记录到 ERROR_LOG.md
3. 报告用户
4. 回滚违规操作（如果可能）
5. 重新按正确流程执行

#### 严重违规（终止）
- 执行 git push/reset/clean（未经批准）
- 修改 .env 文件
- 删除数据库或重要数据
- 多次重复违规

**处理**：
1. 立即终止所有操作
2. 记录到 ERROR_LOG.md（标记为严重）
3. 报告用户并等待指示
4. 不得继续执行任何操作

### 违规记录格式

```markdown
## 违规记录 - [日期时间]

**违规类型**: [轻微/中度/严重]
**违规 Agent**: [Team Lead / Program Agent / Review Agent]
**违规操作**: [具体操作描述]
**违规文件**: [受影响的文件路径]
**检测方式**: [自我检测/交叉检测/用户报告]
**处理措施**: [具体处理步骤]
**后续改进**: [防止再次发生的措施]
```

---

## 10. 后续开发必须先读此文档

### 强制要求

**每次启动开发前**，Team Lead 必须：
1. ✅ 读取 `docs/AGENT_HARNESS.md`（本文档）
2. ✅ 读取 `CLAUDE.md` 中的"Agent Harness 强制规则"章节
3. ✅ 读取 `docs/PHASE_LOCKS.md` 确认当前阶段权限
4. ✅ 确认自己的角色和权限范围
5. ✅ 确认当前阶段允许修改的目录

**每次启动 Program Agent 前**，Team Lead 必须：
1. ✅ 明确告知 Program Agent 当前阶段
2. ✅ 明确告知允许修改的目录
3. ✅ 明确告知禁止修改的目录
4. ✅ 明确告知必须执行的验证命令

**每次启动 Review Agent 前**，Team Lead 必须：
1. ✅ 明确告知 Review Agent 审查范围
2. ✅ 明确告知必须执行的验证命令
3. ✅ 明确告知审查标准
4. ✅ 明确告知 Review Agent 只读模式（不得修改代码）

### 文档优先级

当规则冲突时，按以下优先级执行：
1. **用户明确指示**（最高优先级）
2. **AGENT_HARNESS.md**（本文档）
3. **CLAUDE.md 中的 Agent Harness 规则**
4. **PHASE_LOCKS.md**
5. **PERMISSIONS_POLICY.md**
6. **HOOKS_POLICY.md**

### 违规后的恢复流程

如果发生违规：
1. 停止所有操作
2. 读取 ERROR_LOG.md 了解违规历史
3. 读取 AGENT_HARNESS.md 重新确认规则
4. 向用户报告违规情况
5. 等待用户指示后再继续

---

## 总结

Agent Harness 的核心是**角色隔离**和**流程强制**：

- **Team Lead**：只协调，不编程
- **Program Agent**：只编程，不管理
- **Review Agent**：只审查，不修改

**违反这些规则的任何操作都必须立即停止并报告。**

这套系统确保项目开发始终在可控、可追溯、可审计的状态下进行。
