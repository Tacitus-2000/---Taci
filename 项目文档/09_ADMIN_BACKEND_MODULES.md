# 09_ADMIN_BACKEND_MODULES｜内部后台模块规划

## 1. Admin 后台定位

Admin 是你和内部运营人员使用的生产系统。

后台是核心资产，不直接给客户看。

## 2. Admin 页面

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

## 3. /admin/dashboard

展示：

```text
客户数量
活跃客户
本月生成文案数
待处理反馈
Agent 运行异常
待审查文案
```

## 4. /admin/clients

客户管理：

```text
客户名称
行业
套餐
状态
负责人
开始时间
维护包状态
```

## 5. /admin/client-profiles

客户内容档案：

```text
行业
细分方向
目标客户
客户痛点
优势
风格
禁忌表达
转化目标
```

第一阶段可以显示“律师档案”，但底层使用 `client_profiles`。

## 6. /admin/industries

行业管理：

```text
行业名称
行业 slug
模板数量
默认审查规则
默认内容栏目
```

第一阶段至少有：

```text
legal
```

## 7. /admin/positioning

生成和调整定位：

```text
账号定位
目标客户
内容栏目
差异化
内容边界
转化策略
```

## 8. /admin/topics

管理选题：

```text
选题标题
客户痛点
内容类型
转化目标
风险等级
是否客户可见
```

## 9. /admin/scripts

管理文案：

```text
标题
开头
正文
转化引导
使用建议
客户可见性
版本
状态
```

## 10. /admin/reviews

查看严格审查结果：

```text
可读性评分
合规 / 风险评分
AI 味评分
转化建议
风险表达替换
```

这些不完整展示给客户。

## 11. /admin/agent-runs

调试多 Agent。

展示：

```text
任务 ID
客户
行业
任务类型
状态
每个 Agent step
输入输出摘要
错误信息
```

## 12. /admin/prompts

提示词管理。

功能：

```text
按行业筛选
按 Agent 类型筛选
查看版本
编辑
启用
停用
```

## 13. /admin/assets

内容资产库。

建议沉淀：

```text
刑事律师选题库
高转化开头库
真人化表达替换库
风险表达替换库
风格结构库
成功案例库
```

未来扩展制造业、服装业时，也沉淀对应行业资产。

## 14. /admin/calendar

后台内容日历。

功能：

```text
为客户安排发布计划
设置待发布文案
调整周计划
查看客户反馈
```
