/**
 * Client API - Get Agent Run Status
 * GET /api/client/agent-runs/[id]
 *
 * 获取 Agent Run 的执行状态（用于实时进度显示）
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID } from '@/lib/api/validation';
import { WorkflowService } from '@/lib/services/workflow.service';

/**
 * GET /api/client/agent-runs/[id]
 * 获取 Agent Run 状态和步骤
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证 ID
    validateUUID(id, 'agent_run_id');

    const workflowService = new WorkflowService();

    // 获取 Agent Run 信息
    const agentRun = await workflowService.getAgentRun(id);

    if (!agentRun) {
      return apiError('NOT_FOUND', 'Agent run not found', 404);
    }

    // 获取所有步骤
    const steps = await workflowService.listAgentRunSteps(id);

    // 计算进度
    const totalSteps = 7; // 数据采集、档案生成、选题生成、文案生成、可读性审查、风险审查、完成
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    // 获取当前步骤
    const currentStep = steps.find(s => s.status === 'running') || steps[steps.length - 1];

    const response = {
      id: agentRun.id,
      status: agentRun.status,
      task_type: agentRun.task_type,
      input_summary: agentRun.input_summary,
      output_summary: agentRun.output_summary,
      error_message: agentRun.error_message,
      created_at: agentRun.created_at,
      updated_at: agentRun.updated_at,
      progress: {
        percentage: progress,
        completed_steps: completedSteps,
        total_steps: totalSteps,
        current_step: currentStep ? {
          agent_name: currentStep.agent_name,
          status: currentStep.status,
        } : null,
      },
      steps: steps.map(step => ({
        id: step.id,
        agent_name: step.agent_name,
        role: step.role,
        status: step.status,
        error_message: step.error_message,
        created_at: step.created_at,
        updated_at: step.updated_at,
      })),
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/agent-runs/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
