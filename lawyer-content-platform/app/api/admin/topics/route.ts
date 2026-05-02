/**
 * Admin API - Topics Management
 * 提供选题的 CRUD 操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateRequired, validateEnum } from '@/lib/api/validation';
import type {
  TopicCreateRequest,
  TopicUpdateRequest,
  TopicResponse,
  TopicListResponse,
} from '@/types/admin';
import type { TopicStatus } from '@/types/database';

const TOPIC_STATUSES: readonly TopicStatus[] = ['draft', 'approved', 'rejected'];

/**
 * GET /api/admin/topics
 * 获取选题列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询
    let query = supabase.from('topics').select('*', { count: 'exact' });

    // 按 client_id 筛选
    if (clientId) {
      validateUUID(clientId, 'client_id');
      query = query.eq('client_id', clientId);
    }

    // 按 status 筛选
    if (status) {
      validateEnum(status, TOPIC_STATUSES, 'status');
      query = query.eq('status', status);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count topics:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count topics', 500, countError);
    }

    // 获取分页数据
    query = supabase.from('topics').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch topics:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch topics', 500, error);
    }

    const response: TopicListResponse = {
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
    console.error('[Admin API] GET /api/admin/topics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/topics
 * 创建新选题
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TopicCreateRequest;

    // 验证必填字段
    validateRequired(body.client_id, 'client_id');
    validateUUID(body.client_id, 'client_id');
    validateRequired(body.title, 'title');

    const supabase = getSupabaseAdmin();

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 如果提供了 status，验证其值
    if (body.status) {
      validateEnum(body.status, TOPIC_STATUSES, 'status');
    }

    // 插入数据
    const { data, error } = await supabase
      .from('topics')
      .insert({
        client_id: body.client_id,
        industry_id: body.industry_id || null,
        title: body.title,
        direction: body.direction || null,
        status: body.status || 'draft',
        visible_to_client: body.visible_to_client ?? true,
        internal_only: body.internal_only ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Failed to create topic:', error);
      return apiError('DATABASE_ERROR', 'Failed to create topic', 500, error);
    }

    const response: TopicResponse = data;
    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Admin API] POST /api/admin/topics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/topics/:id
 * 更新选题
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing topic id', 400);
    }

    validateUUID(id, 'id');

    const body = (await request.json()) as TopicUpdateRequest;

    // 如果提供了 client_id，验证其格式
    if (body.client_id) {
      validateUUID(body.client_id, 'client_id');
    }

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 如果提供了 status，验证其值
    if (body.status) {
      validateEnum(body.status, TOPIC_STATUSES, 'status');
    }

    const supabase = getSupabaseAdmin();

    // 构建更新对象
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.industry_id !== undefined) updateData.industry_id = body.industry_id;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.direction !== undefined) updateData.direction = body.direction;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.visible_to_client !== undefined) updateData.visible_to_client = body.visible_to_client;
    if (body.internal_only !== undefined) updateData.internal_only = body.internal_only;

    // 更新数据
    const { data, error } = await supabase
      .from('topics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Topic not found', 404);
      }
      console.error('[Admin API] Failed to update topic:', error);
      return apiError('DATABASE_ERROR', 'Failed to update topic', 500, error);
    }

    const response: TopicResponse = data;
    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/topics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/topics/:id
 * 删除选题
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing topic id', 400);
    }

    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase.from('topics').delete().eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete topic:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete topic', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/topics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
