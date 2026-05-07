# Next Context

## Current Project Status
- **版本**: V0.3 开发中
- **当前状态**: ✅ 阶段 14 完成，提示词管理页面已实现
- **最新完成**: 提示词管理系统（数据库扩展 + API + 前端页面）

## Recently Completed
- ✅ 阶段 14: 提示词管理页面（2026-05-07 23:30）
  - 扩展 prompt_templates 表结构（system_prompt, user_prompt_template, description, created_by）
  - 实现完整的 CRUD API（列表、创建、更新、删除）
  - 创建前端管理页面（按 Agent 类型筛选、创建/编辑/删除对话框）
  - TypeScript 编译通过

## Current Issues / Remaining Work

### ⏳ 待执行：数据库迁移
**文件**: `supabase/migrations/20260507_alter_prompt_templates.sql`

**迁移内容**:
- 添加 system_prompt, user_prompt_template, description, created_by 字段
- 迁移现有数据（template_body → user_prompt_template）
- 创建索引（agent_type, active）

**执行方式**:
用户需要手动执行迁移 SQL 或通过 Supabase Dashboard 执行。

### ⏳ 待测试：提示词管理页面
**访问路径**: `/admin/prompts`

**测试内容**:
1. 页面是否正常加载
2. 按 Agent 类型筛选是否工作
3. 创建提示词功能
4. 编辑提示词功能
5. 删除提示词功能
6. 激活状态切换

### 📝 待实施：Agent 集成（阶段 15 的一部分）
当前提示词管理页面已完成，但 Agent 还未从数据库加载提示词。需要在阶段 15 中：
1. 修改各 Agent 的 Prompt 构建逻辑
2. 支持从数据库加载激活的提示词模板
3. 保留代码中的默认模板作为回退

## Recommended Next Steps
1. **执行数据库迁移**
   ```bash
   # 方式 1: 通过 Supabase Dashboard 执行 SQL
   # 方式 2: 使用 psql 命令行
   psql -h <host> -U <user> -d <database> -f supabase/migrations/20260507_alter_prompt_templates.sql
   ```

2. **测试提示词管理页面**
   - 启动开发服务器: `npm run dev`
   - 访问: `http://localhost:3000/admin/prompts`
   - 测试创建、编辑、删除功能

3. **开始阶段 15: 提示词优化**
   - 分析当前文案生成效果问题
   - 优化 TopicAgent、ScriptAgent、ProfileAgent 的提示词
   - 至少 3 轮测试迭代

## Key Files

### 本次创建的文件
- `V0.3_TASK_PLAN.md` - V0.3 开发任务计划（7 个阶段）
- `supabase/migrations/20260507_alter_prompt_templates.sql` - 数据库迁移
- `lib/services/prompt.service.ts` - 提示词服务层
- `app/api/admin/prompts/[id]/route.ts` - 单个提示词 API

### 本次修改的文件
- `types/database.ts` - 更新 PromptTemplate 接口
- `types/admin.ts` - 更新 PromptCreateRequest 和 PromptUpdateRequest
- `app/api/admin/prompts/route.ts` - 支持新字段
- `app/admin/prompts/page.tsx` - 完全重写管理页面

### 核心提示词文件（待优化）
- `lib/ai/prompts/topicPrompt.ts` - 选题生成提示词
- `lib/ai/prompts/scriptPrompt.ts` - 文案生成提示词
- `lib/ai/prompts/profilePrompt.ts` - 档案生成提示词
- `lib/ai/prompts/readabilityPrompt.ts` - 可读性审查提示词
- `lib/ai/prompts/riskPrompt.ts` - 风险审查提示词
- `lib/ai/prompts/rewritePrompt.ts` - 重写提示词

## Verification

### TypeScript
- ✅ 编译通过: `npx tsc --noEmit`

### 数据库
- ⏳ 迁移待执行: `20260507_alter_prompt_templates.sql`

### 功能测试
- ⏳ 提示词管理页面待测试

## Do Not Repeat
- ❌ 不要使用 `adminClient()` - 应该使用 `getAdminSupabaseClient()`
- ❌ 不要忘记 Next.js 15 的 params 是 Promise - 需要 `await params`
- ❌ 不要在创建提示词时要求 template_body 必填 - system_prompt 或 user_prompt_template 至少一个即可

## Notes
- 提示词管理页面支持系统提示词和用户提示词模板分离
- 激活状态控制：同一 Agent 类型只能有一个激活的提示词
- 版本号用于追踪提示词的迭代历史
- description 字段用于说明提示词的用途和特点
