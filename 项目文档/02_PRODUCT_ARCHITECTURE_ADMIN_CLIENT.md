# 02_PRODUCT_ARCHITECTURE_ADMIN_CLIENT｜Admin / Client 双端产品架构

## 1. 系统不直接完整展示给客户

本系统不是把完整后台给律师客户使用。

正确结构：

```text
Admin 后台：你和内部运营人员使用
Client 前台：律师客户使用
```

## 2. Admin 后台定位

Admin 是你的生产后台和核心资产管理系统。

Admin 可以看到：

```text
客户管理
行业模板
客户档案
账号定位
选题库
文案库
严格审查 AI
Agent 运行记录
提示词模板
风格蒸馏
内容日历
客户反馈
内部备注
内容资产库
```

## 3. Client 前台定位

Client 是客户交付入口，只开放有限模块。

Client 可以看到：

```text
我的文案
生成文案
提交选题需求
调整内容方向
提交参考博主 / 对标内容
查看内容日历
提交修改意见
查看简化质量提示
```

Client 不能看到：

```text
Agent 运行流程
提示词
内部审查逻辑
完整评分规则
后台备注
其他客户数据
数据库结构
系统配置
Token 成本
模型调用日志
```

## 4. 路由结构

### Admin 路由

```text
/admin/dashboard
/admin/clients
/admin/clients/[id]
/admin/industries
/admin/client-profiles
/admin/positioning
/admin/topics
/admin/scripts
/admin/reviews
/admin/calendar
/admin/style-distillation
/admin/agent-runs
/admin/prompts
/admin/assets
/admin/settings
```

### Client 路由

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

## 5. 现有页面迁移

当前已经创建的页面可以这样迁移：

| 原路径 | 新路径 |
|---|---|
| `/dashboard` | `/admin/dashboard` |
| `/lawyer-profile` | `/admin/client-profiles` |
| `/positioning` | `/admin/positioning` |
| `/topics` | `/admin/topics` |
| `/scripts` | `/admin/scripts` |
| `/review` | `/admin/reviews` |
| `/library` | `/admin/library` |
| `/agent-runs` | `/admin/agent-runs` |
| `/settings/prompts` | `/admin/prompts` |

新增客户前台：

```text
/client/dashboard
/client/scripts
/client/generate
/client/topics
/client/calendar
/client/style-reference
/client/feedback
/client/profile
```

## 6. 权限角色

最少需要三类角色：

| 角色 | 说明 |
|---|---|
| owner | 你自己，最高权限 |
| operator | 内部运营人员 |
| client | 律师客户 |

## 7. 权限差异

| 功能 | owner | operator | client |
|---|---:|---:|---:|
| 查看所有客户 | ✅ | ✅ | ❌ |
| 管理提示词 | ✅ | 可选 | ❌ |
| 查看 Agent 日志 | ✅ | ✅ | ❌ |
| 生成文案 | ✅ | ✅ | ✅，有限制 |
| 查看完整审查 | ✅ | ✅ | ❌ |
| 提交修改意见 | ✅ | ✅ | ✅ |
| 查看自己文案 | ✅ | ✅ | ✅ |
| 查看他人客户数据 | ✅ | 可选 | ❌ |

## 8. Client 前台设计原则

客户前台要体现：

```text
专业
克制
定制
服务感
高端感
```

不要突出：

```text
无限生成
AI 批量写作
廉价工具感
复杂后台能力
```

推荐文案：

```text
我的内容方向
我的文案库
本周内容计划
提交修改意见
参考风格提交
```
