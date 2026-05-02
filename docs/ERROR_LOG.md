# 错误日志

**文档目的**: 记录开发过程中遇到的错误、解决方案和经验教训

---

## 错误记录格式

每个错误记录包含：
- **错误 ID**: 唯一标识符
- **发现时间**: 错误发现的时间
- **错误类型**: 构建错误/运行时错误/类型错误/安全问题等
- **严重程度**: 高/中/低
- **错误描述**: 详细的错误信息
- **影响范围**: 受影响的文件和功能
- **根本原因**: 错误的根本原因分析
- **解决方案**: 如何修复的
- **解决时间**: 错误解决的时间
- **经验教训**: 从这个错误中学到的经验

---

## 2026-05-01 - 阶段 0 审查与修复

### ERROR-001: Google Fonts 构建失败

**发现时间**: 2026-05-01  
**错误类型**: 构建错误  
**严重程度**: 高（阻塞构建）

**错误描述**:
```
Failed to fetch `Geist` from Google Fonts.
Failed to fetch `Geist Mono` from Google Fonts.
```

**影响范围**:
- 文件: `lawyer-content-platform/app/layout.tsx`
- 影响: 无法完成 `npm run build`，阻塞生产部署

**根本原因**:
- Next.js 在构建时尝试从 `fonts.googleapis.com` 下载 Geist 字体
- 当前网络环境无法访问 Google Fonts API
- 可能是防火墙、代理或网络限制导致

**解决方案**:
1. 注释掉 `next/font/google` 的导入
2. 注释掉 `Geist` 和 `Geist_Mono` 字体配置
3. 移除 HTML className 中的字体变量引用
4. 使用系统默认字体

**修改文件**:
- `lawyer-content-platform/app/layout.tsx` (第 2-14 行)

**解决时间**: 2026-05-01  
**解决人**: program-agent

**经验教训**:
1. **网络依赖风险**: 构建过程依赖外部网络资源（Google Fonts）会导致构建不稳定
2. **替代方案**: 
   - 使用本地字体文件
   - 使用系统字体
   - 配置字体 CDN 镜像
3. **最佳实践**: 关键资源应该本地化，避免构建时的网络依赖

---

### ERROR-002: LangGraph 无限循环风险

**发现时间**: 2026-05-01  
**错误类型**: 逻辑错误  
**严重程度**: 中（潜在风险）

**错误描述**:
- `shouldRewrite` 函数只检查 `review.score < 80`
- 没有检查 `retryCount` 是否超过 `maxRetries`
- 理论上可能导致无限循环（如果 score 一直 < 80）

**影响范围**:
- 文件: `lawyer-content-platform/lib/graph/edges.ts`
- 影响: Script 工作流可能陷入无限改写循环

**根本原因**:
- 初始实现只考虑了质量分数条件
- 忽略了重试次数限制
- 缺少防御性编程

**解决方案**:
在 `shouldRewrite` 函数中增加 `retryCount` 检查：
```typescript
export function shouldRewrite(state: WorkflowState): 'rewrite' | 'end' {
  const { review, retryCount = 0, maxRetries = 3 } = state;

  // 检查是否超过最大重试次数
  if (retryCount >= maxRetries) {
    console.log(`[shouldRewrite] 达到最大重试次数 ${maxRetries}，结束工作流`);
    return 'end';
  }

  // 检查评分是否需要改写
  if (review && review.score < 80) {
    console.log(`[shouldRewrite] 评分 ${review.score} < 80，需要改写`);
    return 'rewrite';
  }

  console.log('[shouldRewrite] 评分合格，结束工作流');
  return 'end';
}
```

**修改文件**:
- `lawyer-content-platform/lib/graph/edges.ts` (第 24-30 行)

**解决时间**: 2026-05-01  
**解决人**: program-agent

**经验教训**:
1. **防御性编程**: 所有循环都应该有明确的退出条件
2. **多重保护**: 不要只依赖单一条件，应该有多重保护机制
3. **边界检查**: 始终检查计数器是否超过限制
4. **日志记录**: 在关键决策点添加日志，便于调试

---

### ERROR-003: 数据库 Schema 不匹配（误报）

**发现时间**: 2026-05-01  
**错误类型**: 架构问题（误报）  
**严重程度**: 中

**错误描述**:
- review-agent 报告 `workflow.service.ts` 使用 `workflows` 表
- 但 `supabase/schema.sql` 中没有定义
- 可能导致运行时数据库查询失败

**影响范围**:
- 文件: `lawyer-content-platform/lib/services/workflow.service.ts`
- 文件: `lawyer-content-platform/supabase/schema.sql`

**根本原因**:
- **误报**: 实际上 `workflows` 表已经在 schema.sql 中定义（第 4-13 行）
- review-agent 可能没有正确读取文件

**解决方案**:
- 验证确认 `workflows` 表定义存在
- 无需修复

**解决时间**: 2026-05-01  
**解决人**: program-agent (验证)

**经验教训**:
1. **验证报告**: 审查报告也可能有误，需要人工验证
2. **文件检查**: 在报告问题前，应该先读取文件确认
3. **沟通重要**: Agent 之间应该明确沟通验证结果

---

## Lint 警告（非错误）

### WARN-001: 未使用的变量

**发现时间**: 2026-05-01  
**类型**: 代码质量警告  
**严重程度**: 低（不影响功能）

**警告详情**:
1. `app/api/health/route.ts:9` - `_request` 参数未使用
2. `lib/ai/mock.ts:23` - `_options` 参数未使用
3. `lib/ai/mock.ts:28` - `_userMessage` 变量未使用

**原因**:
- 这些是预留参数，用于未来扩展
- 使用下划线前缀表示有意未使用（TypeScript 惯例）

**处理方案**:
- 保持现状（符合 TypeScript 最佳实践）
- 或者完全移除参数（可选）

**状态**: 已接受（不修复）

---

### WARN-002: Next.js 多 lockfile 警告

**发现时间**: 2026-05-01  
**类型**: 构建警告  
**严重程度**: 低（不影响构建）

**警告详情**:
```
Multiple lockfiles detected. It is recommended to configure `turbopack.root` to the workspace root.
```

**原因**:
- 项目中存在多个 `package-lock.json` 文件
- Next.js 建议配置 `turbopack.root` 指向工作区根目录

**处理方案**:
- 可选：在 `next.config.ts` 中配置 `turbopack.root`
- 不影响构建，可以暂时忽略

**状态**: 已接受（不修复）

---

## 统计信息

### 错误统计
- **总错误数**: 3
- **已解决**: 2
- **误报**: 1
- **平均解决时间**: < 1 小时

### 严重程度分布
- **高**: 1 (33%)
- **中**: 2 (67%)
- **低**: 0 (0%)

### 错误类型分布
- **构建错误**: 1 (33%)
- **逻辑错误**: 1 (33%)
- **架构问题**: 1 (33%)

---

**文档维护**: 每次遇到错误后更新本文档
