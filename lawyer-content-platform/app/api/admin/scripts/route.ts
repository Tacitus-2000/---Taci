/**
 * Admin API - Scripts Management
 * 提供文案的 CRUD 操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateRequired, validateEnum } from '@/lib/api/validation';
import type {
  ScriptCreateRequest,
  ScriptUpdateRequest,
  ScriptResponse,
  ScriptListResponse,
} from '@/types/admin';
import type { ScriptStatus } from '@/types/database';

const SCRIPT_STATUSES: readonly ScriptStatus[] = ['draft', 'reviewed', 'approved', 'published'];

/**
 * GET /api/admin/scripts
 * 获取文案列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const clientId = searchParams.get('client_id');
    const topicId = searchParams.get('topic_id');
    const status = searchParams.get('status');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询
    let query = supabase.from('scripts').select('*', { count: 'exact' });

    // 按 client_id 筛选
    if (clientId) {
      validateUUID(clientId, 'client_id');
      query = query.eq('client_id', clientId);
    }

    // 按 topic_id 筛选
    if (topicId) {
      validateUUID(topicId, 'topic_id');
      query = query.eq('topic_id', topicId);
    }

    // 按 status 筛选
    if (status) {
      validateEnum(status, SCRIPT_STATUSES, 'status');
      query = query.eq('status', status);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count scripts:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count scripts', 500, countError);
    }

    // 获取分页数据
    query = supabase.from('scripts').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch scripts:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch scripts', 500, error);
    }

    const response: ScriptListResponse = {
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
    console.error('[Admin API] GET /api/admin/scripts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/scripts
 * 创建新文案
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScriptCreateRequest;

    // 验证必填字段
    validateRequired(body.client_id, 'client_id');
    validateUUID(body.client_id, 'client_id');
    validateRequired(body.title, 'title');
    validateRequired(body.body, 'body');

    const supabase = getSupabaseAdmin();

    // 如果提供了 topic_id，验证其格式
    if (body.topic_id) {
      validateUUID(body.topic_id, 'topic_id');
    }

    // 如果提供了 status，验证其值
    if (body.status) {
      validateEnum(body.status, SCRIPT_STATUSES, 'status');
    }

    // 插入数据
    const { data, error } = await supabase
      .from('scripts')
      .insert({
        client_id: body.client_id,
        topic_id: body.topic_id || null,
        title: body.title,
        body: body.body,
        usage_advice: body.usage_advice || null,
        status: body.status || 'draft',
        visible_to_client: body.visible_to_client ?? true,
        internal_only: body.internal_only ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Failed to create script:', error);
      return apiError('DATABASE_ERROR', 'Failed to create script', 500, error);
    }

    const response: ScriptResponse = data;
    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Admin API] POST /api/admin/scripts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/scripts/:id
 * 更新文案
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing script id', 400);
    }

    validateUUID(id, 'id');

    const body = (await request.json()) as ScriptUpdateRequest;

    // 如果提供了 client_id，验证其格式
    if (body.client_id) {
      validateUUID(body.client_id, 'client_id');
    }

    // 如果提供了 topic_id，验证其格式
    if (body.topic_id) {
      validateUUID(body.topic_id, 'topic_id');
    }

    // 如果提供了 status，验证其值
    if (body.status) {
      validateEnum(body.status, SCRIPT_STATUSES, 'status');
    }

    const supabase = getSupabaseAdmin();

    // 构建更新对象
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.topic_id !== undefined) updateData.topic_id = body.topic_id;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.usage_advice !== undefined) updateData.usage_advice = body.usage_advice;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.visible_to_client !== undefined) updateData.visible_to_client = body.visible_to_client;
    if (body.internal_only !== undefined) updateData.internal_only = body.internal_only;

    // 更新数据
    const { data, error } = await supabase
      .from('scripts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Script not found', 404);
      }
      console.error('[Admin API] Failed to update script:', error);
      return apiError('DATABASE_ERROR', 'Failed to update script', 500, error);
    }

    const response: ScriptResponse = data;
    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/scripts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/scripts/:id
 * 删除文案
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing script id', 400);
    }

    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase.from('scripts').delete().eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete script:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete script', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/scripts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
