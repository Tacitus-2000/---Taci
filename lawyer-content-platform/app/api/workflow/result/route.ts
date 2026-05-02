/**
 * 获取工作流结果 API
 * GET /api/workflow/result?workflowId=xxx
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { createWorkflowService } from '@/lib/services/workflow.service';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return apiError('INVALID_REQUEST', 'workflowId 参数不能为空', 400);
    }

    console.log('[API] 获取工作流结果:', workflowId);

    // 创建工作流服务实例
    const workflowService = createWorkflowService();

    // 从数据库获取工作流信息
    const workflow = await workflowService.getWorkflow(workflowId);

    if (!workflow) {
      return apiError('WORKFLOW_NOT_FOUND', '工作流不存在', 404);
    }

    // 检查工作流是否完成
    if (workflow.status !== 'completed') {
      return apiError(
        'WORKFLOW_NOT_COMPLETED',
        `工作流尚未完成，当前状态: ${workflow.status}`,
        400
      );
    }

    if (!workflow.result) {
      return apiError('WORKFLOW_FAILED', '工作流未生成结果', 400);
    }

    // 返回完整结果
    return apiSuccess({
      workflowId,
      status: workflow.status,
      input: workflow.input,
      result: workflow.result,
      createdAt: workflow.created_at,
      completedAt: workflow.completed_at,
    });
  } catch (error) {
    console.error('[API] 获取工作流结果失败:', error);
    return apiError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : '获取工作流结果失败',
      500
    );
  }
}
