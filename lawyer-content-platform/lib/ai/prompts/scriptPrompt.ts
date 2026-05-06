/**
 * 文案生成 Prompt 模板
 */

/**
 * 系统提示词
 */
export const SCRIPT_SYSTEM_PROMPT = `你是一位专业的法律内容创作专家，擅长为律师和法律服务机构撰写高质量的营销文案。

你的核心能力：
1. **深入理解法律专业知识**：能够准确把握法律概念，避免误导性表述
2. **精准把握目标受众**：根据受众特征调整语言风格和内容深度
3. **多平台内容适配**：熟悉微信公众号、小红书、抖音、知乎等平台的内容特点
4. **合规性意识**：严格遵守法律行业的内容规范和职业道德

你的写作原则：
- **专业但不晦涩**：用通俗易懂的语言解释专业概念
- **有价值不推销**：提供实用信息，避免过度营销
- **有理有据**：引用案例和数据支持观点
- **结构清晰**：使用标题、列表、案例等提升可读性
- **合规合法**：遵守广告法、律师执业规范等相关规定

输出格式要求：
- 必须返回有效的 JSON 格式
- 包含所有必需字段
- 文案内容应完整、连贯、可直接使用`;

/**
 * 平台特点说明
 */
const PLATFORM_GUIDELINES = {
  '微信公众号': {
    特点: '长文为主，深度内容，适合专业解读',
    结构: '标题 + 引言 + 正文（多个小标题）+ 总结 + CTA',
    语言风格: '专业、严谨、有深度',
    长度: '1500-3000字',
  },
  '小红书': {
    特点: '短平快，视觉化，适合干货分享',
    结构: '吸睛标题 + emoji + 要点列表 + 案例 + CTA',
    语言风格: '轻松、实用、接地气',
    长度: '500-1000字',
  },
  '抖音': {
    特点: '短视频脚本，口语化，适合场景化演绎',
    结构: '开场钩子 + 问题场景 + 解决方案 + 行动号召',
    语言风格: '口语化、有节奏感、易记忆',
    长度: '300-500字（60-90秒视频）',
  },
  '知乎': {
    特点: '问答形式，逻辑严密，适合深度分析',
    结构: '问题重述 + 背景分析 + 详细解答 + 案例支撑 + 总结',
    语言风格: '理性、客观、有论证',
    长度: '1000-2000字',
  },
};

/**
 * 构建文案生成 Prompt
 */
export function buildScriptPrompt(
  selectedTopic: Record<string, any>,
  clientProfile: Record<string, any>,
  industryTemplate: Record<string, any>
): string {
  // 提取选题信息
  const topicTitle = selectedTopic.title || '未知选题';
  const topicDescription = selectedTopic.description || '';
  const targetAudience = selectedTopic.targetAudience || '企业主和管理者';
  const keywords = (selectedTopic.keywords as string[]) || [];
  const difficulty = selectedTopic.difficulty || 'intermediate';
  const estimatedLength = selectedTopic.estimatedLength || 1500;

  // 提取客户档案信息
  const expertise = (clientProfile.expertise as string[]) || ['法律咨询'];
  const targetIndustries = (clientProfile.targetIndustries as string[]) || ['通用'];
  const contentGoals = (clientProfile.contentGoals as string[]) || ['品牌建设'];
  const tonePreference = clientProfile.tonePreference || 'professional';
  const avoidTopics = (clientProfile.avoidTopics as string[]) || [];

  // 提取行业模板信息
  const complianceRules = (industryTemplate.complianceRules as Record<string, any>) || {};
  const requiredDisclaimer = complianceRules.requiredDisclaimer || '本内容仅供参考，不构成正式法律意见';
  const prohibitedClaims = (complianceRules.prohibitedClaims as string[]) || [];
  const contentGuidelines = (industryTemplate.contentGuidelines as Record<string, any>) || {};
  const recommendedStructures = (contentGuidelines.recommendedStructures as string[]) || ['问题解析型'];

  // 确定目标平台（默认微信公众号）
  const platform = '微信公众号';
  const platformGuide = PLATFORM_GUIDELINES[platform];

  // 构建 Prompt
  return `请根据以下信息，为律师撰写一篇高质量的营销文案。

## 选题信息
- **标题**: ${topicTitle}
- **描述**: ${topicDescription}
- **目标受众**: ${targetAudience}
- **关键词**: ${keywords.join('、')}
- **难度**: ${difficulty}
- **预计长度**: ${estimatedLength}字

## 客户档案
- **专业领域**: ${expertise.join('、')}
- **目标行业**: ${targetIndustries.join('、')}
- **内容目标**: ${contentGoals.join('、')}
- **语气偏好**: ${tonePreference}
${avoidTopics.length > 0 ? `- **避免话题**: ${avoidTopics.join('、')}` : ''}

## 平台要求（${platform}）
- **特点**: ${platformGuide.特点}
- **结构**: ${platformGuide.结构}
- **语言风格**: ${platformGuide.语言风格}
- **长度**: ${platformGuide.长度}

## 合规要求
- **必需声明**: ${requiredDisclaimer}
${prohibitedClaims.length > 0 ? `- **禁止声称**: ${prohibitedClaims.join('、')}` : ''}
- **推荐结构**: ${recommendedStructures.join('、')}

## 写作要求

### 1. 标题（title）
- 吸引眼球，激发好奇心
- 包含核心关键词
- 长度控制在 20-30 字
- 可使用数字、疑问、对比等技巧

### 2. 开场钩子（hook）
- 用一个引人入胜的开场吸引读者
- 可以是：惊人数据、真实案例、常见误区、痛点场景
- 长度 100-200 字
- 快速建立与读者的连接

### 3. 正文（body）
- 使用 Markdown 格式
- 结构清晰，使用二级标题（##）和三级标题（###）
- 每个部分包含：
  * 核心观点
  * 案例或数据支撑
  * 实用建议
- 使用列表、加粗等提升可读性
- 长度 ${estimatedLength - 500} 字左右

### 4. 行动号召（cta）
- 引导读者采取下一步行动
- 可以是：关注、咨询、分享、评论
- 语气友好、不强迫
- 长度 50-100 字

### 5. 其他信息
- **platform**: 固定为 "${platform}"
- **structure_type**: 从 ${recommendedStructures.join('、')} 中选择最合适的
- **style_note**: 包含必需的法律声明

## 输出格式

请严格按照以下 JSON 格式输出：

\`\`\`json
{
  "title": "文案标题",
  "hook": "开场钩子内容",
  "body": "正文内容（Markdown 格式）",
  "cta": "行动号召内容",
  "platform": "${platform}",
  "structure_type": "内容结构类型",
  "style_note": "${requiredDisclaimer}"
}
\`\`\`

现在，请开始创作这篇文案。记住：专业、实用、合规、有价值。`;
}
