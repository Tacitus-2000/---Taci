# 下一步行动计划

**最后更新：** 2026-05-01  
**当前阶段：** 阶段 1 完成 - 准备进入阶段 2

---

## ✅ 已完成的工作

### 1. ✅ Agent Harness 约束系统建立
**完成时间：** 2026-05-01  
**负责人：** Team Lead

**完成内容：**
- ✅ 创建核心规则文档（HARNESS_CORE.md）
- ✅ 创建权限矩阵（HARNESS_MATRIX.md）
- ✅ 创建例外规则（HARNESS_EXCEPTIONS.md）
- ✅ 创建 4 个自动化脚本
- ✅ 初始化状态和日志系统

### 2. ✅ 阶段 1: 后端多 Agent 骨架搭建
**完成时间：** 2026-05-01  
**负责人：** Program Agent

**完成内容：**
- ✅ 34 个核心文件创建
- ✅ 修复所有构建错误
- ✅ 通过 lint 检查（0 错误，4 警告）
- ✅ 通过类型检查

### 3. ✅ 代码审查完成
**完成时间：** 2026-05-01  
**负责人：** Review Agent

**审查结果：**
- ⚠️ 有条件批准（39/50 分）
- 发现 5 个 Major 问题
- 发现 5 个 Minor 问题
- 无 Critical 阻塞问题

---

## 🎯 立即行动 (Next 24 Hours)

### 1. 修复 Major 问题 ⚡
**负责人：** Program Agent  
**优先级：** P0 (最高)  
**预计时间：** 4-6 小时

**修复清单（来自 Review Agent 审查）：**

#### 阻塞生产部署的问题
1. **[app/api/workflow/start/route.ts]** 集成 Supabase 数据库存储
   - 替换 `workflowStore` Map 为 Supabase 查询
   - 实现工作流状态持久化
   - 支持多实例部署

2. **[types/agent.ts]** 修复 PositioningInput 类型定义不一致
   - 统一类型定义与实际使用
   - 确保类型安全

#### 提升代码质量的问题
3. **[lib/graph/workflow.ts]** 改进 LangGraph 类型安全
   - 减少 `any` 类型使用
   - 减少 `@ts-expect-error` 注释
   - 使用正确的 LangGraph 类型定义

4. **[app/api/workflow/result/route.ts]** 解耦 API 路由
   - 创建独立的 WorkflowService 类
   - 移除跨路由的直接导入

5. **清理 ESLint 警告**
   - 处理 4 个未使用参数警告

**验证步骤：**
```bash
# 修复后验证
npm run build
npm run lint
```

---

### 2. 创建 WorkflowService 服务层 🔧
**负责人：** Program Agent  
**优先级：** P0  
**依赖：** 步骤 1 开始后  
**预计时间：** 2-3 小时

**任务清单：**
```typescript
// lib/services/workflow.service.ts
export class WorkflowService {
  // 创建工作流
  async createWorkflow(input: WorkflowInput): Promise<Workflow>
  
  // 获取工作流状态
  async getWorkflowStatus(id: string): Promise<WorkflowStatus>
  
  // 获取工作流结果
  async getWorkflowResult(id: string): Promise<WorkflowResult>
  
  // 更新工作流状态
  async updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<void>
}
```

**集成 Supabase：**
- 使用 `lib/supabase/client.ts` 连接数据库
- 实现 CRUD 操作
- 添加错误处理

---

## 📅 短期计划 (Next 3-5 Days)

### 3. 设计数据库 Schema
**负责人：** Project Agent  
**优先级：** P0  
**预计时间：** 1 天

**设计内容：**
- 用户表 (users)
- 案例表 (cases)
- 文书表 (documents)
- 模板表 (templates)
- 知识库表 (knowledge_base)
- 关系表和索引

**输出：**
- `supabase/migrations/001_initial_schema.sql`
- `types/database.types.ts`
- 数据库 ER 图（可选）

**注意：** 只生成 SQL 文件，不执行迁移

---

### 4. 配置 Supabase 集成
**负责人：** Program Agent  
**优先级：** P0  
**预计时间：** 1 天

**任务清单：**
```bash
# 1. 安装依赖
npm install @supabase/supabase-js

# 2. 创建客户端配置
# lib/supabase/client.ts
# lib/supabase/server.ts

# 3. 创建环境变量模板
# .env.example

# 4. 生成类型定义
# types/supabase.types.ts

# 5. 编写使用示例
# lib/supabase/examples.ts
```

**验证：**
- 测试连接
- 验证类型定义
- 检查环境变量配置

---

### 5. 创建基础 UI 组件库
**负责人：** Program Agent  
**优先级：** P1  
**预计时间：** 2 天

**组件清单：**
```
components/ui/
├── Button.tsx          # 按钮组件
├── Input.tsx           # 输入框组件
├── Card.tsx            # 卡片组件
├── Modal.tsx           # 模态框组件
├── Table.tsx           # 表格组件
├── Form.tsx            # 表单组件
├── Loading.tsx         # 加载组件
└── index.ts            # 统一导出
```

**设计原则：**
- 使用 TypeScript 严格类型
- 支持 Tailwind CSS 自定义
- 遵循无障碍标准 (a11y)
- 提供完整的 Props 类型定义

---

## 🚀 中期计划 (Next 1-2 Weeks)

### 6. 实现用户认证系统
**功能点：**
- 用户注册
- 用户登录
- 密码重置
- 会话管理
- 权限控制

### 7. 开发案例管理功能
**功能点：**
- 案例列表页
- 案例详情页
- 创建/编辑/删除案例
- 案例搜索和筛选

### 8. 构建文书模板系统
**功能点：**
- 模板列表
- 模板编辑器
- 变量替换
- 文书预览
- 导出 PDF/Word

---

## 📋 待确认事项

### 需要用户决策的问题
1. **Supabase 项目配置**
   - 使用云端还是自托管？
   - 需要哪些认证方式（邮箱/手机/OAuth）？

2. **UI 设计风格**
   - 是否有设计稿或参考网站？
   - 色彩主题偏好？

3. **功能优先级**
   - 哪些功能最重要，需要优先开发？
   - 是否有 MVP 范围定义？

4. **部署方案**
   - 部署到 Vercel 还是其他平台？
   - 是否需要 CI/CD 配置？

---

## 🔄 持续任务

### 文档维护
- **每日更新：** NEXT_ACTIONS.md
- **任务变更时：** TASK_BOARD.md
- **重大进展时：** PROJECT_STATUS.md
- **技术决策时：** DECISIONS.md
- **遇到错误时：** ERROR_LOG.md

### 代码质量
- 每次提交前运行 lint
- 定期运行类型检查
- 保持测试覆盖率（待建立）

### 团队协作
- Review Agent 审查所有代码变更
- Project Agent 协调任务分配
- Program Agent 专注代码实现

---

## 🎓 学习和研究

### 需要研究的技术点
1. **Next.js 16 新特性**
   - 查阅 `node_modules/next/dist/docs/`
   - 了解 breaking changes
   - 学习新的缓存策略

2. **Tailwind CSS 4**
   - 了解新的配置方式
   - 学习新的工具类

3. **Supabase 最佳实践**
   - Row Level Security (RLS)
   - 实时订阅
   - 边缘函数

---

## 📊 成功指标

### 本周目标
- [ ] 骨架代码审查完成
- [ ] 所有 P0/P1 错误修复
- [ ] Supabase 集成完成
- [ ] 基础 UI 组件库完成

### 本月目标
- [ ] 用户认证系统上线
- [ ] 案例管理功能完成
- [ ] 文书模板系统完成
- [ ] 测试覆盖率 > 60%

---

## 🚨 风险提示

### 高风险项
1. **Next.js 16 兼容性** - 可能遇到未知问题
2. **Supabase 集成** - 首次集成可能有坑
3. **时间估算** - 实际开发可能超出预期

### 缓解措施
- 提前研究文档
- 小步快跑，频繁验证
- 遇到阻塞及时沟通

---

## 📞 需要帮助时

### 联系方式
- **技术问题：** 查阅 docs/ERROR_LOG.md
- **任务协调：** 查阅 docs/TASK_BOARD.md
- **决策记录：** 查阅 docs/DECISIONS.md

### 升级路径
1. Program Agent 遇到问题 → 记录到 ERROR_LOG.md
2. 连续失败 2 次 → 通知 Review Agent
3. Review Agent 无法解决 → 通知 Project Agent
4. Project Agent 无法解决 → 请求用户介入

---

## ✅ 完成标准

### 当前阶段完成标准
- [x] 项目管理文档系统建立
- [ ] 骨架代码审查完成
- [ ] 所有 P0 错误修复
- [ ] 构建成功，无类型错误
- [ ] Lint 检查通过

### 下一阶段入口标准
- 代码质量达标
- Supabase 集成完成
- 基础组件库可用

---

**行动口号：** 先审查，再修复，后开发 🚀

**最后更新：** 2026-05-01  
**维护者：** Project Agent
