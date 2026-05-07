/**
 * 选题生成 Prompt 模板
 */

/**
 * 系统提示词：选题生成专家
 */
export const TOPIC_SYSTEM_PROMPT = `你是一位专业的内容选题策划专家，擅长为律师和法律服务机构策划高质量的内容选题。

你的职责：
1. 分析客户的专业领域、目标受众和内容定位
2. 结合行业特点和热点话题
3. 生成 5-7 个具有吸引力和实用价值的内容选题
4. 对每个选题进行多维度评分

选题评分维度（总分 100）：
- 吸引力 (Engagement): 30% - 标题是否吸引人，能否引发读者兴趣
- 相关性 (Relevance): 30% - 与客户专业领域和目标受众的匹配度
- 独特性 (Uniqueness): 20% - 选题角度是否新颖，是否有差异化
- 可行性 (Feasibility): 20% - 内容是否容易创作，是否有足够素材

输出要求：
- 必须返回严格的 JSON 格式
- 生成 5-7 个候选选题
- 每个选题包含完整的字段信息
- 评分必须客观合理，总分接近 100`;

/**
 * 构建选题生成 Prompt
 */
export function buildTopicPrompt(
  clientProfile: Record<string, any>,
  industryTemplate: Record<string, any>,
  customDirection?: string
): string {
  const expertise = (clientProfile.expertise as string[]) || [];
  const yearsOfExperience = clientProfile.yearsOfExperience || clientProfile.experience || '未知';
  const location = clientProfile.location || '未知';
  const contentPosition = clientProfile.contentPosition as Record<string, any> | undefined;

  const commonPainPoints = (industryTemplate.commonPainPoints as string[]) || [];
  const trendingTopics = (industryTemplate.trendingTopics as string[]) || [];
  const contentSuggestions = (industryTemplate.contentSuggestions as string[]) || [];

  return `请基于以下信息生成内容选题：

## 客户档案

**基本信息**：
- 姓名：${clientProfile.name}
- 专业领域：${expertise.join('、') || '法律咨询'}
- 执业年限：${yearsOfExperience}年
- 地区：${location}

**内容定位**：
${contentPosition ? `
- 专业领域：${(contentPosition.expertise_areas as string[])?.join('、') || '未指定'}
- 目标受众：${(contentPosition.target_audience as string[])?.join('、') || '未指定'}
- 内容方向：${(contentPosition.content_directions as string[])?.join('、') || '未指定'}
- 差异化优势：${(contentPosition.differentiation_points as string[])?.join('、') || '未指定'}
- 内容风格：${contentPosition.tone_style || '未指定'}
` : '（暂无内容定位信息）'}

${customDirection ? `## 用户自定义方向

**重要：用户明确指定了内容方向，所有选题必须围绕这个方向展开**

用户需求：${customDirection}

请确保生成的选题直接回应用户的具体需求，而不是泛泛而谈。

` : ''}## 行业模板

**行业**：${industryTemplate.industry}
**常见痛点**：
${commonPainPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || '- 无'}

**热门话题**：
${trendingTopics.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') || '- 无'}

**内容建议**：
${contentSuggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || '- 无'}

---

请生成 5-7 个内容选题，每个选题必须包含以下字段：

\`\`\`json
{
  "topics": [
    {
      "id": "topic-1",
      "title": "选题标题（吸引人的标题，15-30字）",
      "description": "选题描述（详细说明选题内容和价值，80-150字）",
      "targetAudience": "目标受众（具体的人群画像）",
      "keywords": ["关键词1", "关键词2", "关键词3", "关键词4"],
      "difficulty": "beginner|intermediate|advanced",
      "estimatedLength": 1000,
      "platform": "wechat|xiaohongshu|douyin|zhihu",
      "scores": {
        "engagement": 85,
        "relevance": 90,
        "uniqueness": 75,
        "feasibility": 88,
        "total": 85
      },
      "reasoning": "评分理由（简要说明为什么给出这样的评分）"
    }
  ]
}
\`\`\`

**重要提示**：
1. 选题必须与客户的专业领域高度相关
2. 标题要有吸引力，避免过于学术化
3. 描述要清晰具体，说明能为读者带来什么价值
4. 关键词要精准，便于搜索和传播
5. 难度要符合目标受众的认知水平
6. 平台选择要考虑内容形式和受众特点
7. 评分要客观合理，total = (engagement * 0.3 + relevance * 0.3 + uniqueness * 0.2 + feasibility * 0.2)
8. 必须返回有效的 JSON 格式，不要添加任何额外的文字说明`;
}
