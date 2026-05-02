# 08_CLIENT_PORTAL_MODULES｜客户前台模块规划

## 1. Client 前台定位

Client 前台是客户使用的交付入口，不是完整后台。

客户看到的是结果和有限操作，不看到生产方法。

## 2. Client 页面

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

## 3. /client/dashboard

展示：

```text
我的内容方向
本周建议发布
最近文案
剩余生成次数
待处理反馈
内容日历入口
```

不要展示：

```text
Agent
Prompt
内部评分
系统配置
```

## 4. /client/profile

客户可查看简化资料：

```text
我的定位
目标客户
内容方向
表达风格
```

客户可以提交修改申请，但不要直接改核心定位。

## 5. /client/scripts

客户查看文案。

字段：

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
prompt_version
agent_run_id
内部审查结果
合规细节
```

## 6. /client/generate

客户自助生成文案。

输入：

```text
内容方向
文案类型
补充要求
目标客户
风格偏好
```

限制：

```text
每月额度
每日上限
必要时进入后台质检队列
```

## 7. /client/topics

客户可：

```text
查看可用选题
提交选题需求
申请调整方向
```

客户不直接看到内部选题策略。

## 8. /client/calendar

展示：

```text
本周建议发布
下周内容计划
待确认选题
已完成文案
```

这能强化服务感和维护包价值。

## 9. /client/style-reference

客户提交参考内容。

输入：

```text
对标博主名称
粘贴内容
希望学习的点
不喜欢的点
```

页面必须提示：

```text
系统只学习结构和表达方式，不复制原文，不搬运案例。
```

## 10. /client/feedback

客户提交修改意见。

建议用结构化选项：

```text
太像 AI
太长
不够专业
不够吸引人
不符合我的风格
想换成家属视角
想换成老板视角
这个选题不适合
```

也允许补充文字。

## 11. Client 前台视觉原则

```text
简洁
克制
服务感
高端定制
结果导向
```

不要像：

```text
低价 AI 工具
无限生成平台
复杂后台系统
```
