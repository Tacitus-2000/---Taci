# 12_ACCEPTANCE_CHECKLIST｜第一版验收清单

## 1. 产品结构验收

```text
[ ] 已有 /admin/* 后台页面
[ ] 已有 /client/* 前台页面
[ ] Admin 和 Client 使用不同导航
[ ] Client 不展示 Agent
[ ] Client 不展示提示词
[ ] Client 不展示完整审查逻辑
```

## 2. 数据库验收

```text
[ ] profiles 表
[ ] clients 表
[ ] industries 表
[ ] client_profiles 表
[ ] industry_templates 表
[ ] content_positions 表
[ ] topics 表
[ ] scripts 表
[ ] script_reviews 表
[ ] prompt_templates 表
[ ] agent_runs 表
[ ] agent_run_steps 表
```

## 3. 权限验收

```text
[ ] 有 role 字段
[ ] 有 client_id 隔离
[ ] 有 industry_id
[ ] 有 visible_to_client
[ ] 有 internal_only
[ ] Client API 不返回 internal_only 内容
[ ] Client API 不返回 prompt
[ ] Client API 不返回 agent steps
```

## 4. 多 Agent 验收

```text
[ ] 有 Supervisor Agent
[ ] 有 Data Agent
[ ] 有 Profile Agent
[ ] 有 Topic Agent
[ ] 有 Script Agent
[ ] 有 Readability Review Agent
[ ] 有 Risk Review Agent
[ ] 有 Rewrite Agent
[ ] 有 AgentState
[ ] 有 LangGraph 工作流
[ ] 最多改写 2 次
[ ] agent_runs 可记录
[ ] agent_run_steps 可记录
```

## 5. Admin 功能验收

```text
[ ] 可创建客户
[ ] 可创建客户档案
[ ] 可选择行业
[ ] 可生成定位
[ ] 可生成选题
[ ] 可生成文案
[ ] 可查看审查
[ ] 可设置文案是否客户可见
[ ] 可查看 Agent 日志
[ ] 可管理提示词
```

## 6. Client 功能验收

```text
[ ] 可查看我的文案
[ ] 可生成文案
[ ] 可提交选题需求
[ ] 可提交修改意见
[ ] 可查看内容日历
[ ] 可提交参考博主内容
[ ] 只能看自己的内容
```

## 7. 商业定位验收

页面文案不能像低价工具。

应该体现：

```text
高端定制
专属内容系统
专业转化
内容日历
修改反馈
服务交付
```

不应该突出：

```text
无限生成
低价 AI
批量文案
一键洗稿
```

## 8. 第一版最小可演示闭环

```text
Admin 创建客户
↓
Admin 创建客户档案
↓
选择 legal_criminal 模板
↓
生成定位
↓
生成选题
↓
生成文案
↓
后台审查
↓
设置客户可见
↓
Client 查看文案
↓
Client 提交修改意见
```
