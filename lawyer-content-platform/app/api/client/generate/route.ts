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
 * TODO: 接入真实的 AI 工作流
 * 当前使用 mock 实现，直接创建一个 draft 状态的文案
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

    // Step 2: 如果提供了 topic_id，验证选题是否存在且属于该客户
    let topicTitle = '';
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

      topicTitle = topic.title;
    }

    // TODO: 接入真实的 AI 工作流
    // 当前使用 mock 实现
    console.log('[Client API] Generating script (MOCK):', {
      client_id: clientId,
      topic_id: body.topic_id,
      custom_direction: body.custom_direction,
    });

    // Mock: 创建一个 draft 状态的文案
    const mockTitle = body.topic_id
      ? `${topicTitle} - 文案草稿`
      : `自定义文案 - ${body.custom_direction?.substring(0, 20)}...`;

    const mockBody = `这是一个 Mock 生成的文案。

【开头】
${body.custom_direction || topicTitle}

【正文】
这里是文案的主要内容。在真实环境中，这将由 AI 工作流生成。

【结尾】
行动号召和总结。

---
TODO: 接入真实的 AI 工作流
当前为 Mock 实现，用于测试 API 结构。`;

    const mockUsageAdvice = `使用建议：
1. 这是一个测试文案
2. 请在真实环境中接入 AI 工作流
3. 当前状态为 draft，需要审核后才能发布`;

    // Step 3: 插入文案
    const { data, error } = await supabase
      .from('scripts')
      .insert({
        client_id: clientId,
        topic_id: body.topic_id || null,
        title: mockTitle,
        body: mockBody,
        usage_advice: mockUsageAdvice,
        status: 'draft',
        visible_to_client: true,
        internal_only: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Client API] Failed to create script:', error);
      return apiError('DATABASE_ERROR', 'Failed to create script', 500, error);
    }

    const response: GenerateScriptResponse = {
      script_id: data.id,
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
