/**
 * Client API - Scripts
 * GET /api/client/scripts?client_id={uuid}
 *
 * 获取文案列表（只返回 approved 和 published 状态）
 */

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateUUID, validateRequired, validatePagination } from '@/lib/api/validation';
import { resolveClientId, isErrorResponse } from '@/lib/api/client-helper';
import type { ScriptPublic } from '@/types/client';

/**
 * GET /api/client/scripts
 * 获取文案列表
 *
 * Query Parameters:
 * - client_id: string (required) - 客户 ID
 * - page: number (optional) - 页码，默认 1
 * - limit: number (optional) - 每页数量，默认 20，最大 100
 *
 * 数据过滤规则:
 * - 只返回 visible_to_client = true 的文案
 * - 只返回 status IN ('approved', 'published') 的文案
 * - 排除 internal_only = true 的文案
 * - 只返回当前 client_id 的数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('client_id'); // 实际上是 user_id
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // 验证必填参数
    const validUserId = validateRequired(userId, 'client_id');
    validateUUID(validUserId, 'client_id');

    // 验证分页参数
    const { page: validPage, limit: validLimit, offset } = validatePagination(page, limit);

    // 解析并验证 client_id（包含授权检查）
    const result = await resolveClientId(request, validUserId);
    if (isErrorResponse(result)) {
      return result;
    }

    const { clientId } = result;
    const supabase = getSupabaseAdmin();

    // Step 2: 构建查询 - 获取总数
    const countQuery = supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .in('status', ['approved', 'published']);

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('[Client API] Failed to count scripts:', countError);
      return apiError('DATABASE_ERROR', 'Failed to count scripts', 500, countError);
    }

    // Step 3: 查询文案列表
    // 使用显式字段选择
    const { data, error } = await supabase
      .from('scripts')
      .select(`
        id,
        client_id,
        topic_id,
        title,
        body,
        usage_advice,
        status,
        created_at,
        updated_at
      `)
      .eq('client_id', clientId)
      .eq('visible_to_client', true)
      .eq('internal_only', false)
      .in('status', ['approved', 'published'])
      .order('created_at', { ascending: false })
      .range(offset, offset + validLimit - 1);

    if (error) {
      console.error('[Client API] Failed to fetch scripts:', error);
      return apiError('DATABASE_ERROR', 'Failed to fetch scripts', 500, error);
    }

    // 过滤数据
    const filteredScripts: ScriptPublic[] = data as ScriptPublic[];

    const response = {
      data: filteredScripts,
      meta: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    };

    return apiSuccess(response);
  } catch (error) {
    console.error('[Client API] GET /api/client/scripts error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
