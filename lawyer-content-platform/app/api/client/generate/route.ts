/**
 * Client API - Generate Script
 * POST /api/client/generate
 *
 * 生成文案（触发 AI 工作流）
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired } from '@/lib/api/validation';
import { resolveClientId, isErrorResponse } from '@/lib/api/client-helper';
import { createWorkflowExecutor } from '@/lib/services/workflow-executor.service';
import type { GenerateScriptRequest, GenerateScriptResponse } from '@/types/client';

/**
 * POST /api/client/generate
 * 生成文案
 *
 * Request Body:
 * {
 *   "client_id": "uuid",
 *   "topic_id": "uuid" (optional),
 *   "custom_direction": "string" (optional)
 * }
 *
 * 验证规则:
 * - client_id 必填且为有效 UUID
 * - topic_id 和 custom_direction 至少提供一个
 * - 如果提供 topic_id，必须为有效 UUID 且属于该客户
 * - custom_direction 如果提供，长度必须在 10-500 之间
 *
 * 接入真实的 AI 工作流
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateScriptRequest;

    // 验证必填字段
    validateRequired(body.client_id, 'client_id');
    validateUUID(body.client_id, 'client_id');

    // 验证至少提供 topic_id 或 custom_direction
    if (!body.topic_id && !body.custom_direction) {
      return apiError(
        'INVALID_REQUEST',
        'Either topic_id or custom_direction must be provided',
        400
      );
    }

    // 验证 topic_id（如果提供）
    if (body.topic_id) {
      validateUUID(body.topic_id, 'topic_id');
    }

    // 验证 custom_direction（如果提供）
    if (body.custom_direction) {
      const directionLength = body.custom_direction.trim().length;
      if (directionLength < 10 || directionLength > 500) {
        return apiError(
          'INVALID_REQUEST',
          'custom_direction must be between 10 and 500 characters',
          400
        );
      }
    }

    // 解析并验证 client_id（包含授权检查）
    const result = await resolveClientId(request, body.client_id);
    if (isErrorResponse(result)) {
      return result;
    }

    const { clientId } = result;
    const supabase = getSupabaseAdmin();

    // 获取客户档案信息
    const { data: clientProfile, error: profileError } = await supabase
      .from('client_profiles')
      .select('id, industry_id')
      .eq('client_id', clientId)
      .single();

    if (profileError || !clientProfile) {
      console.error('[Client API] Client profile not found:', clientId);
      return apiError('PROFILE_NOT_FOUND', 'Client profile not found', 404);
    }

    // 如果提供了 topic_id，验证选题是否存在且属于该客户
    if (body.topic_id) {
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('id, title, client_id')
        .eq('id', body.topic_id)
        .eq('client_id', clientId)
        .single();

      if (topicError || !topic) {
        console.error('[Client API] Topic not found or does not belong to client:', body.topic_id);
        return apiError('TOPIC_NOT_FOUND', 'Topic not found or does not belong to this client', 404);
      }
    }

    console.log('[Client API] Starting AI workflow:', {
      client_id: clientId,
      industry_id: clientProfile.industry_id,
      topic_id: body.topic_id,
      custom_direction: body.custom_direction,
    });

    // 执行 AI 工作流
    const executor = createWorkflowExecutor();
    const workflowResult = await executor.execute({
      clientId,
      industryId: clientProfile.industry_id,
      topicId: body.topic_id || undefined,
      customDirection: body.custom_direction || undefined,
    });

    if (!workflowResult.success || !workflowResult.scriptData) {
      console.error('[Client API] Workflow execution failed:', workflowResult.error);
      return apiError(
        'WORKFLOW_FAILED',
        workflowResult.error || 'AI workflow execution failed',
        500
      );
    }

    console.log('[Client API] Workflow completed successfully:', {
      agent_run_id: workflowResult.agentRunId,
      script_title: workflowResult.scriptData.title,
    });

    // 保存生成的文案到数据库
    // 注意: hook 和 cta 字段合并到 body 中，因为 scripts 表没有单独的字段
    const fullBody = `${workflowResult.scriptData.hook}\n\n${workflowResult.scriptData.body}\n\n${workflowResult.scriptData.cta}`;

    const { data, error } = await supabase
      .from('scripts')
      .insert({
        client_id: clientId,
        topic_id: body.topic_id || null,
        title: workflowResult.scriptData.title,
        body: fullBody,
        usage_advice: `此文案由 AI 自动生成，已通过可读性和风险审查。建议根据实际情况进行微调后发布。\n\nAgent Run ID: ${workflowResult.agentRunId}`,
        status: 'approved',
        visible_to_client: true,
        internal_only: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Client API] Failed to save script:', error);
      return apiError('DATABASE_ERROR', 'Failed to save generated script', 500, error);
    }

    const response: GenerateScriptResponse = {
      script_id: data.id,
      agent_run_id: workflowResult.agentRunId,
      title: data.title,
      body: data.body,
      usage_advice: data.usage_advice,
      status: data.status,
      created_at: data.created_at,
    };

    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Client API] POST /api/client/generate error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
