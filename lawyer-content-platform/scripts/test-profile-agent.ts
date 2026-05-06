/**
 * ProfileAgent 测试脚本
 * 测试内容定位档案生成功能
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(__dirname, '../.env.local') });

import { createProfileAgent } from '../lib/agents/profileAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

async function testProfileAgent() {
  console.log('='.repeat(60));
  console.log('ProfileAgent 测试');
  console.log('='.repeat(60));
  console.log();

  // 调试：检查环境变量
  console.log('环境变量检查:');
  console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '已设置' : '未设置');
  console.log('  ANTHROPIC_BASE_URL:', process.env.ANTHROPIC_BASE_URL || '未设置');
  console.log();

  const agent = createProfileAgent();

  // 测试用例 1: 正常流程
  console.log('测试用例 1: 正常流程');
  console.log('-'.repeat(60));

  const mockState: AgentState = {
    clientId: 'test-client-001',
    industryId: 'test-industry-001',
    clientProfile: {
      id: 'test-profile-001',
      clientId: 'test-client-001',
      name: '张律师',
      expertise: ['合同法', '公司法', '知识产权法'],
      experience: '10年',
      targetAudience: '中小企业主',
      contentPreferences: {
        topics: ['合同审查', '股权设计', '商标保护'],
        frequency: 'weekly',
        platforms: ['微信公众号', '知乎'],
      },
      previousContent: {
        totalPosts: 50,
        avgEngagement: 1200,
        topPerformingTopics: ['合同风险防范', '股权激励方案'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    industryTemplate: {
      id: 'test-template-001',
      industry: '法律服务',
      contentGuidelines: {
        tone: 'professional',
        style: 'practical',
        avoidTopics: ['政治敏感', '医疗诊断'],
      },
      platformSettings: {
        preferredPlatforms: ['微信公众号', '知乎', '小红书'],
        contentLength: {
          short: '500-800字',
          medium: '1000-1500字',
          long: '2000-3000字',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
    status: 'running',
  };

  try {
    console.log('输入数据:');
    console.log('- 律师姓名:', mockState.clientProfile?.name);
    console.log('- 专业领域:', mockState.clientProfile?.expertise);
    console.log('- 从业经验:', mockState.clientProfile?.experience);
    console.log('- 目标受众:', mockState.clientProfile?.targetAudience);
    console.log();

    console.log('开始生成内容定位档案...');
    const startTime = Date.now();

    const result = await agent.execute(mockState);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ 生成成功 (耗时: ${duration}ms)`);
    console.log();

    if (result.contentPosition) {
      console.log('生成的内容定位档案:');
      console.log(JSON.stringify(result.contentPosition, null, 2));
      console.log();

      // 验证必需字段
      const requiredFields = [
        'lawyerName',
        'experience',
        'professionalFields',
        'targetAudience',
        'contentDirection',
        'contentStyle',
        'contentStrategy',
      ];

      console.log('字段验证:');
      let allFieldsPresent = true;
      for (const field of requiredFields) {
        const present = !!(result.contentPosition as Record<string, unknown>)[field];
        console.log(`  ${present ? '✅' : '❌'} ${field}`);
        if (!present) allFieldsPresent = false;
      }
      console.log();

      if (allFieldsPresent) {
        console.log('✅ 所有必需字段都存在');
      } else {
        console.log('❌ 缺少必需字段');
      }
    }

    console.log();
    console.log('日志:');
    result.logs?.forEach((log) => console.log(`  ${log}`));
    console.log();

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }

  // 测试用例 2: 缺少客户档案
  console.log();
  console.log('测试用例 2: 错误处理 - 缺少客户档案');
  console.log('-'.repeat(60));

  const invalidState: AgentState = {
    clientId: 'test-client-002',
    industryId: 'test-industry-002',
    industryTemplate: mockState.industryTemplate,
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
    status: 'running',
  };

  try {
    const result = await agent.execute(invalidState);

    if (result.error) {
      console.log('✅ 正确捕获错误:', result.error);
    } else {
      console.log('❌ 应该返回错误但没有');
    }
  } catch (error) {
    console.log('✅ 正确抛出异常:', error);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('✅ 所有测试完成');
  console.log('='.repeat(60));
}

// 运行测试
testProfileAgent().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
