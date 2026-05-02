/**
 * Admin API - Clients Management
 * 提供客户的 CRUD 操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateRequired } from '@/lib/api/validation';
import type {
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientResponse,
  ClientListResponse,
} from '@/types/admin';

/**
 * GET /api/admin/clients
 * 获取客户列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 获取总数
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[Admin API] Failed to count clients:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count clients', 500, countError);
    }

    // 获取分页数据
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch clients:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch clients', 500, error);
    }

    const response: ClientListResponse = {
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
    console.error('[Admin API] GET /api/admin/clients error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/clients
 * 创建新客户
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClientCreateRequest;

    // 验证必填字段
    validateRequired(body.name, 'name');

    const supabase = getSupabaseAdmin();

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 插入数据
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: body.name,
        industry_id: body.industry_id || null,
        package_name: body.package_name || null,
        status: body.status || 'active',
        content_progress: 0,
        latest_copy: null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Failed to create client:', error);
      return apiError('DATABASE_ERROR', 'Failed to create client', 500, error);
    }

    const response: ClientResponse = data;
    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Admin API] POST /api/admin/clients error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/clients/:id
 * 更新客户信息
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing client id', 400);
    }

    validateUUID(id, 'id');

    const body = (await request.json()) as ClientUpdateRequest;

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    const supabase = getSupabaseAdmin();

    // 更新数据
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.industry_id !== undefined && { industry_id: body.industry_id }),
        ...(body.package_name !== undefined && { package_name: body.package_name }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.content_progress !== undefined && { content_progress: body.content_progress }),
        ...(body.latest_copy !== undefined && { latest_copy: body.latest_copy }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Client not found', 404);
      }
      console.error('[Admin API] Failed to update client:', error);
      return apiError('DATABASE_ERROR', 'Failed to update client', 500, error);
    }

    const response: ClientResponse = data;
    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/clients error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/clients/:id
 * 删除客户
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing client id', 400);
    }

    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete client:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete client', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/clients error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
