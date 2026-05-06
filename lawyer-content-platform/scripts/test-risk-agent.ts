/**
 * RiskReviewAgent 测试脚本
 */

import { resolve } from 'path';
import { config } from 'dotenv';
import { createRiskReviewAgent } from '../lib/agents/riskReviewAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

// 加载环境变量
config({ path: resolve(__dirname, '../.env.local') });

/**
 * 测试用例 1: 正常流程 - 审查包含风险的文案
 */
async function testNormalFlow() {
  console.log('\n=== 测试用例 1: 正常流程 ===\n');

  const agent = createRiskReviewAgent();

  // 模拟状态（包含一些潜在风险）
  const state: AgentState = {
    clientId: 'test-client-1',
    industryId: 'labor-law',
    status: 'running',
    clientProfile: {
      id: 'profile-1',
      clientId: 'test-client-1',
      firmName: '测试律所',
      lawyerName: '张律师',
      practiceYears: 10,
      specializations: ['劳动法', '合同纠纷'],
      targetAudience: 'HR、企业管理者',
      contentGoals: '提供劳动法知识，吸引企业客户',
      tonePreference: '专业、实用',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    industryTemplate: {
      id: 'template-1',
      industryId: 'labor-law',
      name: '劳动法模板',
      complianceRules: {
        prohibitedTopics: ['虚假承诺', '保证胜诉'],
        requiredDisclaimer: '本文仅供参考，不构成法律意见。具体案件请咨询专业律师。',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    draftScript: {
      title: '员工拒绝调岗被辞退，获赔18万！HR必看的3个致命教训',
      hook: '最近，一起劳动纠纷案件引发了HR圈的热议。某公司因调岗操作不当，被判赔偿员工18万元。这个案例给所有HR敲响了警钟：调岗看似简单，实则处处是坑。今天，我们就来深度剖析这个案例，帮你避开调岗中的法律雷区。',
      body: `## 案例回顾

2023年3月，某互联网公司因业务调整，决定将技术部门的李某从开发岗调整到测试岗。公司认为这是正常的内部调整，但李某认为这是变相降职，拒绝接受。公司随后以"不服从工作安排"为由解除了劳动合同。

李某不服，向劳动仲裁委员会申请仲裁，要求公司支付违法解除劳动合同赔偿金。最终，仲裁委支持了李某的请求，公司被判赔偿18万元。

## 教训一：调岗必须具有合理性

**法律依据**：《劳动合同法》第35条规定，用人单位与劳动者协商一致，可以变更劳动合同约定的内容。

**案例分析**：
本案中，公司将李某从开发岗调整到测试岗，虽然都属于技术岗位，但工作内容、职责范围、职业发展路径都有明显差异。法院认为，这种调整实质上改变了劳动合同的核心内容，必须经过员工同意。

**HR必知**：
1. 调岗必须有合理的业务需要，不能随意调整
2. 调岗不能降低员工的薪资待遇
3. 调岗不能改变劳动合同的核心内容（如工作地点、岗位性质等）
4. 如果调岗涉及重大变更，必须与员工协商一致

## 教训二：调岗程序必须合法

**法律依据**：《劳动合同法》第40条规定，劳动者不能胜任工作，经过培训或者调整工作岗位，仍不能胜任工作的，用人单位可以解除劳动合同。

**案例分析**：
公司在调岗时，没有提供任何证据证明李某不能胜任原岗位工作，也没有进行培训或绩效考核。直接以"业务调整"为由进行调岗，缺乏法律依据。

**HR必知**：
1. 调岗前要有充分的证据支持（如绩效考核、业务调整文件等）
2. 要履行告知义务，提前通知员工
3. 要给员工合理的考虑时间
4. 要保留完整的书面记录

## 教训三：解除劳动合同要慎重

**法律依据**：《劳动合同法》第39条规定，劳动者严重违反用人单位的规章制度的，用人单位可以解除劳动合同。

**案例分析**：
公司以"不服从工作安排"为由解除劳动合同，但法院认为，员工拒绝不合理的调岗要求，不属于"严重违反规章制度"。公司的解除行为构成违法解除。

**HR必知**：
1. 解除劳动合同必须有明确的法律依据
2. 规章制度必须合法、合理，并经过民主程序制定
3. 解除前要履行告知、听证等程序
4. 要保留完整的证据链

## 总结

调岗是HR工作中的常见操作，但稍有不慎就可能引发劳动纠纷。记住这三个关键点：

1. **合理性**：调岗要有合理的业务需要，不能随意调整
2. **程序性**：调岗要履行完整的法律程序，保留书面记录
3. **协商性**：涉及重大变更的调岗，必须与员工协商一致

只有做到这三点，才能有效规避法律风险，保护企业和员工的合法权益。`,
      cta: '如果你在调岗、解除劳动合同等方面遇到问题，欢迎咨询我们的专业律师团队。我们将为你提供专业的法律建议，帮你规避法律风险。',
      platform: 'wechat',
      structure_type: 'case_analysis',
      style_note: '专业、实用、案例驱动',
    },
    reviews: [],
    logs: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
  };

  console.log('开始风险审查...\n');
  const startTime = Date.now();

  try {
    const result = await agent.execute(state);
    const endTime = Date.now();

    console.log('✅ 风险审查完成');
    console.log(`⏱️  耗时: ${endTime - startTime}ms\n`);

    // 输出审查结果
    if (result.reviews && result.reviews.length > 0) {
      const review = result.reviews[0];
      console.log('📊 审查结果:');
      console.log(`  - 是否通过: ${review.passed ? '✅ 通过' : '❌ 未通过'}`);
      console.log(`  - 总分: ${review.score}/100`);

      if (review.issues) {
        console.log('\n⚠️  发现的问题:');
        const issues = review.issues as Record<string, any>;
        Object.entries(issues).forEach(([key, issue]) => {
          console.log(`  - ${key}:`);
          console.log(`    严重程度: ${issue.severity}`);
          console.log(`    描述: ${issue.description}`);
        });
      }

      if (review.suggestions) {
        console.log('\n💡 改进建议:');
        const suggestions = review.suggestions as Record<string, any>;
        Object.entries(suggestions).forEach(([key, suggestion]) => {
          console.log(`  - ${key}: ${suggestion}`);
        });
      }
    }

    // 输出日志
    if (result.logs && result.logs.length > 0) {
      console.log('\n📝 执行日志:');
      result.logs.forEach((log) => console.log(`  ${log}`));
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 测试用例 2: 错误处理 - 缺少必需数据
 */
async function testErrorHandling() {
  console.log('\n=== 测试用例 2: 错误处理 ===\n');

  const agent = createRiskReviewAgent();

  // 模拟状态（缺少 draftScript）
  const state: AgentState = {
    clientId: 'test-client-1',
    industryId: 'labor-law',
    status: 'running',
    reviews: [],
    logs: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
  };

  console.log('测试缺少文案草稿的情况...\n');

  try {
    const result = await agent.execute(state);

    if (result.error) {
      console.log('✅ 正确处理了错误');
      console.log(`📝 错误信息: ${result.error}`);
      console.log(`📊 状态: ${result.status}`);
    } else {
      console.error('❌ 应该返回错误，但没有');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🧪 RiskReviewAgent 测试开始\n');
  console.log('='.repeat(50));

  try {
    // 测试用例 1: 正常流程
    await testNormalFlow();

    console.log('\n' + '='.repeat(50));

    // 测试用例 2: 错误处理
    await testErrorHandling();

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ 所有测试通过！\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
main();
