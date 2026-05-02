/**
 * Admin API - Client Profiles Management
 * 提供客户档案的 CRUD 操作
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validatePagination, validateRequired } from '@/lib/api/validation';
import type {
  ClientProfileCreateRequest,
  ClientProfileUpdateRequest,
  ClientProfileResponse,
  ClientProfileListResponse,
} from '@/types/admin';

/**
 * GET /api/admin/client-profiles
 * 获取客户档案列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const clientId = searchParams.get('client_id');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    const supabase = getSupabaseAdmin();

    // 构建查询
    let query = supabase.from('client_profiles').select('*', { count: 'exact' });

    // 按 client_id 筛选
    if (clientId) {
      validateUUID(clientId, 'client_id');
      query = query.eq('client_id', clientId);
    }

    // 获取总数
    const { count, error: countError } = await query;

    if (countError) {
      console.error('[Admin API] Failed to count client profiles:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count client profiles', 500, countError);
    }

    // 获取分页数据
    query = supabase.from('client_profiles').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Admin API] Failed to fetch client profiles:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch client profiles', 500, error);
    }

    const response: ClientProfileListResponse = {
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
    console.error('[Admin API] GET /api/admin/client-profiles error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * POST /api/admin/client-profiles
 * 创建新客户档案
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClientProfileCreateRequest;

    // 验证必填字段
    validateRequired(body.client_id, 'client_id');
    validateUUID(body.client_id, 'client_id');
    validateRequired(body.client_name, 'client_name');

    const supabase = getSupabaseAdmin();

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    // 插入数据
    const { data, error } = await supabase
      .from('client_profiles')
      .insert({
        client_id: body.client_id,
        industry_id: body.industry_id || null,
        client_name: body.client_name,
        industry_name: body.industry_name || null,
        niche_direction: body.niche_direction || null,
        target_customer: body.target_customer || null,
        advantages: body.advantages || null,
        customer_pain_points: body.customer_pain_points || null,
        tone_style: body.tone_style || null,
        taboo_expressions: body.taboo_expressions || null,
        conversion_goal: body.conversion_goal || null,
        internal_notes: body.internal_notes || null,
        visible_to_client: body.visible_to_client ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Failed to create client profile:', error);
      return apiError('DATABASE_ERROR', 'Failed to create client profile', 500, error);
    }

    const response: ClientProfileResponse = data;
    return apiSuccess(response, 201);
  } catch (error) {
    console.error('[Admin API] POST /api/admin/client-profiles error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * PUT /api/admin/client-profiles/:id
 * 更新客户档案
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing client profile id', 400);
    }

    validateUUID(id, 'id');

    const body = (await request.json()) as ClientProfileUpdateRequest;

    // 如果提供了 client_id，验证其格式
    if (body.client_id) {
      validateUUID(body.client_id, 'client_id');
    }

    // 如果提供了 industry_id，验证其格式
    if (body.industry_id) {
      validateUUID(body.industry_id, 'industry_id');
    }

    const supabase = getSupabaseAdmin();

    // 构建更新对象
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.industry_id !== undefined) updateData.industry_id = body.industry_id;
    if (body.client_name !== undefined) updateData.client_name = body.client_name;
    if (body.industry_name !== undefined) updateData.industry_name = body.industry_name;
    if (body.niche_direction !== undefined) updateData.niche_direction = body.niche_direction;
    if (body.target_customer !== undefined) updateData.target_customer = body.target_customer;
    if (body.advantages !== undefined) updateData.advantages = body.advantages;
    if (body.customer_pain_points !== undefined) updateData.customer_pain_points = body.customer_pain_points;
    if (body.tone_style !== undefined) updateData.tone_style = body.tone_style;
    if (body.taboo_expressions !== undefined) updateData.taboo_expressions = body.taboo_expressions;
    if (body.conversion_goal !== undefined) updateData.conversion_goal = body.conversion_goal;
    if (body.internal_notes !== undefined) updateData.internal_notes = body.internal_notes;
    if (body.visible_to_client !== undefined) updateData.visible_to_client = body.visible_to_client;

    // 更新数据
    const { data, error } = await supabase
      .from('client_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError('RECORD_NOT_FOUND', 'Client profile not found', 404);
      }
      console.error('[Admin API] Failed to update client profile:', error);
      return apiError('DATABASE_ERROR', 'Failed to update client profile', 500, error);
    }

    const response: ClientProfileResponse = data;
    return apiSuccess(response);
  } catch (error) {
    console.error('[Admin API] PUT /api/admin/client-profiles error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

/**
 * DELETE /api/admin/client-profiles/:id
 * 删除客户档案
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('INVALID_REQUEST', 'Missing client profile id', 400);
    }

    validateUUID(id, 'id');

    const supabase = getSupabaseAdmin();

    // 删除数据
    const { error } = await supabase.from('client_profiles').delete().eq('id', id);

    if (error) {
      console.error('[Admin API] Failed to delete client profile:', error);
      return apiError('DATABASE_ERROR', 'Failed to delete client profile', 500, error);
    }

    return apiSuccess({ id, deleted: true });
  } catch (error) {
    console.error('[Admin API] DELETE /api/admin/client-profiles error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
