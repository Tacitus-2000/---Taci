/**
 * RewriteAgent 测试脚本
 */

import { resolve } from 'path';
import { config } from 'dotenv';
import { createRewriteAgent } from '../lib/agents/rewriteAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

// 加载环境变量
config({ path: resolve(__dirname, '../.env.local') });

async function testRewriteAgent() {
  console.log('=== RewriteAgent 测试 ===\n');

  const agent = createRewriteAgent();

  // 测试用例 1: 正常流程 - 根据审查意见重写文案
  console.log('测试用例 1: 根据审查意见重写文案');
  console.log('---');

  const state: AgentState = {
    clientId: 'client-123',
    industryId: 'industry-456',
    status: 'running',
    clientProfile: {
      name: '张律师',
      practiceAreas: ['劳动法'],
      targetAudience: ['企业HR', '创业者'],
    } as Record<string, unknown>,
    industryTemplate: {
      name: '劳动法',
      complianceRules: {
        requiredDisclaimer: '本文仅供参考，不构成法律意见。具体问题请咨询专业律师。',
      },
    } as Record<string, unknown>,
    selectedTopic: {
      id: 'topic-1',
      title: '员工拒绝调岗被辞退案例分析',
      description: '分析员工拒绝调岗被辞退的法律问题',
    } as Record<string, unknown>,
    draftScript: {
      title: '员工拒绝调岗被辞退，获赔18万！HR必看的3个致命教训',
      hook: '最近，一起员工拒绝调岗被辞退的案件引发了广泛关注。李某在公司工作5年后，因拒绝从技术岗调至销售岗被公司辞退，最终获得法院判决赔偿18万元。这个案例给所有HR和企业管理者敲响了警钟。',
      body: `## 案例回顾

李某于2018年入职某科技公司，担任软件工程师。2023年初，公司因业务调整，要求李某从技术部调至销售部担任销售经理。李某认为这与其专业背景和职业规划不符，拒绝了调岗要求。

公司随后以"不服从工作安排"为由，解除了与李某的劳动合同。李某不服，向劳动仲裁委员会申请仲裁，要求公司支付违法解除劳动合同赔偿金。

## 法院判决

法院经审理认为：

1. **调岗必须合理**：公司虽有用工自主权，但调岗必须具有合理性，不能显著降低员工待遇或与其专业严重不符。

2. **协商是前提**：调岗应当与员工协商一致，单方面强制调岗违反劳动合同法规定。

3. **解除需有依据**：员工拒绝不合理调岗不构成"严重违反规章制度"，公司解除劳动合同属于违法解除。

最终，法院判决公司支付李某违法解除劳动合同赔偿金18万元（月工资9000元×10个月×2倍）。

## HR必看的3个教训

### 教训一：调岗必须具备合理性

调岗不是企业的任意权力，必须满足以下条件：
- 与员工的专业背景、工作经验相符
- 不显著降低员工的工资待遇
- 符合企业的实际经营需要
- 不存在恶意调岗的情形

### 教训二：协商一致是关键

根据《劳动合同法》第35条规定，变更劳动合同应当采用书面形式，经双方协商一致。单方面强制调岗，即使有"服从工作安排"的条款，也可能被认定为无效。

### 教训三：解除劳动合同需谨慎

员工拒绝不合理调岗，不能简单地认定为"不服从工作安排"而解除劳动合同。企业应当：
- 充分沟通调岗的必要性和合理性
- 提供书面的调岗通知和理由说明
- 给予员工合理的考虑时间
- 如确需解除，应依法支付经济补偿

## 实操建议

1. **完善规章制度**：在员工手册中明确调岗的条件、程序和标准
2. **保留沟通记录**：调岗过程中的所有沟通都应保留书面记录
3. **合理设置岗位**：调岗应当考虑员工的实际情况和职业发展
4. **寻求法律支持**：重大调岗决策前，建议咨询专业律师`,
      cta: '如果您在企业管理中遇到类似的劳动法问题，欢迎咨询我们的专业团队。我们将为您提供专业的法律意见和解决方案。',
      platform: '微信公众号',
      structure_type: '案例分析型',
      style_note: '',
    },
    reviews: [
      {
        review_type: 'readability',
        passed: false,
        score: 82,
        issues: {
          title_length: {
            severity: 'low',
            description: '标题长度为27字，接近上限（建议20-25字）',
          },
          hook_length: {
            severity: 'medium',
            description: '开场钩子约180字，建议控制在150字以内',
          },
          long_paragraphs: {
            severity: 'medium',
            description: '存在4个段落超过250字，建议拆分',
          },
        },
        suggestions: {
          title_length: '建议将标题缩短至25字以内，保持吸引力的同时提高可读性',
          hook_length: '建议将开场钩子精简至120-150字，突出核心冲突点',
          long_paragraphs: '建议将长段落拆分为2-3个小段落，每段控制在150-200字',
        },
      },
      {
        review_type: 'risk',
        passed: false,
        score: 88,
        issues: {
          specific_amount: {
            severity: 'medium',
            description: '标题和正文提及具体赔偿金额（18万），可能被理解为对类似案件结果的暗示',
          },
          absolute_terms: {
            severity: 'low',
            description: '使用了"必须"、"必看"等绝对化表述',
          },
          disclaimer_position: {
            severity: 'low',
            description: '缺少免责声明或位置不够显著',
          },
        },
        suggestions: {
          specific_amount: '建议在标题中淡化具体金额，改为"获赔偿"或"胜诉"等表述',
          absolute_terms: '建议将"必须"改为"应当"，"必看"改为"值得关注"',
          disclaimer_position: '建议在文章开头或CTA前增加显著的免责声明',
        },
      },
    ],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
  };

  try {
    console.time('重写耗时');
    const result = await agent.execute(state);
    console.timeEnd('重写耗时');

    console.log('\n✅ 重写成功');
    console.log('\n重写后的文案:');
    console.log('---');
    console.log('标题:', result.draftScript?.title);
    console.log('\n开场钩子:');
    console.log(result.draftScript?.hook);
    console.log('\n正文长度:', result.draftScript?.body?.length, '字');
    console.log('\nCTA:');
    console.log(result.draftScript?.cta);
    console.log('\n风格备注:');
    console.log(result.draftScript?.style_note);
    console.log('\n重写次数:', result.rewriteCount);
    console.log('\n日志:');
    result.logs?.forEach((log) => console.log(log));
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  }

  console.log('\n---\n');

  // 测试用例 2: 错误处理 - 缺少文案草稿
  console.log('测试用例 2: 错误处理 - 缺少文案草稿');
  console.log('---');

  const errorState: AgentState = {
    clientId: 'client-123',
    industryId: 'industry-456',
    status: 'running',
    clientProfile: {} as Record<string, unknown>,
    reviews: [
      {
        review_type: 'readability',
        passed: false,
        score: 60,
        issues: {},
        suggestions: {},
      },
    ],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
  };

  try {
    const result = await agent.execute(errorState);
    if (result.error) {
      console.log('✅ 正确捕获错误:', result.error);
    } else {
      console.log('❌ 应该返回错误');
    }
  } catch (error) {
    console.error('❌ 不应该抛出异常:', error);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testRewriteAgent().catch(console.error);
