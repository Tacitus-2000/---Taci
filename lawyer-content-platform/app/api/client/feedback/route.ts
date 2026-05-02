/**
 * Client API - Feedback
 * POST /api/client/feedback
 *
 * 提交客户反馈
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired, validateEnum } from '@/lib/api/validation';
import type { ClientFeedbackRequest, ClientFeedbackResponse } from '@/types/client';

/**
 * POST /api/client/feedback
 * 提交客户反馈
 *
 * Request Body:
 * {
 *   "client_id": "uuid",
 *   "content_type": "profile" | "topic" | "script" | "general",
 *   "content_id": "uuid" (optional),
 *   "feedback_text": "string",
 *   "rating": 1-5 (optional)
 * }
 *
 * 验证规则:
 * - client_id 必填且为有效 UUID
 * - content_type 必填且为枚举值之一
 * - feedback_text 必填且长度 >= 1
 * - rating 可选，如果提供必须在 1-5 之间
 * - content_id 可选，如果提供必须为有效 UUID
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClientFeedbackRequest;

    // 验证必填字段
    validateRequired(body.client_id, 'client_id');
    validateUUID(body.client_id, 'client_id');
    validateRequired(body.content_type, 'content_type');
    validateEnum(
      body.content_type,
      ['profile', 'topic', 'script', 'general'] as const,
      'content_type'
    );
    validateRequired(body.feedback_text, 'feedback_text');

    // 验证 feedback_text 长度
    if (body.feedback_text.trim().length < 1) {
      return apiError('INVALID_REQUEST', 'feedback_text must not be empty', 400);
    }

    if (body.feedback_text.length > 5000) {
      return apiError('INVALID_REQUEST', 'feedback_text must not exceed 5000 characters', 400);
    }

    // 验证 content_id（如果提供）
    if (body.content_id) {
      validateUUID(body.content_id, 'content_id');
    }

    // 验证 rating（如果提供）
    if (body.rating !== undefined && body.rating !== null) {
      if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
        return apiError('INVALID_REQUEST', 'rating must be an integer between 1 and 5', 400);
      }
    }

    const supabase = getSupabaseClient();

    // 验证 client_id 是否存在
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', body.client_id)
      .single();

    if (clientError || !client) {
      console.error('[Client API] Client not found:', body.client_id);
      return apiError('CLIENT_NOT_FOUND', 'Client not found', 404);
    }

    // 如果提供了 content_id，验证内容是否存在且属于该客户
    if (body.content_id) {
      let contentExists = false;

      if (body.content_type === 'profile') {
        const { data } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('id', body.content_id)
          .eq('client_id', body.client_id)
          .single();
        contentExists = !!data;
      } else if (body.content_type === 'topic') {
        const { data } = await supabase
          .from('topics')
          .select('id')
          .eq('id', body.content_id)
          .eq('client_id', body.client_id)
          .single();
        contentExists = !!data;
      } else if (body.content_type === 'script') {
        const { data } = await supabase
          .from('scripts')
          .select('id')
          .eq('id', body.content_id)
          .eq('client_id', body.client_id)
          .single();
        contentExists = !!data;
      }

      if (!contentExists) {
        return apiError('CONTENT_NOT_FOUND', 'Content not found or does not belong to this client', 404);
      }
    }

    // 插入反馈
    const { data, error } = await supabase
      .from('client_feedback')
      .insert({
        client_id: body.client_id,
        content_type: body.content_type,
        content_id: body.content_id || null,
        feedback_text: body.feedback_text.trim(),
        rating: body.rating || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[Client API] Failed to create feedback:', error);
      return apiError('DATABASE_ERROR', 'Failed to create feedback', 500, error);
    }

    const response: ClientFeedbackResponse = {
      id: data.id,
      client_id: data.client_id,
      content_type: data.content_type,
      content_id: data.content_id,
      feedback_text: data.feedback_text,
      rating: data.rating,
      status: data.status,
      created_at: data.created_at,
    };

    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Client API] POST /api/client/feedback error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
