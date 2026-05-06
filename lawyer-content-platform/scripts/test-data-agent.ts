/**
 * DataAgent 测试脚本
 * 测试真实的数据库查询功能
 */

import 'dotenv/config';
import { createDataAgent } from '../lib/agents/dataAgent';
import type { AgentState } from '../lib/schemas/agentStateSchema';

async function testDataAgent() {
  console.log('='.repeat(60));
  console.log('DataAgent 测试');
  console.log('='.repeat(60));
  console.log();

  const agent = createDataAgent();

  // 测试用例 1: 使用真实的客户 ID
  console.log('测试 1: 加载真实客户数据');
  console.log('-'.repeat(60));

  // 使用种子数据脚本创建的测试 ID
  const testClientId = 'test-client-001';
  const testIndustryId = 'legal-services';

  const initialState: AgentState = {
    clientId: testClientId,
    industryId: testIndustryId,
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
    status: 'running',
  };

  try {
    const result = await agent.execute(initialState);

    console.log('执行结果:');
    console.log('  状态:', result.status || 'running');
    console.log('  日志条数:', result.logs?.length || 0);
    console.log();

    if (result.logs) {
      console.log('日志内容:');
      result.logs.forEach((log) => console.log(`  ${log}`));
      console.log();
    }

    if (result.error) {
      console.log('❌ 错误:', result.error);
      console.log();
    } else {
      console.log('✅ 数据采集成功');
      console.log();

      if (result.clientProfile) {
        console.log('客户档案:');
        console.log(JSON.stringify(result.clientProfile, null, 2));
        console.log();
      }

      if (result.industryTemplate) {
        console.log('行业模板:');
        console.log(JSON.stringify(result.industryTemplate, null, 2));
        console.log();
      }
    }
  } catch (error) {
    console.log('❌ 测试失败:', error instanceof Error ? error.message : error);
    console.log();
  }

  // 测试用例 2: 使用不存在的客户 ID（测试错误处理）
  console.log('测试 2: 错误处理（不存在的客户 ID）');
  console.log('-'.repeat(60));

  const invalidState: AgentState = {
    clientId: 'non-existent-client-id',
    industryId: 'non-existent-industry-id',
    reviews: [],
    rewriteCount: 0,
    maxRewriteCount: 3,
    logs: [],
    status: 'running',
  };

  try {
    const result = await agent.execute(invalidState);

    console.log('执行结果:');
    console.log('  状态:', result.status || 'running');
    console.log();

    if (result.error) {
      console.log('✅ 正确捕获错误:', result.error);
      console.log();
    } else {
      console.log('⚠️  预期应该有错误，但执行成功了');
      console.log();
    }

    if (result.logs) {
      console.log('日志内容:');
      result.logs.forEach((log) => console.log(`  ${log}`));
      console.log();
    }
  } catch (error) {
    console.log('❌ 测试失败:', error instanceof Error ? error.message : error);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}

// 运行测试
testDataAgent().catch((error) => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
