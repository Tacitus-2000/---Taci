# 00_INDEX｜项目文档目录

## 项目新定位

本项目不再只是“律师短视频文案生成工具”，而是：

> **垂直行业内容营销系统定制服务**

第一阶段从 **刑事律师** 切入，采用：

```text
4W 深度启动包
+
后续可选维护包
```

长期方向是迁移到制造业、服装业、教育培训、B2B 服务、咨询行业等需要“营销自己”的行业。

## 新版核心架构

```text
Admin 后台
+
Client 前台
+
多 Agent 内容生产引擎
+
行业模板系统
+
内容资产库
```

## 文件目录

| 文件 | 内容 |
|---|---|
| 00_INDEX.md | 文档目录 |
| 01_PROJECT_POSITIONING_AND_BUSINESS_MODEL.md | 项目定位与商业模式 |
| 02_PRODUCT_ARCHITECTURE_ADMIN_CLIENT.md | Admin / Client 双端产品架构 |
| 03_DATABASE_AND_PERMISSION_PLAN.md | 数据库、权限和多行业结构 |
| 04_MULTI_AGENT_ARCHITECTURE.md | 受控型多 Agent 架构 |
| 05_CURSOR_TOTAL_EXECUTION_PLAN.md | Cursor 总执行路径 |
| 06_CLAUDE_CODE_TOTAL_EXECUTION_PLAN.md | Claude Code 总执行路径 |
| 07_DEVELOPMENT_ORDER_AND_RULES.md | 总开发顺序与协作规则 |
| 08_CLIENT_PORTAL_MODULES.md | 客户前台模块规划 |
| 09_ADMIN_BACKEND_MODULES.md | 内部后台模块规划 |
| 10_INDUSTRY_TEMPLATE_EXPANSION_PLAN.md | 多行业模板扩展规划 |
| 11_PROMPT_AND_ASSET_LIBRARY_PLAN.md | 提示词与内容资产库规划 |
| 12_ACCEPTANCE_CHECKLIST.md | 第一版验收清单 |

## 推荐使用方式

### 发给 Cursor

优先发：

```text
00_INDEX.md
01_PROJECT_POSITIONING_AND_BUSINESS_MODEL.md
02_PRODUCT_ARCHITECTURE_ADMIN_CLIENT.md
05_CURSOR_TOTAL_EXECUTION_PLAN.md
07_DEVELOPMENT_ORDER_AND_RULES.md
08_CLIENT_PORTAL_MODULES.md
09_ADMIN_BACKEND_MODULES.md
```

### 发给 Claude Code

优先发：

```text
00_INDEX.md
01_PROJECT_POSITIONING_AND_BUSINESS_MODEL.md
03_DATABASE_AND_PERMISSION_PLAN.md
04_MULTI_AGENT_ARCHITECTURE.md
06_CLAUDE_CODE_TOTAL_EXECUTION_PLAN.md
07_DEVELOPMENT_ORDER_AND_RULES.md
10_INDUSTRY_TEMPLATE_EXPANSION_PLAN.md
11_PROMPT_AND_ASSET_LIBRARY_PLAN.md
```

## 核心原则

```text
1. 第一阶段先做刑事律师，不要一开始做多行业。
2. 底层架构必须支持多行业迁移。
3. Admin 后台展示完整内部能力。
4. Client 前台只展示有限客户功能。
5. 不向客户暴露 Agent、提示词、审查细节和系统配置。
6. 客户买的是高端定制服务，不是低价 AI 文案工具。
7. 后台复用的是生产能力，不是复用客户最终文案。
```
