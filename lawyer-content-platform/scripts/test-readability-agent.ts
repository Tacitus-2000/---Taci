/**
 * ReadabilityReviewAgent 测试脚本
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { ReadabilityReviewAgent } from '../lib/agents/readabilityReviewAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

// 加载环境变量
config({ path: resolve(__dirname, '../.env.local') });

/**
 * 测试用例 1: 正常流程 - 审查文案
 */
async function testNormalFlow() {
  console.log('\n=== 测试用例 1: 正常流程 ===\n');

  const agent = new ReadabilityReviewAgent();

  // 模拟状态
  const state: AgentState = {
    clientId: 'test-client-001',
    industryId: 'labor-law',
    status: 'running',
    clientProfile: {} as any,
    industryTemplate: {} as any,
    contentPosition: {} as any,
    selectedTopic: {
      id: 'topic-001',
      title: '员工拒绝调岗被辞退，获赔18万！HR必看的3个致命教训',
      description: '通过真实案例分析调岗争议的法律风险',
      targetAudience: 'HR、企业管理者',
      keywords: ['调岗', '辞退', '劳动争议'],
      difficulty: 'medium',
      estimatedLength: 3000,
      scores: {
        engagement: 92,
        relevance: 93,
        uniqueness: 85,
        feasibility: 88,
        overall: 90,
      },
    },
    draftScript: {
      title: '员工拒绝调岗被辞退，获赔18万！HR必看的3个致命教训',
      hook: '最近，一起调岗引发的劳动争议案件引起了广泛关注。某公司因员工拒绝调岗而将其辞退，最终被判赔偿18万元。这个案例给所有HR和企业管理者敲响了警钟：调岗看似简单，实则暗藏法律风险。今天，我们就来深入剖析这个案例，总结3个致命教训，帮助你避免类似的法律纠纷。',
      body: `## 案例回顾

2023年3月，某科技公司因业务调整，决定将研发部门的张工程师调往市场部门担任技术支持。张工程师认为这一调动不合理，明确表示拒绝。公司认为张工程师不服从管理，以"严重违反公司规章制度"为由将其辞退。

张工程师不服，向劳动仲裁委员会申请仲裁，要求公司支付违法解除劳动合同赔偿金。经过审理，仲裁委员会支持了张工程师的请求，判决公司支付赔偿金18万元。

## 教训一：调岗必须具有合理性

**法律依据**：《劳动合同法》第35条规定，用人单位与劳动者协商一致，可以变更劳动合同约定的内容。变更劳动合同，应当采用书面形式。

**案例分析**：在本案中，公司将研发工程师调往市场部门，岗位性质发生了根本性变化。从技术研发到技术支持，不仅工作内容不同，职业发展路径也完全不同。这种调动缺乏合理性。

**实操建议**：
1. 调岗应当与员工的专业背景、工作经验相匹配
2. 调岗不应导致员工的职业发展受到重大影响
3. 调岗应当有明确的业务需求支撑，不能随意调动

## 教训二：调岗程序必须合法

**法律依据**：调岗属于劳动合同的变更，应当遵循协商一致的原则。单方面调岗只有在特定情况下才被允许。

**案例分析**：公司在未与张工程师协商的情况下，单方面决定调岗，违反了协商一致的原则。即使公司认为调岗是基于业务需要，也应当与员工充分沟通，取得员工的同意。

**实操建议**：
1. 调岗前应当与员工进行充分沟通，说明调岗的原因和必要性
2. 调岗应当采用书面形式，明确新岗位的工作内容、薪酬待遇等
3. 如果员工不同意调岗，应当寻求其他解决方案，不能强制执行

## 教训三：以拒绝调岗为由辞退员工风险极高

**法律依据**：《劳动合同法》第39条规定了用人单位可以解除劳动合同的情形，但"拒绝不合理调岗"不在其中。

**案例分析**：公司以张工程师"严重违反公司规章制度"为由辞退，但调岗本身不合理且程序违法，员工拒绝调岗是合法的权利行使，不构成违纪。因此，公司的辞退行为属于违法解除劳动合同。

**实操建议**：
1. 不要将拒绝调岗等同于违纪行为
2. 如果调岗不成功，应当考虑其他方案，如协商解除、经济性裁员等
3. 辞退员工前应当咨询专业法律意见，评估法律风险

## 总结

调岗是企业管理中常见的人事调整手段，但必须在法律框架内进行。本案给我们的启示是：

1. **合理性是前提**：调岗应当符合员工的专业背景和职业发展
2. **程序合法是关键**：调岗应当协商一致，采用书面形式
3. **辞退需谨慎**：不能以拒绝不合理调岗为由辞退员工

希望这个案例能够帮助各位HR和企业管理者更好地理解调岗的法律风险，避免类似的纠纷。如果你在实际工作中遇到类似问题，建议及时咨询专业律师，确保操作的合法性。`,
      cta: '如果你觉得这篇文章对你有帮助，欢迎点赞、转发，让更多的HR和企业管理者看到。如果你有任何问题或想法，也欢迎在评论区留言讨论。关注我，获取更多劳动法实务干货！',
      platform: 'wechat',
      structure_type: 'case_analysis',
      style_note: '专业、实用、易懂',
    },
    reviews: [],
    logs: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
  };

  try {
    console.log('开始执行 ReadabilityReviewAgent...');
    const startTime = Date.now();

    const result = await agent.execute(state);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n执行完成，耗时: ${duration}ms\n`);

    // 输出结果
    console.log('=== 审查结果 ===');
    console.log('状态:', result.status || 'success');
    console.log('错误:', result.error || '无');
    console.log('\n=== 审查详情 ===');
    if (result.reviews && result.reviews.length > 0) {
      const review = result.reviews[0];
      console.log('审查类型:', review.review_type);
      console.log('是否通过:', review.passed ? '✅ 通过' : '❌ 未通过');
      console.log('总分:', review.score);
      console.log('\n问题数量:', review.issues ? Object.keys(review.issues).length : 0);
      if (review.issues) {
        console.log('问题详情:', JSON.stringify(review.issues, null, 2));
      }
      console.log('\n建议数量:', review.suggestions ? Object.keys(review.suggestions).length : 0);
      if (review.suggestions) {
        console.log('建议详情:', JSON.stringify(review.suggestions, null, 2));
      }
    }

    console.log('\n=== 日志 ===');
    if (result.logs) {
      result.logs.forEach((log) => console.log(log));
    }

    console.log('\n✅ 测试用例 1 通过');
  } catch (error) {
    console.error('\n❌ 测试用例 1 失败:', error);
    throw error;
  }
}

/**
 * 测试用例 2: 错误处理 - 缺少文案草稿
 */
async function testErrorHandling() {
  console.log('\n=== 测试用例 2: 错误处理 ===\n');

  const agent = new ReadabilityReviewAgent();

  // 模拟状态（缺少 draftScript）
  const state: AgentState = {
    clientId: 'test-client-001',
    industryId: 'labor-law',
    status: 'running',
    clientProfile: {} as any,
    industryTemplate: {} as any,
    contentPosition: {} as any,
    selectedTopic: {} as any,
    draftScript: undefined, // 缺少文案草稿
    reviews: [],
    logs: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
  };

  try {
    console.log('开始执行 ReadabilityReviewAgent（预期失败）...');

    const result = await agent.execute(state);

    console.log('\n执行完成\n');

    // 输出结果
    console.log('=== 审查结果 ===');
    console.log('状态:', result.status);
    console.log('错误:', result.error);

    if (result.status === 'failed' && result.error) {
      console.log('\n✅ 测试用例 2 通过（正确处理了错误）');
    } else {
      console.log('\n❌ 测试用例 2 失败（应该返回错误状态）');
    }
  } catch (error) {
    console.error('\n❌ 测试用例 2 失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('ReadabilityReviewAgent 测试');
  console.log('========================================');

  try {
    // 检查环境变量
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('缺少环境变量: ANTHROPIC_API_KEY');
    }

    console.log('✅ 环境变量检查通过');

    // 运行测试用例
    await testNormalFlow();
    await testErrorHandling();

    console.log('\n========================================');
    console.log('✅ 所有测试通过');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ 测试失败');
    console.error('========================================\n');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
main();
