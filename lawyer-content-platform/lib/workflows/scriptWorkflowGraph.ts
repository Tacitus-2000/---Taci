/**
 * Script Workflow Graph
 * 完整的文案生成工作流 - 包含并行审查和重写循环
 *
 * 流程: START → data → profile → topic → script → parallelReview → supervisor → [rewrite 或 END]
 */

import { StateGraph } from '@langchain/langgraph';
import type { AgentState } from '../schemas/agentStateSchema';
import { createDataAgent } from '../agents/dataAgent';
import { createProfileAgent } from '../agents/profileAgent';
import { createTopicAgent } from '../agents/topicAgent';
import { createScriptAgent } from '../agents/scriptAgent';
import { createReadabilityReviewAgent } from '../agents/readabilityReviewAgent';
import { createRiskReviewAgent } from '../agents/riskReviewAgent';
import { createRewriteAgent } from '../agents/rewriteAgent';
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
 * 文案生成节点
 */
async function scriptNode(state: typeof GraphAnnotation.State) {
  try {
    const agent = createScriptAgent();
    const update = await agent.execute(state as AgentState);
    return update;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[ScriptNode] 执行失败: ${errorMessage}`],
      error: `文案生成失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 并行审查节点
 * 同时执行可读性审查和风险审查
 */
async function parallelReviewNode(state: typeof GraphAnnotation.State) {
  const logs: string[] = [...(state.logs || [])];
  logs.push('[ParallelReview] 开始并行审查');

  try {
    // 创建审查 agents
    const readabilityAgent = createReadabilityReviewAgent();
    const riskAgent = createRiskReviewAgent();

    // 并行执行两个审查
    const [readabilityUpdate, riskUpdate] = await Promise.all([
      readabilityAgent.execute(state as AgentState),
      riskAgent.execute(state as AgentState),
    ]);

    logs.push('[ParallelReview] 并行审查完成');

    // 修复问题 2: 只返回新增的审查结果，让 reducer 自动合并
    // 不要手动合并 state.reviews，避免双重合并
    const newReviews = [
      ...(readabilityUpdate.reviews || []),
      ...(riskUpdate.reviews || []),
    ];

    const newLogs = [
      ...logs,
      ...(readabilityUpdate.logs || []),
      ...(riskUpdate.logs || []),
    ];

    return {
      reviews: newReviews,
      logs: newLogs,
      error: readabilityUpdate.error || riskUpdate.error,
      status: readabilityUpdate.error || riskUpdate.error ? ('failed' as const) : state.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    logs.push(`[ParallelReview] 并行审查失败: ${errorMessage}`);

    return {
      logs,
      error: `并行审查失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 监督节点
 * 决定是否需要重写
 */
async function supervisorNode(state: typeof GraphAnnotation.State) {
  const logs: string[] = [...(state.logs || [])];
  logs.push('[Supervisor] 开始监督决策');

  // 检查是否有错误
  if (state.error) {
    logs.push(`[Supervisor] 检测到错误: ${state.error}`);
    return {
      logs,
      status: 'failed' as const,
    };
  }

  // 检查审查结果
  const reviews = state.reviews || [];
  const allPassed = reviews.length > 0 && reviews.every((r) => r.passed);

  if (allPassed) {
    logs.push('[Supervisor] 所有审查通过，工作流完成');
    return {
      logs,
      status: 'completed' as const,
    };
  }

  // 检查重写次数
  const rewriteCount = state.rewriteCount || 0;
  const maxRewriteCount = state.maxRewriteCount || 3;

  if (rewriteCount >= maxRewriteCount) {
    logs.push(`[Supervisor] 已达到最大重写次数 (${maxRewriteCount})，工作流失败`);
    return {
      logs,
      error: `已达到最大重写次数 (${maxRewriteCount})，但仍未通过审查`,
      status: 'failed' as const,
    };
  }

  logs.push(`[Supervisor] 审查未通过，需要重写 (第 ${rewriteCount + 1}/${maxRewriteCount} 次)`);
  return {
    logs,
  };
}

/**
 * 重写节点
 */
async function rewriteNode(state: typeof GraphAnnotation.State) {
  try {
    const agent = createRewriteAgent();
    const update = await agent.execute(state as AgentState);

    // 修复问题 1: 显式递增 rewriteCount
    const currentCount = state.rewriteCount || 0;
    return {
      ...update,
      rewriteCount: currentCount + 1,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      logs: [`[RewriteNode] 执行失败: ${errorMessage}`],
      error: `文案重写失败: ${errorMessage}`,
      status: 'failed' as const,
    };
  }
}

/**
 * 条件边：决定是否需要重写
 */
function shouldRewrite(state: typeof GraphAnnotation.State): 'rewrite' | 'end' {
  // 如果有错误或状态为 failed，结束
  if (state.error || state.status === 'failed') {
    return 'end';
  }

  // 如果状态为 completed，结束
  if (state.status === 'completed') {
    return 'end';
  }

  // 检查审查结果
  const reviews = state.reviews || [];
  const allPassed = reviews.length > 0 && reviews.every((r) => r.passed);

  if (allPassed) {
    return 'end';
  }

  // 检查重写次数
  const rewriteCount = state.rewriteCount || 0;
  const maxRewriteCount = state.maxRewriteCount || 3;

  if (rewriteCount >= maxRewriteCount) {
    return 'end';
  }

  // 需要重写
  return 'rewrite';
}

/**
 * 创建完整的文案生成工作流
 */
export function createScriptWorkflow() {
  const workflow = new StateGraph(GraphAnnotation)
    .addNode('data', dataNode)
    .addNode('profile', profileNode)
    .addNode('topic', topicNode)
    .addNode('script', scriptNode)
    .addNode('parallelReview', parallelReviewNode)
    .addNode('supervisor', supervisorNode)
    .addNode('rewrite', rewriteNode)
    .addEdge('__start__', 'data')
    .addEdge('data', 'profile')
    .addEdge('profile', 'topic')
    .addEdge('topic', 'script')
    .addEdge('script', 'parallelReview')
    .addEdge('parallelReview', 'supervisor')
    .addConditionalEdges('supervisor', shouldRewrite, {
      rewrite: 'rewrite',
      end: '__end__',
    })
    .addEdge('rewrite', 'parallelReview'); // 重写后重新审查

  return workflow.compile();
}

/**
 * 执行完整的文案生成工作流
 */
export async function executeScriptWorkflow(input: {
  clientId: string;
  industryId: string;
  maxRewriteCount?: number;
}) {
  const workflow = createScriptWorkflow();

  const initialState = {
    clientId: input.clientId,
    industryId: input.industryId,
    maxRewriteCount: input.maxRewriteCount || 2, // 默认最多重写 2 次
    status: 'running' as const,
    startedAt: new Date().toISOString(),
    logs: [`[ScriptWorkflow] 工作流开始 - clientId: ${input.clientId}`],
  };

  try {
    const result = await workflow.invoke(initialState);

    // 确保最终状态正确
    const finalStatus = result.error ? 'failed' : result.status === 'completed' ? 'completed' : 'completed';

    return {
      success: !result.error,
      result: {
        ...result,
        status: finalStatus as 'completed' | 'failed',
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
