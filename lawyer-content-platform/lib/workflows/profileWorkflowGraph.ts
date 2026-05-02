/**
 * Profile Workflow Graph
 * 档案生成工作流 - 最简单的工作流，用于验证架构可行性
 *
 * 流程: START → data → profile → riskReview → END
 */

import { StateGraph } from '@langchain/langgraph';
import type { AgentState } from '../schemas/agentStateSchema';
import { createDataAgent } from '../agents/dataAgent';
import { createProfileAgent } from '../agents/profileAgent';
import { createRiskReviewAgent } from '../agents/riskReviewAgent';
import { GraphAnnotation } from './graphAnnotation';

/**
 * 数据采集节点
 */
async function dataNode(state: typeof GraphAnnotation.State) {
  try {
    const agent = createDataAgent();
    const update = await agent.execute(state as AgentState);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[DataNode] 执行失败: ${errorMessage}`],
      error: `数据采集失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 档案生成节点
 */
async function profileNode(state: typeof GraphAnnotation.State) {
  try {
    const agent = createProfileAgent();
    const update = await agent.execute(state as AgentState);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[ProfileNode] 执行失败: ${errorMessage}`],
      error: `档案生成失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 风险审查节点
 * 注意：此工作流中没有 draftScript，所以需要创建一个 mock 的
 */
async function riskReviewNode(state: typeof GraphAnnotation.State) {
  try {
    // 为了演示工作流，创建一个简单的 mock script
    const mockScript = {
      title: '档案生成测试',
      body: '这是一个测试文案，用于验证工作流架构。本内容仅供参考，不构成正式法律意见。',
      platform: '测试平台',
    };

    // 临时添加 draftScript 以便风险审查可以执行
    const stateWithScript = {
      ...state,
      draftScript: mockScript,
    } as AgentState;

    const agent = createRiskReviewAgent();
    const update = await agent.execute(stateWithScript);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[RiskReviewNode] 执行失败: ${errorMessage}`],
      error: `风险审查失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 创建档案生成工作流
 */
export function createProfileWorkflow() {
  const workflow = new StateGraph(GraphAnnotation)
    .addNode('data', dataNode)
    .addNode('profile', profileNode)
    .addNode('riskReview', riskReviewNode)
    .addEdge('__start__', 'data')
    .addEdge('data', 'profile')
    .addEdge('profile', 'riskReview')
    .addEdge('riskReview', '__end__');

  return workflow.compile();
}

/**
 * 执行档案生成工作流
 */
export async function executeProfileWorkflow(input: {
  clientId: string;
  industryId: string;
  maxRewriteCount?: number;
}) {
  const workflow = createProfileWorkflow();

  const initialState = {
    clientId: input.clientId,
    industryId: input.industryId,
    maxRewriteCount: input.maxRewriteCount || 3,
    status: 'running' as const,
    startedAt: new Date().toISOString(),
    logs: [`[ProfileWorkflow] 工作流开始 - clientId: ${input.clientId}`],
  };

  try {
    const result = await workflow.invoke(initialState);

    return {
      success: true,
      result: {
        ...result,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      error: errorMessage,
      status: 'failed' as const,
    };
  }
}
