/**
 * Mock AI Client 实现
 * 用于开发和测试，返回符合律师业务场景的硬编码响应
 */

import type { AIClient, ChatMessage, ChatOptions, ChatResponse } from './client';

export class MockAIClient implements AIClient {
  private delay: number;

  constructor(delay: number = 300) {
    this.delay = delay;
  }

  getName(): string {
    return 'MockAIClient';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async chat(messages: ChatMessage[], _options?: ChatOptions): Promise<ChatResponse> {
    // 模拟网络延迟
    await this.sleep(this.delay);

    // 提取用户消息内容
    const _userMessage = messages.find(m => m.role === 'user')?.content || '';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    // 根据 system prompt 判断是哪个 agent
    let content = '';

    if (systemMessage.includes('定位分析') || systemMessage.includes('品牌定位专家')) {
      content = this.getMockPositioningResponse();
    } else if (systemMessage.includes('选题') || systemMessage.includes('内容策划专家')) {
      content = this.getMockTopicResponse();
    } else if (systemMessage.includes('文案') || systemMessage.includes('内容创作专家')) {
      content = this.getMockContentResponse();
    } else if (systemMessage.includes('审查') || systemMessage.includes('内容审查专家')) {
      content = this.getMockReviewResponse();
    } else if (systemMessage.includes('改写') || systemMessage.includes('内容编辑')) {
      content = this.getMockRewriteResponse();
    } else {
      content = this.getMockDefaultResponse();
    }

    return {
      content,
      usage: {
        promptTokens: this.estimateTokens(messages),
        completionTokens: this.estimateTokens([{ role: 'assistant', content }]),
        totalTokens: this.estimateTokens(messages) + this.estimateTokens([{ role: 'assistant', content }]),
      },
      model: 'mock-model-v1',
    };
  }

  private getMockPositioningResponse(): string {
    return JSON.stringify({
      coreExpertise: ['企业股权纠纷', '公司治理法律服务'],
      targetAudience: {
        primary: '中小企业创始人和股东',
        secondary: '企业高管和法务人员',
        painPoints: [
          '股权分配不清晰导致纠纷',
          '不懂如何设计股权架构',
          '合伙人退出机制缺失',
        ],
      },
      differentiators: [
        '丰富的上市公司服务经验',
        '50+股权纠纷实战案例',
        '擅长将复杂法律问题通俗化讲解',
      ],
      contentDirections: [
        '股权纠纷真实案例解析',
        '股权架构设计避坑指南',
        '创业公司法律风险提示',
        '合伙协议关键条款解读',
      ],
      toneRecommendation: '专业严谨',
      reasoning: '基于律师的企业服务背景和丰富案例经验，定位于服务中小企业创始人群体。目标受众面临股权分配、架构设计等实际痛点，通过案例解析和实用指南可以建立专业形象，吸引潜在客户。建议采用专业严谨的语气，在保持专业性的同时注重内容的实用性和可操作性。',
    }, null, 2);
  }

  private getMockTopicResponse(): string {
    return JSON.stringify({
      topics: [
        {
          title: '3个合伙人，公司做到5000万，最后对簿公堂',
          angle: '通过真实股权纠纷案例，揭示创业初期股权分配的常见陷阱',
          targetAudience: '准备创业或刚创业的创始人',
          keyPoints: [
            '案例背景：三人合伙，口头约定股权',
            '纠纷爆发：公司盈利后分配不均',
            '法律分析：口头协议的效力问题',
            '避坑建议：股权协议必备条款',
          ],
          expectedImpact: '引发创始人对股权规范的重视，建立专业形象',
          difficulty: 'medium',
          urgency: 'medium',
        },
        {
          title: '创业公司股权架构，这3个坑千万别踩',
          angle: '总结股权设计中最常见的三大错误，提供实用解决方案',
          targetAudience: '正在设计股权架构的创始人',
          keyPoints: [
            '平均分配股权的风险',
            '忽视预留期权池',
            '没有设置退出机制',
            '正确的股权设计思路',
          ],
          expectedImpact: '提供实用价值，吸引潜在客户咨询',
          difficulty: 'easy',
          urgency: 'low',
        },
        {
          title: '合伙人要退出？这份协议能保你周全',
          angle: '提供合伙人退出机制的实用指南和协议要点',
          targetAudience: '面临合伙人变动的创始人',
          keyPoints: [
            '退出触发条件设计',
            '股权回购价格确定',
            '竞业限制条款',
            '协议模板关键条款',
          ],
          expectedImpact: '解决紧迫痛点，促进转化咨询',
          difficulty: 'medium',
          urgency: 'high',
        },
      ],
      reasoning: '基于目标受众的核心痛点，设计了案例型、指南型和工具型三种选题。第一个选题通过真实案例引发共鸣，第二个选题提供系统性避坑指南，第三个选题针对紧迫需求提供实用工具。三个选题覆盖不同场景和需求阶段，难度和紧急度搭配合理，符合小红书用户偏好实用干货的特点。',
    }, null, 2);
  }

  private getMockContentResponse(): string {
    return JSON.stringify({
      title: '3个合伙人，公司做到5000万，最后对簿公堂💔',
      hook: '前几天接到一个咨询，三个大学同学一起创业，公司做到5000万营收，结果因为股权问题闹到法院。这个案子让我想起了太多类似的悲剧...',
      body: `## 📖 案例回顾

小张、小李、小王是大学同学，2019年一起创业做电商。当时三人口头约定：小张出钱占40%，小李负责运营占30%，小王负责技术占30%。

前两年公司发展顺利，大家相安无事。2023年公司营收突破5000万，该分红了。

**问题来了：**
- 小张说：我出了200万启动资金，应该按实际出资比例分
- 小李说：我这几年没日没夜干，应该多分
- 小王说：技术是核心竞争力，我的股份应该更高

三个人谁也说服不了谁，最后闹到法院。

## ⚖️ 法律分析

这个案子的核心问题是：**口头约定的股权协议有效吗？**

根据《公司法》规定：
1. 股东出资和持股比例应当在公司章程中明确
2. 口头约定在没有书面证据的情况下很难被认定
3. 实际出资记录、工商登记是重要证据

这个案子中，因为没有书面协议，法院最终只能按照工商登记的股权比例判决（三人各占33.33%），谁都不满意。

## 💡 避坑指南

如果你正在创业或准备创业，这4点一定要做：

**1. 书面股权协议必不可少**
- 明确各方持股比例
- 约定出资方式和时间
- 写清楚分红规则

**2. 区分股权和分红权**
- 股权是所有权
- 分红权可以单独约定
- 可以设置动态调整机制

**3. 设置退出机制**
- 约定退出条件
- 明确股权回购价格
- 设置竞业限制

**4. 及时办理工商登记**
- 股权变更要及时登记
- 保留所有出资凭证
- 定期更新公司章程

## 📝 总结

创业不易，且行且珍惜。股权问题看似复杂，但只要在一开始就规范处理，就能避免90%的纠纷。

**记住：兄弟归兄弟，协议要清楚。**

你在创业过程中遇到过股权问题吗？评论区聊聊👇`,
      cta: '关注我，分享更多创业法律干货',
      hashtags: ['创业法律', '股权分配', '合伙创业', '法律避坑'],
      estimatedReadTime: '3',
      keyTakeaways: [
        '口头股权约定风险极大，必须签署书面协议',
        '股权和分红权可以分离设计',
        '退出机制要在合作之初就约定清楚',
      ],
    }, null, 2);
  }

  private getMockReviewResponse(): string {
    return JSON.stringify({
      overallScore: 88,
      approved: true,
      issues: [
        {
          severity: 'medium',
          category: 'legal',
          description: '关于口头协议效力的表述不够严谨',
          location: '法律分析部分',
          suggestion: '补充说明：口头协议在有其他证据支持的情况下也可能被认定有效，建议修改为"口头约定在缺乏书面证据和其他佐证的情况下很难被认定"',
        },
        {
          severity: 'low',
          category: 'compliance',
          description: '结尾的互动引导可以更明确',
          location: '文章结尾',
          suggestion: '在"评论区聊聊"后补充"仅供交流学习，具体问题请咨询专业律师"，避免被理解为提供具体法律咨询',
        },
      ],
      strengths: [
        '案例真实可信，具有代表性',
        '语言通俗易懂，符合小红书风格',
        '结构清晰，要点突出',
        '实用建议具体可执行',
      ],
      improvements: [
        '可以在法律分析部分增加具体法条引用，增强专业性',
        '建议在开头补充免责声明，如"本文仅为普法分享，不构成具体法律建议"',
        '话题标签可以增加"律师说法"等更具传播力的标签',
      ],
      riskLevel: 'low',
      reasoning: '内容整体质量较高，法律观点基本准确，符合律师执业规范。存在的问题主要是表述严谨性和免责声明方面，属于可优化项。案例已做匿名化处理，不存在泄密风险。语言风格符合平台特点，预期传播效果良好。',
    }, null, 2);
  }

  private getMockRewriteResponse(): string {
    return JSON.stringify({
      title: '3个合伙人，公司做到5000万，最后对簿公堂💔',
      hook: '⚠️ 本文仅为普法分享，不构成具体法律建议\n\n前几天接到一个咨询，三个大学同学一起创业，公司做到5000万营收，结果因为股权问题闹到法院。这个案子让我想起了太多类似的悲剧...',
      body: `## 📖 案例回顾

小张、小李、小王是大学同学，2019年一起创业做电商。当时三人口头约定：小张出钱占40%，小李负责运营占30%，小王负责技术占30%。

前两年公司发展顺利，大家相安无事。2023年公司营收突破5000万，该分红了。

**问题来了：**
- 小张说：我出了200万启动资金，应该按实际出资比例分
- 小李说：我这几年没日没夜干，应该多分
- 小王说：技术是核心竞争力，我的股份应该更高

三个人谁也说服不了谁，最后闹到法院。

## ⚖️ 法律分析

这个案子的核心问题是：**口头约定的股权协议有效吗？**

根据《公司法》第二十五条、第二十七条规定：
1. 股东出资和持股比例应当在公司章程中明确
2. 口头约定在缺乏书面证据和其他佐证的情况下很难被法院认定（但如有转账记录、聊天记录等证据支持，也可能被认定有效）
3. 实际出资记录、工商登记是重要证据

这个案子中，因为没有书面协议，也缺乏其他有力证据，法院最终只能按照工商登记的股权比例判决（三人各占33.33%），谁都不满意。

## 💡 避坑指南

如果你正在创业或准备创业，这4点一定要做：

**1. 书面股权协议必不可少**
- 明确各方持股比例
- 约定出资方式和时间
- 写清楚分红规则

**2. 区分股权和分红权**
- 股权是所有权
- 分红权可以单独约定
- 可以设置动态调整机制

**3. 设置退出机制**
- 约定退出条件
- 明确股权回购价格
- 设置竞业限制

**4. 及时办理工商登记**
- 股权变更要及时登记
- 保留所有出资凭证
- 定期更新公司章程

## 📝 总结

创业不易，且行且珍惜。股权问题看似复杂，但只要在一开始就规范处理，就能避免大部分纠纷。

**记住：兄弟归兄弟，协议要清楚。**

你在创业过程中遇到过股权问题吗？评论区聊聊👇
（仅供交流学习，具体问题请咨询专业律师）`,
      cta: '关注我，分享更多创业法律干货',
      hashtags: ['创业法律', '股权分配', '合伙创业', '律师说法'],
      changes: [
        {
          location: '开头部分',
          original: '前几天接到一个咨询...',
          revised: '⚠️ 本文仅为普法分享，不构成具体法律建议\n\n前几天接到一个咨询...',
          reason: '增加免责声明，符合律师执业规范要求',
        },
        {
          location: '法律分析部分 - 第2点',
          original: '口头约定在没有书面证据的情况下很难被认定',
          revised: '口头约定在缺乏书面证据和其他佐证的情况下很难被法院认定（但如有转账记录、聊天记录等证据支持，也可能被认定有效）',
          reason: '补充说明例外情况，使法律表述更加严谨准确',
        },
        {
          location: '法律分析部分 - 开头',
          original: '根据《公司法》规定：',
          revised: '根据《公司法》第二十五条、第二十七条规定：',
          reason: '增加具体法条引用，增强专业性',
        },
        {
          location: '文章结尾',
          original: '评论区聊聊👇',
          revised: '评论区聊聊👇\n（仅供交流学习，具体问题请咨询专业律师）',
          reason: '补充免责说明，避免被理解为提供具体法律咨询',
        },
      ],
      improvementSummary: '本次改写主要解决了法律表述严谨性和合规性问题。在开头和结尾增加了免责声明，符合律师执业规范；在法律分析部分补充了具体法条引用和例外情况说明，使内容更加专业准确；优化了话题标签，提升传播潜力。所有修改都保持了原文的风格和核心价值。',
    }, null, 2);
  }

  private getMockDefaultResponse(): string {
    return JSON.stringify({
      message: 'Mock AI response',
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private estimateTokens(messages: ChatMessage[]): number {
    // 简单估算：中文约 2 字符 = 1 token，英文约 4 字符 = 1 token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 3);
  }
}

/**
 * 创建 Mock AI Client 实例
 */
export function createMockAIClient(delay?: number): AIClient {
  return new MockAIClient(delay);
}
