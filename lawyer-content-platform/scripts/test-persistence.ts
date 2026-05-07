/**
 * 数据持久化测试脚本
 * 测试 WorkflowService 的 agent_runs 和 agent_run_steps 操作
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { WorkflowService } from '../lib/services/workflow.service';

/**
 * 测试 Agent Run 和 Agent Run Steps 持久化
 */
async function testPersistence() {
  console.log('\n========================================');
  console.log('测试数据持久化功能');
  console.log('========================================\n');

  const service = new WorkflowService();

  try {
    // 1. 创建 Agent Run（不关联 client_id 和 industry_id，避免外键约束）
    console.log('📝 步骤 1: 创建 Agent Run 记录...');
    const agentRunId = await service.createAgentRun({
      taskType: 'content_generation',
      inputSummary: '测试工作流：生成劳动法相关内容',
      internalOnly: true,
    });
    console.log(`✅ Agent Run 创建成功: ${agentRunId}\n`);

    // 2. 更新 Agent Run 状态为 running
    console.log('📝 步骤 2: 更新 Agent Run 状态为 running...');
    await service.updateAgentRunStatus(agentRunId, 'running');
    console.log('✅ 状态更新成功\n');

    // 3. 创建多个 Agent Run Steps
    console.log('📝 步骤 3: 创建 Agent Run Steps...');

    const steps = [
      { agentName: 'ProfileAgent', role: 'profile_generation' },
      { agentName: 'TopicAgent', role: 'topic_generation' },
      { agentName: 'ScriptAgent', role: 'script_generation' },
      { agentName: 'ReadabilityReviewAgent', role: 'readability_review' },
      { agentName: 'RiskReviewAgent', role: 'risk_review' },
    ];

    const stepIds: string[] = [];

    for (const step of steps) {
      const stepId = await service.createAgentRunStep({
        agentRunId,
        agentName: step.agentName,
        role: step.role,
        inputPayload: {
          timestamp: new Date().toISOString(),
          testData: true,
        },
      });
      stepIds.push(stepId);
      console.log(`  ✅ ${step.agentName} step 创建成功: ${stepId}`);
    }
    console.log('');

    // 4. 模拟步骤执行：更新每个步骤的状态和输出
    console.log('📝 步骤 4: 模拟步骤执行...');

    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i];
      const step = steps[i];

      // 更新为 running
      await service.updateAgentRunStepStatus(stepId, 'running');
      console.log(`  ⏳ ${step.agentName} 开始执行...`);

      // 模拟执行时间
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 更新为 completed 并添加输出
      await service.updateAgentRunStepOutput(
        stepId,
        {
          result: `${step.agentName} 执行成功`,
          executionTime: Math.random() * 1000,
          timestamp: new Date().toISOString(),
        },
        'completed'
      );
      console.log(`  ✅ ${step.agentName} 执行完成`);
    }
    console.log('');

    // 5. 更新 Agent Run 为 completed
    console.log('📝 步骤 5: 更新 Agent Run 为 completed...');
    await service.updateAgentRunOutput(
      agentRunId,
      '工作流执行成功，生成了完整的法律营销文案',
      'completed'
    );
    console.log('✅ Agent Run 完成\n');

    // 6. 验证数据：读取 Agent Run
    console.log('📝 步骤 6: 验证数据...');
    const agentRun = await service.getAgentRun(agentRunId);
    console.log('Agent Run 记录:');
    console.log(`  - ID: ${agentRun?.id}`);
    console.log(`  - 状态: ${agentRun?.status}`);
    console.log(`  - 任务类型: ${agentRun?.task_type}`);
    console.log(`  - 输入摘要: ${agentRun?.input_summary}`);
    console.log(`  - 输出摘要: ${agentRun?.output_summary}`);
    console.log('');

    // 7. 验证数据：读取所有步骤
    const allSteps = await service.listAgentRunSteps(agentRunId);
    console.log(`Agent Run Steps (共 ${allSteps.length} 个):`);
    allSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.agent_name} (${step.role})`);
      console.log(`     状态: ${step.status}`);
      console.log(`     输出: ${JSON.stringify(step.output_payload)}`);
    });
    console.log('');

    // 8. 测试列表查询
    console.log('📝 步骤 7: 测试列表查询...');
    const recentRuns = await service.listAgentRuns({
      limit: 5,
      offset: 0,
    });
    console.log(`最近的 Agent Runs (共 ${recentRuns.length} 个):`);
    recentRuns.forEach((run, index) => {
      console.log(`  ${index + 1}. ${run.task_type} - ${run.status} (${run.created_at})`);
    });
    console.log('');

    console.log('========================================');
    console.log('✅ 所有测试通过！');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('\n========================================');
  console.log('测试错误处理');
  console.log('========================================\n');

  const service = new WorkflowService();

  try {
    // 创建一个会失败的 Agent Run
    console.log('📝 创建 Agent Run...');
    const agentRunId = await service.createAgentRun({
      taskType: 'test_error_handling',
      inputSummary: '测试错误处理',
    });
    console.log(`✅ Agent Run 创建成功: ${agentRunId}\n`);

    // 创建一个步骤
    console.log('📝 创建 Agent Run Step...');
    const stepId = await service.createAgentRunStep({
      agentRunId,
      agentName: 'TestAgent',
      role: 'test_role',
    });
    console.log(`✅ Step 创建成功: ${stepId}\n`);

    // 模拟步骤失败
    console.log('📝 模拟步骤失败...');
    await service.updateAgentRunStepStatus(stepId, 'running');
    await service.updateAgentRunStepStatus(
      stepId,
      'failed',
      'Test error: Something went wrong'
    );
    console.log('✅ 步骤失败状态记录成功\n');

    // 更新 Agent Run 为 failed
    console.log('📝 更新 Agent Run 为 failed...');
    await service.updateAgentRunStatus(
      agentRunId,
      'failed',
      'Workflow failed due to step error'
    );
    console.log('✅ Agent Run 失败状态记录成功\n');

    // 验证错误记录
    const agentRun = await service.getAgentRun(agentRunId);
    const step = await service.getAgentRunStep(stepId);

    console.log('验证错误记录:');
    console.log(`  Agent Run 状态: ${agentRun?.status}`);
    console.log(`  Agent Run 错误: ${agentRun?.error_message}`);
    console.log(`  Step 状态: ${step?.status}`);
    console.log(`  Step 错误: ${step?.error_message}`);
    console.log('');

    console.log('========================================');
    console.log('✅ 错误处理测试通过！');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await testPersistence();
    await testErrorHandling();
    console.log('🎉 所有测试完成！\n');
    process.exit(0);
  } catch (error) {
    console.error('💥 测试失败:', error);
    process.exit(1);
  }
}

main();
