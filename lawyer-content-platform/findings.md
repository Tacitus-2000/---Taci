# V0.2 开发 - 研究发现

**项目**: 律师内容平台 V0.2  
**开始日期**: 2026-05-05

---

## 📋 项目现状分析

### 已完成功能 (60%)
- ✅ 完整的 Agent 架构框架（8个 Agent + LangGraph 工作流）
- ✅ 数据库表结构（agent_runs, agent_run_steps）
- ✅ 前端页面（Admin 和 Client 端）
- ✅ API 路由（认证、CRUD）
- ✅ 工作流编排逻辑（SupervisorAgent）

### 待实现功能 (40%)
- ❌ 所有 Agent 都是 Mock 实现
- ❌ Claude API 集成
- ❌ Prompt 模板系统
- ❌ 工作流结果持久化
- ❌ 风格参考页面
- ❌ 提示词管理页面

---

## 🔍 Agent 架构分析

### Agent 列表

| Agent | 文件 | 职责 | 当前状态 |
|-------|------|------|---------|
| DataAgent | lib/agents/dataAgent.ts | 从数据库加载行业模板和客户档案 | Mock 实现 |
| ProfileAgent | lib/agents/profileAgent.ts | 分析客户信息，生成内容定位档案 | Mock 实现 |
| TopicAgent | lib/agents/topicAgent.ts | 基于档案生成内容选题候选列表 | Mock 实现 |
| ScriptAgent | lib/agents/scriptAgent.ts | 根据选题生成文案草稿 | Mock 实现 |
| ReadabilityReviewAgent | lib/agents/readabilityReviewAgent.ts | 检查文案可读性和用户体验 | Mock 实现 |
| RiskReviewAgent | lib/agents/riskReviewAgent.ts | 检查文案合规性和法律风险 | Mock 实现 |
| RewriteAgent | lib/agents/rewriteAgent.ts | 根据审查意见重写文案 | Mock 实现 |
| SupervisorAgent | lib/agents/supervisorAgent.ts | 协调工作流，决定下一步执行 | 逻辑实现 |

### 工作流编排

**SupervisorAgent 决策树**:
```
START
  ↓
检查错误 → YES → 'failed'
  ↓ NO
检查数据 → NO → 'data_collection'
  ↓ YES
检查档案 → NO → 'profile_generation'
  ↓ YES
检查选题 → NO → 'topic_generation'
  ↓ YES
检查文案 → NO → 'script_generation'
  ↓ YES
检查可读性审查 → NO → 'readability_review'
  ↓ YES
检查风险审查 → NO → 'risk_review'
  ↓ YES
检查审查通过 → YES → 'completed'
  ↓ NO
检查重写次数 → 达到上限 → 'failed'
  ↓ 未达到
返回 'rewrite'
```

---

## 🔧 需要修改的关键位置

### 1. DataAgent (lib/agents/dataAgent.ts)

**Mock 位置**: L66-118
- `loadIndustryTemplate()` - 返回硬编码数据
- `loadClientProfile()` - 返回硬编码数据

**需要替换为**: 真实 Supabase 查询

---

### 2. ProfileAgent (lib/agents/profileAgent.ts)

**Mock 位置**: L70-165
- `generateContentPosition()` - 返回硬编码模板

**需要替换为**: Claude API 调用

**输入**: clientProfile, industryTemplate  
**输出**: 内容定位档案（专业领域、目标受众、内容方向等）

---

### 3. TopicAgent (lib/agents/topicAgent.ts)

**Mock 位置**: L72-111
- `generateTopics()` - 返回 3 个硬编码选题

**需要替换为**: Claude API 调用生成多个选题

**输入**: clientProfile, industryTemplate  
**输出**: 选题列表（包含标题、描述、相关性评分等）

---

### 4. ScriptAgent (lib/agents/scriptAgent.ts)

**Mock 位置**: L73-136
- `generateScript()` - 返回硬编码文案结构

**需要替换为**: Claude API 调用生成完整文案

**输入**: selectedTopic, clientProfile, industryTemplate  
**输出**: 文案草稿（title, hook, body, cta, platform, structure_type, style_note）

---

### 5. ReadabilityReviewAgent (lib/agents/readabilityReviewAgent.ts)

**Mock 位置**: L83-164
- `reviewReadability()` - 基于规则的硬编码审查

**需要替换为**: Claude API 调用进行智能审查

**输入**: draftScript  
**输出**: 审查结果（passed, score, issues, suggestions）

---

### 6. RiskReviewAgent (lib/agents/riskReviewAgent.ts)

**Mock 位置**: L88-197
- `reviewRisk()` - 基于规则的硬编码风险检查

**需要替换为**: Claude API 调用进行合规性审查

**输入**: draftScript, industryTemplate  
**输出**: 审查结果（passed, score, issues, suggestions）

---

### 7. RewriteAgent (lib/agents/rewriteAgent.ts)

**Mock 位置**: L136-223
- `rewriteScript()` - 基于规则的硬编码重写

**需要替换为**: Claude API 调用根据审查意见重写

**输入**: draftScript, reviews  
**输出**: 重写后的文案

---

## 📦 依赖包分析

### 已安装
- `@langchain/core`: ^1.1.42
- `@langchain/langgraph`: ^1.2.9

### 需要安装
- `@anthropic-ai/sdk`: 最新版本
- `langchain`: 最新版本
- `@langchain/anthropic`: 最新版本

---

## 🔐 环境变量需求

### 需要添加到 .env.local

```env
# Claude API 配置
ANTHROPIC_API_KEY=your_anthropic_api_key

# LLM 模型配置
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=4096

# LangChain 配置（可选）
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=lawyer-content-platform

# Agent 配置
AGENT_TIMEOUT=30000
AGENT_MAX_RETRIES=3
```

---

## 📊 数据库表分析

### 已使用的表
- ✅ users - 用户表
- ✅ clients - 客户表
- ✅ client_profiles - 客户档案表
- ✅ topics - 选题表
- ✅ scripts - 文案表
- ✅ agent_runs - Agent 运行记录表
- ✅ agent_run_steps - Agent 运行步骤表

### 未使用的表
- ❌ industries - 行业表（暂不实现）
- ❌ industry_templates - 行业模板表（暂不实现）
- ❌ prompt_templates - 提示词模板表（阶段 12 实现）

---

## 🎯 技术决策

### LLM 提供商选择
- **选择**: Anthropic Claude
- **模型**: claude-3-5-sonnet-20241022
- **原因**: 
  - 长文本生成能力强
  - 中文支持好
  - 已有 @langchain/core 依赖

### 行业模板系统
- **决策**: 暂不实现
- **原因**: 当前客户档案已足够

### 补充功能
- **风格参考页面**: 实现
- **提示词管理页面**: 实现

---

## 📝 关键发现

### 1. Agent 状态管理
- 使用 LangGraph 的 StateGraph
- 状态通过 GraphAnnotation 定义
- reviews 和 logs 使用 reducer 自动合并

### 2. 并行审查
- ReadabilityReviewAgent 和 RiskReviewAgent 同时执行
- 提高工作流效率

### 3. 重写循环
- 最大重写次数: 3 次
- 重写后重新进行审查
- 达到上限后标记为失败

### 4. 数据持久化
- agent_runs 表记录工作流执行
- agent_run_steps 表记录每个步骤
- 当前未实现持久化逻辑

---

**最后更新**: 2026-05-05
