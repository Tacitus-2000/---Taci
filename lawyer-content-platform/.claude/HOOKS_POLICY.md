# Hook 策略配置

## 1. 概述

本文档定义了 Claude Code Hooks 的配置策略，用于在工具调用前后自动执行检查和拦截。

**Hook 类型：**
- **Pre-Tool-Use Hook**: 在工具调用前执行，可以拦截危险操作
- **Post-Tool-Use Hook**: 在工具调用后执行，可以记录操作日志
- **User-Prompt-Submit Hook**: 在用户提交消息前执行，可以注入上下文

**注意：** 本文档是**设计方案**，需要在 Claude Code 设置中手动配置。

---

## 2. Pre-Tool-Use Hook 设计

### 2.1 Hook 脚本位置

```
.claude/hooks/pre-tool-use.sh    # Bash/Linux/macOS
.claude/hooks/pre-tool-use.ps1   # PowerShell/Windows
```

### 2.2 Hook 输入参数

Claude Code 会传递以下参数给 Hook：

```bash
$1 = TOOL_NAME        # 工具名称（如 "Edit", "Bash", "Write"）
$2 = TOOL_ARGS_JSON   # 工具参数（JSON 格式）
$3 = AGENT_ROLE       # 当前 Agent 角色（如果可识别）
```

### 2.3 Hook 返回值

- **Exit 0**: 允许执行
- **Exit 1**: 拦截操作，显示错误消息
- **Exit 2**: 需要用户确认

### 2.4 Bash 实现示例

```bash
#!/bin/bash
# .claude/hooks/pre-tool-use.sh

TOOL_NAME=$1
TOOL_ARGS_JSON=$2
AGENT_ROLE=$3

# 日志函数
log_blocked() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') | BLOCKED | $TOOL_NAME | $1" >> .claude/hooks/blocked.log
}

log_confirm() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') | CONFIRM | $TOOL_NAME | $1" >> .claude/hooks/confirm.log
}

# ============================================
# 规则 1: 禁止 Team Lead 修改业务代码
# ============================================
if [[ "$AGENT_ROLE" == "project-agent" || "$AGENT_ROLE" == "team-lead" ]]; then
  if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
    # 提取文件路径
    FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
    
    # 检查是否是业务代码路径
    if [[ "$FILE_PATH" =~ ^(lib|app|types|supabase|components)/ ]]; then
      echo "❌ Team Lead 不允许修改业务代码: $FILE_PATH"
      echo "💡 请将此任务分配给 Program Agent"
      log_blocked "Team Lead attempted to modify business code: $FILE_PATH"
      exit 1
    fi
  fi
fi

# ============================================
# 规则 2: 禁止 Review Agent 修改业务代码
# ============================================
if [[ "$AGENT_ROLE" == "review-agent" ]]; then
  if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
    FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
    
    if [[ "$FILE_PATH" =~ ^(lib|app|types|supabase|components)/ ]]; then
      echo "❌ Review Agent 不允许修改业务代码: $FILE_PATH"
      echo "💡 请将修复任务报告给 Team Lead，由 Program Agent 执行"
      log_blocked "Review Agent attempted to modify business code: $FILE_PATH"
      exit 1
    fi
  fi
fi

# ============================================
# 规则 3: 禁止修改 .env 文件
# ============================================
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
  
  if [[ "$FILE_PATH" =~ \.env ]]; then
    echo "❌ 禁止修改环境变量文件: $FILE_PATH"
    echo "💡 请手动编辑 .env 文件"
    log_blocked "Attempted to modify .env file: $FILE_PATH"
    exit 1
  fi
fi

# ============================================
# 规则 4: 禁止危险的 Git 操作
# ============================================
if [[ "$TOOL_NAME" == "Bash" ]]; then
  COMMAND=$(echo "$TOOL_ARGS_JSON" | jq -r '.command // empty')
  
  # 完全禁止的命令
  if [[ "$COMMAND" =~ "git push --force" ]] || \
     [[ "$COMMAND" =~ "git push -f" ]] || \
     [[ "$COMMAND" =~ "git reset --hard" ]] || \
     [[ "$COMMAND" =~ "git clean -f" ]] || \
     [[ "$COMMAND" =~ "rm -rf /" ]]; then
    echo "❌ 禁止执行危险命令: $COMMAND"
    log_blocked "Dangerous command blocked: $COMMAND"
    exit 1
  fi
  
  # 需要确认的命令
  if [[ "$COMMAND" =~ "git commit" ]] || \
     [[ "$COMMAND" =~ "git push" ]] || \
     [[ "$COMMAND" =~ "npm install" ]] || \
     [[ "$COMMAND" =~ "npm uninstall" ]]; then
    echo "⚠️  需要用户确认: $COMMAND"
    log_confirm "Command requires confirmation: $COMMAND"
    exit 2
  fi
fi

# ============================================
# 规则 5: 禁止 Team Lead 执行验证命令
# ============================================
if [[ "$AGENT_ROLE" == "project-agent" || "$AGENT_ROLE" == "team-lead" ]]; then
  if [[ "$TOOL_NAME" == "Bash" ]]; then
    COMMAND=$(echo "$TOOL_ARGS_JSON" | jq -r '.command // empty')
    
    if [[ "$COMMAND" =~ "npm run build" ]] || \
       [[ "$COMMAND" =~ "npm run lint" ]] || \
       [[ "$COMMAND" =~ "npm run type-check" ]] || \
       [[ "$COMMAND" =~ "npm test" ]]; then
      echo "❌ Team Lead 不允许执行验证命令: $COMMAND"
      echo "💡 请将验证任务分配给 Review Agent"
      log_blocked "Team Lead attempted to run validation: $COMMAND"
      exit 1
    fi
  fi
fi

# ============================================
# 规则 6: 保护关键配置文件
# ============================================
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
  
  # 需要确认的配置文件
  if [[ "$FILE_PATH" =~ ^(package\.json|tsconfig\.json|next\.config\.ts|tailwind\.config\.ts)$ ]]; then
    echo "⚠️  修改关键配置文件需要确认: $FILE_PATH"
    log_confirm "Config file modification requires confirmation: $FILE_PATH"
    exit 2
  fi
fi

# ============================================
# 规则 7: 禁止删除重要目录
# ============================================
if [[ "$TOOL_NAME" == "Bash" ]]; then
  COMMAND=$(echo "$TOOL_ARGS_JSON" | jq -r '.command // empty')
  
  if [[ "$COMMAND" =~ "rm -rf node_modules" ]] || \
     [[ "$COMMAND" =~ "rm -rf .next" ]] || \
     [[ "$COMMAND" =~ "rm -rf .git" ]]; then
    echo "⚠️  删除重要目录需要确认: $COMMAND"
    log_confirm "Directory deletion requires confirmation: $COMMAND"
    exit 2
  fi
fi

# 默认允许
exit 0
```

### 2.5 PowerShell 实现示例

```powershell
# .claude/hooks/pre-tool-use.ps1

param(
    [string]$ToolName,
    [string]$ToolArgsJson,
    [string]$AgentRole
)

# 日志函数
function Log-Blocked {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp | BLOCKED | $ToolName | $Message" | Out-File -Append .claude\hooks\blocked.log
}

function Log-Confirm {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp | CONFIRM | $ToolName | $Message" | Out-File -Append .claude\hooks\confirm.log
}

# 解析 JSON 参数
$ToolArgs = $ToolArgsJson | ConvertFrom-Json

# ============================================
# 规则 1: 禁止 Team Lead 修改业务代码
# ============================================
if ($AgentRole -eq "project-agent" -or $AgentRole -eq "team-lead") {
    if ($ToolName -eq "Edit" -or $ToolName -eq "Write") {
        $FilePath = $ToolArgs.file_path ?? $ToolArgs.path
        
        if ($FilePath -match "^(lib|app|types|supabase|components)[/\\]") {
            Write-Host "❌ Team Lead 不允许修改业务代码: $FilePath"
            Write-Host "💡 请将此任务分配给 Program Agent"
            Log-Blocked "Team Lead attempted to modify business code: $FilePath"
            exit 1
        }
    }
}

# ============================================
# 规则 2: 禁止 Review Agent 修改业务代码
# ============================================
if ($AgentRole -eq "review-agent") {
    if ($ToolName -eq "Edit" -or $ToolName -eq "Write") {
        $FilePath = $ToolArgs.file_path ?? $ToolArgs.path
        
        if ($FilePath -match "^(lib|app|types|supabase|components)[/\\]") {
            Write-Host "❌ Review Agent 不允许修改业务代码: $FilePath"
            Write-Host "💡 请将修复任务报告给 Team Lead，由 Program Agent 执行"
            Log-Blocked "Review Agent attempted to modify business code: $FilePath"
            exit 1
        }
    }
}

# ============================================
# 规则 3: 禁止修改 .env 文件
# ============================================
if ($ToolName -eq "Edit" -or $ToolName -eq "Write") {
    $FilePath = $ToolArgs.file_path ?? $ToolArgs.path
    
    if ($FilePath -match "\.env") {
        Write-Host "❌ 禁止修改环境变量文件: $FilePath"
        Write-Host "💡 请手动编辑 .env 文件"
        Log-Blocked "Attempted to modify .env file: $FilePath"
        exit 1
    }
}

# ============================================
# 规则 4: 禁止危险的 Git 操作
# ============================================
if ($ToolName -eq "Bash") {
    $Command = $ToolArgs.command
    
    # 完全禁止的命令
    if ($Command -match "git push --force" -or
        $Command -match "git push -f" -or
        $Command -match "git reset --hard" -or
        $Command -match "git clean -f" -or
        $Command -match "rm -rf /") {
        Write-Host "❌ 禁止执行危险命令: $Command"
        Log-Blocked "Dangerous command blocked: $Command"
        exit 1
    }
    
    # 需要确认的命令
    if ($Command -match "git commit" -or
        $Command -match "git push" -or
        $Command -match "npm install" -or
        $Command -match "npm uninstall") {
        Write-Host "⚠️  需要用户确认: $Command"
        Log-Confirm "Command requires confirmation: $Command"
        exit 2
    }
}

# 默认允许
exit 0
```

---

## 3. Post-Tool-Use Hook 设计

### 3.1 Hook 脚本位置

```
.claude/hooks/post-tool-use.sh    # Bash
.claude/hooks/post-tool-use.ps1   # PowerShell
```

### 3.2 Hook 输入参数

```bash
$1 = TOOL_NAME        # 工具名称
$2 = TOOL_ARGS_JSON   # 工具参数
$3 = TOOL_RESULT      # 工具执行结果
$4 = EXIT_CODE        # 退出码（0=成功，非0=失败）
```

### 3.3 Bash 实现示例

```bash
#!/bin/bash
# .claude/hooks/post-tool-use.sh

TOOL_NAME=$1
TOOL_ARGS_JSON=$2
TOOL_RESULT=$3
EXIT_CODE=$4

# 记录所有工具调用
LOG_FILE=".claude/hooks/tool-usage.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "$TIMESTAMP | $TOOL_NAME | Exit $EXIT_CODE" >> "$LOG_FILE"

# 如果是文件修改，记录详细信息
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  FILE_PATH=$(echo "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty')
  echo "  → Modified: $FILE_PATH" >> "$LOG_FILE"
fi

# 如果是命令执行，记录命令
if [[ "$TOOL_NAME" == "Bash" ]]; then
  COMMAND=$(echo "$TOOL_ARGS_JSON" | jq -r '.command // empty')
  echo "  → Command: $COMMAND" >> "$LOG_FILE"
fi

exit 0
```

---

## 4. User-Prompt-Submit Hook 设计

### 4.1 Hook 脚本位置

```
.claude/hooks/user-prompt-submit.sh    # Bash
.claude/hooks/user-prompt-submit.ps1   # PowerShell
```

### 4.2 Hook 用途

在用户提交消息前，自动注入上下文信息：

- 当前 Agent 角色
- 当前阶段锁状态
- 最近的错误日志
- 项目状态摘要

### 4.3 Bash 实现示例

```bash
#!/bin/bash
# .claude/hooks/user-prompt-submit.sh

USER_MESSAGE=$1

# 检测 Agent 角色（基于消息内容）
AGENT_ROLE=""
if [[ "$USER_MESSAGE" =~ "@project-agent" ]]; then
  AGENT_ROLE="project-agent"
elif [[ "$USER_MESSAGE" =~ "@program-agent" ]]; then
  AGENT_ROLE="program-agent"
elif [[ "$USER_MESSAGE" =~ "@review-agent" ]]; then
  AGENT_ROLE="review-agent"
fi

# 如果检测到 Agent 角色，注入上下文
if [[ -n "$AGENT_ROLE" ]]; then
  echo ""
  echo "<!-- Auto-injected context -->"
  echo "**Current Agent Role**: $AGENT_ROLE"
  echo ""
  
  # 读取角色权限
  if [[ "$AGENT_ROLE" == "project-agent" ]]; then
    echo "**Allowed Operations**: Read files, Update docs, Start agents, Request confirmation"
    echo "**Forbidden Operations**: Modify business code, Run validation, Fix errors"
  elif [[ "$AGENT_ROLE" == "program-agent" ]]; then
    echo "**Allowed Operations**: Modify business code, Run validation, Install dependencies"
    echo "**Forbidden Operations**: Modify project docs, Git operations"
  elif [[ "$AGENT_ROLE" == "review-agent" ]]; then
    echo "**Allowed Operations**: Read files, Run validation, Report issues"
    echo "**Forbidden Operations**: Modify any code, Install dependencies"
  fi
  
  echo "<!-- End auto-injected context -->"
fi

exit 0
```

---

## 5. Hook 配置文件

### 5.1 配置文件位置

```
.claude/hooks/config.json
```

### 5.2 配置文件格式

```json
{
  "hooks": {
    "pre-tool-use": {
      "enabled": true,
      "script": ".claude/hooks/pre-tool-use.sh",
      "timeout": 5000,
      "on_error": "block"
    },
    "post-tool-use": {
      "enabled": true,
      "script": ".claude/hooks/post-tool-use.sh",
      "timeout": 3000,
      "on_error": "log"
    },
    "user-prompt-submit": {
      "enabled": false,
      "script": ".claude/hooks/user-prompt-submit.sh",
      "timeout": 2000,
      "on_error": "ignore"
    }
  },
  "logging": {
    "enabled": true,
    "log_dir": ".claude/hooks/logs",
    "max_log_size": "10MB",
    "retention_days": 30
  },
  "agent_detection": {
    "enabled": true,
    "patterns": {
      "project-agent": ["@project-agent", "Team Lead"],
      "program-agent": ["@program-agent", "Program Agent"],
      "review-agent": ["@review-agent", "Review Agent"]
    }
  }
}
```

---

## 6. Hook 测试

### 6.1 测试脚本

```bash
#!/bin/bash
# .claude/hooks/test-hooks.sh

echo "Testing Pre-Tool-Use Hook..."

# 测试 1: Team Lead 修改业务代码（应该被拦截）
echo "Test 1: Team Lead modifying business code"
.claude/hooks/pre-tool-use.sh "Edit" '{"file_path":"lib/ai/client.ts"}' "project-agent"
if [ $? -eq 1 ]; then
  echo "✅ Test 1 passed: Blocked as expected"
else
  echo "❌ Test 1 failed: Should have been blocked"
fi

# 测试 2: Program Agent 修改业务代码（应该允许）
echo "Test 2: Program Agent modifying business code"
.claude/hooks/pre-tool-use.sh "Edit" '{"file_path":"lib/ai/client.ts"}' "program-agent"
if [ $? -eq 0 ]; then
  echo "✅ Test 2 passed: Allowed as expected"
else
  echo "❌ Test 2 failed: Should have been allowed"
fi

# 测试 3: 修改 .env 文件（应该被拦截）
echo "Test 3: Modifying .env file"
.claude/hooks/pre-tool-use.sh "Edit" '{"file_path":".env"}' "program-agent"
if [ $? -eq 1 ]; then
  echo "✅ Test 3 passed: Blocked as expected"
else
  echo "❌ Test 3 failed: Should have been blocked"
fi

# 测试 4: git push --force（应该被拦截）
echo "Test 4: Dangerous git command"
.claude/hooks/pre-tool-use.sh "Bash" '{"command":"git push --force"}' "program-agent"
if [ $? -eq 1 ]; then
  echo "✅ Test 4 passed: Blocked as expected"
else
  echo "❌ Test 4 failed: Should have been blocked"
fi

# 测试 5: npm install（应该需要确认）
echo "Test 5: npm install command"
.claude/hooks/pre-tool-use.sh "Bash" '{"command":"npm install lodash"}' "program-agent"
if [ $? -eq 2 ]; then
  echo "✅ Test 5 passed: Requires confirmation as expected"
else
  echo "❌ Test 5 failed: Should require confirmation"
fi

echo ""
echo "All tests completed!"
```

### 6.2 运行测试

```bash
chmod +x .claude/hooks/test-hooks.sh
./.claude/hooks/test-hooks.sh
```

---

## 7. Hook 调试

### 7.1 启用调试模式

在 Hook 脚本开头添加：

```bash
#!/bin/bash
set -x  # 启用调试输出
```

### 7.2 查看日志

```bash
# 查看拦截日志
cat .claude/hooks/blocked.log

# 查看确认日志
cat .claude/hooks/confirm.log

# 查看工具使用日志
cat .claude/hooks/tool-usage.log
```

### 7.3 实时监控

```bash
# 实时监控拦截日志
tail -f .claude/hooks/blocked.log

# 实时监控所有日志
tail -f .claude/hooks/*.log
```

---

## 8. Hook 性能优化

### 8.1 缓存机制

对于频繁检查的规则，使用缓存：

```bash
# 缓存文件路径检查结果
CACHE_FILE=".claude/hooks/cache/path-check.cache"

check_path_cached() {
  local path=$1
  local cache_key=$(echo "$path" | md5sum | cut -d' ' -f1)
  
  if [ -f "$CACHE_FILE" ]; then
    cached_result=$(grep "^$cache_key:" "$CACHE_FILE" | cut -d':' -f2)
    if [ -n "$cached_result" ]; then
      return $cached_result
    fi
  fi
  
  # 执行实际检查
  # ...
  
  # 保存到缓存
  echo "$cache_key:$result" >> "$CACHE_FILE"
  return $result
}
```

### 8.2 超时控制

```bash
# 设置 Hook 超时时间
timeout 5s .claude/hooks/pre-tool-use.sh "$@"
if [ $? -eq 124 ]; then
  echo "⚠️  Hook timeout, allowing operation"
  exit 0
fi
```

---

## 9. Hook 维护

### 9.1 定期清理日志

```bash
#!/bin/bash
# .claude/hooks/cleanup-logs.sh

# 删除 30 天前的日志
find .claude/hooks/logs -name "*.log" -mtime +30 -delete

# 压缩 7 天前的日志
find .claude/hooks/logs -name "*.log" -mtime +7 -exec gzip {} \;
```

### 9.2 Hook 版本管理

在 Hook 脚本开头添加版本信息：

```bash
#!/bin/bash
# Version: 1.0.0
# Last Updated: 2026-05-01
# Maintainer: Project Agent
```

---

## 10. 总结

Hook 策略是 Agent Harness 的核心执行机制。

**关键优势：**
- ✅ 自动拦截违规操作
- ✅ 无需修改 Claude Code 源码
- ✅ 可自定义规则
- ✅ 可追溯所有操作

**实施步骤：**
1. 创建 Hook 脚本
2. 配置 Claude Code 设置
3. 运行测试验证
4. 启用生产环境
5. 持续监控和优化

**注意事项：**
- Hook 脚本必须可执行（`chmod +x`）
- Hook 超时会导致操作被允许（fail-open）
- Hook 日志会占用磁盘空间，需要定期清理
- Hook 规则应该简单高效，避免复杂逻辑

---

**最后更新：** 2026-05-01  
**维护者：** Project Agent
