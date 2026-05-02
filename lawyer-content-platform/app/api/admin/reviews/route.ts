/**
 * Admin API - Reviews Management (只读)
 * 提供审查记录的查询操作
 *
 * 注意：reviews 数据来自 agent_run_steps 表，筛选 agent_name 包含 'review' 的记录
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateEnum } from '@/lib/api/validation';
import type { ReviewListResponse } from '@/types/admin';
import type { AgentRunStatus } from '@/types/database';

const AGENT_RUN_STATUSES: readonly AgentRunStatus[] = ['pending', 'running', 'completed', 'failed'];

/**
 * GET /api/admin/reviews
 * 获取审查记录列表（分页，只读）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const agentRunId = searchParams.get('agent_run_id');
    const agentName = searchParams.get('agent_name');
    const status = searchParams.get('status');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询 - 筛选 agent_name 包含 'review' 的记录
    let query = supabase
      .from('agent_run_steps')
      .select('*', { count: 'exact' })
      .ilike('agent_name', '%review%');

    // 按 agent_run_id 筛选
    if (agentRunId) {
      validateUUID(agentRunId, 'agent_run_id');
      query = query.eq('agent_run_id', agentRunId);
    }

    // 按 agent_name 筛选（精确匹配）
    if (agentName) {
      query = query.eq('agent_name', agentName);
    }

    // 按 status 筛选
    if (status) {
      validateEnum(status, AGENT_RUN_STATUSES, 'status');
      query = query.eq('status', status);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count reviews:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count reviews', 500, countError);
    }

    // 获取分页数据
    query = supabase
      .from('agent_run_steps')
      .select('*')
      .ilike('agent_name', '%review%');

    if (agentRunId) {
      query = query.eq('agent_run_id', agentRunId);
    }

    if (agentName) {
      query = query.eq('agent_name', agentName);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch reviews:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch reviews', 500, error);
    }

    const response: ReviewListResponse = {
      data: data || [],
      meta: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] GET /api/admin/reviews error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/reviews
 * 不支持创建操作（只读 API）
 */
export async function POST() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Reviews API is read-only. Reviews are created automatically by agent workflows.',
    405
  );
}

/**
 * PUT /api/admin/reviews/:id
 * 不支持更新操作（只读 API）
 */
export async function PUT() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Reviews API is read-only. Reviews cannot be modified.',
    405
  );
}

/**
 * DELETE /api/admin/reviews/:id
 * 不支持删除操作（只读 API）
 */
export async function DELETE() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Reviews API is read-only. Reviews cannot be deleted.',
    405
  );
}
