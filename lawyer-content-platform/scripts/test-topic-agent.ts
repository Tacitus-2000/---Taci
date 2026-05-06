/**
 * TopicAgent 测试脚本
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createTopicAgent } from '../lib/agents/topicAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

// 加载环境变量
config({ path: resolve(__dirname, '../.env.local') });

/**
 * 测试 TopicAgent 正常流程
 */
async function testNormalFlow() {
  console.log('\n=== 测试 TopicAgent 正常流程 ===\n');

  const agent = createTopicAgent();

  // 构造测试状态
  const state: AgentState = {
    clientId: 'test-client-1',
    industryId: 'test-industry-1',
    clientProfile: {
      id: 'profile-1',
      clientId: 'test-client-1',
      name: '张律师',
      expertise: ['劳动法', '劳动争议', '劳动合同'],
      yearsOfExperience: 8,
      location: '上海',
      contentPosition: {
        expertise_areas: ['劳动法', '劳动争议解决', '企业用工合规'],
        target_audience: ['HR管理者', '企业法务', '创业公司老板', '职场人士'],
        content_directions: ['劳动法实务解析', '劳动争议案例分析', '企业用工风险防范', '员工权益保护指南'],
        differentiation_points: ['8年劳动法实务经验', '处理过200+劳动争议案件', '擅长企业用工合规咨询'],
        tone_style: '专业严谨但通俗易懂，用案例说话',
        value_proposition: '帮助企业规避用工风险，帮助员工维护合法权益',
        content_formats: ['图文', '短视频', '案例分析'],
        publishing_frequency: '每周3-4篇',
        interaction_strategy: '及时回复评论，定期举办线上答疑',
        success_metrics: ['阅读量', '互动率', '咨询转化率'],
        content_themes: ['劳动合同签订', '工资福利争议', '解除劳动关系', '工伤认定'],
        taboo_topics: ['政治敏感话题', '过度承诺胜诉', '诋毁同行'],
        reference_accounts: ['劳动法江湖', '劳动法库'],
        growth_goals: '6个月内粉丝破万，建立劳动法领域个人品牌',
        collaboration_preferences: ['企业培训', '法律咨询平台合作'],
        budget_range: '中等',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    industryTemplate: {
      id: 'template-1',
      industry: '法律服务',
      commonPainPoints: [
        '不了解劳动法规定，容易踩坑',
        '劳动争议处理不当，损失惨重',
        '企业用工不规范，面临法律风险',
        '员工权益受损，不知如何维权',
      ],
      trendingTopics: [
        '2026年劳动法新规',
        '灵活用工合规',
        '远程办公劳动关系',
        '裁员补偿标准',
        '工伤认定新规',
      ],
      contentSuggestions: [
        '用真实案例讲解法律知识',
        '提供实用的操作指南',
        '解读最新法律法规',
        '分析热点劳动争议案件',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    logs: [],
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    status: 'pending',
  };

  try {
    const startTime = Date.now();
    const result = await agent.execute(state);
    const endTime = Date.now();

    console.log('执行结果：');
    console.log('- 状态:', result.status || 'success');
    console.log('- 耗时:', endTime - startTime, 'ms');
    console.log('\n日志：');
    result.logs?.forEach((log) => console.log(log));

    if (result.selectedTopic) {
      console.log('\n选中的选题：');
      console.log(JSON.stringify(result.selectedTopic, null, 2));
    }

    if (result.error) {
      console.error('\n错误:', result.error);
    }
  } catch (error) {
    console.error('测试失败:', error);
    throw error;
  }
}

/**
 * 测试 TopicAgent 错误处理
 */
async function testErrorHandling() {
  console.log('\n=== 测试 TopicAgent 错误处理 ===\n');

  const agent = createTopicAgent();

  // 测试缺少客户档案
  const stateWithoutProfile: AgentState = {
    clientId: 'test-client-1',
    industryId: 'test-industry-1',
    industryTemplate: {
      id: 'template-1',
      industry: '法律服务',
      commonPainPoints: [],
      trendingTopics: [],
      contentSuggestions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    logs: [],
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    status: 'pending',
  };

  try {
    const result = await agent.execute(stateWithoutProfile);
    console.log('错误处理结果：');
    console.log('- 状态:', result.status);
    console.log('- 错误信息:', result.error);
    console.log('\n日志：');
    result.logs?.forEach((log) => console.log(log));
  } catch (error) {
    console.error('测试失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await testNormalFlow();
    await testErrorHandling();
    console.log('\n✅ 所有测试通过\n');
  } catch (error) {
    console.error('\n❌ 测试失败\n');
    process.exit(1);
  }
}

main();
