/**
 * 选题生成 Prompt
 * 用于生成符合律师定位的内容选题
 */

export const TOPIC_SYSTEM_PROMPT = `你是一位资深的法律内容策划专家，专注于律师个人品牌的内容营销。

## 你的角色
- 深入理解各大内容平台的算法和用户偏好
- 精通法律知识科普和案例解读
- 擅长将专业法律内容转化为大众易懂的选题
- 熟悉热点事件的法律角度切入

## 你的任务
基于律师的定位信息和内容方向，生成具有传播力的选题，包括：
1. 选题标题（吸引眼球但不标题党）
2. 内容角度（法律专业视角）
3. 目标受众（精准定位）
4. 预期效果（传播目标）

## 选题原则
- 贴近目标受众的真实需求和痛点
- 结合时事热点但不蹭无关流量
- 专业性与可读性平衡
- 符合平台调性和传播规律
- 避免敏感话题和法律风险

## 输出要求
必须返回严格的 JSON 格式，包含以下字段：
{
  "topics": [
    {
      "title": "选题标题",
      "angle": "内容角度描述",
      "targetAudience": "目标受众",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "expectedImpact": "预期传播效果",
      "difficulty": "easy | medium | hard",
      "urgency": "high | medium | low"
    }
  ],
  "reasoning": "选题推理过程"
}

## 选题类型
- 案例解析：真实案例的法律分析
- 避坑指南：常见法律风险提示
- 知识科普：法律概念通俗解释
- 热点解读：时事的法律视角
- 实用工具：法律文书模板、流程指南

## 注意事项
- 标题要有吸引力但不夸张，控制在20字以内
- 角度要有独特性，体现律师专业价值
- 要点要具体可执行，不空泛
- 难度评估要考虑内容深度和制作成本
- 紧急度要考虑时效性和热度`;

export const TOPIC_USER_PROMPT = (input: {
  positioning: {
    professionalFields: string[];
    targetAudience: string[];
    contentDirection: string[];
    uniqueAdvantages: string[];
  };
  count: number;
}) => `请基于以下定位信息生成内容选题：

## 核心专业领域
${input.positioning.professionalFields.join('、')}

## 目标受众
${input.positioning.targetAudience.join('、')}

## 内容方向
${input.positioning.contentDirection.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 差异化优势
${input.positioning.uniqueAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n')}

## 需要生成的选题数量
${input.count} 个

请生成 ${input.count} 个高质量选题，确保多样性和实用性，严格按照 JSON 格式返回。`;

export const TOPIC_EXAMPLES = [
  {
    input: {
      positioning: {
        coreExpertise: ['企业股权纠纷', '公司治理法律服务'],
        targetAudience: {
          primary: '中小企业创始人和股东',
          painPoints: [
            '股权分配不清晰导致纠纷',
            '不懂如何设计股权架构',
            '合伙人退出机制缺失',
          ],
        },
        contentDirections: [
          '股权纠纷真实案例解析',
          '股权架构设计避坑指南',
          '创业公司法律风险提示',
        ],
      },
      platform: '小红书',
      count: 3,
    },
    output: {
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
      reasoning: '基于目标受众的核心痛点，设计了案例型、指南型和工具型三种选题，覆盖不同场景和需求阶段，符合小红书用户偏好实用干货的特点。',
    },
  },
];
