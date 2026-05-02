# 05_CURSOR_TOTAL_EXECUTION_PLAN｜Cursor 总执行路径

## 1. Cursor 的职责

Cursor 主要负责：

```text
页面路由
页面布局
表单
前端交互
Client / Admin 视觉区分
API 调用
结果展示
```

Cursor 不负责：

```text
数据库 schema
Agent 后端
LangGraph 工作流
Supabase server key
真实 AI 调用逻辑
权限底层实现
```

## 2. Cursor 总步骤

### C1：迁移现有页面到 Admin

任务：

```text
把现有页面迁移到 /admin/*
```

映射：

```text
/dashboard → /admin/dashboard
/lawyer-profile → /admin/client-profiles
/positioning → /admin/positioning
/topics → /admin/topics
/scripts → /admin/scripts
/review → /admin/reviews
/library → /admin/library
/agent-runs → /admin/agent-runs
/settings/prompts → /admin/prompts
```

注意：

```text
不要删除原页面内容，可以迁移或重建。
```

### C2：新增 Client 前台页面壳子

新增：

```text
/client/dashboard
/client/profile
/client/scripts
/client/generate
/client/topics
/client/calendar
/client/style-reference
/client/feedback
```

要求：

```text
Client 前台不要显示 Agent、提示词、内部审查、后台配置。
```

### C3：建立双端布局

创建：

```text
AdminLayout
ClientLayout
AdminSidebar
ClientSidebar
```

Admin Sidebar 展示完整后台功能。

Client Sidebar 只展示客户可见功能。

### C4：Admin 客户管理页

实现：

```text
/admin/clients
/admin/clients/[id]
```

先用静态数据，后续接 API。

显示：

```text
客户名称
行业
套餐
状态
内容进度
最近文案
```

### C5：Admin 客户档案页

实现：

```text
/admin/client-profiles
```

字段：

```text
客户名称
行业
细分方向
目标客户
优势
客户痛点
语气风格
禁忌表达
转化目标
```

第一阶段显示为“刑事律师档案”，但底层文案要保留多行业扩展意识。

### C6：Client 我的文案页

实现：

```text
/client/scripts
```

客户可见字段：

```text
标题
正文
使用建议
状态
创建时间
复制按钮
提交修改意见
```

不要显示：

```text
Agent 日志
提示词版本
内部评分
审查细节
```

### C7：Client 生成文案页

实现：

```text
/client/generate
```

功能：

```text
选择内容方向
选择文案类型
填写补充要求
点击生成
展示生成结果
```

页面文案要体现高端服务，不要像低价 AI 工具。

### C8：Client 反馈和选题需求

实现：

```text
/client/feedback
/client/topics
```

反馈类型：

```text
太像 AI
太长
不够专业
不够吸引人
不符合我的风格
想换成家属视角
想换成老板视角
```

### C9：Client 内容日历

实现：

```text
/client/calendar
```

展示：

```text
本周建议发布
下周内容计划
待确认选题
已完成文案
```

### C10：Admin Agent 运行记录页

实现：

```text
/admin/agent-runs
```

只 Admin 可见。

展示：

```text
任务 ID
客户
任务类型
状态
每个 Agent 节点
输入摘要
输出摘要
错误信息
```

### C11：Admin 提示词管理页

实现：

```text
/admin/prompts
```

只 Admin 可见。

功能：

```text
按行业筛选
按 Agent 类型筛选
查看版本
编辑模板
启用模板
```

### C12：联调接 API

等 Claude Code 完成 API 后，Cursor 再接：

```text
/api/admin/*
/api/client/*
```

## 3. Cursor 每步通用要求

每次给 Cursor 的任务都加：

```text
当前只执行本步骤。
不要一次性实现全部内容。
不要修改 lib/agents、lib/graphs、lib/schemas、supabase/schema.sql。
不要接真实 AI。
完成后说明修改文件、测试方式和下一步建议。
```

## 4. Cursor 第一条推荐提示词

```text
请阅读项目文档。当前只执行 C1 和 C2：将现有页面迁移为 /admin/*，并新增 /client/* 页面壳子。不要接数据库，不接 AI，不实现 Agent 后端。完成后汇报修改文件和测试方式。
```
