/**
 * Admin API - Agent Runs Management (只读)
 * 提供 Agent 运行记录的查询操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateEnum } from '@/lib/api/validation';
import type { AgentRunListResponse, AgentRunResponse } from '@/types/admin';
import type { AgentRunStatus } from '@/types/database';

const AGENT_RUN_STATUSES: readonly AgentRunStatus[] = ['pending', 'running', 'completed', 'failed'];

/**
 * GET /api/admin/agent-runs
 * 获取 Agent 运行记录列表（分页，只读）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const clientId = searchParams.get('client_id');
    const industryId = searchParams.get('industry_id');
    const taskType = searchParams.get('task_type');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // 如果提供了 id，返回单个记录（包含 steps）
    if (id) {
      validateUUID(id, 'id');

      const supabase = getSupabaseAdmin();

      // 获取 agent_run
      const { data: agentRun, error: agentRunError } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (agentRunError) {
        if (agentRunError.code === 'PGRST116') {
          return apiError('RECORD_NOT_FOUND', 'Agent run not found', 404);
        }
        console.error('[Admin API] Failed to fetch agent run:', agentRunError);
        return apiError('DATABASE_ERROR', 'Failed to fetch agent run', 500, agentRunError);
      }

      // 获取关联的 steps
      const { data: steps, error: stepsError } = await supabase
        .from('agent_run_steps')
        .select('*')
        .eq('agent_run_id', id)
        .order('created_at', { ascending: true });

      if (stepsError) {
        console.error('[Admin API] Failed to fetch agent run steps:', stepsError);
        return apiError('DATABASE_ERROR', 'Failed to fetch agent run steps', 500, stepsError);
      }

      const response: AgentRunResponse = {
        ...agentRun,
        steps: steps || [],
      };

      return apiSuccess(response);
    }

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询
    let query = supabase.from('agent_runs').select('*', { count: 'exact' });

    // 按 client_id 筛选
    if (clientId) {
      validateUUID(clientId, 'client_id');
      query = query.eq('client_id', clientId);
    }

    // 按 industry_id 筛选
    if (industryId) {
      validateUUID(industryId, 'industry_id');
      query = query.eq('industry_id', industryId);
    }

    // 按 task_type 筛选
    if (taskType) {
      query = query.eq('task_type', taskType);
    }

    // 按 status 筛选
    if (status) {
      validateEnum(status, AGENT_RUN_STATUSES, 'status');
      query = query.eq('status', status);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count agent runs:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count agent runs', 500, countError);
    }

    // 获取分页数据
    query = supabase.from('agent_runs').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (industryId) {
      query = query.eq('industry_id', industryId);
    }

    if (taskType) {
      query = query.eq('task_type', taskType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch agent runs:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch agent runs', 500, error);
    }

    const response: AgentRunListResponse = {
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
    console.error('[Admin API] GET /api/admin/agent-runs error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/agent-runs
 * 不支持创建操作（只读 API）
 */
export async function POST() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Agent Runs API is read-only. Agent runs are created automatically by workflows.',
    405
  );
}

/**
 * PUT /api/admin/agent-runs/:id
 * 不支持更新操作（只读 API）
 */
export async function PUT() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Agent Runs API is read-only. Agent runs cannot be modified.',
    405
  );
}

/**
 * DELETE /api/admin/agent-runs/:id
 * 不支持删除操作（只读 API）
 */
export async function DELETE() {
  return apiError(
    'METHOD_NOT_ALLOWED',
    'Agent Runs API is read-only. Agent runs cannot be deleted.',
    405
  );
}
