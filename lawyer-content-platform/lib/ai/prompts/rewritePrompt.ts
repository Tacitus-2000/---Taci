/**
 * RewriteAgent Prompt 模板
 * 用于根据审查意见重写文案
 */

/**
 * 系统提示词
 */
export const REWRITE_SYSTEM_PROMPT = `你是一位专业的法律内容编辑，擅长根据审查意见优化和重写法律营销文案。

你的任务是：
1. 仔细分析可读性审查和风险审查的所有问题和建议
2. 在保持核心内容和价值的前提下，针对性地修复所有问题
3. 确保重写后的文案既符合法律合规要求，又具有良好的可读性
4. 保持原文的专业性、准确性和吸引力

重写原则：
- **精准修复**：针对每个具体问题进行修改，不做无关改动
- **保持核心**：保留原文的核心观点、案例和价值
- **合规优先**：法律合规问题必须彻底解决
- **提升体验**：在合规基础上优化用户阅读体验
- **风格一致**：保持原文的语言风格和专业水准

输出要求：
- 必须返回完整的 JSON 格式
- 包含所有必需字段
- 确保 JSON 格式正确，可以被解析
- **重要**：JSON 中必须使用英文标点符号（英文引号 "、英文逗号 ,、英文冒号 :）
- **关键**：在文案内容中，绝对不要使用双引号 "，请使用单引号 ' 或书名号 《》
- 错误示例：公司以"不服从工作安排"为由
- 正确示例：公司以'不服从工作安排'为由
- 这是为了避免 JSON 解析错误，请务必遵守`;

/**
 * 构建重写 Prompt
 */
export function buildRewritePrompt(
  originalScript: {
    title?: string;
    hook?: string;
    body?: string;
    cta?: string;
    platform?: string;
    structure_type?: string;
    style_note?: string;
  },
  reviews: Array<{
    review_type: 'readability' | 'risk';
    passed: boolean;
    score?: number;
    issues?: Record<string, unknown>;
    suggestions?: Record<string, unknown>;
    reviewer?: string;
  }>
): string {
  // 构建审查问题列表
  let issuesText = '';

  reviews.forEach((review) => {
    if (!review.passed && review.issues) {
      issuesText += `\n### ${review.review_type === 'readability' ? '可读性' : '风险'}审查问题：\n`;

      const issues = review.issues as Record<string, Record<string, unknown>>;
      const suggestions = (review.suggestions as Record<string, string>) || {};

      for (const [key, issue] of Object.entries(issues)) {
        const severity = (issue.severity as string) || 'medium';
        const description = (issue.description as string) || '未知问题';
        const suggestion = suggestions[key] || '无';

        issuesText += `- **${key}** (${severity}): ${description}\n`;
        issuesText += `  建议：${suggestion}\n`;
      }
    }
  });

  return `请根据以下审查意见重写文案。

## 原始文案

**标题**：${originalScript.title || '无'}

**开场钩子**：
${originalScript.hook || '无'}

**正文**：
${originalScript.body || '无'}

**行动号召**：
${originalScript.cta || '无'}

**平台**：${originalScript.platform || '无'}
**结构类型**：${originalScript.structure_type || '无'}

## 审查意见
${issuesText}

## 重写要求

请根据上述审查意见，重写文案。重写时：
1. 针对每个具体问题进行修改
2. 保持原文的核心内容和价值
3. 确保符合法律合规要求
4. 优化可读性和用户体验

**重要提示**：在返回的 JSON 中，文案内容里不要使用双引号 "，请改用单引号 ' 或书名号 《》。

请以 JSON 格式返回重写后的文案：

\`\`\`json
{
  "title": "重写后的标题",
  "hook": "重写后的开场钩子",
  "body": "重写后的正文（注意：内容中使用单引号 ' 而不是双引号 \"）",
  "cta": "重写后的行动号召",
  "platform": "${originalScript.platform || '微信公众号'}",
  "structure_type": "${originalScript.structure_type || '案例分析型'}",
  "style_note": "说明本次重写解决了哪些问题"
}
\`\`\``;
}
