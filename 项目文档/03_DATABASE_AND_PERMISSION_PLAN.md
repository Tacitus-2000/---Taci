# 03_DATABASE_AND_PERMISSION_PLAN｜数据库、权限和多行业结构

## 1. 新数据库方向

系统底层不要写死为律师专用。

核心概念应改为：

```text
industries
clients
client_profiles
industry_templates
content_positions
topics
scripts
reviews
agent_runs
prompt_templates
assets
```

律师只是第一个行业模板：

```text
industry = legal
template = criminal_lawyer
```

## 2. 核心表

### profiles

系统用户表。

```text
id
email
display_name
role: owner / operator / client
created_at
updated_at
```

### clients

客户表。

```text
id
name
client_type: individual / company / law_firm
industry_id
status
package_type
started_at
created_at
updated_at
```

### industries

行业表。

```text
id
name
slug
description
created_at
updated_at
```

示例：

```text
legal
manufacturing
fashion
education
consulting
```

### client_profiles

客户内容档案。

```text
id
client_id
industry_id
display_name
specialization
target_customers
strengths
client_pain_points
tone
forbidden_expressions
conversion_goal
created_at
updated_at
```

第一阶段页面上可以叫“律师档案”，但底层建议用 `client_profiles`。

### industry_templates

行业模板。

```text
id
industry_id
name
slug
default_content_columns
default_review_rules
default_prompt_set
default_topic_structures
created_at
updated_at
```

第一阶段默认模板：

```text
legal_criminal_lawyer_template
```

### content_positions

账号定位 / 内容定位。

```text
id
client_id
industry_id
client_profile_id
account_position
target_audience
content_columns
differentiation
content_boundary
conversion_strategy
visible_to_client
created_at
updated_at
```

### topics

选题表。

```text
id
client_id
industry_id
client_profile_id
title
pain_point
content_type
conversion_goal
risk_level
priority
visible_to_client
status
created_at
updated_at
```

### scripts

文案表。

```text
id
client_id
industry_id
topic_id
title
hook
body
cta
usage_suggestion
risk_warning
visible_to_client
status
version
created_at
updated_at
```

### script_reviews

审查结果表。

```text
id
script_id
client_id
industry_id
readability_score
compliance_score
conversion_score
problems
risks
suggestions
internal_only
created_at
```

### agent_runs

内部 Agent 工作流记录。

```text
id
client_id
industry_id
task_type
status
input_summary
output_summary
rewrite_count
internal_only
created_at
completed_at
```

### agent_run_steps

每个 Agent 节点记录。

```text
id
agent_run_id
agent_name
step_order
status
input_payload
output_payload
error_message
created_at
completed_at
```

### prompt_templates

提示词模板。

```text
id
industry_id
agent_type
version
content
is_active
internal_only
created_at
updated_at
```

默认：

```text
internal_only = true
```

## 3. 可见性字段

很多表都需要：

```text
client_id
industry_id
visible_to_client
internal_only
```

原则：

```text
Client 前台只能读取 visible_to_client = true 的内容。
Admin 后台可以读取完整内容。
```

## 4. API 分层

### Admin API

```text
/api/admin/clients
/api/admin/client-profiles
/api/admin/topics
/api/admin/scripts
/api/admin/reviews
/api/admin/agent-runs
/api/admin/prompts
```

Admin API 可以返回完整内部字段。

### Client API

```text
/api/client/profile
/api/client/scripts
/api/client/generate
/api/client/topics
/api/client/calendar
/api/client/feedback
/api/client/style-reference
```

Client API 不能返回：

```text
prompt
agent logs
internal review detail
system notes
other clients data
```

## 5. 权限原则

```text
1. owner 可以看所有。
2. operator 可以看授权客户。
3. client 只能看自己的内容。
4. client 不允许访问 prompt_templates。
5. client 不允许访问 agent_run_steps。
6. client 不允许访问 internal_only = true 的字段。
```

## 6. RLS 后续规划

第一版本地开发可先不做复杂 RLS，但正式给客户使用前必须补：

```text
profiles.role
client_user_links
client_id 隔离
visible_to_client 控制
internal_only 控制
```
