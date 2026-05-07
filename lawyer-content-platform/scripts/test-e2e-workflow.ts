/**
 * 端到端工作流测试
 * 测试完整的 AI 工作流执行流程
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

import { createWorkflowExecutor } from '../lib/services/workflow-executor.service';

async function testE2EWorkflow() {
  console.log('🚀 开始端到端工作流测试...\n');

  const executor = createWorkflowExecutor();

  try {
    // 测试客户 ID（从数据库中获取）
    const clientId = '4ff3cf3d-4e9f-4f8a-85f4-c79c88f6ec5b';
    const industryId = '68fae97b-d9e4-47d5-a099-cb1d8eb9af6c'; // 法律服务行业

    console.log('📋 测试参数:');
    console.log(`  - Client ID: ${clientId}`);
    console.log(`  - Industry ID: ${industryId}`);
    console.log(`  - Custom Direction: 劳动法相关的常见问题\n`);

    console.log('⏳ 执行工作流...\n');
    const startTime = Date.now();

    const result = await executor.execute({
      clientId,
      industryId,
      customDirection: '劳动法相关的常见问题',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ 工作流执行成功！\n');
    console.log('📊 执行结果:');
    console.log(`  - Agent Run ID: ${result.agentRunId}`);
    console.log(`  - 成功状态: ${result.success}`);
    console.log(`  - 耗时: ${duration} 秒\n`);

    if (result.scriptData) {
      console.log('📝 生成的脚本:');
      console.log(`  - 标题: ${result.scriptData.title}`);
      console.log(`  - 开场钩子长度: ${result.scriptData.hook?.length || 0} 字符`);
      console.log(`  - 正文长度: ${result.scriptData.body?.length || 0} 字符`);
      console.log(`  - CTA 长度: ${result.scriptData.cta?.length || 0} 字符`);
      console.log(`  - 总长度: ${(result.scriptData.hook?.length || 0) + (result.scriptData.body?.length || 0) + (result.scriptData.cta?.length || 0)} 字符\n`);
    } else {
      console.log('⚠️  未生成脚本数据\n');
    }

    console.log('🎯 测试通过！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 工作流执行失败:');
    console.error(error);
    process.exit(1);
  }
}

testE2EWorkflow();
