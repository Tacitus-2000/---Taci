# 阶段锁规则

## 1. 概述

阶段锁（Phase Lock）是一种**目录级别的访问控制机制**，用于确保每个开发阶段只修改预定的目录，防止跨阶段污染和意外修改。

**核心原则：**
- 每个阶段有明确的允许修改目录列表
- 非 Program Agent 不得修改业务代码
- 阶段完成后必须由 Review Agent 解除锁定
- 违反阶段锁规则必须立即停止

---

## 2. 阶段定义

### 阶段 0: 项目初始化

**目标：** 创建项目骨架和管理文档

**允许修改的目录：**
```
docs/                    # 项目文档
.claude/                 # Claude 配置
CLAUDE.md               # 开发指南
AGENTS.md               # Agent 配置
package.json            # 依赖配置
tsconfig.json           # TypeScript 配置
eslint.config.mjs       # ESLint 配置
next.config.ts          # Next.js 配置
tailwind.config.ts      # Tailwind 配置
.gitignore              # Git 忽略规则
```

**禁止修改的目录：**
```
lib/                    # 业务逻辑（尚未创建）
app/                    # 页面和 API（仅允许初始骨架）
types/                  # 类型定义（尚未创建）
components/             # 组件（尚未创建）
supabase/               # 数据库（尚未创建）
```

**执行者：** Team Lead (Project Agent)

---

### 阶段 1: 后端多 Agent 骨架搭建

**目标：** 创建 LangGraph 工作流、Agent 定义、类型系统

**允许修改的目录：**
```
lib/                    # ✅ 所有子目录
  ├── agents/           # Agent 实现
  ├── graph/            # LangGraph 工作流
  ├── prompts/          # Prompt 模板
  ├── schemas/          # Zod 验证
  ├── ai/               # AI 客户端
  └── supabase/         # Supabase 客户端

types/                  # ✅ 所有类型定义
  ├── agent.ts
  ├── workflow.ts
  ├── api.ts
  └── database.ts

app/api/                # ✅ 仅 API Routes
  ├── workflow/
  └── health/

supabase/               # ✅ 数据库 Schema
  └── schema.sql

docs/                   # ✅ 项目文档更新
```

**禁止修改的目录：**
```
app/page.tsx            # ❌ 前端页面
app/layout.tsx          # ❌ 布局
components/             # ❌ 组件（尚未创建）
public/                 # ❌ 静态资源
```

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ 所有 API Routes 可访问

---

### 阶段 2: 前端页面骨架搭建

**目标：** 创建前端页面、组件、布局

**允许修改的目录：**
```
app/                    # ✅ 所有页面和布局
  ├── page.tsx
  ├── layout.tsx
  ├── globals.css
  └── (routes)/

components/             # ✅ 所有组件
  ├── ui/               # UI 组件
  ├── forms/            # 表单组件
  └── layout/           # 布局组件

public/                 # ✅ 静态资源
  ├── images/
  └── icons/

lib/utils/              # ✅ 前端工具函数
  └── cn.ts

types/                  # ✅ 前端类型定义
  └── ui.ts

docs/                   # ✅ 项目文档更新
```

**禁止修改的目录：**
```
lib/agents/             # ❌ Agent 实现（已完成）
lib/graph/              # ❌ LangGraph 工作流（已完成）
lib/prompts/            # ❌ Prompt 模板（已完成）
app/api/                # ❌ API Routes（已完成）
supabase/               # ❌ 数据库 Schema（已完成）
```

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ 所有页面可访问
- ✅ UI 组件渲染正常

---

### 阶段 3: 前后端联调

**目标：** 连接前端和后端，实现完整流程

**允许修改的目录：**
```
app/                    # ✅ 页面和 API 调用
components/             # ✅ 组件（添加 API 调用）
lib/api/                # ✅ API 客户端
lib/hooks/              # ✅ React Hooks
types/                  # ✅ 类型定义（调整）
docs/                   # ✅ 项目文档更新
```

**禁止修改的目录：**
```
lib/agents/             # ❌ Agent 实现（除非发现 bug）
lib/graph/              # ❌ LangGraph 工作流（除非发现 bug）
lib/prompts/            # ❌ Prompt 模板（除非发现 bug）
supabase/schema.sql     # ❌ 数据库 Schema（除非发现 bug）
```

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ 前端可以调用后端 API
- ✅ 工作流可以正常执行

---

### 阶段 4: 真实 AI 接入

**目标：** 替换 Mock AI，接入真实 AI 服务

**允许修改的目录：**
```
lib/ai/                 # ✅ AI 客户端实现
  ├── client.ts         # 真实 AI 客户端
  └── mock.ts           # 保留 Mock（用于测试）

lib/agents/             # ✅ Agent 实现（调整 AI 调用）
.env.example            # ✅ 环境变量模板
docs/                   # ✅ 项目文档更新
```

**禁止修改的目录：**
```
lib/graph/              # ❌ LangGraph 工作流（不应改变）
lib/prompts/            # ❌ Prompt 模板（不应改变）
app/                    # ❌ 前端页面（不应改变）
components/             # ❌ 组件（不应改变）
supabase/               # ❌ 数据库（不应改变）
```

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ 真实 AI 可以正常调用
- ✅ Agent 输出符合预期

---

### 阶段 5: Supabase 数据库接入

**目标：** 连接 Supabase，实现数据持久化

**允许修改的目录：**
```
lib/supabase/           # ✅ Supabase 客户端
lib/api/                # ✅ API 层（添加数据库调用）
app/api/                # ✅ API Routes（添加数据库操作）
types/database.ts       # ✅ 数据库类型定义
supabase/               # ✅ 数据库迁移
.env.example            # ✅ 环境变量模板
docs/                   # ✅ 项目文档更新
```

**禁止修改的目录：**
```
lib/agents/             # ❌ Agent 实现（不应改变）
lib/graph/              # ❌ LangGraph 工作流（不应改变）
lib/prompts/            # ❌ Prompt 模板（不应改变）
app/page.tsx            # ❌ 前端页面（不应改变）
components/             # ❌ 组件（不应改变）
```

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ Supabase 连接成功
- ✅ 数据可以正常读写

---

### 阶段 6: 完整测试和优化

**目标：** 端到端测试、性能优化、bug 修复

**允许修改的目录：**
```
所有目录（根据测试结果）
```

**但必须遵守：**
- ✅ 每次修改必须有明确的测试用例或 bug 报告
- ✅ 修改前必须记录到 `docs/ERROR_LOG.md`
- ✅ 修改后必须重新运行所有验证

**执行者：** Program Agent

**验证要求：**
- ✅ `npm run build` 成功
- ✅ `npm run type-check` 无错误
- ✅ `npm run lint` 无错误
- ✅ `npm test` 全部通过
- ✅ 端到端测试通过
- ✅ 性能指标达标

---

## 3. 角色权限矩阵

### Team Lead (Project Agent)

| 阶段 | 允许修改的目录 | 禁止修改的目录 |
|------|---------------|---------------|
| 阶段 0 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 1 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 2 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 3 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 4 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 5 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |
| 阶段 6 | `docs/`, `.claude/`, `*.md` | 所有业务代码 |

**核心原则：** Team Lead **永远不得修改业务代码**。

---

### Program Agent

| 阶段 | 允许修改的目录 | 禁止修改的目录 |
|------|---------------|---------------|
| 阶段 0 | 无（阶段 0 由 Team Lead 执行） | 所有目录 |
| 阶段 1 | `lib/`, `types/`, `app/api/`, `supabase/`, `docs/` | `app/page.tsx`, `components/` |
| 阶段 2 | `app/`, `components/`, `public/`, `lib/utils/`, `types/ui.ts`, `docs/` | `lib/agents/`, `lib/graph/`, `app/api/` |
| 阶段 3 | `app/`, `components/`, `lib/api/`, `lib/hooks/`, `types/`, `docs/` | `lib/agents/`, `lib/graph/`, `supabase/schema.sql` |
| 阶段 4 | `lib/ai/`, `lib/agents/`, `.env.example`, `docs/` | `lib/graph/`, `app/`, `components/` |
| 阶段 5 | `lib/supabase/`, `lib/api/`, `app/api/`, `types/database.ts`, `supabase/`, `docs/` | `lib/agents/`, `lib/graph/`, `app/page.tsx` |
| 阶段 6 | 所有目录（根据测试结果） | 无（但必须有明确理由） |

**核心原则：** Program Agent 只能修改当前阶段允许的目录。

---

### Review Agent

| 阶段 | 允许修改的目录 | 禁止修改的目录 |
|------|---------------|---------------|
| 所有阶段 | 无（只读模式） | 所有目录 |

**核心原则：** Review Agent **永远不得修改任何代码**。

---

## 4. 阶段锁检查机制

### 4.1 检查时机

**在以下情况下必须检查阶段锁：**
1. Program Agent 尝试修改文件时
2. Team Lead 尝试修改文件时（应该被拦截）
3. Review Agent 尝试修改文件时（应该被拦截）

### 4.2 检查逻辑

```bash
#!/bin/bash
# 阶段锁检查函数

check_phase_lock() {
  local file_path=$1
  local current_phase=$2
  local agent_role=$3
  
  # Team Lead 永远不得修改业务代码
  if [[ "$agent_role" == "project-agent" || "$agent_role" == "team-lead" ]]; then
    if [[ "$file_path" =~ ^(lib|app|types|components|supabase)/ ]]; then
      echo "❌ Team Lead 不允许修改业务代码: $file_path"
      return 1
    fi
  fi
  
  # Review Agent 永远不得修改任何代码
  if [[ "$agent_role" == "review-agent" ]]; then
    echo "❌ Review Agent 不允许修改任何代码: $file_path"
    return 1
  fi
  
  # Program Agent 检查阶段锁
  if [[ "$agent_role" == "program-agent" ]]; then
    case $current_phase in
      1)
        # 阶段 1: 后端骨架
        if [[ "$file_path" =~ ^(lib|types|app/api|supabase|docs)/ ]]; then
          return 0  # 允许
        elif [[ "$file_path" =~ ^(app/page\.tsx|app/layout\.tsx|components)/ ]]; then
          echo "❌ 阶段 1 不允许修改前端: $file_path"
          return 1
        fi
        ;;
      2)
        # 阶段 2: 前端骨架
        if [[ "$file_path" =~ ^(app|components|public|lib/utils|types/ui\.ts|docs)/ ]]; then
          return 0  # 允许
        elif [[ "$file_path" =~ ^(lib/agents|lib/graph|app/api)/ ]]; then
          echo "❌ 阶段 2 不允许修改后端: $file_path"
          return 1
        fi
        ;;
      3)
        # 阶段 3: 前后端联调
        if [[ "$file_path" =~ ^(app|components|lib/api|lib/hooks|types|docs)/ ]]; then
          return 0  # 允许
        elif [[ "$file_path" =~ ^(lib/agents|lib/graph|supabase/schema\.sql)/ ]]; then
          echo "⚠️  阶段 3 修改后端核心需要明确理由: $file_path"
          return 2  # 需要确认
        fi
        ;;
      4)
        # 阶段 4: 真实 AI 接入
        if [[ "$file_path" =~ ^(lib/ai|lib/agents|\.env\.example|docs)/ ]]; then
          return 0  # 允许
        elif [[ "$file_path" =~ ^(lib/graph|app|components)/ ]]; then
          echo "❌ 阶段 4 不允许修改工作流和前端: $file_path"
          return 1
        fi
        ;;
      5)
        # 阶段 5: Supabase 接入
        if [[ "$file_path" =~ ^(lib/supabase|lib/api|app/api|types/database\.ts|supabase|docs)/ ]]; then
          return 0  # 允许
        elif [[ "$file_path" =~ ^(lib/agents|lib/graph|app/page\.tsx|components)/ ]]; then
          echo "❌ 阶段 5 不允许修改 Agent 和前端: $file_path"
          return 1
        fi
        ;;
      6)
        # 阶段 6: 完整测试
        return 0  # 允许所有修改（但必须有理由）
        ;;
      *)
        echo "❌ 未知阶段: $current_phase"
        return 1
        ;;
    esac
  fi
  
  # 默认拒绝
  echo "❌ 阶段锁检查失败: $file_path (阶段 $current_phase, 角色 $agent_role)"
  return 1
}
```

### 4.3 集成到 Pre-Tool-Use Hook

在 `.claude/hooks/pre-tool-use.sh` 中添加：

```bash
# 读取当前阶段
CURRENT_PHASE=$(cat docs/PROJECT_STATUS.md | grep "当前阶段" | grep -oP '\d+')

# 检查阶段锁
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
  
  check_phase_lock "$FILE_PATH" "$CURRENT_PHASE" "$AGENT_ROLE"
  result=$?
  
  if [ $result -eq 1 ]; then
    exit 1  # 拦截
  elif [ $result -eq 2 ]; then
    exit 2  # 需要确认
  fi
fi
```

---

## 5. 阶段锁状态文件

### 5.1 文件位置

```
docs/PHASE_LOCK_STATUS.md
```

### 5.2 文件格式

```markdown
# 阶段锁状态

**当前阶段**: 1  
**阶段名称**: 后端多 Agent 骨架搭建  
**开始时间**: 2026-05-01 10:00:00  
**执行者**: Program Agent  
**状态**: 进行中

## 允许修改的目录

- `lib/`
- `types/`
- `app/api/`
- `supabase/`
- `docs/`

## 禁止修改的目录

- `app/page.tsx`
- `app/layout.tsx`
- `components/`
- `public/`

## 修改记录

| 时间 | 文件 | 操作 | 执行者 |
|------|------|------|--------|
| 2026-05-01 10:05:00 | lib/ai/client.ts | 创建 | Program Agent |
| 2026-05-01 10:10:00 | types/agent.ts | 创建 | Program Agent |
| 2026-05-01 10:15:00 | lib/agents/positioning.ts | 创建 | Program Agent |

## 阶段完成条件

- [ ] 所有文件创建完成
- [ ] `npm run build` 成功
- [ ] `npm run type-check` 无错误
- [ ] `npm run lint` 无错误
- [ ] Review Agent 审查通过
```

---

## 6. 阶段锁解除流程

### 6.1 解除条件

阶段锁只能在以下情况下解除：

1. ✅ Program Agent 完成所有任务
2. ✅ Program Agent 自验证通过
3. ✅ Review Agent 审查通过
4. ✅ Team Lead 确认完成

### 6.2 解除步骤

```markdown
1. Program Agent 报告完成
   → 更新 PHASE_LOCK_STATUS.md 状态为"待审查"

2. Review Agent 执行审查
   → 运行所有验证命令
   → 检查代码质量
   → 报告审查结果

3. 如果审查通过：
   → Review Agent 更新 PHASE_LOCK_STATUS.md 状态为"已完成"
   → Team Lead 解除阶段锁
   → Team Lead 更新 PROJECT_STATUS.md 进入下一阶段

4. 如果审查失败：
   → Review Agent 报告问题给 Team Lead
   → Team Lead 分配给 Program Agent 修复
   → 重复步骤 1-3
```

---

## 7. 违规处理

### 7.1 违规类型

**轻微违规：**
- Program Agent 修改了当前阶段允许但不推荐的文件
- 修改了文档格式但未改变内容

**中度违规：**
- Program Agent 修改了当前阶段禁止的目录
- Team Lead 修改了业务代码
- Review Agent 修改了任何代码

**严重违规：**
- 跨阶段修改核心文件
- 删除重要文件
- 修改数据库 Schema（非当前阶段）

### 7.2 处理措施

**轻微违规：**
1. 记录警告到 `docs/ERROR_LOG.md`
2. 继续执行

**中度违规：**
1. 立即停止操作
2. 记录到 `docs/ERROR_LOG.md`
3. 回滚违规修改（如果可能）
4. 报告用户

**严重违规：**
1. 立即终止所有操作
2. 记录到 `docs/ERROR_LOG.md`（标记为严重）
3. 锁定所有 Agent
4. 报告用户并等待指示

---

## 8. 总结

阶段锁规则确保开发过程**有序、可控、可追溯**。

**核心原则：**
1. 每个阶段只修改预定的目录
2. Team Lead 永远不修改业务代码
3. Review Agent 永远不修改任何代码
4. Program Agent 只修改当前阶段允许的目录
5. 阶段完成必须经过 Review Agent 审查

**实施要点：**
- 在 Pre-Tool-Use Hook 中集成阶段锁检查
- 维护 `docs/PHASE_LOCK_STATUS.md` 记录当前状态
- 所有修改记录到修改日志
- 违规行为立即停止并报告

---

**最后更新：** 2026-05-01  
**维护者：** Project Agent
