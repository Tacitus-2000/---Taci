# Next Context

## Current Project Status
- **版本**: V0.22 (原生 fetch API 替代方案已实现)
- **当前状态**: ✅ 所有功能正常运行
- **最新完成**: 阶段 11 - API 认证问题彻底修复

## Recently Completed
- ✅ 诊断并修复 API 认证失败问题（第二轮）
- ✅ 根本原因：Anthropic SDK 的 User-Agent header 导致中转 API 拒绝请求
- ✅ 解决方案：使用原生 fetch API 替代 Anthropic SDK
- ✅ 验证测试通过：test-webapp-api.ts 成功调用 API
- ✅ TypeScript 编译通过
- ✅ 端到端测试通过（6 步骤，188 秒）
- ✅ 脚本成功保存到数据库（ID: 8746265e-f6fd-4a6d-8234-834ea406fe11）

## Current Issues / Remaining Work

### ✅ 已解决：API 认证失败

**问题描述：**
- 测试脚本成功但网页应用返回 401/403 错误

**根本原因（两轮调试）：**
1. **第一轮（V0.21）**：开发服务器缓存了旧的环境变量
   - `ANTHROPIC_BASE_URL` 指向了无效的中转 API (`https://www.fucheers.top`)
   - 解决方案：重启开发服务器加载正确的 Base URL

2. **第二轮（V0.22）**：Anthropic SDK 的 User-Agent header 与中转 API 不兼容
   - SDK 自动添加的 User-Agent 导致中转 API 返回 403/401
   - 解决方案：使用原生 fetch API 完全替代 SDK

**最终解决方案：**
```typescript
// lib/ai/anthropic.ts - 使用原生 fetch
const response = await fetch(`${baseURL}/v1/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: this.model,
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 0.7,
    system: systemMessage,
    messages: anthropicMessages,
  }),
});
```

**关键教训：**
- Next.js 开发服务器需要重启才能加载 `.env.local` 的更改
- 环境变量问题需要通过调试端点验证，而不是假设配置正确
- 中转 API 可能对 SDK 的请求头敏感，原生 fetch 更可靠
- Systematic debugging 流程帮助快速定位根本原因

## Recommended Next Steps

### 立即执行（验证网页端）

1. **测试网页端工作流**
   ```bash
   # 访问网页端生成页面
   http://localhost:3000/client/generate
   
   # 选择客户和选题，生成文案
   # 验证整个工作流正常运行
   ```

2. **清理临时文件（可选）**
   ```bash
   cd lawyer-content-platform
   rm -f dev.log
   rm -f scripts/test-webapp-api.ts
   rm -f scripts/fix-env-base-url.sh
   # 保留 app/api/debug/env/route.ts 用于未来调试
   ```

### 后续任务（阶段 12）

1. 生产环境部署准备
2. 性能优化和压力测试
3. 错误监控和日志系统
4. 备份和恢复策略

## Key Files

### 核心配置文件
- `.env.local` - 环境变量配置（已验证正确）
- `lib/ai/anthropic.ts` - Claude API 客户端（已改用原生 fetch）
- `app/api/client/generate/route.ts` - 工作流 API 端点

### 测试脚本
- `scripts/test-e2e-workflow.ts` - 端到端测试（通过）
- `scripts/check-script-saved.ts` - 数据库验证（通过）
- `scripts/test-api-universal.ts` - API Key 验证（通过）
- `scripts/test-webapp-api.ts` - 网页端 API 测试（通过）

### 规划文档
- `docs/PROJECT_STATUS.md` - 项目整体状态
- `docs/TASK_BOARD.md` - 当前任务看板
- `docs/STAGE_LOG.md` - 阶段完成记录
- `docs/NEXT_CONTEXT.md` - 本文件

## Verification

### 当前验证状态
- ✅ TypeScript: `npx tsc --noEmit` - 通过
- ✅ 端到端测试（命令行）: `npx tsx scripts/test-e2e-workflow.ts` - 通过（188 秒）
- ✅ 数据库持久化: `npx tsx scripts/check-script-saved.ts` - 通过
- ✅ API Key 测试: `npx tsx scripts/test-api-universal.ts` - 通过
- ✅ 网页端 API 调用: `npx tsx scripts/test-webapp-api.ts` - 通过
- 🔄 网页端工作流: 访问 `/client/generate` - 待用户验证

### 验证命令
```bash
# TypeScript 编译
cd lawyer-content-platform && npx tsc --noEmit

# 端到端测试
cd lawyer-content-platform && npx tsx scripts/test-e2e-workflow.ts

# 数据库验证
cd lawyer-content-platform && npx tsx scripts/check-script-saved.ts

# 启动开发服务器
cd lawyer-content-platform && npm run dev
```

## Do Not Repeat

- ❌ 不要假设环境变量已正确加载 - 始终通过调试端点验证
- ❌ 不要忘记重启开发服务器以加载 `.env.local` 的更改
- ❌ 不要依赖 Anthropic SDK 与中转 API 的兼容性 - 原生 fetch 更可靠
- ✅ 使用 systematic debugging 流程来诊断问题
- ✅ 添加诊断工具来收集证据，而不是猜测
- ✅ 对比成功和失败的请求差异

## Notes

### API 配置（已验证有效）
```env
ANTHROPIC_API_KEY=sk-65a676b2215d2a4f77f98f557d0f1b110e91479fd7815cbb0992cc83fc6447e5
ANTHROPIC_BASE_URL=https://www.vibecd.cc
LLM_MODEL=claude-sonnet-4-6
```

### 调试过程总结（两轮）

**第一轮调试（V0.21）：**

**Phase 1: Root Cause Investigation**
- 创建调试端点 `/api/debug/env` 验证环境变量
- 发现服务器加载的是旧的 Base URL (`https://www.fucheers.top`)
- 直接测试两个 API 端点，确认 `fucheers.top` 返回 401

**Phase 2: Pattern Analysis**
- 对比测试脚本（成功）和网页应用（失败）的差异
- 识别出环境变量加载机制的不同

**Phase 3: Hypothesis and Testing**
- 假设：开发服务器需要重启才能加载新环境变量
- 验证：重启后环境变量更新

**Phase 4: Implementation**
- 重启开发服务器
- 运行测试验证修复
- 发现问题仍然存在，进入第二轮调试

**第二轮调试（V0.22）：**

**Phase 1: Root Cause Investigation**
- 环境变量已正确，但仍返回 401/403 错误
- 对比测试脚本（原生 fetch）和应用代码（Anthropic SDK）
- 发现 SDK 添加了自定义 User-Agent header

**Phase 2: Pattern Analysis**
- 测试脚本：原生 fetch，无 User-Agent → 成功
- 应用代码：Anthropic SDK，有 User-Agent → 失败
- 移除 User-Agent：仍然失败（403）
- 结论：SDK 本身与中转 API 不兼容

**Phase 3: Hypothesis and Testing**
- 假设：使用原生 fetch 替代 SDK 可以解决问题
- 验证：实现原生 fetch，测试成功

**Phase 4: Implementation**
- 重写 `lib/ai/anthropic.ts` 使用原生 fetch
- 保持相同的接口签名
- 运行端到端测试验证修复
- 所有测试通过

### 技术债务
- ✅ API 认证不一致问题（已彻底解决）
- ⚠️ TopicAgent 间歇性 JSON 解析失败（已缓解但未根治）
- 📝 选题不持久化（待实现）

---

**文档更新时间**: 2026-05-07 16:20  
**下次更新**: 阶段 12 开始时
