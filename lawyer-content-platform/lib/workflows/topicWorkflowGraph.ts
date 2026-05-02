/**
 * Topic Workflow Graph
 * 选题生成工作流
 *
 * 流程: START → data → profile → topic → riskReview → END
 */

import { StateGraph } from '@langchain/langgraph';
import type { AgentState } from '../schemas/agentStateSchema';
import { createDataAgent } from '../agents/dataAgent';
import { createProfileAgent } from '../agents/profileAgent';
import { createTopicAgent } from '../agents/topicAgent';
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
 * 选题生成节点
 */
async function topicNode(state: typeof GraphAnnotation.State) {
  try {
    const agent = createTopicAgent();
    const update = await agent.execute(state as AgentState);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[TopicNode] 执行失败: ${errorMessage}`],
      error: `选题生成失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 风险审查节点
 * 注意：此工作流中没有 draftScript，所以需要创建一个基于选题的 mock
 */
async function riskReviewNode(state: typeof GraphAnnotation.State) {
  try {
    // 基于选题创建一个简单的 mock script
    const topic = state.selectedTopic as Record<string, unknown>;
    const mockScript = {
      title: (topic?.title as string) || '选题测试',
      body: `${topic?.description || '这是一个测试文案'}。本内容仅供参考，不构成正式法律意见。`,
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
 * 创建选题生成工作流
 */
export function createTopicWorkflow() {
  const workflow = new StateGraph(GraphAnnotation)
    .addNode('data', dataNode)
    .addNode('profile', profileNode)
    .addNode('topic', topicNode)
    .addNode('riskReview', riskReviewNode)
    .addEdge('__start__', 'data')
    .addEdge('data', 'profile')
    .addEdge('profile', 'topic')
    .addEdge('topic', 'riskReview')
    .addEdge('riskReview', '__end__');

  return workflow.compile();
}

/**
 * 执行选题生成工作流
 */
export async function executeTopicWorkflow(input: {
  clientId: string;
  industryId: string;
  maxRewriteCount?: number;
}) {
  const workflow = createTopicWorkflow();

  const initialState = {
    clientId: input.clientId,
    industryId: input.industryId,
    maxRewriteCount: input.maxRewriteCount || 3,
    status: 'running' as const,
    startedAt: new Date().toISOString(),
    logs: [`[TopicWorkflow] 工作流开始 - clientId: ${input.clientId}`],
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
