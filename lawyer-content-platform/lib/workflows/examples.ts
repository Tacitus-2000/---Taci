/**
 * Workflows 使用示例
 * 演示如何使用 3 个 LangGraph 工作流
 */

import {
  executeProfileWorkflow,
  executeTopicWorkflow,
  executeScriptWorkflow,
  executeWorkflow,
  WORKFLOW_DESCRIPTIONS,
  type WorkflowType,
} from './index';

/**
 * 示例 1: 执行档案生成工作流
 */
async function exampleProfileWorkflow() {
  console.log('=== 示例 1: 档案生成工作流 ===');
  console.log(WORKFLOW_DESCRIPTIONS.profile);

  const result = await executeProfileWorkflow({
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    industryId: '660e8400-e29b-41d4-a716-446655440000',
  });

  console.log('执行结果:', result.success ? '成功' : '失败');
  if (result.result) {
    console.log('日志数量:', result.result.logs.length);
    console.log('审查结果:', result.result.reviews.length);
  }
}

/**
 * 示例 2: 执行选题生成工作流
 */
async function exampleTopicWorkflow() {
  console.log('\n=== 示例 2: 选题生成工作流 ===');
  console.log(WORKFLOW_DESCRIPTIONS.topic);

  const result = await executeTopicWorkflow({
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    industryId: '660e8400-e29b-41d4-a716-446655440000',
  });

  console.log('执行结果:', result.success ? '成功' : '失败');
  if (result.result) {
    console.log('选题标题:', result.result.selectedTopic?.title);
    console.log('日志数量:', result.result.logs.length);
  }
}

/**
 * 示例 3: 执行完整文案生成工作流
 */
async function exampleScriptWorkflow() {
  console.log('\n=== 示例 3: 完整文案生成工作流 ===');
  console.log(WORKFLOW_DESCRIPTIONS.script);

  const result = await executeScriptWorkflow({
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    industryId: '660e8400-e29b-41d4-a716-446655440000',
    maxRewriteCount: 2,
  });

  console.log('执行结果:', result.success ? '成功' : '失败');
  if (result.result) {
    console.log('文案标题:', result.result.draftScript?.title);
    console.log('审查结果:', result.result.reviews.length);
    console.log('重写次数:', result.result.rewriteCount);
    console.log('最终状态:', result.result.status);
  }
}

/**
 * 示例 4: 使用统一执行器
 */
async function exampleUnifiedExecutor() {
  console.log('\n=== 示例 4: 使用统一执行器 ===');

  const workflows: WorkflowType[] = ['profile', 'topic', 'script'];

  for (const type of workflows) {
    console.log(`\n执行 ${WORKFLOW_DESCRIPTIONS[type].name}...`);
    const result = await executeWorkflow(type, {
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      industryId: '660e8400-e29b-41d4-a716-446655440000',
    });
    console.log('结果:', result.success ? '成功' : '失败');
  }
}

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await exampleProfileWorkflow();
    await exampleTopicWorkflow();
    await exampleScriptWorkflow();
    await exampleUnifiedExecutor();
  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllExamples();
}

export {
  exampleProfileWorkflow,
  exampleTopicWorkflow,
  exampleScriptWorkflow,
  exampleUnifiedExecutor,
  runAllExamples,
};
