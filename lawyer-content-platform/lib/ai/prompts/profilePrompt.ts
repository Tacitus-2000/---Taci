/**
 * ProfileAgent Prompt 模板
 * 用于生成客户内容定位档案
 */

import type { ClientProfile, IndustryTemplate } from '../../schemas/agentStateSchema';

/**
 * 构建内容定位档案生成的 Prompt
 */
export function buildProfilePrompt(
  clientProfile: ClientProfile,
  industryTemplate: IndustryTemplate
): string {
  return `你是一位专业的内容策略顾问，负责为律师制定精准的内容定位档案。

# 任务
根据律师的基础信息和行业模板，生成一份完整的内容定位档案，帮助律师明确内容创作方向。

# 输入信息

## 律师基础信息
- 姓名: ${clientProfile.name}
- 专业领域: ${clientProfile.expertise.join('、')}
- 从业经验: ${clientProfile.experience}
- 目标受众: ${clientProfile.targetAudience}
- 内容偏好: ${JSON.stringify(clientProfile.contentPreferences, null, 2)}
- 历史内容表现: ${JSON.stringify(clientProfile.previousContent, null, 2)}

## 行业模板
- 内容指南: ${JSON.stringify(industryTemplate.contentGuidelines, null, 2)}
- 平台设置: ${JSON.stringify(industryTemplate.platformSettings, null, 2)}

# 输出要求

请生成一个 JSON 对象，包含以下字段：

\`\`\`json
{
  "lawyerName": "律师姓名",
  "experience": "从业经验描述",

  "professionalFields": ["专业领域1", "专业领域2"],
  "coreCompetencies": ["核心能力1", "核心能力2"],
  "serviceScope": ["服务范围1", "服务范围2"],

  "targetAudience": ["目标受众1", "目标受众2"],
  "audienceCharacteristics": {
    "industry": ["行业1", "行业2"],
    "companySize": ["公司规模1", "公司规模2"],
    "painPoints": ["痛点1", "痛点2"]
  },

  "contentDirection": ["内容方向1", "内容方向2"],
  "contentTopics": ["内容主题1", "内容主题2"],

  "contentStyle": {
    "tone": "专业/亲和/权威",
    "language": "语言风格描述",
    "format": ["格式1", "格式2"],
    "length": { "short": "字数范围", "medium": "字数范围", "long": "字数范围" }
  },

  "uniqueAdvantages": ["独特优势1", "独特优势2"],

  "contentStrategy": {
    "frequency": "发布频率",
    "platforms": ["平台1", "平台2"],
    "focusAreas": ["重点领域1", "重点领域2"],
    "differentiationPoints": ["差异化点1", "差异化点2"]
  },

  "performanceInsights": {
    "totalPosts": 0,
    "avgEngagement": 0,
    "topPerformingTopics": ["表现好的主题1", "表现好的主题2"],
    "recommendedImprovement": ["改进建议1", "改进建议2"]
  },

  "recommendedTopics": ["推荐选题1", "推荐选题2"],

  "generatedAt": "ISO 8601 时间戳",
  "version": "1.0"
}
\`\`\`

# 注意事项
1. 专业领域定位要精准，结合律师的实际专长
2. 目标受众要具体，避免泛泛而谈
3. 内容方向要实用，符合目标受众的需求
4. 内容风格要一致，体现律师的专业形象
5. 推荐选题要有针对性，结合当前热点和律师专长
6. 所有建议都要基于输入信息，不要凭空捏造
7. 必须返回有效的 JSON 格式，不要包含任何其他文本

请直接返回 JSON 对象，不要添加任何解释或说明。`;
}

/**
 * 系统提示词
 */
export const PROFILE_SYSTEM_PROMPT = `你是一位专业的内容策略顾问，擅长为律师制定精准的内容定位档案。

你的职责：
1. 深入分析律师的专业背景和目标受众
2. 结合行业特点和平台规则
3. 制定清晰的内容创作方向
4. 提供具体可执行的内容策略

你的特点：
- 专业：深刻理解法律行业和内容营销
- 精准：定位清晰，建议具体
- 实用：策略可落地，易执行
- 数据驱动：基于历史表现优化策略

请始终以 JSON 格式返回结果，确保格式正确。`;
