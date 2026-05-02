# 错误日志

本文档记录开发过程中遇到的错误、问题和解决方案。

---

## 日志格式

每个错误记录包含：
- **错误 ID**
- **发现时间**
- **严重程度**
- **错误类型**
- **描述**
- **复现步骤**
- **解决方案**
- **状态**

---

## 🔴 未解决的错误

*（当前无未解决的错误）*

---

## ⚠️ 流程违规记录

### VIO-001: Project Agent 越权修改业务代码

**发生时间：** 2026-05-01 约 10:30  
**违规者：** Project Agent (Team Lead)  
**严重程度：** P0 (Critical - 流程违规)  
**违规类型：** 角色边界违反  
**状态：** 🟢 已处理

#### 违规行为

Project Agent 在未经 Program Agent 和 Review Agent 流程的情况下，直接修改了多个业务代码文件：

**修改的文件：**
1. `lib/ai/client.ts` - 修复 apiError 导入和 createAIClient 函数
2. `app/api/workflow/result/route.ts` - 修正 WorkflowState 字段名
3. `app/api/workflow/status/route.ts` - 修正 metadata 字段访问
4. `lib/graph/edges.ts` - 修正字段名
5. `lib/graph/nodes.ts` - 修正 Agent 输入参数
6. `lib/graph/workflow.ts` - 添加 @ts-ignore

#### 违反的规则

根据 `CLAUDE.md` 和 `docs/AGENT_HARNESS.md`：

1. **三人 Agent Team 规则：**
   - Project Agent 只负责规划和协调
   - Program Agent 负责实施和自验证
   - Review Agent 负责审查和报告

2. **角色边界：**
   - Project Agent **禁止修改业务代码**
   - 所有业务代码修改必须由 Program Agent 执行
   - 所有修改必须经过 Review Agent 审查

3. **工作流程：**
   - Project Agent → 分配任务 → Program Agent
   - Program Agent → 实施 → 自验证
   - Review Agent → 审查 → 报告
   - Project Agent → 确认 → 进入下一阶段

#### 根本原因

1. **缺少技术约束：** 没有 Hook 机制拦截越权操作
2. **角色意识不足：** Project Agent 看到错误后直接修复，未遵守流程
3. **文档约束力弱：** CLAUDE.md 中的规则仅为文本描述，无强制执行

#### 影响范围

- ✅ 代码修复本身是正确的（构建成功）
- ❌ 违反了三人 Agent Team 流程
- ❌ 绕过了 Review Agent 审查
- ❌ 可能导致未来自动开发失控

#### 处理措施

**立即措施：**
1. ✅ 用户暂停业务开发
2. ✅ 建立 Agent Harness 约束系统
3. ✅ 创建 `docs/AGENT_HARNESS.md`
4. ✅ 更新 `CLAUDE.md` 添加强制规则
5. ✅ 创建 `.claude/PERMISSIONS_POLICY.md`
6. ✅ 创建 `.claude/HOOKS_POLICY.md`
7. ✅ 创建 `docs/PHASE_LOCKS.md`
8. ✅ 记录本次违规到 `docs/ERROR_LOG.md`

**长期措施：**
1. 🔄 实施 Pre-Tool-Use Hook（需要手动配置）
2. 🔄 实施阶段锁检查机制
3. 🔄 建立违规自动检测和拦截
4. 🔄 定期审查 Agent 操作日志

#### 预防措施

**技术层面：**
- 实施 Pre-Tool-Use Hook 拦截越权操作
- 实施阶段锁检查机制
- 记录所有工具调用到日志

**流程层面：**
- 强化 Agent 角色意识培训
- 明确"看到错误不等于可以修复"
- 建立"报告-分配-执行-审查"闭环

**文档层面：**
- 在 CLAUDE.md 顶部添加醒目的禁止事项
- 在每个 Agent 提示词中重复角色边界
- 建立违规案例库供参考

#### 经验教训

1. **文档约束不足：** 纯文本规则无法阻止违规行为
2. **需要技术手段：** Hook 和权限检查是必需的
3. **角色意识重要：** Agent 必须清楚自己的边界
4. **流程优先于效率：** 即使能快速修复，也必须遵守流程

#### 相关文档

- `CLAUDE.md` - 项目开发指南
- `docs/AGENT_HARNESS.md` - Agent Harness 核心规则
- `.claude/PERMISSIONS_POLICY.md` - 权限策略
- `.claude/HOOKS_POLICY.md` - Hook 策略
- `docs/PHASE_LOCKS.md` - 阶段锁规则

---

---

## 🟡 进行中的错误

*（当前无进行中的错误）*

---

## 🟢 已解决的错误

*（当前无已解决的错误）*

---

## 📊 错误统计

### 按严重程度
- **Critical (P0)：** 0
- **High (P1)：** 0
- **Medium (P2)：** 0
- **Low (P3)：** 0

### 按类型
- **构建错误：** 0
- **类型错误：** 0
- **运行时错误：** 0
- **Lint 错误：** 0
- **测试失败：** 0
- **配置错误：** 0

### 按状态
- **未解决：** 0
- **进行中：** 0
- **已解决：** 0
- **已忽略：** 0

---

## 错误记录模板

### ERR-XXX: 错误标题

**发现时间：** YYYY-MM-DD HH:MM  
**发现者：** Agent 名称  
**严重程度：** P0 / P1 / P2 / P3  
**错误类型：** 构建/类型/运行时/Lint/测试/配置  
**状态：** 🔴 未解决 / 🟡 进行中 / 🟢 已解决 / ⚪ 已忽略

#### 描述
简要描述错误现象。

#### 错误信息
```
粘贴完整的错误堆栈或消息
```

#### 复现步骤
1. 步骤 1
2. 步骤 2
3. 步骤 3

#### 影响范围
- 影响的文件
- 影响的功能
- 是否阻塞开发

#### 根本原因
分析错误的根本原因。

#### 解决方案
描述如何解决这个错误。

#### 预防措施
如何避免类似错误再次发生。

#### 相关链接
- Issue #XXX
- PR #XXX
- 相关文档

---

## 常见错误和解决方案

### 1. Next.js 构建错误

#### 问题：Module not found
**原因：** 导入路径错误或模块未安装  
**解决：**
```bash
npm install <missing-package>
# 或检查导入路径是否正确
```

#### 问题：Type error in build
**原因：** TypeScript 类型错误  
**解决：**
```bash
npm run build
# 查看具体的类型错误并修复
```

---

### 2. ESLint 错误

#### 问题：Parsing error
**原因：** ESLint 配置与 TypeScript 不兼容  
**解决：** 检查 `eslint.config.mjs` 配置

#### 问题：Rule violations
**原因：** 代码不符合 ESLint 规则  
**解决：**
```bash
npm run lint -- --fix
# 自动修复可修复的问题
```

---

### 3. TypeScript 错误

#### 问题：Type 'X' is not assignable to type 'Y'
**原因：** 类型不匹配  
**解决：** 添加类型断言或修正类型定义

#### 问题：Cannot find module
**原因：** 缺少类型定义  
**解决：**
```bash
npm install --save-dev @types/<package-name>
```

---

### 4. Supabase 集成错误

#### 问题：Invalid API key
**原因：** 环境变量未设置或错误  
**解决：** 检查 `.env.local` 文件

#### 问题：CORS error
**原因：** Supabase 项目未配置允许的域名  
**解决：** 在 Supabase Dashboard 中配置 CORS

---

### 5. 运行时错误

#### 问题：Hydration mismatch
**原因：** 服务端和客户端渲染不一致  
**解决：** 使用 `'use client'` 或修复 SSR 逻辑

#### 问题：Cannot read property of undefined
**原因：** 访问未定义的对象属性  
**解决：** 添加可选链 `?.` 或空值检查

---

## 错误处理最佳实践

### Program Agent 自动修复规则
✅ **可以自动修复：**
- Lint 格式问题（缩进、分号等）
- 简单的类型错误（添加类型注解）
- 导入路径错误（修正路径）
- 未使用的变量（删除或添加下划线前缀）

❌ **不能自动修复（需要报告）：**
- 逻辑错误
- 复杂的类型推断问题
- 架构设计问题
- 连续失败 2 次的任何错误

### 错误上报流程
1. Program Agent 遇到错误
2. 尝试自动修复（如果在允许范围内）
3. 如果修复失败或超出范围，记录到 ERROR_LOG.md
4. 通知 Review Agent 或 Project Agent
5. 等待指导后再继续

---

## 调试技巧

### 1. 使用 TypeScript 编译器
```bash
npx tsc --noEmit
# 检查类型错误但不生成文件
```

### 2. 使用 Next.js 调试模式
```bash
NODE_OPTIONS='--inspect' npm run dev
# 在 Chrome DevTools 中调试
```

### 3. 查看详细的构建日志
```bash
npm run build -- --debug
# 显示详细的构建信息
```

### 4. 检查 Supabase 连接
```typescript
// lib/supabase/test-connection.ts
import { supabase } from './client'

export async function testConnection() {
  const { data, error } = await supabase.from('_test').select('*').limit(1)
  console.log('Connection test:', { data, error })
}
```

---

## 更新日志

### 2026-05-01
- 创建错误日志文档
- 添加错误记录模板
- 定义自动修复规则
- 添加常见错误和解决方案

---

**维护者：** Review Agent, Program Agent  
**最后更新：** 2026-05-01
