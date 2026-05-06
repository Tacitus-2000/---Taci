/**
 * ScriptAgent 测试脚本
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { ScriptAgent } from '../lib/agents/scriptAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

// 加载环境变量
config({ path: resolve(__dirname, '../.env.local') });

/**
 * 测试 ScriptAgent
 */
async function testScriptAgent() {
  console.log('=== ScriptAgent 测试 ===\n');

  const agent = new ScriptAgent();

  // 测试用例 1: 正常流程
  console.log('测试用例 1: 正常流程');
  console.log('---');

  const mockState: AgentState = {
    clientId: 'test-client-001',
    industryId: 'legal-labor',
    status: 'running',
    clientProfile: {
      id: 'profile-001',
      clientId: 'test-client-001',
      expertise: ['劳动法', '劳动合同', '劳动纠纷'],
      targetIndustries: ['互联网', '制造业', '服务业'],
      contentGoals: ['品牌建设', '客户获取', '专业展示'],
      tonePreference: 'professional',
      avoidTopics: ['政治敏感话题'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    industryTemplate: {
      id: 'template-labor',
      industryId: 'legal-labor',
      name: '劳动法模板',
      complianceRules: {
        requiredDisclaimer: '本内容仅供参考，不构成正式法律意见。具体问题请咨询专业律师。',
        prohibitedClaims: ['保证胜诉', '100%成功', '最好的律师'],
        sensitiveTopics: ['劳资冲突', '罢工'],
      },
      contentGuidelines: {
        recommendedStructures: ['问题解析型', '案例分析型', '风险提示型'],
        toneGuidelines: '专业、客观、实用',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    selectedTopic: {
      id: 'topic-001',
      title: '员工拒绝调岗被辞退，获赔18万！HR必看的3个教训',
      description: '通过真实案例分析企业调岗的法律边界，帮助HR避免常见的调岗误区，降低劳动纠纷风险。',
      targetAudience: '企业HR、管理者',
      keywords: ['调岗', '劳动合同', '劳动纠纷', '赔偿'],
      difficulty: 'intermediate',
      estimatedLength: 1800,
      scores: {
        engagement: 92,
        relevance: 93,
        uniqueness: 85,
        feasibility: 88,
        total: 90,
      },
    },
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
  };

  try {
    console.time('ScriptAgent 执行时间');
    const result = await agent.execute(mockState);
    console.timeEnd('ScriptAgent 执行时间');

    console.log('\n执行结果:');
    console.log('- 状态:', result.status || 'in_progress');
    console.log('- 错误:', result.error || '无');
    console.log('- 日志条数:', result.logs?.length || 0);

    if (result.draftScript) {
      console.log('\n生成的文案:');
      console.log('- 标题:', result.draftScript.title);
      console.log('- 平台:', result.draftScript.platform);
      console.log('- 结构类型:', result.draftScript.structure_type);
      console.log('- 开场钩子长度:', result.draftScript.hook?.length || 0, '字');
      console.log('- 正文长度:', result.draftScript.body?.length || 0, '字');
      console.log('- CTA 长度:', result.draftScript.cta?.length || 0, '字');
      console.log('- 总长度:',
        (result.draftScript.title?.length || 0) +
        (result.draftScript.hook?.length || 0) +
        (result.draftScript.body?.length || 0) +
        (result.draftScript.cta?.length || 0), '字');

      console.log('\n开场钩子预览:');
      console.log(result.draftScript.hook?.substring(0, 100) + '...');

      console.log('\n正文预览:');
      console.log(result.draftScript.body?.substring(0, 200) + '...');
    }

    console.log('\n日志:');
    result.logs?.forEach((log) => console.log(log));

    console.log('\n✅ 测试用例 1 通过\n');
  } catch (error) {
    console.error('\n❌ 测试用例 1 失败:', error);
    process.exit(1);
  }

  // 测试用例 2: 错误处理 - 缺少选题
  console.log('\n测试用例 2: 错误处理 - 缺少选题');
  console.log('---');

  const invalidState: AgentState = {
    clientId: 'test-client-001',
    industryId: 'legal-labor',
    status: 'running',
    clientProfile: mockState.clientProfile,
    industryTemplate: mockState.industryTemplate,
    selectedTopic: undefined,
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
  };

  try {
    const result = await agent.execute(invalidState);

    if (result.error && result.status === 'failed') {
      console.log('✅ 正确处理了缺少选题的情况');
      console.log('- 错误信息:', result.error);
    } else {
      console.error('❌ 应该返回错误状态');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 测试用例 2 失败:', error);
    process.exit(1);
  }

  console.log('\n=== 所有测试通过 ===');
}

// 运行测试
testScriptAgent().catch((error) => {
  console.error('测试失败:', error);
  process.exit(1);
});
