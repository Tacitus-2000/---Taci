/**
 * 查询工作流状态 API
 * GET /api/workflow/status?workflowId=xxx
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

    console.log('[API] 查询工作流状态:', workflowId);

    // 创建工作流服务实例
    const workflowService = createWorkflowService();

    // 从数据库获取工作流信息
    const workflow = await workflowService.getWorkflow(workflowId);

    if (!workflow) {
      return apiError('WORKFLOW_NOT_FOUND', '工作流不存在', 404);
    }

    // 计算进度百分比
    const statusProgress: Record<string, number> = {
      pending: 0,
      running: 50,
      completed: 100,
      failed: 0,
    };

    const progress = statusProgress[workflow.status] || 0;

    return apiSuccess({
      workflowId,
      status: workflow.status,
      progress,
      error: workflow.error,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
      completedAt: workflow.completed_at,
    });
  } catch (error) {
    console.error('[API] 查询工作流状态失败:', error);
    return apiError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : '查询工作流状态失败',
      500
    );
  }
}
