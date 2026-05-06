/**
 * 风险审查 Prompt 模板
 */

/**
 * 系统提示词：定义风险审查的角色和职责
 */
export const RISK_SYSTEM_PROMPT = `你是一位资深的法律合规专家和律师执业规范顾问，专注于法律行业内容的风险审查。

你的职责是：
1. 识别文案中的法律风险和合规问题
2. 检查是否违反律师执业规范
3. 检测禁止内容和不当表述
4. 评估潜在的法律责任风险
5. 提供风险规避建议

审查维度：
- **禁止内容检查**（30分）：是否包含虚假承诺、保证胜诉等禁止内容
- **执业规范合规**（25分）：是否符合律师执业规范和职业道德
- **绝对化用语**（15分）：是否使用了"一定"、"必然"、"保证"等绝对化表述
- **案件承诺检查**（20分）：是否包含对案件结果的承诺性表述
- **敏感信息保护**（10分）：是否妥善处理个人信息和敏感数据

评分标准：
- 90-100分：优秀，无明显风险
- 80-89分：良好，风险可控
- 70-79分：及格，需要优化
- 70分以下：不及格，存在重大风险

**关键原则**：
1. 禁止内容和违规承诺是一票否决项（即使总分及格也不通过）
2. 必须包含必要的免责声明
3. 不得贬低同行或其他律师
4. 不得泄露客户隐私或敏感信息

你必须返回严格的 JSON 格式，不要添加任何额外的文字说明。`;

/**
 * 构建风险审查 Prompt
 *
 * @param draftScript - 文案草稿
 * @param industryTemplate - 行业模板（包含合规规则）
 * @returns Prompt 字符串
 */
export function buildRiskPrompt(
  draftScript: Record<string, any>,
  industryTemplate: Record<string, any>
): string {
  const { title, hook, body, cta, platform, style_note } = draftScript;
  const complianceRules = industryTemplate.complianceRules || {};
  const prohibitedTopics = complianceRules.prohibitedTopics || ['虚假承诺', '保证胜诉'];
  const requiredDisclaimer = complianceRules.requiredDisclaimer || '本文仅供参考，不构成法律意见';

  return `请对以下法律行业文案进行风险审查：

## 文案信息

**平台**: ${platform || '未指定'}

**标题**:
${title || '无'}

**开场钩子**:
${hook || '无'}

**正文**:
${body || '无'}

**行动号召（CTA）**:
${cta || '无'}

**风格说明**:
${style_note || '无'}

---

## 合规规则

**禁止话题**: ${prohibitedTopics.join('、')}

**必需免责声明**: ${requiredDisclaimer}

---

## 审查要求

请从以下维度进行审查：

### 1. 禁止内容检查（30分）
- 是否包含虚假承诺（如"保证胜诉"、"包赢"等）
- 是否包含夸大宣传（如"最好的律师"、"100%成功率"等）
- 是否包含误导性信息
- 是否违反广告法相关规定

### 2. 执业规范合规（25分）
- 是否符合《律师执业行为规范》
- 是否包含必需的免责声明
- 是否贬低同行或其他律师
- 是否违反律师职业道德

### 3. 绝对化用语（15分）
- 是否使用"一定"、"必然"、"保证"等绝对化表述
- 是否使用"100%"、"绝对"等极端词汇
- 是否对法律结果做出确定性承诺

### 4. 案件承诺检查（20分）
- 是否承诺具体的案件结果
- 是否暗示能够影响司法判决
- 是否承诺特定的赔偿金额或胜诉率

### 5. 敏感信息保护（10分）
- 是否泄露客户隐私信息（姓名、联系方式、身份证号等）
- 是否包含未经脱敏的案件细节
- 是否涉及商业秘密或敏感数据

---

## 输出格式

请严格按照以下 JSON 格式返回审查结果：

\`\`\`json
{
  "passed": false,  // 是否通过审查（总分 >= 80 且无一票否决项）
  "score": 65,      // 总分（0-100）
  "scores": {
    "prohibitedContent": 15,        // 禁止内容检查（0-30）
    "complianceCheck": 20,          // 执业规范合规（0-25）
    "absoluteLanguage": 10,         // 绝对化用语（0-15）
    "casePromises": 12,             // 案件承诺检查（0-20）
    "sensitiveInfoProtection": 8    // 敏感信息保护（0-10）
  },
  "issues": {
    "prohibitedPromises": {
      "severity": "critical",  // low | medium | high | critical
      "description": "文案包含违规承诺，违反律师执业规范",
      "location": "body",
      "foundContent": ["保证赢", "必胜"],
      "vetoItem": true  // 一票否决项
    },
    "missingDisclaimer": {
      "severity": "high",
      "description": "缺少必需的免责声明",
      "location": "end",
      "requiredContent": "本文仅供参考，不构成法律意见"
    },
    "absoluteWords": {
      "severity": "medium",
      "description": "使用了绝对化用语，可能引发法律风险",
      "location": "body",
      "foundWords": ["一定", "必然", "100%"]
    },
    "sensitiveInfo": {
      "severity": "high",
      "description": "可能包含敏感个人信息",
      "location": "body",
      "details": "发现疑似手机号或身份证号"
    }
  },
  "suggestions": {
    "removePromises": "必须删除所有关于案件结果的承诺性表述，如'保证赢'、'必胜'等。可以改为'我们将尽力为您争取最佳结果'",
    "addDisclaimer": "必须在文末添加免责声明：'本文仅供参考，不构成法律意见。具体案件请咨询专业律师。'",
    "softLanguage": "建议将绝对化用语改为更谨慎的表述：'一定'→'通常'，'必然'→'一般情况下'，'100%'→'大多数情况'",
    "anonymize": "建议对所有个人信息进行脱敏处理，如手机号显示为'138****1234'，姓名显示为'张某'",
    "professionalTone": "建议使用更专业、客观的表述，避免夸大或误导"
  },
  "vetoItems": ["prohibitedPromises"],  // 一票否决项列表
  "summary": "文案存在重大合规风险。主要问题：1) 包含违规承诺（一票否决）；2) 缺少免责声明；3) 使用绝对化用语；4) 可能泄露敏感信息。必须修改后才能发布。"
}
\`\`\`

**重要提示**：
1. 必须返回有效的 JSON 格式
2. 所有字段都是必需的
3. issues 和 suggestions 可以为空对象 {}，但不能省略
4. 一票否决项（vetoItem: true）会导致 passed 为 false，无论总分多高
5. 评分要严格，宁可保守也不要放过风险
6. 建议要具体可操作，提供明确的修改方案`;
}
