# 阶段 6 完成报告：RiskReviewAgent Claude API 集成

**项目**: 律师内容平台 V0.2  
**阶段**: 阶段 6 - 风险审查 Agent  
**完成日期**: 2026-05-06  
**耗时**: 1.5 小时

---

## 📋 任务概述

将 RiskReviewAgent 的 Mock 实现替换为真实的 Claude API 调用，实现智能的法律合规和风险审查功能。

---

## ✅ 完成的工作

### 1. Prompt 模板实现

**文件**: `lib/ai/prompts/riskPrompt.ts`

**系统提示词**:
- 定义角色：资深法律合规专家和律师执业规范顾问
- 明确职责：识别法律风险、检查执业规范、检测禁止内容、评估法律责任、提供风险规避建议

**审查维度**（总分 100 分）:
1. **禁止内容检查**（30分）：虚假承诺、保证胜诉、夸大宣传、误导性信息
2. **执业规范合规**（25分）：律师执业行为规范、免责声明、贬低同行、职业道德
3. **绝对化用语**（15分）：一定、必然、保证、100%、绝对等表述
4. **案件承诺检查**（20分）：案件结果承诺、影响司法判决、特定赔偿金额
5. **敏感信息保护**（10分）：客户隐私、案件细节脱敏、商业秘密

**关键特性**:
- **一票否决机制**：禁止内容和违规承诺即使总分及格也不通过
- **评分标准**：>= 80 分通过（比可读性审查的 70 分更严格）
- **合规规则集成**：从 industryTemplate 读取禁止话题和必需免责声明

**Prompt 函数**:
```typescript
buildRiskPrompt(draftScript, industryTemplate)
```

**输出格式**:
```json
{
  "passed": false,
  "score": 88,
  "scores": {
    "prohibitedContent": 28,
    "complianceCheck": 23,
    "absoluteLanguage": 12,
    "casePromises": 18,
    "sensitiveInfoProtection": 7
  },
  "issues": { ... },
  "suggestions": { ... },
  "vetoItems": ["prohibitedPromises"],
  "summary": "..."
}
```

---

### 2. Agent 实现修改

**文件**: `lib/agents/riskReviewAgent.ts`

**主要变更**:
1. 导入 Claude API 客户端和 Prompt 模板
2. 替换 `reviewRisk()` 方法的 Mock 实现（110 行）为 API 调用（45 行）
3. 实现 JSON 响应解析（支持直接 JSON 和 ```json 代码块）
4. 添加必需字段验证（passed, score）

**代码对比**:
- **Mock 实现**: 110 行，硬编码规则检查
- **API 实现**: 45 行，智能审查

**核心逻辑**:
```typescript
private async reviewRisk(state: AgentState) {
  const aiClient = createAIClient();
  const prompt = buildRiskPrompt(draftScript, industryTemplate);
  const response = await aiClient.chat(
    [{ role: 'user', content: prompt }],
    { system: RISK_SYSTEM_PROMPT }
  );
  // JSON 解析和验证
  return { passed, score, issues, suggestions };
}
```

---

### 3. 测试脚本实现

**文件**: `scripts/test-risk-agent.ts`

**测试用例**:
1. **正常流程**：审查包含潜在风险的文案
   - 使用真实的劳动法案例文案
   - 包含具体赔偿金额、绝对化表述等潜在问题
   - 验证审查结果的完整性和准确性

2. **错误处理**：缺少必需数据
   - 测试缺少 draftScript 的情况
   - 验证错误信息和状态

**NPM 脚本**:
```json
"test:risk-agent": "tsx scripts/test-risk-agent.ts"
```

---

## 🧪 测试结果

### TypeScript 类型检查
```bash
npm run typecheck
```
✅ **通过**：无类型错误

### 功能测试
```bash
npm run test:risk-agent
```

#### 测试用例 1: 正常流程
- ✅ **状态**: 通过
- ⏱️ **耗时**: 21797ms（约 22 秒）
- 📊 **总分**: 88/100
- ✅ **审查结果**: 通过（>= 80 分）

**识别的问题**（4 个）:
1. **具体赔偿金额**（medium）
   - 标题和正文提及 18 万，可能被理解为对类似案件结果的暗示
   
2. **绝对化表述**（low）
   - 使用了"必须"、"只有...才能"等表述
   
3. **免责声明位置**（low）
   - 存在但不够显著
   
4. **案件信息脱敏**（low）
   - 使用了"李某"但缺少完整说明

**提供的建议**（6 条）:
1. **调整标题**：改为更中性的表述，避免强调具体金额
   - 建议：'员工拒绝调岗被辞退案例分析：HR需要注意的3个关键点'
   
2. **软化绝对化表述**：
   - "必须"→"应当"或"需要"
   - "只有做到这三点，才能"→"做到这三点，可以有效"
   
3. **增强免责声明**：
   - 移至 CTA 之前，增加显著性
   - 使用分隔线或加粗
   - 增加详细说明
   
4. **添加案例说明**：
   - 增加"以下案例根据真实案件改编，具体信息已脱敏处理"
   
5. **平衡语气**：
   - 在提及具体金额时增加背景说明
   - 如"根据该员工的工龄、工资标准等因素计算"
   
6. **优化 CTA**：
   - 更明确服务范围
   - 如"如果你在劳动用工管理、调岗流程设计等方面需要法律支持"

#### 测试用例 2: 错误处理
- ✅ **状态**: 正确处理错误
- 📝 **错误信息**: "风险审查失败: 缺少文案草稿数据"
- 📊 **状态**: failed

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| API 调用耗时 | 21797ms（约 22 秒）|
| 代码行数减少 | 110 行 → 45 行（减少 59%）|
| 审查维度 | 5 个维度，总分 100 分 |
| 通过标准 | >= 80 分 + 无一票否决项 |
| 识别问题数 | 4 个 |
| 提供建议数 | 6 条 |

---

## 🔍 关键发现

### 1. Claude API 风险审查能力

**优势**:
- ✅ 能识别细微的合规问题（如具体金额暗示、免责声明位置）
- ✅ 提供的建议非常专业（如标题改写、免责声明增强、CTA 优化）
- ✅ 审查质量高，符合法律行业的合规要求
- ✅ 能理解法律行业的特殊规范（律师执业行为规范、职业道德）

**特点**:
- 比 Mock 实现更智能，能识别隐含的风险
- 建议具体可操作，提供明确的修改方案
- 能平衡专业性和可读性

### 2. 审查响应时间

| Agent | 耗时 | 输出内容 |
|-------|------|---------|
| RiskReviewAgent | 22 秒 | 审查结果（问题 + 建议）|
| ReadabilityReviewAgent | 32 秒 | 审查结果（问题 + 建议）|
| TopicAgent | 35 秒 | 7 个选题 |
| ScriptAgent | 66 秒 | 3000+ 字文案 |

**分析**:
- 风险审查比可读性审查快 31%
- 输出内容较少，主要是结构化的审查结果
- 响应时间合理，符合预期

### 3. 一票否决机制

**设计原因**:
- 法律合规是底线，不能妥协
- 禁止内容和违规承诺可能导致严重法律后果
- 即使其他维度得分高，也必须修改

**实现方式**:
```json
{
  "passed": false,
  "vetoItems": ["prohibitedPromises"],
  "issues": {
    "prohibitedPromises": {
      "vetoItem": true
    }
  }
}
```

### 4. AgentState 类型设计

**发现**:
- `draftScript` 只包含文案内容字段，不包含数据库字段（id, clientId, status 等）
- 这样设计更灵活，Agent 不需要关心数据持久化细节
- 测试时需要注意不要添加数据库字段

---

## 🐛 遇到的问题

### 问题 1: 测试数据类型错误

**现象**:
```
error TS2353: Object literal may only specify known properties, 
and 'id' does not exist in type '{ title: string; ... }'.
```

**原因**:
- 测试脚本中的 `draftScript` 包含了数据库字段（id, clientId, topicId, status, createdAt, updatedAt）
- 但 `AgentState` 中的 `draftScript` 类型不包含这些字段

**解决方案**:
- 移除测试脚本中的数据库字段
- 只保留文案内容字段（title, hook, body, cta, platform, structure_type, style_note）

**教训**:
- 仔细阅读类型定义
- Agent 层和数据库层要分离

---

## 📚 技术亮点

### 1. 5 维度评分系统

```typescript
{
  "scores": {
    "prohibitedContent": 28,      // 禁止内容检查（0-30）
    "complianceCheck": 23,        // 执业规范合规（0-25）
    "absoluteLanguage": 12,       // 绝对化用语（0-15）
    "casePromises": 18,           // 案件承诺检查（0-20）
    "sensitiveInfoProtection": 7  // 敏感信息保护（0-10）
  }
}
```

### 2. 合规规则集成

从 `industryTemplate.complianceRules` 读取：
- `prohibitedTopics`: 禁止话题列表
- `requiredDisclaimer`: 必需的免责声明

### 3. 严格的评分标准

| 审查类型 | 通过标准 | 原因 |
|---------|---------|------|
| 风险审查 | >= 80 分 | 法律合规要求更严格 |
| 可读性审查 | >= 70 分 | 可读性可以适当宽松 |

---

## 📝 文件变更

### 新增文件
1. `lib/ai/prompts/riskPrompt.ts` - Prompt 模板（200 行）
2. `scripts/test-risk-agent.ts` - 测试脚本（250 行）

### 修改文件
1. `lib/agents/riskReviewAgent.ts` - 替换 Mock 实现（-110 行，+45 行）
2. `package.json` - 添加 npm 脚本

### 文档更新
1. `task_plan.md` - 标记阶段 6 完成
2. `progress.md` - 记录会话 8 进度

---

## 🎯 验收标准

- ✅ RiskReviewAgent 能识别法律风险
- ✅ 提供合规建议
- ✅ 类型检查通过
- ✅ 测试通过

**所有验收标准已达成！**

---

## 🚀 下一步

### 阶段 7: 文案重写（RewriteAgent）

**任务**:
1. 创建 `lib/ai/prompts/rewritePrompt.ts`
2. 修改 `lib/agents/rewriteAgent.ts`
3. 实现根据审查意见重写文案的逻辑
4. 创建测试脚本验证功能

**预计时间**: 3-4 小时

**依赖**: 阶段 5（可读性审查）+ 阶段 6（风险审查）

---

## 📊 项目进度

**已完成阶段**: 6 / 14（43%）

- ✅ 阶段 0: 环境准备
- ✅ 阶段 1: DataAgent
- ✅ 阶段 2: ProfileAgent
- ✅ 阶段 3: TopicAgent
- ✅ 阶段 4: ScriptAgent
- ✅ 阶段 5: ReadabilityReviewAgent
- ✅ 阶段 6: RiskReviewAgent
- ⏳ 阶段 7: RewriteAgent
- ⏳ 阶段 8-13: 工作流集成、数据持久化、前端集成、补充功能

**预计完成时间**: 2026-05-08（还需约 2-3 个工作日）

---

**报告生成时间**: 2026-05-06 12:52  
**报告作者**: Claude (Sonnet 4.6)
